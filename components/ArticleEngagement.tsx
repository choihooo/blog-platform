"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { requestJson } from "@/lib/engagement/request.mjs";
import { loadProfileNickname, changeProfileNickname } from "@/lib/engagement/profile.mjs";
import { AnimalAvatar } from "@/components/AnimalAvatar";
import { startLike, restoreLike, startComment, confirmComment, removePendingComment, type ArticleComment as Comment, type EngagementState as State } from "@/lib/engagement/optimistic";
import styles from "./ArticleEngagement.module.css";
import { trackEvent } from "@/lib/analytics";

const EMPTY: State = { comments: [], commentCount: 0, likeCount: 0, liked: false, nextCursor: null };

async function request<T>(url: string, body?: object, signal?: AbortSignal): Promise<T> {
  return requestJson(url, body, signal);
}

function Heart({ filled }: { filled: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>;
}
function message(error: unknown) {
  return error instanceof Error && error.name !== "TimeoutError" ? error.message : "연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.";
}

function Engagement({ slug }: { slug: string }) {
  const ids = useId();
  const endpoint = `/api/engagement/${encodeURIComponent(slug)}`;
  const [state, setState] = useState<State>(EMPTY);
  const [nickname, setNickname] = useState("다정한너구리");
  const [profileReady, setProfileReady] = useState(false);
  const [body, setBody] = useState("");
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [likeError, setLikeError] = useState("");
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [liking, setLiking] = useState(false);
  const [paging, setPaging] = useState(false);
  const [reload, setReload] = useState(0);
  const draft = useRef<{ body: string; nickname: string; id: string } | null>(null);
  const sendLock = useRef(false);
  const likeLock = useRef(false);
  const count = Array.from(body.trim()).length;

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      await Promise.resolve();
      if (controller.signal.aborted) return;
      setNickname(loadProfileNickname());
      setProfileReady(true);
      try {
        const data = await request<State>(endpoint, undefined, controller.signal);
        if (controller.signal.aborted) return;
        setState(data);
        setReady(true);
        setLoadError("");

      } catch (error) {
        if (!controller.signal.aborted) setLoadError(message(error));
      }
    }
    void load();
    return () => controller.abort();
  }, [endpoint, reload]);

  function changeNickname() {
    setNickname(changeProfileNickname(undefined, nickname));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || sendLock.current || count < 1 || count > 1000) return;
    sendLock.current = true;
    setSending(true);
    setFormError("");
    setNotice("");
    const originalBody = body;
    const text = originalBody.trim();
    if (draft.current?.body !== text || draft.current.nickname !== nickname) draft.current = { body: text, nickname, id: crypto.randomUUID() };
    const submitted = { ...draft.current, createdAt: Date.now() };
    setState(current => startComment(current, submitted));
    setBody("");

    try {
      const data = await request<{ comment: Comment }>(endpoint, { action: "comment", ...draft.current });
      setState(current => confirmComment(current, data.comment));
      draft.current = null;
      setNotice("댓글을 남겼어요.");
      trackEvent("comment_submit", { article_slug: slug }, `/blog/${slug}`);
    } catch (error) {
      setState(current => removePendingComment(current, submitted.id));
      setBody(originalBody);
      setNotice("");
      setFormError(message(error));
    }
    finally { sendLock.current = false; setSending(false); }
  }

  async function toggleLike() {
    if (!ready || likeLock.current) return;
    likeLock.current = true;
    setLiking(true);
    setLikeError("");
    const before = { liked: state.liked, likeCount: state.likeCount };
    const liked = !before.liked;
    setState(current => startLike(current, liked));
    try {
      const data = await request<{ liked: boolean; likeCount: number }>(endpoint, { action: "like", liked });
      setState(current => ({ ...current, ...data }));
      trackEvent("article_like", { article_slug: slug, like_action: data.liked ? "like" : "unlike" }, `/blog/${slug}`);
    } catch (error) {
      setState(current => restoreLike(current, before));
      setLikeError(message(error));
    }
    finally { likeLock.current = false; setLiking(false); }
  }

  async function loadMore() {
    if (!state.nextCursor || paging) return;
    setPaging(true);
    setPageError("");
    try {
      const data = await request<State>(`${endpoint}?cursor=${encodeURIComponent(state.nextCursor)}`);
      setState(current => ({ ...current,
        comments: [...current.comments, ...data.comments.filter(c => !current.comments.some(old => old.id === c.id))],
        nextCursor: data.nextCursor,
      }));
    } catch (error) { setPageError(message(error)); }
    finally { setPaging(false); }
  }

  return (
    <section className={styles.root} aria-labelledby={`${ids}-heading`}>
      <div className={styles.reaction}>
        <button type="button" className={styles.like} aria-pressed={state.liked} aria-label={state.liked ? "좋아요 취소" : "글에 좋아요 남기기"} disabled={!ready || liking} aria-busy={liking || undefined} onClick={toggleLike}>
          <Heart filled={state.liked} /><span>좋아요</span><span className={styles.likeCount}>{ready ? state.likeCount : "…"}</span>
        </button>
        <p className={styles.hint}>글이 도움이 되었다면 마음을 남겨 주세요.</p>
        {likeError && <p role="alert" className={styles.error}>{likeError}</p>}
      </div>

      <h2 id={`${ids}-heading`} className={styles.heading}>댓글 <span>{ready ? state.commentCount : "…"}</span></h2>
      {loadError ? <div className={styles.loadError} role="alert"><p>{loadError}</p><button type="button" className={styles.secondary} onClick={() => setReload(value => value + 1)}>다시 불러오기</button></div> : !ready && <p className={styles.hint} role="status">댓글을 불러오고 있어요.</p>}
      <form onSubmit={submit} className={styles.form} aria-busy={sending}>
        <div className={styles.identity}>
          <AnimalAvatar nickname={nickname} />
          <div className={styles.nameField}>
            <label htmlFor={`${ids}-name`} className="sr-only">댓글 닉네임</label>
            <input id={`${ids}-name`} value={nickname} readOnly tabIndex={-1} />
            <button type="button" onClick={changeNickname} disabled={sending || !profileReady} className={styles.randomize}>랜덤 변경</button>
          </div>
        </div>
        <label htmlFor={`${ids}-comment`} className="sr-only">댓글 내용</label>
        <textarea id={`${ids}-comment`} value={body} onChange={event => { setBody(event.target.value); setNotice(""); }} disabled={sending} maxLength={2000} rows={4} placeholder="글을 읽고 떠오른 생각을 남겨 주세요." aria-describedby={`${ids}-policy ${ids}-count${formError ? ` ${ids}-error` : ""}`} aria-invalid={count > 1000 || Boolean(formError)} />
        <p id={`${ids}-policy`} className={styles.policy}>작성한 댓글은 수정하거나 삭제할 수 없어요. 개인정보는 남기지 말아 주세요. 욕설·사칭·광고성 댓글은 별도 안내 없이 삭제될 수 있어요.</p>
        <div className={styles.submitRow}>
          <span id={`${ids}-count`} className={count > 1000 ? styles.error : styles.counter}>{count.toLocaleString()} / 1,000</span>
          <button type="submit" className={styles.submit} disabled={!ready || sending || count < 1 || count > 1000}>댓글 남기기</button>
        </div>
        {formError && <p id={`${ids}-error`} className={styles.error} role="alert">{formError}</p>}
        <p className={styles.notice} role="status">{notice}</p>
      </form>

      {ready && <div className={styles.comments}>
        {state.comments.length === 0 ? <p className={styles.empty}>아직 댓글이 없어요. 첫 이야기를 남겨 주세요.</p> : <ul className={styles.list}>
          {state.comments.map(comment => <li key={comment.id} className={styles.comment} aria-busy={comment.pending || undefined}>
            <AnimalAvatar nickname={comment.nickname} />
            <div className={styles.commentContent}>
              <div className={styles.commentMeta}><span>{comment.nickname}</span><time dateTime={comment.pending ? undefined : new Date(comment.createdAt).toISOString()}>{new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(comment.createdAt)}</time></div>
              <p>{comment.body}</p>
            </div>
          </li>)}
        </ul>}
        {state.nextCursor && <button type="button" onClick={loadMore} disabled={paging} className={styles.more}>{paging ? "불러오는 중…" : "이전 댓글 더 보기"}</button>}
        {pageError && <p role="alert" className={styles.error}>{pageError}</p>}
      </div>}
    </section>
  );
}

export function ArticleEngagement() {
  const pathname = usePathname();
  const match = /^\/blog\/([^/]+)\/?$/.exec(pathname);
  return match ? <Engagement key={match[1]} slug={match[1]} /> : null;
}

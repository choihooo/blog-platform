"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpRight, Mail } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { MainHeader } from "@/features/navigation/main-header";
import {
  aboutChapters,
  aboutMedia,
  getAboutChapter,
  getAboutPresentation,
  type AboutContact,
} from "./about-data";
import { createVideoScrubber, getScrollProgress } from "./scroll-video";
import styles from "./about-story.module.css";

export function AboutStory({ contact }: { contact: AboutContact }) {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const progressLine = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"static" | "scroll">("static");
  const [chapter, setChapter] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () =>
      setMode(getAboutPresentation(preference.matches, window.innerHeight, failed));
    apply();
    preference.addEventListener("change", apply);
    window.addEventListener("resize", apply);
    return () => {
      preference.removeEventListener("change", apply);
      window.removeEventListener("resize", apply);
    };
  }, [failed]);

  useEffect(() => {
    if (mode !== "scroll" || !track.current || !video.current) return;
    const element = track.current;
    const scrubber = createVideoScrubber(video.current, {
      requestFrame: (callback) => window.requestAnimationFrame(callback),
      cancelFrame: (id) => window.cancelAnimationFrame(id),
    });
    let frame: number | null = null;
    let activeChapter = -1;
    const measure = () => {
      frame = null;
      const rect = element.getBoundingClientRect();
      const progress = getScrollProgress(rect.top, rect.height, window.innerHeight);
      scrubber.update(progress);
      if (progressLine.current) progressLine.current.style.transform = `scaleX(${progress})`;
      const nextChapter = getAboutChapter(progress);
      if (nextChapter !== activeChapter) {
        activeChapter = nextChapter;
        setChapter(nextChapter);
      }
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);
    schedule();
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      scrubber.dispose();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "scroll" || ready) return;
    const timeout = window.setTimeout(() => setFailed(true), 12_000);
    return () => window.clearTimeout(timeout);
  }, [mode, ready]);

  function goTo(event: MouseEvent<HTMLAnchorElement>, progress: number) {
    if (mode !== "scroll" || !track.current) return;
    event.preventDefault();
    const rect = track.current.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.top + progress * (rect.height - window.innerHeight),
      behavior: "smooth",
    });
  }

  return (
    <main className={styles.root} data-mode={mode} aria-label="호조리카의 이야기">
      <div className={styles.track} ref={track}>
        <div className={styles.stage}>
          <MainHeader active="about" className={styles.header} />
          <div className={styles.media} aria-hidden="true">
            <Image
              alt=""
              className={styles.poster}
              fill
              priority
              sizes="100vw"
              src={aboutMedia.poster}
            />
            <video
              className={styles.video}
              data-ready={ready}
              disablePictureInPicture
              muted
              onError={() => setFailed(true)}
              onLoadedData={() => setReady(true)}
              playsInline
              poster={aboutMedia.poster}
              preload={mode === "scroll" ? "auto" : "none"}
              ref={video}
              src={mode === "scroll" ? aboutMedia.video : undefined}
              tabIndex={-1}
            />
          </div>
          {failed ? (
            <p className={styles.notice} role="status">
              영상을 불러오지 못했어요. 아래에서 소개를 읽어주세요.
            </p>
          ) : null}
          <div className={styles.copy}>
            {aboutChapters.map((item, index) => {
              const inactive = mode === "scroll" && chapter !== index;
              const Heading = index === 0 ? "h1" : "h2";
              return (
                <section
                  aria-hidden={inactive || undefined}
                  className={styles.chapter}
                  data-active={!inactive}
                  id={`about-${item.id}`}
                  inert={inactive || undefined}
                  key={item.id}
                >
                  <Heading>{item.title}</Heading>
                  <p>{item.description}</p>
                  {"action" in item && item.action === "portfolio" ? (
                    <Link className={styles.action} href="/projects">
                      만든 것들 보러 가기 <ArrowUpRight aria-hidden="true" size={18} />
                    </Link>
                  ) : null}
                  {"action" in item && item.action === "contact" ? (
                    <div className={styles.contact}>
                      <a className={styles.action} href={`mailto:${contact.email}`}>
                        <Mail aria-hidden="true" size={18} /> 이메일 보내기
                      </a>
                      <a className={styles.action} href={contact.githubUrl}>
                        <ArrowUpRight aria-hidden="true" size={18} /> GitHub
                      </a>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
          <div className={styles.controls}>
            <p className={styles.hint}>
              <ArrowDown aria-hidden="true" size={16} />
              {chapter === 0
                ? "스크롤하며 제 이야기를 만나보세요"
                : (aboutChapters[chapter] ?? aboutChapters[0]).label}
            </p>
            <nav className={styles.chapters} aria-label="소개 장면 바로가기">
              {aboutChapters.map((item, index) => (
                <a
                  aria-current={chapter === index ? "step" : undefined}
                  aria-label={item.label}
                  href={`#about-${item.id}`}
                  key={item.id}
                  onClick={(event) => goTo(event, Math.min(1, item.start + 0.025))}
                >
                  <span />
                </a>
              ))}
            </nav>
            {mode === "scroll" && !ready ? (
              <span className={styles.loading} role="status">
                영상을 준비하고 있어요
              </span>
            ) : null}
          </div>
          <div className={styles.progress} aria-hidden="true">
            <div ref={progressLine} />
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        <p>조금 더 궁금하다면</p>
        <nav aria-label="더 알아보기">
          <Link href="/projects">
            포트폴리오 <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
          <Link href="/blog">
            블로그 <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
          <Link href="/resume">
            이력서 <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </nav>
        <a href="#about-intro" onClick={(event) => goTo(event, 0)}>
          처음으로 <ArrowUp aria-hidden="true" size={16} />
        </a>
      </footer>
    </main>
  );
}

"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { MainHeader } from "../navigation/main-header";
import { storyScenes } from "./story-data";
import { reduceStory, type SceneIndex } from "./story-controller";
import { useStoryNavigation } from "./use-story-navigation";
import "./scroll-story.css";
import { useStoryPlayback } from "./use-story-playback";
import { useMediaQuery } from "@/shared/browser/use-media-query";

export function ScrollStory() {
  const root = useRef<HTMLElement>(null);
  const { matches: reducedMotion, ready: motionKnown } = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
    true,
  );
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [videoReady, setVideoReady] = useState([false, false, false]);
  const [story, dispatch] = useReducer(reduceStory, { displayed: 0, target: 0, transition: null });
  const { displayed, transition } = story;
  const requestId = useRef(0);
  const [format, setFormat] = useState("wide");
  const [playingTransitionId, setPlayingTransitionId] = useState<number | null>(null);
  const transitionReady = transition !== null && playingTransitionId === transition.id;
  const transitionVideo = useRef<HTMLVideoElement>(null);
  const {
    target: current,
    immediate,
    ready: navigationReady,
    goTo,
  } = useStoryNavigation(root, reducedMotion, displayed);
  const currentScene = storyScenes[displayed] ?? storyScenes[0];

  useEffect(() => {
    if (!navigationReady) return;
    dispatch({
      type: "select",
      to: current,
      id: ++requestId.current,
      immediate: reducedMotion || immediate,
    });
  }, [current, reducedMotion, immediate, navigationReady]);

  function finishTransition(id: number) {
    dispatch({ type: "complete", id });
  }

  useEffect(() => {
    if (!transition) return;
    const id = transition.id;
    const timeout = window.setTimeout(() => dispatch({ type: "complete", id }), 4000);
    return () => window.clearTimeout(timeout);
  }, [transition]);

  useStoryPlayback({ videos, transitionVideo, displayed, transition, reducedMotion, videoReady });

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const portrait = window.matchMedia("(max-aspect-ratio: 1/1)");
    const short = window.matchMedia("(max-height: 500px) and (min-aspect-ratio: 1/1)");
    const updateFormat = () => {
      setFormat(portrait.matches ? "tall" : short.matches ? "short" : "wide");
      setVideoReady([false, false, false]);
    };
    updateFormat();
    portrait.addEventListener("change", updateFormat);
    short.addEventListener("change", updateFormat);
    return () => {
      portrait.removeEventListener("change", updateFormat);
      short.removeEventListener("change", updateFormat);
    };
  }, []);

  return (
    <main className="scroll-story" ref={root} tabIndex={0} aria-label="호조리카 소개">
      <noscript>
        <nav className="story-static-links" aria-label="바로가기">
          <a href="/about">About 바로가기</a>
          <a href="/blog">블로그 바로가기</a>
          <a href="/projects">포트폴리오 바로가기</a>
        </nav>
      </noscript>
      <div className="story-track">
        <div
          className="story-stage"
          data-scene={currentScene.id}
          data-transitioning={(transition !== null && transitionReady) || undefined}
        >
          {storyScenes.map((scene, index) => {
            const showVideo = videoReady[index] && !reducedMotion && motionKnown;
            const plate = `/brand/scroll-story/plates-ultrawide-v2/${scene.plate}-${format}`;
            const Heading = index === 0 ? "h1" : "h2";
            return (
              <section
                key={scene.id}
                className={`story-scene story-scene--${scene.id}`}
                aria-labelledby={`story-title-${scene.id}`}
                aria-hidden={displayed !== index}
                inert={displayed !== index || !!transition}
                data-active={displayed === index || undefined}
                style={{ visibility: displayed === index ? "visible" : "hidden" }}
              >
                <div className="story-copy">
                  <Heading
                    className="story-title"
                    id={`story-title-${scene.id}`}
                    aria-label={scene.title}
                  >
                    {Array.from(scene.title).map((letter, i) =>
                      letter === "\n" ? (
                        <br key={i} aria-hidden="true" />
                      ) : (
                        <span
                          key={i}
                          aria-hidden="true"
                          style={{ animationDelay: `${Math.min(i * 22, 300)}ms` }}
                        >
                          {letter}
                        </span>
                      ),
                    )}
                  </Heading>
                  {scene.intro && <p className="story-intro">{scene.intro}</p>}
                  {scene.note && <p className="story-note">{scene.note}</p>}
                  <Link className="story-action" href={scene.href} prefetch={false}>
                    {scene.action}
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </Link>
                </div>
                <div
                  className="story-character"
                  role="img"
                  aria-label={scene.alt}
                  style={{ backgroundImage: `url(${plate}.jpg)` }}
                >
                  <video
                    key={`${plate}-${motionKnown && !reducedMotion && index === displayed}`}
                    ref={(element) => {
                      videos.current[index] = element;
                    }}
                    className="story-loop"
                    aria-hidden="true"
                    style={{ opacity: showVideo ? 1 : 0 }}
                    muted
                    loop
                    playsInline
                    preload={motionKnown && !reducedMotion && index === displayed ? "auto" : "none"}
                    tabIndex={-1}
                    onLoadedData={() =>
                      setVideoReady((ready) =>
                        ready.map((value, i) => (i === index ? true : value)),
                      )
                    }
                    onError={() =>
                      setVideoReady((ready) =>
                        ready.map((value, i) => (i === index ? false : value)),
                      )
                    }
                  >
                    {motionKnown && !reducedMotion && index === displayed && (
                      <source src={`${plate}.mp4`} type="video/mp4" />
                    )}
                  </video>
                </div>
              </section>
            );
          })}
          {transition && (
            <video
              key={`${transition.id}-${format}`}
              ref={transitionVideo}
              className="story-transition"
              style={{ opacity: transitionReady ? 1 : 0 }}
              src={`/brand/scroll-story/plates-ultrawide-v2/${transition.from}-${transition.to}-${format}.mp4`}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={(event) => {
                if (!document.hidden)
                  void event.currentTarget.play().catch(() => finishTransition(transition.id));
              }}
              onPlaying={() => setPlayingTransitionId(transition.id)}
              onEnded={() => finishTransition(transition.id)}
              onError={() => finishTransition(transition.id)}
            />
          )}
          <MainHeader
            className="story-header"
            active={currentScene.id}
            onHome={() => goTo(0)}
            onNavigate={(section) =>
              goTo((section === "about" ? 0 : section === "blog" ? 1 : 2) as SceneIndex)
            }
          />
          <footer className="story-footer">
            <button
              className="story-next"
              type="button"
              onClick={() => goTo((current === 2 ? 0 : current + 1) as SceneIndex)}
            >
              {current === 2 ? "처음으로" : "스크롤해서 다음 이야기"}
              <ArrowDown size={18} aria-hidden="true" />
            </button>
          </footer>
          <div className="story-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${(current + 1) / 3})` }} />
          </div>
        </div>
        {storyScenes.map((scene, index) => (
          <div
            key={scene.id}
            className="story-snap"
            style={{ top: `${index * 100}dvh` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </main>
  );
}

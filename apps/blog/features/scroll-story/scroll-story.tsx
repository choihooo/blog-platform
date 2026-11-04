"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { storyScenes } from "./story-data";
import "./scroll-story.css";

export function ScrollStory() {
  const root = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [videoReady, setVideoReady] = useState([false, false, false]);
  const [displayed, setDisplayed] = useState(0);
  const [format, setFormat] = useState("wide");
  const [transition, setTransition] = useState<{ from: number; to: number } | null>(null);
  const [transitionReady, setTransitionReady] = useState(false);
  const transitionVideo = useRef<HTMLVideoElement>(null);
  const current = Math.min(2, Math.round(progress));
  const currentScene = storyScenes[displayed] ?? storyScenes[0];

  useEffect(() => {
    if (reducedMotion) {
      setDisplayed(current);
      setTransition(null);
      setTransitionReady(false);
      return;
    }
    if (current === displayed) {
      setTransition(null);
      setTransitionReady(false);
    } else if (transition?.to !== current) {
      setTransitionReady(false);
      setTransition({ from: displayed, to: current });
    }
  }, [current, displayed, reducedMotion, transition?.to]);

  function finishTransition() {
    if (transition) setDisplayed(transition.to);
    setTransition(null);
    setTransitionReady(false);
  }

  useEffect(() => {
    function updatePlayback() {
      videos.current.forEach((video, index) => {
        if (!video) return;
        if (index === displayed && !transition && !reducedMotion && !document.hidden) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
      const clip = transitionVideo.current;
      if (clip) {
        if (document.hidden) clip.pause();
        else if (!reducedMotion) void clip.play().catch(() => {});
      }
    }
    updatePlayback();
    document.addEventListener("visibilitychange", updatePlayback);
    return () => document.removeEventListener("visibilitychange", updatePlayback);
  }, [displayed, transition, reducedMotion, videoReady]);

  useEffect(() => {
    const container = root.current;
    if (!container) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const portrait = window.matchMedia("(max-aspect-ratio: 1/1)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateFormat = () => {
      setFormat(portrait.matches ? "tall" : "wide");
      setVideoReady([false, false, false]);
    };
    const updateProgress = () => {
      setProgress(Math.min(2, Math.max(0, container.scrollTop / container.clientHeight)));
    };
    let lastWheel = 0;
    let wheelLockedUntil = 0;
    const advanceOneScene = (event: WheelEvent) => {
      if (!event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      const gap = now - lastWheel;
      lastWheel = now;
      // Trackpad momentum belongs to the same gesture, not the next scene.
      if (now < wheelLockedUntil || gap < 160) return;
      const from = Math.round(container.scrollTop / container.clientHeight);
      const to = Math.min(2, Math.max(0, from + Math.sign(event.deltaY)));
      if (from === to) return;
      wheelLockedUntil = now + 1300;
      container.scrollTo({
        top: to * container.clientHeight,
        behavior: media.matches ? "instant" : "smooth",
      });
    };
    updateMotion();
    updateFormat();
    updateProgress();
    container.addEventListener("scroll", updateProgress, { passive: true });
    container.addEventListener("wheel", advanceOneScene, { passive: false });
    const observer = new ResizeObserver(updateProgress);
    observer.observe(container);
    media.addEventListener("change", updateMotion);
    portrait.addEventListener("change", updateFormat);
    return () => {
      container.removeEventListener("scroll", updateProgress);
      container.removeEventListener("wheel", advanceOneScene);
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      portrait.removeEventListener("change", updateFormat);
    };
  }, []);

  function goTo(index: number) {
    const container = root.current;
    if (!container) return;
    container.scrollTo({
      top: index * container.clientHeight,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }

  return (
    <main className="scroll-story" ref={root} tabIndex={0} aria-label="호조리카 스크롤 시안">
      <div className="story-track">
        <div
          className="story-stage"
          data-scene={currentScene.id}
          data-transitioning={(transition !== null && transitionReady) || undefined}
        >
          {storyScenes.map((scene, index) => {
            const showVideo = videoReady[index] && !reducedMotion;
            const plate = `/brand/scroll-story/plates-centered/${scene.plate}-${format}`;
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
                  <h1 id={`story-title-${scene.id}`} aria-label={scene.title}>
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
                  </h1>
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
                    key={plate}
                    ref={(element) => {
                      videos.current[index] = element;
                    }}
                    className="story-loop"
                    aria-hidden="true"
                    style={{ opacity: showVideo ? 1 : 0 }}
                    muted
                    loop
                    playsInline
                    preload={index === displayed ? "auto" : "metadata"}
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
                    <source src={`${plate}.mp4`} type="video/mp4" />
                  </video>
                </div>
              </section>
            );
          })}
          {transition && (
            <video
              key={`${transition.from}-${transition.to}-${format}`}
              ref={transitionVideo}
              className="story-transition"
              style={{ opacity: transitionReady ? 1 : 0 }}
              src={`/brand/scroll-story/plates-centered/${transition.from}-${transition.to}-${format}.mp4`}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onLoadedData={(event) => {
                if (!document.hidden) void event.currentTarget.play().catch(finishTransition);
              }}
              onPlaying={() => setTransitionReady(true)}
              onEnded={finishTransition}
              onError={finishTransition}
            />
          )}
          <header className="story-header">
            <Link className="story-brand" href="/">
              HOZORICA
            </Link>
            <nav aria-label="장면 이동">
              {storyScenes.map((scene, index) => (
                <button
                  key={scene.id}
                  type="button"
                  aria-current={current === index ? "step" : undefined}
                  onClick={() => goTo(index)}
                >
                  {scene.label}
                </button>
              ))}
            </nav>
          </header>
          <footer className="story-footer">
            <button
              className="story-next"
              type="button"
              onClick={() => goTo(current === 2 ? 0 : current + 1)}
            >
              {current === 2 ? "처음으로" : "스크롤해서 다음 이야기"}
              <ArrowDown size={18} aria-hidden="true" />
            </button>
          </footer>
          <div className="story-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${(progress + 1) / 3})` }} />
          </div>
        </div>
        {storyScenes.map((scene, index) => (
          <div
            key={scene.id}
            className="story-snap"
            style={{ top: `${index * 100}svh` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </main>
  );
}

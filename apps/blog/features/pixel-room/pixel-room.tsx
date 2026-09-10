"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./pixel-room.css";
import { PortfolioChat } from "./portfolio-chat";

type RoomTime = "day" | "night" | "dawn";
type TimeMode = "auto" | RoomTime;
const timeOptions: { id: TimeMode; label: string }[] = [
  { id: "auto", label: "자동" },
  { id: "day", label: "낮" },
  { id: "night", label: "밤" },
  { id: "dawn", label: "새벽" },
];

function currentRoomTime(): RoomTime {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 20) return "day";
  return "night";
}

const characterScenes = [
  { id: "reading", src: "/pixel/actor-reading.png", x: 444, y: 291, width: 184, height: 409 },
  { id: "stretch", src: "/pixel/actor-stretch.png", x: 553, y: 267, width: 131, height: 506 },
  { id: "seated", src: "/pixel/actor-seated.png", x: 638, y: 358, width: 244, height: 399 },
] as const;

export function PixelRoom() {
  const [characterScene, setCharacterScene] = useState(2);
  const [layersReady, setLayersReady] = useState(false);
  const [timeMode, setTimeMode] = useState<TimeMode>("auto");
  const [autoTime, setAutoTime] = useState<RoomTime>("day");
  const roomTime = timeMode === "auto" ? autoTime : timeMode;

  useEffect(() => {
    const syncTime = () => setAutoTime(currentRoomTime());
    syncTime();
    const timer = window.setInterval(syncTime, 60_000);
    document.addEventListener("visibilitychange", syncTime);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", syncTime);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const sources = [
      "/pixel/room-base-fixed.png",
      "/pixel/chair-empty.png",
      ...characterScenes.map((scene) => scene.src),
    ];
    Promise.all(
      sources.map(async (src) => {
        const image = new window.Image();
        image.src = src;
        await image.decode();
      }),
    )
      .then(() => {
        if (!cancelled) setLayersReady(true);
      })
      .catch(() => {
        // Keep the original seated scene visible if a layer cannot load.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!layersReady) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sceneTimer = window.setInterval(() => {
      if (document.hidden || motion.matches) return;
      setCharacterScene((current) => (current + 1) % characterScenes.length);
    }, 8000);
    return () => window.clearInterval(sceneTimer);
  }, [layersReady]);

  return (
    <main className="pixel-room-page" data-room-time={roomTime}>
      <h1 className="sr-only">최호 — 프론트엔드 개발자 포트폴리오</h1>
      <div className="room-shell">
        <div className="room-stage-wrap">
          <section className="room-stage" aria-label="픽셀 작업실">
            <img
              className="scene-image"
              src="/pixel/room-base-fixed.png"
              alt="픽셀 작업실에서 작업하는 캐릭터"
              draggable={false}
            />
            {/* All layers stay mounted and decoded; visibility switches atomically. */}
            <img
              className="room-sprite"
              src="/pixel/chair-empty.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              style={{
                left: `${(638 / 1672) * 100}%`,
                top: `${(472 / 941) * 100}%`,
                width: `${(207 / 1672) * 100}%`,
                height: `${(300 / 941) * 100}%`,
                visibility: layersReady && characterScene !== 2 ? "visible" : "hidden",
              }}
            />
            {characterScenes.map((scene, index) => (
              <img
                key={scene.id}
                className="room-sprite"
                src={scene.src}
                alt=""
                aria-hidden="true"
                draggable={false}
                style={{
                  left: `${(scene.x / 1672) * 100}%`,
                  top: `${(scene.y / 941) * 100}%`,
                  width: `${(scene.width / 1672) * 100}%`,
                  height: `${(scene.height / 941) * 100}%`,
                  visibility: layersReady && characterScene === index ? "visible" : "hidden",
                }}
              />
            ))}
            {!layersReady && (
              <img
                className="scene-image room-fallback"
                src="/pixel/room-day-v2.png"
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            )}
            <div className="room-lamp-glow" aria-hidden="true" />
            <Link
              className="hotspot hotspot--work"
              href="/projects"
              prefetch={false}
              aria-label="Work 열기"
            >
              <span>Work</span>
            </Link>
            <Link
              className="hotspot hotspot--blog"
              data-hotspot="blog"
              href="/blog"
              prefetch={false}
              aria-label="Blog 열기"
            >
              <span>Blog</span>
            </Link>
            <Link
              className="hotspot hotspot--about"
              href="/resume"
              prefetch={false}
              aria-label="About 열기"
            >
              <span>About</span>
            </Link>
          </section>
        </div>
      </div>
      <div className="room-light room-light--night" aria-hidden="true" />
      <div className="room-light room-light--dawn" aria-hidden="true" />
      <div className="room-time-controls" role="group" aria-label="작업실 시간대 선택">
        {timeOptions.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={timeMode === id}
            title={id === "auto" ? "기기 현지 시간에 맞춰 자동 전환" : `${label} 조명으로 변경`}
            onClick={() => setTimeMode(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <PortfolioChat />
    </main>
  );
}

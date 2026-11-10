"use client";

import { useCallback, useEffect, useRef } from "react";

type AutoplayVideoProps = {
  ariaLabel: string;
  className?: string;
  height: number;
  mp4Src: string;
  poster: string;
  webmSrc?: string;
  width: number;
};

export function AutoplayVideo({
  ariaLabel,
  className,
  height,
  mp4Src,
  poster,
  webmSrc,
  width,
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    void video.play().catch(() => undefined);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
      },
      { threshold: 0.2 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [play]);

  return (
    <video
      aria-label={ariaLabel}
      autoPlay
      className={className}
      controls
      controlsList="nodownload noplaybackrate"
      disablePictureInPicture
      height={height}
      loop
      muted
      onCanPlay={play}
      onClick={play}
      onLoadedData={play}
      playsInline
      poster={poster}
      preload="auto"
      ref={videoRef}
      width={width}
    >
      <source src={mp4Src} type="video/mp4" />
      {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
    </video>
  );
}

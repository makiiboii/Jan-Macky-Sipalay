"use client";

import { useEffect, useRef } from "react";

interface SmartAutoplayVideoProps {
  src: string;
  className?: string;
  poster?: string;
  ariaHidden?: boolean;
}

/**
 * SmartAutoplayVideo:
 * - Autoplays only when in viewport (IntersectionObserver)
 * - Automatically pauses when scrolled out of view or tab is hidden
 * - Eliminates background decoding bottleneck and keeps FPS high (60fps) on all devices
 */
export function SmartAutoplayVideo({
  src,
  className,
  poster,
  ariaHidden = false,
}: SmartAutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isVisible = false;

    const tryPlay = () => {
      if (isVisible && !document.hidden) {
        const promise = video.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Autoplay policy or power saver may require muted
            video.muted = true;
            video.play().catch(() => {});
          });
        }
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
          tryPlay();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "50px 0px 50px 0px",
      },
    );

    observer.observe(video);

    const onVisibilityChange = () => {
      tryPlay();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden={ariaHidden}
      className={className}
    />
  );
}

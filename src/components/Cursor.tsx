"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Custom cursor: a lagging ring + an instant-tracking dot.
 * Only activates on pointer:fine devices (mouse/trackpad, not touch).
 * Respects prefers-reduced-motion — falls back to the default cursor.
 * Scales up when hovering links/buttons for a magnetic feel.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
      () => {
        document.documentElement.classList.add("cursor-none");

        const onMove = (e: MouseEvent) => {
          const { clientX: x, clientY: y } = e;
          gsap.set(dot.current, { x, y });
          gsap.to(ring.current, {
            x,
            y,
            duration: 0.42,
            ease: "power3.out",
            overwrite: true,
          });
        };

        const onEnter = () =>
          gsap.to(ring.current, {
            scale: 2.4,
            opacity: 0.7,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
          });

        const onLeave = () =>
          gsap.to(ring.current, {
            scale: 1,
            opacity: 0.45,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
          });

        const attachHover = () => {
          document.querySelectorAll("a, button").forEach((el) => {
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
          });
        };

        // Attach initially and re-attach when DOM changes (e.g. filter rerenders Portfolio)
        attachHover();
        const observer = new MutationObserver(attachHover);
        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("mousemove", onMove);

        return () => {
          window.removeEventListener("mousemove", onMove);
          observer.disconnect();
          document.documentElement.classList.remove("cursor-none");
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <>
      {/* Lagging outer ring */}
      <div
        ref={ring}
        aria-hidden
        className="gsap-cursor-ring pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-bone opacity-45 mix-blend-difference"
      />
      {/* Instant inner dot */}
      <div
        ref={dot}
        aria-hidden
        className="gsap-cursor-dot pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bone mix-blend-difference"
      />
    </>
  );
}

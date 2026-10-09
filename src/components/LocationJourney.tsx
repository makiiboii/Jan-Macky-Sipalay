"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const EarthCanvas = dynamic(() => import("./EarthCanvas"), { ssr: false });

const chapters = [
  "EARTH FROM SPACE",
  "THE PHILIPPINES",
  "DIGOS CITY",
];

export function LocationJourney() {
  const section = useRef<HTMLElement>(null);
  const stageElement = useRef<HTMLDivElement>(null);
  const locationLine = useRef<SVGLineElement>(null);
  const locationAnchor = useRef<HTMLSpanElement>(null);
  const progress = useRef({ current: 0 });
  const activeStage = useRef(0);
  const [stage, setStage] = useState(0);
  const [near, setNear] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      if (fallback) {
        progress.current.current = 1;
        activeStage.current = chapters.length - 1;
        setStage(chapters.length - 1);
        return;
      }

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const sequence = { progress: 0 };
        gsap.to(sequence, {
          progress: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            pin: stageElement.current,
            start: "top top",
            end: () => `+=${window.innerHeight * (window.innerWidth < 768 ? 1.3 : 2)}`,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progress.current.current = self.progress;
              const next = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
              if (activeStage.current === next) return;
              activeStage.current = next;
              setStage(next);
            },
          },
        });
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        progress.current.current = 1;
        activeStage.current = chapters.length - 1;
        setStage(chapters.length - 1);
      });
    },
    { scope: section, dependencies: [fallback], revertOnUpdate: true },
  );

  return (
    <section
      ref={section}
      id="location"
      className="earth-journey scroll-mt-16"
      data-stage={stage}
      data-fallback={fallback}
      aria-label="From Earth to Digos City"
    >
      <div ref={stageElement} className="earth-stage">
        {near && (
          <EarthCanvas
            progress={progress.current}
            onUnavailable={() => setFallback(true)}
            locationLine={locationLine}
            locationAnchor={locationAnchor}
          />
        )}

        <svg className="earth-stage__locator" aria-hidden="true">
          <line ref={locationLine} />
        </svg>

        <header className="earth-stage__intro">
          <p className="earth-stage__eyebrow">04 / MY LOCATION</p>
          <h2 className="font-display">CREATIVE,<br />BASED IN THE PHILIPPINES.</h2>
          <p className="earth-stage__support">Working worldwide from Digos City, Philippines.</p>
        </header>

        <div className="earth-stage__location" aria-live="polite" aria-atomic="true">
          <span ref={locationAnchor} className="earth-stage__location-anchor" aria-hidden="true" />
          <div className="earth-stage__location-content">
            <h3 className="font-display">DIGOS CITY</h3>
            <p>Davao del Sur, Philippines</p>
            <p>6.75° N / 125.35° E</p>
          </div>
        </div>

        <p className="earth-stage__credit">
          Earth textures: <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope</a>
          <span aria-hidden="true"> · </span>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
        </p>

        {stage < chapters.length - 1 && (
          <div className="earth-stage__scroll" aria-hidden="true">
            <span>SCROLL TO EXPLORE</span>
            <span className="earth-stage__scroll-line" />
          </div>
        )}
      </div>
    </section>
  );
}
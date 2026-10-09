"use client";

import { useEffect, useRef } from "react";
import { aiTools, editingTools, type CreativeTool } from "@/config/tools";

function ToolCarousel({
  tools,
  title,
  label,
}: {
  tools: CreativeTool[];
  title: string;
  label: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
  } | null>(null);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: viewport.scrollLeft,
    };
    if (event.pointerType === "mouse") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || !viewport || drag.pointerId !== event.pointerId) return;
    viewport.scrollLeft = drag.startScroll - (event.clientX - drag.startX);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
  }

  function stepScroll(direction: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    viewport.scrollBy({
      left: direction * 210,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  useEffect(() => {
    const scrollElement = viewportRef.current;
    if (!scrollElement || !("IntersectionObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let direction = 1;
    let position = scrollElement.scrollLeft;

    const animate = (time: number) => {
      frame = 0;
      if (!visible) return;

      const maximum = scrollElement.scrollWidth - scrollElement.clientWidth;
      const paused =
        dragRef.current !== null ||
        scrollElement.matches(":hover, :focus-within");

      if (paused) {
        position = scrollElement.scrollLeft;
      } else if (previousTime && maximum > 4) {
        const dt = Math.min(time - previousTime, 48) / 1000;
        // Subtle, calm speed (~22px/sec) with gentle easing near the ends
        const edgeDistance = Math.min(position, maximum - position);
        const edgeFactor = Math.max(0.35, Math.min(1, edgeDistance / 28));
        position += direction * 22 * edgeFactor * dt;

        if (position >= maximum) {
          position = maximum;
          direction = -1;
        } else if (position <= 0) {
          position = 0;
          direction = 1;
        }
        scrollElement.scrollLeft = position;
      }

      previousTime = time;
      frame = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        previousTime = 0;
        position = scrollElement.scrollLeft;
        if (visible && !frame) frame = requestAnimationFrame(animate);
        if (!visible && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "80px 0px" },
    );

    observer.observe(scrollElement);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="tools-carousel-block">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="tools-showcase__eyebrow">{title}</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => stepScroll(-1)}
            aria-label={`Scroll ${title} left`}
            className="flex h-7 w-7 items-center justify-center border border-line text-xs text-smoke transition-colors hover:border-bone hover:text-bone"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => stepScroll(1)}
            aria-label={`Scroll ${title} right`}
            className="flex h-7 w-7 items-center justify-center border border-line text-xs text-smoke transition-colors hover:border-bone hover:text-bone"
          >
            &rarr;
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="tools-carousel__viewport"
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            stepScroll(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            stepScroll(1);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="tools-carousel__group" role="list">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="tools-carousel__item"
              role="listitem"
              style={
                tool.brandColor
                  ? ({
                      "--tool-brand-color": tool.brandColor,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="tools-carousel__mark">
                {tool.asset ? (
                  <img
                    src={tool.asset}
                    alt={tool.name}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                ) : (
                  <svg
                    viewBox={tool.viewBox ?? "0 0 24 24"}
                    aria-hidden="true"
                  >
                    <path d={tool.svgPath} />
                  </svg>
                )}
              </div>
              <span className="tools-carousel__name">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ToolsShowcase() {
  return (
    <section
      id="tools"
      className="tools-showcase scroll-mt-20 px-5 py-14 md:px-10 md:py-20"
      aria-labelledby="tools-heading"
    >
      <div className="tools-showcase__inner">
        <div className="tools-showcase__intro">
          <p className="tools-showcase__eyebrow">02 / CREATIVE PRACTICE</p>
          <h2 id="tools-heading" className="font-display">
            Tools behind the work
          </h2>
          <p>The creative and AI tools I use to bring ideas to life.</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <ToolCarousel
            tools={editingTools}
            title="EDITING TOOLS"
            label="Editing and creative software"
          />
          <ToolCarousel
            tools={aiTools}
            title="AI TOOLS"
            label="AI tools for video and creative production"
          />
        </div>
      </div>
    </section>
  );
}
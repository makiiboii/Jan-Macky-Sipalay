"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { aiTools, editingTools, type CreativeTool } from "@/config/tools";

function ToolCarousel({
  tools,
  title,
  label,
  direction,
}: {
  tools: CreativeTool[];
  title: string;
  label: string;
  direction: "left" | "right";
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const primaryGroupRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startScroll: number;
  } | null>(null);
  const hoveredRef = useRef(false);
  const touchingRef = useRef(false);
  const manualPauseUntilRef = useRef(0);

  function getCycleWidth() {
    const group = primaryGroupRef.current;
    if (!group) return 0;
    const gap =
      Number.parseFloat(getComputedStyle(group).columnGap || getComputedStyle(group).gap) || 16;
    return group.offsetWidth + gap;
  }

  function normalizeScroll(scrollElement: HTMLDivElement) {
    const cycle = getCycleWidth();
    if (cycle <= 0) return scrollElement.scrollLeft;
    let next = scrollElement.scrollLeft;
    if (next >= cycle * 2) {
      next = (next % cycle) + cycle;
      scrollElement.scrollLeft = next;
    } else if (next <= 2) {
      next = next + cycle;
      scrollElement.scrollLeft = next;
    }
    return next;
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    const startScroll = normalizeScroll(viewport);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll,
    };
    if (event.pointerType === "mouse") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || !viewport || drag.pointerId !== event.pointerId) return;
    const cycle = getCycleWidth();
    let next = drag.startScroll - (event.clientX - drag.startX);
    if (cycle > 0) {
      while (next < cycle * 0.25) next += cycle;
      while (next > cycle * 1.75) next -= cycle;
    }
    viewport.scrollLeft = next;
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    manualPauseUntilRef.current = performance.now() + 1200;
  }

  function stepScroll(stepDir: -1 | 1) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    manualPauseUntilRef.current = performance.now() + 1200;
    normalizeScroll(viewport);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollBy({
      left: stepDir * 220,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  useEffect(() => {
    const scrollElement = viewportRef.current;
    if (!scrollElement) return;

    let frame = 0;
    let previousTime = 0;
    let initialized = false;
    let position = 0;

    const speedPxPerSec = 42;
    const sign = direction === "left" ? 1 : -1;

    const animate = (time: number) => {
      const cycle = getCycleWidth();

      if (!initialized && cycle > 0) {
        // Start in the middle cycle so both left and right motion can wrap seamlessly
        position = cycle;
        scrollElement.scrollLeft = position;
        initialized = true;
      }

      const paused =
        dragRef.current !== null ||
        hoveredRef.current ||
        touchingRef.current ||
        time < manualPauseUntilRef.current;

      if (paused) {
        position = scrollElement.scrollLeft;
      } else if (previousTime && cycle > 0) {
        const dt = Math.min(time - previousTime, 50) / 1000;
        position += sign * speedPxPerSec * dt;

        if (position >= cycle * 2) {
          position -= cycle;
        } else if (position <= 0) {
          position += cycle;
        }

        scrollElement.scrollLeft = position;
      }

      previousTime = time;
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [direction]);

  const renderToolItems = (keyPrefix: string) =>
    tools.map((tool) => (
      <div
        key={`${keyPrefix}-${tool.name}`}
        className="tools-carousel__item"
        role={keyPrefix === "primary" ? "listitem" : undefined}
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
              alt={keyPrefix === "primary" ? tool.name : ""}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          ) : (
            <svg viewBox={tool.viewBox ?? "0 0 24 24"} aria-hidden="true">
              <path d={tool.svgPath} />
            </svg>
          )}
        </div>
        <span className="tools-carousel__name">{tool.name}</span>
      </div>
    ));

  return (
    <div className="tools-carousel-block">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h3 className="tools-showcase__eyebrow">{title}</h3>
          <span className="text-[10px] uppercase tracking-[0.14em] text-smoke/70">
            {direction === "left" ? "← Moving Left" : "Moving Right →"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => stepScroll(-1)}
            aria-label={`Scroll ${title} left`}
            className="flex h-8 w-8 items-center justify-center border border-line text-xs text-smoke transition-colors hover:border-bone hover:text-bone"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => stepScroll(1)}
            aria-label={`Scroll ${title} right`}
            className="flex h-8 w-8 items-center justify-center border border-line text-xs text-smoke transition-colors hover:border-bone hover:text-bone"
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
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") hoveredRef.current = true;
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") hoveredRef.current = false;
        }}
        onTouchStart={() => {
          touchingRef.current = true;
        }}
        onTouchEnd={() => {
          touchingRef.current = false;
          manualPauseUntilRef.current = performance.now() + 1200;
        }}
        onTouchCancel={() => {
          touchingRef.current = false;
        }}
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
        <div ref={primaryGroupRef} className="tools-carousel__group" role="list">
          {renderToolItems("primary")}
        </div>
        <div className="tools-carousel__group" aria-hidden="true">
          {renderToolItems("loop-1")}
        </div>
        <div className="tools-carousel__group" aria-hidden="true">
          {renderToolItems("loop-2")}
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
      <div className="tools-showcase__inner mx-auto max-w-6xl">
        <div className="tools-showcase__intro">
          <p className="tools-showcase__eyebrow">04 / CREATIVE PRACTICE</p>
          <h2 id="tools-heading" className="font-display">
            Tools behind the work
          </h2>
          <p>The creative and AI tools I use to bring ideas to life.</p>
        </div>

        <div className="mt-8 space-y-5">
          <ToolCarousel
            tools={editingTools}
            title="EDITING TOOLS"
            label="Editing and creative software"
            direction="left"
          />
          <ToolCarousel
            tools={aiTools}
            title="AI TOOLS"
            label="AI tools for video and creative production"
            direction="right"
          />
        </div>
      </div>
    </section>
  );
}
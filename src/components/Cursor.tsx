"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button:not(:disabled)",
  "[role='button']",
  "summary",
  "select",
  "label[for]",
  "input[type='submit']",
  "input[type='button']",
  "input[type='checkbox']",
  "input[type='radio']",
  ".tools-carousel__viewport:not(.tools-carousel__viewport--static)",
].join(", ");

const TEXT_FIELD_SELECTOR = [
  "input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio'])",
  "textarea",
  "[contenteditable='true']",
].join(", ");

/**
 * High-performance, zero-delay Pen Tool cursor.
 * - 0ms input latency: hardware-synchronized direct GPU translate3d tracking (no animation lag or low-pass delay).
 * - Ultra-lightweight: zero GSAP ticker loops or frame allocations during pointer movement.
 * - Smart event throttling: DOM element hierarchy is inspected only when crossing element boundaries.
 * - Activates only on fine-pointer devices with hover support and no reduced-motion preference.
 * - Preserves native I-beam cursor on text inputs and textareas.
 */
export function Cursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate on devices with fine pointer (mouse/pen), hover capability, and no reduced motion
    const query = "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)";
    const mql = window.matchMedia(query);
    if (!mql.matches) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    document.documentElement.classList.add("cursor-none");

    let isVisible = false;
    let isHovering = false;
    let isOverText = false;
    let isPressed = false;
    let lastTarget: EventTarget | null = null;

    const updateTargetState = (target: EventTarget | null) => {
      if (!target || target === lastTarget) return;
      lastTarget = target;

      const element = target instanceof Element ? target : null;
      if (!element) return;

      const nextText = Boolean(element.closest(TEXT_FIELD_SELECTOR));
      const nextHover = !nextText && Boolean(element.closest(INTERACTIVE_SELECTOR));

      if (nextText !== isOverText) {
        isOverText = nextText;
        wrapper.classList.toggle("is-hidden", nextText);
      }

      if (nextHover !== isHovering) {
        isHovering = nextHover;
        wrapper.classList.toggle("is-hovering", nextHover);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
        return;
      }

      // Direct zero-delay hardware positioning: pen tip is at (3, 3) inside SVG,
      // so translate by (clientX - 3, clientY - 3) places the exact nib tip at (clientX, clientY).
      wrapper.style.transform = `translate3d(${e.clientX - 3}px, ${e.clientY - 3}px, 0)`;

      if (!isVisible) {
        isVisible = true;
        wrapper.classList.add("is-visible");
      }

      // If returning from text field or hidden state, ensure visibility
      if (isOverText) {
        updateTargetState(e.target);
      } else if (wrapper.classList.contains("is-hidden")) {
        wrapper.classList.remove("is-hidden");
      }

      // Only check target hierarchy if the pointer crossed into a new DOM element
      if (e.target !== lastTarget) {
        updateTargetState(e.target);
      }
    };

    const onPointerOver = (e: PointerEvent) => {
      updateTargetState(e.target);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isPressed = true;
      wrapper.classList.add("is-pressed");
    };

    const onPointerUp = () => {
      if (!isPressed) return;
      isPressed = false;
      wrapper.classList.remove("is-pressed");
    };

    const onWindowLeave = () => {
      wrapper.classList.add("is-hidden");
      lastTarget = null;
    };

    const onWindowEnter = () => {
      if (!isOverText) {
        wrapper.classList.remove("is-hidden");
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onWindowLeave);
    document.documentElement.addEventListener("mouseenter", onWindowEnter);
    window.addEventListener("blur", onWindowLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("mouseleave", onWindowLeave);
      document.documentElement.removeEventListener("mouseenter", onWindowEnter);
      window.removeEventListener("blur", onWindowLeave);
      document.documentElement.classList.remove("cursor-none");
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pen-cursor pointer-events-none fixed left-0 top-0 z-[99999] hidden select-none md:block"
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
      >
        {/* Vector anchor point square at the exact hotspot (3, 3) when hovering clickable elements */}
        <rect
          className="pen-cursor__anchor"
          x="1"
          y="1"
          width="4"
          height="4"
          fill="#050505"
          stroke="#F5F5F5"
          strokeWidth="1.25"
        />

        {/* Adobe Pen Tool nib angled at -45 deg with its tip anchored at (3, 3) */}
        <g className="pen-cursor__nib">
          <g transform="translate(3 3) rotate(-45)">
            {/* Pen nib body */}
            <path
              d="M0 0L-5.2 9.4L-3.2 14.2H3.2L5.2 9.4L0 0Z"
              fill="#050505"
              fillOpacity="0.88"
              stroke="#F5F5F5"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* Nib collar / ferrule band */}
            <path
              d="M-3.6 14.2H3.6L3.1 16.8H-3.1L-3.6 14.2Z"
              fill="#050505"
              fillOpacity="0.92"
              stroke="#F5F5F5"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            {/* Center ink slit from tip to breather hole */}
            <line
              x1="0"
              y1="0.9"
              x2="0"
              y2="6.9"
              stroke="#F5F5F5"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            {/* Iconic circular breather hole */}
            <circle
              cx="0"
              cy="8.2"
              r="1.25"
              fill="#050505"
              stroke="#F5F5F5"
              strokeWidth="1.15"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

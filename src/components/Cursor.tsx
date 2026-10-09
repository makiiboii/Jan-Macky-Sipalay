"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

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
 * Custom Pen Tool cursor inspired by Adobe Photoshop / Illustrator vector workflow.
 * - Activates only on fine-pointer devices with hover support and no reduced-motion preference.
 * - Preserves native I-beam cursor on text inputs and textareas.
 * - Shows a subtle vector anchor-point node at the nib tip when hovering interactive elements.
 */
export function Cursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nibGroupRef = useRef<SVGGElement>(null);
  const anchorNodeRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      "(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)",
      () => {
        const wrapper = wrapperRef.current;
        const nibGroup = nibGroupRef.current;
        const anchorNode = anchorNodeRef.current;
        if (!wrapper || !nibGroup || !anchorNode) return;

        document.documentElement.classList.add("cursor-none");

        let hasMoved = false;
        let isHoveringInteractive = false;
        let isOverTextField = false;
        let isPressed = false;

        gsap.set(wrapper, { autoAlpha: 0 });
        gsap.set(anchorNode, { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(nibGroup, { x: 0, y: 0, scale: 1, transformOrigin: "3px 3px" });

        const xTo = gsap.quickTo(wrapper, "x", {
          duration: 0.065,
          ease: "power3.out",
        });
        const yTo = gsap.quickTo(wrapper, "y", {
          duration: 0.065,
          ease: "power3.out",
        });

        const syncCursorState = () => {
          if (isOverTextField) {
            gsap.to(wrapper, {
              autoAlpha: 0,
              duration: 0.14,
              ease: "power2.out",
              overwrite: "auto",
            });
            return;
          }

          if (hasMoved) {
            gsap.to(wrapper, {
              autoAlpha: 1,
              duration: 0.16,
              ease: "power2.out",
              overwrite: "auto",
            });
          }

          const targetScale = isPressed ? 0.92 : isHoveringInteractive ? 1.1 : 1;
          const targetOffset = isHoveringInteractive ? 2.2 : 0;

          gsap.to(nibGroup, {
            x: targetOffset,
            y: targetOffset,
            scale: targetScale,
            duration: 0.18,
            ease: "power2.out",
            overwrite: true,
          });

          gsap.to(anchorNode, {
            scale: isHoveringInteractive ? (isPressed ? 0.85 : 1) : 0,
            duration: 0.16,
            ease: "power2.out",
            overwrite: true,
          });
        };

        const updateTargetState = (target: EventTarget | null) => {
          const element = target instanceof Element ? target : null;
          const nextTextField = Boolean(element?.closest(TEXT_FIELD_SELECTOR));
          const nextInteractive =
            !nextTextField && Boolean(element?.closest(INTERACTIVE_SELECTOR));

          if (
            nextTextField !== isOverTextField ||
            nextInteractive !== isHoveringInteractive
          ) {
            isOverTextField = nextTextField;
            isHoveringInteractive = nextInteractive;
            syncCursorState();
          }
        };

        const onPointerMove = (e: PointerEvent) => {
          if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") {
            return;
          }

          if (!hasMoved) {
            hasMoved = true;
            gsap.set(wrapper, { x: e.clientX, y: e.clientY });
          } else {
            xTo(e.clientX);
            yTo(e.clientY);
          }

          updateTargetState(e.target);
          if (!isOverTextField) {
            gsap.to(wrapper, {
              autoAlpha: 1,
              duration: 0.14,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        };

        const onPointerOver = (e: PointerEvent) => {
          updateTargetState(e.target);
        };

        const onPointerDown = (e: PointerEvent) => {
          if (e.button !== 0) return;
          isPressed = true;
          syncCursorState();
        };

        const onPointerUp = () => {
          if (!isPressed) return;
          isPressed = false;
          syncCursorState();
        };

        const onWindowLeave = () => {
          gsap.to(wrapper, {
            autoAlpha: 0,
            duration: 0.15,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("pointerover", onPointerOver, { passive: true });
        window.addEventListener("pointerdown", onPointerDown, { passive: true });
        window.addEventListener("pointerup", onPointerUp, { passive: true });
        document.documentElement.addEventListener("mouseleave", onWindowLeave);

        return () => {
          window.removeEventListener("pointermove", onPointerMove);
          document.removeEventListener("pointerover", onPointerOver);
          window.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("pointerup", onPointerUp);
          document.documentElement.removeEventListener("mouseleave", onWindowLeave);
          document.documentElement.classList.remove("cursor-none");
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="gsap-pen-cursor pointer-events-none fixed left-0 top-0 z-[9999] hidden -translate-x-[3px] -translate-y-[3px] select-none opacity-0 md:block"
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
          ref={anchorNodeRef}
          x="1"
          y="1"
          width="4"
          height="4"
          fill="#050505"
          stroke="#F5F5F5"
          strokeWidth="1.25"
        />

        {/* Adobe Pen Tool nib angled at -45 deg with its tip anchored at (3, 3) */}
        <g ref={nibGroupRef}>
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

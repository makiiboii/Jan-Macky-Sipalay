"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

// template.tsx re-mounts on every route change, so GSAP animates on every navigation.
export default function Template({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(container.current, {
          opacity: 0,
          y: 18,
          duration: 0.55,
          ease: "power3.out",
          clearProps: "all",
        });
      });
    },
    { scope: container },
  );

  return <div ref={container}>{children}</div>;
}

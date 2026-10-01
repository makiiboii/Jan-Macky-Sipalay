"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { site } from "@/config/site";

const lines = ["Creative", "Videographer", "& Editor"];

export function Hero() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.from(".hero-line > span", {
          yPercent: 110,
          duration: 1.05,
          stagger: 0.13,
        }).from(
          ".hero-sub",
          { opacity: 0, y: 22, duration: 0.8, ease: "power3.out" },
          "-=0.55",
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-line > span, .hero-sub", { clearProps: "all" });
      });
    },
    { scope: container },
  );

  return (
    <section
      ref={container}
      className="flex min-h-[100svh] flex-col justify-end px-5 pb-10 pt-28 md:px-10 md:pb-14"
    >
      <h1 className="font-display text-[clamp(3.4rem,14.2vw,14rem)] leading-[0.88]">
        {lines.map((line) => (
          <span key={line} className="hero-line">
            <span>{line}</span>
          </span>
        ))}
      </h1>

      <div className="hero-sub mt-10 flex flex-col gap-8 border-t border-line pt-6 md:mt-14 md:flex-row md:items-end md:justify-between">
        <p className="max-w-sm text-lg leading-snug text-bone/80 md:text-xl">
          {site.heroDescription}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/#work" className="btn btn-solid px-7 py-4 tracking-[0.14em]">
            VIEW MY WORK
          </Link>
          <Link href="/#contact" className="btn btn-outline px-7 py-4 tracking-[0.14em]">
            CONTACT ME
          </Link>
        </div>
      </div>
    </section>
  );
}

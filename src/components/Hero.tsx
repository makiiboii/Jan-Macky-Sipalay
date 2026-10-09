"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { site } from "@/config/site";

const lines = ["Making visuals", "that move people."];

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
      className="flex min-h-[78svh] flex-col justify-between px-5 pb-14 pt-24 sm:px-8 sm:pt-28 md:min-h-[82svh] md:px-10 md:pb-16"
    >
      <div className="mb-10 flex items-center justify-between border-b border-line pb-3 text-[11px] uppercase tracking-[0.18em] text-smoke">
        <p className="hero-sub">Independent visual creative</p>
        <p className="hero-sub">Digos City · Philippines</p>
      </div>

      <div className="my-auto grid items-end gap-8 py-6 md:grid-cols-12 md:gap-8">
        <h1 className="font-display text-[clamp(3rem,9vw,7.25rem)] leading-[0.88] md:col-span-8">
          {lines.map((line) => (
            <span key={line} className="hero-line">
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <div className="hero-sub max-w-md md:col-span-4 md:pb-1">
          <p className="text-base leading-relaxed text-bone/85 sm:text-lg">
            {site.heroDescription}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">
            {site.disciplines.slice(0, 4).join(" · ")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/#work"
              className="btn btn-solid px-6 py-3 text-xs uppercase tracking-[0.16em]"
            >
              Explore work
            </Link>
            <Link
              href="/#contact"
              className="btn btn-outline px-6 py-3 text-xs uppercase tracking-[0.16em]"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

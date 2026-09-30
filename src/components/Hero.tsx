import Link from "next/link";
import type { CSSProperties } from "react";
import { site } from "@/config/site";

const lines = ["Creative", "Videographer", "& Editor"];

export function Hero() {
  return (
    <section className="flex min-h-[100svh] flex-col justify-end px-5 pb-10 pt-28 md:px-10 md:pb-14">
      <h1 className="font-display text-[clamp(3.4rem,14.2vw,14rem)] leading-[0.88]">
        {lines.map((line, index) => (
          <span key={line} className="hero-line">
            <span style={{ "--d": `${index * 110}ms` } as CSSProperties}>{line}</span>
          </span>
        ))}
      </h1>

      <div className="animate-fade-up mt-10 flex flex-col gap-8 border-t border-line pt-6 md:mt-14 md:flex-row md:items-end md:justify-between" style={{ "--d": "700ms" } as CSSProperties}>
        <p className="max-w-sm text-lg leading-snug text-bone/80 md:text-xl">{site.heroDescription}</p>
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

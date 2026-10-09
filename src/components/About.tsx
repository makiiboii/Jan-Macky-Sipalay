"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { site } from "@/config/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function About() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const eyebrow = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const stageEl = stage.current;
          if (!stageEl) return;

          gsap.set(eyebrow.current, { autoAlpha: 0, y: 18 });
          gsap.set(heading.current, { autoAlpha: 0, y: 24 });
          gsap.set(copy.current, { autoAlpha: 0, y: 24 });

          const canPinSafely = () =>
            stageEl.scrollHeight <= window.innerHeight + 8;

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section.current,
              pin: canPinSafely() ? stageEl : false,
              start: canPinSafely() ? "top top" : "top 75%",
              end: () =>
                canPinSafely()
                  ? `+=${Math.round(window.innerHeight * 0.72)}`
                  : "bottom 75%",
              scrub: 0.5,
              anticipatePin: canPinSafely() ? 1 : 0,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .fromTo(
              portrait.current,
              { xPercent: 24, scale: 1.06 },
              {
                xPercent: 0,
                scale: 1,
                duration: 0.65,
                ease: "power2.out",
              },
              0,
            )
            .to(
              eyebrow.current,
              { autoAlpha: 1, y: 0, duration: 0.24, ease: "power2.out" },
              0.22,
            )
            .to(
              heading.current,
              { autoAlpha: 1, y: 0, duration: 0.26, ease: "power2.out" },
              0.32,
            )
            .to(
              copy.current,
              { autoAlpha: 1, y: 0, duration: 0.34, ease: "power2.out" },
              0.42,
            );
        },
      );

      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.set([eyebrow.current, heading.current, copy.current], {
            autoAlpha: 0,
            y: 20,
          });

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section.current,
              start: "top 82%",
              end: "center 55%",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          });

          timeline
            .fromTo(
              portrait.current,
              { autoAlpha: 0.4, y: 20, scale: 0.96 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out" },
              0,
            )
            .to(
              [eyebrow.current, heading.current, copy.current],
              {
                autoAlpha: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.45,
                ease: "power2.out",
              },
              0.15,
            );
        },
      );

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [portrait.current, eyebrow.current, heading.current, copy.current],
          { clearProps: "all" },
        );
      });

      ScrollTrigger.refresh();
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="about"
      className="about-cinematic scroll-mt-16 border-t border-line"
    >
      <div ref={stage} className="about-cinematic__stage">
        <div className="about-cinematic__grid">
          <div ref={portrait} className="about-cinematic__portrait">
            <div className="about-cinematic__portrait-frame">
              <Image
                src={site.profileImage}
                alt={`Portrait of ${site.name} holding a camera`}
                fill
                sizes="(min-width: 1024px) 38vw, (min-width: 768px) 42vw, 76vw"
                className="object-contain object-bottom"
              />
            </div>
          </div>

          <div className="about-cinematic__copy">
            <p ref={eyebrow} className="about-cinematic__eyebrow">
              03 / THE CREATIVE BEHIND THE WORK
            </p>
            <h2 ref={heading} className="font-display about-cinematic__title">
              About me
            </h2>
            <div ref={copy} className="about-cinematic__body">
              <p className="about-cinematic__lead">
                I&rsquo;m a visual creative driven by storytelling, movement, and
                detail.
              </p>
              {site.about.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              <p className="about-cinematic__disciplines">
                {site.disciplines.join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

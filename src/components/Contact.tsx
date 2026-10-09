"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { emailChannel, socialChannels, type ContactChannel } from "@/config/site";
import { gsap, ScrollTrigger } from "@/lib/gsap";

function ChannelIcon({ label }: { label: string }) {
  const key = label.toLowerCase();

  if (key === "email") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 text-bone/90 transition-colors group-hover:text-white"
      >
        <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
        <path d="m3.5 6.5 8.5 6 8.5-6" />
      </svg>
    );
  }

  if (key === "whatsapp") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 text-bone/90 transition-colors group-hover:text-white"
      >
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </svg>
    );
  }

  if (key === "instagram") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 text-bone/90 transition-colors group-hover:text-white"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (key === "facebook") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-5 w-5 shrink-0 text-bone/90 transition-colors group-hover:text-white"
      >
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z" />
      </svg>
    );
  }

  // TikTok
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0 text-bone/90 transition-colors group-hover:text-white"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function ChannelRow({ channel }: { channel: ContactChannel }) {
  const displayValue = channel.display.replace(/^https?:\/\/(www\.)?/, "");
  const isMail = channel.href.startsWith("mailto:");

  return (
    <li data-contact-right className="border-b border-line">
      <a
        href={channel.href || "#contact"}
        target={isMail ? undefined : "_blank"}
        rel={isMail ? undefined : "noopener noreferrer"}
        className="group flex items-center justify-between gap-4 py-6 transition-colors hover:border-bone"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <ChannelIcon label={channel.label} />
          <span className="w-24 shrink-0 text-[11px] uppercase tracking-[0.2em] text-smoke transition-colors group-hover:text-bone sm:w-32">
            {channel.label}
          </span>
          <span className="truncate text-sm text-bone transition-colors group-hover:text-white sm:text-base">
            {displayValue}
          </span>
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-lg text-smoke transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-bone"
        >
          &rarr;
        </span>
      </a>
    </li>
  );
}

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const leftItems = section.querySelectorAll<HTMLElement>("[data-contact-left]");
      const rightItems = section.querySelectorAll<HTMLElement>("[data-contact-right]");
      const watermark = watermarkRef.current;

      gsap.set(leftItems, { autoAlpha: 0, x: -90 });
      gsap.set(rightItems, { autoAlpha: 0, x: 90 });
      if (watermark) {
        gsap.set(watermark, { autoAlpha: 0, x: -130 });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      tl.to(
        leftItems,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
        },
        0,
      ).to(
        rightItems,
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.85,
          stagger: 0.09,
          ease: "power3.out",
        },
        0.1,
      );

      if (watermark) {
        tl.to(
          watermark,
          {
            autoAlpha: 1,
            x: 0,
            duration: 1.1,
            ease: "power3.out",
          },
          0.2,
        );
      }
    },
    { scope: sectionRef },
  );

  const channels: ContactChannel[] = [emailChannel, ...socialChannels];

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative scroll-mt-16 overflow-hidden border-t border-line px-5 pb-16 pt-24 md:px-10 md:pb-20 md:pt-32"
    >
      <div className="mx-auto max-w-[90rem]">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Left Column — slides in from the left */}
          <div className="relative z-10 lg:col-span-6">
            <p
              data-contact-left
              className="mb-5 text-xs uppercase tracking-[0.2em] text-smoke"
            >
              05 / LET&rsquo;S MAKE SOMETHING
            </p>

            <h2
              data-contact-left
              className="font-display text-[clamp(3.6rem,8vw,6.75rem)] leading-[0.9] tracking-tight text-bone"
            >
              HAVE A PROJECT
              <br />
              IN MIND?
            </h2>

            <p
              data-contact-left
              className="mt-7 text-xl font-medium text-bone sm:text-2xl"
            >
              Let&rsquo;s make something worth watching.
            </p>

            <p
              data-contact-left
              className="mt-4 max-w-md text-sm leading-relaxed text-smoke sm:text-base"
            >
              Whether it&rsquo;s a brand video, social content, photo shoot, or
              something creative — I&rsquo;d love to hear about it.
            </p>

            {emailChannel.href && (
              <div data-contact-left className="mt-8">
                <a
                  href={emailChannel.href}
                  className="group inline-flex items-center gap-4 rounded-full border border-bone/45 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-bone transition-all duration-300 hover:border-bone hover:bg-bone hover:text-black"
                >
                  <span>GET IN TOUCH</span>
                  <span
                    aria-hidden="true"
                    className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </a>
              </div>
            )}

            {/* Giant subtle "LET'S TALK" background watermark */}
            <p
              ref={watermarkRef}
              aria-hidden="true"
              className="font-display pointer-events-none mt-10 select-none text-[clamp(4.5rem,11vw,9.5rem)] leading-[0.82] tracking-tight text-white/[0.045] sm:mt-12"
            >
              LET&rsquo;S TALK
            </p>
          </div>

          {/* Right Column — slides in from the right */}
          <div className="relative z-10 lg:col-span-6 lg:pl-6 lg:pt-8">
            <ul>
              {channels.map((channel) => (
                <ChannelRow key={channel.label} channel={channel} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

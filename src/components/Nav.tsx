"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const links = [
  { label: "FEATURED", href: "/#featured" },
  { label: "WORK", href: "/#work" },
  { label: "TOOLS", href: "/#tools" },
  { label: "ABOUT", href: "/#about" },
  { label: "CONTACT", href: "/#contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  function navigate(link: (typeof links)[number], event: React.MouseEvent<HTMLAnchorElement>) {
    setOpen(false);
    const hashIndex = link.href.indexOf("#");
    if (hashIndex === -1 || window.location.pathname !== "/") return;

    const targetId = link.href.slice(hashIndex + 1);
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    document.body.style.overflow = "";
    window.history.pushState(null, "", link.href);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const top = window.scrollY + target.getBoundingClientRect().top - margin;
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        window.scrollTo({ top, behavior });
      });
    });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled && !open ? "site-nav--scrolled border-b border-line" : "border-b border-transparent",
        )}
      >
        <nav aria-label="Main" className="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
          <Link href="/" onClick={() => setOpen(false)} className="font-display text-2xl tracking-wide">
            {site.shortName}
          </Link>

          <ul className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={(event) => navigate(link, event)} className="text-sm tracking-[0.18em] text-smoke transition-colors hover:text-bone">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[7px] md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className={cn("h-px w-6 bg-bone transition-transform duration-300", open && "translate-y-[4px] rotate-45")} />
            <span className={cn("h-px w-6 bg-bone transition-transform duration-300", open && "-translate-y-[4px] -rotate-45")} />
          </button>
        </nav>
      </header>

      {open && (
        <div id="mobile-menu" className="site-mobile-menu animate-fade-in fixed inset-0 z-40 flex flex-col justify-center px-6 md:hidden">
          <ul className="space-y-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={(event) => navigate(link, event)} className="font-display block py-2 text-5xl sm:text-6xl leading-none">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

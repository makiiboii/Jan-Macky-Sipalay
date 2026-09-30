"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const links = [
  { label: "WORK", href: "/#work" },
  { label: "ABOUT", href: "/#about" },
  { label: "CONTACT", href: "/#contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
          scrolled && !open ? "border-b border-line bg-black/85 backdrop-blur-sm" : "border-b border-transparent",
        )}
      >
        <nav aria-label="Main" className="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
          <Link href="/" onClick={() => setOpen(false)} className="font-display text-2xl tracking-wide">
            {site.shortName}
          </Link>

          <ul className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm tracking-[0.18em] text-smoke transition-colors hover:text-bone">
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
        <div id="mobile-menu" className="animate-fade-in fixed inset-0 z-40 flex flex-col justify-center bg-black px-5 md:hidden">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className="font-display block py-2 text-7xl leading-none">
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

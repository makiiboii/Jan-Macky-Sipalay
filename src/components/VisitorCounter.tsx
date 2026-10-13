"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function VisitorCounter() {
  const [visits, setVisits] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function trackVisit() {
      try {
        // Skip tracking in admin dashboard or local preview if desired
        const pathname = window.location.pathname;
        if (pathname.startsWith("/admin")) {
          return;
        }

        const sessionKey = "jms_portfolio_visited";
        const hasVisitedThisSession = sessionStorage.getItem(sessionKey);

        let res: Response;
        if (hasVisitedThisSession) {
          // Already counted this session, just retrieve the current count
          res = await fetch("/api/visits", {
            method: "GET",
            headers: { Accept: "application/json" },
          });
        } else {
          // Record new visit
          sessionStorage.setItem(sessionKey, "true");
          res = await fetch("/api/visits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ path: pathname }),
          });
        }

        if (!res.ok) throw new Error("Failed to fetch visit count");
        const data = await res.json();
        if (!isCancelled && typeof data.visits === "number") {
          setVisits(data.visits);
        }
      } catch (err) {
        console.warn("Visitor counter could not load:", err);
      }
    }

    trackVisit();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <aside
      aria-label="Visitor statistics"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] right-4 z-40 sm:bottom-6 sm:right-6"
    >
      <div className="relative group">
        {/* Tooltip on hover / tap */}
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md",
            "border border-white/10 bg-[#0d0d0d]/95 px-2.5 py-1 text-[11px] font-sans text-smoke shadow-xl backdrop-blur-md",
            "transition-all duration-200 ease-out",
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>
              {visits !== null
                ? `${visits.toLocaleString()} total website visit${visits === 1 ? "" : "s"}`
                : "Live visitor count"}
            </span>
          </div>
        </div>

        {/* Minimal Icon & Pill */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          title={
            visits !== null
              ? `Total site visits: ${visits.toLocaleString()}`
              : "Site visits"
          }
          className={cn(
            "group/btn relative flex items-center gap-2 rounded-full",
            "border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md",
            "shadow-lg shadow-black/40 transition-all duration-300",
            "hover:border-white/25 hover:bg-black/80 hover:shadow-black/70",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
            "select-none cursor-pointer",
          )}
        >
          {/* Subtle live indicator dot */}
          <span className="relative flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>

          {/* Minimal Eye Icon */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-smoke/90 transition-colors group-hover/btn:text-bone"
          >
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
          </svg>

          {/* Count */}
          <span className="font-mono text-[11px] font-medium tracking-tight text-bone sm:text-xs">
            {visits !== null ? visits.toLocaleString() : "..."}
          </span>
        </button>
      </div>
    </aside>
  );
}

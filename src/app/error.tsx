"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center px-5 md:px-10">
      <h1 className="font-display text-[clamp(3rem,12vw,9rem)] leading-[0.9]">Something broke</h1>
      <p className="mt-6 max-w-md text-smoke">
        This page could not load. It is usually temporary, so try again in a moment.
      </p>
      <button onClick={reset} className="btn btn-solid mt-10">
        Try again
      </button>
    </main>
  );
}

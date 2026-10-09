"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { resolveImageUrl } from "@/lib/drive";

export type GalleryImage = { id: string; url: string; caption: string | null };

const pad = (n: number) => String(n).padStart(2, "0");

// Plain <img> keeps each photo at its natural ratio inside the masonry columns.
// Clicking a photo opens it full screen in a lightbox.
export function Gallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);

  function close() {
    const last = open;
    setOpen(null);
    // Return keyboard focus to the photo that was opened
    if (last !== null) triggers.current[last]?.focus();
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <figure key={image.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              ref={(el) => {
                triggers.current[index] = el;
              }}
              onClick={() => setOpen(index)}
              aria-label={`Open photo ${index + 1} of ${images.length}`}
              className="group relative block w-full cursor-zoom-in overflow-hidden bg-black"
            >
              <img
                src={resolveImageUrl(image.url)}
                alt={image.caption || `${title} photo ${index + 1}`}
                loading="lazy"
                decoding="async"
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
            </button>
            {image.caption && <figcaption className="mt-2 text-sm text-smoke">{image.caption}</figcaption>}
          </figure>
        ))}
      </div>

      {open !== null && <Lightbox images={images} title={title} index={open} onChange={setOpen} onClose={close} />}
    </>
  );
}

export function Lightbox({
  images,
  title,
  index,
  onChange,
  onClose,
}: {
  images: GalleryImage[];
  title: string;
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const count = images.length;
  const image = images[index];
  const closeButton = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(() => onChange((index - 1 + count) % count), [index, count, onChange]);
  const next = useCallback(() => onChange((index + 1) % count), [index, count, onChange]);

  // Focus the dialog and stop the page behind it from scrolling
  useEffect(() => {
    closeButton.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") prev();
      else if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  // Preload the neighbouring photos so next/previous feel instant
  useEffect(() => {
    if (count < 2) return;
    for (const i of [(index + 1) % count, (index - 1 + count) % count]) {
      const preload = new window.Image();
      preload.src = resolveImageUrl(images[i].url);
    }
  }, [index, count, images]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      className="gallery-lightbox animate-fade-in fixed inset-0 z-[100] flex flex-col"
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const dx = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
      }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-5 text-sm md:px-10">
        <span className="tabular-nums tracking-[0.16em] text-smoke">
          {pad(index + 1)} / {pad(count)}
        </span>
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          className="py-2 tracking-[0.16em] text-smoke transition-colors hover:text-bone"
        >
          CLOSE <span aria-hidden="true">&#x2715;</span>
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <img
          key={image.id}
          src={resolveImageUrl(image.url)}
          alt={image.caption || `${title} photo ${index + 1}`}
          className="animate-fade-in max-h-[calc(100dvh-9rem)] max-w-full object-contain"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-1 top-1/2 -translate-y-1/2 p-3 text-2xl text-smoke transition-colors hover:text-bone md:left-6 md:text-3xl"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-3 text-2xl text-smoke transition-colors hover:text-bone md:right-6 md:text-3xl"
            >
              &rarr;
            </button>
          </>
        )}
      </div>

      <p className="flex min-h-[4rem] shrink-0 items-center justify-center px-5 py-3 text-center text-sm text-smoke md:px-10">
        {image.caption}
      </p>
    </div>
  );
}

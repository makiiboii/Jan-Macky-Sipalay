/* eslint-disable @next/next/no-img-element */
import { resolveImageUrl } from "@/lib/drive";

type GalleryImage = { id: string; url: string; caption: string | null };

// Plain <img> keeps each photo at its natural ratio inside the masonry columns.
export function Gallery({ images, title }: { images: GalleryImage[]; title: string }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {images.map((image, index) => (
        <figure key={image.id} className="mb-4 break-inside-avoid">
          <img
            src={resolveImageUrl(image.url)}
            alt={image.caption || `${title} photo ${index + 1}`}
            loading="lazy"
            decoding="async"
            className="h-auto w-full bg-neutral-950"
          />
          {image.caption && <figcaption className="mt-2 text-sm text-smoke">{image.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

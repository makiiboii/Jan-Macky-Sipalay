import Image from "next/image";
import { resolveImageUrl } from "@/lib/drive";
import { cn } from "@/lib/utils";

function skipOptimizer(url: string) {
  return /\.svg(\?|$)/i.test(url) || /(^|\.)google(usercontent)?\.com/i.test(url.replace(/^https?:\/\//, "").split("/")[0]);
}

/** Fills its (relative, sized) parent with a cropped image. Shows a quiet placeholder when there is no image. */
export function Cover({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return <div className="absolute inset-0 flex items-center justify-center bg-neutral-950 text-sm text-neutral-600">No thumbnail</div>;
  }
  const url = resolveImageUrl(src);
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={skipOptimizer(url)}
      className={cn("object-cover", className)}
    />
  );
}

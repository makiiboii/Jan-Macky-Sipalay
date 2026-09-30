import Image from "next/image";
import { site } from "@/config/site";
import { Reveal } from "./Reveal";

export function About() {
  const isSvg = site.profileImage.endsWith(".svg");
  return (
    <section id="about" className="scroll-mt-16 border-t border-line px-5 py-24 md:px-10 md:py-40">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-4">
          <div className="relative aspect-[4/5] overflow-hidden bg-neutral-950">
            <Image
              src={site.profileImage}
              alt={`Portrait of ${site.name}`}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              unoptimized={isSvg}
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal className="md:col-span-7 md:col-start-6" delay={100}>
          <h2 className="font-display text-[clamp(2.8rem,8vw,7.5rem)] leading-[0.9]">{site.name}</h2>
          <ul className="mt-6 space-y-1 text-xl text-bone/90">
            {site.disciplines.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-10 max-w-xl space-y-5 text-lg leading-relaxed text-smoke">
            {site.about.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

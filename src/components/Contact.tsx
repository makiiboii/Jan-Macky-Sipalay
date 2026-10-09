import { emailChannel, site, socialChannels, type ContactChannel } from "@/config/site";
import { Reveal } from "./Reveal";

function ChannelRow({ channel }: { channel: ContactChannel }) {
  const content = channel.href ? (
    <a
      href={channel.href}
      target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="text-bone transition-colors hover:text-white break-all sm:break-normal"
    >
      {channel.display.replace(/^https?:\/\/(www\.)?/, "")}
    </a>
  ) : (
    <span className="text-muted">Not set yet</span>
  );

  return (
    <li className="flex flex-col gap-1.5 border-b border-line py-4 text-base sm:flex-row sm:items-baseline sm:justify-between sm:py-5 sm:text-lg">
      <span className="text-smoke shrink-0">{channel.label}</span>
      <div className="min-w-0 max-w-full">{content}</div>
    </li>
  );
}

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-line px-5 py-24 md:px-10 md:py-40 max-w-full overflow-hidden">
      <div className="grid gap-14 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-6">
          <p className="mb-5 text-xs uppercase tracking-[0.18em] text-smoke">05 / Contact</p>
          <h2 className="font-display max-w-3xl text-5xl leading-[0.92] sm:text-6xl lg:text-7xl">Have a project in mind?</h2>
          <p className="mt-6 text-xl text-bone sm:text-2xl">Let&rsquo;s make something worth watching.</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-smoke sm:text-base">{site.contactIntro}</p>
          {emailChannel.href && (
            <a
              href={emailChannel.href}
              className="group mt-7 inline-flex min-h-11 items-center gap-3 border-b border-line pb-2 text-sm text-bone transition-colors hover:border-bone"
            >
              Start a conversation
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
            </a>
          )}
        </Reveal>

        <Reveal className="md:col-span-5 md:col-start-8 md:pt-12" delay={100}>
          <ul className="border-t border-line">
            <ChannelRow channel={emailChannel} />
            {socialChannels.map((channel) => (
              <ChannelRow key={channel.label} channel={channel} />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

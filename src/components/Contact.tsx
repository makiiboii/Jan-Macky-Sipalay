import { emailChannel, site, socialChannels, type ContactChannel } from "@/config/site";
import { Reveal } from "./Reveal";

function ChannelRow({ channel }: { channel: ContactChannel }) {
  const content = channel.href ? (
    <a
      href={channel.href}
      target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="text-bone transition-colors hover:text-white"
    >
      {channel.display.replace(/^https?:\/\/(www\.)?/, "")}
    </a>
  ) : (
    <span className="text-neutral-600">Not set yet</span>
  );

  return (
    <li className="flex items-baseline justify-between gap-6 border-b border-line py-5 text-lg">
      <span className="text-smoke">{channel.label}</span>
      {content}
    </li>
  );
}

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-line px-5 py-24 md:px-10 md:py-40">
      <div className="grid gap-14 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-6">
          <h2 className="font-display text-[clamp(3rem,10vw,9.5rem)] leading-[0.88]">Let&rsquo;s make something</h2>
          <p className="mt-8 max-w-md text-lg text-smoke">{site.contactIntro}</p>
        </Reveal>

        <Reveal className="md:col-span-5 md:col-start-8" delay={100}>
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

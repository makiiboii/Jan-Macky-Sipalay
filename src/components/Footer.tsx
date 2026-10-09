import { site, socialChannels } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-10 md:px-10 md:py-12">
      <div className="mx-auto max-w-[90rem]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-3xl tracking-wide text-bone sm:text-4xl">
              {site.shortName}
            </p>
            <p className="mt-1.5 text-xs tracking-wide text-smoke sm:text-sm">
              Videographer · Editor · Photographer · Motion Graphics · AI Video
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-xs text-smoke sm:text-sm">
            {socialChannels.map((channel) => (
              <li key={channel.label}>
                {channel.href ? (
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-bone"
                  >
                    {channel.label}
                  </a>
                ) : (
                  <span className="text-muted">{channel.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-7 text-xs text-muted">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}

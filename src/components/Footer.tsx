import { site, socialChannels } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-12 md:px-10">
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-4xl">{site.shortName}</p>
          <p className="mt-2 text-smoke">Videographer · Editor · Photographer</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {socialChannels.map((channel) => (
            <li key={channel.label}>
              {channel.href ? (
                <a href={channel.href} target="_blank" rel="noopener noreferrer" className="text-smoke transition-colors hover:text-bone">
                  {channel.label}
                </a>
              ) : (
                <span className="text-neutral-700">{channel.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-10 text-sm text-neutral-600">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  );
}

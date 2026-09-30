// A template re-mounts on every navigation, which gives a short fade between pages.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}

import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { VisitorCounter } from "@/components/VisitorCounter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cursor />
      <Nav />
      <main>{children}</main>
      <Footer />
      <VisitorCounter />
    </>
  );
}

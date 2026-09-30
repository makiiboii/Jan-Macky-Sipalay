import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (process.env.ADMIN_PASSWORD && !(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between border-b border-line px-5 md:px-10">
        <Link href="/admin" className="font-display text-2xl">
          Admin
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" target="_blank" className="text-smoke hover:text-bone">
            View site
          </Link>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-10">{children}</div>
    </div>
  );
}

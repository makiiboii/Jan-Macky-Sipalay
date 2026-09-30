import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-5xl leading-none">Admin</h1>
        <p className="mt-3 text-smoke">Log in to manage your projects.</p>
        <LoginForm />
      </div>
    </main>
  );
}

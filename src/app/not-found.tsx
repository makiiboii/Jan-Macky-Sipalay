import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-start justify-center px-5 md:px-10">
      <p className="text-smoke">404</p>
      <h1 className="font-display mt-4 text-[clamp(3rem,12vw,9rem)] leading-[0.9]">Page not found</h1>
      <p className="mt-6 max-w-md text-smoke">That page does not exist, or the project has been unpublished.</p>
      <Link href="/#work" className="btn btn-solid mt-10">
        Back to work
      </Link>
    </main>
  );
}

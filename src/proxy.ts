import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const loggedIn = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    return loggedIn ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
  }

  if (!loggedIn) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

import { NextResponse } from "next/server";
import { checkOrigin } from "@/lib/api";
import { sessionCookieOptions } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(req: Request) {
  const blocked = checkOrigin(req);
  if (blocked) return blocked;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}

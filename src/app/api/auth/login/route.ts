import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, checkOrigin, handleError } from "@/lib/api";
import { checkPassword, sessionCookieOptions } from "@/lib/auth";
import { clearRateLimit, isRateLimited } from "@/lib/rate-limit";
import { SESSION_COOKIE, createSessionToken } from "@/lib/session";

const bodySchema = z.object({ password: z.string().min(1).max(500) });

export async function POST(req: Request) {
  try {
    const blocked = checkOrigin(req);
    if (blocked) return blocked;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) return apiError("Too many attempts. Wait a few minutes and try again.", 429);

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) return apiError("Enter your password.", 400);

    if (!process.env.ADMIN_PASSWORD) {
      clearRateLimit(ip);
      const res = NextResponse.json({ ok: true });
      res.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
      return res;
    }

    if (!process.env.SESSION_SECRET) {
      console.error("SESSION_SECRET is not set.");
      return apiError("Login is not configured on the server.", 500);
    }

    if (!checkPassword(parsed.data.password)) return apiError("Incorrect password.", 401);

    clearRateLimit(ip);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
    return res;
  } catch (error) {
    return handleError(error);
  }
}

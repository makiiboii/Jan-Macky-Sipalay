import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { isAdmin } from "./auth";

export function apiError(message: string, status: number, fieldErrors?: Record<string, string[] | undefined>) {
  return NextResponse.json({ error: message, ...(fieldErrors ? { fieldErrors } : {}) }, { status });
}

function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function checkOrigin(req: Request) {
  return isSameOrigin(req) ? null : apiError("Cross-site request blocked.", 403);
}

/** Returns an error response if the caller is not a logged-in admin, otherwise null. */
export async function requireAdmin(req: Request) {
  if (!process.env.ADMIN_PASSWORD) return null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const blocked = checkOrigin(req);
    if (blocked) return blocked;
  }
  if (!(await isAdmin())) return apiError("You need to log in to do that.", 401);
  return null;
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return apiError("Some fields are invalid.", 400, error.flatten().fieldErrors);
  }
  if (error instanceof SyntaxError) return apiError("Request body must be valid JSON.", 400);
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return apiError("The database is unavailable right now. Try again in a moment.", 503);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return apiError("That slug is already used by another project.", 409);
    if (error.code === "P2025") return apiError("Project not found.", 404);
    if (error.code === "P1001") return apiError("The database is unavailable right now. Try again in a moment.", 503);
  }
  console.error(error);
  return apiError("Something went wrong on our side.", 500);
}

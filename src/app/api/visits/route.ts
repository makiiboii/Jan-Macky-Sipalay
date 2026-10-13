import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const BOT_PATTERN =
  /bot|spider|crawler|crawl|lighthouse|facebookexternalhit|whatsapp|slack|preview|google|bing|yahoo|baidu|duckduckgo|slurp|curl|wget/i;

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stat = await prisma.siteStat.findUnique({
      where: { key: "total_visits" },
    });

    const visits = stat?.value ?? 0;

    return NextResponse.json(
      { visits },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("Error reading visits:", error);
    return NextResponse.json({ visits: 0, error: "Failed to read visits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "";
    const isBot = BOT_PATTERN.test(userAgent);

    let path = "/";
    try {
      const body = await req.json();
      if (body && typeof body.path === "string") {
        path = body.path.slice(0, 100);
      }
    } catch {
      // Body is optional
    }

    // Don't track admin pages or automated bots/crawlers
    if (isBot || path.startsWith("/admin")) {
      const current = await prisma.siteStat.findUnique({
        where: { key: "total_visits" },
      });
      return NextResponse.json({ visits: current?.value ?? 0, tracked: false });
    }

    // Atomically increment counter
    const stat = await prisma.siteStat.upsert({
      where: { key: "total_visits" },
      update: { value: { increment: 1 } },
      create: { key: "total_visits", value: 1 },
    });

    // Record visit details asynchronously for analytics
    prisma.siteVisit
      .create({
        data: {
          path,
          userAgent: userAgent ? userAgent.slice(0, 255) : null,
        },
      })
      .catch((err) => {
        console.error("Failed to log visit record:", err);
      });

    return NextResponse.json({ visits: stat.value, tracked: true });
  } catch (error) {
    console.error("Error recording visit:", error);
    return NextResponse.json({ visits: 0, error: "Failed to record visit" }, { status: 500 });
  }
}

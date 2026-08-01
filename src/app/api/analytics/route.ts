import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

// Hash the IP + User Agent + Salt to create an anonymous session ID
// We do not store raw IPs.
function getAnonymousSessionId(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  // Reset salt daily to prevent long-term tracking
  const salt = new Date().toISOString().split("T")[0];
  
  return crypto.createHash("sha256").update(`${ip}-${ua}-${salt}`).digest("hex").substring(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const sessionId = getAnonymousSessionId(req);
    const { type, path, revisionId, blockId, referrer, deviceClass, country } = data;

    if (type === "PAGE_VIEW") {
      await prisma.pageView.create({
        data: {
          path,
          revisionId,
          sessionId,
          referrer,
          deviceClass,
          country,
        }
      });
    } else if (type === "LINK_CLICK") {
      if (!blockId) return NextResponse.json({ error: "Missing blockId" }, { status: 400 });
      await prisma.linkClick.create({
        data: {
          blockId,
          revisionId,
          sessionId,
          referrer,
          deviceClass,
          country,
        }
      });
    } else {
      return NextResponse.json({ error: "Invalid tracking type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const { linkId, destination } = await req.json();
    
    if (!linkId) {
      return NextResponse.json({ error: "Missing linkId" }, { status: 400 });
    }

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    // Note: In a real app we'd parse the userAgent more robustly.
    const deviceClass = userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone") ? "Mobile" : "Desktop";
    
    let browserFamily = "Other";
    if (userAgent.includes("Chrome") || userAgent.includes("CriOS")) browserFamily = "Chrome";
    else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) browserFamily = "Safari";
    else if (userAgent.includes("Firefox")) browserFamily = "Firefox";
    else if (userAgent.includes("Edge")) browserFamily = "Edge";
    
    const forwardedFor = headersList.get("x-forwarded-for") || "unknown";
    const ip = forwardedFor.split(',')[0].trim();
    const sessionId = `anon-${Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 16)}`;

    // Save click
    await prisma.linkClick.create({
      data: {
        blockId: linkId,
        sessionId,
        deviceClass,
        browserFamily,
        referrer: headersList.get("referer") || undefined,
      }
    });
    
    return NextResponse.json({ success: true, destination });
  } catch (error) {
    console.error("Analytics error:", error);
    // Don't fail the client on analytics errors
    return NextResponse.json({ success: false });
  }
}

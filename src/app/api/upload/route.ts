import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/server/auth";
import { storage } from "@/lib/storage";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdminApi();
    
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Basic validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Store in storage provider
    const url = await storage.upload(buffer, file.name, file.type);
    
    // Save to DB
    const asset = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        url,
        mimeType: file.type,
        size: file.size,
      }
    });

    return NextResponse.json({ success: true, asset });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

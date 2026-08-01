"use server";

import prisma from "@/lib/db";
import { requireAdminApi } from "@/server/auth";
import { saveDraftSchema } from "@/lib/zod";
import { revalidatePath } from "next/cache";

export async function saveDraft(data: unknown) {
  const user = await requireAdminApi();
  const parsed = saveDraftSchema.parse(data);

  // 1. Get current draft revision or create a new one
  const page = await prisma.page.findUniqueOrThrow({ where: { id: parsed.pageId } });
  
  // Find an existing DRAFT revision for this page
  let revision = await prisma.pageRevision.findFirst({
    where: { pageId: page.id, status: "DRAFT" },
  });

  if (!revision) {
    // If no draft exists, create version N+1
    const latestPublished = await prisma.pageRevision.findFirst({
      where: { pageId: page.id, status: "PUBLISHED" },
      orderBy: { version: "desc" },
    });
    const nextVersion = latestPublished ? latestPublished.version + 1 : 1;
    
    revision = await prisma.pageRevision.create({
      data: {
        pageId: page.id,
        version: nextVersion,
        status: "DRAFT",
        createdBy: user.id,
        settingsJson: parsed.settingsJson ? JSON.stringify(parsed.settingsJson) : null,
      },
    });
  } else if (parsed.settingsJson) {
    await prisma.pageRevision.update({
      where: { id: revision.id },
      data: { settingsJson: JSON.stringify(parsed.settingsJson) },
    });
  }

  // 2. Clear old sections/blocks for this draft
  await prisma.pageSection.deleteMany({ where: { revisionId: revision.id } });

  // 3. Insert new sections and blocks safely using validated data
  for (const section of parsed.sections) {
    const createdSection = await prisma.pageSection.create({
      data: {
        revisionId: revision.id,
        type: section.type,
        order: section.order,
        visible: section.visible,
        settingsJson: JSON.stringify(section.settingsJson),
      },
    });

    if (section.blocks && section.blocks.length > 0) {
      await prisma.pageBlock.createMany({
        data: section.blocks.map((block) => ({
          sectionId: createdSection.id,
          type: block.type,
          order: block.order,
          visible: block.visible,
          contentJson: JSON.stringify(block.contentJson),
          styleJson: JSON.stringify(block.styleJson),
        })),
      });
    }
  }

  return { success: true, revisionId: revision.id };
}

export async function publishRevision(revisionId: string) {
  await requireAdminApi();
  
  const revision = await prisma.pageRevision.findUniqueOrThrow({
    where: { id: revisionId },
  });

  // Archive any currently published revisions for this page
  await prisma.pageRevision.updateMany({
    where: { pageId: revision.pageId, status: "PUBLISHED" },
    data: { status: "ARCHIVED" },
  });

  // Mark this revision as published
  await prisma.pageRevision.update({
    where: { id: revisionId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  // Update the parent Page's active pointer
  await prisma.page.update({
    where: { id: revision.pageId },
    data: { publishedRevisionId: revision.id, status: "PUBLISHED" },
  });

  revalidatePath("/");
  return { success: true };
}

import { requireAdminApi } from "@/server/auth";
import prisma from "@/lib/db";
import { BuilderClient } from "@/components/admin/BuilderClient";

export default async function BuilderPage() {
  await requireAdminApi();

  // Find the home page
  const page = await prisma.page.findUniqueOrThrow({
    where: { slug: "home" },
  });

  // Find the latest draft revision, or published if no draft
  let revision = await prisma.pageRevision.findFirst({
    where: { pageId: page.id, status: "DRAFT" },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          blocks: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!revision) {
    revision = await prisma.pageRevision.findFirst({
      where: { pageId: page.id, status: "PUBLISHED" },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            blocks: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
  }

  const rawSections = revision?.sections || [];
  const parsedSections = rawSections.map(section => ({
    ...section,
    settingsJson: section.settingsJson ? JSON.parse(section.settingsJson) : {},
    blocks: section.blocks.map(block => ({
      ...block,
      contentJson: block.contentJson ? JSON.parse(block.contentJson) : {},
      styleJson: block.styleJson ? JSON.parse(block.styleJson) : {}
    }))
  }));

  const initialPageSettings = revision?.settingsJson ? JSON.parse(revision.settingsJson) : {};

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen -m-6 lg:-m-8">
      <BuilderClient initialPageId={page.id} initialSections={parsedSections as any} initialPageSettings={initialPageSettings} />
    </div>
  );
}

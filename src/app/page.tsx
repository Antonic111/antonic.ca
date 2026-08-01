import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/public/PageRenderer";

export default async function HomePage() {
  const page = await prisma.page.findUnique({
    where: { slug: "home" },
  });

  if (!page || page.status !== "PUBLISHED" || !page.publishedRevisionId) {
    // Empty state fallback as requested
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-2xl font-medium tracking-tight">Site coming soon.</h1>
      </main>
    );
  }

  const revision = await prisma.pageRevision.findUnique({
    where: { id: page.publishedRevisionId },
    include: {
      sections: {
        where: { visible: true },
        orderBy: { order: "asc" },
        include: {
          blocks: {
            where: { visible: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!revision || revision.sections.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-2xl font-medium tracking-tight">Site coming soon.</h1>
      </main>
    );
  }

  const pageSettings = revision.settingsJson ? JSON.parse(revision.settingsJson) : {};

  // Parse JSON fields from the database before passing to the renderer
  const parsedSections = revision.sections.map((section) => ({
    ...section,
    settingsJson: section.settingsJson ? JSON.parse(section.settingsJson) : {},
    blocks: section.blocks.map((block) => ({
      ...block,
      contentJson: block.contentJson ? JSON.parse(block.contentJson) : {},
      styleJson: block.styleJson ? JSON.parse(block.styleJson) : {},
    })),
  }));

  return (
    <PageRenderer sections={parsedSections as any} pageSettings={pageSettings} />
  );
}

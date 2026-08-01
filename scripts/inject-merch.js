const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("Missing DATABASE_URL");
    return;
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Fetching home page...");
  const page = await prisma.page.findUnique({ where: { slug: "home" } });
  
  if (!page || !page.publishedRevisionId) {
    console.log("No published home page found.");
    return;
  }

  const revision = await prisma.pageRevision.findUnique({
    where: { id: page.publishedRevisionId },
    include: { sections: true }
  });

  if (!revision) {
    console.log("No revision found.");
    return;
  }

  // Check if FOURTHWALL_MERCH already exists
  const existingMerch = revision.sections.find(s => s.type === "FOURTHWALL_MERCH");
  if (existingMerch) {
    console.log("Fourthwall Merch section already exists in this revision.");
    return;
  }

  // We want it after "Ultimate Dex Tracker" text (Order 6) and before "Ways to Support Me!" (Order 7)
  const targetOrder = 7;

  console.log(`Shifting orders for sections >= ${targetOrder}...`);
  for (const section of revision.sections) {
    if (section.order >= targetOrder) {
      await prisma.pageSection.update({
        where: { id: section.id },
        data: { order: section.order + 1 }
      });
    }
  }

  console.log("Inserting FOURTHWALL_MERCH section...");
  await prisma.pageSection.create({
    data: {
      revisionId: revision.id,
      type: "FOURTHWALL_MERCH",
      order: targetOrder,
      settingsJson: JSON.stringify({ paddingTop: 32, paddingBottom: 32 }),
      visible: true,
    }
  });

  console.log("Successfully injected Fourthwall Merch section!");
}

main().catch(console.error).finally(() => process.exit(0));

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const blocks = await prisma.block.findMany();
  let count = 0;

  for (const block of blocks) {
    if (block.contentJson) {
      let content = block.contentJson;
      let changed = false;

      if (content.includes('Social Links!')) {
        content = content.replace(/Social Links!/g, 'Connect With Me');
        changed = true;
      }
      if (content.includes('My Website!')) {
        content = content.replace(/My Website!/g, 'Featured Project');
        changed = true;
      }
      if (content.includes('Ways To Support Me!')) {
        content = content.replace(/Ways To Support Me!/g, 'Support The Channel');
        changed = true;
      }
      if (content.includes('Ways to Support Me!')) {
        content = content.replace(/Ways to Support Me!/g, 'Support The Channel');
        changed = true;
      }

      if (changed) {
        await prisma.block.update({
          where: { id: block.id },
          data: { contentJson: content }
        });
        count++;
      }
    }
  }

  const drafts = await prisma.pageRevision.findMany();
  for (const draft of drafts) {
    // Note: pageRevisions don't contain the blocks directly, they link to sections which link to blocks.
    // The blocks table update above will cover everything.
  }

  console.log(`Updated ${count} blocks successfully.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as argon2 from "argon2";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@antonic.ca";
  const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminPassword123!";
  const passwordHash = await argon2.hash(rawPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      password: passwordHash,
    },
  });

  console.log(`Admin user seeded: ${admin.email}`);

  // Seed default site settings
  const settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    await prisma.siteSettings.create({
      data: {
        storeUrl: "https://antonic.fourthwall.com",
        seoTitle: "Antonic",
        seoDescription: "Welcome to Antonic's Official Hub",
      },
    });
    console.log("Default site settings created.");
  }

  // Seed initial empty page for builder
  const page = await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      slug: "home",
      title: "Homepage",
      status: "PUBLISHED",
    },
  });
  console.log("Empty homepage created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

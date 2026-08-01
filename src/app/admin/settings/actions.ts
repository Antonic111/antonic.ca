"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { testFourthwallConnection } from "@/lib/fourthwall";

export async function saveSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const fourthwallEnabled = formData.get("fourthwallEnabled") === "true";
  let fourthwallStoreUrl = formData.get("fourthwallStoreUrl")?.toString().trim() || "";
  const fourthwallToken = formData.get("fourthwallToken")?.toString().trim() || "";
  const fourthwallCollection = formData.get("fourthwallCollection")?.toString().trim() || "all";
  const fourthwallLimit = parseInt(formData.get("fourthwallLimit")?.toString() || "4", 10);

  // Normalize URL
  if (fourthwallStoreUrl) {
    if (!fourthwallStoreUrl.startsWith("http")) {
      fourthwallStoreUrl = `https://${fourthwallStoreUrl}`;
    }
    fourthwallStoreUrl = fourthwallStoreUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  // Basic validation
  if (fourthwallLimit < 1 || fourthwallLimit > 8) {
    throw new Error("Display limit must be between 1 and 8.");
  }
  
  if (fourthwallStoreUrl && !fourthwallStoreUrl.startsWith("https://")) {
    throw new Error("Store URL must be a valid HTTPS URL.");
  }

  const existing = await prisma.siteSettings.findFirst();

  if (existing) {
    await prisma.siteSettings.update({
      where: { id: existing.id },
      data: {
        fourthwallEnabled,
        fourthwallStoreUrl,
        fourthwallToken,
        fourthwallCollection,
        fourthwallLimit,
      },
    });
  } else {
    await prisma.siteSettings.create({
      data: {
        fourthwallEnabled,
        fourthwallStoreUrl,
        fourthwallToken,
        fourthwallCollection,
        fourthwallLimit,
      },
    });
  }

  return { success: true };
}

export async function testConnection(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const token = formData.get("fourthwallToken")?.toString().trim();
  const collection = formData.get("fourthwallCollection")?.toString().trim() || "all";

  if (!token) {
    return { success: false, message: "Please enter a Storefront Token to test." };
  }

  const result = await testFourthwallConnection(token, collection);
  return result;
}

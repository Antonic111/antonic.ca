import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { fetchFourthwallProducts } from "@/lib/fourthwall";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings?.fourthwallEnabled || !settings?.fourthwallToken || !settings?.fourthwallStoreUrl) {
      return NextResponse.json({ enabled: false }, { status: 200 });
    }

    const products = await fetchFourthwallProducts(
      settings.fourthwallStoreUrl,
      settings.fourthwallToken,
      settings.fourthwallCollection || "all"
    );

    let finalProducts = products;

    return NextResponse.json({
      enabled: true,
      storeUrl: settings.fourthwallStoreUrl,
      products: finalProducts,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=450',
      }
    });

  } catch (error: any) {
    console.error("Fourthwall API route error:", error);
    return NextResponse.json({ error: "Failed to fetch merch", details: error.message }, { status: 500 });
  }
}

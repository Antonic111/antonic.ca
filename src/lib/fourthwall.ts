import { unstable_cache } from "next/cache";

export interface FourthwallProduct {
  id: string;
  name: string;
  description?: string;
  url: string;
  images: Array<{ url: string; alt?: string }>;
  price: {
    value: string;
    currency: string;
  };
  compareAtPrice?: {
    value: string;
    currency: string;
  };
  available: boolean;
}

interface FourthwallResponse {
  results: FourthwallProduct[];
}

export async function fetchFourthwallProducts(
  storeUrl: string,
  token: string,
  collection: string = "all"
): Promise<FourthwallProduct[]> {
  if (!token || !storeUrl) {
    throw new Error("Missing Fourthwall credentials");
  }

  const endpoint = `https://storefront-api.fourthwall.com/v1/collections/${collection}/products?storefront_token=${token}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 900 }, // 15 minutes cache
      signal: AbortSignal.timeout(8000), // 8 second timeout
    });

    if (!response.ok) {
      console.error(`Fourthwall API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Fourthwall API Error: ${response.status}`);
    }

    const data: FourthwallResponse = await response.json();
    
    if (!data || !Array.isArray(data.results)) {
      console.error("Fourthwall returned:", data);
      throw new Error(`Invalid response format from Fourthwall: ${JSON.stringify(data)}`);
    }

    // Map Fourthwall structure to our FourthwallProduct interface
    const mappedProducts: FourthwallProduct[] = data.results.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      url: `${storeUrl.replace(/\/$/, '')}/products/${p.slug}`,
      images: p.images || [],
      price: p.variants?.[0]?.unitPrice || { value: 0, currency: "USD" },
      compareAtPrice: p.variants?.[0]?.compareAtPrice,
      available: p.state?.type === "AVAILABLE" && p.access?.type === "PUBLIC",
    }));

    // Filter to only available products with valid data
    const validProducts = mappedProducts.filter(
      (p) => p.name && p.url && p.images && p.images.length > 0 && p.price && p.available
    );

    return validProducts;
  } catch (error) {
    console.error("Fourthwall Fetch Error:", error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
}

export async function testFourthwallConnection(
  token: string,
  collection: string = "all"
): Promise<{ success: boolean; message: string; count?: number }> {
  const endpoint = `https://storefront-api.fourthwall.com/v1/collections/${collection}/products?storefront_token=${token}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { success: false, message: "Invalid Storefront token." };
      }
      if (response.status === 404) {
        return { success: false, message: "Collection not found. Are you sure the handle is correct?" };
      }
      return { success: false, message: `API error (${response.status}). Please try again.` };
    }

    const data: FourthwallResponse = await response.json();
    
    if (!data || !Array.isArray(data.results)) {
      return { success: false, message: "Received malformed data from Fourthwall." };
    }

    return { 
      success: true, 
      message: "Connection successful!", 
      count: data.results.length 
    };
  } catch (error) {
    return { success: false, message: "Connection failed or timed out. Check your token and collection handle." };
  }
}

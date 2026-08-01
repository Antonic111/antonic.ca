/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import { fetchFourthwallProducts, testFourthwallConnection } from "../../src/lib/fourthwall";

global.fetch = vi.fn();

describe("Fourthwall Integration", () => {
  it("should fail when credentials are missing", async () => {
    await expect(fetchFourthwallProducts("", "")).rejects.toThrow("Missing Fourthwall credentials");
  });

  it("testConnection should handle invalid token (401/403)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    const result = await testFourthwallConnection("invalid_token");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Invalid Storefront token.");
  });

  it("testConnection should handle missing collection (404)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);

    const result = await testFourthwallConnection("valid_token", "invalid_collection");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Collection not found.");
  });

  it("testConnection should return success and count for valid data", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: "1",
            name: "Test Shirt",
            slug: "test-shirt",
            images: [{ url: "image.png" }],
            variants: [{ unitPrice: { value: "20.00", currency: "USD" } }],
            state: { type: "AVAILABLE" },
            access: { type: "PUBLIC" }
          }
        ]
      }),
    } as Response);

    const result = await testFourthwallConnection("valid_token");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Connection successful!");
    expect(result.count).toBe(1);
  });

  it("fetchFourthwallProducts should filter out unavailable or malformed products", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            // Valid product
            id: "1",
            name: "Valid Shirt",
            slug: "test-shirt-1",
            images: [{ url: "image1.png" }],
            variants: [{ unitPrice: { value: "20.00", currency: "USD" } }],
            state: { type: "AVAILABLE" },
            access: { type: "PUBLIC" }
          },
          {
            // Unavailable product
            id: "2",
            name: "Unavailable Shirt",
            slug: "test-shirt-2",
            images: [{ url: "image2.png" }],
            variants: [{ unitPrice: { value: "20.00", currency: "USD" } }],
            state: { type: "UNAVAILABLE" },
            access: { type: "PUBLIC" }
          },
          {
            // Malformed product (missing slug and images)
            id: "3",
            name: "Malformed Shirt",
            images: [],
            variants: [{ unitPrice: { value: "20.00", currency: "USD" } }],
            state: { type: "AVAILABLE" },
            access: { type: "PUBLIC" }
          }
        ]
      }),
    } as Response);

    const products = await fetchFourthwallProducts("https://shop.com", "valid_token");
    expect(products.length).toBe(1);
    expect(products[0].name).toBe("Valid Shirt");
  });
});

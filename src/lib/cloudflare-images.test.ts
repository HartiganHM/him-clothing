import { describe, it, expect, vi, beforeEach } from "vitest";

describe("cloudflareImageUrl", () => {
  beforeEach(() => {
    vi.stubEnv("PUBLIC_CF_IMAGES_HASH", "test-hash");
  });

  it("returns the canonical delivery URL for a given id and variant", async () => {
    const { cloudflareImageUrl } = await import("./cloudflare-images");
    expect(cloudflareImageUrl("abc-123", "hero")).toBe(
      "https://imagedelivery.net/test-hash/abc-123/public"
    );
  });

  it("throws a clear error when the env var is missing", async () => {
    vi.stubEnv("PUBLIC_CF_IMAGES_HASH", "");
    const { cloudflareImageUrl } = await import("./cloudflare-images");
    expect(() => cloudflareImageUrl("abc", "hero")).toThrow(
      /PUBLIC_CF_IMAGES_HASH is not set/
    );
  });
});

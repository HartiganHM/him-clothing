import { describe, it, expect, vi } from "vitest";
import { uploadOne } from "./upload-photos";

function mockJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function mockTextResponse(body: string, status = 200): Response {
  return new Response(body, { status });
}

describe("uploadOne", () => {
  it("posts to Cloudflare and returns the image id", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      mockJsonResponse({ result: { id: "img-xyz" } })
    );

    const id = await uploadOne({
      accountId: "acct",
      apiToken: "token",
      filename: "a.jpg",
      body: Buffer.from("fake"),
      fetchImpl,
    });
    expect(id).toBe("img-xyz");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/acct/images/v1",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("throws when Cloudflare returns a non-ok response", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      mockTextResponse("unauthorized", 401)
    );

    await expect(
      uploadOne({
        accountId: "acct",
        apiToken: "bad",
        filename: "a.jpg",
        body: Buffer.from("fake"),
        fetchImpl,
      })
    ).rejects.toThrow(/401 unauthorized/);
  });

  it("throws when the response shape is missing an id", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      mockJsonResponse({ result: {} })
    );

    await expect(
      uploadOne({
        accountId: "acct",
        apiToken: "token",
        filename: "a.jpg",
        body: Buffer.from("fake"),
        fetchImpl,
      })
    ).rejects.toThrow(/no image id/);
  });
});

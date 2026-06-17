#!/usr/bin/env tsx
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, extname, basename } from "node:path";
import { z } from "zod";

interface UploadResult {
  filename: string;
  imageId: string;
}

const CloudflareUploadResponseSchema = z.object({
  result: z.object({ id: z.string() }).optional(),
});

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} must be set in the environment.`);
  }
  return value;
}

export async function uploadOne(args: {
  accountId: string;
  apiToken: string;
  filename: string;
  body: Buffer;
  fetchImpl?: typeof fetch;
}): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(args.body)]), args.filename);

  const fetcher = args.fetchImpl ?? fetch;
  const res = await fetcher(
    `https://api.cloudflare.com/client/v4/accounts/${args.accountId}/images/v1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${args.apiToken}` },
      body: form,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed for ${args.filename}: ${res.status} ${text}`);
  }

  const parsed = CloudflareUploadResponseSchema.safeParse(await res.json());
  if (!parsed.success || !parsed.data.result?.id) {
    throw new Error(`Upload for ${args.filename} returned no image id.`);
  }
  return parsed.data.result.id;
}

export function listImageFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = resolve(dir, entry);
    if (statSync(full).isFile() && IMAGE_EXTS.has(extname(entry).toLowerCase())) {
      files.push(full);
    }
  }
  return files.sort();
}

async function main(): Promise<void> {
  const dir = process.argv[2];
  if (!dir) {
    console.error("Usage: tsx scripts/upload-photos.ts <directory>");
    process.exit(1);
  }
  const accountId = requireEnv("CLOUDFLARE_ACCOUNT_ID");
  const apiToken = requireEnv("CLOUDFLARE_IMAGES_API_TOKEN");
  const files = listImageFiles(resolve(dir));
  const results: UploadResult[] = [];
  for (const file of files) {
    const body = readFileSync(file);
    const name = basename(file);
    const id = await uploadOne({ accountId, apiToken, filename: name, body });
    results.push({ filename: name, imageId: id });
    console.error(`uploaded ${name} → ${id}`);
  }
  console.log(JSON.stringify(results, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

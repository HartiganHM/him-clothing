#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "yaml";

interface ProductInput {
  slug: string;
  name: string;
  line: string;
  category:
    | "bow tie"
    | "necktie"
    | "pocket square"
    | "lapel flower"
    | "tie bar"
    | "wallet";
  year: number;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = resolve(__dirname, "..", "src", "content", "products");

function isProductInput(value: unknown): value is ProductInput {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.slug === "string" &&
    typeof obj.name === "string" &&
    typeof obj.line === "string" &&
    typeof obj.category === "string" &&
    typeof obj.year === "number"
  );
}

export function generateStub(input: ProductInput): string {
  return stringify({
    slug: input.slug,
    name: input.name,
    line: input.line,
    category: input.category,
    year: input.year,
    hero: false,
    materials: [],
    photos: ["TODO-upload-and-paste-id"],
  });
}

export function runStubGenerator(args: {
  inputJsonPath: string;
  force: boolean;
  outDir: string;
}): { written: string[]; skipped: string[] } {
  const raw = readFileSync(args.inputJsonPath, "utf-8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Input JSON must be an array of product records.");
  }
  const records = parsed.filter(isProductInput);
  if (records.length !== parsed.length) {
    throw new Error(
      `Input JSON contains ${parsed.length - records.length} invalid records.`
    );
  }

  mkdirSync(args.outDir, { recursive: true });

  const written: string[] = [];
  const skipped: string[] = [];

  for (const record of records) {
    const path = resolve(args.outDir, `${record.slug}.yaml`);
    if (existsSync(path) && !args.force) {
      skipped.push(path);
      continue;
    }
    writeFileSync(path, generateStub(record), "utf-8");
    written.push(path);
  }

  return { written, skipped };
}

// CLI entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  const inputJsonPath = process.argv[2];
  const force = process.argv.includes("--force");
  if (!inputJsonPath) {
    console.error("Usage: tsx scripts/generate-product-stubs.ts <input.json> [--force]");
    process.exit(1);
  }
  const result = runStubGenerator({
    inputJsonPath,
    force,
    outDir: PRODUCTS_DIR,
  });
  console.log(`Wrote ${result.written.length} files; skipped ${result.skipped.length}.`);
}

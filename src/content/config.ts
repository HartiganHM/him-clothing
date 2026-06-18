/**
 * Content collection schemas (Astro 5 Content Layer).
 *
 * Convention:
 * - Entry IDs come from the filename stem (everything before `.yaml` / `.mdx`).
 * - `reference("products")` and `getCollection()` use entry IDs, NOT the `slug`
 *   field defined in the product schema.
 * - The `slug` field on products is used for URL routing only (`/products/<slug>`).
 * - For real (non-sample) product files, filename stem === slug, so there's only
 *   one source of truth. Sample files use a `_sample-` prefix that intentionally
 *   diverges from the slug field so they're easy to spot and delete before launch.
 *
 * If you add a new product file, name it `<slug>.yaml` where `<slug>` matches the
 * `slug:` field inside, and reference it from weddings as just `<slug>`.
 */

import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

const productCategories = [
  "bow tie",
  "necktie",
  "pocket square",
  "lapel flower",
  "tie bar",
  "wallet",
] as const;

const products = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/products" }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    line: z.string(),
    category: z.enum(productCategories),
    year: z.number().int().min(2014).max(2018),
    hero: z.boolean().default(false),
    materials: z.array(z.string()).default([]),
    description: z.string().optional(),
    photos: z.array(z.string()).min(1),
    credits: z
      .object({
        designer: z.string().optional(),
        photographer: z.string().optional(),
        maker: z.string().optional(),
      })
      .optional(),
  }),
});

const weddings = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/weddings" }),
  schema: z.object({
    slug: z.string(),
    customerName: z.string().optional(),
    year: z.number().int().min(2014).max(2030),
    location: z.string().optional(),
    productsWorn: z.array(reference("products")).default([]),
    caption: z.string().optional(),
    photos: z.array(z.string()).min(1),
  }),
});

const credit = z.object({
  name: z.string(),
  contribution: z.string(),
});

const story = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/story" }),
  schema: z.object({
    title: z.string(),
    order: z.number().int().min(1).max(6),
    credits: z.array(credit).optional(),
  }),
});

export const collections = { products, weddings, story };

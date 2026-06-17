export type PhotoVariant = "hero" | "card" | "thumbnail" | "detail";

const VARIANT_NAMES: Record<PhotoVariant, string> = {
  hero: "public", // Cloudflare's default "public" variant — replace with custom variants in the CF dashboard later
  card: "public",
  thumbnail: "public",
  detail: "public",
};

function accountHash(): string {
  const hash = import.meta.env.PUBLIC_CF_IMAGES_HASH;
  if (typeof hash !== "string" || hash.length === 0) {
    throw new Error(
      "PUBLIC_CF_IMAGES_HASH is not set. Add it to .env or .env.local."
    );
  }
  return hash;
}

export function cloudflareImageUrl(
  id: string,
  variant: PhotoVariant
): string {
  return `https://imagedelivery.net/${accountHash()}/${id}/${VARIANT_NAMES[variant]}`;
}

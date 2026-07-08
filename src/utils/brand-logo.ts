import { existsSync } from 'node:fs';

const BRAND_LOGO_EXTS = ['svg', 'png', 'webp'] as const;

// Enseignes qui partagent le même logo qu'une autre enseigne.
const BRAND_LOGO_ALIASES: Record<string, string> = {
  'total-access': 'total',
  'total-excellium': 'total',
  'totalenergies-access': 'total',
};

export function resolveBrandLogo(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const resolved = BRAND_LOGO_ALIASES[slug] ?? slug;
  for (const ext of BRAND_LOGO_EXTS) {
    if (existsSync(`public/images/brands/${resolved}.${ext}`)) {
      return `/images/brands/${resolved}.${ext}`;
    }
  }
  return null;
}

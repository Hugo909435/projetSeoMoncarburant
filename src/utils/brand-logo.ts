import { existsSync } from 'node:fs';

// Formats acceptés pour un logo d'enseigne, par ordre de préférence
// (vectoriel d'abord, puis raster fourni).
const BRAND_LOGO_EXTS = ['svg', 'png', 'webp'] as const;

/**
 * Résout au build le chemin public du logo d'une enseigne selon le format
 * réellement présent dans public/images/brands/. Retourne null si aucun
 * fichier n'existe (l'appelant affiche alors le nom en texte).
 */
export function resolveBrandLogo(slug: string | null | undefined): string | null {
  if (!slug) return null;
  for (const ext of BRAND_LOGO_EXTS) {
    if (existsSync(`public/images/brands/${slug}.${ext}`)) {
      return `/images/brands/${slug}.${ext}`;
    }
  }
  return null;
}

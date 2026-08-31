import { existsSync, readFileSync } from 'node:fs';

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

interface Dimensions {
  width: number;
  height: number;
}

function svgDimensions(content: string): Dimensions | null {
  const viewBox = content.match(
    /viewBox=["']\s*[\d.\-eE]+[\s,]+[\d.\-eE]+[\s,]+([\d.\-eE]+)[\s,]+([\d.\-eE]+)\s*["']/
  );
  if (viewBox) {
    const width = parseFloat(viewBox[1]);
    const height = parseFloat(viewBox[2]);
    if (width > 0 && height > 0) return { width, height };
  }
  const widthAttr = content.match(/\bwidth=["']([\d.]+)/);
  const heightAttr = content.match(/\bheight=["']([\d.]+)/);
  if (widthAttr && heightAttr) {
    const width = parseFloat(widthAttr[1]);
    const height = parseFloat(heightAttr[1]);
    if (width > 0 && height > 0) return { width, height };
  }
  return null;
}

// Décode le header IHDR (largeur/hauteur en big-endian aux octets 16 et 20).
function pngDimensions(buf: Buffer): Dimensions | null {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return width > 0 && height > 0 ? { width, height } : null;
}

// Dimensions intrinsèques du logo, pour poser width/height sur l'<img> et
// éviter un CLS : le logo est affiché à une hauteur CSS fixe (width: auto),
// le navigateur ne peut réserver la bonne largeur avant chargement que s'il
// connaît le ratio d'aspect via les attributs HTML.
export function getBrandLogoDimensions(publicPath: string): Dimensions | null {
  const filePath = `public${publicPath}`;
  if (!existsSync(filePath)) return null;
  try {
    if (filePath.endsWith('.svg')) return svgDimensions(readFileSync(filePath, 'utf-8'));
    if (filePath.endsWith('.png')) return pngDimensions(readFileSync(filePath));
  } catch {
    return null;
  }
  return null;
}

#!/usr/bin/env node
/**
 * Image de une de l'article /blog/faire-le-plein-a-l-etranger-frontaliers/.
 *
 * Graphique divergent : gain ou surcoût sur un plein, face au prix des stations
 * françaises de la bande frontalière. Les valeurs proviennent de
 * frontier-comparison.json, produit par frontier-prices.js. Rien n'est écrit en
 * dur ici : régénérer l'image après avoir mis à jour les prix suffit à la
 * remettre d'aplomb.
 *
 *   npm run frontier && npm run frontier:chart
 *
 * Le visuel sert aussi d'image Open Graph : un partage affiche donc directement
 * le résultat de l'étude, pas une photo de station générique.
 *
 * Palette dérivée des couleurs du site et vérifiée avant usage : écart suffisant
 * entre les deux pôles pour les daltonismes protan et tritan. L'orange passe sous
 * 3:1 de contraste sur fond blanc, ce qui impose de garder les valeurs écrites en
 * toutes lettres à côté de chaque barre. Ne pas les retirer.
 *
 * Usage : node scripts/build-frontier-chart.js [--fuel Gazole]
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const IN = resolve(ROOT, 'src/data/fuel/frontier-comparison.json');
const OUT = resolve(ROOT, 'public/images/articles/faire-le-plein-a-l-etranger-frontaliers.webp');

const fuelArg = process.argv.indexOf('--fuel');
const FUEL = fuelArg > -1 ? process.argv[fuelArg + 1] : 'Gazole';
const FUEL_LABEL = { Gazole: 'de gazole', E10: "d'essence E10", SP95: 'de SP95', SP98: 'de SP98' };

const W = 1200, H = 1600;
const C = {
  bg: '#FFFFFF', ink: '#0F2D3F', muted: '#6B7280',
  gain: '#1B7F5A', loss: '#E87722', rule: '#E5E7EB', axis: '#9CA3AF',
};
const FONT = 'Liberation Sans, DejaVu Sans, Helvetica, Arial, sans-serif';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const eur = (n) => (n < 0 ? '−' : '+') + Math.abs(n).toFixed(2).replace('.', ',') + ' €';

/** Barre à bouts arrondis côté donnée, bord droit contre la ligne du zéro. */
function barPath(x0, x1, y, h, r = 4) {
  if (x1 >= x0) return `M${x0},${y} H${x1 - r} Q${x1},${y} ${x1},${y + r} V${y + h - r} Q${x1},${y + h} ${x1 - r},${y + h} H${x0} Z`;
  return `M${x0},${y} H${x1 + r} Q${x1},${y} ${x1},${y + r} V${y + h - r} Q${x1},${y + h} ${x1 + r},${y + h} H${x0} Z`;
}

const data = JSON.parse(readFileSync(IN, 'utf8'));
const rowsData = data.borders
  .filter((b) => b.fuels[FUEL])
  .map((b) => ({ pays: b.country, v: b.fuels[FUEL].perTank }))
  .sort((a, b) => b.v - a.v);

if (!rowsData.length) throw new Error(`Aucune donnée pour le carburant ${FUEL}`);

const maxGain = Math.max(...rowsData.map((d) => d.v), 0);
const maxLoss = Math.min(...rowsData.map((d) => d.v), 0);

// La ligne du zéro laisse à gauche de quoi écrire la plus grande perte,
// et à droite de quoi écrire la plus grande valeur au bout de sa barre.
const zeroX = 330, rightLimit = 940;
const scale = maxGain > 0 ? (rightLimit - zeroX) / maxGain : 21;
const rowH = 142, y0 = 430, barH = 46;

let rows = '';
rowsData.forEach((d, i) => {
  const yTop = y0 + i * rowH;
  const yBar = yTop + 34;
  const x1 = zeroX + d.v * scale;
  const gain = d.v >= 0;
  rows += `
  <text x="90" y="${yTop + 24}" font-family="${FONT}" font-size="35" font-weight="700" fill="${C.ink}">${esc(d.pays)}</text>
  <path d="${barPath(zeroX, x1, yBar, barH)}" fill="${gain ? C.gain : C.loss}"/>
  <text x="${gain ? x1 + 18 : x1 - 18}" y="${yBar + 33}" font-family="${FONT}" font-size="33" font-weight="700"
        fill="${C.ink}" text-anchor="${gain ? 'start' : 'end'}">${eur(d.v)}</text>`;
});

const axisTop = y0 + 18;
const axisBot = y0 + (rowsData.length - 1) * rowH + 34 + barH + 16;
const stamp = new Date(data.foreignPricesUpdatedAt + 'T00:00:00Z').toLocaleDateString('fr-FR', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).toUpperCase();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>

  <text x="90" y="88" font-family="${FONT}" font-size="23" font-weight="700" fill="${C.muted}" letter-spacing="2.5">MON-CARBURANT.COM  ·  ${esc(stamp)}</text>

  <text x="90" y="176" font-family="${FONT}" font-size="66" font-weight="700" fill="${C.ink}">Faire le plein</text>
  <text x="90" y="250" font-family="${FONT}" font-size="66" font-weight="700" fill="${C.ink}">à l'étranger ?</text>

  <text x="90" y="308" font-family="${FONT}" font-size="30" fill="${C.muted}">Gain ou surcoût sur un plein de ${data.tankLitres} L ${FUEL_LABEL[FUEL] ?? ''},</text>
  <text x="90" y="348" font-family="${FONT}" font-size="30" fill="${C.muted}">face aux stations françaises de la bande frontalière.</text>

  <line x1="90" y1="386" x2="${W - 90}" y2="386" stroke="${C.rule}" stroke-width="2"/>

  <rect x="90" y="${y0 - 42}" width="22" height="22" rx="4" fill="${C.gain}"/>
  <text x="122" y="${y0 - 24}" font-family="${FONT}" font-size="25" fill="${C.muted}">Économie</text>
  <rect x="270" y="${y0 - 42}" width="22" height="22" rx="4" fill="${C.loss}"/>
  <text x="302" y="${y0 - 24}" font-family="${FONT}" font-size="25" fill="${C.muted}">Surcoût</text>

  <line x1="${zeroX}" y1="${axisTop}" x2="${zeroX}" y2="${axisBot}" stroke="${C.axis}" stroke-width="2"/>
  ${rows}

  <line x1="90" y1="1487" x2="${W - 90}" y2="1487" stroke="${C.rule}" stroke-width="2"/>
  <text x="90" y="1528" font-family="${FONT}" font-size="22" fill="${C.muted}">Sources : prix-carburants.gouv.fr, prix maximums officiels Luxembourg</text>
  <text x="90" y="1558" font-family="${FONT}" font-size="22" fill="${C.muted}">et Belgique, TCS, bulletin pétrolier de la Commission européenne.</text>
</svg>`;

const info = await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(OUT);
console.log(`Image écrite : ${OUT.replace(ROOT + '/', '')} (${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} Ko)`);
console.log(`Carburant : ${FUEL} · ${rowsData.length} frontières · prix étrangers du ${data.foreignPricesUpdatedAt}`);
console.log("Pensez à vérifier que le texte alternatif de l'article correspond toujours aux valeurs affichées.");

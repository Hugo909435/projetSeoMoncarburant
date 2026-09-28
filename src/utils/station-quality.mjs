/**
 * Qualité d'une fiche station, et décision d'indexation.
 *
 * Toutes les stations ont une page : elle reste utile à un visiteur qui cherche
 * cette adresse précise. Mais toutes ne méritent pas d'être proposées à
 * l'indexation. Une station qui n'affiche aucun prix, ou dont la dernière
 * déclaration remonte à trois mois, produit une page sans substance qui ne peut
 * que tirer vers le bas l'évaluation de l'ensemble.
 *
 * Le site applique déjà ce principe aux pages ville et département de moins de
 * 3 stations (voir astro.config.mjs). Cette règle-ci est la déclinaison station.
 *
 * Module en .mjs délibérément : il est importé à la fois par le composant Astro
 * et par astro.config.mjs, qui ne passe pas par TypeScript. Une seule
 * définition, donc aucun risque qu'une page soit noindex mais reste au sitemap.
 */

/** Au-delà de ce délai, le prix affiché n'est plus une information fiable. */
export const STALE_DAYS = 90;

/**
 * En dessous de ce nombre de carburants cotés, la page n'a rien à comparer.
 *
 * Un seul prix frais suffit : la fiche porte aussi l'adresse, les horaires, les
 * services, le rang dans la commune et les stations voisines. Le seuil était à
 * 2, mais le flux officiel retire régulièrement un carburant d'une station d'un
 * relevé à l'autre (plusieurs dizaines de stations TotalEnergies ne déclaraient
 * plus que le gazole le 14/09/2026). Ces fiches basculaient alors en noindex
 * puis revenaient, et Google les excluait de l'index.
 */
export const MIN_FUELS = 1;

/**
 * Une rupture déclarée depuis moins de ce délai compte comme une information.
 *
 * Depuis le 28/09/2026, le prix d'un carburant en rupture n'est plus affiché
 * (scripts/fetch-fuel-data.js). Une station à sec sur tous ses carburants n'a
 * donc plus aucun prix ni date de déclaration : sans cette règle, sa fiche
 * basculait en noindex pendant la pénurie puis revenait, le va-et-vient que
 * MIN_FUELS cherche justement à éviter. Or la fiche est utile à ce moment-là,
 * puisqu'elle affiche la rupture.
 */
export const RUPTURE_DAYS = 30;

/** Ruptures récentes : { carburant: horodatage }. Heure de Paris, précision suffisante ici. */
function recentRuptures(station, now) {
  const out = {};
  for (const [fuel, when] of Object.entries(station?.ruptures ?? {})) {
    const t = Date.parse(`${when}:00Z`);
    if (Number.isFinite(t) && (now - t) / 86400000 <= RUPTURE_DAYS) out[fuel] = t;
  }
  return out;
}

/** Nombre de carburants renseignés : prix déclaré ou rupture récente. */
function informedFuels(station, now) {
  const fuels = new Set(Object.entries(station?.prices ?? {}).filter(([, v]) => v != null).map(([k]) => k));
  for (const fuel of Object.keys(recentRuptures(station, now))) fuels.add(fuel);
  return fuels.size;
}

/** Dernière déclaration connue : prix, ou à défaut rupture récente. */
function lastDeclaration(station, now) {
  const declared = station?.maj ? new Date(station.maj).getTime() : NaN;
  const ruptures = Object.values(recentRuptures(station, now));
  const candidates = [declared, ...ruptures].filter(Number.isFinite);
  return candidates.length ? Math.max(...candidates) : NaN;
}

/**
 * Vrai si la fiche est trop pauvre pour être proposée à l'indexation.
 *
 * @param {{ prices?: Record<string, number>, adresse?: string|null, maj?: string|null }} station
 * @param {number} [now] horodatage de référence, injectable pour les tests
 */
export function isWeakStation(station, now = Date.now()) {
  if (informedFuels(station, now) < MIN_FUELS) return true;

  const adresse = (station?.adresse ?? '').trim();
  if (adresse.length < 5) return true;

  const declared = lastDeclaration(station, now);
  if (Number.isNaN(declared)) return true;
  if ((now - declared) / 86400000 > STALE_DAYS) return true;

  return false;
}

/** Raison lisible du noindex, pour le diagnostic. */
export function weaknessReason(station, now = Date.now()) {
  if (informedFuels(station, now) < MIN_FUELS) {
    return MIN_FUELS === 1 ? 'aucun carburant coté' : `moins de ${MIN_FUELS} carburants cotés`;
  }
  if ((station?.adresse ?? '').trim().length < 5) return 'adresse inexploitable';
  const declared = lastDeclaration(station, now);
  if (Number.isNaN(declared)) return station?.maj ? 'date de déclaration illisible' : 'aucune date de déclaration';
  const days = (now - declared) / 86400000;
  if (days > STALE_DAYS) return `déclaration vieille de ${Math.round(days)} jours`;
  return null;
}

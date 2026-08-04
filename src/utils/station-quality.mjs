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

/** En dessous de ce nombre de carburants cotés, la page n'a rien à comparer. */
export const MIN_FUELS = 2;

/**
 * Vrai si la fiche est trop pauvre pour être proposée à l'indexation.
 *
 * @param {{ prices?: Record<string, number>, adresse?: string|null, maj?: string|null }} station
 * @param {number} [now] horodatage de référence, injectable pour les tests
 */
export function isWeakStation(station, now = Date.now()) {
  const fuels = Object.values(station?.prices ?? {}).filter((v) => v != null);
  if (fuels.length < MIN_FUELS) return true;

  const adresse = (station?.adresse ?? '').trim();
  if (adresse.length < 5) return true;

  if (!station?.maj) return true;
  const declared = new Date(station.maj).getTime();
  if (Number.isNaN(declared)) return true;
  if ((now - declared) / 86400000 > STALE_DAYS) return true;

  return false;
}

/** Raison lisible du noindex, pour le diagnostic. */
export function weaknessReason(station, now = Date.now()) {
  const fuels = Object.values(station?.prices ?? {}).filter((v) => v != null);
  if (fuels.length < MIN_FUELS) return `moins de ${MIN_FUELS} carburants cotés`;
  if ((station?.adresse ?? '').trim().length < 5) return 'adresse inexploitable';
  if (!station?.maj) return 'aucune date de déclaration';
  const days = (now - new Date(station.maj).getTime()) / 86400000;
  if (Number.isNaN(days)) return 'date de déclaration illisible';
  if (days > STALE_DAYS) return `déclaration vieille de ${Math.round(days)} jours`;
  return null;
}

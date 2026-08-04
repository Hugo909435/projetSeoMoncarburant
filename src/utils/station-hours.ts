/**
 * Décodage des horaires compacts produits par scripts/fetch-fuel-data.js.
 *
 * Format stocké : tableau de 7 entrées, index 0 = lundi.
 *   "07:00-20:00"              ouvert sur un créneau
 *   "07:00-12:00,14:00-19:00"  ouvert sur deux créneaux
 *   "F"                        fermeture déclarée
 *   null                       jour non renseigné par la station
 */

export const JOURS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const;

const SCHEMA_DAYS = [
  'https://schema.org/Monday',
  'https://schema.org/Tuesday',
  'https://schema.org/Wednesday',
  'https://schema.org/Thursday',
  'https://schema.org/Friday',
  'https://schema.org/Saturday',
  'https://schema.org/Sunday',
] as const;

export interface DayHours {
  day: string;
  /** Créneaux formatés pour l'affichage, ex. ["07:00 - 20:00"]. */
  slots: string[];
  closed: boolean;
  /** La station n'a rien déclaré pour ce jour. */
  unknown: boolean;
}

export function decodeHoraires(horaires: (string | null)[] | null | undefined): DayHours[] | null {
  if (!horaires || horaires.length === 0) return null;

  return JOURS.map((day, i) => {
    const raw = horaires[i] ?? null;
    if (raw == null) return { day, slots: [], closed: false, unknown: true };
    if (raw === 'F') return { day, slots: [], closed: true, unknown: false };
    return {
      day,
      slots: raw.split(',').map((slot) => slot.replace('-', ' - ')),
      closed: false,
      unknown: false,
    };
  });
}

/**
 * Convertit en openingHoursSpecification schema.org.
 *
 * Les jours non renseignés sont omis plutôt que déclarés fermés : annoncer une
 * fermeture qui n'existe pas dans la source serait une information fausse
 * poussée jusque dans les résultats de recherche.
 */
export function horairesToSchema(
  horaires: (string | null)[] | null | undefined,
): Record<string, unknown>[] {
  if (!horaires) return [];

  const specs: Record<string, unknown>[] = [];
  horaires.forEach((raw, i) => {
    if (raw == null || raw === 'F') return;
    for (const slot of raw.split(',')) {
      const [opens, closes] = slot.split('-');
      if (!opens || !closes) continue;
      specs.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: SCHEMA_DAYS[i],
        opens,
        closes,
      });
    }
  });
  return specs;
}

/** Vrai si la station déclare une ouverture continue toute la semaine. */
export function isAlwaysOpen(horaires: (string | null)[] | null | undefined): boolean {
  if (!horaires || horaires.length < 7) return false;
  return horaires.every((h) => h === '00:00-23:59');
}

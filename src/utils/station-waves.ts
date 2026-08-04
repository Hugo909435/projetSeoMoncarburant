import waves from '../data/fuel/station-waves.json';

export interface WaveEntry {
  wave: number;
  path: string;
}

export interface WaveSummary {
  n: number;
  publishAt: string;
  count: number;
  published: boolean;
}

interface WavesFile {
  startDate: string;
  intervalDays: number;
  totalStations: number;
  totalWaves: number;
  lastWaveDate: string;
  waves: WaveSummary[];
  stations: Record<string, WaveEntry>;
}

const plan = waves as unknown as WavesFile;

/**
 * Date de référence pour décider ce qui est publié.
 *
 * En production c'est le jour du build : le workflow de mise à jour des prix
 * reconstruit le site tous les jours, donc une vague se met en ligne toute
 * seule le jour prévu.
 *
 * Deux échappatoires pour le développement :
 *   STATIONS_ROLLOUT_DATE=2027-03-01  simule une date de build
 *   STATIONS_ROLLOUT_ALL=1            génère les 9 800 pages d'un coup
 *
 * STATIONS_ROLLOUT_ALL sert à relire le gabarit sur des stations de toutes
 * tailles avant qu'elles ne sortent. Ne jamais l'activer sur le build de
 * production : c'est exactement la publication massive que ce système évite.
 */
const ROLLOUT_ALL = process.env.STATIONS_ROLLOUT_ALL === '1';
const TODAY = process.env.STATIONS_ROLLOUT_DATE ?? new Date().toISOString().slice(0, 10);

/**
 * Gel du déploiement.
 *
 * Mettre un numéro de vague ici plafonne ce qui est publié, quelles que soient
 * les dates du calendrier. C'est le bouton d'arrêt à utiliser si un problème est
 * constaté sur les pages station :
 *
 *   4    les vagues 1 à 4 restent en ligne, les suivantes ne sortent pas
 *   0    dépublie toutes les pages station au prochain build
 *   null déploiement normal, piloté par le calendrier
 *
 * Un gel ne modifie pas station-waves.json : le calendrier reste intact et le
 * déploiement reprend exactement où il s'était arrêté dès que la valeur repasse
 * à null.
 */
const FREEZE_AT_WAVE: number | null = null;

/** Numéro de la dernière vague dont la date de publication est atteinte. */
const scheduledWave: number = ROLLOUT_ALL
  ? plan.totalWaves
  : plan.waves.reduce((last, w) => (w.publishAt <= TODAY ? w.n : last), 0);

export const currentWave: number =
  FREEZE_AT_WAVE == null ? scheduledWave : Math.min(scheduledWave, FREEZE_AT_WAVE);

/** Stations publiées à la date du build : id -> { wave, path }. */
export const publishedStations: Map<string, WaveEntry> = new Map(
  Object.entries(plan.stations).filter(([, entry]) => entry.wave <= currentWave),
);

/** URL absolue (chemin) de la page station, ou null si pas encore publiée. */
export function stationUrl(id: string | null | undefined): string | null {
  if (!id) return null;
  const entry = publishedStations.get(String(id));
  return entry ? `/prix-carburants/station/${entry.path}/` : null;
}

export const rolloutMeta = {
  startDate: plan.startDate,
  intervalDays: plan.intervalDays,
  totalStations: plan.totalStations,
  totalWaves: plan.totalWaves,
  lastWaveDate: plan.lastWaveDate,
  currentWave,
  publishedCount: publishedStations.size,
  today: TODAY,
  nextWave: plan.waves.find((w) => w.n === currentWave + 1) ?? null,
};

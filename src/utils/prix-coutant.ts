/**
 * État des opérations carburant à prix coûtant, à la date du build.
 *
 * Deux sources, qui ne disent pas la même chose et ne doivent pas être
 * confondues :
 *
 *  1. src/data/prix-coutant/operations.json : les opérations ANNONCÉES par les
 *     enseignes, saisies à la main. C'est la seule source qui autorise à
 *     écrire qu'une opération a lieu.
 *  2. src/data/fuel/prix-coutant-signals.json : les décrochages MESURÉS dans
 *     l'open data par scripts/detect-prix-coutant.js. C'est un constat de
 *     prix, pas une confirmation : une enseigne peut mener une opération sans
 *     la déclarer au flux (Système U, août 2026), et un décrochage peut
 *     relever d'un réalignement commercial.
 *
 * Ce module est partagé par l'encadré de l'article et le bandeau d'accueil.
 * Deux calculs séparés du même état finiraient par se contredire, ce qui sur
 * ce sujet se verrait immédiatement.
 */
import operationsData from '../data/prix-coutant/operations.json';
import signalsData from '../data/fuel/prix-coutant-signals.json';

export interface Operation {
  id: string;
  brand: string;
  brandName: string;
  type: string;
  status: string;
  start: string;
  end: string;
  stations: number | null;
  fuels: string;
  note: string;
  source: string;
  sourceUrl: string;
  sourceArticle: string;
  /** true seulement si sourceArticle publie la liste nominative des stations,
   *  pas juste leur nombre. Sert à afficher le lien "voir les stations". */
  hasStationList?: boolean;
}

/**
 * Opération limitée à un seul point de vente (anniversaire de magasin,
 * ouverture...). Volontairement typée à part de `Operation` : ces deux objets
 * ne doivent jamais transiter par le même tableau. Une opération d'un magasin
 * affichée au niveau enseigne annoncerait à toute la France une offre valable
 * dans une station sur 577.
 */
export interface OperationLocale {
  id: string;
  brand: string;
  brandName: string;
  type: string;
  status: string;
  start: string;
  end: string;
  /** Identifiant de la station dans l'open data (src/data/fuel/). */
  stationId: string;
  ville: string;
  cp: string;
  adresse: string;
  fuels: string;
  note: string;
  source: string;
  sourceUrl: string;
  sourceArticle: string;
}

export interface Signal {
  brand: string;
  brandName: string;
  stationsDropping: number;
  stationsObserved: number;
  share: number;
  medianDrop: number;
  maxDrop: number;
}

export interface Fenetre {
  label: string;
  from: string;
  to: string;
  note: string;
}

export const PARIS_TZ = 'Europe/Paris';

/** URL de la page de référence, vers laquelle pointent tous les rappels. */
export const PAGE_PRIX_COUTANT = '/prix-coutant-carburant/';

/** Les dates sont manipulées à midi UTC : aucun changement d'heure ne peut
 *  faire basculer un jour. */
export const toDate = (iso: string) => new Date(`${iso}T12:00:00Z`);

const toIso = (d: Date) => d.toISOString().slice(0, 10);

function addDays(iso: string, n: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
}

/**
 * Date du jour côté France. Le build tourne en UTC sur GitHub Actions : sans
 * ce recalage, un run lancé après 22h UTC afficherait encore la veille.
 */
export function aujourdhui(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function etatPrixCoutant() {
  const operations = operationsData.operations as Operation[];
  const fenetres = operationsData.fenetresProbables as Fenetre[];
  const today = aujourdhui();

  // Week-end entendu du vendredi au dimanche : les opérations démarrent
  // souvent le vendredi. Du lundi au jeudi on annonce le week-end à venir, à
  // partir du vendredi celui qui est en cours.
  const dayOfWeek = toDate(today).getUTCDay(); // 0 = dimanche, 6 = samedi
  const weekendStart = addDays(today, dayOfWeek === 0 ? -2 : 5 - dayOfWeek);
  const weekendEnd = addDays(weekendStart, 2);

  // Les dates étant au format AAAA-MM-JJ, la comparaison de chaînes suffit.
  const surLeWeekend = (op: Operation) => op.start <= weekendEnd && op.end >= weekendStart;
  const active = operations.filter(surLeWeekend);

  // Opérations d'un seul magasin. Elles durent souvent bien plus longtemps
  // qu'un week-end (13 jours pour un anniversaire de centre), donc la fenêtre
  // du week-end ne convient pas : on retient celles qui ne sont pas terminées
  // et qui commencent dans la semaine ou ont déjà commencé.
  const horizonLocal = addDays(today, 7);
  const locales = (operationsData.operationsLocales ?? []) as OperationLocale[];

  return {
    today,
    weekendStart,
    weekendEnd,

    /** Opérations locales en cours ou imminentes. Servies uniquement à
     *  /prix-coutant-carburant/, jamais au bandeau site. */
    locales: locales.filter((op) => op.end >= today && op.start <= horizonLocal),

    prixCoutant: active.filter((op) => op.type === 'prix-coutant'),
    plafonnements: active.filter((op) => op.type === 'plafonnement'),
    prochaineFenetre: fenetres.find((f) => f.to >= today),

    /** Opérations annoncées qui couvrent le jour même, et non le week-end à
     *  venir. C'est ce qui justifie un rappel sur toutes les pages du site :
     *  ça se joue maintenant. */
    aujourdhui: operations.filter(
      (op) => op.type === 'prix-coutant' && op.start <= today && op.end >= today,
    ),

    signaux: (signalsData.signals ?? []) as Signal[],
    signalDate: signalsData.generatedAt ? new Date(signalsData.generatedAt) : null,
    verifieLe: operationsData._updatedAt as string,
  };
}

export interface TimelineEntry {
  kind: 'passee' | 'a-venir';
  brand?: string;
  brandName?: string;
  label: string;
  start: string;
  end: string;
  stations: number | null;
  note: string;
}

/**
 * Chronologie complète : opérations prix coûtant déjà passées cette année,
 * puis fenêtres probables à venir. Sert la page /prix-coutant-carburant/, qui
 * affiche un calendrier plutôt que de la prose à réécrire chaque saison.
 */
export function timelinePrixCoutant(): TimelineEntry[] {
  const operations = operationsData.operations as Operation[];
  const fenetres = operationsData.fenetresProbables as Fenetre[];
  const today = aujourdhui();

  const passees: TimelineEntry[] = operations
    .filter((op) => op.type === 'prix-coutant' && op.end < today)
    .map((op) => ({
      kind: 'passee',
      brand: op.brand,
      brandName: op.brandName,
      label: op.brandName,
      start: op.start,
      end: op.end,
      stations: op.stations,
      note: op.note,
    }));

  const aVenir: TimelineEntry[] = fenetres
    .filter((f) => f.to >= today)
    .map((f) => ({
      kind: 'a-venir',
      label: f.label,
      start: f.from,
      end: f.to,
      stations: null,
      note: f.note,
    }));

  return [...passees.sort((a, b) => a.start.localeCompare(b.start)), ...aVenir.sort((a, b) => a.start.localeCompare(b.start))];
}

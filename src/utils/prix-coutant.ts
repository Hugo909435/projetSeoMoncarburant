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
export const PAGE_PRIX_COUTANT =
  '/blog/prix-coutant-carburant-calendrier-leclerc-intermarche-carrefour/';

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

  return {
    today,
    weekendStart,
    weekendEnd,
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

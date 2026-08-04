/**
 * Texte descriptif d'une page station.
 *
 * Deux principes.
 *
 * 1. NE PAS REDIRE LES TABLEAUX. La page affiche déjà une grille de prix, un
 *    comparatif commune/département/national, un classement, une liste de
 *    services, des horaires et un tableau d'enseignes. Paraphraser ces blocs en
 *    prose gonfle le compteur de mots sans rien apprendre, et c'est exactement
 *    ce qui donne à une page l'allure du contenu produit en série. Le texte sert
 *    donc à interpréter, pas à répéter : ce que l'écart de prix représente sur
 *    un plein, ce que le type d'enseigne implique, ce qu'il faut vérifier.
 *
 * 2. DÉTERMINISME. Aucun aléatoire. Le contenu est piloté par les données
 *    réelles et l'ordre par un indice tiré de l'identifiant. Une même station
 *    produit toujours le même texte d'un build à l'autre.
 *
 * Cible : 110 à 140 mots. Volontairement court. Sur ce type de page, la valeur
 * est dans la donnée fraîche, pas dans le volume de prose autour.
 */

export interface StationLike {
  id: string;
  ville: string;
  adresse?: string | null;
  cp?: string;
  enseigne?: string | null;
  enseigneSlug?: string | null;
  pop?: 'autoroute' | 'route' | string;
  prices: Partial<Record<string, number>>;
  maj?: string | null;
}

export interface StationIntroParams {
  station: StationLike;
  services: string[];
  /** Horaires compacts, 7 entrées (index 0 = lundi) : "07:00-20:00", "F" ou null. */
  horaires: (string | null)[] | null;
  automate: boolean;
  cityStats: Partial<Record<string, number>>;
  cityStationCount: number;
  /** Rang de la station sur le Gazole dans sa commune, 1 = la moins chère. */
  cityRankGazole: number | null;
  /** Nombre de stations de la commune qui affichent un prix Gazole. */
  cityRankTotal: number | null;
  deptStats: Partial<Record<string, number>>;
  deptName?: string;
  deptNum?: string;
  deptStationCount?: number;
  nationalStats: Record<string, number>;
}

const fmt = (n: number) => n.toFixed(3);
const cents = (n: number) => Math.round(Math.abs(n) * 100);

/** Volume retenu pour traduire un écart au litre en euros parlants. */
const PLEIN_LITRES = 50;
const surLePlein = (gapPerLitre: number) => (Math.abs(gapPerLitre) * PLEIN_LITRES).toFixed(2);

/**
 * « de » suivi d'un nom de commune, avec l'élision et la contraction correctes.
 *
 * « la moyenne de Abbeville » et « les stations de Le Mans » sont fautifs, et
 * l'erreur se voit d'autant plus qu'elle se répète sur des milliers de pages.
 *
 * L'élision devant h n'est volontairement pas faite : elle dépend du caractère
 * aspiré ou muet du h, qui ne se devine pas sans dictionnaire. « de Honfleur »
 * est correct, « de Hénin-Beaumont » légèrement gauche mais pas fautif, alors
 * qu'une élision systématique produirait « d'Honfleur », qui l'est.
 */
export function deVille(name: string): string {
  if (/^Les\s/i.test(name)) return `des ${name.slice(4)}`;
  if (/^Le\s/i.test(name)) return `du ${name.slice(3)}`;
  if (/^[aeiouyàâäéèêëïîôöûü]/i.test(name)) return `d'${name}`;
  return `de ${name}`;
}

/** « à » suivi d'un nom de commune, avec la contraction correcte. */
export function aVille(name: string): string {
  if (/^Les\s/i.test(name)) return `aux ${name.slice(4)}`;
  if (/^Le\s/i.test(name)) return `au ${name.slice(3)}`;
  return `à ${name}`;
}

function diffPct(local: number, ref: number) {
  return ((local - ref) / ref) * 100;
}

/** Indice de variante 0-3, stable, dérivé de l'identifiant de la station. */
function variantOf(id: string): number {
  return id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % 4;
}

const FUEL_LABEL: Record<string, string> = {
  Gazole: 'Gazole',
  SP95: 'SP95',
  SP98: 'SP98',
  E10: 'E10',
  E85: 'superéthanol E85',
  GPLc: 'GPL',
};

/**
 * Met une étiquette de service en bas de casse sans écraser ses sigles.
 * « Automate CB 24/24 » doit donner « automate CB 24/24 », pas « automate cb 24/24 ».
 */
function decapitalize(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/**
 * Désignation de la station, préfixée par « Station » sauf si l'enseigne
 * commence déjà par ce mot. Trois enseignes du fichier officiel sont dans ce
 * cas ("Station essence Indépendant", "Station service intermarché"), et le
 * préfixe automatique y produisait « Station Station essence Indépendant ».
 */
export function stationDisplayName(s: StationLike): string {
  const brand = s.enseigne && s.enseigne !== 'independent' ? s.enseigne.trim() : null;
  if (!brand) return 'Station-service';
  return /^stations?[\s-]/i.test(brand) ? brand : `Station ${brand}`;
}

/** Titre H1 de la page. */
export function stationHeading(s: StationLike): string {
  const addr = s.adresse ? `, ${s.adresse}` : '';
  return `${stationDisplayName(s)}${addr} à ${s.ville}`;
}

/**
 * Résume les horaires en une phrase. Retourne null si la station ne déclare
 * rien d'exploitable, plutôt que d'inventer une amplitude.
 */
export function summarizeHoraires(horaires: (string | null)[] | null): string | null {
  if (!horaires) return null;
  const declared = horaires.filter((h): h is string => h != null);
  if (declared.length === 0) return null;

  const openDays = declared.filter((h) => h !== 'F');
  if (openDays.length === 0) return null;

  const allSame = openDays.every((h) => h === openDays[0]);
  const closedCount = declared.filter((h) => h === 'F').length;

  if (allSame && openDays[0] === '00:00-23:59' && closedCount === 0 && declared.length === 7) {
    return 'La station est accessible 24 heures sur 24, sept jours sur sept.';
  }

  if (allSame && closedCount === 0 && declared.length === 7) {
    const [open, close] = openDays[0].split('-');
    return `Elle ouvre tous les jours de ${open} à ${close}.`;
  }

  if (allSame) {
    const [open, close] = openDays[0].split('-');
    const label = openDays.length === 6 ? 'six jours sur sept' : `${openDays.length} jours par semaine`;
    return `Elle ouvre ${label}, de ${open} à ${close}.`;
  }

  return `Les horaires varient selon les jours, le détail jour par jour est indiqué plus bas.`;
}

/** Enseignes de grande distribution : modèle tarifaire et contraintes propres. */
const GMS = new Set([
  'leclerc', 'intermarche', 'carrefour', 'super-u', 'auchan', 'casino',
  'netto', 'lidl', 'match', 'spar', 'bi1', 'monoprix', 'cora',
]);

export function buildStationIntro(p: StationIntroParams): string[] {
  const {
    station: s,
    cityStats,
    cityStationCount,
    cityRankGazole,
    cityRankTotal,
    deptStats,
    deptName,
    deptNum,
    deptStationCount,
    nationalStats,
  } = p;

  const v = variantOf(s.id);
  const brand = s.enseigne && s.enseigne !== 'independent' ? s.enseigne : null;
  const deptLabel = deptName && deptNum ? `${deptName} (${deptNum})` : (deptName ?? null);
  const isAutoroute = s.pop === 'autoroute';

  const gazole = s.prices['Gazole'] ?? null;
  const cityGazole = cityStats['Gazole'] ?? null;
  const natGazole = nationalStats['Gazole'] ?? null;

  // ── 1. Où l'on est ─────────────────────────────────────────────────────────

  function pIdentity(): string {
    // « au 12 rue des Lilas » se dit, « au Route de Beaucaire » non : l'article
    // ne fonctionne que devant un numéro de voie.
    const startsWithNumber = !!s.adresse && /^\d/.test(s.adresse.trim());
    const where = s.adresse
      ? startsWithNumber
        ? `au ${s.adresse}`
        : s.adresse
      : aVille(s.ville);

    const cityStr = s.cp ? `${s.ville} (${s.cp})` : s.ville;
    const cityDe = s.cp ? `${deVille(s.ville)} (${s.cp})` : deVille(s.ville);
    const cityA = s.cp ? `${aVille(s.ville)} (${s.cp})` : aVille(s.ville);
    // Apposition : « dans le département Gard » est fautif et le bon article
    // change d'un département à l'autre (le Gard, la Gironde, les Landes, l'Ain).
    const deptStr = deptLabel ? `, département ${deptLabel}` : '';
    const label = brand ? `cette station ${brand}` : 'cette station-service';

    const road = isAutoroute
      ? " Implantée sur le réseau autoroutier, elle s'adresse surtout aux conducteurs en transit."
      : '';

    const forms = [
      `${label.charAt(0).toUpperCase() + label.slice(1)} est située ${where}, ${cityA}${deptStr}.${road}`,
      `Vous trouverez ${label} ${where}, sur la commune ${cityDe}${deptStr}.${road}`,
      cityStationCount > 1
        ? `Installée ${where} ${cityA}${deptStr}, elle est l'une des ${cityStationCount} stations-service de la commune.${road}`
        : `Installée ${where} ${cityA}${deptStr}, elle est la seule station-service de la commune.${road}`,
      `${brand ?? 'Cette station-service'} ${where} dessert la commune ${cityDe}${deptStr}.${road}`,
    ];
    return forms[v];
  }

  // ── 2. Ce que le prix veut dire ────────────────────────────────────────────

  function pPriceReading(): string | null {
    if (gazole == null) {
      const other = Object.keys(s.prices).find((f) => s.prices[f] != null);
      if (!other) {
        return `Cette station n'a pas transmis de tarif lors du dernier relevé officiel. Les stations proches listées plus bas permettent de comparer les prix du secteur.`;
      }
      return `Cette station ne cote pas le Gazole. Le ${FUEL_LABEL[other] ?? other} y est relevé à ${fmt(s.prices[other]!)} €/L, à comparer avec les stations voisines listées plus bas.`;
    }

    const gapCity = cityGazole != null ? gazole - cityGazole : null;
    const rankStr =
      cityRankGazole != null && cityRankTotal != null && cityRankTotal >= 3
        ? `${cityRankGazole}e sur ${cityRankTotal} stations comparées`
        : null;

    // Le seul chiffre qui n'est nulle part ailleurs sur la page : ce que l'écart
    // représente réellement au moment de payer.
    if (gapCity != null && Math.abs(gapCity) >= 0.01) {
      const euros = surLePlein(gapCity);
      if (gapCity < 0) {
        const lead =
          cityRankGazole === 1
            ? `Sur le Gazole, c'est aujourd'hui le tarif le plus bas ${deVille(s.ville)}`
            : `Sur le Gazole, elle se situe sous la moyenne ${deVille(s.ville)}${rankStr ? ` (${rankStr})` : ''}`;
        return `${lead} : ${cents(gapCity)} centimes de moins que la moyenne communale, soit environ ${euros} € d'économie sur un plein de ${PLEIN_LITRES} litres.`;
      }
      return `Le Gazole y est facturé ${cents(gapCity)} centimes au-dessus de la moyenne ${deVille(s.ville)}${rankStr ? `, ce qui la place ${rankStr}` : ''}. Sur un plein de ${PLEIN_LITRES} litres, l'écart représente environ ${euros} € de plus que dans une station moyenne de la commune.`;
    }

    // Le prix aligné sur la moyenne communale est le cas le plus courant : sans
    // variantes, une seule et même phrase couvrirait la moitié du parc.
    const natDiff = natGazole != null ? diffPct(gazole, natGazole) : null;
    const natStr =
      natDiff != null
        ? ` L'écart avec la moyenne nationale est de ${natDiff > 0 ? '+' : ''}${natDiff.toFixed(1)} %.`
        : '';
    const aligned = [
      `Le Gazole y est affiché à ${fmt(gazole)} €/L, au niveau de la moyenne constatée ${aVille(s.ville)}.${natStr}`,
      `À ${fmt(gazole)} €/L, le Gazole s'aligne ici sur la moyenne communale : aucune bonne ni mauvaise surprise à attendre à la pompe.${natStr}`,
      `Le Gazole se négocie ${fmt(gazole)} €/L, un tarif dans la moyenne ${deVille(s.ville)}.${natStr}`,
      `Rien ne distingue vraiment cette station sur le Gazole, affiché à ${fmt(gazole)} €/L comme dans la plupart des stations de la commune.${natStr}`,
    ];
    return aligned[v];
  }

  // ── 3. Ce qu'il faut en faire ──────────────────────────────────────────────

  function pContext(): string {
    const method = [
      `Prix issus du fichier public des carburants, actualisés chaque jour : seul l'affichage en station fait foi.`,
      `Données officielles réactualisées quotidiennement, à vérifier à la pompe avant de faire le plein.`,
      `Tarifs déclarés par la station au dispositif public de transparence, mis à jour chaque jour sur cette page.`,
      `Relevé quotidien issu des données ouvertes du ministère de l'Économie, donné à titre indicatif.`,
    ][v];

    // Deux formulations par cas de figure. Le type d'enseigne détermine le fond
    // du paragraphe, et la grande distribution représente à elle seule près de
    // 40 % du parc : sans alternance, ce texte deviendrait la phrase la plus
    // répétée du site.
    const alt = v % 2;

    if (isAutoroute) {
      return [
        `Les stations d'autoroute pratiquent des tarifs supérieurs de 15 à 25 centimes au réseau ordinaire. Si l'autonomie le permet, une sortie vers une commune voisine reste presque toujours plus économique. ${method}`,
        `Faire le plein sur autoroute se paie : l'écart avec une station de bord de route atteint couramment 15 à 25 centimes par litre, soit près de 10 € sur un plein. Le détour par la sortie la plus proche est vite rentabilisé. ${method}`,
      ][alt];
    }

    if (s.enseigneSlug && GMS.has(s.enseigneSlug)) {
      return [
        `Les enseignes de grande distribution vendent le carburant à faible marge, comme produit d'appel, ce qui les place souvent en tête des classements de prix. En contrepartie, leurs horaires suivent ceux du magasin en dehors de l'automate. ${method}`,
        `Le carburant sert ici de produit d'appel vers le magasin, un modèle qui tire les prix vers le bas mais impose ses contraintes : affluence aux heures de sortie de bureau, et accès calé sur les horaires du centre commercial hors automate. ${method}`,
      ][alt];
    }

    if (!brand) {
      return [
        `Aucun réseau national n'est identifié pour cette station dans les données publiques. Les indépendantes affichent des tarifs très variables d'un point de vente à l'autre : comparer avec les voisines reste le réflexe le plus rentable. ${method}`,
        `Cette station n'est rattachée à aucune enseigne nationale identifiée. Chez les indépendantes, le prix dépend surtout de la concurrence locale : certaines sont les moins chères de leur secteur, d'autres nettement au-dessus. ${method}`,
      ][alt];
    }

    return [
      `Les réseaux comme ${brand} misent moins sur le prix que sur la disponibilité : amplitude horaire large, présence sur les axes, services annexes plus fournis que dans la grande distribution. ${method}`,
      `${brand} appartient aux réseaux traditionnels, dont l'argument n'est pas le tarif mais l'accessibilité : implantation sur les axes, ouverture étendue et services plus complets. Quelques centimes d'écart au litre pèsent tout de même plusieurs euros sur un plein. ${method}`,
    ][alt];
  }

  /**
   * Ce qui distingue vraiment cette station, quand il y a quelque chose.
   *
   * On ne redit pas la grille de prix ni la liste des services : on explique ce
   * que leur présence change. Retourne null quand la station n'a rien de
   * particulier, plutôt que de meubler.
   */
  function pPracticality(): string | null {
    const e85 = s.prices['E85'] ?? null;
    const gpl = s.prices['GPLc'] ?? null;

    if (e85 != null && gpl != null) {
      return `Distribuer à la fois le superéthanol E85 et le GPL reste rare, moins d'une station française sur dix propose l'un ou l'autre : l'adresse est utile à connaître pour ces motorisations.`;
    }
    if (e85 != null) {
      return `La présence du superéthanol E85 vaut le détour pour un véhicule FlexFuel ou équipé d'un boîtier homologué : c'est le carburant le moins cher du marché français.`;
    }
    if (gpl != null) {
      return `Le GPL est encore peu distribué en France, ce qui limite fortement les points de ravitaillement possibles : celui-ci en fait partie.`;
    }
    if (p.horaires && p.horaires.every((h) => h === '00:00-23:59')) {
      return `La station reste accessible à toute heure, ce qui en fait un point de repli commode pour les trajets de nuit ou les départs matinaux.`;
    }
    if (p.automate) {
      return `Un automate carte bancaire prend le relais en dehors des heures d'ouverture de la boutique, le plein reste donc possible la nuit.`;
    }
    return null;
  }

  const paragraphs = [pIdentity(), pPriceReading(), pPracticality(), pContext()].filter(
    (x): x is string => x != null && x.trim() !== '',
  );

  // Repli pour les fiches les plus dépouillées : une station rurale isolée sans
  // Gazole coté descend sous les 100 mots. On ajoute alors le seul cadrage qui
  // ne figure nulle part ailleurs sur la page, l'échelle départementale.
  const wordCount = paragraphs.join(' ').split(/\s+/).length;
  if (wordCount < 85 && deptName) {
    const deptGazole = deptStats['Gazole'] ?? null;
    if (deptGazole != null && deptStationCount) {
      paragraphs.splice(
        paragraphs.length - 1,
        0,
        `À l'échelle du département (${deptName}), le Gazole s'échange en moyenne à ${fmt(deptGazole)} €/L sur les ${deptStationCount} stations que nous suivons. La page départementale permet de les trier par prix.`,
      );
    }
  }

  return paragraphs;
}

/** Trois questions fréquentes, alimentées par les données réelles de la station. */
export function buildStationFaq(p: StationIntroParams): { question: string; answer: string }[] {
  const { station: s, services, horaires, automate, cityStats, cityRankGazole, cityRankTotal } = p;
  const faq: { question: string; answer: string }[] = [];

  const brandLabel = s.enseigne && s.enseigne !== 'independent' ? `${s.enseigne} ` : '';
  const where = s.adresse ? `${s.adresse}, ${s.ville}` : s.ville;

  const gazole = s.prices['Gazole'] ?? null;
  const sp95 = s.prices['SP95'] ?? null;
  const e10 = s.prices['E10'] ?? null;
  const priceBits = [
    gazole != null ? `Gazole à ${fmt(gazole)} €/L` : null,
    sp95 != null ? `SP95 à ${fmt(sp95)} €/L` : null,
    e10 != null ? `E10 à ${fmt(e10)} €/L` : null,
  ].filter(Boolean);

  faq.push({
    question: `Quel est le prix du carburant à la station ${brandLabel}de ${where} ?`,
    answer:
      priceBits.length > 0
        ? `Lors du dernier relevé, la station affichait ${priceBits.join(', ')}. Ces tarifs proviennent du fichier officiel des prix des carburants et sont actualisés chaque jour sur cette page.`
        : `Cette station n'a pas transmis de tarif lors du dernier relevé officiel. Consultez la page de la commune pour voir les stations ${deVille(s.ville)} qui communiquent leurs prix.`,
  });

  if (cityRankGazole != null && cityRankTotal != null && cityRankTotal >= 3) {
    faq.push({
      question: `Cette station est-elle moins chère que les autres ${aVille(s.ville)} ?`,
      answer:
        cityRankGazole === 1
          ? `Oui. Sur le Gazole, elle affiche le tarif le plus bas des ${cityRankTotal} stations ${deVille(s.ville)} qui communiquent un prix.`
          : `Elle se classe ${cityRankGazole}e sur ${cityRankTotal} stations ${aVille(s.ville)} pour le Gazole${
              cityStats['Gazole'] != null ? `, où la moyenne s'établit à ${fmt(cityStats['Gazole']!)} €/L` : ''
            }. Le comparatif complet de la commune permet de voir les écarts station par station.`,
    });
  }

  const hourStr = summarizeHoraires(horaires);
  if (hourStr || automate) {
    faq.push({
      question: `À quelles heures la station est-elle ouverte ?`,
      answer: [
        hourStr ?? `Cette station ne publie pas ses horaires dans le fichier officiel.`,
        automate
          ? `Un automate accepte la carte bancaire 24h/24, y compris quand la boutique est fermée.`
          : null,
      ]
        .filter(Boolean)
        .join(' '),
    });
  } else if (services.length > 0) {
    faq.push({
      question: `Quels services propose cette station ?`,
      answer: `La station déclare les services suivants : ${services.map(decapitalize).join(', ')}.`,
    });
  }

  return faq;
}

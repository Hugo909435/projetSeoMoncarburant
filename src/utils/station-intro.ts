/**
 * Texte descriptif d'une page station.
 *
 * Même principe que city-intro.ts : aucune génération aléatoire, tout est
 * déterministe. Le contenu est piloté par les données réelles de la station
 * (écart de prix, rang dans la commune, services, horaires) et l'ordre des
 * paragraphes varie selon un indice tiré de l'identifiant. Deux stations aux
 * données proches ne produisent donc pas le même texte, et une même station
 * produit toujours le même texte d'un build à l'autre.
 *
 * Cible : 250 à 350 mots, assez pour que la page tienne debout seule sans
 * remplissage artificiel.
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
  /** Nombre de stations du département, pour le paragraphe de repli. */
  deptStationCount?: number;
  nationalStats: Record<string, number>;
}

const fmt = (n: number) => n.toFixed(3);
const sign = (n: number) => (n > 0 ? '+' : '');
const cents = (n: number) => Math.round(Math.abs(n) * 100);

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

/** Libellé précédé de son article, pour les énumérations en toutes lettres. */
const FUEL_WITH_ARTICLE: Record<string, string> = {
  Gazole: 'le Gazole',
  SP95: 'le SP95',
  SP98: 'le SP98',
  E10: "l'E10",
  E85: 'le superéthanol E85',
  GPLc: 'le GPL',
};

/**
 * Met une étiquette de service en bas de casse sans écraser ses sigles.
 * « Automate CB 24/24 » doit donner « automate CB 24/24 », pas « automate cb 24/24 ».
 */
function decapitalize(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/** Libellé lisible de la station, sans le mot « station » en tête. */
export function stationLabel(s: StationLike): string {
  const brand = s.enseigne && s.enseigne !== 'independent' ? s.enseigne : 'Station-service';
  return s.adresse ? `${brand}, ${s.adresse}` : brand;
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

export function buildStationIntro(p: StationIntroParams): string[] {
  const {
    station: s,
    services,
    horaires,
    automate,
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

  const fuelsAvailable = Object.keys(s.prices).filter((f) => s.prices[f] != null);
  const gazole = s.prices['Gazole'] ?? null;
  const sp95 = s.prices['SP95'] ?? null;
  const e10 = s.prices['E10'] ?? null;
  const e85 = s.prices['E85'] ?? null;
  const gpl = s.prices['GPLc'] ?? null;

  // ── Paragraphe 1 : identification ──────────────────────────────────────────

  function pIdentity(): string {
    // « au 12 rue des Lilas » se dit, « au Route de Beaucaire » non : l'article
    // ne fonctionne que devant un numéro de voie.
    const startsWithNumber = !!s.adresse && /^\d/.test(s.adresse.trim());
    const where = s.adresse
      ? startsWithNumber
        ? `au ${s.adresse}`
        : s.adresse
      : `à ${s.ville}`;

    const cityStr = s.cp ? `${s.ville} (${s.cp})` : s.ville;
    // Formulation en apposition : « dans le département Gard » est fautif et
    // le bon article varie d'un département à l'autre (le Gard, la Gironde,
    // les Landes, l'Ain). L'apposition évite d'avoir à le deviner.
    const deptStr = deptLabel ? `, département ${deptLabel}` : '';
    const roadStr = isAutoroute
      ? " Implantée sur le réseau autoroutier, elle s'adresse d'abord aux conducteurs en transit."
      : '';
    const neighbourStr =
      cityStationCount > 1
        ? ` La commune compte ${cityStationCount} stations-service au total.`
        : ` C'est la seule station-service recensée sur la commune.`;

    const forms = [
      `${brand ? `Cette station ${brand}` : 'Cette station-service'} est située ${where}, à ${cityStr}${deptStr}.${roadStr}${neighbourStr}`,
      `Vous trouverez ${brand ? `cette station ${brand}` : 'cette station-service'} ${where}, sur la commune de ${cityStr}${deptStr}.${roadStr}${neighbourStr}`,
      `${brand ? `La station ${brand}` : 'La station-service'} ${where} fait partie des points de vente de carburant recensés à ${cityStr}${deptStr}.${roadStr}${neighbourStr}`,
      `Installée ${where} à ${cityStr}${deptStr}, ${brand ? `cette station ${brand}` : 'cette station-service'} déclare ses prix au fichier officiel des carburants.${roadStr}${neighbourStr}`,
    ];
    return forms[v];
  }

  // ── Paragraphe 2 : le prix, et son écart aux moyennes ──────────────────────

  function pPrice(): string | null {
    if (fuelsAvailable.length === 0) {
      return `Cette station n'a pas communiqué de prix récemment. Les tarifs affichés sur cette page reprennent la dernière déclaration transmise au fichier officiel, ils peuvent donc avoir évolué depuis votre dernier passage.`;
    }

    // On raisonne sur le carburant le plus structurant disponible.
    const ref: [string, number] | null = gazole
      ? ['Gazole', gazole]
      : sp95
        ? ['SP95', sp95]
        : e10
          ? ['E10', e10]
          : null;

    if (!ref) {
      const list = fuelsAvailable.map((f) => `${FUEL_LABEL[f] ?? f} à ${fmt(s.prices[f]!)} €/L`).join(', ');
      return `Les carburants disponibles ici sont proposés aux tarifs suivants : ${list}.`;
    }

    const [fuel, price] = ref;
    const label = FUEL_LABEL[fuel] ?? fuel;
    const cityAvg = cityStats[fuel] ?? null;
    const natAvg = nationalStats[fuel] ?? null;

    const parts: string[] = [];

    if (cityAvg != null && cityStationCount > 1) {
      const d = diffPct(price, cityAvg);
      if (d < -1.5) {
        parts.push(
          `Le ${label} y est affiché à ${fmt(price)} €/L, soit ${cents(price - cityAvg)} centimes de moins que la moyenne constatée à ${s.ville} (${fmt(cityAvg)} €/L).`,
        );
      } else if (d > 1.5) {
        parts.push(
          `Le ${label} y est affiché à ${fmt(price)} €/L, soit ${cents(price - cityAvg)} centimes au-dessus de la moyenne de ${s.ville} (${fmt(cityAvg)} €/L).`,
        );
      } else {
        parts.push(
          `Le ${label} y est affiché à ${fmt(price)} €/L, au niveau de la moyenne de ${s.ville} (${fmt(cityAvg)} €/L).`,
        );
      }
    } else {
      parts.push(`Le ${label} y est affiché à ${fmt(price)} €/L.`);
    }

    if (natAvg != null) {
      const dn = diffPct(price, natAvg);
      parts.push(
        `Rapporté à la moyenne nationale de ${fmt(natAvg)} €/L, l'écart est de ${sign(dn)}${dn.toFixed(1)}%.`,
      );
    }

    const deptAvg = deptStats[fuel] ?? null;
    if (deptAvg != null && deptName) {
      parts.push(`La moyenne départementale (${deptName}) s'établit de son côté à ${fmt(deptAvg)} €/L.`);
    }

    // Récapitulatif de la gamme distribuée, hors carburant déjà commenté.
    const others = fuelsAvailable.filter((f) => f !== fuel);
    if (others.length > 0) {
      const list = others.map((f) => `${FUEL_WITH_ARTICLE[f] ?? f} à ${fmt(s.prices[f]!)} €/L`);
      const last = list.pop();
      parts.push(
        `La station distribue également ${list.length > 0 ? `${list.join(', ')} et ${last}` : last}.`,
      );
    }

    return parts.join(' ');
  }

  // ── Paragraphe 3 : positionnement dans la commune ──────────────────────────

  function pRank(): string | null {
    if (cityRankGazole == null || cityRankTotal == null || cityRankTotal < 3) return null;

    const share = cityRankGazole / cityRankTotal;

    if (cityRankGazole === 1) {
      const forms = [
        `Sur le Gazole, c'est actuellement la station la moins chère de ${s.ville} parmi les ${cityRankTotal} qui communiquent un tarif.`,
        `Elle occupe la première place du classement Gazole à ${s.ville}, devant ${cityRankTotal - 1} autres stations.`,
        `Aucune station de ${s.ville} n'affiche un Gazole moins cher aujourd'hui.`,
        `C'est le tarif Gazole le plus bas relevé à ${s.ville} sur les ${cityRankTotal} stations comparées.`,
      ];
      return forms[v];
    }

    if (share <= 0.34) {
      return `Elle se classe ${cityRankGazole}e sur ${cityRankTotal} pour le Gazole à ${s.ville}, ce qui la place dans le tiers le plus avantageux de la commune.`;
    }

    if (share >= 0.75) {
      return `Elle se classe ${cityRankGazole}e sur ${cityRankTotal} pour le Gazole à ${s.ville} : d'autres stations de la commune affichent un tarif nettement plus bas, le comparatif ville détaille les écarts.`;
    }

    return `Elle se situe en milieu de classement pour le Gazole à ${s.ville}, en ${cityRankGazole}e position sur ${cityRankTotal} stations comparées.`;
  }

  // ── Paragraphe 4 : carburants alternatifs et équipements ───────────────────

  function pOffer(): string | null {
    const parts: string[] = [];

    // Les prix sont déjà donnés dans le paragraphe tarifaire : on commente ici
    // ce que cette disponibilité change concrètement pour l'automobiliste.
    if (e85 != null && gpl != null) {
      parts.push(
        `Proposer à la fois le superéthanol E85 et le GPL reste rare : moins d'une station française sur dix distribue l'un ou l'autre, ce qui fait de cette adresse un point de ravitaillement utile pour les véhicules FlexFuel comme pour les véhicules convertis au GPL.`,
      );
    } else if (e85 != null) {
      parts.push(
        `La présence du superéthanol E85 mérite d'être signalée : c'est le carburant le moins cher du marché, accessible aux véhicules FlexFuel et à ceux équipés d'un boîtier de conversion homologué.`,
      );
    } else if (gpl != null) {
      parts.push(
        `La station distribue le GPL, une motorisation encore peu servie sur le territoire, ce qui limite le nombre de points de ravitaillement possibles pour les véhicules concernés.`,
      );
    } else if (fuelsAvailable.length >= 4) {
      parts.push(
        `Avec ${fuelsAvailable.length} carburants à la pompe, elle couvre l'essentiel des motorisations essence et diesel du parc français.`,
      );
    }

    if (automate) {
      parts.push(
        `Un automate accepte la carte bancaire en dehors des heures d'ouverture de la boutique, ce qui permet de faire le plein la nuit.`,
      );
    }

    if (services.length > 0) {
      // La liste complète figure dans son propre bloc plus bas : ici on cite
      // les premiers services sans chercher à tout répéter.
      const shown = services.slice(0, 5).map(decapitalize);
      const suffix = services.length > shown.length ? ', entre autres' : '';
      parts.push(`Côté équipements, la station déclare ${shown.join(', ')}${suffix}.`);
    }

    const hourStr = summarizeHoraires(horaires);
    if (hourStr) parts.push(hourStr);

    return parts.length > 0 ? parts.join(' ') : null;
  }

  // ── Paragraphe 5 : conseil pratique, calibré sur le type de station ────────

  /** Enseignes de grande distribution : modèle tarifaire et contraintes propres. */
  const GMS = new Set([
    'leclerc', 'intermarche', 'carrefour', 'super-u', 'auchan', 'casino',
    'netto', 'lidl', 'match', 'spar', 'bi1', 'monoprix', 'cora',
  ]);

  function pContext(): string {
    if (isAutoroute) {
      return `Les stations d'autoroute pratiquent structurellement des tarifs plus élevés que le réseau ordinaire, l'écart atteignant couramment 15 à 25 centimes par litre. Si votre autonomie le permet, une sortie vers une commune voisine reste presque toujours plus économique. Le tableau des stations proches, plus bas, indique les distances et les prix relevés autour de ce point de vente.`;
    }

    if (s.enseigneSlug && GMS.has(s.enseigneSlug)) {
      return `Les stations de grande distribution comme celle-ci appliquent des marges volontairement faibles sur le carburant, qu'elles utilisent comme produit d'appel pour attirer en magasin. C'est ce qui explique qu'elles figurent le plus souvent en tête des classements de prix. En contrepartie, leurs horaires suivent généralement ceux du magasin, hors accès automate, et l'affluence peut être forte aux heures de sortie de bureau.`;
    }

    if (!brand) {
      return `Cette station n'est rattachée à aucun réseau national identifié dans les données publiques. Les stations indépendantes affichent des tarifs très variables d'un point de vente à l'autre : certaines comptent parmi les moins chères de leur secteur, d'autres se situent nettement au-dessus. Comparer avec les stations voisines avant de faire le plein reste le réflexe le plus rentable.`;
    }

    return `Les réseaux traditionnels comme ${brand} misent moins sur le prix que sur la disponibilité : amplitude horaire large, présence sur les axes, et services annexes plus fournis que dans la grande distribution. Sur un plein de 50 litres, quelques centimes d'écart au litre représentent tout de même plusieurs euros, d'où l'intérêt de comparer avec les stations proches listées plus bas.`;
  }

  // ── Paragraphe 6 : cadre méthodologique ────────────────────────────────────

  function pMethod(): string {
    const forms = [
      `Les prix de cette page proviennent du fichier officiel des prix des carburants, alimenté par les stations elles-mêmes et republié chaque jour par l'État. Un tarif peut donc avoir changé entre la dernière déclaration du gérant et votre passage à la pompe.`,
      `Ces tarifs sont issus des déclarations transmises par la station au dispositif public de transparence des prix, que nous récupérons quotidiennement. Vérifiez toujours l'affichage en entrée de station avant de faire le plein.`,
      `Le relevé s'appuie sur les données ouvertes du ministère de l'Économie, mises à jour chaque jour. La déclaration étant à la main du gérant, un décalage de quelques heures avec le prix réel reste possible.`,
      `Ces informations proviennent du fichier public des prix des carburants, actualisé quotidiennement sur notre site. Elles sont données à titre indicatif : seul l'affichage en station fait foi.`,
    ];
    return forms[v];
  }

  // ── Assemblage ─────────────────────────────────────────────────────────────
  // L'ordre dépend de l'angle le plus fort : une station très bon marché
  // ouvre sur le prix, une station bien équipée ouvre sur son offre.

  const gazoleCityDiff =
    gazole != null && cityStats['Gazole'] != null ? diffPct(gazole, cityStats['Gazole']!) : null;
  const isCheap = cityRankGazole === 1 || (gazoleCityDiff != null && gazoleCityDiff < -2);
  const isWellEquipped = services.length >= 5 && (e85 != null || gpl != null);

  let ordered: (string | null)[];

  if (isCheap) {
    ordered = [pPrice(), pRank(), pIdentity(), pOffer(), pContext(), pMethod()];
  } else if (isWellEquipped && v >= 2) {
    ordered = [pIdentity(), pOffer(), pPrice(), pRank(), pContext(), pMethod()];
  } else {
    ordered = [pIdentity(), pPrice(), pRank(), pOffer(), pContext(), pMethod()];
  }

  const paragraphs = ordered.filter((x): x is string => x != null && x.trim() !== '');

  /**
   * Repli pour les fiches maigres.
   *
   * Une station rurale isolée, sans services déclarés, sans horaires et avec
   * deux carburants cotés, ne mobilise qu'une partie des paragraphes ci-dessus
   * et tombe autour de 150 mots. On complète alors avec le cadrage
   * départemental, qui reste de la donnée réelle et propre à la page, plutôt
   * que de laisser une page trop courte pour tenir seule.
   */
  const wordCount = paragraphs.join(' ').split(/\s+/).length;
  if (wordCount < 220) {
    const extra = pDeptFallback();
    if (extra) paragraphs.splice(paragraphs.length - 1, 0, extra);
  }

  return paragraphs;

  function pDeptFallback(): string | null {
    if (!deptName) return null;

    const bits: string[] = [];
    const deptGazole = deptStats['Gazole'] ?? null;
    const natGazole = nationalStats['Gazole'] ?? null;

    if (deptGazole != null && natGazole != null) {
      const d = diffPct(deptGazole, natGazole);
      const qualifier =
        d < -1.5
          ? 'un département plutôt bon marché pour faire le plein'
          : d > 1.5
            ? 'un département où le plein revient plus cher que la moyenne'
            : 'un département aligné sur la moyenne nationale';
      bits.push(
        `À l'échelle du département (${deptName}), le Gazole s'échange en moyenne à ${fmt(deptGazole)} €/L contre ${fmt(natGazole)} €/L sur l'ensemble du pays, ce qui en fait ${qualifier}.`,
      );
    }

    if (deptStationCount && deptStationCount > 1) {
      bits.push(
        `Notre comparateur y suit ${deptStationCount} stations-service au total : la page départementale permet de les trier par prix et de repérer les moins chères du secteur avant de prendre la route.`,
      );
    }

    if (cityStationCount === 1) {
      bits.push(
        `Cette commune ne comptant qu'une seule station, comparer suppose d'élargir aux communes voisines : le tableau des stations proches, plus haut, donne les distances et les tarifs relevés alentour.`,
      );
    }

    return bits.length > 0 ? bits.join(' ') : null;
  }
}

/** Trois questions fréquentes, alimentées par les données réelles de la station. */
export function buildStationFaq(p: StationIntroParams): { question: string; answer: string }[] {
  const { station: s, services, horaires, automate, cityStats, cityRankGazole, cityRankTotal } = p;
  const faq: { question: string; answer: string }[] = [];

  const brandLabel = s.enseigne && s.enseigne !== 'independent' ? `${s.enseigne} ` : '';
  const where = s.adresse ? `${s.adresse}, ${s.ville}` : s.ville;

  // 1. Le prix, la question qui amène la visite.
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
        : `Cette station n'a pas transmis de tarif lors du dernier relevé officiel. Consultez la page de la commune pour voir les stations de ${s.ville} qui communiquent leurs prix.`,
  });

  // 2. Est-ce que ça vaut le détour ?
  if (cityRankGazole != null && cityRankTotal != null && cityRankTotal >= 3) {
    faq.push({
      question: `Cette station est-elle moins chère que les autres à ${s.ville} ?`,
      answer:
        cityRankGazole === 1
          ? `Oui. Sur le Gazole, elle affiche le tarif le plus bas des ${cityRankTotal} stations de ${s.ville} qui communiquent un prix.`
          : `Elle se classe ${cityRankGazole}e sur ${cityRankTotal} stations à ${s.ville} pour le Gazole${
              cityStats['Gazole'] != null ? `, où la moyenne s'établit à ${fmt(cityStats['Gazole']!)} €/L` : ''
            }. Le comparatif complet de la commune permet de voir les écarts station par station.`,
    });
  }

  // 3. Accès et horaires, la question pratique.
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

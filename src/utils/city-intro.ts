export interface CityStation {
  adresse?: string | null;
  cp?: string;
  prices: Partial<Record<string, number>>;
}

export interface CityIntroParams {
  cityName: string;
  citySlug: string;
  stationCount: number;
  /** Flat averages per fuel key, e.g. { Gazole: 2.17, SP95: 2.08, ... } */
  stats: Partial<Record<string, number>>;
  /** Already sorted ascending by cheapest price */
  stations: CityStation[];
  deptName?: string;
  deptNum?: string;
  nationalStats: Record<string, number>;
}

const fmt = (n: number) => n.toFixed(3);
const sign = (n: number) => (n > 0 ? '+' : '');

function diffPct(local: number, national: number) {
  return ((local - national) / national) * 100;
}

// Deterministic variant 0-3 from city slug char codes
function cityVariant(slug: string): number {
  return slug.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 4;
}

// First station in the sorted array that has the given fuel
function cheapestFor(stations: CityStation[], fuel: string): { station: CityStation; price: number } | null {
  for (const s of stations) {
    const price = s.prices[fuel];
    if (price != null) return { station: s, price };
  }
  return null;
}

// Count stations that carry a given fuel
function countWith(stations: CityStation[], fuel: string): number {
  return stations.filter(s => s.prices[fuel] != null).length;
}

export function buildCityIntro(p: CityIntroParams): string[] {
  const { cityName, citySlug, stationCount, stats, stations, deptName, deptNum, nationalStats } = p;

  const gazoleAvg = stats['Gazole'] ?? null;
  const sp95Avg   = stats['SP95']   ?? null;
  const e85Avg    = stats['E85']    ?? null;
  const gplAvg    = stats['GPLc']   ?? null;
  const e10Avg    = stats['E10']    ?? null;

  const natGazole = nationalStats['Gazole'];
  const natSp95   = nationalStats['SP95'];
  const natE85    = nationalStats['E85'];

  const gazoleDiff = gazoleAvg != null && natGazole != null ? diffPct(gazoleAvg, natGazole) : null;
  const sp95Diff   = sp95Avg   != null && natSp95   != null ? diffPct(sp95Avg,   natSp95)   : null;
  const e85Diff    = e85Avg    != null && natE85    != null ? diffPct(e85Avg,    natE85)    : null;

  const e85Count = countWith(stations, 'E85');
  const gplCount = countWith(stations, 'GPLc');
  const e85Coverage = stationCount > 0 ? (e85Count / stationCount) * 100 : 0;

  const cheapGazole = cheapestFor(stations, 'Gazole');
  const cheapE85    = cheapestFor(stations, 'E85');

  const deptLabel = deptName && deptNum ? `${deptName} (${deptNum})` : deptName ?? deptNum ?? null;

  const v = cityVariant(citySlug);

  // ── Sentence builders ───────────────────────────────────────────────────────

  function sNetwork(): string {
    const deptStr = deptLabel ? `, en ${deptLabel}` : '';
    const forms = [
      `À ${cityName}, ${stationCount} stations-service proposent leurs tarifs en temps réel${deptStr}.`,
      `Notre comparateur recense ${stationCount} stations à ${cityName}${deptStr}.`,
      `${stationCount} stations sont référencées à ${cityName}${deptStr} dans notre base.`,
      `La ville de ${cityName}${deptStr} compte ${stationCount} stations dans notre comparateur.`,
    ];
    return forms[v % forms.length];
  }

  function sGazole(): string | null {
    if (gazoleAvg == null) return null;
    if (gazoleDiff == null) {
      return `Le prix moyen du Gazole s'établit à ${fmt(gazoleAvg)} €/L à ${cityName}.`;
    }
    const diffStr = `${sign(gazoleDiff)}${gazoleDiff.toFixed(1)}%`;
    if (gazoleDiff < -3) {
      return `Le Gazole y est moins cher qu'en moyenne nationale : ${fmt(gazoleAvg)} €/L, soit ${diffStr} par rapport aux ${fmt(natGazole!)} €/L observés en France.`;
    }
    if (gazoleDiff > 3) {
      return `Le Gazole s'affiche à ${fmt(gazoleAvg)} €/L en moyenne, ${diffStr} au-dessus de la moyenne nationale (${fmt(natGazole!)} €/L) - pensez à comparer les stations.`;
    }
    const forms = [
      `Le Gazole est proposé à ${fmt(gazoleAvg)} €/L en moyenne, proche de la moyenne nationale (${fmt(natGazole!)} €/L).`,
      `Le prix moyen du Gazole à ${cityName} s'établit à ${fmt(gazoleAvg)} €/L, dans la tendance nationale.`,
    ];
    return forms[v % forms.length];
  }

  function sCheapest(): string | null {
    if (!cheapGazole) return null;
    const adresseStr = cheapGazole.station.adresse ? ` (${cheapGazole.station.adresse})` : '';
    const forms = [
      `La station la moins chère pour le Gazole est située${adresseStr} à ${fmt(cheapGazole.price)} €/L.`,
      `Pour faire le plein au meilleur prix, la station${adresseStr} affiche le Gazole à ${fmt(cheapGazole.price)} €/L.`,
    ];
    return forms[v % forms.length];
  }

  function sAlt(): string | null {
    // E85 if meaningful
    if (e85Avg != null && e85Count >= 3) {
      const coverageLabel = e85Coverage >= 50
        ? 'plus de la moitié des stations proposent'
        : `${e85Count} station${e85Count > 1 ? 's proposent' : ' propose'}`;
      const diffStr = e85Diff != null ? ` (${sign(e85Diff)}${e85Diff.toFixed(1)}% vs. la France)` : '';
      return `Pour les véhicules FlexFuel, ${coverageLabel} le superéthanol E85 à ${fmt(e85Avg)} €/L${diffStr}.`;
    }
    // SP95 if price advantage
    if (sp95Avg != null && sp95Diff != null && sp95Diff < -2) {
      return `Le Sans-Plomb 95 est également avantageux à ${fmt(sp95Avg)} €/L (${sign(sp95Diff)}${sp95Diff.toFixed(1)}% vs. la France).`;
    }
    // SP95 minimal mention
    if (sp95Avg != null) {
      const cheapSp95 = cheapestFor(stations, 'SP95');
      if (cheapSp95 && cheapSp95.price < sp95Avg) {
        return `Le SP95 est disponible à partir de ${fmt(cheapSp95.price)} €/L, avec une moyenne de ${fmt(sp95Avg)} €/L en ville.`;
      }
      return `Le Sans-Plomb 95 est proposé en moyenne à ${fmt(sp95Avg)} €/L.`;
    }
    // GPL fallback
    if (gplAvg != null && gplCount >= 2) {
      return `Le GPL est disponible dans ${gplCount} station${gplCount > 1 ? 's' : ''} à ${fmt(gplAvg)} €/L en moyenne.`;
    }
    // E10 fallback
    if (e10Avg != null) {
      const forms = [
        `L'E10 est proposé en moyenne à ${fmt(e10Avg)} €/L pour les conducteurs au SP95 compatible.`,
        `Les véhicules compatibles peuvent opter pour l'E10 à ${fmt(e10Avg)} €/L en moyenne.`,
      ];
      return forms[v % forms.length];
    }
    return null;
  }

  function sOutro(): string {
    const forms = [
      `Les prix sont mis à jour quotidiennement depuis les données officielles du gouvernement français.`,
      `Données actualisées chaque jour depuis les sources ouvertes du ministère de l'Économie.`,
    ];
    return forms[v % forms.length];
  }

  // ── Compose paragraphs based on data-driven angle + variant ─────────────────

  const isCheap     = gazoleDiff != null && gazoleDiff < -2.5;
  const isExpensive = gazoleDiff != null && gazoleDiff > 2.5;
  const isE85Heavy  = e85Count >= 5 && e85Coverage >= 35;

  let ordered: (string | null)[];

  if (isCheap) {
    ordered = [sGazole(), sCheapest(), sNetwork(), sAlt(), sOutro()];
  } else if (isExpensive) {
    ordered = [sNetwork(), sGazole(), sCheapest(), sAlt(), sOutro()];
  } else if (isE85Heavy && v >= 2) {
    ordered = [sAlt(), sNetwork(), sGazole(), sCheapest(), sOutro()];
  } else if (v === 1) {
    ordered = [sCheapest(), sNetwork(), sGazole(), sAlt(), sOutro()];
  } else {
    ordered = [sNetwork(), sGazole(), sCheapest(), sAlt(), sOutro()];
  }

  return ordered.filter((s): s is string => s != null && s.trim() !== '');
}

export interface DeptStats {
  avg?: number | null;
  min?: number | null;
  max?: number | null;
  count?: number;
}

export interface StationSnippet {
  ville: string;
  adresse?: string | null;
  cp?: string;
  prices: Partial<Record<string, number>>;
}

export interface DeptIntroParams {
  deptName: string;
  deptNum: string;
  deptRegion: string;
  stationCount: number;
  stats: Partial<Record<string, DeptStats | null>>;
  top10Gazole: StationSnippet[];
  top10Sp95: StationSnippet[];
  nationalStats: Record<string, number>;
}

const fmt = (n: number) => n.toFixed(3);
const sign = (n: number) => (n > 0 ? '+' : '');

function diffPct(local: number, national: number) {
  return ((local - national) / national) * 100;
}

// Deterministic variant 0–3 from dept number string, cycles evenly across adjacent depts
function deptVariant(num: string): number {
  return num.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 4;
}

export function buildDeptIntro(p: DeptIntroParams): string[] {
  const {
    deptName, deptNum, deptRegion, stationCount,
    stats, top10Gazole, top10Sp95, nationalStats,
  } = p;

  const g    = stats['Gazole'];
  const s95  = stats['SP95'];
  const e85  = stats['E85'];
  const gpl  = stats['GPLc'];
  const e10  = stats['E10'];

  const gazoleAvg = g?.avg    ?? null;
  const sp95Avg   = s95?.avg  ?? null;
  const e85Avg    = e85?.avg  ?? null;
  const gplAvg    = gpl?.avg  ?? null;
  const e10Avg    = e10?.avg  ?? null;

  const natGazole = nationalStats['Gazole'];
  const natSp95   = nationalStats['SP95'];
  const natE85    = nationalStats['E85'];

  const gazoleDiff = gazoleAvg != null && natGazole != null ? diffPct(gazoleAvg, natGazole) : null;
  const sp95Diff   = sp95Avg   != null && natSp95   != null ? diffPct(sp95Avg,   natSp95)   : null;
  const e85Diff    = e85Avg    != null && natE85    != null ? diffPct(e85Avg,    natE85)    : null;

  const e85Count = e85?.count ?? 0;
  const gplCount = gpl?.count ?? 0;
  const e85Coverage = stationCount > 0 ? (e85Count / stationCount) * 100 : 0;

  const v = deptVariant(deptNum);

  // ── Sentence builders ───────────────────────────────────────────────────────

  function sNetwork(): string {
    const forms = [
      `Le ${deptName} (${deptNum}) compte ${stationCount} stations-service référencées dans notre comparateur, réparties sur l'ensemble du territoire en région ${deptRegion}.`,
      `Avec ${stationCount} stations référencées, le ${deptName} offre un réseau étendu pour comparer les prix du carburant en ${deptRegion}.`,
      `Notre comparateur recense ${stationCount} stations dans le département du ${deptName} (${deptNum}), en région ${deptRegion}.`,
      `Le réseau du ${deptName} (${deptNum}) comprend ${stationCount} stations dans notre base, couvrant les principales communes de ${deptRegion}.`,
    ];
    return forms[v % forms.length];
  }

  function sGazole(): string | null {
    if (gazoleAvg == null) return null;
    if (gazoleDiff == null) {
      return `Le prix moyen du Gazole s'établit à ${fmt(gazoleAvg)} €/L dans le ${deptName}.`;
    }
    const diffStr = `${sign(gazoleDiff)}${gazoleDiff.toFixed(1)}%`;
    if (gazoleDiff < -3) {
      return `Le Gazole y est moins cher qu'en moyenne nationale : ${fmt(gazoleAvg)} €/L en moyenne, soit ${diffStr} par rapport aux ${fmt(natGazole!)} €/L observés en France.`;
    }
    if (gazoleDiff > 3) {
      return `Le Gazole s'affiche à ${fmt(gazoleAvg)} €/L en moyenne, ${diffStr} au-dessus de la moyenne nationale (${fmt(natGazole!)} €/L) — pensez à comparer les stations avant de faire le plein.`;
    }
    const forms = [
      `Le Gazole est proposé à ${fmt(gazoleAvg)} €/L en moyenne, proche de la moyenne nationale (${fmt(natGazole!)} €/L).`,
      `Le prix moyen du Gazole s'établit à ${fmt(gazoleAvg)} €/L dans le ${deptName}, dans la tendance nationale.`,
    ];
    return forms[v % forms.length];
  }

  function sSp95(): string | null {
    if (sp95Avg == null) return null;
    if (sp95Diff != null && sp95Diff < -2) {
      return `Le Sans-Plomb 95 est également avantageux à ${fmt(sp95Avg)} €/L (${sign(sp95Diff)}${sp95Diff.toFixed(1)}% vs. la France).`;
    }
    if (s95?.min != null) {
      return `Le Sans-Plomb 95 est disponible à partir de ${fmt(s95.min)} €/L, avec une moyenne de ${fmt(sp95Avg)} €/L.`;
    }
    return `Le Sans-Plomb 95 est proposé en moyenne à ${fmt(sp95Avg)} €/L.`;
  }

  function sCheapest(): string | null {
    const s = top10Gazole[0];
    if (!s) return null;
    const price = s.prices['Gazole'];
    if (price == null) return null;
    const loc = s.adresse ? `${s.adresse} à ${s.ville}` : s.ville;
    const forms = [
      `La station la moins chère pour le Gazole se trouve à ${s.ville}${s.adresse ? ` (${s.adresse})` : ''}, avec un tarif affiché à ${fmt(price)} €/L.`,
      `Pour faire le plein au meilleur prix, rendez-vous à ${loc} : le Gazole y est affiché à ${fmt(price)} €/L.`,
    ];
    return forms[v % forms.length];
  }

  function sAlt(): string | null {
    if (e85Avg != null && e85Count >= 15) {
      const coverageLabel = e85Coverage >= 50
        ? 'plus de la moitié des stations référencées proposent'
        : `${e85Count} stations du département proposent`;
      const diffStr = e85Diff != null ? ` (${sign(e85Diff)}${e85Diff.toFixed(1)}% vs. la France)` : '';
      return `Pour les véhicules FlexFuel, ${coverageLabel} le superéthanol E85 à ${fmt(e85Avg)} €/L en moyenne${diffStr}.`;
    }
    if (gplAvg != null && gplCount >= 5) {
      return `Le GPL est disponible dans ${gplCount} stations du département à ${fmt(gplAvg)} €/L en moyenne.`;
    }
    if (e10Avg != null && (e10?.count ?? 0) >= 20) {
      const forms = [
        `L'E10, carburant essence le plus répandu dans le département, est proposé en moyenne à ${fmt(e10Avg)} €/L.`,
        `Les conducteurs au SP95 peuvent opter pour l'E10 compatible, disponible à ${fmt(e10Avg)} €/L en moyenne dans le ${deptName}.`,
      ];
      return forms[v % forms.length];
    }
    return null;
  }

  function sOutro(): string {
    const forms = [
      `Les prix sont mis à jour quotidiennement depuis les données officielles du gouvernement français (Licence Ouverte).`,
      `Données actualisées chaque jour depuis les sources ouvertes du ministère de l'Économie.`,
    ];
    return forms[v % forms.length];
  }

  // ── Compose paragraphs based on data-driven angle + variant order ────────────

  const isCheap     = gazoleDiff != null && gazoleDiff < -2.5;
  const isExpensive = gazoleDiff != null && gazoleDiff > 2.5;
  const isE85Heavy  = e85Count >= 50 || e85Coverage >= 40;

  let ordered: (string | null)[];

  if (isCheap) {
    // Lead with price advantage
    ordered = [sGazole(), sCheapest(), sNetwork(), sAlt(), sOutro()];
  } else if (isExpensive) {
    // Lead with cheapest station tip, then context
    ordered = [sNetwork(), sGazole(), sCheapest(), sAlt(), sOutro()];
  } else if (isE85Heavy && v >= 2) {
    // E85 angle (applied to ~half of E85-heavy depts to avoid repetition)
    ordered = [sAlt(), sNetwork(), sGazole(), sCheapest(), sOutro()];
  } else if (v === 1) {
    // Cheapest station first variant
    ordered = [sCheapest(), sNetwork(), sGazole(), sAlt(), sOutro()];
  } else {
    // Default: network → price → cheapest → alt → outro
    ordered = [sNetwork(), sGazole(), sCheapest(), sAlt(), sOutro()];
  }

  return ordered.filter((s): s is string => s != null && s.trim() !== '');
}

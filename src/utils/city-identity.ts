// Génère un contenu « identité » factuel et unique pour chaque page ville,
// à partir de données réelles (département, région, statut de chef-lieu, réseau).
// Aucun fait inventé : uniquement de la géographie administrative et des données.

export interface CityDept {
  num: string;
  name: string;
  region: string;
  slug: string;
}

export interface CityIdentityParams {
  cityName: string;
  dept: CityDept;
  isPrefecture: boolean;
  stationCount: number;
  deptNickname?: string;
  deptAxes?: string;
}

export interface LocalFact { label: string; value: string }

// Article défini correct par numéro de département (pour « dans … »).
// '' = cas particulier (Paris). Vérifié sur les 96 départements métropolitains.
export const DEPT_ARTICLE: Record<string, string> = {
  '01': "l'", '02': "l'", '03': "l'", '04': 'les', '05': 'les', '06': 'les',
  '07': "l'", '08': 'les', '09': "l'", '10': "l'", '11': "l'", '12': "l'",
  '13': 'les', '14': 'le', '15': 'le', '16': 'la', '17': 'la', '18': 'le',
  '19': 'la', '21': 'la', '22': 'les', '23': 'la', '24': 'la', '25': 'le',
  '26': 'la', '27': "l'", '28': "l'", '29': 'le', '30': 'le', '31': 'la',
  '32': 'le', '33': 'la', '34': "l'", '35': "l'", '36': "l'", '37': "l'",
  '38': "l'", '39': 'le', '40': 'les', '41': 'le', '42': 'la', '43': 'la',
  '44': 'la', '45': 'le', '46': 'le', '47': 'le', '48': 'la', '49': 'le',
  '50': 'la', '51': 'la', '52': 'la', '53': 'la', '54': 'la', '55': 'la',
  '56': 'le', '57': 'la', '58': 'la', '59': 'le', '60': "l'", '61': "l'",
  '62': 'le', '63': 'le', '64': 'les', '65': 'les', '66': 'les', '67': 'le',
  '68': 'le', '69': 'le', '70': 'la', '71': 'la', '72': 'la', '73': 'la',
  '74': 'la', '75': '', '76': 'la', '77': 'la', '78': 'les', '79': 'les',
  '80': 'la', '81': 'le', '82': 'le', '83': 'le', '84': 'le', '85': 'la',
  '86': 'la', '87': 'la', '88': 'les', '89': "l'", '90': 'le', '91': "l'",
  '92': 'les', '93': 'la', '94': 'le', '95': 'le', '2A': 'la', '2B': 'la',
};

/** « dans le Rhône », « dans l'Ain », « dans les Hauts-de-Seine », « la Vendée »… */
export function deptInPhrase(dept: CityDept): string {
  if (dept.num === '75') return 'à Paris';
  const art = DEPT_ARTICLE[dept.num] ?? 'le ';
  const sep = art.endsWith("'") ? '' : ' ';
  return `dans ${art}${sep}${dept.name}`;
}

function deptOfPhrase(dept: CityDept): string {
  // « du Rhône », « de l'Ain », « des Hauts-de-Seine », « de la Vendée »
  const art = DEPT_ARTICLE[dept.num] ?? 'le';
  if (art === "l'") return `de l'${dept.name}`;
  if (art === 'les') return `des ${dept.name}`;
  if (art === 'la') return `de la ${dept.name}`;
  if (art === '') return `de ${dept.name}`;
  return `du ${dept.name}`;
}

export function buildCityIdentity(p: CityIdentityParams): { paragraphs: string[]; facts: LocalFact[] } {
  const { cityName, dept, isPrefecture, stationCount, deptNickname, deptAxes } = p;

  const situ = isPrefecture
    ? `${cityName} est la préfecture ${deptOfPhrase(dept)} (${dept.num}), en région ${dept.region}.`
    : `${cityName} est une commune située ${deptInPhrase(dept)} (${dept.num}), en région ${dept.region}.`;

  const nicknamePart = deptNickname ? ` ${deptNickname.replace(/\.$/, '')}.` : '';
  const p1 = `${situ}${nicknamePart}`;

  const axesPart = deptAxes
    ? ` Le département est desservi par les grands axes ${deptAxes}, que les automobilistes empruntent pour leurs trajets quotidiens comme pour les longs déplacements.`
    : '';
  const p2 =
    `Notre comparateur suit en continu les ${stationCount} station${stationCount > 1 ? 's' : ''}-service ` +
    `référencée${stationCount > 1 ? 's' : ''} à ${cityName} afin d'identifier les tarifs les plus avantageux.` +
    axesPart;

  const facts: LocalFact[] = [
    { label: 'Département', value: `${dept.name} (${dept.num})` },
    { label: 'Région', value: dept.region },
  ];
  if (isPrefecture) facts.push({ label: 'Statut', value: 'Préfecture de département' });

  return { paragraphs: [p1, p2], facts };
}

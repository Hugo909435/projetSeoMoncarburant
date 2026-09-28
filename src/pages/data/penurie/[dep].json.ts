import type { APIRoute, GetStaticPaths } from 'astro';
import departments from '../../../data/departments.json';
import { stationUrl } from '../../../utils/station-waves';

/*
 * Complément de l'outil « Trouver du carburant » de /penurie-carburant/.
 *
 * L'outil interroge en direct l'API officielle (prix et ruptures), qui ne
 * fournit pas l'enseigne des stations. Ce fichier, un par département, donne
 * pour chaque station son enseigne et, si sa fiche est publiée, son URL :
 * { "67500013": ["Intermarché", "/prix-carburants/station/..."] }
 *
 * Seules des informations stables y figurent. Prix et ruptures ne sont jamais
 * lus ici, pour ne pas mélanger une donnée du build (jusqu'à 3 h d'âge) avec
 * la donnée en direct.
 */

const deptFiles = import.meta.glob('../../../data/fuel/stations-by-department/*.json', { eager: true });

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(departments).map((dep) => ({ params: { dep } }));

export const GET: APIRoute = ({ params }) => {
  const file = Object.entries(deptFiles).find(([path]) => path.endsWith(`/${params.dep}.json`))?.[1] as
    | { stations?: { id: string; enseigne?: string | null }[] }
    | undefined;
  const out: Record<string, [string | null, string | null]> = {};
  for (const s of file?.stations ?? []) {
    out[s.id] = [s.enseigne ?? null, stationUrl(s.id)];
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
};

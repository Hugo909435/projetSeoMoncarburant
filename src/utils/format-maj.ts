/**
 * Formatte la date de dernière déclaration officielle d'un prix (flux gouvernemental)
 * en texte relatif court : "Aujourd'hui", "Hier", ou "JJ/MM".
 */
export function formatMaj(maj: string | null | undefined): string {
  if (!maj) return '-';
  const date = new Date(maj);
  if (Number.isNaN(date.getTime())) return '-';

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays > 1 && diffDays <= 6) return `Il y a ${diffDays} j`;

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: diffDays > 365 ? 'numeric' : undefined });
}

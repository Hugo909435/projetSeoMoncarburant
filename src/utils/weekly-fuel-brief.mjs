/** Compare deux relevés distants de sept jours, sans inventer de jour manquant. */
export function weeklyFuelBrief(history) {
  const validDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T12:00:00Z`))
    && new Date(`${value}T12:00:00Z`).toISOString().startsWith(value);
  const byDate = new Map(history.filter(row => validDay(row.date)).map(row => [row.date, row]));
  const dates = [...byDate.keys()].sort();
  const end = dates.at(-1);
  if (!end) return null;
  const start = new Date(Date.parse(`${end}T12:00:00Z`) - 7 * 86400000).toISOString().slice(0, 10);
  const before = byDate.get(start);
  const after = byDate.get(end);
  if (!before || !after) return null;
  const rows = ['Gazole', 'SP95', 'E10', 'SP98'].flatMap(fuel => {
    const previous = before.prices?.[fuel];
    const current = after.prices?.[fuel];
    if (![previous, current].every(value => Number.isFinite(value) && value > 0)) return [];
    return [{ fuel, previous, current, diff: current - previous, cost50: (current - previous) * 50 }];
  });
  return rows.length ? { start, end, rows } : null;
}

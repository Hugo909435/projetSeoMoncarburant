export const COMPARISON_FUELS = ['Gazole', 'SP95', 'SP98', 'E10', 'E85', 'GPLc'];
export const RECENT_DECLARATION_DAYS = 7;

/** Prix indisponible ou rupture : ne participe pas au classement. */
export function comparablePrice(station, fuel) {
  const price = station?.prices?.[fuel];
  return !station?.ruptures?.[fuel] && Number.isFinite(price) && price > 0 ? price : null;
}

/** Les anciens exports n'ont que la dernière déclaration de la station. */
export function fuelDeclaration(station, fuel) {
  return station?.priceUpdates ? station.priceUpdates[fuel] ?? null : station?.maj ?? null;
}

export function parisDay(value = new Date()) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
    : null;
}

function dayNumber(value) {
  const day = typeof value === 'string' ? value.slice(0, 10) : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return NaN;
  const timestamp = Date.parse(`${day}T12:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().startsWith(day) ? timestamp / 86400000 : NaN;
}

export function hasRecentDeclaration(station, fuel, referenceDay) {
  const age = dayNumber(referenceDay) - dayNumber(fuelDeclaration(station, fuel));
  return Number.isFinite(age) && age >= 0 && age <= RECENT_DECLARATION_DAYS;
}

export function rankComparableStations(stations, fuel, referenceDay, recentOnly = true) {
  return stations.filter(station => comparablePrice(station, fuel) !== null
    && (!recentOnly || hasRecentDeclaration(station, fuel, referenceDay)))
    .sort((a, b) => comparablePrice(a, fuel) - comparablePrice(b, fuel)
      || String(a.ville ?? '').localeCompare(String(b.ville ?? ''), 'fr'));
}

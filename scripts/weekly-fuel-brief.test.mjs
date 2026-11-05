import test from 'node:test';
import assert from 'node:assert/strict';
import { weeklyFuelBrief } from '../src/utils/weekly-fuel-brief.mjs';

test('la variation compare sept jours exacts, même dans un historique non trié', () => {
  const result = weeklyFuelBrief([
    { date: '2026-11-04', prices: { Gazole: 2.255, E10: 2.09 } },
    { date: '2026-10-28', prices: { Gazole: 2.388, E10: 2.127 } },
    { date: '2026-02-30', prices: { Gazole: 100 } },
  ]);
  assert.equal(result.start, '2026-10-28');
  assert.equal(result.end, '2026-11-04');
  assert.ok(Math.abs(result.rows[0].cost50 + 6.65) < 1e-9);
  assert.equal(result.rows.length, 2);
});
test('un jour absent ne produit pas de fausse comparaison hebdomadaire', () => {
  assert.equal(weeklyFuelBrief([{ date: '2026-11-04', prices: { Gazole: 2 } }, { date: '2026-10-29', prices: { Gazole: 3 } }]), null);
  assert.equal(weeklyFuelBrief([]), null);
});
test('les valeurs manquantes ne deviennent pas des économies inventées', () => {
  assert.equal(weeklyFuelBrief([{ date: '2026-11-04', prices: { Gazole: null } }, { date: '2026-10-28', prices: { Gazole: 2 } }]), null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { comparablePrice, fuelDeclaration, hasRecentDeclaration, parisDay, rankComparableStations } from '../src/utils/fuel-comparison.mjs';

const day = '2026-11-05';
test('un prix bas ancien ou en rupture ne gagne pas le classement récent', () => {
  const stations = [
    { id: 'ancien', prices: { Gazole: 1 }, maj: '2026-09-01 10:00:00' },
    { id: 'rupture', prices: { Gazole: 1.2 }, maj: day, ruptures: { Gazole: day } },
    { id: 'sans-date', prices: { Gazole: 1.3 } },
    { id: 'recent', prices: { Gazole: 2.2, E10: 2.1 }, maj: '2026-11-04 09:00:00' },
    { id: 'moins-cher', prices: { Gazole: 2.1, E10: 2.2 }, maj: day },
  ];
  assert.deepEqual(rankComparableStations(stations, 'Gazole', day).map(s => s.id), ['moins-cher', 'recent']);
  assert.deepEqual(rankComparableStations(stations, 'E10', day).map(s => s.id), ['recent', 'moins-cher']);
  assert.equal(rankComparableStations(stations, 'Gazole', day, false)[0].id, 'ancien');
});
test('la date du carburant prime sur une déclaration plus récente pour un autre carburant', () => {
  const station = { maj: day, prices: { Gazole: 2 }, priceUpdates: { Gazole: '2026-09-01', E10: day } };
  assert.equal(hasRecentDeclaration(station, 'Gazole', day), false);
  assert.equal(fuelDeclaration(station, 'SP98'), null);
  assert.equal(hasRecentDeclaration(station, 'SP98', day), false);
});
test('les dates futures, invalides et les prix non valides sont écartés', () => {
  for (const maj of ['2026-11-06', '2026-02-30', null, 'invalide']) assert.equal(hasRecentDeclaration({ maj }, 'Gazole', day), false);
  for (const price of [0, -1, NaN, Infinity, '2.1', null]) assert.equal(comparablePrice({ prices: { Gazole: price } }, 'Gazole'), null);
  assert.equal(hasRecentDeclaration({ maj: '2026-10-29' }, 'Gazole', day), true);
  assert.equal(hasRecentDeclaration({ maj: '2026-10-28' }, 'Gazole', day), false);
});
test('le jour de référence suit Paris, y compris au changement de date UTC', () => {
  assert.equal(parisDay('2026-11-04T23:30:00Z'), '2026-11-05');
  assert.equal(parisDay('2026-07-04T22:30:00Z'), '2026-07-05');
});

import test from 'node:test';
import assert from 'node:assert/strict';

import { getInvaderX } from '../src/game-layout.js';

const layout = {
  canvasWidth: 600,
  invaderWidth: 30,
  preferredPadding: 10,
  sideMargin: 30,
};

test('every configured formation fits inside the canvas', () => {
  for (const columns of [10, 12, 14, 16, 18]) {
    const positions = Array.from({ length: columns }, (_, column) =>
      getInvaderX({ ...layout, column, columns }));

    assert.ok(positions[0] >= layout.sideMargin);
    assert.ok(
      positions.at(-1) + layout.invaderWidth <=
        layout.canvasWidth - layout.sideMargin + Number.EPSILON,
      `${columns}-column formation extends beyond the canvas`,
    );
    assert.equal(new Set(positions).size, columns);
  }
});

test('smaller formations retain the preferred spacing', () => {
  assert.equal(getInvaderX({ ...layout, column: 9, columns: 10 }), 390);
});

test('dense formations use the full safe width', () => {
  const x = getInvaderX({ ...layout, column: 17, columns: 18 });
  assert.equal(x + layout.invaderWidth, layout.canvasWidth - layout.sideMargin);
});

test('invalid formation coordinates are rejected', () => {
  assert.throws(
    () => getInvaderX({ ...layout, column: 2, columns: 2 }),
    /column must be within/,
  );
  assert.throws(
    () => getInvaderX({ ...layout, column: 0, columns: 0 }),
    /columns must be a positive integer/,
  );
});
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateProjectionBalances } = require('../services/projectionBudgetMath');

test('remaining budget uses latest allocations instead of stale saved remaining', () => {
  const result = calculateProjectionBalances(
    [{ id: 1, projection_id: 1, total_budget_value: '25200.00' }],
    [
      { projection_id: 1, total_cost: '5000.00' },
      { projection_id: 1, total_cost: '7000.00' },
      { projection_id: 1, total_cost: '10000.00' },
      { projection_id: 1, total_cost: '300.00' },
    ],
    1,
  );

  assert.deepEqual(result, {
    effective_budget: 25200,
    remaining_budget: 2900,
    remaining_percentage: (2900 / 25200) * 100,
  });
});

test('remaining budget includes funds carried forward from earlier projections', () => {
  const result = calculateProjectionBalances(
    [
      { id: 1, projection_id: 1, total_budget_value: '1000.00' },
      { id: 2, projection_id: 2, total_budget_value: '500.00' },
    ],
    [
      { projection_id: 1, total_cost: '700.00' },
      { projection_id: 2, total_cost: '600.00' },
    ],
    2,
  );

  assert.deepEqual(result, {
    effective_budget: 800,
    remaining_budget: 200,
    remaining_percentage: 25,
  });
});

test('returns null when the requested projection has no saved budget', () => {
  assert.equal(
    calculateProjectionBalances(
      [{ id: 1, projection_id: 1, total_budget_value: '1000.00' }],
      [],
      2,
    ),
    null,
  );
});

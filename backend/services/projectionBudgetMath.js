const toMinorUnits = (value) => {
  const amount = Number(value) || 0;
  return Math.round(amount * 100);
};

const fromMinorUnits = (value) => Number((value / 100).toFixed(2));

const calculateProjectionBalances = (budgetRows, allocationRows, targetProjectionId) => {
  const budgetsByProjection = new Map();
  budgetRows
    .slice()
    .sort((left, right) => Number(left.id) - Number(right.id))
    .forEach((row) => {
      budgetsByProjection.set(Number(row.projection_id), toMinorUnits(row.total_budget_value));
    });

  const allocatedByProjection = new Map();
  allocationRows.forEach((row) => {
    const projectionId = Number(row.projection_id);
    allocatedByProjection.set(
      projectionId,
      (allocatedByProjection.get(projectionId) || 0) + toMinorUnits(row.total_cost),
    );
  });

  const projectionIds = [...budgetsByProjection.keys()].sort((left, right) => left - right);
  let carriedRemaining = 0;
  let targetBalance = null;
  projectionIds.forEach((projectionId) => {
    const effectiveBudget = budgetsByProjection.get(projectionId) + carriedRemaining;
    const remainingBudget = effectiveBudget - (allocatedByProjection.get(projectionId) || 0);
    const remainingPercentage = effectiveBudget > 0
      ? (remainingBudget / effectiveBudget) * 100
      : 0;

    if (projectionId === Number(targetProjectionId)) {
      targetBalance = {
        effective_budget: fromMinorUnits(effectiveBudget),
        remaining_budget: fromMinorUnits(remainingBudget),
        remaining_percentage: remainingPercentage,
      };
    }
    carriedRemaining = remainingBudget;
  });

  return targetBalance;
};

module.exports = { calculateProjectionBalances };

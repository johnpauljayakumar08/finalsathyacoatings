import React, { useCallback, memo } from "react";  // Add memo
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const BudgetCharts = ({ chartData, expenseChartData }) => {
  const formatter = useCallback((value) => [`Rs.${value.toFixed(2)}`, "Amount"], []);

  if (!chartData || !expenseChartData) {
    return <div className="col-span-full text-gray-500">No chart data available yet.</div>;  // Graceful fallback
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Total Budget Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Budget Overview (Budgeted vs Actual vs Balance)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} key={`budget-${JSON.stringify(chartData.map(d => d.value))}`}>  {/* Stable key based on data values */}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatter} />
              <Bar dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Expenses Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Expense-wise Allocation (Budgeted vs Actual)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseChartData} key={`expense-${JSON.stringify(expenseChartData.map(d => d.name))}`}>  {/* Stable key based on names */}
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatter} />
              <Bar dataKey="budgeted" fill="#92c352" name="Budgeted" />
              <Bar dataKey="actual" name="Actual">
                {expenseChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.actualFill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default memo(BudgetCharts);  // Memoize to skip if data unchanged
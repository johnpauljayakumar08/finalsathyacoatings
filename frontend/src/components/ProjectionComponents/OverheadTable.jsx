import React from "react";
import { Plus, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const OverheadTable = ({
  overheads,
  isAllocated,
  checkedExpenses,
  actualBudgetEntries,
  sumPerc,
  sumBudget,
  total,
  percError,
  budgetError,
  successMessage,
  isValid,
  loading,
  existingBudget,
  onSaveOverhead,
  onExpenseCheckboxChange,
  onPercentageChange,
  onSplittedBudgetChange,
  onAllocateBudget,
}) => {
  const handleSaveOverheadClick = () => onSaveOverhead(); // Wrapper for onSaveOverhead

  if (overheads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isAllocated ? "Budget Allocated" : "Allocate Budget"}
          </h2>
          {!isAllocated && (
            <button
              onClick={handleSaveOverheadClick}
              className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <Plus className="mr-2" size={16} />
              Add New Overhead
            </button>
          )}
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            No overheads found. Add some overheads to begin budget allocation.
          </p>
          <button
            onClick={handleSaveOverheadClick}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Add New Overhead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {isAllocated ? "Budget Allocated" : "Allocate Budget"}
        </h2>
        {!isAllocated && (
          <button
            onClick={handleSaveOverheadClick}
            className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <Plus className="mr-2" size={16} />
            Add New Overhead
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
              {!isAllocated && (
                <th className="border border-gray-300 px-4 py-2 text-left">Select</th>
              )}
              <th className="border border-gray-300 px-4 py-2 text-left">
                List of Expense{" "}
                {!isAllocated && (
                  <button
                    onClick={handleSaveOverheadClick}
                    className="ml-2 text-green-600 hover:text-green-800"
                    title="Add new overhead"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Budget Percentage (%){successMessage && (
                  <span className="text-green-600 text-sm">{successMessage}</span>
                )}
                {percError && !successMessage && (
                  <span className="text-red-600 text-sm">{percError}</span>
                )}
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">
                Budgeted Value (Rs.){successMessage && (
                  <span className="text-green-600 text-sm">{successMessage}</span>
                )}
                {budgetError && !successMessage && (
                  <span className="text-red-600 text-sm">{budgetError}</span>
                )}
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actual Value (Rs.)</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Balance (Rs.)</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {overheads.map((overhead, index) => {
              const balance =
                actualBudgetEntries[overhead.id]?.splitted_budget &&
                actualBudgetEntries[overhead.id]?.actual_value
                  ? parseFloat(actualBudgetEntries[overhead.id].splitted_budget) -
                    parseFloat(actualBudgetEntries[overhead.id].actual_value)
                  : null;

              return (
                <tr key={overhead.id}>
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  {!isAllocated && (
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={checkedExpenses[overhead.id] || false}
                        onChange={() => onExpenseCheckboxChange(overhead.id)}
                        disabled={overhead.is_default === 1}
                      />
                    </td>
                  )}
                  <td className="border border-gray-300 px-4 py-2">{overhead.expense_name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isAllocated ? (
                      actualBudgetEntries[overhead.id]?.percentage || "N/A"
                    ) : checkedExpenses[overhead.id] ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={actualBudgetEntries[overhead.id]?.percentage || ""}
                        onChange={(e) => onPercentageChange(overhead.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {isAllocated ? (
                      actualBudgetEntries[overhead.id]?.splitted_budget || "N/A"
                    ) : checkedExpenses[overhead.id] ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={actualBudgetEntries[overhead.id]?.splitted_budget || ""}
                        onChange={(e) => onSplittedBudgetChange(overhead.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {actualBudgetEntries[overhead.id]?.actual_value || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {balance !== null ? (
                      <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                        {balance.toFixed(2)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {actualBudgetEntries[overhead.id]?.remarks || "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total Row */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Total Percentage:</span>
            <span
              className={`ml-2 font-semibold ${
                Math.abs(sumPerc - 100) <= 0.01 ? "text-green-600" : "text-red-600"
              }`}
            >
              {sumPerc.toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="font-medium">Total Budget:</span>
            <span
              className={`ml-2 font-semibold ${
                Math.abs(sumBudget - total) <= 0.01 ? "text-green-600" : "text-red-600"
              }`}
            >
              Rs.{sumBudget.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="font-medium">Target Budget:</span>
            <span className="ml-2 font-semibold text-indigo-600">Rs.{total.toFixed(2)}</span>
          </div>
        </div>
        {successMessage && (
          <div className="mt-2 text-green-600 font-medium">{successMessage}</div>
        )}
        {!successMessage && (percError || budgetError) && (
          <div className="mt-2 text-red-600 font-medium">
            {percError && <div>{percError}</div>}
            {budgetError && <div>{budgetError}</div>}
          </div>
        )}
      </div>

      {/* Allocate Button */}
      {!isAllocated && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onAllocateBudget}
            className={`px-6 py-3 font-semibold rounded-lg focus:outline-none focus:ring-2 ${
              isValid
                ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-400"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!isValid || loading}
          >
            {loading ? (
              <Loader2 className="animate-spin inline-block mr-2" size={16} />
            ) : null}
            Allocate Budget
          </button>
        </div>
      )}
    </div>
  );
};

export default OverheadTable;
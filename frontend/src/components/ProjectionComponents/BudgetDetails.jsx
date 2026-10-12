import React from "react";

const BudgetDetails = ({
  budgetData,
  selectedCompany,
  selectedProject,
  selectedSite,
  selectedWorkDescription,
  existingBudget,
  isAllocated,
  overheads,
  checkedExpenses,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">PO Budget Details</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Total PO Quantity</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Unit of Measure</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Total Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">{budgetData.total_po_qty}</td>
              <td className="border border-gray-300 px-4 py-2">{budgetData.uom}</td>
              <td className="border border-gray-300 px-4 py-2">Rs.{budgetData.total_rate.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <span className="text-lg font-semibold text-indigo-600">
          Total PO Value: Rs.{budgetData.total_po_value.toFixed(2)}
        </span>
      </div>

      {/* Current Selection, Budget Info, Allocation Status */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Current Selection</h4>
          <p className="text-sm">Company: {selectedCompany?.label || "Not selected"}</p>
          <p className="text-sm">Project: {selectedProject?.label || "Not selected"}</p>
          <p className="text-sm">Site: {selectedSite?.label || "Not selected"}</p>
          <p className="text-sm">Work Description: {selectedWorkDescription?.label || "Not selected"}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Budget Information</h4>
          <p className="text-sm">PO Value: Rs.{budgetData.total_po_value.toFixed(2)}</p>
          <p className="text-sm">
            Existing Budget Value: {existingBudget ? `Rs.${existingBudget.total_budget_value.toFixed(2)}` : "Not set"}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Allocation Status</h4>
          <p className="text-sm">Status: {isAllocated ? "Budget Allocated" : "Pending Allocation"}</p>
          <p className="text-sm">Total Overheads: {overheads.length}</p>
          <p className="text-sm">Selected Overheads: {Object.values(checkedExpenses).filter(Boolean).length}</p>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetails;
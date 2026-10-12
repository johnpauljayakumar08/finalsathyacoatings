import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, PlusCircle, Trash2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import MaterialPlanning from "../../pages/contract/MaterialPlanning"; // Adjust path as needed

const ProjectionItem = ({
  projection,
  budgetData,
  overheads,
  selectedSite,
  selectedWorkDescription,
  loading,
  onToggleProjection,
  onUpdateProjectionField,
  onBudgetPercentageChange,
  onBudgetValueChange,
  onSavePoBudget,
  onSelectOverhead,
  onAddNewOverhead,
  onTotalCostChange,
  onLabourCalculationTypeChange,
  onNoOfLaboursChange,
  onTotalShiftsChange,
  onRatePerShiftChange,
  onSaveLabourOverhead,
  onRemoveOverhead,
  onDynamicOverheadChange,
  onSaveDynamicOverhead,
  onFinalSubmission,
  selectedCompany,
  selectedProject,
  existingBudgets,  // Add this prop
}) => {
  // Local state for displaying allocated budget details
  const [allocatedBudget, setAllocatedBudget] = useState(null);

  // Update allocatedBudget when existingBudgets changes
 useEffect(() => {
    const budgetForProjection = existingBudgets.find(b => b.projection_id === projection.id);
    if (budgetForProjection) {
      const percentage = budgetData?.total_po_value > 0 
        ? ((budgetForProjection.total_budget_value / budgetData.total_po_value) * 100).toFixed(2) 
        : 0;
      setAllocatedBudget({
        value: budgetForProjection.total_budget_value.toFixed(2),
        percentage: percentage,
        projectionId: budgetForProjection.projection_id,
      });
    } else {
      setAllocatedBudget(null);
    }
  }, [existingBudgets, budgetData, projection.id]);
  // Local calculation for remaining budget to avoid prop function calls during render
  const totalAllocated = projection.materialTotalCost +
    projection.labourTotalCost +
    Object.values(projection.dynamicOverheads || {}).reduce(
      (sum, overhead) => sum + (parseFloat(overhead?.value) || 0),
      0
    );
  const remainingBudget = (projection.budgetValue || 0) - totalAllocated;

  const handleAddOverheadClick = () => {
    Swal.fire({
      title: "Select Overhead",
      input: "select",
      inputOptions: overheads
        .filter((oh) => oh.is_default === 0)
        .filter((oh) => !projection.selectedDynamicOverheads.some((selected) => selected.id === oh.id))
        .reduce((options, overhead) => {
          options[overhead.id] = overhead.expense_name;
          return options;
        }, {}),
      inputPlaceholder: "Select an overhead",
      showCancelButton: true,
      confirmButtonText: "Add",
      confirmButtonColor: "#4f46e5",
      showDenyButton: true,
      denyButtonText: "Add New Overhead",
      denyButtonColor: "#22c55e",
      inputValidator: (value) => {
        if (!value) {
          return "Please select an overhead!";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const selectedOverhead = overheads.find((oh) => oh.id === parseInt(result.value));
        onSelectOverhead(selectedOverhead, projection.id);
        onUpdateProjectionField(projection.id, 'activeOverheadTab', `overhead-${selectedOverhead.id}`);
      } else if (result.isDenied) {
        onAddNewOverhead();
      }
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => onToggleProjection(projection.id)}
      >
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">{projection.name}</h3>
          {projection.budgetAllocated && allocatedBudget && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
              <span>Budget Allocated</span>
              <span className="text-green-600 font-medium">
                {allocatedBudget.percentage}% (Rs. {allocatedBudget.value})
              </span>
            </span>
          )}
          {projection.budgetAllocated && !allocatedBudget && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Budget Allocated
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {projection.isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {projection.isOpen && (
        <div className="p-4 border-t border-gray-200">
          {/* Budget Allocation for this projection - Always show, but read-only if allocated */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-medium mb-3">Budget Allocation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Percentage (%)
                </label>
                {projection.budgetAllocated ? (
                  <input
                    type="text"
                    value={`${projection.budgetPercentage || 0}%`}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    max="100"
                    min="0"
                    value={projection.budgetPercentage}
                    onChange={(e) => onBudgetPercentageChange(projection.id, e)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Enter percentage"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Value (Rs.)
                </label>
                {projection.budgetAllocated ? (
                  <input
                    type="text"
                    value={`Rs. ${projection.budgetValue || 0}`}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={projection.budgetValue}
                    onChange={(e) => onBudgetValueChange(projection.id, e)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Enter budget value"
                  />
                )}
              </div>

              {!projection.budgetAllocated && (
                <div className="flex items-end">
                  <button
                    onClick={() => onSavePoBudget(projection.id)}
                    className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    disabled={loading || !projection.budgetPercentage || !projection.budgetValue}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin inline-block mr-2" size={16} />
                    ) : null}
                    Save Budget
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Overhead Allocation Tabs - Only if budget allocated */}
          {projection.budgetAllocated && (
            <>
              <div className="flex space-x-2 mb-6 border-b overflow-x-auto">
                {[
                  { key: "material", label: "Material" },
                  { key: "labour", label: "Labour" },
                  ...projection.selectedDynamicOverheads.map((overhead) => ({
                    key: `overhead-${overhead.id}`,
                    label: overhead.expense_name,
                  })),
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`px-4 py-2 font-medium whitespace-nowrap ${
                      projection.activeOverheadTab === tab.key
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                    onClick={() => onUpdateProjectionField(projection.id, 'activeOverheadTab', tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleAddOverheadClick}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  <PlusCircle className="mr-2" size={16} />
                  Add Overhead
                </button>
              </div>

              {/* Material Overhead Tab */}
              {projection.activeOverheadTab === "material" && (
                <div>
                  <h4 className="text-lg font-medium mb-4">Material Overhead</h4>
                  <MaterialPlanning
                    selectedCompany={selectedCompany}
                    selectedProject={selectedProject}
                    selectedSite={selectedSite}
                    selectedWorkDesc={selectedWorkDescription}
                    existingBudget={budgetData} // Note: Using budgetData as existingBudget prop
                    onTotalCostChange={onTotalCostChange(projection.id)}
                  />
                </div>
              )}

              {/* Labour Overhead Tab */}
              {projection.activeOverheadTab === "labour" && (
                <div>
                  <h4 className="text-lg font-medium mb-4">Labour Overhead</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Calculation Type</label>
                      <select
                        value={projection.labourCalculationType}
                        onChange={(e) => onLabourCalculationTypeChange(projection.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Type</option>
                        <option value="no_of_labours">No of Labours</option>
                        <option value="total_shifts">Total Estimated Shifts</option>
                      </select>
                    </div>
                  </div>
                  {projection.labourCalculationType && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {projection.labourCalculationType === "no_of_labours" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">No of Labours</label>
                          <input
                            type="number"
                            value={projection.noOfLabours}
                            onChange={(e) => onNoOfLaboursChange(projection.id, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Enter number of labours"
                          />
                        </div>
                      )}
                      {projection.labourCalculationType === "total_shifts" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Total Estimated Shifts</label>
                          <input
                            type="number"
                            value={projection.totalShifts}
                            onChange={(e) => onTotalShiftsChange(projection.id, e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            placeholder="Enter total shifts"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium mb-2">Rate per Shift</label>
                        <input
                          type="number"
                          value={projection.ratePerShift}
                          onChange={(e) => onRatePerShiftChange(projection.id, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder="Enter rate per shift"
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total Labour Cost:</span>
                      <span className="text-lg font-semibold">Rs. {projection.labourTotalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Budget Percentage:</span>
                      <span className="text-lg font-semibold">{projection.labourBudgetPercentage.toFixed(2)}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSaveLabourOverhead(projection.id)}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Save Labour Overhead
                  </button>
                </div>
              )}

              {/* Dynamic Overhead Tabs */}
              {projection.selectedDynamicOverheads.map((overhead) => (
                projection.activeOverheadTab === `overhead-${overhead.id}` && (
                  <div key={overhead.id} className="relative">
                    <h4 className="text-lg font-medium mb-4">{overhead.expense_name} Overhead</h4>
                    <button
                      onClick={() => onRemoveOverhead(overhead.id, projection.id)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                      title={`Remove ${overhead.expense_name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {overhead.expense_name} Value
                        </label>
                        <input
                          type="number"
                          value={projection.dynamicOverheads[overhead.id]?.value || ""}
                          onChange={(e) =>
                            onDynamicOverheadChange(projection.id, overhead.id, e.target.value)
                          }
                          max={remainingBudget}
                          className="w-full p-2 border border-gray-300 rounded-lg"
                          placeholder={`Enter ${overhead.expense_name} value`}
                        />
                        <p className="text-sm text-gray-600 mt-1">
                          Remaining Budget: Rs. {remainingBudget.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Budget Percentage</label>
                        <input
                          type="text"
                          value={`${(projection.dynamicOverheads[overhead.id]?.budgetPercentage || 0).toFixed(2)}%`}
                          readOnly
                          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => onSaveDynamicOverhead(projection.id, overhead.id, overhead.expense_name)}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Save {overhead.expense_name} Overhead
                    </button>
                  </div>
                )
              ))}

              {/* Budget Allocation Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-lg font-medium mb-3">Budget Allocation Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>Total Material Cost: Rs. {projection.materialTotalCost.toFixed(2)}</p>
                    <p>Material Budget Percentage: {projection.materialBudgetPercentage.toFixed(2)}%</p>
                    <p>Total Labour Cost: Rs. {projection.labourTotalCost.toFixed(2)}</p>
                    <p>Labour Budget Percentage: {projection.labourBudgetPercentage.toFixed(2)}%</p>
                  </div>
                  <div>
                    {projection.selectedDynamicOverheads.map((overhead) => {
                      const dyn = projection.dynamicOverheads[overhead.id] || {};
                      return (
                        <div key={overhead.id}>
                          <p>Total {overhead.expense_name} Cost: Rs. {(parseFloat(dyn.value) || 0).toFixed(2)}</p>
                          <p>{overhead.expense_name} Budget Percentage: { (dyn.budgetPercentage || 0).toFixed(2) }%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="font-semibold">
                    Total Allocated: Rs. {totalAllocated.toFixed(2)}
                  </p>
                  <p className="font-semibold">Remaining Budget: Rs. {remainingBudget.toFixed(2)}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => onFinalSubmission(projection.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Final Submission ({projection.name})
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectionItem;
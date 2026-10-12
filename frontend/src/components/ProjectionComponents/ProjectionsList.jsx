import React, { useMemo } from "react";
import { PlusCircle } from "lucide-react";
import ProjectionItem from "./ProjectionItem";

const ProjectionsList = ({
  projections,
  budgetData,
  overheads,
  selectedSite,
  selectedWorkDescription,
  loading,
  canAddProjection,
  onAddProjection,
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
  onCalculateRemainingBudget,
  onSaveDynamicOverhead,
  onFinalSubmission,
  selectedCompany,
  selectedProject,
  existingBudgets,  // Add this to props
}) => {
  const projectionItems = useMemo(() => 
    projections.map((projection) => (
      <ProjectionItem
        key={projection.id}
        projection={projection}
        budgetData={budgetData}
        overheads={overheads}
        selectedSite={selectedSite}
        selectedWorkDescription={selectedWorkDescription}
        loading={loading}
        onToggleProjection={onToggleProjection}
        onUpdateProjectionField={onUpdateProjectionField}
        onBudgetPercentageChange={onBudgetPercentageChange}
        onBudgetValueChange={onBudgetValueChange}
        onSavePoBudget={onSavePoBudget}
        onSelectOverhead={onSelectOverhead}
        onAddNewOverhead={onAddNewOverhead}
        onTotalCostChange={onTotalCostChange}
        onLabourCalculationTypeChange={onLabourCalculationTypeChange}
        onNoOfLaboursChange={onNoOfLaboursChange}
        onTotalShiftsChange={onTotalShiftsChange}
        onRatePerShiftChange={onRatePerShiftChange}
        onSaveLabourOverhead={onSaveLabourOverhead}
        onRemoveOverhead={onRemoveOverhead}
        onDynamicOverheadChange={onDynamicOverheadChange}
        onCalculateRemainingBudget={onCalculateRemainingBudget}
        onSaveDynamicOverhead={onSaveDynamicOverhead}
        onFinalSubmission={onFinalSubmission}
        selectedCompany={selectedCompany}
        selectedProject={selectedProject}
        existingBudgets={existingBudgets}  // Pass the array
      />
    )), [
      projections, budgetData, overheads, selectedSite, selectedWorkDescription, loading,
      onToggleProjection, onUpdateProjectionField, onBudgetPercentageChange, onBudgetValueChange,
      onSavePoBudget, onSelectOverhead, onAddNewOverhead, onTotalCostChange, onLabourCalculationTypeChange,
      onNoOfLaboursChange, onTotalShiftsChange, onRatePerShiftChange, onSaveLabourOverhead,
      onRemoveOverhead, onDynamicOverheadChange, onCalculateRemainingBudget, onSaveDynamicOverhead,
      onFinalSubmission, selectedCompany, selectedProject, existingBudgets  // Add this to dependencies
    ]
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Overhead Allocation Projections</h2>
        <button
          onClick={onAddProjection}
          disabled={!canAddProjection}
          className={`flex items-center px-4 py-2 font-semibold rounded-lg ${
            canAddProjection
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <PlusCircle className="mr-2" size={16} />
          Add New Projection
        </button>
      </div>

      {/* Projection Items */}
      {projectionItems}
    </div>
  );
};

export default ProjectionsList;
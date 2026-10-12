import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Swal from "sweetalert2";
import { Plus, PlusCircle, Trash2, Loader2, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Edit2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useParams } from "react-router-dom";

const ProjectProjectionNew = () => {
  const { encodedUserId } = useParams();
  // Existing state (unchanged except add submitted to projections)
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedWorkDescription, setSelectedWorkDescription] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [existingBudget, setExistingBudget] = useState(null);
  const [overheads, setOverheads] = useState([]);
  const [actualBudgetEntries, setActualBudgetEntries] = useState({});
  const [isAllocated, setIsAllocated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [materialActual, setMaterialActual] = useState(0);
  // Updated projections state with submitted flag
  const [projections, setProjections] = useState([
    {
      id: 1,
      name: "Projection 1",
      isOpen: true,
      budgetAllocated: false,
      submitted: false, // New: track submission
      budgetPercentage: "",
      additionalPercentage: 0,
      budgetValue: "",
      materialTotalCost: 0,
      materialBudgetPercentage: 0,
      labourTotalCost: 0,
      labourBudgetPercentage: 0,
      remainingBudget: 0,
      remainingPercentage: 0,
      labourCalculationType: "",
      noOfLabours: "",
      totalShifts: "",
      ratePerShift: "",
      selectedDynamicOverheads: [],
      dynamicOverheads: {},
      allocatedOverheads: [], // New: store fetched allocated
      activeOverheadTab: "material",
      prevRemainingBudget: 0, // New: previous remaining added to this
      prevRemainingPercentage: 0 // New: previous remaining percentage for display
    }
  ]);
  // New: submission statuses fetched from backend (now includes po_budget_id)
  const [submissionStatuses, setSubmissionStatuses] = useState({});
  // New states for MaterialPlanning integration
  const [materials, setMaterials] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [materialAssignments, setMaterialAssignments] = useState({});
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [materialLoading, setMaterialLoading] = useState({
    materials: false,
    uoms: false,
    assignedMaterials: false,
    submitting: false,
  });
  const [materialError, setMaterialError] = useState(null);
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [currentDescId, setCurrentDescId] = useState(null);
  const [currentMatIndex, setCurrentMatIndex] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [activeMaterialProjId, setActiveMaterialProjId] = useState(null);
  // Memoized chart data (updated: use last projection's budgetValue only, no + prevRem)
  const lastProjection = useMemo(() => projections[projections.length - 1], [projections]);
  const effectiveBudgetValue = useMemo(() => {
    const lastBudget = parseFloat(lastProjection.budgetValue || 0);
    return lastBudget + (lastProjection.prevRemainingBudget || 0);
  }, [lastProjection]);
  const activeProjection = useMemo(() => projections.find(p => p.id === activeMaterialProjId), [projections, activeMaterialProjId]);
  const projectionBudgetValue = useMemo(() => activeProjection?.budgetValue || "0", [activeProjection]);
  const allocatedOverheads = useMemo(() =>
    Object.values(actualBudgetEntries).map(entry => ({
      id: entry.overhead_id || Math.random(),
      expense_name: entry.expense_name,
      percentage: entry.percentage,
      splitted_budget: entry.splitted_budget,
      actual_value: entry.expense_name?.toLowerCase() === 'materials'
        ? materialActual.toFixed(2)
        : (entry.actual_value !== null ? parseFloat(entry.actual_value).toFixed(2) : null),
      difference_value: entry.expense_name?.toLowerCase() === 'materials'
        ? (parseFloat(entry.splitted_budget) - materialActual).toFixed(2)
        : (entry.difference_value !== null ? parseFloat(entry.difference_value).toFixed(2) : null),
      remarks: entry.remarks || "",
    })), [actualBudgetEntries, materialActual]
  );
  const chartData = useMemo(() => {
    if (!existingBudget || allocatedOverheads.length === 0) {
      return [];
    }
    const budgetedValue = effectiveBudgetValue;
    const actualValue = allocatedOverheads
      .filter((entry) => entry.actual_value !== null)
      .reduce((sum, entry) => sum + parseFloat(entry.actual_value || 0), 0);
    const balanceValue = budgetedValue - actualValue;
    return [
      { name: "Budgeted Value", value: budgetedValue, fill: "#10b981" },
      { name: "Actual Value", value: actualValue, fill: "#3b82f6" },
      { name: "Balance", value: Math.abs(balanceValue), fill: balanceValue < 0 ? "#ef4444" : "#f59e0b" },
    ];
  }, [existingBudget, allocatedOverheads, effectiveBudgetValue]);
  const expenseChartData = useMemo(() => {
    if (!isAllocated || allocatedOverheads.length === 0) {
      return [];
    }
    return allocatedOverheads.map((entry) => {
      const budgeted = parseFloat(entry.splitted_budget) || 0;
      const actual = parseFloat(entry.actual_value) || 0;
      const actualExceedsBudget = actual > budgeted;
      return {
        name: entry.expense_name,
        budgeted: budgeted,
        actual: actual,
        actualFill: actualExceedsBudget ? "#ef4444" : "#3b82f6",
      };
    });
  }, [allocatedOverheads, isAllocated]);
  // Memoized sums for allocated data (updated to effective)
  const { sumPerc, sumBudget } = useMemo(() => {
    const percSum = allocatedOverheads.reduce((sum, oh) => sum + parseFloat(oh.percentage || 0), 0);
    const budgetSum = allocatedOverheads.reduce((sum, oh) => sum + parseFloat(oh.splitted_budget || 0), 0);
    return { sumPerc: percSum, sumBudget: budgetSum };
  }, [allocatedOverheads]);
  const total = useMemo(() => effectiveBudgetValue, [effectiveBudgetValue]);
  const percDiff = useMemo(() => sumPerc - 100, [sumPerc]);
  const budgetDiff = useMemo(() => sumBudget - total, [sumBudget, total]);
  const percError = useMemo(() =>
    percDiff > 0.01 ? `Excess by ${percDiff.toFixed(2)}%` : percDiff < -0.01 ? `Short by ${Math.abs(percDiff).toFixed(2)}%` : "",
    [percDiff]
  );
  const budgetError = useMemo(() =>
    budgetDiff > 0.01 ? `Excess by Rs.${budgetDiff.toFixed(2)}` : budgetDiff < -0.01 ? `Short by Rs.${Math.abs(budgetDiff).toFixed(2)}` : "",
    [budgetDiff]
  );
  // MaterialPlanning memos
const materialsForCurrentDesc = useMemo(() => {
  return materialAssignments[selectedWorkDescription?.value] || [];
}, [materialAssignments, selectedWorkDescription?.value]);
const overallMaterials = useMemo(() => {
  return [...existingAssignments, ...materialsForCurrentDesc];
}, [existingAssignments, materialsForCurrentDesc]);
const calculateTotalCost = useCallback((mat) => {
  const quantity = parseFloat(mat.quantity) || 0;
  const rate = parseFloat(mat.rate) || 0;
  return (quantity * rate).toFixed(2);
}, []);
const calculateCompQuantities = useCallback((mat) => {
  const quantity = parseFloat(mat.quantity) || 0;
  const comp_a = parseInt(mat.comp_ratio_a) || 0;
  const comp_b = parseInt(mat.comp_ratio_b) || 0;
  const comp_c = parseInt(mat.comp_ratio_c) || 0;
  const total_parts = comp_a + comp_b + comp_c;
  if (total_parts === 0) {
    return { comp_a_qty: 0, comp_b_qty: 0, comp_c_qty: 0 };
  }
  return {
    comp_a_qty: ((comp_a / total_parts) * quantity).toFixed(2),
    comp_b_qty: ((comp_b / total_parts) * quantity).toFixed(2),
    comp_c_qty: ((comp_c / total_parts) * quantity).toFixed(2),
  };
}, []);
const overallCost = useMemo(() => {
  return overallMaterials.reduce((total, mat) => {
    const cost = parseFloat(calculateTotalCost(mat)) || 0;
    return total + cost;
  }, 0).toFixed(2);
}, [overallMaterials, calculateTotalCost]);
const overallPercentage = useMemo(() => {
  const bv = parseFloat(projectionBudgetValue) || 0;
  return bv > 0 ? (parseFloat(overallCost) / bv * 100) : 0;
}, [overallCost, projectionBudgetValue]);
// Moved to top level: Computations for editing modal
const editCompQuantities = useMemo(() => {
  if (!editingAssignment) {
    return { comp_a_qty: 0, comp_b_qty: 0, comp_c_qty: 0 };
  }
  return calculateCompQuantities(editingAssignment);
}, [editingAssignment, calculateCompQuantities]);
const modalTotalCost = useMemo(() => {
  if (!editingAssignment) {
    return '0.00';
  }
  return calculateTotalCost(editingAssignment);
}, [editingAssignment, calculateTotalCost]);
  // New: Fetch submission statuses from backend
  const fetchSubmissionStatuses = useCallback(async () => {
    if (!selectedSite?.value || !selectedWorkDescription?.value) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/projection/check-final-submission-status`, {
        params: { site_id: selectedSite.value, desc_id: selectedWorkDescription.value },
      });
      if (response.data.success) {
        const statuses = {};
        response.data.data.forEach(status => {
          statuses[status.projection_id] = { submitted: status.submitted, po_budget_id: status.po_budget_id };
        });
        setSubmissionStatuses(statuses);
        // Update projections
        setProjections(prev => prev.map(p => ({
          ...p,
          submitted: statuses[p.id]?.submitted || false
        })));
      }
    } catch (error) {
      console.error("Error fetching submission statuses:", error);
    }
  }, [selectedSite, selectedWorkDescription]);
  // New: Fetch allocated for projection
  const fetchAllocatedOverheads = useCallback(async (projId) => {
    if (!selectedSite?.value || !selectedWorkDescription?.value) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/projection/allocated`, {
        params: { site_id: selectedSite.value, desc_id: selectedWorkDescription.value, projection_id: projId },
      });
      if (response.data.success) {
        setProjections(prev => prev.map(p =>
          p.id === projId ? { ...p, allocatedOverheads: response.data.data, prevRemainingBudget: response.data.prev_remaining.prev_remaining_budget, prevRemainingPercentage: response.data.prev_remaining.prev_remaining_percentage } : p
        ));
      }
    } catch (error) {
      console.error("Error fetching allocated:", error);
    }
  }, [selectedSite, selectedWorkDescription]);
  // New: Fetch remaining for projection
  const fetchRemainingBudget = useCallback(async (projId) => {
    if (!selectedSite?.value || !selectedWorkDescription?.value) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/projection/remaining`, {
        params: { site_id: selectedSite.value, desc_id: selectedWorkDescription.value, projection_id: projId },
      });
      if (response.data.success) {
        setProjections(prev => prev.map(p =>
          p.id === projId ? { ...p, remainingBudget: response.data.data.remaining_budget, remainingPercentage: response.data.data.remaining_percentage, effectiveBudget: response.data.data.effective_budget } : p
        ));
      }
    } catch (error) {
      console.error("Error fetching remaining:", error);
    }
  }, [selectedSite, selectedWorkDescription]);
  // MaterialPlanning functions
  const fetchMaterials = useCallback(async () => {
    try {
      setMaterialLoading((prev) => ({ ...prev, materials: true }));
      const response = await axios.get(`${API_BASE_URL}/material/materials`);
      setMaterials(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setMaterialError("Failed to load materials. Please try again.");
      setMaterials([]);
    } finally {
      setMaterialLoading((prev) => ({ ...prev, materials: false }));
    }
  }, []);
  const fetchUoms = useCallback(async () => {
    try {
      setMaterialLoading((prev) => ({ ...prev, uoms: true }));
      const response = await axios.get(`${API_BASE_URL}/material/uom`);
      setUoms(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching UOMs:", error);
      setMaterialError("Failed to load UOMs. Please try again.");
    } finally {
      setMaterialLoading((prev) => ({ ...prev, uoms: false }));
    }
  }, []);
  const fetchAssignedMaterials = useCallback(async (site_id, desc_id, proj_id) => {
    if (!site_id || !desc_id || !proj_id) return;
    try {
      setMaterialLoading((prev) => ({ ...prev, assignedMaterials: true }));
      const response = await axios.get(
        `${API_BASE_URL}/material/assigned-materials?site_id=${site_id}&desc_id=${desc_id}&projection_id=${proj_id}`
      );
      const assignedMaterials = Array.isArray(response.data?.data) ? response.data.data : [];
      setExistingAssignments(assignedMaterials);
      // Initialize form with empty row only if no existing assignments
      if (assignedMaterials.length === 0) {
        setMaterialAssignments({
          [desc_id]: [
            {
              item_id: "",
              uom_id: "",
              quantity: "",
              comp_ratio_a: "",
              comp_ratio_b: "",
              comp_ratio_c: "",
              rate: "",
              projection_id: proj_id,
            },
          ],
        });
      } else {
        setMaterialAssignments({ [desc_id]: [] });
      }
    } catch (error) {
      console.error("Error fetching assigned materials:", error);
      setMaterialError("Failed to load assigned materials. Please try again.");
      setExistingAssignments([]);
      setMaterialAssignments({
        [selectedWorkDescription?.value]: [
          {
            item_id: "",
            uom_id: "",
            quantity: "",
            comp_ratio_a: "",
            comp_ratio_b: "",
            comp_ratio_c: "",
            rate: "",
            projection_id: proj_id,
          },
        ],
      });
    } finally {
      setMaterialLoading((prev) => ({ ...prev, assignedMaterials: false }));
    }
  }, []);
  const handleMaterialChange = useCallback((desc_id, matIndex, e) => {
    const { name, value } = e.target;
    setMaterialAssignments((prev) => ({
      ...prev,
      [desc_id]: (prev[desc_id] || []).map((mat, i) =>
        i === matIndex ? { ...mat, [name]: value } : mat
      ),
    }));
    setMaterialError(null);
  }, []);
  const handleItemSelect = useCallback((desc_id, matIndex, selectedOption) => {
    const value = selectedOption && selectedOption.value !== "N/A" ? selectedOption.value : "";
    setMaterialAssignments((prev) => ({
      ...prev,
      [desc_id]: (prev[desc_id] || []).map((mat, i) =>
        i === matIndex ? { ...mat, item_id: value } : mat
      ),
    }));
    if (!value) {
      setMaterialError(`Please select a valid material for Row ${matIndex + 1}.`);
    } else {
      setMaterialError(null);
    }
  }, []);
  const handleAddMaterial = useCallback((desc_id) => {
    setMaterialAssignments((prev) => ({
      ...prev,
      [desc_id]: [
        ...(prev[desc_id] || []),
        {
          item_id: "",
          uom_id: "",
          quantity: "",
          comp_ratio_a: "",
          comp_ratio_b: "",
          comp_ratio_c: "",
          rate: "",
          projection_id: activeMaterialProjId,
        },
      ],
    }));
    setMaterialError(null);
  }, [activeMaterialProjId]);
  const handleRemoveMaterial = useCallback((desc_id, matIndex) => {
    setMaterialAssignments((prev) => {
      const materials = prev[desc_id] || [];
      if (materials.length <= 1) {
        setMaterialError(`At least one material assignment is required.`);
        return prev;
      }
      return {
        ...prev,
        [desc_id]: materials.filter((_, i) => i !== matIndex),
      };
    });
  }, []);
  const handleAddNewMaterial = useCallback(async (inputValue, desc_id, matIndex) => {
    if (!inputValue.trim()) {
      setMaterialError("Material name is required.");
      return;
    }
    try {
      setAddingMaterial(true);
      const response = await axios.post(`${API_BASE_URL}/material/add-material`, {
        item_name: inputValue.trim(),
      });
      if (response.data?.status === "success" && response.data?.data?.item_id) {
        await fetchMaterials();
        const newItemId = response.data.data.item_id;
        setMaterialAssignments((prev) => ({
          ...prev,
          [desc_id]: (prev[desc_id] || []).map((mat, i) =>
            i === matIndex ? { ...mat, item_id: newItemId } : mat
          ),
        }));
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Material Added!",
          text: "New material has been added and selected.",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          background: "#ecfdf5",
          iconColor: "#10b981",
        });
      } else {
        setMaterialError(response.data?.message || "Failed to add material.");
      }
    } catch (error) {
      console.error("Error adding material:", error);
      setMaterialError(error.response?.data?.message || "Failed to add material.");
    } finally {
      setAddingMaterial(false);
    }
  }, [fetchMaterials]);
  const handleEditAssignment = useCallback(async (assignment, projId) => {
    const isSubmitted = submissionStatuses[projId]?.submitted || projections.find(p => p.id === projId)?.submitted;
    if (isSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Edit",
        text: "Editing disabled after submission.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    if (!assignment) {
      console.error("Invalid assignment object");
      setMaterialError("Invalid assignment data for editing.");
      Swal.fire({
        icon: "error",
        title: "Invalid Assignment",
        text: "Cannot edit invalid assignment data. Please refresh and try again.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    console.log("Editing assignment:", assignment);
    const assignmentId = Number(assignment.assignment_id || assignment.id);
    if (!assignmentId || isNaN(assignmentId) || assignmentId === 'undefined') {
      console.log('Invalid assignment_id for edit:', assignmentId);
      setMaterialError("Invalid assignment ID for editing.");
      Swal.fire({
        icon: "error",
        title: "Invalid Assignment",
        text: "Cannot edit assignment with invalid ID. Please refresh and try again.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    setEditingAssignment({
      ...assignment,
      id: assignmentId,
      projection_id: projId
    });
    setShowEditModal(true);
    Swal.fire({
      icon: "info",
      title: "Edit Mode",
      text: "Edit the material details in the modal and click Save.",
      timer: 1500,
      showConfirmButton: false,
    });
  }, [projections, submissionStatuses]);
  const handleSaveEdit = async () => {
    if (!editingAssignment) {
      console.error("Missing editingAssignment");
      setMaterialError("Assignment data is missing. Cannot update.");
      return;
    }
    if (!editingAssignment.id) {
      console.error("Missing assignment ID in editingAssignment:", editingAssignment);
      setMaterialError("Assignment ID is missing. Please refresh the page and try again.");
      return;
    }
    try {
      setMaterialLoading((prev) => ({ ...prev, submitting: true }));
      setMaterialError(null);
      const validationErrors = [];
      if (!editingAssignment.item_id || editingAssignment.item_id === "N/A" || editingAssignment.item_id.trim() === "") {
        validationErrors.push("Material required");
      }
      if (!editingAssignment.uom_id) {
        validationErrors.push("UOM required");
      }
      if (!editingAssignment.quantity || isNaN(editingAssignment.quantity) || parseInt(editingAssignment.quantity) <= 0) {
        validationErrors.push("Positive integer quantity required");
      }
      if (!editingAssignment.rate || isNaN(editingAssignment.rate) || parseFloat(editingAssignment.rate) < 0) {
        validationErrors.push("Non-negative rate required");
      }
      if (editingAssignment.comp_ratio_a && (isNaN(editingAssignment.comp_ratio_a) || parseInt(editingAssignment.comp_ratio_a) < 0)) {
        validationErrors.push("Non-negative comp_ratio_a");
      }
      if (editingAssignment.comp_ratio_b && (isNaN(editingAssignment.comp_ratio_b) || parseInt(editingAssignment.comp_ratio_b) < 0)) {
        validationErrors.push("Non-negative comp_ratio_b");
      }
      if (editingAssignment.comp_ratio_c && (isNaN(editingAssignment.comp_ratio_c) || parseInt(editingAssignment.comp_ratio_c) < 0)) {
        validationErrors.push("Non-negative comp_ratio_c");
      }
      if (validationErrors.length > 0) {
        setMaterialError(validationErrors.join("<br />"));
        return;
      }
      let created_by;
      try {
        created_by = atob(encodedUserId);
        if (!/^\d+$/.test(created_by) || created_by.length > 30) {
          throw new Error("Invalid User ID format or length exceeds 30 characters");
        }
      } catch {
        throw new Error("Invalid User ID in URL");
      }
      const payload = {
        assignment_id: editingAssignment.id,
        item_id: editingAssignment.item_id,
        uom_id: parseInt(editingAssignment.uom_id),
        quantity: parseInt(editingAssignment.quantity),
        comp_ratio_a: editingAssignment.comp_ratio_a ? parseInt(editingAssignment.comp_ratio_a) : null,
        comp_ratio_b: editingAssignment.comp_ratio_b ? parseInt(editingAssignment.comp_ratio_b) : null,
        comp_ratio_c: editingAssignment.comp_ratio_c ? parseInt(editingAssignment.comp_ratio_c) : null,
        rate: parseFloat(editingAssignment.rate),
        projection_id: editingAssignment.projection_id,
        pd_id: editingAssignment.pd_id,
        site_id: editingAssignment.site_id,
        desc_id: editingAssignment.desc_id,
        created_by: created_by,
      };
      console.log("Updating assignment with ID:", editingAssignment.id);
      console.log("Payload:", payload);
      await axios.put(`${API_BASE_URL}/material/assigned-materials`, payload);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Updated!",
        text: "Material assignment updated successfully!",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });
      setShowEditModal(false);
      setEditingAssignment(null);
      await fetchAssignedMaterials(selectedSite.value, selectedWorkDescription.value, editingAssignment.projection_id);
    } catch (error) {
      console.error("Error updating assignment:", error);
      const errorMessage = error.response?.data?.message || "Failed to update assignment.";
      const detailedErrors = error.response?.data?.errors ? error.response.data.errors.join("<br />") : errorMessage;
      setMaterialError(detailedErrors);
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        html: detailedErrors,
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
        background: "#fef2f2",
        iconColor: "#dc2626",
      });
    } finally {
      setMaterialLoading((prev) => ({ ...prev, submitting: false }));
    }
  };
  const handleDeleteAssignment = async (assignmentId, projId) => {
    const isSubmitted = submissionStatuses[projId]?.submitted || projections.find(p => p.id === projId)?.submitted;
    if (isSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Delete",
        text: "Deletion disabled after submission.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    console.log("Deleting assignment ID:", assignmentId);
    console.log("assignment ID",assignmentId)
    if (!assignmentId || assignmentId === 'undefined' || isNaN(assignmentId)) {
      console.error("Invalid assignment ID:", assignmentId);
      Swal.fire({
        icon: "error",
        title: "Invalid Assignment",
        text: "Cannot delete assignment with invalid ID.",
        confirmButtonText: "OK",
      });
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the material assignment permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        console.log("Sending DELETE request for assignment ID:", assignmentId);
        await axios.delete(`${API_BASE_URL}/material/assigned-materials`, {
          data: { assignment_id: assignmentId }
        });
        await fetchAssignedMaterials(selectedSite.value, selectedWorkDescription.value, projId);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Material assignment has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting assignment:", error);
        const errorMessage = error.response?.data?.message || "Failed to delete assignment.";
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: errorMessage,
          confirmButtonText: "OK",
        });
      }
    }
  };
  const handleSubmit = useCallback(async (e, projId) => {
    e.preventDefault();
    const projectionId = projId;
    try {
      setMaterialLoading((prev) => ({ ...prev, submitting: true }));
      setMaterialError(null);
      let created_by;
      try {
        created_by = atob(encodedUserId);
        if (!/^\d+$/.test(created_by) || created_by.length > 30) {
          throw new Error("Invalid User ID format or length exceeds 30 characters");
        }
      } catch {
        throw new Error("Invalid User ID in URL");
      }
      if (!selectedCompany?.value || !selectedProject?.value || !selectedSite?.value || !selectedWorkDescription?.value || !projectionId) {
        setMaterialError("Please select all fields and ensure projection is set.");
        return;
      }
      const validationErrors = [];
      const materialCounts = {};
      const materials = materialAssignments[selectedWorkDescription.value] || [];
      materials.forEach((row) => {
        if (row.item_id && row.item_id !== "N/A" && row.item_id.trim() !== "") {
          materialCounts[row.item_id] = (materialCounts[row.item_id] || 0) + 1;
        }
      });
      Object.entries(materialCounts).forEach(([item_id, count]) => {
        if (count >= 3) {
          validationErrors.push(`Material ${item_id} is assigned ${count} times. Maximum of two allowed.`);
        }
      });
      materials.forEach((row, index) => {
        if (!row.item_id || row.item_id === "N/A" || row.item_id.trim() === "") {
          validationErrors.push(`Row ${index + 1}: Material required`);
        }
        if (!row.uom_id) {
          validationErrors.push(`Row ${index + 1}: UOM required`);
        }
        if (!row.quantity || isNaN(row.quantity) || parseInt(row.quantity) <= 0) {
          validationErrors.push(`Row ${index + 1}: Positive integer quantity required`);
        }
        if (!row.rate || isNaN(row.rate) || parseFloat(row.rate) < 0) {
          validationErrors.push(`Row ${index + 1}: Non-negative rate required`);
        }
        if (row.comp_ratio_a && (isNaN(row.comp_ratio_a) || parseInt(row.comp_ratio_a) < 0)) {
          validationErrors.push(`Row ${index + 1}: Non-negative comp_ratio_a`);
        }
        if (row.comp_ratio_b && (isNaN(row.comp_ratio_b) || parseInt(row.comp_ratio_b) < 0)) {
          validationErrors.push(`Row ${index + 1}: Non-negative comp_ratio_b`);
        }
        if (row.comp_ratio_c && (isNaN(row.comp_ratio_c) || parseInt(row.comp_ratio_c) < 0)) {
          validationErrors.push(`Row ${index + 1}: Non-negative comp_ratio_c`);
        }
      });
      if (validationErrors.length > 0) {
        setMaterialError(validationErrors.join("<br />"));
        return;
      }
      const payload = materials.map((row) => ({
        pd_id: selectedProject.value,
        site_id: selectedSite.value,
        item_id: row.item_id,
        uom_id: parseInt(row.uom_id),
        quantity: parseInt(row.quantity),
        desc_id: String(selectedWorkDescription.value),
        comp_ratio_a: row.comp_ratio_a ? parseInt(row.comp_ratio_a) : null,
        comp_ratio_b: row.comp_ratio_b ? parseInt(row.comp_ratio_b) : null,
        comp_ratio_c: row.comp_ratio_c ? parseInt(row.comp_ratio_c) : null,
        rate: parseFloat(row.rate),
        materialTotalCost: overallCost,
        materialBudgetPercentage: overallPercentage.toFixed(2),
        overhead_type: "materials",
        created_by: created_by,
        projection_id: projectionId,
      }));
      if (payload.length === 0) {
        setMaterialError("Add at least one material.");
        return;
      }
      await axios.post(`${API_BASE_URL}/material/assign-material`, payload);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Assigned!",
        text: "Materials assigned successfully!",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });
      setMaterialAssignments({
        [selectedWorkDescription.value]: [
          {
            item_id: "",
            uom_id: "",
            quantity: "",
            comp_ratio_a: "",
            comp_ratio_b: "",
            comp_ratio_c: "",
            rate: "",
            projection_id: projectionId,
          },
        ],
      });
      await fetchAssignedMaterials(selectedSite.value, selectedWorkDescription.value, projectionId);
    } catch (error) {
      console.error("Error submitting material assignments:", error);
      const errorMessage = error.response?.data?.message || "Failed to assign materials.";
      const detailedErrors = error.response?.data?.errors ? error.response.data.errors.join("<br />") : errorMessage;
      await Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        html: detailedErrors,
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
        background: "#fef2f2",
        iconColor: "#dc2626",
      });
      setMaterialError(detailedErrors);
    } finally {
      setMaterialLoading((prev) => ({ ...prev, submitting: false }));
    }
  }, [selectedCompany, selectedProject, selectedSite, selectedWorkDescription, materialAssignments, overallCost, overallPercentage, fetchAssignedMaterials, encodedUserId]);
  const handleTotalCostChangeForProjection = useCallback((projectionId) => (totalCost) => {
    console.log("Received total cost from MaterialPlanning:", totalCost);
    setProjections(prev => {
      const projIndex = prev.findIndex(p => p.id === projectionId);
      if (projIndex === -1) return prev;
      const proj = prev[projIndex];
      const cost = Number(totalCost) || 0;
      if (proj.materialTotalCost === cost) return prev; // Prevent unnecessary update if value hasn't changed
      const newProj = { ...proj, materialTotalCost: cost };
      const bv = parseFloat(newProj.budgetValue) || 0;
      const perc = bv > 0 ? (cost / bv * 100) : 0;
      newProj.materialBudgetPercentage = perc;
      const newProjs = [...prev];
      newProjs[projIndex] = newProj;
      return newProjs;
    });
    // Fetch updated allocated
    fetchAllocatedOverheads(projectionId);
  }, [fetchAllocatedOverheads]);
  const handleTotalCostChangeForActive = useCallback((totalCost) => {
    if (activeMaterialProjId) {
      handleTotalCostChangeForProjection(activeMaterialProjId)(totalCost);
    }
  }, [activeMaterialProjId, handleTotalCostChangeForProjection]);
  // Updated: canAddProjection - check if previous is submitted
const canAddProjection = useMemo(() => {
  if (projections.length === 0) return false;
  const last = projections[projections.length - 1];
  return last.budgetAllocated && last.submitted;
}, [projections]);
  // Updated default template
  const defaultProjectionTemplate = useCallback((id) => ({
    id,
    name: `Projection ${id}`,
    isOpen: id === 1,
    budgetAllocated: false,
    submitted: false,
    budgetPercentage: "",
    additionalPercentage: 0,
    budgetValue: "",
    materialTotalCost: 0,
    materialBudgetPercentage: 0,
    labourTotalCost: 0,
    labourBudgetPercentage: 0,
    remainingBudget: 0,
    remainingPercentage: 0,
    labourCalculationType: "",
    noOfLabours: "",
    totalShifts: "",
    ratePerShift: "",
    selectedDynamicOverheads: [],
    dynamicOverheads: {},
    allocatedOverheads: [],
    activeOverheadTab: "material",
    prevRemainingBudget: 0,
    prevRemainingPercentage: 0,
    effectiveBudget: 0
  }), []);
  // Fetch functions (unchanged)
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/companies`);
      if (response.data.success) {
        const companyOptions = response.data.data.map((company) => ({
          value: company.company_id,
          label: company.company_name,
        }));
        setCompanies(companyOptions);
      } else {
        setError("Failed to fetch companies.");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchProjects = useCallback(async (companyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/projects/${companyId}`);
      if (response.data.success) {
        const projectOptions = response.data.data.map((project) => ({
          value: project.pd_id,
          label: project.project_name,
        }));
        setProjects(projectOptions);
      } else {
        setError("Failed to fetch projects.");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchSites = useCallback(async (projectId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/sites/${projectId}`);
      if (response.data.success) {
        const siteOptions = response.data.data.map((site) => ({
          value: site.site_id,
          label: `${site.site_name} (PO: ${site.po_number})`,
        }));
        setSites(siteOptions);
      } else {
        setError("Failed to fetch sites.");
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
      setError("Failed to load sites. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchWorkDescriptions = useCallback(async (siteId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/work-descriptions-by-site/${siteId}`
      );
      if (response.data.success) {
        const descOptions = response.data.data.map((desc) => ({
          value: desc.desc_id,
          label: desc.desc_name,
        }));
        setWorkDescriptions(descOptions);
      } else {
        setError("Failed to fetch work descriptions.");
      }
    } catch (error) {
      console.error("Error fetching work descriptions:", error);
      setError("Failed to load work descriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchBudgetDetails = useCallback(async (siteId, descId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/projection/po-total-budget/${siteId}/${descId}`
      );
      if (response.data.success) {
        setBudgetData({
          ...response.data.data,
          total_po_value: parseFloat(response.data.data.total_po_value) || 0,
          total_rate: parseFloat(response.data.data.total_rate) || 0,
        });
      } else {
        setError("Failed to fetch budget details.");
      }
    } catch (error) {
      console.error("Error fetching budget details:", error);
      setError("Failed to load budget details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  const checkBudgetExists = useCallback(async (siteId, descId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projection/saved-budgets`, {
        params: { site_id: siteId, desc_id: descId },
      });
      if (response.data.success && response.data.data.length > 0) {
        // Updated: Select the budget with the maximum projection_id (latest)
        const lastBudget = response.data.data.reduce((prev, curr) =>
          (prev.projection_id || 0) > (curr.projection_id || 0) ? prev : curr
        );
        const parsedBudget = {
          ...lastBudget,
          total_po_value: parseFloat(lastBudget.total_po_value) || 0,
          total_budget_value: parseFloat(lastBudget.total_budget_value) || 0,
        };
        setExistingBudget(parsedBudget);
      } else {
        setExistingBudget(null);
      }
    } catch (error) {
      console.error("Error checking budget existence:", error);
      setError("Failed to check budget existence. Please try again.");
      setExistingBudget(null);
    }
  }, []);
  // Updated fetchAllPoBudgets to include submitted and prev remaining
  const fetchAllPoBudgets = useCallback(async (siteId, descId) => {
    if (!siteId || !descId) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/projection/saved-budgets`, {
        params: { site_id: siteId, desc_id: descId },
      });
      if (response.data.success) {
        const savedBudgets = response.data.data;
        const maxId = Math.max(...savedBudgets.map(b => b.projection_id || 0), 1);
        setProjections(prevProjs => {
          let currentProjs = [...prevProjs];
          // Ensure projections up to maxId exist
          for (let i = 1; i <= maxId; i++) {
            let projIndex = currentProjs.findIndex(p => p.id === i);
            if (projIndex === -1) {
              const newProjection = defaultProjectionTemplate(i);
              currentProjs.push(newProjection);
            }
            // Sort to ensure order
            currentProjs.sort((a, b) => a.id - b.id);
          }
          // Update projections with saved data or set defaults based on previous
          return currentProjs.map((p, index) => {
            const saved = savedBudgets.find(b => b.projection_id === p.id);
            if (saved) {
              // Calculate prev remaining if index > 0
              const prevRemBudget = index > 0 ? currentProjs[index - 1].remainingBudget || 0 : 0;
              const prevRemPerc = index > 0 ? currentProjs[index - 1].remainingPercentage || 0 : 0;
              return {
                ...p,
                poBudgetId: saved.id,
                budgetPercentage: saved.total_percentage,
                additionalPercentage: saved.additional_percentage,
                budgetValue: parseFloat(saved.total_budget_value).toFixed(2),
                budgetAllocated: true,
                submitted: false, // Do not set submitted here; rely on fetchSubmissionStatuses
                prevRemainingBudget: prevRemBudget,
                prevRemainingPercentage: prevRemPerc
              };
            } else {
              // For unsaved projections, set based on previous projection's cumulative
              if (index > 0) {
                const prevProj = currentProjs[index - 1];
                const prevRemBudget = prevProj.remainingBudget || 0;
                const prevRemPerc = prevProj.remainingPercentage || 0;
                return {
                  ...p,
                  budgetPercentage: prevProj.budgetPercentage || "0.00",
                  additionalPercentage: "0.00",
                  budgetValue: ((parseFloat(prevProj.budgetPercentage || 0) / 100) * (budgetData?.total_po_value || 0)).toFixed(2),
                  prevRemainingBudget: prevRemBudget,
                  prevRemainingPercentage: prevRemPerc
                };
              }
              return p;
            }
          });
        });
      }
    } catch (error) {
      console.error("Error fetching saved budgets:", error);
      setError("Failed to load saved budgets. Please try again.");
    }
  }, [budgetData, defaultProjectionTemplate]);
  const fetchOverheads = useCallback(async (po_budget_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projection/overheads`, {
        params: po_budget_id ? { po_budget_id } : {},
      });
      if (response.data.success) {
        setOverheads(response.data.data);
      } else {
        setError("Failed to fetch overheads.");
      }
    } catch (error) {
      console.error("Error fetching overheads:", error);
      setError("Failed to load overheads. Please try again.");
    }
  }, []);
  const fetchActualBudgetEntries = useCallback(async (po_budget_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projection/actual-budget/${po_budget_id}`);
      if (response.data.success) {
        const entries = response.data.data || {};
        setActualBudgetEntries(entries);
        setIsAllocated(Object.keys(entries).length > 0);
      } else {
        setError(response.data.message || "Failed to fetch actual budget entries.");
        setIsAllocated(false);
      }
    } catch (error) {
      console.error("Error fetching actual budget entries:", error);
      setError("Failed to load actual budget entries. Please try again.");
      setIsAllocated(false);
    }
  }, []);
  // Add this fetch function near other fetch functions
  const fetchMaterialActual = useCallback(async () => {
    if (!selectedSite?.value || !selectedWorkDescription?.value) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projection/actual-material/${selectedSite.value}/${selectedWorkDescription.value}`
      );
      if (response.data.success) {
        setMaterialActual(parseFloat(response.data.data.material_used_actual_value) || 0);
      }
    } catch (error) {
      console.error("Error fetching material actual:", error);
      setMaterialActual(0);
    }
  }, [selectedSite, selectedWorkDescription]);
  // Modal handlers for edit
  const handleModalChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditingAssignment((prev) => ({ ...prev, [name]: value }));
  }, []);
  const handleModalItemSelect = useCallback((selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setEditingAssignment((prev) => ({ ...prev, item_id: value }));
  }, []);
  const handleModalUomSelect = useCallback((selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setEditingAssignment((prev) => ({ ...prev, uom_id: value }));
  }, []);
  const CustomCreateLabel = ({ inputValue }) => (
    <div className="flex items-center justify-between px-2 py-1">
      <span>Add "{inputValue}"</span>
      <button
        type="button"
        className="ml-2 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        onClick={() => handleAddNewMaterial(inputValue, currentDescId, currentMatIndex)}
        disabled={addingMaterial}
      >
        {addingMaterial ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
      </button>
    </div>
  );
  // Update the useEffect for selectedSite and selectedWorkDescription to include fetchMaterialActual
  useEffect(() => {
    if (selectedSite?.value && selectedWorkDescription?.value) {
      fetchBudgetDetails(selectedSite.value, selectedWorkDescription.value);
      checkBudgetExists(selectedSite.value, selectedWorkDescription.value);
      fetchMaterialActual(); // Add this line
    } else {
      setBudgetData(null);
      setExistingBudget(null);
      setOverheads([]);
      setActualBudgetEntries({});
      setIsAllocated(false);
      setSubmissionStatuses({});
      setProjections([defaultProjectionTemplate(1)]);
      setMaterialActual(0); // Reset on change
    }
  }, [selectedSite, selectedWorkDescription, fetchBudgetDetails, checkBudgetExists, defaultProjectionTemplate, fetchMaterialActual]);
  // MaterialPlanning useEffects
  useEffect(() => {
    fetchMaterials();
    fetchUoms();
  }, [fetchMaterials, fetchUoms]);
  useEffect(() => {
    if (activeMaterialProjId && selectedSite?.value && selectedWorkDescription?.value) {
      fetchAssignedMaterials(selectedSite.value, selectedWorkDescription.value, activeMaterialProjId);
    } else {
      setExistingAssignments([]);
      setMaterialAssignments({});
    }
  }, [activeMaterialProjId, selectedSite?.value, selectedWorkDescription?.value, fetchAssignedMaterials]);
  useEffect(() => {
    handleTotalCostChangeForActive(overallCost);
  }, [overallCost, handleTotalCostChangeForActive]);

  // Updated: addNewProjection - checks budgetAllocated first, then API for submitted
const addNewProjection = useCallback(async () => {
  if (projections.length === 0) {
    // Allow first projection implicitly via initial state
    return;
  }

  const lastProjection = projections[projections.length - 1];

  // Check 1: Budget Allocated?
  if (!lastProjection.budgetAllocated) {
    Swal.fire({
      icon: "warning",
      title: "Allocate Budget First",
      text: `Please allocate the budget for ${lastProjection.name} (Total % field) before adding a new projection.`,
      confirmButtonColor: "#4f46e5",
      footer: '<span class="text-xs text-gray-500">Budget allocation is required for cumulative progression.</span>',
    });
    return;
  }

  if (!selectedSite?.value || !selectedWorkDescription?.value) {
    Swal.fire({
      icon: "warning",
      title: "Incomplete Selection",
      text: "Please select a site and work description first.",
      confirmButtonColor: "#4f46e5",
    });
    return;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/projection/check-final-submission-status`, {
      params: { site_id: selectedSite.value, desc_id: selectedWorkDescription.value },
    });

    if (response.data.success && response.data.data.length > 0) {
      // Find the last projection from response data
      const lastStatus = response.data.data.reduce((prev, curr) => 
        (prev.projection_id || 0) > (curr.projection_id || 0) ? prev : curr
      );
      
      if (lastStatus.submitted) {
        // Proceed to add new projection
        const prevProjection = projections[projections.length - 1];
        const newProjectionId = Math.max(...projections.map(p => p.id)) + 1;
        const initialPerc = prevProjection.budgetAllocated ? prevProjection.budgetPercentage : "0.00";
        const newProjection = {
          ...defaultProjectionTemplate(newProjectionId),
          budgetPercentage: initialPerc,
          budgetValue: ((parseFloat(initialPerc) / 100) * (budgetData?.total_po_value || 0)).toFixed(2),
          isOpen: false,
          prevRemainingBudget: prevProjection.remainingBudget || 0,
          prevRemainingPercentage: prevProjection.remainingPercentage || 0
        };
        setProjections(prev => [...prev, newProjection]);
        Swal.fire({
          icon: "success",
          title: "Projection Added",
          text: `New projection "${newProjection.name}" created successfully!`,
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          background: "#ecfdf5",
          iconColor: "#10b981",
        });
      } else {
        // Show professional warning
        Swal.fire({
          icon: "warning",
          title: "Finalize Current Projection",
          text: `Please complete and submit ${lastProjection.name} before adding a new one to ensure accurate cumulative budgeting.`,
          confirmButtonColor: "#4f46e5",
          footer: '<span class="text-xs text-gray-500">This maintains the integrity of your projection sequence.</span>',
        });
      }
    } else {
      // No data, but since budgetAllocated checked, allow if first (edge case)
      const newProjectionId = Math.max(...projections.map(p => p.id)) + 1;
      const newProjection = defaultProjectionTemplate(newProjectionId);
      setProjections(prev => [...prev, newProjection]);
    }
  } catch (error) {
    console.error("Error checking submission status:", error);
    Swal.fire({
      icon: "error",
      title: "API Error",
      text: "Failed to check projection status. Please try again.",
      confirmButtonColor: "#4f46e5",
    });
  }
}, [projections, budgetData, defaultProjectionTemplate, selectedSite, selectedWorkDescription]);
  const toggleProjection = useCallback((projectionId) => {
    setProjections(prev => prev.map(p =>
      p.id === projectionId ? { ...p, isOpen: !p.isOpen } : p
    ));
  }, []);
  const updateProjectionField = useCallback((projectionId, field, value) => {
    setProjections(prev => prev.map(p =>
      p.id === projectionId ? { ...p, [field]: value } : p
    ));
  }, []);
  const calculateLabourTotalCost = useCallback((projection) => {
    let total = 0;
    const rate = parseFloat(projection.ratePerShift) || 0;
    if (projection.labourCalculationType === "no_of_labours") {
      const labours = parseFloat(projection.noOfLabours) || 0;
      total = labours * rate;
    } else if (projection.labourCalculationType === "total_shifts") {
      const shifts = parseFloat(projection.totalShifts) || 0;
      total = shifts * rate;
    }
    const bv = parseFloat(projection.budgetValue) || 0;
    const percentage = bv > 0 ? (total / bv * 100) : 0;
    return { total, percentage };
  }, []);
  const recalculateAllPercentages = useCallback((projectionId) => {
    setProjections(prev => {
      const projIndex = prev.findIndex(p => p.id === projectionId);
      if (projIndex === -1) return prev;
      const proj = { ...prev[projIndex] };
      const bv = parseFloat(proj.budgetValue) || 0;
      proj.materialBudgetPercentage = bv > 0 ? (proj.materialTotalCost / bv * 100) : 0;
      const { percentage: labourPerc } = calculateLabourTotalCost(proj);
      proj.labourBudgetPercentage = labourPerc;
      const updatedDynamic = { ...proj.dynamicOverheads };
      Object.keys(updatedDynamic).forEach(oid => {
        const val = parseFloat(updatedDynamic[oid].value) || 0;
        updatedDynamic[oid] = {
          ...updatedDynamic[oid],
          budgetPercentage: bv > 0 ? (val / bv * 100) : 0,
        };
      });
      proj.dynamicOverheads = updatedDynamic;
      const newProjs = [...prev];
      newProjs[projIndex] = proj;
      return newProjs;
    });
  }, [calculateLabourTotalCost]);
  const handleLabourCalculationTypeChange = useCallback((projectionId, newType) => {
    setProjections(prev => {
      const projIndex = prev.findIndex(p => p.id === projectionId);
      if (projIndex === -1) return prev;
      const proj = { ...prev[projIndex], labourCalculationType: newType };
      const { total, percentage } = calculateLabourTotalCost(proj);
      proj.labourTotalCost = total;
      proj.labourBudgetPercentage = percentage;
      const newProjs = [...prev];
      newProjs[projIndex] = proj;
      return newProjs;
    });
  }, [calculateLabourTotalCost]);
  const handleNoOfLaboursChange = useCallback((projectionId, newValue) => {
    setProjections(prev => {
      const projIndex = prev.findIndex(p => p.id === projectionId);
      if (projIndex === -1) return prev;
      const proj = { ...prev[projIndex], noOfLabours: newValue };
      const { total, percentage } = calculateLabourTotalCost(proj);
      proj.labourTotalCost = total;
      proj.labourBudgetPercentage = percentage;
      const newProjs = [...prev];
      newProjs[projIndex] = proj;
      return newProjs;
    });
  }, [calculateLabourTotalCost]);
  const handleTotalShiftsChange = useCallback((projectionId, newValue) => {
    setProjections(prev => {
      const projIndex = prev.findIndex(p => p.id === projectionId);
      if (projIndex === -1) return prev;
      const proj = { ...prev[projIndex], totalShifts: newValue };
      const { total, percentage } = calculateLabourTotalCost(proj);
      proj.labourTotalCost = total;
      proj.labourBudgetPercentage = percentage;
      const newProjs = [...prev];
      newProjs[projIndex] = proj;
      return newProjs;
    });
  }, [calculateLabourTotalCost]);
  const handleRatePerShiftChange = useCallback((projectionId, newValue) => {
    setProjections(prev => {
      const projIndex = prev.findIndex(p => p.id === projectionId);
      if (projIndex === -1) return prev;
      const proj = { ...prev[projIndex], ratePerShift: newValue };
      const { total, percentage } = calculateLabourTotalCost(proj);
      proj.labourTotalCost = total;
      proj.labourBudgetPercentage = percentage;
      const newProjs = [...prev];
      newProjs[projIndex] = proj;
      return newProjs;
    });
  }, [calculateLabourTotalCost]);
  const calculateDynamicOverheadBudgetPercentage = useCallback((projectionId, overheadId, value) => {
    const parsedValue = parseFloat(value) || 0;
    setProjections(prev => {
      const projIndex = prev.findIndex(p => p.id === projectionId);
      if (projIndex === -1) return prev;
      const proj = { ...prev[projIndex] };
      const bv = parseFloat(proj.budgetValue) || 0;
      const percentage = bv > 0 ? (parsedValue / bv * 100) : 0;
      const currentDyn = proj.dynamicOverheads[overheadId] || {};
      const updatedDynamic = {
        ...proj.dynamicOverheads,
        [overheadId]: {
          ...currentDyn,
          value: parsedValue,
          budgetPercentage: percentage,
        },
      };
      proj.dynamicOverheads = updatedDynamic;
      const newProjs = [...prev];
      newProjs[projIndex] = proj;
      return newProjs;
    });
  }, []);
  const calculateRemainingBudget = useCallback((projection) => {
    const totalAllocated = projection.allocatedOverheads.reduce(
      (sum, oh) => sum + parseFloat(oh.total_cost || 0),
      0
    );
    const effective = parseFloat(projection.budgetValue || 0) + (projection.prevRemainingBudget || 0);
    const remaining = effective - totalAllocated;
    const percentage = effective > 0 ? (remaining / effective * 100) : 0;
    return { remainingBudget: remaining, remainingPercentage: percentage };
  }, []);
  const handleBudgetPercentageChangeForProjection = useCallback((projectionId, e) => {
    let percentage = e.target.value;
    if (percentage && parseFloat(percentage) > 100) {
      percentage = "100";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Budget percentage cannot exceed 100%.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }
    const projection = projections.find(p => p.id === projectionId);
    const prevProjection = projections.find(p => p.id === projectionId - 1);
    const prevPerc = prevProjection?.budgetAllocated ? parseFloat(prevProjection.budgetPercentage) : 0;
    const newPerc = parseFloat(percentage) || 0;
    if (newPerc < prevPerc) {
      percentage = prevPerc.toFixed(2);
      Swal.fire({
        icon: "warning",
        title: "Upgrade Required",
        text: `New projection must be >= previous (${prevPerc}%). Set to ${prevPerc}%.`,
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }
    if (!budgetData) return;
    const percentageValue = parseFloat(percentage) || 0;
    const calculatedValue = (percentageValue / 100) * budgetData.total_po_value;
    const additionalPerc = (percentageValue - prevPerc).toFixed(2);
    setProjections(prev => prev.map(p =>
      p.id === projectionId ? { ...p, budgetPercentage: percentage, additionalPercentage: parseFloat(additionalPerc), budgetValue: calculatedValue.toFixed(2) } : p
    ));
    setTimeout(() => recalculateAllPercentages(projectionId), 0);
  }, [budgetData, projections, recalculateAllPercentages]);
  const handleBudgetValueChangeForProjection = useCallback((projectionId, e) => {
    let value = e.target.value;
    if (value && budgetData && parseFloat(value) > budgetData.total_po_value) {
      value = budgetData.total_po_value.toFixed(2);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Budget value cannot exceed Rs.${budgetData.total_po_value.toFixed(2)}.`,
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }
    if (!budgetData) return;
    const valueNumber = parseFloat(value) || 0;
    const calculatedPercentage = budgetData.total_po_value > 0 ? (valueNumber / budgetData.total_po_value * 100).toFixed(2) : "";
    const prevProjection = projections.find(p => p.id === projectionId - 1);
    const prevValue = prevProjection?.budgetAllocated ? parseFloat(prevProjection.budgetValue) : 0;
    if (valueNumber < prevValue) {
      value = prevValue.toFixed(2);
      Swal.fire({
        icon: "warning",
        title: "Upgrade Required",
        text: `New projection value must be >= previous (Rs.${prevValue.toFixed(2)}).`,
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }
    const additionalPerc = budgetData.total_po_value > 0 ? ((valueNumber - prevValue) / budgetData.total_po_value * 100).toFixed(2) : "0.00";
    setProjections(prev => prev.map(p =>
      p.id === projectionId ? { ...p, budgetValue: value, budgetPercentage: calculatedPercentage, additionalPercentage: parseFloat(additionalPerc) } : p
    ));
    setTimeout(() => recalculateAllPercentages(projectionId), 0);
  }, [budgetData, projections, recalculateAllPercentages]);
  const savePoBudget = useCallback(async (projectionId) => {
    const projection = projections.find(p => p.id === projectionId);
    if (!projection || !budgetData) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/projection/save-po-budget`, {
        site_id: selectedSite?.value,
        desc_id: selectedWorkDescription?.value,
        total_po_value: budgetData.total_po_value,
        total_budget_value: parseFloat(projection.budgetValue) || 0,
        projection_id: projectionId,
      });
      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.message,
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
        // Updated: Set poBudgetId and budgetAllocated
        updateProjectionField(projectionId, 'poBudgetId', response.data.data.id);
        updateProjectionField(projectionId, 'budgetAllocated', true);
        if (selectedSite?.value && selectedWorkDescription?.value) {
          await fetchAllPoBudgets(selectedSite.value, selectedWorkDescription.value);
        }
        await checkBudgetExists(selectedSite?.value, selectedWorkDescription?.value);
      } else {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.message,
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error saving PO budget:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save budget. Please try again.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  }, [projections, budgetData, selectedSite, selectedWorkDescription, checkBudgetExists, updateProjectionField, fetchAllPoBudgets]);
  const saveMaterialAllocation = useCallback(async (projectionId) => {
    const projection = projections.find(p => p.id === projectionId);
    if (!projection) return;
    try {
      const payload = {
        site_id: selectedSite?.value,
        desc_id: selectedWorkDescription?.value,
        total_cost: projection.materialTotalCost,
        materialBudgetPercentage: projection.materialBudgetPercentage,
        projection_id: projectionId // Added projection_id
      };
      console.log("Material Allocation Payload:", payload);
      const response = await axios.post(`${API_BASE_URL}/projection/save-material-allocation`, payload);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Material allocation saved successfully!",
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
        // Fetch updated allocated
        fetchAllocatedOverheads(projectionId);
      }
    } catch (error) {
      console.error("Error saving material allocation:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save material allocation. Please try again.",
        confirmButtonColor: "#4f46e5",
      });
    }
  }, [projections, selectedSite, selectedWorkDescription, fetchAllocatedOverheads]);
  const saveLabourOverhead = useCallback(async (projectionId) => {
    const projection = projections.find(p => p.id === projectionId);
    if (!projection) return;
    try {
      const payload = {
        site_id: selectedSite?.value,
        desc_id: selectedWorkDescription?.value,
        calculation_type: projection.labourCalculationType,
        no_of_labours: projection.labourCalculationType === "no_of_labours" ? parseInt(projection.noOfLabours) : null,
        total_shifts: projection.labourCalculationType === "total_shifts" ? parseInt(projection.totalShifts) : null,
        rate_per_shift: parseFloat(projection.ratePerShift),
        total_cost: projection.labourTotalCost,
        overhead_type: "labours",
        labourBudgetPercentage: projection.labourBudgetPercentage,
        projection_id: projectionId // Added projection_id
      };
      console.log("Labour Overhead Payload:", payload);
      const response = await axios.post(`${API_BASE_URL}/projection/save-labour-overhead`, payload);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Labour overhead saved successfully!",
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
        // Fetch updated allocated
        fetchAllocatedOverheads(projectionId);
      }
    } catch (error) {
      console.error("Error saving labour overhead:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save labour overhead. Please try again.",
        confirmButtonColor: "#4f46e5",
      });
    }
  }, [projections, selectedSite, selectedWorkDescription, fetchAllocatedOverheads]);
  // Updated: Delete overhead handler (now used only for top-right delete)
  const deleteOverhead = useCallback(async (projectionId, type, id, overheadName) => {
    if (type === 'material') return; // Handled in MaterialPlanning
    const projection = projections.find(p => p.id === projectionId);
    const isSubmitted = submissionStatuses[projectionId]?.submitted || projection.submitted;
    if (isSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Delete",
        text: "Deletion disabled after submission.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }
    const result = await Swal.fire({
      title: `Delete ${overheadName}?`,
      text: `Are you sure you want to delete ${overheadName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: 'Yes, delete!',
    });
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/projection/delete-overhead`, {
          data: {
            site_id: selectedSite.value,
            desc_id: selectedWorkDescription.value,
            projection_id: projectionId,
            overhead_type_id: id,
            overhead_type: overheadName
          }
        });
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: `${overheadName} deleted successfully.`,
            confirmButtonColor: "#4f46e5",
          });
          // Refresh allocated
          fetchAllocatedOverheads(projectionId);
          // Clear local state
          if (type === 'labours') {
            updateProjectionField(projectionId, 'labourTotalCost', 0);
            updateProjectionField(projectionId, 'labourBudgetPercentage', 0);
            updateProjectionField(projectionId, 'labourCalculationType', '');
            updateProjectionField(projectionId, 'noOfLabours', '');
            updateProjectionField(projectionId, 'totalShifts', '');
            updateProjectionField(projectionId, 'ratePerShift', '');
          } else {
            const updatedDynamic = { ...projection.dynamicOverheads };
            if (updatedDynamic[id]) {
              updatedDynamic[id] = { ...updatedDynamic[id], value: 0, budgetPercentage: 0 };
            }
            updateProjectionField(projectionId, 'dynamicOverheads', updatedDynamic);
          }
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.response?.data?.message || 'Failed to delete.',
          confirmButtonColor: "#4f46e5",
        });
      }
    }
  }, [projections, submissionStatuses, selectedSite, selectedWorkDescription, fetchAllocatedOverheads, updateProjectionField]);
  // Updated finalSubmissionProjection - removed call to save-actual-budget (handled in backend final submission with aggregation)
  // Only set submitted after successful API and refetch to sync with backend
  const finalSubmissionProjection = useCallback(async (projectionId) => {
    const projection = projections.find(p => p.id === projectionId);
    if (!projection) return;
    let po_budget_id = projection.poBudgetId;
    // If no po_budget_id, save po_budget first
    if (!po_budget_id) {
      try {
        const saveResponse = await axios.post(`${API_BASE_URL}/projection/save-po-budget`, {
          site_id: selectedSite?.value,
          desc_id: selectedWorkDescription?.value,
          total_po_value: budgetData.total_po_value,
          total_budget_value: parseFloat(projection.budgetValue) || 0,
          projection_id: projectionId,
        });
        if (saveResponse.data.success) {
          po_budget_id = saveResponse.data.data.id;
          // Update projection state
          setProjections(prev => prev.map(p =>
            p.id === projectionId ? { ...p, poBudgetId: po_budget_id, budgetAllocated: true } : p
          ));
          // Refresh budgets
          if (selectedSite?.value && selectedWorkDescription?.value) {
            await fetchAllPoBudgets(selectedSite.value, selectedWorkDescription.value);
          }
          await checkBudgetExists(selectedSite?.value, selectedWorkDescription?.value);
        } else {
          Swal.fire({
            icon: "error",
            title: "Budget Save Error",
            text: saveResponse.data.message || "Failed to save budget before submission.",
            confirmButtonColor: "#4f46e5",
          });
          return;
        }
      } catch (saveError) {
        console.error("Error saving PO budget for submission:", saveError);
        Swal.fire({
          icon: "error",
          title: "Budget Save Error",
          text: "Failed to save budget before submission. Please try again.",
          confirmButtonColor: "#4f46e5",
        });
        return;
      }
    }
    // Removed: Collect entries and call save-actual-budget (now handled in backend final submission with aggregation)
    try {
      const response = await axios.post(`${API_BASE_URL}/projection/final-projection-submission`, {
        site_id: selectedSite?.value,
        desc_id: selectedWorkDescription?.value,
        projection_id: projectionId,
        projection_data: {
          budgetValue: projection.budgetValue,
          additionalPercentage: projection.additionalPercentage,
          materialTotalCost: projection.materialTotalCost,
          materialBudgetPercentage: projection.materialBudgetPercentage,
          labourTotalCost: projection.labourTotalCost,
          labourBudgetPercentage: projection.labourBudgetPercentage,
          dynamicOverheads: projection.dynamicOverheads,
        }
      });
      if (response.data.success) {
        // Refetch submission statuses to sync with backend (ensures submitted only if backend confirms)
        await fetchSubmissionStatuses();
        // Fetch remaining
        await fetchRemainingBudget(projectionId);
        // Fetch updated allocated (now in actual_budget, but since transferred, refetch)
        await fetchAllocatedOverheads(projectionId);
        // Refresh actual_budget for the latest po_budget_id (aggregated)
        if (existingBudget) {
          await fetchActualBudgetEntries(existingBudget.id);
        }
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `${projection.name} submitted successfully! Remaining: ₹${response.data.data.remaining_budget}`,
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error in final submission:", error);
      // On error, refetch to ensure state is not incorrectly set
      await fetchSubmissionStatuses();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit projection. Please try again.",
        confirmButtonColor: "#4f46e5",
      });
    }
  }, [projections, selectedSite, selectedWorkDescription, existingBudget, fetchActualBudgetEntries, budgetData, fetchAllPoBudgets, checkBudgetExists, fetchRemainingBudget, fetchAllocatedOverheads, fetchSubmissionStatuses]);
  const saveDynamicOverhead = useCallback(async (projectionId, overheadId, overheadName) => {
    const projection = projections.find(p => p.id === projectionId);
    if (!projection) return;
    try {
      if (!selectedSite?.value || !selectedWorkDescription?.value) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Selection",
          text: "Please select a site and work description before saving.",
          confirmButtonColor: "#4f46e5",
        });
        return;
      }
      const overheadEntry = projection.dynamicOverheads[overheadId];
      if (!overheadEntry || typeof overheadEntry !== 'object') {
        console.warn(`No valid data for overhead ID: ${overheadId}`);
        Swal.fire({
          icon: "error",
          title: "Invalid Data",
          text: `${overheadName} data is missing or invalid.`,
          confirmButtonColor: "#4f46e5",
        });
        return;
      }
      const rawValue = overheadEntry.value ?? 0;
      const rawPercentage = overheadEntry.budgetPercentage ?? 0;
      const value = parseFloat(rawValue);
      const percentage = parseFloat(rawPercentage);
      if (isNaN(value) || isNaN(percentage)) {
        Swal.fire({
          icon: "error",
          title: "Invalid Numbers",
          text: `${overheadName} value or percentage is not a valid number.`,
          confirmButtonColor: "#4f46e5",
        });
        return;
      }
      const payload = {
        site_id: selectedSite.value,
        desc_id: selectedWorkDescription.value,
        value,
        percentage,
        overhead_type: overheadName,
        projection_id: projectionId, // Added projection_id
      };
      const response = await axios.post(`${API_BASE_URL}/projection/save-dynamic-overhead-values`, payload);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `${overheadName} overhead saved successfully!`,
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
        // Fetch updated allocated
        fetchAllocatedOverheads(projectionId);
      } else {
        throw new Error(response.data.message || "Unknown error");
      }
    } catch (error) {
      console.error(`Error saving ${overheadName} overhead:`, error);
      let errorMessage = "Failed to save. Please try again.";
      if (error.response) {
        errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error: Unable to reach server. Check if backend is running.";
      } else if (error.message.includes("Invalid")) {
        errorMessage = error.message;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#4f46e5",
      });
    }
  }, [projections, selectedSite, selectedWorkDescription, fetchAllocatedOverheads]);
  const addNewOverhead = useCallback(async () => {
    const { value: expense_name } = await Swal.fire({
      title: "Add New Overhead",
      input: "text",
      inputLabel: "Expense Name",
      inputPlaceholder: "Enter expense name",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4f46e5",
      inputValidator: (value) => {
        if (!value) {
          return "Expense name is required!";
        }
        if (overheads.some((oh) => oh.expense_name.toLowerCase() === value.toLowerCase())) {
          return "Expense name already exists!";
        }
      },
    });
    if (expense_name) {
      try {
        const response = await axios.post(`${API_BASE_URL}/projection/save-overhead`, {
          expense_name,
        });
        if (response.data.success) {
          const newOverhead = response.data.data;
          setOverheads((prev) => [...prev, newOverhead]);
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Overhead added successfully!",
            confirmButtonColor: "#4f46e5",
            timer: 3000,
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.data.message,
            confirmButtonColor: "#4f46e5",
          });
        }
      } catch (error) {
        console.error("Error adding new overhead:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to add overhead. Please try again.",
          confirmButtonColor: "#4f46e5",
        });
      }
    }
  }, [overheads]);
  const handleSelectOverhead = useCallback((overhead, projectionId) => {
    setProjections(prev => prev.map(p => {
      if (p.id !== projectionId) return p;
      if (!p.selectedDynamicOverheads.some((oh) => oh.id === overhead.id)) {
        return {
          ...p,
          selectedDynamicOverheads: [...p.selectedDynamicOverheads, overhead]
        };
      }
      return p;
    }));
  }, []);
  const handleRemoveOverhead = useCallback((overheadId, projectionId) => {
    setProjections(prev => prev.map(p => {
      if (p.id !== projectionId) return p;
      const updatedSelected = p.selectedDynamicOverheads.filter((oh) => oh.id !== overheadId);
      const updatedDynamic = { ...p.dynamicOverheads };
      if (updatedDynamic[overheadId]) {
        updatedDynamic[overheadId] = {
          ...updatedDynamic[overheadId],
          value: "",
          budgetPercentage: 0,
        };
      }
      return { ...p, selectedDynamicOverheads: updatedSelected, dynamicOverheads: updatedDynamic };
    }));
  }, []);
  // UseEffects (unchanged except add fetchAllocatedOverheads and fetchRemainingBudget on projection change)
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  useEffect(() => {
    if (selectedCompany?.value) {
      fetchProjects(selectedCompany.value);
    } else {
      setProjects([]);
    }
    setSites([]);
    setWorkDescriptions([]);
    setSelectedProject(null);
    setSelectedSite(null);
    setSelectedWorkDescription(null);
    setBudgetData(null);
    setExistingBudget(null);
    setOverheads([]);
    setActualBudgetEntries({});
    setIsAllocated(false);
    setSubmissionStatuses({});
    setProjections(prev => prev.map(p => ({
      ...p,
      budgetPercentage: "",
      budgetValue: "",
      budgetAllocated: false,
      additionalPercentage: 0,
      materialTotalCost: 0,
      materialBudgetPercentage: 0,
      labourTotalCost: 0,
      labourBudgetPercentage: 0,
      dynamicOverheads: {},
      selectedDynamicOverheads: [],
      submitted: false,
      prevRemainingBudget: 0,
      prevRemainingPercentage: 0
    })));
  }, [selectedCompany, fetchProjects]);
  useEffect(() => {
    if (selectedProject?.value) {
      fetchSites(selectedProject.value);
    } else {
      setSites([]);
    }
    setWorkDescriptions([]);
    setSelectedSite(null);
    setSelectedWorkDescription(null);
    setBudgetData(null);
    setExistingBudget(null);
    setOverheads([]);
    setActualBudgetEntries({});
    setIsAllocated(false);
    setSubmissionStatuses({});
    setProjections([defaultProjectionTemplate(1)]);
  }, [selectedProject, fetchSites, defaultProjectionTemplate]);
  useEffect(() => {
    if (selectedSite?.value) {
      fetchWorkDescriptions(selectedSite.value);
    } else {
      setWorkDescriptions([]);
    }
    setSelectedWorkDescription(null);
    setBudgetData(null);
    setExistingBudget(null);
    setOverheads([]);
    setActualBudgetEntries({});
    setIsAllocated(false);
    setSubmissionStatuses({});
    setProjections([defaultProjectionTemplate(1)]);
  }, [selectedSite, fetchWorkDescriptions, defaultProjectionTemplate]);
  useEffect(() => {
    if (selectedSite?.value && selectedWorkDescription?.value) {
      fetchBudgetDetails(selectedSite.value, selectedWorkDescription.value);
      checkBudgetExists(selectedSite.value, selectedWorkDescription.value);
    } else {
      setBudgetData(null);
      setExistingBudget(null);
      setOverheads([]);
      setActualBudgetEntries({});
      setIsAllocated(false);
      setSubmissionStatuses({});
      setProjections([defaultProjectionTemplate(1)]);
    }
  }, [selectedSite, selectedWorkDescription, fetchBudgetDetails, checkBudgetExists, defaultProjectionTemplate]);
  useEffect(() => {
    if (selectedSite?.value && selectedWorkDescription?.value && budgetData) {
      fetchAllPoBudgets(selectedSite.value, selectedWorkDescription.value);
      fetchSubmissionStatuses();
    }
  }, [selectedSite, selectedWorkDescription, budgetData, fetchAllPoBudgets, fetchSubmissionStatuses]);
  useEffect(() => {
    if (existingBudget?.id) {
      fetchOverheads(existingBudget.id);
      fetchActualBudgetEntries(existingBudget.id);
    } else {
      setOverheads([]);
      setActualBudgetEntries({});
      setIsAllocated(false);
    }
  }, [existingBudget, fetchOverheads, fetchActualBudgetEntries]);
  // Updated useEffect in ProjectProjectionOld.jsx to prevent infinite loop
  useEffect(() => {
    if (selectedSite?.value && selectedWorkDescription?.value) {
      projections.forEach(proj => {
        fetchAllocatedOverheads(proj.id).catch(console.error);
        if (submissionStatuses[proj.id]?.submitted || proj.submitted) fetchRemainingBudget(proj.id).catch(console.error);
      });
    }
  }, [selectedSite?.value, selectedWorkDescription?.value, projections.length]);
  // Updated ProjectionAccordion useMemo (add prev remaining display, remove edit/delete in summary, top-right delete only, pre-populate forms with allocated data, no small edit/delete below save)
  const materialOptions = useMemo(() => Array.isArray(materials)
    ? materials.map((material) => ({
        value: material.item_id,
        label: material.item_name,
      }))
    : [], [materials]);
  const uomOptions = useMemo(() => Array.isArray(uoms)
    ? uoms.map((uom) => ({
        value: uom.uom_id,
        label: uom.uom_name,
      }))
    : [], [uoms]);
  const ProjectionAccordion = useMemo(() =>
    projections.map((projection) => {
      const prevProjection = projections.find(p => p.id === projection.id - 1);
      const prevPerc = prevProjection?.budgetAllocated ? parseFloat(prevProjection.budgetPercentage) : 0;
      const progressWidth = (parseFloat(projection.budgetPercentage || 0) / 100) * 100;
      const isSubmitted = submissionStatuses[projection.id]?.submitted || projection.submitted;
      const { remainingBudget: calcRemBudget, remainingPercentage: calcRemPerc } = calculateRemainingBudget(projection);
      // Updated: Include prevRemainingBudget in effectiveBudget for accurate remaining %
      const effectiveBudget = projection.effectiveBudget || (parseFloat(projection.budgetValue || 0) + (projection.prevRemainingBudget || 0));
      const effectiveRemPerc = effectiveBudget > 0 ? ((isSubmitted ? (projection.remainingBudget || 0) : calcRemBudget) / effectiveBudget * 100) : 0;
      const allocOverhead = projection.allocatedOverheads.find(oh => oh.expense_name.toLowerCase() === 'labours') || {};
      const dynOverhead = projection.allocatedOverheads.find(oh => oh.id === parseInt(projection.activeOverheadTab?.split('-')[1]));
      const isFormEnabled = selectedCompany && selectedProject && selectedSite && selectedWorkDescription && projection.id && !isSubmitted;
      return (
        <div key={projection.id} className="border border-gray-200 rounded-xl mb-6 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
          <div
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 to-white rounded-t-xl"
            onClick={() => toggleProjection(projection.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${projection.budgetAllocated ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <h3 className="text-xl font-semibold text-gray-800">{projection.name}</h3>
            </div>
            <div className="flex items-center space-x-3">
              {projection.budgetAllocated ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center space-x-1">
                  <CheckCircle size={14} /> Allocated
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full flex items-center space-x-1">
                  <AlertCircle size={14} /> Pending
                </span>
              )}
              {projection.isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </div>
          </div>
          {projection.isOpen && (
            <div className="p-6">
              {!projection.budgetAllocated && (
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="text-xl font-semibold mb-4 text-blue-800 flex items-center space-x-2">
                    <span>Budget Allocation</span>
                    <span className="text-sm text-blue-600">(Cumulative Total %)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total % (Upgrade from {prevPerc.toFixed(2)}%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        max="100"
                        min={prevPerc}
                        value={projection.budgetPercentage}
                        onChange={(e) => handleBudgetPercentageChangeForProjection(projection.id, e)}
                        className="w-full p-4 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        placeholder="Enter total %"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total Value (Rs.)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={prevProjection?.budgetValue || 0}
                        value={projection.budgetValue}
                        onChange={(e) => handleBudgetValueChangeForProjection(projection.id, e)}
                        className="w-full p-4 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        placeholder="Enter total value"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => savePoBudget(projection.id)}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || !projection.budgetPercentage || !projection.budgetValue || parseFloat(projection.budgetPercentage) <= prevPerc}
                      >
                        {loading ? (
                          <Loader2 className="animate-spin inline-block mr-2" size={20} />
                        ) : null}
                        Save Budget
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {projection.budgetAllocated && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h4 className="text-xl font-semibold mb-4 text-green-800 flex items-center space-x-2">
                    <CheckCircle size={20} className="text-green-500" />
                    Allocated Budget (Fixed)
                  </h4>
                  <div className="space-y-4">
                    {projection.prevRemainingBudget > 0 && (
                      <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-sm font-medium text-yellow-800">Previous Remaining Added:</span>
                        <span className="text-lg font-bold text-yellow-700">₹{parseFloat(projection.prevRemainingBudget).toLocaleString()} ({projection.prevRemainingPercentage.toFixed(2)}%)</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Additional %:</span>
                      <span className="text-lg font-bold text-green-700">{projection.additionalPercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Total %:</span>
                      <span className="text-lg font-bold text-green-700">{projection.budgetPercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-700">Total Value (Rs.):</span>
                      <span className="text-lg font-bold text-green-700">₹{parseFloat(projection.budgetValue).toLocaleString()}</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-800 bg-green-200">
                            Cumulative Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-green-800">{progressWidth.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
                        <div
                          style={{ width: `${progressWidth}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {projection.budgetAllocated && (
                <>
                  <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-200 overflow-x-auto bg-gray-50 rounded-lg p-4">
                    {[
                      { key: "material", label: "Material", icon: "📦" },
                      { key: "labour", label: "Labour", icon: "👥" },
                      ...projection.selectedDynamicOverheads.map((overhead) => ({
                        key: `overhead-${overhead.id}`,
                        label: overhead.expense_name,
                        icon: "⚙️",
                      })),
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        className={`flex items-center px-6 py-3 font-semibold whitespace-nowrap rounded-full transition-all duration-200 ${
                          projection.activeOverheadTab === tab.key
                            ? "bg-indigo-600 text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                        onClick={() => {
                          updateProjectionField(projection.id, 'activeOverheadTab', tab.key);
                          if (tab.key === "material") {
                            setActiveMaterialProjId(projection.id);
                          }
                        }}
                      >
                        <span className="mr-2 text-sm">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                    <button
                      onClick={() => {
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
                            handleSelectOverhead(selectedOverhead, projection.id);
                            updateProjectionField(projection.id, 'activeOverheadTab', `overhead-${selectedOverhead.id}`);
                          } else if (result.isDenied) {
                            addNewOverhead();
                          }
                        });
                      }}
                      className="flex items-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-green-700 shadow-lg transition-all duration-200 ml-2"
                    >
                      <PlusCircle className="mr-2" size={18} />
                      Add Overhead
                    </button>
                  </div>
                  {projection.activeOverheadTab === "material" && (
                    <div className="bg-gray-50 rounded-xl mb-6">
                      <h4 className="text-xl font-semibold mb-6 flex items-center space-x-2 text-indigo-800 p-6 border-b">
                        <span>📦</span>
                        <span>Material Overhead</span>
                      </h4>
                      {(materialLoading.materials || materialLoading.uoms || materialLoading.assignedMaterials) ? (
                        <div className="flex justify-center items-center py-16 p-6">
                          <div className="flex flex-col items-center space-y-3">
                            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                            <p className="text-gray-600">Loading resources...</p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleSubmit(e, projection.id)} className="p-6">
                          <div className="mb-6">
                            {materialError && (
                              <div
                                className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm"
                                dangerouslySetInnerHTML={{ __html: materialError }}
                              />
                            )}
                          </div>
                          {selectedWorkDescription && (
                            <div className="space-y-6">
                              {existingAssignments.length > 0 && (
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Previously Assigned Materials</h3>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white border border-gray-200 rounded-md">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Material</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">UOM</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Rate (₹)</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Cost (₹)</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio A (Qty)</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio B (Qty)</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio C (Qty)</th>
                                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                                        </tr>
                                      </thead>
                                   <tbody>
  {existingAssignments.map((mat, index) => {
    const { comp_a_qty, comp_b_qty, comp_c_qty } = calculateCompQuantities(mat);
    const totalCost = calculateTotalCost(mat);
    const materialName = mat.item_name || materials.find((m) => m.item_id === mat.item_id)?.item_name || mat.item_id;
    const uomName = mat.uom_name || uoms.find((u) => u.uom_id === mat.uom_id)?.uom_name || "N/A";
    const assignmentId = Number(mat.id || mat.assignment_id);
    return (
      <tr key={assignmentId || index} className="border-t border-gray-200">
        <td className="px-4 py-2 text-sm text-gray-600 font-medium">#{assignmentId}</td>
        <td className="px-4 py-2 text-sm text-gray-600">{materialName}</td>
        <td className="px-4 py-2 text-sm text-gray-600">{uomName}</td>
        <td className="px-4 py-2 text-sm text-gray-600">{mat.quantity}</td>
        <td className="px-4 py-2 text-sm text-gray-600">{mat.rate}</td>
        <td className="px-4 py-2 text-sm text-gray-600">{totalCost}</td>
        <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_a || 0} ({comp_a_qty})</td>
        <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_b || 0} ({comp_b_qty})</td>
        <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_c || 0} ({comp_c_qty})</td>
        <td className="px-4 py-2 text-sm text-gray-600">
          {!isSubmitted ? (
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleEditAssignment(mat, projection.id)}
                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAssignment(assignmentId, projection.id)}
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Disabled</span>
          )}
        </td>
      </tr>
    );
  })}
</tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                        
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">New Material Assignments</h3>
                                {(materialAssignments[selectedWorkDescription.value] || []).map((mat, matIndex) => {
                                  const { comp_a_qty, comp_b_qty, comp_c_qty } = calculateCompQuantities(mat);
                                  const totalCost = calculateTotalCost(mat);
                                  return (
                                    <div key={matIndex} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Material #{matIndex + 1}
                                          </label>
                                  <CreatableSelect
  options={materialOptions}
  value={materialOptions.find((opt) => opt.value === mat.item_id) || null}
  onChange={(opt) => {
    handleItemSelect(selectedWorkDescription.value, matIndex, opt);
  }}
  onCreateOption={(inputValue) => {
    if (inputValue?.trim()) {
      handleAddNewMaterial(inputValue.trim(), selectedWorkDescription.value, matIndex);
    }
  }}
  isSearchable
  isClearable
  isDisabled={!isFormEnabled || addingMaterial}
  className="text-sm"
  classNamePrefix="select"
  placeholder="Select or type material..."
/>
                                          <div className="mt-2 space-y-2">
                                            <div className="flex items-center gap-2">
                                              <label className="text-sm text-gray-600 w-28">Comp Ratio A:</label>
                                              <input
                                                type="number"
                                                name="comp_ratio_a"
                                                value={mat.comp_ratio_a}
                                                onChange={(e) => handleMaterialChange(selectedWorkDescription.value, matIndex, e)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                                                disabled={!isFormEnabled}
                                                min="0"
                                              />
                                              <span className="text-sm text-gray-600">Qty: {comp_a_qty}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <label className="text-sm text-gray-600 w-28">Comp Ratio B:</label>
                                              <input
                                                type="number"
                                                name="comp_ratio_b"
                                                value={mat.comp_ratio_b}
                                                onChange={(e) => handleMaterialChange(selectedWorkDescription.value, matIndex, e)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                                                disabled={!isFormEnabled}
                                                min="0"
                                              />
                                              <span className="text-sm text-gray-600">Qty: {comp_b_qty}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <label className="text-sm text-gray-600 w-28">Comp Ratio C:</label>
                                              <input
                                                type="number"
                                                name="comp_ratio_c"
                                                value={mat.comp_ratio_c}
                                                onChange={(e) => handleMaterialChange(selectedWorkDescription.value, matIndex, e)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                                                disabled={!isFormEnabled}
                                                min="0"
                                              />
                                              <span className="text-sm text-gray-600">Qty: {comp_c_qty}</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Unit of Measure
                                          </label>
                                          <Select
                                            options={uomOptions}
                                            value={uomOptions.find((opt) => opt.value === mat.uom_id) || null}
                                            onChange={(opt) =>
                                              handleMaterialChange(selectedWorkDescription.value, matIndex, {
                                                target: { name: "uom_id", value: opt ? opt.value : "" },
                                              })
                                            }
                                            isSearchable
                                            isClearable
                                            isDisabled={!isFormEnabled}
                                            className="text-sm"
                                            classNamePrefix="select"
                                            placeholder="Select UOM..."
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Overall Quantity
                                          </label>
                                          <input
                                            type="number"
                                            name="quantity"
                                            value={mat.quantity}
                                            onChange={(e) => handleMaterialChange(selectedWorkDescription.value, matIndex, e)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                                            required
                                            disabled={!isFormEnabled}
                                            min="1"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rate per Quantity
                                          </label>
                                          <input
                                            type="number"
                                            name="rate"
                                            value={mat.rate}
                                            onChange={(e) => handleMaterialChange(selectedWorkDescription.value, matIndex, e)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                                            required
                                            disabled={!isFormEnabled}
                                            min="0"
                                            step="0.01"
                                          />
                                          <div className="mt-2 text-sm text-gray-600">
                                            Overall Cost: ₹{totalCost}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center mt-3">
                                        <span className="text-sm text-gray-500">
                                          Row {matIndex + 1}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveMaterial(selectedWorkDescription.value, matIndex)}
                                          disabled={(materialAssignments[selectedWorkDescription.value] || []).length <= 1 || !isFormEnabled}
                                          className={`p-1.5 rounded-md ${
                                            (materialAssignments[selectedWorkDescription.value] || []).length <= 1 || !isFormEnabled
                                              ? "text-gray-400 cursor-not-allowed"
                                              : "text-red-600 hover:bg-red-50"
                                          }`}
                                          title={
                                            (materialAssignments[selectedWorkDescription.value] || []).length <= 1
                                              ? "At least one material is required"
                                              : "Remove this entry"
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                <div className="mt-4">
                                  <button
                                    type="button"
                                    onClick={() => handleAddMaterial(selectedWorkDescription.value)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                    disabled={!isFormEnabled}
                                  >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Material
                                  </button>
                                </div>
                                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Total Material Cost:</span>
                                    <span className="text-lg font-semibold text-indigo-700">₹{overallCost}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">Budget Percentage:</span>
                                    <span className="text-lg font-semibold text-indigo-700">{overallPercentage.toFixed(2)}%</span>
                                  </div>
                                </div>
                                <div className="flex justify-end mt-4 space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => saveMaterialAllocation(projection.id)}
                                    disabled={materialLoading.submitting || !isFormEnabled || isSubmitted}
                                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 shadow-lg"
                                  >
                                    Save Material Allocation
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={materialLoading.submitting || !isFormEnabled || isSubmitted}
                                    className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 shadow-lg"
                                  >
                                    {materialLoading.submitting ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Assign Materials
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </form>
                      )}
                    </div>
                  )}
                  {projection.activeOverheadTab === "labour" && (
                    <div className="p-6 bg-gray-50 rounded-xl mb-6">
                      <h4 className="text-xl font-semibold mb-6 flex items-center space-x-2 text-indigo-800">
                        <span>👥</span>
                        <span>Labour Overhead</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Calculation Type</label>
                          <select
                            value={projection.labourCalculationType}
                            onChange={(e) => handleLabourCalculationTypeChange(projection.id, e.target.value)}
                            disabled={isSubmitted}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
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
                                onChange={(e) => handleNoOfLaboursChange(projection.id, e.target.value)}
                                disabled={isSubmitted}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
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
                                onChange={(e) => handleTotalShiftsChange(projection.id, e.target.value)}
                                disabled={isSubmitted}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                placeholder="Enter total shifts"
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium mb-2">Rate per Shift</label>
                            <input
                              type="number"
                              value={projection.ratePerShift}
                              onChange={(e) => handleRatePerShiftChange(projection.id, e.target.value)}
                              disabled={isSubmitted}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                              placeholder="Enter rate per shift"
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Total Labour Cost:</span>
                          <span className="text-lg font-semibold text-indigo-700">₹{projection.labourTotalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Budget Percentage:</span>
                          <span className="text-lg font-semibold text-indigo-700">{projection.labourBudgetPercentage.toFixed(2)}%</span>
                        </div>
                      </div>
                      {!isSubmitted && (
                        <button
                          onClick={() => saveLabourOverhead(projection.id)}
                          className="mt-4 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          Save Labour Overhead
                        </button>
                      )}
                    </div>
                  )}
                  {projection.selectedDynamicOverheads.map((overhead) => (
                    projection.activeOverheadTab === `overhead-${overhead.id}` && (
                      <div key={overhead.id} className="p-6 bg-gray-50 rounded-xl mb-6 relative">
                        <h4 className="text-xl font-semibold mb-6 flex items-center space-x-2 text-indigo-800">
                          <span>⚙️</span>
                          <span>{overhead.expense_name} Overhead</span>
                        </h4>
                        {!isSubmitted && (
                          <button
                            onClick={() => deleteOverhead(projection.id, overhead.expense_name.toLowerCase(), overhead.id, overhead.expense_name)}
                            className="absolute top-4 right-4 text-red-600 hover:text-red-800 transition-colors duration-200"
                            title={`Delete ${overhead.expense_name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              {overhead.expense_name} Value
                            </label>
                            <input
                              type="number"
                              value={projection.dynamicOverheads[overhead.id]?.value || ""}
                              onChange={(e) =>
                                calculateDynamicOverheadBudgetPercentage(projection.id, overhead.id, e.target.value)
                              }
                              disabled={isSubmitted}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                              placeholder={`Enter ${overhead.expense_name} value`}
                            />
                            <p className="text-sm text-gray-600 mt-1">
                              Remaining Budget: ₹{calcRemBudget.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Budget Percentage</label>
                            <input
                              type="text"
                              value={`${(projection.dynamicOverheads[overhead.id]?.budgetPercentage || 0).toFixed(2)}%`}
                              readOnly
                              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>
                        {!isSubmitted && (
                          <button
                            onClick={() => saveDynamicOverhead(projection.id, overhead.id, overhead.expense_name)}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            Save {overhead.expense_name} Overhead
                          </button>
                        )}
                      </div>
                    )
                  ))}
                 <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
        <h4 className="text-xl font-semibold mb-6 text-indigo-800">Budget Allocation Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Display from allocatedOverheads - NO edit/delete icons */}
          {projection.allocatedOverheads.map((alloc) => (
            <div key={alloc.id} className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">{alloc.expense_name}</p>
              <p className="text-lg font-bold text-indigo-700">₹{parseFloat(alloc.total_cost || 0).toLocaleString()}</p>
              <p className="text-sm text-indigo-600">{parseFloat(alloc.budget_percentage || 0).toFixed(2)}%</p>
            </div>
          ))}
        </div>
        {/* Updated display: Uses calculated/ fetched remaining with correct effectiveBudget */}
        <div className="pt-4 border-t border-indigo-200">
          <p className="text-lg font-bold text-green-700">
            Remaining Budget: ₹{isSubmitted ? parseFloat(projection.remainingBudget || 0).toLocaleString() : calcRemBudget.toLocaleString()} ({effectiveRemPerc.toFixed(2)}% of ₹{effectiveBudget.toLocaleString()})
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          {!isSubmitted && (
            <button
              onClick={() => finalSubmissionProjection(projection.id)}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Final Submission ({projection.name})
            </button>
          )}
        </div>
      </div>
                </>
              )}
            </div>
          )}
        </div>
      );
    }),
    [projections, toggleProjection, budgetData, loading, savePoBudget, updateProjectionField, overheads, handleSelectOverhead, addNewOverhead, handleLabourCalculationTypeChange, handleNoOfLaboursChange, handleTotalShiftsChange, handleRatePerShiftChange, saveLabourOverhead, handleRemoveOverhead, calculateDynamicOverheadBudgetPercentage, calculateRemainingBudget, saveDynamicOverhead, finalSubmissionProjection, selectedCompany, selectedProject, selectedSite, selectedWorkDescription, existingBudget, saveMaterialAllocation, calculateLabourTotalCost, recalculateAllPercentages, fetchAllocatedOverheads, fetchRemainingBudget, submissionStatuses, deleteOverhead, handleSubmit, materialOptions, uomOptions, handleEditAssignment, handleDeleteAssignment, handleAddMaterial, handleMaterialChange, handleItemSelect, handleRemoveMaterial, calculateCompQuantities, calculateTotalCost, overallCost, overallPercentage, materialError, materialLoading, addingMaterial, CustomCreateLabel]
  );
  const addedOverheads = useMemo(() => overheads.filter(o => o.is_default === 0), [overheads]);
  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent mb-2">
            Project Budget Allocation
          </h1>
          <p className="text-gray-600">Manage cumulative projections under PO budgets professionally</p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center space-x-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Project Selection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <Select
                value={selectedCompany}
                onChange={setSelectedCompany}
                options={companies}
                placeholder="Select a company..."
                isLoading={loading}
                isClearable
                classNamePrefix="text-sm"
                className="text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <Select
                value={selectedProject}
                onChange={setSelectedProject}
                options={projects}
                placeholder="Select a project..."
                isLoading={loading}
                isDisabled={!selectedCompany}
                isClearable
                classNamePrefix="text-sm"
                className="text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site
              </label>
              <Select
                value={selectedSite}
                onChange={setSelectedSite}
                options={sites}
                placeholder="Select a site..."
                isLoading={loading}
                isDisabled={!selectedProject}
                isClearable
                classNamePrefix="text-sm"
                className="text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Description
              </label>
              <Select
                value={selectedWorkDescription}
                onChange={setSelectedWorkDescription}
                options={workDescriptions}
                placeholder="Select work description..."
                isLoading={loading}
                isDisabled={!selectedSite}
                isClearable
                classNamePrefix="text-sm"
                className="text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
        {budgetData && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 overflow-hidden">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">PO Budget Details</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total PO Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit of Measure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {budgetData.total_po_qty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {budgetData.uom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                      ₹{budgetData.total_rate.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <span className="text-2xl font-bold text-indigo-600">
                Total PO Value: ₹{budgetData.total_po_value.toLocaleString()}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Current Selection
                </h4>
                <p className="text-sm text-gray-900">Company: {selectedCompany?.label || "Not selected"}</p>
                <p className="text-sm text-gray-900">Project: {selectedProject?.label || "Not selected"}</p>
                <p className="text-sm text-gray-900">Site: {selectedSite?.label || "Not selected"}</p>
                <p className="text-sm text-gray-900">Work Description: {selectedWorkDescription?.label || "Not selected"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Budget Information
                </h4>
                <p className="text-sm text-gray-900">PO Value: ₹{budgetData.total_po_value.toLocaleString()}</p>
                <p className="text-sm text-gray-900">Existing Budget Value: {existingBudget ? `₹${parseFloat(existingBudget.total_budget_value).toLocaleString()}` : "Not set"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Allocation Status
                </h4>
                <p className="text-sm text-gray-900">Status: {isAllocated ? "Budget Allocated" : "Pending Allocation"}</p>
                <p className="text-sm text-gray-900">Allocated Overheads: {allocatedOverheads.length}</p>
              </div>
            </div>
          </div>
        )}
        {budgetData && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-semibold text-gray-800">Overhead Allocation Projections</h2>
  <button
    onClick={addNewProjection}
    className="flex items-center px-6 py-3 font-semibold rounded-full transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    <PlusCircle className="mr-2" size={20} />
    Add New Projection
  </button>
</div>
            {ProjectionAccordion}
          </div>
        )}
  
        {existingBudget && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Budget Allocated
            </h2>
            {isAllocated ? (
              <>
                {percError && (
                  <div className="mb-4 p-3 bg-red-100 rounded-lg text-red-800 font-medium flex items-center space-x-2">
                    <AlertCircle size={16} />
                    <span>{percError} | {budgetError}</span>
                </div>
                )}
                {lastProjection.prevRemainingBudget > 0 && (
                  <div className="mb-4 p-3 bg-yellow-100 rounded-lg text-yellow-800 font-medium flex items-center space-x-2">
                    <AlertCircle size={16} />
                    <span>Previous Remaining Added to Target: ₹{parseFloat(lastProjection.prevRemainingBudget).toLocaleString()} ({lastProjection.prevRemainingPercentage.toFixed(2)}%)</span>
                  </div>
                )}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          S.No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          List of Expense
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budget Percentage (%)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Budgeted Value (Rs.)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actual Value (Rs.)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance (Rs.)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allocatedOverheads.map((overhead, index) => (
                        <tr key={overhead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {overhead.expense_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {overhead.percentage || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {overhead.splitted_budget || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {overhead.actual_value || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={
                                parseFloat(overhead.difference_value || 0) >= 0
                                  ? "text-green-600 font-medium"
                                  : "text-red-600 font-medium"
                              }
                            >
                              {overhead.difference_value || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {overhead.remarks || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <span className="font-medium text-gray-700">Total Percentage:</span>
                      <span className="ml-2 text-lg font-bold text-green-600">
                        {sumPerc.toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Budget:</span>
                      <span className="ml-2 text-lg font-bold text-green-600">
                        ₹{sumBudget.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Target Budget (Last Proj):</span>
                      <span className="ml-2 text-lg font-bold text-indigo-600">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <AlertCircle className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Allocation Pending</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No budget has been allocated yet for this PO. Please complete the projection and allocation process to view and track expense breakdowns professionally.
                </p>
              </div>
            )}
          </div>
        )}
        {isAllocated && chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">Budget Overview (Budgeted vs Actual vs Balance)</h3>
              {lastProjection.prevRemainingBudget > 0 && (
                <div className="mb-4 p-3 bg-yellow-100 rounded-lg text-yellow-800 font-medium flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>Previous Remaining Added: ₹{parseFloat(lastProjection.prevRemainingBudget).toLocaleString()} ({lastProjection.prevRemainingPercentage.toFixed(2)}%)</span>
                </div>
              )}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]}
                      labelStyle={{ color: "#374151" }}
                      contentStyle={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                    />
                    <Bar dataKey="value" barSize={30}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-800">
                Expense-wise Allocation (Budgeted vs Actual)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <XAxis dataKey="name" className="text-sm" angle={-45} textAnchor="end" height={80} />
                    <YAxis className="text-sm" />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString()}`, "Amount"]}
                      labelStyle={{ color: "#374151" }}
                      contentStyle={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
                    />
                    <Bar dataKey="budgeted" fill="#10b981" name="Budgeted" barSize={30} />
                    <Bar dataKey="actual" name="Actual" barSize={30}>
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.actualFill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Edit Modal - Global for Material */}
      {showEditModal && editingAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Edit Material Assignment</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAssignment(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {materialError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600" dangerouslySetInnerHTML={{ __html: materialError }} />
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                  <CreatableSelect
                    options={materialOptions}
                    value={materialOptions.find((opt) => opt.value === editingAssignment.item_id) || null}
                    onChange={handleModalItemSelect}
                    formatCreateLabel={CustomCreateLabel}
                    isSearchable
                    isClearable
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Select or type material..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label>
                    <Select
                      options={uomOptions}
                      value={uomOptions.find((opt) => opt.value === editingAssignment.uom_id) || null}
                      onChange={handleModalUomSelect}
                      isSearchable
                      isClearable
                      className="text-sm"
                      classNamePrefix="select"
                      placeholder="Select UOM..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={editingAssignment.quantity}
                      onChange={handleModalChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      min="1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate per Quantity</label>
                    <input
                      type="number"
                      name="rate"
                      value={editingAssignment.rate}
                      onChange={handleModalChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost</label>
                    <input
                      type="text"
                      value={`₹${modalTotalCost}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 w-28">Comp Ratio A:</label>
                    <input
                      type="number"
                      name="comp_ratio_a"
                      value={editingAssignment.comp_ratio_a || ""}
                      onChange={handleModalChange}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      min="0"
                    />
                    <span className="text-sm text-gray-600">Qty: {editCompQuantities.comp_a_qty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 w-28">Comp Ratio B:</label>
                    <input
                      type="number"
                      name="comp_ratio_b"
                      value={editingAssignment.comp_ratio_b || ""}
                      onChange={handleModalChange}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      min="0"
                    />
                    <span className="text-sm text-gray-600">Qty: {editCompQuantities.comp_b_qty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 w-28">Comp Ratio C:</label>
                    <input
                      type="number"
                      name="comp_ratio_c"
                      value={editingAssignment.comp_ratio_c || ""}
                      onChange={handleModalChange}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                      min="0"
                    />
                    <span className="text-sm text-gray-600">Qty: {editCompQuantities.comp_c_qty}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAssignment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={materialLoading.submitting}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {materialLoading.submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProjectProjectionNew;
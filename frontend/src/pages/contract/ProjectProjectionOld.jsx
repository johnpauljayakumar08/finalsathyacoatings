import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { Plus, PlusCircle, Trash2, Loader2, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Edit2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import MaterialPlanning from "./MaterialPlanning";

const ProjectProjectionOld = () => {
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

  // Memoized chart data (updated: use last projection's budgetValue only, no + prevRem)
  const lastProjection = useMemo(() => projections[projections.length - 1], [projections]);
  const effectiveBudgetValue = useMemo(() => {
    const lastBudget = parseFloat(lastProjection.budgetValue) || 0;
    return lastBudget;
  }, [lastProjection]);

const allocatedOverheads = useMemo(() => 
  Object.values(actualBudgetEntries).map(entry => ({
    id: entry.overhead_id || Math.random(),
    expense_name: entry.expense_name,
    percentage: entry.percentage,
    splitted_budget: entry.splitted_budget,
    actual_value: entry.expense_name?.toLowerCase() === 'materials'  // Changed from 'material' to 'materials'
      ? materialActual.toFixed(2) 
      : (entry.actual_value !== null ? parseFloat(entry.actual_value).toFixed(2) : null),
    difference_value: entry.expense_name?.toLowerCase() === 'materials'  // Changed from 'material' to 'materials'
      ? (parseFloat(entry.splitted_budget) - materialActual).toFixed(2) 
      : (entry.difference_value !== null ? parseFloat(entry.difference_value).toFixed(2) : null),
    remarks: entry.remarks || "",
  })), [actualBudgetEntries, materialActual]
);

const chartData = useMemo(() => {
  if (!existingBudget || allocatedOverheads.length === 0) { // Changed to allocatedOverheads
    return [];
  }
  const budgetedValue = effectiveBudgetValue;
  const actualValue = allocatedOverheads // Changed from actualBudgetEntries
    .filter((entry) => entry.actual_value !== null)
    .reduce((sum, entry) => sum + parseFloat(entry.actual_value || 0), 0);
  const balanceValue = budgetedValue - actualValue;
  return [
    { name: "Budgeted Value", value: budgetedValue, fill: "#10b981" },
    { name: "Actual Value", value: actualValue, fill: "#3b82f6" },
    { name: "Balance", value: Math.abs(balanceValue), fill: balanceValue < 0 ? "#ef4444" : "#f59e0b" },
  ];
}, [existingBudget, allocatedOverheads, effectiveBudgetValue]); // Updated deps
const expenseChartData = useMemo(() => {
  if (!isAllocated || allocatedOverheads.length === 0) { // Changed to allocatedOverheads
    return [];
  }
  return allocatedOverheads.map((entry) => { // Changed from actualBudgetEntries
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
}, [allocatedOverheads, isAllocated]); // Updated deps

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

  // New: Fetch submission statuses from backend
  const fetchSubmissionStatuses = useCallback(async () => {
    if (!selectedSite?.value || !selectedWorkDescription?.value) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/projection/submission-statuses`, {
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

  // Updated: canAddProjection - check if previous is submitted
  const canAddProjection = useMemo(() => {
    if (projections.length === 1) return projections[0].submitted; // First must be submitted
    const last = projections[projections.length - 1];
    return last.submitted;
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
                submitted: saved.projection_status === 1, // Use backend status (1 for first, but overridden by submission)
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
  // Projection management functions (unchanged except addNewProjection uses submitted)
  const addNewProjection = useCallback(() => {
    if (!canAddProjection) {
      Swal.fire({
        icon: "warning",
        title: "Complete Current Projection",
        text: "Please submit the current projection before adding a new one.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }
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
  }, [projections, budgetData, defaultProjectionTemplate, canAddProjection]);

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
  const dynamicOverheadTotal = Object.values(projection.dynamicOverheads || {}).reduce(
    (sum, overhead) => sum + (parseFloat(overhead.value) || 0),
    0
  );
  const totalAllocated = projection.materialTotalCost + projection.labourTotalCost + dynamicOverheadTotal;
  const budgetValue = parseFloat(projection.budgetValue) || 0;
  const remaining = budgetValue - totalAllocated;
  const percentage = budgetValue > 0 ? (remaining / budgetValue * 100) : 0;
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
        projection_id: projectionId  // Added projection_id
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
        projection_id: projectionId  // Added projection_id
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

  // Updated: Edit overhead handler (REMOVED - no longer used; forms are always editable)
  // (Kept for reference but not called; remove if not needed elsewhere)

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
        // Set submitted
        setProjections(prev => prev.map(p => p.id === projectionId ? { ...p, submitted: true } : p));
        setSubmissionStatuses(prev => ({ ...prev, [projectionId]: { ...prev[projectionId], submitted: true } }));
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit projection. Please try again.",
        confirmButtonColor: "#4f46e5",
      });
    }
  }, [projections, selectedSite, selectedWorkDescription, existingBudget, fetchActualBudgetEntries, budgetData, fetchAllPoBudgets, checkBudgetExists, fetchRemainingBudget, fetchAllocatedOverheads]);

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
        projection_id: projectionId,  // Added projection_id
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
      if (proj.submitted) fetchRemainingBudget(proj.id).catch(console.error);
    });
  }
}, [selectedSite?.value, selectedWorkDescription?.value, projections.map(p => p.id).join(',')]);
// Updated ProjectionAccordion useMemo (add prev remaining display, remove edit/delete in summary, top-right delete only, pre-populate forms with allocated data, no small edit/delete below save)
const ProjectionAccordion = useMemo(() => 
  projections.map((projection) => {
    const prevProjection = projections.find(p => p.id === projection.id - 1);
    const prevPerc = prevProjection?.budgetAllocated ? parseFloat(prevProjection.budgetPercentage) : 0;
    const progressWidth = (parseFloat(projection.budgetPercentage || 0) / 100) * 100;
    const isSubmitted = submissionStatuses[projection.id]?.submitted || projection.submitted;
    const { remainingBudget: calcRemBudget, remainingPercentage: calcRemPerc } = calculateRemainingBudget(projection);
    const effectiveBudget = projection.effectiveBudget || parseFloat(projection.budgetValue);
    const effectiveRemPerc = effectiveBudget > 0 ? ((isSubmitted ? projection.remainingBudget : calcRemBudget) / effectiveBudget * 100) : 0;
    const allocOverhead = projection.allocatedOverheads.find(oh => oh.expense_name.toLowerCase() === 'labours') || {};
    const dynOverhead = projection.allocatedOverheads.find(oh => oh.id === parseInt(projection.activeOverheadTab?.split('-')[1]));
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
                      onClick={() => updateProjectionField(projection.id, 'activeOverheadTab', tab.key)}
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
                  <div className="p-6 bg-gray-50 rounded-xl mb-6">
                    <h4 className="text-xl font-semibold mb-6 flex items-center space-x-2 text-indigo-800">
                      <span>📦</span>
                      <span>Material Overhead</span>
                    </h4>
                    <MaterialPlanning
                      selectedCompany={selectedCompany}
                      selectedProject={selectedProject}
                      selectedSite={selectedSite}
                      selectedWorkDesc={selectedWorkDescription}
                      existingBudget={existingBudget}
                      projectionBudgetValue={projection.budgetValue}
                      projectionId={projection.id}
                      isSubmitted={isSubmitted}
                      onTotalCostChange={handleTotalCostChangeForProjection(projection.id)}
                    />
                    {!isSubmitted && (
                      <button
                        onClick={() => saveMaterialAllocation(projection.id)}
                        className="mt-4 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Save Material Allocation
                      </button>
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
  {/* Always display calculated remaining (override with fetched if submitted) */}
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
  }), [projections, toggleProjection, budgetData, loading, savePoBudget, updateProjectionField, overheads, handleSelectOverhead, addNewOverhead, handleTotalCostChangeForProjection, handleLabourCalculationTypeChange, handleNoOfLaboursChange, handleTotalShiftsChange, handleRatePerShiftChange, saveLabourOverhead, handleRemoveOverhead, calculateDynamicOverheadBudgetPercentage, calculateRemainingBudget, saveDynamicOverhead, finalSubmissionProjection, selectedCompany, selectedProject, selectedSite, selectedWorkDescription, existingBudget, saveMaterialAllocation, calculateLabourTotalCost, recalculateAllPercentages, fetchAllocatedOverheads, fetchRemainingBudget, submissionStatuses, deleteOverhead]
);

  const addedOverheads = useMemo(() => overheads.filter(o => o.is_default === 0), [overheads]);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
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
                disabled={!canAddProjection}
                className={`flex items-center px-6 py-3 font-semibold rounded-full transition-all duration-200 ${
                  canAddProjection
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
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
    </div>
  );
};

export default ProjectProjectionOld;
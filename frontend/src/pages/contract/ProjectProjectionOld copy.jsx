import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const ProjectProjectionOld = () => {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedWorkDescription, setSelectedWorkDescription] = useState(null);
  const [budgetData, setBudgetData] = useState(null);

  console.log("Budget Data:", budgetData);
  const [budgetPercentage, setBudgetPercentage] = useState("");
  const [budgetValue, setBudgetValue] = useState("");
  const [existingBudget, setExistingBudget] = useState(null);
  const [overheads, setOverheads] = useState([]);
  const [checkedExpenses, setCheckedExpenses] = useState({});
  const [actualBudgetEntries, setActualBudgetEntries] = useState({});
  const [isAllocated, setIsAllocated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch companies
const fetchCompanies = async () => {
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
};

// Fetch projects by company ID
const fetchProjects = async (companyId) => {
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
};
// Fetch sites by project ID
const fetchSites = async (projectId) => {
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
};

// Fetch work descriptions by site ID
const fetchWorkDescriptions = async (siteId) => {
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
};

  // Fetch budget details by site ID and work description ID
  const fetchBudgetDetails = async (siteId, descId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/po-total-budget/${siteId}/${descId}`
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
  };

  // Check if budget exists for site_id and desc_id
  const checkBudgetExists = async (siteId, descId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/po-budget`, {
        params: { site_id: siteId, desc_id: descId },
      });
      if (response.data.success && response.data.data) {
        const budget = {
          ...response.data.data,
          total_po_value: parseFloat(response.data.data.total_po_value) || 0,
          total_budget_value: parseFloat(response.data.data.total_budget_value) || 0,
        };
        setExistingBudget(budget);
        if (budget.total_po_value && budget.total_budget_value) {
          const percentage = ((budget.total_budget_value / budget.total_po_value) * 100).toFixed(2);
          setBudgetPercentage(percentage);
          setBudgetValue(budget.total_budget_value.toFixed(2));
        } else {
          setBudgetPercentage("");
          setBudgetValue("");
        }
      } else {
        setExistingBudget(null);
        setBudgetPercentage("");
        setBudgetValue("");
      }
    } catch (error) {
      console.error("Error checking budget existence:", error);
      setError("Failed to check budget existence. Please try again.");
      setExistingBudget(null);
    }
  };

  // Fetch overheads and initialize actualBudgetEntries
  const fetchOverheads = async (po_budget_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/overheads`, {
        params: po_budget_id ? { po_budget_id } : {},
      });
      if (response.data.success) {
        setOverheads(response.data.data);
        const initialChecked = {};
        const newEntries = {};

        response.data.data.forEach((overhead) => {
          initialChecked[overhead.id] = overhead.is_default === 1;
          newEntries[overhead.id] = {
            splitted_budget: null,
            percentage: null,
            actual_value: null,
            difference_value: null,
            remarks: "",
            edited: false,
          };
        });

        setCheckedExpenses(initialChecked);
        setActualBudgetEntries(newEntries);
      } else {
        setError("Failed to fetch overheads.");
      }
    } catch (error) {
      console.error("Error fetching overheads:", error);
      setError("Failed to load overheads. Please try again.");
    }
  };

  // Fetch actual budget entries
  const fetchActualBudgetEntries = async (po_budget_id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/actual-budget/${po_budget_id}`);
      if (response.data.success) {
        const entries = response.data.data || {};
        const processedEntries = {};
        Object.keys(entries).forEach((overheadId) => {
          const val = parseFloat(entries[overheadId].splitted_budget) || 0;
          const perc = existingBudget?.total_budget_value > 0 
            ? (val / existingBudget.total_budget_value * 100).toFixed(2) 
            : "0.00";
          processedEntries[overheadId] = {
            ...entries[overheadId],
            percentage: perc,
            edited: true,
          };
        });
        setActualBudgetEntries(processedEntries);
        setIsAllocated(Object.keys(processedEntries).length > 0);
        if (Object.keys(processedEntries).length > 0) {
          const checked = {};
          Object.keys(processedEntries).forEach((id) => {
            checked[id] = true;
          });
          setCheckedExpenses(checked);
        }
      } else {
        setError(response.data.message || "Failed to fetch actual budget entries.");
      }
    } catch (error) {
      console.error("Error fetching actual budget entries:", error);
      setError("Failed to load actual budget entries. Please try again.");
    }
  };

  // Save budget details to backend
  const savePoBudget = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/save-po-budget`, {
        site_id: selectedSite.value,
        desc_id: selectedWorkDescription.value,
        total_po_value: budgetData.total_po_value,
        total_budget_value: parseFloat(budgetValue) || 0,
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
        await checkBudgetExists(selectedSite.value, selectedWorkDescription.value);
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
  };

  // Save new overhead
  const saveOverhead = async () => {
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
      },
    });

    if (expense_name) {
      try {
        const response = await axios.post(`${API_BASE_URL}/admin/save-overhead`, {
          expense_name,
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
          const newOverhead = { id: response.data.data.id, expense_name, is_default: 0 };
          setOverheads((prev) => [...prev, newOverhead]);
          setCheckedExpenses((prev) => ({
            ...prev,
            [newOverhead.id]: false,
          }));
          setActualBudgetEntries((prev) => ({
            ...prev,
            [newOverhead.id]: {
              splitted_budget: null,
              percentage: null,
              actual_value: null,
              difference_value: null,
              remarks: "",
              edited: false,
            },
          }));
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
        console.error("Error saving overhead:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to save overhead. Please try again.",
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
      }
    }
  };

  // Allocate budget
  const allocateBudget = async () => {
    if (!existingBudget || !existingBudget.total_budget_value) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No valid budget exists to allocate expenses.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const checkedCount = Object.values(checkedExpenses).filter((checked) => checked).length;
    if (checkedCount === 0) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "At least one expense must be checked.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const { sumPerc, sumBudget } = computeSums();
    if (Math.abs(sumPerc - 100) > 0.01) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: `Total budget percentage must equal 100%. Current total: ${sumPerc.toFixed(2)}%.`,
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    const entries = Object.keys(checkedExpenses)
      .filter((id) => checkedExpenses[id])
      .map((id) => ({
        overhead_id: parseInt(id),
        splitted_budget: parseFloat(actualBudgetEntries[id]?.splitted_budget) || 0,
        actual_value: parseFloat(actualBudgetEntries[id]?.actual_value) || null,
        remarks: actualBudgetEntries[id]?.remarks || "",
      }));

    const totalSplitted = entries.reduce((sum, entry) => sum + parseFloat(entry.splitted_budget || 0), 0);
    if (Math.abs(totalSplitted - existingBudget.total_budget_value) > 0.01) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: `Sum of budgeted values (${totalSplitted.toFixed(2)}) must equal total budget value (Rs.${existingBudget.total_budget_value.toFixed(2)}).`,
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/save-actual-budget`, {
        po_budget_id: existingBudget.id,
        actual_budget_entries: entries,
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
        await fetchActualBudgetEntries(existingBudget.id);
        
        // Call calculate-labour-budget API after successful allocation
        try {
          await axios.get(`${API_BASE_URL}/site-incharge/calculate-labour-budget`);
        } catch (error) {
          console.error("Error calling calculate-labour-budget API:", error.message);
        }
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
      console.error("Error allocating budget:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to allocate budget. Please try again.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  // Handle budget percentage input change
  const handleBudgetPercentageChange = (e) => {
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

    setBudgetPercentage(percentage);

    if (percentage && budgetData && budgetData.total_po_value) {
      const percentageValue = parseFloat(percentage);
      if (!isNaN(percentageValue) && percentageValue >= 0) {
        const calculatedValue = (percentageValue / 100) * budgetData.total_po_value;
        if (calculatedValue <= budgetData.total_po_value) {
          setBudgetValue(calculatedValue.toFixed(2));
        } else {
          setBudgetValue(budgetData.total_po_value.toFixed(2));
        }
      } else {
        setBudgetValue("");
      }
    } else {
      setBudgetValue("");
    }
  };

  // Handle budget value input change
  const handleBudgetValueChange = (e) => {
    let value = e.target.value;

    if (
      value &&
      budgetData &&
      budgetData.total_po_value &&
      parseFloat(value) > budgetData.total_po_value
    ) {
      value = budgetData.total_po_value.toString();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Budget value cannot exceed Rs.${budgetData.total_po_value.toFixed(2)}.`,
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }

    setBudgetValue(value);

    if (value && budgetData && budgetData.total_po_value) {
      const valueNumber = parseFloat(value);
      if (!isNaN(valueNumber) && valueNumber >= 0 && budgetData.total_po_value > 0) {
        const calculatedPercentage = (valueNumber / budgetData.total_po_value) * 100;
        if (calculatedPercentage <= 100) {
          setBudgetPercentage(calculatedPercentage.toFixed(2));
        } else {
          setBudgetPercentage("100");
        }
      } else {
        setBudgetPercentage("");
      }
    } else {
      setBudgetPercentage("");
    }
  };

  // Handle expense checkbox change
  const handleExpenseCheckboxChange = (id) => {
    setCheckedExpenses((prev) => {
      const newChecked = { ...prev, [id]: !prev[id] };
      const checkedCount = Object.values(newChecked).filter((checked) => checked).length;
      if (checkedCount === 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "At least one expense must be checked.",
          confirmButtonColor: "#4f46e5",
          timer: 3000,
          timerProgressBar: true,
        });
        return prev;
      }
      if (!newChecked[id]) {
        setActualBudgetEntries((prevEntries) => ({
          ...prevEntries,
          [id]: {
            ...prevEntries[id],
            splitted_budget: null,
            percentage: null,
            edited: false,
          },
        }));
      }
      return newChecked;
    });
  };

  // Handle percentage change for individual expense
  const handlePercentageChange = (id, value) => {
    let perc = value === "" ? "" : parseFloat(value);
    if (value === "" || isNaN(perc) || perc < 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Percentage cannot be negative or invalid.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }
    if (perc > 100) {
      perc = 100;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Percentage cannot exceed 100%.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }

    const total = existingBudget.total_budget_value;
    const newValue = ((perc / 100) * total).toFixed(2);

    setActualBudgetEntries((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        percentage: value,
        splitted_budget: newValue,
        edited: true,
      },
    }));
  };

  // Handle budgeted value change for individual expense
  const handleSplittedBudgetChange = (id, value) => {
    let val = parseFloat(value);
    if (isNaN(val) || val < 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Budget value cannot be negative.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
      return;
    }
    const total = existingBudget.total_budget_value;
    if (val > total) {
      val = total;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Budget value cannot exceed Rs.${total.toFixed(2)}.`,
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }

    const perc = (val / total * 100).toFixed(2);

    setActualBudgetEntries((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        splitted_budget: val.toFixed(2),
        percentage: perc.includes(".") ? perc : parseInt(perc).toString(),
        edited: true,
      },
    }));
  };

  // Compute sums for validation
  const computeSums = () => {
    let sumPerc = 0;
    let sumBudget = 0;
    Object.keys(checkedExpenses).forEach((id) => {
      if (checkedExpenses[id]) {
        sumPerc += parseFloat(actualBudgetEntries[id]?.percentage || 0);
        sumBudget += parseFloat(actualBudgetEntries[id]?.splitted_budget || 0);
      }
    });
    return { sumPerc, sumBudget };
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (
      selectedCompany &&
      selectedProject &&
      selectedSite &&
      selectedWorkDescription &&
      budgetPercentage &&
      budgetValue
    ) {
      await savePoBudget();
    } else {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select all fields and enter budget details before submitting.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  // Load companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Fetch projects when a company is selected
  useEffect(() => {
    if (selectedCompany) {
      fetchProjects(selectedCompany.value);
      setProjects([]);
      setSites([]);
      setWorkDescriptions([]);
      setSelectedProject(null);
      setSelectedSite(null);
      setSelectedWorkDescription(null);
      setBudgetData(null);
      setExistingBudget(null);
      setBudgetPercentage("");
      setBudgetValue("");
      setOverheads([]);
      setCheckedExpenses({});
      setActualBudgetEntries({});
      setIsAllocated(false);
    } else {
      setProjects([]);
      setSites([]);
      setWorkDescriptions([]);
      setSelectedProject(null);
      setSelectedSite(null);
      setSelectedWorkDescription(null);
      setBudgetData(null);
      setExistingBudget(null);
      setBudgetPercentage("");
      setBudgetValue("");
      setOverheads([]);
      setCheckedExpenses({});
      setActualBudgetEntries({});
      setIsAllocated(false);
    }
  }, [selectedCompany]);

  // Fetch sites when a project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchSites(selectedProject.value);
      setSites([]);
      setWorkDescriptions([]);
      setSelectedSite(null);
      setSelectedWorkDescription(null);
      setBudgetData(null);
      setExistingBudget(null);
      setBudgetPercentage("");
      setBudgetValue("");
      setOverheads([]);
      setCheckedExpenses({});
      setActualBudgetEntries({});
      setIsAllocated(false);
    } else {
      setSites([]);
      setWorkDescriptions([]);
      setSelectedSite(null);
      setSelectedWorkDescription(null);
      setBudgetData(null);
      setExistingBudget(null);
      setBudgetPercentage("");
      setBudgetValue("");
      setOverheads([]);
      setCheckedExpenses({});
      setActualBudgetEntries({});
      setIsAllocated(false);
    }
  }, [selectedProject]);

  // Fetch work descriptions when a site is selected
  useEffect(() => {
    if (selectedSite) {
      fetchWorkDescriptions(selectedSite.value);
      setWorkDescriptions([]);
      setSelectedWorkDescription(null);
      setBudgetData(null);
      setExistingBudget(null);
      setBudgetPercentage("");
      setBudgetValue("");
      setOverheads([]);
      setCheckedExpenses({});
      setActualBudgetEntries({});
      setIsAllocated(false);
    } else {
      setWorkDescriptions([]);
      setSelectedWorkDescription(null);
      setBudgetData(null);
      setExistingBudget(null);
      setBudgetPercentage("");
      setBudgetValue("");
      setOverheads([]);
      setCheckedExpenses({});
      setActualBudgetEntries({});
      setIsAllocated(false);
    }
  }, [selectedSite]);

  // Fetch budget details and check budget existence when a work description is selected
  useEffect(() => {
    if (selectedSite && selectedWorkDescription) {
      fetchBudgetDetails(selectedSite.value, selectedWorkDescription.value);
      checkBudgetExists(selectedSite.value, selectedWorkDescription.value);
    } else {
      setBudgetData(null);
      setExistingBudget(null);
      setBudgetPercentage("");
      setBudgetValue("");
      setOverheads([]);
      setCheckedExpenses({});
      setActualBudgetEntries({});
      setIsAllocated(false);
    }
  }, [selectedSite, selectedWorkDescription]);

  // Fetch overheads and actual budget entries when budget exists
  useEffect(() => {
    if (existingBudget && existingBudget.id) {
      fetchOverheads(existingBudget.id);
      fetchActualBudgetEntries(existingBudget.id);
    } else {
      setOverheads([]);
      setCheckedExpenses({});
      setActualBudgetEntries({});
      setIsAllocated(false);
    }
  }, [existingBudget]);

  // Calculate chart data for total budget, actual, and balance
  const chartData = existingBudget && actualBudgetEntries
    ? (() => {
        const budgetedValue = Object.values(actualBudgetEntries)
          .filter((entry) => entry.splitted_budget !== null)
          .reduce((sum, entry) => sum + parseFloat(entry.splitted_budget || 0), 0);
        const actualValue = Object.values(actualBudgetEntries)
          .filter((entry) => entry.actual_value !== null)
          .reduce((sum, entry) => sum + parseFloat(entry.actual_value || 0), 0);
        const balanceValue = budgetedValue - actualValue;

        return [
          { name: "Budgeted Value", value: budgetedValue, fill: "#92c352" },
          { name: "Actual Value", value: actualValue, fill: "#40A4DF" },
          { name: "Balance", value: Math.abs(balanceValue), fill: balanceValue < 0 ? "#C84D4D" : "#f0af0a" },
        ];
      })()
    : [];

  // Calculate chart data for individual expenses (Budgeted vs Actual)
  const expenseChartData = overheads
    .filter((overhead) =>
      isAllocated ? actualBudgetEntries[overhead.id]?.splitted_budget !== null : true
    )
    .map((overhead) => {
      const budgeted = parseFloat(actualBudgetEntries[overhead.id]?.splitted_budget) || 0;
      const actual = parseFloat(actualBudgetEntries[overhead.id]?.actual_value) || 0;
      const actualExceedsBudget = actual > budgeted;
      return {
        name: overhead.expense_name,
        budgeted: budgeted,
        actual: actual,
        actualFill: actualExceedsBudget ? "#C84D4D" : "#40A4DF",
      };
    });

  const { sumPerc, sumBudget } = computeSums();
  const total = existingBudget?.total_budget_value || 0;
  const percDiff = sumPerc - 100;
  const budgetDiff = sumBudget - total;
  const percError = percDiff > 0.01 ? `Excess by ${percDiff.toFixed(2)}%` : percDiff < -0.01 ? `Short by ${Math.abs(percDiff).toFixed(2)}%` : "";
  const budgetError = budgetDiff > 0.01 ? `Excess by Rs.${budgetDiff.toFixed(2)}` : budgetDiff < -0.01 ? `Short by Rs.${Math.abs(budgetDiff).toFixed(2)}` : "";
  const isValid = Math.abs(sumPerc - 100) <= 0.01 && Math.abs(budgetDiff) <= 0.01;
  const successMessage = isValid ? "100% of budgeted value allocated successfully!" : "";

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
        Project Projection
      </h2>
      {loading && (
        <div className="flex justify-center items-center h-full min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      )}
      {error && (
        <div className="p-4 sm:p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm sm:text-base animate-pulse mb-4">
          {error}
        </div>
      )}
      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Company
              </label>
              <Select
                options={companies}
                value={selectedCompany}
                onChange={setSelectedCompany}
                placeholder="Select a company..."
                className="text-sm"
                isClearable
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Cost Center
              </label>
              <Select
                options={projects}
                value={selectedProject}
                onChange={setSelectedProject}
                placeholder="Select a cost center..."
                className="text-sm"
                isDisabled={!selectedCompany}
                isClearable
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Site
              </label>
              <Select
                options={sites}
                value={selectedSite}
                onChange={setSelectedSite}
                placeholder="Select a site..."
                className="text-sm"
                isDisabled={!selectedProject}
                isClearable
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Work Description
              </label>
              <Select
                options={workDescriptions}
                value={selectedWorkDescription}
                onChange={setSelectedWorkDescription}
                placeholder="Select a work description..."
                className="text-sm"
                isDisabled={!selectedSite}
                isClearable
              />
            </div>
          </div>
          {budgetData && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
                        Total PO Quantity
                      </th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
                        Unit of Measure
                      </th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
                        Total Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b text-sm text-gray-800">
                        {budgetData.total_po_qty}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-800">
                        {budgetData.uom}
                      </td>
                      <td className="py-2 px-4 border-b text-sm text-gray-800">
                        Rs.{budgetData.total_rate.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="p-4 bg-indigo-50 rounded-lg shadow-sm w-full sm:w-1/3">
                  <h3 className="text-lg font-medium text-gray-800">
                    Total PO Value
                  </h3>
                  <p className="text-2xl font-bold text-indigo-600">
                    Rs.{budgetData.total_po_value.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-2/3 items-start">
                  <div className="flex flex-col gap-2 w-full sm:w-1/2">
                    {existingBudget ? (
                      <>
                        <p className="text-sm font-medium text-gray-700">
                          Budget Percentage: {budgetPercentage}%
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          Budget Value: Rs.{budgetValue}
                        </p>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget Percentage (%)
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max="100"
                            value={budgetPercentage}
                            onChange={handleBudgetPercentageChange}
                            placeholder="Enter percentage (0-100)"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Budget Value (Rs.)
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max={budgetData ? budgetData.total_po_value : undefined}
                            value={budgetValue}
                            onChange={handleBudgetValueChange}
                            placeholder="Enter budget value"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {chartData.length > 0 && (
                    <div className="w-full sm:w-1/2 h-48">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Budget Summary</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis hide tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                          <Tooltip
                            formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                            labelStyle={{ fontSize: 12 }}
                            itemStyle={{ fontSize: 12 }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
              {!existingBudget && (
                <button
                  onClick={handleSubmit}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  disabled={
                    !selectedCompany ||
                    !selectedProject ||
                    !selectedSite ||
                    !selectedWorkDescription ||
                    !budgetPercentage ||
                    !budgetValue
                  }
                >
                  Submit
                </button>
              )}
            </div>
          )}
          {existingBudget && existingBudget.total_budget_value && overheads.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Expense Allocation</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">S.No</th>
                      {!isAllocated && (
                        <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Select</th>
                      )}
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
                        List of Expense
                        {!isAllocated && (
                          <button
                            onClick={saveOverhead}
                            className="ml-2 inline-flex p-1 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-200"
                            title="Add New Overhead"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
                        Budget Percentage (%)
                        {successMessage && <span className="block text-green-500 text-xs">{successMessage}</span>}
                        {percError && !successMessage && <span className="block text-red-500 text-xs">{percError}</span>}
                      </th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
                        Budgeted Value (Rs.)
                        {successMessage && <span className="block text-green-500 text-xs">{successMessage}</span>}
                        {budgetError && !successMessage && <span className="block text-red-500 text-xs">{budgetError}</span>}
                      </th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Actual Value (Rs.)</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Balance (Rs.)</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overheads
                      .filter((overhead) =>
                        isAllocated ? actualBudgetEntries[overhead.id]?.splitted_budget !== null : true
                      )
                      .map((overhead, index) => {
                        const budgeted = parseFloat(actualBudgetEntries[overhead.id]?.splitted_budget) || 0;
                        const actual = parseFloat(actualBudgetEntries[overhead.id]?.actual_value) || 0;
                        const balance = budgeted - actual;
                        return (
                          <tr key={overhead.id}>
                            <td className="py-2 px-4 border-b text-sm text-gray-800">{index + 1}</td>
                            {!isAllocated && (
                              <td className="py-2 px-4 border-b text-sm text-gray-800">
                                <input
                                  type="checkbox"
                                  checked={!!checkedExpenses[overhead.id]}
                                  onChange={() => handleExpenseCheckboxChange(overhead.id)}
                                  disabled={overhead.is_default === 1}
                                />
                              </td>
                            )}
                            <td className="py-2 px-4 border-b text-sm text-gray-800">{overhead.expense_name}</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-800">
                              {isAllocated ? (
                                actualBudgetEntries[overhead.id]?.percentage || "N/A"
                              ) : checkedExpenses[overhead.id] ? (
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  max="100"
                                  value={actualBudgetEntries[overhead.id]?.percentage || ""}
                                  onChange={(e) => handlePercentageChange(overhead.id, e.target.value)}
                                  className="w-full p-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                  placeholder="Enter percentage"
                                />
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="py-2 px-4 border-b text-sm text-gray-800">
                              {isAllocated ? (
                                actualBudgetEntries[overhead.id]?.splitted_budget || "N/A"
                              ) : checkedExpenses[overhead.id] ? (
                                <input
                                  type="number"
                                  step="any"
                                  min="0"
                                  value={actualBudgetEntries[overhead.id]?.splitted_budget || ""}
                                  onChange={(e) => handleSplittedBudgetChange(overhead.id, e.target.value)}
                                  className="w-full p-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                  placeholder="Enter value"
                                />
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="py-2 px-4 border-b text-sm text-gray-800">
                              {actualBudgetEntries[overhead.id]?.actual_value || "null"}
                            </td>
                            <td className="py-2 px-4 border-b text-sm text-gray-800">
                              {actualBudgetEntries[overhead.id]?.splitted_budget && actualBudgetEntries[overhead.id]?.actual_value
                                ? balance.toFixed(2)
                                : "null"}
                            </td>
                            <td className="py-2 px-4 border-b text-sm text-gray-800">
                              {actualBudgetEntries[overhead.id]?.remarks || "null"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              
              {expenseChartData.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Expense Budget vs Actual</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={expenseChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        height={100}
                      />
                      <YAxis tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                        labelStyle={{ fontSize: 12 }}
                        itemStyle={{ fontSize: 12 }}
                      />
                      <Bar dataKey="budgeted" fill="#92c352" name="Budgeted Value" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actual" fill="#40A4DF" name="Actual Value" radius={[4, 4, 0, 0]}>
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.actualFill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {!isAllocated && (
                <button
                  onClick={allocateBudget}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  disabled={!isValid}
                >
                  Allocate Budget
                </button>
              )}
            </div>
            
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectProjectionOld;




            {activeOverheadTab === "material" && (
  <div>
    <h3 className="text-lg font-medium mb-4">Material Overhead</h3>
    {materialEntries.map((entry, index) => {
      // Calculate component quantities
      const comp_a_qty = entry.comp_ratio_a && entry.overall_quantity
        ? (parseFloat(entry.comp_ratio_a) * parseFloat(entry.overall_quantity)).toFixed(2)
        : "0.00";
      const comp_b_qty = entry.comp_ratio_b && entry.overall_quantity
        ? (parseFloat(entry.comp_ratio_b) * parseFloat(entry.overall_quantity)).toFixed(2)
        : "0.00";
      const comp_c_qty = entry.comp_ratio_c && entry.overall_quantity
        ? (parseFloat(entry.comp_ratio_c) * parseFloat(entry.overall_quantity)).toFixed(2)
        : "0.00";

      return (
        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material #{index + 1}
            </label>
            <CreatableSelect
              options={materialOptions}
              value={materialOptions.find((opt) => opt.value === entry.item_id) || null}
              onChange={(opt) => {
                console.log("Selected option:", opt); // Debugging log
                handleMaterialEntryChange(index, "item_id", opt ? opt.value : "");
              }}
              onCreateOption={async (inputValue) => {
                const newOption = await handleAddNewMaterial(inputValue);
                if (newOption) {
                  handleMaterialEntryChange(index, "item_id", newOption.value);
                }
              }}
              formatCreateLabel={(inputValue) => <CustomCreateLabel inputValue={inputValue} />}
              isSearchable
              isClearable
              isDisabled={isAllocated}
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
                  value={entry.comp_ratio_a}
                  onChange={(e) => handleMaterialEntryChange(index, "comp_ratio_a", e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                  disabled={isAllocated}
                  min="0"
                />
                <span className="text-sm text-gray-600">Qty: {comp_a_qty}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-28">Comp Ratio B:</label>
                <input
                  type="number"
                  name="comp_ratio_b"
                  value={entry.comp_ratio_b}
                  onChange={(e) => handleMaterialEntryChange(index, "comp_ratio_b", e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                  disabled={isAllocated}
                  min="0"
                />
                <span className="text-sm text-gray-600">Qty: {comp_b_qty}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 w-28">Comp Ratio C:</label>
                <input
                  type="number"
                  name="comp_ratio_c"
                  value={entry.comp_ratio_c}
                  onChange={(e) => handleMaterialEntryChange(index, "comp_ratio_c", e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                  disabled={isAllocated}
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
              value={uomOptions.find((opt) => opt.value === entry.uom_id) || null}
              onChange={(opt) =>
                handleMaterialEntryChange(index, "uom_id", opt ? opt.value : "")
              }
              isSearchable
              isClearable
              isDisabled={isAllocated}
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
              name="overall_quantity"
              value={entry.overall_quantity}
              onChange={(e) => handleMaterialEntryChange(index, "overall_quantity", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
              required
              disabled={isAllocated}
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate per Quantity
            </label>
            <input
              type="number"
              name="rate_per_uom"
              value={entry.rate_per_uom}
              onChange={(e) => handleMaterialEntryChange(index, "rate_per_uom", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
              required
              disabled={isAllocated}
              min="0"
              step="0.01"
            />
            <div className="mt-2 text-sm text-gray-600">
              Overall Cost: ₹{entry.overall_cost}
            </div>
          </div>
          <div className="flex space-x-2 items-end">
            <button
              type="button"
              onClick={addMaterialEntry}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            >
              <PlusCircle size={20} />
            </button>
            {materialEntries.length > 1 && (
              <button
                type="button"
                onClick={() => removeMaterialEntry(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      );
    })}
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Total Material Cost:</span>
        <span className="text-lg font-semibold">Rs. {materialTotalCost.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium">Budget Percentage:</span>
        <span className="text-lg font-semibold">{materialBudgetPercentage.toFixed(2)}%</span>
      </div>
    </div>
    <button
      onClick={saveMaterialOverhead}
      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
    >
      Save Material Overhead
    </button>
  </div>
)}

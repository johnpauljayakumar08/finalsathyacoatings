import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend,
  PointElement, 
  LineElement,
  PolarAreaController,
  RadialLinearScale
} from "chart.js";
import { Bar, Doughnut, Line, Pie, PolarArea } from "react-chartjs-2";

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement,
  PolarAreaController,
  RadialLinearScale
);

// Smaller pastel gradient cards
const cardColorStyles = [
  "bg-gradient-to-br from-pink-500 to-rose-200 text-white shadow-lg",
  "bg-gradient-to-br from-cyan-500 to-sky-200 text-white shadow-lg",
  "bg-gradient-to-br from-emerald-500 to-teal-200 text-white shadow-lg",
  "bg-gradient-to-br from-amber-500 to-yellow-200 text-white shadow-lg",
  "bg-gradient-to-br from-purple-500 to-indigo-200 text-white shadow-lg",
];

const cardCompletionStyle = "bg-gradient-to-br from-blue-200 to-indigo-100 text-indigo-900 shadow-lg";
const card100Style = "bg-gradient-to-r from-green-500 to-emerald-300 text-white shadow-lg";

const DashboardMain = () => {
  // --- State ---
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [completionEntries, setCompletionEntries] = useState([]);
  const [poTotals, setPoTotals] = useState(null);
  const [expenseDetails, setExpenseDetails] = useState(null);
  const [labourBudget, setLabourBudget] = useState([]);
  const [error, setError] = useState(null);
const [loading, setLoading] = useState({
  companies: false,
  projects: false,
  sites: false,
  completionEntries: false,
  poTotals: false,
  workDescriptions: false,
  expenseDetails: false,
  labourBudget: false,
  materialData: false, // Add this line
});
  const [chartType, setChartType] = useState({ value: "po_quantity", label: "PO Quantity" });
  const [barChartType, setBarChartType] = useState({ value: "bar", label: "Bar" });
  const [donutChartType, setDonutChartType] = useState({ value: "doughnut", label: "Doughnut" });
  const [expenseGraphType, setExpenseGraphType] = useState({ value: "bar", label: "Bar" });
  const [expenseDataType, setExpenseDataType] = useState({ value: "overall", label: "Overall" });
  const [siteDetails, setSiteDetails] = useState({ 
    start_date: "2025-05-28", 
    location_name: "Perundurai", 
    total_area: 1857, 
    current_phase: 'In Progress' 
  });
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [overallType, setOverallType] = useState({ value: "shift", label: "Shift" });
  const [individualChartType, setIndividualChartType] = useState({ value: "bar", label: "Bar" });
  const [overallChartType, setOverallChartType] = useState({ value: "bar", label: "Bar" });
const [materialData, setMaterialData] = useState(null);
const [selectedMaterial, setSelectedMaterial] = useState(null);
const [materialChartType, setMaterialChartType] = useState({ value: "bar", label: "Bar" });
const [selectedUsageMaterial, setSelectedUsageMaterial] = useState(null);
const [usageChartType, setUsageChartType] = useState({ value: "bar", label: "Bar" });

const [percentage, setPercentage] = useState(0);

// --- Effects/FETCHING ---

  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading((p) => ({ ...p, companies: true }));
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/admin/companies`);
        const companiesData = response.data.data || [];
        setCompanies(companiesData);
        if (companiesData.length > 0) {
          const lastCompany = companiesData[0];
          setSelectedCompany({ value: lastCompany.company_id, label: lastCompany.company_name });
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
        setError("Failed to load companies. Please try again.");
      } finally {
        setLoading((p) => ({ ...p, companies: false }));
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const fetchProjects = async () => {
        try {
          setLoading((p) => ({ ...p, projects: true }));
          setError(null);
          const response = await axios.get(`${API_BASE_URL}/admin/projects/${selectedCompany.value}`);
          const projectsData = response.data.data || [];
          setProjects(projectsData);
          if (projectsData.length > 0) {
            const lastProject = projectsData[projectsData.length - 1];
            setSelectedProject({ value: lastProject.pd_id, label: lastProject.project_name });
          }
        } catch (err) {
          console.error("Failed to load projects:", err);
          setError("Failed to load projects. Please try again.");
        } finally {
          setLoading((p) => ({ ...p, projects: false }));
        }
      };
      fetchProjects();
    } else {
      setProjects([]);
      setSelectedProject(null);
      setSites([]);
      setSelectedSite(null);
      setCompletionEntries([]);
      setPoTotals(null);
      setExpenseDetails(null);
      setLabourBudget([]);
      setSelectedDescription(null);
      setWorkDescriptions([]);
      setSiteDetails({ 
        start_date: "2025-05-28", 
        location_name: "Perundurai", 
        total_area: 1857, 
        current_phase: 'In Progress' 
      });
      setError(null);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject) {
      const fetchSites = async () => {
        try {
          setLoading((p) => ({ ...p, sites: true }));
          setError(null);
          const response = await axios.get(`${API_BASE_URL}/admin/sites/${selectedProject.value}`);
          const sitesData = response.data.data || [];
          setSites(sitesData);
          if (sitesData.length > 0) {
            const lastSite = sitesData[sitesData.length - 1];
            setSelectedSite({ value: lastSite.site_id, label: `${lastSite.site_name} (PO: ${lastSite.po_number})` });
          }
        } catch (err) {
          console.error("Failed to load sites:", err);
          setError("Failed to load sites. Please try again.");
        } finally {
          setLoading((p) => ({ ...p, sites: false }));
        }
      };
      fetchSites();
    } else {
      setSites([]);
      setSelectedSite(null);
      setCompletionEntries([]);
      setPoTotals(null);
      setExpenseDetails(null);
      setLabourBudget([]);
      setSelectedDescription(null);
      setWorkDescriptions([]);
      setSiteDetails({ 
        start_date: "2025-05-28", 
        location_name: "Perundurai", 
        total_area: 1857, 
        current_phase: 'In Progress' 
      });
      setError(null);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedSite) {
      const fetchWorkDescriptions = async () => {
        try {
          setLoading((p) => ({ ...p, workDescriptions: true }));
          setError(null);
          const response = await axios.get(`${API_BASE_URL}/admin/work-descriptions/${selectedSite.value}`);
          const descriptionsData = response.data.data || [];
          setWorkDescriptions(descriptionsData);
          if (descriptionsData.length > 0) {
            const lastDescription = descriptionsData[descriptionsData.length - 1];
            setSelectedDescription({ value: lastDescription.desc_id, label: lastDescription.desc_name });
          }
        } catch (err) {
          console.error("Failed to load work descriptions:", err);
          setError("Failed to load work descriptions. Please try again.");
          setWorkDescriptions([]);
          setSelectedDescription(null);
        } finally {
          setLoading((p) => ({ ...p, workDescriptions: false }));
        }
      };
      fetchWorkDescriptions();
    } else {
      setWorkDescriptions([]);
      setSelectedDescription(null);
    }
  }, [selectedSite]);

useEffect(() => {
  if (selectedSite && selectedDescription) {
    const fetchData = async () => {
      try {
        // Add materialData to loading state
        setLoading((p) => ({ ...p, completionEntries: true, poTotals: true, expenseDetails: true, labourBudget: true, materialData: true }));
        setError(null);
        
        // Add materialResponse to Promise.all
        const [completionResponse, poTotalsResponse, expenseResponse, labourResponse, materialResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/completion-entries-by-site/${selectedSite.value}/${selectedDescription.value}`),
          axios.get(`${API_BASE_URL}/admin/po-reckoner-totals/${selectedSite.value}/${selectedDescription.value}`),
          axios.get(`${API_BASE_URL}/admin/expense-details/${selectedSite.value}/${selectedDescription.value}`),
          axios.get(`${API_BASE_URL}/site-incharge/calculate-labour-budget`),
          axios.get(`${API_BASE_URL}/admin/material-graph/${selectedSite.value}/${selectedDescription.value}`) // Add this line
        ]);
        

        console.log("billing :",completionResponse?.data?.billing_area);
        console.log("total :",poTotalsResponse?.data?.data?.total_po_quantity);
        console.log("percentage :",((completionResponse?.data?.billing_area / poTotalsResponse?.data?.data?.total_po_quantity) * 100).toFixed(2));
        const percentage = poTotalsResponse?.data?.data?.total_po_quantity === 0 ? 0 : (completionResponse?.data?.billing_area / poTotalsResponse?.data?.data?.total_po_quantity) * 100;
        setPercentage(percentage);
        
        // Process responses
        const completionData = completionResponse.data.data || [];
        // console.log(completionData);
        
        setCompletionEntries(completionData);
        setPoTotals(poTotalsResponse.data.data || null);
        setExpenseDetails(expenseResponse.data.data || null);
        setLabourBudget(labourResponse.data.processed_po_budgets || []);
        
        // Add material data processing
        setMaterialData(materialResponse.data.data || null); // Add this line
        
        setSiteDetails({
          start_date: "2025-05-28",
          location_name: "Perundurai",
          total_area: 1857,
          current_phase: 'In Progress'
        });
      } catch (err) {
        console.error("Failed to load data:", err);
        // Add materialData to error handling
        setMaterialData(null);
        // ... rest of error handling
      } finally {
        // Add materialData to finally block
        setLoading((p) => ({ ...p, completionEntries: false, poTotals: false, expenseDetails: false, labourBudget: false, materialData: false }));
      }
    };
    fetchData();
  }
}, [selectedSite, selectedDescription]);
  useEffect(() => {
const progress = calculateProgressData(completionEntries, poTotals);
    setSiteDetails(prev => ({
      ...prev,
      current_phase: Number(progress.percentage) === 100 ? 'Completed' : 'In Progress'
    }));
  }, [completionEntries]);

  // --- DropDown Options ---
  const companyOptions = companies.map((company) => ({
    value: company.company_id,
    label: company.company_name || company.company_id || "Unknown Company",
  }));

  const projectOptions = projects.map((project) => ({
    value: project.pd_id,
    label: project.project_name || project.pd_id || "Unknown Project",
  }));

  const siteOptions = sites.map((site) => ({
    value: site.site_id,
    label: `${site.site_name || site.site_id || "Unknown Site"} (PO: ${site.po_number || "N/A"})`,
  }));

  const descriptionOptions = workDescriptions.map((desc) => ({
    value: desc.desc_id,
    label: desc.desc_name || desc.desc_id || "Unknown Description",
  }));

  const chartTypeOptions = [
    { value: "po_quantity", label: "PO Quantity" },
    { value: "value", label: "Value" },
  ];

  const graphTypeOptions = [
    { value: "bar", label: "Bar" },
    { value: "line", label: "Line" },
    { value: "pie", label: "Pie" },
    { value: "doughnut", label: "Doughnut" },
    { value: "polarArea", label: "Polar Area" },
  ];

  const expenseDataTypeOptions = [
    { value: "overall", label: "Overall" },
    { value: "category", label: "Category" },
    { value: "details", label: "Work Description" },
  ];

  const overallTypeOptions = [
    { value: "shift", label: "Shift" },
    { value: "salary", label: "Salary" },
  ];


  const materialOptions = materialData?.material_planning?.map(material => ({
  value: material.item_id,
  label: material.item_name,
})) || [];


const prepareMaterialChartData = () => {
  if (!materialData || !materialData.material_planning) return null;
  
  let materialsToShow = materialData.material_planning;
  
  // If a specific material is selected, filter to just that one
  if (selectedMaterial) {
    materialsToShow = materialsToShow.filter(m => m.item_id === selectedMaterial.value);
  }
  
  const labels = materialsToShow.map(m => m.item_name);
  const planningData = materialsToShow.map(m => m.total_planning);
  const dispatchedData = materialsToShow.map(m => m.total_dispatched);
  const usedData = materialsToShow.map(m => m.total_used);
  
  return {
    labels,
    datasets: [
      {
        label: "Planned",
        data: planningData,
        backgroundColor: "#38bdf8",
        borderColor: "#0ea5e9",
        borderWidth: 1,
      },
      {
        label: "Dispatched",
        data: dispatchedData,
        backgroundColor: "#fde047",
        borderColor: "#eab308",
        borderWidth: 1,
      },
      {
        label: "Used",
        data: usedData,
        backgroundColor: "#2dd4bf",
        borderColor: "#14b8a6",
        borderWidth: 1,
      },
    ],
  };
};

const materialChartData = prepareMaterialChartData();
// Prepare usage history data for chart
const prepareUsageHistoryData = () => {
  if (!materialData || !materialData.usage_history || !selectedUsageMaterial) return null;
  
  // Filter by selected material
  const usageData = materialData.usage_history.filter(item => item.item_id === selectedUsageMaterial.value);
  
  if (usageData.length === 0) return null;
  
  // Group by date and sum quantities
  const dateMap = new Map();
  
  usageData.forEach(entry => {
    const date = new Date(entry.entry_date).toLocaleDateString();
    if (!dateMap.has(date)) {
      dateMap.set(date, 0);
    }
    dateMap.set(date, dateMap.get(date) + entry.overall_qty);
  });
  
  // Sort dates chronologically
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => 
    new Date(a) - new Date(b)
  );
  
  const data = sortedDates.map(date => dateMap.get(date));
  
  return {
    labels: sortedDates,
    datasets: [
      {
        label: selectedUsageMaterial.label,
        data: data,
        backgroundColor: "#38bdf8",
        borderColor: "#0ea5e9",
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      }
    ]
  };
};



const usageHistoryData = prepareUsageHistoryData();

// Prepare cumulative usage data
const prepareCumulativeUsageData = () => {
  if (!materialData || !materialData.usage_history) return null;
  
  let usageData = materialData.usage_history;
  
  // Filter by selected material if any
  if (selectedUsageMaterial) {
    usageData = usageData.filter(item => item.item_id === selectedUsageMaterial.value);
  }
  
  // Sort by date
  usageData.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
  
  // Group by material and calculate cumulative usage
  const materialMap = new Map();
  const dateSet = new Set();
  
  usageData.forEach(entry => {
    const date = new Date(entry.entry_date).toLocaleDateString();
    dateSet.add(date);
    
    if (!materialMap.has(entry.item_name)) {
      materialMap.set(entry.item_name, { cumulative: 0, data: [] });
    }
    
    const materialData = materialMap.get(entry.item_name);
    materialData.cumulative += entry.overall_qty;
    materialData.data.push({ date, cumulative: materialData.cumulative });
  });
  
  // Prepare datasets for each material
  const datasets = [];
  const colors = ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"];
  let colorIndex = 0;
  
  materialMap.forEach((data, materialName) => {
    // Create a map of date to cumulative value for this material
    const dateValueMap = new Map();
    data.data.forEach(item => {
      dateValueMap.set(item.date, item.cumulative);
    });
    
    // Create data array for all dates
    const allDates = Array.from(dateSet).sort();
    const cumulativeData = allDates.map(date => dateValueMap.get(date) || 0);
    
    datasets.push({
      label: `${materialName} (Cumulative)`,
      data: cumulativeData,
      borderColor: colors[colorIndex % colors.length],
      backgroundColor: colors[colorIndex % colors.length] + "20",
      tension: 0.3,
      fill: false,
    });
    
    colorIndex++;
  });
  
  return {
    labels: Array.from(dateSet).sort(),
    datasets: datasets
  };
};

const cumulativeUsageData = prepareCumulativeUsageData();

  const uniqueLabours = useMemo(() => {
    const labourSet = new Set();
    const filtered = labourBudget.filter(b => b.desc_id === selectedDescription?.value) || [];
    filtered.forEach(b => {
      b.labour_assignments.forEach(a => {
        labourSet.add(JSON.stringify({ labour_id: a.labour_id, full_name: a.full_name }));
      });
    });
    return Array.from(labourSet).map(JSON.parse);
  }, [labourBudget, selectedDescription]);

  const labourOptions = uniqueLabours.map(l => ({
    value: l.labour_id,
    label: l.full_name,
  }));

  // --- Totals & Helpers ---
  const getSubcategoryTotals = (subcategoryName, descId) => {
    let totalValueAdded = 0;
    let totalPoQuantity = 0;
    completionEntries.forEach((category) => {
      const subcategory = category.subcategories.find((sc) => sc.subcategory_name === subcategoryName);
      if (subcategory) {
        subcategory.entries_by_date.forEach((dateEntry) => {
          dateEntry.entries.forEach((entry) => {
            if (entry.desc_id == descId) {
              totalValueAdded += entry.value_added || 0;
            }
          });
        });
      }
    });
    if (poTotals && poTotals.subcategory_totals) {
      poTotals.subcategory_totals.forEach((categoryData) => {
        const descriptionData = categoryData.descriptions.find((desc) => desc.desc_id == descId);
        if (descriptionData) {
          const subData = descriptionData.subcategories.find((sc) => sc.subcategory_name === subcategoryName);
          if (subData) {
            totalPoQuantity = subData.po_quantity || 0;
          }
        }
      });
    }
    return { totalValueAdded, totalPoQuantity };
  };

  const getFilteredSubcategories = () => {
    if (!poTotals?.subcategory_totals) return [];
    let subcats = [];
    poTotals.subcategory_totals.forEach(category => {
      const description = category.descriptions.find(desc => desc.desc_id == selectedDescription?.value);
      if (description) {
        subcats.push(...description.subcategories);
      }
    });
    return subcats;
  };

  const subcategories = getFilteredSubcategories();

const calculateProgressData = (completionData, poTotalsData) => {
  if (!completionData || !completionData.billing_area || !poTotalsData || !poTotalsData.total_po_quantity) {
    return { percentage: completionData.billing_area, totalCompletedArea: 0, totalArea: 0 };
  }

 
  

  const billingArea = completionResponse?.data?.billing_area
  const totalArea = poTotalsData.total_po_quantity || 0;


  
  return {
    percentage:percentage.toFixed(2),
    totalCompletedArea: billingArea.toFixed(2),
    totalArea: totalArea.toFixed(2),
  };
};

  const progressData = calculateProgressData(completionEntries);
  const calculateExpenseTotals = () => {
    if (!expenseDetails) {
      return { totalAllocated: 0, totalSpent: 0, cashInHand: 0 };
    }
    const totalAllocated = expenseDetails.total_allocated || 0;
    const totalSpent = expenseDetails.total_spent || 0;
    const cashInHand = totalAllocated - totalSpent;
    return { totalAllocated, totalSpent, cashInHand };
  };
  const expenseTotals = calculateExpenseTotals();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // ---- Chart Data Preparation ----
  const barLabels = subcategories.map((sub) => sub.subcategory_name);
  const completedData = subcategories.map((sub) => {
    let completedArea = 0;
    let completedValue = 0;
    completionEntries.forEach((cat) => {
      const subcategory = cat.subcategories.find((sc) => sc.subcategory_name === sub.subcategory_name);
      if (subcategory) {
        subcategory.entries_by_date.forEach((dateEntry) => {
          dateEntry.entries.forEach((e) => {
            if (e.desc_id == selectedDescription?.value) {
              completedArea += e.area_added || 0;
              completedValue += e.value_added || 0;
            }
          });
        });
      }
    });
    return chartType.value === "po_quantity" ? completedArea : completedValue;
  });
  const targetData = subcategories.map((sc) => chartType.value === "po_quantity" ? sc.po_quantity : sc.value);

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: chartType.value === "po_quantity" ? "Completed Quantity (sqm)" : "Completed Value (₹)",
        data: completedData,
        backgroundColor: ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"],
        borderColor: "#e5e7eb",
        borderWidth: 1,
      },
      {
        label: chartType.value === "po_quantity" ? "Planned Quantity (sqm)" : "Planned Value (₹)",
        data: targetData,
        backgroundColor: "#e5e7eb",
        borderColor: "#d1d5db",
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: subcategories.map((sub) => 
      `${sub.subcategory_name} (PO: ${sub.po_quantity || 0}, Val: ${sub.value || 0})`
    ),
    datasets: [
      {
        label: chartType.value === "po_quantity" ? "Completed Quantity (sqm)" : "Completed Value (₹)",
        data: completedData,
        backgroundColor: ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };
const prepareLineChartData = () => {
  if (!completionEntries.length || !selectedDescription) return null;
  
  const allDates = new Set();
  
  // First, collect all dates that have entries for the selected description
  completionEntries.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.entries_by_date.forEach(dateEntry => {
        // Check if any entry in this date matches the selected description
        const hasMatchingEntry = dateEntry.entries.some(e => 
          e.desc_id == selectedDescription.value
        );
        if (hasMatchingEntry) {
          allDates.add(dateEntry.entry_date);
        }
      });
    });
  });
  
  // If no dates found, return null
  if (allDates.size === 0) return null;
  
  const sortedDates = Array.from(allDates).sort();
  const datasets = [];
  const colors = ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"];
  
  const filteredSubcategories = getFilteredSubcategories();
  
  filteredSubcategories.forEach((subcategory, index) => {
    const cumulativeData = [];
    let cumulativeTotal = 0;
    
    sortedDates.forEach(date => {
      let dailyAdded = 0;
      
      completionEntries.forEach(category => {
        const sub = category.subcategories.find(sc => 
          sc.subcategory_name === subcategory.subcategory_name
        );
        
        if (sub) {
          const dateEntry = sub.entries_by_date.find(d => d.entry_date === date);
          if (dateEntry) {
            dailyAdded += dateEntry.entries
              .filter(e => e.desc_id == selectedDescription.value)
              .reduce((sum, entry) => sum + (entry.area_added || 0), 0);
          }
        }
      });
      
      cumulativeTotal += dailyAdded;
      cumulativeData.push(cumulativeTotal);
    });
    
    datasets.push({
      label: subcategory.subcategory_name,
      data: cumulativeData,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length] + "20",
      tension: 0.3,
      fill: false,
    });
  });
  
  return {
    labels: sortedDates,
    datasets: datasets
  };
};
  const lineChartData = prepareLineChartData();

  // Expense Chart Data (Overall, Category, Details, Expensed Amount)
  const prepareExpenseChartData = () => {
    if (!expenseDetails) return null;

    let labels = [];
    let data = [];
    let title = "";
    let xAxisTitle = "";

    switch (expenseDataType.value) {
      case "overall":
        labels = ['Allocated', 'Spent'];
        data = [expenseTotals.totalAllocated, expenseTotals.totalSpent];
        title = "Allocated vs Spent";
        xAxisTitle = "Status";
        break;
      case "category":
        labels = expenseDetails.expenses_by_category.map(e => e.expense_category_name || "Unknown Category");
        data = expenseDetails.expenses_by_category.map(e => e.total_expense || 0);
        title = "Expenses by Category";
        xAxisTitle = "Expense Category";
        break;
      case "details":
      case "expensed":
        labels = expenseDetails.expenses_by_work_description.map(e => e.desc_name || "Unknown Description");
        data = expenseDetails.expenses_by_work_description.map(e => e.total_expense || 0);
        title = expenseDataType.value === "details" ? "Expenses by Description" : "Expensed Amount by Description";
        xAxisTitle = "Work Description";
        break;
      default:
        return null;
    }

    return {
      labels,
      datasets: [
        {
          label: "Amount (₹)",
          data,
          backgroundColor: ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"],
          borderColor: "#e5e7eb",
          borderWidth: 1,
        },
      ],
      title,
      xAxisTitle,
    };
  };

  const expenseChartData = prepareExpenseChartData();

  // Daily Expense Trend Line Chart (by Category or Description)
  const prepareDailyExpenseTrendChartData = () => {
    if (!expenseDetails || !expenseDetails.expenses_by_date) return null;

    const sortedDates = expenseDetails.expenses_by_date
      .map(e => e.expense_date)
      .sort((a, b) => a.localeCompare(b));
    const datasets = [];
    const colors = ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd", "#f43f5e", "#0ea5e9", "#eab308", "#14b8a6", "#8b5cf6"];

    if (expenseDataType.value === "category") {
      // Group by expense category
      const categories = expenseDetails.expenses_by_category.map(e => e.expense_category_name || "Unknown Category");
      categories.forEach((category, index) => {
        const data = sortedDates.map(date => {
          const dailyTotal = expenseDetails.expenses_by_date.find(e => e.expense_date === date)?.total_expense || 0;
          const categoryTotal = expenseDetails.expenses_by_category.find(c => c.expense_category_name === category)?.total_expense || 0;
          const totalAcrossDates = expenseDetails.expenses_by_date.reduce((sum, e) => sum + e.total_expense, 0);
          return totalAcrossDates ? (categoryTotal * dailyTotal) / totalAcrossDates : 0;
        });
        datasets.push({
          label: category,
          data,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          tension: 0.3,
          fill: false,
        });
      });
    } else {
      // Group by work description
      const descriptions = expenseDetails.expenses_by_work_description.map(e => e.desc_name || "Unknown Description");
      descriptions.forEach((desc, index) => {
        const data = sortedDates.map(date => {
          const dailyTotal = expenseDetails.expenses_by_date.find(e => e.expense_date === date)?.total_expense || 0;
          const descTotal = expenseDetails.expenses_by_work_description.find(d => d.desc_name === desc)?.total_expense || 0;
          const totalAcrossDates = expenseDetails.expenses_by_date.reduce((sum, e) => sum + e.total_expense, 0);
          return totalAcrossDates ? (descTotal * dailyTotal) / totalAcrossDates : 0;
        });
        datasets.push({
          label: desc,
          data,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length] + "20",
          tension: 0.3,
          fill: false,
        });
      });
    }

    return {
      labels: sortedDates,
      datasets,
    };
  };
  const dailyExpenseTrendChartData = prepareDailyExpenseTrendChartData();

  const prepareIndividualData = (labourId) => {
    if (!labourId) return { chartData: null, totalSalary: 0 };
    const filteredBudgets = labourBudget.filter(b => b.desc_id === selectedDescription?.value) || [];
    const assignments = filteredBudgets.flatMap(b => b.labour_assignments.filter(a => a.labour_id === labourId));
    const totalSalary = assignments.reduce((sum, a) => sum + a.salary, 0);
    const dateMap = new Map();
    assignments.forEach(a => {
      a.shifts_by_date.forEach(s => {
        const date = s.entry_date.split('T')[0];
        dateMap.set(date, (dateMap.get(date) || 0) + s.shift);
      });
    });
    const sortedDates = Array.from(dateMap.keys()).sort();
    const data = sortedDates.map(d => dateMap.get(d));
    const colors = ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"];
    const chartData = {
      labels: sortedDates.map(d => formatDate(d)),
      datasets: [{
        label: 'Shifts per Day',
        data,
        borderColor: colors[0],
        backgroundColor: colors.map(c => c + '20'),
        tension: 0.3,
        fill: false,
      }]
    };
    return { chartData, totalSalary };
  };

  const prepareOverallData = (type) => {
    const filteredBudgets = labourBudget.filter(b => b.desc_id === selectedDescription?.value) || [];
    const dateMap = new Map();
    filteredBudgets.forEach(b => {
      b.labour_assignments.forEach(a => {
        a.shifts_by_date.forEach(s => {
          const date = s.entry_date.split('T')[0];
          const value = type === 'shift' ? s.shift : s.shift * a.salary / a.total_shifts; // Adjusted for per shift rate
          dateMap.set(date, (dateMap.get(date) || 0) + value);
        });
      });
    });
    const sortedDates = Array.from(dateMap.keys()).sort();
    const data = sortedDates.map(d => dateMap.get(d));
    const colors = ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"];
    const chartData = {
      labels: sortedDates.map(d => formatDate(d)),
      datasets: [{
        label: type === 'shift' ? 'Total Shifts per Day' : 'Total Salary per Day',
        data,
        borderColor: colors[1],
        backgroundColor: colors.map(c => c + "90"),
        tension: 0.3,
        fill: false,
      }]
    };
    return chartData;
  };

  const individualData = useMemo(() => prepareIndividualData(selectedLabour?.value), [selectedLabour, labourBudget, selectedDescription]);
  const overallChartData = useMemo(() => prepareOverallData(overallType.value), [overallType, labourBudget, selectedDescription]);

  // Render Chart based on selected type
  const renderChart = (chartType, data, options) => {
    switch (chartType) {
      case "bar":
        return <Bar data={data} options={options} />;
      case "line":
        return <Line data={data} options={options} />;
      case "pie":
        return <Pie data={data} options={options} />;
      case "doughnut":
        return <Doughnut data={data} options={options} />;
      case "polarArea":
        return <PolarArea data={data} options={options} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  // ---- UI Rendering ----
  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* --- Filter Controls --- */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl">
          <div className="w-full sm:w-[200px]">
            <Select
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              placeholder="Company"
              isLoading={loading.companies}
              isClearable
              className="text-sm"
              styles={{ control: (base) => ({ ...base, minHeight: "36px", fontSize: "1rem" }) }}
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Project"
              isDisabled={!selectedCompany}
              isClearable
              className="text-sm"
              styles={{ control: (base) => ({ ...base, minHeight: "36px", fontSize: "1rem" }) }}
            />
          </div>
          <div className="w-full sm:w-[250px]">
            <Select
              options={siteOptions}
              value={selectedSite}
              onChange={setSelectedSite}
              placeholder="Site"
              isLoading={loading.sites}
              isDisabled={!selectedProject}
              isClearable
              className="text-sm"
              styles={{ control: (base) => ({ ...base, minHeight: "36px", fontSize: "1rem" }) }}
            />
          </div>
          <div className="w-full sm:w-[200px]">
            <Select
              options={descriptionOptions}
              value={selectedDescription}
              onChange={setSelectedDescription}
              placeholder="Work Description"
              isLoading={loading.workDescriptions}
              isDisabled={loading.workDescriptions || !selectedSite}
              isClearable
              className="text-sm"
              styles={{ 
                control: (base) => ({ ...base, minHeight: "36px", fontSize: "1rem" }),
                menu: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          </div>
        </div>
      </div>

      {/* --- Error Message --- */}
      {error && (
        <div className="text-center text-red-500 py-4">
          {error}
        </div>
      )}

      {/* --- Site Details Section --- */}
      {selectedSite && !error && (
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <h4 className="font-semibold text-gray-700">Start Date</h4>
              <p className="text-gray-900">{formatDate(siteDetails.start_date)}</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-700">Current Phase</h4>
              <p className="text-gray-900">{siteDetails.current_phase}</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-700">Location</h4>
              <p className="text-gray-900">{siteDetails.location_name}</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-gray-700">Total Area (sqm)</h4>
              <p className="text-gray-900">{siteDetails.total_area.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Cards Section and Graphs --- */}
      {(loading.completionEntries || loading.poTotals || loading.workDescriptions || loading.expenseDetails || loading.labourBudget) ? (
        <div className="text-center text-gray-500 py-10">Loading...</div>
      ) : (
        selectedSite && selectedDescription && poTotals && completionEntries.length > 0 && !error ? (
          <>
            <div className="flex flex-wrap items-stretch gap-6 justify-center mb-8 pt-3">
              {/* Subcategory Cards */}
              {subcategories.map((subcategory, i) => {
                const descId = selectedDescription.value;
                const { totalValueAdded, totalPoQuantity } = getSubcategoryTotals(subcategory.subcategory_name, descId);
                let completedArea = 0;
                let completedValue = 0;
                completionEntries.forEach((cat) => {
                  const sub = cat.subcategories.find((sc) => sc.subcategory_name === subcategory.subcategory_name);
                  if (sub) {
                    sub.entries_by_date.forEach((dateEntry) => {
                      dateEntry.entries.forEach((e) => {
                        if (e.desc_id == selectedDescription.value) {
                          completedArea += e.area_added || 0;
                          completedValue += e.value_added || 0;
                        }
                      });
                    });
                  }
                });
                const totalValue = subcategories.find((sc) => sc.subcategory_name === subcategory.subcategory_name)?.value || 0;
                return (
                  <div
                    key={subcategory.subcategory_name}
                    className={`bg-gradient-to-br from-gray-50 to-gray-100 w-full sm:w-[250px] rounded-xl p-4 flex flex-col items-center text-center transform transition duration-300 hover:scale-105 shadow-lg`}
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{subcategory.subcategory_name}</h3>
                    <div className="bg-gray-200 bg-opacity-20 p-3 rounded-lg w-full">
                      <div className="flex justify-between text-sm text-gray-800">
                        <span>Completed Area (sqm):</span>
                        <span className="font-semibold">{completedArea.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-800 mt-1">
                        <span>Total (sqm):</span>
                        <span className="font-semibold">{totalPoQuantity.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-800 mt-2">
                        <span>Completed Value:</span>
                        <span className="font-semibold">₹{completedValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-800 mt-1">
                        <span>Total Value:</span>
                        <span className="font-semibold">₹{totalValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Project Completion Card */}
              <div
                className={`${Number(progressData.percentage) === 100 ? 'bg-gradient-to-r from-cyan-500 to-teal-300 text-gray-800 shadow-lg' : 'bg-gradient-to-br from-blue-200 to-cyan-100 text-gray-800 shadow-lg'} w-full sm:w-[250px] rounded-xl p-4 flex flex-col items-center text-center transform transition duration-300 hover:scale-105`}
                style={{ minHeight: "150px" }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">Project Completion</h3>
                <div className="flex-1 flex items-center justify-center w-full">
                  <span className="text-5xl font-extrabold text-gray-800">{percentage.toFixed(2)}%</span>
                </div>
              </div>
              {/* Expense Summary Card */}
              <div
                className="bg-gradient-to-br from-blue-200 to-cyan-100 text-gray-800 w-full sm:w-[250px] rounded-xl p-4 flex flex-col items-center text-center transform transition duration-300 hover:scale-105 shadow-lg"
                style={{ minHeight: "150px" }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">Expense Summary</h3>
                <div className="bg-gray-200 bg-opacity-20 p-3 rounded-lg w-full">
                  <div className="flex justify-between text-sm text-gray-800">
                    <span>Total Allocated (₹):</span>
                    <span className="font-semibold">{expenseTotals.totalAllocated.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-800 mt-1">
                    <span>Total Spent (₹):</span>
                    <span className="font-semibold">{expenseTotals.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-800 mt-1">
                    <span>Cash in Hand (₹):</span>
                    <span className="font-semibold">{expenseTotals.cashInHand.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Charts Area (below cards) --- */}
            <div className="flex flex-col gap-6 items-stretch justify-center pt-2">
              {/* First Row: Completion Overview and Progress Comparison */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Completion Overview Chart */}
                <div className="bg-white rounded-lg shadow-lg p-4 flex-1 min-w-[340px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {chartType.value === "po_quantity" ? "Area" : "Value"} Completion Overview
                    </h3>
                    <div className="flex gap-2">
                      <div className="w-[140px]">
                        <Select
                          options={chartTypeOptions}
                          value={chartType}
                          onChange={setChartType}
                          placeholder="Data Type"
                          isClearable={false}
                          className="text-xs"
                          styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                        />
                      </div>
                      <div className="w-[140px]">
                        <Select
                          options={graphTypeOptions}
                          value={barChartType}
                          onChange={setBarChartType}
                          placeholder="Chart Type"
                          isClearable={false}
                          className="text-xs"
                          styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-[320px]">
                    {renderChart(barChartType.value, barChartData, {
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: barChartType.value === "bar" || barChartType.value === "line" ? {
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: chartType.value === "po_quantity" ? "Area (sqm)" : "Value (₹)" },
                        },
                        x: {
                          title: { display: true, text: "Stage" },
                        },
                      } : {},
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { font: { size: 12 } },
                        },
                        title: { display: false },
                      },
                    })}
                  </div>
                </div>
                {/* Progress Comparison Chart */}
                <div className="bg-white rounded-lg shadow-lg p-4 flex-1 min-w-[340px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {chartType.value === "po_quantity" ? "Area" : "Value"} Progress Comparison
                    </h3>
                    <div className="w-[140px]">
                      <Select
                        options={graphTypeOptions}
                        value={donutChartType}
                        onChange={setDonutChartType}
                        placeholder="Chart Type"
                        isClearable={false}
                        className="text-xs"
                        styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                      />
                    </div>
                  </div>
                  <div className="w-full h-[320px]">
                    {renderChart(donutChartType.value, pieChartData, {
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { font: { size: 12 } },
                        },
                        title: { display: false },
                      },
                    })}
                  </div>
                </div>
              </div>

              {/* Second Row: Expense Data and Daily Expense Trend */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Expense Data Chart */}
                {expenseChartData && (
                  <div className="bg-white rounded-lg shadow-lg p-4 flex-1 min-w-[340px]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {expenseChartData.title}
                      </h3>
                      <div className="flex gap-2">
                        <div className="w-[140px]">
                          <Select
                            options={expenseDataTypeOptions}
                            value={expenseDataType}
                            onChange={setExpenseDataType}
                            placeholder="Data Type"
                            isClearable={false}
                            className="text-xs"
                            styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                          />
                        </div>
                        <div className="w-[140px]">
                          <Select
                            options={graphTypeOptions}
                            value={expenseGraphType}
                            onChange={setExpenseGraphType}
                            placeholder="Graph Type"
                            isClearable={false}
                            className="text-xs"
                            styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-[400px]">
                      {renderChart(expenseGraphType.value, expenseChartData, {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: expenseGraphType.value === "bar" || expenseGraphType.value === "line" ? {
                          y: {
                            beginAtZero: true,
                            title: { display: true, text: "Amount (₹)" },
                          },
                          x: {
                            title: { display: true, text: expenseChartData.xAxisTitle },
                          },
                        } : {},
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { font: { size: 12 } },
                          },
                          title: { display: false },
                        },
                      })}
                    </div>
                  </div>
                )}
                {/* Daily Expense Trend Chart */}
                {dailyExpenseTrendChartData && (
                  <div className="bg-white rounded-lg shadow-lg p-4 flex-1 min-w-[340px]">
                    <h3 className="font-semibold text-center mb-2 text-lg text-gray-800">
                      Daily Expense Trend by {expenseDataType.value === "category" ? "Category" : "Work Description"}
                    </h3>
                    <div className="w-full h-[400px]">
                      <Line
                        data={dailyExpenseTrendChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: { display: true, text: "Amount (₹)" },
                            },
                            x: {
                              title: { display: true, text: "Date" },
                            },
                          },
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: { font: { size: 12 } },
                            },
                            title: { display: false },
                          },
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Third Row: Daily Progress Trend */}
              {lineChartData && (
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="font-semibold text-center mb-2 text-lg text-gray-800">
                    Daily Progress Trend
                  </h3>
                  <div className="w-full h-[400px]">
                    <Line
                      data={lineChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: { display: true, text: "Cumulative Area (sqm)" },
                          },
                          x: {
                            title: { display: true, text: "Date" },
                          },
                        },
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { font: { size: 12 } },
                          },
                          title: { display: false },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Fourth Row: Labour Graphs */}
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Overall Labour Graph (Left) */}
                <div className="bg-white rounded-lg shadow-lg p-4 flex-1 min-w-[340px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      Overall Daily Labour Metrics
                    </h3>
                    <div className="flex gap-2">
                      <div className="w-[140px]">
                        <Select
                          options={overallTypeOptions}
                          value={overallType}
                          onChange={setOverallType}
                          placeholder="Metric Type"
                          isClearable={false}
                          className="text-xs"
                          styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                        />
                      </div>
                      <div className="w-[140px]">
                        <Select
                          options={graphTypeOptions}
                          value={overallChartType}
                          onChange={setOverallChartType}
                          placeholder="Chart Type"
                          isClearable={false}
                          className="text-xs"
                          styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                        />
                      </div>
                    </div>
                  </div>
                  {overallChartData ? (
                    <div className="w-full h-[400px]">
                      {renderChart(overallChartType.value, overallChartData, {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: overallChartType.value === "bar" || overallChartType.value === "line" ? {
                          y: {
                            beginAtZero: true,
                            min: overallType.value === "shift" ? 0 : undefined,
                            max: overallType.value === "shift" ? 2 : undefined,
                            stepSize: overallType.value === "shift" ? 0.5 : undefined,
                            title: { display: true, text: overallType.value === "shift" ? "Total Shifts" : "Total Salary (₹)" },
                          },
                          x: {
                            title: { display: true, text: "Date" },
                          },
                        } : {},
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { font: { size: 12 } },
                          },
                          title: { display: false },
                        },
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-10">No data available</div>
                  )}
                </div>
                {/* Individual Labour Graph (Right) */}
                <div className="bg-white rounded-lg shadow-lg p-4 flex-1 min-w-[340px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">
                      Individual Labour Shifts
                    </h3>
                    <div className="flex gap-2">
                      <div className="w-[140px]">
                        <Select
                          options={labourOptions}
                          value={selectedLabour}
                          onChange={setSelectedLabour}
                          placeholder="Select Labour"
                          isClearable
                          className="text-xs"
                          styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                        />
                      </div>
                      <div className="w-[140px]">
                        <Select
                          options={graphTypeOptions}
                          value={individualChartType}
                          onChange={setIndividualChartType}
                          placeholder="Chart Type"
                          isClearable={false}
                          className="text-xs"
                          styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
                        />
                      </div>
                    </div>
                  </div>
                  {selectedLabour && individualData.chartData ? (
                    <>
                      <p className="text-sm text-gray-800 mb-2">Total Salary: ₹{individualData.totalSalary.toLocaleString()}</p>
                      <div className="w-full h-[400px]">
                        {renderChart(individualChartType.value, individualData.chartData, {
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: individualChartType.value === "bar" || individualChartType.value === "line" ? {
                            y: {
                              beginAtZero: true,
                              min: 0,
                              max: 2,
                              stepSize: 0.5,
                              title: { display: true, text: "Shift Count" },
                            },
                            x: {
                              title: { display: true, text: "Date" },
                            },
                          } : {},
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: { font: { size: 12 } },
                            },
                            title: { display: false },
                          },
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-10">Select a labour to view details</div>
                  )}
                </div>
              </div>


              {/* Fifth Row: Material Metrics Graph */}
{materialChartData && (
  <div className="bg-white rounded-lg shadow-lg p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-lg text-gray-800">
        Material Metrics
      </h3>
      <div className="flex gap-2">
        <div className="w-[200px]">
          <Select
            options={materialOptions}
            value={selectedMaterial}
            onChange={setSelectedMaterial}
            placeholder="Select Material"
            isClearable
            className="text-xs"
            styles={{ 
              control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }),
              menu: (base) => ({ ...base, zIndex: 9999 })
            }}
          />
        </div>
        <div className="w-[140px]">
          <Select
            options={graphTypeOptions}
            value={materialChartType}
            onChange={setMaterialChartType}
            placeholder="Chart Type"
            isClearable={false}
            className="text-xs"
            styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
          />
        </div>
      </div>
    </div>
    <div className="w-full h-[400px]">
      {renderChart(materialChartType.value, materialChartData, {
        responsive: true,
        maintainAspectRatio: false,
        scales: materialChartType.value === "bar" || materialChartType.value === "line" ? {
          y: {
            beginAtZero: true,
            title: { display: true, text: "Quantity" },
          },
          x: {
            title: { display: true, text: "Material" },
          },
        } : {},
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: 12 } },
          },
          title: { display: false },
        },
      })}
    </div>
  </div>
)}




{/* Sixth Row: Material Usage History */}
{materialData?.usage_history && (
  <div className="bg-white rounded-lg shadow-lg p-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-lg text-gray-800">
        Material Usage History
      </h3>
      <div className="flex gap-2">
        <div className="w-[200px]">
          <Select
            options={materialOptions}
            value={selectedUsageMaterial}
            onChange={setSelectedUsageMaterial}
            placeholder="Select Material"
            isClearable
            className="text-xs"
            styles={{ 
              control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }),
              menu: (base) => ({ ...base, zIndex: 9999 })
            }}
          />
        </div>
        <div className="w-[140px]">
          <Select
            options={graphTypeOptions}
            value={usageChartType}
            onChange={setUsageChartType}
            placeholder="Chart Type"
            isClearable={false}
            className="text-xs"
            styles={{ control: (base) => ({ ...base, minHeight: "32px", fontSize: "0.90rem" }) }}
            isDisabled={!selectedUsageMaterial}
          />
        </div>
      </div>
    </div>
    
    {selectedUsageMaterial && usageHistoryData ? (
      <div className="w-full h-[400px]">
        {renderChart(usageChartType.value, usageHistoryData, {
          responsive: true,
          maintainAspectRatio: false,
          scales: usageChartType.value === "bar" || usageChartType.value === "line" ? {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Quantity Used" },
            },
            x: {
              title: { display: true, text: "Date" },
            },
          } : {},
          plugins: {
            legend: {
              position: "bottom",
              labels: { font: { size: 12 } },
            },
            title: { display: false },
          },
        })}
      </div>
    ) : (
      <div className="text-center text-gray-500 py-10">
        {selectedUsageMaterial ? "No usage data available for selected material" : "Please select a material to view usage history"}
      </div>
    )}
  </div>
)}
            </div>
          </>
        ) : (
          !error && (
            <div className="text-center text-gray-400 py-12 text-base">
              Please select all options to view dashboard.
            </div>
          )
        )
      )}
    </div>
  );
};

export default DashboardMain;
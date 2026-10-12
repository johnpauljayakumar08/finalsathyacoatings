import { API_BASE_URL } from "../../../config/api.js";
// ExpenseGraph.jsx
import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import { Bar, Doughnut, Line, Pie, PolarArea } from "react-chartjs-2";
import axios from "axios";

const ExpenseGraph = () => {
  // Filter States
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState({
    companies: false,
    projects: false,
    sites: false,
    workDescriptions: false,
  });

  // Data States
  const [expenseDetails, setExpenseDetails] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Chart States
  const [expenseGraphType, setExpenseGraphType] = useState({ value: "bar", label: "Bar" });
  const [expenseDataType, setExpenseDataType] = useState({ value: "overall", label: "Overall" });

  // Options
  const expenseDataTypeOptions = [
    { value: "overall", label: "Overall" },
    { value: "category", label: "Category" },
    { value: "details", label: "Work Description" },
  ];

  const graphTypeOptions = [
    { value: "bar", label: "Bar" },
    { value: "line", label: "Line" },
    { value: "pie", label: "Pie" },
    { value: "doughnut", label: "Doughnut" },
    { value: "polarArea", label: "Polar Area" },
  ];

  // Fetch Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingFilters((p) => ({ ...p, companies: true }));
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
        setLoadingFilters((p) => ({ ...p, companies: false }));
      }
    };
    fetchCompanies();
  }, []);

  // Fetch Projects
  useEffect(() => {
    if (selectedCompany) {
      const fetchProjects = async () => {
        try {
          setLoadingFilters((p) => ({ ...p, projects: true }));
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
          setLoadingFilters((p) => ({ ...p, projects: false }));
        }
      };
      fetchProjects();
    } else {
      setProjects([]);
      setSelectedProject(null);
      setSites([]);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedDescription(null);
      setError(null);
    }
  }, [selectedCompany]);

  // Fetch Sites
  useEffect(() => {
    if (selectedProject) {
      const fetchSites = async () => {
        try {
          setLoadingFilters((p) => ({ ...p, sites: true }));
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
          setLoadingFilters((p) => ({ ...p, sites: false }));
        }
      };
      fetchSites();
    } else {
      setSites([]);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedDescription(null);
      setError(null);
    }
  }, [selectedProject]);

  // Fetch Work Descriptions
  useEffect(() => {
    if (selectedSite) {
      const fetchWorkDescriptions = async () => {
        try {
          setLoadingFilters((p) => ({ ...p, workDescriptions: true }));
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
          setLoadingFilters((p) => ({ ...p, workDescriptions: false }));
        }
      };
      fetchWorkDescriptions();
    } else {
      setWorkDescriptions([]);
      setSelectedDescription(null);
    }
  }, [selectedSite]);

  // Fetch Expense Details
  useEffect(() => {
    if (selectedSite && selectedDescription) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          setError(null);
          const response = await axios.get(`${API_BASE_URL}/admin/expense-details/${selectedSite.value}/${selectedDescription.value}`);
          setExpenseDetails(response.data.data || null);
        } catch (err) {
          console.error("Failed to load expense data:", err);
          setError("Failed to load expense data.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    } else {
      setExpenseDetails(null);
      setLoadingData(false);
    }
  }, [selectedSite, selectedDescription]);

  // Options for Filters
  const companyOptions = useMemo(() => 
    companies.map((company) => ({
      value: company.company_id,
      label: company.company_name || company.company_id || "Unknown Company",
    })),
    [companies]
  );

  const projectOptions = useMemo(() => 
    projects.map((project) => ({
      value: project.pd_id,
      label: project.project_name || project.pd_id || "Unknown Project",
    })),
    [projects]
  );

  const siteOptions = useMemo(() => 
    sites.map((site) => ({
      value: site.site_id,
      label: `${site.site_name || site.site_id || "Unknown Site"} (PO: ${site.po_number || "N/A"})`,
    })),
    [sites]
  );

  const descriptionOptions = useMemo(() => 
    workDescriptions.map((desc) => ({
      value: desc.desc_id,
      label: desc.desc_name || desc.desc_id || "Unknown Description",
    })),
    [workDescriptions]
  );

  const calculateExpenseTotals = () => {
    if (!expenseDetails) {
      return { totalAllocated: 0, totalSpent: 0, cashInHand: 0 };
    }
    const totalAllocated = expenseDetails.total_allocated || 0;
    const totalSpent = expenseDetails.total_spent || 0;
    const cashInHand = totalAllocated - totalSpent;
    return { totalAllocated, totalSpent, cashInHand };
  };

  const expenseTotals = useMemo(() => calculateExpenseTotals(), [expenseDetails]);

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
        labels = expenseDetails.expenses_by_category?.map(e => e.expense_category_name || "Unknown Category") || [];
        data = expenseDetails.expenses_by_category?.map(e => e.total_expense || 0) || [];
        title = "Expenses by Category";
        xAxisTitle = "Expense Category";
        break;
      case "details":
        labels = expenseDetails.expenses_by_work_description?.map(e => e.desc_name || "Unknown Description") || [];
        data = expenseDetails.expenses_by_work_description?.map(e => e.total_expense || 0) || [];
        title = "Expenses by Description";
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

  const expenseChartData = useMemo(() => prepareExpenseChartData(), [expenseDetails, expenseDataType, expenseTotals]);

  const prepareDailyExpenseTrendChartData = () => {
    if (!expenseDetails || !expenseDetails.expenses_by_date) return null;

    const sortedDates = expenseDetails.expenses_by_date
      .map(e => e.expense_date)
      .sort((a, b) => a.localeCompare(b));
    const datasets = [];
    const colors = ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd", "#f43f5e", "#0ea5e9", "#eab308", "#14b8a6", "#8b5cf6"];

    if (expenseDataType.value === "category") {
      const categories = expenseDetails.expenses_by_category?.map(e => e.expense_category_name || "Unknown Category") || [];
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
      const descriptions = expenseDetails.expenses_by_work_description?.map(e => e.desc_name || "Unknown Description") || [];
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

  const dailyExpenseTrendChartData = useMemo(() => prepareDailyExpenseTrendChartData(), [expenseDetails, expenseDataType]);

  const renderChart = (chartType, data, options) => {
    if (!data) return null;
    
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

  // Early returns after all hooks
  if (loadingData || Object.values(loadingFilters).some(Boolean)) return <div className="text-center text-gray-500 py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-10">Expense Graph</h1>
      {/* Filter Controls */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl">
          <div className="w-full sm:w-[200px]">
            <Select
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              placeholder="Company"
              isLoading={loadingFilters.companies}
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
              isLoading={loadingFilters.sites}
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
              isLoading={loadingFilters.workDescriptions}
              isDisabled={loadingFilters.workDescriptions || !selectedSite}
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

      {/* Charts Section */}
      {selectedSite && selectedDescription && expenseDetails ? (
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
      ) : (
        !error && selectedSite && selectedDescription && (
          <div className="text-center text-gray-400 py-12 text-base">
            No data available for selected options.
          </div>
        )
      )}
    </div>
  );
};

export default ExpenseGraph;
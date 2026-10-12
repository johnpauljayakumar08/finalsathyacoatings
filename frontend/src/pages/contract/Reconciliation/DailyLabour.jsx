import { API_BASE_URL } from "../../../config/api.js";
// DailyLabour.jsx
import React, { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  PolarAreaController,
  RadialLinearScale
} from "chart.js";
import { Bar, Doughnut, Line, Pie, PolarArea } from "react-chartjs-2";
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  PolarAreaController,
  RadialLinearScale
);

const DailyLabour = () => {
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
  const [labourBudget, setLabourBudget] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Chart States
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [overallType, setOverallType] = useState({ value: "shift", label: "Shift" });
  const [individualChartType, setIndividualChartType] = useState({ value: "bar", label: "Bar" });
  const [overallChartType, setOverallChartType] = useState({ value: "bar", label: "Bar" });

  // Options
  const overallTypeOptions = [
    { value: "shift", label: "Shift" },
    { value: "salary", label: "Salary" },
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

  // Fetch Labour Budget
  useEffect(() => {
    if (selectedDescription) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          setError(null);
          const response = await axios.get(`${API_BASE_URL}/site-incharge/calculate-labour-budget`);
          setLabourBudget(response.data.processed_po_budgets || []);
        } catch (err) {
          console.error("Failed to load labour data:", err);
          setError(`Failed to load labour data. Please ensure the backend server is running on ${API_BASE_URL}.`);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    } else {
      setLabourBudget([]);
      setLoadingData(false);
    }
  }, [selectedDescription]);

  // Hooks must be called unconditionally - move all useMemo here
  const uniqueLabours = useMemo(() => {
    if (!selectedDescription) return [];
    const labourSet = new Set();
    const filtered = labourBudget.filter(b => b.desc_id === selectedDescription.value) || [];
    filtered.forEach(b => {
      b.labour_assignments.forEach(a => {
        labourSet.add(JSON.stringify({ labour_id: a.labour_id, full_name: a.full_name }));
      });
    });
    return Array.from(labourSet).map(JSON.parse);
  }, [labourBudget, selectedDescription]);

  const labourOptions = useMemo(() => uniqueLabours.map(l => ({
    value: l.labour_id,
    label: l.full_name,
  })), [uniqueLabours]);

  const prepareIndividualData = useMemo(() => {
    return (labourId) => {
      if (!labourId || !selectedDescription) return { chartData: null, totalSalary: 0 };
      const filteredBudgets = labourBudget.filter(b => b.desc_id === selectedDescription.value) || [];
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
        labels: sortedDates.map(d => new Date(d).toLocaleDateString()),
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
  }, [labourBudget, selectedDescription]);

  const prepareOverallData = useMemo(() => {
    return (type) => {
      if (!selectedDescription) return { labels: [], datasets: [] };
      const filteredBudgets = labourBudget.filter(b => b.desc_id === selectedDescription.value) || [];
      const dateMap = new Map();
      filteredBudgets.forEach(b => {
        b.labour_assignments.forEach(a => {
          a.shifts_by_date.forEach(s => {
            const date = s.entry_date.split('T')[0];
            const value = type === 'shift' ? s.shift : s.shift * a.salary / a.total_shifts;
            dateMap.set(date, (dateMap.get(date) || 0) + value);
          });
        });
      });
      const sortedDates = Array.from(dateMap.keys()).sort();
      const data = sortedDates.map(d => dateMap.get(d));
      const colors = ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"];
      const chartData = {
        labels: sortedDates.map(d => new Date(d).toLocaleDateString()),
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
  }, [labourBudget, selectedDescription]);

  const individualData = useMemo(() => prepareIndividualData(selectedLabour?.value), [selectedLabour, prepareIndividualData]);
  const overallChartData = useMemo(() => prepareOverallData(overallType.value), [overallType, prepareOverallData]);

  // Options for Filters (moved here to avoid conditional computation issues)
  const companyOptions = useMemo(() => companies.map((company) => ({
    value: company.company_id,
    label: company.company_name || company.company_id || "Unknown Company",
  })), [companies]);

  const projectOptions = useMemo(() => projects.map((project) => ({
    value: project.pd_id,
    label: project.project_name || project.pd_id || "Unknown Project",
  })), [projects]);

  const siteOptions = useMemo(() => sites.map((site) => ({
    value: site.site_id,
    label: `${site.site_name || site.site_id || "Unknown Site"} (PO: ${site.po_number || "N/A"})`,
  })), [sites]);

  const descriptionOptions = useMemo(() => workDescriptions.map((desc) => ({
    value: desc.desc_id,
    label: desc.desc_name || desc.desc_id || "Unknown Description",
  })), [workDescriptions]);

  // Early returns after all hooks
  if (loadingData || Object.values(loadingFilters).some(Boolean)) return <div className="text-center text-gray-500 py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  const renderChart = (chartType, data, options) => {
    if (!data || !data.labels || !data.datasets || data.datasets.length === 0) {
      return <div className="text-center text-gray-500 py-10">No data available for chart</div>;
    }
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

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
            <h1 className="text-center text-3xl font-bold mb-10">Daily Labour</h1>

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
      {selectedDescription && uniqueLabours.length > 0 ? (
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
            {overallChartData && overallChartData.labels && overallChartData.labels.length > 0 ? (
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
            {selectedLabour && individualData.chartData && individualData.chartData.labels && individualData.chartData.labels.length > 0 ? (
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
      ) : (
        !error && selectedDescription && (
          <div className="text-center text-gray-400 py-12 text-base">
            No data available for selected options.
          </div>
        )
      )}
    </div>
  );
};

export default DailyLabour;
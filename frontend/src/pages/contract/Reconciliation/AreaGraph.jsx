import { API_BASE_URL } from "../../../config/api.js";
// AreaGraph.jsx
import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { 
  Bar, 
  Doughnut, 
  Line, 
  Pie, 
  PolarArea 
} from "react-chartjs-2";
import axios from "axios";

const AreaGraph = () => {
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
  const [poTotals, setPoTotals] = useState(null);
  const [completionEntries, setCompletionEntries] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Chart States
  const [chartType, setChartType] = useState({ value: "po_quantity", label: "PO Quantity" });
  const [barChartType, setBarChartType] = useState({ value: "bar", label: "Bar" });
  const [donutChartType, setDonutChartType] = useState({ value: "doughnut", label: "Doughnut" });

  // Options
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
      setPoTotals(null);
      setCompletionEntries([]);
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
      setPoTotals(null);
      setCompletionEntries([]);
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

  // Fetch Data for AreaGraph
  useEffect(() => {
    if (selectedSite && selectedDescription) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          setError(null);
          const [poTotalsResponse, completionResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/admin/po-reckoner-totals/${selectedSite.value}/${selectedDescription.value}`),
            axios.get(`${API_BASE_URL}/admin/completion-entries-by-site/${selectedSite.value}/${selectedDescription.value}`)
          ]);
          setPoTotals(poTotalsResponse.data.data || null);
          setCompletionEntries(completionResponse.data.data || []);
        } catch (err) {
          console.error("Failed to load data:", err);
          setError("Failed to load chart data.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    } else {
      setPoTotals(null);
      setCompletionEntries([]);
      setLoadingData(false);
    }
  }, [selectedSite, selectedDescription]);

  // Move computations here, always called
  const getFilteredSubcategories = useMemo(() => {
    if (!poTotals?.subcategory_totals || !Array.isArray(poTotals.subcategory_totals) || !selectedDescription) return [];
    let subcats = [];
    poTotals.subcategory_totals.forEach(category => {
      const description = category.descriptions?.find(desc => desc.desc_id == selectedDescription.value);
      if (description?.subcategories) {
        subcats.push(...description.subcategories);
      }
    });
    return subcats;
  }, [poTotals, selectedDescription]);

  const subcategorySummaries = useMemo(() => {
    if (!poTotals || !selectedDescription || !completionEntries.length || !Array.isArray(completionEntries)) return [];
    const subcats = getFilteredSubcategories;
    if (!Array.isArray(subcats)) return [];
    return subcats.map(sub => {
      let completedArea = 0;
      let completedValue = 0;
      completionEntries.forEach((cat) => {
        if (cat?.subcategories) {
          const subcategory = cat.subcategories.find((sc) => sc.subcategory_name === sub.subcategory_name);
          if (subcategory?.entries_by_date) {
            subcategory.entries_by_date.forEach((dateEntry) => {
              if (dateEntry?.entries && Array.isArray(dateEntry.entries)) {
                dateEntry.entries.forEach((e) => {
                  if (e.desc_id == selectedDescription.value) {
                    completedArea += e.area_added || 0;
                    completedValue += e.value_added || 0;
                  }
                });
              }
            });
          }
        }
      });
      return {
        subcategory_name: sub.subcategory_name,
        po_quantity: sub.po_quantity || 0,
        value: sub.value || 0,
        completedArea,
        completedValue
      };
    });
  }, [poTotals, selectedDescription, completionEntries, getFilteredSubcategories]);

  // Options for Filters
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

  const barLabels = getFilteredSubcategories.map((sub) => sub.subcategory_name);
  const completedData = subcategorySummaries.map((s) => chartType.value === "po_quantity" ? s.completedArea : s.completedValue);
  const targetData = subcategorySummaries.map((s) => chartType.value === "po_quantity" ? s.po_quantity : s.value);

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
    labels: subcategorySummaries.map((s) => 
      `${s.subcategory_name} (PO: ${s.po_quantity || 0}, Val: ${s.value || 0})`
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

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-10">Area Graph</h1>
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
      {selectedSite && selectedDescription && getFilteredSubcategories.length > 0 ? (
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

export default AreaGraph;
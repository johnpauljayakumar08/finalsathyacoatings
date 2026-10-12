import { API_BASE_URL } from "../../../config/api.js";
// MaterialGraph.jsx
import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { Bar, Doughnut, Line, Pie, PolarArea } from "react-chartjs-2";
import axios from "axios";

const MaterialGraph = () => {
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
  const [materialData, setMaterialData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Chart States
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialChartType, setMaterialChartType] = useState({ value: "bar", label: "Bar" });
  const [selectedUsageMaterial, setSelectedUsageMaterial] = useState(null);
  const [usageChartType, setUsageChartType] = useState({ value: "bar", label: "Bar" });

  // Options
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

  // Fetch Material Data
  useEffect(() => {
    if (selectedSite && selectedDescription) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          setError(null);
          const response = await axios.get(`${API_BASE_URL}/admin/material-graph/${selectedSite.value}/${selectedDescription.value}`);
          setMaterialData(response.data.data || null);
        } catch (err) {
          console.error("Failed to load material data:", err);
          setError("Failed to load material data.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    } else {
      setMaterialData(null);
      setLoadingData(false);
    }
  }, [selectedSite, selectedDescription]);

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

  const materialOptions = useMemo(() => materialData?.material_planning?.map(material => ({
    value: material.item_id,
    label: material.item_name,
  })) || [], [materialData]);

  const prepareMaterialChartData = useMemo(() => {
    if (!materialData || !materialData.material_planning) return null;
    
    let materialsToShow = materialData.material_planning;
    
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
  }, [materialData, selectedMaterial]);

  const prepareUsageHistoryData = useMemo(() => {
    if (!materialData || !materialData.usage_history || !selectedUsageMaterial) return null;
    
    const usageData = materialData.usage_history.filter(item => item.item_id === selectedUsageMaterial.value);
    
    if (usageData.length === 0) return null;
    
    const dateMap = new Map();
    
    usageData.forEach(entry => {
      const date = new Date(entry.entry_date).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, 0);
      }
      dateMap.set(date, dateMap.get(date) + entry.overall_qty);
    });
    
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
  }, [materialData, selectedUsageMaterial]);

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
      <h1 className="text-center text-3xl font-bold mb-10">Material Graph</h1>
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

      {/* Error Message */}
      {error && (
        <div className="text-center text-red-500 py-4">
          {error}
        </div>
      )}

      {/* Charts Section */}
      {selectedSite && selectedDescription ? (
        <>
          {/* Material Metrics Graph */}
          {prepareMaterialChartData && (
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
                {renderChart(materialChartType.value, prepareMaterialChartData, {
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

          {/* Material Usage History */}
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
              
              {selectedUsageMaterial && prepareUsageHistoryData ? (
                <div className="w-full h-[400px]">
                  {renderChart(usageChartType.value, prepareUsageHistoryData, {
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
        </>
      ) : (
        <div className="text-center text-gray-500 py-10">Please select all filters to view charts.</div>
      )}
    </div>
  );
};

export default MaterialGraph;
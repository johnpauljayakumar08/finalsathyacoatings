import { API_BASE_URL } from "../../../config/api.js";
// DailyProgress.jsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import Select from "react-select";

const DailyProgress = () => {
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
  const [completionEntries, setCompletionEntries] = useState([]);
  const [poTotals, setPoTotals] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

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

  // Fetch Data for DailyProgress
  useEffect(() => {
    if (selectedSite && selectedDescription) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          setError(null);
          const [completionResponse, poTotalsResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/admin/completion-entries-by-site/${selectedSite.value}/${selectedDescription.value}`),
            axios.get(`${API_BASE_URL}/admin/po-reckoner-totals/${selectedSite.value}/${selectedDescription.value}`)
          ]);
          setCompletionEntries(completionResponse.data.data || []);
          setPoTotals(poTotalsResponse.data.data || null);
        } catch (err) {
          console.error("Failed to load data:", err);
          setError("Failed to load progress data.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    } else {
      setCompletionEntries([]);
      setPoTotals(null);
      setLoadingData(false);
    }
  }, [selectedSite, selectedDescription]);

  // Options for Filters
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

  if (loadingData || Object.values(loadingFilters).some(Boolean)) return <div className="text-center text-gray-500 py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  const prepareLineChartData = () => {
    if (!completionEntries.length || !selectedDescription) return null;
    
    const allDates = new Set();
    
    completionEntries.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.entries_by_date.forEach(dateEntry => {
          const hasMatchingEntry = dateEntry.entries.some(e => 
            e.desc_id == selectedDescription.value
          );
          if (hasMatchingEntry) {
            allDates.add(dateEntry.entry_date);
          }
        });
      });
    });
    
    if (allDates.size === 0) return null;
    
    const sortedDates = Array.from(allDates).sort();
    const datasets = [];
    const colors = ["#fb7185", "#38bdf8", "#fde047", "#2dd4bf", "#c4b5fd"];
    
    const filteredSubcategories = poTotals ? (() => {
      if (!poTotals?.subcategory_totals || !Array.isArray(poTotals.subcategory_totals)) return [];
      let subcats = [];
      poTotals.subcategory_totals.forEach(category => {
        const description = category.descriptions?.find(desc => desc.desc_id == selectedDescription.value);
        if (description?.subcategories) {
          subcats.push(...description.subcategories);
        }
      });
      return subcats;
    })() : [];
    
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

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-10">Daily Progress</h1>
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

      {/* Chart Section */}
      {selectedSite && selectedDescription && lineChartData ? (
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

export default DailyProgress;
import { API_BASE_URL } from "../../../config/api.js";
// DashboardCards.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const DashboardCards = () => {
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
  const [siteDetails, setSiteDetails] = useState({ 
    start_date: "2025-05-28", 
    location_name: "Perundurai", 
    total_area: 1857, 
    current_phase: 'In Progress' 
  });
  const [subcategorySummaries, setSubcategorySummaries] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState(null);
  const [completionEntries, setCompletionEntries] = useState([]);
  const [poTotals, setPoTotals] = useState(null);
  const [percentage, setPercentage] = useState(0);
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

  // Fetch Data for Cards
  useEffect(() => {
    if (selectedSite && selectedDescription) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          setError(null);
          const [completionResponse, poTotalsResponse, expenseResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/admin/completion-entries-by-site/${selectedSite.value}/${selectedDescription.value}`),
            axios.get(`${API_BASE_URL}/admin/po-reckoner-totals/${selectedSite.value}/${selectedDescription.value}`),
            axios.get(`${API_BASE_URL}/admin/expense-details/${selectedSite.value}/${selectedDescription.value}`)
          ]);
          
          const completionData = completionResponse.data.data || [];
          const poTotalsData = poTotalsResponse.data.data || null;
          const expenseData = expenseResponse.data.data || null;
          
          const perc = poTotalsData?.total_po_quantity === 0 ? 0 : (completionResponse?.data?.billing_area / poTotalsData.total_po_quantity) * 100;
          setPercentage(perc);
          
          setCompletionEntries(completionData);
          setPoTotals(poTotalsData);
          setExpenseDetails(expenseData);

          const current_phase = Number(perc) === 100 ? 'Completed' : 'In Progress';
          setSiteDetails(prev => ({ ...prev, current_phase }));

          // Calculate subcategorySummaries
          if (poTotalsData?.subcategory_totals) {
            let subcats = [];
            poTotalsData.subcategory_totals.forEach(category => {
              const description = category.descriptions?.find(desc => desc.desc_id == selectedDescription.value);
              if (description?.subcategories) {
                subcats.push(...description.subcategories);
              }
            });
            const summaries = subcats.map(sub => {
              let completedArea = 0;
              let completedValue = 0;
              completionData.forEach((cat) => {
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
            setSubcategorySummaries(summaries);
          }
        } catch (err) {
          console.error("Failed to load data:", err);
          setError("Failed to load dashboard data.");
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    } else {
      setSubcategorySummaries([]);
      setExpenseDetails(null);
      setPercentage(0);
      setCompletionEntries([]);
      setPoTotals(null);
    }
  }, [selectedSite, selectedDescription]);

  // Options
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
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

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

  const cardCompletionStyle = "bg-gradient-to-br from-blue-200 to-indigo-100 text-indigo-900 shadow-lg";
  const card100Style = "bg-gradient-to-r from-green-500 to-emerald-300 text-white shadow-lg";

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      <h1 className="text-center text-3xl font-bold mb-10">Overall Progress</h1>
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

      {/* Site Details Section */}
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

      {/* Cards Section */}
      {selectedSite && selectedDescription && subcategorySummaries.length > 0 ? (
        <div className="flex flex-wrap items-stretch gap-6 justify-center mb-8 pt-3">
          {/* Subcategory Cards */}
          {subcategorySummaries.map((subcategory, i) => (
            <div
              key={subcategory.subcategory_name}
              className={`bg-gradient-to-br from-gray-50 to-gray-100 w-full sm:w-[250px] rounded-xl p-4 flex flex-col items-center text-center transform transition duration-300 hover:scale-105 shadow-lg`}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3">{subcategory.subcategory_name}</h3>
              <div className="bg-gray-200 bg-opacity-20 p-3 rounded-lg w-full">
                <div className="flex justify-between text-sm text-gray-800">
                  <span>Completed Area (sqm):</span>
                  <span className="font-semibold">{subcategory.completedArea.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-800 mt-1">
                  <span>Total (sqm):</span>
                  <span className="font-semibold">{subcategory.po_quantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-800 mt-2">
                  <span>Completed Value:</span>
                  <span className="font-semibold">₹{subcategory.completedValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-800 mt-1">
                  <span>Total Value:</span>
                  <span className="font-semibold">₹{subcategory.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {/* Project Completion Card */}
          <div
            className={`${Number(percentage) === 100 ? card100Style : cardCompletionStyle} w-full sm:w-[250px] rounded-xl p-4 flex flex-col items-center text-center transform transition duration-300 hover:scale-105`}
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

export default DashboardCards;
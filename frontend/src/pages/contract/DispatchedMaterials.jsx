import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { Loader2, Package, FileText, X, ChevronDown, ChevronUp } from "lucide-react";
import DispatchReport from "../../components/DispatchReport";

const DispatchedMaterials = () => {
  const [companies, setCompanies] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [dispatchGroups, setDispatchGroups] = useState([]);
  const [selectedDispatchIndex, setSelectedDispatchIndex] = useState(-1);
  const [filteredDispatchedMaterials, setFilteredDispatchedMaterials] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedWorkDescription, setSelectedWorkDescription] = useState("");
  const [loading, setLoading] = useState({
    companies: false,
    projects: false,
    sites: false,
    workDescriptions: false,
    materials: false,
  });
  const [error, setError] = useState(null);
  const [commonDispatchDetails, setCommonDispatchDetails] = useState({
    dc_no: "",
    dispatch_date: "",
    order_no: "",
    vendor_code: "",
    gst_number: "",
    order_date: "",
    destination: "",
    travel_expense: "",
    vehicle_number: "",
    driver_name: "",
    driver_mobile: "",
    master_dc_no: "",
    next_dc_no: "", // Added to store the next DC number
  });
  const [showDispatchReport, setShowDispatchReport] = useState(false);

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      setLoading((prev) => ({ ...prev, companies: true }));
      const response = await axios.get(`${API_BASE_URL}/project/companies`);
      setCompanies(response.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };

  // Fetch master DC No based on company_id
  const fetchMasterDcNo = async (company_id) => {
    if (!company_id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/material/master-dc-no`, {
        params: { company_id },
      });
      if (response.data.status === "success" && response.data.data) {
        setCommonDispatchDetails((prev) => ({
          ...prev,
          master_dc_no: response.data.data.dc_no || "N/A",
        }));
      } else {
        setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "N/A" }));
      }
    } catch (error) {
      console.error("Error fetching master DC No:", error);
      setError("Failed to load master DC No. Please try again.");
      setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "N/A" }));
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading((prev) => ({ ...prev, projects: true }));
      const response = await axios.get(`${API_BASE_URL}/project/projects-with-sites`);
      setAllProjects(response.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  };

  // Fetch sites based on selected project
  const fetchSites = async (pd_id) => {
    try {
      setLoading((prev) => ({ ...prev, sites: true }));
      const selectedProj = allProjects.find((project) => project.project_id === pd_id);
      const projectSites = selectedProj && Array.isArray(selectedProj.sites) ? selectedProj.sites : [];
      setSites(projectSites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      setError("Failed to load sites. Please try again.");
      setSites([]);
    } finally {
      setLoading((prev) => ({ ...prev, sites: false }));
    }
  };

  // Fetch work descriptions based on selected site
  const fetchWorkDescriptions = async (site_id) => {
    try {
      setLoading((prev) => ({ ...prev, workDescriptions: true }));
      const response = await axios.get(`${API_BASE_URL}/material/work-descriptions`, {
        params: { site_id },
      });
      setWorkDescriptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching work descriptions:", error);
      setError("Failed to load work descriptions. Please try again.");
      setWorkDescriptions([]);
    } finally {
      setLoading((prev) => ({ ...prev, workDescriptions: false }));
    }
  };

  // Fetch next DC No based on site_id
  const fetchNextDcNo = async (site_id) => {
    if (!site_id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/material/next-dc-no`, {
        params: { site_id },
      });
      if (response.data.status === "success" && response.data.data) {
        setCommonDispatchDetails((prev) => ({
          ...prev,
          next_dc_no: response.data.data.next_dc_no != null ? response.data.data.next_dc_no.toString() : "N/A",
        }));
      } else {
        setCommonDispatchDetails((prev) => ({ ...prev, next_dc_no: "N/A" }));
      }
    } catch (error) {
      console.error("Error fetching next DC No:", error);
      setError("Failed to fetch next DC No. Please try again.");
      setCommonDispatchDetails((prev) => ({ ...prev, next_dc_no: "N/A" }));
    }
  };

  // Fetch dispatched materials for selected project, site, and work description
  const fetchDispatchedMaterials = async () => {
    if (!selectedProject || !selectedSite || !selectedWorkDescription) return;
    try {
      setLoading((prev) => ({ ...prev, materials: true }));
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/material/dispatch-details`, {
        params: { pd_id: selectedProject, site_id: selectedSite, desc_id: selectedWorkDescription },
      });
      const materials = response.data.data || [];

      // Group materials by dc_no and dispatch_date
      const dispatchGroupsMap = materials.reduce((acc, material) => {
        const key = `${material.dc_no}-${material.dispatch_date}`;
        if (!acc[key]) {
          acc[key] = {
            dc_no: material.dc_no,
            dispatch_date: material.dispatch_date,
            created_at: material.created_at,
            master_dc_no: material.master_dc_no,
            materials: [],
          };
        }
        acc[key].materials.push(material);
        return acc;
      }, {});

      const groups = Object.values(dispatchGroupsMap).sort(
        (a, b) => new Date(a.dispatch_date) - new Date(b.dispatch_date)
      );

      setDispatchGroups(groups);

      if (groups.length === 1) {
        setSelectedDispatchIndex(0);
        const group = groups[0];
        setFilteredDispatchedMaterials(group.materials);

        // Set common dispatch details from the first material's first transport
        const firstMaterial = group.materials[0];
        const firstTransport = firstMaterial.transport_details && firstMaterial.transport_details.length > 0
          ? firstMaterial.transport_details[0]
          : {};
        setCommonDispatchDetails((prev) => ({
          ...prev,
          dc_no: firstMaterial.dc_no || "N/A",
          dispatch_date: firstMaterial.dispatch_date
            ? new Date(firstMaterial.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
            : "N/A",
          order_no: firstMaterial.order_no || "N/A",
          vendor_code: firstMaterial.vendor_code || "N/A",
          gst_number: firstMaterial.gst_number || "N/A",
          order_date: firstMaterial.order_date
            ? new Date(firstMaterial.order_date).toLocaleDateString("en-US", { dateStyle: "medium" })
            : "N/A",
          destination: firstTransport.destination || "N/A",
          travel_expense: firstTransport.travel_expense
            ? firstTransport.travel_expense.toLocaleString()
            : "N/A",
          vehicle_number: firstTransport.vehicle?.vehicle_number || "N/A",
          driver_name: firstTransport.driver?.driver_name || "N/A",
          driver_mobile: firstTransport.driver?.driver_mobile || "N/A",
          master_dc_no: firstMaterial.master_dc_no || prev.master_dc_no || "N/A",
        }));
      } else {
        setSelectedDispatchIndex(-1);
        setFilteredDispatchedMaterials([]);
        setCommonDispatchDetails((prev) => ({
          ...prev,
          dc_no: "",
          dispatch_date: "",
          order_no: "",
          vendor_code: "",
          gst_number: "",
          order_date: "",
          destination: "",
          travel_expense: "",
          vehicle_number: "",
          driver_name: "",
          driver_mobile: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching dispatched materials:", error);
      setError(
        error.response?.data?.message ||
        error.response?.data?.sqlMessage ||
        "Failed to load dispatched materials. Please try again."
      );
      setDispatchGroups([]);
      setFilteredDispatchedMaterials([]);
      setSelectedDispatchIndex(-1);
    } finally {
      setLoading((prev) => ({ ...prev, materials: false }));
    }
  };

  // Handle dispatch selection
  const handleDispatchSelect = (index) => {
    setSelectedDispatchIndex(index);
    const group = dispatchGroups[index];
    if (group) {
      setFilteredDispatchedMaterials(group.materials);
      const firstMaterial = group.materials[0];
      const firstTransport = firstMaterial.transport_details && firstMaterial.transport_details.length > 0
        ? firstMaterial.transport_details[0]
        : {};
      setCommonDispatchDetails((prev) => ({
        ...prev,
        dc_no: firstMaterial.dc_no || "N/A",
        dispatch_date: firstMaterial.dispatch_date
          ? new Date(firstMaterial.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
          : "N/A",
        order_no: firstMaterial.order_no || "N/A",
        vendor_code: firstMaterial.vendor_code || "N/A",
        gst_number: firstMaterial.gst_number || "N/A",
        order_date: firstMaterial.order_date
          ? new Date(firstMaterial.order_date).toLocaleDateString("en-US", { dateStyle: "medium" })
          : "N/A",
        destination: firstTransport.destination || "N/A",
        travel_expense: firstTransport.travel_expense
          ? firstTransport.travel_expense.toLocaleString()
          : "N/A",
        vehicle_number: firstTransport.vehicle?.vehicle_number || "N/A",
        driver_name: firstTransport.driver?.driver_name || "N/A",
        driver_mobile: firstTransport.driver?.driver_mobile || "N/A",
        master_dc_no: firstMaterial.master_dc_no || prev.master_dc_no || "N/A",
      }));
    }
  };

  // Handle company selection
  const handleCompanyChange = async (value) => {
    const company_id = value;
    setSelectedCompany(company_id);
    setSelectedProject("");
    setSelectedSite("");
    setSelectedWorkDescription("");
    setSelectedDispatchIndex(-1);
    setDispatchGroups([]);
    setFilteredDispatchedMaterials([]);
    setSites([]);
    setWorkDescriptions([]);
    setCommonDispatchDetails({
      dc_no: "",
      dispatch_date: "",
      order_no: "",
      vendor_code: "",
      gst_number: "",
      order_date: "",
      destination: "",
      travel_expense: "",
      vehicle_number: "",
      driver_name: "",
      driver_mobile: "",
      master_dc_no: "",
      next_dc_no: "", // Reset next_dc_no
    });
    setError(null);
    setShowDispatchReport(false);
    if (company_id) {
      await fetchMasterDcNo(company_id);
    }
  };

  // Handle project selection
  const handleProjectChange = async (value) => {
    const pd_id = value;
    setSelectedProject(pd_id);
    setSelectedSite("");
    setSelectedWorkDescription("");
    setSelectedDispatchIndex(-1);
    setDispatchGroups([]);
    setFilteredDispatchedMaterials([]);
    setWorkDescriptions([]);
    setCommonDispatchDetails((prev) => ({
      ...prev,
      dc_no: "",
      dispatch_date: "",
      order_no: "",
      vendor_code: "",
      gst_number: "",
      order_date: "",
      destination: "",
      travel_expense: "",
      vehicle_number: "",
      driver_name: "",
      driver_mobile: "",
      next_dc_no: "", // Reset next_dc_no
    }));
    setError(null);
    setShowDispatchReport(false);
    if (pd_id) {
      await fetchSites(pd_id);
    }
  };

  // Handle site selection
  const handleSiteChange = async (value) => {
    const site_id = value;
    setSelectedSite(site_id);
    setSelectedWorkDescription("");
    setSelectedDispatchIndex(-1);
    setDispatchGroups([]);
    setFilteredDispatchedMaterials([]);
    setWorkDescriptions([]);
    setCommonDispatchDetails((prev) => ({
      ...prev,
      dc_no: "",
      dispatch_date: "",
      order_no: "",
      vendor_code: "",
      gst_number: "",
      order_date: "",
      destination: "",
      travel_expense: "",
      vehicle_number: "",
      driver_name: "",
      driver_mobile: "",
      next_dc_no: "", // Reset next_dc_no
    }));
    setError(null);
    setShowDispatchReport(false);
    if (site_id) {
      await fetchWorkDescriptions(site_id);
      await fetchNextDcNo(site_id); // Fetch next DC No when site is selected
    }
  };

  // Handle work description selection
  const handleWorkDescriptionChange = async (value) => {
    const desc_id = value;
    setSelectedWorkDescription(desc_id);
    setSelectedDispatchIndex(-1);
    setDispatchGroups([]);
    setFilteredDispatchedMaterials([]);
    setCommonDispatchDetails((prev) => ({
      ...prev,
      dc_no: "",
      dispatch_date: "",
      order_no: "",
      vendor_code: "",
      gst_number: "",
      order_date: "",
      destination: "",
      travel_expense: "",
      vehicle_number: "",
      driver_name: "",
      driver_mobile: "",
      next_dc_no: "", // Reset next_dc_no
    }));
    setError(null);
    setShowDispatchReport(false);
    if (desc_id) {
      await fetchDispatchedMaterials();
    }
  };

  // Toggle Dispatch Report visibility
  const handleViewDC = () => {
    setShowDispatchReport(true);
  };

  // Helper function to format component ratios
  const formatComponentRatios = (comp_ratio_a, comp_ratio_b, comp_ratio_c) => {
    const ratios = [comp_ratio_a || 0, comp_ratio_b || 0];
    if (comp_ratio_c !== null && comp_ratio_c !== undefined) {
      ratios.push(comp_ratio_c);
    }
    return ` (${ratios.join(':')})`;
  };

  // Format created_at as "Created At"
  const formatCreatedAt = (created_at) => {
    if (!created_at) return "N/A";
    return new Date(created_at).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    fetchCompanies();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const filteredProjects = allProjects.filter((project) => project.company_id === selectedCompany);
      setProjects(filteredProjects);
      if (filteredProjects.length === 1) {
        setSelectedProject(filteredProjects[0].project_id);
      } else {
        setSelectedProject("");
        setSites([]);
        setSelectedSite("");
        setWorkDescriptions([]);
        setSelectedWorkDescription("");
        setDispatchGroups([]);
        setFilteredDispatchedMaterials([]);
        setSelectedDispatchIndex(-1);
      }
      fetchMasterDcNo(selectedCompany);
    } else {
      setProjects([]);
      setSelectedProject("");
      setSites([]);
      setSelectedSite("");
      setWorkDescriptions([]);
      setSelectedWorkDescription("");
      setDispatchGroups([]);
      setFilteredDispatchedMaterials([]);
      setSelectedDispatchIndex(-1);
      setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "", next_dc_no: "" }));
    }
  }, [selectedCompany, allProjects]);

  useEffect(() => {
    if (selectedProject) {
      fetchSites(selectedProject);
    } else {
      setSites([]);
      setSelectedSite("");
      setWorkDescriptions([]);
      setSelectedWorkDescription("");
      setDispatchGroups([]);
      setFilteredDispatchedMaterials([]);
      setSelectedDispatchIndex(-1);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && sites.length === 1) {
      setSelectedSite(sites[0].site_id);
    }
  }, [sites, selectedProject]);

  useEffect(() => {
    if (selectedSite) {
      fetchWorkDescriptions(selectedSite);
    } else {
      setWorkDescriptions([]);
      setSelectedWorkDescription("");
      setDispatchGroups([]);
      setFilteredDispatchedMaterials([]);
      setSelectedDispatchIndex(-1);
    }
  }, [selectedSite]);

  useEffect(() => {
    if (selectedSite && workDescriptions.length === 1) {
      setSelectedWorkDescription(workDescriptions[0].desc_id);
    }
  }, [workDescriptions, selectedSite]);

  useEffect(() => {
    if (selectedProject && selectedSite && selectedWorkDescription) {
      fetchDispatchedMaterials();
    }
  }, [selectedProject, selectedSite, selectedWorkDescription]);

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: "#e2e8f0",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#38b2ac",
      },
      caretColor: "transparent",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#e6fffa" : state.isFocused ? "#f0f9ff" : "#ffffff",
      color: "#1a202c",
      "&:hover": {
        backgroundColor: "#f0f9ff",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#1a202c",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#a0aec0",
    }),
    input: (provided) => ({
      ...provided,
      caretColor: "transparent",
    }),
  };

  // Prepare options for selects
  const companyOptions = companies.map((company) => ({
    value: company.company_id,
    label: company.company_name || "Unknown Company",
  }));
  const companyValue = selectedCompany
    ? companyOptions.find((opt) => opt.value === selectedCompany)
    : null;

  const projectOptions = projects.map((project) => ({
    value: project.project_id,
    label: project.project_name || "Unknown Project",
  }));
  const projectValue = selectedProject
    ? projectOptions.find((opt) => opt.value === selectedProject)
    : null;

  const siteOptions = sites.map((site) => ({
    value: site.site_id,
    label: `${site.site_name || "Unknown Site"} (PO: ${site.po_number || "N/A"})`,
  }));
  const siteValue = selectedSite
    ? siteOptions.find((opt) => opt.value === selectedSite)
    : null;

  const workDescriptionOptions = workDescriptions.map((desc) => ({
    value: desc.desc_id,
    label: desc.desc_name || "Unknown Description",
  }));
  const workDescriptionValue = selectedWorkDescription
    ? workDescriptionOptions.find((opt) => opt.value === selectedWorkDescription)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
            <Package className="h-8 w-8 text-teal-600" aria-hidden="true" />
            Dispatched Materials
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            View details of materials dispatched to your project sites
          </p>
        </div>

        {/* Selection Inputs */}
        <div className="mb-6 bg-white p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select Company</label>
              <Select
                value={companyValue}
                onChange={(selected) => handleCompanyChange(selected ? selected.value : "")}
                options={companyOptions}
                isDisabled={loading.companies}
                isSearchable={true}
                placeholder="Select Company"
                className="w-full text-sm"
                styles={customSelectStyles}
              />
              {loading.companies && (
                <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select Cost Center</label>
              <Select
                value={projectValue}
                onChange={(selected) => handleProjectChange(selected ? selected.value : "")}
                options={projectOptions}
                isDisabled={loading.projects || !selectedCompany}
                isSearchable={true}
                placeholder="Select Cost Center"
                className="w-full text-sm"
                styles={customSelectStyles}
              />
              {loading.projects && (
                <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select Site</label>
              <Select
                value={siteValue}
                onChange={(selected) => handleSiteChange(selected ? selected.value : "")}
                options={siteOptions}
                isDisabled={!selectedProject || loading.sites}
                isSearchable={true}
                placeholder="Select Site"
                className="w-full text-sm"
                styles={customSelectStyles}
              />
              {loading.sites && selectedProject && (
                <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />
              )}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select Work Description</label>
              <Select
                value={workDescriptionValue}
                onChange={(selected) => handleWorkDescriptionChange(selected ? selected.value : "")}
                options={workDescriptionOptions}
                isDisabled={!selectedSite || loading.workDescriptions}
                isSearchable={true}
                placeholder="Select Work Description"
                className="w-full text-sm"
                styles={customSelectStyles}
              />
              {loading.workDescriptions && selectedSite && (
                <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
              aria-label="Close error message"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading.materials ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-teal-600 animate-spin" aria-hidden="true" />
              <p className="text-gray-600 text-lg font-medium">Loading dispatched materials...</p>
            </div>
          </div>
        ) : !selectedCompany || !selectedProject || !selectedSite || !selectedWorkDescription ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600 text-lg font-medium">Please select a company, project, site, and work description.</p>
          </div>
        ) : dispatchGroups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600 text-lg font-medium">No dispatched materials found for the selected criteria.</p>
            <p className="text-gray-500 mt-2">Dispatch materials to this project, site, and work description to see them listed here.</p>
          </div>
        ) : (
          <>
            {/* Accordion for Dispatch Groups */}
            <div className="space-y-4 mb-6">
              {dispatchGroups.map((group, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <button
                    onClick={() => handleDispatchSelect(selectedDispatchIndex === index ? -1 : index)}
                    className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-6">
                      <span>
                        <span className="font-semibold text-blue-700">Master DC No:</span>{" "}
                        <span className="text-blue-600">{group.master_dc_no || commonDispatchDetails.master_dc_no || "N/A"}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-green-700">PO DC No:</span>{" "}
                        <span className="text-green-600">{group.dc_no}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-purple-700">Dispatch Date:</span>{" "}
                        <span className="text-purple-600">
                          {group.dispatch_date
                            ? new Date(group.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
                            : "N/A"}
                        </span>
                      </span>
                      <span>
                        <span className="font-semibold text-teal-700">Created At:</span>{" "}
                        <span className="text-teal-600">{formatCreatedAt(group.created_at)}</span>
                      </span>
                    </div>
                    {selectedDispatchIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  {selectedDispatchIndex === index && (
                    <div className="p-6">
                      {/* View DC Button */}
                      <div className="mb-4">
                        <button
                          onClick={handleViewDC}
                          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 shadow-md"
                        >
                          View DC
                        </button>
                      </div>

                      {/* Common Dispatch Details */}
                      <div className="mb-6 bg-white p-6 rounded-xl shadow-inner border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispatch Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-600">Master DC No</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.master_dc_no}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">PO DC No</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.dc_no}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Dispatch Date</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.dispatch_date}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Order No</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.order_no}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Vendor Code / GSTIN</p>
                            <p className="text-sm text-gray-900">
                              {commonDispatchDetails.vendor_code} {commonDispatchDetails.gst_number !== "N/A" ? `/ ${commonDispatchDetails.gst_number}` : ""}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Order Date</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.order_date}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Destination</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.destination}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Travel Expense</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.travel_expense}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Vehicle Number</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.vehicle_number}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Driver Name</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.driver_name}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Driver Mobile</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.driver_mobile}</p>
                          </div>
                         
                        </div>
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 text-sm font-medium text-gray-700">
                          Dispatch {group.dc_no}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Material Name
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Created At
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Quantity & UOM
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Dispatched Quantities
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Remarks
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredDispatchedMaterials.map((dispatch) => (
                                <tr
                                  key={dispatch.id}
                                  className="hover:bg-teal-50 transition-colors duration-200"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <p className="font-medium">
                                      {dispatch.item_name || "N/A"}
                                      {formatComponentRatios(
                                        dispatch.comp_ratio_a,
                                        dispatch.comp_ratio_b,
                                        dispatch.comp_ratio_c
                                      )}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {formatCreatedAt(dispatch.created_at)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <p>
                                      {dispatch.dispatch_qty || dispatch.assigned_quantity || "0"}{" "}
                                      {dispatch.uom_name || ""}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    <div className="space-y-4">
                                      {dispatch.comp_a_qty !== null && dispatch.comp_a_qty !== undefined && (
                                        <div className="flex items-center gap-4">
                                          <label className="w-24 text-sm font-medium text-gray-700">Component A:</label>
                                          <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                            {dispatch.comp_a_qty}
                                          </span>
                                        </div>
                                      )}
                                      {dispatch.comp_b_qty !== null && dispatch.comp_b_qty !== undefined && (
                                        <div className="flex items-center gap-4">
                                          <label className="w-24 text-sm font-medium text-gray-700">Component B:</label>
                                          <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                            {dispatch.comp_b_qty}
                                          </span>
                                        </div>
                                      )}
                                      {dispatch.comp_c_qty !== null && dispatch.comp_c_qty !== undefined && (
                                        <div className="flex items-center gap-4">
                                          <label className="w-24 text-sm font-medium text-gray-700">Component C:</label>
                                          <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                            {dispatch.comp_c_qty}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    <div className="space-y-4">
                                      {dispatch.comp_a_remarks && (
                                        <div className="flex items-center gap-4">
                                          <label className="w-24 text-sm font-medium text-gray-700">A:</label>
                                          <span className="text-sm">{dispatch.comp_a_remarks}</span>
                                        </div>
                                      )}
                                      {dispatch.comp_b_remarks && (
                                        <div className="flex items-center gap-4">
                                          <label className="w-24 text-sm font-medium text-gray-700">B:</label>
                                          <span className="text-sm">{dispatch.comp_b_remarks}</span>
                                        </div>
                                      )}
                                      {dispatch.comp_c_remarks && (
                                        <div className="flex items-center gap-4">
                                          <label className="w-24 text-sm font-medium text-gray-700">C:</label>
                                          <span className="text-sm">{dispatch.comp_c_remarks}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                          <div className="mb-4 px-5 py-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">
                              Dispatch {group.dc_no}
                            </span>
                          </div>
                          {filteredDispatchedMaterials.map((dispatch) => (
                            <div
                              key={dispatch.id}
                              className="p-5 space-y-4 border-b border-gray-200 last:border-b-0"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-700">Material Name</p>
                                <p className="text-sm text-gray-600">
                                  {dispatch.item_name || "N/A"}
                                  {formatComponentRatios(
                                    dispatch.comp_ratio_a,
                                    dispatch.comp_ratio_b,
                                    dispatch.comp_ratio_c
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Created At</p>
                                <p className="text-sm text-gray-600">{formatCreatedAt(dispatch.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Quantity & UOM</p>
                                <p className="text-sm text-gray-600">
                                  {dispatch.dispatch_qty || dispatch.assigned_quantity || "0"}{" "}
                                  {dispatch.uom_name || ""}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Dispatched Quantities</p>
                                <div className="space-y-4 mt-2">
                                  {dispatch.comp_a_qty !== null && dispatch.comp_a_qty !== undefined && (
                                    <div className="flex items-center gap-4">
                                      <label className="w-24 text-sm font-medium text-gray-700">Component A:</label>
                                      <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                        {dispatch.comp_a_qty}
                                      </span>
                                    </div>
                                  )}
                                  {dispatch.comp_b_qty !== null && dispatch.comp_b_qty !== undefined && (
                                    <div className="flex items-center gap-4">
                                      <label className="w-24 text-sm font-medium text-gray-700">Component B:</label>
                                      <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                        {dispatch.comp_b_qty}
                                      </span>
                                    </div>
                                  )}
                                  {dispatch.comp_c_qty !== null && dispatch.comp_c_qty !== undefined && (
                                    <div className="flex items-center gap-4">
                                      <label className="w-24 text-sm font-medium text-gray-700">Component C:</label>
                                      <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                        {dispatch.comp_c_qty}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Remarks</p>
                                <div className="space-y-4 mt-2">
                                  {dispatch.comp_a_remarks && (
                                    <div className="flex items-center gap-4">
                                      <label className="w-24 text-sm font-medium text-gray-700">A:</label>
                                      <span className="text-sm text-gray-600">{dispatch.comp_a_remarks}</span>
                                    </div>
                                  )}
                                  {dispatch.comp_b_remarks && (
                                    <div className="flex items-center gap-4">
                                      <label className="w-24 text-sm font-medium text-gray-700">B:</label>
                                      <span className="text-sm text-gray-600">{dispatch.comp_b_remarks}</span>
                                    </div>
                                  )}
                                  {dispatch.comp_c_remarks && (
                                    <div className="flex items-center gap-4">
                                      <label className="w-24 text-sm font-medium text-gray-700">C:</label>
                                      <span className="text-sm text-gray-600">{dispatch.comp_c_remarks}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dispatch Report */}
            {showDispatchReport && (
              <DispatchReport
                commonDispatchDetails={commonDispatchDetails}
                dispatchedMaterials={filteredDispatchedMaterials}
                onClose={() => setShowDispatchReport(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DispatchedMaterials;
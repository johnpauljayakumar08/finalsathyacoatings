import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
  ChevronDown,
  UserPlus,
  Package,
  Truck,
  HardHat,
  CalendarCheck,
} from "lucide-react";
import ViewAssignedIncharges from "../../components/ViewAssignedIncharges";
// import AssignSiteIncharge from "./AssignSiteIncharge";
// import ViewAssignedIncharges from "./ViewAssignedIncharges";
// import MaterialPlanning from "./AssignMaterial";
// import MaterialDispatch from "./ViewAssignedMaterial";

const ProjectList = () => {
const { encodedUserId } = useParams();
  let createdBy = null;
  try {
    createdBy = encodedUserId ? atob(encodedUserId) : null;
  } catch (error) {
    console.error("Error decoding encodedUserId:", error);
  }

  const [reckonerData, setReckonerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [poGroups, setPoGroups] = useState([]);
  const [siteInfo, setSiteInfo] = useState(null);
  const [loadingSite, setLoadingSite] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedSitePo, setSelectedSitePo] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [selectedSiteName, setSelectedSiteName] = useState(null);
  const [workDescOptions, setWorkDescOptions] = useState([]);
  const [selectedWorkDesc, setSelectedWorkDesc] = useState(null);
  const [searchQueryCompany, setSearchQueryCompany] = useState("");
  const [searchQueryProject, setSearchQueryProject] = useState("");
  const [searchQuerySite, setSearchQuerySite] = useState("");
  const [searchQueryWorkDesc, setSearchQueryWorkDesc] = useState("");
  const [dropdownOpenCompany, setDropdownOpenCompany] = useState(false);
  const [dropdownOpenProject, setDropdownOpenProject] = useState(false);
  const [dropdownOpenSite, setDropdownOpenSite] = useState(false);
  const [dropdownOpenWorkDesc, setDropdownOpenWorkDesc] = useState(false);
  const [showAssignIncharge, setShowAssignIncharge] = useState(false);
  const [showMaterialPlanning, setShowMaterialPlanning] = useState(false);
  const [showMaterialDispatch, setShowMaterialDispatch] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const dropdownRefCompany = useRef(null);
  const dropdownRefProject = useRef(null);
  const dropdownRefSite = useRef(null);
  const dropdownRefWorkDesc = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
    fetchReckonerData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchProjectsForCompany(selectedCompany);
    } else {
      setProjects([]);
      setSelectedProject(null);
      setSiteOptions([]);
      setSelectedSitePo(null);
      setSelectedSiteId(null);
      setSelectedSiteName(null);
      setWorkDescOptions([]);
      setSelectedWorkDesc(null);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const selectedProj = projects.find(p => p.project_id === selectedProject);
      const sites = selectedProj ? selectedProj.sites.map(site => ({
        value: site.po_number,
        label: `${site.site_name} (PO: ${site.po_number})`,
        site_id: site.site_id,
        site_name: site.site_name
      })) : [];
      setSiteOptions(sites);
      if (sites.length > 0) {
        setSelectedSitePo(sites[0].value);
        setSelectedSiteId(sites[0].site_id);
        setSelectedSiteName(sites[0].site_name);
      } else {
        setSelectedSitePo(null);
        setSelectedSiteId(null);
        setSelectedSiteName(null);
      }
      setWorkDescOptions([]);
      setSelectedWorkDesc(null);
    } else {
      setSiteOptions([]);
      setSelectedSitePo(null);
      setSelectedSiteId(null);
      setSelectedSiteName(null);
      setWorkDescOptions([]);
      setSelectedWorkDesc(null);
    }
  }, [selectedProject, projects]);

  useEffect(() => {
    if (selectedSiteId) {
      fetchWorkDescriptions(selectedSiteId);
    } else {
      setWorkDescOptions([]);
      setSelectedWorkDesc(null);
    }
  }, [selectedSiteId]);

  useEffect(() => {
    if (selectedSitePo && reckonerData.length > 0) {
      let filtered = reckonerData.filter(item => item.po_number === selectedSitePo);
      if (selectedWorkDesc) {
        filtered = filtered.filter(item => item.work_descriptions === selectedWorkDesc.desc_name);
      }
      setFilteredData(filtered);
      groupDataByPoNumber(filtered);
      fetchSiteInfo(selectedSitePo);
    } else {
      setFilteredData([]);
      setPoGroups([]);
      setSiteInfo(null);
    }
  }, [selectedSitePo, selectedWorkDesc, reckonerData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRefCompany.current && !dropdownRefCompany.current.contains(event.target)) {
        setDropdownOpenCompany(false);
      }
      if (dropdownRefProject.current && !dropdownRefProject.current.contains(event.target)) {
        setDropdownOpenProject(false);
      }
      if (dropdownRefSite.current && !dropdownRefSite.current.contains(event.target)) {
        setDropdownOpenSite(false);
      }
      if (dropdownRefWorkDesc.current && !dropdownRefWorkDesc.current.contains(event.target)) {
        setDropdownOpenWorkDesc(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/project/companies`);
      setCompanies(res.data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      showAlert("error", "Failed to fetch companies");
    }
  };

  const fetchProjectsForCompany = async (companyId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/project/projects-with-sites/${companyId}`);
      setProjects(res.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      showAlert("error", "Failed to fetch projects");
    }
  };

  const fetchWorkDescriptions = async (siteId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/project/work-descriptions-by-site/${siteId}`);
      setWorkDescOptions(res.data || []);
    } catch (error) {
      console.error("Error fetching work descriptions:", error);
      showAlert("error", "Failed to fetch work descriptions");
    }
  };

  const fetchReckonerData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/reckoner/reckoner/`);
      const data = res.data.success ? res.data.data : [];
      const updatedData = data.map((item) => {
        const completedQty = parseFloat(item.area_completed) || 0;
        const completedValue = parseFloat(item.completion_value) || 0;
        const poQty = parseFloat(item.po_quantity) || 0;
        const poValue = parseFloat(item.value) || 0;
        const balanceQty = poQty - completedQty;
        const balanceValue = poValue - completedValue;
        let work_status;
        if (completedQty === 0 || completedValue === 0) {
          work_status = "Pending";
        } else if (balanceQty <= 0 && balanceValue <= 0) {
          work_status = "Completed";
        } else {
          work_status = "In Progress";
        }
        return {
          ...item,
          work_status,
        };
      });
      setReckonerData(updatedData);
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to fetch reckoner data");
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompany(companyId);
    setDropdownOpenCompany(false);
    setSearchQueryCompany("");
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
    setDropdownOpenProject(false);
    setSearchQueryProject("");
  };

  const handleSiteSelect = (poNumber, siteId, siteName) => {
    setSelectedSitePo(poNumber);
    setSelectedSiteId(siteId);
    setSelectedSiteName(siteName);
    setDropdownOpenSite(false);
    setSearchQuerySite("");
  };

  const handleWorkDescSelect = (descId, descName) => {
    setSelectedWorkDesc({ desc_id: descId, desc_name: descName });
    setDropdownOpenWorkDesc(false);
    setSearchQueryWorkDesc("");
  };

  const fetchSiteInfo = async (poNumber) => {
    try {
      setLoadingSite(true);
      const res = await axios.get(`${API_BASE_URL}/reckoner/sites/${poNumber}`);
      if (res.data.success) {
        setSiteInfo(res.data.data);
      } else {
        const fallbackSite = siteOptions.find((option) => option.value === poNumber);
        setSiteInfo(
          fallbackSite
            ? {
                site_name: fallbackSite.site_name,
                site_id: fallbackSite.site_id,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error fetching site info:", error);
      const fallbackSite = siteOptions.find((option) => option.value === poNumber);
      setSiteInfo(
        fallbackSite
          ? {
              site_name: fallbackSite.site_name,
              site_id: fallbackSite.site_id,
            }
          : null
      );
    } finally {
      setLoadingSite(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  const groupDataByPoNumber = (data) => {
    const groups = {};
    data.forEach((item) => {
      if (!groups[item.po_number]) groups[item.po_number] = [];
      groups[item.po_number].push(item);
    });
    setPoGroups(Object.values(groups));
  };

  const handleSearchChangeCompany = (e) => setSearchQueryCompany(e.target.value.toLowerCase());

  const handleSearchChangeProject = (e) => setSearchQueryProject(e.target.value.toLowerCase());

  const handleSearchChangeSite = (e) => setSearchQuerySite(e.target.value.toLowerCase());

  const handleSearchChangeWorkDesc = (e) => setSearchQueryWorkDesc(e.target.value.toLowerCase());

  const closeGradeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowMaterialPlanning(false);
      setShowAssignIncharge(false);
      setShowMaterialDispatch(false);
      setIsModalClosing(false);
    }, 400);
  };

  const handleEdit = (record) => {
    setEditingId(record.rec_id);
    setEditingData({
      area_completed: record.area_completed,
      value: record.completion_value,
      work_status: record.work_status,
    });
  };

  const handleEditChange = (field, value) => {
    setEditingData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "area_completed") {
        const record = filteredData.find((item) => item.rec_id === editingId);
        if (record) {
          const poQty = parseFloat(record.po_quantity) || 0;
          let area = parseFloat(value) || 0;
          if (area > poQty) {
            showAlert("error", "Completed area cannot exceed PO quantity");
            area = poQty;
          }
          const rate = parseFloat(record.rate) || 0;
          newData.area_completed = area.toString();
          newData.value = (area * rate).toFixed(2);
          const poValue = parseFloat(record.value) || 0;
          const balanceQty = poQty - area;
          const balanceValue = poValue - (area * rate);
          if (area === 0) {
            newData.work_status = "Pending";
          } else if (balanceQty <= 0 && balanceValue <= 0) {
            newData.work_status = "Completed";
          } else {
            newData.work_status = "In Progress";
          }
        }
      }
      return newData;
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSubmit = async (rec_id) => {
    try {
      setSubmitting(true);
      const record = filteredData.find((item) => item.rec_id === rec_id);
      if (!record) {
        showAlert("error", "Record not found");
        return;
      }
      if (!createdBy) {
        showAlert("error", "User ID is required");
        return;
      }
      const area_completed = parseFloat(editingData.area_completed) || 0;
      const rate = parseFloat(record.rate) || 0;
      const value = parseFloat(editingData.value) || 0;
      const poQty = parseFloat(record.po_quantity) || 0;
      const poValue = parseFloat(record.value) || 0;
      const balance_area = poQty - area_completed;
      const balance_value = poValue - value;
      let work_status;
      if (area_completed === 0 || value === 0) {
        work_status = "Pending";
      } else if (balance_area <= 0 && balance_value <= 0) {
        work_status = "Completed";
      } else {
        work_status = "In Progress";
      }
      const payload = {
        rec_id,
        area_completed,
        rate,
        value,
        billed_area: 0, // Default value, adjust if needed
        billed_value: 0, // Default value, adjust if needed
        balance_area,
        balance_value,
        work_status,
        billing_status: "Not Billed", // Default value, adjust if needed
        created_by: createdBy, // Include decoded created_by
      };
      await axios.put(`${API_BASE_URL}/reckoner/completion_status/${rec_id}`, payload);
      showAlert("success", "Data updated successfully");
      await fetchReckonerData();
      setEditingId(null);
    } catch (error) {
      console.error(error);
      showAlert("error", error.response?.data?.message || "Failed to update data");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusTag = (status) => {
    const icon =
      status === "Completed" ? (
        <CalendarCheck className="w-4 h-4 text-green-600 mr-1" />
      ) : status === "In Progress" ? (
        <HardHat className="w-4 h-4 text-blue-600 mr-1" />
      ) : (
        <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
      );
    const color =
      status === "Completed"
        ? "bg-green-100 text-green-800"
        : status === "In Progress"
        ? "bg-blue-100 text-blue-800"
        : "bg-orange-100 text-orange-800";
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {status}
      </div>
    );
  };

  const calculateBalance = (record) => {
    const poQty = parseFloat(record.po_quantity) || 0;
    const completedQty = parseFloat(record.area_completed) || 0;
    const balanceQty = poQty - completedQty;
    const poValue = parseFloat(record.value) || 0;
    const completedValue = parseFloat(record.completion_value) || 0;
    const balanceValue = poValue - completedValue;
    return {
      qty: balanceQty.toFixed(2),
      value: balanceValue.toFixed(2),
    };
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.company_name.toLowerCase().includes(searchQueryCompany) 
  );

  const filteredProjects = projects.filter(
    (project) =>
      project.project_name.toLowerCase().includes(searchQueryProject)
  );

  const filteredSites = siteOptions.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuerySite)
  );

  const filteredWorkDescs = workDescOptions.filter(
    (option) =>
      option.desc_name.toLowerCase().includes(searchQueryWorkDesc)
  );

  const currentPoGroup = poGroups.find((group) => group[0]?.po_number === selectedSitePo) || [];

  return (
    <>
      {/* Modals remain the same */}
      {showAssignIncharge && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-400 p-4 ${
            isModalClosing ? "opacity-0" : "opacity-100"
          }`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className={`bg-white relative w-full max-w-7xl h-[750px] rounded-lg shadow-xl transform transition-all duration-400 ${
              isModalClosing
                ? "opacity-0 scale-90 -translate-y-4"
                : "opacity-100 scale-100 translate-y-0"
            } max-h-[90vh] overflow-auto`}
          >
            <AssignSiteIncharge selectedSite={{po_number: selectedSitePo, site_name: selectedSiteName, site_id: selectedSiteId}} />
            <div className="absolute top-4 right-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition duration-200 hover:shadow-md"
                onClick={closeGradeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showMaterialPlanning && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-400 p-4 ${
            isModalClosing ? "opacity-0" : "opacity-100"
          }`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className={`bg-white relative w-full max-w-7xl rounded-lg shadow-xl transform transition-all duration-400 ${
              isModalClosing
                ? "opacity-0 scale-90 -translate-y-4"
                : "opacity-100 scale-100 translate-y-0"
            } max-h-[90vh] overflow-auto`}
          >
            <MaterialPlanning selectedSite={{po_number: selectedSitePo, site_name: selectedSiteName, site_id: selectedSiteId}} />
            <div className="absolute top-4 right-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition duration-200 hover:shadow-md"
                onClick={closeGradeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showMaterialDispatch && (
        <div
          className={`fixed inset-0 flex justify-center items-center z-50 transition-opacity duration-400 p-4 ${
            isModalClosing ? "opacity-0" : "opacity-100"
          }`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className={`bg-white relative w-full max-w-7xl rounded-lg shadow-xl transform transition-all duration-400 ${
              isModalClosing
                ? "opacity-0 scale-90 -translate-y-4"
                : "opacity-100 scale-100 translate-y-0"
            } max-h-[90vh] overflow-auto`}
          >
            <MaterialDispatch selectedSite={{po_number: selectedSitePo, site_name: selectedSiteName, site_id: selectedSiteId}} />
            <div className="absolute top-4 right-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition duration-200 hover:shadow-md"
                onClick={closeGradeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
        {/* Alert Notification */}
        {alert.message && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-transform duration-300 transform ${
              alert.type === "error"
                ? "bg-red-50 text-red-800 border-l-4 border-red-500"
                : "bg-green-50 text-green-800 border-l-4 border-green-500"
            }`}
          >
            <div className="flex items-center">
              {alert.type === "error" ? (
                <AlertCircle className="w-5 h-5 mr-2" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              <span className="text-sm font-medium">{alert.message}</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Master For Primary Management</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Track and manage your project progress seamlessly
            </p>
          </div>

          {/* Selection Dropdowns */}
          <div className="mb-6 sm:mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Company Dropdown */}
            <div className="flex-1" ref={dropdownRefCompany}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
              <div className="relative max-w-md">
                {dropdownOpenCompany ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center px-3 py-2 border-b border-gray-200">
                      <Search className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQueryCompany}
                        onChange={handleSearchChangeCompany}
                        placeholder="Search companies..."
                        className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
                      />
                      <button
                        onClick={() => setDropdownOpenCompany(false)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCompanies.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">No matching companies found</div>
                      ) : (
                        filteredCompanies.map((company) => (
                          <div
                            key={company.company_id}
                            onClick={() => handleCompanySelect(company.company_id)}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
                              selectedCompany === company.company_id ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
                            }`}
                          >
                            <div className="font-medium">{company.company_name}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDropdownOpenCompany(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  >
                    <div>
                      {selectedCompany ? (
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {companies.find((comp) => comp.company_id === selectedCompany)?.company_name}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm sm:text-base">Select a company...</span>
                      )}
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Project Dropdown */}
            <div className="flex-1" ref={dropdownRefProject}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
              <div className="relative max-w-md">
                {dropdownOpenProject ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center px-3 py-2 border-b border-gray-200">
                      <Search className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQueryProject}
                        onChange={handleSearchChangeProject}
                        placeholder="Search projects..."
                        className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
                      />
                      <button
                        onClick={() => setDropdownOpenProject(false)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredProjects.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">No matching projects found</div>
                      ) : (
                        filteredProjects.map((project) => (
                          <div
                            key={project.project_id}
                            onClick={() => handleProjectSelect(project.project_id)}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
                              selectedProject === project.project_id ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
                            }`}
                          >
                            <div className="font-medium">{project.project_name}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDropdownOpenProject(true)}
                    disabled={!selectedCompany}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div>
                      {selectedProject ? (
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {projects.find((proj) => proj.project_id === selectedProject)?.project_name}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm sm:text-base">Select a project...</span>
                      )}
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Site Dropdown */}
            <div className="flex-1" ref={dropdownRefSite}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Site</label>
              <div className="relative max-w-md">
                {dropdownOpenSite ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center px-3 py-2 border-b border-gray-200">
                      <Search className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQuerySite}
                        onChange={handleSearchChangeSite}
                        placeholder="Search sites or PO numbers..."
                        className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
                      />
                      <button
                        onClick={() => setDropdownOpenSite(false)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredSites.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">No matching sites found</div>
                      ) : (
                        filteredSites.map((option) => (
                          <div
                            key={option.value}
                            onClick={() => handleSiteSelect(option.value, option.site_id, option.site_name)}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
                              selectedSitePo === option.value ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDropdownOpenSite(true)}
                    disabled={!selectedProject}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div>
                      {selectedSitePo ? (
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {siteOptions.find((opt) => opt.value === selectedSitePo)?.site_name} (PO: {selectedSitePo})
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm sm:text-base">Select a site...</span>
                      )}
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Work Description Dropdown */}
            <div className="flex-1" ref={dropdownRefWorkDesc}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Work Description</label>
              <div className="relative max-w-md">
                {dropdownOpenWorkDesc ? (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center px-3 py-2 border-b border-gray-200">
                      <Search className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        autoFocus
                        value={searchQueryWorkDesc}
                        onChange={handleSearchChangeWorkDesc}
                        placeholder="Search work descriptions..."
                        className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
                      />
                      <button
                        onClick={() => setDropdownOpenWorkDesc(false)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredWorkDescs.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">No matching work descriptions found</div>
                      ) : (
                        filteredWorkDescs.map((option) => (
                          <div
                            key={option.desc_id}
                            onClick={() => handleWorkDescSelect(option.desc_id, option.desc_name)}
                            className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
                              selectedWorkDesc?.desc_id === option.desc_id ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
                            }`}
                          >
                            <div className="font-medium">{option.desc_name}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDropdownOpenWorkDesc(true)}
                    disabled={!selectedSiteId}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div>
                      {selectedWorkDesc ? (
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {selectedWorkDesc.desc_name}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm sm:text-base">Select work description...</span>
                      )}
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 sm:mb-8 flex flex-wrap gap-4">
            <button
              onClick={() => setShowAssignIncharge(true)}
              disabled={!selectedSiteId}
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all flex items-center text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Assign Site Incharge
            </button>
            <button
              onClick={() => setShowMaterialPlanning(true)}
              disabled={!selectedSiteId}
              className="px-4 py-3 bg-purple-600 text-white rounded-xl shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all flex items-center text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="h-5 w-5 mr-2" />
              Material Planning
            </button>
            <button
              onClick={() => setShowMaterialDispatch(true)}
              disabled={!selectedSiteId}
              className="px-4 py-3 bg-teal-600 text-white rounded-xl shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all flex items-center text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Truck className="h-5 w-5 mr-2" />
              Material Dispatch
            </button>
          </div>

          {/* Assigned Incharges */}
          {selectedSiteId && (
            <div className="mb-6 sm:mb-8">
              <ViewAssignedIncharges selectedSite={{ po_number: selectedSitePo, site_name: selectedSiteName, site_id: selectedSiteId }} />
            </div>
          )}

          {/* Data Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 text-center text-gray-500">
              No reckoner data found for the selected criteria.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              {/* Mobile View: Card Layout */}
              <div className="md:hidden divide-y divide-gray-200">
                {filteredData.map((r) => {
                  const balance = calculateBalance(r);
                  return (
                    <div key={r.rec_id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{r.item_id}</div>
                          <div className="text-xs text-gray-500">
                            {r.category_name} / {r.subcategory_name}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {editingId === r.rec_id ? (
                            <>
                              <button
                                onClick={() => handleSubmit(r.rec_id)}
                                disabled={submitting}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                        <span className="truncate">{r.work_descriptions}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700">PO Details</div>
                          <div>Qty: {r.po_quantity} {r.uom}</div>
                          <div>Rate: {r.rate}</div>
                          <div>Value: {r.value}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Completion</div>
                          {editingId === r.rec_id ? (
                            <>
                              <input
                                type="text"
                                value={editingData.area_completed}
                                onChange={(e) => handleEditChange("area_completed", e.target.value)}
                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                placeholder="Area"
                              />
                              <div className="mt-2">Value: {editingData.value || "0.00"}</div>
                            </>
                          ) : (
                            <>
                              <div>Area: {r.area_completed}</div>
                              <div>Value: {r.completion_value}</div>
                            </>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Balance</div>
                          <div>Qty: {balance.qty} {r.uom}</div>
                          <div>Value: {balance.value}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Status</div>
                          <div className="space-y-2">
                            {editingId === r.rec_id
                              ? renderStatusTag(editingData.work_status)
                              : renderStatusTag(r.work_status)}
                            <div className="text-xs text-gray-500">
                              By: {r.created_by_name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Updated: {r.updated_at ? new Date(r.updated_at).toLocaleString() : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop: Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider" rowSpan={2}>
                        Item
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider" rowSpan={2}>
                        Description
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider" colSpan={3}>
                        PO Details
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider" colSpan={2}>
                        Completion
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider" colSpan={2}>
                        Balance
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider" rowSpan={2}>
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider" rowSpan={2}>
                        Action
                      </th>
                    </tr>
                    <tr className="bg-indigo-500">
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white">Rate</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white">Value</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white">Area</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white">Value</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white">Qty</th>
                      <th className="px-2 py-2 text-center text-xs font-semibold text-white">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((r) => {
                      const balance = calculateBalance(r);
                      return (
                        <tr key={r.rec_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            <div>{r.item_id}</div>
                            <div className="text-xs text-gray-500">
                              {r.category_name} / {r.subcategory_name}
                            </div>
                          </td>
                          <td className="px-4 py-4 max-w-xs text-sm text-gray-900">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-indigo-600" />
                              <span className="truncate">{r.work_descriptions}</span>
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center text-sm">{r.po_quantity} {r.uom}</td>
                          <td className="px-2 py-4 text-center text-sm">{r.rate}</td>
                          <td className="px-2 py-4 text-center text-sm">{r.value}</td>
                          {editingId === r.rec_id ? (
                            <>
                              <td className="px-2 py-4 text-center">
                                <input
                                  type="text"
                                  value={editingData.area_completed}
                                  onChange={(e) => handleEditChange("area_completed", e.target.value)}
                                  className="w-20 p-1 border border-gray-300 rounded text-sm text-center"
                                  placeholder="Area"
                                />
                              </td>
                              <td className="px-2 py-4 text-center text-sm">{editingData.value || "0.00"}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-2 py-4 text-center text-sm">{r.area_completed}</td>
                              <td className="px-2 py-4 text-center text-sm">{r.completion_value}</td>
                            </>
                          )}
                          <td className="px-2 py-4 text-center text-sm">{balance.qty} {r.uom}</td>
                          <td className="px-2 py-4 text-center text-sm">{balance.value}</td>
                          <td className="px-4 py-4 text-center text-sm space-y-2">
                            {editingId === r.rec_id
                              ? renderStatusTag(editingData.work_status)
                              : renderStatusTag(r.work_status)}
                            <div className="text-xs text-gray-500">
                              Updated By: {r.created_by_name || ""}
                            </div>
                            <div className="text-xs text-gray-500">
                              Updated at: {r.updated_at ? new Date(r.updated_at).toLocaleString() : ""}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-sm">
                            {editingId === r.rec_id ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleSubmit(r.rec_id)}
                                  disabled={submitting}
                                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                                >
                                  <Save className="mr-1 h-4 w-4" /> Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700"
                                >
                                  <X className="mr-1 h-4 w-4" /> Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEdit(r)}
                                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                <Edit className="mr-1 h-4 w-4" /> Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectList;

import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { PlusCircle, Trash2, Loader2, CheckCircle, Eye } from "lucide-react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useParams } from "react-router-dom";

// Custom function to format date from YYYY-MM-DD to DD-MMMM-YYYY
const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return "N/A";
  }
};

// Custom function to format date from DD-MMMM-YYYY to YYYY-MM-DD for input
const parseDisplayDate = (displayDate) => {
  if (!displayDate) return "";
  try {
    const [day, month, year] = displayDate.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = monthNames.indexOf(month);
    if (monthIndex === -1) return "";
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${day}`;
  } catch {
    return "";
  }
};

const SupplyMaterialPlanning = () => {
  const { encodedUserId } = useParams();
  let userId = null;
  try {
    if (encodedUserId) {
      userId = atob(encodedUserId);
    }
  } catch (error) {
    console.error("Error decoding userId:", error);
  }

  const [allSites, setAllSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [materialAssignments, setMaterialAssignments] = useState([
    {
      item_id: "",
      uom_id: "",
      quantity: "",
      production_cost_per_uom: "",
      production_cost: "0.00",
      supply_cost_per_uom: "",
      supply_cost: "0.00",
      target_date: "",
    },
  ]);
  const [assignedMaterials, setAssignedMaterials] = useState([]);
  const [loading, setLoading] = useState({
    companies: false,
    projects: false,
    sites: false,
    materials: false,
    uoms: false,
    submitting: false,
    assignedMaterials: false,
  });
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [currentMatIndex, setCurrentMatIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      setLoading((prev) => ({ ...prev, companies: true }));
      const response = await axios.get(`${API_BASE_URL}/supply/companies`);
      const fetchedCompanies = Array.isArray(response.data) ? response.data : [];
      setCompanies(fetchedCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };

  // Fetch projects and sites
  const fetchProjectsAndSites = async (companyId) => {
    try {
      setLoading((prev) => ({ ...prev, projects: true, sites: true }));
      const response = await axios.get(`${API_BASE_URL}/supply/sites-by-company/${companyId}`);
      const sitesData = Array.isArray(response.data.data) ? response.data.data : [];
      setAllSites(sitesData);

      // Extract unique projects
      const uniqueProjects = Array.from(
        new Map(sitesData.map((site) => [site.pd_id, { pd_id: site.pd_id, project_name: site.project_name }])).values()
      );
      setProjects(uniqueProjects);

      if (uniqueProjects.length === 1) {
        setSelectedProject({
          value: uniqueProjects[0].pd_id,
          label: uniqueProjects[0].project_name || "Unknown Project",
        });
      } else {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error("Error fetching projects and sites:", error);
      setError("Failed to load projects and sites. Please try again.");
      setProjects([]);
      setAllSites([]);
    } finally {
      setLoading((prev) => ({ ...prev, projects: false, sites: false }));
    }
  };

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      setLoading((prev) => ({ ...prev, materials: true }));
      const response = await axios.get(`${API_BASE_URL}/material/materials`);
      setMaterials(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setError("Failed to load materials. Please try again.");
      setMaterials([]);
    } finally {
      setLoading((prev) => ({ ...prev, materials: false }));
    }
  };

  // Fetch UOMs
  const fetchUoms = async () => {
    try {
      setLoading((prev) => ({ ...prev, uoms: true }));
      const response = await axios.get(`${API_BASE_URL}/material/uom`);
      setUoms(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching UOMs:", error);
      setError("Failed to load UOMs. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, uoms: false }));
    }
  };

  // Fetch assigned materials for modal
  const fetchAssignedMaterials = async (site_id) => {
    try {
      setLoading((prev) => ({ ...prev, assignedMaterials: true }));
      setModalError(null);
      const response = await axios.get(`${API_BASE_URL}/supply/assigned-materials?site_id=${site_id}`);
      const assignedMaterials = Array.isArray(response.data?.data) ? response.data.data : [];
      setAssignedMaterials(assignedMaterials);
    } catch (error) {
      console.error("Error fetching assigned materials:", error);
      setModalError("Failed to load assigned materials. Please try again.");
      setAssignedMaterials([]);
    } finally {
      setLoading((prev) => ({ ...prev, assignedMaterials: false }));
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchMaterials();
    fetchUoms();
  }, []);

  useEffect(() => {
    if (selectedCompany?.value) {
      fetchProjectsAndSites(selectedCompany.value);
    } else {
      setProjects([]);
      setAllSites([]);
      setSelectedProject(null);
      setSelectedSite(null);
      setMaterialAssignments([
        {
          item_id: "",
          uom_id: "",
          quantity: "",
          production_cost_per_uom: "",
          production_cost: "0.00",
          supply_cost_per_uom: "",
          supply_cost: "0.00",
          target_date: "",
        },
      ]);
      setAssignedMaterials([]);
      setError(null);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject?.value) {
      const projectSites = allSites.filter((site) => site.pd_id === selectedProject.value);
      setSites(projectSites);
      if (projectSites.length === 1) {
        setSelectedSite({
          value: projectSites[0].site_id,
          label: `${projectSites[0].site_name || "Unknown Site"} (PO: ${projectSites[0].po_number || "N/A"})`,
        });
      } else {
        setSelectedSite(null);
      }
    } else {
      setSites([]);
      setSelectedSite(null);
      setMaterialAssignments([
        {
          item_id: "",
          uom_id: "",
          quantity: "",
          production_cost_per_uom: "",
          production_cost: "0.00",
          supply_cost_per_uom: "",
          supply_cost: "0.00",
          target_date: "",
        },
      ]);
      setAssignedMaterials([]);
    }
    setError(null);
  }, [selectedProject, allSites]);

  const handleMaterialChange = (matIndex, e) => {
    const { name, value } = e.target;
    const newAssignments = [...materialAssignments];
    const mat = { ...newAssignments[matIndex] };
    mat[name] = value;

    // Auto-calculate totals when quantity or per_uom changes
    if (name === "quantity" || name === "production_cost_per_uom") {
      const qty = parseInt(mat.quantity) || 0;
      const perUom = parseFloat(mat.production_cost_per_uom) || 0;
      mat.production_cost = (qty * perUom).toFixed(2);
    }
    if (name === "quantity" || name === "supply_cost_per_uom") {
      const qty = parseInt(mat.quantity) || 0;
      const perUom = parseFloat(mat.supply_cost_per_uom) || 0;
      mat.supply_cost = (qty * perUom).toFixed(2);
    }

    newAssignments[matIndex] = mat;
    setMaterialAssignments(newAssignments);
    setError(null);
  };

  const handleItemSelect = (matIndex, selectedOption) => {
    const value = selectedOption && selectedOption.value !== "N/A" ? selectedOption.value : "";
    const newAssignments = [...materialAssignments];
    newAssignments[matIndex].item_id = value;
    setMaterialAssignments(newAssignments);
    if (!value) {
      setError(`Please select a valid material for Row ${matIndex + 1}.`);
    } else {
      setError(null);
    }
  };

  const handleAddMaterial = () => {
    setMaterialAssignments((prev) => [
      ...prev,
      {
        item_id: "",
        uom_id: "",
        quantity: "",
        production_cost_per_uom: "",
        production_cost: "0.00",
        supply_cost_per_uom: "",
        supply_cost: "0.00",
        target_date: "",
      },
    ]);
    setError(null);
  };

  const handleRemoveMaterial = (matIndex) => {
    setMaterialAssignments((prev) => {
      if (prev.length <= 1) {
        setError(`At least one material assignment is required.`);
        return prev;
      }
      return prev.filter((_, i) => i !== matIndex);
    });
  };

  const calculateTotalProductionCost = () => {
    return materialAssignments
      .reduce((total, mat) => {
        return total + parseFloat(mat.production_cost || 0);
      }, 0)
      .toFixed(2);
  };

  const calculateTotalSupplyCost = () => {
    return materialAssignments
      .reduce((total, mat) => {
        return total + parseFloat(mat.supply_cost || 0);
      }, 0)
      .toFixed(2);
  };

  const handleAddNewMaterial = async (inputValue, matIndex) => {
    if (!inputValue.trim()) {
      setError("Material name is required.");
      return;
    }

    try {
      setAddingMaterial(true);
      const response = await axios.post(`${API_BASE_URL}/material/add-material`, {
        item_name: inputValue.trim(),
      });

      if (response.data?.status === "success" && response.data?.data?.item_id) {
        await fetchMaterials();
        const newItemId = response.data.data.item_id;
        const newAssignments = [...materialAssignments];
        newAssignments[matIndex].item_id = newItemId;
        setMaterialAssignments(newAssignments);

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Material Added!",
          text: "New material has been added and selected.",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          background: "#ecfdf5",
          iconColor: "#10b981",
        });
      } else {
        setError(response.data?.message || "Failed to add material.");
      }
    } catch (error) {
      console.error("Error adding material:", error);
      setError(error.response?.data?.message || "Failed to add material.");
    } finally {
      setAddingMaterial(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading((prev) => ({ ...prev, submitting: true }));
      setError(null);

      if (!selectedCompany?.value) {
        setError("Please select a company.");
        return;
      }
      if (!selectedProject?.value) {
        setError("Please select a project.");
        return;
      }
      if (!selectedSite?.value) {
        setError("Please select a site.");
        return;
      }

      const validationErrors = [];
      const materialCounts = {};
      const materials = materialAssignments;

      // Count occurrences of each item_id
      materials.forEach((row) => {
        if (row.item_id && row.item_id !== "N/A" && row.item_id.trim() !== "") {
          materialCounts[row.item_id] = (materialCounts[row.item_id] || 0) + 1;
        }
      });

      // Validate for three or more identical materials
      Object.entries(materialCounts).forEach(([item_id, count]) => {
        if (count >= 3) {
          const materialName = materials.find((mat) => mat.item_id === item_id)?.item_id || item_id;
          validationErrors.push(
            `Material ${materialName} is assigned ${count} times. A maximum of two assignments per material is allowed.`
          );
        }
      });

      // Validate other fields
      materials.forEach((row, index) => {
        if (!row.item_id || row.item_id === "N/A" || row.item_id.trim() === "") {
          validationErrors.push(`Row ${index + 1}: Material is required and must be a valid material ID`);
        }
        if (!row.uom_id) {
          validationErrors.push(`Row ${index + 1}: Unit of Measure is required`);
        }
        if (!row.quantity) {
          validationErrors.push(`Row ${index + 1}: Quantity is required`);
        } else if (isNaN(row.quantity) || parseInt(row.quantity) <= 0) {
          validationErrors.push(`Row ${index + 1}: Quantity must be a positive integer`);
        }
        if (!row.production_cost_per_uom) {
          validationErrors.push(`Row ${index + 1}: Production Cost per UOM is required`);
        } else if (isNaN(row.production_cost_per_uom) || parseFloat(row.production_cost_per_uom) < 0) {
          validationErrors.push(`Row ${index + 1}: Production Cost per UOM must be a non-negative number`);
        }
        if (!row.supply_cost_per_uom) {
          validationErrors.push(`Row ${index + 1}: Supply Cost per UOM is required`);
        } else if (isNaN(row.supply_cost_per_uom) || parseFloat(row.supply_cost_per_uom) < 0) {
          validationErrors.push(`Row ${index + 1}: Supply Cost per UOM must be a non-negative number`);
        }
        if (!row.target_date) {
          validationErrors.push(`Row ${index + 1}: Target Date is required`);
        } else if (new Date(row.target_date) < new Date().setHours(0, 0, 0, 0)) {
          validationErrors.push(`Row ${index + 1}: Target Date must be today or in the future`);
        }
      });

      if (validationErrors.length > 0) {
        setError(validationErrors.join("<br />"));
        return;
      }

      const payload = materials.map((row) => ({
        pd_id: selectedProject.value,
        site_id: selectedSite.value,
        item_id: row.item_id,
        uom_id: parseInt(row.uom_id),
        quantity: parseInt(row.quantity),
        production_cost_per_uom: parseFloat(row.production_cost_per_uom),
        production_cost: parseFloat(row.production_cost),
        supply_cost_per_uom: parseFloat(row.supply_cost_per_uom),
        supply_cost: parseFloat(row.supply_cost),
        created_by: userId ? parseInt(userId) : null,
        target_date: row.target_date || null,
      }));

      if (payload.length === 0) {
        setError("Please add at least one material assignment.");
        return;
      }

      await axios.post(`${API_BASE_URL}/supply/assign-material`, payload);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Materials Assigned Successfully!",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      // Reset material assignments
      setMaterialAssignments([
        {
          item_id: "",
          uom_id: "",
          quantity: "",
          production_cost_per_uom: "",
          production_cost: "0.00",
          supply_cost_per_uom: "",
          supply_cost: "0.00",
          target_date: "",
        },
      ]);
    } catch (error) {
      console.error("Error submitting material assignments:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to assign materials. Please check the data and try again.";
      const detailedErrors = error.response?.data?.errors ? error.response.data.errors.join("<br />") : errorMessage;
      await Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        html: detailedErrors,
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
        background: "#fef2f2",
        iconColor: "#dc2626",
      });
      setError(detailedErrors);
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleOpenModal = () => {
    if (selectedSite?.value) {
      fetchAssignedMaterials(selectedSite.value);
      setShowModal(true);
    } else {
      setError("Please select a site to view planned materials.");
    }
  };

  const isFormEnabled = selectedCompany && selectedProject && selectedSite;

  const companyOptions = companies.map((company) => ({
    value: company.company_id,
    label: company.company_name || "Unknown Company",
  }));

  const projectOptions = projects.map((project) => ({
    value: project.pd_id,
    label: project.project_name || "Unknown Project",
  }));

  const siteOptions = sites.map((site) => ({
    value: site.site_id,
    label: `${site.site_name || "Unknown Site"} (PO: ${site.po_number || "N/A"})`,
  }));

  const materialOptions = Array.isArray(materials)
    ? materials.map((material) => ({
        value: material.item_id,
        label: material.item_name,
      }))
    : [];

  const uomOptions = Array.isArray(uoms)
    ? uoms.map((uom) => ({
        value: uom.uom_id,
        label: uom.uom_name,
      }))
    : [];

  const CustomCreateLabel = ({ inputValue }) => (
    <div className="flex items-center justify-between px-2 py-1">
      <span>Add "{inputValue}"</span>
      <button
        type="button"
        className="ml-2 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        onClick={() => handleAddNewMaterial(inputValue, currentMatIndex)}
        disabled={addingMaterial}
      >
        {addingMaterial ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
      </button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Supply Material Planning</h2>
          <p className="text-gray-600 text-lg">Assign supply materials to your project sites efficiently</p>
        </div>

        {(loading.companies || loading.projects || loading.materials || loading.uoms) ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading resources...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              {error && (
                <div
                  className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm"
                  dangerouslySetInnerHTML={{ __html: error }}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <Select
                  options={companyOptions}
                  value={selectedCompany}
                  onChange={(option) => setSelectedCompany(option)}
                  isSearchable
                  isClearable
                  isDisabled={loading.companies}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Select Company..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost Center</label>
                <Select
                  options={projectOptions}
                  value={selectedProject}
                  onChange={(option) => setSelectedProject(option)}
                  isSearchable
                  isClearable
                  isDisabled={!selectedCompany || loading.projects}
                  className="text-sm"
                  classNamePrefix="select"
                  placeholder="Select Cost Center..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
                <div className="relative">
                  <Select
                    options={siteOptions}
                    value={selectedSite}
                    onChange={(option) => setSelectedSite(option)}
                    isSearchable
                    isClearable
                    isDisabled={!selectedProject || loading.sites}
                    className="text-sm"
                    classNamePrefix="select"
                    placeholder="Select Site..."
                  />
                  {loading.sites && selectedProject && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin" />
                  )}
                </div>
              </div>
            </div>

            {selectedSite && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Material Assignments</h3>
                  {materialAssignments.map((mat, matIndex) => (
                    <div key={matIndex} className="border-b pb-6 mb-6 last:border-b-0 last:mb-0">
                      <div className="space-y-6">
                        {/* First Block: Target Date, Material, UOM, Quantity */}
                        <div className="grid grid-cols-12 gap-4">
                          <div className="col-span-3 md:col-span-3 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                            <input
                              type="date"
                              name="target_date"
                              value={mat.target_date}
                              onChange={(e) => handleMaterialChange(matIndex, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                              disabled={!isFormEnabled}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {mat.target_date ? formatDateToDisplay(mat.target_date) : "Select a date"}
                            </div>
                          </div>
                          <div className="col-span-5 md:col-span-5 lg:col-span-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Material #{matIndex + 1}
                            </label>
                            <CreatableSelect
                              options={materialOptions}
                              value={materialOptions.find((opt) => opt.value === mat.item_id) || null}
                              onChange={(opt) => {
                                setCurrentMatIndex(matIndex);
                                handleItemSelect(matIndex, opt);
                              }}
                              formatCreateLabel={(inputValue) => <CustomCreateLabel inputValue={inputValue} />}
                              isSearchable
                              isClearable
                              isDisabled={!isFormEnabled || addingMaterial}
                              className="text-sm"
                              classNamePrefix="select"
                              placeholder="Select or type material..."
                            />
                          </div>
                          <div className="col-span-2 md:col-span-2 lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                            <Select
                              options={uomOptions}
                              value={uomOptions.find((opt) => opt.value === mat.uom_id) || null}
                              onChange={(opt) =>
                                handleMaterialChange(matIndex, {
                                  target: { name: "uom_id", value: opt ? opt.value : "" },
                                })
                              }
                              isSearchable
                              isClearable
                              isDisabled={!isFormEnabled}
                              className="text-sm"
                              classNamePrefix="select"
                              placeholder="Select UOM..."
                            />
                          </div>
                          <div className="col-span-2 md:col-span-2 lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              name="quantity"
                              value={mat.quantity}
                              onChange={(e) => handleMaterialChange(matIndex, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                              disabled={!isFormEnabled}
                              min="1"
                            />
                          </div>
                        </div>

                        {/* Second Block: Production Cost per UOM and Production Cost */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cost per UOM (Production) (₹)
                            </label>
                            <input
                              type="number"
                              name="production_cost_per_uom"
                              value={mat.production_cost_per_uom}
                              onChange={(e) => handleMaterialChange(matIndex, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                              disabled={!isFormEnabled}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Production Cost (₹)</label>
                            <input
                              type="number"
                              name="production_cost"
                              value={mat.production_cost}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-sm cursor-not-allowed"
                              disabled
                            />
                          </div>
                        </div>

                        {/* Third Block: Supply Cost per UOM and Supply Cost */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cost per UOM (Supply) (₹)
                            </label>
                            <input
                              type="number"
                              name="supply_cost_per_uom"
                              value={mat.supply_cost_per_uom}
                              onChange={(e) => handleMaterialChange(matIndex, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                              disabled={!isFormEnabled}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supply Cost (₹)</label>
                            <input
                              type="number"
                              name="supply_cost"
                              value={mat.supply_cost}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md text-sm cursor-not-allowed"
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(matIndex)}
                        disabled={materialAssignments.length <= 1 || !isFormEnabled}
                        className={`mt-4 p-2 rounded-md ${
                          materialAssignments.length <= 1 || !isFormEnabled
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                        title={materialAssignments.length <= 1 ? "At least one material is required" : "Remove this entry"}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <div className="mt-6 flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-700">
                      Total Production Cost: ₹{calculateTotalProductionCost()} | Total Supply Cost: ₹
                      {calculateTotalSupplyCost()}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                      disabled={!isFormEnabled}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Material
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenModal}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                      disabled={!isFormEnabled}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Planned Materials
                    </button>
                  </div>
                </div>

                <div className="flex justify-end p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
                  <button
                    type="submit"
                    disabled={loading.submitting || !isFormEnabled}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading.submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Assign Materials
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Modal for Viewing Planned Materials */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Planned Materials</h3>
                <div className="mb-6 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Company:</span> {selectedCompany?.label || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Cost Center:</span> {selectedProject?.label || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Site:</span> {selectedSite?.label || "N/A"}
                  </p>
                </div>

                {modalError && (
                  <div
                    className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm mb-6"
                    dangerouslySetInnerHTML={{ __html: modalError }}
                  />
                )}

                {loading.assignedMaterials ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    <p className="text-gray-600 ml-2">Loading material assignments...</p>
                  </div>
                ) : assignedMaterials.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-md">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Target Date</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Material</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">UOM</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Production Cost per UOM (₹)
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Production Cost (₹)</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Supply Cost per UOM (₹)</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Supply Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedMaterials.map((mat, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {formatDateToDisplay(mat.target_date) || "N/A"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{mat.item_name || mat.item_id}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{mat.uom_name || "N/A"}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{mat.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{mat.production_cost_per_uom}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{mat.production_cost}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{mat.supply_cost_per_uom}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{mat.supply_cost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">No materials assigned to this site.</div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .select__control {
          border-color: #d1d5db;
          min-height: 38px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .select__control--is-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .select__menu {
          z-index: 10;
          border-radius: 6px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .select__option--is-selected {
          background-color: #3b82f6;
        }
        .select__option--is-focused {
          background-color: #e6f0ff;
        }
      `}</style>
    </div>
  );
};

export default SupplyMaterialPlanning;
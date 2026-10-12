import { API_BASE_URL } from "../config/api.js";



import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { X, FolderPlus, Loader2, Plus, Edit, PlusCircle, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const ProjectCreation = ({ companyId, onClose, onProjectCreated }) => {
  const { encodedUserId } = useParams(); // Extract encodedUserId from URL (e.g., /master-po/Mg==)
const [formData, setFormData] = useState({
    project_name: "",
    site_name: "",
    po_number: "",
    po_date: "",          // NEW
    start_date: "",
    end_date: "",
    incharge_type: "",
    location_id: "",
    new_location_name: "",
    reckoner_type_id: "",
  });

  const [rows, setRows] = useState([{ emp_id: "", from_date: "", to_date: "" }]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState({
    initial: false,
    employees: false,
    submitting: false,
  });
  const [companyName, setCompanyName] = useState("");
  const [siteIncharges, setSiteIncharges] = useState([]);
  const [projects, setProjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [reckonerTypes, setReckonerTypes] = useState([]);
  const [isNewProject, setIsNewProject] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);
  const [isCustomPoNumber, setIsCustomPoNumber] = useState(false);
  const [error, setError] = useState(null);

  // Decode userId from Base64 (e.g., "Mg==" -> "2")
  const decodedCreatedBy = encodedUserId ? atob(encodedUserId) : null;

  // Fetch all initial data
  const fetchData = async () => {
    try {
      setLoading((prev) => ({ ...prev, initial: true }));
      const [
        companyResponse,
        siteInchargesResponse,
        projectsResponse,
        locationsResponse,
        reckonerTypesResponse,
        employeesResponse,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/project/companies/${companyId}`),
        axios.get(`${API_BASE_URL}/project/site-incharges`),
        axios.get(`${API_BASE_URL}/project/projects/${companyId}`),
        axios.get(`${API_BASE_URL}/project/locations`),
        axios.get(`${API_BASE_URL}/project/reckoner-types`),
        axios.get(`${API_BASE_URL}/material/employees`),
      ]);

      setCompanyName(companyResponse.data.company_name || "Unknown Company");
      setSiteIncharges(siteInchargesResponse.data || []);
      setProjects(projectsResponse.data || []);
      setLocations(locationsResponse.data || []);
      setReckonerTypes(reckonerTypesResponse.data || []);
      setEmployees(employeesResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load necessary data. Please try again later.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch data. Please try again.",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading((prev) => ({ ...prev, initial: false }));
    }
  };

  // Fetch next PO number when reckoner type changes
  useEffect(() => {
    const fetchNextPoNumber = async () => {
      if (formData.reckoner_type_id === "1" || formData.reckoner_type_id === "3") {
        if (!isCustomPoNumber) {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/project/next-po-number/${formData.reckoner_type_id}`
            );
            setFormData((prev) => ({ ...prev, po_number: response.data.po_number }));
          } catch (error) {
            const prefix = formData.reckoner_type_id === "1" ? "SA" : "NA";
            setFormData((prev) => ({ ...prev, po_number: `${prefix}0000000001` }));
            setError(`Failed to fetch next PO number. Using default ${prefix}0000000001.`);
          }
        }
      } else {
        setFormData((prev) => ({ ...prev, po_number: "" }));
      }
    };

    if (formData.reckoner_type_id) {
      fetchNextPoNumber();
    }
  }, [formData.reckoner_type_id, isCustomPoNumber]);

  // Initial data load
  useEffect(() => {
    if (companyId) {
      fetchData();
    } else {
      setError("No company selected. Please select a company first.");
      Swal.fire({
        icon: "warning",
        title: "No Company Selected",
        text: "Please select a company before creating a project.",
        confirmButtonColor: "#3b82f6",
      });
      onClose();
    }
  }, [companyId, onClose]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [name]: value };
    setRows(updatedRows);
    setError(null);
  };

  const handleAddRow = () => {
    setRows([...rows, { emp_id: "", from_date: "", to_date: "" }]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length <= 1) {
      setError("At least one incharge assignment is required.");
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const toggleNewProjectInput = () => {
    setIsNewProject(!isNewProject);
    setFormData({ ...formData, project_name: "" });
  };

  const toggleNewLocationInput = () => {
    setIsNewLocation(!isNewLocation);
    setFormData({ ...formData, location_id: "", new_location_name: "" });
  };

  const toggleCustomPoNumber = () => {
    setIsCustomPoNumber(!isCustomPoNumber);
    setFormData({ ...formData, po_number: "" });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submitting: true }));
    setError(null);

    try {
      // Validate form data
      const validationErrors = [];
      if (!formData.project_name) validationErrors.push("Cost Center is required");
      if (!formData.site_name) validationErrors.push("Site Name is required");
      if (!formData.po_number) validationErrors.push("PO Number is required");
      if (!formData.po_date) validationErrors.push("PO Date is required");   // NEW
      if (!formData.start_date) validationErrors.push("Start Date is required");
      if (!formData.incharge_type) validationErrors.push("Incharge Type is required");
      if (!formData.location_id && !formData.new_location_name) {
        validationErrors.push("Either Location or New Location Name is required");
      }
      if (!formData.reckoner_type_id) validationErrors.push("Reckoner Type is required");
      if (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
        validationErrors.push("Tentative End Date must be after Start Date");
      }
      if (!decodedCreatedBy) validationErrors.push("Created by user ID is missing from URL");

      // Validate incharge assignments if incharge_type is selected
      let inchargeAssignments = [];
      if (formData.incharge_type) {
        rows.forEach((row, index) => {
          if (!row.emp_id) validationErrors.push(`Row ${index + 1}: Incharge Name is required`);
          if (!row.from_date) validationErrors.push(`Row ${index + 1}: From Date is required`);
          if (!row.to_date) validationErrors.push(`Row ${index + 1}: To Date is required`);
          if (row.from_date && row.to_date && new Date(row.to_date) < new Date(row.from_date)) {
            validationErrors.push(`Row ${index + 1}: To Date must be after From Date`);
          }
        });

        if (validationErrors.length > 0) {
          setError(validationErrors.join("<br />"));
          setLoading((prev) => ({ ...prev, submitting: false }));
          return;
        }

        inchargeAssignments = rows.map((row) => ({
          emp_id: row.emp_id,
          from_date: row.from_date,
          to_date: row.to_date || null, // Handle to_date if optional in future
        }));
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join("<br />"));
        setLoading((prev) => ({ ...prev, submitting: false }));
        return;
      }

      // Prepare payload, send null for empty end_date (updated: add created_by)
    const projectData = {
        project_type: "service",
        company_id: companyId,
        project_name: formData.project_name,
        site_name: formData.site_name,
        po_number: formData.po_number,
        po_date: formData.po_date,   // NEW
        start_date: formData.start_date,
        end_date: formData.end_date && formData.end_date.trim() !== '' ? formData.end_date : null,
        incharge_type: formData.incharge_type,
        location_id: isNewLocation ? undefined : formData.location_id,
        new_location_name: isNewLocation ? formData.new_location_name : undefined,
        reckoner_type_id: formData.reckoner_type_id,
        incharge_assignments: inchargeAssignments.length > 0 ? inchargeAssignments : undefined,
        created_by: decodedCreatedBy,
      };

      // Submit data
      const response = await axios.post(`${API_BASE_URL}/project/create-project-site`, projectData);

      // Reset form and show success
   setFormData({
        project_name: "",
        site_name: "",
        po_number: "",
        po_date: "",          // NEW
        start_date: "",
        end_date: "",
        incharge_type: "",
        location_id: "",
        new_location_name: "",
        reckoner_type_id: "",
      });

      setRows([{ emp_id: "", from_date: "", to_date: "" }]);
      setIsNewProject(false);
      setIsNewLocation(false);
      setIsCustomPoNumber(false);

      await fetchData();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Project ${formData.project_name} created successfully.`,
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#ef4444",
        confirmButtonText: "View projects",
        cancelButtonText: "Stay here",
      }).then((result) => {
        if (result.isConfirmed && onProjectCreated) {
          onProjectCreated(companyId);
        } else {
          onClose();
        }
      });
    } catch (error) {
      console.error("Error creating project:", error);
      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create project. Please try again."
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to create project.",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-opacity-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FolderPlus className="text-indigo-600 h-7 w-7" />
            <h2 className="text-2xl  text-gray-800">
             Create Site for  <span className="font-bold">{companyName} </span>company
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="text-gray-500 h-5 w-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg"
            dangerouslySetInnerHTML={{ __html: error }}
          />
        )}

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Top Section - Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Reckoner Type */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reckoner Type *
                </label>
                <select
                  name="reckoner_type_id"
                  value={formData.reckoner_type_id}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Reckoner Type</option>
                  {reckonerTypes.map((type) => (
                    <option key={type.type_id} value={type.type_id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Name */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Cost Center *
                  </label>
                  <button
                    type="button"
                    onClick={toggleNewProjectInput}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    {isNewProject ? "Select existing" : "Add new"}
                    <Plus className="h-3 w-3 ml-1" />
                  </button>
                </div>
                {isNewProject ? (
                  <input
                    type="text"
                    name="project_name"
                    placeholder="New cost center"
                    value={formData.project_name}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <select
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Cost Center</option>
                    {projects.map((project) => (
                      <option key={project.pd_id} value={project.project_name}>
                        {project.project_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Site Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name*
                </label>
                <input
                  type="text"
                  name="site_name"
                  placeholder="Site name"
                  value={formData.site_name}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Location */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <button
                    type="button"
                    onClick={toggleNewLocationInput}
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    {isNewLocation ? "Select existing" : "Add new"}
                    <Plus className="h-3 w-3 ml-1" />
                  </button>
                </div>
                {isNewLocation ? (
                  <input
                    type="text"
                    name="new_location_name"
                    placeholder="New location name"
                    value={formData.new_location_name}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <select
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location.location_id} value={location.location_id}>
                        {location.location_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

        {/* PO Number */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    PO Number *
                  </label>
                  {(formData.reckoner_type_id === "1" || formData.reckoner_type_id === "3") && (
                    <button
                      type="button"
                      onClick={toggleCustomPoNumber}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      {isCustomPoNumber ? "Auto-generate" : "Custom"}
                      <Edit className="h-3 w-3 ml-1" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  name="po_number"
                  placeholder="PO number"
                  value={formData.po_number}
                  onChange={handleChange}
                  required
                  disabled={(formData.reckoner_type_id === "1" || formData.reckoner_type_id === "3") && !isCustomPoNumber}
                  className={`w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                    (formData.reckoner_type_id === "1" || formData.reckoner_type_id === "3") && !isCustomPoNumber
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }`}
                />
              </div>

              {/* PO Date - NEW */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PO Date *
                </label>
                <input
                  type="date"
                  name="po_date"
                  value={formData.po_date}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tentative End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Incharge Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incharge Type
                </label>
                <select
                  name="incharge_type"
                  value={formData.incharge_type}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Incharge Type</option>
                  {siteIncharges.map((incharge) => (
                    <option key={incharge.incharge_id} value={incharge.incharge_type}>
                      {incharge.incharge_type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Incharge Assignments Section */}
            {formData.incharge_type && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">
                    Incharge Assignments
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    Add Assignment
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Incharge
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          To Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rows.map((row, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              name="emp_id"
                              value={row.emp_id}
                              onChange={(e) => handleInputChange(index, e)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              required
                            >
                              <option value="">Select Incharge</option>
                              {employees.map((employee) => (
                                <option key={employee.emp_id} value={employee.emp_id}>
                                  {employee.full_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="date"
                              name="from_date"
                              value={row.from_date}
                              onChange={(e) => handleInputChange(index, e)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              required
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input
                              type="date"
                              name="to_date"
                              value={row.to_date}
                              onChange={(e) => handleInputChange(index, e)}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              required
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(index)}
                              disabled={rows.length <= 1}
                              className={`text-red-600 hover:text-red-900 ${
                                rows.length <= 1 ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              title={rows.length <= 1 ? "Cannot remove last row" : "Remove"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading.submitting}
                className="px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {loading.submitting && (
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                )}
                {loading.submitting ? "Creating..." : "Create Site"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreation;
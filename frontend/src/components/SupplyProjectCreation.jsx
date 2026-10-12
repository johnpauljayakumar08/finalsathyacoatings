import { API_BASE_URL } from "../config/api.js";
import { useState, useEffect } from "react";
import axios from "axios";
import { X, FolderPlus, Loader2, Plus } from "lucide-react";
import Swal from "sweetalert2";

const SupplyProjectCreation = ({ companyId, onClose, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    pd_id: "",
    project_name: "",
    site_name: "",
    po_number: "",
    location_id: "",
    new_location_name: "",
    supply_code: "",
    reckoner_type_id: "",
  });

  const [inputType, setInputType] = useState("po_number");
  const [companyName, setCompanyName] = useState("");
  const [projects, setProjects] = useState([]);
  const [locations, setLocations] = useState([]);
  const [reckonerTypes, setReckonerTypes] = useState([]);
  const [isNewProject, setIsNewProject] = useState(false);
  const [isNewLocation, setIsNewLocation] = useState(false);
  const [loading, setLoading] = useState({
    initial: false,
    submitting: false,
  });
  const [error, setError] = useState(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading((prev) => ({ ...prev, initial: true }));
      const [companyResponse, projectsResponse, locationsResponse, reckonerTypesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/supply/companies/${companyId}`),
        axios.get(`${API_BASE_URL}/supply/projects/${companyId}`),
        axios.get(`${API_BASE_URL}/supply/locations`),
        axios.get(`${API_BASE_URL}/supply/reckoner-types`),
      ]);

      setCompanyName(companyResponse.data.company_name || "Unknown Company");
      setProjects(projectsResponse.data || []);
      setLocations(locationsResponse.data.data || []);
      setReckonerTypes(reckonerTypesResponse.data.data || []);
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

  // Initial data load
  useEffect(() => {
    if (companyId) {
      fetchData();
    } else {
      setError("No company selected. Please select a company first.");
      Swal.fire({
        icon: "warning",
        title: "No Company Selected",
        text: "Please select a company before creating a site.",
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

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setFormData({ ...formData, po_number: "", supply_code: "" });
  };

  const toggleNewProject = () => {
    setIsNewProject(!isNewProject);
    setFormData({ ...formData, pd_id: "", project_name: "" });
  };

  const toggleNewLocation = () => {
    setIsNewLocation(!isNewLocation);
    setFormData({ ...formData, location_id: "", new_location_name: "" });
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submitting: true }));
    setError(null);

    try {
      // Validate form data
      const validationErrors = [];
      if (isNewProject && !formData.project_name) validationErrors.push("Cost Center is required");
      if (!isNewProject && !formData.pd_id) validationErrors.push("Cost Center is required");
      if (!formData.site_name) validationErrors.push("Site Name is required");
      if (!formData.location_id && !formData.new_location_name) {
        validationErrors.push("Either Location or New Location Name is required");
      }
      if (!formData.po_number && !formData.supply_code) {
        validationErrors.push("Either PO Number or Supply Code is required");
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join("<br />"));
        setLoading((prev) => ({ ...prev, submitting: false }));
        return;
      }

      let pd_id;
      if (isNewProject) {
        const projectResponse = await axios.post(`${API_BASE_URL}/supply/create-project`, {
          company_id: companyId,
          project_name: formData.project_name,
        });
        pd_id = projectResponse.data.pd_id;
      } else {
        pd_id = formData.pd_id;
      }

      // Create site
      const siteData = {
        pd_id,
        site_name: formData.site_name,
        po_number: formData.po_number || null,
        location_id: isNewLocation ? null : formData.location_id,
        new_location_name: isNewLocation ? formData.new_location_name : null,
        supply_code: formData.supply_code || null,
        reckoner_type_id: formData.reckoner_type_id || null,
      };

      await axios.post(`${API_BASE_URL}/supply/create-site`, siteData);

      // Reset form and show success
      setFormData({
        pd_id: "",
        project_name: "",
        site_name: "",
        po_number: "",
        location_id: "",
        new_location_name: "",
        supply_code: "",
        reckoner_type_id: "",
      });
      setIsNewProject(false);
      setIsNewLocation(false);
      setInputType("po_number");

      await fetchData();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Site for cost center ${formData.project_name || projects.find(p => p.pd_id === formData.pd_id)?.project_name} created successfully.`,
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#ef4444",
        confirmButtonText: "View sites",
        cancelButtonText: "Stay here",
      }).then((result) => {
        if (result.isConfirmed && onProjectCreated) {
          onProjectCreated(companyId);
        } else {
          onClose();
        }
      });
    } catch (error) {
      console.error("Error creating site:", error);
      setError(error.response?.data?.error || "Failed to create site. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Failed to create site.",
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
            <h2 className="text-2xl font-semibold text-gray-800">
              Create Site for <span className="font-bold text-indigo-700">{companyName}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
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
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Column 1 */}
              <div className="space-y-6">
                {/* PO Number / Supply Code Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Identifier Type *
                  </label>
                  <div className="flex space-x-6 mb-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inputType"
                        value="po_number"
                        checked={inputType === "po_number"}
                        onChange={() => handleInputTypeChange("po_number")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">PO Number</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="inputType"
                        value="supply_code"
                        checked={inputType === "supply_code"}
                        onChange={() => handleInputTypeChange("supply_code")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Supply Code</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    name={inputType}
                    placeholder={inputType === "po_number" ? "Enter PO number" : "Enter supply code"}
                    value={inputType === "po_number" ? formData.po_number : formData.supply_code}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  />
                </div>

                {/* Site Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    name="site_name"
                    placeholder="Enter site name"
                    value={formData.site_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                {/* Cost Center */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Cost Center *
                    </label>
                    <button
                      type="button"
                      onClick={toggleNewProject}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 transition-colors duration-200 font-medium"
                    >
                      <span>{isNewProject ? "Select existing" : "Add new"}</span>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  {isNewProject ? (
                    <input
                      type="text"
                      name="project_name"
                      placeholder="Enter new cost center"
                      value={formData.project_name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    />
                  ) : (
                    <select
                      name="pd_id"
                      value={formData.pd_id}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white"
                    >
                      <option value="">Select Cost Center</option>
                      {projects.map((project) => (
                        <option key={project.pd_id} value={project.pd_id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Reckoner Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reckoner Type
                  </label>
                  <select
                    name="reckoner_type_id"
                    value={formData.reckoner_type_id}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white"
                  >
                    <option value="">Select Reckoner Type</option>
                    {reckonerTypes.map((type) => (
                      <option key={type.type_id} value={type.type_id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-6">
                {/* Location */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Location *
                    </label>
                    <button
                      type="button"
                      onClick={toggleNewLocation}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 transition-colors duration-200 font-medium"
                    >
                      <span>{isNewLocation ? "Select existing" : "Add new"}</span>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  {isNewLocation ? (
                    <input
                      type="text"
                      name="new_location_name"
                      placeholder="Enter new location name"
                      value={formData.new_location_name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    />
                  ) : (
                    <select
                      name="location_id"
                      value={formData.location_id}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white"
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
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 min-w-[100px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading.submitting}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-[120px] inline-flex items-center justify-center"
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

export default SupplyProjectCreation;
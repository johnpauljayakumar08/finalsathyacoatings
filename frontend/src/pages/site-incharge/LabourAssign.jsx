import { API_BASE_URL } from "../../config/api.js";
// Complete LabourAssign.jsx - Fixed initial date setting to use local timezone (prevents one-day-off issue)
// View Assigned Labours button enable condition (after company, project, site, work description)
// Added is_editable check in modal for edit button (disabled if >48 hours)
// Edit form displays assigned from_date and to_date correctly
// Complete LabourAssign.jsx - Fixed date display (trim time/ISO), resolved one-day-off issue (local date handling)
// Edit form displays current from_date, to_date, and salary; allows editing salary and storing it

import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { Save, Eye, Edit2, X } from "lucide-react";
import { useParams } from "react-router-dom";

const LabourAssign = () => {
  const { encodedUserId } = useParams();
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [labours, setLabours] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedWorkDesc, setSelectedWorkDesc] = useState(null);
  const [selectedLabours, setSelectedLabours] = useState([]);
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [toDate, setToDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [assignedLabours, setAssignedLabours] = useState([]);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editFromDate, setEditFromDate] = useState("");
  const [editToDate, setEditToDate] = useState("");
  const [editSalary, setEditSalary] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/project/companies`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCompanies(response.data);
        } else {
          setError("No companies found");
          toast.error("No companies found");
        }
      } catch (err) {
        setError("Failed to fetch companies");
        toast.error("Failed to fetch companies");
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const fetchProjectsAndSites = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/project/projects-with-sites`);
          if (Array.isArray(response.data) && response.data.length > 0) {
            const filteredProjects = response.data.filter(project => project.company_id === selectedCompany.value);
            setProjects(filteredProjects);
            setSelectedProject(null);
            setSites([]);
            setSelectedSite(null);
            setWorkDescriptions([]);
            setSelectedWorkDesc(null);
            setSelectedLabours([]);
          } else {
            setError("No projects found");
            toast.error("No projects found");
          }
        } catch (err) {
          setError("Failed to fetch projects and sites");
          toast.error("Failed to fetch projects and sites");
        }
      };
      fetchProjectsAndSites();
    } else {
      setProjects([]);
      setSelectedProject(null);
      setSites([]);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedWorkDesc(null);
      setSelectedLabours([]);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject) {
      const selectedProjectData = projects.find(project => project.project_id === selectedProject.value);
      setSites(selectedProjectData ? selectedProjectData.sites : []);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedWorkDesc(null);
      setSelectedLabours([]);
    }
  }, [selectedProject, projects]);

  useEffect(() => {
    if (selectedProject && selectedSite) {
      let isMounted = true; // Prevent race conditions

      const fetchWorkDescriptions = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/site-incharge/work-descriptions?site_id=${selectedSite.value}`
          );
          if (isMounted) {
            setWorkDescriptions(response.data.data || []);
            setError(null);
          }
        } catch (err) {
          if (isMounted) {
            toast.error("Failed to fetch work descriptions");
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      const fetchLabours = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/site-incharge/labours`);
          console.log("Labours fetched:", response.data); // Debug log
          if (isMounted) {
            setLabours(response.data.data || []);
            setError(null);
          }
        } catch (err) {
          if (isMounted) {
            toast.error("Failed to fetch labours");
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchWorkDescriptions();
      fetchLabours();

      return () => {
        isMounted = false; // Cleanup to prevent state updates on unmounted component
      };
    }
  }, [selectedProject, selectedSite]);

  const handleSaveAssignment = async () => {
    if (
      !selectedCompany ||
      !selectedProject ||
      !selectedSite ||
      !selectedWorkDesc ||
      selectedLabours.length === 0 ||
      !fromDate ||
      !toDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      if (!encodedUserId) {
        toast.error("User ID is missing from URL");
        return;
      }
      let user_id;
      try {
        user_id = atob(encodedUserId);
        if (!/^\d+$/.test(user_id)) throw new Error();
      } catch {
        toast.error("Invalid User ID in URL");
        return;
      }

      const payload = {
        project_id: selectedProject.value,
        site_id: selectedSite.value,
        desc_id: selectedWorkDesc.value,
        labour_ids: selectedLabours.map(labour => labour.value),
        from_date: fromDate,
        to_date: toDate,
        created_by: parseInt(user_id),
      };
      console.log("Sending payload:", payload); // Debug log
      const response = await axios.post(
        `${API_BASE_URL}/site-incharge/save-labour-assignment`,
        payload
      );
      toast.success(response.data.message);
      setSelectedWorkDesc(null);
      setSelectedLabours([]);
    } catch (err) {
      console.error("Error saving labour assignment:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to save labour assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewAssignedLabours = async () => {
    if (!selectedProject || !selectedSite || !selectedWorkDesc) {
      toast.error("Please select project, site, and work description");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/site-incharge/assigned-labours?project_id=${selectedProject.value}&site_id=${selectedSite.value}&desc_id=${selectedWorkDesc.value}`
      );
      setAssignedLabours(response.data.data || []);
      setShowModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch assigned labours");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignmentId(assignment.id);
    setEditFromDate(assignment.from_date.split('T')[0]); // Trim time if present
    setEditToDate(assignment.to_date.split('T')[0]); // Trim time if present
    setEditSalary(assignment.salary || '');
  };

  const handleUpdateAssignment = async (assignmentId) => {
    if (!editFromDate || !editToDate) {
      toast.error("Please fill from and to dates");
      return;
    }

    try {
      setSubmitting(true);
      if (!encodedUserId) {
        toast.error("User ID is missing from URL");
        return;
      }
      let user_id;
      try {
        user_id = atob(encodedUserId);
        if (!/^\d+$/.test(user_id)) throw new Error();
      } catch {
        toast.error("Invalid User ID in URL");
        return;
      }

      const payload = {
        assignment_id: assignmentId,
        from_date: editFromDate,
        to_date: editToDate,
        salary: editSalary ? parseFloat(editSalary) : null,
        updated_by: parseInt(user_id),
      };

      const response = await axios.put(
        `${API_BASE_URL}/site-incharge/update-labour-assignment`,
        payload
      );
      toast.success(response.data.message);
      setEditingAssignmentId(null);
      setEditFromDate("");
      setEditToDate("");
      setEditSalary("");
      // Refresh assigned labours
      handleViewAssignedLabours();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update labour assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const companyOptions = companies.map(company => ({
    value: company.company_id,
    label: company.company_name,
  }));

  const projectOptions = projects.map(project => ({
    value: project.project_id,
    label: project.project_name,
  }));

  const siteOptions = sites.map(site => ({
    value: site.site_id,
    label: site.site_name,
  }));

  const workDescOptions = workDescriptions.map(desc => ({
    value: desc.desc_id,
    label: desc.desc_name,
  }));

  const labourOptions = labours.map(labour => ({
    value: labour.id,
    label: `${labour.id} - ${labour.full_name}`,
  }));

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // Remove time and timezone
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Labour Assignment</h1>
          <button
            onClick={handleViewAssignedLabours}
            disabled={!selectedCompany || !selectedProject || !selectedSite || !selectedWorkDesc || loading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Eye size={16} className="mr-1" />
            View Assigned
          </button>
        </div>

        <div className="mb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
            <Select
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              placeholder="Search Company..."
              isSearchable
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
            <Select
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Search Project..."
              isSearchable
              isDisabled={!selectedCompany}
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Site</label>
            <Select
              options={siteOptions}
              value={selectedSite}
              onChange={setSelectedSite}
              placeholder="Search Site..."
              isSearchable
              isDisabled={!selectedProject}
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Work Description</label>
            <Select
              options={workDescOptions}
              value={selectedWorkDesc}
              onChange={setSelectedWorkDesc}
              placeholder="Search Work Description..."
              isSearchable
              isDisabled={loading || !selectedProject || !selectedSite}
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Labours</label>
            <Select
              options={labourOptions}
              value={selectedLabours}
              onChange={setSelectedLabours}
              placeholder="Search Labours..."
              isSearchable
              isMulti
              isDisabled={loading || !selectedProject || !selectedSite || !selectedWorkDesc}
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {loading && <div className="text-center py-6 text-sm text-gray-500">Loading...</div>}
        {error && <div className="text-center py-6 text-sm text-red-600">{error}</div>}

        <button
          onClick={handleSaveAssignment}
          className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
          disabled={submitting || selectedLabours.length === 0}
        >
          <Save size={14} className="mr-2" />
          Save Labour Assignment
        </button>
      </div>

      {/* Modal for Assigned Labours */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Assigned Labours</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading assigned labours...</div>
            ) : assignedLabours.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No assigned labours found</div>
            ) : (
              <div className="space-y-4">
                {assignedLabours.map((assignment) => (
                  <div key={assignment.id} className="border rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <strong>{assignment.full_name}</strong> (ID: {assignment.labour_id})
                        <p className="text-sm text-gray-600">Mobile: {assignment.mobile || 'N/A'}</p>
                      </div>
                      <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={!assignment.is_editable || editingAssignmentId === assignment.id}
                        title={!assignment.is_editable ? "Cannot edit - more than 48 hours passed" : ""}
                      >
                        <Edit2 size={16} className="mr-1" />
                        Edit Dates
                      </button>
                    </div>
                    {editingAssignmentId === assignment.id ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium">From Date</label>
                          <input
                            type="date"
                            value={editFromDate}
                            onChange={(e) => setEditFromDate(e.target.value)}
                            className="w-full p-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">To Date</label>
                          <input
                            type="date"
                            value={editToDate}
                            onChange={(e) => setEditToDate(e.target.value)}
                            className="w-full p-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Salary</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editSalary}
                            onChange={(e) => setEditSalary(e.target.value)}
                            placeholder="Enter salary"
                            className="w-full p-1 border rounded text-sm"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateAssignment(assignment.id)}
                            disabled={submitting || !editFromDate || !editToDate}
                            className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 flex items-center justify-center disabled:bg-gray-400"
                          >
                            <Save size={12} className="mr-1" />
                            Update
                          </button>
                          <button
                            onClick={() => {
                              setEditingAssignmentId(null);
                              setEditFromDate("");
                              setEditToDate("");
                              setEditSalary("");
                            }}
                            className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        From: {formatDateForDisplay(assignment.from_date)} | To: {formatDateForDisplay(assignment.to_date)} | Salary: {assignment.salary || 'N/A'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default LabourAssign;
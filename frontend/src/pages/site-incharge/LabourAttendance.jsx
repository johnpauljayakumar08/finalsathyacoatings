import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { Save, Edit2, X } from "lucide-react";
import { useParams } from "react-router-dom";

const LabourAttendance = () => {
  const { encodedUserId } = useParams();
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [assignedLabours, setAssignedLabours] = useState([]);
  const [shifts, setShifts] = useState({});
  const [remarks, setRemarks] = useState({});
  const [editingIds, setEditingIds] = useState(new Set()); // Track editing rows by assignment_id
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedWorkDesc, setSelectedWorkDesc] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
            setAssignedLabours([]);
            setShifts({});
            setRemarks({});
            setEditingIds(new Set());
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
      setAssignedLabours([]);
      setShifts({});
      setRemarks({});
      setEditingIds(new Set());
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject) {
      const selectedProjectData = projects.find(project => project.project_id === selectedProject.value);
      setSites(selectedProjectData ? selectedProjectData.sites : []);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedWorkDesc(null);
      setAssignedLabours([]);
      setShifts({});
      setRemarks({});
      setEditingIds(new Set());
    }
  }, [selectedProject, projects]);

  useEffect(() => {
    if (selectedProject && selectedSite) {
      const fetchWorkDescriptions = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/site-incharge/work-descriptions?site_id=${selectedSite.value}`);
          setWorkDescriptions(response.data.data || []);
          setError(null);
        } catch (err) {
          toast.error("Failed to fetch work descriptions");
        } finally {
          setLoading(false);
        }
      };
      fetchWorkDescriptions();
    }
  }, [selectedProject, selectedSite]);

  useEffect(() => {
    if (selectedProject && selectedSite && selectedWorkDesc) {
      const fetchLabourAttendance = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/site-incharge/labour-attendance?project_id=${selectedProject.value}&site_id=${selectedSite.value}&desc_id=${selectedWorkDesc.value}&entry_date=${selectedDate}`
          );
          setAssignedLabours(response.data.data || []);
          // Reset states on refresh
          setShifts({});
          setRemarks({});
          setEditingIds(new Set());
          setError(null);
        } catch (err) {
          toast.error("Failed to fetch labour attendance");
        } finally {
          setLoading(false);
        }
      };
      fetchLabourAttendance();
    }
  }, [selectedProject, selectedSite, selectedWorkDesc, selectedDate]);

  const handleShiftChange = (assignmentId, value) => {
    setShifts(prev => ({
      ...prev,
      [assignmentId]: value
    }));
  };

  const handleRemarksChange = (assignmentId, value) => {
    setRemarks(prev => ({
      ...prev,
      [assignmentId]: value
    }));
  };

  const toggleEdit = (assignmentId) => {
    setEditingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });
  };

  const handleCancelEdit = (assignmentId) => {
    // Reset values for this row
    setShifts(prev => {
      const newShifts = { ...prev };
      delete newShifts[assignmentId];
      return newShifts;
    });
    setRemarks(prev => {
      const newRemarks = { ...prev };
      delete newRemarks[assignmentId];
      return newRemarks;
    });
    toggleEdit(assignmentId);
  };

  const handleSaveRow = async (labour) => {
    const parsedShift = parseFloat(shifts[labour.assignment_id] || labour.shift || 0);
    const currentRemarks = remarks[labour.assignment_id] || labour.remarks || '';

    if (parsedShift <= 0) {
      toast.error("Shift must be a positive number");
      return;
    }

    const attendanceData = [{
      labour_assignment_id: labour.assignment_id,
      entry_date: selectedDate,
      shift: parsedShift,
      remarks: currentRemarks || null,
      attendance_id: labour.attendance_id // Include for update
    }];

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
        attendance_data: attendanceData,
        created_by: parseInt(user_id)
      };
      console.log('Sending payload for row save:', payload);
      const response = await axios.post(`${API_BASE_URL}/site-incharge/save-labour-attendance`, payload);
      toast.success(response.data.message);
      // Reset for this row
      setShifts(prev => {
        const newShifts = { ...prev };
        delete newShifts[labour.assignment_id];
        return newShifts;
      });
      setRemarks(prev => {
        const newRemarks = { ...prev };
        delete newRemarks[labour.assignment_id];
        return newRemarks;
      });
      toggleEdit(labour.assignment_id);
      // Refresh full list
      const responseRefresh = await axios.get(
        `${API_BASE_URL}/site-incharge/labour-attendance?project_id=${selectedProject.value}&site_id=${selectedSite.value}&desc_id=${selectedWorkDesc.value}&entry_date=${selectedDate}`
      );
      setAssignedLabours(responseRefresh.data.data || []);
    } catch (err) {
      console.error('Error saving row attendance:', err.response?.data);
      toast.error(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedCompany || !selectedProject || !selectedSite || !selectedWorkDesc || !selectedDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const attendanceData = [];

    assignedLabours.forEach(labour => {
      if (!labour.attendance_id) { // Only new rows
        const parsedShift = parseFloat(shifts[labour.assignment_id] || 0);
        const currentRemarks = remarks[labour.assignment_id] || '';

        if (parsedShift > 0) {
          attendanceData.push({
            labour_assignment_id: labour.assignment_id,
            entry_date: selectedDate,
            shift: parsedShift,
            remarks: currentRemarks || null
          });
        }
      }
    });

    if (attendanceData.length === 0) {
      toast.error("Please enter a positive shift for at least one new labour");
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
        attendance_data: attendanceData,
        created_by: parseInt(user_id)
      };
      console.log('Sending payload for new attendance:', payload);
      const response = await axios.post(`${API_BASE_URL}/site-incharge/save-labour-attendance`, payload);
      toast.success(response.data.message);
      // Reset states for new rows
      setShifts({});
      setRemarks({});
      // Refresh attendance data
      const responseRefresh = await axios.get(
        `${API_BASE_URL}/site-incharge/labour-attendance?project_id=${selectedProject.value}&site_id=${selectedSite.value}&desc_id=${selectedWorkDesc.value}&entry_date=${selectedDate}`
      );
      setAssignedLabours(responseRefresh.data.data || []);
    } catch (err) {
      console.error('Error saving new labour attendance:', err.response?.data);
      toast.error(err.response?.data?.message || "Failed to save labour attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const companyOptions = companies.map(company => ({
    value: company.company_id,
    label: company.company_name
  }));

  const projectOptions = projects.map(project => ({
    value: project.project_id,
    label: project.project_name
  }));

  const siteOptions = sites.map(site => ({
    value: site.site_id,
    label: site.site_name
  }));

  const workDescOptions = workDescriptions.map(desc => ({
    value: desc.desc_id,
    label: desc.desc_name
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Labour Attendance</h1>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {loading && <div className="text-center py-6 text-sm text-gray-500">Loading...</div>}
        {error && <div className="text-center py-6 text-sm text-red-600">{error}</div>}

        {assignedLabours.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Assigned Labours</h2>
            <div className="space-y-4">
              {assignedLabours.map(labour => {
                const isEditing = editingIds.has(labour.assignment_id);
                const currentShift = shifts[labour.assignment_id] !== undefined ? shifts[labour.assignment_id] : (labour.shift || '');
                const currentRemarks = remarks[labour.assignment_id] !== undefined ? remarks[labour.assignment_id] : (labour.remarks || '');
                const hasAttendance = !!labour.attendance_id;
                const showEdit = hasAttendance && labour.is_editable && !isEditing;

                return (
                  <div key={labour.assignment_id} className="flex flex-col p-2 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 font-medium">{labour.full_name}</span>
                      <div className="flex items-center space-x-2">
                        {showEdit && (
                          <button
                            onClick={() => toggleEdit(labour.assignment_id)}
                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                          >
                            <Edit2 size={16} className="mr-1" />
                            Edit
                          </button>
                        )}
                        {isEditing && (
                          <>
                            <button
                              onClick={() => handleSaveRow(labour)}
                              disabled={submitting || parseFloat(currentShift) <= 0}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 flex items-center disabled:bg-gray-400"
                            >
                              <Save size={12} className="mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => handleCancelEdit(labour.assignment_id)}
                              className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 flex items-center"
                            >
                              <X size={12} className="mr-1" />
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Shift</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={currentShift}
                          onChange={(e) => handleShiftChange(labour.assignment_id, e.target.value)}
                          placeholder="Shift hours"
                          className="w-full p-1 border rounded text-sm"
                          disabled={hasAttendance && !isEditing}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Remarks</label>
                        <input
                          type="text"
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(labour.assignment_id, e.target.value)}
                          placeholder="Enter remarks"
                          maxLength={255}
                          className="w-full p-1 border rounded text-sm"
                          disabled={hasAttendance && !isEditing}
                        />
                      </div>
                    </div>
                    {hasAttendance && !isEditing && (
                      <div className="text-xs text-gray-500 mt-1">
                        Shift: {labour.shift} | Remarks: {labour.remarks || 'N/A'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleSaveAttendance}
          className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
          disabled={submitting}
        >
          <Save size={14} className="mr-2" />
          Save New Attendance
        </button>
      </div>

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

export default LabourAttendance;
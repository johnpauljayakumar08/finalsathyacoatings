import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { Save, Users, UserCheck, Calendar, Building, HardHat, Pencil, X } from "lucide-react";
import { useParams } from "react-router-dom";

// Define colors from the logo for a consistent theme
const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',     // Gold/Amber
  lightBg: '#f8f9fa',     // Very light gray for the page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d',// Gray for secondary text
  border: '#ced4da',      // Neutral border color
};

// A styled wrapper for form sections
const FormSection = ({ title, icon, children }) => (
  <div className="border border-gray-200 rounded-lg p-4 h-full">
    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
      {icon}
      {title}
    </h3>
    {children}
  </div>
);

const getLocalDateInput = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().split("T")[0];
};

const WorkForcePlanning = () => {
  const { encodedUserId } = useParams();
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [labourEmployees, setLabourEmployees] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedWorkDesc, setSelectedWorkDesc] = useState(null);
  const [selectedIncharges, setSelectedIncharges] = useState([]);
  const [currentInchargeAssignments, setCurrentInchargeAssignments] = useState([]);
  const [loadingInchargeAssignments, setLoadingInchargeAssignments] = useState(false);
  const [inchargeAssignmentsRefresh, setInchargeAssignmentsRefresh] = useState(0);
  const [inchargeAssignmentMode, setInchargeAssignmentMode] = useState("in_person");
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [editAssignmentEmployee, setEditAssignmentEmployee] = useState(null);
  const [editAssignmentMode, setEditAssignmentMode] = useState("in_person");
  const [savingAssignmentEdit, setSavingAssignmentEdit] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("incharge");

  const [inchargeFromDate, setInchargeFromDate] = useState(getLocalDateInput);
  const [inchargeToDate, setInchargeToDate] = useState(getLocalDateInput);
  const [inchargeAssignmentDate, setInchargeAssignmentDate] = useState(getLocalDateInput);
  const [labourFromDate, setLabourFromDate] = useState(getLocalDateInput);
  const [labourToDate, setLabourToDate] = useState(getLocalDateInput);

  // All logic hooks remain unchanged...
  useEffect(() => {
    const fetchCompaniesAndProjects = async () => {
      setLoading(true);
      try {
        const [companyResponse, projectResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/project/companies`),
          axios.get(`${API_BASE_URL}/project/projects-with-sites`),
        ]);
        setCompanies(companyResponse.data || []);
        setProjects(projectResponse.data || []);
      } catch (err) {
        setError("Failed to fetch companies or projects");
        toast.error("Failed to fetch companies or projects");
      } finally {
        setLoading(false);
      }
    };
    fetchCompaniesAndProjects();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const [empResponse, labourResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/site-incharge/employees`),
          axios.get(`${API_BASE_URL}/admin/labour`),
        ]);
        if (isMounted) {
          setEmployees(empResponse.data.data || []);
          setLabourEmployees(labourResponse.data.data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          toast.error("Failed to fetch employees or labours");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchEmployees();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      setSelectedProject(null);
      setSites([]);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedWorkDesc(null);
      setSelectedIncharges([]);
      setCurrentInchargeAssignments([]);
      setSelectedLabour([]);
      setEditingAssignment(null);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject) {
      const selectedProjectData = projects.find(p => p.project_id === selectedProject.value);
      setSites(selectedProjectData ? selectedProjectData.sites : []);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedWorkDesc(null);
      setSelectedIncharges([]);
      setCurrentInchargeAssignments([]);
      setSelectedLabour([]);
      setEditingAssignment(null);
    }
  }, [selectedProject, projects]);

  useEffect(() => {
    if (selectedProject && selectedSite) {
      let isMounted = true;
      const fetchWorkDescriptions = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/site-incharge/work-descriptions?site_id=${selectedSite.value}`);
          if (isMounted) setWorkDescriptions(response.data.data || []);
        } catch (err) {
          if (isMounted) toast.error("Failed to fetch work descriptions");
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchWorkDescriptions();
      return () => { isMounted = false; };
    }
  }, [selectedProject, selectedSite]);

  useEffect(() => {
    if (!selectedProject || !selectedSite || !inchargeAssignmentDate) {
      setCurrentInchargeAssignments([]);
      return undefined;
    }
    let isMounted = true;
    const fetchCurrentAssignments = async () => {
      setLoadingInchargeAssignments(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/material/assigned-incharges`, {
          params: {
            pd_id: selectedProject.value,
            site_id: selectedSite.value,
            ...(selectedWorkDesc ? { desc_id: selectedWorkDesc.value } : {}),
            date: inchargeAssignmentDate,
          },
        });
        if (isMounted) setCurrentInchargeAssignments(response.data.data || []);
      } catch (err) {
        if (isMounted) {
          setCurrentInchargeAssignments([]);
          toast.error(err.response?.data?.message || "Could not load current site incharges.");
        }
      } finally {
        if (isMounted) setLoadingInchargeAssignments(false);
      }
    };
    fetchCurrentAssignments();
    return () => { isMounted = false; };
  }, [selectedProject, selectedSite, selectedWorkDesc, inchargeAssignmentDate, inchargeAssignmentsRefresh]);
  
  const handleSaveAssignments = async () => {
    let user_id;
    try {
        user_id = atob(encodedUserId);
        if (!/^\d+$/.test(user_id)) throw new Error("Invalid ID format");
    } catch {
        toast.error("Invalid User ID in URL.");
        return;
    }

    if (!selectedCompany || !selectedProject || !selectedSite || !selectedWorkDesc) {
        toast.warn("Please complete all selection fields before saving.");
        return;
    }

    const hasIncharge = selectedIncharges.length > 0;
    const hasLabour = selectedLabour.length > 0;

    if (!hasIncharge && !hasLabour) {
        toast.error("Please select at least one site incharge or labour employee.");
        return;
    }

    if (hasIncharge && new Date(inchargeToDate) < new Date(inchargeFromDate)) {
        toast.error("Incharge 'To Date' cannot be earlier than 'From Date'.");
        return;
    }
    if (hasLabour && new Date(labourToDate) < new Date(labourFromDate)) {
        toast.error("Labour 'To Date' cannot be earlier than 'From Date'.");
        return;
    }

    setSubmitting(true);
    try {
        if (hasIncharge) {
            const inchargePayload = selectedIncharges.map(emp => ({
                from_date: inchargeFromDate, to_date: inchargeToDate, pd_id: selectedProject.value,
                site_id: selectedSite.value, emp_id: emp.value, desc_id: selectedWorkDesc.value,
                assignment_mode: inchargeAssignmentMode, created_by: user_id,
            }));
            await axios.post(`${API_BASE_URL}/material/assign-incharge`, inchargePayload);
            toast.success("Site incharges assigned successfully.");
            setSelectedIncharges([]);
            setInchargeAssignmentsRefresh((current) => current + 1);
        }

        if (hasLabour) {
            const labourPayload = {
                project_id: selectedProject.value, site_id: selectedSite.value, desc_id: selectedWorkDesc.value,
                labour_ids: selectedLabour.map(l => l.value), from_date: labourFromDate, to_date: labourToDate,
                created_by: parseInt(user_id),
            };
            await axios.post(`${API_BASE_URL}/site-incharge/save-labour-assignment`, labourPayload);
            toast.success("Labour assigned successfully.");
        }

        setSelectedLabour([]);
    } catch (err) {
        toast.error(err.response?.data?.message || "An error occurred while saving.");
    } finally {
        setSubmitting(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    const employee = employees.find((item) => item.emp_id === assignment.emp_id);
    setEditingAssignment(assignment);
    setEditAssignmentEmployee(employee
      ? { value: employee.emp_id, label: `${employee.emp_id} - ${employee.full_name}` }
      : { value: assignment.emp_id, label: `${assignment.emp_id} - ${assignment.full_name}` });
    setEditAssignmentMode(assignment.assignment_mode || "in_person");
  };

  const handleSaveAssignmentEdit = async () => {
    if (!editingAssignment || !editAssignmentEmployee) {
      toast.error("Select the assigned employee.");
      return;
    }
    let userId;
    try {
      userId = atob(encodedUserId);
      if (!/^\d+$/.test(userId)) throw new Error("Invalid user ID");
    } catch {
      toast.error("Invalid User ID in URL.");
      return;
    }
    setSavingAssignmentEdit(true);
    try {
      await axios.put(
        `${API_BASE_URL}/material/assign-incharge/${editingAssignment.id}/date`,
        {
          assignment_date: inchargeAssignmentDate,
          emp_id: editAssignmentEmployee.value,
          assignment_mode: editAssignmentMode,
          updated_by: userId,
        }
      );
      toast.success("Assignment updated for this date.");
      setEditingAssignment(null);
      setEditAssignmentEmployee(null);
      setInchargeAssignmentsRefresh((current) => current + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update assignment.");
    } finally {
      setSavingAssignmentEdit(false);
    }
  };


  const companyOptions = companies.map(c => ({ value: c.company_id, label: c.company_name }));
  const projectOptions = projects.filter(p => selectedCompany ? p.company_id === selectedCompany.value : true).map(p => ({ value: p.project_id, label: p.project_name }));
  const siteOptions = sites.map(s => ({ value: s.site_id, label: s.site_name }));
  const workDescOptions = workDescriptions.map(d => ({ value: d.desc_id, label: d.desc_name }));
  const currentAssignmentEmployeeIds = new Set(currentInchargeAssignments.map((assignment) => assignment.emp_id));
  const employeeOptions = employees.map(e => ({
    value: e.emp_id,
    label: `${e.emp_id} - ${e.full_name}`,
    isDisabled: currentAssignmentEmployeeIds.has(e.emp_id),
  }));
  const labourOptions = labourEmployees.map(l => ({ value: l.id, label: l.full_name }));

  // Custom styles for react-select to match the new theme
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: state.isFocused ? themeColors.accent : themeColors.border,
      boxShadow: state.isFocused ? `0 0 0 1px ${themeColors.accent}` : 'none',
      '&:hover': {
        borderColor: themeColors.accent,
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#e0f2f1' : 'white',
      color: state.isSelected ? 'white' : themeColors.textPrimary,
      '&:active': {
        backgroundColor: themeColors.primary,
        color: 'white',
      },
    }),
    singleValue: (provided) => ({ ...provided, color: themeColors.textPrimary }),
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: themeColors.textPrimary }}>Workforce Planning</h1>
              <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>Assign personnel to projects and sites.</p>
            </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <FormSection title="Company" icon={<Building size={16} className="mr-2 text-gray-500" />}>
              <Select options={companyOptions} value={selectedCompany} onChange={setSelectedCompany} placeholder="Select..." styles={customSelectStyles} />
            </FormSection>
            <FormSection title="Profit Center" icon={<HardHat size={16} className="mr-2 text-gray-500" />}>
              <Select options={projectOptions} value={selectedProject} onChange={setSelectedProject} placeholder="Select..." isDisabled={!selectedCompany} styles={customSelectStyles} />
            </FormSection>
            <FormSection title="Site" icon={<Building size={16} className="mr-2 text-gray-500" />}>
              <Select options={siteOptions} value={selectedSite} onChange={setSelectedSite} placeholder="Select..." isDisabled={!selectedProject} styles={customSelectStyles} />
            </FormSection>
          </div>

          {selectedSite && (
            <div className="mb-6">
              <FormSection title="Work Description" icon={<Calendar size={16} className="mr-2 text-gray-500" />}>
                <Select options={workDescOptions} value={selectedWorkDesc} onChange={setSelectedWorkDesc} placeholder="Select work..." isDisabled={loading} styles={customSelectStyles} />
              </FormSection>
            </div>
          )}
          
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("incharge")}
                className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'incharge' ? 'text-teal-700 border-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <UserCheck size={16} className="mr-2" /> Assign Incharge
              </button>
              <button
                onClick={() => setActiveTab("labour")}
                className={`whitespace-nowrap flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'labour' ? 'text-teal-700 border-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Users size={16} className="mr-2" /> Assign Labour
              </button>
            </nav>
          </div>

          <div>
             {activeTab === "incharge" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">From Date</label>
                      <input type="date" value={inchargeFromDate} onChange={e => setInchargeFromDate(e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm text-sm focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">To Date</label>
                      <input type="date" value={inchargeToDate} onChange={e => setInchargeToDate(e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm text-sm focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">View / Update Assignment Date</label>
                      <input
                        type="date"
                        value={inchargeAssignmentDate}
                        onChange={(event) => {
                          setInchargeAssignmentDate(event.target.value);
                          setEditingAssignment(null);
                        }}
                        className="w-full p-2 border-gray-300 rounded-md shadow-sm text-sm focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Assignment Type</label>
                      <select
                        value={inchargeAssignmentMode}
                        onChange={(event) => setInchargeAssignmentMode(event.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="in_person">In-person (primary site)</option>
                        <option value="on_call">On-call (additional site/project)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Only one in-person site per employee on an overlapping date; use On-call for additional assignments.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Site Incharge(s)</label>
                    <Select options={employeeOptions} value={selectedIncharges} onChange={setSelectedIncharges} placeholder="Search employees..." isMulti isSearchable isDisabled={!selectedWorkDesc} styles={customSelectStyles} />
                  </div>
                  {selectedProject && selectedSite && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800">Assigned for {inchargeAssignmentDate}</h4>
                          <p className="text-xs text-gray-500">
                            {selectedProject.label} / {selectedSite.label}
                            {selectedWorkDesc ? ` / ${selectedWorkDesc.label}` : " / All work descriptions"}
                          </p>
                        </div>
                      </div>
                      {loadingInchargeAssignments ? (
                        <p className="text-sm text-gray-500">Loading assignments...</p>
                      ) : currentInchargeAssignments.length === 0 ? (
                        <p className="text-sm text-gray-500">No incharges assigned for this date.</p>
                      ) : (
                        <div className="space-y-2">
                          {currentInchargeAssignments.map((assignment) => (
                            <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-white p-3 shadow-sm">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{assignment.full_name} ({assignment.emp_id})</p>
                                <p className="text-xs text-gray-500">
                                  {assignment.assignment_mode === "on_call" ? "On-call" : "In-person"} ·
                                  {" "}{String(assignment.from_date).slice(0, 10)} to {String(assignment.to_date || "").slice(0, 10) || "Ongoing"}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleEditAssignment(assignment)}
                                className="inline-flex items-center gap-1 rounded-md border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                              >
                                <Pencil size={14} />
                                Update this date
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {editingAssignment && (
                        <div className="mt-4 rounded-md border border-teal-200 bg-white p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-gray-800">Update assignment for {inchargeAssignmentDate}</h5>
                            <button
                              type="button"
                              onClick={() => setEditingAssignment(null)}
                              aria-label="Cancel assignment edit"
                              className="rounded p-1 text-gray-500 hover:bg-gray-100"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">Site Incharge</label>
                              <Select
                                options={employees.map((employee) => ({
                                  value: employee.emp_id,
                                  label: `${employee.emp_id} - ${employee.full_name}`,
                                }))}
                                value={editAssignmentEmployee}
                                onChange={setEditAssignmentEmployee}
                                styles={customSelectStyles}
                                isSearchable
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">Assignment Type</label>
                              <select
                                value={editAssignmentMode}
                                onChange={(event) => setEditAssignmentMode(event.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2 text-sm"
                              >
                                <option value="in_person">In-person</option>
                                <option value="on_call">On-call</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={handleSaveAssignmentEdit}
                              disabled={savingAssignmentEdit}
                              className="inline-flex items-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Save size={15} className="mr-2" />
                              {savingAssignmentEdit ? "Updating..." : "Save date change"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            )}
             {activeTab === "labour" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">From Date</label>
                      <input type="date" value={labourFromDate} onChange={e => setLabourFromDate(e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm text-sm focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">To Date</label>
                      <input type="date" value={labourToDate} onChange={e => setLabourToDate(e.target.value)} className="w-full p-2 border-gray-300 rounded-md shadow-sm text-sm focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Labour Employees</label>
                    <Select options={labourOptions} value={selectedLabour} onChange={setSelectedLabour} placeholder="Search labour..." isMulti isSearchable isDisabled={!selectedWorkDesc} styles={customSelectStyles} />
                  </div>
                </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-center sm:text-left" style={{color: themeColors.textSecondary}}>
              <p className="font-semibold" style={{color: themeColors.textPrimary}}>Current Selection:</p>
              <p>{selectedProject?.label || "No project"}, {selectedSite?.label || "no site"}</p>
              <p>Work: {selectedWorkDesc?.label || "not selected"}</p>
            </div>
            <button
              onClick={handleSaveAssignments}
              style={{ backgroundColor: submitting ? '#9ca3af' : themeColors.primary }}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 text-white font-semibold rounded-md shadow-sm hover:opacity-90 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={submitting || !selectedWorkDesc || (selectedIncharges.length === 0 && selectedLabour.length === 0)}
            >
              <Save size={16} className="mr-2" />
              {submitting ? "Processing..." : "Save Assignments"}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};

export default WorkForcePlanning;

import { API_BASE_URL } from "../../config/api.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { FileText, Save, HardHat, Pencil, Plus, X, Trash2, UserPlus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { useParams } from "react-router-dom";

const API = `${API_BASE_URL}`;
const today = new Date().toISOString().slice(0, 10);

const WorkAndMaterialEntry = () => {
  const { encodedUserId } = useParams();
  const [userId, setUserId] = useState("");
  const [companies, setCompanies] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedWorkDescription, setSelectedWorkDescription] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [workRecords, setWorkRecords] = useState([]);
  const [completionData, setCompletionData] = useState({});
  const [completionInputs, setCompletionInputs] = useState({});
  const [editingCompletionEntry, setEditingCompletionEntry] = useState(null);
  const [completionEditInputs, setCompletionEditInputs] = useState({});
  const [savingCompletionEdit, setSavingCompletionEdit] = useState(false);
  const [dispatches, setDispatches] = useState([]);
  const [usageData, setUsageData] = useState({});
  const [usageInputs, setUsageInputs] = useState({});
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [assignedLabours, setAssignedLabours] = useState([]);
  const [labourShiftInputs, setLabourShiftInputs] = useState({});
  const [labourRateInputs, setLabourRateInputs] = useState({});
  const [labourRemarksInputs, setLabourRemarksInputs] = useState({});
  const [labourRoster, setLabourRoster] = useState([]);
  const [selectedAssignmentLabours, setSelectedAssignmentLabours] = useState([]);
  const [budgetHeads, setBudgetHeads] = useState([]);
  const [budgetExpenseData, setBudgetExpenseData] = useState({});
  const [budgetExpenseInputs, setBudgetExpenseInputs] = useState({});
  const [budgetExpenseForms, setBudgetExpenseForms] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingWork, setSavingWork] = useState(false);
  const [savingMaterials, setSavingMaterials] = useState(false);
  const [savingLabour, setSavingLabour] = useState(false);
  const [savingLabourAssignment, setSavingLabourAssignment] = useState(false);
  const [savingBudgetExpense, setSavingBudgetExpense] = useState(false);

  useEffect(() => {
    setBudgetExpenseInputs({});
    setBudgetExpenseForms({});
  }, [selectedDate, selectedSite?.value, selectedWorkDescription?.value]);

  useEffect(() => {
    try {
      const decoded = atob(encodedUserId || "");
      if (!/^\d+$/.test(decoded)) throw new Error("Invalid user ID");
      setUserId(decoded);
    } catch {
      toast.error("Invalid user ID in page URL");
    }
  }, [encodedUserId]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [companyResponse, projectResponse] = await Promise.all([
          axios.get(`${API}/project/companies`),
          axios.get(`${API}/project/projects-with-sites`)
        ]);
        setCompanies(Array.isArray(companyResponse.data) ? companyResponse.data : []);
        setAllProjects(Array.isArray(projectResponse.data) ? projectResponse.data : []);
      } catch (error) {
        console.error("Failed to load company/project options:", error);
        toast.error("Failed to load company and project options");
      }
    };
    loadOptions();
  }, []);

  const projects = useMemo(
    () => allProjects.filter(project => String(project.company_id) === String(selectedCompany?.value)),
    [allProjects, selectedCompany]
  );
  const sites = useMemo(
    () => allProjects.find(project => String(project.project_id) === String(selectedProject?.value))?.sites || [],
    [allProjects, selectedProject]
  );
  const companyOptions = companies.map(company => ({ value: company.company_id, label: company.company_name }));
  const projectOptions = projects.map(project => ({ value: project.project_id, label: project.project_name }));
  const siteOptions = sites.map(site => ({
    value: site.site_id,
    label: site.po_number ? `${site.site_name} (PO: ${site.po_number})` : site.site_name
  }));
  const workDescriptionOptions = workDescriptions.map(description => ({
    value: description.desc_id,
    label: description.desc_name
  }));
  const labourRosterOptions = useMemo(() => {
    const groups = new Map();
    labourRoster.forEach(labour => {
      const groupLabel = labour.team_name || "Other labourers";
      if (!groups.has(groupLabel)) groups.set(groupLabel, []);
      groups.get(groupLabel).push({
        value: labour.id,
        label: labour.team_role === "head" ? `${labour.full_name} (Head)` : labour.full_name,
        approved_salary: labour.approved_salary
      });
    });
    return Array.from(groups, ([label, options]) => ({ label, options }));
  }, [labourRoster]);

  useEffect(() => {
    setSelectedProject(null);
    setSelectedSite(null);
    setSelectedWorkDescription(null);
    setWorkDescriptions([]);
    setWorkRecords([]);
    setDispatches([]);
    setCompletionData({});
    setUsageData({});
    setUsageInputs({});
    setSelectedMaterials(new Set());
    setAssignedLabours([]);
    setLabourShiftInputs({});
    setLabourRateInputs({});
    setLabourRemarksInputs({});
    setBudgetHeads([]);
    setBudgetExpenseData({});
    setBudgetExpenseInputs({});
  }, [selectedCompany]);

  useEffect(() => {
    setSelectedSite(null);
    setSelectedWorkDescription(null);
    setWorkDescriptions([]);
    setWorkRecords([]);
    setDispatches([]);
    setCompletionData({});
    setUsageData({});
    setUsageInputs({});
    setSelectedMaterials(new Set());
    setAssignedLabours([]);
    setLabourShiftInputs({});
    setLabourRateInputs({});
    setLabourRemarksInputs({});
    setBudgetHeads([]);
    setBudgetExpenseData({});
    setBudgetExpenseInputs({});
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedSite) {
      setWorkDescriptions([]);
      setSelectedWorkDescription(null);
      setWorkRecords([]);
      setDispatches([]);
      setCompletionData({});
      setUsageData({});
      setUsageInputs({});
      setSelectedMaterials(new Set());
      setAssignedLabours([]);
      setLabourShiftInputs({});
      setLabourRateInputs({});
      setLabourRemarksInputs({});
      setBudgetHeads([]);
      setBudgetExpenseData({});
      setBudgetExpenseInputs({});
      return;
    }
    const loadWorkDescriptions = async () => {
      try {
        const response = await axios.get(`${API}/material/work-descriptions`, {
          params: { site_id: selectedSite.value }
        });
        setWorkDescriptions(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Failed to load work descriptions:", error);
        toast.error("Failed to load work descriptions");
        setWorkDescriptions([]);
      }
    };
    loadWorkDescriptions();
    setSelectedWorkDescription(null);
    setWorkRecords([]);
    setDispatches([]);
    setCompletionData({});
    setUsageData({});
    setUsageInputs({});
    setSelectedMaterials(new Set());
    setAssignedLabours([]);
    setLabourShiftInputs({});
    setLabourRateInputs({});
    setLabourRemarksInputs({});
    setBudgetHeads([]);
    setBudgetExpenseData({});
    setBudgetExpenseInputs({});
  }, [selectedSite]);

  useEffect(() => {
    if (!selectedWorkDescription) {
      setLabourRoster([]);
      setSelectedAssignmentLabours([]);
      return;
    }

    setSelectedAssignmentLabours([]);
    let cancelled = false;
    const loadLabourRoster = async () => {
      try {
        const response = await axios.get(`${API}/site-incharge/labours`);
        if (!cancelled) setLabourRoster(response.data.data || []);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load labour roster:", error);
          toast.error(error.response?.data?.message || "Failed to load labour roster");
        }
      }
    };
    loadLabourRoster();
    return () => { cancelled = true; };
  }, [selectedWorkDescription]);

  const loadCompletionHistory = useCallback(async (records) => {
    const pairs = await Promise.all(records.map(async record => {
      const response = await axios.get(`${API}/site-incharge/completion-entries`, {
        params: { rec_id: record.rec_id, date: selectedDate }
      });
      return [record.rec_id, response.data.data];
    }));
    setCompletionData(Object.fromEntries(pairs));
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedSite || !selectedWorkDescription) {
      setWorkRecords([]);
      setCompletionData({});
      setDispatches([]);
      setUsageData({});
      setSelectedMaterials(new Set());
      setBudgetHeads([]);
      setBudgetExpenseData({});
      return;
    }

    let cancelled = false;
    const loadWorkAndMaterials = async () => {
      setLoading(true);
      setCompletionData({});
      setUsageData({});
      setUsageInputs({});
      setSelectedMaterials(new Set());
      setAssignedLabours([]);
      setBudgetHeads([]);
      setBudgetExpenseData({});
      setBudgetExpenseInputs({});
      try {
        const [reckonerResponse, dispatchResponse, attendanceResponse, budgetResponse] = await Promise.all([
          axios.get(`${API}/reckoner/reckoner/`),
          axios.get(`${API}/material/dispatch-details`, {
            params: {
              pd_id: selectedProject.value,
              site_id: selectedSite.value,
              desc_id: selectedWorkDescription.value
            }
          }),
          axios.get(`${API}/site-incharge/labour-attendance`, {
            params: {
              project_id: selectedProject.value,
              site_id: selectedSite.value,
              desc_id: selectedWorkDescription.value,
              entry_date: selectedDate
            }
          }),
          axios.get(`${API}/site-incharge/budget-details`, {
            params: { site_id: selectedSite.value }
          })
        ]);

        const allReckoner = reckonerResponse.data.success && Array.isArray(reckonerResponse.data.data)
          ? reckonerResponse.data.data
          : [];
        const records = Array.from(new Map(
          allReckoner
            .filter(record =>
              String(record.site_id) === String(selectedSite.value) &&
              String(record.work_descriptions || "").trim().toLowerCase() ===
                selectedWorkDescription.label.trim().toLowerCase()
            )
            .map(record => [record.rec_id, record])
        ).values());
        const uniqueDispatches = Array.from(new Map(
          (dispatchResponse.data.data || []).map(dispatch => [dispatch.id, dispatch])
        ).values());
        const dailyBudgetHeads = (budgetResponse.data.data || []).filter(budget =>
          String(budget.desc_id) === String(selectedWorkDescription.value) &&
          ![1, 2].includes(Number(budget.overhead_id))
        );

        if (cancelled) return;
        setWorkRecords(records);
        setDispatches(uniqueDispatches);
        setBudgetHeads(dailyBudgetHeads);
        const dailyLabours = attendanceResponse.data.data || [];
        setAssignedLabours(dailyLabours);
        setLabourShiftInputs(Object.fromEntries(dailyLabours.map(labour => [
          labour.assignment_id,
          labour.shift === null || labour.shift === undefined ? "" : String(labour.shift)
        ])));
        setLabourRateInputs(Object.fromEntries(dailyLabours.map(labour => [
          labour.assignment_id,
          String(labour.daily_shift_cost ?? labour.shift_rate ?? "")
        ])));
        setLabourRemarksInputs(Object.fromEntries(dailyLabours.map(labour => [
          labour.assignment_id,
          labour.remarks || ""
        ])));

        const [historyResult, acknowledgementResults, budgetExpenseResults] = await Promise.all([
          Promise.all(records.map(async record => {
            const response = await axios.get(`${API}/site-incharge/completion-entries`, {
              params: { rec_id: record.rec_id, date: selectedDate }
            });
            return [record.rec_id, response.data.data];
          })),
          Promise.all(uniqueDispatches.map(async dispatch => {
            const response = await axios.get(`${API}/site-incharge/acknowledgement-details`, {
              params: { material_dispatch_id: dispatch.id }
            });
            const row = response.data.data?.[0];
            return [dispatch.id, row?.acknowledgement || null];
          })),
          Promise.all(dailyBudgetHeads.map(async budget => {
            const response = await axios.get(`${API}/site-incharge/budget-expense-details`, {
              params: { actual_budget_id: budget.id, date: selectedDate }
            });
            return [budget.id, response.data.data];
          }))
        ]);
        if (cancelled) return;
        setCompletionData(Object.fromEntries(historyResult));
        setBudgetExpenseData(Object.fromEntries(budgetExpenseResults));
        const acknowledgements = Object.fromEntries(acknowledgementResults);

        const usageResults = await Promise.all(uniqueDispatches.map(async dispatch => {
          const acknowledgement = acknowledgements[dispatch.id];
          if (!acknowledgement) return [dispatch.id, null];
          const response = await axios.get(`${API}/site-incharge/material-usage-details`, {
            params: { material_ack_id: acknowledgement.id, date: selectedDate }
          });
          return [dispatch.id, {
            acknowledgement,
            ...response.data.data
          }];
        }));
        if (!cancelled) setUsageData(Object.fromEntries(usageResults));
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load work completion and dispatched materials:", error);
          toast.error(error.response?.data?.message || "Failed to load work and material details");
          setWorkRecords([]);
          setDispatches([]);
          setAssignedLabours([]);
          setBudgetHeads([]);
          setBudgetExpenseData({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadWorkAndMaterials();
    return () => { cancelled = true; };
  }, [selectedProject, selectedSite, selectedWorkDescription, selectedDate]);

  const updateCompletionInput = (recId, field, value) => {
    setCompletionInputs(previous => ({
      ...previous,
      [recId]: { ...previous[recId], [field]: value }
    }));
  };

  const updateCompletionEditInput = (field, value) => {
    setCompletionEditInputs(previous => ({ ...previous, [field]: value }));
  };

  const beginCompletionEdit = (entry) => {
    setEditingCompletionEntry({ entryId: entry.entry_id });
    setCompletionEditInputs({
      area_added: String(entry.area_added ?? ""),
      remarks: entry.remarks || ""
    });
  };

  const saveCompletionEdit = async () => {
    const area = Number(completionEditInputs.area_added);
    const remarks = (completionEditInputs.remarks || "").trim();
    if (!Number.isFinite(area) || area < 0 || !remarks) {
      toast.error("Enter a valid non-negative quantity and remarks");
      return;
    }

    setSavingCompletionEdit(true);
    try {
      await axios.put(`${API}/site-incharge/update-completion-entry`, {
        entry_id: editingCompletionEntry.entryId,
        area_added: area,
        remarks,
        updated_by: userId
      });
      toast.success("Work completion entry updated");
      setEditingCompletionEntry(null);
      setCompletionEditInputs({});
      await loadCompletionHistory(workRecords);
    } catch (error) {
      console.error("Failed to edit work completion:", error);
      toast.error(error.response?.data?.message || "Failed to edit work completion");
    } finally {
      setSavingCompletionEdit(false);
    }
  };

  const deleteCompletion = async (entry) => {
    if (!window.confirm("Delete this work completion entry? This action will be recorded in the change history.")) return;
    try {
      await axios.delete(`${API}/site-incharge/delete-completion-entry`, {
        data: { entry_id: entry.entry_id, deleted_by: userId }
      });
      toast.success("Work completion entry deleted");
      await loadCompletionHistory(workRecords);
    } catch (error) {
      console.error("Failed to delete work completion:", error);
      toast.error(error.response?.data?.message || "Failed to delete work completion");
    }
  };

  const saveCompletion = async (record) => {
    const input = completionInputs[record.rec_id] || {};
    const area = Number(input.area_added);
    const remarks = (input.remarks || "").trim();
    const rate = Number(record.rate) || 0;
    if (!Number.isFinite(area) || area <= 0) {
      toast.error("Enter a work completion quantity greater than zero");
      return;
    }
    if (!remarks) {
      toast.error("Work completion remarks are required");
      return;
    }

    let createdBy;
    try {
      createdBy = Number(atob(encodedUserId));
    } catch {
      toast.error("Invalid user ID");
      return;
    }

    setSavingWork(true);
    try {
      await axios.post(`${API}/site-incharge/completion-status`, {
        rec_id: Number(record.rec_id),
        area_added: area,
        rate,
        value: Number((area * rate).toFixed(2)),
        created_by: createdBy,
        entry_date: selectedDate,
        remarks
      });
      toast.success("Work completion saved");
      setCompletionInputs(previous => ({ ...previous, [record.rec_id]: { area_added: "", remarks: "" } }));
      await loadCompletionHistory(workRecords);
    } catch (error) {
      console.error("Failed to save work completion:", error);
      toast.error(error.response?.data?.message || "Failed to save work completion");
    } finally {
      setSavingWork(false);
    }
  };

  const saveLabourAttendance = async () => {
    const attendanceData = assignedLabours.flatMap(labour => {
      const rawShift = labourShiftInputs[labour.assignment_id];
      if ((rawShift === "" || rawShift === undefined || rawShift === null) && !labour.attendance_id) return [];
      const shift = rawShift === "" || rawShift === undefined || rawShift === null
        ? Number(labour.shift)
        : Number(rawShift);
      if (!Number.isFinite(shift) || shift <= 0 || Math.round(shift * 10) !== shift * 10) return [];
      const rawShiftCost = labourRateInputs[labour.assignment_id];
      const shiftCost = rawShiftCost === "" || rawShiftCost === undefined || rawShiftCost === null
        ? Number(labour.shift_rate)
        : Number(rawShiftCost);
      if (!Number.isFinite(shiftCost) || shiftCost <= 0 || Math.abs(shiftCost * 100 - Math.round(shiftCost * 100)) > 1e-8) return [];
      const remarks = labourRemarksInputs[labour.assignment_id]?.trim() || "";
      if (labour.attendance_id && (
        Number(labour.shift) === shift &&
        Number(labour.daily_shift_cost ?? labour.shift_rate) === shiftCost &&
        (labour.remarks || "") === remarks
      )) return [];
      if (labour.attendance_id && !labour.is_editable) return [];
      return [{
        labour_assignment_id: labour.assignment_id,
        entry_date: selectedDate,
        shift,
        shift_cost: shiftCost,
        remarks: remarks || null,
        attendance_id: labour.attendance_id || undefined
      }];
    });

    if (attendanceData.length === 0) {
      toast.error("Enter or change a valid positive shift (for example, 1 or 1.5) for an assigned labour");
      return;
    }

    setSavingLabour(true);
    try {
      await axios.post(`${API}/site-incharge/save-labour-attendance`, {
        attendance_data: attendanceData,
        created_by: Number(userId)
      });
      toast.success("Daily labour shifts saved");
      const response = await axios.get(`${API}/site-incharge/labour-attendance`, {
        params: {
          project_id: selectedProject.value,
          site_id: selectedSite.value,
          desc_id: selectedWorkDescription.value,
          entry_date: selectedDate
        }
      });
      const dailyLabours = response.data.data || [];
      setAssignedLabours(dailyLabours);
      setLabourShiftInputs(Object.fromEntries(dailyLabours.map(labour => [
        labour.assignment_id,
        labour.shift === null || labour.shift === undefined ? "" : String(labour.shift)
      ])));
      setLabourRateInputs(Object.fromEntries(dailyLabours.map(labour => [
        labour.assignment_id,
        String(labour.daily_shift_cost ?? labour.shift_rate ?? "")
      ])));
      setLabourRemarksInputs(Object.fromEntries(dailyLabours.map(labour => [
        labour.assignment_id,
        labour.remarks || ""
      ])));
    } catch (error) {
      console.error("Failed to save daily labour shifts:", error);
      toast.error(error.response?.data?.message || "Failed to save labour shifts");
    } finally {
      setSavingLabour(false);
    }
  };

  const saveLabourAssignment = async () => {
    if (!selectedProject || !selectedSite || !selectedWorkDescription) {
      toast.error("Select a project, site, and work description first");
      return;
    }
    if (selectedAssignmentLabours.length === 0) {
      toast.error("Select at least one labourer");
      return;
    }
    if (!userId) {
      toast.error("User ID is missing from this page");
      return;
    }
    const labourAssignments = selectedAssignmentLabours.map(labour => ({
      labour_id: labour.value,
      shift: Number(labour.shifts),
      shift_cost: Number(labour.shift_cost ?? labour.approved_salary)
    }));
    if (labourAssignments.some(labour =>
      !Number.isFinite(labour.shift) ||
      labour.shift <= 0 ||
      labour.shift > 99.9 ||
      Math.abs(labour.shift * 10 - Math.round(labour.shift * 10)) > 1e-8
    )) {
      toast.error("Enter valid shifts for each labourer, such as 1 or 1.5");
      return;
    }
    if (labourAssignments.some(labour =>
      !Number.isFinite(labour.shift_cost) ||
      labour.shift_cost <= 0 ||
      Math.abs(labour.shift_cost * 100 - Math.round(labour.shift_cost * 100)) > 1e-8
    )) {
      toast.error("Enter a positive per-shift cost with up to two decimal places for each labourer");
      return;
    }

    setSavingLabourAssignment(true);
    let assignmentCreated = false;
    try {
      await axios.post(`${API}/site-incharge/save-labour-assignment`, {
        project_id: selectedProject.value,
        site_id: selectedSite.value,
        desc_id: selectedWorkDescription.value,
        labour_assignments: labourAssignments,
        from_date: selectedDate,
        to_date: selectedDate,
        created_by: Number(userId)
      });
      assignmentCreated = true;
      setSelectedAssignmentLabours([]);
      const attendanceResponse = await axios.get(`${API}/site-incharge/labour-attendance`, {
        params: {
          project_id: selectedProject.value,
          site_id: selectedSite.value,
          desc_id: selectedWorkDescription.value,
          entry_date: selectedDate
        }
      });
      const dailyLabours = attendanceResponse.data.data || [];
      const selectedByLabourId = new Map(
        labourAssignments.map(assignment => [String(assignment.labour_id), assignment])
      );
      const assignedByLabourId = new Map(dailyLabours.map(labour => [String(labour.labour_id), labour]));
      const attendanceData = Array.from(selectedByLabourId.entries()).map(([labourId, assignment]) => {
        const labour = assignedByLabourId.get(labourId);
        if (!labour) return null;
        return {
          labour_assignment_id: labour.assignment_id,
          entry_date: selectedDate,
          shift: assignment.shift,
          shift_cost: assignment.shift_cost
        };
      });
      setAssignedLabours(dailyLabours);
      setLabourShiftInputs(Object.fromEntries(dailyLabours.map(labour => [
        labour.assignment_id,
        selectedByLabourId.has(String(labour.labour_id))
          ? String(selectedByLabourId.get(String(labour.labour_id)).shift)
          : labour.shift === null || labour.shift === undefined ? "" : String(labour.shift)
      ])));
      setLabourRateInputs(Object.fromEntries(dailyLabours.map(labour => [
        labour.assignment_id,
        selectedByLabourId.has(String(labour.labour_id))
          ? String(selectedByLabourId.get(String(labour.labour_id)).shift_cost)
          : String(labour.daily_shift_cost ?? labour.shift_rate ?? "")
      ])));
      setLabourRemarksInputs(Object.fromEntries(dailyLabours.map(labour => [
        labour.assignment_id,
        labour.remarks || ""
      ])));
      if (attendanceData.some(entry => entry === null)) {
        toast.error("Labour was assigned, but one or more assigned rows could not be loaded. Refresh and enter shifts.");
        return;
      }
      await axios.post(`${API}/site-incharge/save-labour-attendance`, {
        attendance_data: attendanceData,
        created_by: Number(userId)
      });
      const refreshedAttendanceResponse = await axios.get(`${API}/site-incharge/labour-attendance`, {
        params: {
          project_id: selectedProject.value,
          site_id: selectedSite.value,
          desc_id: selectedWorkDescription.value,
          entry_date: selectedDate
        }
      });
      const refreshedLabours = refreshedAttendanceResponse.data.data || [];
      setAssignedLabours(refreshedLabours);
      setLabourShiftInputs(Object.fromEntries(refreshedLabours.map(labour => [
        labour.assignment_id,
        labour.shift === null || labour.shift === undefined ? "" : String(labour.shift)
      ])));
      setLabourRateInputs(Object.fromEntries(refreshedLabours.map(labour => [
        labour.assignment_id,
        String(labour.daily_shift_cost ?? labour.shift_rate ?? "")
      ])));
      setLabourRemarksInputs(Object.fromEntries(refreshedLabours.map(labour => [
        labour.assignment_id,
        labour.remarks || ""
      ])));
      toast.success("Labour assigned and shifts saved");
    } catch (error) {
      console.error("Failed to assign labour or save its shifts:", error);
      toast.error(assignmentCreated
        ? "Labour was assigned, but saving or refreshing its shifts failed. Refresh and verify the entry before retrying."
        : error.response?.data?.message || "Labour assignment failed");
    } finally {
      setSavingLabourAssignment(false);
    }
  };

  const updateUsageInput = (dispatchId, field, value) => {
    setUsageInputs(previous => ({
      ...previous,
      [dispatchId]: { ...previous[dispatchId], [field]: value }
    }));
  };

  const toggleMaterial = (dispatchId) => {
    setSelectedMaterials(previous => {
      const next = new Set(previous);
      if (next.has(dispatchId)) next.delete(dispatchId);
      else next.add(dispatchId);
      return next;
    });
  };

  const saveMaterialUsage = async () => {
    if (!userId || selectedMaterials.size === 0) {
      toast.error("Select at least one acknowledged material");
      return;
    }
    const entries = dispatches
      .filter(dispatch => selectedMaterials.has(dispatch.id))
      .map(dispatch => {
        const usage = usageInputs[dispatch.id] || {};
        const quantity = Number(usage.overall_qty);
        const details = usageData[dispatch.id];
        const alreadyUsed = Number(details?.total_cumulative?.overall_qty) || 0;
        const acknowledged = Number(details?.acknowledgement?.overall_quantity) || 0;
        return {
          dispatch,
          ackId: details?.acknowledgement?.id,
          quantity,
          remarks: (usage.remarks || "").trim(),
          remaining: acknowledged - alreadyUsed
        };
      });

    const invalid = entries.find(entry =>
      !entry.ackId || !Number.isInteger(entry.quantity) || entry.quantity <= 0 ||
      entry.quantity > entry.remaining || !entry.remarks
    );
    if (invalid) {
      toast.error("Each selected material needs a valid quantity within the acknowledged balance and a remark");
      return;
    }

    setSavingMaterials(true);
    try {
      await Promise.all(entries.map(entry =>
        axios.post(`${API}/site-incharge/save-material-usage`, {
          material_ack_id: entry.ackId,
          entry_date: selectedDate,
          overall_qty: entry.quantity,
          remarks: entry.remarks,
          created_by: Number(userId)
        })
      ));
      toast.success(`Usage saved for ${entries.length} material(s)`);
      setUsageInputs({});
      setSelectedMaterials(new Set());
      const refreshes = await Promise.all(entries.map(async entry => {
        const response = await axios.get(`${API}/site-incharge/material-usage-details`, {
          params: { material_ack_id: entry.ackId, date: selectedDate }
        });
        return [entry.dispatch.id, {
          acknowledgement: usageData[entry.dispatch.id].acknowledgement,
          ...response.data.data
        }];
      }));
      setUsageData(previous => ({ ...previous, ...Object.fromEntries(refreshes) }));
    } catch (error) {
      console.error("Failed to save material usage:", error);
      toast.error(error.response?.data?.message || "Failed to save one or more material usage entries");
    } finally {
      setSavingMaterials(false);
    }
  };

  const getBudgetExpenseFormKey = (budgetId, formId) => `${budgetId}:${formId}`;

  const updateBudgetExpenseInput = (budgetId, formId, field, value) => {
    const formKey = getBudgetExpenseFormKey(budgetId, formId);
    setBudgetExpenseInputs(previous => ({
      ...previous,
      [formKey]: { ...previous[formKey], [field]: value }
    }));
  };

  const addBudgetExpenseItem = (budgetId) => {
    const formId = `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setBudgetExpenseForms(previous => ({
      ...previous,
      [budgetId]: [...(previous[budgetId] || [{ id: "new" }]), { id: formId }]
    }));
  };

  const editBudgetExpenseEntry = (budgetId, entry) => {
    const formId = `edit-${entry.id}`;
    const formKey = getBudgetExpenseFormKey(budgetId, formId);
    setBudgetExpenseForms(previous => ({
      ...previous,
      [budgetId]: [
        ...(previous[budgetId] || [{ id: "new" }]).filter(form => form.entryId !== entry.id),
        { id: formId, entryId: entry.id }
      ]
    }));
    setBudgetExpenseInputs(previous => ({
      ...previous,
      [formKey]: {
        item_description: entry.item_description || "",
        uom: entry.uom || "",
        quantity: entry.quantity ?? "",
        rate: entry.rate ?? ""
      }
    }));
  };

  const cancelBudgetExpenseEdit = (budgetId, formId) => {
    const formKey = getBudgetExpenseFormKey(budgetId, formId);
    setBudgetExpenseForms(previous => ({
      ...previous,
      [budgetId]: (previous[budgetId] || []).filter(form => form.id !== formId)
    }));
    setBudgetExpenseInputs(previous => {
      const next = { ...previous };
      delete next[formKey];
      return next;
    });
  };

  const saveBudgetExpenseEntry = async (budget, form) => {
    const existing = budgetExpenseData[budget.id]?.entries?.find(entry =>
      String(entry.id) === String(form.entryId)
    );
    if (existing && !existing.is_editable) {
      toast.error("This budget expense is outside the 48-hour edit window");
      return;
    }
    const formKey = getBudgetExpenseFormKey(budget.id, form.id);
    const input = budgetExpenseInputs[formKey] || {};
    const description = String(input.item_description ?? existing?.item_description ?? "").trim();
    const uom = String(input.uom ?? existing?.uom ?? "").trim();
    const quantity = Number(input.quantity ?? existing?.quantity);
    const rate = Number(input.rate ?? existing?.rate);
    if (!description || !uom || !Number.isFinite(quantity) || quantity <= 0 ||
        !Number.isFinite(rate) || rate < 0) {
      toast.error("Enter a description, UOM, positive quantity, and non-negative rate");
      return;
    }
    if (!userId) {
      toast.error("Invalid user ID");
      return;
    }
    const value = Number((quantity * rate).toFixed(2));
    const payload = {
      actual_budget_id: budget.id,
      entry_date: selectedDate,
      item_description: description,
      uom,
      quantity,
      rate,
      actual_value: value
    };

    setSavingBudgetExpense(true);
    try {
      let saveResponse;
      if (existing) {
        saveResponse = await axios.put(`${API}/site-incharge/update-budget-expense-entry`, {
          ...payload,
          entry_id: existing.id,
          updated_by: Number(userId)
        });
      } else {
        saveResponse = await axios.post(`${API}/site-incharge/save-budget-expense`, {
          ...payload,
          created_by: Number(userId)
        });
      }
      const allocationChanges = saveResponse.data?.data?.allocation_changes || [];
      if (allocationChanges.length > 0) {
        const allocationById = new Map(
          allocationChanges.map(change => [Number(change.actual_budget_id), Number(change.splitted_budget)])
        );
        setBudgetHeads(previous => previous.map(head =>
          allocationById.has(Number(head.id))
            ? { ...head, splitted_budget: allocationById.get(Number(head.id)) }
            : head
        ));
      }
      const affectedBudgetIds = new Set([
        Number(budget.id),
        ...allocationChanges.map(change => Number(change.actual_budget_id))
      ]);
      const refreshedBudgetDetails = await Promise.all(
        [...affectedBudgetIds].map(async actualBudgetId => {
          const response = await axios.get(`${API}/site-incharge/budget-expense-details`, {
            params: { actual_budget_id: actualBudgetId, date: selectedDate }
          });
          return [actualBudgetId, response.data.data];
        })
      );
      setBudgetExpenseData(previous => ({
        ...previous,
        ...Object.fromEntries(refreshedBudgetDetails)
      }));
      setBudgetExpenseForms(previous => ({
        ...previous,
        [budget.id]: (previous[budget.id] || []).filter(item => item.id !== form.id)
      }));
      setBudgetExpenseInputs(previous => {
        const next = { ...previous };
        delete next[formKey];
        return next;
      });
      toast.success(saveResponse.data.message || "Budget expense saved");
    } catch (error) {
      console.error("Failed to save budget expense:", error);
      toast.error(error.response?.data?.message || "Failed to save budget expense");
    } finally {
      setSavingBudgetExpense(false);
    }
  };

  const acknowledgedDispatches = dispatches.filter(dispatch => usageData[dispatch.id]?.acknowledgement);
  const workLabel = selectedWorkDescription?.label || "selected work";
  const dailyLabourCost = assignedLabours.reduce((total, labour) => {
    const shift = Number(labourShiftInputs[labour.assignment_id] ?? labour.shift) || 0;
    const shiftRate = Number(labourRateInputs[labour.assignment_id] ?? labour.daily_shift_cost ?? labour.shift_rate) || 0;
    return total + shift * shiftRate;
  }, 0);
  const dailyMaterialCost = acknowledgedDispatches.reduce((total, dispatch) => {
    const entries = usageData[dispatch.id]?.entries || [];
    const quantity = entries.reduce((sum, entry) => sum + (Number(entry.overall_qty) || 0), 0);
    return total + quantity * (Number(dispatch.rate) || 0);
  }, 0);
  const dailyBudgetExpenseCost = budgetHeads.reduce((total, budget) => {
    const entries = budgetExpenseData[budget.id]?.entries || [];
    return total + entries.reduce((sum, entry) => sum + (Number(entry.actual_value) || 0), 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 text-xl font-bold text-gray-900">Work Completion & Material Usage</h1>
        <p className="mb-4 text-sm text-gray-600">Record work completion, labour shifts, materials, and budget-head expenses from one screen.</p>

        <section className="mb-5 grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">
            Company
            <Select className="mt-1" classNamePrefix="react-select" options={companyOptions} value={selectedCompany} onChange={setSelectedCompany} placeholder="Select company" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Project
            <Select className="mt-1" classNamePrefix="react-select" options={projectOptions} value={selectedProject} onChange={setSelectedProject} isDisabled={!selectedCompany} placeholder="Select project" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Site
            <Select className="mt-1" classNamePrefix="react-select" options={siteOptions} value={selectedSite} onChange={setSelectedSite} isDisabled={!selectedProject} placeholder="Select site" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Work Description
            <Select className="mt-1" classNamePrefix="react-select" options={workDescriptionOptions} value={selectedWorkDescription} onChange={setSelectedWorkDescription} isDisabled={!selectedSite} placeholder="Select work" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Entry Date
            <input type="date" max={today} value={selectedDate} onChange={event => setSelectedDate(event.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2" />
          </label>
        </section>

        {loading && <div className="py-8 text-center text-gray-500">Loading work, labour, material, and budget details...</div>}
        {!loading && selectedWorkDescription && workRecords.length === 0 && budgetHeads.length === 0 && (
          <div className="rounded-lg bg-white p-5 text-sm text-gray-600 shadow-sm">No work completion items found for this work description.</div>
        )}

        {!loading && selectedWorkDescription && (
          <div className="space-y-5">
            {workRecords.length > 0 && (
            <section className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Work Completion — {workLabel}</h2>
              <div className="space-y-4">
                {workRecords.map(record => {
                  const history = completionData[record.rec_id] || { entries: [], cumulative_area: 0 };
                  const rate = Number(record.rate) || 0;
                  const assignedQuantity = Number(record.po_quantity) || 0;
                  const cumulativeArea = Number(history.cumulative_area || 0);
                  const exceedsAssignedQuantity = cumulativeArea > assignedQuantity;
                  const cumulativeValue = Number(history.cumulative_area || 0) * rate;
                  let cumulativeAreaAtEntry = cumulativeArea;
                  return (
                    <article key={record.rec_id} className={`rounded-lg border p-4 ${exceedsAssignedQuantity ? "border-red-300 bg-red-50/40" : "border-gray-200"}`}>
                      <div className="font-semibold text-gray-800">{record.subcategory_name || record.work_descriptions}</div>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>Item: {record.item_id}</span>
                        <span>Assigned quantity: {assignedQuantity.toFixed(2)}</span>
                      </div>
                      <div className={`mt-2 text-sm font-medium ${exceedsAssignedQuantity ? "text-red-700" : "text-gray-700"}`}>
                        Completed to date: {cumulativeArea.toFixed(2)} / {assignedQuantity.toFixed(2)} assigned | ₹{cumulativeValue.toFixed(2)}
                      </div>
                      {exceedsAssignedQuantity && (
                        <div className="mt-2 rounded-md border border-red-200 bg-red-100 px-3 py-2 text-sm font-semibold text-red-800">
                          Over assigned quantity by {(cumulativeArea - assignedQuantity).toFixed(2)}
                        </div>
                      )}
                      <div className="mt-3 space-y-2">
                        {history.entries?.map(entry => {
                          const isEditing = editingCompletionEntry?.entryId === entry.entry_id;
                          const entryExceedsAssigned = cumulativeAreaAtEntry > assignedQuantity;
                          cumulativeAreaAtEntry -= Number(entry.area_added) || 0;
                          return (
                            <div key={entry.entry_id} className={`rounded border px-3 py-2 text-sm ${entryExceedsAssigned ? "border-red-300 bg-red-50 text-red-800" : "bg-gray-50 text-gray-700"}`}>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={completionEditInputs.area_added}
                                    onChange={event => updateCompletionEditInput("area_added", event.target.value)}
                                    className="w-full rounded border border-gray-300 px-2 py-1"
                                    aria-label="Edit completed quantity"
                                  />
                                  <input
                                    type="text"
                                    maxLength={255}
                                    value={completionEditInputs.remarks}
                                    onChange={event => updateCompletionEditInput("remarks", event.target.value)}
                                    className="w-full rounded border border-gray-300 px-2 py-1"
                                    aria-label="Edit work completion remarks"
                                  />
                                  {cumulativeArea - Number(entry.area_added) + Number(completionEditInputs.area_added) > assignedQuantity && (
                                    <div className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                                      This edit will exceed assigned quantity by {(
                                        cumulativeArea - Number(entry.area_added) + Number(completionEditInputs.area_added) - assignedQuantity
                                      ).toFixed(2)}.
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={saveCompletionEdit}
                                      disabled={savingCompletionEdit}
                                      className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
                                    >
                                      Save edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCompletionEntry(null);
                                        setCompletionEditInputs({});
                                      }}
                                      className="rounded bg-gray-200 px-3 py-1 text-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="font-medium">{new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Area {Number(entry.area_added).toFixed(2)} · ₹{Number(entry.value_added || 0).toFixed(2)}</div>
                                  <div>{entry.remarks || "No remarks"}</div>
                                  {entry.is_editable && (
                                    <div className="mt-2 flex gap-3">
                                      <button
                                        type="button"
                                        onClick={() => beginCompletionEdit(entry)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                                      >
                                        <Pencil size={13} /> Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteCompletion(entry)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900"
                                      >
                                        <Trash2 size={13} /> Delete
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={completionInputs[record.rec_id]?.area_added || ""}
                          onChange={event => updateCompletionInput(record.rec_id, "area_added", event.target.value)}
                          placeholder="Work completed area/quantity"
                          className="rounded-md border border-gray-300 px-3 py-2"
                        />
                        <input
                          type="text"
                          maxLength={255}
                          value={completionInputs[record.rec_id]?.remarks || ""}
                          onChange={event => updateCompletionInput(record.rec_id, "remarks", event.target.value)}
                          placeholder="Work remarks (required)"
                          className="rounded-md border border-gray-300 px-3 py-2"
                        />
                        <button onClick={() => saveCompletion(record)} disabled={savingWork} className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60">
                          <Save size={16} /> Save work
                        </button>
                      </div>
                      {Number(completionInputs[record.rec_id]?.area_added) > 0 &&
                        cumulativeArea + Number(completionInputs[record.rec_id].area_added) > assignedQuantity && (
                          <div className="mt-2 rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-800">
                            This entry will exceed assigned quantity by {(
                              cumulativeArea + Number(completionInputs[record.rec_id].area_added) - assignedQuantity
                            ).toFixed(2)}. The entry can still be saved and will be highlighted.
                          </div>
                        )}
                    </article>
                  );
                })}
              </div>
            </section>
            )}

            <section className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-800">Daily Labour & Shift Cost — {workLabel}</h2>
                  <p className="text-sm text-gray-600">
                    Enter shifts worked on {selectedDate}. Labour cost is shift cost × shifts.
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 px-4 py-2 text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-amber-700">Daily Labour Cost</div>
                  <div className="text-lg font-bold text-amber-900">₹{dailyLabourCost.toFixed(2)}</div>
                </div>
              </div>
              {assignedLabours.length === 0 ? (
                <div className="space-y-4 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    No labour is assigned to this work for {selectedDate}. Assign labour here to start recording shifts and cost.
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Select labourers
                      <Select
                        className="mt-1"
                        classNamePrefix="react-select"
                        options={labourRosterOptions}
                        value={selectedAssignmentLabours}
                        onChange={options => setSelectedAssignmentLabours(previous => (options || []).map(labour => {
                          const existing = previous.find(item => item.value === labour.value);
                          return {
                            ...labour,
                            shifts: existing?.shifts ?? "",
                            shift_cost: existing?.shift_cost ?? labour.approved_salary ?? ""
                          };
                        }))}
                        isMulti
                        closeMenuOnSelect={false}
                        placeholder="Select one or more labourers"
                      />
                    </label>
                  </div>
                  {selectedAssignmentLabours.length > 0 && (
                    <div className="space-y-2">
                      {selectedAssignmentLabours.map(labour => (
                        <article key={labour.value} className="grid grid-cols-1 items-center gap-3 rounded-md border border-amber-200 bg-white p-3 text-sm sm:grid-cols-[minmax(0,1fr)_9rem_12rem_10rem]">
                          <span className="font-medium text-gray-800">{labour.label}</span>
                          <label className="text-xs font-medium text-gray-600">
                            Total shifts
                            <input
                              type="number"
                              min="0.1"
                              max="99.9"
                              step="0.1"
                              value={labour.shifts}
                              onChange={event => setSelectedAssignmentLabours(previous => previous.map(item =>
                                item.value === labour.value ? { ...item, shifts: event.target.value } : item
                              ))}
                              placeholder="e.g. 1.5"
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Cost per shift (₹)
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={labour.shift_cost}
                              onChange={event => setSelectedAssignmentLabours(previous => previous.map(item =>
                                item.value === labour.value ? { ...item, shift_cost: event.target.value } : item
                              ))}
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                          </label>
                          <div className="text-xs font-medium text-gray-600 sm:text-right">
                            Total cost
                            <div className="mt-1 text-base font-semibold text-gray-800">
                              ₹{(
                                (Number(labour.shifts) || 0) *
                                (Number(labour.shift_cost) || 0)
                              ).toFixed(2)}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={saveLabourAssignment}
                    disabled={savingLabourAssignment || selectedAssignmentLabours.length === 0}
                    className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <UserPlus size={16} />
                    {savingLabourAssignment ? "Assigning labour..." : "Assign labour & save shifts"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {assignedLabours.map(labour => {
                      const shift = Number(labourShiftInputs[labour.assignment_id]) || 0;
                      const shiftRate = Number(labourRateInputs[labour.assignment_id] ?? labour.daily_shift_cost ?? labour.shift_rate) || 0;
                      const canEdit = !labour.attendance_id || labour.is_editable;
                      return (
                        <article key={labour.assignment_id} className="grid grid-cols-1 items-center gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_10rem_1fr_9rem]">
                          <div className="flex min-w-0 items-center gap-2">
                            <HardHat size={17} className="shrink-0 text-amber-600" />
                            <div className="min-w-0">
                              <div className="truncate font-medium text-gray-800">{labour.full_name}</div>
                              <div className="text-xs text-gray-500">Head: {labour.head_name || "No head assigned"}</div>
                            </div>
                          </div>
                          <label className="text-xs font-medium text-gray-600">
                            Shifts worked
                            <input
                              type="number"
                              min="0.1"
                              max="99.9"
                              step="0.1"
                              value={labourShiftInputs[labour.assignment_id] ?? ""}
                              disabled={!canEdit}
                              onChange={event => setLabourShiftInputs(previous => ({
                                ...previous,
                                [labour.assignment_id]: event.target.value
                              }))}
                              placeholder="e.g. 1.5"
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Cost per shift (₹)
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={labourRateInputs[labour.assignment_id] ?? ""}
                              disabled={!canEdit}
                              onChange={event => setLabourRateInputs(previous => ({
                                ...previous,
                                [labour.assignment_id]: event.target.value
                              }))}
                              placeholder="e.g. 800"
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Remark
                            <input
                              type="text"
                              maxLength={255}
                              value={labourRemarksInputs[labour.assignment_id] ?? ""}
                              disabled={!canEdit}
                              onChange={event => setLabourRemarksInputs(previous => ({
                                ...previous,
                                [labour.assignment_id]: event.target.value
                              }))}
                              placeholder="Optional"
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                            />
                          </label>
                          <div className="text-sm sm:text-right">
                            <div className="text-xs text-gray-500">₹{shiftRate.toFixed(2)} / shift</div>
                            <div className="font-semibold text-gray-800">Cost: ₹{(shift * shiftRate).toFixed(2)}</div>
                            {!canEdit && <div className="text-xs text-gray-500">Edit window expired</div>}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={saveLabourAttendance}
                      disabled={savingLabour || !assignedLabours.some(labour => !labour.attendance_id || labour.is_editable)}
                      className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save size={16} />{savingLabour ? "Saving..." : "Save shifts & cost"}
                    </button>
                  </div>
                </>
              )}
            </section>

            <section className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-800">Budget Expense Entry — {workLabel}</h2>
                  <p className="text-sm text-gray-600">
                    Enter each budget head expense for {selectedDate}. Value is calculated as quantity × rate.
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Labour and material budget heads are recorded in their sections above and are not duplicated here.
                  </p>
                </div>
                <div className="rounded-lg bg-indigo-50 px-4 py-2 text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-indigo-700">Daily Budget Expenses</div>
                  <div className="text-lg font-bold text-indigo-900">₹{dailyBudgetExpenseCost.toFixed(2)}</div>
                </div>
              </div>

              {budgetHeads.length === 0 ? (
                <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
                  No additional budget expense heads are configured for this work description.
                </p>
              ) : (
                <div className="space-y-3">
                  {budgetHeads.map(budget => {
                    const details = budgetExpenseData[budget.id] || {};
                    const entries = details.entries || [];
                    const forms = budgetExpenseForms[budget.id] ?? [{ id: "new" }];

                    return (
                      <article key={budget.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{budget.expense_name}</h3>
                            <p className="text-xs text-gray-500">
                              Budget: ₹{(Number(budget.splitted_budget) || 0).toFixed(2)}
                              {" · "}Spent to date: ₹{(Number(details.cumulative?.actual_value) || 0).toFixed(2)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => addBudgetExpenseItem(budget.id)}
                            disabled={savingBudgetExpense}
                            className="inline-flex items-center gap-2 rounded-md border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                          >
                            <Plus size={16} />
                            Add item
                          </button>
                        </div>

                        {entries.length > 0 && (
                          <div className="mb-4 space-y-2">
                            {entries.map((entry, index) => (
                              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                                <div>
                                  <div className="font-medium">
                                    {index + 1}. {entry.item_description || entry.remarks || "Expense"}
                                    {entry.uom ? ` · ${entry.quantity} ${entry.uom}` : ""}
                                    {entry.rate !== null && entry.rate !== undefined
                                      ? ` · ₹${Number(entry.rate).toFixed(2)} / unit`
                                      : ""}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ₹{(Number(entry.actual_value) || 0).toFixed(2)}
                                  </div>
                                </div>
                                {entry.is_editable ? (
                                  <button
                                    type="button"
                                    onClick={() => editBudgetExpenseEntry(budget.id, entry)}
                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                                  >
                                    <Pencil size={14} />
                                    Edit
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-500">Edit window expired</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {details.adjustments?.length > 0 && (
                          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-900">
                              Budget adjustment log
                            </h4>
                            <div className="space-y-1 text-xs text-amber-900">
                              {details.adjustments.map(adjustment => (
                                <div key={adjustment.id}>
                                  ₹{Number(adjustment.amount).toFixed(2)} moved from{" "}
                                  <strong>{adjustment.source_head}</strong> to{" "}
                                  <strong>{adjustment.target_head}</strong>
                                  {" · "}{String(adjustment.entry_date).slice(0, 10)}
                                  {adjustment.adjusted_by ? ` · User ${adjustment.adjusted_by}` : ""}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {forms.map(form => {
                          const existing = entries.find(entry => String(entry.id) === String(form.entryId));
                          const formKey = getBudgetExpenseFormKey(budget.id, form.id);
                          const input = budgetExpenseInputs[formKey] || {};
                          const description = input.item_description ?? existing?.item_description ?? "";
                          const uom = input.uom ?? existing?.uom ?? "";
                          const quantity = input.quantity ?? (existing?.quantity ?? "");
                          const rate = input.rate ?? (existing?.rate ?? "");
                          const quantityNumber = Number(quantity);
                          const rateNumber = Number(rate);
                          const calculatedValue = Number.isFinite(quantityNumber) && quantityNumber > 0 &&
                            Number.isFinite(rateNumber) && rateNumber >= 0
                            ? Number((quantityNumber * rateNumber).toFixed(2))
                            : null;
                          const canEdit = !existing || existing.is_editable;

                          return (
                            <div key={form.id} className="mt-4 rounded-md border border-gray-200 p-3">
                              {existing && (
                                <div className="mb-3 text-sm font-medium text-indigo-700">
                                  Editing saved expense
                                </div>
                              )}
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                          <label className="text-xs font-medium text-gray-600 lg:col-span-2">
                            Description
                            <input
                              type="text"
                              maxLength={255}
                              value={description}
                              disabled={!canEdit}
                              onChange={event => updateBudgetExpenseInput(budget.id, form.id, "item_description", event.target.value)}
                              placeholder="Expense description"
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            UOM
                            <input
                              type="text"
                              maxLength={50}
                              value={uom}
                              disabled={!canEdit}
                              onChange={event => updateBudgetExpenseInput(budget.id, form.id, "uom", event.target.value)}
                              placeholder="e.g. Nos, Ltr"
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                            />
                          </label>
                          <label className="text-xs font-medium text-gray-600">
                            Quantity
                            <input
                              type="number"
                              min="0.001"
                              step="0.001"
                              value={quantity}
                              disabled={!canEdit}
                              onChange={event => updateBudgetExpenseInput(budget.id, form.id, "quantity", event.target.value)}
                              placeholder="Qty"
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                            />
                          </label>
                          <div className="grid grid-cols-2 gap-2 lg:contents">
                            <label className="text-xs font-medium text-gray-600">
                              Rate
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={rate}
                                disabled={!canEdit}
                                onChange={event => updateBudgetExpenseInput(budget.id, form.id, "rate", event.target.value)}
                                placeholder="Rate"
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                              />
                            </label>
                            <div className="text-xs font-medium text-gray-600">
                              Value
                              <div className="mt-1 flex min-h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800">
                                {calculatedValue === null ? "—" : `₹${calculatedValue.toFixed(2)}`}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => cancelBudgetExpenseEdit(budget.id, form.id)}
                            disabled={savingBudgetExpense}
                            className="mr-2 inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <X size={16} />
                            {existing ? "Cancel" : "Remove"}
                          </button>
                          <button
                            type="button"
                            onClick={() => saveBudgetExpenseEntry(budget, form)}
                            disabled={savingBudgetExpense || !canEdit}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Save size={16} />
                            {savingBudgetExpense ? "Saving expense..." : existing ? "Update expense" : "Save expense"}
                          </button>
                        </div>
                            </div>
                          );
                        })}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-800">Materials Used — {workLabel}</h2>
                  <p className="text-sm text-gray-600">Select one or more acknowledged materials and enter the quantity used and a remark for each.</p>
                  <p className="mt-1 text-sm font-medium text-indigo-700">Material cost recorded for {selectedDate}: ₹{dailyMaterialCost.toFixed(2)}</p>
                </div>
                <button onClick={saveMaterialUsage} disabled={savingMaterials || selectedMaterials.size === 0} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
                  <Save size={16} />{savingMaterials ? "Saving..." : `Save ${selectedMaterials.size || ""} material(s)`}
                </button>
              </div>
              {acknowledgedDispatches.length === 0 ? (
                <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">No acknowledged dispatches are available for this work. A material acknowledgement is required before usage can be recorded.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {acknowledgedDispatches.map(dispatch => {
                    const usage = usageData[dispatch.id];
                    const ack = usage.acknowledgement;
                    const used = Number(usage.total_cumulative?.overall_qty) || 0;
                    const acknowledged = Number(ack.overall_quantity) || 0;
                    const remaining = Math.max(acknowledged - used, 0);
                    const input = usageInputs[dispatch.id] || {};
                    const isSelected = selectedMaterials.has(dispatch.id);
                    const ratios = [dispatch.comp_ratio_a, dispatch.comp_ratio_b];
                    if (dispatch.comp_ratio_c !== null) ratios.push(dispatch.comp_ratio_c);
                    return (
                      <article key={dispatch.id} className={`rounded-lg border p-3 ${isSelected ? "border-indigo-400 bg-indigo-50/40" : "border-gray-200"}`}>
                        <label className="flex cursor-pointer items-start gap-3">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleMaterial(dispatch.id)} className="mt-1 h-4 w-4 accent-indigo-600" />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 font-medium text-gray-800"><FileText size={15} />{dispatch.item_name} ({ratios.join(":")})</span>
                            <span className="mt-1 block text-sm text-gray-600">Acknowledged: {acknowledged} {dispatch.uom_name} · Used: {used} · Remaining: {remaining}</span>
                          </span>
                        </label>
                        {isSelected && (
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr]">
                            <input
                              type="number"
                              min="1"
                              max={remaining}
                              step="1"
                              value={input.overall_qty || ""}
                              onChange={event => updateUsageInput(dispatch.id, "overall_qty", event.target.value)}
                              placeholder={`Quantity used (${dispatch.uom_name})`}
                              className="rounded-md border border-gray-300 px-3 py-2"
                            />
                            <input
                              type="text"
                              maxLength={255}
                              value={input.remarks || ""}
                              onChange={event => updateUsageInput(dispatch.id, "remarks", event.target.value)}
                              placeholder="Material usage remark (required)"
                              className="rounded-md border border-gray-300 px-3 py-2"
                            />
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
};

export default WorkAndMaterialEntry;

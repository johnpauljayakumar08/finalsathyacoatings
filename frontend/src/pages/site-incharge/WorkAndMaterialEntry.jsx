import { API_BASE_URL } from "../../config/api.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { FileText, Save, HardHat } from "lucide-react";
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
  const [dispatches, setDispatches] = useState([]);
  const [usageData, setUsageData] = useState({});
  const [usageInputs, setUsageInputs] = useState({});
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [assignedLabours, setAssignedLabours] = useState([]);
  const [labourShiftInputs, setLabourShiftInputs] = useState({});
  const [labourRemarksInputs, setLabourRemarksInputs] = useState({});
  const [budgetHeads, setBudgetHeads] = useState([]);
  const [budgetExpenseData, setBudgetExpenseData] = useState({});
  const [budgetExpenseInputs, setBudgetExpenseInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingWork, setSavingWork] = useState(false);
  const [savingMaterials, setSavingMaterials] = useState(false);
  const [savingLabour, setSavingLabour] = useState(false);
  const [savingBudgetExpense, setSavingBudgetExpense] = useState(false);

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
    setLabourRemarksInputs({});
    setBudgetHeads([]);
    setBudgetExpenseData({});
    setBudgetExpenseInputs({});
  }, [selectedSite]);

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
      if (rawShift === "" || rawShift === undefined || rawShift === null) return [];
      const shift = Number(rawShift);
      if (!Number.isFinite(shift) || shift <= 0 || Math.round(shift * 10) !== shift * 10) return [];
      const remarks = labourRemarksInputs[labour.assignment_id]?.trim() || "";
      if (labour.attendance_id && (
        Number(labour.shift) === shift &&
        (labour.remarks || "") === remarks
      )) return [];
      if (labour.attendance_id && !labour.is_editable) return [];
      return [{
        labour_assignment_id: labour.assignment_id,
        entry_date: selectedDate,
        shift,
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

  const updateBudgetExpenseInput = (budgetId, field, value) => {
    setBudgetExpenseInputs(previous => ({
      ...previous,
      [budgetId]: { ...previous[budgetId], [field]: value }
    }));
  };

  const saveBudgetExpenseEntry = async (budget) => {
    const existing = budgetExpenseData[budget.id]?.entries?.[0];
    if (existing && !existing.is_editable) {
      toast.error("This budget expense is outside the 48-hour edit window");
      return;
    }
    const input = budgetExpenseInputs[budget.id] || {};
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
      if (existing) {
        await axios.put(`${API}/site-incharge/update-budget-expense-entry`, {
          ...payload,
          entry_id: existing.id,
          updated_by: Number(userId)
        });
      } else {
        await axios.post(`${API}/site-incharge/save-budget-expense`, {
          ...payload,
          created_by: Number(userId)
        });
      }
      const response = await axios.get(`${API}/site-incharge/budget-expense-details`, {
        params: { actual_budget_id: budget.id, date: selectedDate }
      });
      setBudgetExpenseData(previous => ({ ...previous, [budget.id]: response.data.data }));
      setBudgetExpenseInputs(previous => ({ ...previous, [budget.id]: {} }));
      toast.success(response.data.message || "Budget expense saved");
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
    return total + shift * (Number(labour.shift_rate) || 0);
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

        {!loading && (workRecords.length > 0 || budgetHeads.length > 0) && (
          <div className="space-y-5">
            {workRecords.length > 0 && (
            <section className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold text-gray-800">Work Completion — {workLabel}</h2>
              <div className="space-y-4">
                {workRecords.map(record => {
                  const history = completionData[record.rec_id] || { entries: [], cumulative_area: 0 };
                  const rate = Number(record.rate) || 0;
                  const cumulativeValue = Number(history.cumulative_area || 0) * rate;
                  return (
                    <article key={record.rec_id} className="rounded-lg border border-gray-200 p-4">
                      <div className="font-semibold text-gray-800">{record.subcategory_name || record.work_descriptions}</div>
                      <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>Item: {record.item_id}</span>
                        <span>Rate: ₹{rate.toFixed(2)}</span>
                      </div>
                      <div className="mt-2 text-sm">
                        Progress to date: {Number(history.cumulative_area || 0).toFixed(2)} area | ₹{cumulativeValue.toFixed(2)}
                      </div>
                      <div className="mt-3 space-y-2">
                        {history.entries?.map(entry => (
                          <div key={entry.entry_id} className="rounded border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                            <div className="font-medium">{new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Area {Number(entry.area_added).toFixed(2)} · ₹{Number(entry.value_added || 0).toFixed(2)}</div>
                            <div>{entry.remarks || "No remarks"}</div>
                          </div>
                        ))}
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
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  No labour is assigned to this work for {selectedDate}. Add the assignment and date range in Labour Assignment first.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {assignedLabours.map(labour => {
                      const shift = Number(labourShiftInputs[labour.assignment_id]) || 0;
                      const shiftRate = Number(labour.shift_rate) || 0;
                      const canEdit = !labour.attendance_id || labour.is_editable;
                      return (
                        <article key={labour.assignment_id} className="grid grid-cols-1 items-center gap-3 rounded-lg border border-gray-200 p-3 sm:grid-cols-[minmax(0,1fr)_9rem_1fr_9rem]">
                          <div className="flex min-w-0 items-center gap-2">
                            <HardHat size={17} className="shrink-0 text-amber-600" />
                            <div className="min-w-0">
                              <div className="truncate font-medium text-gray-800">{labour.full_name}</div>
                              <div className="text-xs text-gray-500">Labour #{labour.labour_id}</div>
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
                      <Save size={16} />{savingLabour ? "Saving shifts..." : "Save daily shifts"}
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
                    const existing = details.entries?.[0];
                    const input = budgetExpenseInputs[budget.id] || {};
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
                      <article key={budget.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">{budget.expense_name}</h3>
                            <p className="text-xs text-gray-500">
                              Budget: ₹{(Number(budget.splitted_budget) || 0).toFixed(2)}
                              {" · "}Spent to date: ₹{(Number(details.cumulative?.actual_value) || 0).toFixed(2)}
                            </p>
                          </div>
                          {existing && !canEdit && (
                            <span className="text-xs text-gray-500">Edit window expired</span>
                          )}
                        </div>

                        {existing && (
                          <div className="mb-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                            <div className="font-medium">Saved for {selectedDate}</div>
                            <div>
                              {existing.item_description || existing.remarks || "Expense"}
                              {existing.uom ? ` · ${existing.quantity} ${existing.uom}` : ""}
                              {existing.rate !== null && existing.rate !== undefined
                                ? ` · ₹${Number(existing.rate).toFixed(2)} / unit`
                                : ""}
                              {" · "}Value: ₹{(Number(existing.actual_value) || 0).toFixed(2)}
                            </div>
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
                              onChange={event => updateBudgetExpenseInput(budget.id, "item_description", event.target.value)}
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
                              onChange={event => updateBudgetExpenseInput(budget.id, "uom", event.target.value)}
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
                              onChange={event => updateBudgetExpenseInput(budget.id, "quantity", event.target.value)}
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
                                onChange={event => updateBudgetExpenseInput(budget.id, "rate", event.target.value)}
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
                            onClick={() => saveBudgetExpenseEntry(budget)}
                            disabled={savingBudgetExpense || !canEdit}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Save size={16} />
                            {savingBudgetExpense ? "Saving expense..." : existing ? "Update expense" : "Save expense"}
                          </button>
                        </div>
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

import { API_BASE_URL } from "../../config/api.js";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const REPORTS = {
  completion: {
    label: "Work completion",
    columns: [
      ["site_name", "Site"],
      ["item_display", "Item"],
      ["work_description", "Work description"],
      ["entry_date", "Date"],
      ["completed_quantity", "Completed quantity"],
      ["uom", "UOM"],
      ["rate", "Rate"],
      ["completed_work_cost", "Completed work value"],
      ["remarks", "Remarks"]
    ]
  },
  labour: {
    label: "Labour cost",
    columns: [
      ["site_name", "Site"],
      ["work_description", "Work description"],
      ["entry_date", "Date"],
      ["labour_name", "Labour"],
      ["shift", "Shifts"],
      ["shift_cost", "Cost per shift"],
      ["labour_cost", "Labour cost"],
      ["remarks", "Remarks"]
    ]
  },
  materials: {
    label: "Materials used",
    columns: [
      ["site_name", "Site"],
      ["work_description", "Work description"],
      ["entry_date", "Date"],
      ["item_name", "Material"],
      ["quantity", "Quantity used"],
      ["uom_name", "UOM"],
      ["rate", "Rate"],
      ["material_cost", "Material cost"],
      ["remarks", "Remarks"]
    ]
  },
  expenses: {
    label: "Budget expenses",
    columns: [
      ["site_name", "Site"],
      ["work_description", "Work description"],
      ["entry_date", "Date"],
      ["budget_head", "Budget head"],
      ["item_description", "Description"],
      ["quantity", "Quantity"],
      ["uom", "UOM"],
      ["rate", "Rate"],
      ["expense_cost", "Actual cost"],
      ["remarks", "Remarks"]
    ]
  },
  budgetSummary: {
    label: "Budget summary",
    columns: [
      ["site_name", "Site"],
      ["work_description", "Work description"],
      ["budget_head", "Budget head"],
      ["allocated_budget", "Allocated budget"],
      ["spent", "Spent in selected period"],
      ["balance", "Allocation less period spend"]
    ]
  }
};

const SUMMARY_COLUMNS = {
  completion: [
    ["completed_work_cost", "Completed work value"]
  ],
  labour: [
    ["shift", "Total shifts"],
    ["labour_cost", "Total labour cost"]
  ],
  materials: [
    ["quantity", "Total quantity used"],
    ["material_cost", "Material cost"]
  ],
  expenses: [["expense_cost", "Total expense"]],
  budgetSummary: [
    ["allocated_budget", "Allocated budget"],
    ["spent", "Spent in selected period"],
    ["balance", "Allocation less period spend"]
  ]
};

const COST_PERCENTAGE_CONFIG = {
  labour: { field: "labour_cost", label: "Labour cost" },
  materials: { field: "material_cost", label: "Material cost" },
  expenses: { field: "expense_cost", label: "Budget expenses" },
  budgetSummary: { field: "spent", label: "Budget summary spend" }
};

const REPORT_CHART_COLORS = ["#4f46e5", "#0891b2", "#16a34a", "#d97706", "#db2777"];

const amountFields = new Set([
  "rate",
  "shift_cost",
  "labour_cost",
  "material_cost",
  "expense_cost",
  "completed_work_cost",
  "allocated_budget",
  "spent",
  "balance"
]);

const numberValue = value => Number(value) || 0;
const formatValue = (field, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (amountFields.has(field)) return `₹${numberValue(value).toFixed(2)}`;
  if (typeof value === "number" || (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))) {
    return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 3 });
  }
  return String(value);
};

const summarizeRows = (rows, reportKey) => {
  const grouped = new Map();
  for (const row of rows) {
    const teamName = row.team_name || "Other labourers";
    const key = reportKey === "labour"
      ? `${row.site_id}:${row.desc_id}:${teamName}`
      : `${row.site_id}:${row.desc_id}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        site_id: row.site_id,
        site_name: row.site_name,
        project_name: row.project_name,
        desc_id: row.desc_id,
        work_description: row.work_description,
        team_name: reportKey === "labour" ? teamName : undefined,
        completed_work_cost: 0,
        shift: 0,
        labour_cost: 0,
        quantity: 0,
        material_cost: 0,
        expense_cost: 0,
        allocated_budget: 0,
        spent: 0,
        balance: 0
      });
    }
    const summary = grouped.get(key);
    for (const [field] of SUMMARY_COLUMNS[reportKey]) {
      summary[field] += numberValue(row[field]);
    }
  }
  return [...grouped.values()];
};

const SiteOperationsReports = () => {
  const [sites, setSites] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [siteId, setSiteId] = useState("");
  const [descriptionId, setDescriptionId] = useState("");
  const [dateMode, setDateMode] = useState("all");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [chartType, setChartType] = useState("bar");
  const [detailMode, setDetailMode] = useState("both");
  const [reports, setReports] = useState(null);
  const [appliedFilterLabel, setAppliedFilterLabel] = useState("");
  const [activeReport, setActiveReport] = useState("completion");
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadFilters = async () => {
      setFiltersLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/site-incharge/reports/filters`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
            params: siteId ? { site_id: siteId } : {}
          }
        );
        if (!active) return;
        setSites(response.data.data.sites || []);
        setDescriptions(response.data.data.descriptions || []);
      } catch (error) {
        if (active) {
          console.error("Failed to load report filters:", error);
          toast.error(error.response?.data?.message || "Failed to load report filters");
        }
      } finally {
        if (active) setFiltersLoading(false);
      }
    };
    loadFilters();
    return () => {
      active = false;
    };
  }, [siteId]);

  const queryFilters = () => {
    const params = {};
    if (siteId) params.site_id = siteId;
    if (descriptionId) params.desc_id = descriptionId;
    if (dateMode === "date" && singleDate) params.date = singleDate;
    if (dateMode === "range") {
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }
    return params;
  };

  const generateReports = async event => {
    event.preventDefault();
    if (dateMode === "date" && !singleDate) {
      toast.error("Choose a date or select no date filter");
      return;
    }
    if (dateMode === "range" && startDate && endDate && startDate > endDate) {
      toast.error("From date cannot be later than To date");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/site-incharge/reports/site-operations`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          params: queryFilters()
        }
      );
      setReports(response.data.data);
      const selectedSite = sites.find(site => String(site.site_id) === siteId);
      const selectedDescription = descriptions.find(item => String(item.desc_id) === descriptionId);
      const dateLabel = dateMode === "date"
        ? `Date: ${singleDate}`
        : dateMode === "range" && (startDate || endDate)
          ? `Date range: ${startDate || "Any"} to ${endDate || "Any"}`
          : "All dates";
      setAppliedFilterLabel([
        selectedSite?.site_name || (siteId ? `Site ${siteId}` : "All sites"),
        selectedDescription?.desc_name || "All work descriptions",
        dateLabel
      ].join(" · "));
      toast.success("Reports generated");
    } catch (error) {
      console.error("Failed to generate reports:", error);
      toast.error(error.response?.data?.message || "Failed to generate reports");
    } finally {
      setLoading(false);
    }
  };

  const summaries = useMemo(() => {
    if (!reports) return {};
    return Object.fromEntries(
      Object.keys(REPORTS).map(key => [key, summarizeRows(reports[key] || [], key)])
    );
  }, [reports]);

  const costPercentages = useMemo(() => {
    if (!reports) return {};
    const completedWorkCost = (reports.completion || [])
      .reduce((total, row) => total + numberValue(row.completed_work_cost), 0);

    return Object.fromEntries(
      Object.entries(COST_PERCENTAGE_CONFIG).map(([key, { field }]) => {
        const headCost = (reports[key] || [])
          .reduce((total, row) => total + numberValue(row[field]), 0);
        return [key, completedWorkCost > 0 ? (headCost / completedWorkCost) * 100 : null];
      })
    );
  }, [reports]);

  const dashboardChartData = useMemo(() => {
    if (!reports) return [];
    const sumField = (reportKey, field) => (reports[reportKey] || [])
      .reduce((total, row) => total + numberValue(row[field]), 0);

    return [
      { name: "Work completion", value: sumField("completion", "completed_work_cost") },
      { name: "Labour cost", value: sumField("labour", "labour_cost") },
      { name: "Materials", value: sumField("materials", "material_cost") },
      { name: "Budget expenses", value: sumField("expenses", "expense_cost") },
      { name: "Budget summary spend", value: sumField("budgetSummary", "spent") }
    ];
  }, [reports]);

  const reportKeys = Object.keys(REPORTS);
  const exportExcel = async () => {
    if (!reports) return;
    try {
      const excelModule = await import("exceljs");
      const ExcelJS = excelModule.default || excelModule;
      const workbook = new ExcelJS.Workbook();
      if (detailMode !== "detail") {
        const overview = workbook.addWorksheet("Overview");
        overview.addRow(["Report", "Site", "Work description", "Team", "Metric", "Value"]);
        for (const key of reportKeys) {
          for (const row of summaries[key] || []) {
            for (const [field, label] of SUMMARY_COLUMNS[key]) {
              overview.addRow([REPORTS[key].label, row.site_name, row.work_description, row.team_name || "", label, numberValue(row[field])]);
            }
          }
          if (Object.hasOwn(COST_PERCENTAGE_CONFIG, key)) {
            const percentage = costPercentages[key];
            overview.addRow([
              REPORTS[key].label,
              "All filtered sites",
              "All filtered work descriptions",
              key === "labour" ? "All teams" : "",
              `${COST_PERCENTAGE_CONFIG[key].label} as % of completed work value`,
              percentage === null ? "—" : `${percentage.toFixed(2)}%`
            ]);
          }
        }
      }

      for (const key of reportKeys) {
        const worksheet = workbook.addWorksheet(REPORTS[key].label.slice(0, 31));
        if (detailMode !== "detail") {
          const columns = [
            ["site_name", "Site"],
            ["work_description", "Work description"],
            ...(key === "labour" ? [["team_name", "Team"]] : []),
            ...SUMMARY_COLUMNS[key]
          ];
          worksheet.addRow(columns.map(([, label]) => label));
          for (const row of summaries[key] || []) {
            worksheet.addRow(columns.map(([field]) => row[field] ?? ""));
          }
        }
        if (detailMode !== "summary") {
          if (detailMode === "both") worksheet.addRow([]);
          worksheet.addRow(REPORTS[key].columns.map(([, label]) => label));
          for (const row of reports[key] || []) {
            worksheet.addRow(REPORTS[key].columns.map(([field]) => row[field] ?? ""));
          }
        }
        worksheet.getRow(1).font = { bold: true };
        worksheet.columns.forEach(column => {
          const values = column.values.filter(value => value !== null && value !== undefined && value !== "");
          column.width = Math.min(
            Math.max(12, ...values.map(value => String(value).length)) + 2,
            36
          );
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "site-operations-reports.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to export Excel report:", error);
      toast.error("Failed to create Excel report");
    }
  };

  const exportPdf = async () => {
    const element = document.getElementById("site-operations-report-print");
    if (!element || !reports) return;
    try {
      await html2pdf().set({
        margin: 8,
        filename: `site-operations-${activeReport}.pdf`,
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          onclone: clonedDocument => {
            const report = clonedDocument.getElementById("site-operations-report-print");
            if (!report) return;
            clonedDocument.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => node.remove());
            report.querySelectorAll("[class]").forEach(node => node.removeAttribute("class"));

            const companyHeader = clonedDocument.createElement("div");
            companyHeader.id = "pdf-company-header";
            const companyLogo = clonedDocument.createElement("img");
            companyLogo.src = `${window.location.origin}/logo_abstract.png`;
            companyLogo.alt = "Sathya Hitec Solutions logo";
            const companyDetails = clonedDocument.createElement("div");
            const companyName = clonedDocument.createElement("h1");
            companyName.textContent = "SATHYA HITEC SOLUTIONS LLP";
            const reportName = clonedDocument.createElement("p");
            reportName.textContent = "SITE OPERATIONS REPORT";
            companyDetails.append(companyName, reportName);
            companyHeader.append(companyLogo, companyDetails);
            report.prepend(companyHeader);

            const numericHeaders = /(quantity|shift|rate|cost|value|budget|spent|balance)/i;
            report.querySelectorAll("table").forEach(table => {
              const headers = [...table.querySelectorAll("thead th")];
              table.querySelectorAll("tbody tr").forEach(row => {
                [...row.querySelectorAll("td")].forEach((cell, index) => {
                  const header = headers[index]?.textContent?.trim() || "";
                  cell.style.textAlign = numericHeaders.test(header)
                    ? "right"
                    : /^date$/i.test(header) || /^uom$/i.test(header)
                      ? "center"
                      : "left";
                });
              });
            });

            const printStyles = clonedDocument.createElement("style");
            printStyles.textContent = `
              html, body { margin: 0; padding: 0; background: #ffffff; }
              #site-operations-report-print {
                width: 100%; padding: 4px; box-sizing: border-box;
                color: #1f2937; background: #ffffff;
                font: 11px Arial, sans-serif;
              }
              #site-operations-report-print * { box-shadow: none !important; }
              #pdf-company-header {
                display: flex; align-items: center; gap: 12px;
                margin: 0 0 14px; padding: 0 0 10px;
                border-bottom: 2px solid #0f766e;
                page-break-after: avoid; break-after: avoid;
              }
              #pdf-company-header img {
                width: 58px; height: 58px; object-fit: contain; flex: 0 0 auto;
              }
              #pdf-company-header h1 {
                margin: 0; color: #134e4a; font-size: 18px; font-weight: 700;
                letter-spacing: 0.4px;
              }
              #pdf-company-header p {
                margin: 4px 0 0; color: #475569; font-size: 9px;
                font-weight: 700; letter-spacing: 1.2px;
              }
              #site-operations-report-print h3 { margin: 10px 0 6px; font-size: 15px; color: #0f172a; }
              #site-operations-report-print h4 { margin: 10px 0 5px; font-size: 12px; color: #334155; }
              #site-operations-report-print p { margin: 4px 0 8px; font-size: 9px; color: #475569; }
              #site-operations-report-print table {
                width: 100%; margin: 0 0 14px; border-collapse: collapse;
                table-layout: auto; font-size: 10px;
              }
              #site-operations-report-print th,
              #site-operations-report-print td {
                padding: 6px 7px; border: 1px solid #cbd5e1;
                color: #1f2937; vertical-align: middle;
              }
              #site-operations-report-print th {
                background: #e2e8f0; color: #0f172a; font-weight: 700;
                text-align: left;
              }
              #site-operations-report-print thead { display: table-header-group; }
              #site-operations-report-print tr {
                page-break-inside: avoid; break-inside: avoid;
              }
            `;
            clonedDocument.head.appendChild(printStyles);
          }
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        pagebreak: { mode: ["css", "legacy"] }
      }).from(element).save();
    } catch (error) {
      console.error("Failed to export PDF report:", error);
      toast.error("Failed to create PDF report");
    }
  };

  const currentRows = reports?.[activeReport] || [];
  const currentSummary = summaries[activeReport] || [];
  const config = REPORTS[activeReport];
  const isLabourReport = activeReport === "labour";
  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Site Operations Reports</h1>
          <p className="mt-1 text-sm text-slate-600">
            Filter by site, work description, and date. Review summary and entry-level costs, then export to Excel or PDF.
          </p>
        </header>

        <form onSubmit={generateReports} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm font-medium text-slate-700">
            Site
            <select
              value={siteId}
              onChange={event => {
                setSiteId(event.target.value);
                setDescriptionId("");
              }}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">All sites</option>
              {sites.map(site => (
                <option key={site.site_id} value={site.site_id}>
                  {site.site_name || site.site_id}{site.project_name ? ` — ${site.project_name}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Work description
            <select
              value={descriptionId}
              onChange={event => setDescriptionId(event.target.value)}
              disabled={filtersLoading}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100"
            >
              <option value="">All work descriptions</option>
              {descriptions.map(description => (
                <option key={description.desc_id} value={description.desc_id}>{description.desc_name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Date filter
            <select
              value={dateMode}
              onChange={event => setDateMode(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="all">All dates</option>
              <option value="date">Single date</option>
              <option value="range">Date range</option>
            </select>
          </label>

          {dateMode === "date" && (
            <label className="text-sm font-medium text-slate-700">
              Entry date
              <input type="date" value={singleDate} onChange={event => setSingleDate(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>
          )}
          {dateMode === "range" && (
            <>
              <label className="text-sm font-medium text-slate-700">
                From date
                <input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                To date
                <input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
            </>
          )}

          <label className="text-sm font-medium text-slate-700">
            Display
            <select value={detailMode} onChange={event => setDetailMode(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="both">Summary and details</option>
              <option value="summary">Summary only</option>
              <option value="detail">Details only</option>
            </select>
          </label>

          <div className="flex items-end">
            <button type="submit" disabled={loading || filtersLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Generate reports
            </button>
          </div>
        </form>

        {reports && (
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Report results</h2>
                <p className="text-sm text-slate-500">{appliedFilterLabel} · Budget summary spend is for the selected period.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-md border border-slate-300 p-1" role="group" aria-label="Report view">
                  <button
                    type="button"
                    aria-pressed={viewMode === "table"}
                    onClick={() => setViewMode("table")}
                    className={`rounded px-3 py-2 text-sm font-medium ${viewMode === "table" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    aria-pressed={viewMode === "dashboard"}
                    onClick={() => setViewMode("dashboard")}
                    className={`rounded px-3 py-2 text-sm font-medium ${viewMode === "dashboard" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                  >
                    Dashboard
                  </button>
                </div>
                {viewMode === "dashboard" && (
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    Chart
                    <select
                      value={chartType}
                      onChange={event => setChartType(event.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-2"
                    >
                      <option value="bar">Bar</option>
                      <option value="pie">Pie</option>
                    </select>
                  </label>
                )}
                <button type="button" onClick={exportExcel} className="inline-flex items-center gap-2 rounded-md border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50">
                  <FileSpreadsheet size={16} /> Excel
                </button>
                <button type="button" onClick={exportPdf} className="inline-flex items-center gap-2 rounded-md border border-rose-300 px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-50">
                  <FileText size={16} /> PDF
                </button>
              </div>
            </div>

            {viewMode === "table" && (
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                {reportKeys.map(key => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setActiveReport(key)}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${activeReport === key ? "bg-indigo-100 text-indigo-800" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    {REPORTS[key].label}
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs">{reports[key]?.length || 0}</span>
                  </button>
                ))}
              </div>
            )}

            <div id="site-operations-report-print" className="space-y-5 bg-white">
              {viewMode === "dashboard" ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">All report heads</h3>
                    <p className="text-xs text-slate-500">
                      {appliedFilterLabel} · Budget summary is a roll-up and overlaps other report totals.
                    </p>
                  </div>
                  {dashboardChartData.some(item => item.value > 0) ? (
                    <div
                      className="h-[420px] w-full rounded-lg border border-slate-200 p-4"
                      style={{ height: 420, width: "100%" }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === "bar" ? (
                          <BarChart data={dashboardChartData} margin={{ top: 16, right: 24, left: 16, bottom: 56 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" angle={-18} textAnchor="end" interval={0} height={64} />
                            <YAxis tickFormatter={value => `₹${Number(value).toLocaleString("en-IN")}`} />
                            <Tooltip formatter={value => [`₹${numberValue(value).toFixed(2)}`, "Total"]} />
                            <Bar dataKey="value" name="Total cost" radius={[4, 4, 0, 0]}>
                              {dashboardChartData.map((item, index) => (
                                <Cell key={item.name} fill={REPORT_CHART_COLORS[index % REPORT_CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        ) : (
                          <PieChart>
                            <Pie
                              data={dashboardChartData.filter(item => item.value > 0)}
                              dataKey="value"
                              nameKey="name"
                              outerRadius={140}
                              label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                            >
                              {dashboardChartData.filter(item => item.value > 0).map(item => (
                                <Cell key={item.name} fill={REPORT_CHART_COLORS[dashboardChartData.indexOf(item) % REPORT_CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={value => `₹${numberValue(value).toFixed(2)}`} />
                            <Legend />
                          </PieChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
                      No cost data is available for the selected filters.
                    </div>
                  )}
                </div>
              ) : (
                <>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{config.label}</h3>
                <p className="text-xs text-slate-500">{appliedFilterLabel}</p>
              </div>

              {Object.hasOwn(COST_PERCENTAGE_CONFIG, activeReport) && (
                <div className="rounded-lg border-2 border-amber-400 bg-amber-100 px-4 py-3 text-amber-950">
                  <div className="text-sm font-semibold">
                    {COST_PERCENTAGE_CONFIG[activeReport].label} as % of completed work value
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {costPercentages[activeReport] === null
                      ? "—"
                      : `${costPercentages[activeReport].toFixed(2)}%`}
                  </div>
                </div>
              )}

              {detailMode !== "detail" && (
                <div className="overflow-x-auto">
                  <h4 className="mb-2 font-semibold text-slate-800">
                    {isLabourReport
                      ? "Summary by site, work description, and team"
                      : "Summary by site and work description"}
                  </h4>
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border px-3 py-2 text-left">Site</th>
                        <th className="border px-3 py-2 text-left">Work description</th>
                        {isLabourReport && <th className="border px-3 py-2 text-left">Team</th>}
                        {SUMMARY_COLUMNS[activeReport].map(([, label]) => <th key={label} className="border px-3 py-2 text-right">{label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSummary.length ? currentSummary.map(row => (
                        <tr key={`${row.site_id}-${row.desc_id}-${row.team_name || ""}`}>
                          <td className="border px-3 py-2">{row.site_name || row.site_id}</td>
                          <td className="border px-3 py-2">{row.work_description || "—"}</td>
                          {isLabourReport && <td className="border px-3 py-2">{row.team_name || "Other labourers"}</td>}
                          {SUMMARY_COLUMNS[activeReport].map(([field]) => (
                            <td key={field} className="border px-3 py-2 text-right">{formatValue(field, row[field])}</td>
                          ))}
                        </tr>
                      )) : (
                        <tr><td className="border px-3 py-4 text-center text-slate-500" colSpan={2 + (isLabourReport ? 1 : 0) + SUMMARY_COLUMNS[activeReport].length}>No summary rows match these filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {detailMode !== "summary" && (
                <div className="overflow-x-auto">
                  <h4 className="mb-2 font-semibold text-slate-800">Detailed entries</h4>
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-100">
                      <tr>{config.columns.map(([, label]) => <th key={label} className="border px-3 py-2 text-left">{label}</th>)}</tr>
                    </thead>
                    <tbody>
                      {currentRows.length ? currentRows.map((row, index) => (
                        <tr key={row.entry_id || `${row.site_id}-${row.desc_id}-${index}`}>
                          {config.columns.map(([field]) => <td key={field} className="border px-3 py-2">{formatValue(field, row[field])}</td>)}
                        </tr>
                      )) : (
                        <tr><td className="border px-3 py-4 text-center text-slate-500" colSpan={config.columns.length}>No detailed entries match these filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
                </>
              )}
            </div>
          </section>
        )}

        {!reports && !loading && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            <Download className="mx-auto mb-2 h-7 w-7 text-slate-400" />
            Select filters and generate reports to view site operations data.
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteOperationsReports;

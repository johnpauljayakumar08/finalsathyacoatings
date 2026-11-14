import { API_BASE_URL } from "../../config/api.js";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const REPORTS = {
  completion: {
    label: "Work completion",
    columns: [
      ["site_name", "Site"],
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
    ["completed_quantity", "Completed quantity"],
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
    const key = `${row.site_id}:${row.desc_id}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        site_id: row.site_id,
        site_name: row.site_name,
        project_name: row.project_name,
        desc_id: row.desc_id,
        work_description: row.work_description,
        completed_quantity: 0,
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

  const reportKeys = Object.keys(REPORTS);
  const exportExcel = async () => {
    if (!reports) return;
    try {
      const excelModule = await import("exceljs");
      const ExcelJS = excelModule.default || excelModule;
      const workbook = new ExcelJS.Workbook();
      if (detailMode !== "detail") {
        const overview = workbook.addWorksheet("Overview");
        overview.addRow(["Report", "Site", "Work description", "Metric", "Value"]);
        for (const key of reportKeys) {
          for (const row of summaries[key] || []) {
            for (const [field, label] of SUMMARY_COLUMNS[key]) {
              overview.addRow([REPORTS[key].label, row.site_name, row.work_description, label, numberValue(row[field])]);
            }
          }
        }
      }

      for (const key of reportKeys) {
        const worksheet = workbook.addWorksheet(REPORTS[key].label.slice(0, 31));
        if (detailMode !== "detail") {
          const columns = [
            ["site_name", "Site"],
            ["work_description", "Work description"],
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
          column.width = Math.min(
            Math.max(...worksheet.getColumn(column.number).values.map(value => String(value || "").length), 12) + 2,
            36
          );
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "site-operations-reports.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
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
            const printStyles = clonedDocument.createElement("style");
            printStyles.textContent = `
              html, body { margin: 0; padding: 0; background: #ffffff; }
              #site-operations-report-print {
                width: 100%; padding: 8px; box-sizing: border-box;
                color: #1f2937; background: #ffffff;
                font: 10px Arial, sans-serif;
              }
              #site-operations-report-print * { box-shadow: none !important; }
              #site-operations-report-print h3 { margin: 10px 0 6px; font-size: 16px; }
              #site-operations-report-print h4 { margin: 8px 0 4px; font-size: 12px; }
              #site-operations-report-print p { margin: 4px 0 8px; font-size: 9px; }
              #site-operations-report-print table {
                width: 100%; margin-bottom: 12px; border-collapse: collapse; font-size: 9px;
              }
              #site-operations-report-print th,
              #site-operations-report-print td {
                padding: 4px 6px; border: 1px solid #cbd5e1; color: #1f2937;
              }
              #site-operations-report-print th { background: #f1f5f9; }
              #site-operations-report-print tr { page-break-inside: avoid; }
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
              <div className="flex gap-2">
                <button type="button" onClick={exportExcel} className="inline-flex items-center gap-2 rounded-md border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50">
                  <FileSpreadsheet size={16} /> Excel
                </button>
                <button type="button" onClick={exportPdf} className="inline-flex items-center gap-2 rounded-md border border-rose-300 px-3 py-2 text-sm font-medium text-rose-800 hover:bg-rose-50">
                  <FileText size={16} /> PDF
                </button>
              </div>
            </div>

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

            <div id="site-operations-report-print" className="space-y-5 bg-white">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{config.label}</h3>
                <p className="text-xs text-slate-500">{appliedFilterLabel}</p>
              </div>

              {detailMode !== "detail" && (
                <div className="overflow-x-auto">
                  <h4 className="mb-2 font-semibold text-slate-800">Summary by site and work description</h4>
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border px-3 py-2 text-left">Site</th>
                        <th className="border px-3 py-2 text-left">Work description</th>
                        {SUMMARY_COLUMNS[activeReport].map(([, label]) => <th key={label} className="border px-3 py-2 text-right">{label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSummary.length ? currentSummary.map(row => (
                        <tr key={`${row.site_id}-${row.desc_id}`}>
                          <td className="border px-3 py-2">{row.site_name || row.site_id}</td>
                          <td className="border px-3 py-2">{row.work_description || "—"}</td>
                          {SUMMARY_COLUMNS[activeReport].map(([field]) => (
                            <td key={field} className="border px-3 py-2 text-right">{formatValue(field, row[field])}</td>
                          ))}
                        </tr>
                      )) : (
                        <tr><td className="border px-3 py-4 text-center text-slate-500" colSpan={2 + SUMMARY_COLUMNS[activeReport].length}>No summary rows match these filters.</td></tr>
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

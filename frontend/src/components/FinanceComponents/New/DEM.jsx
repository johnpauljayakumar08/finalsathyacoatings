import { API_BASE_URL } from '../../../config/api.js';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExcelJS from 'exceljs';
import CreatableSelect from 'react-select/creatable';
import { Download, History, Pencil, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import RegisterViewSwitch from './RegisterViewSwitch';
import RegisterDashboardPage from './RegisterDashboardPage';

const initialForm = () => ({
  entry_date: new Date().toISOString().slice(0, 10),
  description: '',
  contra_entry: 'no',
  receipt_amount: '',
  receipt_bank_id: '',
  debit_amount: '',
  paid_from_bank_id: '',
  paid_to_bank_id: '',
  expense_month: '',
  cost_center_id: null,
  cost_category_id: null,
  expense_classification_id: null,
  expense_grouping_id: null
});

const masterFields = [
  { key: 'costCenters', id: 'cost_center_id', type: 'cost_center', label: 'Cost Centre' },
  { key: 'costCategories', id: 'cost_category_id', type: 'cost_category', label: 'Cost Category' },
  { key: 'classifications', id: 'expense_classification_id', type: 'expense_classification', label: 'EXPENSE CLASSIFICATION' },
  { key: 'groupings', id: 'expense_grouping_id', type: 'expense_grouping', label: 'EXPENSE GROUPING' }
];

const DEM = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const canEditDem = ['admin', 'superadmin'].includes(String(user.role || '').replace(/[\s-]/g, '').toLowerCase());
  const [viewMode, setViewMode] = useState('table');
  const [draft, setDraft] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [banks, setBanks] = useState([]);
  const [masters, setMasters] = useState({ costCenters: [], costCategories: [], classifications: [], groupings: [] });
  const [entries, setEntries] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [savingRow, setSavingRow] = useState(null);
  const [historyEntry, setHistoryEntry] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [entriesLoadedAt, setEntriesLoadedAt] = useState(Date.now());

  const loadData = async () => {
    try {
      const entriesFetchStarted = Date.now();
      const [entryResponse, masterResponse, bankResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/finance/dem/entries`),
        axios.get(`${API_BASE_URL}/finance/dem/masters`),
        axios.get(`${API_BASE_URL}/finance/bank-masters`)
      ]);
      setEntries(entryResponse.data.data?.entries || []);
      setEntriesLoadedAt(entriesFetchStarted);
      setAvailableBalance(Number(entryResponse.data.data?.available_balance) || 0);
      setMasters(masterResponse.data.data || { costCenters: [], costCategories: [], classifications: [], groupings: [] });
      setBanks(bankResponse.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load DEM data');
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bankOptions = banks.map(bank => ({ value: bank.id, label: `${bank.bank_name} | ${Number(bank.available_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` }));
  const selectMaster = (key) => masters[key].map(item => ({ value: item.id, label: item.name }));

  const createMaster = async (field, value, updateRow) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/finance/dem/masters`, {
        type: field.type,
        value,
        created_by: user.id || user.user_id || null
      });
      const created = response.data.data;
      setMasters(current => ({ ...current, [field.key]: [...current[field.key].filter(item => item.id !== created.id), created] }));
      updateRow(current => ({ ...current, [field.id]: created.id }));
      toast.success(`${field.label} added`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to add ${field.label}`);
    }
  };

  const saveEntry = async (event, row, entryId = null) => {
    event.preventDefault();
    const receipt = Number(row.receipt_amount) || 0;
    const debit = Number(row.debit_amount) || 0;
    if (!receipt && !debit) return toast.error('Enter a Receipt Amount or Debits Amount');
    if (receipt > 0 && !row.receipt_bank_id) return toast.error('Select Receipt ACC Details');
    if (debit > 0 && !row.paid_from_bank_id) return toast.error('Select Paid From Account');
    if (row.contra_entry === 'yes' && !row.paid_to_bank_id) return toast.error('Paid To Account is required for a Contra Entry');

    setSavingRow(entryId || 'new');
    try {
      const payload = { ...row, created_by: user.id || user.user_id || null, changed_by: user.id || user.user_id || null };
      if (entryId) {
        await axios.put(`${API_BASE_URL}/finance/dem/entries/${entryId}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        toast.success('DEM entry updated; previous values are in History');
        setEditingId(null);
        setEditingDraft(null);
      } else {
        await axios.post(`${API_BASE_URL}/finance/dem/entries`, payload);
        toast.success('DEM entry saved');
        setDraft(initialForm());
      }
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${entryId ? 'update' : 'save'} DEM entry`);
    } finally {
      setSavingRow(null);
    }
  };

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setEditingDraft({
      entry_date: entry.entry_date?.slice(0, 10) || '',
      description: entry.description || '',
      contra_entry: entry.contra_entry || 'no',
      receipt_amount: entry.receipt_amount || '',
      receipt_bank_id: entry.receipt_bank_id || '',
      debit_amount: entry.debit_amount || '',
      paid_from_bank_id: entry.paid_from_bank_id || '',
      paid_to_bank_id: entry.paid_to_bank_id || '',
      expense_month: entry.expense_month || '',
      cost_center_id: entry.cost_center_id || null,
      cost_category_id: entry.cost_category_id || null,
      expense_classification_id: entry.expense_classification_id || null,
      expense_grouping_id: entry.expense_grouping_id || null
    });
  };

  const openHistory = async (entry) => {
    setHistoryEntry(entry);
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/dem/entries/${entry.id}/history`);
      setHistoryRecords(response.data.data || []);
    } catch (error) {
      setHistoryRecords([]);
      toast.error(error.response?.data?.message || 'Failed to load entry history');
    }
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('DEM');
    sheet.columns = [
      { header: 'date', key: 'date', width: 14 },
      { header: 'DESCRIPTION', key: 'description', width: 32 },
      { header: 'Contra Entry', key: 'contra', width: 14 },
      { header: 'Receipt Amount', key: 'receipt', width: 18 },
      { header: 'Receipt ACC Details', key: 'receiptAccount', width: 24 },
      { header: 'Debits Amount', key: 'debit', width: 18 },
      { header: 'Available Balance', key: 'balance', width: 20 },
      { header: 'Paid From Account', key: 'paidFrom', width: 24 },
      { header: 'Paid To Account', key: 'paidTo', width: 24 },
      { header: 'Expence Month', key: 'month', width: 16 },
      { header: 'Cost Centre', key: 'center', width: 24 },
      { header: 'Cost Category', key: 'category', width: 24 },
      { header: 'EXPENSE CLASSIFICATION', key: 'classification', width: 28 },
      { header: 'EXPENSE GROUPING', key: 'grouping', width: 26 }
    ];
    entries.forEach(entry => sheet.addRow({
      date: entry.entry_date?.slice(0, 10), description: entry.description, contra: entry.contra_entry,
      receipt: Number(entry.receipt_amount), receiptAccount: entry.receipt_account, debit: Number(entry.debit_amount),
      balance: Number(entry.available_balance), paidFrom: entry.paid_from_account, paidTo: entry.paid_to_account,
      month: entry.expense_month, center: entry.cost_center, category: entry.cost_category,
      classification: entry.expense_classification, grouping: entry.expense_grouping
    }));
    sheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'DEM.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  };

  const inputClass = 'w-full min-w-[110px] rounded border border-gray-300 bg-white px-2 py-1.5 text-sm';
  const updateRow = (setRow, key, value) => setRow(current => ({ ...current, [key]: value }));
  const formatAmount = value => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const masterName = (key, id) => masters[key].find(item => Number(item.id) === Number(id))?.name || '';
  const accountName = id => banks.find(bank => Number(bank.id) === Number(id))?.bank_name || '';
  const canEditEntry = entry => canEditDem && (Number(entry.age_milliseconds || 0) + (now - entriesLoadedAt) < 120000);

  const renderBankSelect = (field, row, setRow, required = false) => (
    <select required={required} className={inputClass} value={row[field] || ''} onChange={event => updateRow(setRow, field, event.target.value)}>
      <option value="">Select bank</option>{bankOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );

  const renderMasterSelect = (field, row, setRow) => (
    <CreatableSelect
      isClearable
      className="min-w-[170px] text-sm"
      options={selectMaster(field.key)}
      value={selectMaster(field.key).find(option => Number(option.value) === Number(row[field.id])) || null}
      onChange={option => updateRow(setRow, field.id, option?.value || null)}
      onCreateOption={value => createMaster(field, value, setRow)}
      placeholder={`Select or create ${field.label.toLowerCase()}`}
      formatCreateLabel={value => `Create "${value}"`}
    />
  );

  const renderEditRow = (row, setRow, isNew, entryId = null) => (
    <tr key={isNew ? 'new-entry' : `edit-${entryId}`} className="border-b border-emerald-300 bg-emerald-50/60 align-top">
      <td className="px-2 py-2"><input required type="date" className={inputClass} value={row.entry_date} onChange={event => updateRow(setRow, 'entry_date', event.target.value)} /></td>
      <td className="px-2 py-2"><input className={inputClass} value={row.description} onChange={event => updateRow(setRow, 'description', event.target.value)} /></td>
      <td className="px-2 py-2"><select className={inputClass} value={row.contra_entry} onChange={event => setRow(current => ({ ...current, contra_entry: event.target.value, paid_to_bank_id: event.target.value === 'no' ? '' : current.paid_to_bank_id }))}><option value="no">No</option><option value="yes">Yes</option></select></td>
      <td className="px-2 py-2"><input type="number" min="0" step="0.01" className={inputClass} value={row.receipt_amount} onChange={event => updateRow(setRow, 'receipt_amount', event.target.value)} /></td>
      <td className="px-2 py-2">{renderBankSelect('receipt_bank_id', row, setRow, Number(row.receipt_amount) > 0)}</td>
      <td className="px-2 py-2"><input type="number" min="0" step="0.01" className={inputClass} value={row.debit_amount} onChange={event => updateRow(setRow, 'debit_amount', event.target.value)} /></td>
      <td className="whitespace-nowrap px-3 py-3 text-right font-medium">₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      <td className="px-2 py-2">{renderBankSelect('paid_from_bank_id', row, setRow, Number(row.debit_amount) > 0)}</td>
      <td className="px-2 py-2">{row.contra_entry === 'yes' ? renderBankSelect('paid_to_bank_id', row, setRow, true) : <span className="px-2 text-gray-400">-</span>}</td>
      <td className="px-2 py-2"><input type="month" className={inputClass} value={row.expense_month} onChange={event => updateRow(setRow, 'expense_month', event.target.value)} /></td>
      {masterFields.map(field => <td key={field.type} className="min-w-[190px] px-2 py-2">{renderMasterSelect(field, row, setRow)}</td>)}
      <td className="whitespace-nowrap px-2 py-2">
        <button type="button" disabled={savingRow !== null} onClick={event => saveEntry(event, row, entryId)} className="mr-1 inline-flex items-center gap-1 rounded bg-emerald-700 px-2.5 py-2 text-white hover:bg-emerald-800 disabled:opacity-60" title={isNew ? 'Save entry' : 'Save changes'}><Save size={15} />Save</button>
        {!isNew && <button type="button" onClick={() => { setEditingId(null); setEditingDraft(null); }} className="inline-flex items-center rounded border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-100" title="Cancel edit"><X size={16} /></button>}
      </td>
    </tr>
  );

  const getPreviousValues = record => {
    if (typeof record.previous_values === 'string') {
      try { return JSON.parse(record.previous_values); } catch { return {}; }
    }
    return record.previous_values || {};
  };

  const historyFields = [
    ['entry_date', 'Date'], ['description', 'Description'], ['contra_entry', 'Contra Entry'],
    ['receipt_amount', 'Receipt Amount'], ['receipt_bank_id', 'Receipt Account'],
    ['debit_amount', 'Debits Amount'], ['paid_from_bank_id', 'Paid From Account'],
    ['paid_to_bank_id', 'Paid To Account'], ['expense_month', 'Expense Month'],
    ['cost_center_id', 'Cost Centre'], ['cost_category_id', 'Cost Category'],
    ['expense_classification_id', 'Expense Classification'], ['expense_grouping_id', 'Expense Grouping']
  ];
  const historyDisplayValue = (key, previous) => {
    if (key === 'receipt_bank_id' || key === 'paid_from_bank_id' || key === 'paid_to_bank_id') return accountName(previous[key]) || '-';
    const masterKey = { cost_center_id: 'costCenters', cost_category_id: 'costCategories', expense_classification_id: 'classifications', expense_grouping_id: 'groupings' }[key];
    if (masterKey) return masterName(masterKey, previous[key]) || '-';
    if (key === 'receipt_amount' || key === 'debit_amount') return formatAmount(previous[key]);
    return previous[key] || '-';
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-screen-2xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-300 pb-4">
          <div><h1 className="text-2xl font-semibold text-gray-900">DEM</h1><p className="mt-1 text-sm text-gray-600">Daily entry and bank movement register</p></div>
          <div className="flex items-center gap-3">
            <RegisterViewSwitch value={viewMode} onChange={setViewMode} />
            {viewMode === 'table' && <><div className="border-r border-gray-300 pr-4 text-right"><div className="text-xs uppercase text-gray-500">Available Balance</div><div className="text-lg font-semibold">₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div><button type="button" onClick={exportExcel} className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-100"><Download size={16} /> Export Excel</button></>}
          </div>
        </header>

        {viewMode === 'dashboard' ? <RegisterDashboardPage dashboard="dem" embedded /> : <>
        <section className="overflow-x-auto">
          <table className="w-full min-w-[1650px] border-collapse text-left text-sm">
            <thead><tr className="border-b-2 border-gray-400 bg-gray-100">{['date', 'DESCRIPTION', 'Contra Entry', 'Receipt Amount', 'Receipt ACC Details', 'Debits Amount', 'Available Balance', 'Paid From Account', 'Paid To Account', 'Expence Month', 'Cost Centre', 'Cost Category', 'EXPENSE CLASSIFICATION', 'EXPENSE GROUPING', 'Actions'].map(header => <th key={header} className="whitespace-nowrap px-3 py-3 font-semibold text-gray-700">{header}</th>)}</tr></thead>
            <tbody>
              {renderEditRow(draft, setDraft, true)}
              {entries.map(entry => editingId === entry.id ? renderEditRow(editingDraft, setEditingDraft, false, entry.id) : (
                <tr key={entry.id} className="border-b border-gray-200 bg-white hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-3">{entry.entry_date?.slice(0, 10)}</td><td className="px-3 py-3">{entry.description || '-'}</td><td className="px-3 py-3 capitalize">{entry.contra_entry}</td>
                  <td className="px-3 py-3 text-right">{formatAmount(entry.receipt_amount)}</td><td className="px-3 py-3">{entry.receipt_account || '-'}</td>
                  <td className="px-3 py-3 text-right">{formatAmount(entry.debit_amount)}</td><td className="px-3 py-3 text-right">{formatAmount(entry.available_balance)}</td>
                  <td className="px-3 py-3">{entry.paid_from_account || '-'}</td><td className="px-3 py-3">{entry.paid_to_account || '-'}</td><td className="px-3 py-3">{entry.expense_month || '-'}</td>
                  <td className="px-3 py-3">{entry.cost_center || '-'}</td><td className="px-3 py-3">{entry.cost_category || '-'}</td><td className="px-3 py-3">{entry.expense_classification || '-'}</td><td className="px-3 py-3">{entry.expense_grouping || '-'}</td>
                  <td className="whitespace-nowrap px-2 py-2">{canEditEntry(entry) && <button type="button" onClick={() => startEditing(entry)} className="mr-1 rounded border border-gray-300 bg-white p-2 hover:bg-gray-100" title="Edit entry (available for 2 minutes after creation)"><Pencil size={15} /></button>}<button type="button" onClick={() => openHistory(entry)} className="rounded border border-gray-300 bg-white p-2 hover:bg-gray-100" title="View edit history"><History size={15} /></button></td>
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan="15" className="px-3 py-8 text-center text-gray-500">Enter the first transaction in the row above.</td></tr>}
            </tbody>
          </table>
        </section>
        </>}
      </div>

      {historyEntry && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setHistoryEntry(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="dem-history-title" className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
          <header className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4"><div><h2 id="dem-history-title" className="text-lg font-semibold">Edit History</h2><p className="text-sm text-gray-600">{historyEntry.entry_date?.slice(0, 10)} · {historyEntry.description || 'DEM entry'}</p></div><button type="button" onClick={() => setHistoryEntry(null)} className="rounded border p-2 hover:bg-gray-100" title="Close history"><X size={17} /></button></header>
          <div className="space-y-4 p-5">{historyRecords.length === 0 ? <p className="text-sm text-gray-500">No edits have been made to this entry.</p> : historyRecords.map(record => {
            const previous = getPreviousValues(record);
            return <article key={record.id} className="border-b border-gray-200 pb-4 last:border-0"><div className="mb-3 text-sm font-medium text-gray-700">Changed {new Date(record.changed_at).toLocaleString()} {record.changed_by ? `by user ${record.changed_by}` : ''}</div><dl className="grid gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">{historyFields.map(([key, label]) => <div key={key}><dt className="text-xs text-gray-500">{label}</dt><dd className="text-sm text-gray-900">{historyDisplayValue(key, previous)}</dd></div>)}</dl></article>;
          })}</div>
        </section>
      </div>}
    </main>
  );
};

export default DEM;
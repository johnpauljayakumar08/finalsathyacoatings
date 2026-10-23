import { API_BASE_URL } from '../../../config/api.js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BarChart3, ChartNoAxesCombined, Filter, LineChart as LineIcon, PieChart as PieIcon, RefreshCw, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

const configs = {
  dem: { title: 'DEM Dashboard', series: ['DEM receipts', 'DEM debits'], colors: ['#0f766e', '#d97706'] },
  purchase: { title: 'Purchase Register - New Dashboard', series: ['Purchase Total'], colors: ['#2563eb'] },
  sales: { title: 'Sales Register Dashboard', series: ['Sales Total'], colors: ['#be123c'] }
};
const chartOptions = [
  { type: 'bar', label: 'Bar' },
  { type: 'line', label: 'Line' },
  { type: 'area', label: 'Area' },
  { type: 'pie', label: 'Pie' }
];
const formatAmount = value => `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dateKey = value => value ? String(value).slice(0, 10) : '';
const number = value => Number(value || 0);
const emptyDemMasters = { costCenters: [], costCategories: [], classifications: [], groupings: [] };
const emptyPurchaseFilters = {
  receivedFrom: '', receivedTo: '', billNo: '', description: '', purchasedFor: '', uom: 'all',
  quantityMin: '', quantityMax: '', rateMin: '', rateMax: '', saleMin: '', saleMax: '',
  gstMin: '', gstMax: '', totalMin: '', totalMax: ''
};

const RegisterDashboardPage = ({ dashboard, embedded = false, financialYearId = '' }) => {
  const config = configs[dashboard];
  const [entries, setEntries] = useState([]);
  const [demMasters, setDemMasters] = useState(emptyDemMasters);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState('bar');
  const [demType, setDemType] = useState('all');
  const [contraEntry, setContraEntry] = useState('all');
  const [receiptMin, setReceiptMin] = useState('');
  const [receiptMax, setReceiptMax] = useState('');
  const [debitMin, setDebitMin] = useState('');
  const [debitMax, setDebitMax] = useState('');
  const [receiptAccountId, setReceiptAccountId] = useState('all');
  const [paidFromAccountId, setPaidFromAccountId] = useState('all');
  const [paidToAccountId, setPaidToAccountId] = useState('all');
  const [expenseMonth, setExpenseMonth] = useState('');
  const [costCenterId, setCostCenterId] = useState('all');
  const [costCategoryId, setCostCategoryId] = useState('all');
  const [classificationId, setClassificationId] = useState('all');
  const [groupingId, setGroupingId] = useState('all');
  const [purchaseType, setPurchaseType] = useState('all');
  const [purchaseFilters, setPurchaseFilters] = useState(emptyPurchaseFilters);
  const [salesType, setSalesType] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    try {
      const url = dashboard === 'dem'
        ? `${API_BASE_URL}/finance/dem/entries`
        : dashboard === 'purchase'
          ? `${API_BASE_URL}/finance/compound-purchase-entries`
          : `${API_BASE_URL}/finance/sales-registers${financialYearId ? `?finance_year_id=${financialYearId}` : ''}`;
      const [response, mastersResponse] = await Promise.all([
        axios.get(url),
        dashboard === 'dem' ? axios.get(`${API_BASE_URL}/finance/dem/masters`) : Promise.resolve(null)
      ]);
      const data = response.data.data;
      setEntries(dashboard === 'dem' ? data?.entries || [] : dashboard === 'purchase' ? data || [] : data?.records || []);
      if (dashboard === 'dem') setDemMasters(mastersResponse?.data?.data || emptyDemMasters);
      setRefreshedAt(new Date());
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to load ${config.title.toLowerCase()}`);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [config.title, dashboard, financialYearId]);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => {
    const closeOnOutsideClick = event => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) setFiltersOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const activeFilterCount = [
    Boolean(fromDate), Boolean(toDate), period !== 'month',
    dashboard === 'dem' && demType !== 'all',
    dashboard === 'dem' && contraEntry !== 'all',
    dashboard === 'dem' && Boolean(receiptMin), dashboard === 'dem' && Boolean(receiptMax),
    dashboard === 'dem' && Boolean(debitMin), dashboard === 'dem' && Boolean(debitMax),
    dashboard === 'dem' && receiptAccountId !== 'all',
    dashboard === 'dem' && paidFromAccountId !== 'all', dashboard === 'dem' && paidToAccountId !== 'all',
    dashboard === 'dem' && Boolean(expenseMonth),
    dashboard === 'dem' && costCenterId !== 'all',
    dashboard === 'dem' && costCategoryId !== 'all',
    dashboard === 'dem' && classificationId !== 'all',
    dashboard === 'dem' && groupingId !== 'all',
    dashboard === 'purchase' && purchaseType !== 'all',
    dashboard === 'purchase' && Boolean(search),
    ...(dashboard === 'purchase' ? Object.values(purchaseFilters).map(value => value !== '' && value !== 'all') : []),
    ...(dashboard === 'purchase' ? Object.values(purchaseFilters).map(value => value !== '' && value !== 'all') : []),
    dashboard === 'sales' && salesType !== 'all',
    dashboard === 'sales' && Boolean(search)
  ].filter(Boolean).length;
  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setPeriod('month');
    setDemType('all');
    setContraEntry('all');
    setReceiptMin('');
    setReceiptMax('');
    setDebitMin('');
    setDebitMax('');
    setReceiptAccountId('all');
    setPaidFromAccountId('all');
    setPaidToAccountId('all');
    setExpenseMonth('');
    setCostCenterId('all');
    setCostCategoryId('all');
    setClassificationId('all');
    setGroupingId('all');
    setPurchaseType('all');
    setPurchaseFilters(emptyPurchaseFilters);
    setPurchaseFilters(emptyPurchaseFilters);
    setSalesType('all');
    setSearch('');
  };
  const setPurchaseFilter = (field, value) => setPurchaseFilters(current => ({ ...current, [field]: value }));

  const rows = dashboard === 'dem'
    ? entries.flatMap(entry => [
      ...(number(entry.receipt_amount) > 0 ? [{ date: dateKey(entry.entry_date), series: 'DEM receipts', value: number(entry.receipt_amount), kind: 'receipt', detail: entry.receipt_account || entry.description || '', receiptAmount: number(entry.receipt_amount), debitAmount: number(entry.debit_amount), contraEntry: entry.contra_entry, receiptAccountId: entry.receipt_bank_id, paidFromAccountId: entry.paid_from_bank_id, paidToAccountId: entry.paid_to_bank_id, expenseMonth: entry.expense_month, costCenterId: entry.cost_center_id, costCategoryId: entry.cost_category_id, classificationId: entry.expense_classification_id, groupingId: entry.expense_grouping_id }] : []),
      ...(number(entry.debit_amount) > 0 ? [{ date: dateKey(entry.entry_date), series: 'DEM debits', value: number(entry.debit_amount), kind: 'debit', detail: entry.paid_from_account || entry.description || '', receiptAmount: number(entry.receipt_amount), debitAmount: number(entry.debit_amount), contraEntry: entry.contra_entry, receiptAccountId: entry.receipt_bank_id, paidFromAccountId: entry.paid_from_bank_id, paidToAccountId: entry.paid_to_bank_id, expenseMonth: entry.expense_month, costCenterId: entry.cost_center_id, costCategoryId: entry.cost_category_id, classificationId: entry.expense_classification_id, groupingId: entry.expense_grouping_id }] : [])
    ])
    : dashboard === 'purchase'
      ? entries.map(entry => ({
        date: dateKey(entry.transaction_date), receivedDate: dateKey(entry.received_date), series: 'Purchase Total',
        value: number(entry.total_amount), gst: number(entry.gst_amount), kind: entry.purchase_type || 'other',
        detail: entry.supplier_name || '', billNo: entry.bill_no || '', description: entry.description || '',
        purchasedFor: entry.purchased_for || '', quantity: number(entry.quantity), uom: entry.uom || '',
        rate: number(entry.rate), saleAmount: number(entry.sale_amount), gstPercentage: number(entry.gst_percentage), totalAmount: number(entry.total_amount)
      }))
      : entries.map(entry => ({
        date: dateKey(entry.transaction_date),
        series: 'Sales Total',
        value: number(entry.total_value),
        gst: number(entry.gst),
        kind: number(entry.supply) ? 'supply' : number(entry.service) ? 'service' : 'other',
        detail: entry.customer_name || ''
      }));

  const uniqueAccountOptions = (idKey, nameKey) => [...new Map(entries
    .filter(entry => entry[idKey])
    .map(entry => [String(entry[idKey]), { id: String(entry[idKey]), name: entry[nameKey] || `Account ${entry[idKey]}` }]))
    .values()].sort((left, right) => left.name.localeCompare(right.name));
  const receiptAccounts = dashboard === 'dem' ? uniqueAccountOptions('receipt_bank_id', 'receipt_account') : [];
  const paidFromAccounts = dashboard === 'dem' ? uniqueAccountOptions('paid_from_bank_id', 'paid_from_account') : [];
  const paidToAccounts = dashboard === 'dem' ? uniqueAccountOptions('paid_to_bank_id', 'paid_to_account') : [];

  const filteredRows = rows.filter(row => {
    const matchesDate = (!fromDate || row.date >= fromDate) && (!toDate || row.date <= toDate);
    const matchesDemType = dashboard !== 'dem' || demType === 'all' || row.kind === demType;
    const matchesPurchaseType = dashboard !== 'purchase' || purchaseType === 'all' || row.kind === purchaseType;
    const matchesSalesType = dashboard !== 'sales' || salesType === 'all' || row.kind === salesType;
    const matchesText = !search || row.detail.toLowerCase().includes(search.trim().toLowerCase());
    const inRange = (value, min, max) => (!min || value >= Number(min)) && (!max || value <= Number(max));
    const matchesPurchaseFields = dashboard !== 'purchase' || (
      (!purchaseFilters.receivedFrom || row.receivedDate >= purchaseFilters.receivedFrom) &&
      (!purchaseFilters.receivedTo || row.receivedDate <= purchaseFilters.receivedTo) &&
      (!purchaseFilters.billNo || row.billNo.toLowerCase().includes(purchaseFilters.billNo.trim().toLowerCase())) &&
      (!purchaseFilters.description || row.description.toLowerCase().includes(purchaseFilters.description.trim().toLowerCase())) &&
      (!purchaseFilters.purchasedFor || row.purchasedFor.toLowerCase().includes(purchaseFilters.purchasedFor.trim().toLowerCase())) &&
      (purchaseFilters.uom === 'all' || row.uom === purchaseFilters.uom) &&
      inRange(row.quantity, purchaseFilters.quantityMin, purchaseFilters.quantityMax) &&
      inRange(row.rate, purchaseFilters.rateMin, purchaseFilters.rateMax) &&
      inRange(row.saleAmount, purchaseFilters.saleMin, purchaseFilters.saleMax) &&
      inRange(row.gstPercentage, purchaseFilters.gstMin, purchaseFilters.gstMax) &&
      inRange(row.totalAmount, purchaseFilters.totalMin, purchaseFilters.totalMax)
    );
    const matchesCostCenter = dashboard !== 'dem' || costCenterId === 'all' || (costCenterId === 'none' ? !row.costCenterId : String(row.costCenterId) === costCenterId);
    const matchesCostCategory = dashboard !== 'dem' || costCategoryId === 'all' || (costCategoryId === 'none' ? !row.costCategoryId : String(row.costCategoryId) === costCategoryId);
    const matchesClassification = dashboard !== 'dem' || classificationId === 'all' || (classificationId === 'none' ? !row.classificationId : String(row.classificationId) === classificationId);
    const matchesGrouping = dashboard !== 'dem' || groupingId === 'all' || (groupingId === 'none' ? !row.groupingId : String(row.groupingId) === groupingId);
    const matchesContra = dashboard !== 'dem' || contraEntry === 'all' || row.contraEntry === contraEntry;
    const matchesReceiptMin = dashboard !== 'dem' || !receiptMin || row.receiptAmount >= Number(receiptMin);
    const matchesReceiptMax = dashboard !== 'dem' || !receiptMax || row.receiptAmount <= Number(receiptMax);
    const matchesDebitMin = dashboard !== 'dem' || !debitMin || row.debitAmount >= Number(debitMin);
    const matchesDebitMax = dashboard !== 'dem' || !debitMax || row.debitAmount <= Number(debitMax);
    const matchesReceiptAccount = dashboard !== 'dem' || receiptAccountId === 'all' || (receiptAccountId === 'none' ? !row.receiptAccountId : String(row.receiptAccountId) === receiptAccountId);
    const matchesPaidFrom = dashboard !== 'dem' || paidFromAccountId === 'all' || (paidFromAccountId === 'none' ? !row.paidFromAccountId : String(row.paidFromAccountId) === paidFromAccountId);
    const matchesPaidTo = dashboard !== 'dem' || paidToAccountId === 'all' || (paidToAccountId === 'none' ? !row.paidToAccountId : String(row.paidToAccountId) === paidToAccountId);
    const matchesExpenseMonth = dashboard !== 'dem' || !expenseMonth || row.expenseMonth === expenseMonth;
    return matchesDate && matchesDemType && matchesPurchaseType && matchesSalesType && matchesText && matchesPurchaseFields && matchesCostCenter && matchesCostCategory && matchesClassification && matchesGrouping && matchesContra && matchesReceiptMin && matchesReceiptMax && matchesDebitMin && matchesDebitMax && matchesReceiptAccount && matchesPaidFrom && matchesPaidTo && matchesExpenseMonth;
  });

  const groupedByPeriod = {};
  filteredRows.forEach(row => {
    const key = period === 'month' ? row.date.slice(0, 7) : row.date;
    if (!key) return;
    groupedByPeriod[key] ||= { period: key };
    groupedByPeriod[key][row.series] = (groupedByPeriod[key][row.series] || 0) + row.value;
  });
  const chartData = Object.values(groupedByPeriod).sort((left, right) => left.period.localeCompare(right.period));
  const categories = dashboard === 'dem'
    ? [{ key: 'receipt', name: 'Receipts' }, { key: 'debit', name: 'Debits' }]
    : dashboard === 'purchase'
      ? [{ key: 'project', name: 'Project' }, { key: 'supply', name: 'Supply' }, { key: 'other', name: 'Other' }]
      : [{ key: 'supply', name: 'Supply' }, { key: 'service', name: 'Service' }, { key: 'other', name: 'Other' }];
  const pieData = categories.map(category => ({
    name: category.name,
    value: filteredRows.filter(row => row.kind === category.key).reduce((sum, row) => sum + row.value, 0)
  })).filter(item => item.value > 0);
  const filteredTotal = filteredRows.reduce((sum, row) => sum + row.value, 0);
  const filteredGst = filteredRows.reduce((sum, row) => sum + number(row.gst), 0);
  const categoryTotals = categories.map(category => ({
    name: category.name,
    value: filteredRows.filter(row => row.kind === category.key).reduce((sum, row) => sum + row.value, 0)
  }));

  const renderChart = () => {
    if (!filteredRows.length) return <div className="flex h-full items-center justify-center text-sm text-gray-500">No entries match these filters.</div>;
    if (chartType === 'pie') {
      return <ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip formatter={formatAmount} /><Legend /><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={125} paddingAngle={2}>
        {pieData.map((item, index) => <Cell key={item.name} fill={config.colors[index % config.colors.length]} />)}
      </Pie></PieChart></ResponsiveContainer>;
    }
    const AxisFrame = chartType === 'bar' ? BarChart : chartType === 'line' ? LineChart : AreaChart;
    return <ResponsiveContainer width="100%" height="100%"><AxisFrame data={chartData} margin={{ top: 12, right: 20, left: 12, bottom: 8 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="period" tick={{ fontSize: 12 }} /><YAxis tickFormatter={value => `₹${Number(value).toLocaleString('en-IN')}`} width={90} tick={{ fontSize: 12 }} /><Tooltip formatter={formatAmount} /><Legend />
      {config.series.map((series, index) => chartType === 'bar'
        ? <Bar key={series} dataKey={series} fill={config.colors[index]} radius={[3, 3, 0, 0]} />
        : chartType === 'line'
          ? <Line key={series} type="monotone" dataKey={series} stroke={config.colors[index]} strokeWidth={2} dot={false} />
          : <Area key={series} type="monotone" dataKey={series} stroke={config.colors[index]} fill={config.colors[index]} fillOpacity={0.14} />
      )}
    </AxisFrame></ResponsiveContainer>;
  };

  return (
    <main className={embedded ? '' : 'min-h-screen bg-gray-50 p-4 md:p-6'}>
      <div className="mx-auto max-w-screen-2xl space-y-5">
        {!embedded && <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-300 pb-4">
          <div><h1 className="text-2xl font-semibold text-gray-900">{config.title}</h1><p className="mt-1 text-sm text-gray-600">Filtered activity and totals</p></div>
          <button type="button" onClick={loadEntries} disabled={loading} className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button>
        </header>}
        {embedded && <div className="flex justify-end"><button type="button" onClick={loadEntries} disabled={loading} className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button></div>}

        <section className="relative flex flex-wrap items-center justify-between gap-3 border-b border-gray-300 pb-4">
          <div className="relative" ref={filtersRef}>
            <button type="button" onClick={() => setFiltersOpen(open => !open)} aria-expanded={filtersOpen} aria-label="Open filters" className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"><Filter size={17} /> Filters{activeFilterCount > 0 && <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">{activeFilterCount}</span>}</button>
            {filtersOpen && <div className="absolute left-0 top-full z-30 mt-2 max-h-[80vh] w-[min(94vw,960px)] overflow-y-auto rounded border border-gray-200 bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3"><h2 className="font-semibold text-gray-900">Filters</h2><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="rounded p-1 text-gray-600 hover:bg-gray-100"><X size={17} /></button></div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm text-gray-700">From<input type="date" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={fromDate} onChange={event => setFromDate(event.target.value)} /></label>
                <label className="text-sm text-gray-700">To<input type="date" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={toDate} onChange={event => setToDate(event.target.value)} /></label>
                <label className="text-sm text-gray-700">Group by<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={period} onChange={event => setPeriod(event.target.value)}><option value="day">Day</option><option value="month">Month</option></select></label>
                {dashboard === 'dem' && <>
                  <label className="text-sm text-gray-700">Transaction<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={demType} onChange={event => setDemType(event.target.value)}><option value="all">Receipts and debits</option><option value="receipt">Receipts</option><option value="debit">Debits</option></select></label>
                  <label className="text-sm text-gray-700">Cost Centre<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={costCenterId} onChange={event => setCostCenterId(event.target.value)}><option value="all">All</option><option value="none">Not set</option>{demMasters.costCenters.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
                  <label className="text-sm text-gray-700">Cost Category<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={costCategoryId} onChange={event => setCostCategoryId(event.target.value)}><option value="all">All</option><option value="none">Not set</option>{demMasters.costCategories.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
                  <label className="text-sm text-gray-700">EXPENSE CLASSIFICATION<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={classificationId} onChange={event => setClassificationId(event.target.value)}><option value="all">All</option><option value="none">Not set</option>{demMasters.classifications.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
                  <label className="text-sm text-gray-700">EXPENSE GROUPING<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={groupingId} onChange={event => setGroupingId(event.target.value)}><option value="all">All</option><option value="none">Not set</option>{demMasters.groupings.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
                  <label className="text-sm text-gray-700">Contra Entry<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={contraEntry} onChange={event => setContraEntry(event.target.value)}><option value="all">All</option><option value="yes">Yes</option><option value="no">No</option></select></label>
                  <label className="text-sm text-gray-700">Receipt Amount Min<input type="number" min="0" step="0.01" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={receiptMin} onChange={event => setReceiptMin(event.target.value)} /></label>
                  <label className="text-sm text-gray-700">Receipt Amount Max<input type="number" min="0" step="0.01" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={receiptMax} onChange={event => setReceiptMax(event.target.value)} /></label>
                  <label className="text-sm text-gray-700">Receipt ACC Details<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={receiptAccountId} onChange={event => setReceiptAccountId(event.target.value)}><option value="all">All</option><option value="none">Not set</option>{receiptAccounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
                  <label className="text-sm text-gray-700">Debits Amount Min<input type="number" min="0" step="0.01" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={debitMin} onChange={event => setDebitMin(event.target.value)} /></label>
                  <label className="text-sm text-gray-700">Debits Amount Max<input type="number" min="0" step="0.01" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={debitMax} onChange={event => setDebitMax(event.target.value)} /></label>
                  <label className="text-sm text-gray-700">Paid From Account<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={paidFromAccountId} onChange={event => setPaidFromAccountId(event.target.value)}><option value="all">All</option><option value="none">Not set</option>{paidFromAccounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
                  <label className="text-sm text-gray-700">Paid To Account<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={paidToAccountId} onChange={event => setPaidToAccountId(event.target.value)}><option value="all">All</option><option value="none">Not set</option>{paidToAccounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
                  <label className="text-sm text-gray-700">Expense Month<input type="month" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={expenseMonth} onChange={event => setExpenseMonth(event.target.value)} /></label>
                </>}
                {dashboard === 'purchase' && <>
                  <label className="text-sm text-gray-700">Purchase Type<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={purchaseType} onChange={event => setPurchaseType(event.target.value)}><option value="all">Project and Supply</option><option value="project">Project</option><option value="supply">Supply</option></select></label>
                  <label className="text-sm text-gray-700">Supplier<input className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search supplier" /></label>
                  <label className="text-sm text-gray-700">Received Date From<input type="date" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={purchaseFilters.receivedFrom} onChange={event => setPurchaseFilter('receivedFrom', event.target.value)} /></label>
                  <label className="text-sm text-gray-700">Received Date To<input type="date" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={purchaseFilters.receivedTo} onChange={event => setPurchaseFilter('receivedTo', event.target.value)} /></label>
                  <label className="text-sm text-gray-700">Bill No<input className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={purchaseFilters.billNo} onChange={event => setPurchaseFilter('billNo', event.target.value)} /></label>
                  <label className="text-sm text-gray-700">Description<input className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={purchaseFilters.description} onChange={event => setPurchaseFilter('description', event.target.value)} /></label>
                  <label className="text-sm text-gray-700">Purchased For<input className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={purchaseFilters.purchasedFor} onChange={event => setPurchaseFilter('purchasedFor', event.target.value)} /></label>
                  <label className="text-sm text-gray-700">UOM<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={purchaseFilters.uom} onChange={event => setPurchaseFilter('uom', event.target.value)}><option value="all">All</option>{[...new Set(entries.map(entry => entry.uom).filter(Boolean))].sort().map(uom => <option key={uom} value={uom}>{uom}</option>)}</select></label>
                  {[
                    ['Qty Min', 'quantityMin'], ['Qty Max', 'quantityMax'],
                    ['Rate Min', 'rateMin'], ['Rate Max', 'rateMax'],
                    ['Sale Amount Min', 'saleMin'], ['Sale Amount Max', 'saleMax'],
                    ['GST % Min', 'gstMin'], ['GST % Max', 'gstMax'],
                    ['Total Min', 'totalMin'], ['Total Max', 'totalMax']
                  ].map(([label, field]) => <label key={field} className="text-sm text-gray-700">{label}<input type="number" min="0" step="0.01" className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={purchaseFilters[field]} onChange={event => setPurchaseFilter(field, event.target.value)} /></label>)}
                </>}
                {dashboard === 'sales' && <>
                  <label className="text-sm text-gray-700">Sales Type<select className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={salesType} onChange={event => setSalesType(event.target.value)}><option value="all">Supply and Service</option><option value="supply">Supply</option><option value="service">Service</option></select></label>
                  <label className="text-sm text-gray-700">Party<input className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search party" /></label>
                </>}
              </div>
              <div className="mt-4 flex justify-between border-t border-gray-200 pt-3"><button type="button" onClick={clearFilters} className="text-sm text-blue-700 hover:underline">Clear filters</button><button type="button" onClick={() => setFiltersOpen(false)} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Done</button></div>
            </div>}
          </div>
          <div className="flex items-center gap-1 rounded border border-gray-300 bg-white p-1" role="group" aria-label="Chart format">
            {chartOptions.map(option => <button key={option.type} type="button" aria-label={`${option.label} chart`} aria-pressed={chartType === option.type} title={`${option.label} chart`} onClick={() => setChartType(option.type)} className={`rounded p-2 ${chartType === option.type ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {option.type === 'bar' ? <BarChart3 size={17} /> : option.type === 'line' ? <LineIcon size={17} /> : option.type === 'area' ? <ChartNoAxesCombined size={17} /> : <PieIcon size={17} />}
            </button>)}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="border-b-2 border-emerald-700 bg-white px-4 py-3"><div className="text-sm text-gray-500">{dashboard === 'dem' ? 'Filtered Transaction Total' : dashboard === 'purchase' ? 'Purchase Total' : 'Sales Total'}</div><div className="mt-1 text-xl font-semibold text-gray-900">{formatAmount(filteredTotal)}</div></div>
          {dashboard !== 'dem' && <div className="border-b-2 border-amber-600 bg-white px-4 py-3"><div className="text-sm text-gray-500">GST Total</div><div className="mt-1 text-xl font-semibold text-amber-700">{formatAmount(filteredGst)}</div></div>}
          <div className="border-b-2 border-blue-700 bg-white px-4 py-3"><div className="text-sm text-gray-500">Matching Entries</div><div className="mt-1 text-xl font-semibold text-blue-700">{filteredRows.length}</div></div>
        </section>

        <section className="border border-gray-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-gray-900">{config.title.replace(' Dashboard', '')} Activity</h2><span className="text-sm text-gray-500">{refreshedAt ? `Updated ${refreshedAt.toLocaleTimeString()}` : ''}</span></div>
          <div className="h-[380px] w-full">{loading ? <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading register data...</div> : renderChart()}</div>
        </section>

        <section className="overflow-x-auto border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4 py-3"><h2 className="font-semibold text-gray-900">Filtered Breakdown</h2></div>
          <table className="w-full min-w-[420px] text-sm"><thead className="bg-gray-50 text-left text-gray-600"><tr><th className="px-4 py-2">Category</th><th className="px-4 py-2 text-right">Total</th></tr></thead>
            <tbody>{categoryTotals.map((row, index) => <tr key={row.name} className="border-t border-gray-200"><td className="px-4 py-2"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: config.colors[index % config.colors.length] }} />{row.name}</td><td className="px-4 py-2 text-right font-medium">{formatAmount(row.value)}</td></tr>)}</tbody>
          </table>
        </section>
      </div>
    </main>
  );
};

export default RegisterDashboardPage;

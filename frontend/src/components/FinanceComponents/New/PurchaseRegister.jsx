import { API_BASE_URL } from "../../../config/api.js";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
import {
  Calendar, ChartNoAxesCombined, Download, Eye, FileText, ListFilter, Loader2,
  Plus, RefreshCw, Save, Search, Trash2, X
} from 'lucide-react';
import { toast } from 'react-toastify';

const API = `${API_BASE_URL}/finance`;
const purchaseApi = axios.create({ baseURL: API });
purchaseApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
const CHART_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];
const FILTER_FIELDS = [
  ['transaction_date', 'PO Date'], ['supplier_name', 'Supplier'],
  ['po_number', 'PO Number'], ['invoice_description', 'Description'], ['rate', 'Rate'],
  ['uom', 'UOM'], ['quantity', 'Qty'], ['gst', 'GST'], ['grand_total', 'Grand Total'],
  ['master_approval', 'MD Approval'], ['master_approval_at', 'Approval Timestamp'],
  ['material_status', 'Material Status'], ['invoice_no', 'Invoice No'],
  ['invoice_date', 'Invoice Date'], ['material_receipt_at', 'Material Receipt Timestamp'],
  ['credit_period_days', 'Credit Days'], ['payment_due_date', 'Payment Due Date'],
  ['date_of_payment', 'Payment Date'], ['payment_status', 'Payment Status'], ['utr_details', 'UTR']
];

const blankItem = () => ({ description: '', rate: '', uom: '', quantity: '' });
const blankForm = (financeYearId = '') => ({
  finance_year_id: financeYearId,
  transaction_date: '',
  supplier_name: '',
  po_number: '',
  gst: '',
  grand_total: '',
  items: [blankItem()]
});
const showDate = (value) => value ? String(value).slice(0, 10) : '-';
const showAmount = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const textValue = (value) => value === null || value === undefined ? '' : String(value).toLowerCase();

const PurchaseRegister = () => {
  const [purchases, setPurchases] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(blankForm());
  const [purchasePdf, setPurchasePdf] = useState(null);
  const [activeRecord, setActiveRecord] = useState(null);
  const [filters, setFilters] = useState({});
  const [view, setView] = useState('table');
  const [approvalChoice, setApprovalChoice] = useState('');
  const [materialForm, setMaterialForm] = useState({
    material_status: 'not_received',
    invoice_no: '',
    invoice_date: '',
    credit_period_days: ''
  });

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || '{}');
    } catch (error) {
      console.error('Unable to read signed-in user:', error);
      return {};
    }
  }, []);
  const currentUserId = currentUser.id || currentUser.user_id || 1;
  const currentRole = String(currentUser.role || '').replace(/[_\s-]/g, '').toLowerCase();
  const isManagingDirector = currentRole === 'managingdirector' || currentRole === 'md';
  const canManagePurchase = ['accounts_team', 'accountsteam', 'admin', 'superadmin'].includes(currentRole);
  const purchaseDetailsReadOnly = Boolean(activeRecord) && (
    !canManagePurchase ||
    activeRecord.master_approval === 'yes' ||
    activeRecord.material_status === 'received'
  );

  const fetchPurchases = useCallback(async (year = selectedYear) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ purchase_type: 'G' });
      if (year) params.set('finance_year_id', year);
      const query = `?${params.toString()}`;
      const response = await purchaseApi.get(`/purchase-registers${query}`);
      const payload = response.data.data || response.data;
      setPurchases(Array.isArray(payload.records) ? payload.records : []);
    } catch (error) {
      console.error('Error fetching purchase registers:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch purchase registers');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const response = await purchaseApi.get('/financial-years');
        const payload = response.data.data || response.data;
        const years = Array.isArray(payload) ? payload : [];
        setFinancialYears(years);
        const activeYear = years.find((year) => year.is_active === 1 || year.is_active === true);
        if (activeYear) setSelectedYear(String(activeYear.id));
      } catch (error) {
        console.error('Error fetching financial years:', error);
        toast.error('Failed to fetch financial years');
      }
    };
    loadYears();
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const filteredPurchases = useMemo(() => purchases.filter((record) =>
    FILTER_FIELDS.every(([field]) => {
      const criterion = textValue(filters[field]).trim();
      if (!criterion) return true;
      return textValue(record[field]).includes(criterion);
    })
  ), [purchases, filters]);

  const dashboard = useMemo(() => {
    const totals = filteredPurchases.reduce((acc, record) => {
      const total = Number(record.grand_total ?? record.total_value ?? 0);
      acc.grandTotal += total;
      acc.gst += Number(record.gst || 0);
      if (record.payment_status !== 'paid') acc.due += total;
      acc.approvals[record.master_approval || 'pending'] =
        (acc.approvals[record.master_approval || 'pending'] || 0) + 1;
      acc.material[record.material_status || 'not_received'] =
        (acc.material[record.material_status || 'not_received'] || 0) + 1;
      acc.paymentStatuses[record.payment_status || 'pending'] =
        (acc.paymentStatuses[record.payment_status || 'pending'] || 0) + total;
      const supplier = record.supplier_name || 'Unspecified';
      acc.suppliers[supplier] = (acc.suppliers[supplier] || 0) + total;
      return acc;
    }, { grandTotal: 0, gst: 0, due: 0, approvals: {}, material: {}, paymentStatuses: {}, suppliers: {} });

    return {
      ...totals,
      approvalChart: Object.entries(totals.approvals).map(([name, value]) => ({ name: name.toUpperCase(), value })),
      materialChart: Object.entries(totals.material).map(([name, value]) => ({
        name: name === 'received' ? 'Received' : 'Not received',
        value
      })),
      paymentStatusChart: Object.entries(totals.paymentStatuses).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      })),
      supplierChart: Object.entries(totals.suppliers)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    };
  }, [filteredPurchases]);

  const updateForm = (field, value) => setFormData((current) => ({ ...current, [field]: value }));
  const updateItem = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  };
  const computedItemTotal = (items) => items.reduce(
    (sum, item) => sum + (Number(item.rate) || 0) * (Number(item.quantity) || 0),
    0
  );

  const openCreate = () => {
    if (!selectedYear) {
      toast.warning('Select a financial year before creating a purchase order');
      return;
    }
    setActiveRecord(null);
    setFormData(blankForm(selectedYear));
    setPurchasePdf(null);
    setShowForm(true);
  };

  const openRecord = async (record, edit = false) => {
    try {
      const response = await purchaseApi.get(`/purchase-registers/${record.id}`);
      const fullRecord = response.data.data || record;
      setActiveRecord(fullRecord);
      setApprovalChoice('');
      setMaterialForm({
        material_status: fullRecord.material_status || 'not_received',
        invoice_no: fullRecord.invoice_no || '',
        invoice_date: showDate(fullRecord.invoice_date) === '-' ? '' : showDate(fullRecord.invoice_date),
        credit_period_days: fullRecord.credit_period_days ?? ''
      });
      setFormData({
        finance_year_id: String(fullRecord.finance_year_id || selectedYear),
        transaction_date: showDate(fullRecord.transaction_date) === '-' ? '' : showDate(fullRecord.transaction_date),
        supplier_name: fullRecord.supplier_name || '',
        po_number: fullRecord.po_number || fullRecord.po_work_order_no || '',
        gst: fullRecord.gst ?? '',
        grand_total: fullRecord.grand_total ?? fullRecord.total_value ?? '',
        items: fullRecord.items?.length
          ? fullRecord.items.map((item) => ({
            description: item.description || '',
            rate: item.rate ?? '',
            uom: item.uom || '',
            quantity: item.quantity ?? ''
          }))
          : [blankItem()]
      });
      setPurchasePdf(null);
      setShowForm(true);
      if (!edit) setApprovalChoice('');
    } catch (error) {
      console.error('Error loading purchase register detail:', error);
      toast.error(error.response?.data?.message || 'Failed to load purchase order details');
    }
  };

  const uploadPdf = async (recordId, file) => {
    const data = new FormData();
    data.append('pdf', file);
    await purchaseApi.post(`/purchase-registers/${recordId}/purchase-order-pdf`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  const handlePurchasePdfSelected = async (file) => {
    setPurchasePdf(file || null);
    if (!file) return;
    if (file.type && file.type !== 'application/pdf') {
      setPurchasePdf(null);
      toast.error('Please select a PDF file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPurchasePdf(null);
      toast.error('Purchase order PDF must be 10 MB or smaller');
      return;
    }

    const data = new FormData();
    data.append('pdf', file);
    setExtractingPdf(true);
    try {
      const response = await purchaseApi.post('/purchase-registers/extract-purchase-order-pdf', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const extracted = response.data.data;
      setFormData((current) => ({
        ...current,
        supplier_name: extracted.supplier_name || current.supplier_name,
        po_number: extracted.po_number || current.po_number,
        transaction_date: extracted.transaction_date || current.transaction_date,
        items: extracted.items?.length
          ? extracted.items.map((item) => ({
            description: item.description || '',
            rate: item.rate ?? '',
            uom: item.uom || '',
            quantity: item.quantity ?? ''
          }))
          : current.items,
        gst: extracted.gst === null || extracted.gst === undefined
          ? current.gst
          : String(extracted.gst),
        grand_total: extracted.grand_total === null || extracted.grand_total === undefined
          ? current.grand_total
          : String(extracted.grand_total),
      }));
      if (response.data.message) toast.info(response.data.message);
    } catch (error) {
      console.error('Error extracting purchase order PDF:', error);
      toast.warning(error.response?.data?.message || 'PDF fields could not be extracted; you can enter them manually.');
    } finally {
      setExtractingPdf(false);
    }
  };

  const savePurchaseOrder = async (event) => {
    event.preventDefault();
    if (!activeRecord && !purchasePdf) {
      toast.error('Upload the Purchase Order PDF before saving');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        gst: Number(formData.gst) || 0,
        grand_total: Number(formData.grand_total) || 0,
        created_by: currentUserId,
        updated_by: currentUserId
      };
      const response = activeRecord
        ? await purchaseApi.put(`/update-purchase-register/${activeRecord.id}`, payload)
        : await purchaseApi.post('/create-purchase-register', payload);
      const recordId = activeRecord?.id || response.data.data.id;
      if (purchasePdf) {
        try {
          await uploadPdf(recordId, purchasePdf);
        } catch (uploadError) {
          console.error('Purchase order saved but PDF upload failed:', uploadError);
          toast.error('Purchase order saved, but the PDF upload failed. Reopen the record and upload it again.');
          await fetchPurchases();
          setShowForm(false);
          return;
        }
      }
      toast.success(response.data.message || 'Purchase order saved');
      setShowForm(false);
      setActiveRecord(null);
      await fetchPurchases();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      toast.error(error.response?.data?.message || 'Failed to save purchase order');
    } finally {
      setSaving(false);
    }
  };

  const saveApproval = async () => {
    if (!approvalChoice) {
      toast.error('Select Yes or No for the approval decision');
      return;
    }
    setSaving(true);
    try {
      await purchaseApi.patch(`/purchase-registers/${activeRecord.id}/approval`, {
        approval: approvalChoice,
        updated_by: currentUserId
      });
      toast.success(approvalChoice === 'yes' ? 'Purchase order approved' : 'Purchase order rejected');
      await refreshActiveRecord();
    } catch (error) {
      console.error('Error saving purchase order approval:', error);
      toast.error(error.response?.data?.message || 'Failed to save approval');
    } finally {
      setSaving(false);
    }
  };

  const saveMaterialStatus = async () => {
    setSaving(true);
    try {
      await purchaseApi.patch(`/purchase-registers/${activeRecord.id}/material-receipt`, {
        ...materialForm,
        updated_by: currentUserId
      });
      toast.success('Material receipt details updated');
      await refreshActiveRecord();
    } catch (error) {
      console.error('Error saving material receipt:', error);
      toast.error(error.response?.data?.message || 'Failed to update material receipt');
    } finally {
      setSaving(false);
    }
  };

  const refreshActiveRecord = async () => {
    await fetchPurchases();
    const response = await purchaseApi.get(`/purchase-registers/${activeRecord.id}`);
    const fullRecord = response.data.data;
    setActiveRecord(fullRecord);
    setMaterialForm({
      material_status: fullRecord.material_status || 'not_received',
      invoice_no: fullRecord.invoice_no || '',
      invoice_date: showDate(fullRecord.invoice_date) === '-' ? '' : showDate(fullRecord.invoice_date),
      credit_period_days: fullRecord.credit_period_days ?? ''
    });
  };

  const syncPayments = async () => {
    if (!selectedYear) {
      toast.warning('Select a financial year before syncing payments');
      return;
    }
    setSyncing(true);
    try {
      const response = await purchaseApi.get(`/purchase-registers/sync-payments?finance_year_id=${encodeURIComponent(selectedYear)}`);
      toast.success(`${response.data.data.with_payment} purchase record(s) matched to bank payments`);
      await fetchPurchases();
      if (activeRecord) await refreshActiveRecord();
    } catch (error) {
      console.error('Error synchronizing purchase payments:', error);
      toast.error(error.response?.data?.message || 'Failed to synchronize payment data');
    } finally {
      setSyncing(false);
    }
  };

  const deleteRecord = async (record) => {
    if (!window.confirm(`Delete purchase order ${record.po_number || ''}?`)) return;
    try {
      await purchaseApi.delete(`/delete-purchase-register/${record.id}`);
      toast.success('Purchase order deleted');
      await fetchPurchases();
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast.error(error.response?.data?.message || 'Failed to delete purchase order');
    }
  };

  const clearFilters = () => setFilters({});

  const downloadPdf = async (record) => {
    try {
      const response = await purchaseApi.get(`/purchase-registers/${record.id}/purchase-order-pdf`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.po_pdf_name || 'purchase-order.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading purchase order PDF:', error);
      toast.error(error.response?.data?.message || 'Failed to download the purchase order PDF');
    }
  };

  const renderFilter = (field, label) => {
    const options = {
      master_approval: [['pending', 'Pending'], ['yes', 'Yes'], ['no', 'No']],
      material_status: [['not_received', 'Not received'], ['received', 'Received']],
      payment_status: [['pending', 'Pending'], ['partial', 'Partial'], ['paid', 'Paid']]
    };
    return (
      <label key={field} className="flex min-w-36 flex-col gap-1 text-xs font-medium text-gray-600">
        {label}
        {options[field] ? (
          <select
            value={filters[field] || ''}
            onChange={(event) => setFilters((current) => ({ ...current, [field]: event.target.value }))}
            className="rounded-md border border-gray-300 px-2 py-1.5 font-normal"
          >
            <option value="">All</option>
            {options[field].map(([value, optionLabel]) => (
              <option key={value} value={value}>{optionLabel}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={filters[field] || ''}
            onChange={(event) => setFilters((current) => ({ ...current, [field]: event.target.value }))}
            placeholder={`Filter ${label.toLowerCase()}`}
            className="rounded-md border border-gray-300 px-2 py-1.5 font-normal"
          />
        )}
      </label>
    );
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-[2400px] divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {FILTER_FIELDS.map(([, label]) => (
              <th key={label} className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase text-gray-600">{label}</th>
            ))}
            <th className="sticky right-0 bg-gray-50 px-3 py-3 text-center text-xs font-semibold uppercase text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td colSpan={FILTER_FIELDS.length + 1} className="py-10 text-center text-gray-500"><Loader2 className="mx-auto h-6 w-6 animate-spin" />Loading records...</td></tr>
          ) : filteredPurchases.length === 0 ? (
            <tr><td colSpan={FILTER_FIELDS.length + 1} className="py-10 text-center text-gray-500">No purchase orders match these filters.</td></tr>
          ) : filteredPurchases.map((record) => (
            <tr key={record.id} className="hover:bg-blue-50">
              <td className="whitespace-nowrap px-3 py-3">{showDate(record.transaction_date)}</td>
              <td className="px-3 py-3">{record.supplier_name}</td>
              <td className="px-3 py-3">{record.po_number || record.po_work_order_no || '-'}</td>
              <td className="max-w-56 truncate px-3 py-3" title={record.items?.map((item) => item.description).join('; ') || record.invoice_description}>
                {record.items?.length ? record.items.map((item) => item.description).join('; ') : record.invoice_description || '-'}
              </td>
              <td className="px-3 py-3">{record.items?.length > 1 ? 'Multiple' : showAmount(record.items?.[0]?.rate ?? record.rate)}</td>
              <td className="px-3 py-3">{record.items?.length > 1 ? 'Multiple' : record.items?.[0]?.uom || record.uom || '-'}</td>
              <td className="px-3 py-3">{record.quantity ?? '-'}</td>
              <td className="px-3 py-3">{showAmount(record.gst)}</td>
              <td className="px-3 py-3 font-semibold">{showAmount(record.grand_total ?? record.total_value)}</td>
              <td className="px-3 py-3">{record.master_approval?.toUpperCase() || 'PENDING'}</td>
              <td className="whitespace-nowrap px-3 py-3">{record.master_approval_at ? new Date(record.master_approval_at).toLocaleString() : '-'}</td>
              <td className="px-3 py-3">{record.material_status === 'received' ? 'Received' : 'Not received'}</td>
              <td className="px-3 py-3">{record.invoice_no || '-'}</td>
              <td className="px-3 py-3">{showDate(record.invoice_date)}</td>
              <td className="whitespace-nowrap px-3 py-3">{record.material_receipt_at ? new Date(record.material_receipt_at).toLocaleString() : '-'}</td>
              <td className="px-3 py-3">{record.credit_period_days ?? '-'}</td>
              <td className="px-3 py-3">{showDate(record.payment_due_date)}</td>
              <td className="px-3 py-3">{showDate(record.date_of_payment)}</td>
              <td className="px-3 py-3">{record.payment_status || 'pending'}</td>
              <td className="max-w-48 truncate px-3 py-3" title={record.utr_details}>{record.utr_details || '-'}</td>
              <td className="sticky right-0 whitespace-nowrap bg-white px-3 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <button onClick={() => openRecord(record)} title="View workflow" className="rounded p-1.5 text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></button>
                  {canManagePurchase && record.master_approval !== 'yes' && record.material_status !== 'received' && (
                    <button onClick={() => openRecord(record, true)} title="Edit purchase order" className="rounded p-1.5 text-amber-600 hover:bg-amber-50"><FileText className="h-4 w-4" /></button>
                  )}
                  {canManagePurchase && <button onClick={() => deleteRecord(record)} title="Delete" className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDashboard = () => (
    <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
      <div className="grid grid-cols-2 gap-4 xl:col-span-2">
        {[
          ['Filtered POs', filteredPurchases.length],
          ['Grand Total', `₹${showAmount(dashboard.grandTotal)}`],
          ['GST', `₹${showAmount(dashboard.gst)}`],
          ['Open Payment Value', `₹${showAmount(dashboard.due)}`]
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
      <ChartPanel title="Purchase value by register">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dashboard.paymentStatusChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${showAmount(value)}`} />
            <Bar dataKey="value" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
      <ChartPanel title="Approval status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={dashboard.approvalChart} dataKey="value" nameKey="name" outerRadius={100} label>
              {dashboard.approvalChart.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>
      <ChartPanel title="Material receipt status">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={dashboard.materialChart} dataKey="value" nameKey="name" outerRadius={100} label>
              {dashboard.materialChart.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>
      <ChartPanel title="Top suppliers by PO value">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dashboard.supplierChart} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={120} />
            <Tooltip formatter={(value) => `₹${showAmount(value)}`} />
            <Bar dataKey="value" fill="#0f766e" />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">
        <section className="mb-5 rounded-xl bg-white p-5 shadow-lg md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Purchase Register</h1>
              <p className="mt-1 text-sm text-gray-500">GST purchase orders, approval, material receipt and payment tracking</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="bg-transparent text-sm outline-none">
                  <option value="">All financial years</option>
                  {financialYears.map((year) => <option key={year.id} value={year.id}>{year.start_year} - {year.end_year}</option>)}
                </select>
              </label>
              {canManagePurchase && (
                <>
                  <button onClick={syncPayments} disabled={syncing || !selectedYear} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />{syncing ? 'Syncing...' : 'Sync Bank Payments'}
                  </button>
                  <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                    <Plus className="h-4 w-4" />Create Purchase Order
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <StageBadge number="1" label="Finance: upload PO and enter line items" />
            <StageBadge number="2" label="MD: approve or reject" />
            <StageBadge number="3" label="Material receipt, invoice and payment tracking" />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 text-gray-700"><ListFilter className="h-5 w-5 text-blue-600" /><h2 className="font-semibold">Purchase Orders ({filteredPurchases.length})</h2></div>
            <div className="flex items-center gap-2">
              <button onClick={clearFilters} className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">Clear filters</button>
              <button onClick={() => setView('table')} className={`rounded-md px-3 py-2 text-sm ${view === 'table' ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'}`}><span className="inline-flex items-center gap-2"><Search className="h-4 w-4" />Table</span></button>
              <button onClick={() => setView('dashboard')} className={`rounded-md px-3 py-2 text-sm ${view === 'dashboard' ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600'}`}><span className="inline-flex items-center gap-2"><ChartNoAxesCombined className="h-4 w-4" />Dashboard</span></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 border-b border-gray-100 bg-gray-50/70 p-4">
            {FILTER_FIELDS.map(([field, label]) => renderFilter(field, label))}
          </div>
          {view === 'table' ? renderTable() : renderDashboard()}
        </section>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{activeRecord ? `Purchase Order: ${activeRecord.po_number || ''}` : 'Create Purchase Order'}</h2>
                <p className="text-sm text-gray-500">{activeRecord ? `Stage: ${activeRecord.master_approval === 'pending' ? 'Approval pending' : activeRecord.material_status === 'received' ? 'Material received' : 'Material not received'}` : 'Stage 1 · Finance entry'}</p>
              </div>
              <button onClick={() => { setShowForm(false); setActiveRecord(null); }} className="rounded p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-6 p-5">
              <form onSubmit={savePurchaseOrder} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input label="Financial Year" required>
                    <select value={formData.finance_year_id} onChange={(event) => updateForm('finance_year_id', event.target.value)} disabled={!!activeRecord || !canManagePurchase} required className={inputClass}>
                      <option value="">Select financial year</option>
                      {financialYears.map((year) => <option key={year.id} value={year.id}>{year.start_year} - {year.end_year}</option>)}
                    </select>
                  </Input>
                  <Input label="PO Date" required><input type="date" required value={formData.transaction_date} onChange={(event) => updateForm('transaction_date', event.target.value)} disabled={purchaseDetailsReadOnly} className={inputClass} /></Input>
                  <Input label="Supplier" required><input required maxLength={255} value={formData.supplier_name} onChange={(event) => updateForm('supplier_name', event.target.value)} disabled={purchaseDetailsReadOnly} className={inputClass} /></Input>
                  <Input label="PO Number" required><input required maxLength={100} value={formData.po_number} onChange={(event) => updateForm('po_number', event.target.value)} disabled={purchaseDetailsReadOnly} className={inputClass} /></Input>
                  <Input label="Upload Purchase Order PDF" required={!activeRecord}>
                    <input type="file" accept="application/pdf,.pdf" onChange={(event) => handlePurchasePdfSelected(event.target.files?.[0] || null)} disabled={purchaseDetailsReadOnly || extractingPdf} className={inputClass} />
                    {extractingPdf && <p className="mt-1 text-xs text-blue-700">Reading PO values from PDF...</p>}
                    {purchasePdf && !extractingPdf && <p className="mt-1 text-xs text-gray-600">Selected: {purchasePdf.name}. Review all extracted values before saving.</p>}
                    {activeRecord?.po_pdf_name && !purchasePdf && (
                      <button type="button" onClick={() => downloadPdf(activeRecord)} className="mt-1 inline-flex items-center gap-1 text-xs text-blue-700 hover:underline">
                        <Download className="h-3 w-3" />Download {activeRecord.po_pdf_name}
                      </button>
                    )}
                  </Input>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-[800px] w-full text-sm">
                    <thead className="bg-gray-50"><tr>{['#', 'Description', 'Rate', 'UOM', 'Qty', 'Line Amount', ''].map((label) => <th key={label} className="px-3 py-2 text-left">{label}</th>)}</tr></thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2"><input required value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} disabled={purchaseDetailsReadOnly} className={inputClass} /></td>
                          <td className="px-3 py-2"><input type="number" min="0" step="0.01" required value={item.rate} onChange={(event) => updateItem(index, 'rate', event.target.value)} disabled={purchaseDetailsReadOnly} className={`${inputClass} min-w-28`} /></td>
                          <td className="px-3 py-2"><input value={item.uom} onChange={(event) => updateItem(index, 'uom', event.target.value)} disabled={purchaseDetailsReadOnly} className={`${inputClass} min-w-24`} /></td>
                          <td className="px-3 py-2"><input type="number" min="0" step="0.001" required value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} disabled={purchaseDetailsReadOnly} className={`${inputClass} min-w-24`} /></td>
                          <td className="whitespace-nowrap px-3 py-2">₹{showAmount((Number(item.rate) || 0) * (Number(item.quantity) || 0))}</td>
                          <td className="px-3 py-2">
                            {formData.items.length > 1 && !purchaseDetailsReadOnly && <button type="button" onClick={() => setFormData((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))} className="text-red-600 hover:text-red-800" title="Remove line"><X className="h-4 w-4" /></button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!purchaseDetailsReadOnly && <button type="button" onClick={() => setFormData((current) => ({ ...current, items: [...current.items, blankItem()] }))} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"><Plus className="h-4 w-4" />Add line item</button>}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Input label="GST amount"><input type="number" min="0" step="0.01" value={formData.gst} onChange={(event) => updateForm('gst', event.target.value)} disabled={purchaseDetailsReadOnly} className={inputClass} /></Input>
                  <Input label="Grand Total" required><input type="number" min="0" step="0.01" required value={formData.grand_total} onChange={(event) => updateForm('grand_total', event.target.value)} disabled={purchaseDetailsReadOnly} className={inputClass} /></Input>
                  <div className="rounded-lg bg-blue-50 p-3 text-sm"><p className="text-gray-600">Sum of line items</p><p className="mt-1 text-lg font-semibold text-blue-800">₹{showAmount(computedItemTotal(formData.items))}</p><p className="mt-1 text-xs text-gray-500">Enter GST and the overall Grand Total above.</p></div>
                </div>
                {canManagePurchase && (!activeRecord || (activeRecord.master_approval !== 'yes' && activeRecord.material_status !== 'received')) && (
                  <div className="flex justify-end gap-2 border-t pt-4">
                    <button type="button" onClick={() => { setShowForm(false); setActiveRecord(null); }} className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : activeRecord ? 'Update PO' : 'Save and Submit'}</button>
                  </div>
                )}
              </form>

              {activeRecord && (
                <>
                  {isManagingDirector && <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <h3 className="font-semibold text-gray-800">Stage 2 · MD approval</h3>
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <Input label="Approval decision">
                        <select value={activeRecord.master_approval === 'pending' ? approvalChoice : activeRecord.master_approval} onChange={(event) => setApprovalChoice(event.target.value)} disabled={activeRecord.master_approval !== 'pending'} className={inputClass}>
                          <option value="">Select Yes or No</option><option value="yes">Yes — approve</option><option value="no">No — reject</option>
                        </select>
                      </Input>
                      {activeRecord.master_approval === 'pending' && <button onClick={saveApproval} disabled={saving || !approvalChoice} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save approval'}</button>}
                      <p className="pb-2 text-sm text-gray-600">Current: <strong>{activeRecord.master_approval || 'pending'}</strong> · Decision timestamp: <strong>{activeRecord.master_approval_at ? new Date(activeRecord.master_approval_at).toLocaleString() : 'Not decided'}</strong></p>
                    </div>
                  </section>}

                  {canManagePurchase && <section className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <h3 className="font-semibold text-gray-800">Stage 3 · Material receipt and invoice</h3>
                    {activeRecord.master_approval !== 'yes' && <p className="mt-2 text-sm text-amber-700">Approval must be Yes before material receipt can be recorded.</p>}
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                      <Input label="Material status">
                        <select value={materialForm.material_status} onChange={(event) => setMaterialForm((current) => ({ ...current, material_status: event.target.value }))} disabled={activeRecord.master_approval !== 'yes'} className={inputClass}>
                          <option value="not_received">Not received</option><option value="received">Received</option>
                        </select>
                      </Input>
                      {materialForm.material_status === 'received' && (
                        <>
                          <Input label="Invoice No" required><input required value={materialForm.invoice_no} onChange={(event) => setMaterialForm((current) => ({ ...current, invoice_no: event.target.value }))} disabled={activeRecord.master_approval !== 'yes'} className={inputClass} /></Input>
                          <Input label="Invoice Date" required><input type="date" required value={materialForm.invoice_date} onChange={(event) => setMaterialForm((current) => ({ ...current, invoice_date: event.target.value }))} disabled={activeRecord.master_approval !== 'yes'} className={inputClass} /></Input>
                          <Input label="Credit Period (days)" required><input type="number" min="0" step="1" required value={materialForm.credit_period_days} onChange={(event) => setMaterialForm((current) => ({ ...current, credit_period_days: event.target.value }))} disabled={activeRecord.master_approval !== 'yes'} className={inputClass} /></Input>
                        </>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      {activeRecord.master_approval === 'yes' && <button onClick={saveMaterialStatus} disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save material / invoice details'}</button>}
                      <p className="text-sm text-gray-600">Receipt timestamp: <strong>{activeRecord.material_receipt_at ? new Date(activeRecord.material_receipt_at).toLocaleString() : 'Not received'}</strong> · Payment due: <strong>{showDate(activeRecord.payment_due_date)}</strong></p>
                    </div>
                  </section>}

                  {canManagePurchase && <section className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">Payment tracking</h3>
                        <p className="mt-1 text-sm text-gray-600">Matched by financial year and invoice number from Bank Statement Consolidation.</p>
                      </div>
                      <button onClick={syncPayments} disabled={syncing || !selectedYear} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />Sync payments</button>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <ReadOnly label="Payment Date" value={showDate(activeRecord.date_of_payment)} />
                      <ReadOnly label="Payment Status" value={activeRecord.payment_status || 'pending'} />
                      <ReadOnly label="UTR" value={activeRecord.utr_details || '-'} />
                    </div>
                  </section>}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100';

function Input({ label, required, children }) {
  return <label className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-600"> *</span>}<div className="mt-1">{children}</div></label>;
}

function ReadOnly({ label, value }) {
  return <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 break-words text-sm font-medium text-gray-800">{value}</p></div>;
}

function StageBadge({ number, label }) {
  return <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-800"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">{number}</span>{label}</span>;
}

function ChartPanel({ title, children }) {
  return <div className="min-h-72 rounded-xl border border-gray-100 p-4"><h3 className="mb-3 font-semibold text-gray-700">{title}</h3><div className="h-64">{children}</div></div>;
}

export default PurchaseRegister;

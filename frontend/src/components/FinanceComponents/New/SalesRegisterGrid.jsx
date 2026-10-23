import { API_BASE_URL } from '../../../config/api.js';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import RegisterViewSwitch from './RegisterViewSwitch';
import RegisterDashboardPage from './RegisterDashboardPage';

const createInvoice = () => ({ transaction_date: new Date().toISOString().slice(0, 10), invoice_no: '', customer_name: '', sales_type: '' });
const createItem = () => ({ particular: '', quantity: '', uom: '', rate: '', gst_percentage: '' });
const columns = ['DATE', 'INVOICE NO', 'PARTY NAME', 'SALES TYPE', 'PARTICULAR', 'QTY', 'UOM', 'RATE', 'SALE AMOUNT', 'GST %', 'TOTAL'];
const uomsBySalesType = { supply: ['NOS', 'KGS', 'LITRE', 'LS'], service: ['NOS', 'SQFT', 'SQMETER', 'SQINCHE'] };
const cellInput = 'w-full min-w-[92px] rounded border border-gray-300 bg-white px-2 py-2 text-sm';
const money = value => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SalesRegisterGrid = () => {
  const [invoice, setInvoice] = useState(createInvoice);
  const [items, setItems] = useState([createItem()]);
  const [sales, setSales] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  const fetchSales = useCallback(async (yearId = selectedYear) => {
    if (!yearId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/sales-registers?finance_year_id=${yearId}`);
      setSales(response.data.data?.records || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  const syncBankStatements = async (yearId = selectedYear) => {
    if (!yearId) return toast.warning('Please select a financial year first');
    setSyncing(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/sync-bank-statement?finance_year_id=${yearId}`);
      const data = response.data.data || {};
      if (data.synced_sales || data.synced_purchase) toast.success(`Bank data synced. Sales: ${data.synced_sales || 0}, Purchase: ${data.synced_purchase || 0}`);
      else toast.info('No new data to sync from bank statements');
      await fetchSales(yearId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sync bank statements');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const loadYears = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/finance/financial-years`);
        const years = response.data.data || response.data || [];
        setFinancialYears(years);
        const activeYear = years.find(year => year.is_active === 1 || year.is_active === true);
        if (activeYear) setSelectedYear(String(activeYear.id));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch financial years');
      }
    };
    loadYears();
  }, []);

  useEffect(() => { if (selectedYear) fetchSales(selectedYear); }, [fetchSales, selectedYear]);

  const updateItem = (index, field, value) => setItems(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const setSalesType = value => {
    setInvoice(current => ({ ...current, sales_type: value }));
    setItems(current => current.map(item => ({ ...item, uom: '' })));
  };
  const amountsFor = item => {
    const saleAmount = Math.round(Number(item.quantity || 0) * Number(item.rate || 0) * 100) / 100;
    const gstAmount = Math.round(saleAmount * Number(item.gst_percentage || 0)) / 100;
    return { saleAmount, gstAmount, total: Math.round((saleAmount + gstAmount) * 100) / 100 };
  };

  const saveInvoice = async event => {
    event.preventDefault();
    if (!selectedYear) return toast.error('Select a financial year');
    if (!invoice.transaction_date || !invoice.invoice_no.trim() || !invoice.customer_name.trim() || !['supply', 'service'].includes(invoice.sales_type)) return toast.error('Date, invoice number, party name and sales type are required');
    if (!items.length || items.some(item => !item.particular.trim() || !item.uom || !item.quantity || item.rate === '' || Number(item.quantity) <= 0 || Number(item.rate) < 0 || Number(item.gst_percentage || 0) < 0 || Number(item.gst_percentage || 0) > 100)) {
      return toast.error('Each particular needs a valid UOM, positive quantity, valid rate and GST percentage from 0 to 100');
    }

    setSaving(true);
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const response = await axios.post(`${API_BASE_URL}/finance/create-sales-invoice`, {
        ...invoice,
        finance_year_id: selectedYear,
        created_by: user.id || user.user_id || 1,
        items: items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          gst_percentage: Number(item.gst_percentage || 0),
          supply: invoice.sales_type === 'supply',
          service: invoice.sales_type === 'service'
        }))
      });
      toast.success(`Invoice saved with ${response.data.data.item_count} particular(s)`);
      setInvoice(createInvoice());
      setItems([createItem()]);
      await fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save sales invoice');
    } finally {
      setSaving(false);
    }
  };

  const invoiceTotal = items.reduce((sum, item) => sum + amountsFor(item).total, 0);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-screen-2xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-300 pb-4">
          <div><h1 className="text-2xl font-semibold text-gray-900">Sales Register</h1><p className="mt-1 text-sm text-gray-600">Create invoices with one or more particulars</p></div>
          <div className="flex flex-wrap items-center gap-3">
            <RegisterViewSwitch value={viewMode} onChange={setViewMode} />
            {viewMode === 'table' && <>
              <label className="flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm"><Calendar size={16} /><select aria-label="Financial year" className="bg-transparent" value={selectedYear} onChange={event => setSelectedYear(event.target.value)}><option value="">Select Financial Year</option>{financialYears.map(year => <option key={year.id} value={year.id}>{year.start_year} - {year.end_year}</option>)}</select></label>
              <button type="button" onClick={() => syncBankStatements()} disabled={!selectedYear || syncing} className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"><RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />{syncing ? 'Syncing...' : 'Sync Bank Data'}</button>
            </>}
          </div>
        </header>

        {viewMode === 'dashboard' ? <RegisterDashboardPage dashboard="sales" embedded financialYearId={selectedYear} /> : <>
          <form onSubmit={saveInvoice} className="space-y-4">
            <div className="overflow-x-auto border border-gray-300 bg-white"><table className="w-full min-w-[1450px] border-collapse text-sm">
              <thead><tr className="text-center font-semibold text-gray-900">{columns.map(header => <th key={header} className="border border-gray-400 px-3 py-2">{header}</th>)}<th className="border border-gray-400 px-3 py-2">ACTION</th></tr></thead>
              <tbody>{items.map((item, index) => {
                const amounts = amountsFor(item);
                return <tr key={index} className="border-b border-gray-200">
                  {index === 0 && <>
                    <td rowSpan={items.length} className="border border-gray-300 p-2 align-top"><input required aria-label="Invoice date" type="date" className={cellInput} value={invoice.transaction_date} onChange={event => setInvoice(current => ({ ...current, transaction_date: event.target.value }))} /></td>
                    <td rowSpan={items.length} className="border border-gray-300 p-2 align-top"><input required aria-label="Invoice number" className={cellInput} value={invoice.invoice_no} onChange={event => setInvoice(current => ({ ...current, invoice_no: event.target.value }))} /></td>
                    <td rowSpan={items.length} className="border border-gray-300 p-2 align-top"><input required aria-label="Party name" className={cellInput} value={invoice.customer_name} onChange={event => setInvoice(current => ({ ...current, customer_name: event.target.value }))} /></td>
                    <td rowSpan={items.length} className="border border-gray-300 p-2 align-top"><select required aria-label="Sales type" className={cellInput} value={invoice.sales_type} onChange={event => setSalesType(event.target.value)}><option value="">Select type</option><option value="supply">Supply</option><option value="service">Service</option></select></td>
                  </>}
                  <td className="border border-gray-300 p-2"><input required aria-label={`Particular ${index + 1}`} className={cellInput} value={item.particular} onChange={event => updateItem(index, 'particular', event.target.value)} /></td>
                  <td className="border border-gray-300 p-2"><input required aria-label={`Quantity ${index + 1}`} type="number" min="0.001" step="0.001" className={cellInput} value={item.quantity} onChange={event => updateItem(index, 'quantity', event.target.value)} /></td>
                  <td className="border border-gray-300 p-2"><select required disabled={!invoice.sales_type} aria-label={`UOM ${index + 1}`} className={cellInput} value={item.uom} onChange={event => updateItem(index, 'uom', event.target.value)}><option value="">Select UOM</option>{(uomsBySalesType[invoice.sales_type] || []).map(uom => <option key={uom} value={uom}>{uom}</option>)}</select></td>
                  <td className="border border-gray-300 p-2"><input required aria-label={`Rate ${index + 1}`} type="number" min="0" step="0.01" className={cellInput} value={item.rate} onChange={event => updateItem(index, 'rate', event.target.value)} /></td>
                  <td className="border border-gray-300 bg-gray-50 p-2 text-right">{money(amounts.saleAmount)}</td>
                  <td className="border border-gray-300 p-2"><input aria-label={`GST percentage ${index + 1}`} type="number" min="0" max="100" step="0.01" className={cellInput} value={item.gst_percentage} onChange={event => updateItem(index, 'gst_percentage', event.target.value)} /><div className="mt-1 text-right text-xs text-gray-500">₹{money(amounts.gstAmount)}</div></td>
                  <td className="border border-gray-300 bg-gray-50 p-2 text-right font-semibold">{money(amounts.total)}</td>
                  <td className="border border-gray-300 p-2 text-center"><button type="button" disabled={items.length === 1} onClick={() => setItems(current => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded border border-gray-300 p-2 text-red-700 hover:bg-red-50 disabled:opacity-40" title="Remove particular"><Trash2 size={16} /></button></td>
                </tr>;
              })}</tbody>
              <tfoot><tr className="bg-gray-50 font-semibold"><td colSpan="10" className="border border-gray-300 px-3 py-2 text-right">Invoice Total</td><td className="border border-gray-300 px-3 py-2 text-right">{money(invoiceTotal)}</td><td className="border border-gray-300"></td></tr></tfoot>
            </table></div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => setItems(current => [...current, createItem()])} className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-100"><Plus size={16} /> Add Particular</button>
              <button type="submit" disabled={saving || !selectedYear} className="inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"><Save size={16} />{saving ? 'Saving Invoice...' : 'Save Invoice'}</button>
            </div>
          </form>

          <section className="overflow-x-auto border border-gray-300 bg-white">
            <div className="flex items-center justify-between border-b border-gray-300 px-4 py-3"><h2 className="font-semibold text-gray-900">Saved Sales Lines</h2><span className="text-sm text-gray-600">{sales.length} line(s)</span></div>
            <table className="w-full min-w-[1450px] border-collapse text-sm"><thead><tr className="text-center font-semibold text-gray-900">{columns.map(header => <th key={header} className="border border-gray-400 px-3 py-2">{header}</th>)}</tr></thead>
              <tbody>{loading ? <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-500">Loading sales...</td></tr> : sales.length === 0 ? <tr><td colSpan="11" className="px-4 py-8 text-center text-gray-500">No sales lines found for this financial year.</td></tr> : sales.map(line => <tr key={line.id} className="border-b border-gray-200">
                <td className="border border-gray-300 px-3 py-2">{String(line.transaction_date || '').slice(0, 10)}</td><td className="border border-gray-300 px-3 py-2">{line.invoice_no}</td><td className="border border-gray-300 px-3 py-2">{line.customer_name}</td><td className="border border-gray-300 px-3 py-2">{Number(line.supply) ? 'Supply' : Number(line.service) ? 'Service' : '-'}</td><td className="border border-gray-300 px-3 py-2">{line.invoice_description || '-'}</td><td className="border border-gray-300 px-3 py-2 text-right">{Number(line.quantity || 0)}</td><td className="border border-gray-300 px-3 py-2">{line.uom || '-'}</td><td className="border border-gray-300 px-3 py-2 text-right">{money(line.rate)}</td><td className="border border-gray-300 px-3 py-2 text-right">{money(line.sale_amount ?? Number(line.rate || 0) * Number(line.quantity || 0))}</td><td className="border border-gray-300 px-3 py-2 text-right"><div>{Number(line.gst_percentage || 0)}%</div><div className="text-xs text-gray-500">₹{money(line.gst)}</div></td><td className="border border-gray-300 px-3 py-2 text-right">{money(line.total_value)}</td>
              </tr>)}</tbody>
            </table>
          </section>
        </>}
      </div>
    </main>
  );
};

export default SalesRegisterGrid;

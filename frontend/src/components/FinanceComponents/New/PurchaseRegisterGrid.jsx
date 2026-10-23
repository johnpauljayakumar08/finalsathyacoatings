import { API_BASE_URL } from '../../../config/api.js';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import RegisterViewSwitch from './RegisterViewSwitch';
import RegisterDashboardPage from './RegisterDashboardPage';

const createBill = () => ({
  transaction_date: new Date().toISOString().slice(0, 10),
  received_date: '',
  supplier_name: '',
  bill_no: '',
  purchase_type: ''
});

const createItem = () => ({
  description: '',
  purchased_for: '',
  quantity: '',
  uom: '',
  rate: '',
  gst_percentage: ''
});

const columns = ['Date', 'Received dt', 'Supplier name', 'Bill No', 'Purchase Type', 'Discription of goods', 'Purchased for', 'Qty', 'UOM', 'Rate', 'Sale amt', 'GST %', 'Total'];
const purchaseUoms = ['NOS', 'KGS', 'LITRE', 'LS'];
const cellClass = 'w-full min-w-[90px] border-0 bg-transparent px-2 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600';
const formatAmount = value => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PurchaseRegisterGrid = () => {
  const [bill, setBill] = useState(createBill);
  const [items, setItems] = useState([createItem()]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  const loadEntries = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/compound-purchase-entries`);
      setEntries(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load purchase entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEntries(); }, []);

  const updateBill = (field, value) => setBill(current => ({ ...current, [field]: value }));
  const updateItem = (index, field, value) => setItems(current => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const amountsFor = item => {
    const saleAmount = Math.round(Number(item.quantity || 0) * Number(item.rate || 0) * 100) / 100;
    const gstAmount = Math.round(saleAmount * Number(item.gst_percentage || 0)) / 100;
    return { saleAmount, gstAmount, totalAmount: Math.round((saleAmount + gstAmount) * 100) / 100 };
  };

  const saveBill = async event => {
    event.preventDefault();
    if (!bill.transaction_date || !bill.supplier_name.trim() || !bill.bill_no.trim() || !bill.purchase_type) {
      return toast.error('Date, supplier, bill number and purchase type are required');
    }
    if (!items.length || items.some(item => !item.description.trim() || !item.quantity || !item.uom.trim() || item.rate === '' || Number(item.quantity) <= 0 || Number(item.rate) < 0 || Number(item.gst_percentage || 0) < 0 || Number(item.gst_percentage || 0) > 100)) {
      return toast.error('Each item needs a description, quantity, UOM, valid rate and GST percentage from 0 to 100');
    }

    setSaving(true);
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      await axios.post(`${API_BASE_URL}/finance/compound-purchase-entries`, {
        ...bill,
        purchased_for: undefined,
        created_by: user.id || user.user_id || 1,
        items: items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          gst_percentage: Number(item.gst_percentage || 0),
          purchased_for: item.purchased_for.trim()
        }))
      });
      toast.success(`Bill saved with ${items.length} item(s)`);
      setBill(createBill());
      setItems([createItem()]);
      await loadEntries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save purchase entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-screen-2xl space-y-5">
        <header className="border-b border-gray-300 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold text-gray-900">Purchase Register - New</h1><RegisterViewSwitch value={viewMode} onChange={setViewMode} /></div>
        </header>

        {viewMode === 'dashboard' ? <RegisterDashboardPage dashboard="purchase" embedded /> : <>
        <form onSubmit={saveBill} className="overflow-x-auto border border-gray-300 bg-white">
          <table className="w-full min-w-[1750px] border-collapse text-left">
            <thead><tr className="text-gray-900">{columns.map(column => <th key={column} className="border border-gray-400 px-2 py-3 text-sm font-semibold">{column}</th>)}<th className="border border-gray-400 px-2 py-3 text-sm font-semibold">Action</th></tr></thead>
            <tbody>{items.map((item, index) => {
              const amounts = amountsFor(item);
              return <tr key={index} className="bg-emerald-50/50">
                {index === 0 && <>
                  <td rowSpan={items.length} className="border border-gray-300 p-1 align-top"><input required aria-label="Date" type="date" className={cellClass} value={bill.transaction_date} onChange={event => updateBill('transaction_date', event.target.value)} /></td>
                  <td rowSpan={items.length} className="border border-gray-300 p-1 align-top"><input aria-label="Received date" type="date" className={cellClass} value={bill.received_date} onChange={event => updateBill('received_date', event.target.value)} /></td>
                  <td rowSpan={items.length} className="border border-gray-300 p-1 align-top"><input required aria-label="Supplier name" className={cellClass} value={bill.supplier_name} onChange={event => updateBill('supplier_name', event.target.value)} /></td>
                  <td rowSpan={items.length} className="border border-gray-300 p-1 align-top"><input required aria-label="Bill number" className={cellClass} value={bill.bill_no} onChange={event => updateBill('bill_no', event.target.value)} /></td>
                  <td rowSpan={items.length} className="border border-gray-300 p-1 align-top"><select required aria-label="Purchase type" className={cellClass} value={bill.purchase_type} onChange={event => updateBill('purchase_type', event.target.value)}><option value="">Select type</option><option value="project">Project</option><option value="supply">Supply</option></select></td>
                </>}
                <td className="border border-gray-300 p-1"><input required aria-label={`Description of goods ${index + 1}`} className={cellClass} value={item.description} onChange={event => updateItem(index, 'description', event.target.value)} /></td>
                <td className="border border-gray-300 p-1"><input aria-label={`Purchased for ${index + 1}`} className={cellClass} value={item.purchased_for} onChange={event => updateItem(index, 'purchased_for', event.target.value)} /></td>
                <td className="border border-gray-300 p-1"><input required aria-label={`Quantity ${index + 1}`} type="number" min="0.001" step="0.001" className={`${cellClass} text-right`} value={item.quantity} onChange={event => updateItem(index, 'quantity', event.target.value)} /></td>
                <td className="border border-gray-300 p-1"><select required aria-label={`UOM ${index + 1}`} className={cellClass} value={item.uom} onChange={event => updateItem(index, 'uom', event.target.value)}><option value="">Select UOM</option>{purchaseUoms.map(uom => <option key={uom} value={uom}>{uom}</option>)}</select></td>
                <td className="border border-gray-300 p-1"><input required aria-label={`Rate ${index + 1}`} type="number" min="0" step="0.01" className={`${cellClass} text-right`} value={item.rate} onChange={event => updateItem(index, 'rate', event.target.value)} /></td>
                <td className="border border-gray-300 bg-gray-50 px-3 py-2 text-right">{formatAmount(amounts.saleAmount)}</td>
                <td className="border border-gray-300 p-1"><input aria-label={`GST percentage ${index + 1}`} type="number" min="0" max="100" step="0.01" className={`${cellClass} text-right`} value={item.gst_percentage} onChange={event => updateItem(index, 'gst_percentage', event.target.value)} /><div className="px-2 text-right text-xs text-gray-500">₹{formatAmount(amounts.gstAmount)}</div></td>
                <td className="border border-gray-300 bg-gray-50 px-3 py-2 text-right font-semibold">{formatAmount(amounts.totalAmount)}</td>
                <td className="border border-gray-300 p-2"><button type="button" disabled={items.length === 1} onClick={() => setItems(current => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded border border-gray-300 p-2 text-red-700 hover:bg-red-50 disabled:opacity-40" title="Remove item"><Trash2 size={15} /></button></td>
              </tr>;
            })}</tbody>
          </table>
        </form>

        <div className="flex flex-wrap justify-between gap-3">
          <button type="button" onClick={() => setItems(current => [...current, createItem()])} className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-100"><Plus size={16} /> Add Item</button>
          <button type="button" onClick={saveBill} disabled={saving} className="inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"><Save size={15} />{saving ? 'Saving Bill' : 'Save Bill'}</button>
        </div>

        <section className="overflow-x-auto border border-gray-300 bg-white">
          <div className="border-b border-gray-300 px-4 py-3"><h2 className="font-semibold text-gray-900">Saved Purchase Entries</h2></div>
          <table className="w-full min-w-[1750px] border-collapse text-sm">
            <thead><tr className=" text-gray-900">{columns.map(column => <th key={column} className="border border-gray-400 px-2 py-3 text-left font-semibold">{column}</th>)}</tr></thead>
            <tbody>{loading ? <tr><td colSpan="13" className="px-4 py-8 text-center text-gray-500">Loading purchase entries...</td></tr> : entries.length === 0 ? <tr><td colSpan="13" className="px-4 py-8 text-center text-gray-500">No purchase entries yet.</td></tr> : entries.map(entry => <tr key={entry.id} className="border-b border-gray-200">
              <td className="border border-gray-300 px-3 py-2">{String(entry.transaction_date || '').slice(0, 10)}</td><td className="border border-gray-300 px-3 py-2">{entry.received_date ? String(entry.received_date).slice(0, 10) : '-'}</td><td className="border border-gray-300 px-3 py-2">{entry.supplier_name}</td><td className="border border-gray-300 px-3 py-2">{entry.bill_no}</td><td className="border border-gray-300 px-3 py-2 capitalize">{entry.purchase_type}</td><td className="border border-gray-300 px-3 py-2">{entry.description}</td><td className="border border-gray-300 px-3 py-2">{entry.purchased_for || '-'}</td><td className="border border-gray-300 px-3 py-2 text-right">{Number(entry.quantity)}</td><td className="border border-gray-300 px-3 py-2">{entry.uom}</td><td className="border border-gray-300 px-3 py-2 text-right">{formatAmount(entry.rate)}</td><td className="border border-gray-300 px-3 py-2 text-right">{formatAmount(entry.sale_amount)}</td><td className="border border-gray-300 px-3 py-2 text-right"><div>{Number(entry.gst_percentage || 0)}%</div><div className="text-xs text-gray-500">₹{formatAmount(entry.gst_amount)}</div></td><td className="border border-gray-300 px-3 py-2 text-right font-semibold">{formatAmount(entry.total_amount)}</td>
            </tr>)}</tbody>
          </table>
        </section>
        </>}
      </div>
    </main>
  );
};

export default PurchaseRegisterGrid;
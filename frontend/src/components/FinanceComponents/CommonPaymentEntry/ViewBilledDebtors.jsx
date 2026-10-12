import { API_BASE_URL } from "../../../config/api.js";
// components/FinanceComponents/CommonPaymentEntry/ViewBilledDebtors.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Building2, Edit3, Calendar, IndianRupee, AlertCircle,X,Plus } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  error: '#dc2626',
};

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: themeColors.border,
    borderRadius: '0.5rem',
    minHeight: '42px',
    '&:hover': { borderColor: themeColors.primary },
  }),
};

const ViewBilledDebtors = ({ createdBy }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [banks, setBanks] = useState([]);
  const [expectedDates, setExpectedDates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/view-billed-debtors`);
      setData(res.data.data || []);
    } catch (err) {
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      setBanks(res.data.data.map(b => ({ value: b.id, label: b.bank_name })));
    } catch (err) {
      console.error('Failed to load banks');
    }
  };

  useEffect(() => {
    fetchData();
    fetchBanks();
  }, []);

  const handleEdit = (row) => {
    setEditItem({
      ...row,
      bill_date: row.bill_date?.split('T')[0] || '',
      due_date: row.due_date?.split('T')[0] || '',
      date_of_receipt: row.date_of_receipt?.split('T')[0] || '',
    });
    setExpectedDates(
      row.expected_dates && row.expected_dates.length > 0
        ? row.expected_dates.map(d => ({
            expected_from_date: d.expected_from_date?.split('T')[0] || '',
            expected_to_date: d.expected_to_date?.split('T')[0] || '',
            amount: d.amount || ''
          }))
        : [{ expected_from_date: '', expected_to_date: '', amount: '' }]
    );
    setErrorMessage('');
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (!editItem.finance_bank_id) {
      setErrorMessage('Please select a Bank Account');
      return;
    }
    if (!editItem.due_date) {
      setErrorMessage('Due Date is required');
      return;
    }
    if (!editItem.total_payment_due || parseFloat(editItem.total_payment_due) <= 0) {
      setErrorMessage('Total Payment Due must be greater than 0');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        id: editItem.id,
        finance_bank_id: editItem.finance_bank_id,
        po_details: editItem.po_details || null,
        inv_no: editItem.inv_no || null,
        bill_date: editItem.bill_date || null,
        due_date: editItem.due_date,
        finance_item_id: editItem.finance_item_id || null,
        quantity: editItem.quantity ? parseFloat(editItem.quantity) : 0,
        uom: editItem.uom ? String(editItem.uom).trim() || null : null,
        rate: editItem.rate ? parseFloat(editItem.rate) : 0,
        sale_amount: editItem.sale_amount ? parseFloat(editItem.sale_amount) : 0,
        gst_amount: editItem.gst_amount ? parseFloat(editItem.gst_amount) : 0,
        total_payment_due: parseFloat(editItem.total_payment_due),
        date_of_receipt: editItem.date_of_receipt || null,
        amount_received: editItem.amount_received ? parseFloat(editItem.amount_received) : null,
        expected_dates: expectedDates
          .filter(d => d.expected_from_date && d.expected_to_date && d.amount && parseFloat(d.amount) > 0)
          .map(d => ({
            expected_from_date: d.expected_from_date,
            expected_to_date: d.expected_to_date,
            amount: parseFloat(d.amount)
          })),
        updated_by: createdBy
      };

      await axios.put(`${API_BASE_URL}/finance/update-billed-debtors`, payload);
      alert('Updated successfully!');
      setEditItem(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => d ? d.split('T')[0] : '—';

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex items-center gap-4">
        <div className="p-4 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold">Billed Debtors Receivables</h2>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: themeColors.lightBg }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Party</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Due Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Total Due</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Expected Dates</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{row.party_name || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-teal-700">{row.bank_name || '—'}</td>
                    <td className="px-6 py-4">{row.inv_no || '-'}</td>
                    <td className="px-6 py-4">{formatDate(row.due_date)}</td>
                    <td className="px-6 py-4 text-right font-bold">
                      <IndianRupee size={16} className="inline" />
                      {Number(row.total_payment_due || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">
                      <IndianRupee size={16} className="inline" />
                      {Number(row.balance_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {row.expected_dates && row.expected_dates.length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium underline text-teal-700">View ({row.expected_dates.length})</summary>
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm">
                            {row.expected_dates.map((d, i) => (
                              <div key={i} className="flex justify-between py-1">
                                <span>{formatDate(d.expected_from_date)} → {formatDate(d.expected_to_date)}</span>
                                <span className="font-medium">₹{Number(d.amount).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleEdit(row)} className="p-2 hover:bg-amber-100 rounded-lg">
                        <Edit3 size={18} style={{ color: themeColors.accent }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Form (Static Inline - No Modal) */}
      {editItem && (
        <div className="mt-10 bg-white rounded-xl shadow-sm border p-8">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Edit3 style={{ color: themeColors.accent }} />
              Edit Receivable #{editItem.id}
            </h2>
            <button onClick={() => { setEditItem(null); setErrorMessage(''); }} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={28} />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-red-600">Bank Account *</label>
              <Select
                options={banks}
                value={banks.find(b => b.value === editItem.finance_bank_id) || null}
                onChange={opt => setEditItem(prev => ({ ...prev, finance_bank_id: opt?.value || null }))}
                placeholder="Select bank"
                styles={selectStyles}
                isClearable
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">PO Details</label>
              <textarea value={editItem.po_details || ''} onChange={e => setEditItem(prev => ({ ...prev, po_details: e.target.value }))} rows={2} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Invoice No</label>
              <input type="text" value={editItem.inv_no || ''} onChange={e => setEditItem(prev => ({ ...prev, inv_no: e.target.value }))} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bill Date</label>
              <input type="date" value={editItem.bill_date || ''} onChange={e => setEditItem(prev => ({ ...prev, bill_date: e.target.value }))} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-red-600">Due Date *</label>
              <input type="date" value={editItem.due_date || ''} onChange={e => setEditItem(prev => ({ ...prev, due_date: e.target.value }))} required className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Item Name</label>
              <input type="text" value={editItem.item_name || ''} readOnly className="w-full px-4 py-2 bg-gray-100 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Quantity</label>
              <input type="number" step="0.01" value={editItem.quantity || ''} onChange={e => setEditItem(prev => ({ ...prev, quantity: e.target.value }))} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">UOM</label>
              <input type="text" value={editItem.uom || ''} onChange={e => setEditItem(prev => ({ ...prev, uom: e.target.value }))} placeholder="e.g., Nos, Kg" className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Rate</label>
              <input type="number" step="0.01" value={editItem.rate || ''} onChange={e => setEditItem(prev => ({ ...prev, rate: e.target.value }))} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Sale Amount</label>
              <input type="number" step="0.01" value={editItem.sale_amount || ''} onChange={e => setEditItem(prev => ({ ...prev, sale_amount: e.target.value }))} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">GST Amount</label>
              <input type="number" step="0.01" value={editItem.gst_amount || ''} onChange={e => setEditItem(prev => ({ ...prev, gst_amount: e.target.value }))} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-red-600">Total Payment Due *</label>
              <input type="number" step="0.01" value={editItem.total_payment_due || ''} onChange={e => setEditItem(prev => ({ ...prev, total_payment_due: e.target.value }))} required className="w-full px-4 py-2 border rounded-lg font-bold" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Amount Received</label>
              <input type="number" step="0.01" value={editItem.amount_received || ''} onChange={e => setEditItem(prev => ({ ...prev, amount_received: e.target.value }))} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Date of Receipt</label>
              <input type="date" value={editItem.date_of_receipt || ''} onChange={e => setEditItem(prev => ({ ...prev, date_of_receipt: e.target.value }))} className="w-full px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
            </div>
          </div>

          {/* Expected Dates */}
          <div className="mt-10 border-t pt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar style={{ color: themeColors.primary }} />
              Expected Payment Dates
            </h3>
            {expectedDates.map((date, idx) => (
              <div key={idx} className="flex gap-4 mb-3 items-center">
                <input type="date" value={date.expected_from_date || ''} onChange={e => {
                  const updated = [...expectedDates];
                  updated[idx].expected_from_date = e.target.value;
                  setExpectedDates(updated);
                }} className="px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
                <input type="date" value={date.expected_to_date || ''} onChange={e => {
                  const updated = [...expectedDates];
                  updated[idx].expected_to_date = e.target.value;
                  setExpectedDates(updated);
                }} className="px-4 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
                <input type="number" placeholder="Amount" value={date.amount || ''} onChange={e => {
                  const updated = [...expectedDates];
                  updated[idx].amount = e.target.value;
                  setExpectedDates(updated);
                }} className="px-4 py-2 border rounded-lg w-32" style={{ borderColor: themeColors.border }} />
                {expectedDates.length > 1 && (
                  <button onClick={() => setExpectedDates(prev => prev.filter((_, i) => i !== idx))} className="text-red-600 p-2 hover:bg-red-50 rounded">
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setExpectedDates(prev => [...prev, { expected_from_date: '', expected_to_date: '', amount: '' }])} className="mt-3 text-sm flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <Plus size={18} /> Add Expected Date
            </button>
          </div>

          <div className="mt-10 flex justify-end gap-4 border-t pt-6">
            <button onClick={() => { setEditItem(null); setErrorMessage(''); }} className="px-8 py-3 border rounded-lg font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="px-10 py-3 text-white rounded-lg font-medium disabled:opacity-70" style={{ backgroundColor: themeColors.primary }}>
              {saving ? 'Saving...' : 'Update Receivable'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBilledDebtors; 
import { API_BASE_URL } from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, X, Edit3, Save, AlertCircle, History } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const Bank = () => {
  const [banks, setBanks] = useState([]);
  const [paidReceivedData, setPaidReceivedData] = useState(null); // ← New: Store data from paid-received-details
  const [cfsData, setCfsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [showLedger, setShowLedger] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [bankHistory, setBankHistory] = useState([]);

  const [editForm, setEditForm] = useState({
    bank_name: '',
    opening_balance: '',
    remarks: ''
  });

  const userId = 1;

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Call paid-received-details (this updates available_balance + gives correct Paid/Received)
      const paidRes = await axios.get(`${API_BASE_URL}/finance/paid-received-details`);
      
      // 2. Fetch other data
      const [bankRes, cfsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/finance/bank-masters`),
        axios.get(`${API_BASE_URL}/finance/cfs-data`)
      ]);

      if (bankRes.data.status === 'success') setBanks(bankRes.data.data);
      setPaidReceivedData(paidRes.data.data);   // ← Store correct paid/received data
      setCfsData(cfsRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      alert('Failed to load data. Please check server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Get Total Paid & Received for a specific bank from paid-received-details API (Same as PaidReceivedDetails)
  const getBankPaidReceived = (bankId) => {
    if (!paidReceivedData?.transactions || !bankId) {
      return { totalPaid: 0, totalReceived: 0 };
    }

    const bankTransactions = paidReceivedData.transactions.filter(
      item => item.finance_bank_id === bankId
    );

    const totalPaid = bankTransactions
      .filter(item => item.transaction_type === 'Paid')
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    const totalReceived = bankTransactions
      .filter(item => item.transaction_type === 'Received')
      .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

    return { totalPaid, totalReceived };
  };

  const getBankSummary = (bankId) => {
    if (!bankId) return { available: 0, totalPaid: 0, totalReceived: 0 };

    const bank = banks.find(b => b.id === bankId);
    const available = parseFloat(bank?.available_balance || 0);

    const { totalPaid, totalReceived } = getBankPaidReceived(bankId);

    return { available, totalPaid, totalReceived };
  };

  // Overall Summary
  const overall = {
    totalAvailable: banks.reduce((sum, bank) => sum + parseFloat(bank.available_balance || 0), 0),
    totalPaid: banks.reduce((sum, bank) => sum + getBankSummary(bank.id).totalPaid, 0),
    totalReceived: banks.reduce((sum, bank) => sum + getBankSummary(bank.id).totalReceived, 0),
  };

  const netPosition = overall.totalAvailable + overall.totalReceived - overall.totalPaid;

  const openLedger = async (bank) => {
    setSelectedBank(bank);
    setShowLedger(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-history/${bank.id}`);
      setBankHistory(res.data.data || []);
    } catch (err) {
      setBankHistory([]);
    }
  };

  const openEditModal = (e, bank) => {
    e.stopPropagation();
    setEditingBank(bank);
    setEditForm({
      bank_name: bank.bank_name || '',
      opening_balance: '',
      remarks: ''
    });
    setShowEditModal(true);
  };

  const saveBankEdit = async () => {
    if (!editForm.bank_name.trim()) return alert('Bank name required');

    const addedAmount = parseFloat(editForm.opening_balance) || 0;
    if (addedAmount === 0 && editForm.bank_name.trim() === editingBank.bank_name.trim()) {
      return alert('No changes detected');
    }

    try {
      await axios.put(`${API_BASE_URL}/finance/update-bank-master`, {
        bank_name: editForm.bank_name.trim(),
        opening_balance: addedAmount,
        remarks: editForm.remarks.trim() || `Added ₹${addedAmount.toFixed(2)} to opening balance`,
        updated_by: userId
      }, { params: { id: editingBank.id } });

      await fetchAllData();
      setShowEditModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const formatINR = (amt) =>
    '₹' + Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                Cash Flow Summary (CFS)
              </h1>
              <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                Bank-wise Paid & Received Summary
              </p>
            </div>
          </div>
        </div>

        {/* Overall Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: themeColors.border }}>
            <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Available</p>
            <p className="text-2xl font-bold mt-2 text-green-700">{formatINR(overall.totalAvailable)}</p>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: themeColors.border }}>
            <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Paid</p>
            <p className="text-2xl font-bold mt-2 text-red-700">{formatINR(overall.totalPaid)}</p>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: themeColors.border }}>
            <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Total Received</p>
            <p className="text-2xl font-bold mt-2 text-blue-700">{formatINR(overall.totalReceived)}</p>
          </div>
          <div className="bg-white border-2 rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center"
               style={{
                 borderColor: netPosition >= 0 ? '#16a34a' : '#dc2626',
                 backgroundColor: netPosition >= 0 ? '#f0fdf4' : '#fef2f2'
               }}>
            <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>NET POSITION</p>
            <p className={`text-4xl font-bold mt-3 ${netPosition >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatINR(Math.abs(netPosition))}
            </p>
            <p className={`text-base font-semibold mt-2 uppercase tracking-wider ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netPosition >= 0 ? 'SURPLUS' : 'SHORTFALL'}
            </p>
          </div>
        </div>

        {/* Banks Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border p-16 text-center" style={{ borderColor: themeColors.border }}>
            <p style={{ color: themeColors.textSecondary }}>Loading banks...</p>
          </div>
        ) : banks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-16 text-center" style={{ borderColor: themeColors.border }}>
            <p style={{ color: themeColors.textSecondary }}>No banks found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
            <table className="w-full">
              <thead style={{ backgroundColor: themeColors.lightBg }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Bank Name</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Opening Balance</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Available Balance</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-red-600">Paid</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-blue-600">Received</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Net Position</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: themeColors.lightBorder }}>
                {banks.map(bank => {
                  const summary = getBankSummary(bank.id);
                  const net = summary.available + summary.totalReceived - summary.totalPaid;
                  const openingBal = parseFloat(bank.opening_balance || 0);

                  return (
                    <tr key={bank.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openLedger(bank)}>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => openEditModal(e, bank)}
                          className="flex items-center gap-2 font-medium text-teal-700 hover:underline"
                        >
                          <Edit3 size={16} />
                          {bank.bank_name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-amber-700">
                        {formatINR(openingBal)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-green-700">
                        {formatINR(summary.available)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-red-700">
                        {formatINR(summary.totalPaid)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-blue-700">
                        {formatINR(summary.totalReceived)}   {/* ← Now consistent with PaidReceivedDetails */}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-bold text-lg ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {formatINR(Math.abs(net))}
                        </div>
                        <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {net >= 0 ? 'Surplus' : 'Shortfall'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Bank Modal - unchanged */}
        {showEditModal && editingBank && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: themeColors.border }}>
                <h3 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>Edit Bank Details</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.textSecondary }}>
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.bank_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bank_name: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    style={{ borderColor: themeColors.border }}
                    placeholder="e.g., HDFC Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.textSecondary }}>
                    Current Opening Balance
                  </label>
                  <input
                    type="text"
                    value={formatINR(editingBank.opening_balance || 0)}
                    className="w-full px-4 py-3 border rounded-lg bg-gray-50 text-gray-600"
                    style={{ borderColor: themeColors.border }}
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.textSecondary }}>
                    Add Amount to Opening Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.opening_balance}
                    onChange={(e) => setEditForm(prev => ({ ...prev, opening_balance: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    style={{ borderColor: themeColors.border }}
                    placeholder="Enter amount to add"
                  />
                </div>

                {(editForm.bank_name.trim() !== editingBank.bank_name.trim() || parseFloat(editForm.opening_balance || 0) !== 0) && (
                  <div>
                    <label className="block text-sm font-medium text-red-600 mb-2 flex items-center gap-2">
                      <AlertCircle size={18} />
                      Remarks <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editForm.remarks}
                      onChange={(e) => setEditForm(prev => ({ ...prev, remarks: e.target.value }))}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      style={{ borderColor: '#fca5a5' }}
                      rows={4}
                      placeholder="Reason for adding to opening balance..."
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t" style={{ borderColor: themeColors.border }}>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 border rounded-lg font-medium hover:bg-gray-50 transition"
                    style={{ borderColor: themeColors.border }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBankEdit}
                    className="flex-1 px-6 py-3 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                    style={{ backgroundColor: themeColors.primary }}
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ledger Modal - unchanged */}
        {showLedger && selectedBank && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
              <div className="p-6 flex justify-between items-center border-b" style={{ backgroundColor: themeColors.primary }}>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Building2 className="w-8 h-8" />
                  {selectedBank.bank_name} - Detailed Ledger
                </h2>
                <button onClick={() => setShowLedger(false)} className="text-white hover:bg-white/20 rounded-full p-2 transition">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 text-center">
                    <p className="text-sm text-amber-700 font-medium">Opening Balance</p>
                    <p className="text-xl font-bold text-amber-800 mt-1">{formatINR(selectedBank.opening_balance || 0)}</p>
                  </div>
                  <div className="bg-green-50 border border-green-300 rounded-lg p-5 text-center">
                    <p className="text-sm text-green-700 font-medium">Available Balance</p>
                    <p className="text-xl font-bold text-green-800 mt-1">{formatINR(getBankSummary(selectedBank.id).available)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-amber-700 mb-4 flex items-center gap-2">
                    <History size={20} /> Opening Balance Edit History
                  </h3>
                  {bankHistory.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">No edit history available</p>
                  ) : (
                    <div className="space-y-3">
                      {bankHistory.map((entry, i) => (
                        <div key={i} className="bg-white border border-amber-200 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">Opening Balance Updated</p>
                            <p className="text-sm text-gray-600">{formatDateTime(entry.updated_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-amber-700">{formatINR(entry.opening_balance || 0)}</p>
                            {entry.remarks && <p className="text-xs text-gray-500 mt-1 italic">"{entry.remarks}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bank;
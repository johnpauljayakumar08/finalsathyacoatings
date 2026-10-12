import { API_BASE_URL } from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Coins, Edit, Check, X, Search, Plus, XCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Select from 'react-select'; // ← Required

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const CommissionPayable = () => {
  const { encodedUserId } = useParams();

  const decodeUserId = () => {
    try {
      return encodedUserId ? atob(encodedUserId) : null;
    } catch (err) {
      console.error('Failed to decode user ID:', err);
      return null;
    }
  };

  const currentUserId = decodeUserId();

  const [list, setList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [persons, setPersons] = useState([]);
  const [pdId, setPdId] = useState('');
  const [bankId, setBankId] = useState(null); // ← NEW: Selected Bank
  const [editingRowId, setEditingRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    cost_category_id: '',
    marketing_person_id: '',
    commission_amount_due: '',
    date_of_payment: '',
    paid_amount: '0.00',
  });

  useEffect(() => {
    fetchProjects();
    fetchBanks();
    fetchCategories();
    fetchMarketingPersons();
  }, []);

  useEffect(() => {
    if (pdId && bankId) {
      setLoading(true);
      loadData();
    } else {
      setList([]);
    }
  }, [pdId, bankId]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/companies-with-projects`);
      const all = res.data.data.flatMap(c => c.projects?.map(p => ({ pd_id: p.pd_id, project_name: p.project_name })) || []);
      setProjects(all);
    } catch (err) {
      toast.error('Failed to load projects');
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      setBanks(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load banks');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/cost-categories`);
      setCategories(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchMarketingPersons = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/marketing-persons`);
      setPersons(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load persons');
    }
  };

  const loadData = async () => {
    if (!pdId || !bankId) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/finance/commission-payables?pd_id=${pdId}&bank_id=${bankId}`
      );
      setList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingRowId(item.id);
    setEditData({
      cost_category_id: item.cost_category_id,
      marketing_person_id: item.marketing_person_id,
      commission_amount_due: item.commission_amount_due || '',
      date_of_payment: item.date_of_payment ? item.date_of_payment.split('T')[0] : '',
      paid_amount: item.paid_amount || '',
      balance_amount: item.balance_amount || '0.00'
    });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editData.cost_category_id || !editData.marketing_person_id) {
      toast.error('Please select category and person');
      return;
    }

    const balance = (parseFloat(editData.commission_amount_due || 0) - parseFloat(editData.paid_amount || 0)).toFixed(2);

    const payload = {
      cost_category_id: parseInt(editData.cost_category_id),
      marketing_person_id: parseInt(editData.marketing_person_id),
      commission_amount_due: editData.commission_amount_due ? parseFloat(editData.commission_amount_due) : null,
      date_of_payment: editData.date_of_payment || null,
      paid_amount: editData.paid_amount ? parseFloat(editData.paid_amount) : 0,
      finance_bank_id: bankId, // ← Critical: Send selected bank
      balance_amount: balance,
      updated_by: currentUserId || 'unknown'
    };

    try {
      await axios.put(
        `${API_BASE_URL}/finance/update-commission-payable/${editingRowId}`,
        payload
      );
      toast.success('Updated successfully! History saved.');
      cancelEdit();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'commission_amount_due' || field === 'paid_amount') {
        updated.balance_amount = (parseFloat(updated.commission_amount_due || 0) - parseFloat(updated.paid_amount || 0)).toFixed(2);
      }
      return updated;
    });
  };

  const handleNewRecordChange = (field, value) => {
    setNewRecord(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!pdId || !bankId) {
      toast.error('Please select both Project and Bank');
      return;
    }

    if (!newRecord.cost_category_id || !newRecord.marketing_person_id) {
      toast.error('Category and Person are required');
      return;
    }

    const payload = {
      pd_id: pdId,
      finance_bank_id: bankId, // ← Must send bank ID
      cost_category_id: parseInt(newRecord.cost_category_id),
      marketing_person_id: parseInt(newRecord.marketing_person_id),
      commission_amount_due: parseFloat(newRecord.commission_amount_due) || null,
      date_of_payment: newRecord.date_of_payment || null,
      paid_amount: parseFloat(newRecord.paid_amount) || 0,
      created_by: currentUserId || 'unknown'
    };

    try {
      await axios.post(`${API_BASE_URL}/finance/create-commission-payable`, payload);
      toast.success('New record added!');
      setIsModalOpen(false);
      setNewRecord({
        cost_category_id: '',
        marketing_person_id: '',
        commission_amount_due: '',
        date_of_payment: '',
        paid_amount: '0.00',
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record');
    }
  };

  const getCategoryName = (id) => categories.find(c => c.id === parseInt(id))?.category_name || '-';
  const getPersonName = (id) => persons.find(p => p.id === parseInt(id))?.person_name || '-';

  const overall = list.length > 0 ? list[0] : {};

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const filteredList = list.slice(1).filter(item =>
    getCategoryName(item.cost_category_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPersonName(item.marketing_person_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // React Select Options for Banks
  const bankOptions = banks.map(bank => ({
    value: bank.id,
    label: (
      <div className="flex justify-between items-center">
        <span className="font-medium">{bank.bank_name}</span>
        <span className="text-sm text-gray-600">
          ₹{Number(bank.available_balance).toLocaleString('en-IN')}
        </span>
      </div>
    )
  }));

  const selectedBankOption = bankOptions.find(opt => opt.value === bankId);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <Coins className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Commission Payables
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Select Project + Bank to view and manage records
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Project Dropdown */}
              <select
                value={pdId}
                onChange={(e) => setPdId(e.target.value)}
                className="px-6 py-3 rounded-lg border text-base font-medium focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                ))}
              </select>

              {/* Bank Searchable Dropdown */}
              <Select
                options={bankOptions}
                value={selectedBankOption}
                onChange={(option) => setBankId(option ? option.value : null)}
                placeholder="Search & Select Bank..."
                isClearable
                isSearchable
                className="w-80 text-base"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: themeColors.border,
                    '&:hover': { borderColor: themeColors.primary },
                    boxShadow: 'none',
                    minHeight: '50px'
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: themeColors.textSecondary
                  })
                }}
              />

              {/* Add New Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!pdId || !bankId}
                className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        {pdId && bankId && (
          <div className="mb-6 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
            <input
              type="text"
              placeholder="Search category or person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4"
                   style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
            </div>
          ) : list.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {!pdId || !bankId ? 'Please select both Project and Bank' : 'No commission records found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: themeColors.lightBg }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Marketing Person</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Commission Due</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Paid</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
                  {filteredList.map((item) => {
                    const isEditing = editingRowId === item.id;
                    const row = isEditing ? editData : item;

                    return (
                      <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
                          {isEditing ? (
                            <select
                              value={row.cost_category_id}
                              onChange={(e) => handleInputChange('cost_category_id', e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            >
                              <option value="">Select Category</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                            </select>
                          ) : getCategoryName(item.cost_category_id)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
                          {isEditing ? (
                            <select
                              value={row.marketing_person_id}
                              onChange={(e) => handleInputChange('marketing_person_id', e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            >
                              <option value="">Select Person</option>
                              {persons.map(p => <option key={p.id} value={p.id}>{p.person_name}</option>)}
                            </select>
                          ) : getPersonName(item.marketing_person_id)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={row.commission_amount_due}
                              onChange={(e) => handleInputChange('commission_amount_due', e.target.value)}
                              className="w-40 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            />
                          ) : formatINR(item.commission_amount_due)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={row.paid_amount}
                              onChange={(e) => handleInputChange('paid_amount', e.target.value)}
                              className="w-40 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            />
                          ) : formatINR(item.paid_amount)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold" style={{ color: row.balance_amount > 0 ? '#dc2626' : '#16a34a' }}>
                          {formatINR(row.balance_amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isEditing ? (
                            <div className="flex justify-center gap-3">
                              <button onClick={saveEdit} className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"><Check size={18} /></button>
                              <button onClick={cancelEdit} className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"><X size={18} /></button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(item)} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                              <Edit size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Total Row */}
                  {list.length > 0 && (
                    <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
                      <td colSpan="2" className="px-6 py-5 text-left text-lg" style={{ color: themeColors.textPrimary }}>TOTAL</td>
                      <td className="px-6 py-5 text-right text-lg font-mono">{formatINR(overall.overall_commission_due || 0)}</td>
                      <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_paid || 0)}</td>
                      <td className="px-6 py-5 text-right text-lg font-mono text-red-700">{formatINR(overall.overall_balance || 0)}</td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add New Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>Add New Commission Record</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={28} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  value={newRecord.cost_category_id}
                  onChange={(e) => handleNewRecordChange('cost_category_id', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Marketing Person <span className="text-red-500">*</span></label>
                <select
                  value={newRecord.marketing_person_id}
                  onChange={(e) => handleNewRecordChange('marketing_person_id', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                >
                  <option value="">Select Person</option>
                  {persons.map(p => <option key={p.id} value={p.id}>{p.person_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Commission Due</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRecord.commission_amount_due}
                  onChange={(e) => handleNewRecordChange('commission_amount_due', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRecord.paid_amount}
                  onChange={(e) => handleNewRecordChange('paid_amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Payment</label>
                <input
                  type="date"
                  value={newRecord.date_of_payment}
                  onChange={(e) => handleNewRecordChange('date_of_payment', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50"
                style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
              >
                Create Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionPayable;
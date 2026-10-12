import { API_BASE_URL } from "../../../config/api.js";
// components/FinanceComponents/CommonPaymentEntry/CommissionPayablesModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast} from 'react-toastify';
import Select from 'react-select';
import { Coins, Plus, Edit, Check, X, Search } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
};

const CommissionPayablesModal = ({ onClose, createdBy }) => {
  const [projects, setProjects] = useState([]);
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [persons, setPersons] = useState([]);
  const [pdId, setPdId] = useState('');
  const [bankId, setBankId] = useState(null);
  const [list, setList] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add New Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    cost_category_id: '',
    marketing_person_id: '',
    commission_amount_due: '',
    date_of_payment: '',
    paid_amount: '0.00'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projRes, bankRes, catRes, personRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
          axios.get(`${API_BASE_URL}/finance/bank-masters`),
          axios.get(`${API_BASE_URL}/finance/cost-categories`),
          axios.get(`${API_BASE_URL}/finance/marketing-persons`)
        ]);

        const allProjects = projRes.data.data.flatMap(c => c.projects?.map(p => ({ pd_id: p.pd_id, project_name: p.project_name })) || []);
        setProjects(allProjects);

        setBanks(bankRes.data.data || []);
        setCategories(catRes.data.data || []);
        setPersons(personRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load initial data');
      }
    };
    loadData();
  }, []);

  const loadData = async () => {
    if (!pdId || !bankId) {
      setList([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/commission-payables?pd_id=${pdId}&bank_id=${bankId}`);
      setList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdId && bankId) loadData();
  }, [pdId, bankId]);

  const startEdit = (item) => {
    setEditingRowId(item.id);
    setEditData({
      cost_category_id: item.cost_category_id,
      marketing_person_id: item.marketing_person_id,
      commission_amount_due: item.commission_amount_due || '',
      date_of_payment: item.date_of_payment ? item.date_of_payment.split('T')[0] : '',
      paid_amount: item.paid_amount || ''
    });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => {
      const updated = { ...prev, [field]: value };
      const due = parseFloat(updated.commission_amount_due || 0);
      const paid = parseFloat(updated.paid_amount || 0);
      updated.balance_amount = (due - paid).toFixed(2);
      return updated;
    });
  };

  const saveEdit = async () => {
    const payload = {
      cost_category_id: parseInt(editData.cost_category_id),
      marketing_person_id: parseInt(editData.marketing_person_id),
      commission_amount_due: parseFloat(editData.commission_amount_due) || null,
      date_of_payment: editData.date_of_payment || null,
      paid_amount: parseFloat(editData.paid_amount) || 0,
      finance_bank_id: bankId,
      balance_amount: editData.balance_amount,
      updated_by: createdBy
    };

    try {
      await axios.put(`${API_BASE_URL}/finance/update-commission-payable/${editingRowId}`, payload);
      toast.success('Updated!');
      cancelEdit();
      loadData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleCreate = async () => {
    const payload = {
      pd_id: pdId,
      finance_bank_id: bankId,
      cost_category_id: parseInt(newRecord.cost_category_id),
      marketing_person_id: parseInt(newRecord.marketing_person_id),
      commission_amount_due: parseFloat(newRecord.commission_amount_due) || null,
      date_of_payment: newRecord.date_of_payment || null,
      paid_amount: parseFloat(newRecord.paid_amount) || 0,
      created_by: createdBy
    };

    try {
      await axios.post(`${API_BASE_URL}/finance/create-commission-payable`, payload);
      toast.success('Record created!');
      setShowAddModal(false);
      setNewRecord({
        cost_category_id: '',
        marketing_person_id: '',
        commission_amount_due: '',
        date_of_payment: '',
        paid_amount: '0.00'
      });
      loadData();
    } catch (err) {
      toast.error('Failed to create');
    }
  };

  const bankOptions = banks.map(b => ({
    value: b.id,
    label: (
      <div className="flex justify-between items-center">
        <span className="font-medium">{b.bank_name}</span>
        <span className="text-sm text-gray-600">₹{Number(b.available_balance).toLocaleString('en-IN')}</span>
      </div>
    )
  }));

  const selectedBankOption = bankOptions.find(opt => opt.value === bankId);

  const getCategoryName = (id) => categories.find(c => c.id === parseInt(id))?.category_name || '-';
  const getPersonName = (id) => persons.find(p => p.id === parseInt(id))?.person_name || '-';

  const overall = list.length > 0 ? list[0] : {};
  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const filteredList = list.slice(1).filter(item =>
    getCategoryName(item.cost_category_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getPersonName(item.marketing_person_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Commission Payables</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={28} /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Project</label>
                <select value={pdId} onChange={e => setPdId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Bank Account *</label>
                <Select options={bankOptions} value={selectedBankOption} onChange={opt => setBankId(opt ? opt.value : null)}
                  placeholder="Search & Select Bank..." isSearchable isClearable />
              </div>
            </div>
          </div>

          {/* Search + Add */}
          {pdId && bankId && (
            <div className="flex justify-between items-center mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border rounded-lg w-full" style={{ borderColor: themeColors.border }} />
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                <Plus size={20} /> Add New
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
            {loading ? (
              <div className="p-20 text-center">Loading...</div>
            ) : list.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Select Project + Bank to view records</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: themeColors.lightBg }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Person</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Due</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Paid</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Balance</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map(item => {
                      const isEditing = editingRowId === item.id;
                      const row = isEditing ? editData : item;

                      return (
                        <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 text-sm font-medium">
                            {isEditing ? (
                              <select value={row.cost_category_id} onChange={e => handleEditChange('cost_category_id', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ borderColor: themeColors.border }}>
                                <option value="">Select</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                              </select>
                            ) : getCategoryName(item.cost_category_id)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {isEditing ? (
                              <select value={row.marketing_person_id} onChange={e => handleEditChange('marketing_person_id', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ borderColor: themeColors.border }}>
                                <option value="">Select</option>
                                {persons.map(p => <option key={p.id} value={p.id}>{p.person_name}</option>)}
                              </select>
                            ) : getPersonName(item.marketing_person_id)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono">
                            {isEditing ? (
                              <input type="number" step="0.01" value={row.commission_amount_due} onChange={e => handleEditChange('commission_amount_due', e.target.value)}
                                className="w-40 text-right px-4 py-3 rounded-lg border" style={{ borderColor: themeColors.border }} />
                            ) : formatINR(item.commission_amount_due)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono">
                            {isEditing ? (
                              <input type="number" step="0.01" value={row.paid_amount} onChange={e => handleEditChange('paid_amount', e.target.value)}
                                className="w-40 text-right px-4 py-3 rounded-lg border" style={{ borderColor: themeColors.border }} />
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

                    {list.length > 0 && (
                      <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
                        <td colSpan="2" className="px-6 py-5 text-left text-lg">TOTAL</td>
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
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New Commission Record</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Category *</label>
                  <select value={newRecord.cost_category_id} onChange={e => setNewRecord(prev => ({ ...prev, cost_category_id: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border" style={{ borderColor: themeColors.border }}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Marketing Person *</label>
                  <select value={newRecord.marketing_person_id} onChange={e => setNewRecord(prev => ({ ...prev, marketing_person_id: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border" style={{ borderColor: themeColors.border }}>
                    <option value="">Select</option>
                    {persons.map(p => <option key={p.id} value={p.id}>{p.person_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Commission Due</label>
                  <input type="number" step="0.01" value={newRecord.commission_amount_due} onChange={e => setNewRecord(prev => ({ ...prev, commission_amount_due: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border" style={{ borderColor: themeColors.border }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Paid Amount</label>
                  <input type="number" step="0.01" value={newRecord.paid_amount} onChange={e => setNewRecord(prev => ({ ...prev, paid_amount: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border" style={{ borderColor: themeColors.border }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Date of Payment</label>
                  <input type="date" value={newRecord.date_of_payment} onChange={e => setNewRecord(prev => ({ ...prev, date_of_payment: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border" style={{ borderColor: themeColors.border }} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setShowAddModal(false)} className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50" style={{ borderColor: themeColors.border }}>
                  Cancel
                </button>
                <button onClick={handleCreate} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg">
                  Create Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionPayablesModal;
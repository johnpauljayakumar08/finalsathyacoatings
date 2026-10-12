import { API_BASE_URL } from "../../../config/api.js";
// components/FinanceComponents/CommonPaymentEntry/SiteAccommodationPayablesModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Home, Plus, Edit, Check, X, Search, Building2 } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
};

const SiteAccommodationPayablesModal = ({ onClose, createdBy }) => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [list, setList] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    finance_creditors_client_id: '',
    due_period: '',
    advance_amount: '',
    due_amount: '',
    payment: '',
    due_date: '',
    payment_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projRes, clientRes, bankRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
          axios.get(`${API_BASE_URL}/finance/view-creditors-client`),
          axios.get(`${API_BASE_URL}/finance/bank-masters`)
        ]);

        const allProjects = projRes.data.data.flatMap(c => c.projects.map(p => ({ pd_id: p.pd_id, project_name: p.project_name })));
        setProjects(allProjects);
        setClients(clientRes.data.data || []);
        setBankOptions(bankRes.data.data.map(b => ({
          value: b.id,
          label: `${b.bank_name} (₹${Number(b.available_balance || 0).toLocaleString('en-IN')})`
        })));
      } catch (err) {
        toast.error('Failed to load data');
      }
    };
    loadData();
  }, []);

  const loadData = async () => {
    if (!selectedProject || !selectedBank) {
      setList([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/finance/site-accommodation-payables?pd_id=${selectedProject}&finance_bank_id=${selectedBank.value}`
      );
      setList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject && selectedBank) loadData();
  }, [selectedProject, selectedBank]);

  const startEdit = (item) => {
    setEditingRowId(item.id);
    setEditData({ ...item });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'due_amount' || field === 'payment') {
        updated.balance_due = (parseFloat(updated.due_amount || 0) - parseFloat(updated.payment || 0)).toFixed(2);
      }
      return updated;
    });
  };

  const saveEdit = async () => {
    const payload = {
      ...editData,
      finance_bank_id: selectedBank.value,
      balance_due: editData.balance_due,
      updated_by: createdBy
    };

    try {
      await axios.put(`${API_BASE_URL}/finance/update-site-accommodation-payable/${editingRowId}`, payload);
      toast.success('Updated successfully');
      cancelEdit();
      loadData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleNewEntryChange = (field, value) => {
    setNewEntry(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'due_amount' || field === 'payment') {
        updated.balance_due = (parseFloat(updated.due_amount || 0) - parseFloat(updated.payment || 0)).toFixed(2);
      }
      return updated;
    });
  };

  const saveNewEntry = async () => {
    const payload = {
      ...newEntry,
      pd_id: selectedProject,
      finance_bank_id: selectedBank.value,
      balance_due: newEntry.balance_due || 0,
      created_by: createdBy
    };

    try {
      await axios.post(`${API_BASE_URL}/finance/create-site-accommodation-payable`, payload);
      toast.success('Record added!');
      setShowAddForm(false);
      setNewEntry({
        finance_creditors_client_id: '',
        due_period: '',
        advance_amount: '',
        due_amount: '',
        payment: '',
        due_date: '',
        payment_date: ''
      });
      loadData();
    } catch (err) {
      toast.error('Failed to add');
    }
  };

  const getClientName = (id) => clients.find(c => c.id === parseInt(id))?.client_name || '-';
  const overall = list.length > 0 ? list[0] : {};
  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const filteredList = list.slice(1).filter(item =>
    getClientName(item.finance_creditors_client_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.due_period?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Home className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Site Accommodation Payables</h2>
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
                <select value={selectedProject} onChange={e => { setSelectedProject(e.target.value); setSelectedBank(null); }}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Bank Account *</label>
                <Select options={bankOptions} value={selectedBank} onChange={setSelectedBank}
                  placeholder="Select Bank" isSearchable />
              </div>
            </div>
          </div>

          {/* Search + Add */}
          {selectedProject && selectedBank && (
            <div className="flex justify-between items-center mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" placeholder="Search client, period..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border rounded-lg w-full" style={{ borderColor: themeColors.border }} />
              </div>
              <button onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                <Plus size={20} /> Add New Record
              </button>
            </div>
          )}

          {/* Add Form */}
          {showAddForm && selectedBank && (
            <div className="bg-white rounded-xl shadow-sm border p-8 mb-8" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-bold mb-6">Add New Record — {selectedBank.label}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Client</label>
                  <select value={newEntry.finance_creditors_client_id} onChange={e => handleNewEntryChange('finance_creditors_client_id', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-semibold mb-2">Period</label><input type="text" placeholder="01-11-2025 to 30-11-2025" value={newEntry.due_period} onChange={e => handleNewEntryChange('due_period', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>
                <div><label className="block text-sm font-semibold mb-2">Advance Amount</label><input type="number" step="0.01" value={newEntry.advance_amount} onChange={e => handleNewEntryChange('advance_amount', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>
                <div><label className="block text-sm font-semibold mb-2">Due Amount</label><input type="number" step="0.01" value={newEntry.due_amount} onChange={e => handleNewEntryChange('due_amount', e.target.value)} className="w-full px-4 py-3 border rounded-lg font-bold" style={{ borderColor: themeColors.border }} /></div>
                <div><label className="block text-sm font-semibold mb-2">Payment</label><input type="number" step="0.01" value={newEntry.payment} onChange={e => handleNewEntryChange('payment', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>
                <div><label className="block text-sm font-semibold mb-2">Due Date</label><input type="date" value={newEntry.due_date} onChange={e => handleNewEntryChange('due_date', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>
                <div><label className="block text-sm font-semibold mb-2">Payment Date</label><input type="date" value={newEntry.payment_date} onChange={e => handleNewEntryChange('payment_date', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>
                <div className="flex items-end">
                  <div className="w-full p-4 bg-teal-50 rounded-lg border-2 border-teal-300">
                    <div className="text-sm font-medium text-gray-700">Balance Due</div>
                    <div className="text-2xl font-bold text-teal-700">{formatINR(newEntry.balance_due || 0)}</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button onClick={saveNewEntry} className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">Save Record</button>
                <button onClick={() => setShowAddForm(false)} className="px-8 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
            {loading ? (
              <div className="p-20 text-center">Loading...</div>
            ) : list.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: themeColors.lightBg }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bank</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Client</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Period</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Advance</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Due</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Payment</th>
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
                          <td className="px-6 py-4 text-sm font-medium text-blue-600">{item.bank_name || '-'}</td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {isEditing ? (
                              <select value={row.finance_creditors_client_id} onChange={e => handleEditChange('finance_creditors_client_id', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
                                <option value="">Select Client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
                              </select>
                            ) : getClientName(item.finance_creditors_client_id)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {isEditing ? (
                              <input type="text" value={row.due_period} onChange={e => handleEditChange('due_period', e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
                            ) : item.due_period || '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono">
                            {isEditing ? (
                              <input type="number" step="0.01" value={row.advance_amount} onChange={e => handleEditChange('advance_amount', e.target.value)}
                                className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
                            ) : formatINR(item.advance_amount)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono">
                            {isEditing ? (
                              <input type="number" step="0.01" value={row.due_amount} onChange={e => handleEditChange('due_amount', e.target.value)}
                                className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 font-bold"
                                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
                            ) : formatINR(item.due_amount)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono">
                            {isEditing ? (
                              <input type="number" step="0.01" value={row.payment} onChange={e => handleEditChange('payment', e.target.value)}
                                className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
                            ) : formatINR(item.payment)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold" style={{ color: row.balance_due > 0 ? '#dc2626' : '#16a34a' }}>
                            {formatINR(row.balance_due)}
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
                        <td colSpan="3" className="px-6 py-5 text-left text-lg">TOTAL</td>
                        <td className="px-6 py-5 text-right text-lg font-mono">{formatINR(overall.overall_advance || 0)}</td>
                        <td className="px-6 py-5 text-right text-lg font-mono">{formatINR(overall.overall_due || 0)}</td>
                        <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_payment || 0)}</td>
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
      </div>
    </div>
  );
};

export default SiteAccommodationPayablesModal;
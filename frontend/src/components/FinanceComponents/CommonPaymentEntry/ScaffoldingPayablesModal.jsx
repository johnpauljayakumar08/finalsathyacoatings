import { API_BASE_URL } from "../../../config/api.js";
// components/FinanceComponents/CommonPaymentEntry/ScaffoldingPayablesModal.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Wrench, Plus, Edit, X, Search, Building2 } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
};

const EntryModal = ({ isOpen, onClose, entry, onSave, creditorsClients, costCategories, selectedBank, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    client_id: null,
    cost_category_id: null,
    period: '',
    qty: '',
    rate: '',
    sale_amount: '',
    total_payment_due: '',
    date_of_payment: '',
    paid_amount: ''
  });

  useEffect(() => {
    if (entry && mode === 'edit') {
      setFormData({
        client_id: creditorsClients.find(c => c.value === entry.finance_creditors_client_id) || null,
        cost_category_id: costCategories.find(c => c.value === entry.cost_category_id) || null,
        period: entry.period || '',
        qty: entry.qty || '',
        rate: entry.rate || '',
        sale_amount: entry.sale_amount?.toString() || '',
        total_payment_due: entry.total_payment_due?.toString() || '',
        date_of_payment: entry.date_of_payment ? entry.date_of_payment.split('T')[0] : '',
        paid_amount: entry.paid_amount?.toString() || ''
      });
    } else {
      setFormData({
        client_id: null,
        cost_category_id: null,
        period: '',
        qty: '',
        rate: '',
        sale_amount: '',
        total_payment_due: '',
        date_of_payment: '',
        paid_amount: ''
      });
    }
  }, [entry, mode, creditorsClients, costCategories]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!formData.client_id || !formData.cost_category_id || !formData.date_of_payment) {
      alert('Please fill Client, Category, and Payment Date');
      return;
    }

    onSave({
      finance_creditors_client_id: formData.client_id.value,
      cost_category_id: formData.cost_category_id.value,
      period: formData.period || null,
      qty: formData.qty || null,
      rate: formData.rate || null,
      sale_amount: parseFloat(formData.sale_amount) || 0,
      total_payment_due: parseFloat(formData.total_payment_due) || 0,
      date_of_payment: formData.date_of_payment,
      paid_amount: parseFloat(formData.paid_amount) || 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">{mode === 'add' ? 'Add Scaffolding Entry' : 'Edit Entry'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
        </div>

        <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
          <div className="flex items-center gap-3">
            <Building2 size={22} className="text-teal-700" />
            <span className="font-bold text-teal-800 text-lg">{selectedBank?.label || 'No Bank Selected'}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-red-600">Client *</label>
            <Select options={creditorsClients} value={formData.client_id} onChange={opt => handleChange('client_id', opt)} placeholder="Select Client" isSearchable />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-red-600">Category *</label>
            <Select options={costCategories} value={formData.cost_category_id} onChange={opt => handleChange('cost_category_id', opt)} placeholder="Select Category" isSearchable />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Period</label>
            <input type="text" value={formData.period} onChange={e => handleChange('period', e.target.value)} placeholder="e.g. Jan 2025" className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-red-600">Payment Date *</label>
            <input type="date" value={formData.date_of_payment} onChange={e => handleChange('date_of_payment', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} required />
          </div>
          <div><label className="block text-sm font-semibold mb-2">Quantity</label><input type="text" value={formData.qty} onChange={e => handleChange('qty', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>
          <div><label className="block text-sm font-semibold mb-2">Rate</label><input type="text" value={formData.rate} onChange={e => handleChange('rate', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>
          <div><label className="block text-sm font-semibold mb-2">Sale Amount</label><input type="number" step="0.01" value={formData.sale_amount} onChange={e => handleChange('sale_amount', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>
          <div><label className="block text-sm font-semibold mb-2">Total Due</label><input type="number" step="0.01" value={formData.total_payment_due} onChange={e => handleChange('total_payment_due', e.target.value)} className="w-full px-4 py-3 border rounded-lg font-bold" style={{ borderColor: themeColors.border }} /></div>
          <div><label className="block text-sm font-semibold mb-2">Paid Amount</label><input type="number" step="0.01" value={formData.paid_amount} onChange={e => handleChange('paid_amount', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} /></div>

          <div className="md:col-span-2">
            <div className={`text-3xl font-bold text-center p-6 rounded-lg ${(parseFloat(formData.total_payment_due || 0) - parseFloat(formData.paid_amount || 0)) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              Balance: ₹{((parseFloat(formData.total_payment_due || 0) - parseFloat(formData.paid_amount || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 }))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 border rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSubmit} className="px-10 py-3 bg-teal-600 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg">
            {mode === 'add' ? 'Save Entry' : 'Update Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ScaffoldingPayablesModal = ({ onClose, createdBy }) => {
  const [companies, setCompanies] = useState([]);
  const [creditorsClients, setCreditorsClients] = useState([]);
  const [costCategories, setCostCategories] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentEntry, setCurrentEntry] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [compRes, clientRes, catRes, bankRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
          axios.get(`${API_BASE_URL}/finance/view-creditors-client`),
          axios.get(`${API_BASE_URL}/finance/cost-categories`),
          axios.get(`${API_BASE_URL}/finance/bank-masters`)
        ]);

        setCompanies(compRes.data.data || []);
        setCreditorsClients((clientRes.data.data || []).map(c => ({ value: c.id, label: c.client_name })));
        setCostCategories((catRes.data.data || []).map(c => ({ value: c.id, label: c.category_name })));
        setBankOptions((bankRes.data.data || []).map(b => ({
          value: b.id,
          label: `${b.bank_name} (₹${Number(b.available_balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })})`
        })));
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const comp = companies.find(c => c.company_id === selectedCompany);
    if (comp?.projects?.length > 0 && !selectedProject) {
      setSelectedProject(comp.projects[0].pd_id);
    }
  }, [selectedCompany, companies]);

  const fetchEntries = async () => {
    if (!selectedProject || !selectedBank) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/scaffolding-payables?pd_id=${selectedProject}&finance_bank_id=${selectedBank.value}`);
      if (res.data.status === 'success') {
        setEntries(res.data.data.slice(1));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedProject && selectedBank) fetchEntries();
  }, [selectedProject, selectedBank]);

  const handleSave = async (payload) => {
    const isNew = modalMode === 'add';
    const url = isNew
      ? `${API_BASE_URL}/finance/create-scaffolding-payable`
      : `${API_BASE_URL}/finance/update-scaffolding-payable/${currentEntry.id}`;

    try {
      await axios({ method: isNew ? 'POST' : 'PUT', url, data: { ...payload, pd_id: selectedProject, finance_bank_id: selectedBank.value, created_by: createdBy, updated_by: createdBy } });
      setModalOpen(false);
      fetchEntries();
    } catch (err) {
      alert('Save failed');
    }
  };

  const openAdd = () => { setModalMode('add'); setCurrentEntry(null); setModalOpen(true); };
  const openEdit = (entry) => { setModalMode('edit'); setCurrentEntry(entry); setModalOpen(true); };

  const filtered = entries.filter(e =>
    [e.client_name, e.category_name, e.period, e.bank_name].some(f => f?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Scaffolding Payables</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={28} /></button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Company</label>
                <select value={selectedCompany} onChange={e => { setSelectedCompany(e.target.value); setSelectedProject(''); setSelectedBank(null); }}
                  className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }}>
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Project</label>
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} disabled={!selectedCompany}
                  className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100" style={{ borderColor: themeColors.border }}>
                  <option value="">Select Project</option>
                  {companies.find(c => c.company_id === selectedCompany)?.projects?.map(p => (
                    <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Bank Account *</label>
                <Select options={bankOptions} value={selectedBank} onChange={setSelectedBank} placeholder="Select Bank" isSearchable />
              </div>
            </div>
          </div>

          {/* Search + Add */}
          {selectedProject && selectedBank && (
            <div className="flex justify-between items-center mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border rounded-lg w-full" style={{ borderColor: themeColors.border }} />
              </div>
              <button onClick={openAdd} className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                <Plus size={20} /> Add Entry
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
            {loading ? (
              <div className="p-20 text-center">Loading...</div>
            ) : !selectedBank ? (
              <div className="p-12 text-center text-gray-500">Please select Project and Bank</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No entries found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: themeColors.lightBg }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600">Client</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600">Bank</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600">Period</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600">Sale</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600">Due</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600">Paid</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600">Balance</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(entry => (
                      <tr key={entry.id} className="hover:bg-gray-50 border-t">
                        <td className="px-6 py-4">{entry.client_name || '-'}</td>
                        <td className="px-6 py-4">{entry.category_name || '-'}</td>
                        <td className="px-6 py-4 text-blue-600 font-medium">{entry.bank_name || '—'}</td>
                        <td className="px-6 py-4">{entry.period || '—'}</td>
                        <td className="px-6 py-4 text-right">{formatINR(entry.sale_amount)}</td>
                        <td className="px-6 py-4 text-right">{formatINR(entry.total_payment_due)}</td>
                        <td className="px-6 py-4 text-center">{entry.date_of_payment ? new Date(entry.date_of_payment).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-6 py-4 text-right">{formatINR(entry.paid_amount)}</td>
                        <td className="px-6 py-4 text-right font-bold" style={{ color: entry.balance_amount > 0 ? 'red' : 'green' }}>
                          {formatINR(entry.balance_amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => openEdit(entry)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Inner Modal */}
        <EntryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          entry={currentEntry}
          onSave={handleSave}
          creditorsClients={creditorsClients}
          costCategories={costCategories}
          selectedBank={selectedBank}
          mode={modalMode}
        />
      </div>
    </div>
  );
};

export default ScaffoldingPayablesModal;
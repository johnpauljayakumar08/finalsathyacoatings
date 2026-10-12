import { API_BASE_URL } from "../../../config/api.js";
// // components/FinanceComponents/CommonPaymentEntry/CreditCardPayablesModal.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import Select from 'react-select';
// import { CreditCard, Plus, Building2, FolderOpen, IndianRupee, Search, Edit3, X } from 'lucide-react';

// const theme = {
//   primary: '#1e7a6f',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   danger: '#ef4444',
// };

// const selectStyles = {
//   control: (base) => ({
//     ...base,
//     borderColor: theme.border,
//     borderRadius: '0.5rem',
//     padding: '0.375rem',
//     boxShadow: 'none',
//     '&:hover': { borderColor: theme.primary },
//   }),
//   option: (base, state) => ({
//     ...base,
//     backgroundColor: state.isSelected ? theme.primary : state.isFocused ? '#e6f4f1' : null,
//     color: state.isSelected ? 'white' : theme.textPrimary,
//   }),
// };

// const CreditCardPayablesModal = ({ onClose, createdBy }) => {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState(null);
//   const [costCategories, setCostCategories] = useState([]);
//   const [creditCardData, setCreditCardData] = useState([]);
//   const [overallDue, setOverallDue] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);

//   const [form, setForm] = useState({
//     cost_category_id: '',
//     due_date: '',
//     bill_date: '',
//     particulars: '',
//     amount_due: '',
//     finance_bank_id: ''
//   });

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [compRes, catRes, bankRes] = await Promise.all([
//           axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
//           axios.get(`${API_BASE_URL}/finance/cost-categories`),
//           axios.get(`${API_BASE_URL}/finance/bank-masters`)
//         ]);

//         const formatted = compRes.data.data.map(c => ({
//           value: c.company_id,
//           label: c.company_name,
//           projects: c.projects.map(p => ({ value: p.pd_id, label: p.project_name }))
//         }));
//         setCompanies(formatted);

//         setCostCategories(catRes.data.data.map(c => ({ value: c.id, label: c.category_name })));

//         const bankOpts = [
//           { value: null, label: 'All Banks' },
//           ...bankRes.data.data.map(b => ({
//             value: b.id,
//             label: `${b.bank_name} (₹${parseFloat(b.available_balance || 0).toLocaleString('en-IN')})`
//           }))
//         ];
//         setBanks(bankOpts);
//       } catch (err) {
//         toast.error('Failed to load data');
//       }
//     };
//     load();
//   }, []);

//   const loadData = async () => {
//     if (!selectedProject?.value || !selectedBank?.value) {
//       setCreditCardData([]);
//       setOverallDue(0);
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${API_BASE_URL}/finance/credit-card-payables?pd_id=${selectedProject.value}&finance_bank_id=${selectedBank.value}`
//       );
//       if (res.data.status === 'success' && res.data.data.length > 0) {
//         setOverallDue(res.data.data[0].overall_amount_due || 0);
//         setCreditCardData(res.data.data.slice(1));
//       } else {
//         setCreditCardData([]);
//         setOverallDue(0);
//       }
//     } catch (err) {
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, [selectedProject, selectedBank]);

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.cost_category_id || !form.particulars.trim() || !form.amount_due) {
//       toast.error('All required fields must be filled');
//       return;
//     }

//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-credit-card-payable`, {
//         pd_id: selectedProject.value,
//         cost_category_id: form.cost_category_id,
//         due_date: form.due_date || null,
//         bill_date: form.bill_date || null,
//         particulars: form.particulars.trim(),
//         amount_due: parseFloat(form.amount_due),
//         finance_bank_id: selectedBank.value,
//         created_by: createdBy
//       });
//       toast.success('Entry added!');
//       setShowAddModal(false);
//       setForm({ cost_category_id: '', due_date: '', bill_date: '', particulars: '', amount_due: '', finance_bank_id: '' });
//       loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save');
//     }
//   };

//   const openEditModal = (item) => {
//     setEditingItem(item);
//     setForm({
//       cost_category_id: costCategories.find(c => c.label === item.category_name)?.value || '',
//       finance_bank_id: item.finance_bank_id,
//       due_date: item.due_date ? item.due_date.split('T')[0] : '',
//       bill_date: item.bill_date ? item.bill_date.split('T')[0] : '',
//       particulars: item.particulars || '',
//       amount_due: item.amount_due || ''
//     });
//     setShowEditModal(true);
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.cost_category_id || !form.particulars.trim() || !form.amount_due || !form.finance_bank_id) {
//       toast.error('All fields required');
//       return;
//     }

//     try {
//       await axios.put(`${API_BASE_URL}/finance/credit-card-payable/${editingItem.id}`, {
//         cost_category_id: form.cost_category_id,
//         finance_bank_id: form.finance_bank_id,
//         due_date: form.due_date || null,
//         bill_date: form.bill_date || null,
//         particulars: form.particulars.trim(),
//         amount_due: parseFloat(form.amount_due),
//         updated_by: createdBy
//       });
//       toast.success('Updated!');
//       setShowEditModal(false);
//       loadData();
//     } catch (err) {
//       toast.error('Update failed');
//     }
//   };

//   const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
//   const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

//   const filteredData = creditCardData.filter(item =>
//     item.particulars?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
//       <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: theme.border }} onClick={e => e.stopPropagation()}>
//         {/* Header */}
//         <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <div className="p-4 rounded-xl" style={{ backgroundColor: theme.primary }}>
//               <CreditCard className="w-10 h-10 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold">Credit Card Payables</h2>
//               <p className="text-sm text-gray-600">Total Outstanding: <span className="text-3xl font-bold text-red-600">{formatINR(overallDue)}</span></p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={28} /></button>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[80vh]">
//           {/* Filters */}
//           <div className="bg-gray-50 rounded-lg p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-semibold mb-3"><Building2 size={18} /> Company</label>
//                 <Select options={companies} value={selectedCompany} onChange={(opt) => {
//                   setSelectedCompany(opt);
//                   setProjects(opt ? opt.projects : []);
//                   setSelectedProject(null);
//                   setSelectedBank(null);
//                 }} placeholder="Select company..." isClearable styles={selectStyles} />
//               </div>
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-semibold mb-3"><FolderOpen size={18} /> Project</label>
//                 <Select options={projects} value={selectedProject} onChange={setSelectedProject} placeholder="Select project..." isDisabled={!selectedCompany} isClearable styles={selectStyles} />
//               </div>
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-semibold mb-3"><IndianRupee size={18} /> Bank Account</label>
//                 <Select options={banks} value={selectedBank} onChange={setSelectedBank} placeholder="All Banks" isDisabled={!selectedProject} styles={selectStyles} />
//               </div>
//             </div>
//           </div>

//           {/* Search + Add */}
//           {selectedProject && selectedBank?.value && (
//             <div className="flex justify-between items-center mb-6">
//               <div className="relative max-w-sm">
//                 <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
//                 <input type="text" placeholder="Search particulars..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
//                   className="pl-12 pr-4 py-3 border rounded-lg w-full" style={{ borderColor: theme.border }} />
//               </div>
//               <button onClick={() => setShowAddModal(true)}
//                 className="flex items-center gap-3 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
//                 <Plus size={20} /> Add Entry
//               </button>
//             </div>
//           )}

//           {/* Table */}
//           <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: theme.border }}>
//             {loading ? (
//               <div className="p-20 text-center">Loading...</div>
//             ) : creditCardData.length === 0 ? (
//               <div className="p-16 text-center text-gray-500">Select Project + Bank to view entries</div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead style={{ backgroundColor: theme.lightBg }}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bank</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Category</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Due Date</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bill Date</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Particulars</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Amount</th>
//                       <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredData.map(item => (
//                       <tr key={item.id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 font-medium text-teal-700">{item.bank_name || '—'}</td>
//                         <td className="px-6 py-4">{item.category_name || '—'}</td>
//                         <td className="px-6 py-4">{formatDate(item.due_date)}</td>
//                         <td className="px-6 py-4">{formatDate(item.bill_date)}</td>
//                         <td className="px-6 py-4 max-w-xs truncate" title={item.particulars}>{item.particulars}</td>
//                         <td className="px-6 py-4 text-right font-bold text-red-600">{formatINR(item.amount_due)}</td>
//                         <td className="px-6 py-4 text-center">
//                           <button onClick={() => openEditModal(item)} className="p-2 hover:bg-amber-100 rounded-lg">
//                             <Edit3 size={18} style={{ color: theme.accent }} />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Add Modal */}
//         {showAddModal && (
//           <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowAddModal(false)}>
//             <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold">Add New Credit Card Entry</h2>
//                   <p className="text-sm mt-2">Bank: <span className="font-semibold text-teal-700">{selectedBank?.label}</span></p>
//                 </div>
//                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
//               </div>
//               <form onSubmit={handleAddSubmit} className="space-y-6">
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Cost Category *</label>
//                     <Select options={costCategories} onChange={opt => setForm(prev => ({ ...prev, cost_category_id: opt.value }))} placeholder="Select category" required styles={selectStyles} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Due Date</label>
//                     <input type="date" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Bill Date</label>
//                     <input type="date" value={form.bill_date} onChange={e => setForm(prev => ({ ...prev, bill_date: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Particulars *</label>
//                     <input type="text" required value={form.particulars} onChange={e => setForm(prev => ({ ...prev, particulars: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
//                   </div>
//                   <div className="col-span-2">
//                     <label className="block text-sm font-semibold mb-2">Amount Due *</label>
//                     <input type="number" step="0.01" required value={form.amount_due} onChange={e => setForm(prev => ({ ...prev, amount_due: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: theme.border }}>
//                   <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
//                   <button type="submit" className="px-8 py-3 text-white rounded-lg shadow-md hover:shadow-lg" style={{ backgroundColor: theme.primary }}>Save Entry</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Edit Modal */}
//         {showEditModal && (
//           <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowEditModal(false)}>
//             <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold">Edit Entry</h2>
//                 <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
//               </div>
//               <form onSubmit={handleEditSubmit} className="space-y-6">
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Cost Category *</label>
//                     <Select options={costCategories} value={costCategories.find(c => c.value === form.cost_category_id) || null}
//                       onChange={opt => setForm(prev => ({ ...prev, cost_category_id: opt.value }))} required styles={selectStyles} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Bank Account *</label>
//                     <Select options={banks.filter(b => b.value !== null)} value={banks.find(b => b.value === form.finance_bank_id) || null}
//                       onChange={opt => setForm(prev => ({ ...prev, finance_bank_id: opt.value }))} required styles={selectStyles} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Due Date</label>
//                     <input type="date" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Bill Date</label>
//                     <input type="date" value={form.bill_date} onChange={e => setForm(prev => ({ ...prev, bill_date: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Particulars *</label>
//                     <input type="text" required value={form.particulars} onChange={e => setForm(prev => ({ ...prev, particulars: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Amount Due *</label>
//                     <input type="number" step="0.01" required value={form.amount_due} onChange={e => setForm(prev => ({ ...prev, amount_due: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: theme.border }}>
//                   <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 border rounded-lg">Cancel</button>
//                   <button type="submit" className="px-8 py-3 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>Update Entry</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreditCardPayablesModal;








import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { CreditCard, Plus, IndianRupee, Search, Edit3, X } from 'lucide-react';

const theme = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  danger: '#ef4444',
};

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: theme.border,
    borderRadius: '0.5rem',
    padding: '0.375rem',
    boxShadow: 'none',
    '&:hover': { borderColor: theme.primary },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? theme.primary : state.isFocused ? '#e6f4f1' : null,
    color: state.isSelected ? 'white' : theme.textPrimary,
  }),
};

const CreditCardPayablesModal = ({ onClose, createdBy }) => {
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [costCategories, setCostCategories] = useState([]);
  const [creditCardData, setCreditCardData] = useState([]);
  const [overallDue, setOverallDue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    cost_category_id: '',
    due_date: '',
    bill_date: '',
    particulars: '',
    amount_due: '',
    finance_bank_id: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, bankRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/cost-categories`),
          axios.get(`${API_BASE_URL}/finance/bank-masters`)
        ]);

        setCostCategories(catRes.data.data.map(c => ({ value: c.id, label: c.category_name })));

        const bankOpts = [
          { value: null, label: 'Select a Bank Account' },
          ...bankRes.data.data.map(b => ({
            value: b.id,
            label: `${b.bank_name} (₹${parseFloat(b.available_balance || 0).toLocaleString('en-IN')})`
          }))
        ];
        setBanks(bankOpts);
      } catch (err) {
        toast.error('Failed to load data');
      }
    };
    load();
  }, []);

  const loadData = async () => {
    if (!selectedBank?.value) {
      setCreditCardData([]);
      setOverallDue(0);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/finance/credit-card-payables?finance_bank_id=${selectedBank.value}`
      );
      if (res.data.status === 'success' && res.data.data.length > 0) {
        setOverallDue(res.data.data[0].overall_amount_due || 0);
        setCreditCardData(res.data.data.slice(1));
      } else {
        setCreditCardData([]);
        setOverallDue(0);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBank]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.cost_category_id || !form.particulars.trim() || !form.amount_due || !selectedBank?.value) {
      toast.error('All required fields must be filled');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/finance/create-credit-card-payable`, {
        cost_category_id: form.cost_category_id,
        due_date: form.due_date || null,
        bill_date: form.bill_date || null,
        particulars: form.particulars.trim(),
        amount_due: parseFloat(form.amount_due),
        finance_bank_id: selectedBank.value,
        created_by: createdBy
      });
      toast.success('Entry added!');
      setShowAddModal(false);
      setForm({ cost_category_id: '', due_date: '', bill_date: '', particulars: '', amount_due: '', finance_bank_id: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      cost_category_id: costCategories.find(c => c.label === item.category_name)?.value || '',
      finance_bank_id: item.finance_bank_id,
      due_date: item.due_date ? item.due_date.split('T')[0] : '',
      bill_date: item.bill_date ? item.bill_date.split('T')[0] : '',
      particulars: item.particulars || '',
      amount_due: item.amount_due || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!form.cost_category_id || !form.particulars.trim() || !form.amount_due || !form.finance_bank_id) {
      toast.error('All fields required');
      return;
    }

    try {
      // Note: We're not using PUT route, assuming createOrUpdate handles update via id in body
      await axios.post(`${API_BASE_URL}/finance/create-credit-card-payable`, {
        id: editingItem.id,
        cost_category_id: form.cost_category_id,
        finance_bank_id: form.finance_bank_id,
        due_date: form.due_date || null,
        bill_date: form.bill_date || null,
        particulars: form.particulars.trim(),
        amount_due: parseFloat(form.amount_due),
        updated_by: createdBy
      });
      toast.success('Updated!');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';
  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  const filteredData = creditCardData.filter(item =>
    item.particulars?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: theme.border }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: theme.primary }}>
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Credit Card Payables</h2>
              <p className="text-sm text-gray-600">
                {selectedBank ? `Bank: ${selectedBank.label.split(' (')[0]}` : 'Select a bank'}
                {' | '}
                Total Outstanding: <span className="text-3xl font-bold text-red-600">{formatINR(overallDue)}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={28} /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Bank Selector */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="max-w-md">
              <label className="flex items-center gap-2 text-sm font-semibold mb-3"><IndianRupee size={18} /> Bank Account *</label>
              <Select
                options={banks}
                value={selectedBank}
                onChange={setSelectedBank}
                placeholder="Select bank account..."
                styles={selectStyles}
                isSearchable
              />
            </div>
          </div>

          {/* Search + Add */}
          {selectedBank?.value && (
            <div className="flex justify-between items-center mb-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search particulars..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border rounded-lg w-full"
                  style={{ borderColor: theme.border }}
                />
              </div>
              <button onClick={() => setShowAddModal(true)}
                className="flex items-center gap-3 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                <Plus size={20} /> Add Entry
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: theme.border }}>
            {loading ? (
              <div className="p-20 text-center">Loading...</div>
            ) : !selectedBank?.value ? (
              <div className="p-16 text-center text-gray-500">Please select a bank account to view entries</div>
            ) : creditCardData.length === 0 ? (
              <div className="p-16 text-center text-gray-500">No entries found for this bank</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: theme.lightBg }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bank</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Due Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bill Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Particulars</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Amount</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-teal-700">{item.bank_name || '—'}</td>
                        <td className="px-6 py-4">{item.category_name || '—'}</td>
                        <td className="px-6 py-4">{formatDate(item.due_date)}</td>
                        <td className="px-6 py-4">{formatDate(item.bill_date)}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={item.particulars}>{item.particulars}</td>
                        <td className="px-6 py-4 text-right font-bold text-red-600">{formatINR(item.amount_due)}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => openEditModal(item)} className="p-2 hover:bg-amber-100 rounded-lg">
                            <Edit3 size={18} />
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

        {/* Add/Edit Modals remain same as before – only minor adjustments for bank display */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Add New Credit Card Entry</h2>
                  <p className="text-sm mt-2">Bank: <span className="font-semibold text-teal-700">{selectedBank?.label}</span></p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
              </div>
              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cost Category *</label>
                    <Select options={costCategories} onChange={opt => setForm(prev => ({ ...prev, cost_category_id: opt.value }))} placeholder="Select category" required styles={selectStyles} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Due Date</label>
                    <input type="date" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bill Date</label>
                    <input type="date" value={form.bill_date} onChange={e => setForm(prev => ({ ...prev, bill_date: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Particulars *</label>
                    <input type="text" required value={form.particulars} onChange={e => setForm(prev => ({ ...prev, particulars: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-2">Amount Due *</label>
                    <input type="number" step="0.01" required value={form.amount_due} onChange={e => setForm(prev => ({ ...prev, amount_due: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: theme.border }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-8 py-3 text-white rounded-lg shadow-md hover:shadow-lg" style={{ backgroundColor: theme.primary }}>Save Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowEditModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Entry</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cost Category *</label>
                    <Select options={costCategories} value={costCategories.find(c => c.value === form.cost_category_id) || null}
                      onChange={opt => setForm(prev => ({ ...prev, cost_category_id: opt.value }))} required styles={selectStyles} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bank Account *</label>
                    <Select options={banks.filter(b => b.value !== null)} value={banks.find(b => b.value === form.finance_bank_id) || null}
                      onChange={opt => setForm(prev => ({ ...prev, finance_bank_id: opt.value }))} required styles={selectStyles} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Due Date</label>
                    <input type="date" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bill Date</label>
                    <input type="date" value={form.bill_date} onChange={e => setForm(prev => ({ ...prev, bill_date: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Particulars *</label>
                    <input type="text" required value={form.particulars} onChange={e => setForm(prev => ({ ...prev, particulars: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Amount Due *</label>
                    <input type="number" step="0.01" required value={form.amount_due} onChange={e => setForm(prev => ({ ...prev, amount_due: e.target.value }))} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: theme.border }} />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: theme.border }}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-8 py-3 text-white rounded-lg" style={{ backgroundColor: theme.primary }}>Update Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditCardPayablesModal;
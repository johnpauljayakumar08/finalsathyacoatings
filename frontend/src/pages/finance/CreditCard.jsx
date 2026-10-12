import { API_BASE_URL } from "../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import Select from 'react-select';
// import { 
//   CreditCard, Building2, FolderOpen, IndianRupee,
//   Edit3, Plus, Loader2, AlertCircle, Search, X
// } from 'lucide-react';

// const theme = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
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
//   menu: (base) => ({ ...base, borderRadius: '0.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 9999 }),
//   option: (base, state) => ({
//     ...base,
//     backgroundColor: state.isSelected ? theme.primary : state.isFocused ? '#ecfdf5' : 'white',
//     color: state.isSelected ? 'white' : theme.textPrimary,
//   }),
// };

// const CreditCardPayables = () => {
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
//     fetchCompanies();
//     fetchCostCategories();
//     fetchBanks();
//   }, []);

//   useEffect(() => {
//     if (selectedProject && selectedBank?.value) {
//       loadData();
//     } else {
//       setCreditCardData([]);
//       setOverallDue(0);
//     }
//   }, [selectedProject, selectedBank]);

//   const fetchCompanies = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/companies-with-projects`);
//       const formatted = res.data.data.map(c => ({
//         value: c.company_id,
//         label: c.company_name,
//         projects: c.projects.map(p => ({ value: p.pd_id, label: p.project_name }))
//       }));
//       setCompanies(formatted);
//     } catch (err) {
//       toast.error('Failed to load companies');
//     }
//   };

//   const fetchCostCategories = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/cost-categories`);
//       const cats = res.data.data.map(c => ({ value: c.id, label: c.category_name }));
//       setCostCategories(cats);
//     } catch (err) {
//       toast.error('Failed to load cost categories');
//     }
//   };

//   const fetchBanks = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
//       const options = [
//         { value: null, label: 'All Banks' },
//         ...res.data.data.map(b => ({
//           value: b.id,
//           label: `${b.bank_name} (₹${parseFloat(b.available_balance || 0).toLocaleString('en-IN')})`
//         }))
//       ];
//       setBanks(options);
//     } catch (err) {
//       toast.error('Failed to load banks');
//     }
//   };

//   const loadData = async () => {
//     if (!selectedProject || !selectedBank?.value) return;
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
//       setCreditCardData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.cost_category_id || !form.particulars.trim() || !form.amount_due) {
//       return toast.error('Please fill all required fields');
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
//         created_by: '1'
//       });
//       toast.success('Entry added successfully!');
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
//       return toast.error('All fields are required');
//     }

//     try {
//       await axios.put(`${API_BASE_URL}/finance/credit-card-payable/${editingItem.id}`, {
//         cost_category_id: form.cost_category_id,
//         finance_bank_id: form.finance_bank_id,
//         due_date: form.due_date || null,
//         bill_date: form.bill_date || null,
//         particulars: form.particulars.trim(),
//         amount_due: parseFloat(form.amount_due),
//         updated_by: '1'
//       });
//       toast.success('Updated successfully!');
//       setShowEditModal(false);
//       loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Update failed');
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
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: theme.lightBg }}>
//       <div className="max-w-7xl mx-auto space-y-6">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: theme.border }}>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
//             <div className="flex items-center gap-4">
//               <div className="p-4 rounded-xl" style={{ backgroundColor: theme.primary }}>
//                 <CreditCard className="w-10 h-10 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>Credit Card Payables</h1>
//                 <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>Track credit card expenses by project & bank</p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>Total Outstanding</p>
//               <p className="text-4xl font-extrabold" style={{ color: theme.danger }}>
//                 {formatINR(overallDue)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: theme.border }}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold mb-3"><Building2 size={18} /> Company</label>
//               <Select
//                 options={companies}
//                 value={selectedCompany}
//                 onChange={(opt) => {
//                   setSelectedCompany(opt);
//                   setProjects(opt ? opt.projects : []);
//                   setSelectedProject(null);
//                   setSelectedBank(null);
//                 }}
//                 placeholder="Select company..."
//                 isClearable
//                 styles={selectStyles}
//               />
//             </div>
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold mb-3"><FolderOpen size={18} /> Project</label>
//               <Select
//                 options={projects}
//                 value={selectedProject}
//                 onChange={setSelectedProject}
//                 placeholder="Select project..."
//                 isDisabled={!selectedCompany}
//                 isClearable
//                 styles={selectStyles}
//               />
//             </div>
//             <div>
//               <label className="flex items-center gap-2 text-sm font-semibold mb-3"><IndianRupee size={18} /> Bank Account</label>
//               <Select
//                 options={banks}
//                 value={selectedBank}
//                 onChange={setSelectedBank}
//                 placeholder="All Banks"
//                 isDisabled={!selectedProject}
//                 styles={selectStyles}
//               />
//             </div>
//           </div>

//           <div className="flex justify-between items-center">
//             <div className="relative max-w-sm">
//               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
//               <input
//                 type="text"
//                 placeholder="Search particulars, category, bank..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 border rounded-lg"
//                 style={{ borderColor: theme.border }}
//               />
//             </div>
//             <button
//               onClick={() => setShowAddModal(true)}
//               disabled={!selectedProject || !selectedBank?.value}
//               className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-white transition hover:shadow-md"
//               style={{ backgroundColor: selectedBank?.value ? theme.primary : '#9ca3af' }}
//             >
//               <Plus size={20} /> Add Entry
//             </button>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: theme.border }}>
//           {loading ? (
//             <div className="p-20 text-center">
//               <Loader2 className="animate-spin inline" size={40} style={{ color: theme.primary }} />
//             </div>
//           ) : creditCardData.length === 0 ? (
//             <div className="text-center py-20 text-gray-500">
//               {selectedProject && selectedBank?.value ? 'No entries found' : 'Select a project and bank to view data'}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead style={{ backgroundColor: theme.lightBg }}>
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Bank</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Category</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Due Date</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Bill Date</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Particulars</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Amount</th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y" style={{ divideColor: theme.lightBorder }}>
//                   {filteredData.map(item => (
//                     <tr key={item.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 font-medium text-teal-700">{item.bank_name || '—'}</td>
//                       <td className="px-6 py-4">{item.category_name || '—'}</td>
//                       <td className="px-6 py-4">{formatDate(item.due_date)}</td>
//                       <td className="px-6 py-4">{formatDate(item.bill_date)}</td>
//                       <td className="px-6 py-4 max-w-xs truncate" title={item.particulars}>{item.particulars}</td>
//                       <td className="px-6 py-4 text-right font-bold text-red-600">{formatINR(item.amount_due)}</td>
//                       <td className="px-6 py-4 text-center">
//                         <button
//                           onClick={() => openEditModal(item)}
//                           className="p-2 hover:bg-amber-100 rounded-lg transition"
//                         >
//                           <Edit3 size={18} style={{ color: theme.accent }} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Add Modal - NOW SHOWS SELECTED BANK NAME */}
//         {showAddModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold">Add New Credit Card Entry</h2>
//                   <p className="text-sm text-gray-600 mt-2">
//                     <span className="font-medium">Bank:</span>{' '}
//                     <span className="text-teal-700 font-semibold">{selectedBank?.label || 'Not selected'}</span>
//                   </p>
//                 </div>
//                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                   <X size={24} />
//                 </button>
//               </div>

//               <form onSubmit={handleAddSubmit} className="space-y-6">
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Cost Category *</label>
//                     <Select 
//                       options={costCategories} 
//                       onChange={(opt) => setForm(prev => ({ ...prev, cost_category_id: opt.value }))} 
//                       placeholder="Select category" 
//                       required 
//                       styles={selectStyles} 
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Due Date</label>
//                     <input type="date" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Bill Date</label>
//                     <input type="date" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.bill_date} onChange={e => setForm(prev => ({ ...prev, bill_date: e.target.value }))} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Particulars *</label>
//                     <input type="text" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.particulars} onChange={e => setForm(prev => ({ ...prev, particulars: e.target.value }))} />
//                   </div>
//                   <div className="col-span-2">
//                     <label className="block text-sm font-semibold mb-2">Amount Due *</label>
//                     <input type="number" step="0.01" required placeholder="0.00" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.amount_due} onChange={e => setForm(prev => ({ ...prev, amount_due: e.target.value }))} />
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-4 pt-4 border-t">
//                   <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition">
//                     Cancel
//                   </button>
//                   <button type="submit" className="px-8 py-3 text-white rounded-lg shadow-md hover:shadow-lg transition" style={{ backgroundColor: theme.primary }}>
//                     Save Entry
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Edit Modal - Already has bank dropdown (editable) */}
//         {showEditModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold">Edit Entry</h2>
//                 <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
//               </div>
//               <form onSubmit={handleEditSubmit} className="space-y-6">
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Cost Category *</label>
//                     <Select
//                       options={costCategories}
//                       value={costCategories.find(c => c.value === form.cost_category_id) || null}
//                       onChange={(opt) => setForm(prev => ({ ...prev, cost_category_id: opt.value }))}
//                       required
//                       styles={selectStyles}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Bank Account *</label>
//                     <Select
//                       options={banks.filter(b => b.value !== null)}
//                       value={banks.find(b => b.value === form.finance_bank_id) || null}
//                       onChange={(opt) => setForm(prev => ({ ...prev, finance_bank_id: opt.value }))}
//                       required
//                       styles={selectStyles}
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Due Date</label>
//                     <input type="date" className="w-full px-4 py-3 border rounded-lg" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Bill Date</label>
//                     <input type="date" className="w-full px-4 py-3 border rounded-lg" value={form.bill_date} onChange={e => setForm(prev => ({ ...prev, bill_date: e.target.value }))} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Particulars *</label>
//                     <input type="text" required className="w-full px-4 py-3 border rounded-lg" value={form.particulars} onChange={e => setForm(prev => ({ ...prev, particulars: e.target.value }))} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Amount Due *</label>
//                     <input type="number" step="0.01" required className="w-full px-4 py-3 border rounded-lg" value={form.amount_due} onChange={e => setForm(prev => ({ ...prev, amount_due: e.target.value }))} />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-4 border-t">
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

// export default CreditCardPayables;















import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import { 
  CreditCard, Building2, FolderOpen, IndianRupee,
  Edit3, Plus, Loader2, Search, X
} from 'lucide-react';

const theme = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
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
  menu: (base) => ({ ...base, borderRadius: '0.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 9999 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? theme.primary : state.isFocused ? '#ecfdf5' : 'white',
    color: state.isSelected ? 'white' : theme.textPrimary,
  }),
};

// Extract and decode user ID from URL (e.g. NA== → 1)
const useCurrentUserId = () => {
  const { encodedUserId } = useParams();
  return useMemo(() => {
    if (!encodedUserId || encodedUserId === ':encodedUserId') return null;
    try {
      const decoded = atob(encodedUserId.trim());
      const id = parseInt(decoded, 10);
      return isNaN(id) ? null : id;
    } catch {
      return null;
    }
  }, [encodedUserId]);
};

const CreditCardPayables = () => {
  const currentUserId = useCurrentUserId(); // Real logged-in user

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
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
    fetchCompanies();
    fetchCostCategories();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (selectedProject && selectedBank?.value) {
      loadData();
    } else {
      setCreditCardData([]);
      setOverallDue(0);
    }
  }, [selectedProject, selectedBank]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/companies-with-projects`);
      const formatted = res.data.data.map(c => ({
        value: c.company_id,
        label: c.company_name,
        projects: c.projects.map(p => ({ value: p.pd_id, label: p.project_name }))
      }));
      setCompanies(formatted);
    } catch (err) {
      toast.error('Failed to load companies');
    }
  };

  const fetchCostCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/cost-categories`);
      const cats = res.data.data.map(c => ({ value: c.id, label: c.category_name }));
      setCostCategories(cats);
    } catch (err) {
      toast.error('Failed to load cost categories');
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      const options = [
        { value: null, label: 'All Banks' },
        ...res.data.data.map(b => ({
          value: b.id,
          label: `${b.bank_name} (₹${parseFloat(b.available_balance || 0).toLocaleString('en-IN')})`
        }))
      ];
      setBanks(options);
    } catch (err) {
      toast.error('Failed to load banks');
    }
  };

  const loadData = async () => {
    if (!selectedProject || !selectedBank?.value) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/finance/credit-card-payables?pd_id=${selectedProject.value}&finance_bank_id=${selectedBank.value}`
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
      setCreditCardData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.cost_category_id || !form.particulars.trim() || !form.amount_due) {
      return toast.error('Please fill all required fields');
    }
    if (!currentUserId) {
      return toast.error('User not authenticated');
    }

    try {
      await axios.post(`${API_BASE_URL}/finance/create-credit-card-payable`, {
        pd_id: selectedProject.value,
        cost_category_id: form.cost_category_id,
        due_date: form.due_date || null,
        bill_date: form.bill_date || null,
        particulars: form.particulars.trim(),
        amount_due: parseFloat(form.amount_due),
        finance_bank_id: selectedBank.value,
        created_by: currentUserId  // Real user ID from URL
      });
      toast.success('Entry added successfully!');
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
      return toast.error('All fields are required');
    }
    if (!currentUserId) {
      return toast.error('User not authenticated');
    }

    try {
      await axios.put(`${API_BASE_URL}/finance/credit-card-payable/${editingItem.id}`, {
        cost_category_id: form.cost_category_id,
        finance_bank_id: form.finance_bank_id,
        due_date: form.due_date || null,
        bill_date: form.bill_date || null,
        particulars: form.particulars.trim(),
        amount_due: parseFloat(form.amount_due),
        updated_by: currentUserId  // Real user ID from URL
      });
      toast.success('Updated successfully!');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: theme.lightBg }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: theme.border }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: theme.primary }}>
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: theme.textPrimary }}>Credit Card Payables</h1>
                <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>Track credit card expenses by project & bank</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>Total Outstanding</p>
              <p className="text-4xl font-extrabold" style={{ color: theme.danger }}>
                {formatINR(overallDue)}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: theme.border }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3"><Building2 size={18} /> Company</label>
              <Select
                options={companies}
                value={selectedCompany}
                onChange={(opt) => {
                  setSelectedCompany(opt);
                  setProjects(opt ? opt.projects : []);
                  setSelectedProject(null);
                  setSelectedBank(null);
                }}
                placeholder="Select company..."
                isClearable
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3"><FolderOpen size={18} /> Project</label>
              <Select
                options={projects}
                value={selectedProject}
                onChange={setSelectedProject}
                placeholder="Select project..."
                isDisabled={!selectedCompany}
                isClearable
                styles={selectStyles}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3"><IndianRupee size={18} /> Bank Account</label>
              <Select
                options={banks}
                value={selectedBank}
                onChange={setSelectedBank}
                placeholder="All Banks"
                isDisabled={!selectedProject}
                styles={selectStyles}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="relative max-w-sm">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search particulars, category, bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg"
                style={{ borderColor: theme.border }}
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!selectedProject || !selectedBank?.value}
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-white transition hover:shadow-md"
              style={{ backgroundColor: selectedBank?.value ? theme.primary : '#9ca3af' }}
            >
              <Plus size={20} /> Add Entry
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: theme.border }}>
          {loading ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin inline" size={40} style={{ color: theme.primary }} />
            </div>
          ) : creditCardData.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              {selectedProject && selectedBank?.value ? 'No entries found' : 'Select a project and bank to view data'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: theme.lightBg }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Bank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Bill Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Particulars</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: theme.lightBorder }}>
                  {filteredData.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-teal-700">{item.bank_name || '—'}</td>
                      <td className="px-6 py-4">{item.category_name || '—'}</td>
                      <td className="px-6 py-4">{formatDate(item.due_date)}</td>
                      <td className="px-6 py-4">{formatDate(item.bill_date)}</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={item.particulars}>{item.particulars}</td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">{formatINR(item.amount_due)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 hover:bg-amber-100 rounded-lg transition"
                        >
                          <Edit3 size={18} style={{ color: theme.accent }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Add New Credit Card Entry</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Bank:</span>{' '}
                    <span className="text-teal-700 font-semibold">{selectedBank?.label || 'Not selected'}</span>
                  </p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cost Category *</label>
                    <Select 
                      options={costCategories} 
                      onChange={(opt) => setForm(prev => ({ ...prev, cost_category_id: opt.value }))} 
                      placeholder="Select category" 
                      required 
                      styles={selectStyles} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Due Date</label>
                    <input type="date" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bill Date</label>
                    <input type="date" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.bill_date} onChange={e => setForm(prev => ({ ...prev, bill_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Particulars *</label>
                    <input type="text" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.particulars} onChange={e => setForm(prev => ({ ...prev, particulars: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold mb-2">Amount Due *</label>
                    <input type="number" step="0.01" required placeholder="0.00" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" value={form.amount_due} onChange={e => setForm(prev => ({ ...prev, amount_due: e.target.value }))} />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-8 py-3 text-white rounded-lg shadow-md hover:shadow-lg transition" style={{ backgroundColor: theme.primary }}>
                    Save Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-8 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Entry</h2>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={24} /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cost Category *</label>
                    <Select
                      options={costCategories}
                      value={costCategories.find(c => c.value === form.cost_category_id) || null}
                      onChange={(opt) => setForm(prev => ({ ...prev, cost_category_id: opt.value }))}
                      required
                      styles={selectStyles}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bank Account *</label>
                    <Select
                      options={banks.filter(b => b.value !== null)}
                      value={banks.find(b => b.value === form.finance_bank_id) || null}
                      onChange={(opt) => setForm(prev => ({ ...prev, finance_bank_id: opt.value }))}
                      required
                      styles={selectStyles}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Due Date</label>
                    <input type="date" className="w-full px-4 py-3 border rounded-lg" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Bill Date</label>
                    <input type="date" className="w-full px-4 py-3 border rounded-lg" value={form.bill_date} onChange={e => setForm(prev => ({ ...prev, bill_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Particulars *</label>
                    <input type="text" required className="w-full px-4 py-3 border rounded-lg" value={form.particulars} onChange={e => setForm(prev => ({ ...prev, particulars: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Amount Due *</label>
                    <input type="number" step="0.01" required className="w-full px-4 py-3 border rounded-lg" value={form.amount_due} onChange={e => setForm(prev => ({ ...prev, amount_due: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
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

export default CreditCardPayables;
import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import Select from 'react-select';
// import { Home, Plus, Edit, Check, X, Search, Building2 } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const SiteAccomodationPayable = () => {
//   const [list, setList] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [bankOptions, setBankOptions] = useState([]);
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedBank, setSelectedBank] = useState(null);
//   const [editingRowId, setEditingRowId] = useState(null);
//   const [editData, setEditData] = useState({});
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newEntry, setNewEntry] = useState({
//     finance_creditors_client_id: '',
//     due_period: '',
//     advance_amount: '',
//     due_amount: '',
//     payment: '',
//     due_date: '',
//     payment_date: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     fetchProjects();
//     fetchClients();
//     fetchBanks();
//   }, []);

//   useEffect(() => {
//     if (selectedProject && selectedBank) {
//       loadData();
//     } else {
//       setList([]);
//       setShowAddForm(false);
//     }
//   }, [selectedProject, selectedBank]);

//   const fetchProjects = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/companies-with-projects`);
//       const allProjects = res.data.data.flatMap(c => 
//         (c.projects || []).map(p => ({ pd_id: p.pd_id, project_name: p.project_name }))
//       );
//       setProjects(allProjects);
//     } catch (err) {
//       toast.error('Failed to load projects');
//     }
//   };

//   const fetchClients = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/view-creditors-client`);
//       setClients(res.data.data || []);
//     } catch (err) {
//       toast.error('Failed to load clients');
//     }
//   };

//   const fetchBanks = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
//       const options = res.data.data.map(b => ({
//         value: b.id,
//         label: `${b.bank_name} (₹${Number(b.available_balance || 0).toLocaleString('en-IN')})`
//       }));
//       setBankOptions(options);
//     } catch (err) {
//       console.error('Failed to load banks');
//     }
//   };

//   const loadData = async () => {
//     if (!selectedProject || !selectedBank) return;
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${API_BASE_URL}/finance/site-accommodation-payables?pd_id=${selectedProject}&finance_bank_id=${selectedBank.value}`
//       );
//       setList(res.data.data || []);
//     } catch (err) {
//       toast.error('Failed to load records');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (item) => {
//     setEditingRowId(item.id);
//     setEditData({ ...item });
//   };

//   const cancelEdit = () => {
//     setEditingRowId(null);
//     setEditData({});
//   };

//   const handleEditChange = (field, value) => {
//     setEditData(prev => {
//       const updated = { ...prev, [field]: value };
//       if (field === 'due_amount' || field === 'payment') {
//         updated.balance_due = (parseFloat(updated.due_amount || 0) - parseFloat(updated.payment || 0)).toFixed(2);
//       }
//       return updated;
//     });
//   };

//   const saveEdit = async () => {
//     const payload = {
//       ...editData,
//       finance_bank_id: selectedBank.value,
//       balance_due: editData.balance_due,
//       updated_by: 'admin'
//     };

//     try {
//       await axios.put(`${API_BASE_URL}/finance/update-site-accommodation-payable/${editingRowId}`, payload);
//       toast.success('Updated successfully');
//       cancelEdit();
//       loadData();
//     } catch (err) {
//       toast.error('Update failed');
//     }
//   };

//   const handleNewEntryChange = (field, value) => {
//     setNewEntry(prev => {
//       const updated = { ...prev, [field]: value };
//       if (field === 'due_amount' || field === 'payment') {
//         updated.balance_due = (parseFloat(updated.due_amount || 0) - parseFloat(updated.payment || 0)).toFixed(2);
//       }
//       return updated;
//     });
//   };

//   const saveNewEntry = async () => {
//     const payload = {
//       ...newEntry,
//       pd_id: selectedProject,
//       finance_bank_id: selectedBank.value,
//       balance_due: newEntry.balance_due || 0,
//       created_by: 'admin'
//     };

//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-site-accommodation-payable`, payload);
//       toast.success('Record added successfully!');
//       setShowAddForm(false);
//       setNewEntry({
//         finance_creditors_client_id: '',
//         due_period: '',
//         advance_amount: '',
//         due_amount: '',
//         payment: '',
//         due_date: '',
//         payment_date: ''
//       });
//       loadData();
//     } catch (err) {
//       toast.error('Failed to add record');
//     }
//   };

//   const getClientName = (id) => {
//     const client = clients.find(c => c.id === parseInt(id));
//     return client ? client.client_name : '-';
//   };

//   const overall = list.length > 0 ? list[0] : {};

//   const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

//   const filteredList = list.slice(1).filter(item =>
//     getClientName(item.finance_creditors_client_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.due_period?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//                 <Home className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
//                   Site Accommodation Payables
//                 </h1>
//                 <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                   Track accommodation expenses for site staff
//                 </p>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
//               <select
//                 value={selectedProject}
//                 onChange={(e) => {
//                   setSelectedProject(e.target.value);
//                   setSelectedBank(null);
//                 }}
//                 className="px-6 py-3 rounded-lg border text-base font-medium focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               >
//                 <option value="">Select Project</option>
//                 {projects.map(p => (
//                   <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
//                 ))}
//               </select>

//               <div className="min-w-64">
//                 <Select
//                   options={bankOptions}
//                   value={selectedBank}
//                   onChange={setSelectedBank}
//                   placeholder="Select Bank"
//                   isSearchable
//                   isClearable={false}
//                   styles={{
//                     control: (base) => ({
//                       ...base,
//                       padding: '0.375rem',
//                       borderRadius: '0.5rem',
//                       borderColor: themeColors.border,
//                       boxShadow: 'none',
//                       '&:hover': { borderColor: themeColors.border },
//                     }),
//                     placeholder: (base) => ({
//                       ...base,
//                       color: themeColors.textSecondary,
//                       fontSize: '0.975rem'
//                     })
//                   }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search & Add Button */}
//         {selectedProject && selectedBank && (
//           <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
//             <div className="relative flex-1 max-w-md">
//               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
//               <input
//                 type="text"
//                 placeholder="Search client, period, bank..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               />
//             </div>

//             <button
//               onClick={() => setShowAddForm(true)}
//               className="flex items-center gap-3 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
//             >
//               <Plus size={20} />
//               Add New Record
//             </button>
//           </div>
//         )}

//         {/* Add New Entry Form */}
//         {showAddForm && selectedBank && (
//           <div className="bg-white rounded-xl shadow-sm border p-8 mb-8" style={{ borderColor: themeColors.border }}>
//             <h2 className="text-xl font-bold mb-6" style={{ color: themeColors.textPrimary }}>
//               Add New Accommodation Record — {selectedBank.label}
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Client</label>
//                 <select
//                   value={newEntry.finance_creditors_client_id}
//                   onChange={(e) => handleNewEntryChange('finance_creditors_client_id', e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 >
//                   <option value="">Select Client</option>
//                   {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Period</label>
//                 <input
//                   type="text"
//                   placeholder="e.g. 01-11-2025 to 30-11-2025"
//                   value={newEntry.due_period}
//                   onChange={(e) => handleNewEntryChange('due_period', e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Advance Amount</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={newEntry.advance_amount}
//                   onChange={(e) => handleNewEntryChange('advance_amount', e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Due Amount</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={newEntry.due_amount}
//                   onChange={(e) => handleNewEntryChange('due_amount', e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Payment</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={newEntry.payment}
//                   onChange={(e) => handleNewEntryChange('payment', e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Due Date</label>
//                 <input
//                   type="date"
//                   value={newEntry.due_date}
//                   onChange={(e) => handleNewEntryChange('due_date', e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Payment Date</label>
//                 <input
//                   type="date"
//                   value={newEntry.payment_date}
//                   onChange={(e) => handleNewEntryChange('payment_date', e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div className="flex items-end">
//                 <div className="w-full p-4 bg-teal-50 rounded-lg border-2 border-teal-300">
//                   <div className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Balance Due</div>
//                   <div className="text-2xl font-bold text-teal-700">
//                     {formatINR(newEntry.balance_due || 0)}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="mt-6 flex justify-end gap-4">
//               <button onClick={saveNewEntry} className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition">
//                 Save Record
//               </button>
//               <button onClick={() => setShowAddForm(false)} className="px-8 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
//           {loading ? (
//             <div className="flex items-center justify-center h-96">
//               <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4"
//                    style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
//             </div>
//           ) : list.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               {selectedProject && selectedBank ? 'No accommodation records found' : 'Please select a project and bank'}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead style={{ backgroundColor: themeColors.lightBg }}>
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Bank</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Client</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Period</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Advance</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Due</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Payment</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//                   {filteredList.map((item) => {
//                     const isEditing = editingRowId === item.id;
//                     const row = isEditing ? editData : item;

//                     return (
//                       <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4 text-sm font-medium text-blue-600">
//                           {item.bank_name || '-'}
//                         </td>
//                         <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
//                           {isEditing ? (
//                             <select
//                               value={row.finance_creditors_client_id}
//                               onChange={(e) => handleEditChange('finance_creditors_client_id', e.target.value)}
//                               className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                               style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                             >
//                               <option value="">Select Client</option>
//                               {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
//                             </select>
//                           ) : getClientName(item.finance_creditors_client_id)}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               value={row.due_period}
//                               onChange={(e) => handleEditChange('due_period', e.target.value)}
//                               className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                               style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                             />
//                           ) : item.due_period || '-'}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               step="0.01"
//                               value={row.advance_amount}
//                               onChange={(e) => handleEditChange('advance_amount', e.target.value)}
//                               className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                               style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                             />
//                           ) : formatINR(item.advance_amount)}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               step="0.01"
//                               value={row.due_amount}
//                               onChange={(e) => handleEditChange('due_amount', e.target.value)}
//                               className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                               style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                             />
//                           ) : formatINR(item.due_amount)}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               step="0.01"
//                               value={row.payment}
//                               onChange={(e) => handleEditChange('payment', e.target.value)}
//                               className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                               style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                             />
//                           ) : formatINR(item.payment)}
//                         </td>
//                         <td className="px-6 py-4 text-right font-bold" style={{ color: row.balance_due > 0 ? '#dc2626' : '#16a34a' }}>
//                           {formatINR(row.balance_due)}
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           {isEditing ? (
//                             <div className="flex justify-center gap-3">
//                               <button onClick={saveEdit} className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"><Check size={18} /></button>
//                               <button onClick={cancelEdit} className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"><X size={18} /></button>
//                             </div>
//                           ) : (
//                             <button onClick={() => startEdit(item)} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
//                               <Edit size={18} />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}

//                   {/* Total Row - Exactly like your original */}
//                   {list.length > 0 && (
//                     <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
//                       <td colSpan="3" className="px-6 py-5 text-left text-lg" style={{ color: themeColors.textPrimary }}>TOTAL</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono">{formatINR(overall.overall_advance || 0)}</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono">{formatINR(overall.overall_due || 0)}</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_payment || 0)}</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono text-red-700">{formatINR(overall.overall_balance || 0)}</td>
//                       <td></td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SiteAccomodationPayable;
















import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import { Home, Plus, Edit, Check, X, Search, Building2 } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

// Decode Base64 user ID from URL (NA== → 1)
const useCurrentUserId = () => {
  const { encodedUserId } = useParams(); // From route: /site-accommodation/:encodedUserId

  return useMemo(() => {
    if (!encodedUserId || encodedUserId === ':encodedUserId') return null;
    try {
      const decoded = atob(encodedUserId.trim());
      const id = parseInt(decoded, 10);
      return isNaN(id) ? null : id; // Return as number
    } catch (err) {
      console.error('Failed to decode user ID:', err);
      return null;
    }
  }, [encodedUserId]);
};

const SiteAccomodationPayable = () => {
  const currentUserId = useCurrentUserId(); // This is the real user ID (e.g., 1)

  const [list, setList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [bankOptions, setBankOptions] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
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
    fetchProjects();
    fetchClients();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (selectedProject && selectedBank) {
      loadData();
    } else {
      setList([]);
      setShowAddForm(false);
    }
  }, [selectedProject, selectedBank]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/companies-with-projects`);
      const allProjects = res.data.data.flatMap(c => 
        (c.projects || []).map(p => ({ pd_id: p.pd_id, project_name: p.project_name }))
      );
      setProjects(allProjects);
    } catch (err) {
      toast.error('Failed to load projects');
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/view-creditors-client`);
      setClients(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load clients');
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      const options = res.data.data.map(b => ({
        value: b.id,
        label: `${b.bank_name} (₹${Number(b.available_balance || 0).toLocaleString('en-IN')})`
      }));
      setBankOptions(options);
    } catch (err) {
      console.error('Failed to load banks');
    }
  };

  const loadData = async () => {
    if (!selectedProject || !selectedBank) return;
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
    if (!currentUserId) {
      toast.error('User not authenticated');
      return;
    }

    const payload = {
      ...editData,
      finance_bank_id: selectedBank.value,
      balance_due: editData.balance_due,
      updated_by: currentUserId  // Real user ID from URL
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
    if (!currentUserId) {
      toast.error('User not authenticated');
      return;
    }

    const payload = {
      ...newEntry,
      pd_id: selectedProject,
      finance_bank_id: selectedBank.value,
      balance_due: newEntry.balance_due || 0,
      created_by: currentUserId  // Real user ID from URL
    };

    try {
      await axios.post(`${API_BASE_URL}/finance/create-site-accommodation-payable`, payload);
      toast.success('Record added successfully!');
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
      toast.error('Failed to add record');
    }
  };

  const getClientName = (id) => {
    const client = clients.find(c => c.id === parseInt(id));
    return client ? client.client_name : '-';
  };

  const overall = list.length > 0 ? list[0] : {};

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const filteredList = list.slice(1).filter(item =>
    getClientName(item.finance_creditors_client_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.due_period?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <Home className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Site Accommodation Payables
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Track accommodation expenses for site staff | User ID: <strong>{currentUserId || 'Loading...'}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setSelectedBank(null);
                }}
                className="px-6 py-3 rounded-lg border text-base font-medium focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                ))}
              </select>

              <div className="min-w-64">
                <Select
                  options={bankOptions}
                  value={selectedBank}
                  onChange={setSelectedBank}
                  placeholder="Select Bank"
                  isSearchable
                  isClearable={false}
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: '0.375rem',
                      borderRadius: '0.5rem',
                      borderColor: themeColors.border,
                      boxShadow: 'none',
                      '&:hover': { borderColor: themeColors.border },
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: themeColors.textSecondary,
                      fontSize: '0.975rem'
                    })
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Add Button */}
        {selectedProject && selectedBank && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
              <input
                type="text"
                placeholder="Search client, period, bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              />
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-3 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
            >
              <Plus size={20} />
              Add New Record
            </button>
          </div>
        )}

        {/* Add New Entry Form */}
        {showAddForm && selectedBank && (
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8" style={{ borderColor: themeColors.border }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: themeColors.textPrimary }}>
              Add New Accommodation Record — {selectedBank.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Client</label>
                <select
                  value={newEntry.finance_creditors_client_id}
                  onChange={(e) => handleNewEntryChange('finance_creditors_client_id', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                >
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Period</label>
                <input
                  type="text"
                  placeholder="e.g. 01-11-2025 to 30-11-2025"
                  value={newEntry.due_period}
                  onChange={(e) => handleNewEntryChange('due_period', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Advance Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.advance_amount}
                  onChange={(e) => handleNewEntryChange('advance_amount', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Due Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.due_amount}
                  onChange={(e) => handleNewEntryChange('due_amount', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Payment</label>
                <input
                  type="number"
                  step="0.01"
                  value={newEntry.payment}
                  onChange={(e) => handleNewEntryChange('payment', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Due Date</label>
                <input
                  type="date"
                  value={newEntry.due_date}
                  onChange={(e) => handleNewEntryChange('due_date', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Payment Date</label>
                <input
                  type="date"
                  value={newEntry.payment_date}
                  onChange={(e) => handleNewEntryChange('payment_date', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div className="flex items-end">
                <div className="w-full p-4 bg-teal-50 rounded-lg border-2 border-teal-300">
                  <div className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Balance Due</div>
                  <div className="text-2xl font-bold text-teal-700">
                    {formatINR(newEntry.balance_due || 0)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={saveNewEntry} className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition">
                Save Record
              </button>
              <button onClick={() => setShowAddForm(false)} className="px-8 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}>
                Cancel
              </button>
            </div>
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
              {selectedProject && selectedBank ? 'No accommodation records found' : 'Please select a project and bank'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: themeColors.lightBg }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Bank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Period</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Advance</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Due</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Payment</th>
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
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">
                          {item.bank_name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
                          {isEditing ? (
                            <select
                              value={row.finance_creditors_client_id}
                              onChange={(e) => handleEditChange('finance_creditors_client_id', e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            >
                              <option value="">Select Client</option>
                              {clients.map(c => <option key={c.id} value={c.id}>{c.client_name}</option>)}
                            </select>
                          ) : getClientName(item.finance_creditors_client_id)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {isEditing ? (
                            <input
                              type="text"
                              value={row.due_period}
                              onChange={(e) => handleEditChange('due_period', e.target.value)}
                              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            />
                          ) : item.due_period || '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={row.advance_amount}
                              onChange={(e) => handleEditChange('advance_amount', e.target.value)}
                              className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            />
                          ) : formatINR(item.advance_amount)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={row.due_amount}
                              onChange={(e) => handleEditChange('due_amount', e.target.value)}
                              className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            />
                          ) : formatINR(item.due_amount)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={row.payment}
                              onChange={(e) => handleEditChange('payment', e.target.value)}
                              className="w-32 text-right px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            />
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

                  {/* Total Row */}
                  {list.length > 0 && (
                    <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
                      <td colSpan="3" className="px-6 py-5 text-left text-lg" style={{ color: themeColors.textPrimary }}>TOTAL</td>
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
  );
};

export default SiteAccomodationPayable;
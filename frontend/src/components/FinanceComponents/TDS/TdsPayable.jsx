import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import Select from 'react-select';
// import { ScrollText, Plus, Edit, Check, X, Search } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const TdsPayable = () => {
//   const [list, setList] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [pdId, setPdId] = useState('');
//   const [selectedBank, setSelectedBank] = useState(null); // { value, label }
//   const [editingId, setEditingId] = useState(null);
//   const [editData, setEditData] = useState({});
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [form, setForm] = useState({
//     month: '',
//     payable: '',
//     returnable: '',
//     non_returnable: '',
//   });

//   useEffect(() => {
//     fetchProjects();
//     fetchBanks();
//   }, []);

//   useEffect(() => {
//     if (pdId) {
//       setLoading(true);
//       loadData();
//     } else {
//       setList([]);
//       setShowForm(false);
//       setSelectedBank(null);
//     }
//   }, [pdId, selectedBank]);

//   const fetchProjects = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/companies-with-projects`);
//       if (res.data.status === 'success' && res.data.data) {
//         const allProjects = res.data.data
//           .flatMap(c => c.projects || [])
//           .map(p => ({ pd_id: p.pd_id, project_name: p.project_name }))
//           .filter(p => p.pd_id);
//         setProjects(allProjects);
//       }
//     } catch (err) {
//       toast.error('Failed to load projects');
//     }
//   };

//   const fetchBanks = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
//       if (res.data.status === 'success') {
//         const options = [
//           { value: null, label: 'All Banks' },
//           ...res.data.data.map(bank => ({
//             value: bank.id,
//             label: `${bank.bank_name} (Bal: ₹${parseFloat(bank.available_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
//           }))
//         ];
//         setBanks(options);
//       }
//     } catch (err) {
//       toast.error('Failed to load banks');
//     }
//   };

//   const loadData = async () => {
//     if (!pdId) return;
//     try {
//       let url = `${API_BASE_URL}/finance/tds-payables?pd_id=${pdId}`;
//       if (selectedBank && selectedBank.value !== null) {
//         url += `&finance_bank_id=${selectedBank.value}`;
//       }
//       const res = await axios.get(url);
//       setList(res.data.data || []);
//     } catch (err) {
//       toast.error('Failed to load TDS records');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     if (!form.month || !form.payable) {
//       toast.error('Month and Payable are required');
//       return;
//     }
//     if (!selectedBank || selectedBank.value === null) {
//       toast.error('Please select a bank first');
//       return;
//     }

//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-tds-payable`, {
//         ...form,
//         pd_id: pdId,
//         finance_bank_id: selectedBank.value,
//         created_by: 'admin'
//       });
//       toast.success('TDS record created successfully!');
//       setShowForm(false);
//       setForm({ month: '', payable: '', returnable: '', non_returnable: '' });
//       loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to create record');
//     }
//   };

//   const startEdit = (item) => {
//     setEditingId(item.id);
//     setEditData({
//       payable: item.payable || '',
//       returnable: item.returnable || '',
//       non_returnable: item.non_returnable || '',
//       finance_bank_id: item.finance_bank_id || null
//     });
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditData({});
//   };

//   const saveEdit = async () => {
//     try {
//       await axios.put(`${API_BASE_URL}/finance/update-tds-payable/${editingId}`, {
//         ...editData,
//         updated_by: 'admin'
//       });
//       toast.success('Updated successfully!');
//       cancelEdit();
//       loadData();
//     } catch (err) {
//       toast.error('Update failed');
//     }
//   };

//   const overall = list.length > 0 ? list[0] : {};

//   const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

//   const filteredList = list.slice(1).filter(item =>
//     item.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const customSelectStyles = {
//     control: (provided) => ({
//       ...provided,
//       minHeight: '48px',
//       borderColor: themeColors.border,
//       borderRadius: '0.5rem',
//       boxShadow: 'none',
//       '&:hover': { borderColor: themeColors.primary }
//     }),
//     option: (provided, state) => ({
//       ...provided,
//       backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#e6f4f1' : null,
//       color: state.isSelected ? 'white' : themeColors.textPrimary
//     })
//   };

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//                 <ScrollText className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
//                   TDS Payables Management
//                 </h1>
//                 <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                   Select Project → Choose Bank → View & Add TDS Records
//                 </p>
//               </div>
//             </div>

//             {/* Project + Bank Selection */}
//             <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
//               <div className="min-w-64">
//                 <label className="block text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>Project</label>
//                 <select
//                   value={pdId}
//                   onChange={(e) => {
//                     setPdId(e.target.value);
//                     setSelectedBank(null); // Reset bank when project changes
//                   }}
//                   className="w-full px-4 py-3 rounded-lg border text-base font-medium focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 >
//                   <option value="">Select Project</option>
//                   {projects.map(p => (
//                     <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="min-w-64">
//                 <label className="block text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>Bank Account</label>
//                 <Select
//                   options={banks}
//                   value={selectedBank}
//                   onChange={setSelectedBank}
//                   placeholder="All Banks"
//                   isDisabled={!pdId} // Disabled until project is selected
//                   isClearable={false}
//                   styles={customSelectStyles}
//                   menuPortalTarget={document.body}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search & Add Button */}
//         {pdId && (
//           <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
//             <div className="relative flex-1 max-w-md">
//               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
//               <input
//                 type="text"
//                 placeholder="Search month or bank..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               />
//             </div>

//             <button
//               onClick={() => setShowForm(true)}
//               disabled={!selectedBank || selectedBank.value === null}
//               className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition"
//               style={{
//                 backgroundColor: (!selectedBank || selectedBank.value === null) ? '#9ca3af' : '#14b8a6',
//                 color: 'white',
//                 cursor: (!selectedBank || selectedBank.value === null) ? 'not-allowed' : 'pointer'
//               }}
//             >
//               <Plus size={20} />
//               Create New Record
//             </button>
//           </div>
//         )}

//         {/* New Entry Form - NO BANK FIELD */}
//         {showForm && (
//           <div className="bg-white rounded-xl shadow-sm border p-8 mb-8" style={{ borderColor: themeColors.border }}>
//             <h2 className="text-xl font-bold mb-6" style={{ color: themeColors.textPrimary }}>
//               Add New TDS Record for {selectedBank?.label || 'Selected Bank'}
//             </h2>
//             <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Month</label>
//                 <input
//                   type="text"
//                   placeholder="e.g. November 2025"
//                   required
//                   value={form.month}
//                   onChange={(e) => setForm(prev => ({ ...prev, month: e.target.value }))}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Payable</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   placeholder="TDS Payable"
//                   required
//                   value={form.payable}
//                   onChange={(e) => setForm(prev => ({ ...prev, payable: e.target.value }))}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Returnable</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   placeholder="Returnable TDS"
//                   value={form.returnable}
//                   onChange={(e) => setForm(prev => ({ ...prev, returnable: e.target.value }))}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Non-Returnable</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   placeholder="Non-Returnable TDS"
//                   value={form.non_returnable}
//                   onChange={(e) => setForm(prev => ({ ...prev, non_returnable: e.target.value }))}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                 />
//               </div>
//             </form>
//             <div className="mt-6 flex justify-end gap-4">
//               <button onClick={handleCreate} className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
//                 Save Record
//               </button>
//               <button onClick={() => setShowForm(false)} className="px-8 py-3 border rounded-lg font-medium"
//                 style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}>
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
//                 style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
//             </div>
//           ) : list.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">
//               {pdId ? 'No TDS records found for selected filters' : 'Please select a project'}
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead style={{ backgroundColor: themeColors.lightBg }}>
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Month</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Bank</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Payable</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Returnable</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Non-Returnable</th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//                   {filteredList.map(item => {
//                     const isEditing = editingId === item.id;

//                     return (
//                       <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>{item.month}</td>
//                         <td className="px-6 py-4 text-sm font-medium text-teal-700">
//                           {isEditing ? (
//                             <Select
//                               options={banks.filter(b => b.value !== null)}
//                               value={banks.find(b => b.value === editData.finance_bank_id)}
//                               onChange={(opt) => setEditData(prev => ({ ...prev, finance_bank_id: opt ? opt.value : null }))}
//                               styles={customSelectStyles}
//                               menuPortalTarget={document.body}
//                             />
//                           ) : (
//                             item.bank_name || '—'
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono">
//                           {isEditing ? (
//                             <input type="number" step="0.01" value={editData.payable || ''} onChange={(e) => setEditData(prev => ({ ...prev, payable: e.target.value }))}
//                               className="w-40 text-right px-3 py-2 rounded border" style={{ borderColor: themeColors.border }} />
//                           ) : formatINR(item.payable)}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono text-green-700">
//                           {isEditing ? (
//                             <input type="number" step="0.01" value={editData.returnable || ''} onChange={(e) => setEditData(prev => ({ ...prev, returnable: e.target.value }))}
//                               className="w-40 text-right px-3 py-2 rounded border" style={{ borderColor: themeColors.border }} />
//                           ) : formatINR(item.returnable)}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono text-red-700">
//                           {isEditing ? (
//                             <input type="number" step="0.01" value={editData.non_returnable || ''} onChange={(e) => setEditData(prev => ({ ...prev, non_returnable: e.target.value }))}
//                               className="w-40 text-right px-3 py-2 rounded border" style={{ borderColor: themeColors.border }} />
//                           ) : formatINR(item.non_returnable)}
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           {isEditing ? (
//                             <div className="flex justify-center gap-2">
//                               <button onClick={saveEdit} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"><Check size={16} /></button>
//                               <button onClick={cancelEdit} className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded"><X size={16} /></button>
//                             </div>
//                           ) : (
//                             <button onClick={() => startEdit(item)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
//                               <Edit size={16} />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}

//                   {list.length > 1 && (
//                     <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
//                       <td colSpan={2} className="px-6 py-5 text-left text-lg" style={{ color: themeColors.textPrimary }}>TOTAL</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono">{formatINR(overall.overall_payable)}</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_returnable)}</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono text-red-700">{formatINR(overall.overall_non_returnable)}</td>
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

// export default TdsPayable;



import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import { ScrollText, Plus, Edit, Check, X, Search } from 'lucide-react';

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
  const { encodedUserId } = useParams();

  return useMemo(() => {
    if (!encodedUserId || encodedUserId === ':encodedUserId') return null;
    try {
      const decoded = atob(encodedUserId.trim());
      const id = parseInt(decoded, 10);
      return isNaN(id) ? null : id;
    } catch (err) {
      console.error('Failed to decode user ID:', err);
      return null;
    }
  }, [encodedUserId]);
};

const TdsPayable = () => {
  const currentUserId = useCurrentUserId(); // Real logged-in user ID

  const [list, setList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [banks, setBanks] = useState([]);
  const [pdId, setPdId] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    month: '',
    payable: '',
    returnable: '',
    non_returnable: '',
  });

  useEffect(() => {
    fetchProjects();
    fetchBanks();
  }, []);

  useEffect(() => {
    if (pdId) {
      setLoading(true);
      loadData();
    } else {
      setList([]);
      setShowForm(false);
      setSelectedBank(null);
    }
  }, [pdId, selectedBank]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/companies-with-projects`);
      if (res.data.status === 'success' && res.data.data) {
        const allProjects = res.data.data
          .flatMap(c => c.projects || [])
          .map(p => ({ pd_id: p.pd_id, project_name: p.project_name }))
          .filter(p => p.pd_id);
        setProjects(allProjects);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      if (res.data.status === 'success') {
        const options = [
          { value: null, label: 'All Banks' },
          ...res.data.data.map(bank => ({
            value: bank.id,
            label: `${bank.bank_name} (Bal: ₹${parseFloat(bank.available_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
          }))
        ];
        setBanks(options);
      }
    } catch (err) {
      toast.error('Failed to load banks');
    }
  };

  const loadData = async () => {
    if (!pdId) return;
    try {
      let url = `${API_BASE_URL}/finance/tds-payables?pd_id=${pdId}`;
      if (selectedBank && selectedBank.value !== null) {
        url += `&finance_bank_id=${selectedBank.value}`;
      }
      const res = await axios.get(url);
      setList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load TDS records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.month || !form.payable) {
      toast.error('Month and Payable are required');
      return;
    }
    if (!selectedBank || selectedBank.value === null) {
      toast.error('Please select a bank first');
      return;
    }
    if (!currentUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/finance/create-tds-payable`, {
        ...form,
        pd_id: pdId,
        finance_bank_id: selectedBank.value,
        created_by: currentUserId  // Real user ID from URL
      });
      toast.success('TDS record created successfully!');
      setShowForm(false);
      setForm({ month: '', payable: '', returnable: '', non_returnable: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create record');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData({
      payable: item.payable || '',
      returnable: item.returnable || '',
      non_returnable: item.non_returnable || '',
      finance_bank_id: item.finance_bank_id || null
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!currentUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/finance/update-tds-payable/${editingId}`, {
        ...editData,
        updated_by: currentUserId  // Real user ID from URL
      });
      toast.success('Updated successfully!');
      cancelEdit();
      loadData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const overall = list.length > 0 ? list[0] : {};

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const filteredList = list.slice(1).filter(item =>
    item.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '48px',
      borderColor: themeColors.border,
      borderRadius: '0.5rem',
      boxShadow: 'none',
      '&:hover': { borderColor: themeColors.primary }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#e6f4f1' : null,
      color: state.isSelected ? 'white' : themeColors.textPrimary
    })
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <ScrollText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                  TDS Payables Management
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Select Project → Choose Bank → View & Add TDS Records | User ID: <strong>{currentUserId || 'Loading...'}</strong>
                </p>
              </div>
            </div>

            {/* Project + Bank Selection */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="min-w-64">
                <label className="block text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>Project</label>
                <select
                  value={pdId}
                  onChange={(e) => {
                    setPdId(e.target.value);
                    setSelectedBank(null);
                  }}
                  className="w-full px-4 py-3 rounded-lg border text-base font-medium focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-64">
                <label className="block text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>Bank Account</label>
                <Select
                  options={banks}
                  value={selectedBank}
                  onChange={setSelectedBank}
                  placeholder="All Banks"
                  isDisabled={!pdId}
                  isClearable={false}
                  styles={customSelectStyles}
                  menuPortalTarget={document.body}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Add Button */}
        {pdId && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
              <input
                type="text"
                placeholder="Search month or bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              />
            </div>

            <button
              onClick={() => setShowForm(true)}
              disabled={!selectedBank || selectedBank.value === null}
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition"
              style={{
                backgroundColor: (!selectedBank || selectedBank.value === null) ? '#9ca3af' : '#14b8a6',
                color: 'white',
                cursor: (!selectedBank || selectedBank.value === null) ? 'not-allowed' : 'pointer'
              }}
            >
              <Plus size={20} />
              Create New Record
            </button>
          </div>
        )}

        {/* New Entry Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8" style={{ borderColor: themeColors.border }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: themeColors.textPrimary }}>
              Add New TDS Record for {selectedBank?.label || 'Selected Bank'}
            </h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Month</label>
                <input
                  type="text"
                  placeholder="e.g. November 2025"
                  required
                  value={form.month}
                  onChange={(e) => setForm(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Payable</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="TDS Payable"
                  required
                  value={form.payable}
                  onChange={(e) => setForm(prev => ({ ...prev, payable: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Returnable</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Returnable TDS"
                  value={form.returnable}
                  onChange={(e) => setForm(prev => ({ ...prev, returnable: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Non-Returnable</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Non-Returnable TDS"
                  value={form.non_returnable}
                  onChange={(e) => setForm(prev => ({ ...prev, non_returnable: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                />
              </div>
            </form>
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={handleCreate} className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                Save Record
              </button>
              <button onClick={() => setShowForm(false)} className="px-8 py-3 border rounded-lg font-medium"
                style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}>
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
              {pdId ? 'No TDS records found for selected filters' : 'Please select a project'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: themeColors.lightBg }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Month</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Bank</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Payable</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Returnable</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Non-Returnable</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
                  {filteredList.map(item => {
                    const isEditing = editingId === item.id;

                    return (
                      <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>{item.month}</td>
                        <td className="px-6 py-4 text-sm font-medium text-teal-700">
                          {isEditing ? (
                            <Select
                              options={banks.filter(b => b.value !== null)}
                              value={banks.find(b => b.value === editData.finance_bank_id)}
                              onChange={(opt) => setEditData(prev => ({ ...prev, finance_bank_id: opt ? opt.value : null }))}
                              styles={customSelectStyles}
                              menuPortalTarget={document.body}
                            />
                          ) : (
                            item.bank_name || '—'
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {isEditing ? (
                            <input type="number" step="0.01" value={editData.payable || ''} onChange={(e) => setEditData(prev => ({ ...prev, payable: e.target.value }))}
                              className="w-40 text-right px-3 py-2 rounded border" style={{ borderColor: themeColors.border }} />
                          ) : formatINR(item.payable)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-green-700">
                          {isEditing ? (
                            <input type="number" step="0.01" value={editData.returnable || ''} onChange={(e) => setEditData(prev => ({ ...prev, returnable: e.target.value }))}
                              className="w-40 text-right px-3 py-2 rounded border" style={{ borderColor: themeColors.border }} />
                          ) : formatINR(item.returnable)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-red-700">
                          {isEditing ? (
                            <input type="number" step="0.01" value={editData.non_returnable || ''} onChange={(e) => setEditData(prev => ({ ...prev, non_returnable: e.target.value }))}
                              className="w-40 text-right px-3 py-2 rounded border" style={{ borderColor: themeColors.border }} />
                          ) : formatINR(item.non_returnable)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isEditing ? (
                            <div className="flex justify-center gap-2">
                              <button onClick={saveEdit} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded"><Check size={16} /></button>
                              <button onClick={cancelEdit} className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded"><X size={16} /></button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(item)} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                              <Edit size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {list.length > 1 && (
                    <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
                      <td colSpan={2} className="px-6 py-5 text-left text-lg" style={{ color: themeColors.textPrimary }}>TOTAL</td>
                      <td className="px-6 py-5 text-right text-lg font-mono">{formatINR(overall.overall_payable)}</td>
                      <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_returnable)}</td>
                      <td className="px-6 py-5 text-right text-lg font-mono text-red-700">{formatINR(overall.overall_non_returnable)}</td>
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

export default TdsPayable;
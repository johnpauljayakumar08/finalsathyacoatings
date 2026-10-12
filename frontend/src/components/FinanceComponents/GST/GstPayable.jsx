import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Select from 'react-select';
// import CreatableSelect from 'react-select/creatable';
// import { toast } from 'react-toastify';
// import { DollarSign, Plus, Building2, Calendar, FileInput, FileOutput, Search, Edit, Check, X } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const customStyles = {
//   control: (provided) => ({
//     ...provided,
//     minHeight: '40px',
//     borderColor: themeColors.border,
//     borderRadius: '0.5rem',
//     boxShadow: 'none',
//     '&:hover': { borderColor: themeColors.primary }
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#e6f4f1' : null,
//     color: state.isSelected ? 'white' : themeColors.textPrimary
//   })
// };

// const GstPayable = () => {
//   const [list, setList] = useState([]);
//   const [companies, setCompanies] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [selectedBank, setSelectedBank] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [editData, setEditData] = useState({});

//   const [form, setForm] = useState({
//     company: null,
//     month: '',
//     entry_type_id: '',
//     input_amount: '',
//     output_amount: ''
//   });

//   useEffect(() => {
//     fetchBanks();
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     if (selectedBank?.value) {
//       loadData();
//     } else {
//       setList([]);
//     }
//   }, [selectedBank]);

//   const fetchBanks = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
//       const options = [
//         { value: null, label: 'All Banks' },
//         ...res.data.data.map(b => ({
//           value: b.id,
//           label: `${b.bank_name} (₹${parseFloat(b.available_balance).toLocaleString('en-IN')})`
//         }))
//       ];
//       setBanks(options);
//     } catch (err) {
//       toast.error('Failed to load banks');
//     }
//   };

//   const fetchCompanies = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/gst-companies`);
//       const options = res.data.data.map(c => ({ value: c.id, label: c.company_name }));
//       setCompanies(options);
//     } catch (err) {
//       toast.error('Failed to load companies');
//     }
//   };

//   const loadData = async () => {
//     if (!selectedBank?.value) return;
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/gst-payables?finance_bank_id=${selectedBank.value}`);
//       setList(res.data.data || []);
//     } catch (err) {
//       toast.error('Failed to load GST records');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateCompany = async (inputValue) => {
//     try {
//       const res = await axios.post(`${API_BASE_URL}/finance/create-gst-company`, {
//         company_name: inputValue.trim(),
//         created_by: 1
//       });
//       const newOpt = { value: res.data.data.id, label: res.data.data.company_name };
//       setCompanies(prev => [...prev, newOpt]);
//       setForm(prev => ({ ...prev, company: newOpt }));
//       toast.success(`Company "${newOpt.label}" added!`);
//     } catch (err) {
//       toast.error('Failed to add company');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.company || !form.month || !form.entry_type_id) {
//       toast.error('All fields are required');
//       return;
//     }

//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-gst-payable`, {
//         finance_gst_company_id: form.company.value,
//         month: form.month,
//         entry_type_id: parseInt(form.entry_type_id),
//         input_amount: parseFloat(form.input_amount) || 0,
//         output_amount: parseFloat(form.output_amount) || 0,
//         finance_bank_id: selectedBank.value,
//         created_by: 1,
//         updated_by: 1
//       });

//       toast.success('GST entry saved!');
//       setShowForm(false);
//       setForm({ company: null, month: '', entry_type_id: '', input_amount: '', output_amount: '' });
//       loadData();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Save failed');
//     }
//   };

//   const startEdit = (item) => {
//     setEditingId(item.id);
//     setEditData({
//       input_amount: item.input_amount,
//       output_amount: item.output_amount,
//       finance_bank_id: item.finance_bank_id
//     });
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setEditData({});
//   };

//   const saveEdit = async () => {
//     try {
//       await axios.put(`${API_BASE_URL}/finance/update-gst-payable/${editingId}`, {
//         input_amount: parseFloat(editData.input_amount) || 0,
//         output_amount: parseFloat(editData.output_amount) || 0,
//         finance_bank_id: editData.finance_bank_id || null,
//         updated_by: 1,
//         change_reason: 'Edited from GST Payable UI'
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
//     item.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.month?.includes(searchTerm) ||
//     item.entry_type_name?.toLowerCase().includes(searchTerm) ||
//     item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//                 <DollarSign className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
//                   GST Payable Management
//                 </h1>
//                 <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                   Track Input & Output GST by Bank Account
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-4 items-end">
//               <div className="min-w-80">
//                 <label className="block text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>Bank Account</label>
//                 <Select
//                   options={banks}
//                   value={selectedBank}
//                   onChange={setSelectedBank}
//                   placeholder="Select Bank First"
//                   styles={customStyles}
//                   menuPortalTarget={document.body}
//                 />
//               </div>

//               <button
//                 onClick={() => setShowForm(true)}
//                 disabled={!selectedBank?.value}
//                 className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition"
//                 style={{
//                   backgroundColor: selectedBank?.value ? themeColors.primary : '#9ca3af',
//                   color: 'white'
//                 }}
//               >
//                 <Plus size={20} />
//                 Add GST Entry
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Search */}
//         {selectedBank && (
//           <div className="mb-6">
//             <div className="relative max-w-md">
//               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
//               <input
//                 type="text"
//                 placeholder="Search company, month, type, bank..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 rounded-lg border"
//                 style={{ borderColor: themeColors.border }}
//               />
//             </div>
//           </div>
//         )}

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
//           {loading ? (
//             <div className="p-16 text-center">Loading...</div>
//           ) : !selectedBank ? (
//             <div className="p-16 text-center text-gray-500">Please select a bank to view GST records</div>
//           ) : list.length === 0 ? (
//             <div className="p-16 text-center text-gray-500">No GST records found</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead style={{ backgroundColor: themeColors.lightBg }}>
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Company</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Month</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Type</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Bank</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Input (ITC)</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Output</th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//                   {filteredList.map(item => {
//                     const isEditing = editingId === item.id;

//                     return (
//                       <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
//                           {item.company_name}
//                         </td>
//                         <td className="px-6 py-4 text-sm">{item.month}</td>
//                         <td className="px-6 py-4 text-sm">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             item.entry_type_name === 'Purchase' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
//                           }`}>
//                             {item.entry_type_name}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {isEditing ? (
//                             <Select
//                               options={banks.filter(b => b.value !== null)}
//                               value={banks.find(b => b.value === editData.finance_bank_id)}
//                               onChange={(opt) => setEditData(prev => ({ ...prev, finance_bank_id: opt ? opt.value : null }))}
//                               styles={customStyles}
//                               menuPortalTarget={document.body}
//                             />
//                           ) : (
//                             <span className="font-medium text-teal-700">{item.bank_name || '—'}</span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               step="0.01"
//                               value={editData.input_amount || ''}
//                               onChange={(e) => setEditData(prev => ({ ...prev, input_amount: e.target.value }))}
//                               className="w-32 text-right px-2 py-1 border rounded"
//                               style={{ borderColor: themeColors.border }}
//                             />
//                           ) : (
//                             <span className="text-green-700">{formatINR(item.input_amount)}</span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               step="0.01"
//                               value={editData.output_amount || ''}
//                               onChange={(e) => setEditData(prev => ({ ...prev, output_amount: e.target.value }))}
//                               className="w-32 text-right px-2 py-1 border rounded"
//                               style={{ borderColor: themeColors.border }}
//                             />
//                           ) : (
//                             <span className="text-red-700">{formatINR(item.output_amount)}</span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           {isEditing ? (
//                             <div className="flex justify-center gap-2">
//                               <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
//                                 <Check size={16} />
//                               </button>
//                               <button onClick={cancelEdit} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600">
//                                 <X size={16} />
//                               </button>
//                             </div>
//                           ) : (
//                             <button onClick={() => startEdit(item)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//                               <Edit size={16} />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}

//                   {list.length > 1 && (
//                     <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
//                       <td colSpan={4} className="px-6 py-5 text-left text-lg" style={{ color: themeColors.textPrimary }}>TOTAL</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_input_amount)}</td>
//                       <td className="px-6 py-5 text-right text-lg font-mono text-red-700">{formatINR(overall.overall_output_amount)}</td>
//                       <td></td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Modal Form - Same as before */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
//               <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
//                 <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>Add GST Entry</h2>
//                 <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                   Bank: <strong>{selectedBank.label}</strong>
//                 </p>
//               </div>
//               <form onSubmit={handleSubmit} className="p-6 space-y-6">
//                 <div>
//                   <label className="block text-sm font-semibold mb-2">Company *</label>
//                   <CreatableSelect
//                     isClearable
//                     options={companies}
//                     value={form.company}
//                     onChange={(opt) => setForm(prev => ({ ...prev, company: opt }))}
//                     onCreateOption={handleCreateCompany}
//                     placeholder="Search or add company..."
//                     formatCreateLabel={(input) => `Add "${input}"`}
//                     styles={customStyles}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Month *</label>
//                     <input type="month" required value={form.month} onChange={(e) => setForm(prev => ({ ...prev, month: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Entry Type *</label>
//                     <select required value={form.entry_type_id} onChange={(e) => setForm(prev => ({ ...prev, entry_type_id: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }}>
//                       <option value="">Select Type</option>
//                       <option value="1">Purchase</option>
//                       <option value="2">Sales</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <label className="flex items-center gap-2 text-sm font-semibold mb-2">
//                       <FileInput size={18} className="text-green-600" /> Input Amount (ITC)
//                     </label>
//                     <input type="number" step="0.01" placeholder="0.00" value={form.input_amount}
//                       onChange={(e) => setForm(prev => ({ ...prev, input_amount: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </div>
//                   <div>
//                     <label className="flex items-center gap-2 text-sm font-semibold mb-2">
//                       <FileOutput size={18} className="text-amber-600" /> Output Amount (Liability)
//                     </label>
//                     <input type="number" step="0.01" placeholder="0.00" value={form.output_amount}
//                       onChange={(e) => setForm(prev => ({ ...prev, output_amount: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: themeColors.border }}>
//                   <button type="button" onClick={() => setShowForm(false)}
//                     className="px-6 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border }}>
//                     Cancel
//                   </button>
//                   <button type="submit"
//                     className="px-8 py-3 text-white rounded-lg font-medium"
//                     style={{ backgroundColor: themeColors.primary }}>
//                     Save GST Entry
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GstPayable;
















import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { DollarSign, Plus, Building2, Calendar, FileInput, FileOutput, Search, Edit, Check, X } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '40px',
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

// Extract and decode user ID from URL (e.g., /gst-payable/NA== → 1)
const useCurrentUserId = () => {
  const { encodedUserId } = useParams();

  return useMemo(() => {
    if (!encodedUserId || encodedUserId === ':encodedUserId') return null;
    try {
      const decoded = atob(encodedUserId.trim());
      const id = parseInt(decoded, 10);
      return isNaN(id) ? null : id;
    } catch (err) {
      console.error('Base64 decode failed:', err);
      return null;
    }
  }, [encodedUserId]);
};

const GstPayable = () => {
  const currentUserId = useCurrentUserId(); // Real logged-in user ID

  const [list, setList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [form, setForm] = useState({
    company: null,
    month: '',
    entry_type_id: '',
    input_amount: '',
    output_amount: ''
  });

  useEffect(() => {
    fetchBanks();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedBank?.value) {
      loadData();
    } else {
      setList([]);
    }
  }, [selectedBank]);

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      const options = [
        { value: null, label: 'All Banks' },
        ...res.data.data.map(b => ({
          value: b.id,
          label: `${b.bank_name} (₹${parseFloat(b.available_balance).toLocaleString('en-IN')})`
        }))
      ];
      setBanks(options);
    } catch (err) {
      toast.error('Failed to load banks');
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/gst-companies`);
      const options = res.data.data.map(c => ({ value: c.id, label: c.company_name }));
      setCompanies(options);
    } catch (err) {
      toast.error('Failed to load companies');
    }
  };

  const loadData = async () => {
    if (!selectedBank?.value) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/gst-payables?finance_bank_id=${selectedBank.value}`);
      setList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load GST records');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (inputValue) => {
    if (!currentUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/finance/create-gst-company`, {
        company_name: inputValue.trim(),
        created_by: currentUserId  // Now uses real user
      });
      const newOpt = { value: res.data.data.id, label: res.data.data.company_name };
      setCompanies(prev => [...prev, newOpt]);
      setForm(prev => ({ ...prev, company: newOpt }));
      toast.success(`Company "${newOpt.label}" added!`);
    } catch (err) {
      toast.error('Failed to add company');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.month || !form.entry_type_id) {
      toast.error('All fields are required');
      return;
    }
    if (!currentUserId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/finance/create-gst-payable`, {
        finance_gst_company_id: form.company.value,
        month: form.month,
        entry_type_id: parseInt(form.entry_type_id),
        input_amount: parseFloat(form.input_amount) || 0,
        output_amount: parseFloat(form.output_amount) || 0,
        finance_bank_id: selectedBank.value,
        created_by: currentUserId,   // Real user ID
        updated_by: currentUserId    // Real user ID
      });

      toast.success('GST entry saved!');
      setShowForm(false);
      setForm({ company: null, month: '', entry_type_id: '', input_amount: '', output_amount: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData({
      input_amount: item.input_amount,
      output_amount: item.output_amount,
      finance_bank_id: item.finance_bank_id
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
      await axios.put(`${API_BASE_URL}/finance/update-gst-payable/${editingId}`, {
        input_amount: parseFloat(editData.input_amount) || 0,
        output_amount: parseFloat(editData.output_amount) || 0,
        finance_bank_id: editData.finance_bank_id || null,
        updated_by: currentUserId,  // Real user ID
        change_reason: 'Edited from GST Payable UI'
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
    item.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.month?.includes(searchTerm) ||
    item.entry_type_name?.toLowerCase().includes(searchTerm) ||
    item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                  GST Payable Management
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Track Input & Output GST by Bank Account | User ID: <strong>{currentUserId || 'Loading...'}</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-end">
              <div className="min-w-80">
                <label className="block text-xs font-medium mb-1" style={{ color: themeColors.textSecondary }}>Bank Account</label>
                <Select
                  options={banks}
                  value={selectedBank}
                  onChange={setSelectedBank}
                  placeholder="Select Bank First"
                  styles={customStyles}
                  menuPortalTarget={document.body}
                />
              </div>

              <button
                onClick={() => setShowForm(true)}
                disabled={!selectedBank?.value}
                className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition"
                style={{
                  backgroundColor: selectedBank?.value ? themeColors.primary : '#9ca3af',
                  color: 'white'
                }}
              >
                <Plus size={20} />
                Add GST Entry
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        {selectedBank && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
              <input
                type="text"
                placeholder="Search company, month, type, bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border"
                style={{ borderColor: themeColors.border }}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
          {loading ? (
            <div className="p-16 text-center">Loading...</div>
          ) : !selectedBank ? (
            <div className="p-16 text-center text-gray-500">Please select a bank to view GST records</div>
          ) : list.length === 0 ? (
            <div className="p-16 text-center text-gray-500">No GST records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: themeColors.lightBg }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Month</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Bank</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Input (ITC)</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Output</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase" style={{ color: themeColors.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
                  {filteredList.map(item => {
                    const isEditing = editingId === item.id;

                    return (
                      <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
                          {item.company_name}
                        </td>
                        <td className="px-6 py-4 text-sm">{item.month}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.entry_type_name === 'Purchase' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.entry_type_name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {isEditing ? (
                            <Select
                              options={banks.filter(b => b.value !== null)}
                              value={banks.find(b => b.value === editData.finance_bank_id)}
                              onChange={(opt) => setEditData(prev => ({ ...prev, finance_bank_id: opt ? opt.value : null }))}
                              styles={customStyles}
                              menuPortalTarget={document.body}
                            />
                          ) : (
                            <span className="font-medium text-teal-700">{item.bank_name || '—'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editData.input_amount || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, input_amount: e.target.value }))}
                              className="w-32 text-right px-2 py-1 border rounded"
                              style={{ borderColor: themeColors.border }}
                            />
                          ) : (
                            <span className="text-green-700">{formatINR(item.input_amount)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editData.output_amount || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, output_amount: e.target.value }))}
                              className="w-32 text-right px-2 py-1 border rounded"
                              style={{ borderColor: themeColors.border }}
                            />
                          ) : (
                            <span className="text-red-700">{formatINR(item.output_amount)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isEditing ? (
                            <div className="flex justify-center gap-2">
                              <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                                <Check size={16} />
                              </button>
                              <button onClick={cancelEdit} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(item)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                              <Edit size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {list.length > 1 && (
                    <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
                      <td colSpan={4} className="px-6 py-5 text-left text-lg" style={{ color: themeColors.textPrimary }}>TOTAL</td>
                      <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_input_amount)}</td>
                      <td className="px-6 py-5 text-right text-lg font-mono text-red-700">{formatINR(overall.overall_output_amount)}</td>
                      <td></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add GST Entry Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
                <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>Add GST Entry</h2>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Bank: <strong>{selectedBank.label}</strong>
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Company *</label>
                  <CreatableSelect
                    isClearable
                    options={companies}
                    value={form.company}
                    onChange={(opt) => setForm(prev => ({ ...prev, company: opt }))}
                    onCreateOption={handleCreateCompany}
                    placeholder="Search or add company..."
                    formatCreateLabel={(input) => `Add "${input}"`}
                    styles={customStyles}
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold Endless mb-2">Month *</label>
                    <input type="month" required value={form.month} onChange={(e) => setForm(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Entry Type *</label>
                    <select required value={form.entry_type_id} onChange={(e) => setForm(prev => ({ ...prev, entry_type_id: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }}>
                      <option value="">Select Type</option>
                      <option value="1">Purchase</option>
                      <option value="2">Sales</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <FileInput size={18} className="text-green-600" /> Input Amount (ITC)
                    </label>
                    <input type="number" step="0.01" placeholder="0.00" value={form.input_amount}
                      onChange={(e) => setForm(prev => ({ ...prev, input_amount: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <FileOutput size={18} className="text-amber-600" /> Output Amount (Liability)
                    </label>
                    <input type="number" step="0.01" placeholder="0.00" value={form.output_amount}
                      onChange={(e) => setForm(prev => ({ ...prev, output_amount: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: themeColors.border }}>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border }}>
                    Cancel
                  </button>
                  <button type="submit"
                    className="px-8 py-3 text-white rounded-lg font-medium"
                    style={{ backgroundColor: themeColors.primary }}>
                    Save GST Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GstPayable;
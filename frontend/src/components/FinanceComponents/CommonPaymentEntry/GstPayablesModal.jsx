import { API_BASE_URL } from "../../../config/api.js";
// // components/FinanceComponents/CommonPaymentEntry/GstPayablesModal.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import Select from 'react-select';
// import CreatableSelect from 'react-select/creatable';
// import { DollarSign, Plus, Building2, Calendar, FileInput, FileOutput, Search, Edit, Check, X } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
// };

// const customStyles = {
//   control: (p) => ({
//     ...p,
//     minHeight: '40px',
//     borderColor: themeColors.border,
//     borderRadius: '0.5rem',
//     boxShadow: 'none',
//     '&:hover': { borderColor: themeColors.primary }
//   }),
//   option: (p, s) => ({
//     ...p,
//     backgroundColor: s.isSelected ? themeColors.primary : s.isFocused ? '#e6f4f1' : null,
//     color: s.isSelected ? 'white' : themeColors.textPrimary
//   })
// };

// const GstPayablesModal = ({ onClose, createdBy }) => {
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
//     const load = async () => {
//       try {
//         const [bankRes, compRes] = await Promise.all([
//           axios.get(`${API_BASE_URL}/finance/bank-masters`),
//           axios.get(`${API_BASE_URL}/finance/gst-companies`)
//         ]);

//         const bankOpts = [
//           { value: null, label: 'All Banks' },
//           ...bankRes.data.data.map(b => ({
//             value: b.id,
//             label: `${b.bank_name} (₹${parseFloat(b.available_balance).toLocaleString('en-IN')})`
//           }))
//         ];
//         setBanks(bankOpts);

//         const compOpts = compRes.data.data.map(c => ({ value: c.id, label: c.company_name }));
//         setCompanies(compOpts);
//       } catch (err) {
//         toast.error('Failed to load data');
//       }
//     };
//     load();
//   }, []);

//   const loadData = async () => {
//     if (!selectedBank?.value) {
//       setList([]);
//       return;
//     }
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

//   useEffect(() => {
//     loadData();
//   }, [selectedBank]);

//   const handleCreateCompany = async (inputValue) => {
//     try {
//       const res = await axios.post(`${API_BASE_URL}/finance/create-gst-company`, {
//         company_name: inputValue.trim(),
//         created_by: createdBy
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
//         created_by: createdBy,
//         updated_by: createdBy
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
//         updated_by: createdBy,
//         change_reason: 'Edited from GST UI'
//       });
//       toast.success('Updated!');
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
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
//       <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
//         {/* Header */}
//         <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//               <DollarSign className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold">GST Payable Management</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={28} /></button>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[80vh]">
//           {/* Bank Selector + Add */}
//           <div className="flex justify-between items-center mb-6">
//             <div className="min-w-96">
//               <label className="block text-sm font-semibold mb-2">Bank Account</label>
//               <Select options={banks} value={selectedBank} onChange={setSelectedBank} placeholder="Select Bank First" styles={customStyles} />
//             </div>
//             <button onClick={() => setShowForm(true)} disabled={!selectedBank?.value}
//               className="flex items-center gap-3 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
//               <Plus size={20} /> Add GST Entry
//             </button>
//           </div>

//           {/* Search */}
//           {selectedBank && (
//             <div className="mb-6 relative max-w-md">
//               <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
//               <input type="text" placeholder="Search company, month, type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
//                 className="pl-12 pr-4 py-3 border rounded-lg w-full" style={{ borderColor: themeColors.border }} />
//             </div>
//           )}

//           {/* Table */}
//           <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
//             {loading ? (
//               <div className="p-20 text-center">Loading...</div>
//             ) : !selectedBank ? (
//               <div className="p-16 text-center text-gray-500">Please select a bank</div>
//             ) : list.length === 0 ? (
//               <div className="p-16 text-center text-gray-500">No GST records found</div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead style={{ backgroundColor: themeColors.lightBg }}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Company</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Month</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Type</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bank</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Input (ITC)</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Output</th>
//                       <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredList.map(item => {
//                       const isEditing = editingId === item.id;
//                       return (
//                         <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
//                           <td className="px-6 py-4 font-medium">{item.company_name}</td>
//                           <td className="px-6 py-4">{item.month}</td>
//                           <td className="px-6 py-4">
//                             <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.entry_type_name === 'Purchase' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
//                               {item.entry_type_name}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 text-teal-700 font-medium">
//                             {isEditing ? (
//                               <Select options={banks.filter(b => b.value !== null)} value={banks.find(b => b.value === editData.finance_bank_id)}
//                                 onChange={opt => setEditData(prev => ({ ...prev, finance_bank_id: opt?.value }))} styles={customStyles} />
//                             ) : item.bank_name}
//                           </td>
//                           <td className="px-6 py-4 text-right font-mono">
//                             {isEditing ? (
//                               <input type="number" step="0.01" value={editData.input_amount || ''} onChange={e => setEditData(prev => ({ ...prev, input_amount: e.target.value }))}
//                                 className="w-32 text-right px-2 py-1 border rounded" style={{ borderColor: themeColors.border }} />
//                             ) : <span className="text-green-700">{formatINR(item.input_amount)}</span>}
//                           </td>
//                           <td className="px-6 py-4 text-right font-mono">
//                             {isEditing ? (
//                               <input type="number" step="0.01" value={editData.output_amount || ''} onChange={e => setEditData(prev => ({ ...prev, output_amount: e.target.value }))}
//                                 className="w-32 text-right px-2 py-1 border rounded" style={{ borderColor: themeColors.border }} />
//                             ) : <span className="text-red-700">{formatINR(item.output_amount)}</span>}
//                           </td>
//                           <td className="px-6 py-4 text-center">
//                             {isEditing ? (
//                               <div className="flex justify-center gap-2">
//                                 <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-700"><Check size={16} /></button>
//                                 <button onClick={cancelEdit} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"><X size={16} /></button>
//                               </div>
//                             ) : (
//                               <button onClick={() => startEdit(item)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Edit size={16} /></button>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}

//                     {list.length > 1 && (
//                       <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
//                         <td colSpan={4} className="px-6 py-5 text-left text-lg">TOTAL</td>
//                         <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_input_amount)}</td>
//                         <td className="px-6 py-5 text-right text-lg font-mono text-red-700">{formatINR(overall.overall_output_amount)}</td>
//                         <td></td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Add Form Modal */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowForm(false)}>
//             <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold">Add GST Entry</h2>
//                 <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
//               </div>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-semibold mb-2">Company *</label>
//                   <CreatableSelect isClearable options={companies} value={form.company} onChange={opt => setForm(prev => ({ ...prev, company: opt }))}
//                     onCreateOption={handleCreateCompany} placeholder="Search or add company..." formatCreateLabel={input => `Add "${input}"`} styles={customStyles} />
//                 </div>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Month *</label>
//                     <input type="month" required value={form.month} onChange={e => setForm(prev => ({ ...prev, month: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Entry Type *</label>
//                     <select required value={form.entry_type_id} onChange={e => setForm(prev => ({ ...prev, entry_type_id: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }}>
//                       <option value="">Select Type</option>
//                       <option value="1">Purchase</option>
//                       <option value="2">Sales</option>
//                     </select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div>
//                     <label className="flex items-center gap-2 text-sm font-semibold mb-2"><FileInput className="text-green-600" /> Input Amount (ITC)</label>
//                     <input type="number" step="0.01" value={form.input_amount} onChange={e => setForm(prev => ({ ...prev, input_amount: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </div>
//                   <div>
//                     <label className="flex items-center gap-2 text-sm font-semibold mb-2"><FileOutput className="text-amber-600" /> Output Amount</label>
//                     <input type="number" step="0.01" value={form.output_amount} onChange={e => setForm(prev => ({ ...prev, output_amount: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </div>
//                 </div>
//                 <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: themeColors.border }}>
//                   <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border }}>Cancel</button>
//                   <button type="submit" className="px-8 py-3 text-white rounded-lg font-medium" style={{ backgroundColor: themeColors.primary }}>Save GST Entry</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default GstPayablesModal;















// components/FinanceComponents/CommonPaymentEntry/GstPayablesModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { DollarSign, Plus, Building2, Calendar, FileInput, FileOutput, Search, Edit, Check, X } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
};

const customStyles = {
  control: (p) => ({
    ...p,
    minHeight: '40px',
    borderColor: themeColors.border,
    borderRadius: '0.5rem',
    boxShadow: 'none',
    '&:hover': { borderColor: themeColors.primary }
  }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected ? themeColors.primary : s.isFocused ? '#e6f4f1' : null,
    color: s.isSelected ? 'white' : themeColors.textPrimary
  })
};

const GstPayablesModal = ({ onClose, createdBy }) => {
  const [list, setList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
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

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  useEffect(() => {
    const load = async () => {
      try {
        const [bankRes, compRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/bank-masters`),
          axios.get(`${API_BASE_URL}/finance/gst-companies`)
        ]);

        const bankOpts = [
          { value: null, label: 'All Banks' },
          ...bankRes.data.data.map(b => ({
            value: b.id,
            label: `${b.bank_name} (₹${parseFloat(b.available_balance).toLocaleString('en-IN')})`
          }))
        ];
        setBanks(bankOpts);

        const compOpts = compRes.data.data.map(c => ({ value: c.id, label: c.company_name }));
        setCompanies(compOpts);
      } catch (err) {
        toast.error('Failed to load data');
      }
    };
    load();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const bankId = selectedBank?.value || ''; // empty for all banks
      const res = await axios.get(`${API_BASE_URL}/finance/gst-payables?finance_bank_id=${bankId}`);
      setList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load GST records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBank]);

  const uniqueMonths = useMemo(() => {
    const fullList = list.slice(1);
    const months = [...new Set(fullList.map(item => item.month))].filter(Boolean).sort();
    return months.map(m => ({ value: m, label: m }));
  }, [list]);

  const fullList = useMemo(() => list.slice(1), [list]);

  const filteredList = useMemo(() => {
    return fullList.filter(item =>
      (selectedMonth === 'All' || item.month === selectedMonth) &&
      (
        item.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.month?.includes(searchTerm) ||
        item.entry_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [fullList, searchTerm, selectedMonth]);

  const monthlySummary = useMemo(() => {
    const summary = {};
    fullList.forEach(item => {
      const m = item.month;
      if (!summary[m]) {
        summary[m] = { input: 0, output: 0 };
      }
      summary[m].input += parseFloat(item.input_amount) || 0;
      summary[m].output += parseFloat(item.output_amount) || 0;
    });
    return Object.entries(summary)
      .map(([month, data]) => {
        const net = data.input - data.output;
        const receivable = net > 0 ? net : 0;
        const payable = net < 0 ? -net : 0;
        return {
          month,
          payable: formatINR(payable),
          receivable: formatINR(receivable)
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [fullList]);

  const handleCreateCompany = async (inputValue) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/finance/create-gst-company`, {
        company_name: inputValue.trim(),
        created_by: createdBy
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

    try {
      await axios.post(`${API_BASE_URL}/finance/create-gst-payable`, {
        finance_gst_company_id: form.company.value,
        month: form.month,
        entry_type_id: parseInt(form.entry_type_id),
        input_amount: parseFloat(form.input_amount) || 0,
        output_amount: parseFloat(form.output_amount) || 0,
        finance_bank_id: selectedBank.value,
        created_by: createdBy,
        updated_by: createdBy
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
    try {
      await axios.put(`${API_BASE_URL}/finance/update-gst-payable/${editingId}`, {
        input_amount: parseFloat(editData.input_amount) || 0,
        output_amount: parseFloat(editData.output_amount) || 0,
        finance_bank_id: editData.finance_bank_id || null,
        updated_by: createdBy,
        change_reason: 'Edited from GST UI'
      });
      toast.success('Updated!');
      cancelEdit();
      loadData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const overall = list.length > 0 ? list[0] : {};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">GST Payable Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={28} /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Bank Selector + Add */}
          <div className="flex justify-between items-center mb-6">
            <div className="min-w-96">
              <label className="block text-sm font-semibold mb-2">Bank Account</label>
              <Select options={banks} value={selectedBank} onChange={setSelectedBank} placeholder="Select Bank First" styles={customStyles} />
            </div>
            <button onClick={() => setShowForm(true)} disabled={!selectedBank?.value}
              className="flex items-center gap-3 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              <Plus size={20} /> Add GST Entry
            </button>
          </div>

          {/* Search & Month Filter */}
          {selectedBank && (
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" placeholder="Search company, month, type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border rounded-lg w-full" style={{ borderColor: themeColors.border }} />
              </div>
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium mb-2">Month Filter</label>
                <Select
                  options={[{ value: 'All', label: 'All Months' }, ...uniqueMonths]}
                  value={selectedMonth === 'All' ? { value: 'All', label: 'All Months' } : { value: selectedMonth, label: selectedMonth }}
                  onChange={opt => setSelectedMonth(opt?.value || 'All')}
                  styles={customStyles}
                  placeholder="Filter by Month"
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
            {loading ? (
              <div className="p-20 text-center">Loading...</div>
            ) : !selectedBank ? (
              <div className="p-16 text-center text-gray-500">Please select a bank</div>
            ) : list.length === 0 ? (
              <div className="p-16 text-center text-gray-500">No GST records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: themeColors.lightBg }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Company</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Month</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bank</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Input (ITC)</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Output</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map(item => {
                      const isEditing = editingId === item.id;
                      return (
                        <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 font-medium">{item.company_name}</td>
                          <td className="px-6 py-4">{item.month}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.entry_type_name === 'Purchase' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                              {item.entry_type_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-teal-700 font-medium">
                            {isEditing ? (
                              <Select options={banks.filter(b => b.value !== null)} value={banks.find(b => b.value === editData.finance_bank_id)}
                                onChange={opt => setEditData(prev => ({ ...prev, finance_bank_id: opt?.value }))} styles={customStyles} />
                            ) : item.bank_name}
                          </td>
                          <td className="px-6 py-4 text-right font-mono">
                            {isEditing ? (
                              <input type="number" step="0.01" value={editData.input_amount || ''} onChange={e => setEditData(prev => ({ ...prev, input_amount: e.target.value }))}
                                className="w-32 text-right px-2 py-1 border rounded" style={{ borderColor: themeColors.border }} />
                            ) : <span className="text-green-700">{formatINR(item.input_amount)}</span>}
                          </td>
                          <td className="px-6 py-4 text-right font-mono">
                            {isEditing ? (
                              <input type="number" step="0.01" value={editData.output_amount || ''} onChange={e => setEditData(prev => ({ ...prev, output_amount: e.target.value }))}
                                className="w-32 text-right px-2 py-1 border rounded" style={{ borderColor: themeColors.border }} />
                            ) : <span className="text-red-700">{formatINR(item.output_amount)}</span>}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isEditing ? (
                              <div className="flex justify-center gap-2">
                                <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-700"><Check size={16} /></button>
                                <button onClick={cancelEdit} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"><X size={16} /></button>
                              </div>
                            ) : (
                              <button onClick={() => startEdit(item)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"><Edit size={16} /></button>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {list.length > 1 && (
                      <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
                        <td colSpan={4} className="px-6 py-5 text-left text-lg">TOTAL</td>
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

          {/* Monthly Payable & Receivable Summary Table */}
          {selectedBank && list.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Monthly Payable & Receivable Summary
              </h3>
              <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: themeColors.lightBg }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Month</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Payable</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Receivable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySummary.map(row => (
                        <tr key={row.month} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{row.month}</td>
                          <td className="px-4 py-3 text-right font-mono text-red-600">{row.payable}</td>
                          <td className="px-4 py-3 text-right font-mono text-green-600">{row.receivable}</td>
                        </tr>
                      ))}
                      {monthlySummary.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-center text-gray-500">No monthly data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add GST Entry</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Company *</label>
                  <CreatableSelect isClearable options={companies} value={form.company} onChange={opt => setForm(prev => ({ ...prev, company: opt }))}
                    onCreateOption={handleCreateCompany} placeholder="Search or add company..." formatCreateLabel={input => `Add "${input}"`} styles={customStyles} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Month *</label>
                    <input type="month" required value={form.month} onChange={e => setForm(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Entry Type *</label>
                    <select required value={form.entry_type_id} onChange={e => setForm(prev => ({ ...prev, entry_type_id: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }}>
                      <option value="">Select Type</option>
                      <option value="1">Purchase</option>
                      <option value="2">Sales</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2"><FileInput className="text-green-600" /> Input Amount (ITC)</label>
                    <input type="number" step="0.01" value={form.input_amount} onChange={e => setForm(prev => ({ ...prev, input_amount: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-2"><FileOutput className="text-amber-600" /> Output Amount</label>
                    <input type="number" step="0.01" value={form.output_amount} onChange={e => setForm(prev => ({ ...prev, output_amount: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: themeColors.border }}>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border }}>Cancel</button>
                  <button type="submit" className="px-8 py-3 text-white rounded-lg font-medium" style={{ backgroundColor: themeColors.primary }}>Save GST Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GstPayablesModal;
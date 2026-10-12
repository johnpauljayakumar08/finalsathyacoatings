import { API_BASE_URL } from "../../../config/api.js";
// // components/FinanceComponents/CommonPaymentEntry/TdsPayablesModal.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import Select from 'react-select';
// import { ScrollText, Plus, Edit, Check, X, Search } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
// };

// const customSelectStyles = {
//   control: (p) => ({
//     ...p,
//     minHeight: '48px',
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

// const TdsPayablesModal = ({ onClose, createdBy }) => {
//   const [projects, setProjects] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [pdId, setPdId] = useState('');
//   const [selectedBank, setSelectedBank] = useState(null);
//   const [list, setList] = useState([]);
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
//     const load = async () => {
//       try {
//         const [projRes, bankRes] = await Promise.all([
//           axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
//           axios.get(`${API_BASE_URL}/finance/bank-masters`)
//         ]);

//         const allProjects = projRes.data.data
//           .flatMap(c => c.projects || [])
//           .map(p => ({ pd_id: p.pd_id, project_name: p.project_name }))
//           .filter(p => p.pd_id);
//         setProjects(allProjects);

//         const bankOpts = [
//           { value: null, label: 'All Banks' },
//           ...bankRes.data.data.map(b => ({
//             value: b.id,
//             label: `${b.bank_name} (Bal: ₹${parseFloat(b.available_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
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
//     if (!pdId) {
//       setList([]);
//       return;
//     }
//     setLoading(true);
//     try {
//       let url = `${API_BASE_URL}/finance/tds-payables?pd_id=${pdId}`;
//       if (selectedBank?.value) url += `&finance_bank_id=${selectedBank.value}`;
//       const res = await axios.get(url);
//       setList(res.data.data || []);
//     } catch (err) {
//       toast.error('Failed to load TDS records');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (pdId) loadData();
//   }, [pdId, selectedBank]);

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     if (!form.month || !form.payable || !selectedBank?.value) {
//       toast.error('Month, Payable, and Bank are required');
//       return;
//     }

//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-tds-payable`, {
//         ...form,
//         pd_id: pdId,
//         finance_bank_id: selectedBank.value,
//         created_by: createdBy
//       });
//       toast.success('TDS record created!');
//       setShowForm(false);
//       setForm({ month: '', payable: '', returnable: '', non_returnable: '' });
//       loadData();
//     } catch (err) {
//       toast.error('Failed to create');
//     }
//   };

//   const startEdit = (item) => {
//     setEditingId(item.id);
//     setEditData({
//       payable: item.payable || '',
//       returnable: item.returnable || '',
//       non_returnable: item.non_returnable || '',
//       finance_bank_id: item.finance_bank_id
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
//         updated_by: createdBy
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
//     item.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     item.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
//       <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
//         {/* Header */}
//         <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//               <ScrollText className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold">TDS Payables Management</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={28} /></button>
//         </div>

//         <div className="p-6 overflow-y-auto max-h-[80vh]">
//           {/* Filters */}
//           <div className="bg-gray-50 rounded-lg p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Project</label>
//                 <select value={pdId} onChange={e => { setPdId(e.target.value); setSelectedBank(null); }}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
//                   <option value="">Select Project</option>
//                   {projects.map(p => <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Bank Account</label>
//                 <Select options={banks} value={selectedBank} onChange={setSelectedBank}
//                   placeholder="All Banks" isSearchable styles={customSelectStyles} />
//               </div>
//             </div>
//           </div>

//           {/* Search + Add */}
//           {pdId && (
//             <div className="flex justify-between items-center mb-6">
//               <div className="relative max-w-md">
//                 <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
//                 <input type="text" placeholder="Search month or bank..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
//                   className="pl-12 pr-4 py-3 border rounded-lg w-full" style={{ borderColor: themeColors.border }} />
//               </div>
//               <button onClick={() => setShowForm(true)} disabled={!selectedBank?.value}
//                 className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
//                 <Plus size={20} /> Create New Record
//               </button>
//             </div>
//           )}

//           {/* Table */}
//           <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
//             {loading ? (
//               <div className="p-20 text-center">Loading...</div>
//             ) : list.length === 0 ? (
//               <div className="p-12 text-center text-gray-500">Select Project to view records</div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead style={{ backgroundColor: themeColors.lightBg }}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Month</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bank</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Payable</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Returnable</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Non-Returnable</th>
//                       <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredList.map(item => {
//                       const isEditing = editingId === item.id;
//                       return (
//                         <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
//                           <td className="px-6 py-4 font-medium">{item.month}</td>
//                           <td className="px-6 py-4 text-teal-700 font-medium">
//                             {isEditing ? (
//                               <Select options={banks.filter(b => b.value)} value={banks.find(b => b.value === editData.finance_bank_id)}
//                                 onChange={opt => setEditData(prev => ({ ...prev, finance_bank_id: opt?.value }))} styles={customSelectStyles} />
//                             ) : item.bank_name}
//                           </td>
//                           <td className="px-6 py-4 text-right font-mono">
//                             {isEditing ? (
//                               <input type="number" step="0.01" value={editData.payable || ''} onChange={e => setEditData(prev => ({ ...prev, payable: e.target.value }))}
//                                 className="w-40 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} />
//                             ) : formatINR(item.payable)}
//                           </td>
//                           <td className="px-6 py-4 text-right font-mono text-green-700">
//                             {isEditing ? (
//                               <input type="number" step="0.01" value={editData.returnable || ''} onChange={e => setEditData(prev => ({ ...prev, returnable: e.target.value }))}
//                                 className="w-40 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} />
//                             ) : formatINR(item.returnable)}
//                           </td>
//                           <td className="px-6 py-4 text-right font-mono text-red-700">
//                             {isEditing ? (
//                               <input type="number" step="0.01" value={editData.non_returnable || ''} onChange={e => setEditData(prev => ({ ...prev, non_returnable: e.target.value }))}
//                                 className="w-40 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} />
//                             ) : formatINR(item.non_returnable)}
//                           </td>
//                           <td className="px-6 py-4 text-center">
//                             {isEditing ? (
//                               <div className="flex justify-center gap-2">
//                                 <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-700"><Check size={16} /></button>
//                                 <button onClick={cancelEdit} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"><X size={16} /></button>
//                               </div>
//                             ) : (
//                               <button onClick={() => startEdit(item)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//                                 <Edit size={16} />
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}

//                     {list.length > 1 && (
//                       <tr className="bg-teal-50 font-bold" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
//                         <td colSpan={2} className="px-6 py-5 text-left text-lg">TOTAL</td>
//                         <td className="px-6 py-5 text-right text-lg font-mono">{formatINR(overall.overall_payable)}</td>
//                         <td className="px-6 py-5 text-right text-lg font-mono text-green-700">{formatINR(overall.overall_returnable)}</td>
//                         <td className="px-6 py-5 text-right text-lg font-mono text-red-700">{formatINR(overall.overall_non_returnable)}</td>
//                         <td></td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Add Form */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowForm(false)}>
//             <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold">Add New TDS Record</h2>
//                 <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
//               </div>
//               <form onSubmit={handleCreate} className="space-y-6">
//                 <div>
//                   <label className="block text-sm font-semibold mb-2">Month *</label>
//                   <input type="text" required placeholder="e.g. November 2025" value={form.month} onChange={e => setForm(prev => ({ ...prev, month: e.target.value }))}
//                     className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold mb-2">Payable *</label>
//                   <input type="number" step="0.01" required value={form.payable} onChange={e => setForm(prev => ({ ...prev, payable: e.target.value }))}
//                     className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold mb-2">Returnable</label>
//                   <input type="number" step="0.01" value={form.returnable} onChange={e => setForm(prev => ({ ...prev, returnable: e.target.value }))}
//                     className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-semibold mb-2">Non-Returnable</label>
//                   <input type="number" step="0.01" value={form.non_returnable} onChange={e => setForm(prev => ({ ...prev, non_returnable: e.target.value }))}
//                     className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                 </div>
//                 <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: themeColors.border }}>
//                   <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border }}>Cancel</button>
//                   <button type="submit" className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">Save Record</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TdsPayablesModal;






// components/FinanceComponents/CommonPaymentEntry/TdsPayablesModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { ScrollText, Plus, Edit, Check, X, Search } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
};

const customSelectStyles = {
  control: (p) => ({
    ...p,
    minHeight: '48px',
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

const TdsPayablesModal = ({ onClose, createdBy }) => {
  const [projects, setProjects] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [list, setList] = useState([]);
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
    const load = async () => {
      try {
        const [projRes, bankRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
          axios.get(`${API_BASE_URL}/finance/bank-masters`)
        ]);

        const allProjects = projRes.data.data
          .flatMap(c => c.projects || [])
          .map(p => ({ pd_id: p.pd_id, project_name: p.project_name }))
          .filter(p => p.pd_id);
        setProjects(allProjects);

        const bankOpts = [
          { value: null, label: 'All Banks' },
          ...bankRes.data.data.map(b => ({
            value: b.id,
            label: `${b.bank_name} (Bal: ₹${parseFloat(b.available_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
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
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/finance/tds-payables`;
      if (selectedBank?.value) url += `&finance_bank_id=${selectedBank.value}`;
      const res = await axios.get(url);
      setList(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load TDS records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBank]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.month || !form.payable || !selectedBank?.value) {
      toast.error('Month, Payable, and Bank are required');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/finance/create-tds-payable`, {
        ...form,
        pd_id: null,
        finance_bank_id: selectedBank.value,
        created_by: createdBy
      });
      toast.success('TDS record created!');
      setShowForm(false);
      setForm({ month: '', payable: '', returnable: '', non_returnable: '' });
      loadData();
    } catch (err) {
      toast.error('Failed to create');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData({
      payable: item.payable || '',
      returnable: item.returnable || '',
      non_returnable: item.non_returnable || '',
      finance_bank_id: item.finance_bank_id
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/finance/update-tds-payable/${editingId}`, {
        ...editData,
        updated_by: createdBy
      });
      toast.success('Updated!');
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <ScrollText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">TDS Payables Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X size={28} /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Bank Account</label>
                <Select options={banks} value={selectedBank} onChange={setSelectedBank}
                  placeholder="All Banks" isSearchable styles={customSelectStyles} />
              </div>
            </div>
          </div>

          {/* Search + Add */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input type="text" placeholder="Search month or bank..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border rounded-lg w-full" style={{ borderColor: themeColors.border }} />
            </div>
            <button onClick={() => setShowForm(true)} disabled={!selectedBank?.value}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              <Plus size={20} /> Create New Record
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: themeColors.border }}>
            {loading ? (
              <div className="p-20 text-center">Loading...</div>
            ) : list.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Select Bank to view records</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: themeColors.lightBg }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Month</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Bank</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Payable</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Returnable</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Non-Returnable</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map(item => {
                      const isEditing = editingId === item.id;
                      return (
                        <tr key={item.id} className={isEditing ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 font-medium">{item.month}</td>
                          <td className="px-6 py-4 text-teal-700 font-medium">
                            {isEditing ? (
                              <Select options={banks.filter(b => b.value)} value={banks.find(b => b.value === editData.finance_bank_id)}
                                onChange={opt => setEditData(prev => ({ ...prev, finance_bank_id: opt?.value }))} styles={customSelectStyles} />
                            ) : item.bank_name}
                          </td>
                          <td className="px-6 py-4 text-right font-mono">
                            {isEditing ? (
                              <input type="number" step="0.01" value={editData.payable || ''} onChange={e => setEditData(prev => ({ ...prev, payable: e.target.value }))}
                                className="w-40 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} />
                            ) : formatINR(item.payable)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-green-700">
                            {isEditing ? (
                              <input type="number" step="0.01" value={editData.returnable || ''} onChange={e => setEditData(prev => ({ ...prev, returnable: e.target.value }))}
                                className="w-40 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} />
                            ) : formatINR(item.returnable)}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-red-700">
                            {isEditing ? (
                              <input type="number" step="0.01" value={editData.non_returnable || ''} onChange={e => setEditData(prev => ({ ...prev, non_returnable: e.target.value }))}
                                className="w-40 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} />
                            ) : formatINR(item.non_returnable)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {isEditing ? (
                              <div className="flex justify-center gap-2">
                                <button onClick={saveEdit} className="p-2 bg-green-600 text-white rounded hover:bg-green-700"><Check size={16} /></button>
                                <button onClick={cancelEdit} className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"><X size={16} /></button>
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
                        <td colSpan={2} className="px-6 py-5 text-left text-lg">TOTAL</td>
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

        {/* Add Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Add New TDS Record</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={28} /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Month *</label>
                  <input type="text" required placeholder="e.g. November 2025" value={form.month} onChange={e => setForm(prev => ({ ...prev, month: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Payable *</label>
                  <input type="number" step="0.01" required value={form.payable} onChange={e => setForm(prev => ({ ...prev, payable: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Returnable</label>
                  <input type="number" step="0.01" value={form.returnable} onChange={e => setForm(prev => ({ ...prev, returnable: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Non-Returnable</label>
                  <input type="number" step="0.01" value={form.non_returnable} onChange={e => setForm(prev => ({ ...prev, non_returnable: e.target.value }))}
                    className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: themeColors.border }}>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border rounded-lg font-medium" style={{ borderColor: themeColors.border }}>Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">Save Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TdsPayablesModal;
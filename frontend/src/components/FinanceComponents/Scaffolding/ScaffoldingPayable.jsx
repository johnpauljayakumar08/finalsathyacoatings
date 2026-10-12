import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import { Wrench, Building2, Plus, Edit, Check, X, Search, Calendar, DollarSign, Users } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const ScaffoldingPayable = () => {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [creditorsClients, setCreditorsClients] = useState([]);
//   const [costCategories, setCostCategories] = useState([]);
//   const [entries, setEntries] = useState([]);
//   const [editingId, setEditingId] = useState(null); // null, number, or 'new'
//   const [tempData, setTempData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const fetchCompanies = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/finance/companies-with-projects`);
//       const { status, data } = await res.json();
//       if (status === 'success') {
//         setCompanies(data);
//         if (data.length > 0 && !selectedCompany) {
//           setSelectedCompany(data[0].company_id);
//         }
//       }
//     } catch (err) {
//       setError('Failed to load companies');
//     }
//   };

//   const fetchCreditorsClients = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/finance/view-creditors-client`);
//       const { status, data } = await res.json();
//       if (status === 'success') {
//         setCreditorsClients(data.map(c => ({ value: c.id, label: c.client_name })));
//       }
//     } catch (err) {
//       setError('Failed to load clients');
//     }
//   };

//   const fetchCostCategories = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/finance/cost-categories`);
//       const { status, data } = await res.json();
//       if (status === 'success') {
//         setCostCategories(data.map(c => ({ value: c.id, label: c.category_name })));
//       }
//     } catch (err) {
//       setError('Failed to load categories');
//     }
//   };

//   const fetchEntries = async () => {
//     if (!selectedProject) {
//       setEntries([]);
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE_URL}/finance/scaffolding-payables?pd_id=${selectedProject}`);
//       const { status, data } = await res.json();
//       if (status === 'success') {
//         const individuals = data.filter(item => item.id !== undefined);
//         setEntries(individuals);
//       }
//     } catch (err) {
//       setError('Failed to load scaffolding entries');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (entry = null) => {
//     if (entry) {
//       setTempData({
//         client_id: creditorsClients.find(c => c.value === entry.finance_creditors_client_id) || null,
//         cost_category_id: costCategories.find(c => c.value === entry.cost_category_id) || null,
//         period: entry.period || '',
//         qty: entry.qty || '',
//         rate: entry.rate || '',
//         sale_amount: entry.sale_amount?.toString() || '',
//         total_payment_due: entry.total_payment_due?.toString() || '',
//         date_of_payment: entry.date_of_payment ? entry.date_of_payment.split('T')[0] : '',
//         paid_amount: entry.paid_amount?.toString() || ''
//       });
//       setEditingId(entry.id);
//     } else {
//       setTempData({
//         client_id: null,
//         cost_category_id: null,
//         period: '',
//         qty: '',
//         rate: '',
//         sale_amount: '',
//         total_payment_due: '',
//         date_of_payment: '',
//         paid_amount: ''
//       });
//       setEditingId('new');
//     }
//   };

//   const handleInputChange = (field, value) => {
//     setTempData(prev => ({ ...prev, [field]: value }));
//   };

//   const calculateBalance = () => {
//     const total = parseFloat(tempData.total_payment_due) || 0;
//     const paid = parseFloat(tempData.paid_amount) || 0;
//     return total - paid;
//   };

//   const handleSave = async () => {
//     if (!tempData.client_id || !tempData.cost_category_id || !tempData.date_of_payment) {
//       setError('Client, Category, and Date are required');
//       return;
//     }

//     const payload = {
//       finance_creditors_client_id: tempData.client_id.value,
//       pd_id: selectedProject,
//       cost_category_id: tempData.cost_category_id.value,
//       period: tempData.period,
//       qty: tempData.qty,
//       rate: tempData.rate,
//       sale_amount: parseFloat(tempData.sale_amount) || 0,
//       total_payment_due: parseFloat(tempData.total_payment_due) || 0,
//       date_of_payment: tempData.date_of_payment,
//       paid_amount: parseFloat(tempData.paid_amount) || 0
//     };

//     const isNew = editingId === 'new';
//     const url = isNew
//       ? `${API_BASE_URL}/finance/create-scaffolding-payable`
//       : `${API_BASE_URL}/finance/update-scaffolding-payable/${editingId}`;

//     try {
//       const res = await fetch(url, {
//         method: isNew ? 'POST' : 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });
//       const result = await res.json();
//       if (result.status === 'success') {
//         setEditingId(null);
//         setTempData({});
//         fetchEntries();
//       } else {
//         setError(result.message || 'Save failed');
//       }
//     } catch (err) {
//       setError('Network error');
//     }
//   };

//   const handleCancel = () => {
//     setEditingId(null);
//     setTempData({});
//   };

//   useEffect(() => {
//     fetchCompanies();
//     fetchCreditorsClients();
//     fetchCostCategories();
//   }, []);

//   useEffect(() => {
//     const comp = companies.find(c => c.company_id === selectedCompany);
//     if (comp?.projects?.length > 0 && !selectedProject) {
//       setSelectedProject(comp.projects[0].pd_id);
//     }
//   }, [selectedCompany, companies]);

//   useEffect(() => {
//     fetchEntries();
//   }, [selectedProject]);

//   const filteredEntries = entries.filter(e =>
//     e.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     e.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     e.period?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const currentCompany = companies.find(c => c.company_id === selectedCompany);

//   const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
//           <div className="flex items-center gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//               <Wrench className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
//                 Scaffolding Payables Management
//               </h1>
//               <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                 Track scaffolding expenses with clients
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>
//                 <Building2 size={16} className="inline mr-2" /> Company
//               </label>
//               <select
//                 value={selectedCompany}
//                 onChange={(e) => { setSelectedCompany(e.target.value); setSelectedProject(''); }}
//                 className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               >
//                 <option value="">Select Company</option>
//                 {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Project</label>
//               <select
//                 value={selectedProject}
//                 onChange={(e) => setSelectedProject(e.target.value)}
//                 disabled={!selectedCompany}
//                 className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 disabled:bg-gray-50"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               >
//                 <option value="">Select Project</option>
//                 {currentCompany?.projects?.map(p => <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>)}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Search & Add */}
//         {selectedProject && (
//           <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
//             <div className="relative flex-1 max-w-md">
//               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
//               <input
//                 type="text"
//                 placeholder="Search client, period..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               />
//             </div>

//             <button
//               onClick={() => startEdit()}
//               disabled={editingId !== null}
//               className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition"
//             >
//               <Plus size={20} />
//               Add New Entry
//             </button>
//           </div>
//         )}

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
//           {loading ? (
//             <div className="flex items-center justify-center h-96">
//               <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4"
//                    style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
//             </div>
//           ) : error ? (
//             <div className="p-12 text-center text-red-600">{error}</div>
//           ) : !selectedProject ? (
//             <div className="p-12 text-center text-gray-500">Please select a project</div>
//           ) : filteredEntries.length === 0 && editingId !== 'new' ? (
//             <div className="p-12 text-center text-gray-500">No scaffolding entries found</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead style={{ backgroundColor: themeColors.lightBg }}>
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Client</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Category</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Period</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Qty</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Rate</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Sale</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Due</th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Date</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Paid</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//                   {/* New Row 
//                   {editingId === 'new' && (
//                     <tr className="bg-emerald-50">
//                       <td className="px-6 py-4">
//                         <Select
//                           options={creditorsClients}
//                           value={tempData.client_id}
//                           onChange={(opt) => handleInputChange('client_id', opt)}
//                           placeholder="Client"
//                           className="text-sm"
//                           styles={{ control: base => ({ ...base, minHeight: 40 }) }}
//                         />
//                       </td>
//                       <td className="px-6 py-4">
//                         <Select
//                           options={costCategories}
//                           value={tempData.cost_category_id}
//                           onChange={(opt) => handleInputChange('cost_category_id', opt)}
//                           placeholder="Category"
//                           className="text-sm"
//                           styles={{ control: base => ({ ...base, minHeight: 40 }) }}
//                         />
//                       </td>
//                       <td className="px-6 py-4"><input type="text" value={tempData.period} onChange={(e) => handleInputChange('period', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4"><input type="text" value={tempData.qty} onChange={(e) => handleInputChange('qty', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4"><input type="text" value={tempData.rate} onChange={(e) => handleInputChange('rate', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4 text-right"><input type="number" step="0.01" value={tempData.sale_amount} onChange={(e) => handleInputChange('sale_amount', e.target.value)} className="w-24 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4 text-right"><input type="number" step="0.01" value={tempData.total_payment_due} onChange={(e) => handleInputChange('total_payment_due', e.target.value)} className="w-28 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4 text-center"><input type="date" value={tempData.date_of_payment} onChange={(e) => handleInputChange('date_of_payment', e.target.value)} className="px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} required /></td>
//                       <td className="px-6 py-4 text-right"><input type="number" step="0.01" value={tempData.paid_amount} onChange={(e) => handleInputChange('paid_amount', e.target.value)} className="w-24 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4 text-right font-medium text-green-600">{formatINR(calculateBalance())}</td>
//                       <td className="px-6 py-4 text-center">
//                         <div className="flex justify-center gap-3">
//                           <button onClick={handleSave} className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"><Check size={18} /></button>
//                           <button onClick={handleCancel} className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"><X size={18} /></button>
//                         </div>
//                       </td>
//                     </tr>
//                   )}

//                   {/* Existing Rows */}
//                   {filteredEntries.map(entry => {
//                     const isEdit = editingId === entry.id;
//                     return (
//                       <tr key={entry.id} className={isEdit ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
//                           {isEdit ? (
//                             <Select options={creditorsClients} value={tempData.client_id} onChange={opt => handleInputChange('client_id', opt)} className="text-sm" />
//                           ) : entry.client_name}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {isEdit ? (
//                             <Select options={costCategories} value={tempData.cost_category_id} onChange={opt => handleInputChange('cost_category_id', opt)} className="text-sm" />
//                           ) : entry.category_name}
//                         </td>
//                         <td className="px-6 py-4 text-sm">{isEdit ? <input type="text" value={tempData.period} onChange={e => handleInputChange('period', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /> : entry.period || '-'}</td>
//                         <td className="px-6 py-4 text-sm">{isEdit ? <input type="text" value={tempData.qty} onChange={e => handleInputChange('qty', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /> : entry.qty || '-'}</td>
//                         <td className="px-6 py-4 text-sm">{isEdit ? <input type="text" value={tempData.rate} onChange={e => handleInputChange('rate', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /> : entry.rate || '-'}</td>
//                         <td className="px-6 py-4 text-right font-mono">{formatINR(entry.sale_amount)}</td>
//                         <td className="px-6 py-4 text-right font-mono">{formatINR(entry.total_payment_due)}</td>
//                         <td className="px-6 py-4 text-center text-sm">{entry.date_of_payment ? new Date(entry.date_of_payment).toLocaleDateString('en-IN') : '-'}</td>
//                         <td className="px-6 py-4 text-right font-mono">{isEdit ? <input type="number" step="0.01" value={tempData.paid_amount} onChange={e => handleInputChange('paid_amount', e.target.value)} className="w-24 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /> : formatINR(entry.paid_amount)}</td>
//                         <td className="px-6 py-4 text-right font-medium" style={{ color: entry.balance_amount > 0 ? '#dc2626' : '#16a34a' }}>
//                           {formatINR(entry.balance_amount || 0)}
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           {isEdit ? (
//                             <div className="flex justify-center gap-3">
//                               <button onClick={handleSave} className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"><Check size={18} /></button>
//                               <button onClick={handleCancel} className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"><X size={18} /></button>
//                             </div>
//                           ) : (
//                             <button onClick={() => startEdit(entry)} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
//                               <Edit size={18} />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ScaffoldingPayable;








import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import { Wrench, Plus, Edit, Check, X, Search, Building2 } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

// Modal Component
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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
      gst: 0,
      total_payment_due: parseFloat(formData.total_payment_due) || (parseFloat(formData.sale_amount) || 0),
      date_of_payment: formData.date_of_payment,
      paid_amount: parseFloat(formData.paid_amount) || 0
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10" style={{ borderColor: themeColors.border }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
              {mode === 'add' ? 'Add New Entry' : 'Edit Entry'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
          <div className="flex items-center gap-3">
            <Building2 size={22} className="text-teal-700" />
            <div>
              <span className="text-sm text-gray-700">Bank:</span>
              <span className="ml-2 font-bold text-teal-800 text-lg">
                {selectedBank?.label || 'Not Selected'}
              </span>
            </div>
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
            <input type="text" value={formData.period} onChange={e => handleChange('period', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} placeholder="e.g. Jan 2025" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-red-600">Payment Date *</label>
            <input type="date" value={formData.date_of_payment} onChange={e => handleChange('date_of_payment', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Quantity</label>
            <input type="text" value={formData.qty} onChange={e => handleChange('qty', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Rate</label>
            <input type="text" value={formData.rate} onChange={e => handleChange('rate', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Sale Amount</label>
            <input type="number" step="0.01" value={formData.sale_amount} onChange={e => handleChange('sale_amount', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Total Due</label>
            <input type="number" step="0.01" value={formData.total_payment_due} onChange={e => handleChange('total_payment_due', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Paid Amount</label>
            <input type="number" step="0.01" value={formData.paid_amount} onChange={e => handleChange('paid_amount', e.target.value)} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold mb-3">Balance Due</label>
            <div className={`text-3xl font-bold text-center p-6 rounded-lg ${(parseFloat(formData.total_payment_due || 0) - parseFloat(formData.paid_amount || 0)) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              ₹{((parseFloat(formData.total_payment_due || 0) - parseFloat(formData.paid_amount || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 }))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-8 py-3 border rounded-lg font-medium hover:bg-gray-50" style={{ borderColor: themeColors.border }}>Cancel</button>
          <button onClick={handleSubmit} className="px-8 py-3 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg" style={{ backgroundColor: themeColors.primary }}>
            <Check size={20} /> {mode === 'add' ? 'Save Entry' : 'Update Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ScaffoldingPayable = () => {
  const { encodedUserId } = useParams(); // From URL: /scaffolding/NA==

  // Decode Base64 → Real User ID (NA== → 1)
  const currentUserId = useMemo(() => {
    if (!encodedUserId || encodedUserId === ':encodedUserId') return null;
    try {
      const decoded = atob(encodedUserId.trim());
      const id = parseInt(decoded, 10);
      return isNaN(id) ? null : id; // Return as number
    } catch (err) {
      console.error('Base64 decode failed:', err);
      return null;
    }
  }, [encodedUserId]);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankOptions, setBankOptions] = useState([]);
  const [creditorsClients, setCreditorsClients] = useState([]);
  const [costCategories, setCostCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentEntry, setCurrentEntry] = useState(null);

  // Fetch Functions
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/companies-with-projects`);
      const { status, data } = await res.json();
      if (status === 'success') setCompanies(data);
    } catch (err) { console.error('Failed to load companies'); }
  };

  const fetchCreditorsClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/view-creditors-client`);
      const { status, data } = await res.json();
      if (status === 'success') {
        setCreditorsClients(data.map(c => ({ value: c.id, label: c.client_name })));
      }
    } catch (err) { console.error('Failed to load clients'); }
  };

  const fetchCostCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/cost-categories`);
      const { status, data } = await res.json();
      if (status === 'success') {
        setCostCategories(data.map(c => ({ value: c.id, label: c.category_name })));
      }
    } catch (err) { console.error('Failed to load categories'); }
  };

  const fetchBanks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/bank-masters`);
      const { status, data } = await res.json();
      if (status === 'success') {
        setBankOptions(data.map(b => ({
          value: b.id,
          label: `${b.bank_name} (₹${Number(b.available_balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })})`
        })));
      }
    } catch (err) { console.error('Failed to load banks'); }
  };

  const fetchEntries = async () => {
    if (!selectedProject || !selectedBank) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/finance/scaffolding-payables?pd_id=${selectedProject}&finance_bank_id=${selectedBank.value}`);
      const { status, data } = await res.json();
      if (status === 'success') {
        const [, ...rows] = data || [];
        setEntries(rows);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Save Entry – Sends correct created_by / updated_by
  const handleSaveEntry = async (payload) => {
    if (!currentUserId) {
      alert('Error: User not authenticated. Please login again.');
      return;
    }

    const isNew = modalMode === 'add';
    const url = isNew
      ? `${API_BASE_URL}/finance/create-scaffolding-payable`
      : `${API_BASE_URL}/finance/update-scaffolding-payable/${currentEntry.id}`;

    const body = {
      ...payload,
      pd_id: selectedProject,
      finance_bank_id: selectedBank?.value || null,
      [isNew ? 'created_by' : 'updated_by']: currentUserId  // Correct field sent
    };

    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await res.json();

      if (result.status === 'success') {
        alert('Saved successfully!');
        setModalOpen(false);
        fetchEntries();
      } else {
        alert(result.message || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  const openAddModal = () => { setModalMode('add'); setCurrentEntry(null); setModalOpen(true); };
  const openEditModal = (entry) => { setModalMode('edit'); setCurrentEntry(entry); setModalOpen(true); };

  // Load initial data
  useEffect(() => {
    fetchCompanies();
    fetchCreditorsClients();
    fetchCostCategories();
    fetchBanks();
  }, []);

  useEffect(() => {
    const comp = companies.find(c => c.company_id === selectedCompany);
    if (comp?.projects?.length > 0 && !selectedProject) {
      setSelectedProject(comp.projects[0].pd_id);
    }
  }, [selectedCompany, companies]);

  useEffect(() => {
    if (selectedProject && selectedBank) fetchEntries();
  }, [selectedProject, selectedBank]);

  const filteredEntries = entries.filter(e =>
    [e.client_name, e.category_name, e.period, e.bank_name].some(field =>
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: themeColors.textPrimary }}>Scaffolding Payables</h1>
              <p className="text-gray-600">Logged in User ID: <strong>{currentUserId || 'Loading...'}</strong></p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Company</label>
              <select value={selectedCompany} onChange={e => { setSelectedCompany(e.target.value); setSelectedProject(''); setSelectedBank(null); }} className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: themeColors.border }}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Project</label>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} disabled={!selectedCompany} className="w-full px-4 py-3 border rounded-lg disabled:bg-gray-100" style={{ borderColor: themeColors.border }}>
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

        {/* Main Content */}
        {selectedProject && selectedBank ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-3 border rounded-lg w-80" style={{ borderColor: themeColors.border }} />
              </div>
              <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
                <Plus /> Add Entry
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
              {loading ? (
                <div className="p-20 text-center">Loading...</div>
              ) : filteredEntries.length === 0 ? (
                <div className="p-20 text-center text-gray-500">No entries found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
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
                      {filteredEntries.map(entry => (
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
                            <button onClick={() => openEditModal(entry)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
          </>
        ) : (
          <div className="bg-white rounded-xl shadow p-16 text-center text-gray-600">
            Please select Project and Bank to continue
          </div>
        )}
      </div>

      <EntryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        entry={currentEntry}
        onSave={handleSaveEntry}
        creditorsClients={creditorsClients}
        costCategories={costCategories}
        selectedBank={selectedBank}
        mode={modalMode}
      />
    </div>
  );
};

export default ScaffoldingPayable;
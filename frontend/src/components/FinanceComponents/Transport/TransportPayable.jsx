import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import { Truck, Building2, Plus, Edit, Check, X, Search, DollarSign, Calendar, FileText } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const TransportPayable = () => {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [costCategories, setCostCategories] = useState([]);
//   const [entries, setEntries] = useState([]);
//   const [editingId, setEditingId] = useState(null); // null, number (edit), or 'new'
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

//   const fetchCostCategories = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/finance/cost-categories`);
//       const { status, data } = await res.json();
//       if (status === 'success') {
//         setCostCategories(data.map(cat => ({ value: cat.id, label: cat.category_name })));
//       }
//     } catch (err) {
//       setError('Failed to load cost categories');
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
//       const res = await fetch(`${API_BASE_URL}/finance/transport-payables?pd_id=${selectedProject}`);
//       const { status, data } = await res.json();
//       if (status === 'success') {
//         const individuals = data.filter(item => item.id !== undefined);
//         setEntries(individuals);
//       }
//     } catch (err) {
//       setError('Failed to load transport entries');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (entry = null) => {
//     if (entry) {
//       setTempData({
//         cost_category_id: costCategories.find(c => c.value === entry.cost_category_id) || null,
//         dc_number: entry.dc_number || '',
//         item_name: entry.item_name || '',
//         description: entry.description || '',
//         sale_amount: entry.sale_amount?.toString() || '',
//         total_payment_due: entry.total_payment_due?.toString() || '',
//         date_of_payment: entry.date_of_payment ? entry.date_of_payment.split('T')[0] : '',
//         paid_amount: entry.paid_amount?.toString() || ''
//       });
//       setEditingId(entry.id);
//     } else {
//       setTempData({
//         cost_category_id: null,
//         dc_number: '',
//         item_name: '',
//         description: '',
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
//     if (!tempData.cost_category_id || !tempData.item_name || !tempData.date_of_payment) {
//       setError('Category, Item Name, and Date are required');
//       return;
//     }

//     const payload = {
//       pd_id: selectedProject,
//       cost_category_id: tempData.cost_category_id.value,
//       dc_number: tempData.dc_number,
//       item_name: tempData.item_name,
//       description: tempData.description,
//       sale_amount: parseFloat(tempData.sale_amount) || 0,
//       total_payment_due: parseFloat(tempData.total_payment_due) || 0,
//       date_of_payment: tempData.date_of_payment,
//       paid_amount: parseFloat(tempData.paid_amount) || 0
//     };

//     const isNew = editingId === 'new';
//     const url = isNew 
//       ? `${API_BASE_URL}/finance/create-transport-payable`
//       : `${API_BASE_URL}/finance/update-transport-payable/${editingId}`;

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
//     fetchCostCategories();
//   }, []);

//   useEffect(() => {
//     const company = companies.find(c => c.company_id === selectedCompany);
//     if (company?.projects?.length > 0 && !selectedProject) {
//       setSelectedProject(company.projects[0].pd_id);
//     }
//   }, [selectedCompany, companies]);

//   useEffect(() => {
//     fetchEntries();
//   }, [selectedProject]);

//   const filteredEntries = entries.filter(e =>
//     e.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     e.dc_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     e.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
//               <Truck className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
//                 Transport Payables Management
//               </h1>
//               <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                 Add, edit and track transport expenses
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

//         {/* Search & Add Button */}
//         {selectedProject && (
//           <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
//             <div className="relative flex-1 max-w-md">
//               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
//               <input
//                 type="text"
//                 placeholder="Search DC, item, category..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               />
//             </div>

//             <button
//               onClick={() => startEdit()}
//               disabled={editingId !== null}
//               className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
//             <div className="p-12 text-center text-gray-500">No transport entries found</div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead style={{ backgroundColor: themeColors.lightBg }}>
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Category</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>DC No.</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Item</th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Description</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Sale</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Due</th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Date</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Paid</th>
//                     <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//                   {/* New Entry Row */}
//                   {editingId === 'new' && (
//                     <tr className="bg-emerald-50">
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
//                       <td className="px-6 py-4"><input type="text" value={tempData.dc_number} onChange={e => handleInputChange('dc_number', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4"><input type="text" value={tempData.item_name} onChange={e => handleInputChange('item_name', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} required /></td>
//                       <td className="px-6 py-4"><input type="text" value={tempData.description} onChange={e => handleInputChange('description', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4 text-right"><input type="number" step="0.01" value={tempData.sale_amount} onChange={e => handleInputChange('sale_amount', e.target.value)} className="w-24 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4 text-right"><input type="number" step="0.01" value={tempData.total_payment_due} onChange={e => handleInputChange('total_payment_due', e.target.value)} className="w-28 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4 text-center"><input type="date" value={tempData.date_of_payment} onChange={e => handleInputChange('date_of_payment', e.target.value)} className="px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} required /></td>
//                       <td className="px-6 py-4 text-right"><input type="number" step="0.01" value={tempData.paid_amount} onChange={e => handleInputChange('paid_amount', e.target.value)} className="w-24 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /></td>
//                       <td className="px-6 py-4 text-right font-medium text-green-600">{formatINR(calculateBalance())}</td>
//                       <td className="px-6 py-4 text-center">
//                         <div className="flex justify-center gap-3">
//                           <button onClick={handleSave} className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"><Check size={18} /></button>
//                           <button onClick={handleCancel} className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"><X size={18} /></button>
//                         </div>
//                       </td>
//                     </tr>
//                   )}

//                   {/* Existing Entries */}
//                   {filteredEntries.map(entry => {
//                     const isEdit = editingId === entry.id;
//                     return (
//                       <tr key={entry.id} className={isEdit ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
//                         <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
//                           {isEdit ? (
//                             <Select options={costCategories} value={tempData.cost_category_id} onChange={opt => handleInputChange('cost_category_id', opt)} className="text-sm" />
//                           ) : entry.category_name}
//                         </td>
//                         <td className="px-6 py-4 text-sm">{isEdit ? <input type="text" value={tempData.dc_number} onChange={e => handleInputChange('dc_number', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /> : entry.dc_number || '-'}</td>
//                         <td className="px-6 py-4 text-sm font-medium">{isEdit ? <input type="text" value={tempData.item_name} onChange={e => handleInputChange('item_name', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /> : entry.item_name}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600">{isEdit ? <input type="text" value={tempData.description} onChange={e => handleInputChange('description', e.target.value)} className="w-full px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /> : entry.description || '-'}</td>
//                         <td className="px-6 py-4 text-right text-sm font-mono">{formatINR(entry.sale_amount)}</td>
//                         <td className="px-6 py-4 text-right text-sm font-mono">{formatINR(entry.total_payment_due)}</td>
//                         <td className="px-6 py-4 text-center text-sm">{entry.date_of_payment ? new Date(entry.date_of_payment).toLocaleDateString('en-IN') : '-'}</td>
//                         <td className="px-6 py-4 text-right text-sm font-mono">{isEdit ? <input type="number" step="0.01" value={tempData.paid_amount} onChange={e => handleInputChange('paid_amount', e.target.value)} className="w-24 text-right px-3 py-2 border rounded" style={{ borderColor: themeColors.border }} /> : formatINR(entry.paid_amount)}</td>
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

// export default TransportPayable;





import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Truck, Plus, Edit, X, Search, Check } from 'lucide-react';

// Decode current user from URL: /admin/finance/transport/NA== → "admin"
const getCurrentUser = () => {
  try {
    const match = window.location.pathname.match(/\/admin\/finance\/transport\/([^\/]+)/);
    return match && match[1] ? atob(match[1]) : 'unknown_user';
  } catch (e) {
    return 'unknown_user';
  }
};

const themeColors = {
  primary: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const TransportPayable = () => {
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [costCategories, setCostCategories] = useState([]);
  const [entries, setEntries] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    cost_category_id: null,
    dc_number: '',
    item_name: '',
    description: '',
    sale_amount: '',
    total_payment_due: '',
    date_of_payment: '',
    paid_amount: ''
  });

  const currentUser = getCurrentUser();

  // Fetch Data
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/companies-with-projects`);
      const { status, data } = await res.json();
      if (status === 'success') {
        setCompanies(data);
        if (data.length > 0 && !selectedCompany) setSelectedCompany(data[0].company_id);
      }
    } catch (err) {
      setError('Failed to load companies');
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/bank-masters`);
      const { status, data } = await res.json();
      if (status === 'success') {
        const options = data.map(bank => ({
          value: bank.id,
          label: `${bank.bank_name} (₹${Number(bank.available_balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })})`
        }));
        setBanks(options);
      }
    } catch (err) {
      setError('Failed to load banks');
    }
  };

  const fetchCostCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/cost-categories`);
      const { status, data } = await res.json();
      if (status === 'success') {
        setCostCategories(data.map(cat => ({ value: cat.id, label: cat.category_name })));
      }
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const fetchEntries = async () => {
    if (!selectedProject || !selectedBank) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/finance/transport-payables?pd_id=${selectedProject}&bank_id=${selectedBank}`);
      const { status, data } = await res.json();
      if (status === 'success') {
        setEntries(data.slice(1)); // skip summary row
      }
    } catch (err) {
      setError('Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchBanks();
    fetchCostCategories();
  }, []);

  useEffect(() => {
    const company = companies.find(c => c.company_id === selectedCompany);
    if (company?.projects?.length > 0 && !selectedProject) {
      setSelectedProject(company.projects[0].pd_id);
    }
  }, [selectedCompany, companies]);

  useEffect(() => {
    if (selectedProject && selectedBank) fetchEntries();
  }, [selectedProject, selectedBank]);

  const currentCompany = companies.find(c => c.company_id === selectedCompany);

  // Modal Functions
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      id: null,
      cost_category_id: null,
      dc_number: '',
      item_name: '',
      description: '',
      sale_amount: '',
      total_payment_due: '',
      date_of_payment: '',
      paid_amount: ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setModalMode('edit');
    setFormData({
      id: entry.id,
      cost_category_id: costCategories.find(c => c.value === entry.cost_category_id) || null,
      dc_number: entry.dc_number || '',
      item_name: entry.item_name || '',
      description: entry.description || '',
      sale_amount: entry.sale_amount?.toString() || '',
      total_payment_due: entry.total_payment_due?.toString() || '',
      date_of_payment: entry.date_of_payment ? entry.date_of_payment.split('T')[0] : '',
      paid_amount: entry.paid_amount?.toString() || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handleSave = async () => {
    if (!formData.cost_category_id || !formData.item_name || !formData.date_of_payment || !formData.total_payment_due) {
      setError('Category, Item Name, Total Payment Due, and Date are required');
      return;
    }

    const payload = {
      pd_id: selectedProject,
      finance_bank_id: selectedBank,
      cost_category_id: formData.cost_category_id.value,
      dc_number: formData.dc_number || null,
      item_name: formData.item_name,
      description: formData.description || null,
      sale_amount: parseFloat(formData.sale_amount) || 0,
      total_payment_due: parseFloat(formData.total_payment_due) || 0,
      date_of_payment: formData.date_of_payment,
      paid_amount: parseFloat(formData.paid_amount) || 0,
      created_by: currentUser,
      updated_by: currentUser
    };

    const isNew = modalMode === 'add';
    const url = isNew
      ? `${API_BASE_URL}/finance/create-transport-payable`
      : `${API_BASE_URL}/finance/update-transport-payable/${formData.id}`;

    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.status === 'success') {
        closeModal();
        fetchEntries();
      } else {
        setError(result.message || 'Save failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const filteredEntries = entries.filter(e =>
    (e.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.dc_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.category_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const calculateBalance = (due, paid) => (parseFloat(due || 0) - parseFloat(paid || 0));

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                Transport Payables Management
              </h1>
              <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                Logged in as: <strong>{currentUser}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Company</label>
              <select
                value={selectedCompany}
                onChange={(e) => {
                  setSelectedCompany(e.target.value);
                  setSelectedProject('');
                  setSelectedBank('');
                }}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setSelectedBank('');
                }}
                disabled={!selectedCompany}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-50"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              >
                <option value="">Select Project</option>
                {currentCompany?.projects?.map(p => (
                  <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Bank Account *</label>
              <Select
                options={banks}
                value={banks.find(b => b.value == selectedBank) || null}
                onChange={(opt) => setSelectedBank(opt ? opt.value : '')}
                placeholder="Select Bank"
                isClearable
                isDisabled={!selectedProject}
                styles={{ control: base => ({ ...base, minHeight: 48 }) }}
              />
            </div>
          </div>
        </div>

        {/* Search + Add */}
        {selectedProject && selectedBank && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search item, DC, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              />
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
            >
              <Plus size={20} /> Add New Entry
            </button>
          </div>
        )}

        {/* Error */}
        {error && !isModalOpen && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-teal-600 mx-auto"></div>
            </div>
          ) : !selectedBank ? (
            <div className="p-12 text-center text-gray-500">Please select Company → Project → Bank</div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No transport entries found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: themeColors.lightBg }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Bank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>DC No.</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Item Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Description</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Sale Amount</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Total Due</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Paid</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: themeColors.lightBorder }}>
                  {filteredEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium">{entry.bank_name || '-'}</td>
                      <td className="px-6 py-4 text-sm">{entry.category_name || '-'}</td>
                      <td className="px-6 py-4 text-sm">{entry.dc_number || '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium">{entry.item_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={entry.description}>
                        {entry.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono">{formatINR(entry.sale_amount)}</td>
                      <td className="px-6 py-4 text-right text-sm font-mono font-semibold">{formatINR(entry.total_payment_due)}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        {entry.date_of_payment ? new Date(entry.date_of_payment).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono">{formatINR(entry.paid_amount)}</td>
                      <td className="px-6 py-4 text-right font-medium text-lg" style={{ color: calculateBalance(entry.total_payment_due, entry.paid_amount) > 0 ? '#dc2626' : '#16a34a' }}>
                        {formatINR(calculateBalance(entry.total_payment_due, entry.paid_amount))}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openEditModal(entry)}
                          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10" style={{ borderColor: themeColors.border }}>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
                    {modalMode === 'add' ? 'Add New Transport Entry' : 'Edit Transport Entry'}
                  </h2>
                  <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={28} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category *</label>
                    <Select
                      options={costCategories}
                      value={formData.cost_category_id}
                      onChange={(opt) => setFormData(prev => ({ ...prev, cost_category_id: opt }))}
                      placeholder="Select Category"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">DC Number</label>
                    <input
                      type="text"
                      value={formData.dc_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, dc_number: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Item Name *</label>
                    <input
                      type="text"
                      value={formData.item_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none resize-none"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Sale Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, sale_amount: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Total Payment Due *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.total_payment_due}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_payment_due: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none font-semibold"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Date of Payment *</label>
                    <input
                      type="date"
                      value={formData.date_of_payment}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_of_payment: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Paid Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.paid_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border-2 border-teal-200">
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-700">Balance Amount: </span>
                    <span className="text-2xl font-bold text-teal-700">
                      {formatINR(calculateBalance(formData.total_payment_due, formData.paid_amount))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white" style={{ borderColor: themeColors.border }}>
                <button
                  onClick={closeModal}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-10 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 shadow-lg"
                >
                  <Check size={22} />
                  {modalMode === 'add' ? 'Save Entry' : 'Update Entry'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportPayable;
import { API_BASE_URL } from "../../../config/api.js";
// // components/FinanceComponents/CommonPaymentEntry/TransportPayablesModal.jsx
// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import axios from 'axios';
// import { Truck, Plus, Edit, X, Search, Check, Building2, Calendar, Banknote } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const TransportPayablesModal = ({ onClose, createdBy }) => {
//   const [companies, setCompanies] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [costCategories, setCostCategories] = useState([]);
//   const [entries, setEntries] = useState([]);

//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedBank, setSelectedBank] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');

//   // Modal state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
//   const [formData, setFormData] = useState({
//     id: null,
//     cost_category_id: null,
//     dc_number: '',
//     item_name: '',
//     description: '',
//     sale_amount: '',
//     total_payment_due: '',
//     date_of_payment: '',
//     paid_amount: ''
//   });

//   useEffect(() => {
//     const fetchInitial = async () => {
//       try {
//         const [compRes, bankRes, catRes] = await Promise.all([
//           axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
//           axios.get(`${API_BASE_URL}/finance/bank-masters`),
//           axios.get(`${API_BASE_URL}/finance/cost-categories`)
//         ]);

//         if (compRes.data.status === 'success') {
//           setCompanies(compRes.data.data);
//           if (compRes.data.data.length > 0) setSelectedCompany(compRes.data.data[0].company_id);
//         }

//         if (bankRes.data.status === 'success') {
//           const options = bankRes.data.data.map(bank => ({
//             value: bank.id,
//             label: `${bank.bank_name} (₹${Number(bank.available_balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })})`
//           }));
//           setBanks(options);
//         }

//         if (catRes.data.status === 'success') {
//           setCostCategories(catRes.data.data.map(cat => ({ value: cat.id, label: cat.category_name })));
//         }
//       } catch (err) {
//         setError('Failed to load initial data');
//       }
//     };
//     fetchInitial();
//   }, []);

//   useEffect(() => {
//     const company = companies.find(c => c.company_id === selectedCompany);
//     if (company?.projects?.length > 0 && !selectedProject) {
//       setSelectedProject(company.projects[0].pd_id);
//     }
//   }, [selectedCompany, companies]);

//   const fetchEntries = async () => {
//     if (!selectedProject || !selectedBank) {
//       setEntries([]);
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/transport-payables?pd_id=${selectedProject}&bank_id=${selectedBank}`);
//       if (res.data.status === 'success') {
//         setEntries(res.data.data.slice(1)); // skip summary
//       }
//     } catch (err) {
//       setError('Failed to load entries');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedProject && selectedBank) fetchEntries();
//   }, [selectedProject, selectedBank]);

//   const openAddModal = () => {
//     setModalMode('add');
//     setFormData({
//       id: null,
//       cost_category_id: null,
//       dc_number: '',
//       item_name: '',
//       description: '',
//       sale_amount: '',
//       total_payment_due: '',
//       date_of_payment: '',
//       paid_amount: ''
//     });
//     setError('');
//     setIsModalOpen(true);
//   };

//   const openEditModal = (entry) => {
//     setModalMode('edit');
//     setFormData({
//       id: entry.id,
//       cost_category_id: costCategories.find(c => c.value === entry.cost_category_id) || null,
//       dc_number: entry.dc_number || '',
//       item_name: entry.item_name || '',
//       description: entry.description || '',
//       sale_amount: entry.sale_amount?.toString() || '',
//       total_payment_due: entry.total_payment_due?.toString() || '',
//       date_of_payment: entry.date_of_payment ? entry.date_of_payment.split('T')[0] : '',
//       paid_amount: entry.paid_amount?.toString() || ''
//     });
//     setError('');
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setError('');
//   };

//   const handleSave = async () => {
//     if (!formData.cost_category_id || !formData.item_name || !formData.date_of_payment || !formData.total_payment_due) {
//       setError('Required fields missing');
//       return;
//     }

//     const payload = {
//       pd_id: selectedProject,
//       finance_bank_id: selectedBank,
//       cost_category_id: formData.cost_category_id.value,
//       dc_number: formData.dc_number || null,
//       item_name: formData.item_name,
//       description: formData.description || null,
//       sale_amount: parseFloat(formData.sale_amount) || 0,
//       total_payment_due: parseFloat(formData.total_payment_due) || 0,
//       date_of_payment: formData.date_of_payment,
//       paid_amount: parseFloat(formData.paid_amount) || 0,
//       created_by: createdBy,
//       updated_by: createdBy
//     };

//     const isNew = modalMode === 'add';
//     const url = isNew
//       ? `${API_BASE_URL}/finance/create-transport-payable`
//       : `${API_BASE_URL}/finance/update-transport-payable/${formData.id}`;

//     try {
//       const res = await axios({ method: isNew ? 'POST' : 'PUT', url, data: payload });
//       if (res.data.status === 'success') {
//         closeModal();
//         fetchEntries();
//       } else {
//         setError(res.data.message || 'Save failed');
//       }
//     } catch (err) {
//       setError('Network error');
//     }
//   };

//   const currentCompany = companies.find(c => c.company_id === selectedCompany);
//   const filteredEntries = entries.filter(e =>
//     (e.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (e.dc_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (e.category_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (e.description || '').toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

//   const calculateBalance = (due, paid) => (parseFloat(due || 0) - parseFloat(paid || 0));

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
//       <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
//         {/* Header */}
//         <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center" style={{ borderColor: themeColors.lightBorder }}>
//           <div className="flex items-center gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//               <Truck className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>Transport Payables Management</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition">
//             <X size={28} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-6 overflow-y-auto max-h-[80vh]">
//           {/* Filters */}
//           <div className="bg-gray-50 rounded-lg p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-semibold mb-2"><Building2 size={16} className="inline mr-2" />Company</label>
//                 <select value={selectedCompany} onChange={e => { setSelectedCompany(e.target.value); setSelectedProject(''); }}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
//                   <option value="">Select Company</option>
//                   {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2">Project</label>
//                 <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} disabled={!selectedCompany}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-50"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
//                   <option value="">Select Project</option>
//                   {currentCompany?.projects?.map(p => <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Banknote size={16} className="inline mr-2" />Bank Account *</label>
//                 <Select options={banks} value={banks.find(b => b.value == selectedBank) || null}
//                   onChange={opt => setSelectedBank(opt ? opt.value : '')}
//                   placeholder="Select Bank" isClearable isDisabled={!selectedProject} />
//               </div>
//             </div>
//           </div>

//           {/* Search + Add */}
//           {selectedProject && selectedBank && (
//             <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
//               <div className="relative flex-1 max-w-md">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//                 <input type="text" placeholder="Search item, DC, description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
//                   className="w-full pl-12 pr-4 py-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//               </div>
//               <button onClick={openAddModal}
//                 className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
//                 <Plus size={20} /> Add New Entry
//               </button>
//             </div>
//           )}

//           {/* Error */}
//           {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>}

//           {/* Table */}
//           <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
//             {loading ? (
//               <div className="p-20 text-center">Loading...</div>
//             ) : !selectedBank ? (
//               <div className="p-12 text-center text-gray-500">Please select Bank</div>
//             ) : filteredEntries.length === 0 ? (
//               <div className="p-12 text-center text-gray-500">No entries found</div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead style={{ backgroundColor: themeColors.lightBg }}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Bank</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">DC No.</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Item Name</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Sale Amount</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Total Due</th>
//                       <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Date</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Paid</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Balance</th>
//                       <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {filteredEntries.map(entry => (
//                       <tr key={entry.id} className="hover:bg-gray-50 transition">
//                         <td className="px-6 py-4 text-sm font-medium">{entry.bank_name || '-'}</td>
//                         <td className="px-6 py-4 text-sm">{entry.category_name || '-'}</td>
//                         <td className="px-6 py-4 text-sm">{entry.dc_number || '-'}</td>
//                         <td className="px-6 py-4 text-sm font-medium">{entry.item_name}</td>
//                         <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={entry.description}>
//                           {entry.description || '-'}
//                         </td>
//                         <td className="px-6 py-4 text-right text-sm font-mono">{formatINR(entry.sale_amount)}</td>
//                         <td className="px-6 py-4 text-right text-sm font-mono font-semibold">{formatINR(entry.total_payment_due)}</td>
//                         <td className="px-6 py-4 text-center text-sm">
//                           {entry.date_of_payment ? new Date(entry.date_of_payment).toLocaleDateString('en-IN') : '-'}
//                         </td>
//                         <td className="px-6 py-4 text-right text-sm font-mono">{formatINR(entry.paid_amount)}</td>
//                         <td className="px-6 py-4 text-right font-medium text-lg" style={{ color: calculateBalance(entry.total_payment_due, entry.paid_amount) > 0 ? '#dc2626' : '#16a34a' }}>
//                           {formatINR(calculateBalance(entry.total_payment_due, entry.paid_amount))}
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           <button onClick={() => openEditModal(entry)} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
//                             <Edit size={18} />
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

//         {/* Inner Modal for Add/Edit */}
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={closeModal}>
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
//               <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center" style={{ borderColor: themeColors.border }}>
//                 <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
//                   {modalMode === 'add' ? 'Add New Transport Entry' : 'Edit Transport Entry'}
//                 </h2>
//                 <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
//                   <X size={28} />
//                 </button>
//               </div>

//               <div className="p-6 space-y-6">
//                 {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">{error}</div>}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Category *</label>
//                     <Select options={costCategories} value={formData.cost_category_id} onChange={opt => setFormData(prev => ({ ...prev, cost_category_id: opt }))}
//                       placeholder="Select Category" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">DC Number</label>
//                     <input type="text" value={formData.dc_number} onChange={e => setFormData(prev => ({ ...prev, dc_number: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
//                       style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-semibold mb-2">Item Name *</label>
//                     <input type="text" value={formData.item_name} onChange={e => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
//                       style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} required />
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-semibold mb-2">Description</label>
//                     <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} rows="3"
//                       className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none resize-none"
//                       style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Sale Amount</label>
//                     <input type="number" step="0.01" value={formData.sale_amount} onChange={e => setFormData(prev => ({ ...prev, sale_amount: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
//                       style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Total Payment Due *</label>
//                     <input type="number" step="0.01" value={formData.total_payment_due} onChange={e => setFormData(prev => ({ ...prev, total_payment_due: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none font-semibold"
//                       style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} required />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Date of Payment *</label>
//                     <input type="date" value={formData.date_of_payment} onChange={e => setFormData(prev => ({ ...prev, date_of_payment: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
//                       style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} required />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold mb-2">Paid Amount</label>
//                     <input type="number" step="0.01" value={formData.paid_amount} onChange={e => setFormData(prev => ({ ...prev, paid_amount: e.target.value }))}
//                       className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
//                       style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-xl border-2 border-teal-200">
//                   <div className="text-right">
//                     <span className="text-lg font-semibold text-gray-700">Balance Amount: </span>
//                     <span className="text-2xl font-bold text-teal-700">
//                       {formatINR(calculateBalance(formData.total_payment_due, formData.paid_amount))}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-6 border-t flex justify-end gap-4 sticky bottom-0 bg-white" style={{ borderColor: themeColors.border }}>
//                 <button onClick={closeModal} className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
//                   Cancel
//                 </button>
//                 <button onClick={handleSave} className="px-10 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2 shadow-lg">
//                   <Check size={22} />
//                   {modalMode === 'add' ? 'Save Entry' : 'Update Entry'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TransportPayablesModal;
























// components/FinanceComponents/CommonPaymentEntry/TransportPayablesModal.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Truck, Plus, Edit, X, Search, Check, Building2, Calendar, Banknote } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const TransportPayablesModal = ({ onClose, createdBy }) => {
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [costCategories, setCostCategories] = useState([]);
  const [dcOptions, setDcOptions] = useState([]); // DC Number options from material_dispatch
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

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [compRes, bankRes, catRes, dcRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
          axios.get(`${API_BASE_URL}/finance/bank-masters`),
          axios.get(`${API_BASE_URL}/finance/cost-categories`),
          axios.get(`${API_BASE_URL}/finance/existing-dc-numbers`) // Correct endpoint
        ]);

        if (compRes.data.status === 'success') {
          setCompanies(compRes.data.data);
          if (compRes.data.data.length > 0) {
            setSelectedCompany(compRes.data.data[0].company_id);
          }
        }

        if (bankRes.data.status === 'success') {
          const options = bankRes.data.data.map(bank => ({
            value: bank.id,
            label: `${bank.bank_name} (₹${Number(bank.available_balance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })})`
          }));
          setBanks(options);
        }

        if (catRes.data.status === 'success') {
          setCostCategories(catRes.data.data.map(cat => ({
            value: cat.id,
            label: cat.category_name
          })));
        }

        if (dcRes.data.status === 'success') {
          const options = dcRes.data.data.map(dc => ({
            value: dc,
            label: dc
          }));
          setDcOptions(options);
        }
      } catch (err) {
        setError('Failed to load initial data');
        console.error('Initial load error:', err);
      }
    };

    fetchInitial();
  }, []);

  useEffect(() => {
    const company = companies.find(c => c.company_id === selectedCompany);
    if (company?.projects?.length > 0 && !selectedProject) {
      setSelectedProject(company.projects[0].pd_id);
    }
  }, [selectedCompany, companies]);

  const fetchEntries = async () => {
    if (!selectedProject || !selectedBank) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/finance/transport-payables?pd_id=${selectedProject}&bank_id=${selectedBank}`
      );
      if (res.data.status === 'success') {
        setEntries(res.data.data.slice(1)); // Skip summary row
      }
    } catch (err) {
      setError('Failed to load entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject && selectedBank) {
      fetchEntries();
    }
  }, [selectedProject, selectedBank]);

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

    const selectedCostCategory = costCategories.find(c => c.value === entry.cost_category_id) || null;
    const selectedDc = dcOptions.find(opt => opt.value === entry.dc_number) || null;

    setFormData({
      id: entry.id,
      cost_category_id: selectedCostCategory,
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
      setError('Required fields are missing');
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
      created_by: createdBy,
      updated_by: createdBy
    };

    const isNew = modalMode === 'add';
    const url = isNew
      ? `${API_BASE_URL}/finance/create-transport-payable`
      : `${API_BASE_URL}/finance/update-transport-payable/${formData.id}`;

    try {
      await axios({
        method: isNew ? 'POST' : 'PUT',
        url,
        data: payload
      });
      closeModal();
      fetchEntries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
      console.error(err);
    }
  };

  const currentCompany = companies.find(c => c.company_id === selectedCompany);

  const filteredEntries = entries.filter(e =>
    (e.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.dc_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.category_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const calculateBalance = (due, paid) => (parseFloat(due || 0) - parseFloat(paid || 0));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden"
        style={{ borderColor: themeColors.border }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center" style={{ borderColor: themeColors.lightBorder }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>Transport Payables Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition">
            <X size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2"><Building2 size={16} className="inline mr-2" />Company</label>
                <select
                  value={selectedCompany}
                  onChange={e => { setSelectedCompany(e.target.value); setSelectedProject(''); }}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
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
                  onChange={e => setSelectedProject(e.target.value)}
                  disabled={!selectedCompany}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-50"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                >
                  <option value="">Select Project</option>
                  {currentCompany?.projects?.map(p => (
                    <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Banknote size={16} className="inline mr-2" />Bank Account *
                </label>
                <Select
                  options={banks}
                  value={banks.find(b => b.value == selectedBank) || null}
                  onChange={opt => setSelectedBank(opt ? opt.value : '')}
                  placeholder="Select Bank"
                  isClearable
                  isDisabled={!selectedProject}
                />
              </div>
            </div>
          </div>

          {/* Search + Add Button */}
          {selectedProject && selectedBank && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search item, DC, description..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">{error}</div>}

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
            {loading ? (
              <div className="p-20 text-center">Loading...</div>
            ) : !selectedBank ? (
              <div className="p-12 text-center text-gray-500">Please select a Bank</div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No entries found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: themeColors.lightBg }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Bank</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">DC No.</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Item Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Sale Amount</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Total Due</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Balance</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
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
                        <td className="px-6 py-4 text-right font-medium text-lg" style={{
                          color: calculateBalance(entry.total_payment_due, entry.paid_amount) > 0 ? '#dc2626' : '#16a34a'
                        }}>
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
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={closeModal}>
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center" style={{ borderColor: themeColors.border }}>
                <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
                  {modalMode === 'add' ? 'Add New Transport Entry' : 'Edit Transport Entry'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={28} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Category *</label>
                    <Select
                      options={costCategories}
                      value={formData.cost_category_id}
                      onChange={opt => setFormData(prev => ({ ...prev, cost_category_id: opt }))}
                      placeholder="Select Category"
                      isSearchable
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">DC Number</label>
                    <Select
                      options={dcOptions}
                      value={dcOptions.find(opt => opt.value === formData.dc_number) || null}
                      onChange={opt => setFormData(prev => ({ ...prev, dc_number: opt ? opt.value : '' }))}
                      placeholder="Search and select DC Number..."
                      isSearchable
                      isClearable
                      noOptionsMessage={() => "No DC numbers available"}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Item Name *</label>
                    <input
                      type="text"
                      value={formData.item_name}
                      onChange={e => setFormData(prev => ({ ...prev, item_name: e.target.value }))}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                      onChange={e => setFormData(prev => ({ ...prev, sale_amount: e.target.value }))}
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
                      onChange={e => setFormData(prev => ({ ...prev, total_payment_due: e.target.value }))}
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
                      onChange={e => setFormData(prev => ({ ...prev, date_of_payment: e.target.value }))}
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
                      onChange={e => setFormData(prev => ({ ...prev, paid_amount: e.target.value }))}
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

export default TransportPayablesModal;
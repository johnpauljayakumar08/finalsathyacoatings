import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import axios from 'axios';
// import { Search, Edit2,X, Trash2, ChevronDown, ChevronUp, Calendar, FileText, DollarSign, User, Building2, Package, Hash, Percent, Clock, MessageSquare } from 'lucide-react';

// // Exact same theme as SupplyClientMasterCreation
// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const ViewCreditors = () => {
//   const [clients, setClients] = useState([]);
//   const [creditors, setCreditors] = useState([]);
//   const [filteredCreditors, setFilteredCreditors] = useState([]);
//   const [selectedClient, setSelectedClient] = useState(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [expandedId, setExpandedId] = useState(null);
  
//   // Edit Modal States
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [editData, setEditData] = useState(null);
//   const [editFormData, setEditFormData] = useState({});
//   const [editLoading, setEditLoading] = useState(false);
//   const [editCreditorType, setEditCreditorType] = useState('gst');

//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     loadClients();
//     loadCreditors();
//   }, []);

//   useEffect(() => {
//     let filtered = creditors;

//     if (selectedClient) {
//       filtered = filtered.filter(c => c.client_id === selectedClient.value);
//     }

//     if (searchQuery) {
//       filtered = filtered.filter(c =>
//         c.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         c.inv_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         c.item_code?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     setFilteredCreditors(filtered);
//     setCurrentPage(1);
//   }, [creditors, selectedClient, searchQuery]);

//   const loadClients = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/finance/view-creditors-client`);
//       setClients(response.data.data.map(client => ({ value: client.id, label: client.client_name })));
//     } catch (error) {
//       console.error('Error loading clients:', error);
//     }
//   };

//   const loadCreditors = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/finance/view-creditors`);
//       const sorted = response.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//       setCreditors(sorted);
//       setFilteredCreditors(sorted);
//     } catch (error) {
//       console.error('Error loading creditors:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClientChange = (option) => {
//     setSelectedClient(option);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this creditor entry?')) return;
//     try {
//       await axios.delete(`${API_BASE_URL}/finance/delete-creditors/${id}`);
//       loadCreditors();
//       alert('Creditor deleted successfully');
//     } catch (error) {
//       alert('Error deleting creditor');
//     }
//   };

//   const handleEdit = async (id) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/finance/creditors/${id}`);
//       const data = response.data.data;
//       setEditData(data);
//       setEditCreditorType(data.is_gst === 1 ? 'gst' : 'other');
//       setEditFormData({
//         id: data.id,
//         po_date: data.po_date || '',
//         po_sent_through: data.po_sent_through || '',
//         inv_number: data.inv_number || '',
//         bill_date: data.bill_date || '',
//         pdc_date: data.pdc_date || '',
//         item_code: data.item_code || '',
//         qty: data.qty || '',
//         rate: data.rate || '',
//         sale_amount: data.sale_amount || '',
//         gst_amount: data.gst_amount || '',
//         total_payment_due: data.total_payment_due || '',
//         amount_paid: data.amount_paid || '',
//         balance_amount: data.balance_amount || '',
//         date_of_payment: data.date_of_payment || '',
//         due_date: data.due_date || '',
//         remarks: data.remarks || '',
//         updated_by: ''
//       });
//       setShowEditModal(true);
//     } catch (error) {
//       alert('Error loading creditor data');
//     }
//   };

//   const handleEditInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleEditCreditorTypeChange = (e) => {
//     const type = e.target.value;
//     setEditCreditorType(type);
//     setEditFormData(prev => ({ ...prev, is_gst: type === 'gst' ? 1 : 0 }));
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     if (!editFormData.updated_by?.trim()) {
//       alert('Updated By is required');
//       return;
//     }
//     setEditLoading(true);
//     try {
//       await axios.put(`${API_BASE_URL}/finance/update-creditors`, {
//         ...editFormData,
//         is_gst: editCreditorType === 'gst' ? 1 : 0
//       });
//       setShowEditModal(false);
//       loadCreditors();
//       alert('Creditor updated successfully!');
//     } catch (error) {
//       alert('Error updating creditor');
//     } finally {
//       setEditLoading(false);
//     }
//   };

//   const toggleExpand = (id) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';

//   // Pagination
//   const totalPages = Math.ceil(filteredCreditors.length / itemsPerPage);
//   const startIdx = (currentPage - 1) * itemsPerPage;
//   const currentItems = filteredCreditors.slice(startIdx, startIdx + itemsPerPage);

//   const getPageNumbers = () => {
//     const pages = [];
//     const max = 5;
//     let start = Math.max(1, currentPage - 2);
//     let end = Math.min(totalPages, start + max - 1);
//     if (end - start + 1 < max) start = Math.max(1, end - max + 1);
//     for (let i = start; i <= end; i++) pages.push(i);
//     return pages;
//   };

//   const customSelectStyles = {
//     control: (p) => ({ ...p, borderColor: themeColors.border, borderRadius: '0.5rem', padding: '0.375rem 0' }),
//     option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? themeColors.primary : s.isFocused ? '#f0fdfa' : 'white', color: s.isSelected ? 'white' : themeColors.textPrimary }),
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
//       {/* Header */}
//       <div className="p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//           <div className="flex items-center gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//               <DollarSign className="w-7 h-7 text-white" />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>All Creditors</h2>
//               <p className="text-sm" style={{ color: themeColors.textSecondary }}>View and manage creditor records</p>
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="relative">
//               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
//               <input
//                 type="text"
//                 placeholder="Search invoice, item code, client..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm w-full sm:w-80 focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               />
//               {searchQuery && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium bg-gray-200 px-2 py-1 rounded" style={{ color: themeColors.textSecondary }}>{filteredCreditors.length} results</span>}
//             </div>

//             <Select
//               options={[{ value: null, label: 'All Clients' }, ...clients]}
//               value={selectedClient}
//               onChange={handleClientChange}
//               placeholder="Filter by Client"
//               isClearable
//               styles={customSelectStyles}
//               className="w-full sm:w-64 text-sm"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center h-96">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4" style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
//           <p className="mt-4 font-medium" style={{ color: themeColors.textSecondary }}>Loading creditors...</p>
//         </div>
//       ) : filteredCreditors.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-96 text-center p-8">
//           <div className="p-4 bg-gray-100 rounded-2xl mb-4">
//             <FileText className="w-12 h-12 text-gray-400" />
//           </div>
//           <h3 className="font-semibold text-lg mb-2" style={{ color: themeColors.textPrimary }}>No creditors found</h3>
//           <p style={{ color: themeColors.textSecondary }}>Try adjusting your filters or search query.</p>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="w-full table-fixed">
//               <thead className="border-b" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.lightBorder }}>
//                 <tr>
//                   <th className="w-16 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Client</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Type</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Invoice</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Item</th>
//                   <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Total Due</th>
//                   <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Paid</th>
//                   <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Due Date</th>
//                   <th className="w-32 text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//                 {currentItems.map((c) => (
//                   <React.Fragment key={c.id}>
//                     <tr className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleExpand(c.id)}>
//                       <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.primary }}>{c.id}</td>
//                       <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>{c.client_name}</td>
//                       <td className="px-6 py-4">
//                         <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${c.is_gst === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
//                           {c.is_gst === 1 ? 'GST' : 'Other'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-sm">{c.inv_number || 'N/A'}</td>
//                       <td className="px-6 py-4 text-sm font-mono">{c.item_code || 'N/A'}</td>
//                       <td className="px-6 py-4 text-sm text-right font-medium">₹{parseFloat(c.total_payment_due || 0).toLocaleString('en-IN')}</td>
//                       <td className="px-6 py-4 text-sm text-right">₹{parseFloat(c.amount_paid || 0).toLocaleString('en-IN')}</td>
//                       <td className={`px-6 py-4 text-sm font-semibold text-right ${parseFloat(c.balance_amount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
//                         ₹{parseFloat(c.balance_amount || 0).toLocaleString('en-IN')}
//                       </td>
//                       <td className="px-6 py-4 text-sm">{formatDate(c.due_date)}</td>
//                       <td className="px-6 py-4 text-center">
//                         <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
//                           {expandedId === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                         </button>
//                       </td>
//                     </tr>

//                     {expandedId === c.id && (
//                       <tr>
//                         <td colSpan={10} className="p-0">
//                           <div className="p-6 mx-6 my-4 rounded-lg border-l-4 shadow-inner" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.primary }}>
//                             <div className="flex items-center justify-between mb-4">
//                               <h4 className="font-semibold flex items-center gap-2" style={{ color: themeColors.textPrimary }}>
//                                 <FileText size={16} /> Detailed Information
//                               </h4>
//                               <div className="flex gap-3">
//                                 <button onClick={(e) => { e.stopPropagation(); handleEdit(c.id); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90" style={{ backgroundColor: themeColors.primary }}>
//                                   <Edit2 size={16} /> Edit
//                                 </button>
//                                 <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium transition-all hover:bg-red-700">
//                                   <Trash2 size={16} /> Delete
//                                 </button>
//                               </div>
//                             </div>
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                               {[
//                                 { icon: Calendar, label: 'PO Date', value: formatDate(c.po_date) },
//                                 { icon: Calendar, label: 'Bill Date', value: formatDate(c.bill_date) },
//                                 { icon: Calendar, label: 'PDC Date', value: formatDate(c.pdc_date) },
//                                 { icon: Package, label: 'Qty', value: c.qty || 'N/A' },
//                                 { icon: DollarSign, label: 'Rate', value: `₹${c.rate || 0}` },
//                                 { icon: DollarSign, label: 'Sale Amount', value: `₹${parseFloat(c.sale_amount || 0).toLocaleString('en-IN')}` },
//                                 { icon: Percent, label: 'GST Amount', value: `₹${parseFloat(c.gst_amount || 0).toLocaleString('en-IN')}` },
//                                 { icon: Clock, label: 'Date of Payment', value: formatDate(c.date_of_payment) },
//                                 { icon: MessageSquare, label: 'Remarks', value: c.remarks || 'None' },
//                                 { icon: User, label: 'Created By', value: c.created_by || 'N/A' },
//                                 { icon: Calendar, label: 'Created At', value: new Date(c.created_at).toLocaleString('en-IN') },
//                               ].map((item, i) => (
//                                 <div key={i} className="bg-white p-4 rounded-lg shadow-sm border" style={{ borderColor: themeColors.lightBorder }}>
//                                   <div className="text-xs font-medium uppercase tracking-wide mb-1 flex items-center gap-2" style={{ color: themeColors.textSecondary }}>
//                                     <item.icon size={14} /> {item.label}
//                                   </div>
//                                   <div className="text-sm font-medium" style={{ color: themeColors.textPrimary }}>{item.value}</div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="border-t px-6 py-4 flex items-center justify-between" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.lightBorder }}>
//               <div className="text-sm" style={{ color: themeColors.textSecondary }}>
//                 Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredCreditors.length)} of {filteredCreditors.length} entries
//               </div>
//               <div className="flex items-center gap-2">
//                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
//                   <ChevronUp size={16} className="rotate-270" />
//                 </button>
//                 {getPageNumbers().map(p => (
//                   <button key={p} onClick={() => setCurrentPage(p)} className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all ${currentPage === p ? 'text-white shadow-md' : 'bg-white hover:border-gray-400'}`} style={currentPage === p ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : { borderColor: themeColors.border }}>
//                     {p}
//                   </button>
//                 ))}
//                 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
//                   <ChevronUp size={16} className="rotate-90" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Edit Modal - Same style as CreateCreditors */}
//       {showEditModal && editData && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
//           <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
//             <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
//               <h3 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>Edit Creditor Entry</h3>
//               <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-200 rounded-lg"><X size={20} /></button>
//             </div>
//             <div className="p-8 max-h-[80vh] overflow-y-auto">
//               {/* Same form layout as CreateCreditors - reused styles */}
//               <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {/* Non-editable info */}
//                 <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
//                   <div><span className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>Client:</span> <strong>{editData.client_name}</strong></div>
//                   <div><span className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>ID:</span> <strong>{editData.id}</strong></div>
//                   <div><span className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>Created:</span> {new Date(editData.created_at).toLocaleString('en-IN')}</div>
//                 </div>

//                 {/* Creditor Type */}
//                 <div className="lg:col-span-4">
//                   <label className="text-sm font-semibold mb-3 block" style={{ color: themeColors.textPrimary }}>Creditor Type</label>
//                   <div className="flex gap-8">
//                     {[{ value: 'gst', label: 'GST Creditors', icon: Percent }, { value: 'other', label: 'Other Creditors', icon: FileText }].map(item => (
//                       <label key={item.value} className="flex items-center cursor-pointer">
//                         <input type="radio" name="type" value={item.value} checked={editCreditorType === item.value} onChange={handleEditCreditorTypeChange} className="w-5 h-5" style={{ accentColor: themeColors.primary }} />
//                         <span className="ml-3 flex items-center gap-2 text-base font-medium" style={{ color: themeColors.textPrimary }}>
//                           <item.icon size={18} /> {item.label}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Reuse same input style */}
//                 {(['pdc_date', 'item_code', 'qty', 'rate', 'sale_amount', 'gst_amount', 'total_payment_due', 'date_of_payment', 'amount_paid', 'balance_amount'].map(field => (
//                   <div key={field}>
//                     <label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}>
//                       {field.includes('date') ? <Calendar size={16} /> : field.includes('amount') || field.includes('paid') ? <DollarSign size={16} /> : field.includes('qty') ? <Hash size={16} /> : <Package size={16} />}
//                       {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                     </label>
//                     <input type={field.includes('date') ? 'date' : 'text'} name={field} value={editFormData[field] || ''} onChange={handleEditInputChange}
//                       className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2"
//                       style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//                   </div>
//                 )))}

//                 {editCreditorType === 'gst' && (
//                   <>
//                     <div className="lg:col-span-2"><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><Calendar size={16} /> PO Date</label><input type="date" name="po_date" value={editFormData.po_date} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
//                     <div><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><FileText size={16} /> PO Sent Through</label><input type="text" name="po_sent_through" value={editFormData.po_sent_through} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
//                     <div><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><FileText size={16} /> Invoice Number</label><input type="text" name="inv_number" value={editFormData.inv_number} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
//                     <div className="lg:col-span-2"><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><Calendar size={16} /> Bill Date</label><input type="date" name="bill_date" value={editFormData.bill_date} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
//                     <div className="lg:col-span-2"><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><Clock size={16} /> Due Date</label><input type="date" name="due_date" value={editFormData.due_date} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
//                     <div className="lg:col-span-4"><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><MessageSquare size={16} /> Remarks</label><textarea name="remarks" value={editFormData.remarks} onChange={handleEditInputChange} rows={3} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2 resize-none" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
//                   </>
//                 )}

//                 <div className="lg:col-span-4">
//                   <label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><User size={16} /> Updated By *</label>
//                   <input type="text" name="updated_by" value={editFormData.updated_by} onChange={handleEditInputChange} required className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//                 </div>

//                 <div className="lg:col-span-4 flex justify-end gap-4 pt-6 border-t" style={{ borderColor: themeColors.lightBorder }}>
//                   <button type="button" onClick={() => setShowEditModal(false)} className="px-8 py-3 rounded-lg font-medium border" style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}>Cancel</button>
//                   <button type="submit" disabled={editLoading} className="px-8 py-3 rounded-lg font-medium text-white flex items-center gap-3" style={{ backgroundColor: themeColors.primary }}>
//                     {editLoading ? <>Updating...</> : <>Update Creditor</>}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewCreditors;






















import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Search, Edit2, X, Trash2, ChevronDown, ChevronUp, Calendar, FileText, DollarSign, Building2, Package, Hash, Percent, Clock, MessageSquare } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const ViewCreditors = () => {
  const [clients, setClients] = useState([]);
  const [creditors, setCreditors] = useState([]);
  const [filteredCreditors, setFilteredCreditors] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editCreditorType, setEditCreditorType] = useState('gst');

  // Auto-detect user from URL (e.g., /creditors/NA== → decode)
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/creditors\/([^/]+)$/);
    if (match && match[1]) {
      try {
        const decoded = atob(match[1]); // Base64 decode
        setCurrentUser(decoded);
      } catch (err) {
        console.error('Invalid user token in URL');
        setCurrentUser('1'); // fallback
      }
    }
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadClients();
    loadCreditors();
  }, []);

  useEffect(() => {
    let filtered = creditors;

    if (selectedClient) {
      filtered = filtered.filter(c => c.client_id === selectedClient.value);
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.inv_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.item_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCreditors(filtered);
    setCurrentPage(1);
  }, [creditors, selectedClient, searchQuery]);

  const loadClients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/view-creditors-client`);
      setClients(response.data.data.map(client => ({ value: client.id, label: client.client_name })));
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadCreditors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/view-creditors`);
      const sorted = response.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCreditors(sorted);
      setFilteredCreditors(sorted);
    } catch (error) {
      console.error('Error loading creditors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = (option) => {
    setSelectedClient(option);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this creditor entry?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/finance/delete-creditors/${id}`);
      loadCreditors();
      alert('Creditor deleted successfully');
    } catch (error) {
      alert('Error deleting creditor');
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/creditors/${id}`);
      const data = response.data.data;
      setEditData(data);
      setEditCreditorType(data.is_gst === 1 ? 'gst' : 'other');
      setEditFormData({
        id: data.id,
        po_date: data.po_date || '',
        po_sent_through: data.po_sent_through || '',
        inv_number: data.inv_number || '',
        bill_date: data.bill_date || '',
        pdc_date: data.pdc_date || '',
        item_code: data.item_code || '',
        qty: data.qty || '',
        rate: data.rate || '',
        sale_amount: data.sale_amount || '',
        gst_amount: data.gst_amount || '',
        total_payment_due: data.total_payment_due || '',
        amount_paid: data.amount_paid || '',
        balance_amount: data.balance_amount || '',
        date_of_payment: data.date_of_payment || '',
        due_date: data.due_date || '',
        remarks: data.remarks || '',
      });
      setShowEditModal(true);
    } catch (error) {
      alert('Error loading creditor data');
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditCreditorTypeChange = (e) => {
    const type = e.target.value;
    setEditCreditorType(type);
    setEditFormData(prev => ({ ...prev, is_gst: type === 'gst' ? 1 : 0 }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('User not identified. Please reload the page.');
      return;
    }

    setEditLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/finance/update-creditors`, {
        ...editFormData,
        is_gst: editCreditorType === 'gst' ? 1 : 0,
        updated_by: currentUser  // ← Auto-sent from URL
      });
      setShowEditModal(false);
      loadCreditors();
      alert('Creditor updated successfully!');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error updating creditor');
    } finally {
      setEditLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';

  // Pagination
  const totalPages = Math.ceil(filteredCreditors.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredCreditors.slice(startIdx, startIdx + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const customSelectStyles = {
    control: (p) => ({ ...p, borderColor: themeColors.border, borderRadius: '0.5rem', padding: '0.375rem 0' }),
    option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? themeColors.primary : s.isFocused ? '#f0fdfa' : 'white', color: s.isSelected ? 'white' : themeColors.textPrimary }),
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>All Creditors</h2>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                Logged in as: <strong>{currentUser || 'Loading...'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
              <input
                type="text"
                placeholder="Search invoice, item code, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm w-full sm:w-80 focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              />
              {searchQuery && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium bg-gray-200 px-2 py-1 rounded" style={{ color: themeColors.textSecondary }}>{filteredCreditors.length} results</span>}
            </div>

            <Select
              options={[{ value: null, label: 'All Clients' }, ...clients]}
              value={selectedClient}
              onChange={handleClientChange}
              placeholder="Filter by Client"
              isClearable
              styles={customSelectStyles}
              className="w-full sm:w-64 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4" style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
          <p className="mt-4 font-medium" style={{ color: themeColors.textSecondary }}>Loading creditors...</p>
        </div>
      ) : filteredCreditors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center p-8">
          <div className="p-4 bg-gray-100 rounded-2xl mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2" style={{ color: themeColors.textPrimary }}>No creditors found</h3>
          <p style={{ color: themeColors.textSecondary }}>Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="border-b" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.lightBorder }}>
                <tr>
                  <th className="w-16 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Item</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Total Due</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Paid</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Due Date</th>
                  <th className="w-32 text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
                {currentItems.map((c) => (
                  <React.Fragment key={c.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleExpand(c.id)}>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.primary }}>{c.id}</td>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>{c.client_name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${c.is_gst === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {c.is_gst === 1 ? 'GST' : 'Other'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{c.inv_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-mono">{c.item_code || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">₹{parseFloat(c.total_payment_due || 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-sm text-right">₹{parseFloat(c.amount_paid || 0).toLocaleString('en-IN')}</td>
                      <td className={`px-6 py-4 text-sm font-semibold text-right ${parseFloat(c.balance_amount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{parseFloat(c.balance_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm">{formatDate(c.due_date)}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          {expandedId === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>

                    {expandedId === c.id && (
                      <tr>
                        <td colSpan={10} className="p-0">
                          <div className="p-6 mx-6 my-4 rounded-lg border-l-4 shadow-inner" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.primary }}>
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold flex items-center gap-2" style={{ color: themeColors.textPrimary }}>
                                <FileText size={16} /> Detailed Information
                              </h4>
                              <div className="flex gap-3">
                                <button onClick={(e) => { e.stopPropagation(); handleEdit(c.id); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:opacity-90" style={{ backgroundColor: themeColors.primary }}>
                                  <Edit2 size={16} /> Edit
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium transition-all hover:bg-red-700">
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                { icon: Calendar, label: 'PO Date', value: formatDate(c.po_date) },
                                { icon: Calendar, label: 'Bill Date', value: formatDate(c.bill_date) },
                                { icon: Calendar, label: 'PDC Date', value: formatDate(c.pdc_date) },
                                { icon: Package, label: 'Qty', value: c.qty || 'N/A' },
                                { icon: DollarSign, label: 'Rate', value: `₹${c.rate || 0}` },
                                { icon: DollarSign, label: 'Sale Amount', value: `₹${parseFloat(c.sale_amount || 0).toLocaleString('en-IN')}` },
                                { icon: Percent, label: 'GST Amount', value: `₹${parseFloat(c.gst_amount || 0).toLocaleString('en-IN')}` },
                                { icon: Clock, label: 'Date of Payment', value: formatDate(c.date_of_payment) },
                                { icon: MessageSquare, label: 'Remarks', value: c.remarks || 'None' },
                                { icon: Building2, label: 'Created By', value: c.created_by || 'N/A' },
                                { icon: Calendar, label: 'Created At', value: new Date(c.created_at).toLocaleString('en-IN') },
                              ].map((item, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border" style={{ borderColor: themeColors.lightBorder }}>
                                  <div className="text-xs font-medium uppercase tracking-wide mb-1 flex items-center gap-2" style={{ color: themeColors.textSecondary }}>
                                    <item.icon size={14} /> {item.label}
                                  </div>
                                  <div className="text-sm font-medium" style={{ color: themeColors.textPrimary }}>{item.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t px-6 py-4 flex items-center justify-between" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.lightBorder }}>
              <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredCreditors.length)} of {filteredCreditors.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
                  <ChevronUp size={16} className="rotate-270" />
                </button>
                {getPageNumbers().map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all ${currentPage === p ? 'text-white shadow-md' : 'bg-white hover:border-gray-400'}`} style={currentPage === p ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : { borderColor: themeColors.border }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
                  <ChevronUp size={16} className="rotate-90" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal - updated_by REMOVED */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
              <h3 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>Edit Creditor Entry</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-200 rounded-lg"><X size={20} /></button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Non-editable info */}
                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div><span className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>Client:</span> <strong>{editData.client_name}</strong></div>
                  <div><span className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>ID:</span> <strong>{editData.id}</strong></div>
                  <div><span className="text-xs font-medium" style={{ color: themeColors.textSecondary }}>Updating as:</span> <strong>{currentUser || 'Loading...'}</strong></div>
                </div>

                {/* Creditor Type */}
                <div className="lg:col-span-4">
                  <label className="text-sm font-semibold mb-3 block" style={{ color: themeColors.textPrimary }}>Creditor Type</label>
                  <div className="flex gap-8">
                    {[{ value: 'gst', label: 'GST Creditors', icon: Percent }, { value: 'other', label: 'Other Creditors', icon: FileText }].map(item => (
                      <label key={item.value} className="flex items-center cursor-pointer">
                        <input type="radio" name="type" value={item.value} checked={editCreditorType === item.value} onChange={handleEditCreditorTypeChange} className="w-5 h-5" style={{ accentColor: themeColors.primary }} />
                        <span className="ml-3 flex items-center gap-2 text-base font-medium" style={{ color: themeColors.textPrimary }}>
                          <item.icon size={18} /> {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* All editable fields */}
                {(['pdc_date', 'item_code', 'qty', 'rate', 'sale_amount', 'gst_amount', 'total_payment_due', 'date_of_payment', 'amount_paid', 'balance_amount'].map(field => (
                  <div key={field}>
                    <label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}>
                      {field.includes('date') ? <Calendar size={16} /> : field.includes('amount') || field.includes('paid') ? <DollarSign size={16} /> : field.includes('qty') ? <Hash size={16} /> : <Package size={16} />}
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <input type={field.includes('date') ? 'date' : 'text'} name={field} value={editFormData[field] || ''} onChange={handleEditInputChange}
                      className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2"
                      style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
                  </div>
                )))}

                {editCreditorType === 'gst' && (
                  <>
                    <div className="lg:col-span-2"><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><Calendar size={16} /> PO Date</label><input type="date" name="po_date" value={editFormData.po_date} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
                    <div><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><FileText size={16} /> PO Sent Through</label><input type="text" name="po_sent_through" value={editFormData.po_sent_through} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
                    <div><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><FileText size={16} /> Invoice Number</label><input type="text" name="inv_number" value={editFormData.inv_number} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
                    <div className="lg:col-span-2"><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><Calendar size={16} /> Bill Date</label><input type="date" name="bill_date" value={editFormData.bill_date} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
                    <div className="lg:col-span-2"><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><Clock size={16} /> Due Date</label><input type="date" name="due_date" value={editFormData.due_date} onChange={handleEditInputChange} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
                    <div className="lg:col-span-4"><label className="text-sm font-semibold mb-2 block flex items-center gap-2" style={{ color: themeColors.textPrimary }}><MessageSquare size={16} /> Remarks</label><textarea name="remarks" value={editFormData.remarks} onChange={handleEditInputChange} rows={3} className="w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all focus:outline-none focus:ring-2 resize-none" style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} /></div>
                  </>
                )}

                {/* Submit Buttons */}
                <div className="lg:col-span-4 flex justify-end gap-4 pt-6 border-t" style={{ borderColor: themeColors.lightBorder }}>
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-8 py-3 rounded-lg font-medium border" style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}>Cancel</button>
                  <button type="submit" disabled={editLoading || !currentUser} className="px-8 py-3 rounded-lg font-medium text-white flex items-center gap-3 disabled:opacity-60" style={{ backgroundColor: themeColors.primary }}>
                    {editLoading ? <>Updating...</> : <>Update Creditor</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCreditors;
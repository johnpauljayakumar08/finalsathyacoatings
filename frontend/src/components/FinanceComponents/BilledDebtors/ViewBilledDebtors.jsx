import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Building2 } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const ViewBilledDebtors = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/view-billed-debtors`);
//       setData(res.data.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   function truncateToDate(isoDateString) {
//     if (!isoDateString || typeof isoDateString !== 'string') return '';
//     const datePart = isoDateString.split('T')[0];
//     // Optional: Validate YYYY-MM-DD format (e.g., fix typos like "025" -> "2025")
//     if (datePart.startsWith('025')) {
//       return '20' + datePart; // Quick fix for common year typo
//     }
//     return datePart;
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center" style={{ backgroundColor: themeColors.lightBg }}>
//         <div className="text-center py-16" style={{ color: themeColors.textSecondary }}>
//           Loading...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
//       <div className="max-w-7xl mx-auto">
     

//         {/* Table Card */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6" style={{ borderColor: themeColors.border }}>
//           <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse">
//               <thead style={{ backgroundColor: themeColors.lightBg }}>
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>Party Name</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>Invoice No</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>Due Date</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>Total Due</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>Balance</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>Expected Dates</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y" style={{ borderColor: themeColors.lightBorder }}>
//                 {data.map((row) => (
//                   <React.Fragment key={row.id}>
//                     <tr className="hover:bg-gray-50">
//                       <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary, borderBottomColor: themeColors.lightBorder }}>{row.party_name}</td>
//                       <td className="px-6 py-4 text-sm" style={{ color: themeColors.textPrimary, borderBottomColor: themeColors.lightBorder }}>{row.inv_no}</td>
//                       <td className="px-6 py-4 text-sm" style={{ color: themeColors.textPrimary, borderBottomColor: themeColors.lightBorder }}>{truncateToDate(row.due_date)}</td>
//                       <td className="px-6 py-4 text-sm" style={{ color: themeColors.textPrimary, borderBottomColor: themeColors.lightBorder }}>₹{Number(row.total_payment_due || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
//                       <td className="px-6 py-4 text-sm" style={{ color: themeColors.textPrimary, borderBottomColor: themeColors.lightBorder }}>₹{Number(row.balance_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
//                       <td className="px-6 py-4" style={{ borderBottomColor: themeColors.lightBorder }}>
//                         <details className="cursor-pointer">
//                           <summary className="text-sm font-medium underline hover:text-blue-600" style={{ color: themeColors.primary }}>View Details ({row.expected_dates?.length || 0})</summary>
//                           <div className="mt-4 p-4 bg-gray-50 rounded-lg" style={{ backgroundColor: themeColors.lightBg }}>
//                             <table className="min-w-full border-collapse">
//                               <thead style={{ backgroundColor: themeColors.lightBg }}>
//                                 <tr>
//                                   <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>From Date</th>
//                                   <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>To Date</th>
//                                   <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary, borderBottomColor: themeColors.border }}>Amount</th>
//                                 </tr>
//                               </thead>
//                               <tbody className="divide-y" style={{ borderColor: themeColors.lightBorder }}>
//                                 {row.expected_dates?.map((exp, idx) => (
//                                   <tr key={idx} className="hover:bg-white">
//                                     <td className="px-4 py-2 text-sm" style={{ color: themeColors.textPrimary, borderBottomColor: themeColors.lightBorder }}>{truncateToDate(exp.expected_from_date)}</td>
//                                     <td className="px-4 py-2 text-sm" style={{ color: themeColors.textPrimary, borderBottomColor: themeColors.lightBorder }}>{truncateToDate(exp.expected_to_date)}</td>
//                                     <td className="px-4 py-2 text-sm" style={{ color: themeColors.textPrimary, borderBottomColor: themeColors.lightBorder }}>₹{Number(exp.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
//                                   </tr>
//                                 )) || (
//                                   <tr>
//                                     <td colSpan={3} className="px-4 py-4 text-center text-sm" style={{ color: themeColors.textSecondary }}>
//                                       No expected dates
//                                     </td>
//                                   </tr>
//                                 )}
//                               </tbody>
//                             </table>
//                           </div>
//                         </details>
//                       </td>
//                     </tr>
//                   </React.Fragment>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {data.length === 0 && (
//           <div className="bg-white rounded-xl shadow-sm border p-8 text-center" style={{ borderColor: themeColors.border }}>
//             <p className="text-sm" style={{ color: themeColors.textSecondary }}>No records found.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewBilledDebtors;



// // ViewBilledDebtors.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Select from 'react-select';
// import { Building2, Edit3, X, Plus, Calendar, IndianRupee, AlertCircle } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   error: '#dc2626',
// };

// const selectStyles = {
//   control: (base) => ({
//     ...base,
//     borderColor: themeColors.border,
//     borderRadius: '0.5rem',
//     minHeight: '42px',
//     '&:hover': { borderColor: themeColors.primary },
//   }),
// };

// const ViewBilledDebtors = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editItem, setEditItem] = useState(null);
//   const [banks, setBanks] = useState([]);
//   const [expectedDates, setExpectedDates] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(''); // For showing error in modal

//   const fetchData = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/view-billed-debtors`);
//       setData(res.data.data || []);
//     } catch (err) {
//       alert('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchBanks = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
//       setBanks(res.data.data.map(b => ({ value: b.id, label: b.bank_name })));
//     } catch (err) {
//       console.error('Failed to load banks');
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     fetchBanks();
//   }, []);

//   const handleEdit = (row) => {
//     setEditItem({
//       ...row,
//       bill_date: row.bill_date?.split('T')[0] || '',
//       due_date: row.due_date?.split('T')[0] || '',
//       date_of_receipt: row.date_of_receipt?.split('T')[0] || '',
//     });
//     setExpectedDates(
//       row.expected_dates && row.expected_dates.length > 0
//         ? row.expected_dates.map(d => ({
//             expected_from_date: d.expected_from_date?.split('T')[0] || '',
//             expected_to_date: d.expected_to_date?.split('T')[0] || '',
//             amount: d.amount || ''
//           }))
//         : [{ expected_from_date: '', expected_to_date: '', amount: '' }]
//     );
//     setErrorMessage('');
//   };


// const handleSave = async () => {
//   setErrorMessage('');

//   // Validation
//   if (!editItem.finance_bank_id) {
//     setErrorMessage('Please select a Bank Account');
//     return;
//   }
//   if (!editItem.due_date) {
//     setErrorMessage('Due Date is required');
//     return;
//   }
//   if (!editItem.total_payment_due || parseFloat(editItem.total_payment_due) <= 0) {
//     setErrorMessage('Total Payment Due must be greater than 0');
//     return;
//   }

//   setSaving(true);

//   try {
//     const payload = {
//       id: editItem.id, // This is the key change
//       finance_bank_id: editItem.finance_bank_id,
//       po_details: editItem.po_details || null,
//       inv_no: editItem.inv_no || null,
//       bill_date: editItem.bill_date || null,
//       due_date: editItem.due_date,
//       finance_item_id: editItem.finance_item_id || null,
//       quantity: editItem.quantity ? parseFloat(editItem.quantity) : 0,
//       uom: editItem.uom ? String(editItem.uom).trim() || null : null,
//       rate: editItem.rate ? parseFloat(editItem.rate) : 0,
//       sale_amount: editItem.sale_amount ? parseFloat(editItem.sale_amount) : 0,
//       gst_amount: editItem.gst_amount ? parseFloat(editItem.gst_amount) : 0,
//       total_payment_due: parseFloat(editItem.total_payment_due),
//       date_of_receipt: editItem.date_of_receipt || null,
//       amount_received: editItem.amount_received ? parseFloat(editItem.amount_received) : null,
//       expected_dates: expectedDates
//         .filter(d => d.expected_from_date && d.expected_to_date && d.amount && parseFloat(d.amount) > 0)
//         .map(d => ({
//           expected_from_date: d.expected_from_date,
//           expected_to_date: d.expected_to_date,
//           amount: parseFloat(d.amount)
//         })),
//       updated_by: 1
//     };

//     // Now sending to body-only route
//     await axios.put(`${API_BASE_URL}/finance/update-billed-debtors`, payload);

//     alert('Updated successfully!');
//     setEditItem(null);
//     fetchData();
//   } catch (err) {
//     const msg = err.response?.data?.message || err.message || 'Update failed. Please try again.';
//     setErrorMessage(msg);
//     console.error('Update error:', err.response?.data || err);
//   } finally {
//     setSaving(false);
//   }
// };

//   if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

//   return (
//     <div className="min-h-screen p-8" style={{ backgroundColor: themeColors.lightBg }}>
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex items-center gap-4">
//           <Building2 className="w-12 h-12" style={{ color: themeColors.primary }} />
//           <h1 className="text-3xl font-bold">Billed Debtors Received</h1>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead style={{ backgroundColor: themeColors.lightBg }}>
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Party</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Bank</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Invoice</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Due Date</th>
//                   <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Total Due</th>
//                   <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Balance</th>
//                   <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {data.length === 0 ? (
//                   <tr><td colSpan="7" className="text-center py-12 text-gray-500">No records found</td></tr>
//                 ) : (
//                   data.map(row => (
//                     <tr key={row.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 font-medium">{row.party_name || '-'}</td>
//                       <td className="px-6 py-4 font-semibold" style={{ color: themeColors.primary }}>
//                         {row.bank_name || '—'}
//                       </td>
//                       <td className="px-6 py-4">{row.inv_no || '-'}</td>
//                       <td className="px-6 py-4">{row.due_date?.split('T')[0] || '-'}</td>
//                       <td className="px-6 py-4 text-right font-bold">
//                         <IndianRupee size={16} className="inline" />
//                         {Number(row.total_payment_due || 0).toLocaleString('en-IN')}
//                       </td>
//                       <td className="px-6 py-4 text-right font-bold text-red-600">
//                         <IndianRupee size={16} className="inline" />
//                         {Number(row.balance_amount || 0).toLocaleString('en-IN')}
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <button onClick={() => handleEdit(row)} className="p-2 rounded-lg hover:bg-amber-100 transition">
//                           <Edit3 size={18} style={{ color: themeColors.accent }} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Edit Modal */}
//       {editItem && (
//         <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto p-8">
//             <div className="flex justify-between items-center border-b pb-4 mb-6">
//               <h2 className="text-2xl font-bold flex items-center gap-3">
//                 <Edit3 style={{ color: themeColors.accent }} />
//                 Edit Receivable #{editItem.id}
//               </h2>
//               <button onClick={() => { setEditItem(null); setErrorMessage(''); }} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X size={28} />
//               </button>
//             </div>

//             {/* Error Alert */}
//             {errorMessage && (
//               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
//                 <AlertCircle className="text-red-600" size={20} />
//                 <p className="text-red-700 font-medium">{errorMessage}</p>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {/* All Fields */}
//               <div>
//                 <label className="block text-sm font-semibold mb-2 text-red-600">Bank Account *</label>
//                 <Select
//                   options={banks}
//                   value={banks.find(b => b.value === editItem.finance_bank_id) || null}
//                   onChange={opt => setEditItem(prev => ({ ...prev, finance_bank_id: opt?.value || null }))}
//                   placeholder="Select bank"
//                   styles={selectStyles}
//                   isClearable
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">PO Details</label>
//                 <textarea
//                   value={editItem.po_details || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, po_details: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   rows={2}
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">Invoice No</label>
//                 <input
//                   type="text"
//                   value={editItem.inv_no || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, inv_no: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">Bill Date</label>
//                 <input
//                   type="date"
//                   value={editItem.bill_date || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, bill_date: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2 text-red-600">Due Date *</label>
//                 <input
//                   type="date"
//                   value={editItem.due_date || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, due_date: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   required
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">Item Name</label>
//                 <input
//                   type="text"
//                   value={editItem.item_name || ''}
//                   readOnly
//                   className="w-full px-4 py-2 border rounded-lg bg-gray-50"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">Quantity</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={editItem.quantity || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, quantity: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">UOM</label>
//                 <input
//                   type="text"
//                   value={editItem.uom || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, uom: e.target.value }))}
//                   placeholder="e.g., Nos, Kg, Ltr"
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">Rate</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={editItem.rate || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, rate: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">Sale Amount</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={editItem.sale_amount || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, sale_amount: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">GST Amount</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={editItem.gst_amount || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, gst_amount: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2 text-red-600">Total Payment Due *</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={editItem.total_payment_due || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, total_payment_due: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg font-bold"
//                   required
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">Amount Received</label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={editItem.amount_received || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, amount_received: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-2">Date of Receipt</label>
//                 <input
//                   type="date"
//                   value={editItem.date_of_receipt || ''}
//                   onChange={e => setEditItem(prev => ({ ...prev, date_of_receipt: e.target.value }))}
//                   className="w-full px-4 py-2 border rounded-lg"
//                   style={{ borderColor: themeColors.border }}
//                 />
//               </div>
//             </div>

//             {/* Expected Dates Section */}
//             <div className="mt-10 border-t pt-8">
//               <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
//                 <Calendar style={{ color: themeColors.primary }} />
//                 Expected Payment Dates
//               </h3>
//               {expectedDates.map((date, idx) => (
//                 <div key={idx} className="flex gap-4 mb-3 items-center">
//                   <input
//                     type="date"
//                     value={date.expected_from_date || ''}
//                     onChange={e => {
//                       const updated = [...expectedDates];
//                       updated[idx].expected_from_date = e.target.value;
//                       setExpectedDates(updated);
//                     }}
//                     className="px-4 py-2 border rounded-lg"
//                     style={{ borderColor: themeColors.border }}
//                   />
//                   <input
//                     type="date"
//                     value={date.expected_to_date || ''}
//                     onChange={e => {
//                       const updated = [...expectedDates];
//                       updated[idx].expected_to_date = e.target.value;
//                       setExpectedDates(updated);
//                     }}
//                     className="px-4 py-2 border rounded-lg"
//                     style={{ borderColor: themeColors.border }}
//                   />
//                   <input
//                     type="number"
//                     placeholder="Amount"
//                     value={date.amount || ''}
//                     onChange={e => {
//                       const updated = [...expectedDates];
//                       updated[idx].amount = e.target.value;
//                       setExpectedDates(updated);
//                     }}
//                     className="px-4 py-2 border rounded-lg w-32"
//                     style={{ borderColor: themeColors.border }}
//                   />
//                   {expectedDates.length > 1 && (
//                     <button
//                       onClick={() => setExpectedDates(prev => prev.filter((_, i) => i !== idx))}
//                       className="text-red-600 p-2 hover:bg-red-50 rounded"
//                     >
//                       <X size={20} />
//                     </button>
//                   )}
//                 </div>
//               ))}
//               <button
//                 onClick={() => setExpectedDates(prev => [...prev, { expected_from_date: '', expected_to_date: '', amount: '' }])}
//                 className="mt-3 text-sm flex items-center gap- gap-2 text-blue-600 hover:text-blue-800"
//               >
//                 <Plus size={18} /> Add Expected Date
//               </button>
//             </div>

//             {/* Buttons */}
//             <div className="mt-10 flex justify-end gap-4 border-t pt-6">
//               <button
//                 onClick={() => { setEditItem(null); setErrorMessage(''); }}
//                 className="px-8 py-3 border rounded-lg font-medium hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={saving}
//                 className="px-10 py-3 text-white rounded-lg font-medium disabled:opacity-70 transition"
//                 style={{ backgroundColor: themeColors.primary }}
//               >
//                 {saving ? 'Saving...' : 'Update Receivable'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewBilledDebtors;
















import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useParams } from 'react-router-dom'; // ← Added for encodedUserId
import { Building2, Edit3, X, Plus, Calendar, IndianRupee, AlertCircle } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  error: '#dc2626',
};

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: themeColors.border,
    borderRadius: '0.5rem',
    minHeight: '42px',
    '&:hover': { borderColor: themeColors.primary },
  }),
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
    } catch {
      return null;
    }
  }, [encodedUserId]);
};

const ViewBilledDebtors = () => {
  const currentUserId = useCurrentUserId(); // ← Real user from URL

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [banks, setBanks] = useState([]);
  const [expectedDates, setExpectedDates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/view-billed-debtors`);
      setData(res.data.data || []);
    } catch (err) {
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      setBanks(res.data.data.map(b => ({ value: b.id, label: b.bank_name })));
    } catch (err) {
      console.error('Failed to load banks');
    }
  };

  useEffect(() => {
    fetchData();
    fetchBanks();
  }, []);

  const handleEdit = (row) => {
    setEditItem({
      ...row,
      bill_date: row.bill_date?.split('T')[0] || '',
      due_date: row.due_date?.split('T')[0] || '',
      date_of_receipt: row.date_of_receipt?.split('T')[0] || '',
    });
    setExpectedDates(
      row.expected_dates && row.expected_dates.length > 0
        ? row.expected_dates.map(d => ({
            expected_from_date: d.expected_from_date?.split('T')[0] || '',
            expected_to_date: d.expected_to_date?.split('T')[0] || '',
            amount: d.amount || ''
          }))
        : [{ expected_from_date: '', expected_to_date: '', amount: '' }]
    );
    setErrorMessage('');
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (!currentUserId) {
      setErrorMessage('User not authenticated');
      return;
    }

    if (!editItem.finance_bank_id) {
      setErrorMessage('Please select a Bank Account');
      return;
    }
    if (!editItem.due_date) {
      setErrorMessage('Due Date is required');
      return;
    }
    if (!editItem.total_payment_due || parseFloat(editItem.total_payment_due) <= 0) {
      setErrorMessage('Total Payment Due must be greater than 0');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        id: editItem.id,
        finance_bank_id: editItem.finance_bank_id,
        po_details: editItem.po_details || null,
        inv_no: editItem.inv_no || null,
        bill_date: editItem.bill_date || null,
        due_date: editItem.due_date,
        finance_item_id: editItem.finance_item_id || null,
        quantity: editItem.quantity ? parseFloat(editItem.quantity) : 0,
        uom: editItem.uom ? String(editItem.uom).trim() || null : null,
        rate: editItem.rate ? parseFloat(editItem.rate) : 0,
        sale_amount: editItem.sale_amount ? parseFloat(editItem.sale_amount) : 0,
        gst_amount: editItem.gst_amount ? parseFloat(editItem.gst_amount) : 0,
        total_payment_due: parseFloat(editItem.total_payment_due),
        date_of_receipt: editItem.date_of_receipt || null,
        amount_received: editItem.amount_received ? parseFloat(editItem.amount_received) : null,
        expected_dates: expectedDates
          .filter(d => d.expected_from_date && d.expected_to_date && d.amount && parseFloat(d.amount) > 0)
          .map(d => ({
            expected_from_date: d.expected_from_date,
            expected_to_date: d.expected_to_date,
            amount: parseFloat(d.amount)
          })),
        updated_by: currentUserId  // ← Real user from URL
      };

      await axios.put(`${API_BASE_URL}/finance/update-billed-debtors`, payload);

      alert('Updated successfully!');
      setEditItem(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update failed. Please try again.';
      setErrorMessage(msg);
      console.error('Update error:', err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '—';

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex items-center gap-4">
          <Building2 className="w-12 h-12" style={{ color: themeColors.primary }} />
          <h1 className="text-3xl font-bold">Billed Debtors Received</h1>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: themeColors.lightBg }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Party</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Bank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Total Due</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Expected Dates</th> {/* ← New Column */}
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.length === 0 ? (
                  <tr><td colSpan="8" className="text-center py-12 text-gray-500">No records found</td></tr>
                ) : (
                  data.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium">{row.party_name || '-'}</td>
                      <td className="px-6 py-4 font-semibold" style={{ color: themeColors.primary }}>
                        {row.bank_name || '—'}
                      </td>
                      <td className="px-6 py-4">{row.inv_no || '-'}</td>
                      <td className="px-6 py-4">{formatDate(row.due_date)}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        <IndianRupee size={16} className="inline" />
                        {Number(row.total_payment_due || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">
                        <IndianRupee size={16} className="inline" />
                        {Number(row.balance_amount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Expected Dates Column */}
                      <td className="px-6 py-4">
                        {row.expected_dates && row.expected_dates.length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-sm font-medium underline hover:text-blue-600" style={{ color: themeColors.primary }}>
                              View ({row.expected_dates.length})
                            </summary>
                            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">From</th>
                                    <th className="text-left py-2">To</th>
                                    <th className="text-right py-2">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row.expected_dates.map((exp, i) => (
                                    <tr key={i}>
                                      <td className="py-1">{formatDate(exp.expected_from_date)}</td>
                                      <td className="py-1">{formatDate(exp.expected_to_date)}</td>
                                      <td className="py-1 text-right">
                                        ₹{Number(exp.amount || 0).toLocaleString('en-IN')}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleEdit(row)} className="p-2 rounded-lg hover:bg-amber-100 transition">
                          <Edit3 size={18} style={{ color: themeColors.accent }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal - Unchanged */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto p-8">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Edit3 style={{ color: themeColors.accent }} />
                Edit Receivable #{editItem.id}
              </h2>
              <button onClick={() => { setEditItem(null); setErrorMessage(''); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={28} />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-700 font-medium">{errorMessage}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-red-600">Bank Account *</label>
                <Select
                  options={banks}
                  value={banks.find(b => b.value === editItem.finance_bank_id) || null}
                  onChange={opt => setEditItem(prev => ({ ...prev, finance_bank_id: opt?.value || null }))}
                  placeholder="Select bank"
                  styles={selectStyles}
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">PO Details</label>
                <textarea
                  value={editItem.po_details || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, po_details: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Invoice No</label>
                <input
                  type="text"
                  value={editItem.inv_no || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, inv_no: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Bill Date</label>
                <input
                  type="date"
                  value={editItem.bill_date || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, bill_date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-red-600">Due Date *</label>
                <input
                  type="date"
                  value={editItem.due_date || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Item Name</label>
                <input
                  type="text"
                  value={editItem.item_name || ''}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.quantity || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">UOM</label>
                <input
                  type="text"
                  value={editItem.uom || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, uom: e.target.value }))}
                  placeholder="e.g., Nos, Kg, Ltr"
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.rate || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, rate: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Sale Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.sale_amount || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, sale_amount: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">GST Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.gst_amount || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, gst_amount: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-red-600">Total Payment Due *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.total_payment_due || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, total_payment_due: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg font-bold"
                  required
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Amount Received</label>
                <input
                  type="number"
                  step="0.01"
                  value={editItem.amount_received || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, amount_received: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Date of Receipt</label>
                <input
                  type="date"
                  value={editItem.date_of_receipt || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, date_of_receipt: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>
            </div>

            {/* Expected Dates Section */}
            <div className="mt-10 border-t pt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar style={{ color: themeColors.primary }} />
                Expected Payment Dates
              </h3>
              {expectedDates.map((date, idx) => (
                <div key={idx} className="flex gap-4 mb-3 items-center">
                  <input
                    type="date"
                    value={date.expected_from_date || ''}
                    onChange={e => {
                      const updated = [...expectedDates];
                      updated[idx].expected_from_date = e.target.value;
                      setExpectedDates(updated);
                    }}
                    className="px-4 py-2 border rounded-lg"
                    style={{ borderColor: themeColors.border }}
                  />
                  <input
                    type="date"
                    value={date.expected_to_date || ''}
                    onChange={e => {
                      const updated = [...expectedDates];
                      updated[idx].expected_to_date = e.target.value;
                      setExpectedDates(updated);
                    }}
                    className="px-4 py-2 border rounded-lg"
                    style={{ borderColor: themeColors.border }}
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={date.amount || ''}
                    onChange={e => {
                      const updated = [...expectedDates];
                      updated[idx].amount = e.target.value;
                      setExpectedDates(updated);
                    }}
                    className="px-4 py-2 border rounded-lg w-32"
                    style={{ borderColor: themeColors.border }}
                  />
                  {expectedDates.length > 1 && (
                    <button
                      onClick={() => setExpectedDates(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-600 p-2 hover:bg-red-50 rounded"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setExpectedDates(prev => [...prev, { expected_from_date: '', expected_to_date: '', amount: '' }])}
                className="mt-3 text-sm flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Plus size={18} /> Add Expected Date
              </button>
            </div>

            {/* Buttons */}
            <div className="mt-10 flex justify-end gap-4 border-t pt-6">
              <button
                onClick={() => { setEditItem(null); setErrorMessage(''); }}
                className="px-8 py-3 border rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-10 py-3 text-white rounded-lg font-medium disabled:opacity-70 transition"
                style={{ backgroundColor: themeColors.primary }}
              >
                {saving ? 'Saving...' : 'Update Receivable'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBilledDebtors;
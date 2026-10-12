import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Plus, Calendar, Edit, Trash2, Eye, X, Save } from 'lucide-react';
// import { toast } from 'react-toastify';

// const SalesRegister = () => {
//   const [sales, setSales] = useState([]);
//   const [financialYears, setFinancialYears] = useState([]);
//   const [selectedYear, setSelectedYear] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [viewingId, setViewingId] = useState(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     finance_year_id: '',
//     transaction_date: '',
//     customer_name: '',
//     invoice_no: '',
//     invoice_description: '',
//     rate: '',
//     uom: '',
//     quantity: '',
//     gst: '',
//     total_value: '',
//     date_of_payment: '',
//     utr_details: '',
//     po_work_order_no: ''
//   });

//   // Fetch financial years on component mount
//   useEffect(() => {
//     fetchFinancialYears();
//   }, []);

//   // Fetch sales when year changes
//   useEffect(() => {
//     if (selectedYear) {
//       fetchSales();
//     }
//   }, [selectedYear]);

//   const fetchFinancialYears = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/finance/financial-years`);
//       const data = response.data.data || response.data;
//       const yearsArray = Array.isArray(data) ? data : [];
//       setFinancialYears(yearsArray);
      
//       const activeYear = yearsArray.find(year => year.is_active === 1 || year.is_active === true);
//       if (activeYear) {
//         setSelectedYear(activeYear.id);
//         setFormData(prev => ({ ...prev, finance_year_id: activeYear.id }));
//       }
//     } catch (error) {
//       console.error('Error fetching financial years:', error);
//       toast.error('Failed to fetch financial years');
//       setFinancialYears([]);
//     }
//   };

//   const fetchSales = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/finance/sales-registers?finance_year_id=${selectedYear}`);
//       const data = response.data.data || response.data;
//       const records = data.records || data;
//       setSales(Array.isArray(records) ? records : []);
//     } catch (error) {
//       console.error('Error fetching sales:', error);
//       toast.error('Failed to fetch sales');
//       setSales([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleYearChange = (e) => {
//     const yearId = parseInt(e.target.value);
//     setSelectedYear(yearId);
//     setFormData(prev => ({ ...prev, finance_year_id: yearId }));
//   };

//   const resetForm = () => {
//     setFormData({
//       finance_year_id: selectedYear || '',
//       transaction_date: '',
//       customer_name: '',
//       invoice_no: '',
//       invoice_description: '',
//       rate: '',
//       uom: '',
//       quantity: '',
//       gst: '',
//       total_value: '',
//       date_of_payment: '',
//       utr_details: '',
//       po_work_order_no: ''
//     });
//     setEditingId(null);
//     setViewingId(null);
//   };

//   const handleCreate = () => {
//     resetForm();
//     setShowForm(true);
//   };

//   const handleEdit = (item) => {
//     setFormData({
//       finance_year_id: item.finance_year_id,
//       transaction_date: item.transaction_date,
//       customer_name: item.customer_name || '',
//       invoice_no: item.invoice_no || '',
//       invoice_description: item.invoice_description || '',
//       rate: item.rate || '',
//       uom: item.uom || '',
//       quantity: item.quantity || '',
//       gst: item.gst || '',
//       total_value: item.total_value || '',
//       date_of_payment: item.date_of_payment || '',
//       utr_details: item.utr_details || '',
//       po_work_order_no: item.po_work_order_no || ''
//     });
//     setEditingId(item.id);
//     setShowForm(true);
//   };

//   const handleView = (item) => {
//     setViewingId(item.id);
//     setFormData({
//       finance_year_id: item.finance_year_id,
//       transaction_date: item.transaction_date,
//       customer_name: item.customer_name || '',
//       invoice_no: item.invoice_no || '',
//       invoice_description: item.invoice_description || '',
//       rate: item.rate || '',
//       uom: item.uom || '',
//       quantity: item.quantity || '',
//       gst: item.gst || '',
//       total_value: item.total_value || '',
//       date_of_payment: item.date_of_payment || '',
//       utr_details: item.utr_details || '',
//       po_work_order_no: item.po_work_order_no || ''
//     });
//     setShowForm(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const payload = {
//         ...formData,
//         rate: parseFloat(formData.rate) || 0,
//         quantity: parseFloat(formData.quantity) || 0,
//         gst: parseFloat(formData.gst) || 0,
//         total_value: parseFloat(formData.total_value) || 0,
//         created_by: 1
//       };

//       if (editingId) {
//         await axios.put(`${API_BASE_URL}/finance/update-sales-register/${editingId}`, {
//           ...payload,
//           updated_by: 1
//         });
//         toast.success('Sales record updated successfully');
//       } else {
//         await axios.post(`${API_BASE_URL}/finance/create-sales-register`, payload);
//         toast.success('Sales record created successfully');
//       }
//       setShowForm(false);
//       resetForm();
//       fetchSales();
//     } catch (error) {
//       console.error('Error saving sales:', error);
//       toast.error(error.response?.data?.message || 'Failed to save sales');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this record?')) return;
//     try {
//       await axios.delete(`${API_BASE_URL}/finance/delete-sales-register/${id}`);
//       toast.success('Record deleted successfully');
//       fetchSales();
//     } catch (error) {
//       console.error('Error deleting sales:', error);
//       toast.error('Failed to delete record');
//     }
//   };

//   const handleCloseForm = () => {
//     setShowForm(false);
//     resetForm();
//   };

//   return (
//     <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//           <div className="flex flex-wrap justify-between items-center gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">Sales Register</h1>
//               <p className="text-sm text-gray-500 mt-1">Manage all sales transactions</p>
//             </div>
            
//             <div className="flex flex-wrap items-center gap-3">
//               {/* Financial Year Dropdown */}
//               <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
//                 <Calendar className="w-5 h-5 text-green-600" />
//                 <select
//                   value={selectedYear}
//                   onChange={handleYearChange}
//                   className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
//                 >
//                   <option value="">Select Financial Year</option>
//                   {financialYears.map(year => (
//                     <option key={year.id} value={year.id}>
//                       {year.start_year} - {year.end_year}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Create New Button */}
//               <button
//                 onClick={handleCreate}
//                 className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
//               >
//                 <Plus className="w-4 h-4" />
//                 Create New
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice No</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
//                   <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">UOM</th>
//                   <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
//                   <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">GST</th>
//                   <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">UTR</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PO/Work Order</th>
//                   <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {loading ? (
//                   <tr>
//                     <td colSpan="13" className="px-4 py-8 text-center text-gray-500">Loading...</td>
//                   </tr>
//                 ) : sales.length === 0 ? (
//                   <tr>
//                     <td colSpan="13" className="px-4 py-8 text-center text-gray-500">No sales records found</td>
//                   </tr>
//                 ) : (
//                   sales.map((item) => (
//                     <tr key={item.id} className="hover:bg-green-50 transition-colors duration-150">
//                       <td className="px-4 py-3 text-sm text-gray-900">{item.transaction_date}</td>
//                       <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.customer_name}</td>
//                       <td className="px-4 py-3 text-sm text-gray-700">{item.invoice_no}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{item.invoice_description || '-'}</td>
//                       <td className="px-4 py-3 text-sm text-right text-gray-700">₹{parseFloat(item.rate).toFixed(2)}</td>
//                       <td className="px-4 py-3 text-sm text-center text-gray-700">{item.uom || '-'}</td>
//                       <td className="px-4 py-3 text-sm text-right text-gray-700">{parseFloat(item.quantity).toFixed(2)}</td>
//                       <td className="px-4 py-3 text-sm text-right text-gray-700">₹{parseFloat(item.gst).toFixed(2)}</td>
//                       <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">₹{parseFloat(item.total_value).toFixed(2)}</td>
//                       <td className="px-4 py-3 text-sm text-gray-700">{item.date_of_payment || '-'}</td>
//                       <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{item.utr_details || '-'}</td>
//                       <td className="px-4 py-3 text-sm text-gray-700">{item.po_work_order_no || '-'}</td>
//                       <td className="px-4 py-3 text-sm text-center">
//                         <div className="flex justify-center gap-2">
//                           <button
//                             onClick={() => handleView(item)}
//                             className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
//                             title="View"
//                           >
//                             <Eye className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
//                             title="Edit"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(item.id)}
//                             className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Modal Form */}
//         {showForm && (
//           <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
//               <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
//                 <h2 className="text-2xl font-bold text-gray-800">
//                   {viewingId ? 'View Sales Record' : editingId ? 'Edit Sales Record' : 'Create New Sales Record'}
//                 </h2>
//                 <button
//                   onClick={handleCloseForm}
//                   className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit} className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {/* Financial Year */}
//                   <div className="lg:col-span-3">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year *</label>
//                     <select
//                       name="finance_year_id"
//                       value={formData.finance_year_id}
//                       onChange={handleInputChange}
//                       required
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                     >
//                       <option value="">Select Financial Year</option>
//                       {financialYears.map(year => (
//                         <option key={year.id} value={year.id}>
//                           {year.start_year} - {year.end_year}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date *</label>
//                     <input
//                       type="date"
//                       name="transaction_date"
//                       value={formData.transaction_date}
//                       onChange={handleInputChange}
//                       required
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
//                     <input
//                       type="text"
//                       name="customer_name"
//                       value={formData.customer_name}
//                       onChange={handleInputChange}
//                       required
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="Enter customer name"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No *</label>
//                     <input
//                       type="text"
//                       name="invoice_no"
//                       value={formData.invoice_no}
//                       onChange={handleInputChange}
//                       required
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="Enter invoice number"
//                     />
//                   </div>

//                   <div className="lg:col-span-3">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Description</label>
//                     <textarea
//                       name="invoice_description"
//                       value={formData.invoice_description}
//                       onChange={handleInputChange}
//                       disabled={!!viewingId}
//                       rows="2"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="Enter invoice description"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
//                     <input
//                       type="number"
//                       name="rate"
//                       value={formData.rate}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="0.00"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
//                     <input
//                       type="text"
//                       name="uom"
//                       value={formData.uom}
//                       onChange={handleInputChange}
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="e.g., KGS, LTR, NOS"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//                     <input
//                       type="number"
//                       name="quantity"
//                       value={formData.quantity}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="0.00"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">GST</label>
//                     <input
//                       type="number"
//                       name="gst"
//                       value={formData.gst}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="0.00"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
//                     <input
//                       type="number"
//                       name="total_value"
//                       value={formData.total_value}
//                       onChange={handleInputChange}
//                       step="0.01"
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="0.00"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Date of Payment</label>
//                     <input
//                       type="date"
//                       name="date_of_payment"
//                       value={formData.date_of_payment}
//                       onChange={handleInputChange}
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">UTR Details</label>
//                     <input
//                       type="text"
//                       name="utr_details"
//                       value={formData.utr_details}
//                       onChange={handleInputChange}
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="Enter UTR details"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">PO/Work Order No</label>
//                     <input
//                       type="text"
//                       name="po_work_order_no"
//                       value={formData.po_work_order_no}
//                       onChange={handleInputChange}
//                       disabled={!!viewingId}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
//                       placeholder="Enter PO or work order number"
//                     />
//                   </div>
//                 </div>

//                 {!viewingId && (
//                   <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-6">
//                     <button
//                       type="button"
//                       onClick={handleCloseForm}
//                       className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
//                     >
//                       <Save className="w-4 h-4" />
//                       {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
//                     </button>
//                   </div>
//                 )}

//                 {viewingId && (
//                   <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
//                     <button
//                       type="button"
//                       onClick={handleCloseForm}
//                       className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 )}
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SalesRegister;













import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, Edit, Trash2, Eye, X, Save, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const SalesRegister = () => {
  const [sales, setSales] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    finance_year_id: '',
    transaction_date: '',
    customer_name: '',
    invoice_no: '',
    invoice_description: '',
    rate: '',
    uom: '',
    quantity: '',
    gst: '',
    total_value: '',
    date_of_payment: '',
    utr_details: '',
    po_work_order_no: ''
  });

  // Fetch financial years on component mount
  useEffect(() => {
    fetchFinancialYears();
  }, []);

  // Fetch sales when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchSales();
    }
  }, [selectedYear]);

  const fetchFinancialYears = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/financial-years`);
      const data = response.data.data || response.data;
      const yearsArray = Array.isArray(data) ? data : [];
      setFinancialYears(yearsArray);
      
      const activeYear = yearsArray.find(year => year.is_active === 1 || year.is_active === true);
      if (activeYear) {
        setSelectedYear(activeYear.id);
        setFormData(prev => ({ ...prev, finance_year_id: activeYear.id }));
        // Auto-sync on initial load
        syncBankStatements(activeYear.id);
      }
    } catch (error) {
      console.error('Error fetching financial years:', error);
      toast.error('Failed to fetch financial years');
      setFinancialYears([]);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/sales-registers?finance_year_id=${selectedYear}`);
      const data = response.data.data || response.data;
      const records = data.records || data;
      setSales(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to fetch sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const syncBankStatements = async (yearId = selectedYear) => {
    if (!yearId) {
      toast.warning('Please select a financial year first');
      return;
    }

    setSyncing(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/finance/sync-bank-statement?finance_year_id=${yearId}`
      );
      
      const { data } = response.data;
      if (data.synced_sales > 0 || data.synced_purchase > 0) {
        toast.success(
          `Bank data synced! Sales: ${data.synced_sales}, Purchase: ${data.synced_purchase}`
        );
      } else {
        toast.info('No new data to sync from bank statements');
      }
      
      // Refresh the data
      await fetchSales();
    } catch (error) {
      console.error('Error syncing bank statements:', error);
      toast.error('Failed to sync bank statements');
    } finally {
      setSyncing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleYearChange = async (e) => {
    const yearId = parseInt(e.target.value);
    setSelectedYear(yearId);
    setFormData(prev => ({ ...prev, finance_year_id: yearId }));
    
    // Auto-sync when year changes
    if (yearId) {
      await syncBankStatements(yearId);
    }
  };

  const resetForm = () => {
    setFormData({
      finance_year_id: selectedYear || '',
      transaction_date: '',
      customer_name: '',
      invoice_no: '',
      invoice_description: '',
      rate: '',
      uom: '',
      quantity: '',
      gst: '',
      total_value: '',
      date_of_payment: '',
      utr_details: '',
      po_work_order_no: ''
    });
    setEditingId(null);
    setViewingId(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setFormData({
      finance_year_id: item.finance_year_id,
      transaction_date: item.transaction_date,
      customer_name: item.customer_name || '',
      invoice_no: item.invoice_no || '',
      invoice_description: item.invoice_description || '',
      rate: item.rate || '',
      uom: item.uom || '',
      quantity: item.quantity || '',
      gst: item.gst || '',
      total_value: item.total_value || '',
      date_of_payment: item.date_of_payment || '',
      utr_details: item.utr_details || '',
      po_work_order_no: item.po_work_order_no || ''
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleView = (item) => {
    setViewingId(item.id);
    setFormData({
      finance_year_id: item.finance_year_id,
      transaction_date: item.transaction_date,
      customer_name: item.customer_name || '',
      invoice_no: item.invoice_no || '',
      invoice_description: item.invoice_description || '',
      rate: item.rate || '',
      uom: item.uom || '',
      quantity: item.quantity || '',
      gst: item.gst || '',
      total_value: item.total_value || '',
      date_of_payment: item.date_of_payment || '',
      utr_details: item.utr_details || '',
      po_work_order_no: item.po_work_order_no || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        rate: parseFloat(formData.rate) || 0,
        quantity: parseFloat(formData.quantity) || 0,
        gst: parseFloat(formData.gst) || 0,
        total_value: parseFloat(formData.total_value) || 0,
        created_by: 1
      };

      // Remove fields that will be auto-fetched from backend
      delete payload.date_of_payment;
      delete payload.utr_details;
      delete payload.po_work_order_no;

      if (editingId) {
        const response = await axios.put(`${API_BASE_URL}/finance/update-sales-register/${editingId}`, {
          ...payload,
          updated_by: 1
        });
        toast.success('Sales record updated successfully');
        if (response.data?.data?.bank_details_fetched) {
          toast.info('Payment details auto-fetched from bank statement');
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/finance/create-sales-register`, payload);
        toast.success('Sales record created successfully');
        if (response.data?.data?.bank_details_fetched) {
          toast.info('Payment details auto-fetched from bank statement');
        }
      }
      setShowForm(false);
      resetForm();
      await fetchSales();
    } catch (error) {
      console.error('Error saving sales:', error);
      toast.error(error.response?.data?.message || 'Failed to save sales');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/finance/delete-sales-register/${id}`);
      toast.success('Record deleted successfully');
      await fetchSales();
    } catch (error) {
      console.error('Error deleting sales:', error);
      toast.error('Failed to delete record');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sales Register</h1>
              <p className="text-sm text-gray-500 mt-1">Manage all sales transactions - Payment details auto-fetched from bank statements</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Financial Year Dropdown */}
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <Calendar className="w-5 h-5 text-green-600" />
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
                >
                  <option value="">Select Financial Year</option>
                  {financialYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.start_year} - {year.end_year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sync Button */}
              <button
                onClick={() => syncBankStatements()}
                disabled={!selectedYear || syncing}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Bank Data'}
              </button>

              {/* Create New Button */}
              <button
                onClick={handleCreate}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Create New
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">UOM</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">GST</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">UTR</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PO/Work Order</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      Loading...
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                      No sales records found. Click "Sync Bank Data" to import from bank statements.
                    </td>
                  </tr>
                ) : (
                  sales.map((item) => (
                    <tr key={item.id} className="hover:bg-green-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.transaction_date}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.invoice_no}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{item.invoice_description || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">₹{parseFloat(item.rate).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">{item.uom || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{parseFloat(item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">₹{parseFloat(item.gst).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">₹{parseFloat(item.total_value).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.date_of_payment || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{item.utr_details || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.po_work_order_no || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
                <h2 className="text-2xl font-bold text-gray-800">
                  {viewingId ? 'View Sales Record' : editingId ? 'Edit Sales Record' : 'Create New Sales Record'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Financial Year */}
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year *</label>
                    <select
                      name="finance_year_id"
                      value={formData.finance_year_id}
                      onChange={handleInputChange}
                      required
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Financial Year</option>
                      {financialYears.map(year => (
                        <option key={year.id} value={year.id}>
                          {year.start_year} - {year.end_year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date *</label>
                    <input
                      type="date"
                      name="transaction_date"
                      value={formData.transaction_date}
                      onChange={handleInputChange}
                      required
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No *</label>
                    <input
                      type="text"
                      name="invoice_no"
                      value={formData.invoice_no}
                      onChange={handleInputChange}
                      required
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="Enter invoice number"
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Description</label>
                    <textarea
                      name="invoice_description"
                      value={formData.invoice_description}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="Enter invoice description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      step="0.01"
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                    <input
                      type="text"
                      name="uom"
                      value={formData.uom}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="e.g., KGS, LTR, NOS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      step="0.01"
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST</label>
                    <input
                      type="number"
                      name="gst"
                      value={formData.gst}
                      onChange={handleInputChange}
                      step="0.01"
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Value</label>
                    <input
                      type="number"
                      name="total_value"
                      value={formData.total_value}
                      onChange={handleInputChange}
                      step="0.01"
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Read-only fields - auto-filled from bank statement */}
                  <div className="border-t border-gray-200 col-span-full pt-4 mt-2">
                    <p className="text-sm font-medium text-gray-600 mb-3">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">Auto-filled from Bank Statement</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Payment</label>
                    <input
                      type="text"
                      value={formData.date_of_payment || 'Auto-fetched from bank'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UTR Details</label>
                    <input
                      type="text"
                      value={formData.utr_details || 'Auto-fetched from bank'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PO/Work Order No</label>
                    <input
                      type="text"
                      value={formData.po_work_order_no || 'Auto-fetched from bank'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                {!viewingId && (
                  <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </button>
                  </div>
                )}

                {viewingId && (
                  <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesRegister;
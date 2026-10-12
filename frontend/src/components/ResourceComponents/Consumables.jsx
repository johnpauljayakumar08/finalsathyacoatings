import { API_BASE_URL } from "../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Select from 'react-select';
// import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
// import { format } from 'date-fns';
// import Swal from 'sweetalert2';

// const Consumables = () => {
//   const [masterConsumables, setMasterConsumables] = useState([]);
//   const [filteredConsumables, setFilteredConsumables] = useState([]);
//   const [dispatches, setDispatches] = useState([]);
//   const [filteredDispatches, setFilteredDispatches] = useState([]);
//   const [viewMode, setViewMode] = useState('master');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filters
//   const [searchTerm, setSearchTerm] = useState('');
//   const [usageFilter, setUsageFilter] = useState('all');
//   const [dispatchStartDate, setDispatchStartDate] = useState('');
//   const [dispatchEndDate, setDispatchEndDate] = useState('');
//   const [showFilters, setShowFilters] = useState(false);

//   // Add modal
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [addForm, setAddForm] = useState({
//     name: '',
//     usageType: 'single use',
//   });
//   const [adding, setAdding] = useState(false);

//   // Dispatch modal + selection
//   const [selectedConsumable, setSelectedConsumable] = useState(null);
//   const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
//   const [dispatchForm, setDispatchForm] = useState({
//     quantity: '',
//     currentSite: '',
//     vehicleName: '',
//     vehicleNumber: '',
//     driverName: '',
//     driverMobile: '',
//     destinationSite: '',
//     amount: '',
//     dispatchDate: new Date().toISOString().split('T')[0],
//   });
//   const [dispatchLoading, setDispatchLoading] = useState(false);

//   // Expanded dispatch row
//   const [expandedDispatchId, setExpandedDispatchId] = useState(null);

//   // Fetch data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         const consRes = await axios.get(`${API_BASE_URL}/resource/consumables`);
//         if (consRes.data?.status === 'success') {
//           setMasterConsumables(consRes.data.data || []);
//           setFilteredConsumables(consRes.data.data || []);
//         }

//         const dispRes = await axios.get(`${API_BASE_URL}/resource/dispatches`);
//         if (dispRes.data?.status === 'success') {
//           setDispatches(dispRes.data.data || []);
//           setFilteredDispatches(dispRes.data.data || []);
//         }
//       } catch (err) {
//         console.error(err);
//         setError('Failed to load data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Filter consumables
//   useEffect(() => {
//     let result = [...masterConsumables];

//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter(item => item.name.toLowerCase().includes(term));
//     }

//     if (usageFilter !== 'all') {
//       result = result.filter(item => item.consumableStatus === usageFilter);
//     }

//     setFilteredConsumables(result);
//   }, [searchTerm, usageFilter, masterConsumables]);

//   // Filter dispatches
//   useEffect(() => {
//     let result = [...dispatches];

//     if (dispatchStartDate) {
//       const start = new Date(dispatchStartDate);
//       result = result.filter(d => new Date(d.dispatch_date) >= start);
//     }

//     if (dispatchEndDate) {
//       const end = new Date(dispatchEndDate);
//       end.setHours(23, 59, 59, 999);
//       result = result.filter(d => new Date(d.dispatch_date) <= end);
//     }

//     setFilteredDispatches(result);
//   }, [dispatchStartDate, dispatchEndDate, dispatches]);

//   const consumableOptions = filteredConsumables.map(item => ({
//     value: item.id,
//     label: `${item.name} (${item.consumableStatus})`,
//     data: item,
//   }));

//   const openAddModal = () => {
//     setAddForm({ name: '', usageType: 'single use' });
//     setIsAddModalOpen(true);
//   };

//   const closeAddModal = () => setIsAddModalOpen(false);

//   const handleAddSubmit = async (e) => {
//     e.preventDefault();
//     if (!addForm.name.trim()) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Required',
//         text: 'Consumable name is required',
//         timer: 2000,
//         showConfirmButton: false,
//       });
//       return;
//     }

//     setAdding(true);
//     try {
//       const payload = {
//         consumable_name: addForm.name.trim(),
//         is_multi_use: addForm.usageType === 'multi use' ? 1 : 0,
//       };

//       await axios.post(`${API_BASE_URL}/resource/consumables`, payload);

//       const refresh = await axios.get(`${API_BASE_URL}/resource/consumables`);
//       if (refresh.data?.status === 'success') {
//         setMasterConsumables(refresh.data.data || []);
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: 'Consumable added successfully',
//         timer: 2000,
//         showConfirmButton: false,
//         toast: true,
//         position: 'top-end',
//       });

//       closeAddModal();
//     } catch (err) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: err.response?.data?.message || 'Failed to add consumable',
//       });
//     } finally {
//       setAdding(false);
//     }
//   };

//   const openDispatchModal = () => {
//     if (!selectedConsumable) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Select Item',
//         text: 'Please select a consumable first',
//         timer: 2000,
//         showConfirmButton: false,
//       });
//       return;
//     }
//     setDispatchForm({
//       quantity: '',
//       currentSite: '',
//       vehicleName: '',
//       vehicleNumber: '',
//       driverName: '',
//       driverMobile: '',
//       destinationSite: '',
//       amount: '',
//       dispatchDate: new Date().toISOString().split('T')[0],
//     });
//     setIsDispatchModalOpen(true);
//   };

//   const closeDispatchModal = () => setIsDispatchModalOpen(false);

//   const handleDispatchSubmit = async (e) => {
//     e.preventDefault();

//     if (!dispatchForm.quantity.trim() || !dispatchForm.currentSite.trim() ||
//         !dispatchForm.destinationSite.trim() || !dispatchForm.dispatchDate) {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Required Fields',
//         text: 'Quantity, current site, destination and date are required',
//         timer: 2000,
//         showConfirmButton: false,
//       });
//       return;
//     }

//     setDispatchLoading(true);

//     try {
//       const payload = {
//         resource_consumable_id: selectedConsumable.value,
//         quantity: dispatchForm.quantity.trim(),
//         current_site: dispatchForm.currentSite.trim(),
//         dispatch_date: dispatchForm.dispatchDate,
//         vehicle_name_model: dispatchForm.vehicleName.trim() || null,
//         vehicle_number: dispatchForm.vehicleNumber.trim() || null,
//         driver_name: dispatchForm.driverName.trim() || null,
//         driver_mobile: dispatchForm.driverMobile.trim() || null,
//         destination_site: dispatchForm.destinationSite.trim(),
//         transport_amount: dispatchForm.amount ? Number(dispatchForm.amount) : 0,
//       };

//       const res = await axios.post(`${API_BASE_URL}/resource/dispatches`, payload);

//       if (res.data.status === 'success') {
//         Swal.fire({
//           icon: 'success',
//           title: 'Success!',
//           text: 'Dispatch recorded successfully!',
//           timer: 2000,
//           showConfirmButton: false,
//           toast: true,
//           position: 'top-end',
//         });

//         closeDispatchModal();

//         // Refresh dispatches
//         const dispRes = await axios.get(`${API_BASE_URL}/resource/dispatches`);
//         if (dispRes.data?.status === 'success') {
//           setDispatches(dispRes.data.data || []);
//         }
//       }
//     } catch (err) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: err.response?.data?.message || 'Failed to record dispatch',
//       });
//     } finally {
//       setDispatchLoading(false);
//     }
//   };

//   const toggleExpandDispatch = (id) => {
//     setExpandedDispatchId(prev => prev === id ? null : id);
//   };

//   if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-700 animate-pulse">Loading...</div>;
//   if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-5 sm:p-8">
//       <div className="max-w-6xl mx-auto">

//         {/* Header */}
//         <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
//           <div className="text-center sm:text-left">
//             <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
//               <span className="text-emerald-600">📦</span>
//               Consumables Master
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Total items: <strong>{masterConsumables.length}</strong>
//             </p>
//           </div>

//           <button
//             onClick={openAddModal}
//             className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition flex items-center gap-2"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Add Consumable
//           </button>
//         </div>

//         {/* Toggle + Filter Icon */}
//         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
//           <div className="flex gap-4">
//             <button
//               onClick={() => setViewMode('master')}
//               className={`px-8 py-3 rounded-full font-semibold transition-all shadow-sm ${
//                 viewMode === 'master' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white border text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               Master List
//             </button>
//             <button
//               onClick={() => setViewMode('inventory')}
//               className={`px-8 py-3 rounded-full font-semibold transition-all shadow-sm ${
//                 viewMode === 'inventory' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white border text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               Inventory & Dispatch
//             </button>
//           </div>

//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition"
//             title="Filters"
//           >
//             <Filter size={20} className="text-emerald-700" />
//           </button>
//         </div>

//         {/* Filters Panel */}
//         {showFilters && (
//           <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 animate-fadeIn">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* Search */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
//                 <input
//                   type="text"
//                   value={searchTerm}
//                   onChange={e => setSearchTerm(e.target.value)}
//                   placeholder="Search name..."
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
//                 />
//               </div>

//               {/* Usage Type */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Usage Type</label>
//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => setUsageFilter('all')}
//                     className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
//                       usageFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     All
//                   </button>
//                   <button
//                     onClick={() => setUsageFilter('single use')}
//                     className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
//                       usageFilter === 'single use' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     Single Use
//                   </button>
//                   <button
//                     onClick={() => setUsageFilter('multi use')}
//                     className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
//                       usageFilter === 'multi use' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                     }`}
//                   >
//                     Multi Use
//                   </button>
//                 </div>
//               </div>

//               {/* Dispatch Date Range */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Dispatch Date Range</label>
//                 <div className="flex gap-3">
//                   <input
//                     type="date"
//                     value={dispatchStartDate}
//                     onChange={e => setDispatchStartDate(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500"
//                   />
//                   <input
//                     type="date"
//                     value={dispatchEndDate}
//                     onChange={e => setDispatchEndDate(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Master View */}
//         {viewMode === 'master' && (
//           <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-emerald-100">
//             <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white">
//               <h2 className="text-xl font-semibold">All Consumables</h2>
//             </div>

//             {filteredConsumables.length === 0 ? (
//               <div className="p-12 text-center text-gray-500">No matching consumables</div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-emerald-50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800 uppercase tracking-wider">Name</th>
//                       <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800 uppercase tracking-wider w-48">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {filteredConsumables.map(item => (
//                       <tr key={item.id} className="hover:bg-emerald-50/40">
//                         <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
//                         <td className="px-6 py-4">
//                           <span className={`inline-flex px-4 py-1.5 text-sm font-medium rounded-full ${
//                             item.consumableStatus === 'multi use' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
//                           }`}>
//                             {item.consumableStatus}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Inventory & Dispatch View */}
//         {viewMode === 'inventory' && (
//           <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
//             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
//               <h2 className="text-2xl font-bold text-gray-800">Dispatch Consumable</h2>
//               <button
//                 onClick={openDispatchModal}
//                 disabled={!selectedConsumable || dispatchLoading}
//                 className={`px-8 py-3.5 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
//                   !selectedConsumable || dispatchLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
//                 }`}
//               >
//                 {dispatchLoading ? 'Saving...' : 'Dispatch'}
//               </button>
//             </div>

//             <div className="mb-8">
//               <label className="block text-sm font-medium text-gray-700 mb-3">Select Consumable</label>
//               <Select
//                 options={consumableOptions}
//                 value={selectedConsumable}
//                 onChange={setSelectedConsumable}
//                 placeholder="Search consumable name..."
//                 isSearchable
//                 isClearable
//                 className="text-base"
//                 styles={{
//                   control: (base) => ({ ...base, borderRadius: '0.75rem', borderColor: '#d1d5db', padding: '0.3rem', boxShadow: 'none', '&:hover': { borderColor: '#10b981' } }),
//                   option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'white', color: state.isSelected ? 'white' : '#111827' }),
//                 }}
//               />
//             </div>

//             {selectedConsumable && (
//               <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 mb-10">
//                 <h3 className="text-xl font-semibold text-emerald-800 mb-3">
//                   Selected: {selectedConsumable.label}
//                 </h3>
//                 <p className="text-gray-700">Fill the form and click Dispatch to record.</p>
//               </div>
//             )}

//             {!selectedConsumable && (
//               <div className="text-center py-12 text-gray-500">Select a consumable to dispatch</div>
//             )}

//             {/* All Dispatched Items */}
//             <div className="mt-12">
//               <h3 className="text-2xl font-bold text-gray-800 mb-6">All Dispatched Items</h3>

//               {filteredDispatches.length === 0 ? (
//                 <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
//                   No dispatch records found
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto border border-gray-200 rounded-xl">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Consumable</th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Usage</th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Qty</th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Current</th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Destination</th>
//                         <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredDispatches.map(d => (
//                         <React.Fragment key={d.id}>
//                           <tr
//                             onClick={() => toggleExpandDispatch(d.id)}
//                             className="hover:bg-gray-50 cursor-pointer"
//                           >
//                             <td className="px-6 py-4 font-medium">{d.consumable_name}</td>
//                             <td className="px-6 py-4">
//                               <span className={`inline-flex px-3 py-1 text-xs rounded-full ${
//                                 d.usage_type === 'multi use' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                               }`}>
//                                 {d.usage_type}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4">{d.quantity}</td>
//                             <td className="px-6 py-4">{d.current_site}</td>
//                             <td className="px-6 py-4">{d.destination_site}</td>
//                             <td className="px-6 py-4">
//                               {format(new Date(d.dispatch_date), 'dd MMM yyyy')}
//                               <span className="ml-2">
//                                 {expandedDispatchId === d.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                               </span>
//                             </td>
//                           </tr>

//                           {expandedDispatchId === d.id && (
//                             <tr>
//                               <td colSpan={6} className="px-6 py-4 bg-gray-50">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                                   <div>
//                                     <strong>Driver:</strong> {d.driver_name || '—'} ({d.driver_mobile || '—'})
//                                   </div>
//                                   <div>
//                                     <strong>Vehicle:</strong> {d.vehicle_name_model || '—'} ({d.vehicle_number || '—'})
//                                   </div>
//                                   <div>
//                                     <strong>Amount:</strong> ₹{Number(d.transport_amount).toLocaleString()}
//                                   </div>
//                                   <div>
//                                     <strong>Recorded:</strong> {format(new Date(d.created_at), 'dd MMM yyyy HH:mm')}
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>
//                           )}
//                         </React.Fragment>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Add Modal – NO currentSite field */}
//         {isAddModalOpen && (
//           <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeAddModal}>
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
//               <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white rounded-t-2xl">
//                 <h3 className="text-xl font-semibold">Add New Consumable</h3>
//               </div>

//               <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Consumable Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={addForm.name}
//                     onChange={e => setAddForm({...addForm, name: e.target.value})}
//                     placeholder="e.g. Safety Helmet - 5 nos"
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
//                     required
//                     disabled={adding}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Usage Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={addForm.usageType}
//                     onChange={e => setAddForm({...addForm, usageType: e.target.value})}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
//                     required
//                     disabled={adding}
//                   >
//                     <option value="single use">Single use (disposable)</option>
//                     <option value="multi use">Multi use (reusable)</option>
//                   </select>
//                 </div>

//                 <div className="flex gap-4 pt-4">
//                   <button type="button" onClick={closeAddModal} disabled={adding} className="flex-1 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 disabled:opacity-50">
//                     Cancel
//                   </button>
//                   <button type="submit" disabled={adding} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50">
//                     {adding ? 'Adding...' : 'Add Consumable'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* Dispatch Modal */}
//         {isDispatchModalOpen && selectedConsumable && (
//           <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeDispatchModal}>
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
//               <div className="p-8 relative">
//                 <button onClick={closeDispatchModal} disabled={dispatchLoading} className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 disabled:opacity-50">
//                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>

//                 <h3 className="text-3xl font-bold text-center mb-8">
//                   Dispatch: {selectedConsumable.label}
//                 </h3>

//                 <form onSubmit={handleDispatchSubmit} className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-semibold mb-2">Dispatch Date *</label>
//                       <input
//                         type="date"
//                         value={dispatchForm.dispatchDate}
//                         min={dispatchForm.dispatchDate}
//                         onChange={e => setDispatchForm({...dispatchForm, dispatchDate: e.target.value})}
//                         className="w-full px-4 py-3 border rounded-lg focus:ring-emerald-500"
//                         required
//                         disabled={dispatchLoading}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold mb-2">Quantity *</label>
//                       <input
//                         type="text"
//                         value={dispatchForm.quantity}
//                         onChange={e => setDispatchForm({...dispatchForm, quantity: e.target.value})}
//                         placeholder="e.g. 5 nos / 10 pairs"
//                         className="w-full px-4 py-3 border rounded-lg focus:ring-emerald-500"
//                         required
//                         disabled={dispatchLoading}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold mb-2">Current Site *</label>
//                       <input
//                         type="text"
//                         value={dispatchForm.currentSite}
//                         onChange={e => setDispatchForm({...dispatchForm, currentSite: e.target.value})}
//                         placeholder="e.g. Head Office"
//                         className="w-full px-4 py-3 border rounded-lg focus:ring-emerald-500"
//                         required
//                         disabled={dispatchLoading}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold mb-2">Vehicle Name/Model</label>
//                       <input
//                         type="text"
//                         value={dispatchForm.vehicleName}
//                         onChange={e => setDispatchForm({...dispatchForm, vehicleName: e.target.value})}
//                         placeholder="Tata Ace / Eicher"
//                         className="w-full px-4 py-3 border rounded-lg"
//                         disabled={dispatchLoading}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold mb-2">Vehicle Number</label>
//                       <input
//                         type="text"
//                         value={dispatchForm.vehicleNumber}
//                         onChange={e => setDispatchForm({...dispatchForm, vehicleNumber: e.target.value.toUpperCase()})}
//                         placeholder="TN37AB1234"
//                         className="w-full px-4 py-3 border rounded-lg uppercase"
//                         disabled={dispatchLoading}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold mb-2">Driver Name</label>
//                       <input
//                         type="text"
//                         value={dispatchForm.driverName}
//                         onChange={e => setDispatchForm({...dispatchForm, driverName: e.target.value})}
//                         placeholder="Ravi Kumar"
//                         className="w-full px-4 py-3 border rounded-lg"
//                         disabled={dispatchLoading}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold mb-2">Driver Mobile</label>
//                       <input
//                         type="tel"
//                         value={dispatchForm.driverMobile}
//                         onChange={e => setDispatchForm({...dispatchForm, driverMobile: e.target.value})}
//                         placeholder="9876543210"
//                         className="w-full px-4 py-3 border rounded-lg"
//                         disabled={dispatchLoading}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold mb-2">Destination Site *</label>
//                       <input
//                         type="text"
//                         value={dispatchForm.destinationSite}
//                         onChange={e => setDispatchForm({...dispatchForm, destinationSite: e.target.value})}
//                         placeholder="Perundurai Site"
//                         className="w-full px-4 py-3 border rounded-lg"
//                         required
//                         disabled={dispatchLoading}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold mb-2">Transport Amount (₹)</label>
//                       <input
//                         type="number"
//                         step="0.01"
//                         min="0"
//                         value={dispatchForm.amount}
//                         onChange={e => setDispatchForm({...dispatchForm, amount: e.target.value})}
//                         placeholder="2500"
//                         className="w-full px-4 py-3 border rounded-lg"
//                         disabled={dispatchLoading}
//                       />
//                     </div>
//                   </div>

//                   <div className="flex gap-4 pt-8">
//                     <button type="button" onClick={closeDispatchModal} disabled={dispatchLoading} className="flex-1 py-3.5 bg-gray-200 rounded-xl hover:bg-gray-300 disabled:opacity-50">
//                       Cancel
//                     </button>
//                     <button type="submit" disabled={dispatchLoading} className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
//                       {dispatchLoading ? 'Saving...' : 'Record Dispatch'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Consumables;


































import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Filter } from 'lucide-react';
import ConsumableDispatch from './ConsumableDispatch'; // ← new component

const Consumables = () => {
  const [masterConsumables, setMasterConsumables] = useState([]);
  const [filteredConsumables, setFilteredConsumables] = useState([]);
  const [viewMode, setViewMode] = useState('master');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters (only for master view)
  const [searchTerm, setSearchTerm] = useState('');
  const [usageFilter, setUsageFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Add modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    usageType: 'single use',
  });
  const [adding, setAdding] = useState(false);

  // Fetch master consumables only
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/resource/consumables`);
        if (res.data?.status === 'success') {
          setMasterConsumables(res.data.data || []);
          setFilteredConsumables(res.data.data || []);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load consumables');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic (master only)
  useEffect(() => {
    let result = [...masterConsumables];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(term));
    }

    if (usageFilter !== 'all') {
      result = result.filter(item => item.consumableStatus === usageFilter);
    }

    setFilteredConsumables(result);
  }, [searchTerm, usageFilter, masterConsumables]);

  const openAddModal = () => {
    setAddForm({ name: '', usageType: 'single use' });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Required', text: 'Consumable name is required', timer: 2000, showConfirmButton: false });
      return;
    }

    setAdding(true);
    try {
      const payload = {
        consumable_name: addForm.name.trim(),
        is_multi_use: addForm.usageType === 'multi use' ? 1 : 0,
      };

      await axios.post(`${API_BASE_URL}/resource/consumables`, payload);

      const refresh = await axios.get(`${API_BASE_URL}/resource/consumables`);
      if (refresh.data?.status === 'success') {
        setMasterConsumables(refresh.data.data || []);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Consumable added',
        timer: 1800,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });

      closeAddModal();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to add consumable',
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-emerald-700 animate-pulse">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-5 sm:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-emerald-600">📦</span>
              Consumables Master
            </h1>
            <p className="text-gray-600 mt-1">
              Total items: <strong>{masterConsumables.length}</strong>
            </p>
          </div>

          {viewMode === 'master' && (
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Consumable
            </button>
          )}
        </div>

        {/* View Toggle + Filter icon (filter only shown in master) */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('master')}
              className={`px-8 py-3 rounded-full font-semibold transition-all shadow-sm ${
                viewMode === 'master' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}
            >
              Master List
            </button>
            <button
              onClick={() => setViewMode('inventory')}
              className={`px-8 py-3 rounded-full font-semibold transition-all shadow-sm ${
                viewMode === 'inventory' ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}
            >
              Dispatch & History
            </button>
          </div>

          {viewMode === 'master' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              title="Filters"
            >
              <Filter size={20} className="text-emerald-700" />
            </button>
          )}
        </div>

        {/* Filters – only for master */}
        {viewMode === 'master' && showFilters && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usage Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setUsageFilter('all')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                      usageFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setUsageFilter('single use')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                      usageFilter === 'single use' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Single Use
                  </button>
                  <button
                    onClick={() => setUsageFilter('multi use')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                      usageFilter === 'multi use' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Multi Use
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Master View */}
        {viewMode === 'master' && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-emerald-100">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white">
              <h2 className="text-xl font-semibold">All Consumables</h2>
            </div>

            {filteredConsumables.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No matching consumables</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-emerald-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-800 uppercase tracking-wider w-48">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredConsumables.map(item => (
                      <tr key={item.id} className="hover:bg-emerald-50/40">
                        <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-4 py-1.5 text-sm font-medium rounded-full ${
                            item.consumableStatus === 'multi use' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {item.consumableStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Dispatch View – now in separate component */}
        {viewMode === 'inventory' && <ConsumableDispatch masterConsumables={masterConsumables} />}

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={closeAddModal}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white rounded-t-2xl">
                <h3 className="text-xl font-semibold">Add New Consumable</h3>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consumable Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Safety Helmet - 5 nos"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                    disabled={adding}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usage Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addForm.usageType}
                    onChange={e => setAddForm({ ...addForm, usageType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                    required
                    disabled={adding}
                  >
                    <option value="single use">Single use (disposable)</option>
                    <option value="multi use">Multi use (reusable)</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={closeAddModal} disabled={adding} className="flex-1 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={adding} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50">
                    {adding ? 'Adding...' : 'Add Consumable'}
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

export default Consumables;
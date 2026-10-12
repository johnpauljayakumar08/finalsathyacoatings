import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import { 
//   DollarSign, Users, Truck, Wrench, Home, HandCoins, FileText, Receipt, Plus, Edit3, Save, X 
// } from 'lucide-react';
// import axios from 'axios';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const PayablesTable = ({ onTotalCalculated }) => {
//   const [salaryBalance, setSalaryBalance] = useState(0);
//   const [transportBalance, setTransportBalance] = useState(0);
//   const [scaffoldingBalance, setScaffoldingBalance] = useState(0);
//   const [accommodationBalance, setAccommodationBalance] = useState(0);
//   const [commissionBalance, setCommissionBalance] = useState(0);
//   const [tdsPayableBalance, setTdsPayableBalance] = useState(0);
//   const [gstInputCredit, setGstInputCredit] = useState(0);
  
//   // Other Payables
//   const [otherPayables, setOtherPayables] = useState([]);
//   const [overallOther, setOverallOther] = useState(0);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Modal & Edit State
//   const [showModal, setShowModal] = useState(false);
//   const [newPayableName, setNewPayableName] = useState('');
//   const [editingId, setEditingId] = useState(null);
//   const [editAmount, setEditAmount] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Single API call for all balances
//         const overallRes = await fetch(`${API_BASE_URL}/finance/overall-payable`);
//         const overallData = await overallRes.json();
//         if (overallData.status === 'success') {
//           const d = overallData.data;
//           setSalaryBalance(Number(d.salary_balance || 0));
//           setTransportBalance(Number(d.transport_balance || 0));
//           setScaffoldingBalance(Number(d.scaffolding_balance || 0));
//           setAccommodationBalance(Number(d.accommodation_balance || 0));
//           setCommissionBalance(Number(d.commission_balance || 0));
//           setTdsPayableBalance(Number(d.tds_payable_balance || 0));
//           setGstInputCredit(Number(d.gst_input_credit || 0));
//           setOverallOther(Number(d.other_payables_total || 0));
//         }

//         // Fetch Other Payables list for editing
//         const otherRes = await fetch(`${API_BASE_URL}/finance/other-payables`);
//         const otherData = await otherRes.json();
//         if (otherData.status === 'success') {
//           setOtherPayables(otherData.data.slice(1));
//         }

//       } catch (err) {
//         setError('Failed to load data');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Total Payable (excluding GST Input & Other Payables)
//   const totalPayable = [
//     salaryBalance, transportBalance, scaffoldingBalance,
//     accommodationBalance, commissionBalance, tdsPayableBalance
//   ].reduce((sum, val) => sum + (Number(val) || 0), 0);

//   useEffect(() => {
//     if (onTotalCalculated) {
//       onTotalCalculated(totalPayable);
//     }
//   }, [totalPayable, onTotalCalculated]);

//   const formatINR = (amount) => {
//     const num = Number(amount);
//     if (isNaN(num)) return '₹0.00';
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2,
//     }).format(num);
//   };

//   // Add New Other Payable
//   const handleAddOther = async () => {
//     if (!newPayableName.trim()) return alert('Please enter payable name');

//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-other-payable`, {
//         payable_name: newPayableName.trim(),
//         payable_amount: 0,
//         created_by: '1',
//         updated_by: '1'
//       });
//       setNewPayableName('');
//       setShowModal(false);
//       // Refresh other payables
//       const res = await fetch(`${API_BASE_URL}/finance/other-payables`);
//       const data = await res.json();
//       if (data.status === 'success') {
//         setOverallOther(data.data[0].overall_payable_amount || 0);
//         setOtherPayables(data.data.slice(1));
//       }
//     } catch (err) {
//       alert('Failed to add');
//     }
//   };

//   // Edit Other Payable Amount
//   const startEdit = (id, currentAmount) => {
//     setEditingId(id);
//     setEditAmount(currentAmount || '');
//   };

//   const saveEdit = async (id) => {
//     const amount = parseFloat(editAmount) || 0;
//     const item = otherPayables.find(i => i.id === id);
//     if (!item) return;

//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-other-payable`, {
//         payable_name: item.payable_name,
//         payable_amount: amount,
//         updated_by: '1'
//       });
//       setEditingId(null);
//       // Refresh
//       const res = await fetch(`${API_BASE_URL}/finance/other-payables`);
//       const data = await res.json();
//       if (data.status === 'success') {
//         setOverallOther(data.data[0].overall_payable_amount || 0);
//         setOtherPayables(data.data.slice(1));
//       }
//     } catch (err) {
//       alert('Update failed');
//     }
//   };

//   const fixedPayables = [
//     { label: 'Salary', amount: salaryBalance, icon: Users, color: 'blue' },
//     { label: 'Transport', amount: transportBalance, icon: Truck, color: 'purple' },
//     { label: 'Scaffolding', amount: scaffoldingBalance, icon: Wrench, color: 'orange' },
//     { label: 'Site Accommodation', amount: accommodationBalance, icon: Home, color: 'pink' },
//     { label: 'Commission', amount: commissionBalance, icon: HandCoins, color: 'indigo' },
//     { label: 'GST Input Credit', amount: gstInputCredit, icon: Receipt, color: 'emerald', bold: true },
//     { label: 'TDS Payable', amount: tdsPayableBalance, icon: FileText, color: 'teal', bold: true },
//   ];

//   if (loading) return <div className="text-center py-16">Loading...</div>;
//   if (error) return <div className="text-center py-16 text-red-600">{error}</div>;

//   return (
//     <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
//       {/* Header */}
//       <div className="p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//               <DollarSign className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
//                 Internal Liabilities & Expenses
//               </h2>
//               <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                 Current outstanding payments & credits
//               </p>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="text-xs uppercase tracking-wider font-medium" style={{ color: themeColors.textSecondary }}>
//               Total Payable
//             </p>
//             <p className={`text-3xl font-bold mt-1 ${totalPayable > 0 ? 'text-red-600' : 'text-green-600'}`}>
//               {formatINR(totalPayable)}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Fixed Payables */}
//       <div className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//         {fixedPayables.map((item) => {
//           const Icon = item.icon;
//           return (
//             <div key={item.label} className="p-6 hover:bg-gray-50 transition-colors">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className={`p-3 rounded-lg bg-${item.color}-100`}>
//                     <Icon size={26} className={`text-${item.color}-700`} />
//                   </div>
//                   <div>
//                     <h3 className={`font-semibold text-lg ${item.bold ? 'font-bold text-teal-900' : ''}`}>
//                       {item.label}
//                     </h3>
//                     <p className="text-sm" style={{ color: themeColors.textSecondary }}>
//                       {item.amount === 0 ? 'Cleared' : item.label.includes('GST') ? 'Available ITC' : 'Pending'}
//                     </p>
//                   </div>
//                 </div>
//                 <p className={`text-2xl font-bold ${item.bold ? 'text-emerald-600' : item.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
//                   {formatINR(item.amount)}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Other Payables Section */}
//       <div className="border-t-4 border-dashed" style={{ borderColor: themeColors.border }}>
//         <div className="p-6 bg-amber-50 flex items-center justify-between">
//           <h3 className="text-xl font-bold text-amber-900">Other Payables</h3>
//           <button
//             onClick={() => setShowModal(true)}
//             className="flex items-center gap-2 bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700 font-medium transition"
//           >
//             <Plus size={20} />
//             Add Other Payable
//           </button>
//         </div>

//         <div className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//           {otherPayables.length === 0 ? (
//             <div className="p-8 text-center text-gray-500">
//               No other payables added yet. Click "Add Other Payable" to create one.
//             </div>
//           ) : (
//             otherPayables.map((item) => {
//               const isEditing = editingId === item.id;
//               return (
//                 <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4 flex-1">
//                       <div className="p-3 rounded-lg bg-amber-100">
//                         <FileText size={26} className="text-amber-700" />
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-semibold text-lg">{item.payable_name}</h4>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4">
//                       {isEditing ? (
//                         <>
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={editAmount}
//                             onChange={(e) => setEditAmount(e.target.value)}
//                             className="w-40 px-3 py-2 border rounded-lg text-right"
//                             autoFocus
//                           />
//                           <button onClick={() => saveEdit(item.id)} className="p-2 text-green-600 hover:bg-green-50 rounded">
//                             <Save size={20} />
//                           </button>
//                           <button onClick={() => setEditingId(null)} className="p-2 text-gray-600 hover:bg-gray-200 rounded">
//                             <X size={20} />
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <span className="text-2xl font-bold text-red-600">
//                             {formatINR(item.payable_amount || 0)}
//                           </span>
//                           <button
//                             onClick={() => startEdit(item.id, item.payable_amount)}
//                             className="p-2 text-amber-600 hover:bg-amber-50 rounded"
//                           >
//                             <Edit3 size={20} />
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>

//         {overallOther > 0 && (
//           <div className="p-6 bg-amber-100 border-t-2 border-amber-300">
//             <div className="flex justify-between items-center">
//               <span className="text-lg font-bold text-amber-900">Total Other Payables</span>
//               <span className="text-3xl font-bold text-red-600">{formatINR(overallOther)}</span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
//             <h3 className="text-2xl font-bold mb-6">Add New Payable Item</h3>
//             <input
//               type="text"
//               placeholder="e.g., Electricity Bill, Office Rent, Internet Charges"
//               className="w-full px-4 py-3 border rounded-lg mb-6"
//               value={newPayableName}
//               onChange={(e) => setNewPayableName(e.target.value)}
//               autoFocus
//             />
//             <div className="flex justify-end gap-4">
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setNewPayableName('');
//                 }}
//                 className="px-6 py-3 border rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleAddOther}
//                 className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
//               >
//                 Add Payable
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PayablesTable;



























import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Users, Truck, Wrench, Home, HandCoins, FileText, Receipt, Plus, Edit3, Save, X 
} from 'lucide-react';
import axios from 'axios';
import SalaryPayableBreakdown from './SalaryPayableBreakdown';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const PayablesTable = ({ onTotalCalculated }) => {
  const [salaryBalance, setSalaryBalance] = useState(0);
  const [transportBalance, setTransportBalance] = useState(0);
  const [scaffoldingBalance, setScaffoldingBalance] = useState(0);
  const [accommodationBalance, setAccommodationBalance] = useState(0);
  const [commissionBalance, setCommissionBalance] = useState(0);
  const [tdsPayableBalance, setTdsPayableBalance] = useState(0);
  const [gstInputCredit, setGstInputCredit] = useState(0);

  // Other Payables
  const [otherPayables, setOtherPayables] = useState([]);
  const [overallOther, setOverallOther] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal / View states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSalaryView, setShowSalaryView] = useState(false);
  const [newPayableName, setNewPayableName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const overallRes = await fetch(`${API_BASE_URL}/finance/overall-payable`);
        const overallData = await overallRes.json();
        if (overallData.status === 'success') {
          const d = overallData.data;
          setSalaryBalance(Number(d.salary_balance || 0));
          setTransportBalance(Number(d.transport_balance || 0));
          setScaffoldingBalance(Number(d.scaffolding_balance || 0));
          setAccommodationBalance(Number(d.accommodation_balance || 0));
          setCommissionBalance(Number(d.commission_balance || 0));
          setTdsPayableBalance(Number(d.tds_payable_balance || 0));
          setGstInputCredit(Number(d.gst_input_credit || 0));
          setOverallOther(Number(d.other_payables_total || 0));
        }

        const otherRes = await fetch(`${API_BASE_URL}/finance/other-payables`);
        const otherData = await otherRes.json();
        if (otherData.status === 'success') {
          setOtherPayables(otherData.data.slice(1));
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalPayable = [
    salaryBalance,
    transportBalance,
    scaffoldingBalance,
    accommodationBalance,
    commissionBalance,
    tdsPayableBalance,
  ].reduce((sum, val) => sum + (Number(val) || 0), 0);

  useEffect(() => {
    if (onTotalCalculated) onTotalCalculated(totalPayable);
  }, [totalPayable, onTotalCalculated]);

  const formatINR = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  // ─── Other Payables Handlers ────────────────────────────────────────
  const handleAddOther = async () => {
    if (!newPayableName.trim()) return alert('Please enter payable name');

    try {
      await axios.post(`${API_BASE_URL}/finance/create-other-payable`, {
        payable_name: newPayableName.trim(),
        payable_amount: 0,
        created_by: '1',
        updated_by: '1',
      });
      setNewPayableName('');
      setShowAddModal(false);

      const res = await fetch(`${API_BASE_URL}/finance/other-payables`);
      const data = await res.json();
      if (data.status === 'success') {
        setOverallOther(data.data[0]?.overall_payable_amount || 0);
        setOtherPayables(data.data.slice(1));
      }
    } catch (err) {
      alert('Failed to add payable');
    }
  };

  const startEdit = (id, currentAmount) => {
    setEditingId(id);
    setEditAmount(currentAmount || '');
  };

  const saveEdit = async (id) => {
    const amount = parseFloat(editAmount) || 0;
    const item = otherPayables.find((i) => i.id === id);
    if (!item) return;

    try {
      await axios.post(`${API_BASE_URL}/finance/create-other-payable`, {
        payable_name: item.payable_name,
        payable_amount: amount,
        updated_by: '1',
      });
      setEditingId(null);

      const res = await fetch(`${API_BASE_URL}/finance/other-payables`);
      const data = await res.json();
      if (data.status === 'success') {
        setOverallOther(data.data[0]?.overall_payable_amount || 0);
        setOtherPayables(data.data.slice(1));
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const fixedPayables = [
    { label: 'Salary', amount: salaryBalance, icon: Users, color: 'blue' },
    { label: 'Transport', amount: transportBalance, icon: Truck, color: 'purple' },
    { label: 'Scaffolding', amount: scaffoldingBalance, icon: Wrench, color: 'orange' },
    { label: 'Site Accommodation', amount: accommodationBalance, icon: Home, color: 'pink' },
    { label: 'Commission', amount: commissionBalance, icon: HandCoins, color: 'indigo' },
    { label: 'GST Input Credit', amount: gstInputCredit, icon: Receipt, color: 'emerald', bold: true },
    { label: 'TDS Payable', amount: tdsPayableBalance, icon: FileText, color: 'teal', bold: true },
  ];

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;

  // ────────────────────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm border overflow-hidden"
        style={{ borderColor: themeColors.border }}
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Internal Liabilities & Expenses
                </h2>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Current outstanding payments & credits
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider font-medium" style={{ color: themeColors.textSecondary }}>
                Total Payable
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  totalPayable > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {formatINR(totalPayable)}
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Payables */}
        <div className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
          {fixedPayables.map((item) => {
            const Icon = item.icon;
            const isSalary = item.label === 'Salary';

            return (
              <div
                key={item.label}
                className={`p-6 transition-colors ${
                  isSalary ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-50'
                }`}
                onClick={() => isSalary && setShowSalaryView(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-${item.color}-100`}>
                      <Icon size={26} className={`text-${item.color}-700`} />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold text-lg ${
                          item.bold ? 'font-bold text-teal-900' : ''
                        }`}
                      >
                        {item.label}
                        {isSalary && (
                          <span className="ml-2 text-xs text-blue-600 font-medium">
                            (click to view breakdown)
                          </span>
                        )}
                      </h3>
                      <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                        {item.amount === 0
                          ? 'Cleared'
                          : item.label.includes('GST')
                          ? 'Available ITC'
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      item.bold
                        ? 'text-emerald-600'
                        : item.amount > 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {formatINR(item.amount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other Payables Section */}
        <div className="border-t-4 border-dashed" style={{ borderColor: themeColors.border }}>
          <div className="p-6 bg-amber-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-amber-900">Other Payables</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-amber-600 text-white px-5 py-3 rounded-lg hover:bg-amber-700 font-medium transition"
            >
              <Plus size={20} />
              Add Other Payable
            </button>
          </div>

          <div className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
            {otherPayables.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No other payables added yet. Click "Add Other Payable" to create one.
              </div>
            ) : (
              otherPayables.map((item) => {
                const isEditing = editingId === item.id;
                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-amber-100">
                          <FileText size={26} className="text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{item.payable_name}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {isEditing ? (
                          <>
                            <input
                              type="number"
                              step="0.01"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-40 px-3 py-2 border rounded-lg text-right"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(item.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Save size={20} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                            >
                              <X size={20} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-red-600">
                              {formatINR(item.payable_amount || 0)}
                            </span>
                            <button
                              onClick={() => startEdit(item.id, item.payable_amount)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded"
                            >
                              <Edit3 size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {overallOther > 0 && (
            <div className="p-6 bg-amber-100 border-t-2 border-amber-300">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-amber-900">Total Other Payables</span>
                <span className="text-3xl font-bold text-red-600">{formatINR(overallOther)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Salary Full Page View ─────────────────────────────────────── */}
      {showSalaryView && (
        <div className="fixed inset-0 z-50 bg-gray-50">
          <SalaryPayableBreakdown
            totalSalaryPayable={salaryBalance}
            onClose={() => setShowSalaryView(false)}
          />
        </div>
      )}

      {/* ─── Add Other Payable Modal ───────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Add New Payable Item</h3>
            <input
              type="text"
              placeholder="e.g., Electricity Bill, Office Rent, Internet Charges"
              className="w-full px-4 py-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={newPayableName}
              onChange={(e) => setNewPayableName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewPayableName('');
                }}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOther}
                className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition"
              >
                Add Payable
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PayablesTable;
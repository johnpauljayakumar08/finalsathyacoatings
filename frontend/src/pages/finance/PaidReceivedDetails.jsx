import { API_BASE_URL } from "../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const PaidReceivedDetails = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');

//   // Fetch data whenever dates change
//   useEffect(() => {
//     fetchData();
//   }, [fromDate, toDate]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await axios.get(`${API_BASE_URL}/finance/paid-received-detailed`, {
//         params: {
//           from_date: fromDate || undefined,
//           to_date: toDate || undefined,
//         },
//       });

//       if (res.data?.status === 'success') {
//         setData(res.data.data);
//       } else {
//         setError('Failed to load data from server');
//       }
//     } catch (err) {
//       console.error('Error fetching paid received details:', err);
//       setError('Failed to load paid & received details. Please check if server is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatINR = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2,
//     }).format(parseFloat(amount) || 0);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString || dateString === '—') return '—';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-IN', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-xl font-medium text-gray-600">Loading Paid & Received Details...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-red-600 text-center bg-white p-8 rounded-2xl shadow max-w-md">
//           <p className="text-xl font-semibold mb-2">Error</p>
//           <p>{error}</p>
//           <button 
//             onClick={fetchData}
//             className="mt-4 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const transactions = data?.transactions || [];
//   const totalPaid = data?.total_paid || 0;
//   const totalReceived = data?.total_received || 0;
//   const netBalance = totalReceived - totalPaid;

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow border p-8 mb-8">
//           <div className="flex items-center gap-4">
//             <div className="p-4 rounded-xl bg-teal-600">
//               <span className="text-white text-4xl">₹</span>
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">Paid & Received Details</h1>
//               <p className="text-gray-600 mt-1">
//                 Complete Transaction Details with Employee Name, Project & Balance
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Date Filter */}
//         <div className="bg-white rounded-2xl shadow border p-6 mb-8">
//           <div className="flex flex-col md:flex-row gap-4 items-end">
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-600 mb-1">From Date</label>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
//               />
//             </div>
//             <div className="flex-1">
//               <label className="block text-sm font-medium text-gray-600 mb-1">To Date</label>
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
//               />
//             </div>
//             {(fromDate || toDate) && (
//               <button
//                 onClick={() => {
//                   setFromDate('');
//                   setToDate('');
//                 }}
//                 className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
//               >
//                 Clear Filter
//               </button>
//             )}
//           </div>
//           {(fromDate || toDate) && (
//             <p className="text-center mt-3 text-sm text-gray-500">
//               Showing data from {formatDate(fromDate)} to {formatDate(toDate)}
//             </p>
//           )}
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <div className="bg-white rounded-2xl shadow border p-8">
//             <p className="text-sm font-medium text-gray-500">TOTAL PAID (Outflow)</p>
//             <p className="text-4xl font-bold text-red-600 mt-3">{formatINR(totalPaid)}</p>
//           </div>
//           <div className="bg-white rounded-2xl shadow border p-8">
//             <p className="text-sm font-medium text-gray-500">TOTAL RECEIVED (Inflow)</p>
//             <p className="text-4xl font-bold text-green-600 mt-3">{formatINR(totalReceived)}</p>
//           </div>
//           <div className="bg-white rounded-2xl shadow border p-8">
//             <p className="text-sm font-medium text-gray-500">NET BALANCE</p>
//             <p className={`text-4xl font-bold mt-3 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//               {formatINR(netBalance)}
//             </p>
//           </div>
//         </div>

//         {/* Detailed Transactions Table */}
//         <div className="bg-white rounded-2xl shadow border overflow-hidden">
//           <div className="bg-gray-800 text-white px-8 py-5 text-lg font-semibold flex justify-between items-center">
//             <span>ALL TRANSACTIONS - DETAILED VIEW</span>
//             <span className="text-sm opacity-75">({transactions.length} records)</span>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="min-w-full">
//               <thead className="bg-gray-50 border-b sticky top-0">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Type</th>
//                   <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Employee Name</th>
//                   <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Project</th>
//                   <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Particulars</th>
//                   <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Bank Name</th>
//                   <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Amount</th>
//                   <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Balance</th>
//                   <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y text-sm">
//                 {transactions.length > 0 ? (
//                   transactions.map((item, index) => {
//                     const isPaid = item.transaction_type === 'Paid';
//                     return (
//                       <tr
//                         key={index}
//                         className={`hover:bg-gray-50 transition-colors ${isPaid ? 'bg-red-50/70' : 'bg-green-50/70'}`}
//                       >
//                         {/* Type */}
//                         <td className="px-6 py-5">
//                           <span
//                             className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${
//                               isPaid
//                                 ? 'bg-red-100 text-red-700 border border-red-200'
//                                 : 'bg-green-100 text-green-700 border border-green-200'
//                             }`}
//                           >
//                             {item.transaction_type}
//                           </span>
//                         </td>

//                         {/* Employee Name */}
//                         <td className="px-6 py-5 font-medium text-gray-700">
//                           {item.employee_name || '—'}
//                         </td>

//                         {/* Project */}
//                         <td className="px-6 py-5 text-gray-600">
//                           {item.project_name || '—'}
//                         </td>

//                         {/* Particulars */}
//                         <td className="px-6 py-5 font-medium text-gray-700">
//                           {item.particulars || '—'}
//                         </td>

//                         {/* Bank Name */}
//                         <td className="px-6 py-5 text-gray-600">
//                           {item.bank_name || '—'}
//                         </td>

//                         {/* Amount */}
//                         <td className={`px-6 py-5 text-right font-semibold text-lg ${isPaid ? 'text-red-600' : 'text-green-600'}`}>
//                           {formatINR(item.amount)}
//                         </td>

//                         {/* Balance */}
//                         <td className="px-6 py-5 text-right font-semibold text-gray-700">
//                           {item.balance_amount !== null && item.balance_amount !== undefined
//                             ? formatINR(item.balance_amount)
//                             : '—'}
//                         </td>

//                         {/* Date */}
//                         <td className="px-6 py-5 text-gray-600 whitespace-nowrap">
//                           {formatDate(item.entry_date)}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan="8" className="px-8 py-20 text-center text-gray-500 text-lg">
//                       No transactions found for the selected date range
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaidReceivedDetails;



















import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaidReceivedDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch data whenever dates change
  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch main paid/received detailed data
      const res = await axios.get(`${API_BASE_URL}/finance/paid-received-detailed`, {
        params: {
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        },
      });

      // Fetch ALL Custom Payments
      const customRes = await axios.get(`${API_BASE_URL}/finance/all-custom-payments`);
      let customData = [];
      if (customRes.data?.status === 'success') {
        customData = customRes.data.data || [];
      }

      if (res.data?.status === 'success') {
        const mainData = res.data.data;

        // Combine custom payments into transactions (with consistent structure)
        const customTransactions = customData.map(item => ({
          transaction_type: item.payment_type_id === 1 ? 'Paid' : 'Received',
          employee_name: item.category_name || 'Custom Overhead',
          project_name: '—',
          particulars: item.remarks || 'Custom Payment',
          bank_name: item.bank_name || '—',
          amount: parseFloat(item.paid_receive_amount) || 0,
          balance_amount: null,
          entry_date: item.date,
          isCustom: true,
          payment_type_id: item.payment_type_id
        }));

        const combinedTransactions = [...(mainData.transactions || []), ...customTransactions];

        setData({
          ...mainData,
          transactions: combinedTransactions,
          // Add custom amounts to totals
          total_paid: parseFloat(mainData.total_paid || 0) + 
                      customData
                        .filter(item => item.payment_type_id === 1)
                        .reduce((sum, item) => sum + parseFloat(item.paid_receive_amount || 0), 0),
          total_received: parseFloat(mainData.total_received || 0) + 
                          customData
                            .filter(item => item.payment_type_id === 2)
                            .reduce((sum, item) => sum + parseFloat(item.paid_receive_amount || 0), 0)
        });
      } else {
        setError('Failed to load data from server');
      }
    } catch (err) {
      console.error('Error fetching paid received details:', err);
      setError('Failed to load paid & received details. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === '—') return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-gray-600">Loading Paid & Received Details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-center bg-white p-8 rounded-2xl shadow max-w-md">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const transactions = data?.transactions || [];
  const totalPaid = data?.total_paid || 0;
  const totalReceived = data?.total_received || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow border p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-teal-600">
              <span className="text-white text-4xl">₹</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Paid & Received Details</h1>
              <p className="text-gray-600 mt-1">
                Complete Transaction Details with Employee Name, Project & Balance
              </p>
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-2xl shadow border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>
          {(fromDate || toDate) && (
            <p className="text-center mt-3 text-sm text-gray-500">
              Showing data from {formatDate(fromDate)} to {formatDate(toDate)}
            </p>
          )}
        </div>

        {/* Summary Cards - NET BALANCE removed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow border p-8">
            <p className="text-sm font-medium text-gray-500">TOTAL PAID (Outflow)</p>
            <p className="text-4xl font-bold text-red-600 mt-3">{formatINR(totalPaid)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow border p-8">
            <p className="text-sm font-medium text-gray-500">TOTAL RECEIVED (Inflow)</p>
            <p className="text-4xl font-bold text-green-600 mt-3">{formatINR(totalReceived)}</p>
          </div>
        </div>

        {/* Detailed Transactions Table */}
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <div className="bg-gray-800 text-white px-8 py-5 text-lg font-semibold flex justify-between items-center">
            <span>ALL TRANSACTIONS - DETAILED VIEW</span>
            <span className="text-sm opacity-75">({transactions.length} records)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Employee Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Particulars</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Bank Name</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Balance</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {transactions.length > 0 ? (
                  transactions.map((item, index) => {
                    const isPaid = item.transaction_type === 'Paid';
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 transition-colors ${isPaid ? 'bg-red-50/70' : 'bg-green-50/70'}`}
                      >
                        {/* Type */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${
                              isPaid
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-green-100 text-green-700 border border-green-200'
                            }`}
                          >
                            {item.transaction_type}
                          </span>
                        </td>

                        {/* Employee Name */}
                        <td className="px-6 py-5 font-medium text-gray-700">
                          {item.employee_name || '—'}
                        </td>

                        {/* Project */}
                        <td className="px-6 py-5 text-gray-600">
                          {item.project_name || '—'}
                        </td>

                        {/* Particulars */}
                        <td className="px-6 py-5 font-medium text-gray-700">
                          {item.particulars || '—'}
                        </td>

                        {/* Bank Name */}
                        <td className="px-6 py-5 text-gray-600">
                          {item.bank_name || '—'}
                        </td>

                        {/* Amount */}
                        <td className={`px-6 py-5 text-right font-semibold text-lg ${isPaid ? 'text-red-600' : 'text-green-600'}`}>
                          {formatINR(item.amount)}
                        </td>

                        {/* Balance */}
                        <td className="px-6 py-5 text-right font-semibold text-gray-700">
                          {item.balance_amount !== null && item.balance_amount !== undefined
                            ? formatINR(item.balance_amount)
                            : '—'}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 text-gray-600 whitespace-nowrap">
                          {formatDate(item.entry_date)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-8 py-20 text-center text-gray-500 text-lg">
                      No transactions found for the selected date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaidReceivedDetails;
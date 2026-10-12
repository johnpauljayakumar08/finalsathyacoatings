import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import { DollarSign, Receipt, FileText } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const ReceivablesTable = () => {
//   const [billedDebtorsBalance, setBilledDebtorsBalance] = useState(0);
//   const [tdsReturnable, setTdsReturnable] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/finance/overall-receivable`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const result = await response.json();
//         if (result.status === 'success') {
//           setBilledDebtorsBalance(Number(result.data.billed_debtors_balance || 0));
//           setTdsReturnable(Number(result.data.tds_returnable || 0));
//         } else {
//           throw new Error(result.message || 'Unknown error');
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Total Receivable
//   const totalReceivable = billedDebtorsBalance + tdsReturnable;

//   const formatINR = (amount) => {
//     const num = Number(amount);
//     if (isNaN(num)) return '₹0.00';
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2,
//     }).format(num);
//   };

//   const fixedReceivables = [
//     { label: 'Billed Debtors Balance', amount: billedDebtorsBalance, icon: Receipt, color: 'blue' },
//     { label: 'TDS Returnable', amount: tdsReturnable, icon: FileText, color: 'purple' },
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
//                 Overall Receivables Summary
//               </h2>
//               <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                 Current outstanding receivables & credits
//               </p>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="text-xs uppercase tracking-wider font-medium" style={{ color: themeColors.textSecondary }}>
//               Total Receivable
//             </p>
//             <p className={`text-3xl font-bold mt-1 ${totalReceivable > 0 ? 'text-green-600' : 'text-red-600'}`}>
//               {formatINR(totalReceivable)}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Fixed Receivables */}
//       <div className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//         {fixedReceivables.map((item) => {
//           const Icon = item.icon;
//           return (
//             <div key={item.label} className="p-6 hover:bg-gray-50 transition-colors">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <div className={`p-3 rounded-lg bg-${item.color}-100`}>
//                     <Icon size={26} className={`text-${item.color}-700`} />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-lg">
//                       {item.label}
//                     </h3>
//                     <p className="text-sm" style={{ color: themeColors.textSecondary }}>
//                       {item.amount === 0 ? 'Cleared' : 'Pending'}
//                     </p>
//                   </div>
//                 </div>
//                 <p className={`text-2xl font-bold ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
//                   {formatINR(item.amount)}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ReceivablesTable;
























import React, { useState, useEffect } from 'react';
import { DollarSign, Receipt, FileText, Building2 } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const ReceivablesTable = () => {
  const [billedDebtorsBalance, setBilledDebtorsBalance] = useState(0);
  const [tdsReturnable, setTdsReturnable] = useState(0);
  const [billToBeRaiseTotal, setBillToBeRaiseTotal] = useState(0);   // New state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch overall receivable (existing)
        const receivableRes = await fetch(`${API_BASE_URL}/finance/overall-receivable`);
        if (!receivableRes.ok) throw new Error('Failed to fetch overall receivable');
        const receivableResult = await receivableRes.json();

        if (receivableResult.status === 'success') {
          setBilledDebtorsBalance(Number(receivableResult.data.billed_debtors_balance || 0));
          setTdsReturnable(Number(receivableResult.data.tds_returnable || 0));
        }

        // Fetch Bill To Be Raise Summary (New)
        const billRes = await fetch(`${API_BASE_URL}/finance/bill-to-be-raise-summary`);
        if (!billRes.ok) throw new Error('Failed to fetch bill to be raise summary');
        const billResult = await billRes.json();

        if (billResult.status === 'success') {
          setBillToBeRaiseTotal(Number(billResult.data.grand_total || 0));
        }

      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Total Receivable = Billed Debtors + TDS Returnable + Bill To Be Raise
  const totalReceivable = billedDebtorsBalance + tdsReturnable + billToBeRaiseTotal;

  const formatINR = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const receivablesItems = [
    { 
      label: 'Billed Debtors Balance', 
      amount: billedDebtorsBalance, 
      icon: Receipt, 
      color: 'blue' 
    },
    { 
      label: 'TDS Returnable', 
      amount: tdsReturnable, 
      icon: FileText, 
      color: 'purple' 
    },
    { 
      label: 'Bill To Be Raise',        // New item
      amount: billToBeRaiseTotal, 
      icon: Building2, 
      color: 'amber' 
    },
  ];

  if (loading) return <div className="text-center py-16 text-gray-500">Loading receivables...</div>;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
                Overall Receivables Summary
              </h2>
              <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                Current outstanding receivables & credits
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider font-medium" style={{ color: themeColors.textSecondary }}>
              Total Receivable
            </p>
            <p className={`text-3xl font-bold mt-1 ${totalReceivable > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatINR(totalReceivable)}
            </p>
          </div>
        </div>
      </div>

      {/* Receivables List */}
      <div className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
        {receivablesItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-${item.color}-100`}>
                    <Icon size={26} className={`text-${item.color}-700`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {item.label}
                    </h3>
                    <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                      {item.amount === 0 ? 'Cleared' : 'Pending'}
                    </p>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatINR(item.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReceivablesTable;
import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';

// // === THEME COLORS (Teal + Gold) ===
// const theme = {
//   primary: '#1e7a6f',        // Deep Teal
//   accent: '#1e7a6f',         // Rich Gold
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
//   positive: '#16a34a',       // Green for positive/received
//   negative: '#dc2626',       // Red for payable/negative
//   hoverBg: '#e6f4f1',
//   summaryBg: '#f0fdfa',
//   sectionSeparator: '#f1f5f9',
// };

// // Helper function to format date strings
// const formatDate = (dateString) => {
//   if (!dateString || dateString === '—') return '—';
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   } catch {
//     return dateString;
//   }
// };

// // Format currency in INR
// const formatINR = (amount) => {
//   const num = parseFloat(amount) || 0;
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 2,
//   }).format(num);
// };

// // Overall Summary Component
// const OverallSummary = ({ overall }) => {
//   if (!overall) return null;

//   const displayData = [
//     { label: 'Overall Paid', value: overall.overall_paid },
//     { label: 'Overall Payable Balance', value: overall.overall_payable_balance },
//     { label: 'Overall Receivable Balance', value: overall.overall_receivable_balance },
//     { label: 'Net Cash Position', value: overall.net_cash_position },
//   ];

//   return (
//     <React.Fragment>
//       {/* Main Title */}
//       <tr>
//         <th
//           colSpan="8"
//           className="py-6 text-3xl font-bold text-white text-center tracking-tight"
//           style={{ backgroundColor: theme.primary }}
//         >
//           Detailed Transaction Log (Payables & Receivables)
//         </th>
//       </tr>

//       {/* Financial Summary Header */}
//       <tr>
//         <td
//           colSpan="8"
//           className="py-4 text-2xl font-extrabold text-white text-center uppercase tracking-wider shadow-inner"
//           style={{ backgroundColor: theme.accent }}
//         >
//           Financial Summary
//         </td>
//       </tr>

//       {/* Summary Values */}
//       <tr className="divide-x" style={{ backgroundColor: theme.summaryBg, borderColor: theme.border }}>
//         {displayData.map((item, index) => {
//           const value = parseFloat(item.value) || 0;
//           const isNegative = value < 0;

//           let valueColor = theme.textPrimary;
//           if (item.label === 'Net Cash Position') {
//             valueColor = value >= 0 ? theme.positive : theme.negative;
//           } else if (item.label.includes('Payable')) {
//             valueColor = isNegative || value === 0 ? theme.positive : theme.negative;
//           } else if (item.label.includes('Receivable')) {
//             valueColor = !isNegative ? theme.positive : theme.negative;
//           }

//           return (
//             <td key={index} colSpan="2" className="p-5 text-center">
//               <div className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
//                 {item.label}
//               </div>
//               <div
//                 className="text-2xl font-extrabold mt-2"
//                 style={{ color: valueColor }}
//               >
//                 {formatINR(value)}
//               </div>
//             </td>
//           );
//         })}
//       </tr>
//     </React.Fragment>
//   );
// };

// // Main Component
// const ViewPaymentEntry = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // API Fetching Logic
//   useEffect(() => {
//     const API_URL = `${API_BASE_URL}/finance/cpe-data`;

//     const fetchData = async () => {
//       try {
//         const response = await fetch(API_URL);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const result = await response.json();
//         setData(result);
//         setLoading(false);
//       } catch (e) {
//         console.error("Failed to fetch payment data:", e);
//         setError("Failed to load data. Please check the API endpoint and ensure the server is running.");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.lightBg }}>
//         <div className="text-center text-xl font-medium" style={{ color: theme.textSecondary }}>
//           Loading financial data...
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.lightBg }}>
//         <div className="text-center text-xl font-bold" style={{ color: theme.negative }}>
//           Error: {error}
//         </div>
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.lightBg }}>
//         <div className="text-center text-xl font-medium" style={{ color: theme.textSecondary }}>
//           No payment entry data available.
//         </div>
//       </div>
//     );
//   }

//   // Configuration for Payables and Receivables Sections
//   const sections = [
//     {
//       title: 'Payables (Creditors & Common Payments)',
//       dataKey: 'creditors_payable_data',
//       headers: ['Client Name', 'Bank', 'Inv No.', 'Paid Amount', 'Balance', 'Payment Date', 'Payable Type', 'Remarks'],
//       renderRow: (item, index) => (
//         <tr key={`creditors-${index}`} className="hover:bg-amber-50 transition duration-150">
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.client_name}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.inv_number || '—'}</td>
//           <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>
//             {formatINR(item.amount_paid)}
//           </td>
//           <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: theme.negative }}>
//             {formatINR(item.balance_amount)}
//           </td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.date_of_payment)}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.payable_type}</td>
//           <td className="p-3 border text-xs truncate" style={{ borderColor: theme.lightBorder, color: theme.textSecondary }}>
//             {item.remarks || '—'}
//           </td>
//         </tr>
//       ),
//     },
//     {
//       title: 'Payables (Salary)',
//       dataKey: 'salary_payable_data',
//       headers: ['Employee Name', 'Project', 'Paid Amount', 'Balance', 'Entry Date', 'Bank'],
//       renderRow: (item, index) => (
//         <tr key={`salary-${index}`} className="hover:bg-amber-50 transition duration-150">
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.employee_name}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.project_name}</td>
//           <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>
//             {formatINR(item.paid_amount)}
//           </td>
//           <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: theme.negative }}>
//             {formatINR(item.balance_amount)}
//           </td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.entry_date)}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
//           <td colSpan="2" className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#f9fafb' }}></td>
//         </tr>
//       ),
//     },
//     {
//       title: 'Payables (Transport, Scaffolding, Credit Card)',
//       dataKey: ['transport_payable_data', 'scaffolding_payable_data', 'creditcard_payable_data'],
//       headers: ['Project', 'Category', 'Paid/Due Amt', 'Balance', 'Bank', 'Due Date', 'Particulars / Description'],
//       renderRow: (item, index, type) => {
//         let amount, balance, date, particulars;

//         if (type === 'transport_payable_data') {
//           amount = item.paid_amount;
//           balance = item.balance_amount;
//           date = '—';
//           particulars = item.description || 'Transport Payment';
//         } else if (type === 'scaffolding_payable_data') {
//           amount = item.paid_amount;
//           balance = item.balance_amount;
//           date = '—';
//           particulars = 'Scaffolding Payment';
//         } else if (type === 'creditcard_payable_data') {
//           amount = item.amount_due;
//           balance = '—';
//           date = formatDate(item.due_date);
//           particulars = item.particulars || 'Credit Card Due';
//         } else {
//           return null;
//         }

//         return (
//           <tr key={`${type}-${index}`} className="hover:bg-amber-50 transition duration-150">
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.project_name}</td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.cost_category_name || type.replace(/_/g, ' ').toUpperCase()}</td>
//             <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>
//               {formatINR(amount)}
//             </td>
//             <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: balance === '—' ? theme.textSecondary : theme.negative }}>
//               {balance === '—' ? '—' : formatINR(balance)}
//             </td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{date}</td>
//             <td className="p-3 border text-xs" colSpan="2" style={{ borderColor: theme.lightBorder, color: theme.textSecondary }}>
//               {particulars}
//             </td>
//           </tr>
//         );
//       },
//     },
//     {
//       title: 'Payables (Site Accommodation)',
//       dataKey: 'site_accommodation_payable_data',
//       headers: ['Project', 'Creditor', 'Due Period', 'Due Amt', 'Paid Amt', 'Balance', 'Payment Date', 'Bank'],
//       renderRow: (item, index) => (
//         <tr key={`site-acc-${index}`} className="hover:bg-amber-50 transition duration-150">
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.project_name}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.creditor_client_name}</td>
//           <td className="p-3 border text-xs" style={{ borderColor: theme.lightBorder }}>{item.due_period}</td>
//           <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>{formatINR(item.due_amount)}</td>
//           <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>
//             {formatINR(item.paid_amount)}
//           </td>
//           <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: theme.negative }}>
//             {formatINR(item.balance_amount)}
//           </td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.payment_date)}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
//         </tr>
//       ),
//     },
//     {
//       title: 'Payables (Commission)',
//       dataKey: 'commission_payable_data',
//       headers: ['Project', 'Marketing Person', 'Due Amount', 'Paid Amount', 'Balance', 'Payment Date', 'Bank'],
//       renderRow: (item, index) => (
//         <tr key={`commission-${index}`} className="hover:bg-amber-50 transition duration-150">
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.project_name}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.marketing_person_name}</td>
//           <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>{formatINR(item.commission_amount_due)}</td>
//           <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>
//             {formatINR(item.paid_amount)}
//           </td>
//           <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: theme.negative }}>
//             {formatINR(item.balance_amount)}
//           </td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.date_of_payment)}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
//           <td className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#f9fafb' }}></td>
//         </tr>
//       ),
//     },
//     {
//       title: 'Payables (GST & TDS)',
//       dataKey: ['gst_payable_data', 'tds_payable_data'],
//       headers: ['Company / Project', 'Month', 'Type', 'Input/Payable', 'Output/Returnable', 'Net Due', 'Bank'],
//       renderRow: (item, index, type) => {
//         let netDue;
//         if (type === 'gst_payable_data') {
//           netDue = parseFloat(item.net_gst_payable || 0);
//         } else if (type === 'tds_payable_data') {
//           netDue = parseFloat(item.net_tds_due || 0);
//         } else {
//           return null;
//         }

//         const netDueColor = netDue > 0 ? theme.negative : theme.positive;

//         return (
//           <tr key={`${type}-${index}`} className="hover:bg-amber-50 transition duration-150">
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>
//               {type === 'gst_payable_data' ? item.company_name : item.project_name}
//             </td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.month}</td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>
//               <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                 type === 'gst_payable_data' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
//               }`}>
//                 {type === 'gst_payable_data' ? `GST (${item.type_name})` : 'TDS Payable'}
//               </span>
//             </td>
//             <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>
//               {formatINR(item.input_amount || item.payable)}
//             </td>
//             <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>
//               {formatINR(item.output_amount || item.returnable)}
//             </td>
//             <td className="p-3 border text-right font-semibold italic" style={{ 
//               borderColor: theme.lightBorder, 
//               color: netDueColor 
//             }}>
//               {formatINR(netDue)}
//             </td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#f9fafb' }}></td>
//           </tr>
//         );
//       },
//     },
//     {
//       title: 'Receivables (Billed Debtors & TDS Returnable)',
//       dataKey: ['billed_debtors_receivable_data', 'tds_returnable_receivable_data'],
//       headers: ['Party/Project Name', 'Invoice / Month', 'Received/Returnable', 'Balance', 'Date of Receipt', 'Bank'],
//       renderRow: (item, index, type) => {
//         let amount, balance, date;

//         if (type === 'billed_debtors_receivable_data') {
//           amount = parseFloat(item.amount_received) || 0;
//           balance = parseFloat(item.balance_amount) || 0;
//           date = formatDate(item.date_of_receipt);
//         } else if (type === 'tds_returnable_receivable_data') {
//           amount = parseFloat(item.returnable) || 0;
//           balance = '—';
//           date = '—';
//         } else {
//           return null;
//         }

//         const balanceColor = balance === '—' ? theme.textSecondary : (balance > 0 ? theme.positive : theme.negative);

//         return (
//           <tr key={`${type}-${index}`} className="hover:bg-teal-50 transition duration-150">
//             <td className="p-3 border font-medium" style={{ borderColor: theme.lightBorder, color: theme.textPrimary }}>
//               {item.party_name || item.project_name}
//             </td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.inv_no || item.month}</td>
//             <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>
//               {formatINR(amount)}
//             </td>
//             <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: balanceColor }}>
//               {balance === '—' ? '—' : formatINR(balance)}
//             </td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{date}</td>
//             <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
//             <td colSpan="2" className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#ecfdf5' }}></td>
//           </tr>
//         );
//       },
//     },
//   ];

//   const renderSection = (section) => {
//     let allItems = [];
//     const key = section.dataKey;

//     if (Array.isArray(key)) {
//       key.forEach(k => {
//         if (data[k]) {
//           data[k].forEach(item => {
//             allItems.push({ ...item, dataType: k });
//           });
//         }
//       });
//     } else if (data[key]) {
//       allItems = data[key];
//     }

//     if (allItems.length === 0) return null;

//     const totalColumns = 8;

//     return (
//       <React.Fragment key={section.title}>
//         {/* Section Header */}
//         <tr>
//           <th
//             colSpan={totalColumns}
//             className="py-4 text-lg font-bold text-white uppercase tracking-wider"
//             style={{ backgroundColor: theme.primary }}
//           >
//             {section.title} ({allItems.length} Entries)
//           </th>
//         </tr>

//         {/* Table Headers */}
//         <tr style={{ backgroundColor: theme.lightBg }} className="text-xs font-semibold uppercase tracking-wider">
//           {section.headers.map((header, i) => (
//             <th
//               key={i}
//               className="p-3 border"
//               style={{
//                 borderColor: theme.border,
//                 color: theme.textSecondary,
//                 textAlign: header.includes('Amount') || header.includes('Balance') || header.includes('Due') ? 'right' : 'left'
//               }}
//             >
//               {header}
//             </th>
//           ))}
//           {/* Fill remaining columns with empty headers */}
//           {Array.from({ length: totalColumns - section.headers.length }, (_, i) => (
//             <th key={`empty-header-${i}`} className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: theme.sectionSeparator }}>&nbsp;</th>
//           ))}
//         </tr>

//         {/* Render rows dynamically */}
//         {Array.isArray(key)
//           ? allItems.map((item, index) => section.renderRow(item, index, item.dataType))
//           : allItems.map((item, index) => section.renderRow(item, index))}

//         {/* Section Separator */}
//         <tr>
//           <td colSpan={totalColumns} className="h-6" style={{ backgroundColor: theme.accent }}></td>
//         </tr>
//       </React.Fragment>
//     );
//   };

//   return (
//     <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: theme.lightBg }}>
//       <div className="max-w-full mx-auto">
//         {/* Main Financial Table */}
//         <div className="shadow-2xl overflow-x-auto rounded-xl border" style={{ borderColor: theme.border }}>
//           <table className="min-w-full bg-white border-collapse">
//             <thead>
//               <OverallSummary overall={data.overall} />
//             </thead>
//             <tbody className="divide-y text-sm" style={{ divideColor: theme.lightBorder }}>
//               {sections.map(renderSection)}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewPaymentEntry;





import React, { useState, useEffect } from 'react';

// === THEME COLORS ===
const theme = {
  primary: '#1e7a6f',
  accent: '#1e7a6f',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
  positive: '#16a34a',
  negative: '#dc2626',
  hoverBg: '#e6f4f1',
  summaryBg: '#f0fdfa',
  sectionSeparator: '#f1f5f9',
};

const formatDate = (dateString) => {
  if (!dateString || dateString === '—') return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const formatINR = (amount) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
};

const parseFilterDate = (dateString) => {
  if (!dateString || dateString === '—') return null;
  try {
    return new Date(dateString);
  } catch {
    return null;
  }
};

// Compute Overall Summary with Custom Payments (UPDATED LOGIC)
const computeOverallSummary = (filteredData) => {
  let totalPaid = 0;
  let totalReceived = 0;
  let totalPayable = 0;
  let totalReceivable = 0;

  const addToTotals = (paid, received, payable, receivable) => {
    totalPaid += parseFloat(paid) || 0;
    totalReceived += parseFloat(received) || 0;
    totalPayable += parseFloat(payable) || 0;
    totalReceivable += parseFloat(receivable) || 0;
  };

  const processSection = (items, getPaid, getReceived, getPayable, getReceivable) => {
    (items || []).forEach(item => addToTotals(getPaid(item), getReceived(item), getPayable(item), getReceivable(item)));
  };

  // Existing Sections (unchanged)
  if (filteredData.creditors_payable_data) processSection(filteredData.creditors_payable_data, i => i.amount_paid || 0, () => 0, i => i.balance_amount || 0, () => 0);
  if (filteredData.salary_payable_data) processSection(filteredData.salary_payable_data, i => i.paid_amount || 0, () => 0, i => i.balance_amount || 0, () => 0);
  if (filteredData.transport_payable_data) processSection(filteredData.transport_payable_data, i => i.paid_amount || 0, () => 0, i => i.balance_amount || 0, () => 0);
  if (filteredData.scaffolding_payable_data) processSection(filteredData.scaffolding_payable_data, i => i.paid_amount || 0, () => 0, i => i.balance_amount || 0, () => 0);
  if (filteredData.creditcard_payable_data) processSection(filteredData.creditcard_payable_data, () => 0, () => 0, i => i.amount_due || 0, () => 0);
  if (filteredData.site_accommodation_payable_data) processSection(filteredData.site_accommodation_payable_data, i => i.paid_amount || 0, () => 0, i => i.balance_amount || 0, () => 0);
  if (filteredData.commission_payable_data) processSection(filteredData.commission_payable_data, i => i.paid_amount || 0, () => 0, i => i.balance_amount || 0, () => 0);

  if (filteredData.gst_payable_data) processSection(filteredData.gst_payable_data, () => 0, () => 0, i => Math.max(0, parseFloat(i.net_gst_payable || 0)), i => Math.max(0, -parseFloat(i.net_gst_payable || 0)));
  if (filteredData.tds_payable_data) processSection(filteredData.tds_payable_data, () => 0, () => 0, i => Math.max(0, parseFloat(i.net_tds_due || 0)), i => Math.max(0, -parseFloat(i.net_tds_due || 0)));

  if (filteredData.billed_debtors_receivable_data) processSection(filteredData.billed_debtors_receivable_data, () => 0, i => i.amount_received || 0, () => 0, i => i.balance_amount || 0);
  if (filteredData.tds_returnable_receivable_data) processSection(filteredData.tds_returnable_receivable_data, () => 0, () => 0, () => 0, i => i.returnable || 0);

  // ==================== CUSTOM PAYMENTS CONTRIBUTION (UPDATED AS PER YOUR REQUEST) ====================
  if (filteredData.custom_payable_data) {
    processSection(
      filteredData.custom_payable_data,
      // If payment_type_id === 1 → paid_receive_amount counts as Paid
      // If payment_type_id === 2 → paid_receive_amount counts as Received
      item => (item.payment_type_id === 1 ? item.paid_receive_amount || 0 : 0),
      item => (item.payment_type_id === 2 ? item.paid_receive_amount || 0 : 0),
      // For Balance: Main amount is treated as Payable or Receivable balance
      item => (item.payment_type_id === 1 ? item.amount || 0 : 0),
      item => (item.payment_type_id === 2 ? item.amount || 0 : 0)
    );
  }

  return {
    total_paid: totalPaid,
    total_received: totalReceived,
    total_payable: totalPayable,
    total_receivable: totalReceivable,
  };
};

const OverallSummary = ({ overall }) => {
  if (!overall) return null;
  const displayData = [
    { label: 'Total Paid', value: overall.total_paid },
    { label: 'Total Received', value: overall.total_received },
    { label: 'Total Payable Balance', value: overall.total_payable },
    { label: 'Total Receivable Balance', value: overall.total_receivable },
  ];

  return (
    <React.Fragment>
      <tr>
        <th colSpan="8" className="py-6 text-3xl font-bold text-white text-center tracking-tight" style={{ backgroundColor: theme.primary }}>
          Detailed Transaction Log (Payables & Receivables)
        </th>
      </tr>
      <tr>
        <td colSpan="8" className="py-4 text-2xl font-extrabold text-white text-center uppercase tracking-wider shadow-inner" style={{ backgroundColor: theme.accent }}>
          Financial Summary
        </td>
      </tr>
      <tr className="divide-x" style={{ backgroundColor: theme.summaryBg, borderColor: theme.border }}>
        {displayData.map((item, index) => {
          const value = parseFloat(item.value) || 0;
          let valueColor = theme.textPrimary;
          if (item.label.includes('Paid') || item.label.includes('Received') || item.label.includes('Receivable')) valueColor = theme.positive;
          else if (item.label.includes('Payable')) valueColor = theme.negative;

          return (
            <td key={index} colSpan="2" className="p-5 text-center">
              <div className="text-sm font-semibold" style={{ color: theme.textSecondary }}>{item.label}</div>
              <div className="text-2xl font-extrabold mt-2" style={{ color: valueColor }}>
                {formatINR(value)}
              </div>
            </td>
          );
        })}
      </tr>
    </React.Fragment>
  );
};

const ViewPaymentEntry = () => {
  const [rawData, setRawData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Fetch main CPE data + All Custom Payments
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch main CPE data
        const cpeRes = await fetch(`${API_BASE_URL}/finance/cpe-data`);
        if (!cpeRes.ok) throw new Error('Failed to fetch cpe-data');
        const cpeResult = await cpeRes.json();

        // Fetch ALL Custom Payments
        const customRes = await fetch(`${API_BASE_URL}/finance/all-custom-payments`);
        let customData = [];
        if (customRes.ok) {
          const customResult = await customRes.json();
          customData = customResult.data || [];
        }

        const combinedData = {
          ...cpeResult,
          custom_payable_data: customData
        };

        setRawData(combinedData);
        setFilteredData(combinedData);
        setLoading(false);
      } catch (e) {
        console.error("Failed to fetch payment data:", e);
        setError("Failed to load data.");
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Date Filter Logic (unchanged)
  useEffect(() => {
    if (!rawData) return;

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const filterItems = (items, dateField) => {
      if (!items || (!from && !to)) return items;
      return items.filter(item => {
        const itemDate = parseFilterDate(item[dateField]);
        if (!itemDate) return true;
        if (from && itemDate < from) return false;
        if (to && itemDate > to) return false;
        return true;
      });
    };

    const filtered = { ...rawData };

    filtered.creditors_payable_data = filterItems(rawData.creditors_payable_data, 'date_of_payment');
    filtered.salary_payable_data = filterItems(rawData.salary_payable_data, 'entry_date');
    filtered.transport_payable_data = filterItems(rawData.transport_payable_data, 'paid_date');
    filtered.scaffolding_payable_data = filterItems(rawData.scaffolding_payable_data, 'paid_date');
    filtered.creditcard_payable_data = filterItems(rawData.creditcard_payable_data, 'due_date');
    filtered.site_accommodation_payable_data = filterItems(rawData.site_accommodation_payable_data, 'payment_date');
    filtered.commission_payable_data = filterItems(rawData.commission_payable_data, 'date_of_payment');
    filtered.gst_payable_data = filterItems(rawData.gst_payable_data, 'month');
    filtered.tds_payable_data = filterItems(rawData.tds_payable_data, 'month');
    filtered.billed_debtors_receivable_data = filterItems(rawData.billed_debtors_receivable_data, 'date_of_receipt');
    filtered.tds_returnable_receivable_data = filterItems(rawData.tds_returnable_receivable_data, 'month');

    // Custom Payments Filter
    filtered.custom_payable_data = filterItems(rawData.custom_payable_data || [], 'date');

    filtered.overall = computeOverallSummary(filtered);
    setFilteredData(filtered);
  }, [rawData, fromDate, toDate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.lightBg }}>Loading financial data...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.lightBg, color: theme.negative }}>Error: {error}</div>;
  if (!filteredData) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.lightBg }}>No payment entry data available.</div>;

  const sections = [
    // All your existing sections remain completely unchanged
    {
      title: 'Payables (Creditors & Common Payments)',
      dataKey: 'creditors_payable_data',
      dateField: 'date_of_payment',
      headers: ['Client Name', 'Bank', 'Inv No.', 'Paid Amount', 'Balance', 'Payment Date', 'Payable Type', 'Remarks'],
      renderRow: (item, index) => (
        <tr key={`creditors-${index}`} className="hover:bg-amber-50 transition duration-150">
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.client_name}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.inv_number || '—'}</td>
          <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>{formatINR(item.amount_paid)}</td>
          <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: theme.negative }}>{formatINR(item.balance_amount)}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.date_of_payment)}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.payable_type}</td>
          <td className="p-3 border text-xs truncate" style={{ borderColor: theme.lightBorder, color: theme.textSecondary }}>{item.remarks || '—'}</td>
        </tr>
      ),
    },
    {
      title: 'Payables (Salary)',
      dataKey: 'salary_payable_data',
      dateField: 'entry_date',
      headers: ['Employee Name', 'Project', 'Paid Amount', 'Balance', 'Entry Date', 'Bank'],
      renderRow: (item, index) => (
        <tr key={`salary-${index}`} className="hover:bg-amber-50 transition duration-150">
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.employee_name}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.project_name}</td>
          <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>{formatINR(item.paid_amount)}</td>
          <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: theme.negative }}>{formatINR(item.balance_amount)}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.entry_date)}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
          <td colSpan="2" className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#f9fafb' }}></td>
        </tr>
      ),
    },
    {
      title: 'Payables (Transport, Scaffolding, Credit Card)',
      dataKey: ['transport_payable_data', 'scaffolding_payable_data', 'creditcard_payable_data'],
      dateField: 'paid_date',
      headers: ['Project', 'Category', 'Paid/Due Amt', 'Balance', 'Bank', 'Due Date', 'Particulars / Description'],
      renderRow: (item, index, type) => {
        let amount, balance, date, particulars;
        if (type === 'transport_payable_data') {
          amount = item.paid_amount;
          balance = item.balance_amount;
          date = '—';
          particulars = item.description || 'Transport Payment';
        } else if (type === 'scaffolding_payable_data') {
          amount = item.paid_amount;
          balance = item.balance_amount;
          date = '—';
          particulars = 'Scaffolding Payment';
        } else if (type === 'creditcard_payable_data') {
          amount = item.amount_due;
          balance = '—';
          date = formatDate(item.due_date);
          particulars = item.particulars || 'Credit Card Due';
        } else {
          return null;
        }
        return (
          <tr key={`${type}-${index}`} className="hover:bg-amber-50 transition duration-150">
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.project_name}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.cost_category_name || type.replace(/_/g, ' ').toUpperCase()}</td>
            <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>{formatINR(amount)}</td>
            <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: balance === '—' ? theme.textSecondary : theme.negative }}>{balance === '—' ? '—' : formatINR(balance)}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{date}</td>
            <td className="p-3 border text-xs" colSpan="2" style={{ borderColor: theme.lightBorder, color: theme.textSecondary }}>{particulars}</td>
          </tr>
        );
      },
    },
    {
      title: 'Payables (Site Accommodation)',
      dataKey: 'site_accommodation_payable_data',
      dateField: 'payment_date',
      headers: ['Project', 'Creditor', 'Due Period', 'Due Amt', 'Paid Amt', 'Balance', 'Payment Date', 'Bank'],
      renderRow: (item, index) => (
        <tr key={`site-acc-${index}`} className="hover:bg-amber-50 transition duration-150">
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.project_name}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.creditor_client_name}</td>
          <td className="p-3 border text-xs" style={{ borderColor: theme.lightBorder }}>{item.due_period}</td>
          <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>{formatINR(item.due_amount)}</td>
          <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>{formatINR(item.paid_amount)}</td>
          <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: theme.negative }}>{formatINR(item.balance_amount)}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.payment_date)}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
        </tr>
      ),
    },
    {
      title: 'Payables (Commission)',
      dataKey: 'commission_payable_data',
      dateField: 'date_of_payment',
      headers: ['Project', 'Marketing Person', 'Due Amount', 'Paid Amount', 'Balance', 'Payment Date', 'Bank'],
      renderRow: (item, index) => (
        <tr key={`commission-${index}`} className="hover:bg-amber-50 transition duration-150">
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.project_name}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.marketing_person_name}</td>
          <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>{formatINR(item.commission_amount_due)}</td>
          <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>{formatINR(item.paid_amount)}</td>
          <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: theme.negative }}>{formatINR(item.balance_amount)}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.date_of_payment)}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
          <td className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#f9fafb' }}></td>
        </tr>
      ),
    },
    {
      title: 'Payables (GST & TDS)',
      dataKey: ['gst_payable_data', 'tds_payable_data'],
      dateField: 'month',
      headers: ['Company / Project', 'Month', 'Type', 'Input/Payable', 'Output/Returnable', 'Net Due', 'Bank'],
      renderRow: (item, index, type) => {
        let netDue;
        if (type === 'gst_payable_data') netDue = parseFloat(item.net_gst_payable || 0);
        else if (type === 'tds_payable_data') netDue = parseFloat(item.net_tds_due || 0);
        const netDueColor = netDue > 0 ? theme.negative : theme.positive;
        return (
          <tr key={`${type}-${index}`} className="hover:bg-amber-50 transition duration-150">
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{type === 'gst_payable_data' ? item.company_name : item.project_name}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.month}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${type === 'gst_payable_data' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
                {type === 'gst_payable_data' ? `GST (${item.type_name})` : 'TDS Payable'}
              </span>
            </td>
            <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>{formatINR(item.input_amount || item.payable)}</td>
            <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>{formatINR(item.output_amount || item.returnable)}</td>
            <td className="p-3 border text-right font-semibold italic" style={{ borderColor: theme.lightBorder, color: netDueColor }}>{formatINR(netDue)}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#f9fafb' }}></td>
          </tr>
        );
      },
      renderSumRow: (allItems) => {
        let totalInputPayable = 0, totalOutputReturnable = 0, totalNetDue = 0;
        allItems.forEach(item => {
          totalInputPayable += parseFloat(item.input_amount || item.payable) || 0;
          totalOutputReturnable += parseFloat(item.output_amount || item.returnable) || 0;
          const net = parseFloat(item.net_gst_payable || item.net_tds_due || 0);
          totalNetDue += net;
        });
        return (
          <tr className="bg-amber-50 font-bold border-t-2 border-amber-300">
            <td colSpan="3" className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>Section Totals:</td>
            <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>{formatINR(totalInputPayable)}</td>
            <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder }}>{formatINR(totalOutputReturnable)}</td>
            <td className="p-3 border text-right" style={{ borderColor: theme.lightBorder, color: totalNetDue > 0 ? theme.negative : theme.positive }}>{formatINR(totalNetDue)}</td>
            <td colSpan="2" className="p-3 border" style={{ borderColor: theme.lightBorder }}></td>
          </tr>
        );
      },
    },
    {
      title: 'Receivables (Billed Debtors & TDS Returnable)',
      dataKey: ['billed_debtors_receivable_data', 'tds_returnable_receivable_data'],
      dateField: 'date_of_receipt',
      headers: ['Party/Project Name', 'Invoice / Month', 'Received', 'Balance', 'Date of Receipt', 'Bank'],
      renderRow: (item, index, type) => {
        let amount, balance, date;
        if (type === 'billed_debtors_receivable_data') {
          amount = parseFloat(item.amount_received) || 0;
          balance = parseFloat(item.balance_amount) || 0;
          date = formatDate(item.date_of_receipt);
        } else if (type === 'tds_returnable_receivable_data') {
          amount = parseFloat(item.returnable) || 0;
          balance = '—';
          date = '—';
        } else return null;

        const balanceColor = balance === '—' ? theme.textSecondary : (balance > 0 ? theme.positive : theme.negative);
        return (
          <tr key={`${type}-${index}`} className="hover:bg-teal-50 transition duration-150">
            <td className="p-3 border font-medium" style={{ borderColor: theme.lightBorder, color: theme.textPrimary }}>{item.party_name || item.project_name}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.inv_no || item.month}</td>
            <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>{formatINR(amount)}</td>
            <td className="p-3 border text-right font-semibold" style={{ borderColor: theme.lightBorder, color: balanceColor }}>{balance === '—' ? '—' : formatINR(balance)}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{date}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name}</td>
            <td colSpan="2" className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#ecfdf5' }}></td>
          </tr>
        );
      },
    },

    // ==================== CUSTOM OVERHEADS SECTION ====================
    {
      title: 'Custom Overheads / Other Payments',
      dataKey: 'custom_payable_data',
      dateField: 'date',
      headers: ['Category', 'Type', 'Main Amount', 'Paid/Received', 'Date', 'Bank', 'Remarks'],
      renderRow: (item, index) => {
        const isPayable = item.payment_type_id === 1;
        return (
          <tr key={`custom-${index}`} className="hover:bg-purple-50 transition duration-150">
            <td className="p-3 border font-medium" style={{ borderColor: theme.lightBorder }}>{item.category_name || 'Custom'}</td>
            <td className="p-3 border">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${isPayable ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {isPayable ? 'Payable' : 'Receivable'}
              </span>
            </td>
            <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder }}>{formatINR(item.amount)}</td>
            <td className="p-3 border text-right font-medium" style={{ borderColor: theme.lightBorder, color: theme.positive }}>{formatINR(item.paid_receive_amount)}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{formatDate(item.date)}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder }}>{item.bank_name || '—'}</td>
            <td className="p-3 border text-xs truncate" style={{ borderColor: theme.lightBorder, color: theme.textSecondary }}>{item.remarks || '—'}</td>
            <td className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: '#f9fafb' }}></td>
          </tr>
        );
      },
    },
  ];

  const renderSection = (section) => {
    let allItems = [];
    const key = section.dataKey;

    if (Array.isArray(key)) {
      key.forEach(k => {
        if (filteredData[k]) filteredData[k].forEach(item => allItems.push({ ...item, dataType: k }));
      });
    } else if (filteredData[key]) {
      allItems = filteredData[key];
    }

    if (allItems.length === 0) return null;

    const totalColumns = 8;

    return (
      <React.Fragment key={section.title}>
        <tr>
          <th colSpan={totalColumns} className="py-4 text-lg font-bold text-white uppercase tracking-wider" style={{ backgroundColor: theme.primary }}>
            {section.title} ({allItems.length} Entries)
          </th>
        </tr>

        <tr style={{ backgroundColor: theme.lightBg }} className="text-xs font-semibold uppercase tracking-wider">
          {section.headers.map((header, i) => (
            <th key={i} className="p-3 border" style={{
              borderColor: theme.border,
              color: theme.textSecondary,
              textAlign: header.includes('Amount') || header.includes('Balance') ? 'right' : 'left'
            }}>
              {header}
            </th>
          ))}
          {Array.from({ length: totalColumns - section.headers.length }, (_, i) => (
            <th key={`empty-${i}`} className="p-3 border" style={{ borderColor: theme.lightBorder, backgroundColor: theme.sectionSeparator }}>&nbsp;</th>
          ))}
        </tr>

        {allItems.map((item, index) => section.renderRow(item, index, item.dataType))}

        {section.renderSumRow && section.renderSumRow(allItems)}

        <tr>
          <td colSpan={totalColumns} className="h-6" style={{ backgroundColor: theme.accent }}></td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: theme.lightBg }}>
      <div className="max-w-full mx-auto">
        {/* Date Filter */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md border" style={{ borderColor: theme.border }}>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" style={{ borderColor: theme.lightBorder }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.textSecondary }}>To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" style={{ borderColor: theme.lightBorder }} />
            </div>
            {(fromDate || toDate) && (
              <button onClick={() => { setFromDate(''); setToDate(''); }} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">Clear Filter</button>
            )}
          </div>
          {(fromDate || toDate) && (
            <p className="text-center mt-2 text-sm" style={{ color: theme.textSecondary }}>
              Filtered from {formatDate(fromDate || '—')} to {formatDate(toDate || '—')}
            </p>
          )}
        </div>

        {/* Main Financial Table */}
        <div className="shadow-2xl overflow-x-auto rounded-xl border" style={{ borderColor: theme.border }}>
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <OverallSummary overall={filteredData.overall} />
            </thead>
            <tbody className="divide-y text-sm" style={{ divideColor: theme.lightBorder }}>
              {sections.map(renderSection)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewPaymentEntry;
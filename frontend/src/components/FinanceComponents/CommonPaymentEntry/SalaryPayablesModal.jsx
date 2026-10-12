import { API_BASE_URL } from "../../../config/api.js";
// // components/FinanceComponents/CommonPaymentEntry/SalaryPayablesModal.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Users, Calendar, Building2, Search, Banknote, Edit, Check, X } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
//   lightBg: '#f8f9fa',
// };

// const SalaryPayablesModal = ({ onClose, createdBy }) => {
//   const [companies, setCompanies] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
//   const [selectedBank, setSelectedBank] = useState('');
//   const [employees, setEmployees] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [compRes, bankRes] = await Promise.all([
//           axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
//           axios.get(`${API_BASE_URL}/finance/bank-masters`)
//         ]);

//         if (compRes.data.status === 'success') {
//           setCompanies(compRes.data.data);
//           if (compRes.data.data.length > 0) setSelectedCompany(compRes.data.data[0].company_id);
//         }

//         if (bankRes.data.status === 'success') {
//           setBanks(bankRes.data.data.map(b => ({
//             value: b.id,
//             label: `${b.bank_name} - ${b.account_number || 'N/A'} (₹${parseFloat(b.available_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
//           })));
//         }
//       } catch (err) {
//         setError('Failed to load companies/banks');
//       }
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     const company = companies.find(c => c.company_id === selectedCompany);
//     if (company?.projects?.length > 0 && !selectedProject) {
//       setSelectedProject(company.projects[0].pd_id);
//     }
//   }, [selectedCompany, companies]);

//   useEffect(() => {
//     if (!selectedProject || !selectedMonth || !selectedBank) {
//       setEmployees([]);
//       return;
//     }

//     const fetchSalaryData = async () => {
//       setLoading(true);
//       try {
//         const month = selectedMonth.replace('-', '');
//         const res = await axios.get(
//           `${API_BASE_URL}/finance/salary-payables-summary?pd_id=${selectedProject}&month=${month}&bank_id=${selectedBank}`
//         );

//         if (res.data.status === 'success' && res.data.data?.length > 1) {
//           const list = res.data.data.slice(1).map(emp => ({
//             ...emp,
//             original_total_paid: emp.total_paid
//           }));
//           setEmployees(list);
//         } else {
//           setEmployees([]);
//         }
//       } catch (err) {
//         setError('No records found for selected filters');
//         setEmployees([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSalaryData();
//   }, [selectedProject, selectedMonth, selectedBank]);

//   const handleSave = async (emp_id) => {
//     const emp = employees.find(e => e.emp_id === emp_id);
//     if (!emp) return;

//     try {
//       await axios.post(`${API_BASE_URL}/finance/update-salary-payable`, {
//         emp_id,
//         pd_id: selectedProject,
//         entry_date: `${selectedMonth}-01`,
//         paid_amount: emp.total_paid,
//         finance_bank_id: selectedBank,
//         created_by: createdBy,
//         updated_by: createdBy
//       });

//       setEmployees(prev => prev.map(e =>
//         e.emp_id === emp_id ? { ...e, original_total_paid: emp.total_paid } : e
//       ));
//       setEditingId(null);
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to save');
//     }
//   };

//   const handleCancel = (emp_id) => {
//     setEmployees(prev => prev.map(e =>
//       e.emp_id === emp_id
//         ? { ...e, total_paid: e.original_total_paid, balance: e.approved_salary - e.original_total_paid }
//         : e
//     ));
//     setEditingId(null);
//   };

//   const handlePaidChange = (emp_id, value) => {
//     const paid = parseFloat(value) || 0;
//     setEmployees(prev => prev.map(e =>
//       e.emp_id === emp_id
//         ? { ...e, total_paid: paid, balance: e.approved_salary - paid }
//         : e
//     ));
//   };

//   const totals = employees.reduce((acc, e) => ({
//     approved: acc.approved + (e.approved_salary || 0),
//     paid: acc.paid + (e.total_paid || 0),
//     balance: acc.balance + (e.balance || 0)
//   }), { approved: 0, paid: 0, balance: 0 });

//   const filtered = employees.filter(e => e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));
//   const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
//       <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
//         {/* Header */}
//         <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center" style={{ borderColor: themeColors.lightBorder }}>
//           <div className="flex items-center gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//               <Users className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>Salary Payables – Bank Wise</h2>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition">
//             <X size={28} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-6 overflow-y-auto max-h-[80vh]">
//           {/* Filters */}
//           <div className="bg-gray-50 rounded-lg p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-100"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
//                   <option value="">Select Project</option>
//                   {companies.find(c => c.company_id === selectedCompany)?.projects?.map(p => (
//                     <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2"><Calendar size={16} className="inline mr-2" />Month</label>
//                 <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold mb-2 flex items-center gap-2"><Banknote className="w-4 h-4" />Bank Account *</label>
//                 <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}
//                   className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
//                   style={{ borderColor: selectedBank ? themeColors.primary : '#ef4444', '--tw-ring-color': themeColors.primary }}>
//                   <option value="">-- Select Bank --</option>
//                   {banks.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Search */}
//           {selectedBank && (
//             <div className="mb-6 relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
//               <input type="text" placeholder="Search employee..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
//             </div>
//           )}

//           {/* Table */}
//           <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: themeColors.border }}>
//             {loading ? (
//               <div className="p-20 text-center">Loading salary data...</div>
//             ) : !selectedBank ? (
//               <div className="p-12 text-center text-gray-500">Please select a Bank Account</div>
//             ) : filtered.length === 0 ? (
//               <div className="p-12 text-center text-gray-500">No employees found</div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead style={{ backgroundColor: themeColors.lightBg }}>
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Employee</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Approved</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Paid</th>
//                       <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Balance</th>
//                       <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {filtered.map(emp => (
//                       <tr key={emp.emp_id} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 font-medium">{emp.full_name}</td>
//                         <td className="px-6 py-4 text-right font-mono">{formatINR(emp.approved_salary)}</td>
//                         <td className="px-6 py-4 text-right">
//                           {editingId === emp.emp_id ? (
//                             <input type="number" value={emp.total_paid} onChange={e => handlePaidChange(emp.emp_id, e.target.value)}
//                               className="w-32 text-right px-3 py-2 border rounded focus:outline-none focus:ring-2"
//                               style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} autoFocus />
//                           ) : (
//                             <span className="font-mono">{formatINR(emp.total_paid)}</span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-right font-mono">
//                           <span className={emp.balance > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
//                             {formatINR(emp.balance)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           {editingId === emp.emp_id ? (
//                             <div className="flex justify-center gap-3">
//                               <button onClick={() => handleSave(emp.emp_id)} className="p-2 hover:bg-green-100 rounded-lg text-green-600"><Check size={20} /></button>
//                               <button onClick={() => handleCancel(emp.emp_id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600"><X size={20} /></button>
//                             </div>
//                           ) : (
//                             <button onClick={() => setEditingId(emp.emp_id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Edit size={18} /></button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr className="bg-gradient-to-r from-gray-100 to-gray-50 font-bold text-sm" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
//                       <td className="px-6 py-5">GRAND TOTAL</td>
//                       <td className="px-6 py-5 text-right font-mono">{formatINR(totals.approved)}</td>
//                       <td className="px-6 py-5 text-right font-mono">{formatINR(totals.paid)}</td>
//                       <td className="px-6 py-5 text-right font-mono">
//                         <span className={totals.balance > 0 ? 'text-red-600' : 'text-green-600'}>{formatINR(totals.balance)}</span>
//                       </td>
//                       <td></td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalaryPayablesModal;























import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Calendar, Building2, Search, Banknote, 
  Plus, Check, X, Clock, Download, FileText,
  Eye, EyeOff, ChevronDown, ChevronUp, History,
  DollarSign, CreditCard, Wallet
} from 'lucide-react';

const SalaryPayablesModal = ({ onClose, createdBy }) => {
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedBank, setSelectedBank] = useState('');
  const [employees, setEmployees] = useState([]);
  const [addingForEmp, setAddingForEmp] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [transactionLogs, setTransactionLogs] = useState({});
  const [loadingLogs, setLoadingLogs] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [compRes, bankRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
          axios.get(`${API_BASE_URL}/finance/bank-masters`)
        ]);

        if (compRes.data?.status === 'success' && compRes.data.data) {
          setCompanies(compRes.data.data);
          if (compRes.data.data.length > 0) setSelectedCompany(compRes.data.data[0].company_id);
        }

        if (bankRes.data?.status === 'success' && bankRes.data.data) {
          setBanks(bankRes.data.data.map(b => ({
            value: b.id,
            label: `${b.bank_name} - ${b.account_number || 'N/A'} (₹${Number(b.available_balance || 0).toLocaleString('en-IN')})`
          })));
        }
      } catch (err) {
        console.error('Failed to load initial data', err);
        setError('Failed to load companies or banks');
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompany && companies.length > 0) {
      const comp = companies.find(c => c.company_id === selectedCompany);
      if (comp?.projects?.length > 0 && !selectedProject) {
        setSelectedProject(comp.projects[0].pd_id);
      }
    }
  }, [selectedCompany, companies]);

  useEffect(() => {
    if (!selectedProject || !selectedMonth || !selectedBank) {
      setEmployees([]);
      setTransactionLogs({});
      setExpandedEmployees({});
      return;
    }

    const loadPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const monthStr = selectedMonth.replace('-', '');
        const res = await axios.get(
          `${API_BASE_URL}/finance/salary-payables-summary?pd_id=${selectedProject}&month=${monthStr}&bank_id=${selectedBank}`
        );

        if (res.data.status === 'success') {
          const empData = Array.isArray(res.data.data) && res.data.data.length > 0 
            ? res.data.data.slice(1) 
            : [];
          setEmployees(empData);

          const newExpanded = {};
          empData.forEach(emp => newExpanded[emp.emp_id] = false);
          setExpandedEmployees(newExpanded);
          setTransactionLogs({});
        }
      } catch (err) {
        console.error('Failed to load salary payments', err);
        setError(err.response?.data?.message || 'Failed to load salary payment data');
        setEmployees([]);
        setTransactionLogs({});
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [selectedProject, selectedMonth, selectedBank]);

  const loadTransactionLogs = async (emp_id) => {
    if (!selectedProject || !selectedMonth || !emp_id) return;

    setLoadingLogs(prev => ({ ...prev, [emp_id]: true }));

    try {
      const monthStr = selectedMonth.replace('-', '');
      console.log('→ Fetching logs:', { emp_id, pd_id: selectedProject, month: monthStr });

      const res = await axios.get(
        `${API_BASE_URL}/finance/salary-transaction-logs?emp_id=${emp_id}&pd_id=${selectedProject}&month=${monthStr}`
      );

      console.log('← Logs response:', res.data);

      if (res.data.status === 'success') {
        setTransactionLogs(prev => ({
          ...prev,
          [emp_id]: res.data.data || []
        }));
      } else {
        console.warn('API returned non-success:', res.data);
        setTransactionLogs(prev => ({ ...prev, [emp_id]: [] }));
      }
    } catch (err) {
      console.error('Failed to load transaction logs:', err);
      setTransactionLogs(prev => ({ ...prev, [emp_id]: [] }));
    } finally {
      setLoadingLogs(prev => ({ ...prev, [emp_id]: false }));
    }
  };

  const toggleEmployeeExpansion = (emp_id) => {
    setExpandedEmployees(prev => {
      const willExpand = !prev[emp_id];
      if (willExpand && !transactionLogs[emp_id]) {
        loadTransactionLogs(emp_id);
      }
      return { ...prev, [emp_id]: willExpand };
    });
  };

  const handleAddPayment = async (emp_id) => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      await axios.post(`${API_BASE_URL}/finance/update-salary-payable`, {
        emp_id,
        pd_id: selectedProject,
        entry_date: today,
        paid_amount: amount,
        finance_bank_id: selectedBank,
        created_by: createdBy || 'admin',
        updated_by: createdBy || 'admin'
      });

      const monthStr = selectedMonth.replace('-', '');
      const res = await axios.get(
        `${API_BASE_URL}/finance/salary-payables-summary?pd_id=${selectedProject}&month=${monthStr}&bank_id=${selectedBank}`
      );

      if (res.data.status === 'success') {
        const empData = Array.isArray(res.data.data) ? res.data.data.slice(1) : [];
        setEmployees(empData);

        if (expandedEmployees[emp_id]) {
          loadTransactionLogs(emp_id);
        }
      }

      setAddingForEmp(null);
      setNewAmount('');

      alert(`₹${amount.toLocaleString('en-IN')} payment recorded successfully!`);
    } catch (err) {
      console.error('Payment failed:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to record payment';
      alert(`Error: ${msg}`);
    }
  };

  const formatINR = (num) => '₹' + Number(num || 0).toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  const formatDateOnly = (dt) => {
    if (!dt) return '-';
    return new Date(dt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const getTransactionTypeIcon = (index) => {
    const icons = [DollarSign, CreditCard, Wallet];
    const Icon = icons[index % icons.length];
    return <Icon size={14} />;
  };

  const filteredEmployees = employees.filter(emp =>
    (emp.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.emp_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalApproved = employees.reduce((sum, emp) => sum + (Number(emp.approved_salary) || 0), 0);
  const totalPaid    = employees.reduce((sum, emp) => sum + (Number(emp.total_paid) || 0), 0);
  const totalBalance = employees.reduce((sum, emp) => sum + (Number(emp.balance) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-teal-700 text-white">
              <Users size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Salary Payments - Transaction Log</h2>
              <p className="text-gray-600 text-sm">Multiple payments per day are now supported</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X size={28} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <select
                value={selectedCompany}
                onChange={e => { setSelectedCompany(e.target.value); setSelectedProject(''); }}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Project</label>
              <select
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                disabled={!selectedCompany}
                className="w-full border rounded-lg px-3 py-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Project</option>
                {companies
                  .find(c => c.company_id === selectedCompany)
                  ?.projects?.map(p => (
                    <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bank Account *</label>
              <select
                value={selectedBank}
                onChange={e => setSelectedBank(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Select Bank --</option>
                {banks.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Totals */}
          {employees.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Approved Salary</div>
                <div className="text-2xl font-bold text-gray-800">{formatINR(totalApproved)}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Paid</div>
                <div className="text-2xl font-bold text-blue-600">{formatINR(totalPaid)}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Balance</div>
                <div className={`text-2xl font-bold ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatINR(totalBalance)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          {selectedBank && (
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search employee name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              Loading salary payments...
            </div>
          ) : !selectedBank ? (
            <div className="text-center py-20 text-gray-500">
              <Banknote size={48} className="mx-auto mb-4 text-gray-400" />
              <p>Please select a bank account to view salary payments</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No employees found for selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-max">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-sm font-semibold w-8"></th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Employee Details</th>
                    <th className="px-5 py-3 text-right text-sm font-semibold">Approved</th>
                    <th className="px-5 py-3 text-right text-sm font-semibold">Total Paid</th>
                    <th className="px-5 py-3 text-right text-sm font-semibold">Balance</th>
                    <th className="px-5 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEmployees.map(emp => {
                    const isExpanded = expandedEmployees[emp.emp_id] ?? false;
                    const logs = transactionLogs[emp.emp_id] || [];
                    const transactionCount = logs.length;

                    return (
                      <React.Fragment key={emp.emp_id}>
                        <tr className="bg-white hover:bg-gray-50 border-b">
                          <td className="px-5 py-4">
                            <button
                              onClick={() => toggleEmployeeExpansion(emp.emp_id)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <div className="font-medium">{emp.full_name}</div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  ID: {emp.emp_id}
                                </span>
                                {transactionCount > 0 && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                                    <History size={10} /> {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-mono">{formatINR(emp.approved_salary)}</td>
                          <td className="px-5 py-4 text-right font-mono">{formatINR(emp.total_paid)}</td>
                          <td className="px-5 py-4 text-right">
                            <span className={`font-mono font-semibold ${Number(emp.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatINR(emp.balance)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-center gap-2 flex-wrap">
                              <button
                                onClick={() => {
                                  setAddingForEmp(addingForEmp === emp.emp_id ? null : emp.emp_id);
                                  setNewAmount('');
                                }}
                                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                                  addingForEmp === emp.emp_id 
                                    ? 'bg-teal-100 text-teal-700 border border-teal-300' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                                disabled={loading}
                              >
                                {addingForEmp === emp.emp_id ? <X size={16} /> : <Plus size={16} />}
                                {addingForEmp === emp.emp_id ? 'Cancel' : 'Add Payment'}
                              </button>
                              <button
                                onClick={() => toggleEmployeeExpansion(emp.emp_id)}
                                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm ${
                                  isExpanded 
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                                {isExpanded ? 'Hide Logs' : 'View Logs'}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {addingForEmp === emp.emp_id && (
                          <tr className="bg-green-50">
                            <td colSpan={6} className="px-5 py-6">
                              <div className="flex flex-col md:flex-row md:items-end gap-6">
                                <div className="flex-1">
                                  <div className="text-green-800 font-medium mb-3">
                                    Record New Payment for {emp.full_name}
                                  </div>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                    <div>
                                      <label className="block text-sm text-gray-600 mb-1">Amount (₹)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        value={newAmount}
                                        onChange={e => setNewAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-48 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right font-mono"
                                        autoFocus
                                      />
                                    </div>
                                    <div className="text-sm text-gray-700">
                                      <div>Current balance: <strong>{formatINR(emp.balance)}</strong></div>
                                      <div className="mt-1">
                                        After payment: <strong className={Number(emp.balance) - Number(newAmount) < 0 ? 'text-red-600' : 'text-green-700'}>
                                          {formatINR(Number(emp.balance) - Number(newAmount || 0))}
                                        </strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-3 self-end md:self-center">
                                  <button
                                    onClick={() => handleAddPayment(emp.emp_id)}
                                    disabled={loading || !newAmount || Number(newAmount) <= 0}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                                  >
                                    <Check size={18} />
                                    Record
                                  </button>
                                  <button
                                    onClick={() => { setAddingForEmp(null); setNewAmount(''); }}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Transaction Logs - improved visibility */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="p-0">
                              <div className="bg-gray-50 border-t border-b p-6">
                                <div className="flex items-center justify-between mb-5">
                                  <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                                    <History size={20} className="text-blue-600" />
                                    Transaction History – {emp.full_name}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                      ({logs.length} {logs.length === 1 ? 'entry' : 'entries'})
                                    </span>
                                  </h4>
                                </div>

                                {loadingLogs[emp.emp_id] ? (
                                  <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3"></div>
                                    <p className="text-gray-600">Loading transaction history...</p>
                                  </div>
                                ) : logs.length === 0 ? (
                                  <div className="text-center py-12 text-gray-500 bg-white/50 rounded-lg border border-dashed border-gray-300 p-8">
                                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No payments recorded yet this month</p>
                                    <p className="text-sm mt-2">Payments will appear here once recorded</p>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {logs.map((log, index) => (
                                      <div 
                                        key={log.id || index}
                                        className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200"
                                      >
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                          <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                              {getTransactionTypeIcon(index)}
                                            </div>
                                            <div>
                                              <div className="font-semibold text-gray-800 text-lg">
                                                Payment #{index + 1}
                                              </div>
                                              <div className="text-sm text-gray-600 mt-1">
                                                {formatDateTime(log.created_at)}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right sm:text-right">
                                            <div className="text-2xl font-bold text-blue-700">
                                              {formatINR(log.paid_amount)}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                              Balance after: {formatINR(log.balance)}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-200">
                                          <div>
                                            <div className="text-gray-500 font-medium">Bank</div>
                                            <div className="font-medium mt-0.5">{log.finance_bank_name || log.finance_bank_id || '—'}</div>
                                          </div>
                                          <div>
                                            {/* <div className="text-gray-500 font-medium">Recorded by</div> */}
                                            {/* <div className="font-medium mt-0.5">
                                              {log.created_by_name || log.created_by || 'System'}
                                            </div> */}
                                          </div>
                                          <div>
                                            <div className="text-gray-500 font-medium">Entry Date</div>
                                            <div className="font-medium mt-0.5">
                                              {formatDateOnly(log.entry_date)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryPayablesModal;
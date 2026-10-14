import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import { Edit, Check, X, Users, Calendar, Building2, DollarSign, Search } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const SalaryPayables = () => {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
//   const [localData, setLocalData] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const fetchCompanies = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/finance/companies-with-projects`);
//       const { status, data } = await res.json();
//       if (status === 'success') {
//         setCompanies(data);
//         if (data.length > 0 && !selectedCompany) {
//           setSelectedCompany(data[0].company_id);
//         }
//       }
//     } catch (err) {
//       setError('Failed to load companies');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSalarySummary = async () => {
//     if (!selectedProject || !selectedMonth) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/finance/salary-payables-summary?pd_id=${selectedProject}&month=${selectedMonth.replace('-', '')}`
//       );
//       const { status, data } = await res.json();
//       if (status === 'success') {
//         const individuals = data.filter(item => item.emp_id);
//         const withOriginal = individuals.map(item => ({
//           ...item,
//           original_total_paid: item.total_paid || 0
//         }));
//         setLocalData(withOriginal);
//       } else {
//         setLocalData([]);
//       }
//     } catch (err) {
//       setError('Failed to load salary data');
//       setLocalData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (emp_id) => setEditingId(emp_id);

//   const handlePaidChange = (emp_id, value) => {
//     const paid = parseFloat(value) || 0;
//     setLocalData(prev =>
//       prev.map(item =>
//         item.emp_id === emp_id
//           ? { ...item, total_paid: paid, balance: item.approved_salary - paid }
//           : item
//       )
//     );
//   };

//   const handleSave = async (emp_id) => {
//     const item = localData.find(d => d.emp_id === emp_id);
//     if (!item) return;

//     try {
//       const res = await fetch(`${API_BASE_URL}/finance/update-salary-payable`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           emp_id,
//           pd_id: selectedProject,
//           entry_date: `${selectedMonth}-01`,
//           paid_amount: item.total_paid
//         })
//       });
//       const result = await res.json();
//       if (result.status === 'success') {
//         setLocalData(prev =>
//           prev.map(i => i.emp_id === emp_id ? { ...i, original_total_paid: item.total_paid } : i)
//         );
//         setEditingId(null);
//       }
//     } catch (err) {
//       alert('Failed to save');
//     }
//   };

//   const handleCancel = (emp_id) => {
//     setLocalData(prev =>
//       prev.map(item =>
//         item.emp_id === emp_id
//           ? { ...item, total_paid: item.original_total_paid, balance: item.approved_salary - item.original_total_paid }
//           : item
//       )
//     );
//     setEditingId(null);
//   };

//   // Calculate overall
//   const overall = localData.reduce((acc, curr) => ({
//     approved: acc.approved + curr.approved_salary,
//     paid: acc.paid + curr.total_paid,
//     balance: acc.balance + curr.balance
//   }), { approved: 0, paid: 0, balance: 0 });

//   // Filter by search
//   const filteredData = localData.filter(item =>
//     item.full_name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   useEffect(() => { fetchCompanies(); }, []);
//   useEffect(() => {
//     const company = companies.find(c => c.company_id === selectedCompany);
//     if (company?.projects?.length > 0 && !selectedProject) {
//       setSelectedProject(company.projects[0].pd_id);
//     }
//   }, [selectedCompany, companies]);
//   useEffect(() => { fetchSalarySummary(); }, [selectedProject, selectedMonth]);

//   const currentCompany = companies.find(c => c.company_id === selectedCompany);

//   const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//                 <Users className="w-8 h-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
//                   Salary Payables Management
//                 </h1>
//                 <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//                   Update and track employee salary payments
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>
//                 <Building2 size={16} className="inline mr-2" /> Company
//               </label>
//               <select
//                 value={selectedCompany}
//                 onChange={(e) => { setSelectedCompany(e.target.value); setSelectedProject(''); }}
//                 className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               >
//                 <option value="">Select Company</option>
//                 {companies.map(c => (
//                   <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>
//                 Project
//               </label>
//               <select
//                 value={selectedProject}
//                 onChange={(e) => setSelectedProject(e.target.value)}
//                 disabled={!selectedCompany}
//                 className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 disabled:bg-gray-50"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               >
//                 <option value="">Select Project</option>
//                 {currentCompany?.projects?.map(p => (
//                   <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>
//                 <Calendar size={16} className="inline mr-2" /> Month
//               </label>
//               <input
//                 type="month"
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
//                 style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Search */}
//         {selectedProject && selectedMonth && (
//           <div className="mb-6 relative">
//             <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
//             <input
//               type="text"
//               placeholder="Search employee name..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
//               style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//             />
//           </div>
//         )}

//         {/* Table */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
//           {loading ? (
//             <div className="flex items-center justify-center h-64">
//               <div className="animate-spin rounded-full h-14 w-14 border-4 border-t-4"
//                    style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
//             </div>
//           ) : error ? (
//             <div className="p-8 text-center text-red-600">{error}</div>
//           ) : !selectedProject || !selectedMonth ? (
//             <div className="p-12 text-center text-gray-500">Please select company, project, and month</div>
//           ) : filteredData.length === 0 ? (
//             <div className="p-12 text-center text-gray-500">No salary records found</div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full table-fixed">
//                   <thead style={{ backgroundColor: themeColors.lightBg, borderBottom: `1px solid ${themeColors.lightBorder}` }}>
//                     <tr>
//                       <th className="w-5/12 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Employee</th>
//                       <th className="w-2/12 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Approved</th>
//                       <th className="w-2/12 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Paid</th>
//                       <th className="w-2/12 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
//                       <th className="w-1/12 text-center"></th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
//                     {filteredData.map((item) => (
//                       <tr key={item.emp_id} className="hover:bg-gray-50 transition-colors">
//                         <td className="px-6 py-4 text-sm font-medium" style={{ color: themeColors.textPrimary }}>
//                           {item.full_name}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-right font-mono">{formatINR(item.approved_salary)}</td>
//                         <td className="px-6 py-4 text-sm text-right">
//                           {editingId === item.emp_id ? (
//                             <input
//                               type="number"
//                               value={item.total_paid}
//                               onChange={(e) => handlePaidChange(item.emp_id, e.target.value)}
//                               className="w-28 text-right px-2 py-1 border rounded focus:outline-none focus:ring-2"
//                               style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
//                             />
//                           ) : (
//                             <span className="font-mono">{formatINR(item.total_paid)}</span>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-right font-mono">
//                           <span className={item.balance > 0 ? 'text-red-600' : 'text-green-600'}>
//                             {formatINR(item.balance)}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-center">
//                           {editingId === item.emp_id ? (
//                             <div className="flex justify-center gap-2">
//                               <button onClick={() => handleSave(item.emp_id)} className="p-2 hover:bg-green-100 rounded-lg text-green-600">
//                                 <Check size={18} />
//                               </button>
//                               <button onClick={() => handleCancel(item.emp_id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600">
//                                 <X size={18} />
//                               </button>
//                             </div>
//                           ) : (
//                             <button onClick={() => startEdit(item.emp_id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
//                               <Edit size={18} />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot>
//                     <tr className="bg-gray-50 font-bold" style={{ borderTop: `2px solid ${themeColors.primary}` }}>
//                       <td className="px-6 py-4 text-sm" style={{ color: themeColors.textPrimary }}>TOTAL</td>
//                       <td className="px-6 py-4 text-sm text-right font-mono">{formatINR(overall.approved)}</td>
//                       <td className="px-6 py-4 text-sm text-right font-mono">{formatINR(overall.paid)}</td>
//                       <td className="px-6 py-4 text-sm text-right font-mono">
//                         <span className={overall.balance > 0 ? 'text-red-600' : 'text-green-600'}>
//                           {formatINR(overall.balance)}
//                         </span>
//                       </td>
//                       <td></td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalaryPayables;



import React, { useState, useEffect } from 'react';
import { Edit, Check, X, Users, Calendar, Building2, Search, Banknote } from 'lucide-react';
import axios from 'axios';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const SalaryPayables = () => {
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedBank, setSelectedBank] = useState('');
  const [employees, setEmployees] = useState([]); // ← Only employee records
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  // Extract user from URL: /salary-payables/NA==
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/salary-payables\/([^/]+)$/);
    if (match?.[1]) {
      try { setCurrentUser(atob(match[1])); }
      catch { setCurrentUser('1'); }
    }
  }, []);

  // Fetch Companies & Banks
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [compRes, bankRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/finance/companies-with-projects`),
          axios.get(`${API_BASE_URL}/finance/bank-masters`)
        ]);

        if (compRes.data.status === 'success') {
          setCompanies(compRes.data.data);
          if (compRes.data.data.length > 0 && !selectedCompany) {
            setSelectedCompany(compRes.data.data[0].company_id);
          }
        }

        if (bankRes.data.status === 'success') {
          setBanks(bankRes.data.data.map(b => ({
            value: b.id,
            label: `${b.bank_name} - ${b.account_number || 'N/A'} (₹${parseFloat(b.available_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
          })));
        }
      } catch (err) {
        setError('Failed to load initial data');
      }
    };
    fetchInitial();
  }, []);

  // Auto-select first project
  useEffect(() => {
    const company = companies.find(c => c.company_id === selectedCompany);
    if (company?.projects?.length > 0 && !selectedProject) {
      setSelectedProject(company.projects[0].pd_id);
    }
  }, [selectedCompany, companies]);

  // Fetch Salary Data when filters change
  useEffect(() => {
    if (!selectedProject || !selectedMonth || !selectedBank) {
      setEmployees([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const monthClean = selectedMonth.replace('-', '');
        const url = `${API_BASE_URL}/finance/salary-payables-summary?pd_id=${selectedProject}&month=${monthClean}&bank_id=${selectedBank}`;

        const res = await axios.get(url);

        if (res.data.status === 'success' && res.data.data?.length > 1) {
          const employeeList = res.data.data.slice(1); // Skip overall
          setEmployees(employeeList.map(emp => ({
            ...emp,
            original_total_paid: emp.total_paid
          })));
        } else {
          setEmployees([]);
        }
      } catch (err) {
        setError('No records found for selected bank');
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProject, selectedMonth, selectedBank]);

  // Save updated paid amount
  const handleSave = async (emp_id) => {
    const emp = employees.find(e => e.emp_id === emp_id);
    if (!emp || !currentUser) return;

    try {
      await axios.post(`${API_BASE_URL}/finance/update-salary-payable`, {
        emp_id,
        pd_id: selectedProject,
        entry_date: `${selectedMonth}-01`,
        paid_amount: emp.total_paid,
        finance_bank_id: selectedBank,
        created_by: currentUser,
        updated_by: currentUser
      });

      setEmployees(prev => prev.map(e =>
        e.emp_id === emp_id ? { ...e, original_total_paid: emp.total_paid } : e
      ));
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleCancel = (emp_id) => {
    setEmployees(prev => prev.map(e =>
      e.emp_id === emp_id
        ? { ...e, total_paid: e.original_total_paid, balance: e.approved_salary - e.original_total_paid }
        : e
    ));
    setEditingId(null);
  };

  const handlePaidChange = (emp_id, value) => {
    const paid = parseFloat(value) || 0;
    setEmployees(prev => prev.map(e =>
      e.emp_id === emp_id
        ? { ...e, total_paid: paid, balance: e.approved_salary - paid }
        : e
    ));
  };

  // Totals
  const totals = employees.reduce((acc, emp) => ({
    approved: acc.approved + (emp.approved_salary || 0),
    paid: acc.paid + (emp.total_paid || 0),
    balance: acc.balance + (emp.balance || 0)
  }), { approved: 0, paid: 0, balance: 0 });

  const filtered = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatINR = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                Salary Payables – Bank Wise
              </h1>
              <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                Logged in as: <strong>{currentUser || 'Loading...'}</strong>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Project allocation is based on attendance; salary for a day is split equally across the employee's attended assignments.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Company</label>
              <select value={selectedCompany} onChange={e => { setSelectedCompany(e.target.value); setSelectedProject(''); }}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Project</label>
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} disabled={!selectedCompany}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 disabled:bg-gray-50"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
                <option value="">Select Project</option>
                {companies.find(c => c.company_id === selectedCompany)?.projects?.map(p => (
                  <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Month</label>
              <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Banknote className="w-4 h-4" /> Bank Account *
              </label>
              <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                style={{ borderColor: selectedBank ? themeColors.primary : '#ef4444', '--tw-ring-color': themeColors.primary }}>
                <option value="">-- Select Bank --</option>
                {banks.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Search */}
        {selectedBank && selectedProject && selectedMonth && (
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search employee name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2"
              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
          {loading ? (
            <div className="p-16 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-4"
                style={{ borderColor: '#eee', borderTopColor: themeColors.primary }}></div>
            </div>
          ) : !selectedBank || !selectedProject || !selectedMonth ? (
            <div className="p-12 text-center text-gray-500">
              Please select Company → Project → Month → <strong>Bank Account</strong>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No employees found for this project and bank
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: themeColors.lightBg }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Employee</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Allocated</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Paid (This Bank)</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Balance</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: themeColors.lightBorder }}>
                  {filtered.map(emp => (
                    <tr key={emp.emp_id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium" style={{ color: themeColors.textPrimary }}>
                        {emp.full_name}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">{formatINR(emp.approved_salary)}</td>
                      <td className="px-6 py-4 text-right">
                        {editingId === emp.emp_id ? (
                          <input
                            type="number"
                            value={emp.total_paid}
                            onChange={e => handlePaidChange(emp.emp_id, e.target.value)}
                            className="w-32 text-right px-3 py-2 border rounded focus:outline-none focus:ring-2"
                            style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            autoFocus
                          />
                        ) : (
                          <span className="font-mono">{formatINR(emp.total_paid)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        <span className={emp.balance > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                          {formatINR(emp.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {editingId === emp.emp_id ? (
                          <div className="flex justify-center gap-3">
                            <button onClick={() => handleSave(emp.emp_id)} className="p-2 hover:bg-green-100 rounded-lg text-green-600">
                              <Check size={20} />
                            </button>
                            <button onClick={() => handleCancel(emp.emp_id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600">
                              <X size={20} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingId(emp.emp_id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                            <Edit size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-50 font-bold text-sm" style={{ borderTop: `3px solid ${themeColors.primary}` }}>
                    <td className="px-6 py-5" style={{ color: themeColors.textPrimary }}>GRAND TOTAL</td>
                    <td className="px-6 py-5 text-right font-mono">{formatINR(totals.approved)}</td>
                    <td className="px-6 py-5 text-right font-mono">{formatINR(totals.paid)}</td>
                    <td className="px-6 py-5 text-right font-mono">
                      <span className={totals.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatINR(totals.balance)}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryPayables;
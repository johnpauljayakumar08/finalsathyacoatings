import { API_BASE_URL } from "../../../config/api.js";
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, IndianRupee, Search, Calendar } from 'lucide-react';
import axios from 'axios';

export default function SalaryPayableBreakdown({ onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedProject, setSelectedProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all salary payment records
  useEffect(() => {
    const fetchSalaryTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/finance/salary-payable-transactions`);
        
        if (response.data.status === 'success') {
          setTransactions(response.data.data || []);
        } else {
          setError(response.data.message || 'Failed to load data');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to fetch salary payment records');
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryTransactions();
  }, []);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  // Calculate totals (only paid amount)
  const totalPaid = useMemo(() => 
    transactions.reduce((sum, t) => sum + Number(t.paid_amount || 0), 0),
    [transactions]
  );

  const uniqueEmployees = useMemo(() => 
    new Set(transactions.map(t => t.emp_id)).size,
    [transactions]
  );

  // Get unique project names for dropdown
  const projectOptions = useMemo(() => {
    const projects = new Set(transactions.map(t => t.project_name).filter(Boolean));
    return ['All Projects', ...Array.from(projects)];
  }, [transactions]);

  // Filtered transactions (client-side)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Project filter
      if (selectedProject && selectedProject !== 'All Projects' && tx.project_name !== selectedProject) {
        return false;
      }

      // Date range filter
      if (startDate && tx.entry_date < startDate) return false;
      if (endDate && tx.entry_date > endDate) return false;

      // Search filter (emp name, emp_id, mobile)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        return (
          tx.full_name?.toLowerCase().includes(term) ||
          tx.emp_id?.toLowerCase().includes(term) ||
          tx.mobile?.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [transactions, selectedProject, startDate, endDate, searchTerm]);

  return (
    <div className="min-h-full bg-gray-50/40 flex flex-col">
      {/* Top Bar - Only Back & Total Paid */}
      <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Payables</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Total Paid:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatINR(totalPaid)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile Total Paid */}
          <div className="sm:hidden mb-6">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatINR(totalPaid)}
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Salary Payment History
            </h1>
            <p className="mt-1 text-gray-600">
              {filteredTransactions.length} payments found
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Project Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {projectOptions.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Search by Name / ID / Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Employee
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, Emp ID or Mobile..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees Paid</p>
                  <p className="text-3xl font-bold mt-1 text-indigo-700">{uniqueEmployees}</p>
                </div>
                <Users className="w-10 h-10 text-indigo-200" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount Paid</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">
                    {formatINR(totalPaid)}
                  </p>
                </div>
                <IndianRupee className="w-10 h-10 text-green-200" />
              </div>
            </div>
          </div>

          {/* Table / States */}
          {loading ? (
            <div className="bg-white p-10 text-center rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment history...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-8 text-center rounded-lg border border-red-200 text-red-700">
              <p className="text-lg font-medium">{error}</p>
              <p className="mt-2">Please try again later.</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No matching payments found
              </h3>
              <p className="text-gray-500">
                Try adjusting filters or clear search.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            
                          <div className="text-sm font-medium text-gray-900">{tx.full_name}</div>
                          <div className="text-xs text-gray-500">
                            EMP ID: {tx.emp_id}
                            <br />
                            Approved Salary: {formatINR(tx.approved_salary)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tx.mobile || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {tx.project_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(tx.entry_date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                          {formatINR(tx.paid_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tx.bank_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
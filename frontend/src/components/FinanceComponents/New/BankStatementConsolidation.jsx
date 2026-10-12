import { API_BASE_URL } from "../../../config/api.js";
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Calendar, Edit, Trash2, Eye, X, Save, AlertCircle, Search, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import CreatableSelect from 'react-select/creatable';

const BankStatementConsolidation = () => {
  const [bankStatements, setBankStatements] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [bankMasters, setBankMasters] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingCostCenter, setCreatingCostCenter] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [showYearModal, setShowYearModal] = useState(false);

  // Searchable dropdown states
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const dropdownRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    finance_year_id: '',
    transaction_date: '',
    expense_description: '',
    cost_center_id: '',
    po_status: 'not_available',
    po_number: '',
    cost_element: '',
    amount: '',
    transaction_type: 'debit',
    bank_id: '',
    payment_category: 'na',
    classification: 'N/A',
    invoice_date: '',
    invoice_no: '',
    utr_details: ''
  });

  // New Financial Year form state
  const [yearFormData, setYearFormData] = useState({
    start_year: '',
    end_year: ''
  });

  // Validation states
  const [yearErrors, setYearErrors] = useState({
    start_year: '',
    end_year: '',
    exists: ''
  });

  // Fetch financial years and cost centers on component mount
  useEffect(() => {
    fetchFinancialYears();
    fetchCostCenters();
    fetchBankMasters();
  }, []);

  // Fetch bank statements when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchBankStatements();
    }
  }, [selectedYear]);

  // Validate year form whenever inputs change
  useEffect(() => {
    validateYearForm();
  }, [yearFormData.start_year, yearFormData.end_year, financialYears]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cost centers based on search term
  const filteredCostCenters = costCenters.filter(center =>
    (center.cost_center_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const exactCostCenterMatch = costCenters.find(
    center => center.cost_center_name.trim().toLowerCase() === searchTerm.trim().toLowerCase()
  );
  const bankOptions = bankMasters.map(bank => ({
    value: bank.id,
    label: bank.bank_name
  }));

  const validateYearForm = () => {
    const errors = {
      start_year: '',
      end_year: '',
      exists: ''
    };

    const { start_year, end_year } = yearFormData;

    if (!start_year) {
      errors.start_year = 'Start year is required';
    }
    if (!end_year) {
      errors.end_year = 'End year is required';
    }

    if (start_year && end_year) {
      if (parseInt(start_year) >= parseInt(end_year)) {
        errors.end_year = 'End year must be greater than start year';
      }
    }

    if (start_year && end_year && !errors.start_year && !errors.end_year) {
      const exists = financialYears.some(y => 
        y.start_year === start_year && y.end_year === end_year
      );
      if (exists) {
        errors.exists = 'This financial year already exists!';
      }
    }

    setYearErrors(errors);
  };

  const isYearFormValid = () => {
    return (
      yearFormData.start_year &&
      yearFormData.end_year &&
      parseInt(yearFormData.start_year) < parseInt(yearFormData.end_year) &&
      !yearErrors.exists &&
      !yearErrors.start_year &&
      !yearErrors.end_year
    );
  };

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
      }
    } catch (error) {
      console.error('Error fetching financial years:', error);
      toast.error('Failed to fetch financial years');
      setFinancialYears([]);
    }
  };

  const fetchCostCenters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/cost-centers`);
      const data = response.data.data || response.data;
      setCostCenters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching cost centers:', error);
      setCostCenters([]);
    }
  };

  const fetchBankMasters = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      const data = response.data.data || response.data;
      setBankMasters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bank masters:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch bank masters');
      setBankMasters([]);
    }
  };

  const handleCreateBank = async (inputValue) => {
    const bankName = inputValue.trim();
    if (!bankName) return;
    if (bankName.length > 200) {
      toast.error('Bank name must be 200 characters or fewer');
      return;
    }
    const existingBank = bankMasters.find(
      bank => bank.bank_name.trim().toLowerCase() === bankName.toLowerCase()
    );
    if (existingBank) {
      setSelectedBank({ value: existingBank.id, label: existingBank.bank_name });
      setFormData(prev => ({ ...prev, bank_id: existingBank.id }));
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/finance/create-bank-master`, {
        bank_name: bankName,
        available_balance: 0,
        created_by: '1'
      });
      const newBank = response.data.data;
      setBankMasters(prev => [...prev.filter(bank => bank.id !== newBank.id), newBank]);
      setSelectedBank({ value: newBank.id, label: newBank.bank_name });
      setFormData(prev => ({ ...prev, bank_id: newBank.id }));
      toast.success(response.data.message || 'Bank created successfully');
    } catch (error) {
      const duplicateBank = bankMasters.find(
        bank => bank.bank_name.trim().toLowerCase() === bankName.toLowerCase()
      );
      if (duplicateBank) {
        setSelectedBank({ value: duplicateBank.id, label: duplicateBank.bank_name });
        setFormData(prev => ({ ...prev, bank_id: duplicateBank.id }));
        return;
      }
      console.error('Error creating bank master:', error);
      toast.error(error.response?.data?.message || 'Failed to create bank');
    }
  };

  const fetchBankStatements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/bank-statements?finance_year_id=${selectedYear}`);
      const data = response.data.data || response.data;
      const statements = data.records || data;
      setBankStatements(Array.isArray(statements) ? statements : []);
    } catch (error) {
      console.error('Error fetching bank statements:', error);
      toast.error('Failed to fetch bank statements');
      setBankStatements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleYearSubmit = async (e) => {
    e.preventDefault();
    
    if (!isYearFormValid()) {
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/finance/create-financial-year`, {
        ...yearFormData,
        is_active: 1,
        created_by: 1
      });
      
      toast.success('Financial year created successfully');
      setShowYearModal(false);
      setYearFormData({
        start_year: '',
        end_year: ''
      });
      setYearErrors({
        start_year: '',
        end_year: '',
        exists: ''
      });
      fetchFinancialYears();
    } catch (error) {
      console.error('Error creating financial year:', error);
      toast.error(error.response?.data?.message || 'Failed to create financial year');
    }
  };

  const handleYearInputChange = (e) => {
    const { name, value } = e.target;
    setYearFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle cost center selection from searchable dropdown
  const handleCostCenterSelect = (center) => {
    setSelectedCostCenter(center);
    setFormData(prev => ({ ...prev, cost_center_id: center.id }));
    setSearchTerm(center.cost_center_name);
    setIsDropdownOpen(false);
  };

  // Handle cost center search input change
  const handleCostCenterSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    const match = costCenters.find(
      center => center.cost_center_name.trim().toLowerCase() === value.trim().toLowerCase()
    );
    setSelectedCostCenter(match || null);
    setFormData(prev => ({ ...prev, cost_center_id: match?.id || '' }));
  };

  const handleCreateCostCenter = async () => {
    const costCenterName = searchTerm.trim();
    if (!costCenterName) return;
    if (costCenterName.length > 255) {
      toast.error('Cost center or supplier name must be 255 characters or fewer');
      return;
    }

    if (exactCostCenterMatch) {
      handleCostCenterSelect(exactCostCenterMatch);
      return;
    }

    setCreatingCostCenter(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/finance/cost-centers`, {
        cost_center_name: costCenterName,
        created_by: 1
      });
      const createdCenter = response.data.data;
      setCostCenters(previous => {
        const next = [...previous.filter(center => center.id !== createdCenter.id), createdCenter];
        return next.sort((left, right) => left.cost_center_name.localeCompare(right.cost_center_name));
      });
      handleCostCenterSelect(createdCenter);
      toast.success(`"${createdCenter.cost_center_name}" is available in Cost Center`);
    } catch (error) {
      console.error('Error creating cost center or supplier:', error);
      toast.error(error.response?.data?.message || 'Failed to create cost center or supplier');
    } finally {
      setCreatingCostCenter(false);
    }
  };

  // Handle clearing the cost center selection
  const handleClearCostCenter = () => {
    setSelectedCostCenter(null);
    setSearchTerm('');
    setFormData(prev => ({ ...prev, cost_center_id: '' }));
    setIsDropdownOpen(false);
  };

  const handleYearChange = (e) => {
    const yearId = parseInt(e.target.value);
    setSelectedYear(yearId);
    setFormData(prev => ({ ...prev, finance_year_id: yearId }));
  };

  const resetForm = () => {
    setFormData({
      finance_year_id: selectedYear || '',
      transaction_date: '',
      expense_description: '',
      cost_center_id: '',
      po_status: 'not_available',
      po_number: '',
      cost_element: '',
      amount: '',
      transaction_type: 'debit',
      bank_id: '',
      payment_category: 'na',
      classification: 'N/A',
      invoice_date: '',
      invoice_no: '',
      utr_details: ''
    });
    setSelectedCostCenter(null);
    setSelectedBank(null);
    setSearchTerm('');
    setEditingId(null);
    setViewingId(null);
  };

  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (item) => {
    // Find and set the selected cost center
    const selectedCenter = costCenters.find(c => c.id === item.cost_center_id);
    if (selectedCenter) {
      setSelectedCostCenter(selectedCenter);
      setSearchTerm(selectedCenter.cost_center_name);
    } else {
      setSelectedCostCenter(null);
      setSearchTerm('');
    }

    setFormData({
      finance_year_id: item.finance_year_id,
      transaction_date: item.transaction_date,
      expense_description: item.expense_description || '',
      cost_center_id: item.cost_center_id || '',
      po_status: item.po_status || 'not_available',
      po_number: item.po_number || '',
      cost_element: item.cost_element || '',
      amount: item.amount || '',
      transaction_type: item.transaction_type || 'debit',
      bank_id: item.bank_id || '',
      payment_category: item.payment_category || 'na',
      classification: item.classification || 'N/A',
      invoice_date: item.invoice_date || '',
      invoice_no: item.invoice_no || '',
      utr_details: item.utr_details || ''
    });
    const bank = bankMasters.find(b => String(b.id) === String(item.bank_id));
    setSelectedBank(bank
      ? { value: bank.id, label: bank.bank_name }
      : item.bank_id
        ? { value: item.bank_id, label: item.bank_master_name || item.bank_name || '' }
        : item.bank_name
          ? { value: '', label: item.bank_name }
        : null);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleView = (item) => {
    // Find and set the selected cost center for view mode
    const selectedCenter = costCenters.find(c => c.id === item.cost_center_id);
    if (selectedCenter) {
      setSelectedCostCenter(selectedCenter);
      setSearchTerm(selectedCenter.cost_center_name);
    }

    setViewingId(item.id);
    setFormData({
      finance_year_id: item.finance_year_id,
      transaction_date: item.transaction_date,
      expense_description: item.expense_description || '',
      cost_center_id: item.cost_center_id || '',
      po_status: item.po_status || 'not_available',
      po_number: item.po_number || '',
      cost_element: item.cost_element || '',
      amount: item.amount || '',
      transaction_type: item.transaction_type || 'debit',
      bank_id: item.bank_id || '',
      payment_category: item.payment_category || 'na',
      classification: item.classification || 'N/A',
      invoice_date: item.invoice_date || '',
      invoice_no: item.invoice_no || '',
      utr_details: item.utr_details || ''
    });
    const bank = bankMasters.find(b => String(b.id) === String(item.bank_id));
    setSelectedBank(bank
      ? { value: bank.id, label: bank.bank_name }
      : item.bank_id
        ? { value: item.bank_id, label: item.bank_master_name || item.bank_name || '' }
        : item.bank_name
          ? { value: '', label: item.bank_name }
        : null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        created_by: 1
      };

      // If po_status is not 'available', clear po_number
      if (payload.po_status !== 'available') {
        payload.po_number = '';
      }

      if (editingId) {
        await axios.put(`${API_BASE_URL}/finance/update-bank-statement/${editingId}`, {
          ...payload,
          updated_by: 1
        });
        toast.success('Bank statement updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/finance/create-bank-statement`, payload);
        toast.success('Bank statement created successfully');
      }
      setShowForm(false);
      resetForm();
      fetchBankStatements();
    } catch (error) {
      console.error('Error saving bank statement:', error);
      toast.error(error.response?.data?.message || 'Failed to save bank statement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/finance/delete-bank-statement/${id}`);
      toast.success('Record deleted successfully');
      fetchBankStatements();
    } catch (error) {
      console.error('Error deleting bank statement:', error);
      toast.error('Failed to delete record');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const getPaymentCategoryLabel = (value) => {
    const labels = {
      purchase: 'Purchase',
      sales: 'Sales',
      purchase_advance: 'Purchase Advance',
      sales_advance: 'Sales Advance',
      na: 'N/A'
    };
    return labels[value] || value;
  };

  const getPoStatusLabel = (value) => {
    return value === 'available' ? 'Available' : 'Not Available';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Bank Statement Consolidation</h1>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Financial Year Dropdown */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div className="flex items-center gap-1">
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Financial Year</option>
                  {financialYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.start_year} - {year.end_year}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setShowYearModal(true);
                    setYearErrors({ start_year: '', end_year: '', exists: '' });
                  }}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Add New Financial Year"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Create New Button */}
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New
            </button>
          </div>
        </div>

        {/* Financial Year Modal */}
        {showYearModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Create Financial Year</h2>
                <button
                  onClick={() => {
                    setShowYearModal(false);
                    setYearFormData({ start_year: '', end_year: '' });
                    setYearErrors({ start_year: '', end_year: '', exists: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleYearSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Year *</label>
                    <input
                      type="number"
                      name="start_year"
                      value={yearFormData.start_year}
                      onChange={handleYearInputChange}
                      placeholder="e.g., 2024"
                      required
                      min="2000"
                      max="2100"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        yearErrors.start_year ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {yearErrors.start_year && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {yearErrors.start_year}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Year *</label>
                    <input
                      type="number"
                      name="end_year"
                      value={yearFormData.end_year}
                      onChange={handleYearInputChange}
                      placeholder="e.g., 2025"
                      required
                      min="2000"
                      max="2100"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        yearErrors.end_year ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {yearErrors.end_year && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {yearErrors.end_year}
                      </p>
                    )}
                  </div>

                  {yearErrors.exists && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {yearErrors.exists}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowYearModal(false);
                        setYearFormData({ start_year: '', end_year: '' });
                        setYearErrors({ start_year: '', end_year: '', exists: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!isYearFormValid()}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        isYearFormValid()
                          ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      Create Year
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Center / Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Element</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UTR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="15" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : bankStatements.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="px-4 py-8 text-center text-gray-500">No records found</td>
                  </tr>
                ) : (
                  bankStatements.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.transaction_date}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{item.expense_description}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.cost_center_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.cost_element}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ₹{parseFloat(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.transaction_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.transaction_type === 'credit' ? 'CR' : 'DR'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.bank_master_name || item.bank_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{getPaymentCategoryLabel(item.payment_category)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.classification || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.invoice_date || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.invoice_no || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.utr_details || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.po_status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {getPoStatusLabel(item.po_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.po_number || '-'}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
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
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {viewingId ? 'View Bank Statement' : editingId ? 'Edit Bank Statement' : 'Create New Bank Statement'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Financial Year */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year *</label>
                    <select
                      name="finance_year_id"
                      value={formData.finance_year_id}
                      onChange={handleInputChange}
                      required
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Financial Year</option>
                      {financialYears.map(year => (
                        <option key={year.id} value={year.id}>
                          {year.start_year} - {year.end_year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transaction Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="transaction_date"
                      value={formData.transaction_date}
                      onChange={handleInputChange}
                      required
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Expense Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      name="expense_description"
                      value={formData.expense_description}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Searchable Cost Center Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Center / Supplier</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search or create cost center / supplier..."
                        value={searchTerm}
                        onChange={handleCostCenterSearch}
                        onFocus={() => setIsDropdownOpen(true)}
                        disabled={!!viewingId}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                      {searchTerm && !viewingId && (
                        <button
                          type="button"
                          onClick={handleClearCostCenter}
                          className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Dropdown list */}
                    {isDropdownOpen && !viewingId && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {!exactCostCenterMatch && searchTerm.trim() && (
                          <button
                            type="button"
                            onClick={handleCreateCostCenter}
                            disabled={creatingCostCenter}
                            className="flex w-full items-center gap-2 border-b border-gray-100 px-4 py-2 text-left text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                          >
                            <Plus className="h-4 w-4" />
                            {creatingCostCenter ? 'Creating...' : `Create "${searchTerm.trim()}" as Cost Center / Supplier`}
                          </button>
                        )}
                        {filteredCostCenters.length > 0 ? (
                          filteredCostCenters.map((center) => (
                            <div
                              key={center.id}
                              onClick={() => handleCostCenterSelect(center)}
                              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                                selectedCostCenter?.id === center.id ? 'bg-blue-100' : ''
                              }`}
                            >
                              <span className="text-sm text-gray-700">{center.cost_center_name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">No cost centers found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Cost Element */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost Element</label>
                    <input
                      type="text"
                      name="cost_element"
                      value={formData.cost_element}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="Enter cost element"
                    />
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Transaction Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      name="transaction_type"
                      value={formData.transaction_type}
                      onChange={handleInputChange}
                      required
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="credit">CR</option>
                      <option value="debit">DR</option>
                    </select>
                  </div>

                  {/* Bank */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                    <CreatableSelect
                      options={bankOptions}
                      value={selectedBank}
                      onChange={(option) => {
                        setSelectedBank(option);
                        setFormData(prev => ({ ...prev, bank_id: option?.value || '' }));
                      }}
                      onCreateOption={handleCreateBank}
                      placeholder="Select or add a bank..."
                      isClearable
                      isDisabled={!!viewingId}
                      formatCreateLabel={(inputValue) => `Add "${inputValue}" to bank master`}
                    />
                  </div>

                  {/* Payment Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Category</label>
                    <select
                      name="payment_category"
                      value={formData.payment_category}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="purchase">Purchase</option>
                      <option value="sales">Sales</option>
                      <option value="purchase_advance">Purchase Advance</option>
                      <option value="sales_advance">Sales Advance</option>
                      <option value="na">N/A</option>
                    </select>
                  </div>

                  {/* Classification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                    <select
                      name="classification"
                      value={formData.classification}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="PR-G">PR-G</option>
                      <option value="PR-WG">PR-WG</option>
                      <option value="SR">SR</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>

                  {/* Invoice Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                    <input
                      type="date"
                      name="invoice_date"
                      value={formData.invoice_date}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Invoice No */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
                    <input
                      type="text"
                      name="invoice_no"
                      value={formData.invoice_no}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="Enter invoice number"
                    />
                  </div>

                  {/* UTR Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UTR Details</label>
                    <input
                      type="text"
                      name="utr_details"
                      value={formData.utr_details}
                      onChange={handleInputChange}
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="Enter UTR details"
                    />
                  </div>

                  {/* PO Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PO Status *</label>
                    <select
                      name="po_status"
                      value={formData.po_status}
                      onChange={handleInputChange}
                      required
                      disabled={!!viewingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="available">Available</option>
                      <option value="not_available">Not Available</option>
                    </select>
                  </div>

                  {formData.po_status === 'available' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PO Number *</label>
                      <input
                        type="text"
                        name="po_number"
                        value={formData.po_number}
                        onChange={handleInputChange}
                        required
                        disabled={!!viewingId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="Enter PO number"
                      />
                    </div>
                  )}
                </div>

                {!viewingId && (
                  <div className="mt-6 flex justify-end gap-3">
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </button>
                  </div>
                )}

                {viewingId && (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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

export default BankStatementConsolidation;
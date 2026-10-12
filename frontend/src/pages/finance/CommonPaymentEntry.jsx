import { API_BASE_URL } from "../../config/api.js";
// pages/finance/CommonPaymentEntry.jsx
import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import {
  ArrowDownCircle, Plus, X, 
  Building2, Users, DollarSign, Truck, Wrench, Home, Coins,
  Calculator, ScrollText, CreditCard, FileText, MoreHorizontal
} from 'lucide-react';

// Static Modals
import CreateCreditors from '../../components/FinanceComponents/CommonPaymentEntry/CreateCreditors';
import SiteInchargeAttendanceModal from '../../components/FinanceComponents/CommonPaymentEntry/SiteInchargeAttendanceModal';
import SalaryPayablesModal from '../../components/FinanceComponents/CommonPaymentEntry/SalaryPayablesModal';
import TransportPayablesModal from '../../components/FinanceComponents/CommonPaymentEntry/TransportPayablesModal';
import ScaffoldingPayablesModal from '../../components/FinanceComponents/CommonPaymentEntry/ScaffoldingPayablesModal';
import SiteAccommodationPayablesModal from '../../components/FinanceComponents/CommonPaymentEntry/SiteAccommodationPayablesModal';
import CommissionPayablesModal from '../../components/FinanceComponents/CommonPaymentEntry/CommissionPayablesModal';
import GstPayablesModal from '../../components/FinanceComponents/CommonPaymentEntry/GstPayablesModal';
import TdsPayablesModal from '../../components/FinanceComponents/CommonPaymentEntry/TdsPayablesModal';
import CreditCardPayablesModal from '../../components/FinanceComponents/CommonPaymentEntry/CreditCardPayablesModal';
import BilledDebtorsModal from '../../components/FinanceComponents/CommonPaymentEntry/BilledDebtorsModal';
import BillToBeRaiseModal from '../../components/FinanceComponents/CommonPaymentEntry/BillToBeRaiseModal';

// Views
import ViewCreditors from '../../components/FinanceComponents/CommonPaymentEntry/ViewCreditors';
import ViewBilledDebtors from '../../components/FinanceComponents/CommonPaymentEntry/ViewBilledDebtors';
import ViewPaymentEntry from '../../components/FinanceComponents/CommonPaymentEntry/ViewPaymentEntry';

const themeColors = { primary: '#1e7a6f' };

const customStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    padding: '0.75rem',
    borderColor: '#dee2e6',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#ecfdf5' : 'white',
    color: state.isSelected ? 'white' : '#212529',
  }),
};

const staticCategories = [
  { value: 'creditors', label: 'Creditors', icon: Building2, isStatic: true },
  { value: 'siteincharge-attendance', label: 'SiteIncharge Attendance', icon: Users, isStatic: true },
  { value: 'salary-payables', label: 'Salary Payables', icon: DollarSign, isStatic: true },
  { value: 'transport', label: 'Transport', icon: Truck, isStatic: true },
  { value: 'scaffolding', label: 'Scaffolding', icon: Wrench, isStatic: true },
  { value: 'site-accommodation', label: 'Site Accommodation', icon: Home, isStatic: true },
  { value: 'commission', label: 'Commission', icon: Coins, isStatic: true },
  { value: 'gst', label: 'GST', icon: Calculator, isStatic: true },
  { value: 'tds', label: 'TDS', icon: ScrollText, isStatic: true },
  { value: 'credit-card', label: 'Credit Card', icon: CreditCard, isStatic: true },
  { value: 'billed-debtors', label: 'Billed Debtors', icon: FileText, isStatic: true },
  { value: 'bill-to-be-raise', label: 'Bill To Be Raise', icon: FileText, isStatic: true },
];

const CommonPaymentEntry = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdBy, setCreatedBy] = useState('');
  const [creditors, setCreditors] = useState([]);
  const [banks, setBanks] = useState([]);
  const [allCategories, setAllCategories] = useState(staticCategories);

  // Bill To Be Raise Data
  const [billToBeRaiseData, setBillToBeRaiseData] = useState([]);
  const [billLoading, setBillLoading] = useState(false);

  // Custom Category Form
  const [paymentForm, setPaymentForm] = useState({
    id: null,
    category_id: '',
    date: '',
    amount: '',
    payment_type_id: '',
    remarks: '',
    paymentLines: []
  });
  const [isEditMode, setIsEditMode] = useState(false);

  // Custom Records Display
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Load createdBy from URL
  useEffect(() => {
    const match = window.location.pathname.match(/\/payments\/([^/]+)$/);
    if (match?.[1]) {
      try {
        setCreatedBy(atob(match[1]));
      } catch {
        setCreatedBy('1');
      }
    }
  }, []);

  // Load Banks
  useEffect(() => {
    axios.get(`${API_BASE_URL}/finance/bank-masters`)
      .then(res => {
        if (res.data?.status === 'success') setBanks(res.data.data || []);
      })
      .catch(err => console.error('Failed to load banks', err));
  }, []);

  // Load Custom Categories
  useEffect(() => {
    axios.get(`${API_BASE_URL}/finance/custom-categories`)
      .then(res => {
        if (res.data?.status === 'success' && res.data.data) {
          const custom = res.data.data.map(cat => ({
            value: cat.id,
            label: cat.category_name,
            icon: MoreHorizontal,
            isStatic: false,
          }));
          setAllCategories(prev => [
            ...prev,
            ...custom.filter(c => !prev.some(p => p.value === c.value))
          ]);
        }
      })
      .catch(err => console.error('Custom categories fetch failed:', err));
  }, []);

  // Fetch Bill To Be Raise Data
  useEffect(() => {
    if (selectedCategory?.value === 'bill-to-be-raise') {
      setBillLoading(true);
      axios.get(`${API_BASE_URL}/finance/bill-to-be-raise`)
        .then(res => {
          if (res.data?.status === 'success') {
            setBillToBeRaiseData(res.data.data || []);
          } else {
            setBillToBeRaiseData([]);
          }
        })
        .catch(err => {
          console.error('Failed to load Bill To Be Raise:', err);
          setBillToBeRaiseData([]);
        })
        .finally(() => setBillLoading(false));
    } else {
      setBillToBeRaiseData([]);
    }
  }, [selectedCategory]);

  // Fetch records when category changes (for other static & custom)
  useEffect(() => {
    if (!selectedCategory) {
      setCategoryRecords([]);
      return;
    }

    if (selectedCategory.isStatic) {
      if (selectedCategory.value === 'creditors') loadCreditors();
      setCategoryRecords([]);
    } else {
      fetchCustomRecords(selectedCategory.label);
    }
  }, [selectedCategory]);

  const loadCreditors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/view-creditors`);
      setCreditors(res.data?.data?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []);
    } catch (err) {
      console.error('Creditors fetch failed:', err);
    }
  };

  const fetchCustomRecords = async (categoryName) => {
    if (!categoryName) return;
    setRecordsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/custom-payments-by-category`, {
        params: { category_name: categoryName.trim() }
      });
      setCategoryRecords(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load custom records:', err);
      setCategoryRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleCreateCategory = async (inputValue) => {
    if (!inputValue?.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/finance/create-custom-category`, {
        category_name: inputValue.trim(),
        created_by: createdBy || '1'
      });

      if (res.data?.status === 'success') {
        const newCat = {
          value: res.data.data.id,
          label: inputValue.trim(),
          icon: MoreHorizontal,
          isStatic: false,
        };
        setAllCategories(prev => [...prev, newCat]);
        setSelectedCategory(newCat);
      }
    } catch (err) {
      alert('Failed to create category: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddRecord = () => {
    if (!selectedCategory) return;

    if (selectedCategory.isStatic) {
      setIsModalOpen(true);
    } else {
      setPaymentForm({
        id: null,
        category_id: selectedCategory.value,
        date: '',
        amount: '',
        payment_type_id: '',
        remarks: '',
        paymentLines: []
      });
      setIsEditMode(false);
      setIsModalOpen(true);
    }
  };

  // ==================== CUSTOM PAYMENT SUBMIT ====================
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || selectedCategory.isStatic) return;

    const { amount, payment_type_id, paymentLines, date, remarks } = paymentForm;

    if (!payment_type_id || !amount || parseFloat(amount) <= 0) {
      return alert("Payment Type and Amount are required");
    }

    const mainAmount = parseFloat(amount);
    const totalLines = paymentLines.reduce((sum, line) => sum + (parseFloat(line.paid_receive_amount) || 0), 0);

    if (totalLines > mainAmount) {
      return alert("Total paid/received cannot exceed main amount");
    }

    try {
      const payload = {
        category_id: parseInt(selectedCategory.value),
        payment_type_id: parseInt(payment_type_id),
        date: date || null,
        amount: mainAmount,
        remarks: remarks?.trim() || null,
        created_by: createdBy || '1',
        paymentLines: paymentLines.filter(l => parseFloat(l.paid_receive_amount) > 0)
      };

      const res = await axios.post(`${API_BASE_URL}/finance/create-custom-payment`, payload);

      if (res.data?.status === 'success') {
        alert('Custom record saved successfully!');
        setIsModalOpen(false);
        fetchCustomRecords(selectedCategory.label);
        setPaymentForm({ id: null, category_id: selectedCategory.value, date: '', amount: '', payment_type_id: '', remarks: '', paymentLines: [] });
      }
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const addPaymentLine = () => {
    setPaymentForm(prev => ({
      ...prev,
      paymentLines: [...prev.paymentLines, {
        paid_receive_amount: '',
        paid_receive_date: '',
        bank_id: '',
        receipt: ''
      }]
    }));
  };

  const updatePaymentLine = (index, field, value) => {
    setPaymentForm(prev => {
      const lines = [...prev.paymentLines];
      lines[index] = { ...lines[index], [field]: value };
      return { ...prev, paymentLines: lines };
    });
  };

  const removePaymentLine = (index) => {
    setPaymentForm(prev => ({
      ...prev,
      paymentLines: prev.paymentLines.filter((_, i) => i !== index)
    }));
  };

  // Helper Functions for Bill To Be Raise
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount) || 0);
  };

  // Render Bill To Be Raise View
  const renderBillToBeRaiseView = () => {
    if (billLoading) {
      return <p className="text-center py-10 text-gray-500">Loading Bill To Be Raise records...</p>;
    }

    return (
      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        <div className="bg-gray-800 text-white px-8 py-5 font-semibold text-lg flex justify-between items-center">
          <span>Bill To Be Raise Records</span>
          <span className="text-sm opacity-75">({billToBeRaiseData.length} records)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">PO Details</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Inv.No.</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Work Completion</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Bill Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Party Name</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Sale Amount</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">GST</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Total Pyt Due</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Remarks</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {billToBeRaiseData.length > 0 ? (
                billToBeRaiseData.map((bill, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{bill.po_details || '—'}</td>
                    <td className="px-6 py-4 font-medium">{bill.inv_no || '—'}</td>
                    <td className="px-6 py-4">{formatDate(bill.work_completion_date)}</td>
                    <td className="px-6 py-4">{formatDate(bill.bill_date)}</td>
                    <td className="px-6 py-4">{formatDate(bill.due_date)}</td>
                    <td className="px-6 py-4 font-medium">{bill.party_name || '—'}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">{formatINR(bill.sale_amount)}</td>
                    <td className="px-6 py-4 text-right">{formatINR(bill.gst)}</td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">{formatINR(bill.total_pyt_due)}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{bill.remarks || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(bill.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="px-8 py-16 text-center text-gray-500">
                    No Bill To Be Raise records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderModal = () => {
    if (!isModalOpen || !selectedCategory) return null;

    if (selectedCategory.isStatic) {
      switch (selectedCategory.value) {
        case 'creditors': return <CreateCreditors isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} createdBy={createdBy} />;
        case 'siteincharge-attendance': return <SiteInchargeAttendanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'salary-payables': return <SalaryPayablesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'transport': return <TransportPayablesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'scaffolding': return <ScaffoldingPayablesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'site-accommodation': return <SiteAccommodationPayablesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'commission': return <CommissionPayablesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'gst': return <GstPayablesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'tds': return <TdsPayablesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'credit-card': return <CreditCardPayablesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />;
        case 'billed-debtors': return <BilledDebtorsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} createdBy={createdBy} />;
        case 'bill-to-be-raise': return <BillToBeRaiseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} createdBy={createdBy} />;
        default: return null;
      }
    }

    // Custom Category Modal (unchanged)
    const isPayable = paymentForm.payment_type_id === "1" || paymentForm.payment_type_id === 1;
    const mainLabel = isPayable ? "Payable Amount" : "Receivable Amount";
    const paidLabel = isPayable ? "Paid Amount" : "Received Amount";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditMode ? 'Edit' : 'Add'} Record — {selectedCategory.label}
            </h2>
            <button onClick={() => { setIsModalOpen(false); setIsEditMode(false); }}>
              <X size={24} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type <span className="text-red-500">*</span></label>
              <select name="payment_type_id" value={paymentForm.payment_type_id} onChange={handlePaymentChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500" required>
                <option value="">Select Type</option>
                <option value="1">Payable</option>
                <option value="2">Receivable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{mainLabel} <span className="text-red-500">*</span></label>
              <input type="number" name="amount" value={paymentForm.amount} onChange={handlePaymentChange} step="0.01" min="0" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isPayable ? "Payable Date" : "Receivable Date"}</label>
              <input type="date" name="date" value={paymentForm.date} onChange={handlePaymentChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">{paidLabel} Entries</label>
                <button type="button" onClick={addPaymentLine} className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
                  <Plus size={18} /> Add {paidLabel} Entry
                </button>
              </div>

              {paymentForm.paymentLines.map((line, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-5 mb-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{paidLabel}</label>
                      <input type="number" value={line.paid_receive_amount} onChange={(e) => updatePaymentLine(index, 'paid_receive_amount', e.target.value)} step="0.01" className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                      <input type="date" value={line.paid_receive_date} onChange={(e) => updatePaymentLine(index, 'paid_receive_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Bank</label>
                      <select value={line.bank_id} onChange={(e) => updatePaymentLine(index, 'bank_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                        <option value="">Select Bank</option>
                        {banks.map(bank => <option key={bank.id} value={bank.id}>{bank.bank_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Receipt / Reference</label>
                      <input type="text" value={line.receipt} onChange={(e) => updatePaymentLine(index, 'receipt', e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="REC-001" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removePaymentLine(index)} className="mt-3 text-red-600 hover:text-red-800 text-sm flex items-center gap-1">
                    <Trash2 size={16} /> Remove Entry
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea name="remarks" value={paymentForm.remarks} onChange={handlePaymentChange} rows={3} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500" placeholder="Any additional notes..." />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button type="button" onClick={() => { setIsModalOpen(false); setIsEditMode(false); }} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Save Record(s)</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border p-8 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 rounded-xl shadow-xl" style={{ backgroundColor: themeColors.primary }}>
              <ArrowDownCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Fund Flow Statement</h1>
              <p className="text-gray-600">Manage all payment records in one place</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1 w-full md:max-w-lg">
              <label className="block text-lg font-semibold mb-3 text-gray-700">Payment For / Filter View</label>
              <CreatableSelect
                options={allCategories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                onCreateOption={handleCreateCategory}
                placeholder="Search or create new category..."
                formatCreateLabel={(input) => `Create "${input}"`}
                isSearchable
                isClearable
                formatOptionLabel={(opt) => (
                  <div className="flex items-center gap-3">
                    {opt.icon && <opt.icon size={20} className={opt.isStatic ? 'text-teal-600' : 'text-purple-600'} />}
                    <span>{opt.label}</span>
                  </div>
                )}
                styles={customStyles}
              />
            </div>

            <button
              onClick={handleAddRecord}
              disabled={!selectedCategory}
              className={`w-full md:w-auto px-10 py-4 rounded-lg font-bold text-white flex justify-center items-center gap-3 transition-all ${!selectedCategory ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:scale-105'}`}
            >
              <Plus size={22} /> Add Record
            </button>
          </div>
        </div>

        {/* Static Views */}
        {selectedCategory?.isStatic && (
          <div className="mt-8">
            {selectedCategory.value === 'creditors' && <ViewCreditors creditors={creditors} onRefresh={loadCreditors} />}
            {selectedCategory.value === 'billed-debtors' && <ViewBilledDebtors createdBy={createdBy} />}
            {selectedCategory.value === 'bill-to-be-raise' && renderBillToBeRaiseView()}   {/* Bill To Be Raise View */}
          </div>
        )}

        {/* Custom Category Records */}
        {!selectedCategory?.isStatic && selectedCategory && (
          <div className="mt-8">
            {recordsLoading ? <p className="text-center py-10">Loading records...</p> : null}
          </div>
        )}

        {renderModal()}

        {/* Global View */}
        <div className="mt-12">
          <ViewPaymentEntry />
        </div>
      </div>
    </div>
  );
};

export default CommonPaymentEntry;

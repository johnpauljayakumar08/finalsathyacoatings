import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import Select from 'react-select';
// import CreatableSelect from 'react-select/creatable';
// import { X, Plus, Building2 } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const customStyles = {
//   control: (provided, state) => ({
//     ...provided,
//     borderColor: state.isFocused ? themeColors.primary : themeColors.border,
//     boxShadow: state.isFocused ? `0 0 0 1px ${themeColors.primary}` : 'none',
//     minHeight: '40px',
//     borderRadius: '0.5rem',
//     '&:hover': { borderColor: themeColors.primary },
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#ecfdf5' : 'white',
//     color: state.isSelected ? 'white' : themeColors.textPrimary,
//   }),
// };

// const CreateBilledDebtors = ({ onClose, onSuccess }) => {
//   const [formData, setFormData] = useState({
//     finance_party_id: '',
//     finance_bank_id: '', // ← Added for bank
//     po_details: '',
//     inv_no: '',
//     bill_date: '',
//     due_date: '',
//     finance_item_id: '',
//     quantity: '',
//     uom: '',
//     rate: '',
//     sale_amount: '',
//     gst_amount: '',
//     total_payment_due: '',
//     date_of_receipt: '',
//     amount_received: ''
//   });

//   const [expectedDates, setExpectedDates] = useState([{ expected_from_date: '', expected_to_date: '', amount: '' }]);
//   const [balanceAmount, setBalanceAmount] = useState(0);
//   const [parties, setParties] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [items, setItems] = useState([]);
//   const [uoms, setUoms] = useState([]);
//   const [selectedParty, setSelectedParty] = useState(null);
//   const [selectedBank, setSelectedBank] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [selectedUom, setSelectedUom] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');
//   const createdBy = 1;

//   const partyOptions = useMemo(() => parties.map(p => ({ value: p.id, label: p.party_name })), [parties]);
//   const bankOptions = useMemo(() => banks.map(b => ({
//     value: b.id,
//     label: `${b.bank_name} (${b.account_no || 'A/c'} - ₹${Number(b.available_balance || 0).toLocaleString('en-IN')})`
//   })), [banks]);
//   const itemOptions = useMemo(() => items.map(i => ({ value: i.id, label: i.item_name })), [items]);
//   const uomOptions = useMemo(() => uoms.map(u => ({ value: u.id, label: u.name })), [uoms]);

//   useEffect(() => {
//     fetchParties();
//     fetchBanks();
//     fetchItems();
//     fetchUoms();
//   }, []);

//   useEffect(() => {
//     const total = parseFloat(formData.total_payment_due) || 0;
//     const received = parseFloat(formData.amount_received) || 0;
//     setBalanceAmount(total - received);
//   }, [formData.total_payment_due, formData.amount_received]);

//   const fetchParties = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/parties`);
//       setParties(res.data.data || []);
//     } catch (err) { setErrorMsg('Failed to load parties'); }
//   };

//   const fetchBanks = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
//       setBanks(res.data.data || []);
//     } catch (err) { setErrorMsg('Failed to load banks'); }
//   };

//   const fetchItems = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/items`);
//       setItems(res.data.data || []);
//     } catch (err) { setErrorMsg('Failed to load items'); }
//   };

//   const fetchUoms = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/uoms`);
//       setUoms(res.data.data || []);
//     } catch (err) { setErrorMsg('Failed to load UOMs'); }
//   };

//   const handleCreateParty = async (inputValue) => {
//     const trimmed = inputValue.trim();
//     if (!trimmed) return;
//     try {
//       const res = await axios.post(`${API_BASE_URL}/finance/create-party`, {
//         party_name: trimmed,
//         created_by: createdBy
//       });
//       const newParty = res.data.data;
//       setParties(prev => [...prev, newParty]);
//       setSelectedParty({ value: newParty.id, label: newParty.party_name });
//       setFormData(prev => ({ ...prev, finance_party_id: newParty.id }));
//     } catch (err) {
//       alert('Failed to create party');
//     }
//   };

//   const handleCreateItem = async (inputValue) => {
//     const trimmed = inputValue.trim();
//     if (!trimmed) return;
//     try {
//       const res = await axios.post(`${API_BASE_URL}/finance/create-item`, {
//         item_name: trimmed,
//         created_by: createdBy
//       });
//       const newItem = res.data.data;
//       setItems(prev => [...prev, newItem]);
//       setSelectedItem({ value: newItem.id, label: newItem.item_name });
//       setFormData(prev => ({ ...prev, finance_item_id: newItem.id }));
//     } catch (err) {
//       alert('Failed to create item');
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handlePartyChange = (opt) => {
//     setSelectedParty(opt);
//     setFormData(prev => ({ ...prev, finance_party_id: opt?.value || '' }));
//   };

//   const handleBankChange = (opt) => {
//     setSelectedBank(opt);
//     setFormData(prev => ({ ...prev, finance_bank_id: opt?.value || '' }));
//   };

//   const handleItemChange = (opt) => {
//     setSelectedItem(opt);
//     setFormData(prev => ({ ...prev, finance_item_id: opt?.value || '' }));
//   };

//   const handleUomChange = (opt) => {
//     setSelectedUom(opt);
//     setFormData(prev => ({ ...prev, uom: opt?.value || '' }));
//   };

//   const addExpectedRow = () => {
//     setExpectedDates(prev => [...prev, { expected_from_date: '', expected_to_date: '', amount: '' }]);
//   };

//   const removeExpectedRow = (index) => {
//     if (expectedDates.length === 1) return;
//     setExpectedDates(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleExpectedChange = (index, field, value) => {
//     setExpectedDates(prev => {
//       const updated = [...prev];
//       updated[index][field] = value;
//       return updated;
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMsg('');

//     if (!formData.finance_party_id) return setErrorMsg('Party is required');
//     if (!formData.finance_bank_id) return setErrorMsg('Bank Account is required');
//     if (!formData.due_date) return setErrorMsg('Due Date is required');
//     if (!formData.total_payment_due || parseFloat(formData.total_payment_due) <= 0)
//       return setErrorMsg('Total Payment Due must be greater than 0');

//     const validExpectedDates = expectedDates
//       .filter(ed => ed.expected_from_date && ed.expected_to_date && ed.amount && parseFloat(ed.amount) > 0)
//       .map(ed => ({
//         expected_from_date: ed.expected_from_date,
//         expected_to_date: ed.expected_to_date,
//         amount: parseFloat(ed.amount)
//       }));

//     setLoading(true);
//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-billed-debtors`, {
//         ...formData,
//         finance_bank_id: formData.finance_bank_id,
//         quantity: parseFloat(formData.quantity) || 0,
//         rate: parseFloat(formData.rate) || 0,
//         sale_amount: parseFloat(formData.sale_amount) || 0,
//         gst_amount: parseFloat(formData.gst_amount) || 0,
//         total_payment_due: parseFloat(formData.total_payment_due),
//         amount_received: formData.amount_received ? parseFloat(formData.amount_received) : null,
//         balance_amount: balanceAmount,
//         uom: formData.uom ? parseInt(formData.uom) : null,
//         expected_dates: validExpectedDates.length > 0 ? validExpectedDates : undefined,
//         created_by: createdBy
//       });

//       onSuccess();
//       onClose();
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Failed to create receivable';
//       setErrorMsg(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//               <Building2 className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h1 className="text-2xl font-bold">Billed Debtors Received</h1>
//               <p className="text-sm text-gray-600">Add new receivable with bank details</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
//             <X size={24} />
//           </button>
//         </div>

//         {errorMsg && (
//           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
//             {errorMsg}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//             <table className="w-full">
//               <thead style={{ backgroundColor: themeColors.lightBg }}>
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">Field</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">Value</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y">

//                 {/* Party */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Party Name *</td>
//                   <td className="px-6 py-4">
//                     <CreatableSelect
//                       options={partyOptions}
//                       value={selectedParty}
//                       onChange={handlePartyChange}
//                       onCreateOption={handleCreateParty}
//                       placeholder="Search or add party..."
//                       isClearable
//                       styles={customStyles}
//                     />
//                   </td>
//                 </tr>

//                 {/* Bank */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Bank Account *</td>
//                   <td className="px-6 py-4">
//                     <Select
//                       options={bankOptions}
//                       value={selectedBank}
//                       onChange={handleBankChange}
//                       placeholder="Select bank"
//                       isClearable
//                       styles={customStyles}
//                     />
//                   </td>
//                 </tr>

//                 {/* Item Name */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Item Name</td>
//                   <td className="px-6 py-4">
//                     <CreatableSelect
//                       options={itemOptions}
//                       value={selectedItem}
//                       onChange={handleItemChange}
//                       onCreateOption={handleCreateItem}
//                       placeholder="Search or add item..."
//                       isClearable
//                       styles={customStyles}
//                     />
//                   </td>
//                 </tr>

//                 {/* PO Details */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">PO Details</td>
//                   <td className="px-6 py-4">
//                     <textarea name="po_details" value={formData.po_details} onChange={handleChange} rows={3}
//                       className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Invoice No */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Invoice No</td>
//                   <td className="px-6 py-4">
//                     <input type="text" name="inv_no" value={formData.inv_no} onChange={handleChange}
//                       className="px-3 py-2 border rounded-lg w-64" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Bill Date */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Bill Date</td>
//                   <td className="px-6 py-4">
//                     <input type="date" name="bill_date" value={formData.bill_date} onChange={handleChange}
//                       className="px-3 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Due Date */}
//                 <tr>
//                   <td  className="px-6 py-4 font-semibold">Due Date *</td>
//                   <td className="px-6 py-4">
//                     <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} required
//                        className="px-3 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Quantity */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Quantity</td>
//                   <td className="px-6 py-4">
//                     <input type="number" name="quantity" value={formData.quantity} onChange={handleChange}
//                       className="px-3 py-2 border rounded-lg w-32" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* UOM */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">UOM</td>
//                   <td className="px-6 py-4">
//                     <Select options={uomOptions} value={selectedUom} onChange={handleUomChange}
//                       placeholder="Select UOM" isClearable styles={customStyles} />
//                   </td>
//                 </tr>

//                 {/* Rate */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Rate</td>
//                   <td className="px-6 py-4">
//                     <input type="number" name="rate" value={formData.rate} onChange={handleChange}
//                       className="px-3 py-2 border rounded-lg w-32" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Sale Amount */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Sale Amount</td>
//                   <td className="px-6 py-4">
//                     <input type="number" name="sale_amount" value={formData.sale_amount} onChange={handleChange}
//                       className="px-3 py-2 border rounded-lg w-40" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* GST Amount */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">GST Amount</td>
//                   <td className="px-6 py-4">
//                     <input type="number" name="gst_amount" value={formData.gst_amount} onChange={handleChange}
//                       className="px-3 py-2 border rounded-lg w-40" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Total Payment Due - THIS IS PRESENT! */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold text-red-600">Total Payment Due *</td>
//                   <td className="px-6 py-4">
//                     <input
//                       type="number"
//                       name="total_payment_due"
//                       value={formData.total_payment_due}
//                       onChange={handleChange}
//                       className="px-4 py-2 border-2 border-red-300 rounded-lg w-48 font-bold text-lg"
//                       style={{ borderColor: '#f87171' }}
//                       placeholder="0.00"
//                       step="0.01"
//                       min="0.01"
//                       required
//                     />
//                   </td>
//                 </tr>

//                 {/* Date of Receipt */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Date of Receipt</td>
//                   <td className="px-6 py-4">
//                     <input type="date" name="date_of_receipt" value={formData.date_of_receipt} onChange={handleChange}
//                       className="px-3 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Amount Received */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Amount Received</td>
//                   <td className="px-6 py-4">
//                     <input type="number" name="amount_received" value={formData.amount_received} onChange={handleChange}
//                       className="px-3 py-2 border rounded-lg w-40" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Balance Amount (Read-only) */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold">Balance Amount</td>
//                   <td className="px-6 py-4">
//                     <input type="number" value={balanceAmount} readOnly
//                       className="px-3 py-2 bg-gray-100 border rounded-lg w-40 font-bold" style={{ borderColor: themeColors.border }} />
//                   </td>
//                 </tr>

//                 {/* Expected Dates */}
//                 <tr>
//                   <td className="px-6 py-4 font-semibold align-top">Expected Dates of Receipt</td>
//                   <td className="px-6 py-4">
//                     {expectedDates.map((row, i) => (
//                       <div key={i} className="flex gap-3 mb-3 items-center">
//                         <input type="date" value={row.expected_from_date} onChange={e => handleExpectedChange(i, 'expected_from_date', e.target.value)}
//                           className="px-3 py-2 border rounded-lg w-40" style={{ borderColor: themeColors.border }} />
//                         <input type="date" value={row.expected_to_date} onChange={e => handleExpectedChange(i, 'expected_to_date', e.target.value)}
//                           className="px-3 py-2 border rounded-lg w-40" style={{ borderColor: themeColors.border }} />
//                         <input type="number" placeholder="Amount" value={row.amount} onChange={e => handleExpectedChange(i, 'amount', e.target.value)}
//                           className="px-3 py-2 border rounded-lg w-32" style={{ borderColor: themeColors.border }} />
//                         {expectedDates.length > 1 && (
//                           <button type="button" onClick={() => removeExpectedRow(i)} className="text-red-600">
//                             <X size={18} />
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                     <button type="button" onClick={addExpectedRow} className="text-sm text-blue-600 flex items-center gap-1">
//                       <Plus size={16} /> Add Row
//                     </button>
//                   </td>
//                 </tr>

//               </tbody>
//             </table>
//           </div>

//           {/* Buttons */}
//           <div className="mt-8 flex justify-end gap-4">
//             <button type="button" onClick={onClose}
//               className="px-6 py-3 border rounded-lg font-medium"
//               style={{ borderColor: themeColors.border }}>
//               Cancel
//             </button>
//             <button type="submit" disabled={loading}
//               className="px-8 py-3 text-white rounded-lg font-medium"
//               style={{ backgroundColor: themeColors.primary }}>
//               {loading ? 'Creating...' : 'Create Receivable'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateBilledDebtors;












import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useParams } from 'react-router-dom'; // ← Added
import { X, Plus, Building2 } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? themeColors.primary : themeColors.border,
    boxShadow: state.isFocused ? `0 0 0 1px ${themeColors.primary}` : 'none',
    minHeight: '40px',
    borderRadius: '0.5rem',
    '&:hover': { borderColor: themeColors.primary },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#ecfdf5' : 'white',
    color: state.isSelected ? 'white' : themeColors.textPrimary,
  }),
};

// Decode Base64 user ID from URL (NA== → 1)
const useCurrentUserId = () => {
  const { encodedUserId } = useParams();
  return useMemo(() => {
    if (!encodedUserId || encodedUserId === ':encodedUserId') return null;
    try {
      const decoded = atob(encodedUserId.trim());
      const id = parseInt(decoded, 10);
      return isNaN(id) ? null : id;
    } catch {
      return null;
    }
  }, [encodedUserId]);
};

const CreateBilledDebtors = ({ onClose, onSuccess }) => {
  const currentUserId = useCurrentUserId(); // ← Real logged-in user from URL

  const [formData, setFormData] = useState({
    finance_party_id: '',
    finance_bank_id: '',
    po_details: '',
    inv_no: '',
    bill_date: '',
    due_date: '',
    finance_item_id: '',
    quantity: '',
    uom: '',
    rate: '',
    sale_amount: '',
    gst_amount: '',
    total_payment_due: '',
    date_of_receipt: '',
    amount_received: ''
  });

  const [expectedDates, setExpectedDates] = useState([{ expected_from_date: '', expected_to_date: '', amount: '' }]);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [parties, setParties] = useState([]);
  const [banks, setBanks] = useState([]);
  const [items, setItems] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUom, setSelectedUom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const partyOptions = useMemo(() => parties.map(p => ({ value: p.id, label: p.party_name })), [parties]);
  const bankOptions = useMemo(() => banks.map(b => ({
    value: b.id,
    label: `${b.bank_name} (${b.account_no || 'A/c'} - ₹${Number(b.available_balance || 0).toLocaleString('en-IN')})`
  })), [banks]);
  const itemOptions = useMemo(() => items.map(i => ({ value: i.id, label: i.item_name })), [items]);
  const uomOptions = useMemo(() => uoms.map(u => ({ value: u.id, label: u.name })), [uoms]);

  useEffect(() => {
    fetchParties();
    fetchBanks();
    fetchItems();
    fetchUoms();
  }, []);

  useEffect(() => {
    const total = parseFloat(formData.total_payment_due) || 0;
    const received = parseFloat(formData.amount_received) || 0;
    setBalanceAmount(total - received);
  }, [formData.total_payment_due, formData.amount_received]);

  const fetchParties = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/parties`);
      setParties(res.data.data || []);
    } catch (err) { setErrorMsg('Failed to load parties'); }
  };

  const fetchBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      setBanks(res.data.data || []);
    } catch (err) { setErrorMsg('Failed to load banks'); }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/items`);
      setItems(res.data.data || []);
    } catch (err) { setErrorMsg('Failed to load items'); }
  };

  const fetchUoms = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/uoms`);
      setUoms(res.data.data || []);
    } catch (err) { setErrorMsg('Failed to load UOMs'); }
  };

  const handleCreateParty = async (inputValue) => {
    const trimmed = inputValue.trim();
    if (!trimmed || !currentUserId) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/finance/create-party`, {
        party_name: trimmed,
        created_by: currentUserId  // ← Real user
      });
      const newParty = res.data.data;
      setParties(prev => [...prev, newParty]);
      setSelectedParty({ value: newParty.id, label: newParty.party_name });
      setFormData(prev => ({ ...prev, finance_party_id: newParty.id }));
    } catch (err) {
      alert('Failed to create party');
    }
  };

  const handleCreateItem = async (inputValue) => {
    const trimmed = inputValue.trim();
    if (!trimmed || !currentUserId) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/finance/create-item`, {
        item_name: trimmed,
        created_by: currentUserId  // ← Real user
      });
      const newItem = res.data.data;
      setItems(prev => [...prev, newItem]);
      setSelectedItem({ value: newItem.id, label: newItem.item_name });
      setFormData(prev => ({ ...prev, finance_item_id: newItem.id }));
    } catch (err) {
      alert('Failed to create item');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartyChange = (opt) => {
    setSelectedParty(opt);
    setFormData(prev => ({ ...prev, finance_party_id: opt?.value || '' }));
  };

  const handleBankChange = (opt) => {
    setSelectedBank(opt);
    setFormData(prev => ({ ...prev, finance_bank_id: opt?.value || '' }));
  };

  const handleItemChange = (opt) => {
    setSelectedItem(opt);
    setFormData(prev => ({ ...prev, finance_item_id: opt?.value || '' }));
  };

  const handleUomChange = (opt) => {
    setSelectedUom(opt);
    setFormData(prev => ({ ...prev, uom: opt?.value || '' }));
  };

  const addExpectedRow = () => {
    setExpectedDates(prev => [...prev, { expected_from_date: '', expected_to_date: '', amount: '' }]);
  };

  const removeExpectedRow = (index) => {
    if (expectedDates.length === 1) return;
    setExpectedDates(prev => prev.filter((_, i) => i !== index));
  };

  const handleExpectedChange = (index, field, value) => {
    setExpectedDates(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUserId) {
      setErrorMsg('User not authenticated');
      return;
    }
    if (!formData.finance_party_id) return setErrorMsg('Party is required');
    if (!formData.finance_bank_id) return setErrorMsg('Bank Account is required');
    if (!formData.due_date) return setErrorMsg('Due Date is required');
    if (!formData.total_payment_due || parseFloat(formData.total_payment_due) <= 0)
      return setErrorMsg('Total Payment Due must be greater than 0');

    const validExpectedDates = expectedDates
      .filter(ed => ed.expected_from_date && ed.expected_to_date && ed.amount && parseFloat(ed.amount) > 0)
      .map(ed => ({
        expected_from_date: ed.expected_from_date,
        expected_to_date: ed.expected_to_date,
        amount: parseFloat(ed.amount)
      }));

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/finance/create-billed-debtors`, {
        ...formData,
        finance_bank_id: formData.finance_bank_id,
        quantity: parseFloat(formData.quantity) || 0,
        rate: parseFloat(formData.rate) || 0,
        sale_amount: parseFloat(formData.sale_amount) || 0,
        gst_amount: parseFloat(formData.gst_amount) || 0,
        total_payment_due: parseFloat(formData.total_payment_due),
        amount_received: formData.amount_received ? parseFloat(formData.amount_received) : null,
        balance_amount: balanceAmount,
        uom: formData.uom ? parseInt(formData.uom) : null,
        expected_dates: validExpectedDates.length > 0 ? validExpectedDates : undefined,
        created_by: currentUserId  // ← Real user from URL
      });

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create receivable';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Create Billed Debtors Received</h1>
              <p className="text-sm text-gray-600">Add new receivable with bank details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead style={{ backgroundColor: themeColors.lightBg }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">Field</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">

                {/* Party */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Party Name *</td>
                  <td className="px-6 py-4">
                    <CreatableSelect
                      options={partyOptions}
                      value={selectedParty}
                      onChange={handlePartyChange}
                      onCreateOption={handleCreateParty}
                      placeholder="Search or add party..."
                      isClearable
                      styles={customStyles}
                    />
                  </td>
                </tr>

                {/* Bank */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Bank Account *</td>
                  <td className="px-6 py-4">
                    <Select
                      options={bankOptions}
                      value={selectedBank}
                      onChange={handleBankChange}
                      placeholder="Select bank"
                      isClearable
                      styles={customStyles}
                    />
                  </td>
                </tr>

                {/* Item Name */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Item Name</td>
                  <td className="px-6 py-4">
                    <CreatableSelect
                      options={itemOptions}
                      value={selectedItem}
                      onChange={handleItemChange}
                      onCreateOption={handleCreateItem}
                      placeholder="Search or add item..."
                      isClearable
                      styles={customStyles}
                    />
                  </td>
                </tr>

                {/* PO Details */}
                <tr>
                  <td className="px-6 py-4 font-semibold">PO Details</td>
                  <td className="px-6 py-4">
                    <textarea name="po_details" value={formData.po_details} onChange={handleChange} rows={3}
                      className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Invoice No */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Invoice No</td>
                  <td className="px-6 py-4">
                    <input type="text" name="inv_no" value={formData.inv_no} onChange={handleChange}
                      className="px-3 py-2 border rounded-lg w-64" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Bill Date */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Bill Date</td>
                  <td className="px-6 py-4">
                    <input type="date" name="bill_date" value={formData.bill_date} onChange={handleChange}
                      className="px-3 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Due Date */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Due Date *</td>
                  <td className="px-6 py-4">
                    <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} required
                       className="px-3 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Quantity */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Quantity</td>
                  <td className="px-6 py-4">
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange}
                      className="px-3 py-2 border rounded-lg w-32" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* UOM */}
                <tr>
                  <td className="px-6 py-4 font-semibold">UOM</td>
                  <td className="px-6 py-4">
                    <Select options={uomOptions} value={selectedUom} onChange={handleUomChange}
                      placeholder="Select UOM" isClearable styles={customStyles} />
                  </td>
                </tr>

                {/* Rate */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Rate</td>
                  <td className="px-6 py-4">
                    <input type="number" name="rate" value={formData.rate} onChange={handleChange}
                      className="px-3 py-2 border rounded-lg w-32" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Sale Amount */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Sale Amount</td>
                  <td className="px-6 py-4">
                    <input type="number" name="sale_amount" value={formData.sale_amount} onChange={handleChange}
                      className="px-3 py-2 border rounded-lg w-40" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* GST Amount */}
                <tr>
                  <td className="px-6 py-4 font-semibold">GST Amount</td>
                  <td className="px-6 py-4">
                    <input type="number" name="gst_amount" value={formData.gst_amount} onChange={handleChange}
                      className="px-3 py-2 border rounded-lg w-40" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Total Payment Due */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-red-600">Total Payment Due *</td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      name="total_payment_due"
                      value={formData.total_payment_due}
                      onChange={handleChange}
                      className="px-4 py-2 border-2 border-red-300 rounded-lg w-48 font-bold text-lg"
                      style={{ borderColor: '#f87171' }}
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </td>
                </tr>

                {/* Date of Receipt */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Date of Receipt</td>
                  <td className="px-6 py-4">
                    <input type="date" name="date_of_receipt" value={formData.date_of_receipt} onChange={handleChange}
                      className="px-3 py-2 border rounded-lg" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Amount Received */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Amount Received</td>
                  <td className="px-6 py-4">
                    <input type="number" name="amount_received" value={formData.amount_received} onChange={handleChange}
                      className="px-3 py-2 border rounded-lg w-40" step="0.01" min="0" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Balance Amount (Read-only) */}
                <tr>
                  <td className="px-6 py-4 font-semibold">Balance Amount</td>
                  <td className="px-6 py-4">
                    <input type="number" value={balanceAmount} readOnly
                      className="px-3 py-2 bg-gray-100 border rounded-lg w-40 font-bold" style={{ borderColor: themeColors.border }} />
                  </td>
                </tr>

                {/* Expected Dates */}
                <tr>
                  <td className="px-6 py-4 font-semibold align-top">Expected Dates of Receipt</td>
                  <td className="px-6 py-4">
                    {expectedDates.map((row, i) => (
                      <div key={i} className="flex gap-3 mb-3 items-center">
                        <input type="date" value={row.expected_from_date} onChange={e => handleExpectedChange(i, 'expected_from_date', e.target.value)}
                          className="px-3 py-2 border rounded-lg w-40" style={{ borderColor: themeColors.border }} />
                        <input type="date" value={row.expected_to_date} onChange={e => handleExpectedChange(i, 'expected_to_date', e.target.value)}
                          className="px-3 py-2 border rounded-lg w-40" style={{ borderColor: themeColors.border }} />
                        <input type="number" placeholder="Amount" value={row.amount} onChange={e => handleExpectedChange(i, 'amount', e.target.value)}
                          className="px-3 py-2 border rounded-lg w-32" style={{ borderColor: themeColors.border }} />
                        {expectedDates.length > 1 && (
                          <button type="button" onClick={() => removeExpectedRow(i)} className="text-red-600">
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addExpectedRow} className="text-sm text-blue-600 flex items-center gap-1">
                      <Plus size={16} /> Add Row
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <button type="button" onClick={onClose}
              className="px-6 py-3 border rounded-lg font-medium"
              style={{ borderColor: themeColors.border }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-8 py-3 text-white rounded-lg font-medium"
              style={{ backgroundColor: themeColors.primary }}>
              {loading ? 'Creating...' : 'Create Receivable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBilledDebtors;
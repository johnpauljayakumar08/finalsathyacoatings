import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import axios from 'axios';
// import { Calendar, FileText, DollarSign, User, Hash, Package, Percent, Clock, MessageSquare, Building2, Plus } from 'lucide-react';

// // Same exact theme as all other pages
// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
//   lightBorder: '#e9ecef',
// };

// const inputStyle = {
//   base: 'w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1',
//   normal: 'border-gray-300 focus:border-transparent',
//   focusRing: 'focus:ring-teal-500',
// };

// const labelStyle = 'block text-sm font-semibold mb-2';
// const sectionStyle = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';

// const CreateCreditors = ({ onSuccess }) => {
//   const [clients, setClients] = useState([]);
//   const [clientInputValue, setClientInputValue] = useState('');
//   const [formData, setFormData] = useState({
//     client_id: '',
//     po_date: '',
//     po_sent_through: '',
//     inv_number: '',
//     bill_date: '',
//     pdc_date: '',
//     item_code: '',
//     qty: '',
//     rate: '',
//     sale_amount: '',
//     gst_amount: '',
//     total_payment_due: '',
//     amount_paid: '',
//     balance_amount: '',
//     date_of_payment: '',
//     due_date: '',
//     remarks: '',
//     is_gst: 1,
//     created_by: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [showAddOption, setShowAddOption] = useState(false);
//   const [creditorType, setCreditorType] = useState('gst');

//   useEffect(() => {
//     loadClients();
//   }, []);

//   const loadClients = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/finance/view-creditors-client`);
//       setClients(response.data.data.map(client => ({ value: client.id, label: client.client_name })));
//     } catch (error) {
//       console.error('Error loading clients:', error);
//     }
//   };

//   const handleClientInputChange = (inputValue) => {
//     setClientInputValue(inputValue);
//     setShowAddOption(!!inputValue && !clients.some(c => c.label.toLowerCase().includes(inputValue.toLowerCase())));
//   };

//   const handleClientChange = async (selectedOption) => {
//     if (selectedOption && selectedOption.value === 'add') {
//       try {
//         const newClientName = clientInputValue.trim();
//         if (!newClientName) return;

//         const response = await axios.post(`${API_BASE_URL}/finance/create-creditors-client`, {
//           client_name: newClientName,
//           created_by: null,
//           updated_by: null
//         });

//         const newClient = { value: response.data.data.id, label: newClientName };
//         setClients(prev => [...prev, newClient]);
//         setFormData(prev => ({ ...prev, client_id: newClient.value }));
//         setClientInputValue('');
//         setShowAddOption(false);
//       } catch (error) {
//         console.error('Error creating client:', error);
//         alert('Error creating new client');
//       }
//     } else {
//       setFormData(prev => ({ ...prev, client_id: selectedOption ? selectedOption.value : '' }));
//     }
//   };

//   const handleCreditorTypeChange = (e) => {
//     const type = e.target.value;
//     setCreditorType(type);
//     setFormData(prev => ({ ...prev, is_gst: type === 'gst' ? 1 : 0 }));
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.client_id || !formData.created_by) {
//       alert('Client and Created By are required fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-creditors`, formData);
//       alert('Creditor created successfully!');
//       onSuccess?.();
//       // Reset form
//       setFormData({
//         client_id: '', po_date: '', po_sent_through: '', inv_number: '', bill_date: '',
//         pdc_date: '', item_code: '', qty: '', rate: '', sale_amount: '', gst_amount: '',
//         total_payment_due: '', amount_paid: '', balance_amount: '', date_of_payment: '',
//         due_date: '', remarks: '', is_gst: 1, created_by: ''
//       });
//       setCreditorType('gst');
//     } catch (error) {
//       console.error('Error creating creditor:', error);
//       alert('Failed to create creditor');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clientOptions = [
//     ...clients,
//     ...(showAddOption ? [{ value: 'add', label: `➕ Add "${clientInputValue}"` }] : [])
//   ];

//   const customSelectStyles = {
//     control: (provided) => ({
//       ...provided,
//       borderColor: themeColors.border,
//       boxShadow: 'none',
//       borderRadius: '0.5rem',
//       padding: '0.375rem 0',
//       '&:hover': { borderColor: themeColors.primary },
//     }),
//     menu: (provided) => ({
//       ...provided,
//       borderRadius: '0.5rem',
//       marginTop: '0.5rem',
//       boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
//     }),
//     option: (provided, state) => ({
//       ...provided,
//       backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#f0fdfa' : 'white',
//       color: state.isSelected ? 'white' : themeColors.textPrimary,
//     }),
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: themeColors.border }}>
//       <div className="p-8">
//         <div className="flex items-center gap-3 mb-8">
//           <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
//             <DollarSign className="w-7 h-7 text-white" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
//               Create New Creditor
//             </h2>
//             <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
//               Enter creditor details below. Fields marked with * are required.
//             </p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className={sectionStyle}>
//           {/* Client Selection */}
//           <div className="lg:col-span-4">
//             <label className={labelStyle} style={{ color: themeColors.textPrimary }}>
//               <Building2 size={16} className="inline mr-2" />
//               Client Name *
//             </label>
//             <Select
//               options={clientOptions}
//               value={clients.find(c => c.value === formData.client_id) || null}
//               onInputChange={handleClientInputChange}
//               onChange={handleClientChange}
//               placeholder="Search or type to add new client..."
//               isSearchable
//               styles={customSelectStyles}
//               className="text-sm"
//             />
//           </div>

//           {/* Creditor Type */}
//           <div className="lg:col-span-4">
//             <label className={labelStyle} style={{ color: themeColors.textPrimary }}>
//               Creditor Type
//             </label>
//             <div className="flex gap-8">
//               {[
//                 { value: 'gst', label: 'GST Creditors', icon: Percent },
//                 { value: 'other', label: 'Other Creditors', icon: FileText }
//               ].map(item => (
//                 <label key={item.value} className="flex items-center cursor-pointer">
//                   <input
//                     type="radio"
//                     name="creditorType"
//                     value={item.value}
//                     checked={creditorType === item.value}
//                     onChange={handleCreditorTypeChange}
//                     className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500"
//                     style={{ accentColor: themeColors.primary }}
//                   />
//                   <span className="ml-3 text-base font-medium flex items-center gap-2" style={{ color: themeColors.textPrimary }}>
//                     <item.icon size={18} />
//                     {item.label}
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Common Fields */}
//           <div className="lg:col-span-2">
//             <label className={labelStyle}><Calendar size={16} className="inline mr-2" />PDC Date</label>
//             <input type="date" name="pdc_date" value={formData.pdc_date} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`}
//               style={{ '--tw-ring-color': themeColors.primary }} />
//           </div>

//           <div>
//             <label className={labelStyle}><Package size={16} className="inline mr-2" />Item Code</label>
//             <input type="text" name="item_code" value={formData.item_code} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div>
//             <label className={labelStyle}><Hash size={16} className="inline mr-2" />Quantity</label>
//             <input type="number" name="qty" value={formData.qty} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div>
//             <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Rate</label>
//             <input type="number" step="0.01" name="rate" value={formData.rate} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div>
//             <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Sale Amount</label>
//             <input type="number" step="0.01" name="sale_amount" value={formData.sale_amount} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div>
//             <label className={labelStyle}><Percent size={16} className="inline mr-2" />GST Amount</label>
//             <input type="number" step="0.01" name="gst_amount" value={formData.gst_amount} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div>
//             <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Total Payment Due</label>
//             <input type="number" step="0.01" name="total_payment_due" value={formData.total_payment_due} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div className="lg:col-span-2">
//             <label className={labelStyle}><Calendar size={16} className="inline mr-2" />Date of Payment</label>
//             <input type="date" name="date_of_payment" value={formData.date_of_payment} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div>
//             <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Amount Paid</label>
//             <input type="number" step="0.01" name="amount_paid" value={formData.amount_paid} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div>
//             <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Balance Amount</label>
//             <input type="number" step="0.01" name="balance_amount" value={formData.balance_amount} onChange={handleInputChange}
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//           </div>

//           <div>
//             <label className={labelStyle}><User size={16} className="inline mr-2" />Created By *</label>
//             <input type="text" name="created_by" value={formData.created_by} onChange={handleInputChange} required
//               className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} maxLength={50} />
//           </div>

//           {/* GST Only Fields */}
//           {creditorType === 'gst' && (
//             <>
//               <div className="lg:col-span-2">
//                 <label className={labelStyle}><Calendar size={16} className="inline mr-2" />PO Date</label>
//                 <input type="date" name="po_date" value={formData.po_date} onChange={handleInputChange}
//                   className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//               </div>

//               <div>
//                 <label className={labelStyle}><FileText size={16} className="inline mr-2" />PO Sent Through</label>
//                 <input type="text" name="po_sent_through" value={formData.po_sent_through} onChange={handleInputChange}
//                   className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} maxLength={100} />
//               </div>

//               <div>
//                 <label className={labelStyle}><FileText size={16} className="inline mr-2" />Invoice Number</label>
//                 <input type="text" name="inv_number" value={formData.inv_number} onChange={handleInputChange}
//                   className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} maxLength={200} />
//               </div>

//               <div className="lg:col-span-2">
//                 <label className={labelStyle}><Calendar size={16} className="inline mr-2" />Bill Date</label>
//                 <input type="date" name="bill_date" value={formData.bill_date} onChange={handleInputChange}
//                   className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//               </div>

//               <div className="lg:col-span-2">
//                 <label className={labelStyle}><Clock size={16} className="inline mr-2" />Due Date</label>
//                 <input type="date" name="due_date" value={formData.due_date} onChange={handleInputChange}
//                   className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
//               </div>

//               <div className="lg:col-span-4">
//                 <label className={labelStyle}><MessageSquare size={16} className="inline mr-2" />Remarks</label>
//                 <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={4}
//                   className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing} resize-none`}
//                   placeholder="Any additional notes..." />
//               </div>
//             </>
//           )}

//           {/* Submit Button */}
//           <div className="lg:col-span-4 mt-6">
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full group flex items-center justify-center gap-3 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md transition-all duration-200 transform hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
//               style={{ backgroundColor: themeColors.primary }}
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div>
//                   Creating Creditor...
//                 </>
//               ) : (
//                 <>
//                   <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
//                   Create Creditor
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateCreditors;


























import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { Calendar, FileText, DollarSign, Hash, Package, Percent, Clock, MessageSquare, Building2, Plus, Banknote } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const inputStyle = {
  base: 'w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1',
  normal: 'border-gray-300 focus:border-transparent',
  focusRing: 'focus:ring-teal-500',
};

const labelStyle = 'block text-sm font-semibold mb-2';
const sectionStyle = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';

const CreateCreditors = ({ onSuccess }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const canManageBanks = ['md', 'managing_director', 'managingdirector']
    .includes(String(user.role || '').replace(/[\s-]/g, '').toLowerCase());
  const [clients, setClients] = useState([]);
  const [banks, setBanks] = useState([]);
  const [clientInputValue, setClientInputValue] = useState('');
  const [bankInputValue, setBankInputValue] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [createdBy, setCreatedBy] = useState(''); // Auto from URL

  const [formData, setFormData] = useState({
    client_id: '',
    finance_bank_id: '', // NEW
    po_date: '',
    po_sent_through: '',
    inv_number: '',
    bill_date: '',
    pdc_date: '',
    item_code: '',
    qty: '',
    rate: '',
    sale_amount: '',
    gst_amount: '',
    total_payment_due: '',
    amount_paid: '',
    balance_amount: '',
    date_of_payment: '',
    due_date: '',
    remarks: '',
    is_gst: 1,
  });

  const [loading, setLoading] = useState(false);
  const [creditorType, setCreditorType] = useState('gst');

  // Extract created_by from URL (e.g., /creditors/NA== → decode)
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/creditors\/([^/]+)$/);
    if (match && match[1]) {
      try {
        const decoded = atob(match[1]); // Base64 decode
        setCreatedBy(decoded);
      } catch (err) {
        console.error('Invalid created_by in URL');
        setCreatedBy('1'); // fallback
      }
    }
  }, []);

  useEffect(() => {
    loadClients();
    loadBanks();
  }, []);

  const loadClients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/view-creditors-client`);
      setClients(response.data.data.map(client => ({ value: client.id, label: client.client_name })));
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      if (res.data.status === 'success') {
        setBanks(res.data.data.map(bank => ({
          value: bank.id,
          label: `${bank.bank_name} (₹${parseFloat(bank.available_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})`
        })));
      }
    } catch (error) {
      console.error('Error loading banks:', error);
    }
  };

  const handleClientInputChange = (inputValue) => {
    setClientInputValue(inputValue);
    setShowAddClient(!!inputValue && !clients.some(c => c.label.toLowerCase().includes(inputValue.toLowerCase())));
  };

  const handleClientChange = async (selectedOption) => {
    if (selectedOption && selectedOption.value === 'add') {
      const newClientName = clientInputValue.trim();
      if (!newClientName) return;

      try {
        const response = await axios.post(`${API_BASE_URL}/finance/create-creditors-client`, {
          client_name: newClientName,
          created_by: createdBy || null,
        });

        const newClient = { value: response.data.data.id, label: newClientName };
        setClients(prev => [...prev, newClient]);
        setFormData(prev => ({ ...prev, client_id: newClient.value }));
        setClientInputValue('');
        setShowAddClient(false);
      } catch (error) {
        alert('Error creating new client');
      }
    } else {
      setFormData(prev => ({ ...prev, client_id: selectedOption ? selectedOption.value : '' }));
    }
  };

  const handleBankInputChange = (input) => {
    setBankInputValue(input);
    setShowAddBank(canManageBanks && !!input && !banks.some(b => b.label.toLowerCase().includes(input.toLowerCase())));
  };

  const handleBankChange = async (option) => {
    if (option?.value === 'add-bank') {
      const name = bankInputValue.trim();
      if (!name) return;
      try {
        const res = await axios.post(`${API_BASE_URL}/finance/create-bank-master`, {
          bank_name: name,
          available_balance: 0,
          created_by: createdBy || 1
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
        });
        const newBank = { value: res.data.data.id, label: `${name} (₹0.00)` };
        setBanks(prev => [...prev, newBank]);
        setFormData(prev => ({ ...prev, finance_bank_id: newBank.value }));
        setBankInputValue('');
        setShowAddBank(false);
      } catch (err) {
        alert('Failed to create bank');
      }
    } else {
      setFormData(prev => ({ ...prev, finance_bank_id: option?.value || '' }));
    }
  };

  const handleCreditorTypeChange = (e) => {
    const type = e.target.value;
    setCreditorType(type);
    setFormData(prev => ({ ...prev, is_gst: type === 'gst' ? 1 : 0 }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      alert('Client is required');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/finance/create-creditors`, {
        ...formData,
        finance_bank_id: formData.finance_bank_id || null,
        created_by: createdBy || '1' // Auto from URL
      });

      alert('Creditor created successfully!');
      onSuccess?.();

      setFormData({
        client_id: '', finance_bank_id: '', po_date: '', po_sent_through: '', inv_number: '',
        bill_date: '', pdc_date: '', item_code: '', qty: '', rate: '', sale_amount: '',
        gst_amount: '', total_payment_due: '', amount_paid: '', balance_amount: '',
        date_of_payment: '', due_date: '', remarks: '', is_gst: 1
      });
      setCreditorType('gst');
    } catch (error) {
      console.error('Error creating creditor:', error);
      alert(error.response?.data?.message || 'Failed to create creditor');
    } finally {
      setLoading(false);
    }
  };

  const clientOptions = [
    ...clients,
    ...(showAddClient ? [{ value: 'add', label: `Add "${clientInputValue}"` }] : [])
  ];

  const bankOptions = [
    ...banks,
    ...(canManageBanks && showAddBank ? [{ value: 'add-bank', label: `Add Bank "${bankInputValue}"` }] : [])
  ];

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: themeColors.border,
      boxShadow: 'none',
      borderRadius: '0.5rem',
      padding: '0.375rem 0',
      '&:hover': { borderColor: themeColors.primary },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '0.5rem',
      marginTop: '0.5rem',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? themeColors.primary : state.isFocused ? '#f0fdfa' : 'white',
      color: state.isSelected ? 'white' : themeColors.textPrimary,
    }),
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border" style={{ borderColor: themeColors.border }}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
            <DollarSign className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
              Create New Creditor
            </h2>
            <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
              Logged in as: <strong>{createdBy || 'Loading...'}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={sectionStyle}>
          {/* Client Selection */}
          <div className="lg:col-span-4">
            <label className={labelStyle} style={{ color: themeColors.textPrimary }}>
              <Building2 size={16} className="inline mr-2" />
              Client Name *
            </label>
            <Select
              options={clientOptions}
              value={clients.find(c => c.value === formData.client_id) || null}
              onInputChange={handleClientInputChange}
              onChange={handleClientChange}
              placeholder="Search or type to add new client..."
              isSearchable
              styles={customSelectStyles}
              className="text-sm"
            />
          </div>

          {/* Bank Account Selection */}
          <div className="lg:col-span-4">
            <label className={labelStyle} style={{ color: themeColors.textPrimary }}>
              <Banknote size={16} className="inline mr-2" />
              Bank Account
            </label>
            <Select
              options={bankOptions}
              value={banks.find(b => b.value === formData.finance_bank_id) || null}
              onInputChange={handleBankInputChange}
              onChange={handleBankChange}
              placeholder="Select or add bank account..."
              isSearchable
              isClearable
              styles={customSelectStyles}
              className="text-sm"
            />
          </div>

          {/* Creditor Type */}
          <div className="lg:col-span-4">
            <label className={labelStyle} style={{ color: themeColors.textPrimary }}>
              Creditor Type
            </label>
            <div className="flex gap-8">
              {[
                { value: 'gst', label: 'GST Creditors', icon: Percent },
                { value: 'other', label: 'Other Creditors', icon: FileText }
              ].map(item => (
                <label key={item.value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="creditorType"
                    value={item.value}
                    checked={creditorType === item.value}
                    onChange={handleCreditorTypeChange}
                    className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500"
                    style={{ accentColor: themeColors.primary }}
                  />
                  <span className="ml-3 text-base font-medium flex items-center gap-2" style={{ color: themeColors.textPrimary }}>
                    <item.icon size={18} />
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* All Original Fields Below – 100% Unchanged */}
          <div className="lg:col-span-2">
            <label className={labelStyle}><Calendar size={16} className="inline mr-2" />PDC Date</label>
            <input type="date" name="pdc_date" value={formData.pdc_date} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`}
              style={{ '--tw-ring-color': themeColors.primary }} />
          </div>

          <div>
            <label className={labelStyle}><Package size={16} className="inline mr-2" />Item Code</label>
            <input type="text" name="item_code" value={formData.item_code} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          <div>
            <label className={labelStyle}><Hash size={16} className="inline mr-2" />Quantity</label>
            <input type="number" name="qty" value={formData.qty} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          <div>
            <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Rate</label>
            <input type="number" step="0.01" name="rate" value={formData.rate} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          <div>
            <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Sale Amount</label>
            <input type="number" step="0.01" name="sale_amount" value={formData.sale_amount} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          <div>
            <label className={labelStyle}><Percent size={16} className="inline mr-2" />GST Amount</label>
            <input type="number" step="0.01" name="gst_amount" value={formData.gst_amount} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          <div>
            <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Total Payment Due</label>
            <input type="number" step="0.01" name="total_payment_due" value={formData.total_payment_due} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          <div className="lg:col-span-2">
            <label className={labelStyle}><Calendar size={16} className="inline mr-2" />Date of Payment</label>
            <input type="date" name="date_of_payment" value={formData.date_of_payment} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          <div>
            <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Amount Paid</label>
            <input type="number" step="0.01" name="amount_paid" value={formData.amount_paid} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          <div>
            <label className={labelStyle}><DollarSign size={16} className="inline mr-2" />Balance Amount</label>
            <input type="number" step="0.01" name="balance_amount" value={formData.balance_amount} onChange={handleInputChange}
              className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
          </div>

          {/* GST Only Fields */}
          {creditorType === 'gst' && (
            <>
              <div className="lg:col-span-2">
                <label className={labelStyle}><Calendar size={16} className="inline mr-2" />PO Date</label>
                <input type="date" name="po_date" value={formData.po_date} onChange={handleInputChange}
                  className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
              </div>

              <div>
                <label className={labelStyle}><FileText size={16} className="inline mr-2" />PO Sent Through</label>
                <input type="text" name="po_sent_through" value={formData.po_sent_through} onChange={handleInputChange}
                  className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} maxLength={100} />
              </div>

              <div>
                <label className={labelStyle}><FileText size={16} className="inline mr-2" />Invoice Number</label>
                <input type="text" name="inv_number" value={formData.inv_number} onChange={handleInputChange}
                  className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} maxLength={200} />
              </div>

              <div className="lg:col-span-2">
                <label className={labelStyle}><Calendar size={16} className="inline mr-2" />Bill Date</label>
                <input type="date" name="bill_date" value={formData.bill_date} onChange={handleInputChange}
                  className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
              </div>

              <div className="lg:col-span-2">
                <label className={labelStyle}><Clock size={16} className="inline mr-2" />Due Date</label>
                <input type="date" name="due_date" value={formData.due_date} onChange={handleInputChange}
                  className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing}`} />
              </div>

              <div className="lg:col-span-4">
                <label className={labelStyle}><MessageSquare size={16} className="inline mr-2" />Remarks</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={4}
                  className={`${inputStyle.base} ${inputStyle.normal} ${inputStyle.focusRing} resize-none`}
                  placeholder="Any additional notes..." />
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="lg:col-span-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-3 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md transition-all duration-200 transform hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: themeColors.primary }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/30 border-t-white"></div>
                  Creating Creditor...
                </>
              ) : (
                <>
                  <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                  Create Creditor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCreditors;
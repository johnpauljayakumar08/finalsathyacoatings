import { API_BASE_URL } from "../../../config/api.js";
// // pages/finance/CreateCreditors.jsx
// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import axios from 'axios';
// import {
//   Calendar, FileText, DollarSign, Hash, Package, Percent, Clock,
//   MessageSquare, Building2, Banknote
// } from 'lucide-react';

// const themeColors = {
//   primary: '#1e7a6f',
//   accent: '#c79100',
//   lightBg: '#f8f9fa',
//   textPrimary: '#212529',
//   textSecondary: '#6c757d',
//   border: '#dee2e6',
// };

// const inputStyle = {
//   base: 'w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1',
//   normal: 'border-gray-300 focus:border-transparent',
//   focusRing: 'focus:ring-teal-500',
// };

// const labelStyle = 'block text-sm font-semibold mb-2';

// const CreateCreditors = ({ createdBy, onSuccess, onCancel }) => {
//   const [clients, setClients] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const [clientInputValue, setClientInputValue] = useState('');
//   const [bankInputValue, setBankInputValue] = useState('');
//   const [showAddClient, setShowAddClient] = useState(false);
//   const [showAddBank, setShowAddBank] = useState(false);
//   const [creditorType, setCreditorType] = useState('gst');
//   const [loadingForm, setLoadingForm] = useState(false);

//   const [formData, setFormData] = useState({
//     client_id: '', finance_bank_id: '', po_date: '', po_sent_through: '', inv_number: '',
//     bill_date: '', pdc_date: '', item_code: '', qty: '', rate: '', sale_amount: '',
//     gst_amount: '', total_payment_due: '', amount_paid: '', balance_amount: '',
//     date_of_payment: '', due_date: '', remarks: '', is_gst: 1
//   });

//   useEffect(() => {
//     loadClients();
//     loadBanks();
//   }, []);

//   const loadClients = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/view-creditors-client`);
//       setClients(res.data.data.map(c => ({ value: c.id, label: c.client_name })));
//     } catch (err) { console.error(err); }
//   };

//   const loadBanks = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
//       if (res.data.status === 'success') {
//         setBanks(res.data.data.map(b => ({
//           value: b.id,
//           label: `${b.bank_name} (₹${parseFloat(b.available_balance || 0).toLocaleString('en-IN')})`
//         })));
//       }
//     } catch (err) { console.error(err); }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.client_id) return alert('Client is required');
//     setLoadingForm(true);
//     try {
//       await axios.post(`${API_BASE_URL}/finance/create-creditors`, {
//         ...formData,
//         created_by: createdBy || '1'
//       });
//       alert('Creditor created successfully!');
//       onSuccess();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error saving');
//     } finally {
//       setLoadingForm(false);
//     }
//   };

//   const clientOptions = [...clients, ...(showAddClient ? [{ value: 'add', label: `Add "${clientInputValue}"` }] : [])];
//   const bankOptions = [...banks, ...(showAddBank ? [{ value: 'add-bank', label: `Add Bank "${bankInputValue}"` }] : [])];

//   return (
//     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[75vh] overflow-y-auto px-2">
//       <div className="lg:col-span-4">
//         <label className={labelStyle}><Building2 size={16} className="inline mr-2" />Client Name *</label>
//         <Select options={clientOptions} onInputChange={(v) => { setClientInputValue(v); setShowAddClient(!!v && !clients.some(c => c.label.toLowerCase().includes(v.toLowerCase()))); }}
//           onChange={async (opt) => {
//             if (opt?.value === 'add') {
//               const name = clientInputValue.trim();
//               if (!name) return;
//               try {
//                 const res = await axios.post(`${API_BASE_URL}/finance/create-creditors-client`, { client_name: name, created_by: createdBy || 1 });
//                 const newClient = { value: res.data.data.id, label: name };
//                 setClients(prev => [...prev, newClient]);
//                 setFormData(prev => ({ ...prev, client_id: newClient.value }));
//               } catch (err) { alert('Failed to add client'); }
//             } else {
//               setFormData(prev => ({ ...prev, client_id: opt?.value || '' }));
//             }
//           }} placeholder="Search or add client..." isSearchable />
//       </div>

//       <div className="lg:col-span-4">
//         <label className={labelStyle}><Banknote size={16} className="inline mr-2" />Bank Account</label>
//         <Select options={bankOptions} onInputChange={(v) => { setBankInputValue(v); setShowAddBank(!!v && !banks.some(b => b.label.toLowerCase().includes(v.toLowerCase()))); }}
//           onChange={async (opt) => {
//             if (opt?.value === 'add-bank') {
//               const name = bankInputValue.trim();
//               if (!name) return;
//               try {
//                 const res = await axios.post(`${API_BASE_URL}/finance/create-bank-master`, { bank_name: name, available_balance: 0, created_by: createdBy || 1 });
//                 const newBank = { value: res.data.data.id, label: `${name} (₹0.00)` };
//                 setBanks(prev => [...prev, newBank]);
//                 setFormData(prev => ({ ...prev, finance_bank_id: newBank.value }));
//               } catch (err) { alert('Failed to add bank'); }
//             } else {
//               setFormData(prev => ({ ...prev, finance_bank_id: opt?.value || '' }));
//             }
//           }} isClearable placeholder="Select bank..." />
//       </div>

//       <div className="lg:col-span-4">
//         <div className="flex gap-8">
//           {[{ value: 'gst', label: 'GST Creditors', icon: Percent }, { value: 'other', label: 'Other Creditors', icon: FileText }].map(item => (
//             <label key={item.value} className="flex items-center cursor-pointer">
//               <input type="radio" name="type" value={item.value} checked={creditorType === item.value}
//                 onChange={(e) => { setCreditorType(e.target.value); setFormData(prev => ({ ...prev, is_gst: e.target.value === 'gst' ? 1 : 0 })); }}
//                 className="w-5 h-5 text-teal-600" style={{ accentColor: themeColors.primary }} />
//               <span className="ml-3 flex items-center gap-2 font-medium"><item.icon size={18} />{item.label}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div><label><Calendar size={16} className="inline mr-2" />PDC Date</label><input type="date" name="pdc_date" value={formData.pdc_date} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><Package size={16} className="inline mr-2" />Item Code</label><input type="text" name="item_code" value={formData.item_code} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><Hash size={16} className="inline mr-2" />Quantity</label><input type="number" name="qty" value={formData.qty} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><DollarSign size={16} className="inline mr-2" />Rate</label><input type="number" step="0.01" name="rate" value={formData.rate} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><DollarSign size={16} className="inline mr-2" />Sale Amount</label><input type="number" step="0.01" name="sale_amount" value={formData.sale_amount} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><Percent size={16} className="inline mr-2" />GST Amount</label><input type="number" step="0.01" name="gst_amount" value={formData.gst_amount} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><DollarSign size={16} className="inline mr-2" />Total Payment Due</label><input type="number" step="0.01" name="total_payment_due" value={formData.total_payment_due} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><Calendar size={16} className="inline mr-2" />Date of Payment</label><input type="date" name="date_of_payment" value={formData.date_of_payment} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><DollarSign size={16} className="inline mr-2" />Amount Paid</label><input type="number" step="0.01" name="amount_paid" value={formData.amount_paid} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//       <div><label><DollarSign size={16} className="inline mr-2" />Balance Amount</label><input type="number" step="0.01" name="balance_amount" value={formData.balance_amount} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>

//       {creditorType === 'gst' && (
//         <>
//           <div><label><Calendar size={16} className="inline mr-2" />PO Date</label><input type="date" name="po_date" value={formData.po_date} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//           <div><label><FileText size={16} className="inline mr-2" />PO Sent Through</label><input type="text" name="po_sent_through" value={formData.po_sent_through} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//           <div><label><FileText size={16} className="inline mr-2" />Invoice Number</label><input type="text" name="inv_number" value={formData.inv_number} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//           <div><label><Calendar size={16} className="inline mr-2" />Bill Date</label><input type="date" name="bill_date" value={formData.bill_date} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//           <div className="lg:col-span-2"><label><Clock size={16} className="inline mr-2" />Due Date</label><input type="date" name="due_date" value={formData.due_date} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
//           <div className="lg:col-span-4"><label><MessageSquare size={16} className="inline mr-2" />Remarks</label><textarea name="remarks" value={formData.remarks} onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))} rows={4} className={`${inputStyle.base} ${inputStyle.normal} resize-none`} /></div>
//         </>
//       )}

//       <div className="lg:col-span-4 flex gap-4 mt-8">
//         <button type="submit" disabled={loadingForm} className="flex-1 py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-3">
//           {loadingForm ? 'Saving...' : <>Create Creditor</>}
//         </button>
//         <button type="button" onClick={onCancel} className="px-8 py-4 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition">
//           Cancel
//         </button>
//       </div>
//     </form>
//   );
// };

// export default CreateCreditors;






















// pages/finance/CreateCreditors.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import {
  Calendar, FileText, DollarSign, Hash, Package, Percent, Clock,
  MessageSquare, Building2, Banknote
} from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
};

const inputStyle = {
  base: 'w-full px-4 py-3 rounded-lg border bg-white text-sm transition-all duration-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1',
  normal: 'border-gray-300 focus:border-transparent',
  focusRing: 'focus:ring-teal-500',
};

const labelStyle = 'block text-sm font-semibold mb-2';

const CreateCreditors = ({ createdBy, onSuccess, onCancel }) => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const canManageBanks = ['md', 'managing_director', 'managingdirector']
    .includes(String(user.role || '').replace(/[\s-]/g, '').toLowerCase());
  const [clients, setClients] = useState([]);
  const [banks, setBanks] = useState([]);
  const [clientInputValue, setClientInputValue] = useState('');
  const [bankInputValue, setBankInputValue] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [creditorType, setCreditorType] = useState('gst');
  const [loadingForm, setLoadingForm] = useState(false);

  // New states for Invoice Number dropdown
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [invoiceInputValue, setInvoiceInputValue] = useState('');
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  const [formData, setFormData] = useState({
    client_id: '', finance_bank_id: '', po_date: '', po_sent_through: '', inv_number: '',
    bill_date: '', pdc_date: '', item_code: '', qty: '', rate: '', sale_amount: '',
    gst_amount: '', total_payment_due: '', amount_paid: '', balance_amount: '',
    date_of_payment: '', due_date: '', remarks: '', is_gst: 1
  });

  useEffect(() => {
    loadClients();
    loadBanks();
    loadExistingInvoices(); // Load existing invoice numbers
  }, []);

  const loadClients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/view-creditors-client`);
      setClients(res.data.data.map(c => ({ value: c.id, label: c.client_name })));
    } catch (err) { console.error(err); }
  };

  const loadBanks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/bank-masters`);
      if (res.data.status === 'success') {
        setBanks(res.data.data.map(b => ({
          value: b.id,
          label: `${b.bank_name} (₹${parseFloat(b.available_balance || 0).toLocaleString('en-IN')})`
        })));
      }
    } catch (err) { console.error(err); }
  };

  // Load existing invoice numbers from finance_creditors table
  const loadExistingInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/finance/existing-invoice-numbers`);
      if (res.data.status === 'success') {
        const options = res.data.data.map(inv => ({
          value: inv,
          label: inv
        }));
        setInvoiceOptions(options);
      }
    } catch (err) {
      console.error('Failed to load invoice numbers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) return alert('Client is required');
    if (creditorType === 'gst' && !formData.inv_number.trim()) {
      return alert('Invoice Number is required for GST Creditors');
    }
    setLoadingForm(true);
    try {
      await axios.post(`${API_BASE_URL}/finance/create-creditors`, {
        ...formData,
        created_by: createdBy || '1'
      });
      alert('Creditor created successfully!');
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving');
    } finally {
      setLoadingForm(false);
    }
  };

  const clientOptions = [...clients, ...(showAddClient ? [{ value: 'add', label: `Add "${clientInputValue}"` }] : [])];
  const bankOptions = [
    ...banks,
    ...(canManageBanks && showAddBank ? [{ value: 'add-bank', label: `Add Bank "${bankInputValue}"` }] : [])
  ];

  // Dynamic invoice options including "Add new" if applicable
  const invoiceSelectOptions = [
    ...invoiceOptions,
    ...(showAddInvoice ? [{ value: 'add-new-invoice', label: `Add new invoice: "${invoiceInputValue}"` }] : [])
  ];

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[75vh] overflow-y-auto px-2">
      <div className="lg:col-span-4">
        <label className={labelStyle}><Building2 size={16} className="inline mr-2" />Client Name *</label>
        <Select
          options={clientOptions}
          onInputChange={(v) => {
            setClientInputValue(v);
            setShowAddClient(!!v && !clients.some(c => c.label.toLowerCase().includes(v.toLowerCase())));
          }}
          onChange={async (opt) => {
            if (opt?.value === 'add') {
              const name = clientInputValue.trim();
              if (!name) return;
              try {
                const res = await axios.post(`${API_BASE_URL}/finance/create-creditors-client`, {
                  client_name: name,
                  created_by: createdBy || 1
                });
                const newClient = { value: res.data.data.id, label: name };
                setClients(prev => [...prev, newClient]);
                setFormData(prev => ({ ...prev, client_id: newClient.value }));
              } catch (err) { alert('Failed to add client'); }
            } else {
              setFormData(prev => ({ ...prev, client_id: opt?.value || '' }));
            }
          }}
          placeholder="Search or add client..."
          isSearchable
        />
      </div>

      <div className="lg:col-span-4">
        <label className={labelStyle}><Banknote size={16} className="inline mr-2" />Bank Account</label>
        <Select
          options={bankOptions}
          onInputChange={(v) => {
            setBankInputValue(v);
            setShowAddBank(canManageBanks && !!v && !banks.some(b => b.label.toLowerCase().includes(v.toLowerCase())));
          }}
          onChange={async (opt) => {
            if (opt?.value === 'add-bank') {
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
              } catch (err) { alert('Failed to add bank'); }
            } else {
              setFormData(prev => ({ ...prev, finance_bank_id: opt?.value || '' }));
            }
          }}
          isClearable
          placeholder="Select bank..."
        />
      </div>

      <div className="lg:col-span-4">
        <div className="flex gap-8">
          {[{ value: 'gst', label: 'GST Creditors', icon: Percent }, { value: 'other', label: 'Other Creditors', icon: FileText }].map(item => (
            <label key={item.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value={item.value}
                checked={creditorType === item.value}
                onChange={(e) => {
                  setCreditorType(e.target.value);
                  setFormData(prev => ({ ...prev, is_gst: e.target.value === 'gst' ? 1 : 0 }));
                }}
                className="w-5 h-5 text-teal-600"
                style={{ accentColor: themeColors.primary }}
              />
              <span className="ml-3 flex items-center gap-2 font-medium"><item.icon size={18} />{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div><label><Calendar size={16} className="inline mr-2" />PDC Date</label><input type="date" name="pdc_date" value={formData.pdc_date} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><Package size={16} className="inline mr-2" />Item Code</label><input type="text" name="item_code" value={formData.item_code} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><Hash size={16} className="inline mr-2" />Quantity</label><input type="number" name="qty" value={formData.qty} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><DollarSign size={16} className="inline mr-2" />Rate</label><input type="number" step="0.01" name="rate" value={formData.rate} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><DollarSign size={16} className="inline mr-2" />Sale Amount</label><input type="number" step="0.01" name="sale_amount" value={formData.sale_amount} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><Percent size={16} className="inline mr-2" />GST Amount</label><input type="number" step="0.01" name="gst_amount" value={formData.gst_amount} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><DollarSign size={16} className="inline mr-2" />Total Payment Due</label><input type="number" step="0.01" name="total_payment_due" value={formData.total_payment_due} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><Calendar size={16} className="inline mr-2" />Date of Payment</label><input type="date" name="date_of_payment" value={formData.date_of_payment} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><DollarSign size={16} className="inline mr-2" />Amount Paid</label><input type="number" step="0.01" name="amount_paid" value={formData.amount_paid} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>
      <div><label><DollarSign size={16} className="inline mr-2" />Balance Amount</label><input type="number" step="0.01" name="balance_amount" value={formData.balance_amount} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} /></div>

      {creditorType === 'gst' && (
        <>
          <div>
            <label><Calendar size={16} className="inline mr-2" />PO Date</label>
            <input type="date" name="po_date" value={formData.po_date} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} />
          </div>

          <div>
            <label><FileText size={16} className="inline mr-2" />PO Sent Through</label>
            <input type="text" name="po_sent_through" value={formData.po_sent_through} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} />
          </div>

          {/* === SEARCHABLE INVOICE NUMBER DROPDOWN === */}
          <div>
            <label className={labelStyle}>
              <FileText size={16} className="inline mr-2" />Invoice Number *
            </label>
            <Select
              options={invoiceSelectOptions}
              inputValue={invoiceInputValue}
              onInputChange={(value) => {
                setInvoiceInputValue(value);
                const exists = invoiceOptions.some(
                  opt => opt.label.toLowerCase() === value.toLowerCase().trim()
                );
                setShowAddInvoice(!!value.trim() && !exists);
              }}
              onChange={(selected) => {
                if (selected?.value === 'add-new-invoice') {
                  const newInv = invoiceInputValue.trim();
                  if (!newInv) return;
                  const newOption = { value: newInv, label: newInv };
                  setInvoiceOptions(prev => [...prev, newOption]);
                  setFormData(prev => ({ ...prev, inv_number: newInv }));
                  setInvoiceInputValue('');
                  setShowAddInvoice(false);
                } else {
                  setFormData(prev => ({ ...prev, inv_number: selected?.value || '' }));
                }
              }}
              value={invoiceOptions.find(opt => opt.value === formData.inv_number) || null}
              placeholder="Search or type new invoice number..."
              isSearchable
              isClearable
              noOptionsMessage={({ inputValue }) =>
                inputValue
                  ? `Type and select to add "${inputValue}" as new invoice`
                  : 'Start typing to search or add invoice...'
              }
              filterOption={() => true} // We control visibility via showAddInvoice
            />
          </div>

          <div>
            <label><Calendar size={16} className="inline mr-2" />Bill Date</label>
            <input type="date" name="bill_date" value={formData.bill_date} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} />
          </div>

          <div className="lg:col-span-2">
            <label><Clock size={16} className="inline mr-2" />Due Date</label>
            <input type="date" name="due_date" value={formData.due_date} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} className={`${inputStyle.base} ${inputStyle.normal}`} />
          </div>

          <div className="lg:col-span-4">
            <label><MessageSquare size={16} className="inline mr-2" />Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={4}
              className={`${inputStyle.base} ${inputStyle.normal} resize-none`}
            />
          </div>
        </>
      )}

      <div className="lg:col-span-4 flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loadingForm}
          className="flex-1 py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-3"
        >
          {loadingForm ? 'Saving...' : 'Create Creditor'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-4 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateCreditors;
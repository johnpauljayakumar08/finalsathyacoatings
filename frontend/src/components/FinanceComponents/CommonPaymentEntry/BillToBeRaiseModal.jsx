import { API_BASE_URL } from "../../../config/api.js";
import React, { useState } from 'react';
import axios from 'axios';

const BillToBeRaiseModal = ({ isOpen, onClose, createdBy }) => {
  const [formData, setFormData] = useState({
    po_details: '',
    inv_no: '',
    work_completion_date: '',
    bill_date: '',
    due_date: '',
    party_name: '',
    remarks: '',
    sale_amount: '',
    gst: '',
    total_pyt_due: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/finance/create-bill-to-be-raise`, {
        ...formData,
        created_by: createdBy || '1'
      });
      alert('Bill To Be Raise record saved successfully!');
      onClose();
      // Optional: refresh parent view if needed
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Bill To Be Raise</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">PO Details</label>
              <input type="text" name="po_details" value={formData.po_details} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Inv.No.</label>
              <input type="text" name="inv_no" value={formData.inv_no} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Work Completion Date</label>
              <input type="date" name="work_completion_date" value={formData.work_completion_date} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bill Date</label>
              <input type="date" name="bill_date" value={formData.bill_date} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Party Name</label>
              <input type="text" name="party_name" value={formData.party_name} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sale Amount</label>
              <input type="number" step="0.01" name="sale_amount" value={formData.sale_amount} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">GST</label>
              <input type="number" step="0.01" name="gst" value={formData.gst} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Total Payment Due</label>
              <input type="number" step="0.01" name="total_pyt_due" value={formData.total_pyt_due} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows="3" className="w-full px-4 py-3 border rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Save Bill</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillToBeRaiseModal;
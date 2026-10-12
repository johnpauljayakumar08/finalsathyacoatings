// pages/finance/ViewCreditors.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText, DollarSign, Edit2, Trash2, ChevronDown, ChevronUp, Calendar, Package, Hash, Percent, Clock, MessageSquare
} from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const ViewCreditors = ({ creditors, loading, onDelete, onRefresh }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : 'N/A');

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b flex items-center gap-4" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.lightBorder }}>
        <DollarSign className="w-8 h-8 text-teal-600" />
        <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>All Creditors</h2>
        <span className="ml-auto text-sm font-medium" style={{ color: themeColors.textSecondary }}>
          Total: {creditors.length} entries
        </span>
      </div>

      {loading ? (
        <div className="p-20 text-center">Loading creditors...</div>
      ) : creditors.length === 0 ? (
        <div className="p-20 text-center text-gray-500">
          <FileText size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl">No creditor entries found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Total Due</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Paid</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {creditors.map(c => (
                <React.Fragment key={c.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer transition" onClick={() => toggleExpand(c.id)}>
                    <td className="px-6 py-4 text-sm font-medium text-teal-600">{c.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{c.client_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.is_gst === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {c.is_gst === 1 ? 'GST' : 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{c.inv_number || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">₹{parseFloat(c.total_payment_due || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-right">₹{parseFloat(c.amount_paid || 0).toLocaleString('en-IN')}</td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${parseFloat(c.balance_amount || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{parseFloat(c.balance_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(c.due_date)}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                        {expandedId === c.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                  </tr>

                  {expandedId === c.id && (
                    <tr>
                      <td colSpan={9} className="p-6 bg-gray-50 border-t">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold text-lg flex items-center gap-2"><FileText size={18} /> Detailed Information</h4>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm font-medium">
                              <Edit2 size={16} /> Edit
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium">
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                          {[
                            { label: 'PO Date', value: formatDate(c.po_date) },
                            { label: 'Bill Date', value: formatDate(c.bill_date) },
                            { label: 'PDC Date', value: formatDate(c.pdc_date) },
                            { label: 'Item Code', value: c.item_code || 'N/A' },
                            { label: 'Quantity', value: c.qty || 'N/A' },
                            { label: 'Rate', value: `₹${c.rate || 0}` },
                            { label: 'Sale Amount', value: `₹${parseFloat(c.sale_amount || 0).toLocaleString('en-IN')}` },
                            { label: 'GST Amount', value: `₹${parseFloat(c.gst_amount || 0).toLocaleString('en-IN')}` },
                            { label: 'Date of Payment', value: formatDate(c.date_of_payment) },
                            { label: 'Due Date', value: formatDate(c.due_date) },
                            { label: 'Remarks', value: c.remarks || 'None' },
                            { label: 'Created At', value: new Date(c.created_at).toLocaleString('en-IN') },
                          ].map((item, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg border shadow-sm">
                              <div className="text-xs font-medium text-gray-500">{item.label}</div>
                              <div className="font-medium mt-1">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewCreditors;
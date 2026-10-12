import { API_BASE_URL } from "../../config/api.js";
// ConsumableDispatch.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { ChevronDown, ChevronUp, Plus, X, Truck, Package, FileText } from 'lucide-react';
import DispatchReportConsumable from './ConsumableDispatchReport';

const ConsumableDispatch = ({ masterConsumables }) => {
  const [rawDispatches, setRawDispatches] = useState([]);
  const [groupedDispatches, setGroupedDispatches] = useState([]);
  const [expandedBatchKey, setExpandedBatchKey] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [commonForm, setCommonForm] = useState({
    dispatchDate: new Date().toISOString().split('T')[0],
    currentSite: '',
    currentInchargeName: '',
    currentInchargeMobile: '',
    currentFromAddress: '',
    destinationSite: '',
    destinationInchargeName: '',
    destinationInchargeMobile: '',
    toAddress: '',
    vehicleName: '',
    vehicleNumber: '',
    driverName: '',
    driverMobile: '',
    transportAmount: '',
  });

  const [items, setItems] = useState([{ id: 1, consumable: null, quantity: '' }]);

  // Helpers ────────────────────────────────────────────────
  const addItemRow = () => {
    const newId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, consumable: null, quantity: '' }]);
  };

  const removeItemRow = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const updateCommon = (field, value) => {
    setCommonForm(prev => ({ ...prev, [field]: value }));
  };

  // Grouping logic (by date + from + to site)
  const groupDispatches = (dispatches) => {
    const groups = {};

    dispatches.forEach(d => {
      const key = `${d.dispatch_date}|${d.current_site}|${d.destination_site}`;
      
      if (!groups[key]) {
        groups[key] = {
          batchKey: key,
          dispatchDate: d.dispatch_date,
          currentSite: d.current_site,
          fromAddress: d.from_address,
          destinationSite: d.destination_site,
          toAddress: d.to_address,
          itemCount: 0,
          items: [],
          currentInchargeName: d.current_incharge_name,
          currentInchargeMobile: d.current_incharge_mobile,
          destinationInchargeName: d.destination_incharge_name,
          destinationInchargeMobile: d.destination_incharge_mobile,
          vehicleName: d.vehicle_name_model,
          vehicleNumber: d.vehicle_number,
          driverName: d.driver_name,
          driverMobile: d.driver_mobile,
          transportAmount: d.transport_amount,
        };
      }

      groups[key].items.push({
        consumableName: d.consumable_name,
        quantity: d.quantity,
      });
      groups[key].itemCount += 1;
    });

    return Object.values(groups).sort((a, b) => new Date(b.dispatchDate) - new Date(a.dispatchDate));
  };

  // Data fetch ────────────────────────────────────────────────
  const fetchDispatches = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/resource/dispatches`);
      if (res.data?.status === 'success') {
        const data = res.data.data || [];
        setRawDispatches(data);
        setGroupedDispatches(groupDispatches(data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  // Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!commonForm.dispatchDate || !commonForm.currentSite.trim() || !commonForm.destinationSite.trim()) {
      Swal.fire({ icon: 'warning', title: 'Missing fields', text: 'Date, current & destination site required' });
      return;
    }

    const invalid = items.find(item => !item.consumable || !item.quantity.trim());
    if (invalid || items.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Invalid items', text: 'All items need consumable and quantity' });
      return;
    }

    setSubmitting(true);

    try {
      for (const item of items) {
        const payload = {
          resource_consumable_id: item.consumable.value,
          quantity: item.quantity.trim(),
          dispatch_date: commonForm.dispatchDate,
          current_site: commonForm.currentSite.trim(),
          destination_site: commonForm.destinationSite.trim(),
          transport_amount: commonForm.transportAmount ? Number(commonForm.transportAmount) : 0,
          current_incharge_name: commonForm.currentInchargeName.trim() || null,
          current_incharge_mobile: commonForm.currentInchargeMobile.trim() || null,
          from_address: commonForm.currentFromAddress.trim() || null,
          destination_incharge_name: commonForm.destinationInchargeName.trim() || null,
          destination_incharge_mobile: commonForm.destinationInchargeMobile.trim() || null,
          to_address: commonForm.toAddress.trim() || null,
          vehicle_name_model: commonForm.vehicleName.trim() || null,
          vehicle_number: commonForm.vehicleNumber.trim() || null,
          driver_name: commonForm.driverName.trim() || null,
          driver_mobile: commonForm.driverMobile.trim() || null,
        };

        const res = await axios.post(`${API_BASE_URL}/resource/dispatches`, payload);
        if (res.data.status !== 'success') throw new Error('Failed');
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Dispatched ${items.length} item${items.length > 1 ? 's' : ''}`,
        timer: 2000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });

      setCommonForm({
        dispatchDate: new Date().toISOString().split('T')[0],
        currentSite: '', currentInchargeName: '', currentInchargeMobile: '', currentFromAddress: '',
        destinationSite: '', destinationInchargeName: '', destinationInchargeMobile: '', toAddress: '',
        vehicleName: '', vehicleNumber: '', driverName: '', driverMobile: '', transportAmount: '',
      });
      setItems([{ id: 1, consumable: null, quantity: '' }]);
      setIsModalOpen(false);

      await fetchDispatches();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to save dispatch',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (batchKey) => {
    setExpandedBatchKey(prev => prev === batchKey ? null : batchKey);
  };

  const handleViewChallan = (batch) => {
    setSelectedBatch(batch);
    setIsReportModalOpen(true);
  };

  // ──────────────────────────────────────────────── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consumable Dispatch Records</h1>
            <p className="mt-1 text-gray-600">
              Total records: <strong>{rawDispatches.length}</strong> • Batches: <strong>{groupedDispatches.length}</strong>
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors"
          >
            <Truck size={18} />
            New Dispatch
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {groupedDispatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500 border border-gray-200">
            No dispatch records yet
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">From</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    <th className="px-4"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedDispatches.map(batch => (
                    <React.Fragment key={batch.batchKey}>
                      {/* Main row with border and spacing */}
                      <tr
                        className="hover:bg-indigo-50/40 cursor-pointer transition-colors border-b border-gray-200"
                        onClick={() => toggleExpand(batch.batchKey)}
                      >
                        <td className="px-6 py-5">
                          <div className="font-medium text-gray-900">{batch.currentSite}</div>
                          {batch.fromAddress && <div className="text-sm text-gray-500 mt-1">{batch.fromAddress}</div>}
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-medium text-gray-900">{batch.destinationSite}</div>
                          {batch.toAddress && <div className="text-sm text-gray-500 mt-1">{batch.toAddress}</div>}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Package size={16} />
                            <span className="font-medium">{batch.itemCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-gray-600">
                          {format(new Date(batch.dispatchDate), 'dd MMM yyyy')}
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewChallan(batch);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            <FileText size={16} />
                            Challan
                          </button>
                        </td>
                        <td className="px-4 py-5 text-right">
                          {expandedBatchKey === batch.batchKey ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </td>
                      </tr>

                      {/* Expanded row with border and spacing */}
                      {expandedBatchKey === batch.batchKey && (
                        <tr>
                          <td colSpan={6} className="p-0 bg-gray-50">
                            <div className="border-t-2 border-indigo-200">
                              <div className="px-6 py-6 space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 border-b border-gray-300">
                                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">From Site</div>
                                    <div className="font-medium text-gray-900 text-lg">{batch.currentSite}</div>
                                    {batch.fromAddress && <div className="text-sm text-gray-600 mt-2">{batch.fromAddress}</div>}
                                  </div>
                                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">To Site</div>
                                    <div className="font-medium text-gray-900 text-lg">{batch.destinationSite}</div>
                                    {batch.toAddress && <div className="text-sm text-gray-600 mt-2">{batch.toAddress}</div>}
                                  </div>
                                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Date</div>
                                    <div className="text-gray-900 text-lg">{format(new Date(batch.dispatchDate), 'dd MMM yyyy')}</div>
                                  </div>
                                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Items Dispatched</div>
                                    <div className="font-medium text-indigo-700 text-lg">{batch.itemCount}</div>
                                  </div>
                                </div>

                                {/* Items list with better spacing */}
                                <div>
                                  <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Package size={18} />
                                    Dispatched Items
                                  </h4>
                                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 text-sm shadow-sm">
                                    {batch.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="font-medium text-gray-900">{item.consumableName}</div>
                                        <div className="text-indigo-700 font-semibold text-base">{item.quantity}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Additional info with cards */}
                                <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gray-300">
                                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Current Incharge</div>
                                    <div className="text-gray-900 font-medium">{batch.currentInchargeName || '—'}</div>
                                    {batch.currentInchargeMobile && (
                                      <div className="text-gray-600 mt-1 text-sm">{batch.currentInchargeMobile}</div>
                                    )}
                                  </div>
                                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Destination Incharge</div>
                                    <div className="text-gray-900 font-medium">{batch.destinationInchargeName || '—'}</div>
                                    {batch.destinationInchargeMobile && (
                                      <div className="text-gray-600 mt-1 text-sm">{batch.destinationInchargeMobile}</div>
                                    )}
                                  </div>
                                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Transport Details</div>
                                    <div className="text-gray-900 font-medium">
                                      {batch.vehicleName || '—'} {batch.vehicleNumber && `(${batch.vehicleNumber})`}
                                    </div>
                                    <div className="text-gray-600 mt-1 text-sm">
                                      Driver: {batch.driverName || '—'} 
                                      {batch.driverMobile && ` • ${batch.driverMobile}`}
                                    </div>
                                    {batch.transportAmount > 0 && (
                                      <div className="mt-3 font-semibold text-indigo-700 text-base">
                                        ₹{Number(batch.transportAmount).toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* New Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-8 py-5 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">New Dispatch Batch</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Items Section */}
              <div className="border border-gray-200 rounded-xl overflow-visible shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Items to Dispatch ({items.length})</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-1.5 px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors"
                    disabled={submitting}
                  >
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-visible">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 group">
                      <div className="flex-1 min-w-0">
                        <Select
                          options={masterConsumables.map(c => ({
                            value: c.id,
                            label: `${c.name} (${c.consumableStatus})`,
                          }))}
                          value={item.consumable}
                          onChange={val => updateItem(item.id, 'consumable', val)}
                          placeholder="Search and select consumable..."
                          isSearchable
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          isDisabled={submitting}
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: '0.5rem',
                              minHeight: '44px',
                              borderColor: '#d1d5db',
                              boxShadow: 'none',
                              '&:hover': { borderColor: '#6366f1' },
                            }),
                            placeholder: (base) => ({ ...base, color: '#9ca3af' }),
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            menu: (base) => ({
                              ...base,
                              marginTop: 2,
                              borderRadius: '0.5rem',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                            }),
                          }}
                        />
                      </div>

                      <div className="w-28 shrink-0">
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', e.target.value)}
                          placeholder="Qty *"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-center"
                          required
                          disabled={submitting}
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(item.id)}
                          className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition pt-2.5 px-1"
                          disabled={submitting}
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Fields */}
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Dispatch Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={commonForm.dispatchDate}
                      onChange={e => updateCommon('dispatchDate', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* From (Current Location) */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">From (Current Location)</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <input 
                      placeholder="Site name *" 
                      value={commonForm.currentSite} 
                      onChange={e => updateCommon('currentSite', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      required 
                      disabled={submitting} 
                    />
                    <input 
                      placeholder="Incharge name" 
                      value={commonForm.currentInchargeName} 
                      onChange={e => updateCommon('currentInchargeName', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                    <input 
                      placeholder="Incharge mobile" 
                      value={commonForm.currentInchargeMobile} 
                      onChange={e => updateCommon('currentInchargeMobile', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                    <div className="md:col-span-2 lg:col-span-3">
                      <textarea 
                        placeholder="Full address (optional)" 
                        value={commonForm.currentFromAddress} 
                        onChange={e => updateCommon('currentFromAddress', e.target.value)} 
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                        disabled={submitting} 
                      />
                    </div>
                  </div>
                </div>

                {/* To (Destination) */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">To (Destination)</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <input 
                      placeholder="Site name *" 
                      value={commonForm.destinationSite} 
                      onChange={e => updateCommon('destinationSite', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      required 
                      disabled={submitting} 
                    />
                    <input 
                      placeholder="Incharge name" 
                      value={commonForm.destinationInchargeName} 
                      onChange={e => updateCommon('destinationInchargeName', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                    <input 
                      placeholder="Incharge mobile" 
                      value={commonForm.destinationInchargeMobile} 
                      onChange={e => updateCommon('destinationInchargeMobile', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                    <div className="md:col-span-2 lg:col-span-3">
                      <textarea 
                        placeholder="Full address (optional)" 
                        value={commonForm.toAddress} 
                        onChange={e => updateCommon('toAddress', e.target.value)} 
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                        disabled={submitting} 
                      />
                    </div>
                  </div>
                </div>

                {/* Transport Details */}
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Transport Details</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <input 
                      placeholder="Vehicle name/model" 
                      value={commonForm.vehicleName} 
                      onChange={e => updateCommon('vehicleName', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                    <input 
                      placeholder="Vehicle number" 
                      value={commonForm.vehicleNumber} 
                      onChange={e => updateCommon('vehicleNumber', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                    <input 
                      placeholder="Driver name" 
                      value={commonForm.driverName} 
                      onChange={e => updateCommon('driverName', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                    <input 
                      placeholder="Driver mobile" 
                      value={commonForm.driverMobile} 
                      onChange={e => updateCommon('driverMobile', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                    <input 
                      type="number"
                      placeholder="Transport amount (₹)" 
                      value={commonForm.transportAmount} 
                      onChange={e => updateCommon('transportAmount', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
                      disabled={submitting} 
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    submitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {submitting ? 'Saving...' : (
                    <>
                      <Truck size={18} />
                      Dispatch {items.length} Item{items.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Challan Report Modal */}
      {isReportModalOpen && selectedBatch && (
        <DispatchReportConsumable
          batch={selectedBatch}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedBatch(null);
          }}
        />
      )}
    </div>
  );
};

export default ConsumableDispatch;
import { API_BASE_URL } from "../config/api.js";
import React, { useState, useEffect } from 'react';
import { X, Package, Hammer, DollarSign, CheckCircle, Clock, Calendar } from 'lucide-react';
import axios from 'axios';

const AdminNotifications = ({ onClose, onCountUpdate }) => {
  const [mode, setMode] = useState('pending'); // 'pending' or 'edited'
  const [activeTab, setActiveTab] = useState('acknowledgements');
  const [pendingAcks, setPendingAcks] = useState({});
  const [editedAcks, setEditedAcks] = useState({});
  const [editedUsages, setEditedUsages] = useState({});
  const [pendingUsages, setPendingUsages] = useState({});
  const [pendingExpenses, setPendingExpenses] = useState({});
  const [editedExpenses, setEditedExpenses] = useState({});
  const [pendingCompletions, setPendingCompletions] = useState({});
  const [editedCompletions, setEditedCompletions] = useState({});
  const [pendingAttendances, setPendingAttendances] = useState({});
  const [editedAttendances, setEditedAttendances] = useState({});
  const [counts, setCounts] = useState({ acks: 0, usages: 0, expenses: 0, completions: 0, attendance: 0, edited_acks: 0, edited_usages: 0, edited_expenses: 0, edited_completions: 0, edited_attendance: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Helper function to compute count from data
  const computeCountFromData = (data, tab, isEdited = false) => {
    if (!data || Object.keys(data).length === 0) return 0;
    let total = 0;
    Object.values(data).forEach(items => {
      items.forEach(item => {
        if (isEdited || tab === 'acknowledgements' || tab === 'usages') {
          total += 1; // Each item is one entry
        } else if (tab === 'expenses' || tab === 'completions' || tab === 'attendance') {
          total += item.missing_dates ? item.missing_dates.length : 0;
        }
      });
    });
    return total;
  };

  // Helper to update counts
  const updateCounts = (tab, newData, isEdited = false) => {
    const countKey = tab === 'attendance' ? (isEdited ? 'edited_attendance' : 'attendance') : (isEdited ? `edited_${tab}` : tab);
    const newCount = computeCountFromData(newData, tab, isEdited);
    const oldCount = counts[countKey];
    setCounts(prev => {
      const newTotal = prev.total - oldCount + newCount;
      return {
        ...prev,
        [countKey]: newCount,
        total: newTotal
      };
    });
  };

  // Get count for tab based on mode
  const getCountForTab = (tab) => {
    if (tab === 'attendance') {
      return counts[mode === 'edited' ? 'edited_attendance' : 'attendance'] || 0;
    }
    return mode === 'pending' ? counts[tab] : counts[`edited_${tab}`] || 0;
  };

  // Format date for better display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format missing dates array for display
  const formatMissingDates = (dates) => {
    if (!dates || dates.length === 0) return [];
    return dates.map(date => formatDate(date));
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [countsRes, acksRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/notification/counts`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/notification/pending-acknowledgements`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        if (countsRes.data.status === 'success') {
          setCounts(countsRes.data.data);
        }
        if (acksRes.data.status === 'success') {
          const data = acksRes.data.data;
          setPendingAcks(data);
          updateCounts('acknowledgements', data);
          console.log('Fetched acknowledgements:', data);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Auto-fetch for edited mode when switching
  useEffect(() => {
    if (mode === 'edited' && activeTab === 'acknowledgements' && Object.keys(editedAcks).length === 0) {
      fetchTabData('acknowledgements');
    }
  }, [mode, activeTab]);

  const fetchTabData = async (tab) => {
    setTabLoading(true);
    try {
      const token = localStorage.getItem('token');
      let res;
      const isEdited = mode === 'edited';
      if (tab === 'acknowledgements') {
        if (isEdited) {
          res = await axios.get(`${API_BASE_URL}/notification/edited-acknowledgements`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setEditedAcks(data);
            updateCounts('acknowledgements', data, true);
            console.log('Fetched edited acknowledgements:', data);
          }
        } else {
          res = await axios.get(`${API_BASE_URL}/notification/pending-acknowledgements`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setPendingAcks(data);
            updateCounts('acknowledgements', data);
            console.log('Fetched acknowledgements:', data);
          }
        }
      } else if (tab === 'usages') {
        if (isEdited) {
          res = await axios.get(`${API_BASE_URL}/notification/edited-usages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setEditedUsages(data);
            updateCounts('usages', data, true);
            console.log('Fetched edited usages:', data);
          }
        } else {
          res = await axios.get(`${API_BASE_URL}/notification/pending-usages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setPendingUsages(data);
            updateCounts('usages', data);
            console.log('Fetched usages:', data);
          }
        }
      } else if (tab === 'expenses') {
        if (isEdited) {
          res = await axios.get(`${API_BASE_URL}/notification/edited-expenses`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setEditedExpenses(data);
            updateCounts('expenses', data, true);
            console.log('Fetched edited expenses:', data);
          }
        } else {
          res = await axios.get(`${API_BASE_URL}/notification/pending-expense-entries`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setPendingExpenses(data);
            updateCounts('expenses', data);
            console.log('Fetched expenses:', data);
          }
        }
      } else if (tab === 'completions') {
        if (isEdited) {
          res = await axios.get(`${API_BASE_URL}/notification/edited-completion-entries`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setEditedCompletions(data);
            updateCounts('completions', data, true);
            console.log('Fetched edited completions:', data);
          }
        } else {
          res = await axios.get(`${API_BASE_URL}/notification/pending-completion-entries`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setPendingCompletions(data);
            updateCounts('completions', data);
            console.log('Fetched completions:', data);
          }
        }
      } else if (tab === 'attendance') {
        if (isEdited) {
          res = await axios.get(`${API_BASE_URL}/notification/edited-attendance-entries`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setEditedAttendances(data);
            updateCounts('attendance', data, true);
            console.log('Fetched edited attendance:', data);
          } else {
            console.error('Edited attendance fetch failed:', res.data);
          }
        } else {
          res = await axios.get(`${API_BASE_URL}/notification/pending-attendance-entries`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const data = res.data.data;
            setPendingAttendances(data);
            updateCounts('attendance', data);
            console.log('Fetched attendance:', data);
          } else {
            console.error('Attendance fetch failed:', res.data);
          }
        }
      }
      // Refetch count from backend to update bell icon
      if (onCountUpdate) {
        onCountUpdate();
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
    } finally {
      setTabLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (mode === 'edited' && !['acknowledgements', 'usages', 'expenses', 'completions', 'attendance'].includes(tab)) {
      return;
    }
    let data;
    if (mode === 'pending') {
      const dataMap = {
        acknowledgements: pendingAcks,
        usages: pendingUsages,
        expenses: pendingExpenses,
        completions: pendingCompletions,
        attendance: pendingAttendances
      };
      data = dataMap[tab];
    } else {
      const dataMap = {
        acknowledgements: editedAcks,
        usages: editedUsages,
        expenses: editedExpenses,
        completions: editedCompletions,
        attendance: editedAttendances
      };
      data = dataMap[tab];
    }
    if (Object.keys(data || {}).length === 0) {
      fetchTabData(tab);
    } else {
      console.log(`Data already loaded for ${tab}:`, data);
    }
  };

  const getDataForTab = (tab) => {
    if (mode === 'pending') {
      switch (tab) {
        case 'acknowledgements': return pendingAcks;
        case 'usages': return pendingUsages;
        case 'expenses': return pendingExpenses;
        case 'completions': return pendingCompletions;
        case 'attendance': return pendingAttendances;
        default: return {};
      }
    } else {
      switch (tab) {
        case 'acknowledgements': return editedAcks;
        case 'usages': return editedUsages;
        case 'expenses': return editedExpenses;
        case 'completions': return editedCompletions;
        case 'attendance': return editedAttendances;
        default: return {};
      }
    }
  };

  const hasData = Object.keys(getDataForTab(activeTab)).length > 0;

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'acknowledgements': return mode === 'edited' ? 'Edited Acknowledgements' : 'Pending Acknowledgements';
      case 'usages': return mode === 'edited' ? 'Edited Usages' : 'Pending Usages';
      case 'expenses': return mode === 'edited' ? 'Edited Expense Entries' : 'Pending Expense Entries';
      case 'completions': return mode === 'edited' ? 'Edited Completion Entries' : 'Pending Completion Entries';
      case 'attendance': return mode === 'edited' ? 'Edited Attendance Entries' : 'Pending Attendance Entries';
      default: return '';
    }
  };

  const getNoDataMessage = (tab) => {
    if (mode === 'edited') {
      switch (tab) {
        case 'acknowledgements': return 'edited acknowledgements';
        case 'usages': return 'edited usages';
        case 'expenses': return 'edited expense entries';
        case 'completions': return 'edited completion entries';
        case 'attendance': return 'edited attendance entries';
        default: return 'edited entries for this category';
      }
    }
    switch (tab) {
      case 'acknowledgements': return 'pending acknowledgements';
      case 'usages': return 'pending usages';
      case 'expenses': return 'pending expense entries';
      case 'completions': return 'pending completion entries';
      case 'attendance': return 'pending attendance entries';
      default: return '';
    }
  };

  // New component for date display
  const DateDisplay = ({ dates, type = "missing" }) => {
    if (!dates || dates.length === 0) {
      return <span className="text-gray-400 text-xs">No dates</span>;
    }

    const formattedDates = formatMissingDates(dates);

    return (
      <div className="mt-2">
        <div className="flex items-center gap-1 mb-1">
          <Calendar className="w-3 h-3 text-red-500" />
          <span className="text-xs font-semibold text-red-600">
            {type === "missing" ? "Missing Dates" : "Date"} ({dates.length})
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {formattedDates.map((date, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-red-50 border border-red-200 rounded-md text-xs font-medium text-red-700"
            >
              {date}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // New component for single date display
  const SingleDateDisplay = ({ date, label = "Date" }) => {
    if (!date) {
      return <span className="text-gray-400 text-xs">No date</span>;
    }

    return (
      <div className="mt-2">
        <div className="flex items-center gap-1 mb-1">
          <Calendar className="w-3 h-3 text-blue-500" />
          <span className="text-xs font-semibold text-blue-600">{label}</span>
        </div>
        <span className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-medium text-blue-700">
          {formatDate(date)}
        </span>
      </div>
    );
  };

  const renderItem = (item, tab, isEdited = false) => {
    const baseClasses = "bg-white p-4 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-all duration-200";
    
    // Different border colors based on tab
    const borderColors = {
      acknowledgements: "border-blue-500",
      usages: "border-green-500",
      expenses: "border-orange-500",
      completions: "border-purple-500",
      attendance: "border-red-500"
    };

    if (isEdited) {
      if (tab === 'acknowledgements') {
        // Render for edited acknowledgements
        return (
          <div key={item.id} 
               className={`${baseClasses} ${borderColors[tab]}`}>
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-sm mb-1">
                  <span className="text-blue-600">Edited Acknowledgement: {item.item_name} ({item.uom_name})</span>
                </h5>
                <p className="text-xs text-gray-500">
                  Site: <span className="font-medium">{item.site_id}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm mb-1">
                  <span className="text-blue-600">Qty: {item.overall_quantity}</span>
                </p>
              </div>
            </div>

            {/* Date Section */}
            <div className="mb-3 space-y-2">
              <SingleDateDisplay date={item.created_at} label="Created Date" />
              <SingleDateDisplay date={item.updated_at} label="Updated Date" />
            </div>

            {/* Users Section */}
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">Created by: <span className="font-semibold">{item.created_user || 'Unknown'}</span></p>
              <p className="text-xs font-medium text-gray-700">Updated by: <span className="font-semibold">{item.updated_user || 'Unknown'}</span></p>
            </div>

            {/* Remarks */}
            {item.remarks && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Remarks:</p>
                <p className="text-xs text-gray-500">{item.remarks}</p>
              </div>
            )}

            {/* History Section */}
            {item.histories && item.histories.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Update History ({item.histories.length})</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                  {item.histories.map((hist, index) => (
                    <div key={index} className="p-2 bg-white border border-gray-200 rounded-md">
                      <p className="text-xs font-medium text-blue-700">Update #{index + 1}</p>
                      <p className="text-xs text-gray-600">Created: {formatDate(hist.created_at)}</p>
                      <p className="text-xs text-gray-600">Updated: {formatDate(hist.updated_at)}</p>
                      <p className="text-xs text-gray-600">Created by: {hist.created_user || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Updated by: {hist.updated_user || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Quantity: {hist.overall_quantity || 'N/A'}</p>
                      {hist.remarks && <p className="text-xs text-gray-600">Remarks: {hist.remarks}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Section */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                ID: {item.id}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Original Dispatch: {formatDate(item.dispatch_date)}</p>
              </div>
            </div>
          </div>
        );
      } else if (tab === 'usages') {
        // Render for edited usages
        return (
          <div key={item.usage_id} 
               className={`${baseClasses} ${borderColors[tab]}`}>
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-sm mb-1">
                  <span className="text-green-600">Edited Usage: {item.item_name} ({item.uom_name})</span>
                </h5>
                <p className="text-xs text-gray-500">
                  Site: <span className="font-medium">{item.site_id}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm mb-1">
                  <span className="text-green-600">Qty: {item.overall_qty}</span>
                </p>
              </div>
            </div>

            {/* Date Section */}
            <div className="mb-3 space-y-2">
              <SingleDateDisplay date={item.entry_date} label="Usage Date" />
              <SingleDateDisplay date={item.created_at} label="Created Date" />
              <SingleDateDisplay date={item.updated_at} label="Updated Date" />
            </div>

            {/* Users Section */}
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">Created by: <span className="font-semibold">{item.created_user}</span></p>
              <p className="text-xs font-medium text-gray-700">Updated by: <span className="font-semibold">{item.updated_user}</span></p>
            </div>

            {/* Remarks */}
            {item.remarks && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Remarks:</p>
                <p className="text-xs text-gray-500">{item.remarks}</p>
              </div>
            )}

            {/* History Section */}
            {item.histories && item.histories.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Update History ({item.histories.length})</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                  {item.histories.map((hist, index) => (
                    <div key={index} className="p-2 bg-white border border-gray-200 rounded-md">
                      <p className="text-xs font-medium text-green-700">Update #{index + 1}</p>
                      <p className="text-xs text-gray-600">Created: {formatDate(hist.created_at)}</p>
                      <p className="text-xs text-gray-600">Updated: {formatDate(hist.updated_at)}</p>
                      <p className="text-xs text-gray-600">Created by: {hist.created_user}</p>
                      <p className="text-xs text-gray-600">Updated by: {hist.updated_user}</p>
                      <p className="text-xs text-gray-600">Quantity: {hist.overall_qty || 'N/A'}</p>
                      {hist.remarks && <p className="text-xs text-gray-600">Remarks: {hist.remarks}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Section */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                Usage ID: {item.usage_id}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Ack ID: {item.ack_id}</p>
              </div>
            </div>
          </div>
        );
      } else if (tab === 'expenses') {
        // Render for edited expenses
        return (
          <div key={item.history_id} 
               className={`${baseClasses} ${borderColors[tab]}`}>
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-sm mb-1">
                  <span className="text-orange-600">Edited Expense: {item.expense_name}</span>
                </h5>
                <p className="text-xs text-gray-500">
                  Site: <span className="font-medium">{item.site_id}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm mb-1">
                  <span className="text-orange-600">Value: {item.actual_value}</span>
                </p>
              </div>
            </div>

            {/* Date Section */}
            <div className="mb-3 space-y-2">
              <SingleDateDisplay date={item.entry_date} label="Entry Date" />
              <SingleDateDisplay date={item.created_at} label="Created Date" />
              <SingleDateDisplay date={item.updated_at} label="Updated Date" />
            </div>

            {/* Users Section */}
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">Created by: <span className="font-semibold">{item.created_user || 'Unknown'}</span></p>
              <p className="text-xs font-medium text-gray-700">Updated by: <span className="font-semibold">{item.updated_user || 'Unknown'}</span></p>
            </div>

            {/* Remarks */}
            {item.remarks && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Remarks:</p>
                <p className="text-xs text-gray-500">{item.remarks}</p>
              </div>
            )}

            {/* History Section */}
            {item.histories && item.histories.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Update History ({item.histories.length})</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                  {item.histories.map((hist, index) => (
                    <div key={index} className="p-2 bg-white border border-gray-200 rounded-md">
                      <p className="text-xs font-medium text-orange-700">Update #{index + 1}</p>
                      <p className="text-xs text-gray-600">Created: {formatDate(hist.created_at)}</p>
                      <p className="text-xs text-gray-600">Updated: {formatDate(hist.updated_at)}</p>
                      <p className="text-xs text-gray-600">Created by: {hist.created_user || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Updated by: {hist.updated_user || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Value: {hist.actual_value || 'N/A'}</p>
                      {hist.remarks && <p className="text-xs text-gray-600">Remarks: {hist.remarks}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Section */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                History ID: {item.history_id}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">
                  Assigned: <span className="text-gray-900">{item.full_name || 'Unassigned'}</span>
                </p>
                <p className="text-xs text-gray-500">Budget ID: {item.actual_budget_id}</p>
              </div>
            </div>
          </div>
        );
      } else if (tab === 'completions') {
        // Render for edited completions
        return (
          <div key={item.completion_id} 
               className={`${baseClasses} ${borderColors[tab]}`}>
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-sm mb-1">
                  <span className="text-purple-600">Edited Completion: {item.category_name} - {item.subcategory_name}</span>
                </h5>
                <p className="text-xs text-gray-500">
                  Site: <span className="font-medium">{item.site_id}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm mb-1">
                  <span className="text-purple-600">Value: {item.value}</span>
                </p>
                <p className="text-xs text-gray-600">
                  Area: <span className="font-medium">{item.area_completed}</span>
                </p>
              </div>
            </div>

            {/* Date Section */}
            <div className="mb-3 space-y-2">
              <SingleDateDisplay date={item.created_at} label="Created Date" />
              <SingleDateDisplay date={item.updated_at} label="Updated Date" />
            </div>

            {/* Users Section */}
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">Created by: <span className="font-semibold">{item.created_user || 'Unknown'}</span></p>
              <p className="text-xs font-medium text-gray-700">Updated by: <span className="font-semibold">{item.updated_user || 'Unknown'}</span></p>
            </div>

            {/* Remarks */}
            {item.remarks && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Remarks:</p>
                <p className="text-xs text-gray-500">{item.remarks}</p>
              </div>
            )}

            {/* History Section */}
            {item.histories && item.histories.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Update History ({item.histories.length})</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                  {item.histories.map((hist, index) => (
                    <div key={index} className="p-2 bg-white border border-gray-200 rounded-md">
                      <p className="text-xs font-medium text-purple-700">Update #{index + 1}</p>
                      <p className="text-xs text-gray-600">Created: {formatDate(hist.created_at)}</p>
                      <p className="text-xs text-gray-600">Updated: {formatDate(hist.updated_at)}</p>
                      <p className="text-xs text-gray-600">Created by: {hist.created_user || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Updated by: {hist.updated_user || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Area: {hist.area_completed || 'N/A'}</p>
                      <p className="text-xs text-gray-600">Rate: {hist.rate || 'N/A'}</p>
                      <p className="text-xs text-gray-600">Value: {hist.value || 'N/A'}</p>
                      {hist.remarks && <p className="text-xs text-gray-600">Remarks: {hist.remarks}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Section */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                Completion ID: {item.completion_id}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">
                  Assigned: <span className="text-gray-900">{item.full_name || 'Unassigned'}</span>
                </p>
                <p className="text-xs text-gray-500">Rec ID: {item.rec_id}</p>
              </div>
            </div>
          </div>
        );
      } else if (tab === 'attendance') {
        // Render for edited attendance
        return (
          <div key={item.id} 
               className={`${baseClasses} ${borderColors[tab]}`}>
            
            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h5 className="font-bold text-gray-800 text-sm mb-1">
                  <span className="text-red-600">Edited Attendance: {item.full_name || 'Unknown Labor'}</span>
                </h5>
                <p className="text-xs text-gray-500">
                  Site: <span className="font-medium">{item.site_id}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm mb-1">
                  <span className="text-red-600">Shift: {item.shift || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Date Section */}
            <div className="mb-3 space-y-2">
              <SingleDateDisplay date={item.entry_date} label="Entry Date" />
              <SingleDateDisplay date={item.created_at} label="Created Date" />
              <SingleDateDisplay date={item.updated_at} label="Updated Date" />
            </div>

            {/* Users Section */}
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">Created by: <span className="font-semibold">{item.created_user || 'Unknown'}</span></p>
              <p className="text-xs font-medium text-gray-700">Updated by: <span className="font-semibold">{item.updated_user || 'Unknown'}</span></p>
            </div>

            {/* Remarks */}
            {item.remarks && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-600 mb-1">Remarks:</p>
                <p className="text-xs text-gray-500">{item.remarks}</p>
              </div>
            )}

            {/* History Section */}
            {item.histories && item.histories.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Update History ({item.histories.length})</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                  {item.histories.map((hist, index) => (
                    <div key={index} className="p-2 bg-white border border-gray-200 rounded-md">
                      <p className="text-xs font-medium text-red-700">Update #{index + 1}</p>
                      <p className="text-xs text-gray-600">Created: {formatDate(hist.created_at)}</p>
                      <p className="text-xs text-gray-600">Updated: {formatDate(hist.updated_at)}</p>
                      <p className="text-xs text-gray-600">Created by: {hist.created_user || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Updated by: {hist.updated_user || 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Shift: {hist.shift || 'N/A'}</p>
                      {hist.remarks && <p className="text-xs text-gray-600">Remarks: {hist.remarks}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Section */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                Attendance ID: {item.id}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">
                  Assigned: <span className="text-gray-900">{item.assigned_full_name || 'Unassigned'}</span>
                </p>
                <p className="text-xs text-gray-500">Assignment ID: {item.labour_assignment_id}</p>
              </div>
            </div>
          </div>
        );
      }
    } else {
      // Original render for pending
      return (
        <div key={item.id || item.ack_id || item.actual_budget_id || item.completion_id || item.labour_assignment_id} 
             className={`${baseClasses} ${borderColors[tab]}`}>
          
          {/* Header Section */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h5 className="font-bold text-gray-800 text-sm mb-1">
                {(tab === 'acknowledgements' || tab === 'usages') ? 
                  `${item.item_name} (${item.uom_name})` : 
                  tab === 'expenses' ? 
                    <span className="text-orange-600">Expense: {item.expense_name}</span> :
                    tab === 'completions' ?
                      <span className="text-purple-600">Completion: {item.category_name} - {item.subcategory_name}</span> :
                      <span className="text-red-600">Labor: {item.full_name}</span>
                }
              </h5>
              <p className="text-xs text-gray-500">
                Site: <span className="font-medium">{item.site_id}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm mb-1">
                {tab === 'acknowledgements' ? 
                  <span className="text-blue-600">Qty: {item.dispatch_qty}</span> : 
                 tab === 'usages' ? 
                  <span className="text-green-600">Qty: {item.overall_quantity}</span> : 
                 tab === 'expenses' ? 
                  <span className="text-orange-600">Budget: {item.splitted_budget}</span> :
                 tab === 'completions' ? 
                  <span className="text-purple-600">Area: {item.area_completed}</span> :
                  <span className="text-red-600">Pending: {item.missing_dates?.length || 0}</span>
                }
              </p>
              {tab === 'completions' && (
                <p className="text-xs text-gray-600">
                  Rate: <span className="font-medium">{item.rate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Date Section - Highlighted */}
          <div className="mb-3">
            {(tab === 'expenses' || tab === 'completions' || tab === 'attendance') ? (
              <DateDisplay dates={item.missing_dates} type="missing" />
            ) : (
              <SingleDateDisplay 
                date={tab === 'acknowledgements' ? item.dispatch_date : (tab === 'usages' ? item.dispatch_date : null)} 
                label={tab === 'acknowledgements' ? "Dispatch Date" : "Usage Date"}
              />
            )}
          </div>

          {/* Footer Section */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-600">
              {tab === 'completions' && (
                <span className="font-medium">Value: {item.value}</span>
              )}
              {tab === 'attendance' && (
                <span className="font-medium">Salary: {item.salary}</span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-700">
                Assigned: <span className="text-gray-900">{item.full_name || 'Unassigned'}</span>
              </p>
              <p className="text-xs text-gray-500">
                ID: {item.emp_id || item.labour_id || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const currentData = getDataForTab(activeTab);
  const isEdited = mode === 'edited';
  console.log(`Current data for ${activeTab} (${mode}):`, currentData);

  return (
    <div className="h-full flex flex-col bg-white shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 transition-all duration-200"
          aria-label="Close Notifications"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="border-b bg-white">
        <nav className="flex">
          <button
            onClick={() => {
              setMode('pending');
              setActiveTab('acknowledgements');
              if (Object.keys(pendingAcks).length === 0) {
                fetchTabData('acknowledgements');
              }
            }}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              mode === 'pending'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Entries
          </button>
          <button
            onClick={() => {
              setMode('edited');
              setActiveTab('acknowledgements');
              if (Object.keys(editedAcks).length === 0) {
                fetchTabData('acknowledgements');
              }
            }}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              mode === 'edited'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Edited Entries
          </button>
        </nav>
      </div>

      {/* Menu Tabs */}
      <div className="border-b bg-white">
        <nav className="flex px-4">
          <button
            onClick={() => handleTabClick('acknowledgements')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              activeTab === 'acknowledgements'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Package className="w-4 h-4" />
              {getTabTitle('acknowledgements')} ({getCountForTab('acknowledgements')})
            </div>
          </button>
          <button
            onClick={() => handleTabClick('usages')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              activeTab === 'usages'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Hammer className="w-4 h-4" />
              {getTabTitle('usages')} ({getCountForTab('usages')})
            </div>
          </button>
          <button
            onClick={() => handleTabClick('expenses')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              activeTab === 'expenses'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-4 h-4" />
              {getTabTitle('expenses')} ({getCountForTab('expenses')})
            </div>
          </button>
          <button
            onClick={() => handleTabClick('completions')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              activeTab === 'completions'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {getTabTitle('completions')} ({getCountForTab('completions')})
            </div>
          </button>
          <button
            onClick={() => handleTabClick('attendance')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
              activeTab === 'attendance'
                ? 'bg-blue-50 border-b-2 border-blue-500 text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              {getTabTitle('attendance')} ({getCountForTab('attendance')})
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {tabLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          </div>
        ) : !hasData ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {activeTab === 'acknowledgements' && <Package className="w-8 h-8 text-gray-400" />}
              {activeTab === 'usages' && <Hammer className="w-8 h-8 text-gray-400" />}
              {activeTab === 'expenses' && <DollarSign className="w-8 h-8 text-gray-400" />}
              {activeTab === 'completions' && <CheckCircle className="w-8 h-8 text-gray-400" />}
              {activeTab === 'attendance' && <Clock className="w-8 h-8 text-gray-400" />}
            </div>
            <p className="text-gray-500 text-lg font-medium">No {getNoDataMessage(activeTab)}</p>
            <p className="text-gray-400 text-sm mt-1">Everything is up to date!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(currentData).map(([descId, items]) => (
              <div key={descId}>
                <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide bg-white p-2 rounded-lg shadow-sm">
                  📋 Description ID: {descId}
                </h4>
                <div className="space-y-3">
                  {items.map((item) => renderItem(item, activeTab, isEdited))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
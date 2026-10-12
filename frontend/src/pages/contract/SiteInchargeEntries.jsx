import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Edit } from "lucide-react";

const SiteInchargeEntries = () => {
  const { encodedUserId } = useParams();
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("acknowledgement");
  const [selectedIncharge, setSelectedIncharge] = useState("");
  const [allAckData, setAllAckData] = useState([]);
  const [allUsageData, setAllUsageData] = useState([]);
  const [allExpenseData, setAllExpenseData] = useState([]);
  const [allCompletionData, setAllCompletionData] = useState([]);
  const [allLabourAssignmentData, setAllLabourAssignmentData] = useState([]);
  const [allLabourAttendanceData, setAllLabourAttendanceData] = useState([]);
  
  // Simplified Filter states for each tab - only fromDate and toDate
  const [filters, setFilters] = useState({
    acknowledgement: { fromDate: "", toDate: "" },
    usage: { fromDate: "", toDate: "" },
    expense: { fromDate: "", toDate: "" },
    completion: { fromDate: "", toDate: "" },
    "labour-assignment": { fromDate: "", toDate: "" },
    "labour-attendance": { fromDate: "", toDate: "" }
  });

  // Edit modal state
  const [editModal, setEditModal] = useState({ open: false, type: "", data: null });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (encodedUserId) {
      try {
        const decodedId = atob(encodedUserId);
        setUserId(decodedId);
        console.log('Decoded User ID:', decodedId);
      } catch (err) {
        console.error("Error decoding userId:", err);
        setError("Invalid user ID in URL. Please try again.");
        toast.error("Invalid user ID in URL. Please try again.");
        setLoading(false);
      }
    } else {
      setError("User ID not found in URL. Please try again.");
      toast.error("User ID not found in URL. Please try again.");
      setLoading(false);
    }
  }, [encodedUserId]);

  useEffect(() => {
    if (userId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);

          const [
            ackResponse,
            usageResponse,
            expenseResponse,
            completionResponse,
            assignmentResponse,
            attendanceResponse
          ] = await Promise.all([
            axios.get(`${API_BASE_URL}/site-incharge/all-acknowledgements`),
            axios.get(`${API_BASE_URL}/site-incharge/all-material-usage`),
            axios.get(`${API_BASE_URL}/site-incharge/all-expense`),
            axios.get(`${API_BASE_URL}/site-incharge/all-completion`),
            axios.get(`${API_BASE_URL}/site-incharge/all-labour-assignment`),
            axios.get(`${API_BASE_URL}/site-incharge/all-labour-attendance`)
          ]);

          setAllAckData(ackResponse.data.data || []);
          setAllUsageData(usageResponse.data.data || []);
          setAllExpenseData(expenseResponse.data.data || []);
          setAllCompletionData(completionResponse.data.data || []);
          setAllLabourAssignmentData(assignmentResponse.data.data || []);
          setAllLabourAttendanceData(attendanceResponse.data.data || []);
        } catch (err) {
          console.error("Failed to fetch entries data:", err);
          setError("Failed to fetch entries data");
          toast.error("Failed to fetch entries data");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [userId]);

  const uniqueIncharges = useMemo(() => {
    const names = new Set();
    [
      ...allAckData.map(item => item.acknowledgement?.siteincharge_name).filter(Boolean),
      ...allUsageData.map(item => item.usage?.siteincharge_name).filter(Boolean),
      ...allExpenseData.map(item => item.expense?.siteincharge_name).filter(Boolean),
      ...allCompletionData.map(item => item.completion?.siteincharge_name).filter(Boolean),
      ...allLabourAssignmentData.map(item => item.assignment?.siteincharge_name).filter(Boolean),
      ...allLabourAttendanceData.map(item => item.attendance?.siteincharge_name).filter(Boolean)
    ].forEach(name => names.add(name));
    return Array.from(names).sort();
  }, [allAckData, allUsageData, allExpenseData, allCompletionData, allLabourAssignmentData, allLabourAttendanceData]);

  const filterByIncharge = (data, incharge, tab) => {
    if (!incharge) return data;
    return data.filter(item => {
      switch (tab) {
        case "acknowledgement":
          return item.acknowledgement?.siteincharge_name === incharge;
        case "usage":
          return item.usage?.siteincharge_name === incharge;
        case "expense":
          return item.expense?.siteincharge_name === incharge;
        case "completion":
          return item.completion?.siteincharge_name === incharge;
        case "labour-assignment":
          return item.assignment?.siteincharge_name === incharge;
        case "labour-attendance":
          return item.attendance?.siteincharge_name === incharge;
        default:
          return false;
      }
    });
  };

  const handleFilterChange = (tab, field, value) => {
    setFilters(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
  };

  const resetFilters = (tab) => {
    setFilters(prev => ({
      ...prev,
      [tab]: { fromDate: "", toDate: "" }
    }));
  };

  const getFilterDate = (item, tab) => {
    // Prioritize entry_date if present, else created_at
    switch (tab) {
      case "acknowledgement":
        return item.acknowledgement?.entry_date || item.acknowledgement?.created_at;
      case "usage":
        return item.usage?.entry_date || item.usage?.created_at;
      case "expense":
        return item.expense?.entry_date || item.expense?.created_at;
      case "completion":
        return item.completion?.entry_date || item.completion?.created_at;
      case "labour-assignment":
        return item.assignment?.entry_date || item.assignment?.created_at;
      case "labour-attendance":
        return item.attendance?.entry_date || item.attendance?.created_at;
      default:
        return null;
    }
  };

  const filterDataByDate = (data, tab) => {
    const filterConfig = filters[tab];
    if (!filterConfig.fromDate && !filterConfig.toDate) {
      return data;
    }

    return data.filter(item => {
      const dateString = getFilterDate(item, tab);
      if (!dateString) return false;
      const date = new Date(dateString);
      const from = filterConfig.fromDate ? new Date(filterConfig.fromDate) : null;
      const to = filterConfig.toDate ? new Date(filterConfig.toDate) : null;
      to && to.setHours(23, 59, 59, 999);

      if (from && to) {
        return date >= from && date <= to;
      } else if (from) {
        return date >= from;
      } else if (to) {
        return date <= to;
      }
      return true;
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" }).toLowerCase();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day} - ${month} - ${year} [${time}]`;
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("default", { month: "short" }).toLowerCase();
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  const handleUpdateEntry = async (updateData, endpoint) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/site-incharge/${endpoint}`, updateData);
      toast.success(response.data.message);
      // Refresh data after update
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

const openEditModal = (type, data) => {
  setEditModal({ open: true, type, data: { ...data } });
};

const closeEditModal = () => {
  setEditModal({ open: false, type: "", data: null });
};
const handleAdminUpdate = async (type, updatedData) => {
  const updatedBy = userId; // Assuming current user is admin
  let updateData = { updated_by: updatedBy, ...updatedData };

  try {
    switch (type) {
      case "completion":
        await handleUpdateEntry(updateData, "admin-update-completion-entry");
        break;
      case "acknowledgement":
        await handleUpdateEntry(updateData, "admin-update-acknowledgement");
        break;
      case "usage":
        await handleUpdateEntry(updateData, "admin-update-material-usage-entry");
        break;
      case "expense":
        await handleUpdateEntry(updateData, "admin-update-budget-expense-entry");
        break;
      case "labour-assignment":
        await handleUpdateEntry(updateData, "admin-update-labour-assignment");
        break;
      case "labour-attendance":
        await handleUpdateEntry({ attendance_data: [updateData] }, "admin-save-labour-attendance");
        break;
      default:
        toast.error("Update not supported for this type");
        return;
    }
    toast.success("Entry updated successfully");
    // Refresh data after update
    window.location.reload();
  } catch (err) {
    toast.error(err.response?.data?.message || "Update failed");
  }
};

  const renderFilterSection = (tab) => {
    const hasFilters = filters[tab].fromDate || filters[tab].toDate;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">From Date:</label>
            <input
              type="date"
              value={filters[tab].fromDate}
              onChange={(e) => handleFilterChange(tab, "fromDate", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">To Date:</label>
            <input
              type="date"
              value={filters[tab].toDate}
              onChange={(e) => handleFilterChange(tab, "toDate", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => resetFilters(tab)}
              className="ml-auto px-4 py-1.5 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    );
  };

  // Edit Modal Component
 const EditModal = ({ open, type, data: initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (open && initialData) {
      setFormData(initialData);
    }
  }, [open, initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(type, formData);
    }
  };

  if (!open) return null;

  let title = "";
  let fields = [];

  switch (type) {
    case "completion":
      title = "Edit Completion Entry";
      fields = [
        { key: "area_added", label: "Area Added", type: "number", value: formData.area_added },
        { key: "remarks", label: "Remarks", type: "text", value: formData.remarks },
      ];
      break;
    case "acknowledgement":
      title = "Edit Acknowledgement";
      fields = [
        { key: "overall_quantity", label: "Overall Quantity", type: "number", value: formData.overall_quantity },
        { key: "remarks", label: "Remarks", type: "text", value: formData.remarks },
      ];
      break;
    case "usage":
      title = "Edit Usage Entry";
      fields = [
        { key: "overall_qty", label: "Overall Qty", type: "number", value: formData.overall_qty },
        { key: "remarks", label: "Remarks", type: "text", value: formData.remarks },
      ];
      break;
    case "expense":
      title = "Edit Expense Entry";
      fields = [
        { key: "actual_value", label: "Actual Value", type: "number", value: formData.actual_value },
        { key: "remarks", label: "Remarks", type: "text", value: formData.remarks },
      ];
      break;
    case "labour-assignment":
      title = "Edit Labour Assignment";
      fields = [
        { key: "from_date", label: "From Date", type: "date", value: formData.from_date },
        { key: "to_date", label: "To Date", type: "date", value: formData.to_date },
        { key: "salary", label: "Salary", type: "number", value: formData.salary },
      ];
      break;
    case "labour-attendance":
      title = "Edit Labour Attendance";
      fields = [
        { key: "shift", label: "Shift", type: "number", value: formData.shift },
        { key: "remarks", label: "Remarks", type: "text", value: formData.remarks },
        { key: "entry_date", label: "Entry Date", type: "date", value: formData.entry_date },
      ];
      break;
    default:
      return null;
  }

  return (
    <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}:
              </label>
              <input
                type={field.type}
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

  const renderEditButton = (type, id, data) => (
    <button
      onClick={() => openEditModal(type, { id, ...data })}
      className="p-1 text-blue-500 hover:text-blue-700"
      title="Edit (Admin)"
    >
      <Edit size={16} />
    </button>
  );

  const renderAcknowledgementHistory = () => {
    let tabData = allAckData;
    if (selectedIncharge) {
      tabData = filterByIncharge(tabData, selectedIncharge, "acknowledgement");
    }
    const filteredData = filterDataByDate(tabData, "acknowledgement");
    
    return (
      <div className="space-y-6">
        {renderFilterSection("acknowledgement")}
        
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">📋</div>
            <div className="text-lg font-medium">No acknowledgement entries found</div>
            <div className="text-sm text-gray-400 mt-2">
              {selectedIncharge ? `No data for ${selectedIncharge}` : "No data available"}
              {filters.acknowledgement.fromDate || filters.acknowledgement.toDate ? " or try adjusting your filters" : ""}
            </div>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 relative">
              <button
                onClick={() => openEditModal("acknowledgement", { ack_id: item.acknowledgement.id, overall_quantity: item.acknowledgement.overall_quantity, remarks: item.acknowledgement.remarks })}
                className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                title="Edit Acknowledgement"
              >
                <Edit size={16} />
              </button>
              {/* Acknowledgement Details */}
              <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Acknowledgement Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Site Incharge</span>
                    <span className="font-medium text-gray-800">{item.acknowledgement.siteincharge_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Material</span>
                    <span className="font-medium text-gray-800">{item.acknowledgement.item_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Overall Quantity</span>
                    <span className="font-medium text-gray-800">{item.acknowledgement.overall_quantity || "N/A"}</span>
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                    <span className="text-gray-700">{item.acknowledgement.remarks || "No remarks"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                    <span className="text-gray-700">{formatDateTime(item.acknowledgement.created_at)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                    <span className="font-medium text-gray-800">{item.acknowledgement.updated_by_user_name || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* History */}
              {item.history && item.history.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    History
                  </h3>
                  <div className="space-y-4">
                    {item.history.map((hist, histIndex) => (
                      <div key={histIndex} className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Material</span>
                            <span className="font-medium text-gray-800">{hist.item_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Overall Quantity</span>
                            <span className="font-medium text-gray-800">{hist.overall_quantity || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                            <span className="text-gray-700">{hist.remarks || "No remarks"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                            <span className="font-medium text-gray-800">{hist.created_by_user_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                            <span className="font-medium text-gray-800">{hist.updated_by_user_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                            <span className="text-gray-700">{formatDateTime(hist.created_at)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                            <span className="text-gray-700">{formatDateTime(hist.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  // Similar updates for other render functions - add edit button and handle for each type
  const renderUsageHistory = () => {
    let tabData = allUsageData;
    if (selectedIncharge) {
      tabData = filterByIncharge(tabData, selectedIncharge, "usage");
    }
    const filteredData = filterDataByDate(tabData, "usage");
    
    return (
      <div className="space-y-6">
        {renderFilterSection("usage")}
        
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-lg font-medium">No usage entries found</div>
            <div className="text-sm text-gray-400 mt-2">
              {selectedIncharge ? `No data for ${selectedIncharge}` : "No data available"}
              {filters.usage.fromDate || filters.usage.toDate ? " or try adjusting your filters" : ""}
            </div>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 relative">
              <button
                onClick={() => openEditModal("usage", { entry_id: item.usage.id, overall_qty: item.usage.overall_qty, remarks: item.usage.remarks })}
                className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                title="Edit Usage Entry"
              >
                <Edit size={16} />
              </button>
              {/* Usage Details */}
              <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Usage Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Site Incharge</span>
                    <span className="font-medium text-gray-800">{item.usage.siteincharge_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Material</span>
                    <span className="font-medium text-gray-800">{item.usage.item_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Overall Qty</span>
                    <span className="font-medium text-gray-800">{item.usage.overall_qty || "N/A"}</span>
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                    <span className="text-gray-700">{item.usage.remarks || "No remarks"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                    <span className="text-gray-700">{formatDateTime(item.usage.created_at)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                    <span className="font-medium text-gray-800">{item.usage.updated_by_user_name || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Daily History */}
              {item.daily_history && item.daily_history.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Daily History
                  </h3>
                  <div className="space-y-4">
                    {item.daily_history.map((daily, dailyIndex) => (
                      <div key={dailyIndex} className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs relative">
                        <button
                          onClick={() => openEditModal("usage", { entry_id: daily.entry_id, overall_qty: daily.overall_qty, remarks: daily.remarks })}
                          className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                          title="Edit Daily Entry"
                        >
                          <Edit size={16} />
                        </button>
                        <div className="mb-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            Entry Date: {formatDateOnly(daily.entry_date)}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Overall Qty</span>
                              <span className="font-medium text-gray-800">{daily.overall_qty || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                              <span className="text-gray-700">{daily.remarks || "No remarks"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                              <span className="font-medium text-gray-800">{daily.created_by_user_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                              <span className="font-medium text-gray-800">{daily.updated_by_user_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                              <span className="text-gray-700">{formatDateTime(daily.created_at)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                              <span className="text-gray-700">{formatDateTime(daily.updated_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit History for this daily entry */}
                        {daily.edit_history && daily.edit_history.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Edit History
                            </h5>
                            <div className="space-y-3">
                              {daily.edit_history.map((edit, editIndex) => (
                                <div key={editIndex} className="p-3 bg-white border border-gray-200 rounded-md text-xs">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Overall Qty</span>
                                      <span className="font-medium">{edit.overall_qty || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                                      <span className="text-gray-700">{edit.remarks || "No remarks"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                                      <span className="font-medium">{edit.created_by_user_name || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                                      <span className="font-medium">{edit.updated_by_user_name || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                                      <span className="text-gray-700">{formatDateTime(edit.created_at)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                                      <span className="text-gray-700">{formatDateTime(edit.updated_at)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  // Follow similar pattern for other tabs: expense, completion, labour-assignment, labour-attendance
  // For brevity, the pattern is the same: add edit button on main item and daily/history items where applicable
  // Implement renderExpenseHistory, renderCompletionHistory, renderLabourAssignmentHistory, renderLabourAttendanceHistory similarly with edit buttons

  const renderExpenseHistory = () => {
    let tabData = allExpenseData;
    if (selectedIncharge) {
      tabData = filterByIncharge(tabData, selectedIncharge, "expense");
    }
    const filteredData = filterDataByDate(tabData, "expense");
    
    return (
      <div className="space-y-6">
        {renderFilterSection("expense")}
        
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">💰</div>
            <div className="text-lg font-medium">No expense entries found</div>
            <div className="text-sm text-gray-400 mt-2">
              {selectedIncharge ? `No data for ${selectedIncharge}` : "No data available"}
              {filters.expense.fromDate || filters.expense.toDate ? " or try adjusting your filters" : ""}
            </div>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 relative">
              <button
                onClick={() => openEditModal("expense", { entry_id: item.expense.id, actual_value: item.expense.actual_value, remarks: item.expense.remarks })}
                className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                title="Edit Expense Entry"
              >
                <Edit size={16} />
              </button>
              {/* Expense Details */}
              <div className="mb-6 p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Expense Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Site Incharge</span>
                    <span className="font-medium text-gray-800">{item.expense.siteincharge_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Expense Type</span>
                    <span className="font-medium text-gray-800">{item.expense.expense_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Actual Value</span>
                    <span className="font-medium text-gray-800">{item.expense.actual_value || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Splitted Budget</span>
                    <span className="font-medium text-gray-800">{item.expense.splitted_budget || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Difference Value</span>
                    <span className="font-medium text-gray-800">{item.expense.difference_value || "N/A"}</span>
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                    <span className="text-gray-700">{item.expense.remarks || "No remarks"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                    <span className="text-gray-700">{formatDateTime(item.expense.created_at)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                    <span className="font-medium text-gray-800">{item.expense.updated_by_user_name || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Daily History */}
              {item.daily_history && item.daily_history.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Daily History
                  </h3>
                  <div className="space-y-4">
                    {item.daily_history.map((daily, dailyIndex) => (
                      <div key={dailyIndex} className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs relative">
                        <button
                          onClick={() => openEditModal("expense", { entry_id: daily.id, actual_value: daily.actual_value, remarks: daily.remarks })}
                          className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                          title="Edit Daily Entry"
                        >
                          <Edit size={16} />
                        </button>
                        <div className="mb-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            Entry Date: {formatDateOnly(daily.entry_date)}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Expense Type</span>
                              <span className="font-medium text-gray-800">{daily.expense_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Actual Value</span>
                              <span className="font-medium text-gray-800">{daily.actual_value || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                              <span className="text-gray-700">{daily.remarks || "No remarks"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                              <span className="font-medium text-gray-800">{daily.created_by_user_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                              <span className="font-medium text-gray-800">{daily.updated_by_user_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                              <span className="text-gray-700">{formatDateTime(daily.created_at)}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                              <span className="text-gray-700">{formatDateTime(daily.updated_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit History for this daily entry */}
                        {daily.edit_history && daily.edit_history.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              Edit History
                            </h5>
                            <div className="space-y-3">
                              {daily.edit_history.map((edit, editIndex) => (
                                <div key={editIndex} className="p-3 bg-white border border-gray-200 rounded-md text-xs">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Expense Type</span>
                                      <span className="font-medium">{edit.expense_name || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Actual Value</span>
                                      <span className="font-medium">{edit.actual_value || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                                      <span className="text-gray-700">{edit.remarks || "No remarks"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                                      <span className="font-medium">{edit.created_by_user_name || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                                      <span className="font-medium">{edit.updated_by_user_name || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                                      <span className="text-gray-700">{formatDateTime(edit.created_at)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                                      <span className="text-gray-700">{formatDateTime(edit.updated_at)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderCompletionHistory = () => {
    let tabData = allCompletionData;
    if (selectedIncharge) {
      tabData = filterByIncharge(tabData, selectedIncharge, "completion");
    }
    const filteredData = filterDataByDate(tabData, "completion");
    
    return (
      <div className="space-y-6">
        {renderFilterSection("completion")}
        
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-lg font-medium">No completion entries found</div>
            <div className="text-sm text-gray-400 mt-2">
              {selectedIncharge ? `No data for ${selectedIncharge}` : "No data available"}
              {filters.completion.fromDate || filters.completion.toDate ? " or try adjusting your filters" : ""}
            </div>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 relative">
              <button
                onClick={() => openEditModal("completion", { entry_id: item.completion.entry_id, area_added: item.completion.area_completed, remarks: item.completion.remarks })}
                className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                title="Edit Completion"
              >
                <Edit size={16} />
              </button>
              {/* Completion Details */}
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Completion Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Site Incharge</span>
                    <span className="font-medium text-gray-800">{item.completion.siteincharge_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Category</span>
                    <span className="font-medium text-gray-800">{item.completion.category_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Subcategory</span>
                    <span className="font-medium text-gray-800">{item.completion.subcategory_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Description</span>
                    <span className="font-medium text-gray-800">{item.completion.desc_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Area Completed</span>
                    <span className="font-medium text-gray-800">{item.completion.area_completed || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Rate</span>
                    <span className="font-medium text-gray-800">{item.completion.rate || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Value</span>
                    <span className="font-medium text-gray-800">{item.completion.value || "N/A"}</span>
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                    <span className="text-gray-700">{item.completion.remarks || "No remarks"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                    <span className="text-gray-700">{formatDateTime(item.completion.created_at)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                    <span className="font-medium text-gray-800">{item.completion.created_by_user_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                    <span className="font-medium text-gray-800">{item.completion.updated_by_user_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                    <span className="text-gray-700">{formatDateTime(item.completion.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Entries History */}
              {item.entries_history && item.entries_history.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Entries History
                  </h3>
                  <div className="space-y-4">
                    {item.entries_history.map((entry, entryIndex) => (
                      <div key={entryIndex} className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs relative">
                        <button
                          onClick={() => openEditModal("completion", { entry_id: entry.entry_id, area_added: entry.area_added, remarks: entry.remarks })}
                          className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                          title="Edit Entry"
                        >
                          <Edit size={16} />
                        </button>
                        <div className="mb-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            Entry Date: {formatDateOnly(entry.entry_date)}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Category</span>
                              <span className="font-medium text-gray-800">{entry.category_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Subcategory</span>
                              <span className="font-medium text-gray-800">{entry.subcategory_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Description</span>
                              <span className="font-medium text-gray-800">{entry.desc_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Area Added</span>
                              <span className="font-medium text-gray-800">{entry.area_added || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Rate</span>
                              <span className="font-medium text-gray-800">{entry.rate || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Value Added</span>
                              <span className="font-medium text-gray-800">{entry.value_added || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                              <span className="text-gray-700">{entry.remarks || "No remarks"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                              <span className="font-medium text-gray-800">{entry.created_by_user_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                              <span className="text-gray-700">{formatDateTime(entry.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Edit History */}
              {item.status_edit_history && item.status_edit_history.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Status Edit History
                  </h3>
                  <div className="space-y-4">
                    {item.status_edit_history.map((edit, editIndex) => (
                      <div key={editIndex} className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Category</span>
                            <span className="font-medium text-gray-800">{edit.category_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Subcategory</span>
                            <span className="font-medium text-gray-800">{edit.subcategory_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Description</span>
                            <span className="font-medium text-gray-800">{edit.desc_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Area Completed</span>
                            <span className="font-medium text-gray-800">{edit.area_completed || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Rate</span>
                            <span className="font-medium text-gray-800">{edit.rate || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Value</span>
                            <span className="font-medium text-gray-800">{edit.value || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                            <span className="text-gray-700">{edit.remarks || "No remarks"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                            <span className="font-medium text-gray-800">{edit.created_by_user_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                            <span className="font-medium text-gray-800">{edit.updated_by_user_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                            <span className="text-gray-700">{formatDateTime(edit.created_at)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                            <span className="text-gray-700">{formatDateTime(edit.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderLabourAssignmentHistory = () => {
    let tabData = allLabourAssignmentData;
    if (selectedIncharge) {
      tabData = filterByIncharge(tabData, selectedIncharge, "labour-assignment");
    }
    const filteredData = filterDataByDate(tabData, "labour-assignment");
    
    return (
      <div className="space-y-6">
        {renderFilterSection("labour-assignment")}
        
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">👥</div>
            <div className="text-lg font-medium">No labour assignment entries found</div>
            <div className="text-sm text-gray-400 mt-2">
              {selectedIncharge ? `No data for ${selectedIncharge}` : "No data available"}
              {filters["labour-assignment"].fromDate || filters["labour-assignment"].toDate ? " or try adjusting your filters" : ""}
            </div>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 relative">
              <button
                onClick={() => openEditModal("labour-assignment", { assignment_id: item.assignment.id, from_date: item.assignment.from_date, to_date: item.assignment.to_date, salary: item.assignment.salary })}
                className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                title="Edit Assignment"
              >
                <Edit size={16} />
              </button>
              {/* Assignment Details */}
              <div className="mb-6 p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Assignment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Site Incharge</span>
                    <span className="font-medium text-gray-800">{item.assignment.siteincharge_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Project</span>
                    <span className="font-medium text-gray-800">{item.assignment.project_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Site</span>
                    <span className="font-medium text-gray-800">{item.assignment.site_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">PO Number</span>
                    <span className="font-medium text-gray-800">{item.assignment.po_number || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Description</span>
                    <span className="font-medium text-gray-800">{item.assignment.desc_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Labour</span>
                    <span className="font-medium text-gray-800">{item.assignment.full_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Mobile</span>
                    <span className="font-medium text-gray-800">{item.assignment.mobile || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">From Date</span>
                    <span className="text-gray-700">{formatDateOnly(item.assignment.from_date)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">To Date</span>
                    <span className="text-gray-700">{formatDateOnly(item.assignment.to_date)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Salary</span>
                    <span className="font-medium text-gray-800">{item.assignment.salary || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                    <span className="text-gray-700">{formatDateTime(item.assignment.created_at)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                    <span className="font-medium text-gray-800">{item.assignment.created_by_user_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                    <span className="font-medium text-gray-800">{item.assignment.updated_by_user_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                    <span className="text-gray-700">{formatDateTime(item.assignment.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Edit History */}
              {item.edit_history && item.edit_history.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Edit History
                  </h3>
                  <div className="space-y-4">
                    {item.edit_history.map((edit, editIndex) => (
                      <div key={editIndex} className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Project</span>
                            <span className="font-medium text-gray-800">{edit.project_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Site</span>
                            <span className="font-medium text-gray-800">{edit.site_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">PO Number</span>
                            <span className="font-medium text-gray-800">{edit.po_number || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Description</span>
                            <span className="font-medium text-gray-800">{edit.desc_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Labour</span>
                            <span className="font-medium text-gray-800">{edit.full_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Mobile</span>
                            <span className="font-medium text-gray-800">{edit.mobile || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">From Date</span>
                            <span className="text-gray-700">{formatDateOnly(edit.from_date)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">To Date</span>
                            <span className="text-gray-700">{formatDateOnly(edit.to_date)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Salary</span>
                            <span className="font-medium text-gray-800">{edit.salary || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                            <span className="font-medium text-gray-800">{edit.created_by_user_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                            <span className="font-medium text-gray-800">{edit.updated_by_user_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                            <span className="text-gray-700">{formatDateTime(edit.created_at)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                            <span className="text-gray-700">{formatDateTime(edit.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderLabourAttendanceHistory = () => {
    let tabData = allLabourAttendanceData;
    if (selectedIncharge) {
      tabData = filterByIncharge(tabData, selectedIncharge, "labour-attendance");
    }
    const filteredData = filterDataByDate(tabData, "labour-attendance");
    
    return (
      <div className="space-y-6">
        {renderFilterSection("labour-attendance")}
        
        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-lg font-medium">No labour attendance entries found</div>
            <div className="text-sm text-gray-400 mt-2">
              {selectedIncharge ? `No data for ${selectedIncharge}` : "No data available"}
              {filters["labour-attendance"].fromDate || filters["labour-attendance"].toDate ? " or try adjusting your filters" : ""}
            </div>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 relative">
              <button
                onClick={() => openEditModal("labour-attendance", { attendance_id: item.attendance.id, shift: item.attendance.shift, remarks: item.attendance.remarks, entry_date: item.attendance.entry_date })}
                className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700"
                title="Edit Attendance"
              >
                <Edit size={16} />
              </button>
              {/* Attendance Details */}
              <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                  Attendance Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Site Incharge</span>
                    <span className="font-medium text-gray-800">{item.attendance.siteincharge_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Labour</span>
                    <span className="font-medium text-gray-800">{item.attendance.full_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Mobile</span>
                    <span className="font-medium text-gray-800">{item.attendance.mobile || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Entry Date</span>
                    <span className="text-gray-700">{formatDateOnly(item.attendance.entry_date)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Shift</span>
                    <span className="font-medium text-gray-800">{item.attendance.shift || "N/A"}</span>
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                    <span className="text-gray-700">{item.attendance.remarks || "No remarks"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                    <span className="text-gray-700">{formatDateTime(item.attendance.created_at)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                    <span className="font-medium text-gray-800">{item.attendance.created_by_user_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                    <span className="font-medium text-gray-800">{item.attendance.updated_by_user_name || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                    <span className="text-gray-700">{formatDateTime(item.attendance.updated_at)}</span>
                  </div>
                </div>
              </div>

              {/* Edit History */}
              {item.edit_history && item.edit_history.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Edit History
                  </h3>
                  <div className="space-y-4">
                    {item.edit_history.map((edit, editIndex) => (
                      <div key={editIndex} className="p-4 bg-white border border-gray-200 rounded-lg shadow-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Labour</span>
                            <span className="font-medium text-gray-800">{edit.full_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Mobile</span>
                            <span className="font-medium text-gray-800">{edit.mobile || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Entry Date</span>
                            <span className="text-gray-700">{formatDateOnly(edit.entry_date)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Shift</span>
                            <span className="font-medium text-gray-800">{edit.shift || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Remarks</span>
                            <span className="text-gray-700">{edit.remarks || "No remarks"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Created By</span>
                            <span className="font-medium text-gray-800">{edit.created_by_user_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Updated By</span>
                            <span className="font-medium text-gray-800">{edit.updated_by_user_name || "N/A"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Created At</span>
                            <span className="text-gray-700">{formatDateTime(edit.created_at)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-1">Updated At</span>
                            <span className="text-gray-700">{formatDateTime(edit.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-gray-600 mt-4">Loading entries data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-red-600 text-lg font-medium">{error}</div>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Incharge Entries</h1>
            <p className="text-gray-600 mb-4">Comprehensive entries of all site incharges activities and transactions (Admin Edit Enabled)</p>
            
            {/* Site Incharge Dropdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Site Incharge:</label>
              <select
                value={selectedIncharge}
                onChange={(e) => setSelectedIncharge(e.target.value)}
                className="w-full md:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Site Incharges</option>
                {uniqueIncharges.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="flex flex-wrap border-b border-gray-200">
              {[
                { key: "acknowledgement", label: "Acknowledgement", icon: "📋" },
                { key: "usage", label: "Usage", icon: "📊" },
                { key: "expense", label: "Expense", icon: "💰" },
                { key: "completion", label: "Completion", icon: "✅" },
                { key: "labour-assignment", label: "Labour Assignment", icon: "👥" },
                { key: "labour-attendance", label: "Labour Attendance", icon: "📝" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center px-6 py-4 font-medium transition-colors duration-200 ${
                    activeTab === tab.key
                      ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "acknowledgement" && renderAcknowledgementHistory()}
            {activeTab === "usage" && renderUsageHistory()}
            {activeTab === "expense" && renderExpenseHistory()}
            {activeTab === "completion" && renderCompletionHistory()}
            {activeTab === "labour-assignment" && renderLabourAssignmentHistory()}
            {activeTab === "labour-attendance" && renderLabourAttendanceHistory()}
          </div>
        </div>
      </div>
<EditModal
  open={editModal.open}
  type={editModal.type}
  data={editModal.data}
  onClose={closeEditModal}
  onSave={handleAdminUpdate}
/>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </>
  );
};

export default SiteInchargeEntries;
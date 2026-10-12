import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Search, Plus, Building2, User, MapPin, Phone, FileText, Calendar, ChevronDown, ChevronUp, Users, ChevronLeft, ChevronRight, Edit, Save, X } from 'lucide-react';
import CompanyCreation from '../../components/CompanyCreation';

// Define the color theme for a professional look
const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',     // Gold/Amber
  lightBg: '#f8f9fa',    // Light gray background
  textPrimary: '#212529', // Dark charcoal text
  textSecondary: '#6c757d', // Gray secondary text
  border: '#dee2e6',     // Neutral border
  lightBorder: '#e9ecef', // Lighter border
};

const ClientMasterCreation = () => {
  const { encodedUserId } = useParams();
  const userId = atob(encodedUserId); // Decode base64 userId

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/project/companies`);
      const data = Array.isArray(response.data) ? response.data : [];
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setClients(sortedData);
      setFilteredClients(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError('Failed to load clients. Please try again.');
      setClients([]);
      setFilteredClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/project/states`);
      setStates(response.data.data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/project/cities`);
      setCities(response.data.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchStates();
    fetchCities();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(client =>
      (client.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.spoc_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.spoc_contact_no || '').includes(searchQuery)
    );
    setFilteredClients(filtered);
    setCurrentPage(1);
  }, [searchQuery, clients]);

  const handleCompanyCreated = () => {
    fetchClients();
    setShowCompanyModal(false);
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Client created successfully!',
      showConfirmButton: false,
      timer: 2000,
      toast: true,
      background: '#ecfdf5',
      iconColor: '#10b981',
    });
  };

  const startEdit = (client) => {
    setEditingId(client.company_id);
    setEditedData({ ...client });
    setExpandedId(client.company_id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedData({});
  };

  const saveEdit = async () => {
    try {
      // Validate spoc_contact_no
      if (editedData.spoc_contact_no && !/^\d{10}$/.test(editedData.spoc_contact_no)) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Invalid SPOC contact number',
          text: 'Must be a 10-digit phone number',
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        return;
      }

      // Validate city_id and state_id
      if (editedData.city_id && (isNaN(parseInt(editedData.city_id)) || parseInt(editedData.city_id) <= 0)) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Invalid city ID',
          text: 'City ID must be a valid positive integer',
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        return;
      }
      if (editedData.state_id && (isNaN(parseInt(editedData.state_id)) || parseInt(editedData.state_id) <= 0)) {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'Invalid state ID',
          text: 'State ID must be a valid positive integer',
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        return;
      }

      // Send update request with company_id in the body
      await axios.put(`${API_BASE_URL}/project/companies`, {
        company_id: editedData.company_id,
        company_name: editedData.company_name,
        address: editedData.address,
        gst_number: editedData.gst_number || null,
        vendor_code: editedData.vendor_code || null,
        city_id: editedData.city_id ? parseInt(editedData.city_id) : null,
        state_id: editedData.state_id ? parseInt(editedData.state_id) : null,
        pincode: editedData.pincode || null,
        spoc_name: editedData.spoc_name,
        spoc_contact_no: editedData.spoc_contact_no,
        updated_by: userId
      });

      fetchClients();
      setEditingId(null);
      setEditedData({});
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Client updated successfully!',
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: '#ecfdf5',
        iconColor: '#10b981',
      });
    } catch (error) {
      console.error("Error updating client:", error);
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Failed to update client',
        text: error.response?.data?.error || 'An error occurred',
        showConfirmButton: false,
        timer: 2000,
        toast: true,
      });
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedId(null);
  };

  const handlePrevious = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Client Master
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Manage and organize your client database.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCompanyModal(true)}
              className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2"
              style={{ backgroundColor: themeColors.primary, ringColor: themeColors.accent }}
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
              Create Client
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} style={{ color: themeColors.textSecondary }} />
            </div>
            <input
              type="text"
              placeholder="Search by company, SPOC, address, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm sm:text-base transition-all duration-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:bg-white"
              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.accent }}
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                  {filteredClients.length} results
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 p-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4" style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
              </div>
              <p className="mt-4 font-medium" style={{ color: themeColors.textSecondary }}>Loading clients...</p>
            </div>
          ) : error ? (
            <div className="m-6 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg"><FileText className="w-5 h-5 text-red-600" /></div>
                <div>
                  <h3 className="text-red-800 font-semibold">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : !loading && !error && filteredClients.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-96 p-8 text-center">
              <div className="p-4 bg-gray-100 rounded-2xl mb-4">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color: themeColors.textPrimary }}>No clients found</h3>
              <p style={{ color: themeColors.textSecondary }}>
                {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first client.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="border-b" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.lightBorder }}>
                    <tr>
                      <th className="w-1/12 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>ID</th>
                      <th className="w-3/12 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Company</th>
                      <th className="w-2/12 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Vendor Code</th>
                      <th className="w-2/12 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>City</th>
                      <th className="w-2/12 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>SPOC Name</th>
                      <th className="w-2/12 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Contact</th>
                      <th className="w-1/12 px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
                    {currentClients.map((client) => {
                      const isEditing = editingId === client.company_id;
                      return (
                        <React.Fragment key={client.company_id}>
                          <tr
                            className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                            onClick={() => !isEditing && toggleExpand(client.company_id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium" style={{ color: themeColors.primary }}>{client.company_id}</div>
                            </td>
                            <td className="px-6 py-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedData.company_name || ''}
                                  onChange={(e) => setEditedData({ ...editedData, company_name: e.target.value })}
                                  className="w-full px-2 py-1 border rounded"
                                  style={{ borderColor: themeColors.border }}
                                />
                              ) : (
                                <div className="text-sm font-medium" style={{ color: themeColors.textPrimary }}>{client.company_name}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedData.vendor_code || ''}
                                  onChange={(e) => setEditedData({ ...editedData, vendor_code: e.target.value })}
                                  className="w-full px-2 py-1 border rounded"
                                  style={{ borderColor: themeColors.border }}
                                />
                              ) : (
                                <div className="text-sm font-mono truncate" style={{ color: themeColors.textSecondary }}>{client.vendor_code || 'N/A'}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <select
                                  value={editedData.city_id || ''}
                                  onChange={(e) => {
                                    const selectedCity = cities.find(c => c.id === parseInt(e.target.value));
                                    setEditedData({ ...editedData, city_id: parseInt(e.target.value), city_name: selectedCity ? selectedCity.city_name : '' });
                                  }}
                                  className="w-full px-2 py-1 border rounded"
                                  style={{ borderColor: themeColors.border }}
                                >
                                  <option value="">Select City</option>
                                  {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.city_name}</option>
                                  ))}
                                </select>
                              ) : (
                                <div className="text-sm truncate" style={{ color: themeColors.textSecondary }}>{client.city_name || 'N/A'}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedData.spoc_name || ''}
                                  onChange={(e) => setEditedData({ ...editedData, spoc_name: e.target.value })}
                                  className="w-full px-2 py-1 border rounded"
                                  style={{ borderColor: themeColors.border }}
                                />
                              ) : (
                                <div className="text-sm truncate" style={{ color: themeColors.textPrimary }}>{client.spoc_name}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editedData.spoc_contact_no || ''}
                                  onChange={(e) => setEditedData({ ...editedData, spoc_contact_no: e.target.value })}
                                  className="w-full px-2 py-1 border rounded"
                                  style={{ borderColor: themeColors.border }}
                                />
                              ) : (
                                <div className="text-sm font-mono" style={{ color: themeColors.textSecondary }}>{client.spoc_contact_no}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isEditing ? (
                                <div className="flex justify-center gap-2">
                                  <button onClick={saveEdit} className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                                    <Save size={16} style={{ color: 'green' }} />
                                  </button>
                                  <button onClick={cancelEdit} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                    <X size={16} style={{ color: 'red' }} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center gap-2">
                                  <button onClick={() => startEdit(client)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                    <Edit size={16} />
                                  </button>
                                  <button onClick={() => toggleExpand(client.company_id)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                    {expandedId === client.company_id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                          {expandedId === client.company_id && (
                            <tr className="bg-white">
                              <td colSpan={7} className="p-0">
                                <div className="p-6 mx-6 my-4 rounded-lg border-l-4 shadow-inner" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.primary }}>
                                  <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: themeColors.textPrimary }}>
                                    <FileText size={16} /> Additional Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                      { label: 'Full Address', field: 'address', type: 'text' },
                                      { label: 'State', field: 'state_id', type: 'select', options: states, optionKey: 'id', optionLabel: 'state_name' },
                                      { label: 'Pincode', field: 'pincode', type: 'text' },
                                      { label: 'GST Number', field: 'gst_number', type: 'text' },
                                      { label: 'Created At', field: 'created_at', type: 'static' },
                                    ].map(item => (
                                      <div key={item.label} className="bg-white p-3 rounded-md shadow-sm border" style={{ borderColor: themeColors.lightBorder }}>
                                        <div className="text-xs uppercase tracking-wide font-medium mb-1" style={{ color: themeColors.textSecondary }}>{item.label}</div>
                                        {isEditing ? (
                                          item.type === 'select' ? (
                                            <select
                                              value={editedData[item.field] || ''}
                                              onChange={(e) => {
                                                const selected = item.options.find(opt => opt[item.optionKey] === parseInt(e.target.value));
                                                setEditedData({ ...editedData, [item.field]: parseInt(e.target.value), state_name: selected ? selected[item.optionLabel] : '' });
                                              }}
                                              className="w-full px-2 py-1 border rounded"
                                              style={{ borderColor: themeColors.border }}
                                            >
                                              <option value="">Select {item.label}</option>
                                              {item.options.map(opt => (
                                                <option key={opt[item.optionKey]} value={opt[item.optionKey]}>{opt[item.optionLabel]}</option>
                                              ))}
                                            </select>
                                          ) : item.type === 'text' ? (
                                            <input
                                              type="text"
                                              value={editedData[item.field] || ''}
                                              onChange={(e) => setEditedData({ ...editedData, [item.field]: e.target.value })}
                                              className="w-full px-2 py-1 border rounded"
                                              style={{ borderColor: themeColors.border }}
                                            />
                                          ) : (
                                            <div className="text-sm" style={{ color: themeColors.textPrimary }}>{formatDate(client[item.field]) || 'N/A'}</div>
                                          )
                                        ) : (
                                          <div className="text-sm" style={{ color: themeColors.textPrimary }}>
                                            {item.field === 'state_id' ? client.state_name || 'N/A' : item.field === 'created_at' ? formatDate(client[item.field]) : client[item.field] || 'N/A'}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t px-6 py-4 flex items-center justify-between" style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.lightBorder }}>
                  <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                    Showing <span className="font-semibold" style={{ color: themeColors.textPrimary }}>{startIndex + 1}</span> to <span className="font-semibold" style={{ color: themeColors.textPrimary }}>{Math.min(endIndex, filteredClients.length)}</span> of <span className="font-semibold" style={{ color: themeColors.textPrimary }}>{filteredClients.length}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrevious} disabled={currentPage === 1} className="p-2 rounded-lg border bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all duration-200 ${currentPage === page ? 'text-white shadow-md' : 'bg-white hover:border-gray-400'}`}
                          style={currentPage === page ? { backgroundColor: themeColors.primary, borderColor: themeColors.primary } : { borderColor: themeColors.border }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleNext} disabled={currentPage === totalPages} className="p-2 rounded-lg border bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for Company Creation */}
      {showCompanyModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCompanyModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border"
            style={{ borderColor: themeColors.border }}
            onClick={e => e.stopPropagation()}
          >
            <CompanyCreation onCompanyCreated={handleCompanyCreated} onClose={() => setShowCompanyModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMasterCreation;
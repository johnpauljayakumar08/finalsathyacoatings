import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MapPin, Settings, Plus, X } from "lucide-react";
import Select from "react-select";
import SupplyProjectCreation from "../../components/SupplyProjectCreation";

const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d', // Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
  poNumberBg: '#e0f2fe',  // Light blue for PO Number background
  supplyCodeBg: '#dcfce7', // Light green for Supply Code background
};

const SupplyMasterPoCreation = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState({
    companies: false,
    sites: false,
  });
  const [expandedSite, setExpandedSite] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading((prev) => ({ ...prev, companies: true }));
        const response = await axios.get(`${API_BASE_URL}/supply/companies`);
        setCompanies(response.data || []);
      } catch (err) {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to load companies",
          text: err.response?.data?.error || "Please try again later",
          showConfirmButton: false,
          timer: 3000,
          toast: true,
          background: "#fef2f2",
          iconColor: "#ef4444",
        });
      } finally {
        setLoading((prev) => ({ ...prev, companies: false }));
      }
    };
    fetchCompanies();
  }, []);

  // Fetch sites when a company is selected
  useEffect(() => {
    if (selectedCompanyId) {
      const fetchSites = async () => {
        try {
          setLoading((prev) => ({ ...prev, sites: true }));
          const response = await axios.get(
            `${API_BASE_URL}/supply/sites-by-company/${selectedCompanyId}`
          );
          setSites(response.data.data || []);
        } catch (err) {
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Failed to load sites",
            text: err.response?.data?.error || "Please try again later",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            background: "#fef2f2",
            iconColor: "#ef4444",
          });
        } finally {
          setLoading((prev) => ({ ...prev, sites: false }));
        }
      };
      fetchSites();
    } else {
      setSites([]);
    }
  }, [selectedCompanyId]);

  const handleCompanyChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setSelectedCompanyId(value);
    setSites([]);
    setExpandedSite(null);
    if (value) {
      localStorage.setItem("selectedCompanyId", value);
    } else {
      localStorage.removeItem("selectedCompanyId");
    }
  };

  const handleToggleSite = (siteId) => {
    setExpandedSite(expandedSite === siteId ? null : siteId);
  };

  const handleShowProjectModal = () => {
    if (!selectedCompanyId) {
      Swal.fire({
        icon: "warning",
        title: "No Company Selected",
        text: "Please select a company before creating a site.",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }
    setShowProjectModal(true);
  };

  const handleProjectCreated = () => {
    setShowProjectModal(false);
    if (selectedCompanyId) {
      axios
        .get(`${API_BASE_URL}/supply/sites-by-company/${selectedCompanyId}`)
        .then((response) => {
          setSites(response.data.data || []);
        })
        .catch((err) => {
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Failed to refresh sites",
            text: err.response?.data?.error || "Please try again later",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            background: "#fef2f2",
            iconColor: "#ef4444",
          });
        });
    }
  };

  const companyOptions = companies.map((company) => ({
    value: company.company_id,
    label: company.company_name,
  }));

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div
          className="bg-white rounded-xl shadow-sm border p-6 mb-6"
          style={{ borderColor: themeColors.border }}
        >
          <div className="flex flex-col gap-4">
            {/* Title and Description */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Sites Management
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Create and manage project sites
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                {loading.companies ? (
                  <div className="animate-pulse h-10 w-full max-w-md bg-gray-200 rounded-lg"></div>
                ) : (
                  <Select
                    value={companyOptions.find((option) => option.value === selectedCompanyId) || null}
                    onChange={handleCompanyChange}
                    options={companyOptions}
                    placeholder="Search client"
                    isClearable={false}
                    isDisabled={loading.companies}
                    className="w-full max-w-md"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderColor: themeColors.border,
                        '&:hover': { borderColor: themeColors.accent },
                        boxShadow: 'none',
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: themeColors.textSecondary,
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: themeColors.textPrimary,
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                          ? themeColors.primary
                          : state.isFocused
                          ? themeColors.lightBorder
                          : 'white',
                        color: state.isSelected ? 'white' : themeColors.textPrimary,
                        '&:hover': {
                          backgroundColor: themeColors.lightBorder,
                        },
                      }),
                    }}
                  />
                )}
              </div>

              {selectedCompanyId && (
                <button
                  onClick={() => handleCompanyChange(null)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeColors.lightBorder,
                    color: themeColors.textSecondary,
                    ringColor: themeColors.accent,
                  }}
                >
                  <X size={16} />
                  Clear Selection
                </button>
              )}

              <button
                onClick={handleShowProjectModal}
                className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: selectedCompanyId ? themeColors.primary : themeColors.textSecondary,
                  ringColor: themeColors.accent,
                }}
                disabled={!selectedCompanyId}
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
                Create Site
              </button>
            </div>
          </div>
        </div>

        {/* Sites List */}
        {selectedCompanyId && (
          <div
            className="bg-white rounded-xl shadow-sm border p-6"
            style={{ borderColor: themeColors.border, backgroundColor: '#ffffff' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg">
                <MapPin className="w-6 h-6" style={{ color: themeColors.primary }} />
              </div>
              <div className="flex gap-3 items-center">
                <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Sites for Selected Client
                </h2>
                <div
                  className="px-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: themeColors.lightBorder,
                    color: themeColors.textSecondary,
                  }}
                >
                  {sites.length} sites
                </div>
              </div>
            </div>

            {/* Sites List Content */}
            {loading.sites ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: themeColors.primary }}></div>
              </div>
            ) : sites.length > 0 ? (
              <div className="space-y-4">
                {sites.map((site, index) => (
                  <div
                    key={site.site_id}
                    className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                    style={{ borderColor: themeColors.border }}
                  >
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleToggleSite(site.site_id)}
                    >
                      <div>
                        <h3 className="text-lg font-medium" style={{ color: themeColors.textPrimary }}>
                          {site.site_name}
                        </h3>
                        <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                          Project: {site.project_name}
                        </p>
                      </div>
                      {expandedSite === site.site_id ? (
                        <svg
                          className="w-5 h-5"
                          style={{ color: themeColors.textSecondary }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          style={{ color: themeColors.textSecondary }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                    {expandedSite === site.site_id && (
                      <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(site.po_number || site.supply_code) && (
                            <div
                              className="p-3 rounded-lg"
                              style={{
                                backgroundColor: site.po_number ? themeColors.poNumberBg : themeColors.supplyCodeBg,
                              }}
                            >
                              <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                                {site.po_number ? "PO Number" : "Supply Code"}
                              </p>
                              <p className="text-sm font-semibold" style={{ color: themeColors.textPrimary }}>
                                {site.po_number || site.supply_code}
                              </p>
                            </div>
                          )}
                          <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.lightBorder }}>
                            <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                              Location
                            </p>
                            <p className="text-sm font-semibold" style={{ color: themeColors.textPrimary }}>
                              {site.location_name || "N/A"}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.lightBorder }}>
                            <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                              Reckoner Type
                            </p>
                            <p className="text-sm font-semibold" style={{ color: themeColors.textPrimary }}>
                              {site.type_name || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p style={{ color: themeColors.textSecondary }}>No sites found for this company.</p>
                <button
                  onClick={handleShowProjectModal}
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: themeColors.primary,
                    ringColor: themeColors.accent,
                  }}
                >
                  <Plus size={18} className="mr-2" />
                  Create New Site
                </button>
              </div>
            )}
          </div>
        )}

        {/* Site Creation Modal */}
        {showProjectModal && (
          <SupplyProjectCreation
            companyId={selectedCompanyId}
            onClose={() => setShowProjectModal(false)}
            onProjectCreated={handleProjectCreated}
          />
        )}
      </div>
    </div>
  );
};

export default SupplyMasterPoCreation;
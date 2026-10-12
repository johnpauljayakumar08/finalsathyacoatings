// src/components/POComponents/HeaderSection.jsx
import React from "react";
import { Settings, Plus, X } from "lucide-react";
import SearchableClientDropdown from "./SearchableClientDropdown";

const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d', // Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
};

const HeaderSection = ({
  companies,
  selectedCompanyId,
  handleCompanyChange,
  onShowProjectModal,
  loading
}) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border p-6 mb-6" 
      style={{ borderColor: themeColors.border }}
    >
      <div className="flex flex-col gap-4">
        {/* Title and Description */}
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: themeColors.textPrimary }}
            >
              Master PO Creation
            </h1>
            <p 
              className="text-sm mt-1"
              style={{ color: themeColors.textSecondary }}
            >
              Create and manage project work orders
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchableClientDropdown
              options={companies}
              value={selectedCompanyId}
              onChange={handleCompanyChange}
              placeholder="Search client"
              disabled={loading.companies}
              isLoading={loading.companies}
            />
          </div>

          {selectedCompanyId && (
            <button
              onClick={() => handleCompanyChange("")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: themeColors.lightBorder,
                color: themeColors.textSecondary,
                ringColor: themeColors.accent 
              }}
            >
              <X size={16} />
              Clear Selection
            </button>
          )}

          <button
            onClick={onShowProjectModal}
            className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: selectedCompanyId ? themeColors.primary : themeColors.textSecondary,
              ringColor: themeColors.accent 
            }}
            disabled={!selectedCompanyId}
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            Create Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection;
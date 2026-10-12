// src/components/POComponents/SiteCard.jsx
import React from "react";
import { ChevronDown, ChevronUp, Building2, FileText, Calendar } from "lucide-react";
import SiteDetailsDisplay from "./SiteDetailsDisplay";
import SiteDetailsForm from "./SiteDetailsForm";
import WorkDescriptionsSection from "./WorkDescriptionsSection";

const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d', // Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
};

const SiteCard = ({
  site,
  index,
  expandedSite,
  handleToggleSite,
  editingSiteId,
  editSiteData,
  handleEditSiteChange,
  handleDropdownChange,
  inchargeTypes,
  locations,
  reckonerTypes,
  loading,
  handleUpdateSite,
  setEditingSiteId,
  handleEditSite,
  siteReckonerData,
  creatingReckonerSiteId,
  handleCreateReckoner,
  children
}) => {
  const isExpanded = expandedSite === site.site_id;
  const isEditing = editingSiteId === site.site_id;

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor: themeColors.border, backgroundColor: '#ffffff' }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center p-4 bg-white cursor-pointer hover:bg-gray-50 transition-all duration-200"
        style={{ borderBottom: `1px solid ${themeColors.border}` }}
        onClick={() => handleToggleSite(site.site_id)}
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: themeColors.primary }}
          >
            {index + 1}
          </div>
          <div>
            <span 
              className="font-semibold text-lg"
              style={{ color: themeColors.textPrimary }}
            >
              {site.site_name}
            </span>
           <div className="flex flex-col sm:flex-row gap-4 mt-1">
              <span 
                className="text-sm flex items-center gap-1"
                style={{ color: themeColors.textSecondary }}
              >
                <FileText size={14} />
                PO: {site.po_number}
              </span>
             {site.po_date && (
                <span 
                  className="text-sm flex items-center gap-1"
                  style={{ color: themeColors.textSecondary }}
                >
                  <Calendar size={14} />
                  PO Date: {new Date(site.po_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              )}
              <span 
                className="text-sm flex items-center gap-1"
                style={{ color: themeColors.textSecondary }}
              >
                <Building2 size={14} />
                Cost Center: {site.project_name}
              </span>
            </div>
          </div>
        </div>
        <button 
          className="p-2 rounded-lg transition-colors duration-200"
          style={{ backgroundColor: themeColors.lightBorder, ':hover': { backgroundColor: themeColors.lightBg } }}
        >
          {isExpanded ? (
            <ChevronUp 
              className="w-6 h-6"
              style={{ color: themeColors.textSecondary }}
            />
          ) : (
            <ChevronDown 
              className="w-6 h-6"
              style={{ color: themeColors.textSecondary }}
            />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Site Details Section */}
          <div 
            className="p-6 rounded-xl border"
            style={{ 
              backgroundColor: themeColors.lightBg,
              borderColor: themeColors.border 
            }}
          >
            {isEditing ? (
              <SiteDetailsForm
                editSiteData={editSiteData}
                handleEditSiteChange={handleEditSiteChange}
                handleDropdownChange={handleDropdownChange}
                inchargeTypes={inchargeTypes}
                locations={locations}
                reckonerTypes={reckonerTypes}
                loading={loading}
                handleUpdateSite={handleUpdateSite}
                siteId={site.site_id}
                setEditingSiteId={setEditingSiteId}
              />
            ) : (
              <SiteDetailsDisplay
                site={site}
                handleEditSite={handleEditSite}
              />
            )}
          </div>

          {/* Work Descriptions Section */}
          <WorkDescriptionsSection
            site={site}
            siteReckonerData={siteReckonerData}
            creatingReckonerSiteId={creatingReckonerSiteId}
            handleCreateReckoner={handleCreateReckoner}
          >
            {children}
          </WorkDescriptionsSection>
        </div>
      )}
    </div>
  );
};

export default SiteCard;
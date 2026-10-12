// src/components/POComponents/SitesList.jsx
import React from "react";
import { MapPin } from "lucide-react";
import SiteCard from "./SiteCard";

const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d', // Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
};

const SitesList = ({
  selectedCompanyId,
  sites,
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
  if (!selectedCompanyId || sites.length === 0) {
    return null;
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border p-6" 
      style={{ borderColor: themeColors.border, backgroundColor: '#ffffff' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div 
          className=" rounded-lg"
        >
          <MapPin className="w-6 h-6 text-[#1e7a6f]" />
        </div>
        <div className="flex gap-3 items-center">
          <div>
            <h2 
            className="text-2xl font-bold"
            style={{ color: themeColors.textPrimary }}
            >
              Sites for Selected Client
            </h2>
          </div>
          
          <div 
            className="px-2 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: themeColors.lightBorder,
              color: themeColors.textSecondary 
            }}
          >
            {sites.length} sites
          </div>
        </div>
      </div>

      {/* Sites List */}
      <div className="space-y-4">
        {sites.map((site, index) => (
          <SiteCard
            key={site.site_id}
            site={site}
            index={index}
            expandedSite={expandedSite}
            handleToggleSite={handleToggleSite}
            editingSiteId={editingSiteId}
            editSiteData={editSiteData}
            handleEditSiteChange={handleEditSiteChange}
            handleDropdownChange={handleDropdownChange}
            inchargeTypes={inchargeTypes}
            locations={locations}
            reckonerTypes={reckonerTypes}
            loading={loading}
            handleUpdateSite={handleUpdateSite}
            setEditingSiteId={setEditingSiteId}
            handleEditSite={handleEditSite}
            siteReckonerData={siteReckonerData}
            creatingReckonerSiteId={creatingReckonerSiteId}
            handleCreateReckoner={handleCreateReckoner}
          >
            {children}
          </SiteCard>
        ))}
      </div>
    </div>
  );
};

export default SitesList;
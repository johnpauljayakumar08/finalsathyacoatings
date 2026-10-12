import { API_BASE_URL } from "../../config/api.js";
// src/components/POComponents/SiteDetailsDisplay.jsx
import React from "react";
import { Building2, FileText, Calendar, User, MapPin, Settings, Edit } from "lucide-react";

const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d', // Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
};

const SiteDetailsDisplay = ({ site, handleEditSite }) => {
  const siteInfo = [
    { label: "PO Type", value: site.type_name || "N/A", icon: Settings },
    { label: "PO Number", value: site.po_number, icon: FileText },
    { label: "PO Date", value: site.po_date ? new Date(site.po_date).toLocaleDateString() : "N/A", icon: Calendar },
    { label: "Site Name", value: site.site_name, icon: Building2 },
    { label: "Location", value: site.location_name || "N/A", icon: MapPin },
    { label: "Start Date", value: site.start_date ? new Date(site.start_date).toLocaleDateString() : "N/A", icon: Calendar },
    { label: "End Date", value: site.end_date ? new Date(site.end_date).toLocaleDateString() : "N/A", icon: Calendar },
    { label: `${API_BASE_URL}`, value: site.incharge_type || "N/A", icon: User },
    
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div 
            className="rounded-lg"
            // style={{ backgroundColor: themeColors.primary }}
          >
            <Building2 className="w-6 h-6 text-[#1e7a6f]" />
          </div>
          <h3 
            className="text-lg font-semibold"
            style={{ color: themeColors.textPrimary }}
          >
            Site Details
          </h3>
        </div>
        <button
          onClick={() => handleEditSite(site.site_id)}
          className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2"
          style={{ 
            backgroundColor: themeColors.primary,
            ringColor: themeColors.accent 
          }}
        >
          <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          Edit Site Details
        </button>
      </div>

      {/* Site Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {siteInfo.map((item, idx) => (
          <div 
            key={idx} 
            className="bg-white p-4 rounded-lg border"
            style={{ borderColor: themeColors.border }}
          >
            <div 
              className="flex items-center gap-2 text-xs uppercase tracking-wide font-medium mb-2"
              style={{ color: themeColors.textSecondary }}
            >
              <item.icon size={12} />
              {item.label}
            </div>
            <div 
              className="font-medium text-sm"
              style={{ color: themeColors.textPrimary }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteDetailsDisplay;
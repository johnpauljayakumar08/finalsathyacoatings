// src/components/POComponents/WorkDescriptionsSection.jsx
import React from "react";
import { FileText, Plus, X } from "lucide-react";

const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d', // Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
};

const WorkDescriptionsSection = ({ 
  site, 
  siteReckonerData, 
  creatingReckonerSiteId, 
  handleCreateReckoner, 
  children 
}) => {
  const hasSiteReckoner = siteReckonerData[site.site_id]?.length > 0;
  const isCreatingReckoner = creatingReckonerSiteId === site.site_id;

  return (
    <div 
      className="p-6 rounded-xl border"
      style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.border }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: themeColors.primary }}
        >
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h3 
          className="text-lg font-semibold"
          style={{ color: themeColors.textPrimary }}
        >
          Work Descriptions
        </h3>
      </div>

      {hasSiteReckoner ? (
        <div className="overflow-x-auto">
          <table 
            className="min-w-full bg-white rounded-lg border"
            style={{ borderColor: themeColors.border }}
          >
            <thead 
              className="border-b"
              style={{ backgroundColor: themeColors.lightBg, borderColor: themeColors.border }}
            >
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.textSecondary }}
                >
                  Category
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: themeColors.textSecondary }}
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody 
              className="divide-y"
              style={{ divideColor: themeColors.lightBorder }}
            >
              {siteReckonerData[site.site_id].map((item, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    style={{ color: themeColors.textPrimary }}
                  >
                    {item.category_name}
                  </td>
                  <td 
                    className="px-6 py-4 whitespace-nowrap text-sm"
                    style={{ color: themeColors.textSecondary }}
                  >
                    {item.desc_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isCreatingReckoner ? (
        <div 
          className="bg-white rounded-lg p-6 border"
          style={{ borderColor: themeColors.border }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="rounded-lg"
              // style={{ backgroundColor: themeColors.primary }}
            >
              <Plus className="w-6 h-6 text-[#1e7a6f]" />
            </div>
            <h4 
              className="text-lg font-semibold"
              style={{ color: themeColors.textPrimary }}
            >
              Create Reckoner for {site.site_name}
            </h4>
          </div>
          {children}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: themeColors.lightBorder }}
          >
            <X 
              className="w-6 h-6"
              style={{ color: themeColors.textSecondary }}
            />
          </div>
          <p 
            className="text-sm font-medium"
            style={{ color: themeColors.textSecondary }}
          >
            Reckoner Not Created
          </p>
          <button
            onClick={() => handleCreateReckoner(site.site_id)}
            className="group flex items-center gap-2 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: themeColors.primary,
              ringColor: themeColors.accent 
            }}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            Create Reckoner
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkDescriptionsSection;
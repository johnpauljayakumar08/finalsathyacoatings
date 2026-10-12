// src/components/POComponents/SiteDetailsForm.jsx
import React from "react";
import { Building2 } from "lucide-react";
import SearchableDropdown from "./SearchableDropdown";

const SiteDetailsForm = ({
  editSiteData,
  handleEditSiteChange,
  handleDropdownChange,
  inchargeTypes,
  locations,
  reckonerTypes,
  loading,
  handleUpdateSite,
  siteId,
  setEditingSiteId
}) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            name="site_name"
            value={editSiteData.site_name}
            onChange={handleEditSiteChange}
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-3 border text-sm bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            PO Number
          </label>
          <input
            type="text"
            name="po_number"
            value={editSiteData.po_number}
            onChange={handleEditSiteChange}
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-3 border text-sm bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formatDateForInput(editSiteData.start_date)}
            onChange={handleEditSiteChange}
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-3 border text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formatDateForInput(editSiteData.end_date)}
            onChange={handleEditSiteChange}
            className="w-full rounded-xl border-slate-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-200 p-3 border text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Incharge Type
          </label>
          <SearchableDropdown
            options={inchargeTypes}
            value={editSiteData.incharge_type}
            onChange={(value, id) =>
              handleDropdownChange("incharge_type", "incharge_id", value, id)
            }
            placeholder="Select incharge type"
            disabled={loading.inchargeTypes}
            isLoading={loading.inchargeTypes}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Location
          </label>
          <SearchableDropdown
            options={locations}
            value={editSiteData.location_name}
            onChange={(value, id) =>
              handleDropdownChange("location_name", "location_id", value, id)
            }
            placeholder="Select location"
            disabled={loading.locations}
            isLoading={loading.locations}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            PO Type
          </label>
          <SearchableDropdown
            options={reckonerTypes}
            value={editSiteData.type_name}
            onChange={(value, id) =>
              handleDropdownChange("type_name", "reckoner_type_id", value, id)
            }
            placeholder="Select PO type"
            disabled={loading.reckonerTypes}
            isLoading={loading.reckonerTypes}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
        <button
          onClick={() => setEditingSiteId(null)}
          className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-medium rounded-xl transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={() => handleUpdateSite(siteId)}
          className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-xl transition-colors duration-200 shadow-lg"
          disabled={loading.submitting}
        >
          {loading.submitting ? "Updating..." : "Update Site"}
        </button>
      </div>
    </div>
  );
};

export default SiteDetailsForm;
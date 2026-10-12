// src/components/POComponents/LoadingAndEmptyStates.jsx
import React from "react";
import { Building2 } from "lucide-react";

const LoadingAndEmptyStates = ({ loading, selectedCompanyId, sitesLength }) => {
  // Loading State
  if (loading.sites) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 animate-pulse"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading sites...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (selectedCompanyId && !loading.sites && sitesLength === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-100 rounded-2xl">
            <Building2 className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-slate-800 font-semibold text-lg">No sites found</h3>
          <p className="text-slate-600 text-center">
            No sites available for the selected client. Create a new site to get started.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingAndEmptyStates;
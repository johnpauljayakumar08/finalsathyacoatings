
import React, { useState } from 'react';
import { Plus, Users, X } from 'lucide-react';
import ViewCreditors from '../../components/FinanceComponents/Creditors/ViewCreditors';
import CreateCreditors from '../../components/FinanceComponents/Creditors/CreateCreditors';

// Exact same theme as SupplyClientMasterCreation
const themeColors = {
  primary: '#1e7a6f',    // Dark Teal
  accent: '#c79100',      // Gold/Amber
  lightBg: '#f8f9fa',    // Very light gray for page background
  textPrimary: '#212529', // Dark charcoal for text
  textSecondary: '#6c757d',// Gray for secondary text
  border: '#dee2e6',      // Neutral border color
  lightBorder: '#e9ecef', // Lighter border for internal elements
};

const Creditors = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Creditors Management
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Manage and track all your creditors efficiently.
                </p>
              </div>
            </div>

            <button
              onClick={toggleCreateForm}
              className="group flex items-center gap-2.5 text-white px-6 py-3 rounded-lg shadow-sm font-medium transition-all duration-200 transform hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: showCreateForm ? '#dc3545' : themeColors.primary,
                ringColor: themeColors.accent
              }}
            >
              {showCreateForm ? (
                <>
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                  Hide Create Form
                </>
              ) : (
                <>
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                  Create New Creditor
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Creditors Section */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
          <div className="p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
            <h2 className="text-lg font-semibold" style={{ color: themeColors.textPrimary }}>
              All Creditors
            </h2>
            <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
              View and manage existing creditor records
            </p>
          </div>
          <div className="p-6">
            <ViewCreditors />
          </div>
        </div>

        {/* Create Creditor Form - Full Overlay Modal Style (Same as Supply Client Modal) */}
        {showCreateForm && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={toggleCreateForm}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border overflow-hidden"
              style={{ borderColor: themeColors.border }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
                <h3 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Create New Creditor
                </h3>
                <button
                  onClick={toggleCreateForm}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  <X size={20} style={{ color: themeColors.textSecondary }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <CreateCreditors onSuccess={() => setShowCreateForm(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Creditors;
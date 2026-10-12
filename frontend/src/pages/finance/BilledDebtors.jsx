import React, { useState } from 'react';
import ViewBilledDebtors from '../../components/FinanceComponents/BilledDebtors/ViewBilledDebtors';
import CreateBilledDebtors from '../../components/FinanceComponents/BilledDebtors/CreateBilledDebtors';
import { Plus, Building2 } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const BilledDebtors = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  const handleRefresh = () => setRefreshList(prev => prev + 1);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                  Billed Debtors Receivables
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Manage your receivable entries
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 disabled:opacity-50"
              style={{ backgroundColor: themeColors.primary, '--tw-ring-color': themeColors.primary }}
            >
              <Plus size={20} />
              Create New Record
            </button>
          </div>
        </div>

        <ViewBilledDebtors key={refreshList} />
{showCreateModal && (
  <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
      <CreateBilledDebtors onClose={() => setShowCreateModal(false)} onSuccess={handleRefresh} />
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default BilledDebtors;
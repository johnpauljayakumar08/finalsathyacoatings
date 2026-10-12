import React, { useState, useEffect } from 'react';
import CreditorsTable from '../../components/FinanceComponents/TopSheet/CreditorsTable';
import PayablesTable from '../../components/FinanceComponents/TopSheet/PayablesTable';
import ReceivablesTable from '../../components/FinanceComponents/TopSheet/ReceivablesTable';
import { Receipt, CreditCard, HandCoins, FileSpreadsheet } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const tabs = [
  { id: 'receivables', label: 'Receivables', icon: Receipt, color: 'emerald' },
  { id: 'creditors', label: 'Creditors', icon: CreditCard, color: 'red' },
  { id: 'payables', label: 'Payables', icon: HandCoins, color: 'amber' },
];

const TopSheet = () => {
  const [activeTab, setActiveTab] = useState('receivables');

  // State to hold live totals from child components
  const [totals, setTotals] = useState({
    receivables: 0,
    creditors: 0,
    payables: 0
  });

  // Callback to receive total from each table component
  const updateTotal = (type, amount) => {
    setTotals(prev => ({ ...prev, [type]: amount }));
  };

  const formatINR = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const activeComponent = {
    receivables: <ReceivablesTable onTotalCalculated={(amt) => updateTotal('receivables', amt)} />,
    creditors: <CreditorsTable onTotalCalculated={(amt) => updateTotal('creditors', amt)} />,
    payables: <PayablesTable onTotalCalculated={(amt) => updateTotal('payables', amt)} />,
  }[activeTab];

  const activeTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Clean Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: themeColors.primary }}>
              <FileSpreadsheet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
              Financial Top Sheet
            </h1>
          </div>
        </div>

        {/* Compact & Beautiful Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2.5 px-7 py-3.5 font-medium text-base transition-all duration-200
                    ${isActive 
                      ? 'text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                    ${index === 0 ? 'rounded-l-xl' : ''}
                    ${index === tabs.length - 1 ? 'rounded-r-xl' : ''}
                  `}
                  style={{
                    backgroundColor: isActive ? themeColors.primary : 'white',
                  }}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Total Amount Bar - Always Visible */}
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-wider font-medium" style={{ color: themeColors.textSecondary }}>
            {activeTab === 'receivables'}
            {activeTab === 'creditors' }
            {activeTab === 'payables' }
          </p>
       
        </div>

        {/* Active Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
          <div className="p-6 border-b flex items-center gap-4" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
            <div className={`p-3 rounded-lg bg-${activeTabInfo.color}-100`}>
              <activeTabInfo.icon size={28} className={`text-${activeTabInfo.color}-700`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
                {activeTabInfo.label}
              </h2>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                {activeTab === 'receivables' && 'Money owed to you by clients'}
                {activeTab === 'creditors' && 'Money you owe to suppliers'}
                {activeTab === 'payables' && 'Internal liabilities & expenses'}
              </p>
            </div>
          </div>

          <div className="p-6">
            {activeComponent}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TopSheet;
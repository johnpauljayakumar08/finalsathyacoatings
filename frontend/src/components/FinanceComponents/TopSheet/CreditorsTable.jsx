import { API_BASE_URL } from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { DollarSign, Percent, FileText } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const CreditorsTable = ({ onTotalCalculated }) => {
  const [balanceData, setBalanceData] = useState({
    gst_creditors_balance: 0,
    other_creditors_balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/finance/overall-creditors-balance`);
        const result = await response.json();

        if (result.status === 'success' && result.data) {
          const gst = Number(result.data.gst_creditors_balance || 0);
          const other = Number(result.data.other_creditors_balance || 0);
          setBalanceData({ gst_creditors_balance: gst, other_creditors_balance: other });
        }
      } catch (err) {
        setError('Failed to fetch creditors balance');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  // Calculate total safely
  const totalCreditors = Number(balanceData.gst_creditors_balance || 0) + Number(balanceData.other_creditors_balance || 0);

  // Send total to parent (TopSheet)
  useEffect(() => {
    if (onTotalCalculated) {
      onTotalCalculated(totalCreditors);
    }
  }, [totalCreditors, onTotalCalculated]);

  const formatINR = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const items = [
    { label: 'GST Creditors', amount: balanceData.gst_creditors_balance, icon: Percent, color: 'emerald' },
    { label: 'Other Creditors', amount: balanceData.other_creditors_balance, icon: FileText, color: 'amber' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-t-4"
             style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}>
        </div>
        <p className="mt-4 text-sm font-medium" style={{ color: themeColors.textSecondary }}>
          Loading creditors...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-3 text-red-600">
          <div className="p-3 bg-red-50 rounded-lg">
            <FileText className="w-8 h-8" />
          </div>
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
      {/* Header with Total */}
      <div className="p-6 border-b" style={{ borderColor: themeColors.lightBorder, backgroundColor: themeColors.lightBg }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>
                Creditors Summary
              </h2>
              <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                Total amount payable to suppliers
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wider font-medium" style={{ color: themeColors.textSecondary }}>
              Total Creditors
            </p>
            <p className={`text-3xl font-bold mt-1 ${totalCreditors > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatINR(totalCreditors)}
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-${item.color}-100`}>
                    <Icon size={26} className={`text-${item.color}-700`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: themeColors.textPrimary }}>
                      {item.label}
                    </h3>
                    <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                      {item.amount === 0 ? 'All cleared' : 'Pending payment'}
                    </p>
                  </div>
                </div>
                <p className={`text-2xl font-bold ${item.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatINR(item.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreditorsTable;
import { API_BASE_URL } from "../../../config/api.js";
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Building2, Edit2, Plus, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

const getAuthConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
});

const BankDetails = () => {
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const canManageBanks = ['md', 'managing_director', 'managingdirector']
    .includes(String(user.role || '').replace(/[\s-]/g, '').toLowerCase());
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState({ bank_name: '', opening_balance: '' });

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/finance/bank-details`, getAuthConfig());
      setBanks(response.data.data);
    } catch (error) {
      console.error('Failed to load bank details:', error);
      toast.error(error.response?.data?.message || 'Failed to load bank details');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const resetForm = () => {
    setEditingBank(null);
    setFormData({ bank_name: '', opening_balance: '' });
  };

  const startEdit = (bank) => {
    setEditingBank(bank);
    setFormData({
      bank_name: bank.bank_name,
      opening_balance: String(bank.opening_balance ?? 0)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const bankName = formData.bank_name.trim();
    const openingBalance = Number(formData.opening_balance);
    if (!bankName || bankName.length > 200 || formData.opening_balance === '' || !Number.isFinite(openingBalance)) {
      toast.error('Enter a bank name (up to 200 characters) and a valid opening balance');
      return;
    }

    setSaving(true);
    try {
      const config = getAuthConfig();
      const payload = { bank_name: bankName, opening_balance: openingBalance };
      if (editingBank) {
        await axios.put(`${API_BASE_URL}/finance/bank-details/${editingBank.id}`, payload, config);
        toast.success('Bank details updated');
      } else {
        await axios.post(`${API_BASE_URL}/finance/bank-details`, payload, config);
        toast.success('Bank details added');
      }
      resetForm();
      await fetchBanks();
    } catch (error) {
      console.error('Failed to save bank details:', error);
      toast.error(error.response?.data?.message || 'Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  const formatINR = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const totalOpeningBalance = banks.reduce((total, bank) => total + Number(bank.opening_balance || 0), 0);
  const totalAvailableBalance = banks.reduce((total, bank) => total + Number(bank.available_balance || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center gap-3 rounded-xl border bg-white p-5 shadow-sm">
          <div className="rounded-lg bg-teal-700 p-3 text-white">
            <Building2 size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bank Details</h1>
            <p className="text-sm text-gray-600">Bank names and opening balances</p>
          </div>
        </header>

        {canManageBanks && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editingBank ? 'Update Bank Details' : 'Add Bank'}
            </h2>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <label className="text-sm font-medium text-gray-700">
                Bank Name
                <input
                  value={formData.bank_name}
                  onChange={(event) => setFormData({ ...formData, bank_name: event.target.value })}
                  maxLength={200}
                  required
                  className="mt-1 w-full rounded-lg border px-3 py-2 font-normal"
                  placeholder="Enter bank name"
                />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Opening Balance
                <input
                  type="number"
                  step="0.01"
                  value={formData.opening_balance}
                  onChange={(event) => setFormData({ ...formData, opening_balance: event.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border px-3 py-2 font-normal"
                  placeholder="0.00"
                />
              </label>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {editingBank ? <Save size={17} /> : <Plus size={17} />}
                  {saving ? 'Saving...' : editingBank ? 'Save' : 'Add Bank'}
                </button>
                {editingBank && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <X size={17} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-semibold text-gray-800">Bank Accounts</h2>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div><span className="text-gray-500">Opening Balance Total</span><div className="font-semibold text-gray-900">{formatINR(totalOpeningBalance)}</div></div>
                <div><span className="text-gray-500">Total Balance</span><div className="font-semibold text-teal-800">{formatINR(totalAvailableBalance)}</div></div>
              </div>
            </div>
          </div>
          {loading ? (
            <p className="p-10 text-center text-gray-500">Loading bank details...</p>
          ) : banks.length === 0 ? (
            <p className="p-10 text-center text-gray-500">No bank details found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Bank Name</th>
                    <th className="px-5 py-3 text-right">Opening Balance</th>
                    <th className="px-5 py-3 text-right">Available Balance</th>
                    {canManageBanks && <th className="px-5 py-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {banks.map((bank) => (
                    <tr key={bank.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-800">{bank.bank_name}</td>
                      <td className="px-5 py-4 text-right font-medium text-teal-800">
                        {formatINR(bank.opening_balance)}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-teal-800">
                        {formatINR(bank.available_balance)}
                      </td>
                      {canManageBanks && (
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => startEdit(bank)}
                            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm text-teal-800 hover:bg-teal-50"
                          >
                            <Edit2 size={15} />
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {!canManageBanks && (
          <p className="mt-3 text-sm text-gray-500">You have view-only access to bank details.</p>
        )}
      </div>
    </div>
  );
};

export default BankDetails;

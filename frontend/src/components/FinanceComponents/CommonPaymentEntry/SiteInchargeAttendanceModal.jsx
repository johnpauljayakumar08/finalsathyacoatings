import { API_BASE_URL } from "../../../config/api.js";
// components/FinanceComponents/CommonPaymentEntry/SiteInchargeAttendanceModal.jsx
import React, { useState, useEffect } from 'react';
import { Building2, Calendar, User, Edit, Check, X, History, Search } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
  lightBg: '#f8f9fa',
};

const SiteInchargeAttendanceModal = ({ onClose, createdBy }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState({});
  const [existingAttendances, setExistingAttendances] = useState({});
  const [isEditing, setIsEditing] = useState({});
  const [historyModal, setHistoryModal] = useState({ open: false, data: [], assignId: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/finance/companies-with-projects`)
      .then(res => res.json())
      .then(({ status, data }) => {
        if (status === 'success') {
          setCompanies(data);
          if (data.length > 0) setSelectedCompany(data[0].company_id);
        }
      })
      .catch(() => setError('Failed to load companies'));
  }, []);

  useEffect(() => {
    const company = companies.find(c => c.company_id === selectedCompany);
    if (company?.projects?.length > 0 && !selectedProject) {
      setSelectedProject(company.projects[0].pd_id);
    }
  }, [selectedCompany, companies]);

  useEffect(() => {
    if (!selectedProject) {
      setData([]); setLoading(false); return;
    }

    setLoading(true);
    fetch(`${API_BASE_URL}/finance/site-incharges?pd_id=${selectedProject}`)
      .then(res => res.json())
      .then(({ status, data: fetchedData }) => {
        if (status === 'success') {
          setData(fetchedData);
          const initAtt = {}, initEdit = {};
          fetchedData.forEach(item => {
            initAtt[item.id] = { shift: '', remarks: '' };
            initEdit[item.id] = true;
          });
          setAttendances(initAtt);
          setIsEditing(initEdit);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedProject || !selectedDate) return;
    fetch(`${API_BASE_URL}/finance/siteincharge-attendance?pd_id=${selectedProject}&entry_date=${selectedDate}`)
      .then(res => res.json())
      .then(({ status, data }) => {
        if (status === 'success') {
          const map = {};
          data.forEach(att => {
            map[att.siteincharge_assign_id] = { shift: att.shift || '', remarks: att.remarks || '' };
          });
          setExistingAttendances(map);
          setAttendances(prev => ({ ...prev, ...map }));
          setIsEditing(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(id => { updated[id] = !map[id]; });
            return updated;
          });
        }
      });
  }, [selectedDate, selectedProject]);

  const handleShiftChange = (id, value) => setAttendances(prev => ({ ...prev, [id]: { ...prev[id], shift: value } }));
  const handleRemarksChange = (id, value) => setAttendances(prev => ({ ...prev, [id]: { ...prev[id], remarks: value } }));

  const toggleEdit = (id) => setIsEditing(prev => ({ ...prev, [id]: !prev[id] }));
  const cancelEdit = (id) => {
    const existing = existingAttendances[id];
    if (existing) {
      setAttendances(prev => ({ ...prev, [id]: { ...existing } }));
      setIsEditing(prev => ({ ...prev, [id]: false }));
    }
  };

  const saveEdit = async (id) => {
    const { shift, remarks } = attendances[id] || {};
    if (!shift?.trim()) return alert('Shift is required');

    try {
      const res = await fetch(`${API_BASE_URL}/finance/siteincharge-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendances: [{ siteincharge_assign_id: id, shift: shift.trim(), entry_date: selectedDate, remarks: remarks?.trim() || '' }],
          created_by: createdBy
        })
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert('Attendance saved!');
        setExistingAttendances(prev => ({ ...prev, [id]: { shift: shift.trim(), remarks: remarks?.trim() || '' } }));
        setIsEditing(prev => ({ ...prev, [id]: false }));
      }
    } catch { alert('Failed to save'); }
  };

  const viewHistory = async (assignId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/siteincharge-attendance-history?siteincharge_assign_id=${assignId}`);
      const { status, data } = await res.json();
      if (status === 'success' && data.length > 0) {
        setHistoryModal({ open: true, data, assignId });
      } else {
        alert('No history found');
      }
    } catch { alert('Failed to load history'); }
  };

  const filteredData = data.filter(item => item.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentCompany = companies.find(c => c.company_id === selectedCompany);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border max-w-7xl w-full max-h-[95vh] overflow-hidden" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center" style={{ borderColor: themeColors.lightBorder }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: themeColors.textPrimary }}>Site Incharge Daily Attendance</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition">
            <X size={28} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2"><Building2 size={16} className="inline mr-2" />Company</label>
                <select value={selectedCompany} onChange={(e) => { setSelectedCompany(e.target.value); setSelectedProject(''); }}
                  className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
                  <option value="">Select Company</option>
                  {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Project</label>
                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} disabled={!selectedCompany}
                  className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 disabled:bg-gray-100"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}>
                  <option value="">Select Project</option>
                  {currentCompany?.projects?.map(p => <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2"><Calendar size={16} className="inline mr-2" />Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
              </div>
            </div>
          </div>

          {/* Search */}
          {selectedProject && (
            <div className="mb-6 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search incharge..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: themeColors.border }}>
            {loading ? (
              <div className="p-20 text-center">Loading...</div>
            ) : !selectedProject ? (
              <div className="p-12 text-center text-gray-500">Please select a project</div>
            ) : filteredData.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No site incharges found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: themeColors.lightBg }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">From</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">To</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Shift</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Remarks</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredData.map(item => {
                      const att = attendances[item.id] || { shift: '', remarks: '' };
                      const editing = isEditing[item.id];
                      const hasHistory = !!existingAttendances[item.id];

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{item.full_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.from_date).toLocaleDateString('en-IN')}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{new Date(item.to_date).toLocaleDateString('en-IN')}</td>
                          <td className="px-6 py-4">
                            {editing ? (
                              <input type="text" value={att.shift} onChange={(e) => handleShiftChange(item.id, e.target.value)}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
                            ) : (
                              <span className={att.shift ? 'font-medium' : 'text-gray-400'}>{att.shift || 'Not Marked'}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editing ? (
                              <textarea value={att.remarks} onChange={(e) => handleRemarksChange(item.id, e.target.value)} rows={2}
                                className="w-full px-3 py-2 border rounded resize-none focus:outline-none focus:ring-2"
                                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }} />
                            ) : (
                              <span className="text-gray-700">{att.remarks || '-'}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {editing ? (
                              <div className="flex justify-center gap-3">
                                <button onClick={() => saveEdit(item.id)} className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"><Check size={18} /></button>
                                <button onClick={() => cancelEdit(item.id)} className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"><X size={18} /></button>
                              </div>
                            ) : (
                              <div className="flex justify-center gap-3">
                                <button onClick={() => toggleEdit(item.id)} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><Edit size={18} /></button>
                                {hasHistory && <button onClick={() => viewHistory(item.id)} className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"><History size={18} /></button>}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteInchargeAttendanceModal;
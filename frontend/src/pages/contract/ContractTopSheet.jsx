import { API_BASE_URL } from "../../config/api.js";
// src/pages/contract/ContractTopSheet.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

const ContractTopSheet = () => {
  // Filter States
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedDescription, setSelectedDescription] = useState(null);

  // Data States
  const [tableData, setTableData] = useState([]);
  const [grandTotalPO, setGrandTotalPO] = useState(0);
  const [grandTotalCompleted, setGrandTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch filter options
  useEffect(() => {
    axios.get(`${API_BASE_URL}/admin/companies`)
      .then(res => {
        const formatted = (res.data.data || []).map(c => ({
          value: c.company_id,
          label: c.company_name || c.company_id
        }));
        setCompanies(formatted);
      })
      .catch(err => console.error("Failed to load companies", err));
  }, []);

  useEffect(() => {
    if (!selectedCompany) {
      setProjects([]);
      setSelectedProject(null);
      return;
    }
    axios.get(`${API_BASE_URL}/admin/projects/${selectedCompany.value}`)
      .then(res => {
        const formatted = (res.data.data || []).map(p => ({
          value: p.pd_id,
          label: p.project_name
        }));
        setProjects(formatted);
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [selectedCompany]);

  useEffect(() => {
    if (!selectedProject) {
      setSites([]);
      setSelectedSite(null);
      return;
    }
    axios.get(`${API_BASE_URL}/admin/sites/${selectedProject.value}`)
      .then(res => {
        const formatted = (res.data.data || []).map(s => ({
          value: s.site_id,
          label: `${s.site_name} (PO: ${s.po_number || 'N/A'})`
        }));
        setSites(formatted);
      })
      .catch(err => console.error("Failed to load sites", err));
  }, [selectedProject]);

  useEffect(() => {
    if (!selectedSite) {
      setWorkDescriptions([]);
      setSelectedDescription(null);
      return;
    }
    axios.get(`${API_BASE_URL}/admin/work-descriptions/${selectedSite.value}`)
      .then(res => {
        const formatted = (res.data.data || []).map(d => ({
          value: d.desc_id,
          label: d.desc_name
        }));
        setWorkDescriptions(formatted);
      })
      .catch(err => console.error("Failed to load descriptions", err));
  }, [selectedSite]);

  // Fetch Table Data (No deduplication - show all rows)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `${API_BASE_URL}/admin/top-sheet-overall`;
        const params = new URLSearchParams();

        if (selectedCompany) params.append('company_id', selectedCompany.value);
        if (selectedProject) params.append('project_id', selectedProject.value);
        if (selectedSite) params.append('site_id', selectedSite.value);
        if (selectedDescription) params.append('desc_id', selectedDescription.value);

        if (params.toString()) url += `?${params.toString()}`;

        const res = await axios.get(url);

        if (res.data.success) {
          const records = res.data.data.records || [];
          setTableData(records);

          // Calculate grand totals from all records
          const totalPO = records.reduce((sum, row) => sum + Number(row.po_value || 0), 0);
          const totalCompleted = records.reduce((sum, row) => sum + Number(row.completed_value || 0), 0);

          setGrandTotalPO(totalPO);
          setGrandTotalCompleted(totalCompleted);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, selectedProject, selectedSite, selectedDescription]);

  const formatINR = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (perc) => {
    const num = Number(perc) || 0;
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Contract Top Sheet - Overall View</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Company</label>
              <Select 
                options={companies} 
                value={selectedCompany} 
                onChange={setSelectedCompany} 
                placeholder="All Companies" 
                isClearable 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Project</label>
              <Select 
                options={projects} 
                value={selectedProject} 
                onChange={setSelectedProject} 
                placeholder="All Projects" 
                isClearable 
                isDisabled={!selectedCompany} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Site</label>
              <Select 
                options={sites} 
                value={selectedSite} 
                onChange={setSelectedSite} 
                placeholder="All Sites" 
                isClearable 
                isDisabled={!selectedProject} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Work Description</label>
              <Select 
                options={workDescriptions} 
                value={selectedDescription} 
                onChange={setSelectedDescription} 
                placeholder="All Descriptions" 
                isClearable 
                isDisabled={!selectedSite} 
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left">Company</th>
                  <th className="px-6 py-4 text-left">Project</th>
                  <th className="px-6 py-4 text-left">Site</th>
                  <th className="px-6 py-4 text-left">PO Number</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Subcategory</th>
                  <th className="px-6 py-4 text-left">Work Description</th>
                  <th className="px-6 py-4 text-right">PO Quantity</th>
                  <th className="px-6 py-4 text-right">Rate</th>
                  <th className="px-6 py-4 text-right">PO Value</th>
                  <th className="px-6 py-4 text-right">Completed Area</th>
                  <th className="px-6 py-4 text-right">Completed Value</th>
                  <th className="px-6 py-4 text-right">Completion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="13" className="text-center py-12 text-gray-500">Loading data...</td></tr>
                ) : tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{row.company_name}</td>
                      <td className="px-6 py-4">{row.project_name}</td>
                      <td className="px-6 py-4">{row.site_name}</td>
                      <td className="px-6 py-4">{row.po_number || '—'}</td>
                      <td className="px-6 py-4">{row.category_name || '—'}</td>
                      <td className="px-6 py-4">{row.subcategory_name || '—'}</td>
                      <td className="px-6 py-4">{row.desc_name}</td>
                      <td className="px-6 py-4 text-right font-medium">{Number(row.po_quantity || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">{formatINR(row.rate)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {formatINR(row.po_value)}
                      </td>
                      <td className="px-6 py-4 text-right">{Number(row.completed_area || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-semibold text-blue-600">
                        {formatINR(row.completed_value)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600">
                        {formatPercentage(row.completion_percentage)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="px-6 py-16 text-center text-gray-500">
                      No records found for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total Footer */}
          <div className="bg-gray-100 px-8 py-5 border-t flex justify-between items-center font-bold text-lg">
            <span>Grand Total PO Value</span>
            <span className="text-green-600">{formatINR(grandTotalPO)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTopSheet;
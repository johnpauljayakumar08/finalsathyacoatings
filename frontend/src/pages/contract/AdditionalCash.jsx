import { API_BASE_URL } from "../../config/api.js";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { DiamondPlus, X } from "lucide-react";
import { parseISO, format } from "date-fns";

const AdditionalCash = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [pettyCashRecords, setPettyCashRecords] = useState([]);
  const [formData, setFormData] = useState({
    company_id: "",
    pd_id: "",
    site_id: "",
    desc_id: "",
    assign_date: "",
    amount: "",
  });
  const [loading, setLoading] = useState({
    companies: false,
    projects: false,
    workDescriptions: false,
    pettyCash: false,
    submitting: false,
  });
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading((prev) => ({ ...prev, companies: true }));
        const response = await axios.get(`${API_BASE_URL}/project/companies`);
        setCompanies(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to load companies. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, companies: false }));
      }
    };
    fetchCompanies();
  }, []);

  // Fetch projects with sites on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading((prev) => ({ ...prev, projects: true }));
        const response = await axios.get(`${API_BASE_URL}/project/projects-with-sites`);
        setAllProjects(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, projects: false }));
      }
    };
    fetchProjects();
  }, []);

  // Filter projects when company_id changes
  useEffect(() => {
    if (formData.company_id) {
      const filteredProjects = allProjects.filter((p) => p.company_id === formData.company_id);
      setProjects(filteredProjects);
    } else {
      setProjects([]);
    }
    setSites([]);
    setWorkDescriptions([]);
    setFormData((prev) => ({ ...prev, pd_id: "", site_id: "", desc_id: "" }));
  }, [formData.company_id, allProjects]);

  // Set sites when pd_id changes
  useEffect(() => {
    if (formData.pd_id) {
      const selectedProject = allProjects.find((p) => p.project_id === formData.pd_id);
      const projectSites = selectedProject && Array.isArray(selectedProject.sites) ? selectedProject.sites : [];
      setSites(projectSites);
    } else {
      setSites([]);
    }
    setWorkDescriptions([]);
    setFormData((prev) => ({ ...prev, site_id: "", desc_id: "" }));
  }, [formData.pd_id, allProjects]);

  // Fetch work descriptions when site_id changes
  useEffect(() => {
    if (formData.site_id) {
      const fetchWorkDescriptions = async () => {
        try {
          setLoading((prev) => ({ ...prev, workDescriptions: true }));
          const response = await axios.get(`${API_BASE_URL}/expense/work-descriptions/${formData.site_id}`);
          const descs = Array.isArray(response.data.data) ? response.data.data : [];
          // Deduplicate by desc_id
          const uniqueDescs = Array.from(new Map(descs.map((desc) => [desc.desc_id, desc])).values());
          setWorkDescriptions(uniqueDescs);
        } catch (error) {
          console.error("Error fetching work descriptions:", error);
          setError("Failed to load work descriptions. Please try again.");
          setWorkDescriptions([]);
        } finally {
          setLoading((prev) => ({ ...prev, workDescriptions: false }));
        }
      };
      fetchWorkDescriptions();
    } else {
      setWorkDescriptions([]);
      setFormData((prev) => ({ ...prev, desc_id: "" }));
    }
  }, [formData.site_id]);

  // Fetch petty cash records
  useEffect(() => {
    const fetchPettyCash = async () => {
      try {
        setLoading((prev) => ({ ...prev, pettyCash: true }));
        const response = await axios.get(`${API_BASE_URL}/expense/fetch-petty-cash`);
        const records = Array.isArray(response.data.data)
          ? response.data.data.map((record) => ({
              ...record,
              amount: parseFloat(record.amount),
              assign_date: format(parseISO(record.assign_date), "yyyy-MM-dd"),
            }))
          : [];
        setPettyCashRecords(records);
      } catch (error) {
        console.error("Error fetching petty cash:", error);
        setError("Failed to load petty cash records. Please try again.");
      } finally {
        setLoading((prev) => ({ ...prev, pettyCash: false }));
      }
    };
    fetchPettyCash();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "company_id"
        ? { pd_id: "", site_id: "", desc_id: "" }
        : name === "pd_id"
        ? { site_id: "", desc_id: "" }
        : name === "site_id"
        ? { desc_id: "" }
        : {}),
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading((prev) => ({ ...prev, submitting: true }));
      const { pd_id, site_id, desc_id, assign_date, amount } = formData;
      if (!pd_id || !site_id || !desc_id || !assign_date || !amount) {
        throw new Error("All fields are required");
      }
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Amount must be a positive number");
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(assign_date)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/expense/add-petty-cash`,
        [{ pd_id, site_id, desc_id, assign_date, amount: parsedAmount }],
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const response = await axios.get(`${API_BASE_URL}/expense/fetch-petty-cash`);
      const records = Array.isArray(response.data.data)
        ? response.data.data.map((record) => ({
            ...record,
            amount: parseFloat(record.amount),
            assign_date: format(parseISO(record.assign_date), "yyyy-MM-dd"),
          }))
        : [];
      setPettyCashRecords(records);

      setFormData({
        company_id: "",
        pd_id: "",
        site_id: "",
        desc_id: "",
        assign_date: "",
        amount: "",
      });
      setWorkDescriptions([]);
      setIsModalOpen(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Petty cash added successfully!",
        position: "top-end",
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Error adding petty cash:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || error.message || "Failed to add petty cash",
        position: "top-end",
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      company_id: "",
      pd_id: "",
      site_id: "",
      desc_id: "",
      assign_date: "",
      amount: "",
    });
    setWorkDescriptions([]);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">Petty Cash Records</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <DiamondPlus size={18} />
          <span className="text-sm font-medium">Add Petty Cash</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {(loading.companies || loading.projects || loading.workDescriptions || loading.pettyCash) && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Records Table */}
      {pettyCashRecords.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pettyCashRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.assign_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.project_name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium">{record.site_name || "Unknown"}</div>
                      {record.po_number && (
                        <div className="text-xs text-gray-600 font-semibold mt-1">PO: {record.po_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {record.desc_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      ₹{isNaN(record.amount) ? "0.00" : record.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No petty cash records found.</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={closeModal}
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-in"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Add Petty Cash</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="company_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <select
                      id="company_id"
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={loading.submitting || loading.companies}
                      required
                    >
                      <option value="">Select a company</option>
                      {companies.map((company) => (
                        <option key={company.company_id} value={company.company_id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pd_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Center
                    </label>
                    <select
                      id="pd_id"
                      name="pd_id"
                      value={formData.pd_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={loading.submitting || loading.projects || !formData.company_id}
                      required
                    >
                      <option value="">Select a cost center</option>
                      {projects.map((project) => (
                        <option key={project.project_id} value={project.project_id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="site_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Site
                    </label>
                    <select
                      id="site_id"
                      name="site_id"
                      value={formData.site_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={loading.submitting || !formData.pd_id}
                      required
                    >
                      <option value="">Select a site</option>
                      {sites.map((site) => (
                        <option key={site.site_id} value={site.site_id}>
                          {site.site_name} {site.po_number ? `(PO: ${site.po_number})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="desc_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Work Description
                    </label>
                    <select
                      id="desc_id"
                      name="desc_id"
                      value={formData.desc_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={loading.submitting || loading.workDescriptions || !formData.site_id}
                      required
                    >
                      <option value="">Select a work description</option>
                      {workDescriptions.map((desc) => (
                        <option key={desc.desc_id} value={desc.desc_id}>
                          {desc.desc_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assign_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="assign_date"
                      name="assign_date"
                      value={formData.assign_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={loading.submitting || !formData.pd_id || !formData.site_id || !formData.desc_id}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                      disabled={loading.submitting || !formData.pd_id || !formData.site_id || !formData.desc_id}
                      required
                    />
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      disabled={loading.submitting}
                    >
                      {loading.submitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Add Record"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slide-out {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }

        .animate-slide-out {
          animation: slide-out 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default AdditionalCash;
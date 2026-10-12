import { API_BASE_URL } from "../config/api.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Filter } from "lucide-react";

const ViewAssignedIncharges = ({ selectedSite }) => {
  const [incharges, setIncharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    projectName: "",
    siteName: "",
    inchargeName: "",
  });

  // Format date to DD-MM-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Fetch assigned incharges
  const fetchAssignedIncharges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/material/assigned-incharges`);
      setIncharges(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch assigned incharge details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIncharges();
  }, []);

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Filter incharges based on filter inputs with null checks and selected site
  const filteredIncharges = incharges.filter((incharge) => {
    const projectName = incharge.project_name || "";
    const siteName = incharge.site_name || "";
    const fullName = incharge.full_name || "";
    const poNumber = incharge.po_number || "";

    const siteMatch = selectedSite?.po_number
      ? poNumber === selectedSite.po_number
      : true;

    return (
      siteMatch &&
      projectName.toLowerCase().includes(filters.projectName.toLowerCase()) &&
      siteName.toLowerCase().includes(filters.siteName.toLowerCase()) &&
      fullName.toLowerCase().includes(filters.inchargeName.toLowerCase())
    );
  });

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Assigned Incharge Details
            </h2>
            {selectedSite?.po_number && (
              <p className="text-base text-gray-600">
                Showing results for: {selectedSite.site_name} (PO: {selectedSite.po_number})
              </p>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Toggle Filters"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Section */}
        {filterOpen && (
          <div className="mb-6 p-4 bg-white border border-gray-200">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Filter Incharges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  name="projectName"
                  value={filters.projectName}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={filters.siteName}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Incharge Name
                </label>
                <input
                  type="text"
                  name="inchargeName"
                  value={filters.inchargeName}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                  placeholder="Enter incharge name"
                />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-6 w-6 text-gray-600 animate-spin mb-2" />
              <p className="text-base text-gray-600">Loading incharge details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-base text-red-700">
            {error}
          </div>
        ) : filteredIncharges.length === 0 ? (
          <div className="text-center py-12 text-base text-gray-600">
            No assigned incharges found{selectedSite?.po_number ? ` for ${selectedSite.site_name}` : ''}.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500">
                      S.No
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500">
                      Site Details
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-base font-medium text-gray-500">
                      Working Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIncharges.map((incharge, index) => (
                    <tr key={incharge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-base text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-700">
                        {incharge.project_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-700">
                        <div>
                          <p>{incharge.site_name || "N/A"}</p>
                          <p className="text-base text-gray-600">PO: {incharge.po_number || "N/A"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-base text-gray-700">
                        {incharge.full_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-700">
                        {incharge.designation || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-700">
                        {incharge.mobile || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-700">
                        {incharge.status || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-base text-gray-700">
                        <div>
                          <p>From: {formatDate(incharge.from_date)}</p>
                          <p>To: {formatDate(incharge.to_date)}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAssignedIncharges;
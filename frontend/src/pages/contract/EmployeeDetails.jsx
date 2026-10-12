import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Loader2, Filter, PlusCircle, X, ChevronDown } from "lucide-react";
import AddEmployee from "../../components/AddEmployee";
import AddTemporaryEmployee from "../../components/AddTemporaryEmployee";


const EmployeeDetails = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddTemporaryEmployeeModal, setShowAddTemporaryEmployeeModal] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [showEmployeeTypeMenu, setShowEmployeeTypeMenu] = useState(false);
  const [filters, setFilters] = useState({
    designation: "",
    status: "",
    company: "",
    search: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    designations: [],
    statuses: [],
    companies: [],
  });
  const menuRef = useRef(null);

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

  // Handle null values
  const formatValue = (value) => value || "N/A";

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const [designationsRes, statusesRes, employeesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/material/designations`),
        axios.get(`${API_BASE_URL}/material/statuses`),
        axios.get(`${API_BASE_URL}/material/employees`),
      ]);
      const designations = designationsRes.data.data.map((d) => d.designation);
      const statuses = statusesRes.data.data.map((s) => s.status);
      const companies = [...new Set(employeesRes.data.data.map((e) => e.company))];
      setFilterOptions({
        designations: designations || [],
        statuses: statuses || [],
        companies: companies || [],
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
      setError("Failed to load filter options. Please try again.");
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filters.designation) params.designation = filters.designation;
      if (filters.status) params.status = filters.status;
      if (filters.company) params.company = filters.company;
      if (filters.search) params.search = filters.search;

      const response = await axios.get(`${API_BASE_URL}/material/employees`, { params });
      if (response.data.status === "success") {
        setEmployees(response.data.data || []);
        if (response.data.data.length === 0) {
          setError(response.data.message || "No employees found.");
        }
      } else {
        setError(response.data.message || "Failed to fetch employee details.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch employee details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  // Handle clicks outside the employee type menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowEmployeeTypeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ designation: "", status: "", company: "", search: "" });
    setShowFilter(false);
  };

  // Handle saving new employee (for both fixed and temporary)
  const handleSaveEmployee = async (newEmployeeData, designation) => {
    try {
      setIsAddingEmployee(true);
      console.log("Received employee data:", { ...newEmployeeData, designation });

      // Refresh the employee list and filter options
      await fetchEmployees();
      await fetchFilterOptions();

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: newEmployeeData.contractor_id ? "Temporary Employee Added Successfully!" : "Fixed Employee Added Successfully!",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      setShowAddEmployeeModal(false);
      setShowAddTemporaryEmployeeModal(false);
    } catch (error) {
      console.error("Error in handleSaveEmployee:", error);
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "Employee added, but an unexpected error occurred.",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#fefce8",
        iconColor: "#facc15",
      });
      // Refresh anyway since data is saved
      await fetchEmployees();
      await fetchFilterOptions();
    } finally {
      setIsAddingEmployee(false);
    }
  };

  // Handle closing the modals
  const handleCloseModal = () => {
    setShowAddEmployeeModal(false);
    setShowAddTemporaryEmployeeModal(false);
    setShowEmployeeTypeMenu(false);
  };

  // Handle clicking outside the modal
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Handle employee type selection
  const handleEmployeeTypeSelect = (type) => {
    if (type === "fixed") {
      setShowAddEmployeeModal(true);
    } else if (type === "temporary") {
      setShowAddTemporaryEmployeeModal(true);
    }
    setShowEmployeeTypeMenu(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg min-h-screen">
      <div className="max-w-[90rem] mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Employee Details
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              View detailed information of all employees
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Toggle Filters"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Filter
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowEmployeeTypeMenu(!showEmployeeTypeMenu)}
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                title="Add New Employee"
              >
                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                Add Employee
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              </button>
              {showEmployeeTypeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleEmployeeTypeSelect("fixed")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900"
                    >
                      Fixed Employees
                    </button>
                    <button
                      onClick={() => handleEmployeeTypeSelect("temporary")}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900"
                    >
                      Temporary Employees
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {showFilter && (
          <div className="mb-6 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Employees</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by ID, Name, or Email
                </label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Enter ID, Name, or Email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <select
                  name="designation"
                  value={filters.designation}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                >
                  <option value="">All Designations</option>
                  {filterOptions.designations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                >
                  <option value="">All Statuses</option>
                  {filterOptions.statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <select
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                >
                  <option value="">All Companies</option>
                  {filterOptions.companies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
              <p className="text-gray-600 text-sm sm:text-base">
                Loading employee details...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-sm sm:text-base">
            No employees found.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personal Details
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[280px] sm:w-[320px] lg:w-[360px]">
                      Employment Details
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[280px] sm:w-[320px] lg:w-[360px]">
                      Contact Details
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      JOINED DATE
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee, index) => (
                    <tr
                      key={employee.emp_id}
                      className={`transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-indigo-50`}
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatValue(employee.emp_id)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">
                        <div className="bg-indigo-50 p-4 sm:p-5 rounded-lg space-y-2">
                          <p className="font-semibold text-indigo-700 text-sm sm:text-base">
                            {formatValue(employee.full_name)}
                          </p>
                          <p className="text-xs sm:text-sm text-indigo-600">
                            <span className="font-semibold">Gender:</span> {formatValue(employee.gender)}
                          </p>
                          <p className="text-xs sm:text-sm text-indigo-600">
                            <span className="font-semibold">DOB:</span> {formatDate(employee.date_of_birth)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">
                        <div className="bg-gray-100 p-4 sm:p-5 rounded-lg space-y-2">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            {formatValue(employee.company)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Department:</span> {formatValue(employee.department)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Type:</span> {formatValue(employee.employment_type)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Designation:</span> {formatValue(employee.designation)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Branch:</span> {formatValue(employee.branch)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Status:</span> {formatValue(employee.status)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Approved Salary:</span> {formatValue(employee.approved_salary)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">
                        <div className="bg-gray-100 p-4 sm:p-5 rounded-lg space-y-2">
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Email:</span> {formatValue(employee.company_email)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Mobile:</span> {formatValue(employee.mobile)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">ESIC Number:</span> {formatValue(employee.esic_number)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">PF Number:</span> {formatValue(employee.pf_number)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Current:</span> {formatValue(employee.current_address)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-semibold">Permanent:</span> {formatValue(employee.permanent_address)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="bg-green-50 p-4 sm:p-5 rounded-lg space-y-2">
                          <p className="text-xs sm:text-sm text-green-700">
                            <span className="font-semibold"></span> {formatDate(employee.date_of_joining)}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Fixed Employee Modal */}
        {showAddEmployeeModal && (
          <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={handleOutsideClick}
          >
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full transform transition-all duration-300">
              <AddEmployee
                isOpen={showAddEmployeeModal}
                onClose={handleCloseModal}
                onSave={handleSaveEmployee}
                isAddingEmployee={isAddingEmployee}
              />
            </div>
          </div>
        )}

        {/* Add Temporary Employee Modal */}
        {showAddTemporaryEmployeeModal && (
          <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={handleOutsideClick}
          >
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full transform transition-all duration-300">
              <AddTemporaryEmployee
                isOpen={showAddTemporaryEmployeeModal}
                onClose={handleCloseModal}
                onSave={handleSaveEmployee}
                isAddingEmployee={isAddingEmployee}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
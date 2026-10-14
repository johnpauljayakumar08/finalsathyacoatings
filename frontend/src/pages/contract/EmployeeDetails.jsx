import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { Loader2, Filter, PlusCircle, X, ChevronDown, Pencil, LockKeyhole, Download, Upload } from "lucide-react";
import AddEmployee from "../../components/AddEmployee";
import AddTemporaryEmployee from "../../components/AddTemporaryEmployee";

const LABOUR_IMPORT_COLUMNS = [
  { header: "Full Name", key: "full_name" },
  { header: "Date of Birth (YYYY-MM-DD)", key: "date_of_birth" },
  { header: "Date of Joining (YYYY-MM-DD)", key: "date_of_joining" },
  { header: "Mobile", key: "mobile" },
  { header: "Company Email", key: "company_email" },
  { header: "Current Address", key: "current_address" },
  { header: "Permanent Address", key: "permanent_address" },
  { header: "Gender", key: "gender" },
  { header: "Employment Type", key: "employment_type" },
  { header: "Designation", key: "designation" },
  { header: "Status", key: "status" },
  { header: "Site Engineer Employee ID", key: "site_engineer_emp_id" },
  { header: "Aadhaar Number", key: "aadhaar_number" },
  { header: "Approved Salary Per Shift", key: "approved_salary" },
  { header: "ESIC Number (Optional)", key: "esic_number" },
  { header: "PF Number (Optional)", key: "pf_number" },
];


const EmployeeDetails = () => {
  const { encodedUserId } = useParams();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploadingLabours, setIsUploadingLabours] = useState(false);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddTemporaryEmployeeModal, setShowAddTemporaryEmployeeModal] = useState(false);
  const [editingLoginEmployee, setEditingLoginEmployee] = useState(null);
  const [loginForm, setLoginForm] = useState({ user_password: "" });
  const [isUpdatingLogin, setIsUpdatingLogin] = useState(false);
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
  const labourFileInputRef = useRef(null);

  const downloadLabourTemplate = async () => {
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const uploadSheet = workbook.addWorksheet("Labor Upload");
      uploadSheet.addRow(LABOUR_IMPORT_COLUMNS.map((column) => column.header));
      uploadSheet.columns = LABOUR_IMPORT_COLUMNS.map(() => ({ width: 26 }));
      uploadSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      uploadSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };
      uploadSheet.views = [{ state: "frozen", ySplit: 1 }];

      const sampleSheet = workbook.addWorksheet("Sample Data");
      sampleSheet.addRow(LABOUR_IMPORT_COLUMNS.map((column) => column.header));
      sampleSheet.addRow([
        "Example Labor",
        "2000-01-01",
        "2026-10-01",
        "9000000001",
        "example@example.invalid",
        "Example current address",
        "Example permanent address",
        "Male",
        "Contract",
        "Labour",
        "Active",
        "EMP001",
        "123456789012",
        "1000.00",
        "",
        "",
      ]);
      sampleSheet.columns = LABOUR_IMPORT_COLUMNS.map(() => ({ width: 26 }));
      sampleSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sampleSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4E78" },
      };
      sampleSheet.views = [{ state: "frozen", ySplit: 1 }];

      const instructionsSheet = workbook.addWorksheet("Instructions");
      instructionsSheet.addRows([
        ["Labor Excel Upload Instructions"],
        ["Enter records only in the Labor Upload sheet. The Sample Data sheet contains a fictitious example."],
        ["Dates must be real dates or text in YYYY-MM-DD format."],
        ["Gender, Employment Type, Designation, and Status must match values configured in the application."],
        ["Site Engineer Employee ID must belong to an employee with the Site Engineer designation."],
        ["Enter Mobile and Aadhaar Number as text to preserve all digits."],
        ["Company is automatically set to Sathya Coatings. ESIC and PF numbers are optional."],
        ["Import is all-or-nothing: if any row is invalid, no rows are saved."],
      ]);
      instructionsSheet.getColumn(1).width = 115;
      instructionsSheet.getRow(1).font = { bold: true, size: 14 };

      const buffer = await workbook.xlsx.writeBuffer();
      const fileUrl = URL.createObjectURL(new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }));
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "labor_upload_template.xlsx";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (downloadError) {
      await Swal.fire({
        icon: "error",
        title: "Unable to create the labor template",
        text: downloadError.message || "Please try again.",
      });
    }
  };

  const getImportCellValue = (cell, key) => {
    const value = cell.value;
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    if (typeof value === "number" && ["date_of_birth", "date_of_joining"].includes(key)) {
      const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
      return date.toISOString().slice(0, 10);
    }
    if (value && typeof value === "object") {
      if (Array.isArray(value.richText)) return value.richText.map((part) => part.text).join("").trim();
      return String(value.text || cell.text || "").trim();
    }
    return value === null || value === undefined ? "" : String(value).trim();
  };

  const handleLabourExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      await Swal.fire({ icon: "error", title: "Choose an .xlsx Excel file" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      await Swal.fire({ icon: "error", title: "Excel file is too large", text: "Maximum file size is 10 MB." });
      return;
    }

    let userId;
    try {
      userId = atob(encodedUserId || "");
      if (!/^\d+$/.test(userId)) throw new Error("Invalid user ID");
    } catch {
      await Swal.fire({ icon: "error", title: "Unable to identify the logged-in user" });
      return;
    }

    setIsUploadingLabours(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const worksheet = workbook.getWorksheet("Labor Upload");
      if (!worksheet || worksheet.rowCount < 2) {
        throw new Error("The workbook must contain a Labor Upload sheet with at least one data row.");
      }

      const headers = new Map();
      worksheet.getRow(1).eachCell((cell, columnNumber) => {
        headers.set(String(cell.text || "").trim().toLowerCase(), columnNumber);
      });
      const optionalColumns = new Set(["esic_number", "pf_number"]);
      const missingHeaders = LABOUR_IMPORT_COLUMNS
        .filter(({ key }) => !optionalColumns.has(key))
        .filter(({ header }) => !headers.has(header.toLowerCase()))
        .map(({ header }) => header);
      if (missingHeaders.length) {
        throw new Error(`Template columns are missing: ${missingHeaders.join(", ")}`);
      }

      const labours = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const values = {};
        LABOUR_IMPORT_COLUMNS.forEach(({ header, key }) => {
          const columnNumber = headers.get(header.toLowerCase());
          values[key] = columnNumber ? getImportCellValue(row.getCell(columnNumber), key) : "";
        });
        values._spreadsheet_row = rowNumber;
        if (Object.entries(values).some(([key, value]) => key !== "_spreadsheet_row" && value !== "")) {
          labours.push(values);
        }
      });
      if (labours.length === 0) {
        throw new Error("Enter at least one labor record in the Labor Upload sheet.");
      }
      if (labours.length > 500) {
        throw new Error("A maximum of 500 labor records can be imported at once.");
      }

      const response = await axios.post(`${API_BASE_URL}/admin/import-labours`, {
        labours,
        created_by: userId,
      });
      await Promise.all([fetchEmployees(), fetchFilterOptions()]);
      await Swal.fire({
        icon: "success",
        title: "Labor import completed",
        text: response.data.message,
      });
    } catch (uploadError) {
      const rowErrors = uploadError.response?.data?.errors;
      const rowErrorText = Array.isArray(rowErrors)
        ? rowErrors.slice(0, 12).map(({ row, errors }) => `Row ${row}: ${errors.join("; ")}`).join("\n")
        : "";
      await Swal.fire({
        icon: "error",
        title: "Labor import failed",
        text: rowErrorText || uploadError.response?.data?.message || uploadError.message || "Could not read the Excel file.",
      });
    } finally {
      setIsUploadingLabours(false);
    }
  };

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
        title: newEmployeeData.site_engineer_emp_id || newEmployeeData.contractor_id
          ? "Labor Added Successfully!"
          : "Fixed Employee Added Successfully!",
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

  const openLoginEditor = (employee) => {
    setEditingLoginEmployee(employee);
    setLoginForm({ user_password: "" });
  };

  const closeLoginEditor = () => {
    if (isUpdatingLogin) return;
    setEditingLoginEmployee(null);
    setLoginForm({ user_password: "" });
  };

  const handleUpdateLogin = async (event) => {
    event.preventDefault();
    if (!editingLoginEmployee) return;
    if (!editingLoginEmployee.login_user_id && !loginForm.user_password) {
      Swal.fire({ icon: "error", title: "Set a password to create this login account" });
      return;
    }
    if (loginForm.user_password && loginForm.user_password.length < 8) {
      Swal.fire({ icon: "error", title: "Password must be at least 8 characters" });
      return;
    }

    try {
      setIsUpdatingLogin(true);
      await axios.put(
        `${API_BASE_URL}/material/employees/${encodeURIComponent(editingLoginEmployee.emp_id)}/login`,
        loginForm
      );
      setEditingLoginEmployee(null);
      setLoginForm({ user_password: "" });
      await fetchEmployees();
      Swal.fire({
        icon: "success",
        title: "Login details updated",
        showConfirmButton: false,
        timer: 1800,
        toast: true,
        position: "top-end",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to update login details",
        text: error.response?.data?.message || "Please try again.",
      });
    } finally {
      setIsUpdatingLogin(false);
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
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              title="Toggle Filters"
            >
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              Filter
            </button>
            <button
              type="button"
              onClick={downloadLabourTemplate}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Labor Template
            </button>
            <input
              ref={labourFileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleLabourExcelUpload}
            />
            <button
              type="button"
              disabled={isUploadingLabours}
              onClick={() => labourFileInputRef.current?.click()}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {isUploadingLabours
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Upload className="h-4 w-4 mr-2" />}
              {isUploadingLabours ? "Uploading..." : "Upload Labor Excel"}
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
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LOGIN
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
                            <span className="font-semibold">Approved Salary per Shift:</span> {formatValue(employee.approved_salary)}
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
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="space-y-2">
                          <p className="text-xs text-gray-600">
                            {employee.login_user_id ? `Username: ${employee.login_user_name}` : "No login account"}
                          </p>
                          <button
                            type="button"
                            onClick={() => openLoginEditor(employee)}
                            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {employee.login_user_id ? "Edit Login" : "Set Login"}
                          </button>
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

        {editingLoginEmployee && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeLoginEditor();
            }}
          >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Login Details</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {editingLoginEmployee.full_name} ({editingLoginEmployee.emp_id})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeLoginEditor}
                  disabled={isUpdatingLogin}
                  aria-label="Close"
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-user-name" className="mb-1 block text-sm font-medium text-gray-700">
                    Username and login email
                  </label>
                  <input
                    id="login-user-name"
                    type="email"
                    value={editingLoginEmployee.company_email || ""}
                    autoComplete="username"
                    required
                    readOnly
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="login-user-password" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <LockKeyhole className="h-4 w-4" />
                    New Password
                  </label>
                  <input
                    id="login-user-password"
                    type="password"
                    value={loginForm.user_password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, user_password: event.target.value }))}
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    placeholder="Leave blank to keep the current password"
                    disabled={isUpdatingLogin}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Login email remains {editingLoginEmployee.company_email}. The employee’s role follows their designation.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeLoginEditor}
                    disabled={isUpdatingLogin}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingLogin}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isUpdatingLogin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetails;
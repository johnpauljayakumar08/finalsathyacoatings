import { API_BASE_URL } from "../config/api.js";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import axios from "axios";
import { Loader2, X, Save, UserPlus, User, Building, Calendar, Mail, Phone, MapPin, Users, Briefcase, FileText, DollarSign } from "lucide-react";
import Swal from "sweetalert2";

const AddEmployee = ({ isOpen, onClose, onSave, isAddingEmployee, saveToDatabase = true }) => {
  const { encodedUserId } = useParams(); // Get encodedUserId from URL
  const [userId, setUserId] = useState(null); // Store decoded userId
  const [formData, setFormData] = useState({
    emp_id: "",
    full_name: "",
    gender_id: "",
    date_of_birth: "",
    date_of_joining: "",
    status_id: "",
    company: "",
    dept_id: "",
    emp_type_id: "",
    designation_id: "",
    branch: "",
    mobile: "",
    company_email: "",
    current_address: "",
    permanent_address: "",
    esic_number: "", // Added esic_number
    pf_number: "", // Added pf_number
    approved_salary: "", // Added approved_salary
  });

  const [errors, setErrors] = useState({});
  const [genders, setGenders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState({
    form: false,
    genders: false,
    departments: false,
    employmentTypes: false,
    designations: false,
    statuses: false,
  });

  // Decode userId from encodedUserId
  useEffect(() => {
    if (encodedUserId) {
      try {
        const decodedId = atob(encodedUserId);
        setUserId(decodedId);
      } catch (err) {
        console.error("Error decoding userId:", err);
        setErrors((prev) => ({ ...prev, form: "Invalid user ID in URL. Please try again." }));
      }
    } else {
      setErrors((prev) => ({ ...prev, form: "User ID not found in URL. Please try again." }));
    }
  }, [encodedUserId]);

  useEffect(() => {
    if (isOpen && saveToDatabase) {
      (async () => {
        try {
          setLoading((l) => ({ ...l, genders: true }));
          const { data } = await axios.get(`${API_BASE_URL}/material/genders`);
          setGenders(data.data || []);
        } catch (error) {
          console.error("Error fetching genders:", error);
          setErrors((prev) => ({ ...prev, form: "Failed to load genders." }));
        } finally {
          setLoading((l) => ({ ...l, genders: false }));
        }
        try {
          setLoading((l) => ({ ...l, departments: true }));
          const { data } = await axios.get(`${API_BASE_URL}/material/departments`);
          setDepartments(data.data || []);
        } catch (error) {
          console.error("Error fetching departments:", error);
          setErrors((prev) => ({ ...prev, form: "Failed to load departments." }));
        } finally {
          setLoading((l) => ({ ...l, departments: false }));
        }
        try {
          setLoading((l) => ({ ...l, employmentTypes: true }));
          const { data } = await axios.get(`${API_BASE_URL}/material/employment-types`);
          setEmploymentTypes(data.data || []);
        } catch (error) {
          console.error("Error fetching employment types:", error);
          setErrors((prev) => ({ ...prev, form: "Failed to load employment types." }));
        } finally {
          setLoading((l) => ({ ...l, employmentTypes: false }));
        }
        try {
          setLoading((l) => ({ ...l, designations: true }));
          const { data } = await axios.get(`${API_BASE_URL}/material/designations`);
          setDesignations(data.data || []);
        } catch (error) {
          console.error("Error fetching designations:", error);
          setErrors((prev) => ({ ...prev, form: "Failed to load designations." }));
        } finally {
          setLoading((l) => ({ ...l, designations: false }));
        }
        try {
          setLoading((l) => ({ ...l, statuses: true }));
          const { data } = await axios.get(`${API_BASE_URL}/material/statuses`);
          setStatuses(data.data || []);
        } catch (error) {
          console.error("Error fetching statuses:", error);
          setErrors((prev) => ({ ...prev, form: "Failed to load statuses." }));
        } finally {
          setLoading((l) => ({ ...l, statuses: false }));
        }
      })();
    }
  }, [isOpen, saveToDatabase]);

  const validateForm = () => {
    const newErrors = {};
    const mobileRegex = /^(?:\+91)?\d{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const esicRegex = /^\d{17}$/;
    const pfRegex = /^[A-Z]{2}\/[0-9]{5}\/[0-9]{7}\/[0-9]{3}\/[0-9]{7}$/;

    if (!formData.emp_id) newErrors.emp_id = "Employee ID is required";
    if (!formData.full_name) newErrors.full_name = "Full Name is required";
    if (!formData.gender_id) newErrors.gender_id = "Gender is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of Birth is required";
    else if (!dateRegex.test(formData.date_of_birth)) newErrors.date_of_birth = "Invalid date format (YYYY-MM-DD)";
    if (!formData.date_of_joining) newErrors.date_of_joining = "Date of Joining is required";
    else if (!dateRegex.test(formData.date_of_joining)) newErrors.date_of_joining = "Invalid date format (YYYY-MM-DD)";
    if (!formData.status_id) newErrors.status_id = "Status is required";
    if (!formData.company) newErrors.company = "Company is required";
    if (!formData.dept_id) newErrors.dept_id = "Department is required";
    if (!formData.emp_type_id) newErrors.emp_type_id = "Employment Type is required";
    if (!formData.designation_id) newErrors.designation_id = "Designation is required";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.mobile) newErrors.mobile = "Mobile is required";
    else if (!mobileRegex.test(formData.mobile)) newErrors.mobile = "Invalid mobile: 10 digits, optional +91";
    if (!formData.company_email) newErrors.company_email = "Company Email is required";
    else if (!emailRegex.test(formData.company_email)) newErrors.company_email = "Invalid email format";
    if (!formData.current_address) newErrors.current_address = "Current Address is required";
    if (!formData.permanent_address) newErrors.permanent_address = "Permanent Address is required";
    if (!formData.approved_salary) newErrors.approved_salary = "Approved Salary is required";
    else if (isNaN(formData.approved_salary) || parseFloat(formData.approved_salary) <= 0) newErrors.approved_salary = "Approved Salary must be a positive number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !userId) {
      if (!userId) {
        setErrors((prev) => ({ ...prev, form: "User ID is missing. Please try again." }));
      }
      return;
    }

    try {
      setLoading((l) => ({ ...l, form: true }));
      setErrors({});

      let employeeData = { ...formData, created_by: userId }; // Include created_by
      let designation;

      if (saveToDatabase) {
        console.log("Submitting payload to API:", employeeData);
        const response = await axios.post(`${API_BASE_URL}/material/add-employee`, employeeData);
        console.log("API response:", response.data);
        employeeData = response.data.data;
        designation = designations.find((d) => d.id === parseInt(employeeData.designation_id))?.designation || "";
      } else {
        // If not saving to database, use the form's designation_id to find designation
        designation = designations.find((d) => d.id === parseInt(formData.designation_id))?.designation || "";
      }

      // Pass full employee data to onSave
      onSave(employeeData, designation);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: saveToDatabase ? "Employee Added Successfully!" : "Employee Added to Form!",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      setFormData({
        emp_id: "",
        full_name: "",
        gender_id: "",
        date_of_birth: "",
        date_of_joining: "",
        status_id: "",
        company: "",
        dept_id: "",
        emp_type_id: "",
        designation_id: "",
        branch: "",
        mobile: "",
        company_email: "",
        current_address: "",
        permanent_address: "",
        esic_number: "", // Reset esic_number
        pf_number: "", // Reset pf_number
        approved_salary: "", // Reset approved_salary
      });
    } catch (error) {
      console.error("Error adding employee:", error.response?.data || error);
      const msg = error.response?.data?.message || error.response?.data?.errors?.join(", ") || "Failed to add employee. Please try again.";
      setErrors({ form: msg });
    } finally {
      setLoading((l) => ({ ...l, form: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Add Employee</h4>
        {errors.form && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
            {errors.form}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Employee ID", name: "emp_id", type: "text", placeholder: "e.g., EMP001", icon: User },
              { label: "Full Name", name: "full_name", type: "text", placeholder: "Enter full name", icon: User },
              {
                label: "Gender",
                name: "gender_id",
                type: "select",
                options: saveToDatabase ? genders : [{ id: "1", gender: "Male" }, { id: "2", gender: "Female" }],
                loading: saveToDatabase && loading.genders,
                optLabel: "gender",
                icon: Users,
              },
              { label: "Date of Birth", name: "date_of_birth", type: "date", icon: Calendar },
              { label: "Date of Joining", name: "date_of_joining", type: "date", icon: Calendar },
              {
                label: "Status",
                name: "status_id",
                type: "select",
                options: saveToDatabase ? statuses : [{ id: "1", status: "Active" }],
                loading: saveToDatabase && loading.statuses,
                optLabel: "status",
                icon: Users,
              },
              { label: "Company", name: "company", type: "text", placeholder: "e.g., Lakshmi Mills", icon: Building },
              {
                label: "Department",
                name: "dept_id",
                type: "select",
                options: saveToDatabase ? departments : [{ id: "1", department: "General" }],
                loading: saveToDatabase && loading.departments,
                optLabel: "department",
                icon: Users,
              },
              {
                label: "Employment Type",
                name: "emp_type_id",
                type: "select",
                options: saveToDatabase ? employmentTypes : [{ id: "1", type: "Permanent" }],
                loading: saveToDatabase && loading.employmentTypes,
                optLabel: "type",
                icon: Briefcase,
              },
              {
                label: "Designation",
                name: "designation_id",
                type: "select",
                options: saveToDatabase ? designations : [{ id: "1", designation: "Site Supervisor" }],
                loading: saveToDatabase && loading.designations,
                optLabel: "designation",
                icon: Users,
              },
              { label: "Branch", name: "branch", type: "text", placeholder: "e.g., Peelamedu", icon: MapPin },
              { label: "Mobile", name: "mobile", type: "text", placeholder: "e.g., +919876543210", icon: Phone },
              { label: "Company Email", name: "company_email", type: "email", placeholder: "e.g., name@company.com", icon: Mail },
              {
                label: "Approved Salary",
                name: "approved_salary",
                type: "number",
                placeholder: "e.g., 25000",
                icon: DollarSign,
              },
              {
                label: "ESIC Number",
                name: "esic_number",
                type: "text",
                placeholder: "e.g., 12345678901234567",
                icon: FileText,
              },
              {
                label: "PF Number",
                name: "pf_number",
                type: "text",
                placeholder: "e.g., TN/MAS/1234567/123/1234567",
                icon: FileText,
              },
              {
                label: "Current Address",
                name: "current_address",
                type: "textarea",
                placeholder: "e.g., 123, RS Puram, Coimbatore, TN 641002",
                icon: MapPin,
              },
              {
                label: "Permanent Address",
                name: "permanent_address",
                type: "textarea",
                placeholder: "e.g., 456, Pollachi Road, Coimbatore, TN 641021",
                icon: MapPin,
              },
            ].map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  {field.icon && <field.icon className="h-4 w-4 mr-2 text-gray-500" />}
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <div className="relative">
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                      disabled={field.loading || isAddingEmployee}
                      required
                    >
                      <option value="">Select {field.label}</option>
                      {field.options &&
                        field.options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt[field.optLabel] || "N/A"}
                          </option>
                        ))}
                    </select>
                    {field.loading && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500 animate-spin" />
                    )}
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows="3"
                    disabled={isAddingEmployee}
                    required
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    disabled={isAddingEmployee}
                    required={field.name !== "esic_number" && field.name !== "pf_number"} // Optional fields
                    step={field.name === "approved_salary" ? "0.01" : undefined}
                    min={field.name === "approved_salary" ? "0" : undefined}
                    autoComplete="off"
                  />
                )}
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isAddingEmployee}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.form || isAddingEmployee}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading.form || isAddingEmployee ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2 inline" />
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
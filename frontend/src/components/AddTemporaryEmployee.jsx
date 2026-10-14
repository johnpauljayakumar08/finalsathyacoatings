import { API_BASE_URL } from "../config/api.js";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import axios from "axios";
import { Loader2, X, Save, User, Building, Calendar, Mail, Phone, MapPin, Users, Briefcase, FileText, DollarSign, HardHat } from "lucide-react";
import Swal from "sweetalert2";

const COMPANY_NAME = "Sathya Coatings";

const AddTemporaryEmployee = ({ isOpen, onClose, onSave, isAddingEmployee, saveToDatabase = true }) => {
  const { encodedUserId } = useParams(); // Get encodedUserId from URL
  const [userId, setUserId] = useState(null); // Store decoded userId
  const [formData, setFormData] = useState({
    full_name: "",
    gender_id: "",
    date_of_birth: "",
    date_of_joining: "",
    status_id: "",
    company: COMPANY_NAME,
    emp_type_id: "",
    designation_id: "",
    mobile: "",
    company_email: "",
    current_address: "",
    permanent_address: "",
    esic_number: "",
    pf_number: "",
    site_engineer_emp_id: "",
    aadhaar_number: "",
    approved_salary: ""
  });

  const [errors, setErrors] = useState({});
  const [genders, setGenders] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [siteEngineers, setSiteEngineers] = useState([]);
  const [loading, setLoading] = useState({
    form: false,
    genders: false,
    employmentTypes: false,
    designations: false,
    statuses: false,
    siteEngineers: false
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

        try {
          setLoading((l) => ({ ...l, siteEngineers: true }));
          const { data } = await axios.get(`${API_BASE_URL}/admin/site-engineers`);
          setSiteEngineers(data.data || []);
        } catch (error) {
          console.error("Error fetching site engineers:", error);
          setErrors((prev) => ({ ...prev, form: "Failed to load site engineers." }));
        } finally {
          setLoading((l) => ({ ...l, siteEngineers: false }));
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
    const salaryRegex = /^\d+(\.\d{1,2})?$/;
    const aadhaarRegex = /^\d{12}$/;

    if (!formData.full_name) newErrors.full_name = "Full Name is required";
    if (!formData.gender_id) newErrors.gender_id = "Gender is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of Birth is required";
    else if (!dateRegex.test(formData.date_of_birth)) newErrors.date_of_birth = "Invalid date format (YYYY-MM-DD)";
    if (!formData.date_of_joining) newErrors.date_of_joining = "Date of Joining is required";
    else if (!dateRegex.test(formData.date_of_joining)) newErrors.date_of_joining = "Invalid date format (YYYY-MM-DD)";
    if (!formData.status_id) newErrors.status_id = "Status is required";
    if (!formData.emp_type_id) newErrors.emp_type_id = "Employment Type is required";
    if (!formData.designation_id) newErrors.designation_id = "Designation is required";
    if (!formData.site_engineer_emp_id) newErrors.site_engineer_emp_id = "Site Engineer is required";
    if (!formData.mobile) newErrors.mobile = "Mobile is required";
    else if (!mobileRegex.test(formData.mobile)) newErrors.mobile = "Invalid mobile: 10 digits, optional +91";
    if (!formData.company_email) newErrors.company_email = "Company Email is required";
    else if (!emailRegex.test(formData.company_email)) newErrors.company_email = "Invalid email format";
    if (!formData.current_address) newErrors.current_address = "Current Address is required";
    if (!formData.permanent_address) newErrors.permanent_address = "Permanent Address is required";
    if (!aadhaarRegex.test(formData.aadhaar_number)) newErrors.aadhaar_number = "Aadhaar number must contain exactly 12 digits";
    if (formData.esic_number && !esicRegex.test(formData.esic_number)) newErrors.esic_number = "Invalid ESIC number: 17 digits";
    if (!formData.approved_salary || !salaryRegex.test(formData.approved_salary) || Number(formData.approved_salary) <= 0) {
      newErrors.approved_salary = "Enter a valid positive salary per shift";
    }

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

      let labourData = {
        ...formData,
        company: COMPANY_NAME,
        branch: null,
        dept_id: null,
        contractor_id: null,
        created_by: userId
      };
      let designation;

      if (saveToDatabase) {
        console.log("Submitting payload to API:", labourData);
        const response = await axios.post(`${API_BASE_URL}/admin/add-labour`, labourData);
        console.log("API response:", response.data);
        labourData = response.data.data;
        designation = designations.find((d) => d.id === parseInt(labourData.designation_id))?.designation || "";
      } else {
        designation = designations.find((d) => d.id === parseInt(formData.designation_id))?.designation || "";
      }

      onSave(labourData, designation);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: saveToDatabase ? "Labor Added Successfully!" : "Labor Added to Form!",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      setFormData({
        full_name: "",
        gender_id: "",
        date_of_birth: "",
        date_of_joining: "",
        status_id: "",
        company: COMPANY_NAME,
        emp_type_id: "",
        designation_id: "",
        mobile: "",
        company_email: "",
        current_address: "",
        permanent_address: "",
        esic_number: "",
        pf_number: "",
        site_engineer_emp_id: "",
        aadhaar_number: "",
        approved_salary: ""
      });
    } catch (error) {
      console.error("Error adding temporary employee:", error.response?.data || error);
      const msg = error.response?.data?.message || error.response?.data?.errors?.join(", ") || "Failed to add temporary employee. Please try again.";
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
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Add Labor Details</h4>
        {errors.form && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
            {errors.form}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            {[
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
              { label: "Company", name: "company", type: "fixed", icon: Building },
              {
                label: "Employment Type",
                name: "emp_type_id",
                type: "select",
                options: saveToDatabase ? employmentTypes : [{ id: "1", type: "Temporary" }],
                loading: saveToDatabase && loading.employmentTypes,
                optLabel: "type",
                icon: Briefcase,
              },
              {
                label: "Designation",
                name: "designation_id",
                type: "select",
                options: saveToDatabase ? designations : [{ id: "1", designation: "Labour" }],
                loading: saveToDatabase && loading.designations,
                optLabel: "designation",
                icon: Users,
              },
              { label: "Mobile", name: "mobile", type: "text", placeholder: "e.g., +919876543210", icon: Phone },
              { label: "Company Email", name: "company_email", type: "email", placeholder: "e.g., name@company.com", icon: Mail },
              {
                label: "Site Engineer",
                name: "site_engineer_emp_id",
                type: "select",
                options: saveToDatabase ? siteEngineers : [{ emp_id: "SAMPLE-ENGINEER", full_name: "Sample Site Engineer" }],
                loading: saveToDatabase && loading.siteEngineers,
                optLabel: "full_name",
                optValue: "emp_id",
                icon: HardHat
              },
              { label: "Aadhaar Number", name: "aadhaar_number", type: "text", placeholder: "Enter 12-digit Aadhaar number", icon: FileText },
              {
                label: "ESIC Number",
                name: "esic_number",
                type: "text",
                placeholder: "e.g., 12345678901234567",
                icon: FileText,
                optional: true
              },
              {
                label: "PF Number",
                name: "pf_number",
                type: "text",
                placeholder: "e.g., TN/MAS/1234567/123/1234567",
                icon: FileText,
                optional: true
              },
              {
                label: "Approved Salary per Shift",
                name: "approved_salary",
                type: "number",
                placeholder: "Enter amount per shift",
                icon: DollarSign,
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
                {field.type === "fixed" ? (
                  <input
                    type="text"
                    name={field.name}
                    value={COMPANY_NAME}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 sm:text-sm"
                  />
                ) : field.type === "select" ? (
                  <div className="relative">
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                      disabled={field.loading || isAddingEmployee}
                      required={!field.optional}
                    >
                      <option value="">{field.optional ? `Select ${field.label} (Optional)` : `Select ${field.label}`}</option>
                      {field.options &&
                        field.options.map((opt) => (
                          <option key={opt[field.optValue || "id"]} value={opt[field.optValue || "id"]}>
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
                    required={!field.optional}
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

export default AddTemporaryEmployee;
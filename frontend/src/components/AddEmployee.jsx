import { API_BASE_URL } from "../config/api.js";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import { Loader2, Save, User, Building, Calendar, Mail, Phone, MapPin, Users, Briefcase, FileText, DollarSign, LockKeyhole, Landmark } from "lucide-react";

const COMPANY_NAME = "Sathya Coatings";
const EMPLOYEE_CATEGORIES = ["Labor", "Engineer", "Office Staff", "Factory Staff"];

const initialFormData = {
  emp_id: "",
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
  user_password: "",
  current_address: "",
  permanent_address: "",
  esic_number: "",
  pf_number: "",
  approved_salary: "",
  aadhaar_number: "",
  team_name: "",
  father_guardian_name: "",
  father_guardian_mobile: "",
  bank_account_number: "",
  bank_account_holder_name: "",
  bank_name: "",
  bank_ifsc_code: "",
  bank_branch: "",
};

const AddEmployee = ({
  isOpen,
  onClose,
  onSave,
  isAddingEmployee,
  saveToDatabase = true,
  initialEmployee = null,
}) => {
  const { encodedUserId } = useParams();
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [genders, setGenders] = useState([]);
  const [teamNameOptions, setTeamNameOptions] = useState([]);
  const [employmentTypes, setEmploymentTypes] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState({
    form: false,
    genders: false,
    teamNames: false,
    employmentTypes: false,
    designations: false,
    statuses: false,
  });

  const isEditing = Boolean(initialEmployee);

  useEffect(() => {
    if (!isOpen) return;
    if (!initialEmployee) {
      setFormData(initialFormData);
    } else {
      const personnelFormData = Object.keys(initialFormData).reduce((values, fieldName) => ({
        ...values,
        [fieldName]: initialEmployee[fieldName] == null ? "" : String(initialEmployee[fieldName]),
      }), initialFormData);
      setFormData({
        ...personnelFormData,
        emp_id: initialEmployee.emp_id || "",
        company: initialEmployee.company || COMPANY_NAME,
        date_of_birth: String(initialEmployee.date_of_birth || "").slice(0, 10),
        date_of_joining: String(initialEmployee.date_of_joining || "").slice(0, 10),
        approved_salary: initialEmployee.approved_salary == null ? "" : String(initialEmployee.approved_salary),
        user_password: "",
      });
    }
    setErrors({});
  }, [isOpen, initialEmployee]);

  const selectedEmploymentType = useMemo(
    () => employmentTypes.find((type) => String(type.id) === String(formData.emp_type_id)),
    [employmentTypes, formData.emp_type_id]
  );
  const isLabor = selectedEmploymentType?.type?.toLowerCase() === "labor";
  const availableEmploymentTypes = employmentTypes.filter((type) =>
    EMPLOYEE_CATEGORIES.some((category) => category.toLowerCase() === String(type.type).toLowerCase())
  );

  useEffect(() => {
    if (!encodedUserId) {
      setErrors((previous) => ({ ...previous, form: "User ID not found in URL. Please try again." }));
      return;
    }
    try {
      setUserId(atob(encodedUserId));
    } catch (error) {
      console.error("Error decoding userId:", error);
      setErrors((previous) => ({ ...previous, form: "Invalid user ID in URL. Please try again." }));
    }
  }, [encodedUserId]);

  useEffect(() => {
    if (!isOpen || !saveToDatabase) return undefined;
    const fetchOptions = async (key, endpoint, setter) => {
      setLoading((previous) => ({ ...previous, [key]: true }));
      try {
        const { data } = await axios.get(`${API_BASE_URL}${endpoint}`);
        setter(data.data || []);
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
        setErrors((previous) => ({ ...previous, form: `Failed to load ${key.replace(/([A-Z])/g, " $1").toLowerCase()}.` }));
      } finally {
        setLoading((previous) => ({ ...previous, [key]: false }));
      }
    };
    fetchOptions("genders", "/material/genders", setGenders);
    fetchOptions("employmentTypes", "/material/employment-types", setEmploymentTypes);
    fetchOptions("designations", "/material/designations", setDesignations);
    fetchOptions("statuses", "/material/statuses", setStatuses);
    return undefined;
  }, [isOpen, saveToDatabase]);

  useEffect(() => {
    if (!isOpen || !isLabor || !saveToDatabase) return undefined;
    let active = true;
    const fetchTeamNames = async () => {
      setLoading((previous) => ({ ...previous, teamNames: true }));
      try {
        const { data } = await axios.get(`${API_BASE_URL}/admin/labour`);
        if (active) {
          const names = [...new Set((data.data || [])
            .map((labour) => String(labour.team_name || "").trim())
            .filter(Boolean))].sort((a, b) => a.localeCompare(b));
          setTeamNameOptions(names.map((name) => ({ value: name, label: name })));
        }
      } catch (error) {
        console.error("Error fetching labor team names:", error);
        if (active) setErrors((previous) => ({ ...previous, form: "Failed to load existing team names. You can still enter a new team name." }));
      } finally {
        if (active) setLoading((previous) => ({ ...previous, teamNames: false }));
      }
    };
    fetchTeamNames();
    return () => { active = false; };
  }, [isOpen, isLabor, saveToDatabase]);

  const validateForm = () => {
    const newErrors = {};
    const mobileRegex = /^(?:\+91)?\d{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const salaryRegex = /^\d+(\.\d{1,2})?$/;
    const esicRegex = /^\d{17}$/;
    const aadhaarRegex = /^\d{12}$/;
    const bankAccountRegex = /^[A-Za-z0-9-]{6,34}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

    if (!isLabor && !formData.emp_id.trim()) newErrors.emp_id = "Employee ID is required";
    if (!formData.full_name.trim()) newErrors.full_name = "Full Name is required";
    if (!formData.gender_id) newErrors.gender_id = "Gender is required";
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of Birth is required";
    else if (!dateRegex.test(formData.date_of_birth)) newErrors.date_of_birth = "Invalid date format (YYYY-MM-DD)";
    if (!formData.date_of_joining) newErrors.date_of_joining = "Date of Joining is required";
    else if (!dateRegex.test(formData.date_of_joining)) newErrors.date_of_joining = "Invalid date format (YYYY-MM-DD)";
    if (!formData.status_id) newErrors.status_id = "Status is required";
    if (!formData.emp_type_id) newErrors.emp_type_id = "Employee Type is required";
    if (!formData.designation_id) newErrors.designation_id = "Designation is required";
    if (!formData.mobile) newErrors.mobile = "Mobile is required";
    else if (!mobileRegex.test(formData.mobile)) newErrors.mobile = "Invalid mobile: 10 digits, optional +91";
    if (!formData.company_email) newErrors.company_email = "Company Email is required";
    else if (!emailRegex.test(formData.company_email)) newErrors.company_email = "Invalid email format";
    if (!isEditing && !isLabor && saveToDatabase && formData.user_password.length < 8) {
      newErrors.user_password = "Password must be at least 8 characters";
    }
    if (!isEditing && !isLabor && saveToDatabase && new TextEncoder().encode(formData.user_password).length > 72) {
      newErrors.user_password = "Password cannot exceed 72 bytes";
    }
    if (!formData.current_address.trim()) newErrors.current_address = "Current Address is required";
    if (!formData.permanent_address.trim()) newErrors.permanent_address = "Permanent Address is required";
    if (!formData.approved_salary) newErrors.approved_salary = "Salary is required";
    else if (!salaryRegex.test(formData.approved_salary) || Number(formData.approved_salary) <= 0) {
      newErrors.approved_salary = "Salary must be a positive number with up to 2 decimal places";
    }

    if (isLabor) {
      if (!formData.team_name.trim()) newErrors.team_name = "Team Name is required";
      if (!formData.father_guardian_name.trim()) newErrors.father_guardian_name = "Father/Guardian Name is required";
      if (!formData.father_guardian_mobile) newErrors.father_guardian_mobile = "Father/Guardian Mobile is required";
      else if (!mobileRegex.test(formData.father_guardian_mobile)) {
        newErrors.father_guardian_mobile = "Invalid mobile: 10 digits, optional +91";
      }
    } else {
      if (!formData.aadhaar_number) newErrors.aadhaar_number = "Aadhaar Number is required";
      else if (!aadhaarRegex.test(formData.aadhaar_number)) newErrors.aadhaar_number = "Aadhaar Number must contain exactly 12 digits";
      if (!formData.esic_number) newErrors.esic_number = "ESIC Number is required";
      else if (!esicRegex.test(formData.esic_number)) newErrors.esic_number = "ESIC Number must contain 17 digits";
      if (!formData.pf_number.trim()) newErrors.pf_number = "PF Number is required";
      if (!formData.bank_account_number) newErrors.bank_account_number = "Bank Account Number is required";
      else if (!bankAccountRegex.test(formData.bank_account_number)) newErrors.bank_account_number = "Enter a valid bank account number";
      if (!formData.bank_account_holder_name.trim()) newErrors.bank_account_holder_name = "Account Holder Name is required";
      if (!formData.bank_name.trim()) newErrors.bank_name = "Bank Name is required";
      if (!formData.bank_ifsc_code) newErrors.bank_ifsc_code = "IFSC Code is required";
      else if (!ifscRegex.test(formData.bank_ifsc_code)) newErrors.bank_ifsc_code = "Enter a valid IFSC code";
      if (!formData.bank_branch.trim()) newErrors.bank_branch = "Bank Branch is required";
    }
    if (isLabor && formData.aadhaar_number && !aadhaarRegex.test(formData.aadhaar_number)) {
      newErrors.aadhaar_number = "Aadhaar Number must contain exactly 12 digits";
    }
    if (isLabor && formData.esic_number && !esicRegex.test(formData.esic_number)) {
      newErrors.esic_number = "ESIC Number must contain 17 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || !userId) {
      if (!userId) setErrors((previous) => ({ ...previous, form: "User ID is missing. Please try again." }));
      return;
    }

    try {
      setLoading((previous) => ({ ...previous, form: true }));
      setErrors({});
      const employeeData = {
        ...formData,
        company: COMPANY_NAME,
        branch: "",
        ...(isEditing ? {} : { created_by: userId }),
      };
      let savedEmployeeData = employeeData;
      const designation = designations.find((item) => String(item.id) === String(formData.designation_id))?.designation || "";

      if (saveToDatabase) {
        if (isEditing) {
          const endpoint = initialEmployee.personnel_type === "Labor"
            ? `/admin/labour/${encodeURIComponent(initialEmployee.emp_id)}`
            : `/material/employees/${encodeURIComponent(initialEmployee.emp_id)}`;
          const { data } = await axios.put(`${API_BASE_URL}${endpoint}`, employeeData);
          savedEmployeeData = {
            ...initialEmployee,
            ...data.data,
            personnel_type: initialEmployee.personnel_type,
          };
        } else {
          const endpoint = isLabor ? "/admin/add-labour" : "/material/add-employee";
          const { data } = await axios.post(`${API_BASE_URL}${endpoint}`, employeeData);
          savedEmployeeData = data.data;
        }
      }

      savedEmployeeData = {
        ...savedEmployeeData,
        employment_type: selectedEmploymentType?.type || initialEmployee?.employment_type || "",
      };
      await onSave(savedEmployeeData, designation);
      setFormData(initialFormData);
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "adding"} personnel:`, error.response?.data || error);
      const message = error.response?.data?.message || error.response?.data?.errors?.join(", ") || `Failed to ${isEditing ? "update" : "add"} personnel. Please try again.`;
      setErrors({ form: message });
    } finally {
      setLoading((previous) => ({ ...previous, form: false }));
    }
  };

  if (!isOpen) return null;

  const genderOptions = saveToDatabase ? genders : [{ id: "1", gender: "Male" }, { id: "2", gender: "Female" }];
  const statusOptions = saveToDatabase ? statuses : [{ id: "1", status: "Active" }];
  const employmentOptions = saveToDatabase
    ? availableEmploymentTypes
    : EMPLOYEE_CATEGORIES.map((type, index) => ({ id: index + 1, type }));
  const designationOptions = saveToDatabase ? designations : [{ id: "1", designation: "Site Supervisor" }];
  const fields = [
    ...(!isLabor ? [{ label: "Employee ID", name: "emp_id", type: "text", placeholder: "e.g., EMP001", icon: User }] : []),
    { label: "Full Name", name: "full_name", type: "text", placeholder: "Enter full name", icon: User },
    { label: "Gender", name: "gender_id", type: "select", options: genderOptions, optLabel: "gender", loading: loading.genders, icon: Users },
    { label: "Date of Birth", name: "date_of_birth", type: "date", icon: Calendar },
    { label: "Date of Joining", name: "date_of_joining", type: "date", icon: Calendar },
    { label: "Status", name: "status_id", type: "select", options: statusOptions, optLabel: "status", loading: loading.statuses, icon: Users },
    { label: "Company", name: "company", type: "fixed", icon: Building },
    { label: "Employee Type", name: "emp_type_id", type: "select", options: employmentOptions, optLabel: "type", loading: loading.employmentTypes, icon: Briefcase },
    { label: "Designation", name: "designation_id", type: "select", options: designationOptions, optLabel: "designation", loading: loading.designations, icon: Users },
    ...(isLabor ? [
      { label: "Team Name", name: "team_name", type: "creatable-select", options: teamNameOptions, loading: loading.teamNames, placeholder: "Select an existing team or enter a new one", icon: Users },
      { label: "Father/Guardian Name", name: "father_guardian_name", type: "text", placeholder: "Enter father/guardian name", icon: User },
      { label: "Father/Guardian Mobile", name: "father_guardian_mobile", type: "tel", placeholder: "10 digits, optional +91", icon: Phone },
    ] : []),
    { label: "Mobile", name: "mobile", type: "tel", placeholder: "10 digits, optional +91", icon: Phone },
    { label: "Company Email", name: "company_email", type: "email", placeholder: "e.g., name@company.com", icon: Mail },
    ...(!isLabor && !isEditing ? [{ label: "Password", name: "user_password", type: "password", placeholder: "At least 8 characters", icon: LockKeyhole }] : []),
    { label: isLabor ? "Salary Per Day" : "Salary Per Month", name: "approved_salary", type: "number", placeholder: "Enter salary", icon: DollarSign },
    { label: "Aadhaar Number", name: "aadhaar_number", type: "text", placeholder: "12 digits", icon: FileText },
    { label: "ESIC Number", name: "esic_number", type: "text", placeholder: "17 digits", icon: FileText },
    { label: "PF Number", name: "pf_number", type: "text", placeholder: "Enter PF number", icon: FileText },
    ...(!isLabor ? [
      { label: "Bank Account Number", name: "bank_account_number", type: "text", placeholder: "Enter account number", icon: Landmark },
      { label: "Account Holder Name", name: "bank_account_holder_name", type: "text", placeholder: "Enter account holder name", icon: User },
      { label: "Bank Name", name: "bank_name", type: "text", placeholder: "Enter bank name", icon: Landmark },
      { label: "IFSC Code", name: "bank_ifsc_code", type: "text", placeholder: "e.g., SBIN0001234", icon: Landmark },
      { label: "Bank Branch", name: "bank_branch", type: "text", placeholder: "Enter branch", icon: Landmark },
    ] : []),
    { label: "Current Address", name: "current_address", type: "textarea", placeholder: "Enter current address", icon: MapPin },
    { label: "Permanent Address", name: "permanent_address", type: "textarea", placeholder: "Enter permanent address", icon: MapPin },
  ];

  const isFieldRequired = (name) => {
    if (["esic_number", "pf_number", "aadhaar_number"].includes(name)) return !isLabor;
    return name !== "company" && name !== "user_password" || (!isLabor && name === "user_password");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <h4 className="text-lg font-semibold text-gray-700 mb-4">{isEditing ? "Edit Resource Details" : "Add Resource"}</h4>
        {errors.form && <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">{errors.form}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <field.icon className="h-4 w-4 mr-2 text-gray-500" />
                  {field.label}
                </label>
                {field.type === "fixed" ? (
                  <input type="text" value={COMPANY_NAME} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 sm:text-sm" />
                ) : field.type === "creatable-select" ? (
                  <CreatableSelect
                    className="text-sm"
                    classNamePrefix="react-select"
                    isClearable
                    isDisabled={field.loading || isAddingEmployee}
                    isLoading={field.loading}
                    options={field.options}
                    value={formData.team_name ? { value: formData.team_name, label: formData.team_name } : null}
                    onChange={(option) => {
                      setFormData((previous) => ({ ...previous, team_name: option?.value || "" }));
                      setErrors((previous) => ({ ...previous, team_name: null }));
                    }}
                    onCreateOption={(inputValue) => {
                      const teamName = inputValue.trim();
                      if (!teamName) return;
                      setTeamNameOptions((previous) => [...previous, { value: teamName, label: teamName }]);
                      setFormData((previous) => ({ ...previous, team_name: teamName }));
                      setErrors((previous) => ({ ...previous, team_name: null }));
                    }}
                    placeholder={field.placeholder}
                    formatCreateLabel={(inputValue) => `Create team "${inputValue}"`}
                  />
                ) : field.type === "select" ? (
                  <div className="relative">
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                      disabled={field.loading || isAddingEmployee || (isEditing && field.name === "emp_type_id")}
                      required={isFieldRequired(field.name)}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.length === 0 && field.name === "emp_type_id" && (
                        <option value="" disabled>Apply the resource categories database migration</option>
                      )}
                      {field.options.map((option) => <option key={option.id} value={option.id}>{option[field.optLabel] || "N/A"}</option>)}
                    </select>
                    {field.loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 animate-spin" />}
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
                    required={isFieldRequired(field.name)}
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
                    readOnly={isEditing && field.name === "emp_id"}
                    required={isFieldRequired(field.name)}
                    maxLength={field.name === "user_password" ? 72 : undefined}
                    step={field.name === "approved_salary" ? "0.01" : undefined}
                    min={field.name === "approved_salary" ? "0" : undefined}
                    autoComplete={field.name === "user_password" ? "new-password" : "off"}
                  />
                )}
                {field.name === "company_email" && !isLabor && saveToDatabase && (
                  <p className="mt-1 text-xs text-gray-500">This email will also be the employee&apos;s login username.</p>
                )}
                {["aadhaar_number", "esic_number", "pf_number"].includes(field.name) && isLabor && (
                  <p className="mt-1 text-xs text-gray-500">Optional for Labor.</p>
                )}
                {errors[field.name] && <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" disabled={isAddingEmployee}>Cancel</button>
            <button type="submit" disabled={loading.form || isAddingEmployee} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading.form || isAddingEmployee ? <><Loader2 className="h-5 w-5 mr-2 animate-spin inline" />Saving...</> : <><Save className="h-5 w-5 mr-2 inline" />{isEditing ? "Update" : "Save"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;

import { API_BASE_URL } from "../../config/api.js";
// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import Select from "react-select";
// import { Loader2, Package, FileText, X, ChevronDown, ChevronUp } from "lucide-react";
// import DispatchReport from "../../components/DispatchReport";

// // SearchableDropdown component
// const SearchableDropdown = ({ options, selectedValue, onSelect, placeholder, searchKeys, disabled, loading }) => {
//   const selectOptions = useMemo(
//     () =>
//       options.map((option) => ({
//         value: option.id,
//         label: option[searchKeys[0]]?.toString() || "",
//         subLabel: searchKeys[1] ? option[searchKeys[1]]?.toString() || "" : null,
//       })),
//     [options, searchKeys]
//   );

//   const selectedOption = useMemo(
//     () => selectOptions.find((opt) => opt.value === selectedValue) || null,
//     [selectOptions, selectedValue]
//   );

//   const handleChange = (selected) => {
//     onSelect(selected ? selected.value : "");
//   };

//   const customFilter = (option, searchText) => {
//     if (!searchText) return true;
//     return (
//       option.data.label?.toLowerCase().includes(searchText.toLowerCase()) ||
//       option.data.subLabel?.toLowerCase().includes(searchText.toLowerCase())
//     );
//   };

//   const CustomOption = ({ innerProps, data }) => (
//     <div
//       {...innerProps}
//       className={`px-4 py-3 text-sm cursor-pointer hover:bg-teal-50 transition-colors ${
//         selectedValue === data.value ? "bg-teal-100 text-teal-800" : "text-gray-700"
//       }`}
//     >
//       <div className="font-medium">{data.label}</div>
//       {data.subLabel && <div className="text-xs text-gray-500">{data.subLabel}</div>}
//     </div>
//   );

//   const CustomSingleValue = ({ innerProps, data }) => (
//     <div {...innerProps}>
//       <div className="font-medium text-gray-900 text-sm">{data.label}</div>
//       {data.subLabel && <div className="text-xs text-gray-500">{data.subLabel}</div>}
//     </div>
//   );

//   useEffect(() => {
//     if (options.length === 1 && !selectedValue) {
//       onSelect(options[0].id);
//     }
//   }, [options, selectedValue, onSelect]);

//   return (
//     <Select
//       options={selectOptions}
//       value={selectedOption}
//       onChange={handleChange}
//       placeholder={placeholder}
//       isDisabled={disabled || loading}
//       isLoading={loading}
//       filterOption={customFilter}
//       components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
//       isClearable
//       className="text-sm"
//       classNamePrefix="select"
//       styles={{
//         control: (provided, state) => ({
//           ...provided,
//           minHeight: "38px",
//           borderColor: state.isFocused ? "#14b8a6" : "#d1d5db",
//           boxShadow: state.isFocused ? "0 0 0 2px rgba(20, 184, 166, 0.2)" : "none",
//           backgroundColor: "white",
//         }),
//         singleValue: (provided) => ({
//           ...provided,
//           margin: 0,
//           padding: 0,
//         }),
//         menu: (provided) => ({
//           ...provided,
//           zIndex: 10,
//         }),
//       }}
//     />
//   );
// };

// const SuppliedMaterials = () => {
//   const [companies, setCompanies] = useState([]);
//   const [allSites, setAllSites] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [sites, setSites] = useState([]);
//   const [dispatchGroups, setDispatchGroups] = useState([]);
//   const [selectedDispatchIndex, setSelectedDispatchIndex] = useState(-1);
//   const [filteredDispatchedMaterials, setFilteredDispatchedMaterials] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState("");
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedSite, setSelectedSite] = useState("");
//   const [nextDcNo, setNextDcNo] = useState("");
//   const [masterDcNo, setMasterDcNo] = useState("");
//   const [loading, setLoading] = useState({
//     companies: false,
//     projects: false,
//     sites: false,
//     materials: false,
//     masterDcNo: false,
//     dcNo: false,
//   });
//   const [error, setError] = useState(null);
//   const [commonDispatchDetails, setCommonDispatchDetails] = useState({
//     dc_no: "",
//     dispatch_date: "",
//     order_no: "",
//     vendor_code: "",
//     destination: "",
//     travel_expense: "",
//     vehicle_number: "",
//     driver_name: "",
//     driver_mobile: "",
//     master_dc_no: "",
//     next_dc_no: "",
//   });
//   const [showDispatchReport, setShowDispatchReport] = useState(false);

//   // Fetch companies
//   const fetchCompanies = async () => {
//     try {
//       setLoading((prev) => ({ ...prev, companies: true }));
//       const response = await axios.get(`${API_BASE_URL}/supply/companies`);
//       setCompanies(
//         Array.isArray(response.data)
//           ? response.data.map((company) => ({
//               id: company.company_id,
//               company_name: company.company_name,
//               vendor_code: company.vendor_code,
//             }))
//           : []
//       );
//     } catch (error) {
//       console.error("Error fetching companies:", error);
//       setError("Failed to load companies. Please try again.");
//     } finally {
//       setLoading((prev) => ({ ...prev, companies: false }));
//     }
//   };

//   // Fetch sites by company (and derive projects)
//   const fetchSitesByCompany = async () => {
//     if (!selectedCompany) return;
//     try {
//       setLoading((prev) => ({ ...prev, projects: true }));
//       const response = await axios.get(`${API_BASE_URL}/supply/sites-by-company/${selectedCompany}`);
//       const sitesData = Array.isArray(response.data.data) ? response.data.data : [];
//       setAllSites(sitesData);

//       // Derive unique projects from sites
//       const uniqueProjects = Array.from(
//         new Map(sitesData.map((site) => [site.pd_id, { id: site.pd_id, project_name: site.project_name }])).values()
//       );
//       setProjects(uniqueProjects);
//     } catch (error) {
//       console.error("Error fetching sites/projects:", error);
//       setError("Failed to load projects. Please try again.");
//       setProjects([]);
//       setAllSites([]);
//     } finally {
//       setLoading((prev) => ({ ...prev, projects: false }));
//     }
//   };

//   // Fetch master DC No based on company_id
//   const fetchMasterDcNo = async (company_id) => {
//     if (!company_id) return;
//     try {
//       setLoading((prev) => ({ ...prev, masterDcNo: true }));
//       const response = await axios.get(`${API_BASE_URL}/supply/master-dc-no`, {
//         params: { company_id },
//       });
//       if (response.data.status === "success" && response.data.data) {
//         setMasterDcNo(response.data.data.dc_no || "N/A");
//         setCommonDispatchDetails((prev) => ({
//           ...prev,
//           master_dc_no: response.data.data.dc_no || "N/A",
//         }));
//       } else {
//         setMasterDcNo("N/A");
//         setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "N/A" }));
//       }
//     } catch (error) {
//       console.error("Error fetching master DC No:", error);
//       setError("Failed to load master DC No. Please try again.");
//       setMasterDcNo("N/A");
//       setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "N/A" }));
//     } finally {
//       setLoading((prev) => ({ ...prev, masterDcNo: false }));
//     }
//   };

//   // Fetch next DC No based on site_id
//   const fetchNextDcNo = async (site_id) => {
//     if (!site_id) return;
//     try {
//       setLoading((prev) => ({ ...prev, dcNo: true }));
//       const response = await axios.get(`${API_BASE_URL}/supply/next-supply-dc-no`, {
//         params: { site_id },
//       });
//       if (response.data.status === "success" && response.data.data) {
//         const nextDcNoValue = response.data.data.next_dc_no != null ? response.data.data.next_dc_no.toString() : "N/A";
//         setNextDcNo(nextDcNoValue);
//         setCommonDispatchDetails((prev) => ({
//           ...prev,
//           next_dc_no: nextDcNoValue,
//         }));
//       } else {
//         setNextDcNo("N/A");
//         setCommonDispatchDetails((prev) => ({ ...prev, next_dc_no: "N/A" }));
//       }
//     } catch (error) {
//       console.error("Error fetching next DC No:", error);
//       setError("Failed to fetch next DC No. Please try again.");
//       setNextDcNo("N/A");
//       setCommonDispatchDetails((prev) => ({ ...prev, next_dc_no: "N/A" }));
//     } finally {
//       setLoading((prev) => ({ ...prev, dcNo: false }));
//     }
//   };

//   // Fetch dispatched materials for selected site
//   const fetchDispatchedMaterials = async () => {
//     if (!selectedSite) return;
//     try {
//       setLoading((prev) => ({ ...prev, materials: true }));
//       setError(null);
//       const response = await axios.get(`${API_BASE_URL}/supply/supply-dispatch-details`, {
//         params: { site_id: selectedSite },
//       });
//       const materials = response.data.data || [];

//       // Sort dispatch groups by dispatch_date
//       const groups = materials.sort(
//         (a, b) => new Date(a.dispatch_date) - new Date(b.dispatch_date)
//       );

//       setDispatchGroups(groups);

//       if (groups.length === 1) {
//         setSelectedDispatchIndex(0);
//         const group = groups[0];
//         setFilteredDispatchedMaterials(group.materials);

//         // Set common dispatch details from the first material's first transport
//         const firstMaterial = group.materials[0];
//         const firstTransport = firstMaterial.transport_details && firstMaterial.transport_details.length > 0
//           ? firstMaterial.transport_details[0]
//           : {};
//         setCommonDispatchDetails((prev) => ({
//           ...prev,
//           dc_no: firstMaterial.dc_no || "N/A",
//           dispatch_date: firstMaterial.dispatch_date
//             ? new Date(firstMaterial.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
//             : "N/A",
//           order_no: firstMaterial.order_no || "N/A",
//           vendor_code: firstMaterial.vendor_code || "N/A",
//           destination: firstTransport.destination || "N/A",
//           travel_expense: firstTransport.travel_expense
//             ? firstTransport.travel_expense.toLocaleString()
//             : "N/A",
//           vehicle_number: firstTransport.vehicle?.vehicle_number || "N/A",
//           driver_name: firstTransport.driver?.driver_name || "N/A",
//           driver_mobile: firstTransport.driver?.driver_mobile || "N/A",
//           master_dc_no: prev.master_dc_no || "N/A",
//           next_dc_no: prev.next_dc_no || "N/A",
//         }));
//       } else {
//         setSelectedDispatchIndex(-1);
//         setFilteredDispatchedMaterials([]);
//         setCommonDispatchDetails((prev) => ({
//           ...prev,
//           dc_no: "",
//           dispatch_date: "",
//           order_no: "",
//           vendor_code: "",
//           destination: "",
//           travel_expense: "",
//           vehicle_number: "",
//           driver_name: "",
//           driver_mobile: "",
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching dispatched materials:", error);
//       setError(
//         error.response?.data?.message ||
//         error.response?.data?.sqlMessage ||
//         "Failed to load dispatched materials. Please try again."
//       );
//       setDispatchGroups([]);
//       setFilteredDispatchedMaterials([]);
//       setSelectedDispatchIndex(-1);
//     } finally {
//       setLoading((prev) => ({ ...prev, materials: false }));
//     }
//   };

//   // Handle dispatch selection
//   const handleDispatchSelect = (index) => {
//     setSelectedDispatchIndex(index);
//     const group = dispatchGroups[index];
//     if (group) {
//       setFilteredDispatchedMaterials(group.materials);
//       const firstMaterial = group.materials[0];
//       const firstTransport = firstMaterial.transport_details && firstMaterial.transport_details.length > 0
//         ? firstMaterial.transport_details[0]
//         : {};
//       setCommonDispatchDetails((prev) => ({
//         ...prev,
//         dc_no: firstMaterial.dc_no || "N/A",
//         dispatch_date: firstMaterial.dispatch_date
//           ? new Date(firstMaterial.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
//           : "N/A",
//         order_no: firstMaterial.order_no || "N/A",
//         vendor_code: firstMaterial.vendor_code || "N/A",
//         destination: firstTransport.destination || "N/A",
//         travel_expense: firstTransport.travel_expense
//           ? firstTransport.travel_expense.toLocaleString()
//           : "N/A",
//         vehicle_number: firstTransport.vehicle?.vehicle_number || "N/A",
//         driver_name: firstTransport.driver?.driver_name || "N/A",
//         driver_mobile: firstTransport.driver?.driver_mobile || "N/A",
//         master_dc_no: prev.master_dc_no || "N/A",
//         next_dc_no: prev.next_dc_no || "N/A",
//       }));
//     }
//   };

//   // Handle company selection
//   const handleCompanyChange = async (value) => {
//     setSelectedCompany(value);
//     setSelectedProject("");
//     setSelectedSite("");
//     setSites([]);
//     setDispatchGroups([]);
//     setFilteredDispatchedMaterials([]);
//     setSelectedDispatchIndex(-1);
//     setMasterDcNo("");
//     setNextDcNo("");
//     setCommonDispatchDetails({
//       dc_no: "",
//       dispatch_date: "",
//       order_no: "",
//       vendor_code: "",
//       destination: "",
//       travel_expense: "",
//       vehicle_number: "",
//       driver_name: "",
//       driver_mobile: "",
//       master_dc_no: "",
//       next_dc_no: "",
//     });
//     setError(null);
//     setShowDispatchReport(false);
//     if (value) {
//       await fetchMasterDcNo(value);
//       await fetchSitesByCompany();
//     }
//   };

//   // Handle project selection
//   const handleProjectChange = async (value) => {
//     setSelectedProject(value);
//     setSelectedSite("");
//     setSites([]);
//     setDispatchGroups([]);
//     setFilteredDispatchedMaterials([]);
//     setSelectedDispatchIndex(-1);
//     setNextDcNo("");
//     setCommonDispatchDetails((prev) => ({
//       ...prev,
//       dc_no: "",
//       dispatch_date: "",
//       order_no: "",
//       vendor_code: "",
//       destination: "",
//       travel_expense: "",
//       vehicle_number: "",
//       driver_name: "",
//       driver_mobile: "",
//       next_dc_no: "",
//     }));
//     setError(null);
//     setShowDispatchReport(false);
//     if (value) {
//       const projectSites = allSites.filter((site) => site.pd_id === value);
//       setSites(
//         projectSites.map((site) => ({
//           id: site.site_id,
//           site_name: site.site_name,
//           po_number: site.po_number,
//           supply_code: site.supply_code,
//           location_name: site.location_name,
//         }))
//       );
//       if (projectSites.length === 1) {
//         setSelectedSite(projectSites[0].site_id);
//       }
//     }
//   };

//   // Handle site selection
//   const handleSiteChange = async (value) => {
//     setSelectedSite(value);
//     setSelectedDispatchIndex(-1);
//     setDispatchGroups([]);
//     setFilteredDispatchedMaterials([]);
//     setNextDcNo("");
//     setCommonDispatchDetails((prev) => ({
//       ...prev,
//       dc_no: "",
//       dispatch_date: "",
//       order_no: "",
//       vendor_code: "",
//       destination: "",
//       travel_expense: "",
//       vehicle_number: "",
//       driver_name: "",
//       driver_mobile: "",
//       next_dc_no: "",
//     }));
//     setError(null);
//     setShowDispatchReport(false);
//     if (value) {
//       await fetchDispatchedMaterials();
//       await fetchNextDcNo(value);
//     }
//   };

//   // Toggle Dispatch Report visibility
//   const handleViewDC = () => {
//     setShowDispatchReport(true);
//   };

//   // Format created_at as "Created At"
//   const formatCreatedAt = (created_at) => {
//     if (!created_at) return "N/A";
//     return new Date(created_at).toLocaleString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     if (selectedCompany) {
//       fetchSitesByCompany();
//       fetchMasterDcNo(selectedCompany);
//     } else {
//       setProjects([]);
//       setSites([]);
//       setSelectedProject("");
//       setSelectedSite("");
//       setDispatchGroups([]);
//       setFilteredDispatchedMaterials([]);
//       setSelectedDispatchIndex(-1);
//       setMasterDcNo("");
//       setNextDcNo("");
//       setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "", next_dc_no: "" }));
//     }
//   }, [selectedCompany]);

//   useEffect(() => {
//     if (selectedProject) {
//       const projectSites = allSites.filter((site) => site.pd_id === selectedProject);
//       setSites(
//         projectSites.map((site) => ({
//           id: site.site_id,
//           site_name: site.site_name,
//           po_number: site.po_number,
//           supply_code: site.supply_code,
//           location_name: site.location_name,
//         }))
//       );
//       if (projectSites.length === 1 && !selectedSite) {
//         setSelectedSite(projectSites[0].site_id);
//       }
//     } else {
//       setSites([]);
//       setSelectedSite("");
//       setDispatchGroups([]);
//       setFilteredDispatchedMaterials([]);
//       setSelectedDispatchIndex(-1);
//       setNextDcNo("");
//     }
//   }, [selectedProject, allSites]);

//   useEffect(() => {
//     if (selectedSite) {
//       fetchDispatchedMaterials();
//       fetchNextDcNo(selectedSite);
//     } else {
//       setDispatchGroups([]);
//       setFilteredDispatchedMaterials([]);
//       setSelectedDispatchIndex(-1);
//       setNextDcNo("");
//     }
//   }, [selectedSite]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 text-center">
//           <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
//             <Package className="h-8 w-8 text-teal-600" aria-hidden="true" />
//             Supplied Materials
//           </h2>
//           <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
//             View details of materials supplied to your project sites
//           </p>
//         </div>

//         {/* Selection Inputs */}
//         <div className="mb-6 bg-white p-6 rounded-xl shadow-lg">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-700">Select Company</label>
//               <SearchableDropdown
//                 options={companies}
//                 selectedValue={selectedCompany}
//                 onSelect={handleCompanyChange}
//                 placeholder="Select Company"
//                 searchKeys={["company_name", "vendor_code"]}
//                 disabled={loading.companies}
//                 loading={loading.companies}
//               />
//             </div>
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-700">Select Cost Center</label>
//               <SearchableDropdown
//                 options={projects}
//                 selectedValue={selectedProject}
//                 onSelect={handleProjectChange}
//                 placeholder="Select Cost Center"
//                 searchKeys={["project_name"]}
//                 disabled={loading.projects || !selectedCompany}
//                 loading={loading.projects}
//               />
//             </div>
//             <div className="space-y-1">
//               <label className="block text-sm font-medium text-gray-700">Select Site</label>
//               <SearchableDropdown
//                 options={sites}
//                 selectedValue={selectedSite}
//                 onSelect={handleSiteChange}
//                 placeholder="Select Site"
//                 searchKeys={["site_name", "po_number"]}
//                 disabled={loading.sites || !selectedProject}
//                 loading={loading.sites}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Error Alert */}
//         {error && (
//           <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md flex items-center justify-between transition-all duration-300">
//             <div className="flex items-center gap-2">
//               <FileText className="h-5 w-5 text-red-500" aria-hidden="true" />
//               <span>{error}</span>
//             </div>
//             <button
//               onClick={() => setError(null)}
//               className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
//               aria-label="Close error message"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         )}

//         {/* Loading State */}
//         {loading.materials ? (
//           <div className="flex justify-center items-center py-16">
//             <div className="flex flex-col items-center space-y-4">
//               <Loader2 className="h-12 w-12 text-teal-600 animate-spin" aria-hidden="true" />
//               <p className="text-gray-600 text-lg font-medium">Loading supplied materials...</p>
//             </div>
//           </div>
//         ) : !selectedCompany || !selectedProject || !selectedSite ? (
//           <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
//             <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
//             <p className="text-gray-600 text-lg font-medium">Please select a company, cost center, and site.</p>
//           </div>
//         ) : dispatchGroups.length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
//             <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
//             <p className="text-gray-600 text-lg font-medium">No supplied materials found for the selected criteria.</p>
//             <p className="text-gray-500 mt-2">Dispatch materials to this project and site to see them listed here.</p>
//           </div>
//         ) : (
//           <>
//             {/* Accordion for Dispatch Groups */}
//             <div className="space-y-4 mb-6">
//               {dispatchGroups.map((group, index) => (
//                 <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100">
//                   <button
//                     onClick={() => handleDispatchSelect(selectedDispatchIndex === index ? -1 : index)}
//                     className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
//                   >
//                     <div className="flex items-center space-x-6">
//                       <span>
//                         <span className="font-semibold text-blue-700">Master DC No:</span>{" "}
//                         <span className="text-blue-600">{commonDispatchDetails.master_dc_no || "N/A"}</span>
//                       </span>
//                       <span>
//                         <span className="font-semibold text-green-700">PO DC No:</span>{" "}
//                         <span className="text-green-600">{group.dc_no}</span>
//                       </span>
//                       <span>
//                         <span className="font-semibold text-purple-700">Dispatch Date:</span>{" "}
//                         <span className="text-purple-600">
//                           {group.dispatch_date
//                             ? new Date(group.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
//                             : "N/A"}
//                         </span>
//                       </span>
//                       <span>
//                         <span className="font-semibold text-teal-700">Created At:</span>{" "}
//                         <span className="text-teal-600">{formatCreatedAt(group.created_at)}</span>
//                       </span>
//                     </div>
//                     {selectedDispatchIndex === index ? (
//                       <ChevronUp className="h-5 w-5 text-gray-600" />
//                     ) : (
//                       <ChevronDown className="h-5 w-5 text-gray-600" />
//                     )}
//                   </button>
//                   {selectedDispatchIndex === index && (
//                     <div className="p-6">
//                       {/* View DC Button */}
//                       <div className="mb-4">
//                         <button
//                           onClick={handleViewDC}
//                           className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 shadow-md"
//                         >
//                           View DC
//                         </button>
//                       </div>

//                       {/* Common Dispatch Details */}
//                       <div className="mb-6 bg-white p-6 rounded-xl shadow-inner border border-gray-100">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispatch Details</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Master DC No</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.master_dc_no}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">PO DC No</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.dc_no}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Dispatch Date</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.dispatch_date}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Order No</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.order_no}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Vendor Code</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.vendor_code}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Destination</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.destination}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Travel Expense</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.travel_expense}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Vehicle Number</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.vehicle_number}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Driver Name</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.driver_name}</p>
//                           </div>
//                           <div>
//                             <p className="text-xs font-medium text-gray-600">Driver Mobile</p>
//                             <p className="text-sm text-gray-900">{commonDispatchDetails.driver_mobile}</p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Desktop Table View */}
//                       <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
//                         <div className="px-6 py-4 bg-gray-50 text-sm font-medium text-gray-700">
//                           Dispatch {group.dc_no}
//                         </div>
//                         <div className="overflow-x-auto">
//                           <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
//                               <tr>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
//                                   Material Name
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
//                                   Created At
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
//                                   Quantity & UOM
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
//                                   Dispatched Quantities
//                                 </th>
//                                 <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
//                                   Dispatch Cost
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                               {filteredDispatchedMaterials.map((dispatch) => (
//                                 <tr
//                                   key={dispatch.id}
//                                   className="hover:bg-teal-50 transition-colors duration-200"
//                                 >
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                                     <p className="font-medium">{dispatch.item_name || "N/A"}</p>
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                                     {formatCreatedAt(dispatch.created_at)}
//                                   </td>
//                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                                     <p>
//                                       {dispatch.dispatch_qty || dispatch.assigned_quantity || "0"}{" "}
//                                       {dispatch.uom_name || ""}
//                                     </p>
//                                   </td>
//                                   <td className="px-6 py-4 text-sm text-gray-700">
//                                     <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
//                                       {dispatch.dispatch_qty || "0"}
//                                     </span>
//                                   </td>
//                                   <td className="px-6 py-4 text-sm text-gray-700">
//                                     <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
//                                       {dispatch.dispatch_cost ? dispatch.dispatch_cost.toLocaleString() : "0"}
//                                     </span>
//                                   </td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>

//                       {/* Mobile Card View */}
//                       <div className="md:hidden space-y-6">
//                         <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
//                           <div className="mb-4 px-5 py-3 bg-gray-50 rounded-lg">
//                             <span className="text-sm font-medium text-gray-900">
//                               Dispatch {group.dc_no}
//                             </span>
//                           </div>
//                           {filteredDispatchedMaterials.map((dispatch) => (
//                             <div
//                               key={dispatch.id}
//                               className="p-5 space-y-4 border-b border-gray-200 last:border-b-0"
//                             >
//                               <div>
//                                 <p className="text-sm font-medium text-gray-700">Material Name</p>
//                                 <p className="text-sm text-gray-600">{dispatch.item_name || "N/A"}</p>
//                               </div>
//                               <div>
//                                 <p className="text-sm font-medium text-gray-700">Created At</p>
//                                 <p className="text-sm text-gray-600">{formatCreatedAt(dispatch.created_at)}</p>
//                               </div>
//                               <div>
//                                 <p className="text-sm font-medium text-gray-700">Quantity & UOM</p>
//                                 <p className="text-sm text-gray-600">
//                                   {dispatch.dispatch_qty || dispatch.assigned_quantity || "0"}{" "}
//                                   {dispatch.uom_name || ""}
//                                 </p>
//                               </div>
//                               <div>
//                                 <p className="text-sm font-medium text-gray-700">Dispatched Quantity</p>
//                                 <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
//                                   {dispatch.dispatch_qty || "0"}
//                                 </span>
//                               </div>
//                               <div>
//                                 <p className="text-sm font-medium text-gray-700">Dispatch Cost</p>
//                                 <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
//                                   {dispatch.dispatch_cost ? dispatch.dispatch_cost.toLocaleString() : "0"}
//                                 </span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* Dispatch Report */}
//             {showDispatchReport && (
//               <DispatchReport
//                 commonDispatchDetails={commonDispatchDetails}
//                 dispatchedMaterials={filteredDispatchedMaterials}
//                 onClose={() => setShowDispatchReport(false)}
//               />
//             )}
//           </>
//         )}
//       </div>
//       <style jsx>{`
//         .select__control {
//           border-color: #d1d5db;
//           min-height: 38px;
//         }
//         .select__control--is-focused {
//           border-color: #14b8a6;
//           box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2);
//         }
//         .select__menu {
//           z-index: 10;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default SuppliedMaterials;







































import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { Loader2, Package, FileText, X, ChevronDown, ChevronUp } from "lucide-react";
import DispatchReport from "../../components/DispatchReport";

// SearchableDropdown component (UNCHANGED)
const SearchableDropdown = ({ options, selectedValue, onSelect, placeholder, searchKeys, disabled, loading }) => {
  const selectOptions = useMemo(
    () =>
      options.map((option) => ({
        value: option.id,
        label: option[searchKeys[0]]?.toString() || "",
        subLabel: searchKeys[1] ? option[searchKeys[1]]?.toString() || "" : null,
      })),
    [options, searchKeys]
  );

  const selectedOption = useMemo(
    () => selectOptions.find((opt) => opt.value === selectedValue) || null,
    [selectOptions, selectedValue]
  );

  const handleChange = (selected) => {
    onSelect(selected ? selected.value : "");
  };

  const customFilter = (option, searchText) => {
    if (!searchText) return true;
    return (
      option.data.label?.toLowerCase().includes(searchText.toLowerCase()) ||
      option.data.subLabel?.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const CustomOption = ({ innerProps, data }) => (
    <div
      {...innerProps}
      className={`px-4 py-3 text-sm cursor-pointer hover:bg-teal-50 transition-colors ${
        selectedValue === data.value ? "bg-teal-100 text-teal-800" : "text-gray-700"
      }`}
    >
      <div className="font-medium">{data.label}</div>
      {data.subLabel && <div className="text-xs text-gray-500">{data.subLabel}</div>}
    </div>
  );

  const CustomSingleValue = ({ innerProps, data }) => (
    <div {...innerProps}>
      <div className="font-medium text-gray-900 text-sm">{data.label}</div>
      {data.subLabel && <div className="text-xs text-gray-500">{data.subLabel}</div>}
    </div>
  );

  useEffect(() => {
    if (options.length === 1 && !selectedValue) {
      onSelect(options[0].id);
    }
  }, [options, selectedValue, onSelect]);

  return (
    <Select
      options={selectOptions}
      value={selectedOption}
      onChange={handleChange}
      placeholder={placeholder}
      isDisabled={disabled || loading}
      isLoading={loading}
      filterOption={customFilter}
      components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
      isClearable
      className="text-sm"
      classNamePrefix="select"
      styles={{
        control: (provided, state) => ({
          ...provided,
          minHeight: "38px",
          borderColor: state.isFocused ? "#14b8a6" : "#d1d5db",
          boxShadow: state.isFocused ? "0 0 0 2px rgba(20, 184, 166, 0.2)" : "none",
          backgroundColor: "white",
        }),
        singleValue: (provided) => ({
          ...provided,
          margin: 0,
          padding: 0,
        }),
        menu: (provided) => ({
          ...provided,
          zIndex: 10,
        }),
      }}
    />
  );
};

const SuppliedMaterials = () => {
  const [companies, setCompanies] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [dispatchGroups, setDispatchGroups] = useState([]);
  const [selectedDispatchIndex, setSelectedDispatchIndex] = useState(-1);
  const [filteredDispatchedMaterials, setFilteredDispatchedMaterials] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [nextDcNo, setNextDcNo] = useState("");
  const [masterDcNo, setMasterDcNo] = useState("");
  const [loading, setLoading] = useState({
    companies: false,
    projects: false,
    sites: false,
    materials: false,
    masterDcNo: false,
    dcNo: false,
  });
  const [error, setError] = useState(null);
  const [commonDispatchDetails, setCommonDispatchDetails] = useState({
    dc_no: "",
    dispatch_date: "",
    order_no: "",
    vendor_code: "",
    destination: "",
    travel_expense: "",
    vehicle_number: "",
    driver_name: "",
    driver_mobile: "",
    master_dc_no: "",
    next_dc_no: "",
  });
  const [showDispatchReport, setShowDispatchReport] = useState(false);

  // ✅ UPDATED: Fetch ALL dispatch records (NO site_id parameter)
  const fetchAllDispatchedMaterials = async () => {
    try {
      setLoading((prev) => ({ ...prev, materials: true }));
      setError(null);
      
      // 🔥 CALL YOUR NEW "fetch ALL" ENDPOINT - NO site_id needed!
      const response = await axios.get(`${API_BASE_URL}/supply/supply-dispatch-details`);
      
      const materials = response.data.data || [];

      // Sort dispatch groups by dispatch_date (DESCENDING - most recent first)
      const groups = materials.sort(
        (a, b) => new Date(b.dispatch_date) - new Date(a.dispatch_date)
      );

      setDispatchGroups(groups);

      if (groups.length === 1) {
        setSelectedDispatchIndex(0);
        const group = groups[0];
        setFilteredDispatchedMaterials(group.materials);

        // Set common dispatch details from first material's first transport
        const firstMaterial = group.materials[0];
        const firstTransport = firstMaterial.transport_details?.[0] || {};
        setCommonDispatchDetails((prev) => ({
          ...prev,
          dc_no: firstMaterial.dc_no || "N/A",
          dispatch_date: firstMaterial.dispatch_date
            ? new Date(firstMaterial.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
            : "N/A",
          order_no: firstMaterial.order_no || "N/A",
          vendor_code: firstMaterial.vendor_code || "N/A",
          destination: firstTransport.destination || "N/A",
          travel_expense: firstTransport.travel_expense
            ? firstTransport.travel_expense.toLocaleString()
            : "N/A",
          vehicle_number: firstTransport.vehicle?.vehicle_number || "N/A",
          driver_name: firstTransport.driver?.driver_name || "N/A",
          driver_mobile: firstTransport.driver?.driver_mobile || "N/A",
          master_dc_no: prev.master_dc_no || "N/A",
          next_dc_no: prev.next_dc_no || "N/A",
        }));
      } else {
        setSelectedDispatchIndex(-1);
        setFilteredDispatchedMaterials([]);
        setCommonDispatchDetails((prev) => ({
          ...prev,
          dc_no: "",
          dispatch_date: "",
          order_no: "",
          vendor_code: "",
          destination: "",
          travel_expense: "",
          vehicle_number: "",
          driver_name: "",
          driver_mobile: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching ALL dispatched materials:", error);
      setError(
        error.response?.data?.message ||
        error.response?.data?.sqlMessage ||
        "Failed to load dispatched materials. Please try again."
      );
      setDispatchGroups([]);
      setFilteredDispatchedMaterials([]);
      setSelectedDispatchIndex(-1);
    } finally {
      setLoading((prev) => ({ ...prev, materials: false }));
    }
  };

  // Fetch companies (UNCHANGED)
  const fetchCompanies = async () => {
    try {
      setLoading((prev) => ({ ...prev, companies: true }));
      const response = await axios.get(`${API_BASE_URL}/supply/companies`);
      setCompanies(
        Array.isArray(response.data)
          ? response.data.map((company) => ({
              id: company.company_id,
              company_name: company.company_name,
              vendor_code: company.vendor_code,
            }))
          : []
      );
    } catch (error) {
      console.error("Error fetching companies:", error);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };

  // Fetch sites by company (UNCHANGED)
  const fetchSitesByCompany = async () => {
    if (!selectedCompany) return;
    try {
      setLoading((prev) => ({ ...prev, projects: true }));
      const response = await axios.get(`${API_BASE_URL}/supply/sites-by-company/${selectedCompany}`);
      const sitesData = Array.isArray(response.data.data) ? response.data.data : [];
      setAllSites(sitesData);

      const uniqueProjects = Array.from(
        new Map(sitesData.map((site) => [site.pd_id, { id: site.pd_id, project_name: site.project_name }])).values()
      );
      setProjects(uniqueProjects);
    } catch (error) {
      console.error("Error fetching sites/projects:", error);
      setError("Failed to load projects. Please try again.");
      setProjects([]);
      setAllSites([]);
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  };

  // Fetch master DC No (UNCHANGED)
  const fetchMasterDcNo = async (company_id) => {
    if (!company_id) return;
    try {
      setLoading((prev) => ({ ...prev, masterDcNo: true }));
      const response = await axios.get(`${API_BASE_URL}/supply/master-dc-no`, {
        params: { company_id },
      });
      if (response.data.status === "success" && response.data.data) {
        setMasterDcNo(response.data.data.dc_no || "N/A");
        setCommonDispatchDetails((prev) => ({
          ...prev,
          master_dc_no: response.data.data.dc_no || "N/A",
        }));
      } else {
        setMasterDcNo("N/A");
        setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "N/A" }));
      }
    } catch (error) {
      console.error("Error fetching master DC No:", error);
      setError("Failed to load master DC No. Please try again.");
      setMasterDcNo("N/A");
      setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "N/A" }));
    } finally {
      setLoading((prev) => ({ ...prev, masterDcNo: false }));
    }
  };

  // Fetch next DC No (UNCHANGED)
  const fetchNextDcNo = async (site_id) => {
    if (!site_id) return;
    try {
      setLoading((prev) => ({ ...prev, dcNo: true }));
      const response = await axios.get(`${API_BASE_URL}/supply/next-supply-dc-no`, {
        params: { site_id },
      });
      if (response.data.status === "success" && response.data.data) {
        const nextDcNoValue = response.data.data.next_dc_no != null ? response.data.data.next_dc_no.toString() : "N/A";
        setNextDcNo(nextDcNoValue);
        setCommonDispatchDetails((prev) => ({
          ...prev,
          next_dc_no: nextDcNoValue,
        }));
      } else {
        setNextDcNo("N/A");
        setCommonDispatchDetails((prev) => ({ ...prev, next_dc_no: "N/A" }));
      }
    } catch (error) {
      console.error("Error fetching next DC No:", error);
      setError("Failed to fetch next DC No. Please try again.");
      setNextDcNo("N/A");
      setCommonDispatchDetails((prev) => ({ ...prev, next_dc_no: "N/A" }));
    } finally {
      setLoading((prev) => ({ ...prev, dcNo: false }));
    }
  };

  // Handle dispatch selection (UNCHANGED)
  const handleDispatchSelect = (index) => {
    setSelectedDispatchIndex(index);
    const group = dispatchGroups[index];
    if (group) {
      setFilteredDispatchedMaterials(group.materials);
      const firstMaterial = group.materials[0];
      const firstTransport = firstMaterial.transport_details?.[0] || {};
      setCommonDispatchDetails((prev) => ({
        ...prev,
        dc_no: firstMaterial.dc_no || "N/A",
        dispatch_date: firstMaterial.dispatch_date
          ? new Date(firstMaterial.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
          : "N/A",
        order_no: firstMaterial.order_no || "N/A",
        vendor_code: firstMaterial.vendor_code || "N/A",
        destination: firstTransport.destination || "N/A",
        travel_expense: firstTransport.travel_expense
          ? firstTransport.travel_expense.toLocaleString()
          : "N/A",
        vehicle_number: firstTransport.vehicle?.vehicle_number || "N/A",
        driver_name: firstTransport.driver?.driver_name || "N/A",
        driver_mobile: firstTransport.driver?.driver_mobile || "N/A",
        master_dc_no: prev.master_dc_no || "N/A",
        next_dc_no: prev.next_dc_no || "N/A",
      }));
    }
  };

  // Handle company change (UPDATED - loads ALL dispatches immediately)
  const handleCompanyChange = async (value) => {
    setSelectedCompany(value);
    setSelectedProject("");
    setSelectedSite("");
    setSites([]);
    setDispatchGroups([]);
    setFilteredDispatchedMaterials([]);
    setSelectedDispatchIndex(-1);
    setMasterDcNo("");
    setNextDcNo("");
    setCommonDispatchDetails({
      dc_no: "",
      dispatch_date: "",
      order_no: "",
      vendor_code: "",
      destination: "",
      travel_expense: "",
      vehicle_number: "",
      driver_name: "",
      driver_mobile: "",
      master_dc_no: "",
      next_dc_no: "",
    });
    setError(null);
    setShowDispatchReport(false);
    
    if (value) {
      await fetchMasterDcNo(value);
      await fetchSitesByCompany();
      // 🔥 LOAD ALL DISPATCHES IMMEDIATELY after company selection
      await fetchAllDispatchedMaterials();
    }
  };

  // Handle project change (UPDATED - filter dispatches by project)
  const handleProjectChange = async (value) => {
    setSelectedProject(value);
    setSelectedSite("");
    setSites([]);
    setSelectedDispatchIndex(-1);
    setNextDcNo("");
    setCommonDispatchDetails((prev) => ({
      ...prev,
      dc_no: "",
      dispatch_date: "",
      order_no: "",
      vendor_code: "",
      destination: "",
      travel_expense: "",
      vehicle_number: "",
      driver_name: "",
      driver_mobile: "",
      next_dc_no: "",
    }));
    setError(null);
    setShowDispatchReport(false);
    
    if (value) {
      const projectSites = allSites.filter((site) => site.pd_id === value);
      setSites(
        projectSites.map((site) => ({
          id: site.site_id,
          site_name: site.site_name,
          po_number: site.po_number,
          supply_code: site.supply_code,
          location_name: site.location_name,
        }))
      );
      if (projectSites.length === 1) {
        setSelectedSite(projectSites[0].site_id);
      }
      // 🔥 FILTER existing dispatches by project
      const projectDispatches = dispatchGroups.filter(group => 
        group.materials[0]?.pd_id === value
      );
      setDispatchGroups(projectDispatches);
    }
  };

  // Handle site change (UPDATED - filter dispatches by site)
  const handleSiteChange = async (value) => {
    setSelectedSite(value);
    setSelectedDispatchIndex(-1);
    setNextDcNo("");
    setCommonDispatchDetails((prev) => ({
      ...prev,
      dc_no: "",
      dispatch_date: "",
      order_no: "",
      vendor_code: "",
      destination: "",
      travel_expense: "",
      vehicle_number: "",
      driver_name: "",
      driver_mobile: "",
      next_dc_no: "",
    }));
    setError(null);
    setShowDispatchReport(false);
    
    if (value) {
      await fetchNextDcNo(value);
      // 🔥 FILTER existing dispatches by site
      const siteDispatches = dispatchGroups.filter(group => 
        group.materials[0]?.site_id === value
      );
      setDispatchGroups(siteDispatches);
    }
  };

  // Toggle Dispatch Report (UNCHANGED)
  const handleViewDC = () => {
    setShowDispatchReport(true);
  };

  // Format created_at (UNCHANGED)
  const formatCreatedAt = (created_at) => {
    if (!created_at) return "N/A";
    return new Date(created_at).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Effects (UPDATED - fetch ALL on mount)
  useEffect(() => {
    fetchCompanies();
    // 🔥 LOAD ALL DISPATCHES ON PAGE LOAD
    fetchAllDispatchedMaterials();
  }, []);

  useEffect(() => {
    if (selectedCompany && !loading.materials) {
      fetchSitesByCompany();
      fetchMasterDcNo(selectedCompany);
    } else if (!selectedCompany) {
      setProjects([]);
      setSites([]);
      setSelectedProject("");
      setSelectedSite("");
      setDispatchGroups([]);
      setFilteredDispatchedMaterials([]);
      setSelectedDispatchIndex(-1);
      setMasterDcNo("");
      setNextDcNo("");
      setCommonDispatchDetails((prev) => ({ ...prev, master_dc_no: "", next_dc_no: "" }));
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject) {
      const projectSites = allSites.filter((site) => site.pd_id === selectedProject);
      setSites(
        projectSites.map((site) => ({
          id: site.site_id,
          site_name: site.site_name,
          po_number: site.po_number,
          supply_code: site.supply_code,
          location_name: site.location_name,
        }))
      );
      if (projectSites.length === 1 && !selectedSite) {
        setSelectedSite(projectSites[0].site_id);
      }
    } else {
      setSites([]);
      setSelectedSite("");
      setDispatchGroups([]);
      setFilteredDispatchedMaterials([]);
      setSelectedDispatchIndex(-1);
      setNextDcNo("");
    }
  }, [selectedProject, allSites]);

  // RENDER (UPDATED - show dispatch summary)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
            <Package className="h-8 w-8 text-teal-600" aria-hidden="true" />
            All Supplied Materials
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            View details of materials supplied to all project sites across all companies
          </p>
        </div>

        {/* Selection Inputs */}
        {/* <div className="mb-6 bg-white p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Filter by Company</label>
              <SearchableDropdown
                options={companies}
                selectedValue={selectedCompany}
                onSelect={handleCompanyChange}
                placeholder="All Companies"
                searchKeys={["company_name", "vendor_code"]}
                disabled={loading.companies}
                loading={loading.companies}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Filter by Cost Center</label>
              <SearchableDropdown
                options={projects}
                selectedValue={selectedProject}
                onSelect={handleProjectChange}
                placeholder="All Projects"
                searchKeys={["project_name"]}
                disabled={loading.projects || !selectedCompany}
                loading={loading.projects}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Filter by Site</label>
              <SearchableDropdown
                options={sites}
                selectedValue={selectedSite}
                onSelect={handleSiteChange}
                placeholder="All Sites"
                searchKeys={["site_name", "po_number"]}
                disabled={loading.sites || !selectedProject}
                loading={loading.sites}
              />
            </div>
          </div>
        </div> */}

        {/* Dispatch Summary */}
        {dispatchGroups.length > 0 && (
          <div className="mb-6 bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-teal-600" />
                <div>
                  <p className="text-sm font-medium text-teal-900">
                    Total Dispatch Groups: <span className="font-bold">{dispatchGroups.length}</span>
                  </p>
                  <p className="text-xs text-teal-700">
                    Total Materials: <span className="font-semibold">{dispatchGroups.reduce((total, group) => total + group.materials.length, 0)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" aria-hidden="true" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
              aria-label="Close error message"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading.materials ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-teal-600 animate-spin" aria-hidden="true" />
              <p className="text-gray-600 text-lg font-medium">Loading all supplied materials...</p>
            </div>
          </div>
        ) : dispatchGroups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600 text-lg font-medium">No supplied materials found.</p>
            <p className="text-gray-500 mt-2">Dispatch materials to view them here.</p>
          </div>
        ) : (
          <>
            {/* Accordion for Dispatch Groups */}
            <div className="space-y-4 mb-6">
              {dispatchGroups.map((group, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <button
                    onClick={() => handleDispatchSelect(selectedDispatchIndex === index ? -1 : index)}
                    className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-6 flex-wrap gap-4">
                      <span>
                        <span className="font-semibold text-blue-700">DC No:</span>{" "}
                        <span className="text-blue-600">{group.dc_no}</span>
                      </span>
                      <span>
                        <span className="font-semibold text-purple-700">Date:</span>{" "}
                        <span className="text-purple-600">
                          {group.dispatch_date
                            ? new Date(group.dispatch_date).toLocaleDateString("en-US", { dateStyle: "medium" })
                            : "N/A"}
                        </span>
                      </span>
                      <span className="text-sm bg-teal-100 px-3 py-1 rounded-full">
                        {group.materials.length} materials
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatCreatedAt(group.created_at)}
                      </span>
                    </div>
                    {selectedDispatchIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  {selectedDispatchIndex === index && (
                    <div className="p-6">
                      {/* View DC Button */}
                      <div className="mb-4">
                        <button
                          onClick={handleViewDC}
                          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200 shadow-md"
                        >
                          View DC Report
                        </button>
                      </div>

                      {/* Common Dispatch Details */}
                      <div className="mb-6 bg-white p-6 rounded-xl shadow-inner border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispatch Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-600">PO DC No</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.dc_no}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Dispatch Date</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.dispatch_date}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Order No</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.order_no}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Vendor Code</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.vendor_code}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Destination</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.destination}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Travel Expense</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.travel_expense}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Vehicle</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.vehicle_number}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Driver</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.driver_name}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Driver Mobile</p>
                            <p className="text-sm text-gray-900">{commonDispatchDetails.driver_mobile}</p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 text-sm font-medium text-gray-700">
                          Dispatch {group.dc_no} - {group.materials.length} Materials
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                              <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Material Name
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Created At
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Quantity & UOM
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Dispatched Qty
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wider">
                                  Dispatch Cost
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredDispatchedMaterials.map((dispatch) => (
                                <tr
                                  key={dispatch.id}
                                  className="hover:bg-teal-50 transition-colors duration-200"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <p className="font-medium">{dispatch.item_name || "N/A"}</p>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {formatCreatedAt(dispatch.created_at)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    <p>
                                      {dispatch.dispatch_qty || dispatch.assigned_quantity || "0"}{" "}
                                      {dispatch.uom_name || ""}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                      {dispatch.dispatch_qty || "0"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-700">
                                    <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                      {dispatch.dispatch_cost ? dispatch.dispatch_cost.toLocaleString() : "0"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-6">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
                          <div className="mb-4 px-5 py-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-900">
                              Dispatch {group.dc_no} ({group.materials.length} materials)
                            </span>
                          </div>
                          {filteredDispatchedMaterials.map((dispatch) => (
                            <div
                              key={dispatch.id}
                              className="p-5 space-y-4 border-b border-gray-200 last:border-b-0"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-700">Material Name</p>
                                <p className="text-sm text-gray-600">{dispatch.item_name || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Created At</p>
                                <p className="text-sm text-gray-600">{formatCreatedAt(dispatch.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Quantity & UOM</p>
                                <p className="text-sm text-gray-600">
                                  {dispatch.dispatch_qty || dispatch.assigned_quantity || "0"}{" "}
                                  {dispatch.uom_name || ""}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Dispatched Quantity</p>
                                <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                  {dispatch.dispatch_qty || "0"}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Dispatch Cost</p>
                                <span className="text-sm bg-teal-50 px-3 py-1 rounded-md">
                                  {dispatch.dispatch_cost ? dispatch.dispatch_cost.toLocaleString() : "0"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dispatch Report */}
            {showDispatchReport && (
              <DispatchReport
                commonDispatchDetails={commonDispatchDetails}
                dispatchedMaterials={filteredDispatchedMaterials}
                onClose={() => setShowDispatchReport(false)}
              />
            )}
          </>
        )}
      </div>
      <style jsx>{`
        .select__control {
          border-color: #d1d5db;
          min-height: 38px;
        }
        .select__control--is-focused {
          border-color: #14b8a6;
          box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2);
        }
        .select__menu {
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default SuppliedMaterials;

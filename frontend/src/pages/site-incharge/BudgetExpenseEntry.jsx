import { API_BASE_URL } from "../../config/api.js";
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { BookCheck, Save, Search, ChevronDown, X } from "lucide-react";
// import { useParams } from "react-router-dom";

// const BudgetExpenseEntry = () => {
//   const { encodedUserId } = useParams();
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [sites, setSites] = useState([]);
//   const [selectedSite, setSelectedSite] = useState(null);
//   const [workDescOptions, setWorkDescOptions] = useState([]);
//   const [selectedWorkDesc, setSelectedWorkDesc] = useState(null);
//   const [budgetData, setBudgetData] = useState([]);
//   const [filteredBudgetData, setFilteredBudgetData] = useState([]);
//   const [expenseDetails, setExpenseDetails] = useState({});
//   const [expenseInputs, setExpenseInputs] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [submitting, setSubmitting] = useState(false);
//   const [searchQueryCompany, setSearchQueryCompany] = useState("");
//   const [searchQueryProject, setSearchQueryProject] = useState("");
//   const [searchQuerySite, setSearchQuerySite] = useState("");
//   const [searchQueryWorkDesc, setSearchQueryWorkDesc] = useState("");
//   const [dropdownOpenCompany, setDropdownOpenCompany] = useState(false);
//   const [dropdownOpenProject, setDropdownOpenProject] = useState(false);
//   const [dropdownOpenSite, setDropdownOpenSite] = useState(false);
//   const [dropdownOpenWorkDesc, setDropdownOpenWorkDesc] = useState(false);
//   const dropdownRefCompany = useRef(null);
//   const dropdownRefProject = useRef(null);
//   const dropdownRefSite = useRef(null);
//   const dropdownRefWorkDesc = useRef(null);

//   // Call calculate-labour-budget API on component mount
//   useEffect(() => {
//     const callCalculateLabourBudget = async () => {
//       try {
//         await axios.get(`${API_BASE_URL}/site-incharge/calculate-labour-budget`);
//         // No need to handle response, as data is stored in actual_budget table
//       } catch (error) {
//         console.error("Error calling calculate-labour-budget API:", error.message);
//         // Silently log error to avoid disrupting user experience
//       }
//     };

//     callCalculateLabourBudget();
//   }, []); // Empty dependency array ensures it runs only on mount

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     if (selectedCompany) {
//       fetchProjectsForCompany(selectedCompany);
//     } else {
//       setProjects([]);
//       setSelectedProject(null);
//       setSites([]);
//       setSelectedSite(null);
//       setWorkDescOptions([]);
//       setSelectedWorkDesc(null);
//       setBudgetData([]);
//       setFilteredBudgetData([]);
//       setExpenseDetails({});
//     }
//   }, [selectedCompany]);

//   useEffect(() => {
//     if (selectedProject) {
//       const selectedProjectData = projects.find(project => project.project_id === selectedProject);
//       const siteOptions = selectedProjectData ? selectedProjectData.sites.map(site => ({
//         value: site.site_id,
//         label: `${site.site_name} (PO: ${site.po_number})`,
//         site_id: site.site_id
//       })) : [];
//       setSites(siteOptions);
//       setSelectedSite(null);
//       setWorkDescOptions([]);
//       setSelectedWorkDesc(null);
//       setBudgetData([]);
//       setFilteredBudgetData([]);
//       setExpenseDetails({});
//     }
//   }, [selectedProject, projects]);

//   useEffect(() => {
//     if (selectedSite) {
//       fetchWorkDescriptions(selectedSite.value);
//       fetchBudgetDetails(selectedSite.value);
//     } else {
//       setWorkDescOptions([]);
//       setSelectedWorkDesc(null);
//       setBudgetData([]);
//       setFilteredBudgetData([]);
//       setExpenseDetails({});
//     }
//   }, [selectedSite]);

//   useEffect(() => {
//     if (selectedWorkDesc && budgetData.length > 0) {
//       const filtered = budgetData.filter(item => item.work_descriptions === selectedWorkDesc.desc_name);
//       setFilteredBudgetData(filtered);
//     } else {
//       setFilteredBudgetData([]);
//     }
//   }, [selectedWorkDesc, budgetData]);

//   useEffect(() => {
//     if (selectedDate && filteredBudgetData.length > 0) {
//       filteredBudgetData.forEach(budget => {
//         fetchExpenseDetails(budget.id);
//       });
//     }
//   }, [selectedDate, filteredBudgetData]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRefCompany.current && !dropdownRefCompany.current.contains(event.target)) {
//         setDropdownOpenCompany(false);
//       }
//       if (dropdownRefProject.current && !dropdownRefProject.current.contains(event.target)) {
//         setDropdownOpenProject(false);
//       }
//       if (dropdownRefSite.current && !dropdownRefSite.current.contains(event.target)) {
//         setDropdownOpenSite(false);
//       }
//       if (dropdownRefWorkDesc.current && !dropdownRefWorkDesc.current.contains(event.target)) {
//         setDropdownOpenWorkDesc(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const fetchCompanies = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/project/companies`);
//       setCompanies(res.data || []);
//     } catch (error) {
//       setError("Failed to fetch companies");
//       toast.error("Failed to fetch companies");
//     }
//   };

//   const fetchProjectsForCompany = async (companyId) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/project/projects-with-sites/${companyId}`);
//       setProjects(res.data || []);
//     } catch (error) {
//       setError("Failed to fetch projects");
//       toast.error("Failed to fetch projects");
//     }
//   };

//   const fetchWorkDescriptions = async (siteId) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/site-incharge/budget-work-descriptions/${siteId}`);
//       setWorkDescOptions(res.data.data || []);
//     } catch (error) {
//       setError("Failed to fetch work descriptions");
//       toast.error("Failed to fetch work descriptions");
//     }
//   };

//   const fetchBudgetDetails = async (siteId) => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/site-incharge/budget-details?site_id=${siteId}`
//       );
//       setBudgetData(response.data.data || []);
//       setError(null);
//     } catch (err) {
//       setError("Failed to fetch budget details");
//       toast.error("Failed to fetch budget details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchExpenseDetails = async (budgetId) => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/site-incharge/budget-expense-details?actual_budget_id=${budgetId}&date=${selectedDate}`
//       );
//       setExpenseDetails(prev => ({
//         ...prev,
//         [budgetId]: response.data.data
//       }));
//     } catch (err) {
//       toast.error("Failed to fetch expense details");
//     }
//   };

//   const handleSaveExpense = async (budgetId) => {
//     const inputData = expenseInputs[budgetId];
//     if (!inputData) return;

//     try {
//       setSubmitting(true);
//       if (!encodedUserId) {
//         toast.error("User ID is missing from URL");
//         return;
//       }
//       let user_id;
//       try {
//         user_id = atob(encodedUserId);
//         if (!/^\d+$/.test(user_id)) throw new Error();
//       } catch {
//         toast.error("Invalid User ID in URL");
//         return;
//       }

//       const response = await axios.post(`${API_BASE_URL}/site-incharge/save-budget-expense`, {
//         actual_budget_id: budgetId,
//         entry_date: selectedDate,
//         actual_value: inputData.actual_value !== "" ? parseFloat(inputData.actual_value) : null,
//         remarks: inputData.remarks || null,
//         created_by: parseInt(user_id)
//       });
//       toast.success(response.data.message);
//       setExpenseInputs(prev => ({ ...prev, [budgetId]: {} }));
//       fetchExpenseDetails(budgetId);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save budget expense");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleInputChange = (budgetId, field, value) => {
//     setExpenseInputs(prev => ({
//       ...prev,
//       [budgetId]: {
//         ...prev[budgetId],
//         [field]: value
//       }
//     }));
//   };

//   const handleCompanySelect = (companyId) => {
//     setSelectedCompany(companyId);
//     setDropdownOpenCompany(false);
//     setSearchQueryCompany("");
//   };

//   const handleProjectSelect = (projectId) => {
//     setSelectedProject(projectId);
//     setDropdownOpenProject(false);
//     setSearchQueryProject("");
//   };

//   const handleSiteSelect = (site) => {
//     setSelectedSite(site);
//     setDropdownOpenSite(false);
//     setSearchQuerySite("");
//   };

//   const handleWorkDescSelect = (descId, descName) => {
//     setSelectedWorkDesc({ desc_id: descId, desc_name: descName });
//     setDropdownOpenWorkDesc(false);
//     setSearchQueryWorkDesc("");
//   };

//   const handleSearchChangeCompany = (e) => setSearchQueryCompany(e.target.value.toLowerCase());
//   const handleSearchChangeProject = (e) => setSearchQueryProject(e.target.value.toLowerCase());
//   const handleSearchChangeSite = (e) => setSearchQuerySite(e.target.value.toLowerCase());
//   const handleSearchChangeWorkDesc = (e) => setSearchQueryWorkDesc(e.target.value.toLowerCase());

//   const filteredCompanies = companies.filter(
//     (company) => company.company_name.toLowerCase().includes(searchQueryCompany)
//   );

//   const filteredProjects = projects.map(project => ({
//     value: project.project_id,
//     label: project.project_name
//   })).filter(
//     (project) => project.label.toLowerCase().includes(searchQueryProject)
//   );

//   const filteredSites = sites.filter(
//     (site) => site.label.toLowerCase().includes(searchQuerySite)
//   );

//   const filteredWorkDescs = workDescOptions.filter(
//     (option) => option.desc_name.toLowerCase().includes(searchQueryWorkDesc)
//   );

//   const getStatus = (budget, details) => {
//     const cumulative = parseFloat(details.cumulative?.actual_value) || 0;
//     const splitted = parseFloat(budget.splitted_budget) || 0;
//     if (cumulative > splitted) {
//       return { text: 'Exceeded', color: 'red-700' };
//     } else if (Math.abs(cumulative - splitted) < 0.01) {
//       return { text: 'Completed', color: 'green-700' };
//     } else {
//       return { text: 'In Progress', color: 'blue-700' };
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
//       <div className="w-full max-w-md">
//         <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
//           Budget Expense Entry
//         </h1>

//         <div className="mb-6 flex flex-col gap-4">
//           <div className="text-sm font-medium text-gray-700">Select Date:</div>
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="w-full px-3 py-2 bg-white border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           />
//         </div>

//         <div className="mb-6 grid grid-cols-1 gap-4">
//           {/* Company Dropdown */}
//           <div className="flex-1" ref={dropdownRefCompany}>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
//             <div className="relative">
//               {dropdownOpenCompany ? (
//                 <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
//                   <div className="flex items-center px-3 py-2 border-b border-gray-200">
//                     <Search className="h-5 w-5 text-gray-400" />
//                     <input
//                       type="text"
//                       autoFocus
//                       value={searchQueryCompany}
//                       onChange={handleSearchChangeCompany}
//                       placeholder="Search companies..."
//                       className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
//                     />
//                     <button
//                       onClick={() => setDropdownOpenCompany(false)}
//                       className="ml-2 text-gray-500 hover:text-gray-700"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto">
//                     {filteredCompanies.length === 0 ? (
//                       <div className="px-4 py-3 text-gray-500 text-sm">No matching companies found</div>
//                     ) : (
//                       filteredCompanies.map((company) => (
//                         <div
//                           key={company.company_id}
//                           onClick={() => handleCompanySelect(company.company_id)}
//                           className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
//                             selectedCompany === company.company_id ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
//                           }`}
//                         >
//                           <div className="font-medium">{company.company_name}</div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setDropdownOpenCompany(true)}
//                   className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
//                 >
//                   <div>
//                     {selectedCompany ? (
//                       <div className="font-medium text-gray-900 text-sm">
//                         {companies.find((comp) => comp.company_id === selectedCompany)?.company_name}
//                       </div>
//                     ) : (
//                       <span className="text-gray-500 text-sm">Select a company...</span>
//                     )}
//                   </div>
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Project Dropdown */}
//           <div className="flex-1" ref={dropdownRefProject}>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
//             <div className="relative">
//               {dropdownOpenProject ? (
//                 <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
//                   <div className="flex items-center px-3 py-2 border-b border-gray-200">
//                     <Search className="h-5 w-5 text-gray-400" />
//                     <input
//                       type="text"
//                       autoFocus
//                       value={searchQueryProject}
//                       onChange={handleSearchChangeProject}
//                       placeholder="Search projects..."
//                       className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
//                     />
//                     <button
//                       onClick={() => setDropdownOpenProject(false)}
//                       className="ml-2 text-gray-500 hover:text-gray-700"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto">
//                     {filteredProjects.length === 0 ? (
//                       <div className="px-4 py-3 text-gray-500 text-sm">No matching projects found</div>
//                     ) : (
//                       filteredProjects.map((project) => (
//                         <div
//                           key={project.value}
//                           onClick={() => handleProjectSelect(project.value)}
//                           className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
//                             selectedProject === project.value ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
//                           }`}
//                         >
//                           <div className="font-medium">{project.label}</div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setDropdownOpenProject(true)}
//                   disabled={!selectedCompany}
//                   className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <div>
//                     {selectedProject ? (
//                       <div className="font-medium text-gray-900 text-sm">
//                         {projects.find((proj) => proj.project_id === selectedProject)?.project_name}
//                       </div>
//                     ) : (
//                       <span className="text-gray-500 text-sm">Select a project...</span>
//                     )}
//                   </div>
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Site Dropdown */}
//           <div className="flex-1" ref={dropdownRefSite}>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Select Site</label>
//             <div className="relative">
//               {dropdownOpenSite ? (
//                 <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
//                   <div className="flex items-center px-3 py-2 border-b border-gray-200">
//                     <Search className="h-5 w-5 text-gray-400" />
//                     <input
//                       type="text"
//                       autoFocus
//                       value={searchQuerySite}
//                       onChange={handleSearchChangeSite}
//                       placeholder="Search sites or PO numbers..."
//                       className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
//                     />
//                     <button
//                       onClick={() => setDropdownOpenSite(false)}
//                       className="ml-2 text-gray-500 hover:text-gray-700"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto">
//                     {filteredSites.length === 0 ? (
//                       <div className="px-4 py-3 text-gray-500 text-sm">No matching sites found</div>
//                     ) : (
//                       filteredSites.map((site) => (
//                         <div
//                           key={site.value}
//                           onClick={() => handleSiteSelect(site)}
//                           className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
//                             selectedSite?.value === site.value ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
//                           }`}
//                         >
//                           <div className="font-medium">{site.label}</div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setDropdownOpenSite(true)}
//                   disabled={!selectedProject}
//                   className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <div>
//                     {selectedSite ? (
//                       <div className="font-medium text-gray-900 text-sm">
//                         {selectedSite.label}
//                       </div>
//                     ) : (
//                       <span className="text-gray-500 text-sm">Select a site...</span>
//                     )}
//                   </div>
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Work Description Dropdown */}
//           <div className="flex-1" ref={dropdownRefWorkDesc}>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Select Work Description</label>
//             <div className="relative">
//               {dropdownOpenWorkDesc ? (
//                 <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
//                   <div className="flex items-center px-3 py-2 border-b border-gray-200">
//                     <Search className="h-5 w-5 text-gray-400" />
//                     <input
//                       type="text"
//                       autoFocus
//                       value={searchQueryWorkDesc}
//                       onChange={handleSearchChangeWorkDesc}
//                       placeholder="Search work descriptions..."
//                       className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
//                     />
//                     <button
//                       onClick={() => setDropdownOpenWorkDesc(false)}
//                       className="ml-2 text-gray-500 hover:text-gray-700"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                   <div className="max-h-60 overflow-y-auto">
//                     {filteredWorkDescs.length === 0 ? (
//                       <div className="px-4 py-3 text-gray-500 text-sm">No matching work descriptions found</div>
//                     ) : (
//                       filteredWorkDescs.map((option) => (
//                         <div
//                           key={option.desc_id}
//                           onClick={() => handleWorkDescSelect(option.desc_id, option.desc_name)}
//                           className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
//                             selectedWorkDesc?.desc_id === option.desc_id ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
//                           }`}
//                         >
//                           <div className="font-medium">{option.desc_name}</div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setDropdownOpenWorkDesc(true)}
//                   disabled={!selectedSite}
//                   className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <div>
//                     {selectedWorkDesc ? (
//                       <div className="font-medium text-gray-900 text-sm">
//                         {selectedWorkDesc.desc_name}
//                       </div>
//                     ) : (
//                       <span className="text-gray-500 text-sm">Select work description...</span>
//                     )}
//                   </div>
//                   <ChevronDown className="h-5 w-5 text-gray-400" />
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {loading && <div className="text-center py-6 text-sm text-gray-500">Loading...</div>}
//         {error && <div className="text-center py-6 text-sm text-red-600">{error}</div>}

//         {filteredBudgetData.length > 0 ? (
//           <div className="space-y-4">
//             {filteredBudgetData.map(budget => {
//               if (budget.overhead_id === 1 || budget.overhead_id === 2) {
//                 return null; // Don't display the card for overhead_id 1 (material) or 2 (labour)
//               }
//               const displayData = expenseDetails[budget.id] || {
//                 cumulative: { actual_value: parseFloat(budget.actual_value) || 0 },
//                 entries: [
//                   {
//                     id: budget.id,
//                     actual_value: parseFloat(budget.actual_value) || 0,
//                     remarks: budget.remarks || "No remarks",
//                     created_at: `${selectedDate}T10:06:00`
//                   }
//                 ]
//               };
//               const splittedBudget = parseFloat(budget.splitted_budget) || 0;
//               const cumulativeValue = parseFloat(displayData.cumulative.actual_value) || 0;
//               const status = getStatus(budget, displayData);

//               return (
//                 <div key={budget.id} className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
//                   <div className="font-semibold text-base text-gray-800 mb-2">
//                     {budget.expense_name}
//                   </div>
//                   <div className="mb-3">
//                     <h4 className="font-medium text-sm text-gray-700 mb-1">Splitted Budget</h4>
//                     <div className="text-sm text-gray-600">
//                       {splittedBudget.toFixed(2)}
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <h4 className="font-medium text-sm text-gray-700 mb-1">Progress as of {selectedDate}</h4>
//                     <div className="text-sm text-gray-600">
//                       Actual: {cumulativeValue.toFixed(2)} / {splittedBudget.toFixed(2)}
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <h4 className="font-medium text-sm text-gray-700 mb-1">Status</h4>
//                     <div className={`p-2 border rounded-lg text-${status.color} flex items-center text-sm`}>
//                       {status.text}
//                       {status.text === 'Completed' && <BookCheck size={14} className="ml-2" />}
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <h4 className="font-medium text-sm text-gray-700 mb-1">Entries on {selectedDate}</h4>
//                     {displayData.entries.length === 0 ? (
//                       <div className="text-sm text-gray-500">No entries</div>
//                     ) : (
//                       displayData.entries.map((entry) => (
//                         <div key={entry.id} className="text-sm text-gray-700 space-y-1">
//                           <div>
//                             At {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
//                             {' '}Actual: {(parseFloat(entry.actual_value) || 0).toFixed(2)} ({entry.remarks})
//                           </div>
//                         </div>
//                       ))
//                     )}
//                   </div>

//                   <div className="space-y-3">
//                     <div>
//                       <h5 className="text-sm font-medium text-gray-600 capitalize mb-1">Actual Value</h5>
//                       <div className="flex flex-col space-y-2">
//                         <input
//                           type="number"
//                           placeholder="Expense Value"
//                           value={expenseInputs[budget.id]?.actual_value || ""}
//                           onChange={(e) => handleInputChange(budget.id, 'actual_value', e.target.value)}
//                           className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                           min="0"
//                           step="0.01"
//                         />
//                         <input
//                           type="text"
//                           placeholder="Remarks"
//                           value={expenseInputs[budget.id]?.remarks || ""}
//                           onChange={(e) => handleInputChange(budget.id, 'remarks', e.target.value)}
//                           className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                         />
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => handleSaveExpense(budget.id)}
//                       className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
//                       disabled={
//                         submitting ||
//                         !expenseInputs[budget.id] ||
//                         Object.values(expenseInputs[budget.id] || {}).every(val => val === "" || val === null)
//                       }
//                     >
//                       <Save size={14} className="mr-2" />
//                       Save Expense
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           !loading && <div className="text-center py-6 text-sm text-gray-500">No budget data found for the selected criteria.</div>
//         )}
//       </div>

//       <ToastContainer
//         position="top-center"
//         autoClose={2500}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//         className="w-full max-w-md mx-auto"
//       />
//     </div>
//   );
// };

// export default BudgetExpenseEntry;
































import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BookCheck, Save, Search, ChevronDown, X, Edit } from "lucide-react";
import { useParams } from "react-router-dom";

const BudgetExpenseEntry = () => {
  const { encodedUserId } = useParams();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [workDescOptions, setWorkDescOptions] = useState([]);
  const [selectedWorkDesc, setSelectedWorkDesc] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [filteredBudgetData, setFilteredBudgetData] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState({});
  const [expenseInputs, setExpenseInputs] = useState({});
  const [editingEntryId, setEditingEntryId] = useState({}); // {budgetId: entryId}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQueryCompany, setSearchQueryCompany] = useState("");
  const [searchQueryProject, setSearchQueryProject] = useState("");
  const [searchQuerySite, setSearchQuerySite] = useState("");
  const [searchQueryWorkDesc, setSearchQueryWorkDesc] = useState("");
  const [dropdownOpenCompany, setDropdownOpenCompany] = useState(false);
  const [dropdownOpenProject, setDropdownOpenProject] = useState(false);
  const [dropdownOpenSite, setDropdownOpenSite] = useState(false);
  const [dropdownOpenWorkDesc, setDropdownOpenWorkDesc] = useState(false);
  const dropdownRefCompany = useRef(null);
  const dropdownRefProject = useRef(null);
  const dropdownRefSite = useRef(null);
  const dropdownRefWorkDesc = useRef(null);

  // Call calculate-labour-budget API on component mount
  useEffect(() => {
    const callCalculateLabourBudget = async () => {
      try {
        await axios.get(`${API_BASE_URL}/site-incharge/calculate-labour-budget`);
        // No need to handle response, as data is stored in actual_budget table
      } catch (error) {
        console.error("Error calling calculate-labour-budget API:", error.message);
        // Silently log error to avoid disrupting user experience
      }
    };

    callCalculateLabourBudget();
  }, []); // Empty dependency array ensures it runs only on mount

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchProjectsForCompany(selectedCompany);
    } else {
      setProjects([]);
      setSelectedProject(null);
      setSites([]);
      setSelectedSite(null);
      setWorkDescOptions([]);
      setSelectedWorkDesc(null);
      setBudgetData([]);
      setFilteredBudgetData([]);
      setExpenseDetails({});
      setEditingEntryId({});
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject) {
      const selectedProjectData = projects.find(project => project.project_id === selectedProject);
      const siteOptions = selectedProjectData ? selectedProjectData.sites.map(site => ({
        value: site.site_id,
        label: `${site.site_name} (PO: ${site.po_number})`,
        site_id: site.site_id
      })) : [];
      setSites(siteOptions);
      setSelectedSite(null);
      setWorkDescOptions([]);
      setSelectedWorkDesc(null);
      setBudgetData([]);
      setFilteredBudgetData([]);
      setExpenseDetails({});
      setEditingEntryId({});
    }
  }, [selectedProject, projects]);

  useEffect(() => {
    if (selectedSite) {
      fetchWorkDescriptions(selectedSite.value);
      fetchBudgetDetails(selectedSite.value);
    } else {
      setWorkDescOptions([]);
      setSelectedWorkDesc(null);
      setBudgetData([]);
      setFilteredBudgetData([]);
      setExpenseDetails({});
      setEditingEntryId({});
    }
  }, [selectedSite]);

  useEffect(() => {
    if (selectedWorkDesc && budgetData.length > 0) {
      const filtered = budgetData.filter(item => item.work_descriptions === selectedWorkDesc.desc_name);
      setFilteredBudgetData(filtered);
    } else {
      setFilteredBudgetData([]);
    }
  }, [selectedWorkDesc, budgetData]);

  useEffect(() => {
    if (selectedDate && filteredBudgetData.length > 0) {
      filteredBudgetData.forEach(budget => {
        fetchExpenseDetails(budget.id);
      });
    }
  }, [selectedDate, filteredBudgetData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRefCompany.current && !dropdownRefCompany.current.contains(event.target)) {
        setDropdownOpenCompany(false);
      }
      if (dropdownRefProject.current && !dropdownRefProject.current.contains(event.target)) {
        setDropdownOpenProject(false);
      }
      if (dropdownRefSite.current && !dropdownRefSite.current.contains(event.target)) {
        setDropdownOpenSite(false);
      }
      if (dropdownRefWorkDesc.current && !dropdownRefWorkDesc.current.contains(event.target)) {
        setDropdownOpenWorkDesc(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/project/companies`);
      setCompanies(res.data || []);
    } catch (error) {
      setError("Failed to fetch companies");
      toast.error("Failed to fetch companies");
    }
  };

  const fetchProjectsForCompany = async (companyId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/project/projects-with-sites/${companyId}`);
      setProjects(res.data || []);
    } catch (error) {
      setError("Failed to fetch projects");
      toast.error("Failed to fetch projects");
    }
  };

  const fetchWorkDescriptions = async (siteId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/site-incharge/budget-work-descriptions/${siteId}`);
      setWorkDescOptions(res.data.data || []);
    } catch (error) {
      setError("Failed to fetch work descriptions");
      toast.error("Failed to fetch work descriptions");
    }
  };

  const fetchBudgetDetails = async (siteId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/site-incharge/budget-details?site_id=${siteId}`
      );
      setBudgetData(response.data.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch budget details");
      toast.error("Failed to fetch budget details");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseDetails = async (budgetId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/site-incharge/budget-expense-details?actual_budget_id=${budgetId}&date=${selectedDate}`
      );
      setExpenseDetails(prev => ({
        ...prev,
        [budgetId]: response.data.data
      }));
    } catch (err) {
      toast.error("Failed to fetch expense details");
    }
  };

  const handleSaveOrUpdateExpense = async (budgetId) => {
    const inputData = expenseInputs[budgetId];
    if (!inputData) return;

    const isEditing = editingEntryId[budgetId];
    let user_id;
    try {
      user_id = atob(encodedUserId);
      if (!/^\d+$/.test(user_id)) throw new Error();
    } catch {
      toast.error("Invalid User ID in URL");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        actual_budget_id: budgetId,
        entry_date: selectedDate,
        actual_value: inputData.actual_value !== "" ? parseFloat(inputData.actual_value) : null,
        remarks: inputData.remarks || null,
      };

      let response;
      if (isEditing) {
        payload.entry_id = parseInt(isEditing);
        payload.updated_by = parseInt(user_id);
        response = await axios.put(`${API_BASE_URL}/site-incharge/update-budget-expense-entry`, payload);
      } else {
        payload.created_by = parseInt(user_id);
        response = await axios.post(`${API_BASE_URL}/site-incharge/save-budget-expense`, payload);
      }

      toast.success(response.data.message);
      setExpenseInputs(prev => ({ ...prev, [budgetId]: {} }));
      setEditingEntryId(prev => ({ ...prev, [budgetId]: null }));
      fetchExpenseDetails(budgetId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save/update budget expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEntry = (budgetId, entry) => {
    setExpenseInputs(prev => ({
      ...prev,
      [budgetId]: {
        actual_value: entry.actual_value.toString(),
        remarks: entry.remarks || ""
      }
    }));
    setEditingEntryId(prev => ({ ...prev, [budgetId]: entry.id }));
  };

  const handleCancelEdit = (budgetId) => {
    setEditingEntryId(prev => {
      const newState = { ...prev };
      delete newState[budgetId];
      return newState;
    });
    setExpenseInputs(prev => ({ ...prev, [budgetId]: {} }));
  };

  const handleInputChange = (budgetId, field, value) => {
    setExpenseInputs(prev => ({
      ...prev,
      [budgetId]: {
        ...prev[budgetId],
        [field]: value
      }
    }));
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompany(companyId);
    setDropdownOpenCompany(false);
    setSearchQueryCompany("");
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
    setDropdownOpenProject(false);
    setSearchQueryProject("");
  };

  const handleSiteSelect = (site) => {
    setSelectedSite(site);
    setDropdownOpenSite(false);
    setSearchQuerySite("");
  };

  const handleWorkDescSelect = (descId, descName) => {
    setSelectedWorkDesc({ desc_id: descId, desc_name: descName });
    setDropdownOpenWorkDesc(false);
    setSearchQueryWorkDesc("");
  };

  const handleSearchChangeCompany = (e) => setSearchQueryCompany(e.target.value.toLowerCase());
  const handleSearchChangeProject = (e) => setSearchQueryProject(e.target.value.toLowerCase());
  const handleSearchChangeSite = (e) => setSearchQuerySite(e.target.value.toLowerCase());
  const handleSearchChangeWorkDesc = (e) => setSearchQueryWorkDesc(e.target.value.toLowerCase());

  const filteredCompanies = companies.filter(
    (company) => company.company_name.toLowerCase().includes(searchQueryCompany)
  );

  const filteredProjects = projects.map(project => ({
    value: project.project_id,
    label: project.project_name
  })).filter(
    (project) => project.label.toLowerCase().includes(searchQueryProject)
  );

  const filteredSites = sites.filter(
    (site) => site.label.toLowerCase().includes(searchQuerySite)
  );

  const filteredWorkDescs = workDescOptions.filter(
    (option) => option.desc_name.toLowerCase().includes(searchQueryWorkDesc)
  );

  const getStatus = (budget, details) => {
    const cumulative = parseFloat(details.cumulative?.actual_value) || 0;
    const splitted = parseFloat(budget.splitted_budget) || 0;
    if (cumulative > splitted) {
      return { text: 'Exceeded', color: 'red-700' };
    } else if (Math.abs(cumulative - splitted) < 0.01) {
      return { text: 'Completed', color: 'green-700' };
    } else {
      return { text: 'In Progress', color: 'blue-700' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Budget Expense Entry
        </h1>

        <div className="mb-6 flex flex-col gap-4">
          <div className="text-sm font-medium text-gray-700">Select Date:</div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4">
          {/* Company Dropdown */}
          <div className="flex-1" ref={dropdownRefCompany}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
            <div className="relative">
              {dropdownOpenCompany ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
                  <div className="flex items-center px-3 py-2 border-b border-gray-200">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQueryCompany}
                      onChange={handleSearchChangeCompany}
                      placeholder="Search companies..."
                      className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
                    />
                    <button
                      onClick={() => setDropdownOpenCompany(false)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCompanies.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500 text-sm">No matching companies found</div>
                    ) : (
                      filteredCompanies.map((company) => (
                        <div
                          key={company.company_id}
                          onClick={() => handleCompanySelect(company.company_id)}
                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
                            selectedCompany === company.company_id ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{company.company_name}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDropdownOpenCompany(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                >
                  <div>
                    {selectedCompany ? (
                      <div className="font-medium text-gray-900 text-sm">
                        {companies.find((comp) => comp.company_id === selectedCompany)?.company_name}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Select a company...</span>
                    )}
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Project Dropdown */}
          <div className="flex-1" ref={dropdownRefProject}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <div className="relative">
              {dropdownOpenProject ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
                  <div className="flex items-center px-3 py-2 border-b border-gray-200">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQueryProject}
                      onChange={handleSearchChangeProject}
                      placeholder="Search projects..."
                      className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
                    />
                    <button
                      onClick={() => setDropdownOpenProject(false)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredProjects.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500 text-sm">No matching projects found</div>
                    ) : (
                      filteredProjects.map((project) => (
                        <div
                          key={project.value}
                          onClick={() => handleProjectSelect(project.value)}
                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
                            selectedProject === project.value ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{project.label}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDropdownOpenProject(true)}
                  disabled={!selectedCompany}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div>
                    {selectedProject ? (
                      <div className="font-medium text-gray-900 text-sm">
                        {projects.find((proj) => proj.project_id === selectedProject)?.project_name}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Select a project...</span>
                    )}
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Site Dropdown */}
          <div className="flex-1" ref={dropdownRefSite}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Site</label>
            <div className="relative">
              {dropdownOpenSite ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
                  <div className="flex items-center px-3 py-2 border-b border-gray-200">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuerySite}
                      onChange={handleSearchChangeSite}
                      placeholder="Search sites or PO numbers..."
                      className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
                    />
                    <button
                      onClick={() => setDropdownOpenSite(false)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredSites.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500 text-sm">No matching sites found</div>
                    ) : (
                      filteredSites.map((site) => (
                        <div
                          key={site.value}
                          onClick={() => handleSiteSelect(site)}
                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
                            selectedSite?.value === site.value ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{site.label}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDropdownOpenSite(true)}
                  disabled={!selectedProject}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div>
                    {selectedSite ? (
                      <div className="font-medium text-gray-900 text-sm">
                        {selectedSite.label}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Select a site...</span>
                    )}
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Work Description Dropdown */}
          <div className="flex-1" ref={dropdownRefWorkDesc}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Work Description</label>
            <div className="relative">
              {dropdownOpenWorkDesc ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-full">
                  <div className="flex items-center px-3 py-2 border-b border-gray-200">
                    <Search className="h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQueryWorkDesc}
                      onChange={handleSearchChangeWorkDesc}
                      placeholder="Search work descriptions..."
                      className="flex-1 py-2 px-3 text-sm focus:outline-none bg-transparent"
                    />
                    <button
                      onClick={() => setDropdownOpenWorkDesc(false)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredWorkDescs.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500 text-sm">No matching work descriptions found</div>
                    ) : (
                      filteredWorkDescs.map((option) => (
                        <div
                          key={option.desc_id}
                          onClick={() => handleWorkDescSelect(option.desc_id, option.desc_name)}
                          className={`px-4 py-3 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${
                            selectedWorkDesc?.desc_id === option.desc_id ? "bg-indigo-100 text-indigo-800" : "text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{option.desc_name}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDropdownOpenWorkDesc(true)}
                  disabled={!selectedSite}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-left hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div>
                    {selectedWorkDesc ? (
                      <div className="font-medium text-gray-900 text-sm">
                        {selectedWorkDesc.desc_name}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Select work description...</span>
                    )}
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-6 text-sm text-gray-500">Loading...</div>}
        {error && <div className="text-center py-6 text-sm text-red-600">{error}</div>}

        {filteredBudgetData.length > 0 ? (
          <div className="space-y-4">
            {filteredBudgetData.map(budget => {
              if (budget.overhead_id === 1 || budget.overhead_id === 2) {
                return null; // Don't display the card for overhead_id 1 (material) or 2 (labour)
              }
              const displayData = expenseDetails[budget.id] || {
                cumulative: { actual_value: parseFloat(budget.actual_value) || 0 },
                entries: [
                  {
                    id: budget.id,
                    actual_value: parseFloat(budget.actual_value) || 0,
                    remarks: budget.remarks || "No remarks",
                    created_at: `${selectedDate}T10:06:00`
                  }
                ]
              };
              const splittedBudget = parseFloat(budget.splitted_budget) || 0;
              const cumulativeValue = parseFloat(displayData.cumulative.actual_value) || 0;
              const status = getStatus(budget, displayData);
              const isEditing = editingEntryId[budget.id];

              return (
                <div key={budget.id} className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
                  <div className="font-semibold text-base text-gray-800 mb-2">
                    {budget.expense_name}
                  </div>
                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Splitted Budget</h4>
                    <div className="text-sm text-gray-600">
                      {splittedBudget.toFixed(2)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Progress as of {selectedDate}</h4>
                    <div className="text-sm text-gray-600">
                      Actual: {cumulativeValue.toFixed(2)} / {splittedBudget.toFixed(2)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Status</h4>
                    <div className={`p-2 border rounded-lg text-${status.color} flex items-center text-sm`}>
                      {status.text}
                      {status.text === 'Completed' && <BookCheck size={14} className="ml-2" />}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Entries on {selectedDate}</h4>
                    {displayData.entries.length === 0 ? (
                      <div className="text-sm text-gray-500">No entries</div>
                    ) : (
                      displayData.entries.map((entry) => (
                        <div key={entry.id} className="text-sm text-gray-700 space-y-1 flex justify-between items-center">
                          <div>
                            At {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
                            {' '}Actual: {(parseFloat(entry.actual_value) || 0).toFixed(2)} ({entry.remarks})
                          </div>
                          {entry.is_editable && (
                            <button
                              onClick={() => handleEditEntry(budget.id, entry)}
                              className="text-blue-500 hover:text-blue-700 text-xs flex items-center"
                            >
                              <Edit size={12} className="mr-1" /> Edit
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 capitalize mb-1">Actual Value</h5>
                      <div className="flex flex-col space-y-2">
                        <input
                          type="number"
                          placeholder="Expense Value"
                          value={expenseInputs[budget.id]?.actual_value || ""}
                          onChange={(e) => handleInputChange(budget.id, 'actual_value', e.target.value)}
                          className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          min="0"
                          step="0.01"
                        />
                        <input
                          type="text"
                          placeholder="Remarks"
                          value={expenseInputs[budget.id]?.remarks || ""}
                          onChange={(e) => handleInputChange(budget.id, 'remarks', e.target.value)}
                          className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleCancelEdit(budget.id)}
                        className="w-full p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleSaveOrUpdateExpense(budget.id)}
                      className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        submitting ||
                        !expenseInputs[budget.id] ||
                        Object.values(expenseInputs[budget.id] || {}).every(val => val === "" || val === null)
                      }
                    >
                      <Save size={14} className="mr-2" />
                      {isEditing ? "Update Expense" : "Save Expense"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !loading && <div className="text-center py-6 text-sm text-gray-500">No budget data found for the selected criteria.</div>
        )}
      </div>

      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        className="w-full max-w-md mx-auto"
      />
    </div>
  );
};

export default BudgetExpenseEntry;
import { API_BASE_URL } from "../../config/api.js";

// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Search, Save, X, FileText, BookCheck, Calendar } from "lucide-react";
// import { useParams } from "react-router-dom";

// const WorkCompletionEntry = () => {
//   const { encodedUserId } = useParams();
//   const [reckonerData, setReckonerData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingCompanies, setLoadingCompanies] = useState(true);
//   const [loadingProjects, setLoadingProjects] = useState(false);
//   const [loadingSites, setLoadingSites] = useState(false);
//   const [newWorkData, setNewWorkData] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [companyOptions, setCompanyOptions] = useState([]);
//   const [projectOptions, setProjectOptions] = useState([]);
//   const [siteOptions, setSiteOptions] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState("");
//   const [selectedProject, setSelectedProject] = useState("");
//   const [selectedSite, setSelectedSite] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [historyData, setHistoryData] = useState({});
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const dropdownRef = useRef(null);

//   // Get today's date in YYYY-MM-DD format
//   const today = new Date().toISOString().split('T')[0];

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     if (selectedCompany) fetchProjects();
//   }, [selectedCompany]);

//   useEffect(() => {
//     if (selectedProject) fetchSites();
//   }, [selectedProject]);

//   useEffect(() => {
//     if (selectedSite) fetchReckonerData();
//   }, [selectedSite]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (selectedDate && filteredData.length > 0) {
//       filteredData.forEach((r) => fetchHistoryData(r.rec_id));
//     }
//   }, [selectedDate, filteredData]);

//   const fetchCompanies = async () => {
//     try {
//       setLoadingCompanies(true);
//       const res = await axios.get(`${API_BASE_URL}/project/companies`);
//       if (Array.isArray(res.data) && res.data.length > 0) {
//         setCompanyOptions(res.data);
//       } else {
//         toast.error("No companies found");
//       }
//     } catch {
//       toast.error("Failed to fetch companies");
//     } finally {
//       setLoadingCompanies(false);
//     }
//   };

//   const fetchProjects = async () => {
//     try {
//       setLoadingProjects(true);
//       const res = await axios.get(`${API_BASE_URL}/project/projects-with-sites`);
//       if (Array.isArray(res.data) && res.data.length > 0) {
//         const filteredProjects = res.data.filter((p) => p.company_id === selectedCompany);
//         setProjectOptions(filteredProjects);
//         setSelectedProject("");
//         setSelectedSite("");
//         setSiteOptions([]);
//         setReckonerData([]);
//         setFilteredData([]);
//         setHistoryData({});
//       } else {
//         toast.error("No projects found");
//       }
//     } catch {
//       toast.error("Project fetch error");
//     } finally {
//       setLoadingProjects(false);
//     }
//   };

//   const fetchSites = async () => {
//     try {
//       setLoadingSites(true);
//       const selectedProjectData = projectOptions.find((p) => p.project_id === selectedProject);
//       const sites = selectedProjectData && Array.isArray(selectedProjectData.sites) 
//         ? selectedProjectData.sites 
//         : [];
//       const options = sites.map((site) => ({
//         site_id: site.site_id,
//         site_name: site.site_name,
//         po_number: site.po_number,
//       }));
//       setSiteOptions(options);
//       if (options.length > 0 && !selectedSite) {
//         setSelectedSite(options[0].site_id);
//         setSelectedCategory(null);
//       } else {
//         setSelectedSite("");
//         setReckonerData([]);
//         setFilteredData([]);
//         setHistoryData({});
//         if (options.length === 0) {
//           toast.info("No sites available for the selected project");
//         }
//       }
//     } catch {
//       toast.error("Site fetch error");
//       setSiteOptions([]);
//       setSelectedSite("");
//       setReckonerData([]);
//       setFilteredData([]);
//       setHistoryData({});
//     } finally {
//       setLoadingSites(false);
//     }
//   };

//   const fetchReckonerData = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API_BASE_URL}/reckoner/reckoner/`);
//       const data =
//         res.data.success && Array.isArray(res.data.data) ? res.data.data : [];
//       const uniqueData = Array.from(
//         new Map(data.map((item) => [item.rec_id, item])).values()
//       ).filter((item) => item.site_id === selectedSite);
//       setReckonerData(uniqueData);
//       setFilteredData(
//         selectedCategory
//           ? uniqueData.filter((item) => item.category_name === selectedCategory)
//           : uniqueData
//       );
//     } catch {
//       toast.error("Failed to fetch reckoner data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchHistoryData = async (rec_id) => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/site-incharge/completion-entries`, {
//         params: { rec_id, date: selectedDate },
//       });
//       if (res.data.status === 'success') {
//         setHistoryData((prev) => ({
//           ...prev,
//           [rec_id]: res.data.data,
//         }));
//       } else {
//         toast.error("Failed to fetch entries data");
//       }
//     } catch {
//       toast.error("Entries fetch error");
//     }
//   };

//   const handleCompanySelect = (companyId) => {
//     setSelectedCompany(companyId);
//     setSelectedProject("");
//     setSelectedSite("");
//     setSearchQuery("");
//     setSelectedCategory(null);
//     setFilteredData([]);
//     setReckonerData([]);
//     setHistoryData({});
//     setSelectedDate(today);
//   };

//   const handleProjectSelect = (projectId) => {
//     setSelectedProject(projectId);
//     setSelectedSite("");
//     setSearchQuery("");
//     setSelectedCategory(null);
//     setFilteredData([]);
//     setReckonerData([]);
//     setHistoryData({});
//     setSelectedDate(today);
//   };

//   const handleSiteSelect = (siteId) => {
//     setSelectedSite(siteId);
//     setDropdownOpen(false);
//     setSearchQuery("");
//     setSelectedCategory(null);
//     setFilteredData(reckonerData);
//     setHistoryData({});
//     setSelectedDate(today);
//   };

//   const handleSearchChange = (e) =>
//     setSearchQuery(e.target.value.toLowerCase());

//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//     setFilteredData(
//       category
//         ? reckonerData.filter((item) => item.category_name === category)
//         : reckonerData
//     );
//   };

//   const handleNewWorkChange = (rec_id, value) => {
//     setNewWorkData((prev) => ({
//       ...prev,
//       [rec_id]: value,
//     }));
//   };

//   const handleSubmit = async (rec_id) => {
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

//       const record = filteredData.find((item) => item.rec_id === rec_id);
//       if (!record) {
//         toast.error("Record not found");
//         return;
//       }

//       const addition = parseFloat(newWorkData[rec_id]) || 0;
//       const alreadyCompleted = parseFloat(record.area_completed) || 0;
//       const total = alreadyCompleted + addition;

//       if (addition < 0) {
//         toast.error("Area cannot be negative");
//         return;
//       }
//       // if (total > parseFloat(record.po_quantity)) {
//       //   toast.error(`Completed area cannot exceed PO qty (${record.po_quantity})`);
//       //   return;
//       // }

//       const rate = parseFloat(record.rate) || 0;
//       const value = parseFloat((addition * rate).toFixed(2));

//       const payload = {
//         rec_id,
//         area_added: addition,
//         rate,
//         value,
//         created_by: parseInt(user_id, 10),
//         entry_date: selectedDate,
//       };

//       await axios.post(
//         `${API_BASE_URL}/site-incharge/completion-status`,
//         payload
//       );

//       toast.success("Entry added successfully");
//       await fetchReckonerData();
//       setNewWorkData((prev) => ({ ...prev, [rec_id]: "" }));
//       fetchHistoryData(rec_id); // Refresh entries for this rec_id
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to add entry");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const isCompleted = (r) =>
//     parseFloat(r.completion_value) > 0 &&
//     parseFloat(r.completion_value).toFixed(2) ===
//     parseFloat(r.value).toFixed(2);

//   const getDisplayData = (r) => {
//     const hist = historyData[r.rec_id];
//     if (hist) {
//       return {
//         cumulative_area: parseFloat(hist.cumulative_area) || 0,
//         entries: hist.entries || [],
//       };
//     }
//     // Fallback to current if not loaded
//     return {
//       cumulative_area: parseFloat(r.area_completed) || 0,
//       entries: [],
//     };
//   };

//   const uniqueCategories = [
//     ...new Set(reckonerData.map((item) => item.category_name)),
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
//       <div className="w-full max-w-4xl">
//         <h1 className="text-xl font-bold text-gray-900 mb-4">
//           Work Completion Entry
//         </h1>

//         {/* Selection Inputs */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//           {/* Company Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Company
//             </label>
//             <select
//               value={selectedCompany}
//               onChange={(e) => handleCompanySelect(e.target.value)}
//               className="w-full px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
//               disabled={loadingCompanies}
//             >
//               <option value="">Select a company</option>
//               {companyOptions.map((company) => (
//                 <option key={company.company_id} value={company.company_id}>
//                   {company.company_name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Project Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Project
//             </label>
//             <select
//               value={selectedProject}
//               onChange={(e) => handleProjectSelect(e.target.value)}
//               className="w-full px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
//               disabled={loadingProjects || !selectedCompany}
//             >
//               <option value="">Select a project</option>
//               {projectOptions.map((project) => (
//                 <option key={project.project_id} value={project.project_id}>
//                   {project.project_name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Site Selection */}
//           <div ref={dropdownRef}>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Site
//             </label>
//             {dropdownOpen ? (
//               <div className="bg-white rounded-lg border shadow-sm">
//                 <div className="flex items-center px-3 py-2 border-b">
//                   <Search size={16} className="text-gray-500" />
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                     placeholder="Search site/PO..."
//                     className="flex-1 px-2 py-1 bg-transparent outline-none text-sm"
//                   />
//                   <X
//                     onClick={() => setDropdownOpen(false)}
//                     size={16}
//                     className="text-gray-500 cursor-pointer"
//                   />
//                 </div>
//                 <div className="max-h-48 overflow-y-auto">
//                   {loadingSites ? (
//                     <div className="p-3 text-gray-500 text-sm">Loading...</div>
//                   ) : siteOptions.length === 0 ? (
//                     <div className="p-3 text-gray-500 text-sm">No sites available</div>
//                   ) : (
//                     siteOptions
//                       .filter(
//                         (o) =>
//                           o.site_name.toLowerCase().includes(searchQuery) ||
//                           o.po_number.toLowerCase().includes(searchQuery)
//                       )
//                       .map((opt) => (
//                         <div
//                           key={opt.site_id}
//                           onClick={() => handleSiteSelect(opt.site_id)}
//                           className={`p-3 cursor-pointer hover:bg-gray-100 text-sm ${
//                             selectedSite === opt.site_id ? "bg-gray-200" : ""
//                           }`}
//                         >
//                           <div className="font-semibold">{opt.site_name}</div>
//                           <div className="text-xs text-gray-500">
//                             PO: {opt.po_number}
//                           </div>
//                         </div>
//                       ))
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <button
//                 onClick={() => setDropdownOpen(true)}
//                 className="w-full flex justify-between px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
//                 disabled={loadingSites || !selectedProject || siteOptions.length === 0}
//               >
//                 <span>
//                   {selectedSite && siteOptions.length > 0
//                     ? `${siteOptions.find(
//                         (o) => o.site_id === selectedSite
//                       )?.site_name} (PO: ${
//                         siteOptions.find((o) => o.site_id === selectedSite)
//                           ?.po_number
//                       })`
//                     : siteOptions.length === 0
//                     ? "No sites available"
//                     : "Select a site"}
//                 </span>
//                 <Search size={16} className="text-gray-500" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Date Selection with Picker */}
//         <div className="mb-4 flex items-center justify-between">
//           <div className="text-sm font-medium text-gray-700">
//             Select Date:
//           </div>
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             max={today}
//             className="px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
//           />
//         </div>

//         {/* Category Selection */}
//         <div className="mb-4 overflow-x-auto flex space-x-2 pb-2">
//           {uniqueCategories.length > 0 ? (
//             uniqueCategories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => handleCategorySelect(category)}
//                 className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
//                   selectedCategory === category
//                     ? "bg-indigo-600 text-white"
//                     : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//                 }`}
//               >
//                 {category}
//               </button>
//             ))
//           ) : (
//             <div className="text-sm text-gray-500">No categories available</div>
//           )}
//         </div>

//         {/* Records */}
//         {loading ? (
//           <div className="text-center py-6 text-sm text-gray-500">Loading...</div>
//         ) : filteredData.length === 0 ? (
//           <div className="text-center py-6 text-sm text-gray-500">No records found</div>
//         ) : (
//           filteredData.map((r) => {
//             const displayData = getDisplayData(r);
//             const cumulativeValue = (displayData.cumulative_area * parseFloat(r.rate)).toFixed(2);
//             return (
//               <div
//                 key={r.rec_id}
//                 className="bg-white border rounded-lg p-3 mb-3 shadow-sm"
//               >
//                 <div className="font-semibold text-base text-gray-800 mb-1">
//                   {r.subcategory_name}
//                 </div>
//                 <div className="text-gray-600 text-sm mb-1">
//                   Item: {r.item_id}
//                 </div>
//                 <div className="flex items-center mb-2 text-sm">
//                   <FileText size={14} className="text-indigo-500 mr-1" />
//                   {r.work_descriptions}
//                 </div>
//                 <div className="mb-3">
//                   <span className="font-medium text-sm">Progress as of {selectedDate}:</span> Area{" "}
//                   <span className="font-semibold">{displayData.cumulative_area.toFixed(2)}</span> | Value{" "}
//                   <span className="font-semibold">{cumulativeValue}</span>
//                 </div>
//                 <div className="mb-3">
//                   <span className="font-medium text-sm">Entries on {selectedDate}:</span>
//                   {displayData.entries.length === 0 ? (
//                     <div className="text-sm text-gray-500">No entries</div>
//                   ) : (
//                     displayData.entries.map((entry) => (
//                       <div key={entry.entry_id} className="text-sm text-gray-700">
//                         {parseFloat(entry.area_added || 0).toFixed(2)} added at {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </div>
//                     ))
//                   )}
//                 </div>

//                 {isCompleted(r) ? (
//                   <div className="p-2 border rounded-lg text-green-700 flex items-center text-sm">
//                     Completed
//                     <BookCheck size={14} className="ml-2 text-green-600" />
//                   </div>
//                 ) : (
//                   <div className="flex items-center space-x-2">
//                     <input
//                       type="number"
//                       value={newWorkData[r.rec_id] || ""}
//                       onChange={(e) =>
//                         handleNewWorkChange(r.rec_id, e.target.value)
//                       }
//                       placeholder="Enter new work area"
//                       className="flex-1 p-2 border rounded-lg text-sm"
//                     />
//                     <button
//                       onClick={() => handleSubmit(r.rec_id)}
//                       disabled={submitting}
//                       className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
//                     >
//                       <Save size={14} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             );
//           })
//         )}
//       </div>
//       <ToastContainer position="top-center" autoClose={2500} />
//     </div>
//   );
// };

// export default WorkCompletionEntry;
















import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Save, X, FileText, BookCheck, Calendar, Edit2 } from "lucide-react";
import { useParams } from "react-router-dom";

const WorkCompletionEntry = () => {
  const { encodedUserId } = useParams();
  const [reckonerData, setReckonerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [newWorkData, setNewWorkData] = useState({});
  const [newRemarksData, setNewRemarksData] = useState({});
  const [editData, setEditData] = useState({}); // For editing entries
  const [editingEntryId, setEditingEntryId] = useState(null); // Track editing entry
  const [submitting, setSubmitting] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [historyData, setHistoryData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const dropdownRef = useRef(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) fetchProjects();
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedProject) fetchSites();
  }, [selectedProject]);

  useEffect(() => {
    if (selectedSite) fetchReckonerData();
  }, [selectedSite]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedDate && filteredData.length > 0) {
      filteredData.forEach((r) => fetchHistoryData(r.rec_id));
    }
  }, [selectedDate, filteredData]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const res = await axios.get(`${API_BASE_URL}/project/companies`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCompanyOptions(res.data);
      } else {
        toast.error("No companies found");
      }
    } catch {
      toast.error("Failed to fetch companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await axios.get(`${API_BASE_URL}/project/projects-with-sites`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const filteredProjects = res.data.filter((p) => p.company_id === selectedCompany);
        setProjectOptions(filteredProjects);
        setSelectedProject("");
        setSelectedSite("");
        setSiteOptions([]);
        setReckonerData([]);
        setFilteredData([]);
        setHistoryData({});
      } else {
        toast.error("No projects found");
      }
    } catch {
      toast.error("Project fetch error");
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchSites = async () => {
    try {
      setLoadingSites(true);
      const selectedProjectData = projectOptions.find((p) => p.project_id === selectedProject);
      const sites = selectedProjectData && Array.isArray(selectedProjectData.sites) 
        ? selectedProjectData.sites 
        : [];
      const options = sites.map((site) => ({
        site_id: site.site_id,
        site_name: site.site_name,
        po_number: site.po_number,
      }));
      setSiteOptions(options);
      if (options.length > 0 && !selectedSite) {
        setSelectedSite(options[0].site_id);
        setSelectedCategory(null);
      } else {
        setSelectedSite("");
        setReckonerData([]);
        setFilteredData([]);
        setHistoryData({});
        if (options.length === 0) {
          toast.info("No sites available for the selected project");
        }
      }
    } catch {
      toast.error("Site fetch error");
      setSiteOptions([]);
      setSelectedSite("");
      setReckonerData([]);
      setFilteredData([]);
      setHistoryData({});
    } finally {
      setLoadingSites(false);
    }
  };

  const fetchReckonerData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/reckoner/reckoner/`);
      const data =
        res.data.success && Array.isArray(res.data.data) ? res.data.data : [];
      const uniqueData = Array.from(
        new Map(data.map((item) => [item.rec_id, item])).values()
      ).filter((item) => item.site_id === selectedSite);
      setReckonerData(uniqueData);
      setFilteredData(
        selectedCategory
          ? uniqueData.filter((item) => item.category_name === selectedCategory)
          : uniqueData
      );
    } catch {
      toast.error("Failed to fetch reckoner data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryData = async (rec_id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/site-incharge/completion-entries`, {
        params: { rec_id, date: selectedDate },
      });
      if (res.data.status === 'success') {
        setHistoryData((prev) => ({
          ...prev,
          [rec_id]: res.data.data,
        }));
      } else {
        toast.error("Failed to fetch entries data");
      }
    } catch {
      toast.error("Entries fetch error");
    }
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompany(companyId);
    setSelectedProject("");
    setSelectedSite("");
    setSearchQuery("");
    setSelectedCategory(null);
    setFilteredData([]);
    setReckonerData([]);
    setHistoryData({});
    setSelectedDate(today);
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
    setSelectedSite("");
    setSearchQuery("");
    setSelectedCategory(null);
    setFilteredData([]);
    setReckonerData([]);
    setHistoryData({});
    setSelectedDate(today);
  };

  const handleSiteSelect = (siteId) => {
    setSelectedSite(siteId);
    setDropdownOpen(false);
    setSearchQuery("");
    setSelectedCategory(null);
    setFilteredData(reckonerData);
    setHistoryData({});
    setSelectedDate(today);
  };

  const handleSearchChange = (e) =>
    setSearchQuery(e.target.value.toLowerCase());

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilteredData(
      category
        ? reckonerData.filter((item) => item.category_name === category)
        : reckonerData
    );
  };

  const handleNewWorkChange = (rec_id, value) => {
    setNewWorkData((prev) => ({
      ...prev,
      [rec_id]: value,
    }));
  };

  const handleNewRemarksChange = (rec_id, value) => {
    setNewRemarksData((prev) => ({
      ...prev,
      [rec_id]: value,
    }));
  };

  const handleEditEntryToggle = (entryId, entry, recId) => {
    if (editingEntryId === entryId) {
      // Cancel edit
      setEditingEntryId(null);
      setEditData(prev => {
        const newData = { ...prev };
        delete newData[`edit-${entryId}`];
        return newData;
      });
    } else {
      // Start edit
      setEditingEntryId(entryId);
      setEditData(prev => ({
        ...prev,
        [`edit-${entryId}`]: {
          area_added: entry.area_added.toString(),
          remarks: entry.remarks || ""
        }
      }));
    }
  };

  const handleEditInputChange = (entryId, field, value) => {
    setEditData(prev => ({
      ...prev,
      [`edit-${entryId}`]: {
        ...prev[`edit-${entryId}`],
        [field]: value
      }
    }));
  };

  const handleUpdateEntry = async (entryId, recId) => {
    try {
      setSubmitting(true);
      if (!encodedUserId) {
        toast.error("User ID is missing from URL");
        return;
      }
      let user_id;
      try {
        user_id = atob(encodedUserId);
        if (!/^\d+$/.test(user_id)) throw new Error();
      } catch {
        toast.error("Invalid User ID in URL");
        return;
      }

      const editDataForEntry = editData[`edit-${entryId}`];
      if (!editDataForEntry) {
        toast.error("Edit data missing");
        return;
      }

      const areaAdded = parseFloat(editDataForEntry.area_added) || 0;
      const remarks = editDataForEntry.remarks?.trim();
      if (!remarks || remarks === '') {
        toast.error("Remarks are required");
        return;
      }
      if (areaAdded < 0) {
        toast.error("Area cannot be negative");
        return;
      }

      const payload = {
        entry_id: entryId,
        area_added: areaAdded,
        remarks,
        updated_by: user_id,
      };

      await axios.put(
        `${API_BASE_URL}/site-incharge/update-completion-entry`,
        payload
      );

      toast.success("Entry updated successfully");
      setEditingEntryId(null);
      setEditData(prev => {
        const newData = { ...prev };
        delete newData[`edit-${entryId}`];
        return newData;
      });
      fetchHistoryData(recId); // Refresh
      // Optionally refresh reckoner data to update cumulatives
      await fetchReckonerData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (rec_id) => {
    try {
      setSubmitting(true);
      if (!encodedUserId) {
        toast.error("User ID is missing from URL");
        return;
      }
      let user_id;
      try {
        user_id = atob(encodedUserId);
        if (!/^\d+$/.test(user_id)) throw new Error();
      } catch {
        toast.error("Invalid User ID in URL");
        return;
      }

      const record = filteredData.find((item) => item.rec_id === rec_id);
      if (!record) {
        toast.error("Record not found");
        return;
      }

      const addition = parseFloat(newWorkData[rec_id]) || 0;
      const remarks = newRemarksData[rec_id]?.trim();
      if (!remarks || remarks === '') {
        toast.error("Remarks are required");
        return;
      }
      const alreadyCompleted = parseFloat(record.area_completed) || 0;
      const total = alreadyCompleted + addition;

      if (addition < 0) {
        toast.error("Area cannot be negative");
        return;
      }
      // if (total > parseFloat(record.po_quantity)) {
      //   toast.error(`Completed area cannot exceed PO qty (${record.po_quantity})`);
      //   return;
      // }

      const rate = parseFloat(record.rate) || 0;
      const value = parseFloat((addition * rate).toFixed(2));

      const payload = {
        rec_id,
        area_added: addition,
        rate,
        value,
        created_by: parseInt(user_id, 10),
        entry_date: selectedDate,
        remarks,
      };

      await axios.post(
        `${API_BASE_URL}/site-incharge/completion-status`,
        payload
      );

      toast.success("Entry added successfully");
      await fetchReckonerData();
      setNewWorkData((prev) => ({ ...prev, [rec_id]: "" }));
      setNewRemarksData((prev) => ({ ...prev, [rec_id]: "" }));
      fetchHistoryData(rec_id); // Refresh entries for this rec_id
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add entry");
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleted = (r) =>
    parseFloat(r.completion_value) > 0 &&
    parseFloat(r.completion_value).toFixed(2) ===
    parseFloat(r.value).toFixed(2);

  const getDisplayData = (r) => {
    const hist = historyData[r.rec_id];
    if (hist) {
      return {
        cumulative_area: parseFloat(hist.cumulative_area) || 0,
        entries: hist.entries || [],
      };
    }
    // Fallback to current if not loaded
    return {
      cumulative_area: parseFloat(r.area_completed) || 0,
      entries: [],
    };
  };

  const uniqueCategories = [
    ...new Set(reckonerData.map((item) => item.category_name)),
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          Work Completion Entry
        </h1>

        {/* Selection Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => handleCompanySelect(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
              disabled={loadingCompanies}
            >
              <option value="">Select a company</option>
              {companyOptions.map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectSelect(e.target.value)}
              className="w-full px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
              disabled={loadingProjects || !selectedCompany}
            >
              <option value="">Select a project</option>
              {projectOptions.map((project) => (
                <option key={project.project_id} value={project.project_id}>
                  {project.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* Site Selection */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site
            </label>
            {dropdownOpen ? (
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="flex items-center px-3 py-2 border-b">
                  <Search size={16} className="text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search site/PO..."
                    className="flex-1 px-2 py-1 bg-transparent outline-none text-sm"
                  />
                  <X
                    onClick={() => setDropdownOpen(false)}
                    size={16}
                    className="text-gray-500 cursor-pointer"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {loadingSites ? (
                    <div className="p-3 text-gray-500 text-sm">Loading...</div>
                  ) : siteOptions.length === 0 ? (
                    <div className="p-3 text-gray-500 text-sm">No sites available</div>
                  ) : (
                    siteOptions
                      .filter(
                        (o) =>
                          o.site_name.toLowerCase().includes(searchQuery) ||
                          o.po_number.toLowerCase().includes(searchQuery)
                      )
                      .map((opt) => (
                        <div
                          key={opt.site_id}
                          onClick={() => handleSiteSelect(opt.site_id)}
                          className={`p-3 cursor-pointer hover:bg-gray-100 text-sm ${
                            selectedSite === opt.site_id ? "bg-gray-200" : ""
                          }`}
                        >
                          <div className="font-semibold">{opt.site_name}</div>
                          <div className="text-xs text-gray-500">
                            PO: {opt.po_number}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setDropdownOpen(true)}
                className="w-full flex justify-between px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
                disabled={loadingSites || !selectedProject || siteOptions.length === 0}
              >
                <span>
                  {selectedSite && siteOptions.length > 0
                    ? `${siteOptions.find(
                        (o) => o.site_id === selectedSite
                      )?.site_name} (PO: ${
                        siteOptions.find((o) => o.site_id === selectedSite)
                          ?.po_number
                      })`
                    : siteOptions.length === 0
                    ? "No sites available"
                    : "Select a site"}
                </span>
                <Search size={16} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Date Selection with Picker */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            Select Date:
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={today}
            className="px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
          />
        </div>

        {/* Category Selection */}
        <div className="mb-4 overflow-x-auto flex space-x-2 pb-2">
          {uniqueCategories.length > 0 ? (
            uniqueCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-500">No categories available</div>
          )}
        </div>

        {/* Records */}
        {loading ? (
          <div className="text-center py-6 text-sm text-gray-500">Loading...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">No records found</div>
        ) : (
          filteredData.map((r) => {
            const displayData = getDisplayData(r);
            const cumulativeValue = (displayData.cumulative_area * parseFloat(r.rate)).toFixed(2);
            return (
              <div
                key={r.rec_id}
                className="bg-white border rounded-lg p-3 mb-3 shadow-sm"
              >
                <div className="font-semibold text-base text-gray-800 mb-1">
                  {r.subcategory_name}
                </div>
                <div className="text-gray-600 text-sm mb-1">
                  Item: {r.item_id}
                </div>
                <div className="flex items-center mb-2 text-sm">
                  <FileText size={14} className="text-indigo-500 mr-1" />
                  {r.work_descriptions}
                </div>
                <div className="mb-3">
                  <span className="font-medium text-sm">Progress as of {selectedDate}:</span> Area{" "}
                  <span className="font-semibold">{displayData.cumulative_area.toFixed(2)}</span> | Value{" "}
                  <span className="font-semibold">{cumulativeValue}</span>
                </div>
                <div className="mb-3">
                  <span className="font-medium text-sm">Entries on {selectedDate}:</span>
                  {displayData.entries.length === 0 ? (
                    <div className="text-sm text-gray-500">No entries</div>
                  ) : (
                    displayData.entries.map((entry) => {
                      const isEditingThis = editingEntryId === entry.entry_id;
                      return (
                        <div key={entry.entry_id} className="text-sm text-gray-700 space-y-1 mb-2 p-2 border rounded">
                          {isEditingThis ? (
                            <div>
                              <div className="space-y-2">
                                <div>
                                  <h5 className="text-xs font-medium text-gray-600 mb-1">Area Added</h5>
                                  <input
                                    type="number"
                                    placeholder="Area Added"
                                    value={editData[`edit-${entry.entry_id}`]?.area_added || ""}
                                    onChange={(e) => handleEditInputChange(entry.entry_id, 'area_added', e.target.value)}
                                    className="w-full p-1 border rounded text-xs"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <h5 className="text-xs font-medium text-gray-600 mb-1">Remarks</h5>
                                  <input
                                    type="text"
                                    placeholder="Remarks (required)"
                                    value={editData[`edit-${entry.entry_id}`]?.remarks || ""}
                                    onChange={(e) => handleEditInputChange(entry.entry_id, 'remarks', e.target.value)}
                                    className="w-full p-1 border rounded text-xs"
                                  />
                                </div>
                              </div>
                              <div className="flex space-x-1 mt-2">
                                <button
                                  onClick={() => handleUpdateEntry(entry.entry_id, r.rec_id)}
                                  className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 flex items-center justify-center"
                                  disabled={submitting || !editData[`edit-${entry.entry_id}`]?.area_added || !editData[`edit-${entry.entry_id}`]?.remarks}
                                >
                                  <Save size={10} className="mr-1" />
                                  Update
                                </button>
                                <button
                                  onClick={() => handleEditEntryToggle(entry.entry_id, entry, r.rec_id)}
                                  className="flex-1 bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 flex items-center justify-center"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-semibold text-xs">
                                At {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
                              </div>
                              {entry.area_added !== null && (
                                <div>Area: {parseFloat(entry.area_added).toFixed(2)} ({entry.remarks || 'No remarks'})</div>
                              )}
                              {entry.is_editable && (
                                <button
                                  onClick={() => handleEditEntryToggle(entry.entry_id, entry, r.rec_id)}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <Edit2 size={12} className="mr-1" />
                                  Edit
                                </button>
                              )}
                              {!entry.is_editable && (
                                <div className="text-xs text-gray-500 mt-1">Edit disabled (48h passed)</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {isCompleted(r) ? (
                  <div className="p-2 border rounded-lg text-green-700 flex items-center text-sm">
                    Completed
                    <BookCheck size={14} className="ml-2 text-green-600" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={newWorkData[r.rec_id] || ""}
                        onChange={(e) =>
                          handleNewWorkChange(r.rec_id, e.target.value)
                        }
                        placeholder="Enter new work area"
                        className="flex-1 p-2 border rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={newRemarksData[r.rec_id] || ""}
                        onChange={(e) =>
                          handleNewRemarksChange(r.rec_id, e.target.value)
                        }
                        placeholder="Remarks (required)"
                        className="flex-1 p-2 border rounded-lg text-sm"
                      />
                      <button
                        onClick={() => handleSubmit(r.rec_id)}
                        disabled={submitting}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <ToastContainer position="top-center" autoClose={2500} />
    </div>
  );
};

export default WorkCompletionEntry;
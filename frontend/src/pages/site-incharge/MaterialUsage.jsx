import { API_BASE_URL } from "../../config/api.js";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Select from "react-select";
// import { BookCheck, Save } from "lucide-react";
// import { useParams } from "react-router-dom";

// const MaterialUsage = () => {
//   const { encodedUserId } = useParams();
//   const [userId, setUserId] = useState(null); // Store decoded userId
//   const [companies, setCompanies] = useState([]);
//   const [allProjects, setAllProjects] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [sites, setSites] = useState([]);
//   const [workDescriptions, setWorkDescriptions] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState(null);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [selectedSite, setSelectedSite] = useState(null);
//   const [selectedWorkDescription, setSelectedWorkDescription] = useState(null);
//   const [dispatchData, setDispatchData] = useState([]);
//   const [ackDetails, setAckDetails] = useState({});
//   const [usageInputs, setUsageInputs] = useState({});
//   const [usageDetails, setUsageDetails] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [submitting, setSubmitting] = useState(false);

//   // Decode userId from encodedUserId
//   useEffect(() => {
//     if (encodedUserId) {
//       try {
//         const decodedId = atob(encodedUserId);
//         setUserId(decodedId);
//       } catch (err) {
//         console.error("Error decoding userId:", err);
//         setError("Invalid user ID in URL. Please try again.");
//       }
//     } else {
//       setError("User ID not found in URL. Please try again.");
//     }
//   }, [encodedUserId]);

//   // Fetch companies
//   const fetchCompanies = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/project/companies`);
//       setCompanies(response.data || []);
//     } catch (err) {
//       setError("Failed to fetch companies");
//       toast.error("Failed to fetch companies");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch projects
//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/project/projects-with-sites`);
//       setAllProjects(response.data || []);
//     } catch (err) {
//       setError("Failed to fetch projects");
//       toast.error("Failed to fetch projects");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch work descriptions
//   const fetchWorkDescriptions = async (site_id) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/material/work-descriptions`, {
//         params: { site_id },
//       });
//       setWorkDescriptions(response.data.data || []);
//     } catch (err) {
//       setError("Failed to fetch work descriptions");
//       toast.error("Failed to fetch work descriptions");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCompanies();
//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     if (selectedCompany) {
//       const filteredProjects = allProjects.filter((project) => project.company_id === selectedCompany.value);
//       setProjects(filteredProjects);
//       if (!filteredProjects.some((project) => project.project_id === (selectedProject?.value || ""))) {
//         setSelectedProject(null);
//         setSites([]);
//         setSelectedSite(null);
//         setWorkDescriptions([]);
//         setSelectedWorkDescription(null);
//         setDispatchData([]);
//         setAckDetails({});
//         setUsageDetails({});
//       }
//     } else {
//       setProjects([]);
//       setSelectedProject(null);
//       setSites([]);
//       setSelectedSite(null);
//       setWorkDescriptions([]);
//       setSelectedWorkDescription(null);
//       setDispatchData([]);
//       setAckDetails({});
//       setUsageDetails({});
//     }
//   }, [selectedCompany, allProjects]);

//   useEffect(() => {
//     if (selectedProject) {
//       const selectedProjectData = allProjects.find(project => project.project_id === selectedProject.value);
//       setSites(selectedProjectData ? selectedProjectData.sites : []);
//       setSelectedSite(null);
//       setWorkDescriptions([]);
//       setSelectedWorkDescription(null);
//       setDispatchData([]);
//       setAckDetails({});
//       setUsageDetails({});
//     }
//   }, [selectedProject, allProjects]);

//   useEffect(() => {
//     if (selectedSite) {
//       fetchWorkDescriptions(selectedSite.value);
//       setSelectedWorkDescription(null);
//       setDispatchData([]);
//       setAckDetails({});
//       setUsageDetails({});
//     }
//   }, [selectedSite]);

//   useEffect(() => {
//     if (selectedProject && selectedSite && selectedWorkDescription) {
//       const fetchDispatchDetails = async () => {
//         setLoading(true);
//         try {
//           const response = await axios.get(
//             `${API_BASE_URL}/material/dispatch-details/?pd_id=${selectedProject.value}&site_id=${selectedSite.value}&desc_id=${selectedWorkDescription.value}`
//           );
//           const uniqueDispatches = [];
//           const seenKeys = new Set();
//           (response.data.data || []).forEach(dispatch => {
//             const key = dispatch.id;
//             if (!seenKeys.has(key)) {
//               seenKeys.add(key);
//               uniqueDispatches.push(dispatch);
//             }
//           });
//           setDispatchData(uniqueDispatches);

//           const ackPromises = uniqueDispatches.map(dispatch =>
//             axios.get(
//               `${API_BASE_URL}/site-incharge/acknowledgement-details?material_dispatch_id=${dispatch.id}`
//             ).catch(err => ({ data: { data: [] } }))
//           );

//           const ackResponses = await Promise.all(ackPromises);
//           const ackMap = {};
//           ackResponses.forEach((ackResponse, index) => {
//             const dispatchId = uniqueDispatches[index].id;
//             const ackData = ackResponse.data.data[0] || null;
//             ackMap[dispatchId] = ackData;
//           });
//           setAckDetails(ackMap);
//           setError(null);
//         } catch (err) {
//           setError("Failed to fetch dispatch or acknowledgement details");
//           toast.error("Failed to fetch dispatch or acknowledgement details");
//         } finally {
//           setLoading(false);
//         }
//       };
//       fetchDispatchDetails();
//     }
//   }, [selectedProject, selectedSite, selectedWorkDescription]);

//   useEffect(() => {
//     if (selectedDate && dispatchData.length > 0) {
//       dispatchData.forEach(dispatch => {
//         const ack = ackDetails[dispatch.id];
//         if (ack && ack.acknowledgement) {
//           fetchUsageDetails(ack.acknowledgement.id);
//         }
//       });
//     }
//   }, [selectedDate, dispatchData, ackDetails]);

//   const fetchUsageDetails = async (ackId) => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/site-incharge/material-usage-details?material_ack_id=${ackId}&date=${selectedDate}`
//       );
//       setUsageDetails(prev => ({
//         ...prev,
//         [ackId]: response.data.data
//       }));
//     } catch (err) {
//       toast.error("Failed to fetch usage details");
//     }
//   };

//   const handleSaveUsage = async (compositeKey) => {
//     const usageData = usageInputs[compositeKey];
//     if (!usageData || !userId) {
//       toast.error("User ID or Usage data is missing.");
//       return;
//     }

//     const [_, ackIdStr] = compositeKey.split('-');
//     const ackId = parseInt(ackIdStr);

//     try {
//       setSubmitting(true);
//       const response = await axios.post(`${API_BASE_URL}/site-incharge/save-material-usage`, {
//         material_ack_id: ackId,
//         entry_date: selectedDate,
//         overall_qty: usageData.overall_qty !== "" ? parseInt(usageData.overall_qty) : null,
//         remarks: usageData.remarks || null,
//         created_by: userId // Include created_by
//       });
//       toast.success(response.data.message);
//       setUsageInputs(prev => ({ ...prev, [compositeKey]: {} }));
//       fetchUsageDetails(ackId);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to save material usage");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleInputChange = (compositeKey, field, value) => {
//     setUsageInputs(prev => ({
//       ...prev,
//       [compositeKey]: {
//         ...prev[compositeKey],
//         [field]: value
//       }
//     }));
//   };

//   const formatItemAndRatios = (dispatch) => {
//     const ratios = [dispatch.comp_ratio_a, dispatch.comp_ratio_b];
//     if (dispatch.comp_ratio_c !== null) {
//       ratios.push(dispatch.comp_ratio_c);
//     }
//     return `${dispatch.item_name} (${ratios.join(':')})`;
//   };

//   const companyOptions = companies.map(company => ({
//     value: company.company_id,
//     label: company.company_name
//   }));

//   const projectOptions = projects.map(project => ({
//     value: project.project_id,
//     label: project.project_name
//   }));

//   const siteOptions = sites.map(site => ({
//     value: site.site_id,
//     label: site.site_name
//   }));

//   const workDescriptionOptions = workDescriptions.map(desc => ({
//     value: desc.desc_id,
//     label: desc.desc_name
//   }));

//   const isCompleted = (ack, usage) => {
//     return (usage.total_cumulative.overall_qty || 0) >= (ack.overall_quantity || 0);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
//       <div className="w-full max-w-md">
//         <h1 className="text-xl font-bold text-gray-900 mb-4">Material Usage</h1>

//         {error && <div className="text-center py-6 text-sm text-red-600">{error}</div>}

//         <div className="mb-4 flex items-center justify-between">
//           <div className="text-sm font-medium text-gray-700">Select Date:</div>
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
//           />
//         </div>

//         <div className="mb-4 space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
//             <Select
//               options={companyOptions}
//               value={selectedCompany}
//               onChange={setSelectedCompany}
//               placeholder="Search Company..."
//               isSearchable
//               className="w-full"
//               classNamePrefix="react-select"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
//             <Select
//               options={projectOptions}
//               value={selectedProject}
//               onChange={setSelectedProject}
//               placeholder="Search Project..."
//               isSearchable
//               isDisabled={!selectedCompany}
//               className="w-full"
//               classNamePrefix="react-select"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Select Site</label>
//             <Select
//               options={siteOptions}
//               value={selectedSite}
//               onChange={setSelectedSite}
//               placeholder="Search Site..."
//               isSearchable
//               isDisabled={!selectedProject}
//               className="w-full"
//               classNamePrefix="react-select"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Select Work Description</label>
//             <Select
//               options={workDescriptionOptions}
//               value={selectedWorkDescription}
//               onChange={setSelectedWorkDescription}
//               placeholder="Search Work Description..."
//               isSearchable
//               isDisabled={!selectedSite}
//               className="w-full"
//               classNamePrefix="react-select"
//             />
//           </div>
//         </div>

//         {loading && <div className="text-center py-6 text-sm text-gray-500">Loading...</div>}

//         {dispatchData.length > 0 && (
//           <div className="space-y-4">
//             {dispatchData.map(dispatch => {
//               const ackData = ackDetails[dispatch.id];
//               if (!ackData || !ackData.acknowledgement) return null;
//               const ack = ackData.acknowledgement;
//               const compositeKey = `${dispatch.id}-${ack.id}`;
//               const displayData = usageDetails[ack.id] || {
//                 cumulative: { overall_qty: 0 },
//                 total_cumulative: { overall_qty: 0 },
//                 entries: []
//               };

//               return (
//                 <div key={compositeKey} className="bg-white border rounded-lg p-3 mb-3 shadow-sm">
//                   <div className="font-semibold text-base text-gray-800 mb-1">
//                     {formatItemAndRatios(dispatch)}
//                   </div>

//                   <div className="mb-3">
//                     <h4 className="font-medium text-sm text-gray-700 mb-1">Acknowledged Quantities</h4>
//                     <div className="text-sm text-gray-600 space-y-1">
//                       {ack.comp_a_qty !== null && (
//                         <div>Comp A: {ack.comp_a_qty} ({ack.comp_a_remarks || 'No remarks'})</div>
//                       )}
//                       {ack.comp_b_qty !== null && (
//                         <div>Comp B: {ack.comp_b_qty} ({ack.comp_b_remarks || 'No remarks'})</div>
//                       )}
//                       {ack.comp_c_qty !== null && (
//                         <div>Comp C: {ack.comp_c_qty} ({ack.comp_c_remarks || 'No remarks'})</div>
//                       )}
//                       {ack.overall_quantity !== null && (
//                         <div>Overall: {ack.overall_quantity} ({ack.remarks || 'No remarks'})</div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <h4 className="font-medium text-sm text-gray-700 mb-1">Progress as of {selectedDate}</h4>
//                     <div className="text-sm text-gray-600 space-y-1">
//                       <div>Overall: {displayData.cumulative.overall_qty || 0} / {ack.overall_quantity || 0}</div>
//                     </div>
//                   </div>

//                   <div className="mb-3">
//                     <h4 className="font-medium text-sm text-gray-700 mb-1">Entries on {selectedDate}</h4>
//                     {displayData.entries.length === 0 ? (
//                       <div className="text-sm text-gray-500">No entries</div>
//                     ) : (
//                       displayData.entries.map((entry) => (
//                         <div key={entry.entry_id} className="text-sm text-gray-700 space-y-1">
//                           <div className="font-semibold">
//                             At {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
//                           </div>
//                           {entry.overall_qty !== null && (
//                             <div>Overall: {entry.overall_qty} ({entry.remarks || 'No remarks'})</div>
//                           )}
//                         </div>
//                       ))
//                     )}
//                   </div>

//                   {isCompleted(ack, displayData) ? (
//                     <div className="p-2 border rounded-lg text-green-700 flex items-center text-sm">
//                       Completed
//                       <BookCheck size={14} className="ml-2 text-green-600" />
//                     </div>
//                   ) : (
//                     <div className="space-y-3">
//                       <div>
//                         <h5 className="text-sm font-medium text-gray-600 capitalize mb-1">Overall Quantity</h5>
//                         <div className="flex items-center space-x-2">
//                           <input
//                             type="number"
//                             placeholder="Quantity Used"
//                             value={usageInputs[compositeKey]?.overall_qty || ""}
//                             onChange={(e) => handleInputChange(compositeKey, 'overall_qty', e.target.value)}
//                             className="flex-1 p-2 border rounded-lg text-sm"
//                             disabled={(displayData.total_cumulative.overall_qty || 0) >= (ack.overall_quantity || 0)}
//                             min="0"
//                             max={(ack.overall_quantity || 0) - (displayData.total_cumulative.overall_qty || 0)}
//                           />
//                           <input
//                             type="text"
//                             placeholder="Remarks"
//                             value={usageInputs[compositeKey]?.remarks || ""}
//                             onChange={(e) => handleInputChange(compositeKey, 'remarks', e.target.value)}
//                             className="flex-1 p-2 border rounded-lg text-sm mt-1"
//                             disabled={(displayData.total_cumulative.overall_qty || 0) >= (ack.overall_quantity || 0)}
//                           />
//                         </div>
//                       </div>
//                       <button
//                         onClick={() => handleSaveUsage(compositeKey)}
//                         className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
//                         disabled={
//                           submitting ||
//                           !usageInputs[compositeKey] ||
//                           Object.values(usageInputs[compositeKey] || {}).every(val => val === "" || val === null) ||
//                           !userId
//                         }
//                       >
//                         <Save size={14} className="mr-2" />
//                         Save Material Usage
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <ToastContainer
//         position="top-center"
//         autoClose={2500}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//       />
//     </div>
//   );
// };

// export default MaterialUsage;




























// MaterialUsage.jsx (Complete updated frontend component)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { BookCheck, Save, Edit2 } from "lucide-react";
import { useParams } from "react-router-dom";

const MaterialUsage = () => {
  const { encodedUserId } = useParams();
  const [userId, setUserId] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [workDescriptions, setWorkDescriptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedWorkDescription, setSelectedWorkDescription] = useState(null);
  const [dispatchData, setDispatchData] = useState([]);
  const [ackDetails, setAckDetails] = useState({});
  const [usageInputs, setUsageInputs] = useState({});
  const [usageDetails, setUsageDetails] = useState({});
  const [editingEntryId, setEditingEntryId] = useState(null); // Track editing entry
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (encodedUserId) {
      try {
        const decodedId = atob(encodedUserId);
        setUserId(decodedId);
      } catch (err) {
        console.error("Error decoding userId:", err);
        setError("Invalid user ID in URL. Please try again.");
      }
    } else {
      setError("User ID not found in URL. Please try again.");
    }
  }, [encodedUserId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/project/companies`);
      setCompanies(response.data || []);
    } catch (err) {
      setError("Failed to fetch companies");
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/project/projects-with-sites`);
      setAllProjects(response.data || []);
    } catch (err) {
      setError("Failed to fetch projects");
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkDescriptions = async (site_id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/material/work-descriptions`, {
        params: { site_id },
      });
      setWorkDescriptions(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch work descriptions");
      toast.error("Failed to fetch work descriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const filteredProjects = allProjects.filter((project) => project.company_id === selectedCompany.value);
      setProjects(filteredProjects);
      if (!filteredProjects.some((project) => project.project_id === (selectedProject?.value || ""))) {
        setSelectedProject(null);
        setSites([]);
        setSelectedSite(null);
        setWorkDescriptions([]);
        setSelectedWorkDescription(null);
        setDispatchData([]);
        setAckDetails({});
        setUsageDetails({});
      }
    } else {
      setProjects([]);
      setSelectedProject(null);
      setSites([]);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedWorkDescription(null);
      setDispatchData([]);
      setAckDetails({});
      setUsageDetails({});
    }
  }, [selectedCompany, allProjects]);

  useEffect(() => {
    if (selectedProject) {
      const selectedProjectData = allProjects.find(project => project.project_id === selectedProject.value);
      setSites(selectedProjectData ? selectedProjectData.sites : []);
      setSelectedSite(null);
      setWorkDescriptions([]);
      setSelectedWorkDescription(null);
      setDispatchData([]);
      setAckDetails({});
      setUsageDetails({});
    }
  }, [selectedProject, allProjects]);

  useEffect(() => {
    if (selectedSite) {
      fetchWorkDescriptions(selectedSite.value);
      setSelectedWorkDescription(null);
      setDispatchData([]);
      setAckDetails({});
      setUsageDetails({});
    }
  }, [selectedSite]);

  useEffect(() => {
    if (selectedProject && selectedSite && selectedWorkDescription) {
      const fetchDispatchDetails = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/material/dispatch-details/?pd_id=${selectedProject.value}&site_id=${selectedSite.value}&desc_id=${selectedWorkDescription.value}`
          );
          const uniqueDispatches = [];
          const seenKeys = new Set();
          (response.data.data || []).forEach(dispatch => {
            const key = dispatch.id;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              uniqueDispatches.push(dispatch);
            }
          });
          setDispatchData(uniqueDispatches);

          const ackPromises = uniqueDispatches.map(dispatch =>
            axios.get(
              `${API_BASE_URL}/site-incharge/acknowledgement-details?material_dispatch_id=${dispatch.id}`
            ).catch(err => ({ data: { data: [] } }))
          );

          const ackResponses = await Promise.all(ackPromises);
          const ackMap = {};
          ackResponses.forEach((ackResponse, index) => {
            const dispatchId = uniqueDispatches[index].id;
            const ackData = ackResponse.data.data[0] || null;
            ackMap[dispatchId] = ackData;
          });
          setAckDetails(ackMap);
          setError(null);
        } catch (err) {
          setError("Failed to fetch dispatch or acknowledgement details");
          toast.error("Failed to fetch dispatch or acknowledgement details");
        } finally {
          setLoading(false);
        }
      };
      fetchDispatchDetails();
    }
  }, [selectedProject, selectedSite, selectedWorkDescription]);

  useEffect(() => {
    if (selectedDate && dispatchData.length > 0) {
      dispatchData.forEach(dispatch => {
        const ack = ackDetails[dispatch.id];
        if (ack && ack.acknowledgement) {
          fetchUsageDetails(ack.acknowledgement.id);
        }
      });
    }
  }, [selectedDate, dispatchData, ackDetails]);

  const fetchUsageDetails = async (ackId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/site-incharge/material-usage-details?material_ack_id=${ackId}&date=${selectedDate}`
      );
      setUsageDetails(prev => ({
        ...prev,
        [ackId]: response.data.data
      }));
    } catch (err) {
      console.error("Error fetching usage details for ackId", ackId, err);
      toast.error("Failed to fetch usage details");
    }
  };

  const handleSaveUsage = async (compositeKey) => {
    const usageData = usageInputs[compositeKey];
    if (!usageData || !userId) {
      toast.error("User ID or Usage data is missing.");
      return;
    }

    const [_, ackIdStr] = compositeKey.split('-');
    const ackId = parseInt(ackIdStr);

    try {
      setSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/site-incharge/save-material-usage`, {
        material_ack_id: ackId,
        entry_date: selectedDate,
        overall_qty: usageData.overall_qty !== "" ? parseInt(usageData.overall_qty) : null,
        remarks: usageData.remarks || null,
        created_by: userId
      });
      toast.success(response.data.message);
      setUsageInputs(prev => ({ ...prev, [compositeKey]: {} }));
      fetchUsageDetails(ackId);
    } catch (err) {
      console.error("Error saving usage:", err);
      toast.error(err.response?.data?.message || "Failed to save material usage");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUsageEntry = async (entryId, ackId) => {
    const usageData = usageInputs[`edit-${entryId}`];
    if (!usageData || !userId || !entryId) {
      toast.error("User ID, Entry ID or data is missing.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.put(`${API_BASE_URL}/site-incharge/update-material-usage-entry`, {
        entry_id: entryId,
        overall_qty: usageData.overall_qty !== "" ? parseInt(usageData.overall_qty) : null,
        remarks: usageData.remarks || null,
        updated_by: userId,
      });
      toast.success(response.data.message);
      setEditingEntryId(null);
      setUsageInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[`edit-${entryId}`];
        return newInputs;
      });
      fetchUsageDetails(ackId);
    } catch (err) {
      console.error("Error updating usage entry:", err);
      toast.error(err.response?.data?.message || "Failed to update material usage entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEntryToggle = (entryId, ackId, entry) => {
    if (editingEntryId === entryId) {
      // Cancel edit
      setEditingEntryId(null);
      setUsageInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[`edit-${entryId}`];
        return newInputs;
      });
    } else {
      // Start edit
      setEditingEntryId(entryId);
      setUsageInputs(prev => ({
        ...prev,
        [`edit-${entryId}`]: {
          overall_qty: entry.overall_qty !== null ? entry.overall_qty.toString() : "",
          remarks: entry.remarks || ""
        }
      }));
    }
  };

  const handleInputChange = (key, field, value) => {
    setUsageInputs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const formatItemAndRatios = (dispatch) => {
    const ratios = [dispatch.comp_ratio_a, dispatch.comp_ratio_b];
    if (dispatch.comp_ratio_c !== null) {
      ratios.push(dispatch.comp_ratio_c);
    }
    return `${dispatch.item_name} (${ratios.join(':')})`;
  };

  const companyOptions = companies.map(company => ({
    value: company.company_id,
    label: company.company_name
  }));

  const projectOptions = projects.map(project => ({
    value: project.project_id,
    label: project.project_name
  }));

  const siteOptions = sites.map(site => ({
    value: site.site_id,
    label: site.site_name
  }));

  const workDescriptionOptions = workDescriptions.map(desc => ({
    value: desc.desc_id,
    label: desc.desc_name
  }));

  const isCompleted = (ack, usage) => {
    return (usage.total_cumulative.overall_qty || 0) >= (ack.overall_quantity || 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Material Usage</h1>

        {error && <div className="text-center py-6 text-sm text-red-600">{error}</div>}

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">Select Date:</div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white border rounded-lg shadow-sm text-sm"
          />
        </div>

        <div className="mb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Company</label>
            <Select
              options={companyOptions}
              value={selectedCompany}
              onChange={setSelectedCompany}
              placeholder="Search Company..."
              isSearchable
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
            <Select
              options={projectOptions}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Search Project..."
              isSearchable
              isDisabled={!selectedCompany}
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Site</label>
            <Select
              options={siteOptions}
              value={selectedSite}
              onChange={setSelectedSite}
              placeholder="Search Site..."
              isSearchable
              isDisabled={!selectedProject}
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Work Description</label>
            <Select
              options={workDescriptionOptions}
              value={selectedWorkDescription}
              onChange={setSelectedWorkDescription}
              placeholder="Search Work Description..."
              isSearchable
              isDisabled={!selectedSite}
              className="w-full"
              classNamePrefix="react-select"
            />
          </div>
        </div>

        {loading && <div className="text-center py-6 text-sm text-gray-500">Loading...</div>}

        {dispatchData.length > 0 && (
          <div className="space-y-4">
            {dispatchData.map(dispatch => {
              const ackData = ackDetails[dispatch.id];
              if (!ackData || !ackData.acknowledgement) return null;
              const ack = ackData.acknowledgement;
              const compositeKey = `${dispatch.id}-${ack.id}`;
              const displayData = usageDetails[ack.id] || {
                cumulative: { overall_qty: 0 },
                total_cumulative: { overall_qty: 0 },
                entries: []
              };

              return (
                <div key={compositeKey} className="bg-white border rounded-lg p-3 mb-3 shadow-sm">
                  <div className="font-semibold text-base text-gray-800 mb-1">
                    {formatItemAndRatios(dispatch)}
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Acknowledged Quantities</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {ack.overall_quantity !== null && (
                        <div>Overall: {ack.overall_quantity} ({ack.remarks || 'No remarks'})</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Progress as of {selectedDate}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Overall: {displayData.cumulative.overall_qty || 0} / {ack.overall_quantity || 0}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Entries on {selectedDate}</h4>
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
                                    <h5 className="text-xs font-medium text-gray-600 mb-1">Overall Quantity</h5>
                                    <input
                                      type="number"
                                      placeholder="Quantity Used"
                                      value={usageInputs[`edit-${entry.entry_id}`]?.overall_qty || ""}
                                      onChange={(e) => handleInputChange(`edit-${entry.entry_id}`, 'overall_qty', e.target.value)}
                                      className="w-full p-1 border rounded text-xs"
                                      min="0"
                                    />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-600 mb-1">Remarks</h5>
                                    <input
                                      type="text"
                                      placeholder="Remarks"
                                      value={usageInputs[`edit-${entry.entry_id}`]?.remarks || ""}
                                      onChange={(e) => handleInputChange(`edit-${entry.entry_id}`, 'remarks', e.target.value)}
                                      className="w-full p-1 border rounded text-xs"
                                    />
                                  </div>
                                </div>
                                <div className="flex space-x-1 mt-2">
                                  <button
                                    onClick={() => handleUpdateUsageEntry(entry.entry_id, ack.id)}
                                    className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 flex items-center justify-center"
                                    disabled={submitting || !usageInputs[`edit-${entry.entry_id}`]?.overall_qty}
                                  >
                                    <Save size={10} className="mr-1" />
                                    Update
                                  </button>
                                  <button
                                    onClick={() => handleEditEntryToggle(entry.entry_id, ack.id, entry)}
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
                                {entry.overall_qty !== null && (
                                  <div>Overall: {entry.overall_qty} ({entry.remarks || 'No remarks'})</div>
                                )}
                                {entry.is_editable && (
                                  <button
                                    onClick={() => handleEditEntryToggle(entry.entry_id, ack.id, entry)}
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

                  {isCompleted(ack, displayData) ? (
                    <div className="p-2 border rounded-lg text-green-700 flex items-center text-sm">
                      Completed
                      <BookCheck size={14} className="ml-2 text-green-600" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 capitalize mb-1">Overall Quantity</h5>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            placeholder="Quantity Used"
                            value={usageInputs[compositeKey]?.overall_qty || ""}
                            onChange={(e) => handleInputChange(compositeKey, 'overall_qty', e.target.value)}
                            className="flex-1 p-2 border rounded-lg text-sm"
                            disabled={(displayData.total_cumulative.overall_qty || 0) >= (ack.overall_quantity || 0)}
                            min="0"
                            max={(ack.overall_quantity || 0) - (displayData.total_cumulative.overall_qty || 0)}
                          />
                          <input
                            type="text"
                            placeholder="Remarks"
                            value={usageInputs[compositeKey]?.remarks || ""}
                            onChange={(e) => handleInputChange(compositeKey, 'remarks', e.target.value)}
                            className="flex-1 p-2 border rounded-lg text-sm"
                            disabled={(displayData.total_cumulative.overall_qty || 0) >= (ack.overall_quantity || 0)}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleSaveUsage(compositeKey)}
                        className="w-full p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center"
                        disabled={
                          submitting ||
                          !usageInputs[compositeKey] ||
                          Object.values(usageInputs[compositeKey] || {}).every(val => val === "" || val === null) ||
                          !userId ||
                          (displayData.total_cumulative.overall_qty || 0) >= (ack.overall_quantity || 0)
                        }
                      >
                        <Save size={14} className="mr-2" />
                        Save Material Usage
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default MaterialUsage;
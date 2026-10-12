import { API_BASE_URL } from "../../../config/api.js";
// import React, { useState, useEffect } from 'react';

// const SiteInchargeAttendance = () => {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [selectedProject, setSelectedProject] = useState('');
//   const [data, setData] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [createdBy, setCreatedBy] = useState('');
//   const [attendances, setAttendances] = useState({});
//   const [existingAttendances, setExistingAttendances] = useState({});
//   const [isEditing, setIsEditing] = useState({});
//   const [historyModal, setHistoryModal] = useState({ open: false, data: [], assignId: null });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchCompanies = () => {
//     fetch(`${API_BASE_URL}/finance/companies-with-projects`)
//       .then((res) => res.json())
//       .then(({ status, data: fetchedData }) => {
//         if (status === 'success') {
//           setCompanies(fetchedData);
//           if (fetchedData.length > 0 && !selectedCompany) {
//             setSelectedCompany(fetchedData[0].company_id);
//           }
//         }
//       })
//       .catch((err) => {
//         console.error('Failed to fetch companies');
//       });
//   };

//   const fetchSiteIncharges = () => {
//     if (!selectedProject) return;
//     fetch(`${API_BASE_URL}/finance/site-incharges?pd_id=${selectedProject}`)
//       .then((res) => res.json())
//       .then(({ status, data: fetchedData }) => {
//         if (status === 'success') {
//           setData(fetchedData);
//           const initAttendances = {};
//           const initEditing = {};
//           fetchedData.forEach((item) => {
//             initAttendances[item.id] = { shift: '', remarks: '' };
//             initEditing[item.id] = false;
//           });
//           setAttendances(initAttendances);
//           setIsEditing(initEditing);
//         } else {
//           setError('Failed to fetch site incharges');
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError('Failed to fetch site incharges');
//         setLoading(false);
//       });
//   };

//   const fetchExistingAttendances = () => {
//     if (!selectedDate || !selectedProject) return;
//     fetch(`${API_BASE_URL}/finance/siteincharge-attendance?pd_id=${selectedProject}&entry_date=${selectedDate}`)
//       .then((res) => res.json())
//       .then(({ status, data: fetchedData }) => {
//         if (status === 'success') {
//           const existingMap = {};
//           fetchedData.forEach((att) => {
//             existingMap[att.siteincharge_assign_id] = { shift: att.shift || '', remarks: att.remarks || '' };
//           });
//           setExistingAttendances(existingMap);
//           // Prefill attendances
//           setAttendances((prev) => {
//             const updated = { ...prev };
//             Object.keys(updated).forEach((key) => {
//               const existing = existingMap[key];
//               if (existing) {
//                 updated[key] = { ...existing };
//               }
//             });
//             return updated;
//           });
//           // Set editing state based on existence
//           setIsEditing((prev) => {
//             const updatedEditing = { ...prev };
//             data.forEach((item) => {
//               updatedEditing[item.id] = !existingMap[item.id];
//             });
//             return updatedEditing;
//           });
//         }
//       })
//       .catch(() => {
//         setExistingAttendances({});
//         setAttendances((prev) => {
//           const reset = { ...prev };
//           Object.keys(reset).forEach((key) => {
//             reset[key] = { shift: '', remarks: '' };
//           });
//           return reset;
//         });
//         // Set all to editing true (new entries)
//         setIsEditing((prev) => {
//           const updatedEditing = {};
//           data.forEach((item) => {
//             updatedEditing[item.id] = true;
//           });
//           return updatedEditing;
//         });
//       });
//   };

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     const currentCompany = companies.find(c => c.company_id === selectedCompany);
//     if (currentCompany && currentCompany.projects && currentCompany.projects.length > 0 && !selectedProject) {
//       setSelectedProject(currentCompany.projects[0].pd_id);
//     }
//   }, [selectedCompany, companies]);

//   useEffect(() => {
//     if (selectedProject) {
//       setLoading(true);
//       fetchSiteIncharges();
//     } else {
//       setData([]);
//       setAttendances({});
//       setExistingAttendances({});
//       setIsEditing({});
//       setLoading(false);
//     }
//   }, [selectedProject]);

//   useEffect(() => {
//     if (selectedProject) {
//       fetchExistingAttendances();
//     }
//   }, [selectedDate, selectedProject]);

//   const handleShiftChange = (id, shift) => {
//     setAttendances((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], shift }
//     }));
//   };

//   const handleRemarksChange = (id, remarks) => {
//     setAttendances((prev) => ({
//       ...prev,
//       [id]: { ...prev[id], remarks }
//     }));
//   };

//   const toggleEdit = (id) => {
//     setIsEditing((prev) => ({ ...prev, [id]: !prev[id] }));
//   };

//   const cancelEdit = (id) => {
//     const existing = existingAttendances[id];
//     setAttendances((prev) => ({
//       ...prev,
//       [id]: existing || { shift: '', remarks: '' }
//     }));
//     if (existing) {
//       setIsEditing((prev) => ({ ...prev, [id]: false }));
//     }
//     // For new entries, keep editing true to stay in input mode
//   };

//   const saveEdit = async (id) => {
//     if (!createdBy.trim()) {
//       alert('Created by is required');
//       return;
//     }

//     const { shift, remarks } = attendances[id];
//     if (!shift.trim()) {
//       alert('Shift is required');
//       return;
//     }

//     const attArray = [{
//       siteincharge_assign_id: parseInt(id),
//       shift: shift.trim(),
//       entry_date: selectedDate,
//       remarks: remarks.trim()
//     }];

//     try {
//       const response = await fetch(`${API_BASE_URL}/finance/siteincharge-attendance`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ attendances: attArray, created_by: createdBy.trim() })
//       });

//       const result = await response.json();

//       if (result.status === 'success') {
//         alert('Attendance saved successfully');
//         setIsEditing((prev) => ({ ...prev, [id]: false }));
//         // Update local state to reflect the saved values immediately
//         const newAtt = { shift: shift.trim(), remarks: remarks.trim() };
//         setAttendances((prev) => ({ ...prev, [id]: newAtt }));
//         setExistingAttendances((prev) => ({ ...prev, [id]: newAtt }));
//       } else {
//         alert(`Error: ${result.message || 'Failed to save attendance'}`);
//       }
//     } catch (err) {
//       alert('Error saving attendance');
//     }
//   };

//   const viewHistory = async (assignId) => {
//     fetch(`${API_BASE_URL}/finance/siteincharge-attendance-history?siteincharge_assign_id=${assignId}&entry_date=${selectedDate}`)
//       .then((res) => res.json())
//       .then(({ status, data }) => {
//         if (status === 'success') {
//           setHistoryModal({ open: true, data, assignId });
//         } else {
//           alert('No history available');
//         }
//       })
//       .catch(() => {
//         alert('Failed to fetch history');
//       });
//   };

//   const closeHistoryModal = () => {
//     setHistoryModal({ open: false, data: [], assignId: null });
//   };

//   if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
//   if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

//   const currentAtt = (id) => attendances[id] || { shift: '', remarks: '' };

//   const currentCompany = companies.find(c => c.company_id === selectedCompany);

//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Site Incharge Attendance</h1>
      
//       <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//         <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Select Company</label>
//             <select
//               value={selectedCompany}
//               onChange={(e) => {
//                 setSelectedCompany(e.target.value);
//                 setSelectedProject('');
//                 setData([]);
//                 setAttendances({});
//                 setExistingAttendances({});
//                 setIsEditing({});
//               }}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="">Select Company</option>
//               {companies.map((company) => (
//                 <option key={company.company_id} value={company.company_id}>
//                   {company.company_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex-1">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
//             <select
//               value={selectedProject}
//               onChange={(e) => setSelectedProject(e.target.value)}
//               disabled={!selectedCompany}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
//             >
//               <option value="">Select Project</option>
//               {currentCompany?.projects?.map((project) => (
//                 <option key={project.pd_id} value={project.pd_id}>
//                   {project.project_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
//           <div className="flex items-center">
//             <label className="mr-4 text-sm font-medium text-gray-700">Entry Date:</label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               disabled={!selectedProject}
//             />
//           </div>
//           <div className="flex items-center">
//             <label className="mr-4 text-sm font-medium text-gray-700">Created By:</label>
//             <input
//               type="text"
//               value={createdBy}
//               onChange={(e) => setCreatedBy(e.target.value)}
//               placeholder="Enter created by"
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               disabled={!selectedProject}
//             />
//           </div>
//         </div>

//         {selectedProject ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {data.map((item) => {
//                   const att = currentAtt(item.id);
//                   const editing = isEditing[item.id];
//                   const hasExisting = !!existingAttendances[item.id];
//                   return (
//                     <tr key={item.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.full_name}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.from_date).toISOString().split('T')[0]}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.to_date).toISOString().split('T')[0]}</td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {editing ? (
//                           <input
//                             type="text"
//                             value={att.shift}
//                             onChange={(e) => handleShiftChange(item.id, e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           />
//                         ) : (
//                           <span className="text-gray-900">{att.shift || 'N/A'}</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {editing ? (
//                           <textarea
//                             value={att.remarks}
//                             onChange={(e) => handleRemarksChange(item.id, e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                             rows={2}
//                           />
//                         ) : (
//                           <span className="text-gray-900">{att.remarks || 'N/A'}</span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         {editing ? (
//                           <>
//                             <button
//                               onClick={() => saveEdit(item.id)}
//                               className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded mr-2 text-xs"
//                             >
//                               Save
//                             </button>
//                             <button
//                               onClick={() => cancelEdit(item.id)}
//                               className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
//                             >
//                               Cancel
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <button
//                               onClick={() => toggleEdit(item.id)}
//                               className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2 text-xs"
//                             >
//                               Edit
//                             </button>
//                             {hasExisting && (
//                               <button
//                                 onClick={() => viewHistory(item.id)}
//                                 className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
//                               >
//                                 History
//                               </button>
//                             )}
//                           </>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="text-center text-gray-500 py-8">Please select a company and project to view site incharges.</div>
//         )}
//       </div>

//       {historyModal.open && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
//             <h3 className="text-lg font-bold mb-4">Attendance History</h3>
//             {historyModal.data.length === 0 ? (
//               <p className="text-gray-500">No history available.</p>
//             ) : (
//               <ul className="space-y-2">
//                 {historyModal.data.map((version, index) => (
//                   <li key={index} className="border-l-4 border-blue-500 pl-4">
//                     <div className="text-sm text-gray-600 mb-1">{new Date(version.date).toLocaleString()}</div>
//                     <div className="text-sm font-medium">By: {version.by || 'N/A'}</div>
//                     <div className="text-sm">Shift: {version.shift || 'N/A'}</div>
//                     <div className="text-sm">Remarks: {version.remarks || 'N/A'}</div>
//                     <div className="text-xs text-gray-400">Type: {version.type}</div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//             <button
//               onClick={closeHistoryModal}
//               className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SiteInchargeAttendance;





















import React, { useState, useEffect } from 'react';
import { Building2, Calendar, User, Edit, Check, X, History, Search } from 'lucide-react';

const themeColors = {
  primary: '#1e7a6f',
  accent: '#c79100',
  lightBg: '#f8f9fa',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  lightBorder: '#e9ecef',
};

const SiteInchargeAttendance = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState({});
  const [existingAttendances, setExistingAttendances] = useState({});
  const [isEditing, setIsEditing] = useState({});
  const [historyModal, setHistoryModal] = useState({ open: false, data: [], assignId: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Extract encoded user ID from URL (e.g., /NA==)
  const getUserIdFromUrl = () => {
    const path = window.location.pathname;
    const parts = path.split('/');
    const encodedId = parts[parts.length - 1]; // Last segment
    if (encodedId && encodedId !== '') {
      try {
        return atob(encodedId); // Decode base64 if needed (common pattern)
      } catch (e) {
        return encodedId; // Return as-is if not base64
      }
    }
    return null;
  };

  const [currentUserId] = useState(() => getUserIdFromUrl());

  useEffect(() => {
    if (!currentUserId) {
      setError('User not authenticated. Invalid or missing user ID in URL.');
    }
  }, [currentUserId]);

  // Fetch companies
  useEffect(() => {
    fetch(`${API_BASE_URL}/finance/companies-with-projects`)
      .then(res => res.json())
      .then(({ status, data }) => {
        if (status === 'success') {
          setCompanies(data);
          if (data.length > 0 && !selectedCompany) {
            setSelectedCompany(data[0].company_id);
          }
        }
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load companies');
      });
  }, []);

  // Auto-select first project
  useEffect(() => {
    const company = companies.find(c => c.company_id === selectedCompany);
    if (company?.projects?.length > 0 && !selectedProject) {
      setSelectedProject(company.projects[0].pd_id);
    }
  }, [selectedCompany, companies]);

  // Fetch site incharges
  useEffect(() => {
    if (!selectedProject) {
      setData([]);
      setAttendances({});
      setExistingAttendances({});
      setIsEditing({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    fetch(`${API_BASE_URL}/finance/site-incharges?pd_id=${selectedProject}`, {
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then(({ status, data: fetchedData }) => {
        if (status !== 'success' || !Array.isArray(fetchedData)) {
          throw new Error('Invalid response');
        }

        setData(fetchedData);

        const initAtt = {};
        const initEdit = {};

        fetchedData.forEach(item => {
          const id = item.id;
          initAtt[id] = { shift: '', remarks: '' };
          initEdit[id] = true;
        });

        setAttendances(initAtt);
        setIsEditing(initEdit);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError('Failed to load site incharges');
          setData([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [selectedProject]);

  // Fetch existing attendance
  useEffect(() => {
    if (!selectedProject || !selectedDate) {
      setExistingAttendances({});
      return;
    }

    const controller = new AbortController();

    fetch(`${API_BASE_URL}/finance/siteincharge-attendance?pd_id=${selectedProject}&entry_date=${selectedDate}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(({ status, data }) => {
        if (status === 'success') {
          const map = {};
          data.forEach(att => {
            map[att.siteincharge_assign_id] = {
              shift: att.shift || '',
              remarks: att.remarks || ''
            };
          });
          setExistingAttendances(map);

          setAttendances(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(id => {
              if (map[id]) updated[id] = { ...map[id] };
            });
            return updated;
          });

          setIsEditing(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(id => {
              updated[id] = !map[id];
            });
            return updated;
          });
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setExistingAttendances({});
        }
      });

    return () => controller.abort();
  }, [selectedDate, selectedProject]);

  const handleShiftChange = (id, value) => {
    setAttendances(prev => ({ ...prev, [id]: { ...prev[id], shift: value } }));
  };

  const handleRemarksChange = (id, value) => {
    setAttendances(prev => ({ ...prev, [id]: { ...prev[id], remarks: value } }));
  };

  const toggleEdit = (id) => {
    setIsEditing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cancelEdit = (id) => {
    const existing = existingAttendances[id];
    if (existing) {
      setAttendances(prev => ({ ...prev, [id]: { ...existing } }));
      setIsEditing(prev => ({ ...prev, [id]: false }));
    }
  };

  const saveEdit = async (id) => {
    if (!currentUserId) {
      alert('User not identified. Cannot save attendance.');
      return;
    }

    const { shift, remarks } = attendances[id] || {};
    if (!shift?.trim()) {
      return alert('Shift is required');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/finance/siteincharge-attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendances: [{
            siteincharge_assign_id: id,
            shift: shift.trim(),
            entry_date: selectedDate,
            remarks: remarks?.trim() || ''
          }],
          created_by: currentUserId  // Automatically sent from URL
        })
      });

      const result = await res.json();
      if (result.status === 'success') {
        alert('Attendance saved successfully!');
        setExistingAttendances(prev => ({
          ...prev,
          [id]: { shift: shift.trim(), remarks: remarks?.trim() || '' }
        }));
        setIsEditing(prev => ({ ...prev, [id]: false }));
      } else {
        alert('Failed to save: ' + (result.message || 'Try again'));
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  const viewHistory = async (assignId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance/siteincharge-attendance-history?siteincharge_assign_id=${assignId}`);
      const { status, data } = await res.json();
      if (status === 'success' && data.length > 0) {
        setHistoryModal({ open: true, data, assignId });
      } else {
        alert('No history found for this incharge');
      }
    } catch {
      alert('Failed to load history');
    }
  };

  const filteredData = data.filter(item =>
    item.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentCompany = companies.find(c => c.company_id === selectedCompany);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: themeColors.lightBg }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.primary }}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: themeColors.textPrimary }}>
                Site Incharge Daily Attendance
              </h1>
              <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                Mark daily shift and remarks for site incharges
              </p>
            </div>
          </div>
        </div>

        {/* Filters - Removed Created By field */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6" style={{ borderColor: themeColors.border }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>
                <Building2 size={16} className="inline mr-2" /> Company
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => { setSelectedCompany(e.target.value); setSelectedProject(''); }}
                className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={!selectedCompany}
                className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 disabled:bg-gray-50"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              >
                <option value="">Select Project</option>
                {currentCompany?.projects?.map(p => (
                  <option key={p.pd_id} value={p.pd_id}>{p.project_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: themeColors.textPrimary }}>
                <Calendar size={16} className="inline mr-2" /> Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
              />
            </div>
          </div>

          {/* Optional: Show current user for transparency */}
          {currentUserId && (
            <div className="mt-4 text-sm text-gray-600">
              <strong>Logged in as:</strong> User ID: {currentUserId}
            </div>
          )}
        </div>

        {/* Search */}
        {selectedProject && (
          <div className="mb-6 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
            <input
              type="text"
              placeholder="Search incharge..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: themeColors.border }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4"
                   style={{ borderColor: themeColors.border, borderTopColor: themeColors.primary }}></div>
              <p className="mt-4 text-sm" style={{ color: themeColors.textSecondary }}>Loading...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 font-medium">{error}</div>
          ) : !selectedProject ? (
            <div className="p-12 text-center text-gray-500">Please select a project</div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No site incharges found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: themeColors.lightBg }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>From</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Shift</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Remarks</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ divideColor: themeColors.lightBorder }}>
                  {filteredData.map(item => {
                    const att = attendances[item.id] || { shift: '', remarks: '' };
                    const editing = isEditing[item.id];
                    const hasHistory = !!existingAttendances[item.id];

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium" style={{ color: themeColors.textPrimary }}>
                          {item.full_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.from_date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(item.to_date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          {editing ? (
                            <input
                              type="text"
                              value={att.shift}
                              onChange={(e) => handleShiftChange(item.id, e.target.value)}
                              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            />
                          ) : (
                            <span className={att.shift ? 'font-medium' : 'text-gray-400'}>
                              {att.shift || 'Not Marked'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editing ? (
                            <textarea
                              value={att.remarks}
                              onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border rounded resize-none focus:outline-none focus:ring-2"
                              style={{ borderColor: themeColors.border, '--tw-ring-color': themeColors.primary }}
                            />
                          ) : (
                            <span className="text-gray-700">{att.remarks || '-'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {editing ? (
                            <div className="flex justify-center gap-3">
                              <button onClick={() => saveEdit(item.id)} className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                                <Check size={18} />
                              </button>
                              <button onClick={() => cancelEdit(item.id)} className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                                <X size={18} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-3">
                              <button onClick={() => toggleEdit(item.id)} className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                <Edit size={18} />
                              </button>
                              {hasHistory && (
                                <button onClick={() => viewHistory(item.id)} className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                                  <History size={18} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* History Modal */}
        {historyModal.open && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setHistoryModal({ open: false, data: [], assignId: null })}>
            <div className="bg-white rounded-2xl shadow-2xl border max-w-lg w-full max-h-96 overflow-y-auto" style={{ borderColor: themeColors.border }} onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b sticky top-0 bg-white" style={{ borderColor: themeColors.lightBorder }}>
                <h3 className="text-xl font-bold" style={{ color: themeColors.textPrimary }}>Attendance History</h3>
              </div>
              <div className="p-6">
                {historyModal.data.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No history available</p>
                ) : (
                  <div className="space-y-4">
                    {historyModal.data.map((h, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg border" style={{ borderColor: themeColors.lightBorder }}>
                        <div className="text-xs font-medium text-gray-600">
                          {new Date(h.date).toLocaleString('en-IN')}
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          <div><strong>By:</strong> {h.by || 'Unknown'}</div>
                          <div><strong>Shift:</strong> {h.shift || '-'}</div>
                          <div><strong>Remarks:</strong> {h.remarks || '-'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t text-right" style={{ borderColor: themeColors.lightBorder }}>
                <button
                  onClick={() => setHistoryModal({ open: false, data: [], assignId: null })}
                  className="px-8 py-3 rounded-lg font-medium border"
                  style={{ borderColor: themeColors.border, color: themeColors.textPrimary }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteInchargeAttendance;
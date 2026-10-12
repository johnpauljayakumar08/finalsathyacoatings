import { API_BASE_URL } from "../../config/api.js";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { PlusCircle, Trash2, Loader2, CheckCircle } from "lucide-react";
// import Select from "react-select";
// import CreatableSelect from "react-select/creatable";
// import { useParams } from "react-router-dom";

// const MaterialPlanning = ({
//   selectedCompany,
//   selectedProject,
//   selectedSite,
//   selectedWorkDesc,
//   existingBudget,
//   projectionBudgetValue, // New prop for projection-specific budget value
//   onTotalCostChange,
//   onMaterialsChange,
// }) => {
//   const { encodedUserId } = useParams(); 
//   const [materials, setMaterials] = useState([]);
//   const [uoms, setUoms] = useState([]);
//   const [materialAssignments, setMaterialAssignments] = useState({});
//   const [existingAssignments, setExistingAssignments] = useState([]);
//   const [loading, setLoading] = useState({
//     materials: false,
//     uoms: false,
//     assignedMaterials: false,
//     submitting: false,
//   });
//   const [error, setError] = useState(null);
//   const [addingMaterial, setAddingMaterial] = useState(false);
//   const [currentDescId, setCurrentDescId] = useState(null);
//   const [currentMatIndex, setCurrentMatIndex] = useState(null);
//   const [materialTotalCost, setMaterialTotalCost] = useState(0);
//   const [materialBudgetPercentage, setMaterialBudgetPercentage] = useState(0);

//   // Fetch materials
//   const fetchMaterials = async () => {
//     try {
//       setLoading((prev) => ({ ...prev, materials: true }));
//       const response = await axios.get(`${API_BASE_URL}/material/materials`);
//       setMaterials(Array.isArray(response.data?.data) ? response.data.data : []);
//     } catch (error) {
//       console.error("Error fetching materials:", error);
//       setError("Failed to load materials. Please try again.");
//       setMaterials([]);
//     } finally {
//       setLoading((prev) => ({ ...prev, materials: false }));
//     }
//   };

//   // Fetch UOMs
//   const fetchUoms = async () => {
//     try {
//       setLoading((prev) => ({ ...prev, uoms: true }));
//       const response = await axios.get(`${API_BASE_URL}/material/uom`);
//       setUoms(Array.isArray(response.data?.data) ? response.data.data : []);
//     } catch (error) {
//       console.error("Error fetching UOMs:", error);
//       setError("Failed to load UOMs. Please try again.");
//     } finally {
//       setLoading((prev) => ({ ...prev, uoms: false }));
//     }
//   };

//   // Fetch assigned materials
//   const fetchAssignedMaterials = async (site_id, desc_id) => {
//     try {
//       setLoading((prev) => ({ ...prev, assignedMaterials: true }));
//       const response = await axios.get(
//         `${API_BASE_URL}/material/assigned-materials?site_id=${site_id}&desc_id=${desc_id}`
//       );
//       const assignedMaterials = Array.isArray(response.data?.data) ? response.data.data : [];
//       setExistingAssignments(assignedMaterials);
//       setMaterialAssignments({
//         [desc_id]: [
//           {
//             item_id: "",
//             uom_id: "",
//             quantity: "",
//             comp_ratio_a: "",
//             comp_ratio_b: "",
//             comp_ratio_c: "",
//             rate: "",
//             projection_id: "",
//           },
//         ],
//       });
//     } catch (error) {
//       console.error("Error fetching assigned materials:", error);
//       setError("Failed to load assigned materials. Please try again.");
//       setExistingAssignments([]);
//       setMaterialAssignments({
//         [desc_id]: [
//           {
//             item_id: "",
//             uom_id: "",
//             quantity: "",
//             comp_ratio_a: "",
//             comp_ratio_b: "",
//             comp_ratio_c: "",
//             rate: "",
//             projection_id: "",
//           },
//         ],
//       });
//     } finally {
//       setLoading((prev) => ({ ...prev, assignedMaterials: false }));
//     }
//   };

//   useEffect(() => {
//     fetchMaterials();
//     fetchUoms();
//     if (selectedSite?.value && selectedWorkDesc?.value) {
//       fetchAssignedMaterials(selectedSite.value, selectedWorkDesc.value);
//     }
//   }, [selectedSite, selectedWorkDesc]);

//   // Calculate total cost for a single material
//   const calculateTotalCost = (mat) => {
//     const quantity = parseFloat(mat.quantity) || 0;
//     const rate = parseFloat(mat.rate) || 0;
//     return (quantity * rate).toFixed(2);
//   };

//   // Calculate overall cost for all material assignments
//   const calculateOverallCost = () => {
//     const materials = materialAssignments[selectedWorkDesc?.value] || [];
//     return materials
//       .reduce((total, mat) => {
//         const cost = parseFloat(calculateTotalCost(mat)) || 0;
//         return total + cost;
//       }, 0)
//       .toFixed(2);
//   };

//   // Update total cost and budget percentage
//   useEffect(() => {
//     if (selectedWorkDesc?.value) {
//       const totalCost = calculateOverallCost();
//       setMaterialTotalCost(Number(totalCost) || 0);
//       // Use projectionBudgetValue for percentage calculation instead of existingBudget
//       if (projectionBudgetValue) {
//         const bv = parseFloat(projectionBudgetValue) || 0;
//         const percentage = bv > 0 ? (totalCost / bv) * 100 : 0;
//         setMaterialBudgetPercentage(percentage);
//       } else {
//         setMaterialBudgetPercentage(0);
//       }
//       if (onTotalCostChange) {
//         onTotalCostChange(totalCost);
//       }
//       if (onMaterialsChange) {
//         const materials = materialAssignments[selectedWorkDesc.value] || [];
//         onMaterialsChange(materials);
//       }
//     }
//   }, [materialAssignments, selectedWorkDesc, projectionBudgetValue, onTotalCostChange, onMaterialsChange]);

//   const handleMaterialChange = (desc_id, matIndex, e) => {
//     const { name, value } = e.target;
//     setMaterialAssignments((prev) => ({
//       ...prev,
//       [desc_id]: (prev[desc_id] || []).map((mat, i) =>
//         i === matIndex ? { ...mat, [name]: value } : mat
//       ),
//     }));
//     setError(null);
//   };

//   const handleItemSelect = (desc_id, matIndex, selectedOption) => {
//     const value = selectedOption && selectedOption.value !== "N/A" ? selectedOption.value : "";
//     setMaterialAssignments((prev) => ({
//       ...prev,
//       [desc_id]: (prev[desc_id] || []).map((mat, i) =>
//         i === matIndex ? { ...mat, item_id: value } : mat
//       ),
//     }));
//     if (!value) {
//       setError(`Please select a valid material for Row ${matIndex + 1}.`);
//     } else {
//       setError(null);
//     }
//   };

//   const handleAddMaterial = (desc_id) => {
//     setMaterialAssignments((prev) => ({
//       ...prev,
//       [desc_id]: [
//         ...(prev[desc_id] || []),
//         {
//           item_id: "",
//           uom_id: "",
//           quantity: "",
//           comp_ratio_a: "",
//           comp_ratio_b: "",
//           comp_ratio_c: "",
//           rate: "",
//         },
//       ],
//     }));
//     setError(null);
//   };

//   const handleRemoveMaterial = (desc_id, matIndex) => {
//     setMaterialAssignments((prev) => {
//       const materials = prev[desc_id] || [];
//       if (materials.length <= 1) {
//         setError(`At least one material assignment is required.`);
//         return prev;
//       }
//       return {
//         ...prev,
//         [desc_id]: materials.filter((_, i) => i !== matIndex),
//       };
//     });
//   };

//   const calculateCompQuantities = (mat) => {
//     const quantity = parseFloat(mat.quantity) || 0;
//     const comp_a = parseInt(mat.comp_ratio_a) || 0;
//     const comp_b = parseInt(mat.comp_ratio_b) || 0;
//     const comp_c = parseInt(mat.comp_ratio_c) || 0;
//     const total_parts = comp_a + comp_b + comp_c;
//     if (total_parts === 0) {
//       return { comp_a_qty: 0, comp_b_qty: 0, comp_c_qty: 0 };
//     }
//     return {
//       comp_a_qty: ((comp_a / total_parts) * quantity).toFixed(2),
//       comp_b_qty: ((comp_b / total_parts) * quantity).toFixed(2),
//       comp_c_qty: ((comp_c / total_parts) * quantity).toFixed(2),
//     };
//   };

//   const handleAddNewMaterial = async (inputValue, desc_id, matIndex) => {
//     if (!inputValue.trim()) {
//       setError("Material name is required.");
//       return;
//     }

//     try {
//       setAddingMaterial(true);
//       const response = await axios.post(`${API_BASE_URL}/material/add-material`, {
//         item_name: inputValue.trim(),
//       });

//       if (response.data?.status === "success" && response.data?.data?.item_id) {
//         await fetchMaterials();
//         const newItemId = response.data.data.item_id;
//         setMaterialAssignments((prev) => ({
//           ...prev,
//           [desc_id]: (prev[desc_id] || []).map((mat, i) =>
//             i === matIndex ? { ...mat, item_id: newItemId } : mat
//           ),
//         }));

//         Swal.fire({
//           position: "top-end",
//           icon: "success",
//           title: "Material Added!",
//           text: "New material has been added and selected.",
//           timer: 1500,
//           showConfirmButton: false,
//           toast: true,
//           background: "#ecfdf5",
//           iconColor: "#10b981",
//         });
//       } else {
//         setError(response.data?.message || "Failed to add material.");
//       }
//     } catch (error) {
//       console.error("Error adding material:", error);
//       setError(error.response?.data?.message || "Failed to add material.");
//     } finally {
//       setAddingMaterial(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();


//     try {
//       setLoading((prev) => ({ ...prev, submitting: true }));
//       setError(null);

//       // Decode and validate created_by from URL
//       let created_by;
//       try {
//         created_by = atob(encodedUserId);
//         if (!/^\d+$/.test(created_by) || created_by.length > 30) {
//           throw new Error("Invalid User ID format or length exceeds 30 characters");
//         }
//       } catch {
//         throw new Error("Invalid User ID in URL");
//       }

//       if (!selectedCompany?.value) {
//         setError("Please select a company.");
//         return;
//       }
//       if (!selectedProject?.value) {
//         setError("Please select a project.");
//         return;
//       }
//       if (!selectedSite?.value) {
//         setError("Please select a site.");
//         return;
//       }
//       if (!selectedWorkDesc?.value) {
//         setError("Please select a work description.");
//         return;
//       }

//       const validationErrors = [];
//       const materialCounts = {};
//       const materials = materialAssignments[selectedWorkDesc.value] || [];

//       // Count occurrences of each item_id
//       materials.forEach((row) => {
//         if (row.item_id && row.item_id !== "N/A" && row.item_id.trim() !== "") {
//           materialCounts[row.item_id] = (materialCounts[row.item_id] || 0) + 1;
//         }
//       });

//       // Validate for three or more identical materials
//       Object.entries(materialCounts).forEach(([item_id, count]) => {
//         if (count >= 3) {
//           const materialName = materials.find((mat) => mat.item_id === item_id)?.item_id || item_id;
//           validationErrors.push(
//             `Material ${materialName} is assigned ${count} times. A maximum of two assignments per material is allowed.`
//           );
//         }
//       });

//       // Validate other fields
//       materials.forEach((row, index) => {
//         if (!row.item_id || row.item_id === "N/A" || row.item_id.trim() === "") {
//           validationErrors.push(`Row ${index + 1}: Material is required and must be a valid material ID`);
//         }
//         if (!row.uom_id) {
//           validationErrors.push(`Row ${index + 1}: Unit of Measure is required`);
//         }
//         if (!row.quantity) {
//           validationErrors.push(`Row ${index + 1}: Overall Quantity is required`);
//         } else if (isNaN(row.quantity) || parseInt(row.quantity) <= 0) {
//           validationErrors.push(`Row ${index + 1}: Overall Quantity must be a positive integer`);
//         }
//         if (!row.rate) {
//           validationErrors.push(`Row ${index + 1}: Rate is required`);
//         } else if (isNaN(row.rate) || parseFloat(row.rate) < 0) {
//           validationErrors.push(`Row ${index + 1}: Rate must be a non-negative number`);
//         }
//         if (row.comp_ratio_a && (isNaN(row.comp_ratio_a) || parseInt(row.comp_ratio_a) < 0)) {
//           validationErrors.push(`Row ${index + 1}: Component Ratio A must be a non-negative integer`);
//         }
//         if (row.comp_ratio_b && (isNaN(row.comp_ratio_b) || parseInt(row.comp_ratio_b) < 0)) {
//           validationErrors.push(`Row ${index + 1}: Component Ratio B must be a non-negative integer`);
//         }
//         if (row.comp_ratio_c && (isNaN(row.comp_ratio_c) || parseInt(row.comp_ratio_c) < 0)) {
//           validationErrors.push(`Row ${index + 1}: Component Ratio C must be a non-negative integer`);
//         }
//       });

//       if (validationErrors.length > 0) {
//         setError(validationErrors.join("<br />"));
//         return;
//       }

//       const payload = materials.map((row) => ({
//         pd_id: selectedProject.value,
//         site_id: selectedSite.value,
//         item_id: row.item_id,
//         uom_id: parseInt(row.uom_id),
//         quantity: parseInt(row.quantity),
//         desc_id: String(selectedWorkDesc.value),
//         comp_ratio_a: row.comp_ratio_a ? parseInt(row.comp_ratio_a) : null,
//         comp_ratio_b: row.comp_ratio_b ? parseInt(row.comp_ratio_b) : null,
//         comp_ratio_c: row.comp_ratio_c ? parseInt(row.comp_ratio_c) : null,
//         rate: parseFloat(row.rate),
//         materialTotalCost: materialTotalCost.toFixed(2),
//         materialBudgetPercentage: materialBudgetPercentage.toFixed(2),
//         overhead_type: "materials",
//         created_by: created_by,
//       }));

//       if (payload.length === 0) {
//         setError("Please add at least one material assignment.");
//         return;
//       }

//       await axios.post(`${API_BASE_URL}/material/assign-material`, payload);

//       Swal.fire({
//         position: "top-end",
//         icon: "success",
//         title: "Materials Assigned Successfully!",
//         showConfirmButton: false,
//         timer: 2000,
//         toast: true,
//         background: "#ecfdf5",
//         iconColor: "#10b981",
//       });

//       setMaterialAssignments({
//         [selectedWorkDesc.value]: [
//           {
//             item_id: "",
//             uom_id: "",
//             quantity: "",
//             comp_ratio_a: "",
//             comp_ratio_b: "",
//             comp_ratio_c: "",
//             rate: "",
//           },
//         ],
//       });
//       await fetchAssignedMaterials(selectedSite.value, selectedWorkDesc.value);
//     } catch (error) {
//       console.error("Error submitting material assignments:", error);
//       const errorMessage = error.response?.data?.message || "Failed to assign materials. Please check the data and try again.";
//       const detailedErrors = error.response?.data?.errors ? error.response.data.errors.join("<br />") : errorMessage;
//       await Swal.fire({
//         icon: "error",
//         title: "Assignment Failed",
//         html: detailedErrors,
//         confirmButtonText: "OK",
//         confirmButtonColor: "#d33",
//         background: "#fef2f2",
//         iconColor: "#dc2626",
//       });
//       setError(detailedErrors);
//     } finally {
//       setLoading((prev) => ({ ...prev, submitting: false }));
//     }
//   };

//   const isFormEnabled = selectedCompany && selectedProject && selectedSite && selectedWorkDesc;

//   const materialOptions = Array.isArray(materials)
//     ? materials.map((material) => ({
//         value: material.item_id,
//         label: material.item_name,
//       }))
//     : [];

//   const uomOptions = Array.isArray(uoms)
//     ? uoms.map((uom) => ({
//         value: uom.uom_id,
//         label: uom.uom_name,
//       }))
//     : [];

//   const CustomCreateLabel = ({ inputValue }) => (
//     <div className="flex items-center justify-between px-2 py-1">
//       <span>Add "{inputValue}"</span>
//       <button
//         type="button"
//         className="ml-2 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
//         onClick={() => handleAddNewMaterial(inputValue, currentDescId, currentMatIndex)}
//         disabled={addingMaterial}
//       >
//         {addingMaterial ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
//       </button>
//     </div>
//   );

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {(loading.materials || loading.uoms || loading.assignedMaterials) ? (
//           <div className="flex justify-center items-center py-16">
//             <div className="flex flex-col items-center space-y-3">
//               <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
//               <p className="text-gray-600">Loading resources...</p>
//             </div>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="">
//             <div className="mb-6">
//               {error && (
//                 <div
//                   className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm"
//                   dangerouslySetInnerHTML={{ __html: error }}
//                 />
//               )}
//             </div>

//             {selectedWorkDesc && (
//               <div className="space-y-6">
//                 {existingAssignments.length > 0 && (
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800 mb-2">Previously Assigned Materials</h3>
//                     <div className="overflow-x-auto">
//                       <table className="min-w-full bg-white border border-gray-200 rounded-md">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Material</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">UOM</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Rate (₹)</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Cost (₹)</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio A (Qty)</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio B (Qty)</th>
//                             <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio C (Qty)</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {existingAssignments.map((mat, index) => {
//                             const { comp_a_qty, comp_b_qty, comp_c_qty } = calculateCompQuantities(mat);
//                             const totalCost = calculateTotalCost(mat);
//                             const materialName = materials.find((m) => m.item_id === mat.item_id)?.item_name || mat.item_id;
//                             const uomName = uoms.find((u) => u.uom_id === mat.uom_id)?.uom_name || "N/A";
//                             return (
//                               <tr key={index} className="border-t border-gray-200">
//                                 <td className="px-4 py-2 text-sm text-gray-600">{materialName}</td>
//                                 <td className="px-4 py-2 text-sm text-gray-600">{uomName}</td>
//                                 <td className="px-4 py-2 text-sm text-gray-600">{mat.quantity}</td>
//                                 <td className="px-4 py-2 text-sm text-gray-600">{mat.rate}</td>
//                                 <td className="px-4 py-2 text-sm text-gray-600">{totalCost}</td>
//                                 <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_a || 0} ({comp_a_qty})</td>
//                                 <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_b || 0} ({comp_b_qty})</td>
//                                 <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_c || 0} ({comp_c_qty})</td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800 mb-2">New Material Assignments</h3>
//                   {(materialAssignments[selectedWorkDesc.value] || []).map((mat, matIndex) => {
//                     const { comp_a_qty, comp_b_qty, comp_c_qty } = calculateCompQuantities(mat);
//                     const totalCost = calculateTotalCost(mat);
//                     return (
//                       <div key={matIndex} className="border-b pb-4 last:border-b-0">
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Material #{matIndex + 1}
//                             </label>
//                             <CreatableSelect
//                               options={materialOptions}
//                               value={materialOptions.find((opt) => opt.value === mat.item_id) || null}
//                               onChange={(opt) => {
//                                 setCurrentDescId(selectedWorkDesc.value);
//                                 setCurrentMatIndex(matIndex);
//                                 handleItemSelect(selectedWorkDesc.value, matIndex, opt);
//                               }}
//                               formatCreateLabel={(inputValue) => (
//                                 <CustomCreateLabel inputValue={inputValue} />
//                               )}
//                               isSearchable
//                               isClearable
//                               isDisabled={!isFormEnabled || addingMaterial}
//                               className="text-sm"
//                               classNamePrefix="select"
//                               placeholder="Select or type material..."
//                             />
//                             <div className="mt-2 space-y-2">
//                               <div className="flex items-center gap-2">
//                                 <label className="text-sm text-gray-600 w-28">Comp Ratio A:</label>
//                                 <input
//                                   type="number"
//                                   name="comp_ratio_a"
//                                   value={mat.comp_ratio_a}
//                                   onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
//                                   className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
//                                   disabled={!isFormEnabled}
//                                   min="0"
//                                 />
//                                 <span className="text-sm text-gray-600">Qty: {comp_a_qty}</span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <label className="text-sm text-gray-600 w-28">Comp Ratio B:</label>
//                                 <input
//                                   type="number"
//                                   name="comp_ratio_b"
//                                   value={mat.comp_ratio_b}
//                                   onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
//                                   className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
//                                   disabled={!isFormEnabled}
//                                   min="0"
//                                 />
//                                 <span className="text-sm text-gray-600">Qty: {comp_b_qty}</span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <label className="text-sm text-gray-600 w-28">Comp Ratio C:</label>
//                                 <input
//                                   type="number"
//                                   name="comp_ratio_c"
//                                   value={mat.comp_ratio_c}
//                                   onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
//                                   className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
//                                   disabled={!isFormEnabled}
//                                   min="0"
//                                 />
//                                 <span className="text-sm text-gray-600">Qty: {comp_c_qty}</span>
//                               </div>
//                             </div>
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Unit of Measure
//                             </label>
//                             <Select
//                               options={uomOptions}
//                               value={uomOptions.find((opt) => opt.value === mat.uom_id) || null}
//                               onChange={(opt) =>
//                                 handleMaterialChange(selectedWorkDesc.value, matIndex, {
//                                   target: { name: "uom_id", value: opt ? opt.value : "" },
//                                 })
//                               }
//                               isSearchable
//                               isClearable
//                               isDisabled={!isFormEnabled}
//                               className="text-sm"
//                               classNamePrefix="select"
//                               placeholder="Select UOM..."
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Overall Quantity
//                             </label>
//                             <input
//                               type="number"
//                               name="quantity"
//                               value={mat.quantity}
//                               onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
//                               required
//                               disabled={!isFormEnabled}
//                               min="1"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Rate per Quantity
//                             </label>
//                             <input
//                               type="number"
//                               name="rate"
//                               value={mat.rate}
//                               onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
//                               required
//                               disabled={!isFormEnabled}
//                               min="0"
//                               step="0.01"
//                             />
//                             <div className="mt-2 text-sm text-gray-600">
//                               Overall Cost: ₹{calculateTotalCost(mat)}
//                             </div>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => handleRemoveMaterial(selectedWorkDesc.value, matIndex)}
//                           disabled={(materialAssignments[selectedWorkDesc.value] || []).length <= 1 || !isFormEnabled}
//                           className={`mt-2 p-1.5 rounded-md ${
//                             (materialAssignments[selectedWorkDesc.value] || []).length <= 1 || !isFormEnabled
//                               ? "text-gray-400 cursor-not-allowed"
//                               : "text-red-600 hover:bg-red-50"
//                           }`}
//                           title={
//                             (materialAssignments[selectedWorkDesc.value] || []).length <= 1
//                               ? "At least one material is required"
//                               : "Remove this entry"
//                           }
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     );
//                   })}
//                   <div className="mt-4">
//                     <div className="text-sm text-gray-600 mb-2">
//                       Total Material Cost: ₹{calculateOverallCost()}
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => handleAddMaterial(selectedWorkDesc.value)}
//                       className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
//                       disabled={!isFormEnabled}
//                     >
//                       <PlusCircle className="h-4 w-4 mr-2" />
//                       Add Material
//                     </button>
//                   </div>
//                   {/* Total Material Cost and Budget Percentage Section */}
//                   <div className="mt-4 p-4 bg-gray-50 rounded-lg">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="font-medium">Total Material Cost:</span>
//                       <span className="text-lg font-semibold">Rs. {materialTotalCost.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="font-medium">Budget Percentage:</span>
//                       <span className="text-lg font-semibold">{materialBudgetPercentage.toFixed(2)}%</span>
//                     </div>
//                   </div>
//                   {/* Save Material Overhead Button */}
//                   <div className="flex justify-end mt-4">
//                     <button
//                       type="submit"
//                       disabled={loading.submitting || !isFormEnabled}
//                       className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
//                     >
//                       {loading.submitting ? (
//                         <>
//                           <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                           Processing...
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle className="h-4 w-4 mr-2" />
//                           Save Material Overhead
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </form>
//         )}
//       </div>

//       <style jsx>{`
//         .select__control {
//           border-color: #d1d5db;
//           min-height: 38px;
//         }
//         .select__control--is-focused {
//           border-color: #3b82f6;
//           box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
//         }
//         .select__menu {
//           z-index: 10;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MaterialPlanning;


















import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { PlusCircle, Trash2, Loader2, CheckCircle, Edit2 } from "lucide-react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useParams } from "react-router-dom";

const MaterialPlanning = ({
  selectedCompany,
  selectedProject,
  selectedSite,
  selectedWorkDesc,
  existingBudget,
  projectionBudgetValue,
  projectionId,
  isSubmitted,
  onTotalCostChange,
  onMaterialsChange,
}) => {
  const { encodedUserId } = useParams(); 
  const [materials, setMaterials] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [materialAssignments, setMaterialAssignments] = useState({});
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [loading, setLoading] = useState({
    materials: false,
    uoms: false,
    assignedMaterials: false,
    submitting: false,
  });
  const [error, setError] = useState(null);
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [currentDescId, setCurrentDescId] = useState(null);
  const [currentMatIndex, setCurrentMatIndex] = useState(null);
  const [materialTotalCost, setMaterialTotalCost] = useState(0);
  const [materialBudgetPercentage, setMaterialBudgetPercentage] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Fetch materials
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, materials: true }));
      const response = await axios.get(`${API_BASE_URL}/material/materials`);
      setMaterials(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      setError("Failed to load materials. Please try again.");
      setMaterials([]);
    } finally {
      setLoading((prev) => ({ ...prev, materials: false }));
    }
  }, []);

  // Fetch UOMs
  const fetchUoms = useCallback(async () => {
    try {
      setLoading((prev) => ({ ...prev, uoms: true }));
      const response = await axios.get(`${API_BASE_URL}/material/uom`);
      setUoms(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching UOMs:", error);
      setError("Failed to load UOMs. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, uoms: false }));
    }
  }, []);

  // Fetch assigned materials with projection_id
  const fetchAssignedMaterials = useCallback(async (site_id, desc_id, proj_id) => {
    if (!site_id || !desc_id || !proj_id) return;
    
    try {
      setLoading((prev) => ({ ...prev, assignedMaterials: true }));
      const response = await axios.get(
        `${API_BASE_URL}/material/assigned-materials?site_id=${site_id}&desc_id=${desc_id}&projection_id=${proj_id}`
      );
      const assignedMaterials = Array.isArray(response.data?.data) ? response.data.data : [];
      setExistingAssignments(assignedMaterials);
      
      // Initialize form with empty row only if no existing assignments
      if (assignedMaterials.length === 0) {
        setMaterialAssignments({
          [desc_id]: [
            {
              item_id: "",
              uom_id: "",
              quantity: "",
              comp_ratio_a: "",
              comp_ratio_b: "",
              comp_ratio_c: "",
              rate: "",
              projection_id: proj_id,
            },
          ],
        });
      } else {
        setMaterialAssignments({ [desc_id]: [] });
      }
    } catch (error) {
      console.error("Error fetching assigned materials:", error);
      setError("Failed to load assigned materials. Please try again.");
      setExistingAssignments([]);
      setMaterialAssignments({
        [desc_id]: [
          {
            item_id: "",
            uom_id: "",
            quantity: "",
            comp_ratio_a: "",
            comp_ratio_b: "",
            comp_ratio_c: "",
            rate: "",
            projection_id: proj_id,
          },
        ],
      });
    } finally {
      setLoading((prev) => ({ ...prev, assignedMaterials: false }));
    }
  }, [projectionId]); // Add projectionId to deps if it changes

  useEffect(() => {
    fetchMaterials();
    fetchUoms();
  }, [fetchMaterials, fetchUoms]);

  useEffect(() => {
    if (selectedSite?.value && selectedWorkDesc?.value && projectionId) {
      fetchAssignedMaterials(selectedSite.value, selectedWorkDesc.value, projectionId);
    }
  }, [selectedSite?.value, selectedWorkDesc?.value, projectionId, fetchAssignedMaterials]);

  // Calculate total cost for a single material
  const calculateTotalCost = useCallback((mat) => {
    const quantity = parseFloat(mat.quantity) || 0;
    const rate = parseFloat(mat.rate) || 0;
    return (quantity * rate).toFixed(2);
  }, []);

  // Memoized materials for current description
  const materialsForCurrentDesc = useMemo(() => {
    return materialAssignments[selectedWorkDesc?.value] || [];
  }, [materialAssignments, selectedWorkDesc?.value]);

  // Memoized overall materials (existing + form)
  const overallMaterials = useMemo(() => {
    return [...existingAssignments, ...materialsForCurrentDesc];
  }, [existingAssignments, materialsForCurrentDesc]);

  // Memoized overall cost
  const overallCost = useMemo(() => {
    return overallMaterials.reduce((total, mat) => {
      const cost = parseFloat(calculateTotalCost(mat)) || 0;
      return total + cost;
    }, 0).toFixed(2);
  }, [overallMaterials, calculateTotalCost]);

  // Memoized percentage
  const overallPercentage = useMemo(() => {
    if (!projectionBudgetValue) return 0;
    const bv = parseFloat(projectionBudgetValue) || 0;
    return bv > 0 ? (parseFloat(overallCost) / bv) * 100 : 0;
  }, [overallCost, projectionBudgetValue]);

  // Update local states without causing re-renders
  useEffect(() => {
    setMaterialTotalCost(parseFloat(overallCost) || 0);
    setMaterialBudgetPercentage(overallPercentage);
  }, [overallCost, overallPercentage]);

  // Call onTotalCostChange when overallCost changes
  useEffect(() => {
    if (onTotalCostChange) {
      onTotalCostChange(overallCost);
    }
  }, [overallCost, onTotalCostChange]);

  // Call onMaterialsChange when overallMaterials changes
  useEffect(() => {
    if (onMaterialsChange) {
      onMaterialsChange(overallMaterials);
    }
  }, [overallMaterials, onMaterialsChange]);

  const handleMaterialChange = useCallback((desc_id, matIndex, e) => {
    const { name, value } = e.target;
    setMaterialAssignments((prev) => ({
      ...prev,
      [desc_id]: (prev[desc_id] || []).map((mat, i) =>
        i === matIndex ? { ...mat, [name]: value } : mat
      ),
    }));
    setError(null);
  }, []);

  const handleItemSelect = useCallback((desc_id, matIndex, selectedOption) => {
    const value = selectedOption && selectedOption.value !== "N/A" ? selectedOption.value : "";
    setMaterialAssignments((prev) => ({
      ...prev,
      [desc_id]: (prev[desc_id] || []).map((mat, i) =>
        i === matIndex ? { ...mat, item_id: value } : mat
      ),
    }));
    if (!value) {
      setError(`Please select a valid material for Row ${matIndex + 1}.`);
    } else {
      setError(null);
    }
  }, []);

  const handleAddMaterial = useCallback((desc_id) => {
    setMaterialAssignments((prev) => ({
      ...prev,
      [desc_id]: [
        ...(prev[desc_id] || []),
        {
          item_id: "",
          uom_id: "",
          quantity: "",
          comp_ratio_a: "",
          comp_ratio_b: "",
          comp_ratio_c: "",
          rate: "",
          projection_id: projectionId,
        },
      ],
    }));
    setError(null);
  }, [projectionId]);

  const handleRemoveMaterial = useCallback((desc_id, matIndex) => {
    setMaterialAssignments((prev) => {
      const materials = prev[desc_id] || [];
      if (materials.length <= 1) {
        setError(`At least one material assignment is required.`);
        return prev;
      }
      return {
        ...prev,
        [desc_id]: materials.filter((_, i) => i !== matIndex),
      };
    });
  }, []);

  const calculateCompQuantities = useCallback((mat) => {
    const quantity = parseFloat(mat.quantity) || 0;
    const comp_a = parseInt(mat.comp_ratio_a) || 0;
    const comp_b = parseInt(mat.comp_ratio_b) || 0;
    const comp_c = parseInt(mat.comp_ratio_c) || 0;
    const total_parts = comp_a + comp_b + comp_c;
    if (total_parts === 0) {
      return { comp_a_qty: 0, comp_b_qty: 0, comp_c_qty: 0 };
    }
    return {
      comp_a_qty: ((comp_a / total_parts) * quantity).toFixed(2),
      comp_b_qty: ((comp_b / total_parts) * quantity).toFixed(2),
      comp_c_qty: ((comp_c / total_parts) * quantity).toFixed(2),
    };
  }, []);

  const handleAddNewMaterial = useCallback(async (inputValue, desc_id, matIndex) => {
    if (!inputValue.trim()) {
      setError("Material name is required.");
      return;
    }

    try {
      setAddingMaterial(true);
      const response = await axios.post(`${API_BASE_URL}/material/add-material`, {
        item_name: inputValue.trim(),
      });

      if (response.data?.status === "success" && response.data?.data?.item_id) {
        await fetchMaterials();
        const newItemId = response.data.data.item_id;
        setMaterialAssignments((prev) => ({
          ...prev,
          [desc_id]: (prev[desc_id] || []).map((mat, i) =>
            i === matIndex ? { ...mat, item_id: newItemId } : mat
          ),
        }));

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Material Added!",
          text: "New material has been added and selected.",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          background: "#ecfdf5",
          iconColor: "#10b981",
        });
      } else {
        setError(response.data?.message || "Failed to add material.");
      }
    } catch (error) {
      console.error("Error adding material:", error);
      setError(error.response?.data?.message || "Failed to add material.");
    } finally {
      setAddingMaterial(false);
    }
  }, [fetchMaterials]);

  // Updated handleEditAssignment - Relaxed validation to allow opening modal even if ID missing
  const handleEditAssignment = useCallback(async (assignment) => {
    if (isSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Edit",
        text: "Editing disabled after submission.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (!assignment) {
      console.error("Invalid assignment object");
      setError("Invalid assignment data for editing.");
      Swal.fire({
        icon: "error",
        title: "Invalid Assignment",
        text: "Cannot edit invalid assignment data. Please refresh and try again.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    console.log("Editing assignment:", assignment);
    
    // Use id or assignment_id, fallback to null if missing
    const assignmentId = assignment.id || assignment.assignment_id;
    if (!assignmentId) {
      console.warn("No ID found for assignment, proceeding with warning. Update may fail.");
    }

    // Use the passed assignment directly - it already includes item_name, uom_name from backend join
    setEditingAssignment({ 
      ...assignment, 
      id: assignmentId,  // Set id for internal use, may be null
      projection_id: projectionId 
    });

    setShowEditModal(true);
    
    Swal.fire({
      icon: "info",
      title: "Edit Mode",
      text: "Edit the material details in the modal and click Save.",
      timer: 1500,
      showConfirmButton: false,
    });
  }, [isSubmitted, projectionId]);

  const handleSaveEdit = async () => {
    if (!editingAssignment) {
      console.error("Missing editingAssignment");
      setError("Assignment data is missing. Cannot update.");
      return;
    }

    if (!editingAssignment.id) {
      console.error("Missing assignment ID in editingAssignment:", editingAssignment);
      setError("Assignment ID is missing. Please refresh the page and try again.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, submitting: true }));
      setError(null);

      // Validation (same as before)
      const validationErrors = [];
      if (!editingAssignment.item_id || editingAssignment.item_id === "N/A" || editingAssignment.item_id.trim() === "") {
        validationErrors.push("Material required");
      }
      if (!editingAssignment.uom_id) {
        validationErrors.push("UOM required");
      }
      if (!editingAssignment.quantity || isNaN(editingAssignment.quantity) || parseInt(editingAssignment.quantity) <= 0) {
        validationErrors.push("Positive integer quantity required");
      }
      if (!editingAssignment.rate || isNaN(editingAssignment.rate) || parseFloat(editingAssignment.rate) < 0) {
        validationErrors.push("Non-negative rate required");
      }
      if (editingAssignment.comp_ratio_a && (isNaN(editingAssignment.comp_ratio_a) || parseInt(editingAssignment.comp_ratio_a) < 0)) {
        validationErrors.push("Non-negative comp_ratio_a");
      }
      if (editingAssignment.comp_ratio_b && (isNaN(editingAssignment.comp_ratio_b) || parseInt(editingAssignment.comp_ratio_b) < 0)) {
        validationErrors.push("Non-negative comp_ratio_b");
      }
      if (editingAssignment.comp_ratio_c && (isNaN(editingAssignment.comp_ratio_c) || parseInt(editingAssignment.comp_ratio_c) < 0)) {
        validationErrors.push("Non-negative comp_ratio_c");
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join("<br />"));
        return;
      }

      const payload = {
        assignment_id: editingAssignment.id,  // Uses the set id (from id or assignment_id)
        item_id: editingAssignment.item_id,
        uom_id: parseInt(editingAssignment.uom_id),
        quantity: parseInt(editingAssignment.quantity),
        comp_ratio_a: editingAssignment.comp_ratio_a ? parseInt(editingAssignment.comp_ratio_a) : null,
        comp_ratio_b: editingAssignment.comp_ratio_b ? parseInt(editingAssignment.comp_ratio_b) : null,
        comp_ratio_c: editingAssignment.comp_ratio_c ? parseInt(editingAssignment.comp_ratio_c) : null,
        rate: parseFloat(editingAssignment.rate),
        projection_id: projectionId,
        pd_id: editingAssignment.pd_id,
        site_id: editingAssignment.site_id,
        desc_id: editingAssignment.desc_id,
        created_by: atob(encodedUserId),
      };

      console.log("Updating assignment with ID:", editingAssignment.id);
      console.log("Payload:", payload);

      await axios.put(`${API_BASE_URL}/material/assigned-materials`, payload);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Updated!",
        text: "Material assignment updated successfully!",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      setShowEditModal(false);
      setEditingAssignment(null);
      
      await fetchAssignedMaterials(selectedSite.value, selectedWorkDesc.value, projectionId);
      
    } catch (error) {
      console.error("Error updating assignment:", error);
      const errorMessage = error.response?.data?.message || "Failed to update assignment.";
      const detailedErrors = error.response?.data?.errors ? error.response.data.errors.join("<br />") : errorMessage;
      setError(detailedErrors);
      
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        html: detailedErrors,
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
        background: "#fef2f2",
        iconColor: "#dc2626",
      });
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Updated handleDeleteAssignment - Use id or assignment_id
  const handleDeleteAssignment = async (assignmentId) => {
    if (isSubmitted) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Delete",
        text: "Deletion disabled after submission.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    console.log("Deleting assignment ID:", assignmentId);

    // Check if assignmentId is valid
    if (!assignmentId || assignmentId === 'undefined' || isNaN(assignmentId)) {
      console.error("Invalid assignment ID:", assignmentId);
      Swal.fire({
        icon: "error",
        title: "Invalid Assignment",
        text: "Cannot delete assignment with invalid ID.",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the material assignment permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        console.log("Sending DELETE request for assignment ID:", assignmentId);
        
        // DELETE with body { assignment_id: id }
        await axios.delete(`${API_BASE_URL}/material/assigned-materials`, { 
          data: { assignment_id: assignmentId } 
        });
        
        // Refresh the assignments list
        await fetchAssignedMaterials(selectedSite.value, selectedWorkDesc.value, projectionId);
        
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Material assignment has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting assignment:", error);
        const errorMessage = error.response?.data?.message || "Failed to delete assignment.";
        
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: errorMessage,
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleSaveMaterialAllocation = async () => {
    if (!selectedSite?.value || !selectedWorkDesc?.value || !projectionId) {
      console.warn("Cannot save allocation: missing required fields.");
      return;
    }
    try {
      const payload = {
        site_id: selectedSite?.value,
        desc_id: selectedWorkDesc?.value,
        total_cost: parseFloat(overallCost) || 0,
        materialBudgetPercentage: overallPercentage,
        projection_id: projectionId,
      };
      await axios.post(`${API_BASE_URL}/projection/save-material-allocation`, payload);
      
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Material Allocation Saved!",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
      });
    } catch (error) {
      console.error("Error saving allocation:", error);
      if (error.response?.status !== 404) {
        setError("Failed to save allocation.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading((prev) => ({ ...prev, submitting: true }));
      setError(null);

      let created_by;
      try {
        created_by = atob(encodedUserId);
        if (!/^\d+$/.test(created_by) || created_by.length > 30) {
          throw new Error("Invalid User ID format or length exceeds 30 characters");
        }
      } catch {
        throw new Error("Invalid User ID in URL");
      }

      if (!selectedCompany?.value || !selectedProject?.value || !selectedSite?.value || !selectedWorkDesc?.value || !projectionId) {
        setError("Please select all fields and ensure projection is set.");
        return;
      }

      const validationErrors = [];
      const materialCounts = {};
      const materials = materialAssignments[selectedWorkDesc.value] || [];

      materials.forEach((row) => {
        if (row.item_id && row.item_id !== "N/A" && row.item_id.trim() !== "") {
          materialCounts[row.item_id] = (materialCounts[row.item_id] || 0) + 1;
        }
      });

      Object.entries(materialCounts).forEach(([item_id, count]) => {
        if (count >= 3) {
          validationErrors.push(`Material ${item_id} is assigned ${count} times. Maximum of two allowed.`);
        }
      });

      materials.forEach((row, index) => {
        if (!row.item_id || row.item_id === "N/A" || row.item_id.trim() === "") {
          validationErrors.push(`Row ${index + 1}: Material required`);
        }
        if (!row.uom_id) {
          validationErrors.push(`Row ${index + 1}: UOM required`);
        }
        if (!row.quantity || isNaN(row.quantity) || parseInt(row.quantity) <= 0) {
          validationErrors.push(`Row ${index + 1}: Positive integer quantity required`);
        }
        if (!row.rate || isNaN(row.rate) || parseFloat(row.rate) < 0) {
          validationErrors.push(`Row ${index + 1}: Non-negative rate required`);
        }
        if (row.comp_ratio_a && (isNaN(row.comp_ratio_a) || parseInt(row.comp_ratio_a) < 0)) {
          validationErrors.push(`Row ${index + 1}: Non-negative comp_ratio_a`);
        }
        if (row.comp_ratio_b && (isNaN(row.comp_ratio_b) || parseInt(row.comp_ratio_b) < 0)) {
          validationErrors.push(`Row ${index + 1}: Non-negative comp_ratio_b`);
        }
        if (row.comp_ratio_c && (isNaN(row.comp_ratio_c) || parseInt(row.comp_ratio_c) < 0)) {
          validationErrors.push(`Row ${index + 1}: Non-negative comp_ratio_c`);
        }
      });

      if (validationErrors.length > 0) {
        setError(validationErrors.join("<br />"));
        return;
      }

      // Prepare payload
      const payload = materials.map((row) => ({
        pd_id: selectedProject.value,
        site_id: selectedSite.value,
        item_id: row.item_id,
        uom_id: parseInt(row.uom_id),
        quantity: parseInt(row.quantity),
        desc_id: String(selectedWorkDesc.value),
        comp_ratio_a: row.comp_ratio_a ? parseInt(row.comp_ratio_a) : null,
        comp_ratio_b: row.comp_ratio_b ? parseInt(row.comp_ratio_b) : null,
        comp_ratio_c: row.comp_ratio_c ? parseInt(row.comp_ratio_c) : null,
        rate: parseFloat(row.rate),
        materialTotalCost: overallCost,
        materialBudgetPercentage: overallPercentage.toFixed(2),
        overhead_type: "materials",
        created_by: created_by,
        projection_id: projectionId,
      }));

      if (payload.length === 0) {
        setError("Add at least one material.");
        return;
      }

      await axios.post(`${API_BASE_URL}/material/assign-material`, payload);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Assigned!",
        text: "Materials assigned successfully!",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      setMaterialAssignments({
        [selectedWorkDesc.value]: [
          {
            item_id: "",
            uom_id: "",
            quantity: "",
            comp_ratio_a: "",
            comp_ratio_b: "",
            comp_ratio_c: "",
            rate: "",
            projection_id: projectionId,
          },
        ],
      });
      await fetchAssignedMaterials(selectedSite.value, selectedWorkDesc.value, projectionId);
      
    } catch (error) {
      console.error("Error submitting material assignments:", error);
      const errorMessage = error.response?.data?.message || "Failed to assign materials.";
      const detailedErrors = error.response?.data?.errors ? error.response.data.errors.join("<br />") : errorMessage;
      
      await Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        html: detailedErrors,
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
        background: "#fef2f2",
        iconColor: "#dc2626",
      });
      setError(detailedErrors);
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const isFormEnabled = selectedCompany && selectedProject && selectedSite && selectedWorkDesc && projectionId && !isSubmitted;

  const materialOptions = Array.isArray(materials)
    ? materials.map((material) => ({
        value: material.item_id,
        label: material.item_name,
      }))
    : [];

  const uomOptions = Array.isArray(uoms)
    ? uoms.map((uom) => ({
        value: uom.uom_id,
        label: uom.uom_name,
      }))
    : [];

  const CustomCreateLabel = ({ inputValue }) => (
    <div className="flex items-center justify-between px-2 py-1">
      <span>Add "{inputValue}"</span>
      <button
        type="button"
        className="ml-2 px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        onClick={() => handleAddNewMaterial(inputValue, currentDescId, currentMatIndex)}
        disabled={addingMaterial}
      >
        {addingMaterial ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
      </button>
    </div>
  );

  // Handle changes in edit modal
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setEditingAssignment((prev) => ({ ...prev, [name]: value }));
  };

  const handleModalItemSelect = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setEditingAssignment((prev) => ({ ...prev, item_id: value }));
  };

  const handleModalUomSelect = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setEditingAssignment((prev) => ({ ...prev, uom_id: value }));
  };

  const { comp_a_qty, comp_b_qty, comp_c_qty } = editingAssignment ? calculateCompQuantities(editingAssignment) : { comp_a_qty: 0, comp_b_qty: 0, comp_c_qty: 0 };
  const modalTotalCost = editingAssignment ? calculateTotalCost(editingAssignment) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {(loading.materials || loading.uoms || loading.assignedMaterials) ? (
          <div className="flex justify-center items-center py-16">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading resources...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="">
            <div className="mb-6">
              {error && (
                <div
                  className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm"
                  dangerouslySetInnerHTML={{ __html: error }}
                />
              )}
            </div>

            {selectedWorkDesc && (
              <div className="space-y-6">
                {existingAssignments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Previously Assigned Materials</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Material</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">UOM</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Quantity</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Rate (₹)</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Cost (₹)</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio A (Qty)</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio B (Qty)</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Comp Ratio C (Qty)</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {existingAssignments.map((mat, index) => {
                            const { comp_a_qty, comp_b_qty, comp_c_qty } = calculateCompQuantities(mat);
                            const totalCost = calculateTotalCost(mat);
                            const materialName = mat.item_name || materials.find((m) => m.item_id === mat.item_id)?.item_name || mat.item_id;
                            const uomName = mat.uom_name || uoms.find((u) => u.uom_id === mat.uom_id)?.uom_name || "N/A";
                            const assignmentId = mat.id || mat.assignment_id; // Use id or assignment_id
                            return (
                              <tr key={assignmentId || index} className="border-t border-gray-200">
                                <td className="px-4 py-2 text-sm text-gray-600">{materialName}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{uomName}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{mat.quantity}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{mat.rate}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{totalCost}</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_a || 0} ({comp_a_qty})</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_b || 0} ({comp_b_qty})</td>
                                <td className="px-4 py-2 text-sm text-gray-600">{mat.comp_ratio_c || 0} ({comp_c_qty})</td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {!isSubmitted ? (
                                    <div className="flex space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => handleEditAssignment(mat)}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                        title="Edit"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAssignment(assignmentId)}
                                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-xs">Disabled</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">New Material Assignments</h3>
                  {(materialAssignments[selectedWorkDesc.value] || []).map((mat, matIndex) => {
                    const { comp_a_qty, comp_b_qty, comp_c_qty } = calculateCompQuantities(mat);
                    const totalCost = calculateTotalCost(mat);
                    return (
                      <div key={matIndex} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Material #{matIndex + 1}
                            </label>
                            <CreatableSelect
                              options={materialOptions}
                              value={materialOptions.find((opt) => opt.value === mat.item_id) || null}
                              onChange={(opt) => {
                                setCurrentDescId(selectedWorkDesc.value);
                                setCurrentMatIndex(matIndex);
                                handleItemSelect(selectedWorkDesc.value, matIndex, opt);
                              }}
                              formatCreateLabel={(inputValue) => (
                                <CustomCreateLabel inputValue={inputValue} />
                              )}
                              isSearchable
                              isClearable
                              isDisabled={!isFormEnabled || addingMaterial}
                              className="text-sm"
                              classNamePrefix="select"
                              placeholder="Select or type material..."
                            />
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 w-28">Comp Ratio A:</label>
                                <input
                                  type="number"
                                  name="comp_ratio_a"
                                  value={mat.comp_ratio_a}
                                  onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                                  disabled={!isFormEnabled}
                                  min="0"
                                />
                                <span className="text-sm text-gray-600">Qty: {comp_a_qty}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 w-28">Comp Ratio B:</label>
                                <input
                                  type="number"
                                  name="comp_ratio_b"
                                  value={mat.comp_ratio_b}
                                  onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                                  disabled={!isFormEnabled}
                                  min="0"
                                />
                                <span className="text-sm text-gray-600">Qty: {comp_b_qty}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 w-28">Comp Ratio C:</label>
                                <input
                                  type="number"
                                  name="comp_ratio_c"
                                  value={mat.comp_ratio_c}
                                  onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                                  disabled={!isFormEnabled}
                                  min="0"
                                />
                                <span className="text-sm text-gray-600">Qty: {comp_c_qty}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unit of Measure
                            </label>
                            <Select
                              options={uomOptions}
                              value={uomOptions.find((opt) => opt.value === mat.uom_id) || null}
                              onChange={(opt) =>
                                handleMaterialChange(selectedWorkDesc.value, matIndex, {
                                  target: { name: "uom_id", value: opt ? opt.value : "" },
                                })
                              }
                              isSearchable
                              isClearable
                              isDisabled={!isFormEnabled}
                              className="text-sm"
                              classNamePrefix="select"
                              placeholder="Select UOM..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Overall Quantity
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              value={mat.quantity}
                              onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                              required
                              disabled={!isFormEnabled}
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rate per Quantity
                            </label>
                            <input
                              type="number"
                              name="rate"
                              value={mat.rate}
                              onChange={(e) => handleMaterialChange(selectedWorkDesc.value, matIndex, e)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                              required
                              disabled={!isFormEnabled}
                              min="0"
                              step="0.01"
                            />
                            <div className="mt-2 text-sm text-gray-600">
                              Overall Cost: ₹{calculateTotalCost(mat)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-gray-500">
                            Row {matIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(selectedWorkDesc.value, matIndex)}
                            disabled={(materialAssignments[selectedWorkDesc.value] || []).length <= 1 || !isFormEnabled}
                            className={`p-1.5 rounded-md ${
                              (materialAssignments[selectedWorkDesc.value] || []).length <= 1 || !isFormEnabled
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50"
                            }`}
                            title={
                              (materialAssignments[selectedWorkDesc.value] || []).length <= 1
                                ? "At least one material is required"
                                : "Remove this entry"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => handleAddMaterial(selectedWorkDesc.value)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={!isFormEnabled}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Material
                    </button>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total Material Cost:</span>
                      <span className="text-lg font-semibold">Rs. {materialTotalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Budget Percentage:</span>
                      <span className="text-lg font-semibold">{materialBudgetPercentage.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      type="button"
                      onClick={handleSaveMaterialAllocation}
                      disabled={loading.submitting || !isFormEnabled || isSubmitted}
                      className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 shadow-lg"
                    >
                      Save Material Allocation
                    </button>
                    <button
                      type="submit"
                      disabled={loading.submitting || !isFormEnabled || isSubmitted}
                      className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 shadow-lg"
                    >
                      {loading.submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Assign Materials
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}

        {/* Edit Modal */}
        {showEditModal && editingAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Material Assignment</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAssignment(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600" dangerouslySetInnerHTML={{ __html: error }} />
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                    <CreatableSelect
                      options={materialOptions}
                      value={materialOptions.find((opt) => opt.value === editingAssignment.item_id) || null}
                      onChange={handleModalItemSelect}
                      formatCreateLabel={(inputValue) => <CustomCreateLabel inputValue={inputValue} />}
                      isSearchable
                      isClearable
                      className="text-sm"
                      classNamePrefix="select"
                      placeholder="Select or type material..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit of Measure</label>
                      <Select
                        options={uomOptions}
                        value={uomOptions.find((opt) => opt.value === editingAssignment.uom_id) || null}
                        onChange={handleModalUomSelect}
                        isSearchable
                        isClearable
                        className="text-sm"
                        classNamePrefix="select"
                        placeholder="Select UOM..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overall Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={editingAssignment.quantity}
                        onChange={handleModalChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate per Quantity</label>
                      <input
                        type="number"
                        name="rate"
                        value={editingAssignment.rate}
                        onChange={handleModalChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost</label>
                      <input
                        type="text"
                        value={`₹${modalTotalCost}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 w-28">Comp Ratio A:</label>
                      <input
                        type="number"
                        name="comp_ratio_a"
                        value={editingAssignment.comp_ratio_a || ""}
                        onChange={handleModalChange}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        min="0"
                      />
                      <span className="text-sm text-gray-600">Qty: {comp_a_qty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 w-28">Comp Ratio B:</label>
                      <input
                        type="number"
                        name="comp_ratio_b"
                        value={editingAssignment.comp_ratio_b || ""}
                        onChange={handleModalChange}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        min="0"
                      />
                      <span className="text-sm text-gray-600">Qty: {comp_b_qty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 w-28">Comp Ratio C:</label>
                      <input
                        type="number"
                        name="comp_ratio_c"
                        value={editingAssignment.comp_ratio_c || ""}
                        onChange={handleModalChange}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        min="0"
                      />
                      <span className="text-sm text-gray-600">Qty: {comp_c_qty}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAssignment(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={loading.submitting}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    {loading.submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .select__control {
          border-color: #d1d5db;
          min-height: 38px;
        }
        .select__control--is-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .select__menu {
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default MaterialPlanning;
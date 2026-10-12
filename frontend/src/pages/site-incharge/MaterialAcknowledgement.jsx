import { API_BASE_URL } from "../../config/api.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { useParams } from "react-router-dom";

const MaterialAcknowledgement = () => {
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
  const [acknowledgements, setAcknowledgements] = useState({});
  const [ackDetails, setAckDetails] = useState({});
  const [editingIds, setEditingIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (encodedUserId) {
      try {
        const decodedId = atob(encodedUserId);
        setUserId(decodedId);
        console.log('Decoded User ID:', decodedId);
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
      console.error("Failed to fetch companies:", err);
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
      console.error("Failed to fetch projects:", err);
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
      console.error("Failed to fetch work descriptions:", err);
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
    }
  }, [selectedProject, allProjects]);

  useEffect(() => {
    if (selectedSite) {
      fetchWorkDescriptions(selectedSite.value);
      setSelectedWorkDescription(null);
      setDispatchData([]);
      setAckDetails({});
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

          const dispatchMap = new Map();
          (response.data.data || []).forEach(dispatch => {
            if (!dispatchMap.has(dispatch.id)) {
              dispatchMap.set(dispatch.id, dispatch);
            }
          });

          const uniqueDispatches = Array.from(dispatchMap.values());
          setDispatchData(uniqueDispatches);

          const ackPromises = uniqueDispatches.map(dispatch =>
            axios.get(
              `${API_BASE_URL}/site-incharge/acknowledgement-details?material_dispatch_id=${dispatch.id}`
            ).catch(err => {
              console.error(`Error fetching acknowledgement for dispatch ${dispatch.id}:`, err);
              return { data: { data: [] } };
            })
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
          console.error("Failed to fetch dispatch or acknowledgement details:", err);
          setError("Failed to fetch dispatch or acknowledgement details");
          toast.error("Failed to fetch dispatch or acknowledgement details");
        } finally {
          setLoading(false);
        }
      };
      fetchDispatchDetails();
    }
  }, [selectedProject, selectedSite, selectedWorkDescription]);

  const getTotalDispatched = (dispatch) => {
    const componentQuantities = [dispatch.comp_a_qty, dispatch.comp_b_qty, dispatch.comp_c_qty];
    const hasComponentBreakdown = componentQuantities.some(
      quantity => quantity !== null && quantity !== undefined && quantity !== ''
    );

    if (!hasComponentBreakdown) {
      return Number(dispatch.dispatch_qty) || 0;
    }

    return componentQuantities.reduce((total, quantity) => total + (Number(quantity) || 0), 0);
  };

  const validateQuantity = (dispatchId, overallQuantityStr) => {
    const dispatch = dispatchData.find(d => d.id === parseInt(dispatchId));
    if (!dispatch) return false;
    const totalDispatched = getTotalDispatched(dispatch);
    const overallQuantity = parseInt(overallQuantityStr, 10);
    return overallQuantity <= totalDispatched && overallQuantity >= 0;
  };

  const handleAcknowledge = async (dispatchId) => {
    const ackData = acknowledgements[dispatchId];
    if (!ackData || !userId) {
      toast.error("User ID or Acknowledgement data is missing.");
      return;
    }

    const overallQuantityStr = ackData.overall_quantity;
    if (overallQuantityStr && !validateQuantity(dispatchId, overallQuantityStr)) {
      toast.error("Entered quantity cannot be greater than the Total Dispatched.");
      return;
    }

    try {
      console.log('Saving acknowledgement for dispatch:', dispatchId, 'with data:', ackData);
      
      const response = await axios.post(`${API_BASE_URL}/site-incharge/acknowledge-material`, {
        material_dispatch_id: parseInt(dispatchId),
        overall_quantity: overallQuantityStr !== "" ? parseInt(overallQuantityStr, 10) : null,
        remarks: ackData.remarks || null,
        created_by: userId,
      });
      
      toast.success(response.data.message);
      
      // Refresh acknowledgement details
      const responseRefresh = await axios.get(
        `${API_BASE_URL}/site-incharge/acknowledgement-details?material_dispatch_id=${dispatchId}`
      );
      
      setAckDetails(prev => ({
        ...prev,
        [dispatchId]: responseRefresh.data.data[0] || null
      }));
      
      setAcknowledgements(prev => {
        const newAck = { ...prev };
        delete newAck[dispatchId];
        return newAck;
      });
      
    } catch (err) {
      console.error('Error saving acknowledgement:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to save acknowledgement";
      toast.error(errorMessage);
    }
  };

  const handleUpdateAcknowledge = async (dispatchId, ackId) => {
    const ackData = acknowledgements[dispatchId];
    if (!ackData || !userId || !ackId) {
      toast.error("User ID, Acknowledgement ID or data is missing.");
      return;
    }

    const overallQuantityStr = ackData.overall_quantity;
    if (overallQuantityStr && !validateQuantity(dispatchId, overallQuantityStr)) {
      toast.error("Entered quantity cannot be greater than the Total Dispatched.");
      return;
    }

    try {
      console.log('Updating acknowledgement:', ackId, 'for dispatch:', dispatchId, 'with data:', ackData);
      
      const response = await axios.put(`${API_BASE_URL}/site-incharge/update-acknowledgement`, {
        ack_id: parseInt(ackId),
        overall_quantity: overallQuantityStr !== "" ? parseInt(overallQuantityStr, 10) : null,
        remarks: ackData.remarks || null,
        updated_by: userId,
      });
      
      toast.success(response.data.message);
      
      // Refresh acknowledgement details
      const responseRefresh = await axios.get(
        `${API_BASE_URL}/site-incharge/acknowledgement-details?material_dispatch_id=${dispatchId}`
      );
      
      setAckDetails(prev => ({
        ...prev,
        [dispatchId]: responseRefresh.data.data[0] || null
      }));
      
      setEditingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(dispatchId);
        return newSet;
      });
      
      setAcknowledgements(prev => {
        const newAck = { ...prev };
        delete newAck[dispatchId];
        return newAck;
      });
      
    } catch (err) {
      console.error('Error updating acknowledgement:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to update acknowledgement";
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (dispatchId, field, value) => {
    setAcknowledgements(prev => ({
      ...prev,
      [dispatchId]: {
        ...prev[dispatchId],
        [field]: value
      }
    }));
  };

  const handleEditToggle = (dispatchId) => {
    setEditingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dispatchId)) {
        // Cancel editing
        newSet.delete(dispatchId);
        setAcknowledgements(prev => {
          const newAck = { ...prev };
          delete newAck[dispatchId];
          return newAck;
        });
      } else {
        // Start editing - populate with current values
        const ack = ackDetails[dispatchId]?.acknowledgement;
        if (ack) {
          setAcknowledgements(prev => ({
            ...prev,
            [dispatchId]: {
              overall_quantity: ack.overall_quantity !== null ? ack.overall_quantity.toString() : "",
              remarks: ack.remarks || ""
            }
          }));
          newSet.add(dispatchId);
        }
      }
      return newSet;
    });
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

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Material Acknowledgement</h2>

      <div className="mb-6 space-y-4">
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

      {loading && <div className="text-center text-gray-600 py-4">Loading...</div>}
      {error && <div className="text-center text-red-600 py-4">{error}</div>}

      {dispatchData.length > 0 && (
        <div className="space-y-4">
          {dispatchData.map(dispatch => {
            const ackDetail = ackDetails[dispatch.id];
            const ack = ackDetail?.acknowledgement;
            const isEditing = editingIds.has(dispatch.id);
            const editable = ack?.is_editable || false;
            const totalDispatched = getTotalDispatched(dispatch);
            const ackId = ack?.id;
            const currentAckQuantity = acknowledgements[dispatch.id]?.overall_quantity || "";
            const isQuantityValid = !currentAckQuantity || validateQuantity(dispatch.id, currentAckQuantity);
            const hasValidInput = currentAckQuantity || acknowledgements[dispatch.id]?.remarks;
            
            return (
              <div key={dispatch.id} className="border rounded-lg p-4 bg-white shadow-md">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {formatItemAndRatios(dispatch)}
                </h3>

                <div className="mb-3">
                  <h4 className="text-md font-medium text-gray-700 mb-1">Dispatched Quantities</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {dispatch.comp_a_qty !== null && (
                      <div>
                        <span className="font-medium">Comp A:</span> {dispatch.comp_a_qty}
                      </div>
                    )}
                    {dispatch.comp_b_qty !== null && (
                      <div>
                        <span className="font-medium">Comp B:</span> {dispatch.comp_b_qty}
                      </div>
                    )}
                    {dispatch.comp_c_qty !== null && (
                      <div>
                        <span className="font-medium">Comp C:</span> {dispatch.comp_c_qty}
                      </div>
                    )}
                    <div className="col-span-2 font-medium text-indigo-600 border-t pt-1">
                      <strong>Total Dispatched:</strong> {totalDispatched}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t pt-3">
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Acknowledge Receipt</h4>
                  {ack ? (
                    isEditing ? (
                      <div>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-600 mb-1">Overall Quantity</h5>
                            <input
                              type="number"
                              placeholder="Overall Quantity"
                              value={acknowledgements[dispatch.id]?.overall_quantity || ""}
                              onChange={(e) => handleInputChange(dispatch.id, 'overall_quantity', e.target.value)}
                              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 ${
                                !isQuantityValid ? 'focus:ring-red-400 border-red-400' : 'focus:ring-indigo-400 border-gray-300'
                              }`}
                              min="0"
                              max={totalDispatched}
                            />
                            {!isQuantityValid && (
                              <p className="text-xs text-red-600 mt-1">Quantity cannot exceed {totalDispatched}</p>
                            )}
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-600 mb-1">Remarks</h5>
                            <input
                              type="text"
                              placeholder="Remarks"
                              value={acknowledgements[dispatch.id]?.remarks || ""}
                              onChange={(e) => handleInputChange(dispatch.id, 'remarks', e.target.value)}
                              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleUpdateAcknowledge(dispatch.id, ackId)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={!hasValidInput || !isQuantityValid}
                          >
                            Update Acknowledgement
                          </button>
                          <button
                            onClick={() => handleEditToggle(dispatch.id)}
                            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <p><strong>Overall Quantity:</strong> {ack.overall_quantity || 'N/A'}</p>
                        <p><strong>Remarks:</strong> {ack.remarks || 'No remarks'}</p>
                        <p className="text-xs text-gray-500">
                          <strong>Last Updated:</strong> {new Date(ack.updated_at || ack.created_at).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleEditToggle(dispatch.id)}
                          disabled={!editable}
                          className={`w-full px-4 py-2 rounded-md transition duration-200 mt-2 cursor-pointer ${
                            editable
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {editable ? 'Edit Acknowledgement' : 'Edit Disabled (48h passed)'}
                        </button>
                      </div>
                    )
                  ) : (
                    <div>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Overall Quantity</h5>
                          <input
                            type="number"
                            placeholder="Overall Quantity"
                            value={acknowledgements[dispatch.id]?.overall_quantity || ""}
                            onChange={(e) => handleInputChange(dispatch.id, 'overall_quantity', e.target.value)}
                            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-1 ${
                              !isQuantityValid ? 'focus:ring-red-400 border-red-400' : 'focus:ring-indigo-400 border-gray-300'
                            }`}
                            min="0"
                            max={totalDispatched}
                          />
                          {!isQuantityValid && (
                            <p className="text-xs text-red-600 mt-1">Quantity cannot exceed {totalDispatched}</p>
                          )}
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Remarks</h5>
                          <input
                            type="text"
                            placeholder="Remarks"
                            value={acknowledgements[dispatch.id]?.remarks || ""}
                            onChange={(e) => handleInputChange(dispatch.id, 'remarks', e.target.value)}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcknowledge(dispatch.id)}
                        className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!hasValidInput || !isQuantityValid}
                      >
                        Save Acknowledgement
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
};

export default MaterialAcknowledgement;
import { API_BASE_URL } from "../../config/api.js";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { Loader2, Package, FileText, X, Truck } from "lucide-react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom"; // Import useParams

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

const SupplyMaterialDispatch = () => {
  const { encodedUserId } = useParams(); // Get encodedUserId from URL
  const [userId, setUserId] = useState(null); // Store decoded userId
  const [allSites, setAllSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSite, setSelectedSite] = useState("");
  const [nextDcNo, setNextDcNo] = useState("");
  const [masterDcNo, setMasterDcNo] = useState("");
  const [isMasterDcNoEditable, setIsMasterDcNoEditable] = useState(true);
  const [assignedMaterials, setAssignedMaterials] = useState([]);
  const [loading, setLoading] = useState({
    companies: false,
    projects: false,
    sites: false,
    dcNo: false,
    masterDcNo: false,
    materials: false,
    transportTypes: false,
    providers: false,
    vehicles: false,
    drivers: false,
    submitting: false,
  });
  const [error, setError] = useState(null);
  const [dispatchData, setDispatchData] = useState({
    dc_no: "",
    dispatch_date: "",
    order_no: "",
    vendor_code: "",
  });
  const [transportData, setTransportData] = useState({
    transport_type_id: "",
    provider_id: "",
    vehicle_id: "",
    driver_id: "",
    destination: "",
    booking_expense: "",
    travel_expense: "",
  });
  const [newEntryData, setNewEntryData] = useState({
    vehicle_model: "",
    vehicle_number: "",
    driver_mobile: "",
    driver_address: "",
    provider_address: "",
    provider_mobile: "",
  });
  const [transportTypes, setTransportTypes] = useState([]);
  const [providers, setProviders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [dispatchQuantities, setDispatchQuantities] = useState({});
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);

  // Decode userId from encodedUserId
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

  // Fetch companies
  const fetchCompanies = async () => {
    setLoading((prev) => ({ ...prev, companies: true }));
    try {
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
      setError("Failed to load companies.");
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };

  // Fetch sites by company
  const fetchSitesByCompany = async () => {
    if (!selectedCompany) return;
    setLoading((prev) => ({ ...prev, projects: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/supply/sites-by-company/${selectedCompany}`);
      const sitesData = Array.isArray(response.data.data) ? response.data.data : [];
      setAllSites(sitesData);

      const uniqueProjects = Array.from(
        new Map(sitesData.map((site) => [site.pd_id, { id: site.pd_id, project_name: site.project_name }])).values()
      );
      setProjects(uniqueProjects);
      if (uniqueProjects.length > 0 && !selectedProject) {
        setSelectedProject(uniqueProjects[0].id);
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
      setError("Failed to load projects.");
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  };

  // Fetch master_dc_no
  const fetchMasterDcNo = async () => {
    if (!selectedCompany) {
      setMasterDcNo("");
      setIsMasterDcNoEditable(true);
      return;
    }
    setLoading((prev) => ({ ...prev, masterDcNo: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/supply/master-dc-no`, {
        params: { company_id: selectedCompany },
      });
      const masterDcNoData = response.data.data?.dc_no || "";
      setMasterDcNo(masterDcNoData);
      setIsMasterDcNoEditable(!masterDcNoData);
    } catch (error) {
      console.error("Error fetching master DC No:", error);
      setError("Failed to load Master DC No.");
      setMasterDcNo("");
      setIsMasterDcNoEditable(true);
    } finally {
      setLoading((prev) => ({ ...prev, masterDcNo: false }));
    }
  };

  // Save master_dc_no
  const saveMasterDcNo = async () => {
    if (!selectedCompany || !masterDcNo || !isMasterDcNoEditable || !userId) {
      setError("User ID or Master DC No is missing.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/supply/master-dc-no`, {
        company_id: selectedCompany,
        dc_no: masterDcNo,
        created_by: userId, // Include created_by
      });
      setIsMasterDcNoEditable(false);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Master DC No saved successfully!",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });
    } catch (error) {
      console.error("Error saving master DC No:", error);
      setError(error.response?.data?.message || "Failed to save Master DC No.");
    }
  };

  // Fetch next DC No
  const fetchNextDcNo = async () => {
    if (!selectedSite) return;
    setLoading((prev) => ({ ...prev, dcNo: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/supply/next-supply-dc-no`, {
        params: { site_id: selectedSite },
      });
      if (response.data.status === "success" && response.data.data) {
        const nextDcNoValue = response.data.data.next_dc_no != null ? response.data.data.next_dc_no.toString() : "N/A";
        setNextDcNo(nextDcNoValue);
        setDispatchData((prev) => ({ ...prev, dc_no: nextDcNoValue }));
      } else {
        setNextDcNo("N/A");
        setDispatchData((prev) => ({ ...prev, dc_no: "N/A" }));
      }
    } catch (error) {
      console.error("Error fetching next DC No:", error);
      setError(error.response?.data?.message || "Failed to load next DC No.");
      setNextDcNo("N/A");
      setDispatchData((prev) => ({ ...prev, dc_no: "N/A" }));
    } finally {
      setLoading((prev) => ({ ...prev, dcNo: false }));
    }
  };

  // Fetch assigned materials
  const fetchAssignedMaterials = async () => {
    if (!selectedSite) return;
    setLoading((prev) => ({ ...prev, materials: true }));
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/supply/assigned-materials/?site_id=${selectedSite}`);
      const materials = response.data.data || [];
      setAssignedMaterials(materials);

      const newDispatchQuantities = {};
      materials.forEach((assignment) => {
        newDispatchQuantities[assignment.id] = { dispatch_qty: 0 };
      });
      setDispatchQuantities(newDispatchQuantities);
    } catch (error) {
      console.error("Error fetching assigned materials:", error);
      setError(error.response?.data?.message || "Failed to load assigned materials.");
    } finally {
      setLoading((prev) => ({ ...prev, materials: false }));
    }
  };

  // Fetch transport types
  const fetchTransportTypes = async () => {
    setLoading((prev) => ({ ...prev, transportTypes: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/supply/supply-transport-types`);
      setTransportTypes(response.data.data || []);
    } catch (error) {
      console.error("Error fetching transport types:", error);
      setError("Failed to load transport types.");
    } finally {
      setLoading((prev) => ({ ...prev, transportTypes: false }));
    }
  };

  // Fetch providers
  const fetchProviders = async (transport_type_id) => {
    setLoading((prev) => ({ ...prev, providers: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/supply/supply-providers`, {
        params: { transport_type_id: Number.isInteger(parseInt(transport_type_id)) ? transport_type_id : undefined },
      });
      setProviders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching providers:", error);
      setError("Failed to load providers.");
    } finally {
      setLoading((prev) => ({ ...prev, providers: false }));
    }
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    setLoading((prev) => ({ ...prev, vehicles: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/supply/supply-vehicles`);
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setError("Failed to load vehicles.");
    } finally {
      setLoading((prev) => ({ ...prev, vehicles: false }));
    }
  };

  // Fetch drivers
  const fetchDrivers = async () => {
    setLoading((prev) => ({ ...prev, drivers: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/supply/supply-drivers`);
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setError("Failed to load drivers.");
    } finally {
      setLoading((prev) => ({ ...prev, drivers: false }));
    }
  };

  // Handle company change
  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
    setSelectedProject("");
    setSelectedSite("");
    setSites([]);
    setAssignedMaterials([]);
    setDispatchQuantities({});
    setNextDcNo("");
    setMasterDcNo("");
    setIsMasterDcNoEditable(true);
    const selectedCompanyData = companies.find((company) => company.id === value);
    setDispatchData({
      dc_no: "",
      dispatch_date: "",
      order_no: "",
      vendor_code: selectedCompanyData ? selectedCompanyData.vendor_code || "" : "",
    });
    setTransportData({
      transport_type_id: "",
      provider_id: "",
      vehicle_id: "",
      driver_id: "",
      destination: "",
      booking_expense: "",
      travel_expense: "",
    });
    setNewEntryData({
      vehicle_model: "",
      vehicle_number: "",
      driver_mobile: "",
      driver_address: "",
      provider_address: "",
      provider_mobile: "",
    });
    setError(null);
    setIsTransportModalOpen(false);
  };

  // Handle project change
  const handleProjectChange = (value) => {
    setSelectedProject(value);
    setSelectedSite("");
    setAssignedMaterials([]);
    setDispatchQuantities({});
    setNextDcNo("");
    setTransportData({
      transport_type_id: "",
      provider_id: "",
      vehicle_id: "",
      driver_id: "",
      destination: "",
      booking_expense: "",
      travel_expense: "",
    });
    setNewEntryData({
      vehicle_model: "",
      vehicle_number: "",
      driver_mobile: "",
      driver_address: "",
      provider_address: "",
      provider_mobile: "",
    });
    setError(null);
    setIsTransportModalOpen(false);
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
      if (projectSites.length > 0) {
        setSelectedSite(projectSites[0].site_id);
        setDispatchData({
          dc_no: "",
          dispatch_date: "",
          order_no: projectSites[0].po_number || projectSites[0].supply_code || "",
          vendor_code: dispatchData.vendor_code,
        });
      } else {
        setDispatchData({
          dc_no: "",
          dispatch_date: "",
          order_no: "",
          vendor_code: dispatchData.vendor_code,
        });
      }
    } else {
      setDispatchData({
        dc_no: "",
        dispatch_date: "",
        order_no: "",
        vendor_code: dispatchData.vendor_code,
      });
    }
  };

  // Handle site change
  const handleSiteChange = (value) => {
    setSelectedSite(value);
    setAssignedMaterials([]);
    setDispatchQuantities({});
    setNextDcNo("");
    const selectedSiteData = sites.find((site) => site.id === value);
    setDispatchData((prev) => ({
      ...prev,
      order_no: selectedSiteData ? (selectedSiteData.po_number || selectedSiteData.supply_code || "") : "",
      dc_no: "",
    }));
    setTransportData({
      transport_type_id: "",
      provider_id: "",
      vehicle_id: "",
      driver_id: "",
      destination: "",
      booking_expense: "",
      travel_expense: "",
    });
    setNewEntryData({
      vehicle_model: "",
      vehicle_number: "",
      driver_mobile: "",
      driver_address: "",
      provider_address: "",
      provider_mobile: "",
    });
    setError(null);
    setIsTransportModalOpen(false);
    if (value) {
      fetchAssignedMaterials();
      fetchNextDcNo();
    }
  };

  // Handle dispatch data change
  const handleDispatchChange = (field, value) => {
    setDispatchData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle master_dc_no change
  const handleMasterDcNoChange = (value) => {
    setMasterDcNo(value);
  };

  // Handle transport data change
  const handleTransportChange = (field, value) => {
    setTransportData((prev) => ({ ...prev, [field]: value }));
    if (field === "transport_type_id") {
      setProviders([]);
      setTransportData((prev) => ({
        ...prev,
        provider_id: "",
        vehicle_id: "",
        driver_id: "",
        destination: "",
        booking_expense: "",
        travel_expense: "",
      }));
      setNewEntryData({
        vehicle_model: "",
        vehicle_number: "",
        driver_mobile: "",
        driver_address: "",
        provider_address: "",
        provider_mobile: "",
      });
      if (value && Number.isInteger(parseInt(value))) {
        fetchProviders(value);
      }
    }
  };

  // Handle new entry data change
  const handleNewEntryChange = (field, value) => {
    setNewEntryData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle quantity change
  const handleQuantityChange = (assignmentId, value) => {
    const assignment = assignedMaterials.find((a) => a.id === assignmentId);
    const maxQty = assignment.remaining_quantity || 0;
    const dispatchQty = value ? Math.min(parseFloat(value), maxQty) : 0;
    setDispatchQuantities((prev) => ({
      ...prev,
      [assignmentId]: { dispatch_qty: dispatchQty },
    }));
  };

  // Validate dispatch
  const isDispatchEnabled = () => {
    if (!dispatchData.dc_no || !dispatchData.dispatch_date || !dispatchData.order_no || !dispatchData.vendor_code || !userId) {
      return false;
    }
    return assignedMaterials.some((assignment) => {
      const dispatchQty = dispatchQuantities[assignment.id]?.dispatch_qty || 0;
      return dispatchQty > 0;
    });
  };

  // Handle dispatch submission
  const handleDispatchSubmit = async () => {
    setLoading((prev) => ({ ...prev, submitting: true }));
    setError(null);
    if (!userId) {
      setError("User ID is missing. Please try again.");
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "User ID is missing",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
      });
      setLoading((prev) => ({ ...prev, submitting: false }));
      return;
    }
    try {
      if (isMasterDcNoEditable) {
        await saveMasterDcNo();
      }

      const requiredFields = [
        transportData.transport_type_id,
        transportData.provider_id,
        transportData.vehicle_id,
        transportData.driver_id,
        transportData.destination,
        transportData.travel_expense,
      ];
      if (transportData.transport_type_id === "2") {
        requiredFields.push(transportData.booking_expense);
      }
      if (requiredFields.some((field) => !field)) {
        setError("Please fill all required transport fields.");
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Please fill all required transport fields",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
        });
        setLoading((prev) => ({ ...prev, submitting: false }));
        return;
      }

      const dispatchPayload = assignedMaterials
        .map((assignment) => {
          const dispatchQty = dispatchQuantities[assignment.id]?.dispatch_qty || 0;
          if (dispatchQty <= 0) return null;
          return {
            material_assign_id: assignment.id,
            dc_no: parseInt(dispatchData.dc_no),
            dispatch_date: dispatchData.dispatch_date,
            order_no: dispatchData.order_no,
            vendor_code: dispatchData.vendor_code,
            dispatch_qty: dispatchQty,
          };
        })
        .filter(Boolean);

      const transportPayload = {
        transport_type_id: parseInt(transportData.transport_type_id),
        provider_id: transportData.provider_id,
        vehicle_id: transportData.vehicle_id,
        driver_id: transportData.driver_id,
        destination: transportData.destination,
        booking_expense: transportData.booking_expense ? parseFloat(transportData.booking_expense) : null,
        travel_expense: parseFloat(transportData.travel_expense),
        provider_address: newEntryData.provider_address || null,
        provider_mobile: newEntryData.provider_mobile || null,
        vehicle_model: newEntryData.vehicle_model || null,
        vehicle_number: newEntryData.vehicle_number || null,
        driver_mobile: newEntryData.driver_mobile || null,
        driver_address: newEntryData.driver_address || null,
      };

      const payload = { assignments: dispatchPayload, transport: transportPayload, created_by: userId }; // Include created_by
      const response = await axios.post(`${API_BASE_URL}/supply/add-supply-dispatch`, payload);

      if (response.data.status === "already_dispatched") {
        const conflicts = response.data.conflicts
          .map((conflict) => `Material: ${conflict.item_name} (ID: ${conflict.material_assign_id})`)
          .join(", ");
        setError(`Cannot dispatch: ${conflicts}`);
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Some materials exceed assigned quantity",
          text: conflicts,
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });
        return;
      }

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Materials dispatched successfully!",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      setDispatchData({ dc_no: "", dispatch_date: "", order_no: "", vendor_code: "" });
      setTransportData({
        transport_type_id: "",
        provider_id: "",
        vehicle_id: "",
        driver_id: "",
        destination: "",
        booking_expense: "",
        travel_expense: "",
      });
      setNewEntryData({
        vehicle_model: "",
        vehicle_number: "",
        driver_mobile: "",
        driver_address: "",
        provider_address: "",
        provider_mobile: "",
      });
      setDispatchQuantities({});
      setIsTransportModalOpen(false);
      fetchAssignedMaterials();
      fetchNextDcNo();
    } catch (error) {
      console.error("Error dispatching materials:", error);
      const errorMessage = error.response?.data?.message || "Failed to dispatch materials.";
      setError(errorMessage);
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: errorMessage,
        showConfirmButton: false,
        timer: 1500,
        toast: true,
      });
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Effect hooks
  useEffect(() => {
    fetchCompanies();
    fetchTransportTypes();
    fetchVehicles();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchMasterDcNo();
      fetchSitesByCompany();
    } else {
      setProjects([]);
      setSites([]);
      setSelectedProject("");
      setSelectedSite("");
      setMasterDcNo("");
      setIsMasterDcNoEditable(true);
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
      if (projectSites.length > 0 && !selectedSite) {
        setSelectedSite(projectSites[0].site_id);
        setDispatchData({
          dc_no: "",
          dispatch_date: "",
          order_no: projectSites[0].po_number || projectSites[0].supply_code || "",
          vendor_code: dispatchData.vendor_code,
        });
      } else if (!projectSites.some((site) => site.site_id === selectedSite)) {
        setSelectedSite("");
        setDispatchData({
          dc_no: "",
          dispatch_date: "",
          order_no: "",
          vendor_code: dispatchData.vendor_code,
        });
      }
    } else {
      setSites([]);
      setSelectedSite("");
      setDispatchData({
        dc_no: "",
        dispatch_date: "",
        order_no: "",
        vendor_code: dispatchData.vendor_code,
      });
    }
  }, [selectedProject, allSites]);

  useEffect(() => {
    if (selectedSite) {
      fetchAssignedMaterials();
      fetchNextDcNo();
    }
  }, [selectedSite]);

  useEffect(() => {
    if (transportData.transport_type_id && Number.isInteger(parseInt(transportData.transport_type_id))) {
      fetchProviders(transportData.transport_type_id);
    } else {
      setProviders([]);
      setTransportData((prev) => ({
        ...prev,
        provider_id: "",
        vehicle_id: "",
        driver_id: "",
        destination: "",
        booking_expense: "",
        travel_expense: "",
      }));
    }
  }, [transportData.transport_type_id]);

  useEffect(() => {
    if (providers.length === 1 && !transportData.provider_id) {
      setTransportData((prev) => ({ ...prev, provider_id: providers[0].id }));
    }
  }, [providers, transportData.provider_id]);

  useEffect(() => {
    if (vehicles.length === 1 && !transportData.vehicle_id) {
      setTransportData((prev) => ({ ...prev, vehicle_id: vehicles[0].id }));
    }
  }, [vehicles, transportData.vehicle_id]);

  useEffect(() => {
    if (drivers.length === 1 && !transportData.driver_id) {
      setTransportData((prev) => ({ ...prev, driver_id: drivers[0].id }));
    }
  }, [drivers, transportData.driver_id]);

  const isOwnVehicle = transportData.transport_type_id === "1";

  return (
    <div className="min-h-screen  bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-2">
          <Package className="h-8 w-8 text-teal-600" />
          Supply Material Dispatch
        </h2>

        {/* Selection Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              disabled={loading.companies}
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
            {loading.companies && <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Center</label>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              disabled={loading.projects || !selectedCompany}
            >
              <option value="">Select Cost Center</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project_name}
                </option>
              ))}
            </select>
            {loading.projects && <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              disabled={loading.sites || !selectedProject}
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.site_name} ({site.po_number || site.supply_code || "N/A"})
                </option>
              ))}
            </select>
            {loading.sites && <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />}
          </div>
        </div>

        {/* Dispatch Details */}
        {selectedCompany && selectedProject && selectedSite && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dispatch Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Master DC No</label>
                {loading.masterDcNo ? (
                  <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />
                ) : isMasterDcNoEditable ? (
                  <input
                    type="text"
                    value={masterDcNo}
                    onChange={(e) => handleMasterDcNoChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter Master DC No"
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100">{masterDcNo || "N/A"}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">PO DC No</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100">
                  {loading.dcNo ? <Loader2 className="h-5 w-5 text-teal-500 animate-spin" /> : nextDcNo || "N/A"}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Dispatch Date</label>
                <input
                  type="date"
                  value={dispatchData.dispatch_date}
                  onChange={(e) => handleDispatchChange("dispatch_date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Order No</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100">{dispatchData.order_no || "N/A"}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Vendor Code</label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100">{dispatchData.vendor_code || "N/A"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Material Display */}
        {loading.materials ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 text-teal-600 animate-spin" />
          </div>
        ) : !selectedCompany || !selectedProject || !selectedSite ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">Please select a company, cost center, and site.</p>
          </div>
        ) : assignedMaterials.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No non-dispatched material assignments found for this work description.</p>
            <p className="text-gray-500 mt-2">Assign materials to this work description to dispatch them.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-md mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Material</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Assigned Qty</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Remaining Qty</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">UOM</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Cost/UOM</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Total Cost</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Target Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Dispatch Qty</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Dispatch Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignedMaterials.map((assignment, index) => {
                    const dispatchQty = dispatchQuantities[assignment.id]?.dispatch_qty || 0;
                    const dispatchCost = dispatchQty * parseFloat(assignment.supply_cost_per_uom || 0);
                    const targetDate = assignment.target_date ? new Date(assignment.target_date).toLocaleDateString() : "N/A";
                    return (
                      <tr key={assignment.id} className="hover:bg-teal-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{assignment.item_name || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{assignment.quantity || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{assignment.remaining_quantity || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{assignment.uom_name || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{assignment.supply_cost_per_uom || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{assignment.supply_cost || "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{targetDate}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <input
                            type="number"
                            value={dispatchQty}
                            onChange={(e) => handleQuantityChange(assignment.id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            placeholder="Qty"
                            min="0"
                            max={assignment.remaining_quantity}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{dispatchCost.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => setIsTransportModalOpen(true)}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${
                    isDispatchEnabled() ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isDispatchEnabled()}
                >
                  <Truck className="h-4 w-4 inline-block mr-2" />
                  Assign Transport
                </button>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 mb-6">
              {assignedMaterials.map((assignment, index) => {
                const dispatchQty = dispatchQuantities[assignment.id]?.dispatch_qty || 0;
                const dispatchCost = dispatchQty * parseFloat(assignment.supply_cost_per_uom || 0);
                const targetDate = assignment.target_date ? new Date(assignment.target_date).toLocaleDateString() : "N/A";
                return (
                  <div key={assignment.id} className="bg-white rounded-lg shadow-md p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Material</p>
                      <p className="text-sm text-gray-600">{assignment.item_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Assigned Qty</p>
                      <p className="text-sm text-gray-600">{assignment.quantity || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Remaining Qty</p>
                      <p className="text-sm text-gray-600">{assignment.remaining_quantity || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">UOM</p>
                      <p className="text-sm text-gray-600">{assignment.uom_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Cost/UOM</p>
                      <p className="text-sm text-gray-600">{assignment.supply_cost_per_uom || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Cost</p>
                      <p className="text-sm text-gray-600">{assignment.supply_cost || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Target Date</p>
                      <p className="text-sm text-gray-600">{targetDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dispatch Qty</p>
                      <input
                        type="number"
                        value={dispatchQty}
                        onChange={(e) => handleQuantityChange(assignment.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="Qty"
                        min="0"
                        max={assignment.remaining_quantity}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dispatch Cost</p>
                      <p className="text-sm text-gray-600">{dispatchCost.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => setIsTransportModalOpen(true)}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-medium ${
                    isDispatchEnabled() ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!isDispatchEnabled()}
                >
                  <Truck className="h-4 w-4 inline-block mr-2" />
                  Assign Transport
                </button>
              </div>
            </div>

            {/* Transport Modal */}
            {isTransportModalOpen && (
              <div
                className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setIsTransportModalOpen(false)}
              >
                <div
                  className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setIsTransportModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Transport Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Transport Type</label>
                      <select
                        value={transportData.transport_type_id}
                        onChange={(e) => handleTransportChange("transport_type_id", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                        disabled={loading.transportTypes}
                      >
                        <option value="">Select Transport Type</option>
                        {transportTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.type}
                          </option>
                        ))}
                      </select>
                      {loading.transportTypes && <Loader2 className="h-5 w-5 text-teal-500 animate-spin mt-2" />}
                    </div>
                    {transportData.transport_type_id && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            {isOwnVehicle ? "Contract Provider" : "Logistics Provider"}
                          </label>
                          <SearchableDropdown
                            options={providers}
                            selectedValue={transportData.provider_id}
                            onSelect={(value) => handleTransportChange("provider_id", value)}
                            placeholder={`Select ${isOwnVehicle ? "Contract" : "Logistics"} Provider`}
                            searchKeys={["provider_name"]}
                            disabled={!transportData.transport_type_id}
                            loading={loading.providers}
                          />
                          {transportData.provider_id && !providers.some((p) => p.id === transportData.provider_id) && (
                            <div className="mt-4 space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600">Provider Address</label>
                                <input
                                  type="text"
                                  value={newEntryData.provider_address}
                                  onChange={(e) => handleNewEntryChange("provider_address", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                  placeholder="Enter Provider Address"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600">Provider Mobile</label>
                                <input
                                  type="text"
                                  value={newEntryData.provider_mobile}
                                  onChange={(e) => handleNewEntryChange("provider_mobile", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                  placeholder="Enter Provider Mobile"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Vehicle</label>
                          <SearchableDropdown
                            options={vehicles}
                            selectedValue={transportData.vehicle_id}
                            onSelect={(value) => handleTransportChange("vehicle_id", value)}
                            placeholder="Select Vehicle"
                            searchKeys={["vehicle_name", "vehicle_number"]}
                            loading={loading.vehicles}
                          />
                          {transportData.vehicle_id && !vehicles.some((v) => v.id === transportData.vehicle_id) && (
                            <div className="mt-4 space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600">Vehicle Model</label>
                                <input
                                  type="text"
                                  value={newEntryData.vehicle_model}
                                  onChange={(e) => handleNewEntryChange("vehicle_model", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                  placeholder="Enter Vehicle Model"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600">Vehicle Number</label>
                                <input
                                  type="text"
                                  value={newEntryData.vehicle_number}
                                  onChange={(e) => handleNewEntryChange("vehicle_number", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                  placeholder="Enter Vehicle Number"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Driver</label>
                          <SearchableDropdown
                            options={drivers}
                            selectedValue={transportData.driver_id}
                            onSelect={(value) => handleTransportChange("driver_id", value)}
                            placeholder="Select Driver"
                            searchKeys={["driver_name", "driver_mobile"]}
                            loading={loading.drivers}
                          />
                          {transportData.driver_id && !drivers.some((d) => d.id === transportData.driver_id) && (
                            <div className="mt-4 space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-600">Driver Mobile</label>
                                <input
                                  type="text"
                                  value={newEntryData.driver_mobile}
                                  onChange={(e) => handleNewEntryChange("driver_mobile", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                  placeholder="Enter Driver Mobile"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-600">Driver Address</label>
                                <input
                                  type="text"
                                  value={newEntryData.driver_address}
                                  onChange={(e) => handleNewEntryChange("driver_address", e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                  placeholder="Enter Driver Address"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Destination</label>
                          <input
                            type="text"
                            value={transportData.destination}
                            onChange={(e) => handleTransportChange("destination", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter Destination"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {!isOwnVehicle && (
                            <div>
                              <label className="block text-sm font-medium text-gray-600">Booking Expense</label>
                              <input
                                type="number"
                                value={transportData.booking_expense}
                                onChange={(e) => handleTransportChange("booking_expense", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                                placeholder="Enter Booking Expense"
                                step="0.01"
                                min="0"
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-600">Travel Expense</label>
                            <input
                              type="number"
                              value={transportData.travel_expense}
                              onChange={(e) => handleTransportChange("travel_expense", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                              placeholder="Enter Travel Expense"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      onClick={() => setIsTransportModalOpen(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDispatchSubmit}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium flex items-center"
                      disabled={loading.submitting}
                    >
                      {loading.submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Dispatching...
                        </>
                      ) : (
                        <>
                          <Truck className="h-5 w-5 mr-2" />
                          Dispatch Material
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
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

export default SupplyMaterialDispatch;
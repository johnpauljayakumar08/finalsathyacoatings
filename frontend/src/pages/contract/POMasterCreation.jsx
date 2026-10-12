import { API_BASE_URL } from "../../config/api.js";
// src/pages/contract/POMasterCreation.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Component imports
import HeaderSection from "../../components/POComponents/HeaderSection";
import SitesList from "../../components/POComponents/SitesList";
import ReckonerForm from "../../components/POComponents/ReckonerForm";
import LoadingAndEmptyStates from "../../components/POComponents/LoadingAndEmptyStates";

// Utility functions
const getRandomColor = (index) => {
  const colors = [
    "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
    "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
    "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200",
    "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200",
    "bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200",
    "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200",
    "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200",
    "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200",
    "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200",
    "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200",
  ];
  return colors[index % colors.length];
};

const initialFormData = {
  poNumber: "",
  siteId: "",
  categories: [
    {
      categoryName: "",
      categoryId: "",
      items: [
        {
          itemNo: "",
          descId: "",
          descName: "",
          subcategories: [],
          poQuantity: "",
          unitOfMeasure: "",
          rate: "",
          value: "",
        },
      ],
    },
  ],
};

const POMasterCreation = ({
  onShowCompanyModal,
  onShowProjectModal,
  selectedCompany,
  onCompanySelect,
  companies,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [sites, setSites] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(selectedCompany || "");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [inchargeTypes, setInchargeTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [reckonerTypes, setReckonerTypes] = useState([]);
  const [newSubcategory, setNewSubcategory] = useState("");
  const [loading, setLoading] = useState({
    companies: false,
    sites: false,
    categories: false,
    subcategories: false,
    workItems: false,
    inchargeTypes: false,
    locations: false,
    reckonerTypes: false,
    submitting: false,
    processing: false,
  });
  const [openCategories, setOpenCategories] = useState({ 0: true });
  const [expandedSite, setExpandedSite] = useState(null);
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [creatingReckonerSiteId, setCreatingReckonerSiteId] = useState(null);
  const [siteReckonerData, setSiteReckonerData] = useState({});
  const [editSiteData, setEditSiteData] = useState({
    site_name: "",
    po_number: "",
    start_date: "",
    end_date: "",
    incharge_id: "",
    location_id: "",
    reckoner_type_id: "",
    incharge_type: "",
    location_name: "",
    type_name: "",
  });

  useEffect(() => {
    setSelectedCompanyId(selectedCompany || "");
    
    // Reset form and related states when selectedCompany prop changes
    if (selectedCompany !== selectedCompanyId) {
      setFormData({ ...initialFormData });
      setSites([]);
      setSiteReckonerData({});
      setExpandedSite(null);
      setEditingSiteId(null);
      setCreatingReckonerSiteId(null);
      setOpenCategories({ 0: true });
    }
  }, [selectedCompany]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading((prev) => ({ ...prev, inchargeTypes: true }));
        const inchargeResponse = await axios.get(`${API_BASE_URL}/reckoner/incharge-types`);
        setInchargeTypes(
          inchargeResponse.data.data.map((item) => ({
            id: item.incharge_id,
            name: item.incharge_type,
          }))
        );

        setLoading((prev) => ({ ...prev, locations: true }));
        const locationResponse = await axios.get(`${API_BASE_URL}/reckoner/locations`);
        setLocations(
          locationResponse.data.data.map((item) => ({
            id: item.location_id,
            name: item.location_name,
          }))
        );

        setLoading((prev) => ({ ...prev, reckonerTypes: true }));
        const reckonerTypeResponse = await axios.get(`${API_BASE_URL}/reckoner/reckoner-types`);
        setReckonerTypes(
          reckonerTypeResponse.data.data.map((item) => ({
            id: item.type_id,
            name: item.type_name,
          }))
        );
      } catch (err) {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to load dropdown data",
          text: err.response?.data?.message || "Please try again later",
          showConfirmButton: false,
          timer: 3000,
          toast: true,
          background: "#fef2f2",
          iconColor: "#ef4444",
        });
      } finally {
        setLoading((prev) => ({
          ...prev,
          inchargeTypes: false,
          locations: false,
          reckonerTypes: false,
        }));
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      const fetchSites = async () => {
        try {
          setLoading((prev) => ({ ...prev, sites: true }));
          const response = await axios.get(
            `${API_BASE_URL}/reckoner/sites-by-company/${selectedCompanyId}`
          );
          const sitesData = response.data.data || [];
          setSites(sitesData);

          const siteReckonerPromises = sitesData.map(async (site) => {
            try {
              const reckonerResponse = await axios.get(
                `${API_BASE_URL}/reckoner/site-reckoner/${site.site_id}`
              );
              return { siteId: site.site_id, data: reckonerResponse.data.data || [] };
            } catch (err) {
              console.error(`Failed to fetch reckoner data for site ${site.site_id}:`, err);
              return { siteId: site.site_id, data: [] };
            }
          });

          const reckonerResults = await Promise.all(siteReckonerPromises);
          // const reckonerDataMap = reckonerResults.reduce((acc, { siteId, data }) => {
          //   acc[siteId] = data;
          //   return acc;
          // }, {});

          const reckonerDataMap = reckonerResults.reduce((acc, { siteId, data }) => {
              const isDuplicate = (item, index, array) => {
                return array.findIndex((otherItem, otherIndex) =>
                  otherIndex < index &&
                  otherItem.category_name.toLowerCase() === item.category_name.toLowerCase() &&
                  otherItem.desc_name.toLowerCase() === item.desc_name.toLowerCase()
                ) !== -1;
              };

              // filter out duplicates
              const uniqueData = data.filter((item, index, array) => !isDuplicate(item, index, array));

              acc[siteId] = uniqueData;
              return acc;
            }, {});

            console.log("Fetched site reckoner data:", reckonerDataMap);

          console.log("Fetched site reckoner data:", reckonerDataMap);

          setSiteReckonerData(reckonerDataMap);
        } catch (err) {
          Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Failed to load sites",
            text: err.response?.data?.message || "Please try again later",
            showConfirmButton: false,
            timer: 3000,
            toast: true,
            background: "#fef2f2",
            iconColor: "#ef4444",
          });
        } finally {
          setLoading((prev) => ({ ...prev, sites: false }));
        }
      };
      fetchSites();
    } else {
      setSites([]);
      setSiteReckonerData({});
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => ({ ...prev, categories: true }));
        const categoriesRes = await axios.get(`${API_BASE_URL}/reckoner/categories`);
        setCategories(categoriesRes.data.data || []);

        setLoading((prev) => ({ ...prev, subcategories: true }));
        const subcategoriesRes = await axios.get(`${API_BASE_URL}/reckoner/subcategories`);
        setSubcategories(subcategoriesRes.data.data || []);

        setLoading((prev) => ({ ...prev, workItems: true }));
        const workItemsRes = await axios.get(`${API_BASE_URL}/reckoner/work-items`);
        setWorkItems(workItemsRes.data.data || []);
      } catch (err) {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "Failed to load data",
          text: err.response?.data?.message || "Please try again later",
          showConfirmButton: false,
          timer: 3000,
          toast: true,
          background: "#fef2f2",
          iconColor: "#ef4444",
        });
      } finally {
        setLoading((prev) => ({
          ...prev,
          categories: false,
          subcategories: false,
          workItems: false,
        }));
      }
    };
    fetchData();
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const handleEditSiteChange = (e) => {
    const { name, value } = e.target;
    setEditSiteData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownChange = (fieldName, fieldId, value, id) => {
    setEditSiteData((prev) => ({
      ...prev,
      [fieldName]: value,
      [fieldId]: id,
    }));
  };

  const handleEditSite = (siteId) => {
    const site = sites.find((s) => s.site_id === siteId);
    if (site) {
      setEditSiteData({
        site_name: site.site_name || "",
        po_number: site.po_number || "",
        start_date: site.start_date || "",
        end_date: site.end_date || "",
        incharge_id: site.incharge_id || "",
        location_id: site.location_id || "",
        reckoner_type_id: site.reckoner_type_id || "",
        incharge_type: site.incharge_type || "",
        location_name: site.location_name || "",
        type_name: site.type_name || "",
      });
      setEditingSiteId(siteId);
    }
  };

  const handleUpdateSite = async (siteId) => {
    try {
      setLoading((prev) => ({ ...prev, submitting: true }));

      const updateData = {
        site_name: editSiteData.site_name,
        po_number: editSiteData.po_number,
        start_date: editSiteData.start_date,
        end_date: editSiteData.end_date,
        incharge_id: editSiteData.incharge_id,
        location_id: editSiteData.location_id,
        reckoner_type_id: editSiteData.reckoner_type_id,
      };

      await axios.put(`${API_BASE_URL}/reckoner/sites/${siteId}`, updateData);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Site updated successfully!",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      const response = await axios.get(
        `${API_BASE_URL}/reckoner/sites-by-company/${selectedCompanyId}`
      );
      setSites(response.data.data || []);
      setEditingSiteId(null);
    } catch (err) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Failed to update site",
        text: err.response?.data?.message || "Please try again",
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        background: "#fef2f2",
        iconColor: "#ef4444",
      });
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleCompanyChange = (value) => {
    // Reset all related states when company changes
    setSelectedCompanyId(value);
    setFormData({ ...initialFormData });
    setSites([]);
    setSiteReckonerData({});
    setExpandedSite(null);
    setEditingSiteId(null);
    setCreatingReckonerSiteId(null);
    setOpenCategories({ 0: true });

    // Save to localStorage
    if (value) {
      localStorage.setItem("selectedCompanyId", value);
    } else {
      localStorage.removeItem("selectedCompanyId");
    }

    // Call parent callback if provided
    if (onCompanySelect) {
      onCompanySelect(value);
    }
  };

  const handleToggleSite = (siteId) => {
    const isExpanding = expandedSite !== siteId;
    setExpandedSite(isExpanding ? siteId : null);
    if (!isExpanding) {
      setEditingSiteId(null);
      setCreatingReckonerSiteId(null);
    }
  };

  const handleCreateReckoner = (siteId) => {
    const site = sites.find((s) => s.site_id === siteId);
    if (site) {
      setFormData({ ...initialFormData, poNumber: site.po_number, siteId: site.site_id });
      setCreatingReckonerSiteId(siteId);
      setOpenCategories({ 0: true });
    }
  };

  const handleCategoryChange = (categoryIndex, value) => {
    const selectedCategory = categories.find((cat) => cat.category_name === value);

    setFormData((prev) => {
      const newCategories = [...prev.categories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        categoryName: value,
        categoryId: selectedCategory?.category_id || "",
        items: [
          {
            itemNo: "",
            descId: "",
            descName: "",
            subcategories: [],
            poQuantity: "",
            unitOfMeasure: "",
            rate: "",
            value: "",
          },
        ],
      };
      return { ...prev, categories: newCategories };
    });
  };

  const handleCreateCategory = async (categoryName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reckoner/categories`, {
        category_name: categoryName,
      });
      const newCategory = response.data.data;
      setCategories((prev) => [...prev, newCategory]);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Category created successfully!",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });
      return newCategory;
    } catch (err) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Failed to create category",
        text: err.response?.data?.message || "Please try again",
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        background: "#fef2f2",
        iconColor: "#ef4444",
      });
      throw err;
    }
  };

  // Splits a rate equally among `count` parts.
// Supports decimals. Any leftover remainder is added to the LAST part.
const splitRateEqually = (rate, count) => {
  const totalRate = parseFloat(rate) || 0;
  if (count <= 0) return [];

  const baseShare = Math.floor((totalRate / count) * 100) / 100; // round down to 2 decimals
  const shares = new Array(count).fill(baseShare);

  const distributed = baseShare * count;
  const remainder = Math.round((totalRate - distributed) * 100) / 100;

  shares[count - 1] = Math.round((shares[count - 1] + remainder) * 100) / 100;

  return shares;
};
 const handleItemDescriptionChange = (categoryIndex, itemIndex, value) => {
    const selectedItem = workItems.find((item) => item.desc_name === value);

    setFormData((prev) => {
      const newCategories = [...prev.categories];
      const newItems = [...newCategories[categoryIndex].items];
      const item = newItems[itemIndex];

      const defaultCount = subcategories.length >= 2 ? 2 : subcategories.length;
      const shares = splitRateEqually(item.rate, defaultCount);

      const defaultSubcategories = subcategories
        .slice(0, 2)
        .map((subcat, idx) => ({
          subcategoryId: subcat.subcategory_id,
          subcategoryName: subcat.subcategory_name,
          poQuantity: item.poQuantity || "0",
          rate: (shares[idx] ?? 0).toString(),
          value: ((parseFloat(item.poQuantity) || 0) * (shares[idx] ?? 0)).toFixed(2),
        }));

      newItems[itemIndex] = {
        ...item,
        descName: value,
        descId: selectedItem?.desc_id || "",
        unitOfMeasure: selectedItem?.unit_of_measure || "",
        subcategories: defaultSubcategories,
      };
      newCategories[categoryIndex].items = newItems;
      return { ...prev, categories: newCategories };
    });
  };

  const handleCreateWorkItem = async (descName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reckoner/work-items`, {
        desc_name: descName,
      });
      const newWorkItem = response.data.data;
      setWorkItems((prev) => [...prev, newWorkItem]);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Work item created successfully!",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });
      return newWorkItem;
    } catch (err) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Failed to create work item",
        text: err.response?.data?.message || "Please try again",
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        background: "#fef2f2",
        iconColor: "#ef4444",
      });
      throw err;
    }
  };

const handleSubcategorySelection = (categoryIndex, itemIndex, subcategoryId, checked) => {
    setFormData((prev) => {
      const newCategories = [...prev.categories];
      const newItems = [...newCategories[categoryIndex].items];
      const item = newItems[itemIndex];

      let updatedSubcategories;
      if (checked) {
        const subcat = subcategories.find((sc) => sc.subcategory_id === subcategoryId);
        if (!subcat) return prev;

        updatedSubcategories = [
          ...item.subcategories,
          {
            subcategoryId: subcat.subcategory_id,
            subcategoryName: subcat.subcategory_name,
            poQuantity: item.poQuantity || "0",
            rate: "0",
            value: "0.00",
          },
        ];
      } else {
        updatedSubcategories = item.subcategories.filter(
          (sc) => sc.subcategoryId !== subcategoryId
        );
      }

      const shares = splitRateEqually(item.rate, updatedSubcategories.length);
      updatedSubcategories = updatedSubcategories.map((subcat, idx) => ({
        ...subcat,
        rate: (shares[idx] ?? 0).toString(),
        value: ((parseFloat(item.poQuantity) || 0) * (shares[idx] ?? 0)).toFixed(2),
        edited: false,
      }));

      newItems[itemIndex] = {
        ...item,
        subcategories: updatedSubcategories,
      };

      newCategories[categoryIndex].items = newItems;
      return { ...prev, categories: newCategories };
    });
  };

  const handleCreateSubcategory = async (categoryIndex, itemIndex) => {
    if (!newSubcategory) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/reckoner/subcategories`, {
        subcategory_name: newSubcategory,
      });
      const newSubcat = response.data.data;
      setSubcategories((prev) => [...prev, newSubcat]);
      setNewSubcategory("");
      handleSubcategorySelection(categoryIndex, itemIndex, newSubcat.subcategory_id, true);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Subcategory created successfully!",
        showConfirmButton: false,
        timer: 2000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });
    } catch (err) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Failed to create subcategory",
        text: err.response?.data?.message || "Please try again",
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        background: "#fef2f2",
        iconColor: "#ef4444",
      });
    }
  };

const handleItemChange = (categoryIndex, itemIndex, e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newCategories = [...prev.categories];
      const newItems = [...newCategories[categoryIndex].items];
      const item = newItems[itemIndex];

      newItems[itemIndex] = {
        ...item,
        [name]: value,
      };

      if (name === "poQuantity" || name === "rate") {
        const quantity = name === "poQuantity" ? parseFloat(value) || 0 : parseFloat(item.poQuantity) || 0;
        const rate = name === "rate" ? parseFloat(value) || 0 : parseFloat(item.rate) || 0;

        const shares = splitRateEqually(rate, item.subcategories.length);
        const updatedSubcategories = item.subcategories.map((subcat, idx) => ({
          ...subcat,
          poQuantity: quantity.toString(),
          rate: (shares[idx] ?? 0).toString(),
          value: (quantity * (shares[idx] ?? 0)).toFixed(2),
          edited: false,
        }));

        newItems[itemIndex] = {
          ...newItems[itemIndex],
          rate: rate.toString(),
          subcategories: updatedSubcategories,
          value: (quantity * rate).toFixed(2),
        };
      }

      newCategories[categoryIndex].items = newItems;
      return { ...prev, categories: newCategories };
    });
  };

const handleSubcategoryRateChange = (categoryIndex, itemIndex, subcategoryIndex, e) => {
    const { value } = e.target;
    const newRate = parseFloat(value) || 0;

    setFormData((prev) => {
      const newCategories = [...prev.categories];
      const newItems = [...newCategories[categoryIndex].items];
      const item = newItems[itemIndex];
      const updatedSubcategories = [...item.subcategories];

      updatedSubcategories[subcategoryIndex] = {
        ...updatedSubcategories[subcategoryIndex],
        rate: newRate.toString(),
        value: ((parseFloat(item.poQuantity) || 0) * newRate).toFixed(2),
        edited: true,
      };

      const itemRate = parseFloat(item.rate) || 0;
      const currentTotal = updatedSubcategories.reduce(
        (sum, subcat) => sum + (parseFloat(subcat.rate) || 0),
        0
      );

      let diff = Math.round((itemRate - currentTotal) * 100) / 100;

      if (diff !== 0) {
        let adjusted = false;
        for (let i = updatedSubcategories.length - 1; i >= 0; i--) {
          if (i !== subcategoryIndex) {
            const newAdjustedRate = Math.round(
              ((parseFloat(updatedSubcategories[i].rate) || 0) + diff) * 100
            ) / 100;
            updatedSubcategories[i] = {
              ...updatedSubcategories[i],
              rate: newAdjustedRate.toString(),
              value: ((parseFloat(item.poQuantity) || 0) * newAdjustedRate).toFixed(2),
            };
            adjusted = true;
            break;
          }
        }

        if (!adjusted) {
          const newAdjustedRate = Math.round((newRate + diff) * 100) / 100;
          updatedSubcategories[subcategoryIndex] = {
            ...updatedSubcategories[subcategoryIndex],
            rate: newAdjustedRate.toString(),
            value: ((parseFloat(item.poQuantity) || 0) * newAdjustedRate).toFixed(2),
          };
        }
      }

      newItems[itemIndex] = {
        ...item,
        subcategories: updatedSubcategories,
        value: ((parseFloat(item.poQuantity) || 0) * itemRate).toFixed(2),
      };

      newCategories[categoryIndex].items = newItems;
      return { ...prev, categories: newCategories };
    });
  };

  const isSubmitDisabled = () => {
    if (!formData.siteId || loading.submitting || loading.processing) {
      return true;
    }
    for (const category of formData.categories) {
      if (!category.categoryId) {
        return true;
      }
      for (const item of category.items) {
        if (
          !item.itemNo ||
          !item.descId ||
          !item.descName ||
          item.subcategories.length === 0 ||
          !item.poQuantity ||
          !item.unitOfMeasure ||
          !item.rate
        ) {
          return true;
        }
        const itemRateInCents = Math.round((parseFloat(item.rate) || 0) * 100);
        const totalSubcategoryRateInCents = item.subcategories.reduce(
          (sum, subcat) => sum + Math.round((parseFloat(subcat.rate) || 0) * 100),
          0
        );
        if (totalSubcategoryRateInCents !== itemRateInCents) {
          return true;
        }
      }
    }
    return false;
  };

  const addCategory = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newCategoryIndex = formData.categories.length;
    setFormData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          categoryName: "",
          categoryId: "",
          items: [
            {
              itemNo: "",
              descId: "",
              descName: "",
              subcategories: [],
              poQuantity: "",
              unitOfMeasure: "",
              rate: "",
              value: "",
            },
          ],
        },
      ],
    }));
    setOpenCategories((prev) => ({ ...prev, [newCategoryIndex]: true }));
  };

  const removeCategory = (index) => {
    if (formData.categories.length > 1) {
      setFormData((prev) => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index),
      }));
      setOpenCategories((prev) => {
        const newOpenCategories = { ...prev };
        delete newOpenCategories[index];
        const updatedOpenCategories = {};
        Object.keys(newOpenCategories).forEach((key) => {
          const numKey = parseInt(key);
          if (numKey > index) {
            updatedOpenCategories[numKey - 1] = newOpenCategories[key];
          } else {
            updatedOpenCategories[numKey] = newOpenCategories[key];
          }
        });
        return updatedOpenCategories;
      });
    }
  };

  const addItemRow = (categoryIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData((prev) => {
      const newCategories = [...prev.categories];
      newCategories[categoryIndex].items = [
        ...newCategories[categoryIndex].items,
        {
          itemNo: "",
          descId: "",
          descName: "",
          subcategories: [],
          poQuantity: "",
          unitOfMeasure: "",
          rate: "",
          value: "",
        },
      ];
      return { ...prev, categories: newCategories };
    });
  };

  const removeItemRow = (categoryIndex, itemIndex) => {
    if (formData.categories[categoryIndex].items.length > 1) {
      setFormData((prev) => {
        const newCategories = [...prev.categories];
        newCategories[categoryIndex].items = newCategories[categoryIndex].items.filter(
          (_, i) => i !== itemIndex
        );
        return { ...prev, categories: newCategories };
      });
    }
  };

  const toggleCategory = (index) => {
    setOpenCategories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const processSite = async (poNumber) => {
    try {
      setLoading((prev) => ({ ...prev, processing: true }));
      await axios.get(`${API_BASE_URL}/sheet/process/${encodeURIComponent(poNumber)}`);
      return true;
    } catch (error) {
      console.error("Error processing site:", error);
      return false;
    } finally {
      setLoading((prev) => ({ ...prev, processing: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading((prev) => ({ ...prev, submitting: true }));

      if (!formData.siteId) {
        throw new Error("Please select a site.");
      }
      for (const category of formData.categories) {
        if (!category.categoryId) {
          throw new Error("All categories must be selected.");
        }
        for (const item of category.items) {
          if (
            !item.itemNo ||
            !item.descId ||
            !item.descName ||
            item.subcategories.length === 0 ||
            !item.poQuantity ||
            !item.unitOfMeasure ||
            !item.rate
          ) {
            throw new Error("All item fields must be filled and at least one subcategory selected.");
          }
        }
      }

      const submissionData = {
        poNumber: formData.poNumber,
        siteId: formData.siteId,
        categories: formData.categories.map((category) => {
          const subcategoryMap = {};

          category.items.forEach((item) => {
            item.subcategories.forEach((subcat) => {
              if (!subcategoryMap[subcat.subcategoryId]) {
                subcategoryMap[subcat.subcategoryId] = {
                  subcategoryId: subcat.subcategoryId,
                  items: [],
                };
              }
              subcategoryMap[subcat.subcategoryId].items.push({
                itemId: item.itemNo,
                descId: item.descId,
                poQuantity: subcat.poQuantity,
                uom: item.unitOfMeasure,
                rate: subcat.rate,
                value: subcat.value,
              });
            });
          });

          return {
            categoryId: category.categoryId,
            subcategories: Object.values(subcategoryMap),
          };
        }),
      };

      await axios.post(`${API_BASE_URL}/reckoner/reckoner`, submissionData);
      await processSite(formData.poNumber);

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Reckoner created successfully!",
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        background: "#ecfdf5",
        iconColor: "#10b981",
      });

      setFormData(initialFormData);
      setCreatingReckonerSiteId(null);
      setOpenCategories({ 0: true });

      const response = await axios.get(
        `${API_BASE_URL}/reckoner/sites-by-company/${selectedCompanyId}`
      );
      const sitesData = response.data.data || [];
      setSites(sitesData);

      const siteReckonerPromises = sitesData.map(async (site) => {
        try {
          const reckonerResponse = await axios.get(
            `${API_BASE_URL}/reckoner/site-reckoner/${site.site_id}`
          );
          return { siteId: site.site_id, data: reckonerResponse.data.data || [] };
        } catch (err) {
          console.error(`Failed to fetch reckoner data for site ${site.site_id}:`, err);
          return { siteId: site.site_id, data: [] };
        }
      });

      const reckonerResults = await Promise.all(siteReckonerPromises);
      const reckonerDataMap = reckonerResults.reduce((acc, { siteId, data }) => {
        acc[siteId] = data;
        return acc;
      }, {});
      setSiteReckonerData(reckonerDataMap);
    } catch (err) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Submission failed",
        text: err.message || err.response?.data?.message || "Please try again",
        showConfirmButton: false,
        timer: 3000,
        toast: true,
        background: "#fef2f2",
        iconColor: "#ef4444",
      });
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <HeaderSection
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          handleCompanyChange={handleCompanyChange}
          onShowProjectModal={onShowProjectModal}
          loading={loading}
        />

        {/* Sites Section */}
        <SitesList
          selectedCompanyId={selectedCompanyId}
          sites={sites}
          expandedSite={expandedSite}
          handleToggleSite={handleToggleSite}
          editingSiteId={editingSiteId}
          editSiteData={editSiteData}
          handleEditSiteChange={handleEditSiteChange}
          handleDropdownChange={handleDropdownChange}
          inchargeTypes={inchargeTypes}
          locations={locations}
          reckonerTypes={reckonerTypes}
          loading={loading}
          handleUpdateSite={handleUpdateSite}
          setEditingSiteId={setEditingSiteId}
          handleEditSite={handleEditSite}
          siteReckonerData={siteReckonerData}
          creatingReckonerSiteId={creatingReckonerSiteId}
          handleCreateReckoner={handleCreateReckoner}
        >
          {creatingReckonerSiteId && (
            <ReckonerForm
              formData={formData}
              handleSubmit={handleSubmit}
              categories={categories}
              handleCategoryChange={handleCategoryChange}
              handleCreateCategory={handleCreateCategory}
              removeCategory={removeCategory}
              addCategory={addCategory}
              toggleCategory={toggleCategory}
              openCategories={openCategories}
              workItems={workItems}
              handleItemChange={handleItemChange}
              handleItemDescriptionChange={handleItemDescriptionChange}
              handleCreateWorkItem={handleCreateWorkItem}
              removeItemRow={removeItemRow}
              addItemRow={addItemRow}
              subcategories={subcategories}
              handleSubcategorySelection={handleSubcategorySelection}
              newSubcategory={newSubcategory}
              setNewSubcategory={setNewSubcategory}
              handleCreateSubcategory={handleCreateSubcategory}
              handleSubcategoryRateChange={handleSubcategoryRateChange}
              loading={loading}
              getRandomColor={getRandomColor}
              isSubmitDisabled={isSubmitDisabled}
              setCreatingReckonerSiteId={setCreatingReckonerSiteId}
            />
          )}
        </SitesList>

        {/* Loading and Empty States */}
        <LoadingAndEmptyStates
          loading={loading}
          selectedCompanyId={selectedCompanyId}
          sitesLength={sites.length}
        />
      </div>
    </div>
  );
};

export default POMasterCreation;
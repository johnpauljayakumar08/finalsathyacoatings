// supplyRoutes.js
const express = require("express");
const router = express.Router();
const supplyController = require("../controllers/supplyController");

router.get("/test", supplyController.test);

router.post("/assign-material", supplyController.assignMaterial);
router.get("/assigned-materials", supplyController.getAssignedMaterials);


// New routes for supply company management
router.post("/create-company", supplyController.createSupplyCompany);
router.get("/companies", supplyController.getAllSupplyCompanies);
router.get("/companies/:companyId", supplyController.getSupplyCompanyById);
router.get("/states", supplyController.getStates);
router.get("/cities", supplyController.getCities);
router.post("/create-state", supplyController.createState);
router.post("/create-city", supplyController.createCity);

// Routes for supply project and site management
router.post("/create-project", supplyController.createSupplyProject);
router.get("/projects/:companyId", supplyController.getSupplyProjectsByCompany);
router.post("/create-site", supplyController.createSupplySite);
router.get("/sites-by-company/:companyId", supplyController.getSupplySitesByCompany);
router.get("/locations", supplyController.getLocations);
router.post("/create-location", supplyController.createLocation);
router.get("/reckoner-types", supplyController.getReckonerTypes);



// Supply Dispatch Routes
router.post("/add-supply-dispatch", supplyController.addSupplyMaterialDispatch);
router.get("/supply-assignments-with-dispatch", supplyController.fetchSupplyMaterialAssignmentsWithDispatch);
router.get("/next-supply-dc-no", supplyController.getNextSupplyDcNo);
router.get("/supply-dispatch-details", supplyController.fetchSupplyMaterialDispatchDetails);

// Transport Routes for Supply
router.get("/supply-transport-types", supplyController.getSupplyTransportTypes);
router.get("/supply-providers", supplyController.getSupplyProviders);
router.get("/supply-vehicles", supplyController.getSupplyVehicles);
router.get("/supply-drivers", supplyController.getSupplyDrivers);


// New routes for supply_master_dc_no
router.get('/master-dc-no', supplyController.getMasterDcNo);
router.post('/master-dc-no', supplyController.saveMasterDcNo);
router.get('/supply-dispatch-details', supplyController.fetchSupplyMaterialDispatchDetails);
module.exports = router;
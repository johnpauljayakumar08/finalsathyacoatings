// const express = require("express");
// const router = express.Router();
// const projectController = require("../controllers/projectController");

// router.post("/create-company", projectController.createCompany);
// router.get("/companies", projectController.getAllCompanies);
// router.get("/companies/:companyId", projectController.getCompanyById);
// router.get("/projects/:companyId", projectController.getProjectsByCompanyId);
// router.post("/create-project-site", projectController.createProjectWithSite);
// router.get("/workforce-types", projectController.fetchWorkforceTypes);
// router.get("/site-incharges", projectController.fetchSiteIncharges);
// router.get("/project-type", projectController.projectType);
// router.get("/projects-with-sites", projectController.getAllProjectsWithSites);
// router.get("/projects-with-sites/:companyId", projectController.getAllProjectsWithSitesByCompanyId);
// router.get("/locations", projectController.getAllLocations);
// router.post("/create-project", projectController.createProject);
// router.get("/reckoner-types", projectController.getReckonerTypes);
// router.get("/next-po-number/:reckoner_type_id", projectController.getNextPoNumber);
// router.get("/states", projectController.getStates);
// router.get("/cities", projectController.getCities);
// router.post("/create-state", projectController.createState);
// router.post("/create-city", projectController.createCity);
// router.get("/work-descriptions-by-site/:site_id", projectController.getWorkDescriptionsBySite);
// router.put("/companies", projectController.updateCompany);





// module.exports = router;

















const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.post("/create-company", projectController.createCompany);
router.get("/companies", projectController.getAllCompanies);
router.get("/companies/:companyId", projectController.getCompanyById);
router.get("/projects/:companyId", projectController.getProjectsByCompanyId);
router.post("/create-project-site", projectController.createProjectWithSite);
router.get("/workforce-types", projectController.fetchWorkforceTypes);
router.get("/site-incharges", projectController.fetchSiteIncharges);
router.get("/project-type", projectController.projectType);
router.get("/projects-with-sites", projectController.getAllProjectsWithSites);
router.get("/projects-with-sites/:companyId", projectController.getAllProjectsWithSitesByCompanyId);
router.get("/locations", projectController.getAllLocations);
router.post("/create-project", projectController.createProject);
router.get("/reckoner-types", projectController.getReckonerTypes);
router.get("/next-po-number/:reckoner_type_id", projectController.getNextPoNumber);
router.get("/states", projectController.getStates);
router.get("/cities", projectController.getCities);
router.post("/create-state", projectController.createState);
router.post("/create-city", projectController.createCity);
router.get("/work-descriptions-by-site/:site_id", projectController.getWorkDescriptionsBySite);
router.put("/companies", projectController.updateCompany);
router.put("/update-site/:siteId", projectController.updateSite);
router.put("/update-project/:pdId", projectController.updateProject);

module.exports = router;
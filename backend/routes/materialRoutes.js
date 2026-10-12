                const express = require("express");
                const router = express.Router();
                const materialController = require("../controllers/materialController");

                router.get("/test", materialController.test);
                router.post("/dispatch-material", materialController.dispatchMaterialToSite);
                router.get("/materials", materialController.fetchMaterialMaster);
                router.get("/projects", materialController.fetchProjects);
                router.get("/sites/:pd_id", materialController.fetchSites);
                router.get("/material-assignments", materialController.fetchMaterialAssignments);
                router.get("/uom", materialController.fetchUomMaster);
                router.get("/designations", materialController.fetchDesignations);
                router.get("/employees", materialController.fetchEmployees);
                router.post("/assign-incharge", materialController.assignInchargeToSite);
                router.post("/add-employee", materialController.addEmployee);
                router.get("/assigned-incharges", materialController.getAssignedIncharges);
                router.get("/genders", materialController.fetchGenders);
                router.get("/departments", materialController.fetchDepartments);
                router.get("/employment-types", materialController.fetchEmploymentTypes);
                router.post("/genders", materialController.addGender);
                router.post("/departments", materialController.addDepartment);
                router.post("/employment-types", materialController.addEmploymentType);
                router.post("/designations", materialController.addDesignation);
                router.get("/statuses", materialController.fetchStatuses);
                router.get('/assigned-materials', materialController.getAssignedMaterials);

                router.post("/assign-material", materialController.assignMaterial);
                router.get("/work-descriptions", materialController.fetchWorkDescriptions);

                router.get('/next-dc-no', materialController.getNextDcNo);


                router.post("/add-dispatch", materialController.addMaterialDispatch);
                router.get("/assignments-with-dispatch", materialController.fetchMaterialAssignmentsWithDispatch);
                router.get("/dispatch-details", materialController.fetchMaterialDispatchDetails);

                router.get("/transport-types", materialController.getTransportTypes);
                router.get("/providers", materialController.getProviders);
                router.post("/add-provider", materialController.addProvider);
                router.post("/add-vehicle", materialController.addVehicle);
                router.post("/add-driver", materialController.addDriver);
                router.post("/add-transport", materialController.addTransport);
                router.get("/vehicles", materialController.getVehicles);
                router.get("/drivers", materialController.getDrivers);

                router.get("/check-desc-assigned", materialController.checkDescAssigned);
        router.post("/add-material", materialController.addMaterial);
        router.get("/materials", materialController.getMaterials);

        router.get("/master-dc-no", materialController.getMasterDcNo);
        router.post("/master-dc-no", materialController.saveMasterDcNo);



// Updated routes to use query/body instead of params
router.get('/assigned-materialsbyid', materialController.getMaterialAssignmentById); // ?assignment_id=...
router.put('/assigned-materials', materialController.updateMaterialAssignment); // ID in body
router.delete('/assigned-materials', materialController.deleteMaterialAssignment); // ID in body
 module.exports = router;
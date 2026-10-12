// resurceRoutes.js
const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");

router.get("/test", resourceController.test);
router.get("/consumables", resourceController.getAllConsumables);

router.post('/consumables', resourceController.createConsumable);
router.post('/dispatches', resourceController.createDispatch);
router.get('/dispatches', resourceController.getDispatches);


module.exports = router;
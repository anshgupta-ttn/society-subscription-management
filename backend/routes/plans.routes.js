const express = require("express");

const router = express.Router();

const plans = require("../controllers/plans.controller");


router.get("/", plans.getPlans);

router.put("/:id", plans.updatePlan);


module.exports = router;
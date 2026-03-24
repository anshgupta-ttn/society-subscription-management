const express = require("express");

const router = express.Router();

const reports = require("../controllers/reports.controller");


router.get("/monthly", reports.getMonthlyReport);

router.get("/yearly", reports.getYearlyReport);


module.exports = router;
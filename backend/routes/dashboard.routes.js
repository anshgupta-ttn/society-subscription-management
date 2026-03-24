const express = require("express");
const router = express.Router();

const dashboard = require("../controllers/dashboard.controller");

router.get("/collection-rate", dashboard.getCollectionRate);
router.get("/transactions", dashboard.getTransactions);
router.get("/total-paid", dashboard.getTotalPaid);
router.get("/pending", dashboard.getPendingAmount);
router.get("/monthly-collection", dashboard.getMonthlyCollection);

module.exports = router;
const express = require("express");
const router = express.Router();
const residentController = require("../controllers/resident.controller");

router.post("/login", residentController.login);
router.post("/dashboard", residentController.getDashboard);
router.post("/subscriptions", residentController.getSubscriptions);
router.post("/subscriptions/:month", residentController.getSubscriptionByMonth);
router.put("/profile", residentController.updateProfile);
router.put("/change-password", residentController.changePassword);
router.post("/payment", residentController.createPayment);

module.exports = router;

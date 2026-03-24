const router = require("express").Router();

const monthlyController = require("../controllers/monthly.controller");


// get monthly records
router.get("/", monthlyController.getMonthly);

// generate records
router.post("/generate", monthlyController.generateMonthly);

// mark paid
router.put("/pay/:id", monthlyController.markPaid);

module.exports = router;
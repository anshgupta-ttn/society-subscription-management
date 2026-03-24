const router = require("express").Router();

const c = require("../controllers/payments.controller");

router.get("/flats", c.getFlats);

router.get("/amount/:flat_id", c.getAmount);

router.get("/pending/:flat_id", c.getPendingMonths);

router.get("/recent", c.getRecent);

router.post("/", c.addPayment);

module.exports = router;
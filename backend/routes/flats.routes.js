const express = require("express");
const router = express.Router();

const flats = require("../controllers/flats.controller");


router.get("/", flats.getFlats);

router.get("/count", flats.getTotalFlats);

router.post("/", flats.addFlat);

router.put("/:id", flats.updateFlat);

router.delete("/:id", flats.deleteFlat);


module.exports = router;
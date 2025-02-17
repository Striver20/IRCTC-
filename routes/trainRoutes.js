const express = require("express");
const router = express.Router();

const {
  addTrain,
  getTrains,
  updateTotalSeats,
} = require("../controllers/trainController");

const { verifyAdminAPIKey } = require("../middlewares/adminMiddleware");

// Admin-only routes
router.post("/admin/trains", verifyAdminAPIKey, addTrain);
router.put("/admin/trains/:id/seats", verifyAdminAPIKey, updateTotalSeats);

// Public/user route
router.get("/trains", getTrains);

module.exports = router;

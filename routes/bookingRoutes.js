const express = require("express");
const router = express.Router();
const {
  bookSeat,
  getBookingDetails,
} = require("../controllers/bookingController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/bookings", verifyToken, bookSeat);
router.get("/bookings/:id", verifyToken, getBookingDetails);

module.exports = router;

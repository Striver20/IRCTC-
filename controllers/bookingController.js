const pool = require("../models/db");

// This function uses transaction along with row-level locking to ensure that
// concurrent booking attempts for the same train are handled safely.
const bookSeat = async (req, res) => {
  const { train_id } = req.body;
  const user_id = req.user.id; // Extracted from JWT token

  // Validate the input: train_id must be provided.
  if (!train_id) {
    return res.status(400).send({ error: "train_id is required." });
  }

  const connection = await pool.getConnection(); // Get DB connection
  try {
    // Start a new transaction.
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT * FROM trains WHERE id = ? FOR UPDATE",
      [train_id]
    );

    // If no train is found, rollback the transaction and return an error.
    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).send({ error: "Train not found." });
    }

    // Retrieve the train record.
    const train = rows[0];

    // Check if any available seats.
    if (train.available_seats <= 0) {
      await connection.rollback();
      return res.status(400).send({ error: "No seats available." });
    }

    // Update the train's available seat count by decrementing by one.
    await connection.query(
      "UPDATE trains SET available_seats = available_seats - 1 WHERE id = ?",
      [train_id]
    );

    const [result] = await connection.query(
      "INSERT INTO bookings (user_id, train_id) VALUES (?, ?)",
      [user_id, train_id]
    );

    // Committed transaction to make all changes permanent.
    await connection.commit();

    return res.status(201).send({
      message: "Seat booked successfully.",
      booking_id: result.insertId,
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.log(err);
    return res.status(500).send({ error: "Booking error." });
  } finally {
    // Always release the connection back to the pool.
    if (connection) connection.release();
  }
};

// Get the details for a specific booking.
const getBookingDetails = async (req, res) => {
  try {
    // Extract booking ID from URL parameters and user ID from JWT payload.
    const bookingId = req.params.id;
    const user_id = req.user.id;

    // Execute query to fetch booking details by joining bookings and trains tables.
    const [rows] = await pool.query(
      "SELECT b.id, b.train_id, t.name, t.source, t.destination, b.created_at FROM bookings b JOIN trains t ON b.train_id = t.id WHERE b.id = ? AND b.user_id = ?",
      [bookingId, user_id]
    );

    // If no booking is found for the given ID and user, return an error.
    if (rows.length === 0) {
      return res.status(404).send({ error: "Booking not found." });
    }

    // Otherwise, return the booking details.
    return res.send({ booking: rows[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Database error." });
  }
};

module.exports = { bookSeat, getBookingDetails };

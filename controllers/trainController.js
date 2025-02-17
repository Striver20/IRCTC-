const pool = require("../models/db");

const addTrain = async (req, res) => {
  try {
    const { name, source, destination, total_seats } = req.body;
    if (!name || !source || !destination || !total_seats) {
      return res.status(400).send({
        error:
          "All fields are required: name, source, destination, total_seats",
      });
    }

    await pool.query(
      "INSERT INTO trains (name, source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?, ?)",
      [name, source, destination, total_seats, total_seats]
    );
    return res.status(201).send({ message: "Train added successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Database error." });
  }
};

const getTrains = async (req, res) => {
  try {
    const { source, destination } = req.query;
    if (!source || !destination) {
      return res.status(400).send({
        error: "source and destination query parameters are required.",
      });
    }
    const [rows] = await pool.query(
      "SELECT * FROM trains WHERE source = ? AND destination = ?",
      [source, destination]
    );
    return res.send({ trains: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Database error." });
  }
};

const updateTotalSeats = async (req, res) => {
  try {
    const trainId = req.params.id;
    const { total_seats } = req.body;

    if (total_seats === undefined) {
      return res.status(400).send({ error: "total_seats is required." });
    }
    if (typeof total_seats !== "number" || total_seats < 0) {
      return res
        .status(400)
        .send({ error: "total_seats must be a non-negative number." });
    }

    const [rows] = await pool.query("SELECT * FROM trains WHERE id = ?", [
      trainId,
    ]);
    if (rows.length === 0) {
      return res.status(404).send({ error: "Train not found." });
    }

    const train = rows[0];
    const bookedSeats = train.total_seats - train.available_seats;

    if (total_seats < bookedSeats) {
      return res.status(400).send({
        error: `Cannot set total_seats to ${total_seats} because ${bookedSeats} seats are already booked.`,
      });
    }

    const newAvailableSeats = total_seats - bookedSeats;

    await pool.query(
      "UPDATE trains SET total_seats = ?, available_seats = ? WHERE id = ?",
      [total_seats, newAvailableSeats, trainId]
    );

    return res
      .status(200)
      .send({ message: "Train seats updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Database error." });
  }
};

module.exports = {
  addTrain,
  getTrains,
  updateTotalSeats,
};

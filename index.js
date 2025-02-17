const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/authRoutes");
const trainRoutes = require("./routes/trainRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Routes
app.use("/api", authRoutes);
app.use("/api", trainRoutes);
app.use("/api", bookingRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const pool = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ error: "Username and password are required." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (rows.length > 0) {
      return res.status(400).send({ error: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, "user"]
    );

    return res.status(201).send({ message: "User registered successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Database error." });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ error: "Username and password are required." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (rows.length === 0) {
      return res.status(400).send({ error: "Invalid credentials." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.send({ message: "Login successful", token });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ error: "Database error." });
  }
};

module.exports = { register, login };

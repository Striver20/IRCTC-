const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).send({ error: "No token provided." });
    return;
  }
  // Expected header format: "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).send({ error: "Token format is Bearer <token>." });
    return;
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(401).send({ error: "Invalid token." });
    } else {
      req.user = decoded;
      next();
    }
  });
};

module.exports = { verifyToken };

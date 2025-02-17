const verifyAdminAPIKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "mysecretadminkey";
  if (apiKey !== ADMIN_API_KEY) {
    res.status(403).send({ error: "Forbidden. Invalid API key." });
  } else {
    next();
  }
};

module.exports = { verifyAdminAPIKey };

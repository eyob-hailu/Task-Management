const jwt = require("jsonwebtoken");
const User = require("./models/userModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;

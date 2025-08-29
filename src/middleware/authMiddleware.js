// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import your User model

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Use the User model to find the user by decoded userId
    const user = await User.findById(decoded.userId); // Mongoose query

    if (!user) {
      console.log("User not found for userId:", decoded.userId);
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Token verification failed:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

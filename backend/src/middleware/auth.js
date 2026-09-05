const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT (read from the httpOnly cookie) and attaches the user to req.user
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.sb_token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
};

// Restricts a route to one or more roles, e.g. authorize("recruiter")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `This action requires one of these roles: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

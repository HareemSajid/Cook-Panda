const jwt = require("jsonwebtoken");


// Middleware function to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Invalid Authorization format." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or Expired Token." });
    }
    req.user = user; // Attach user data (userId, role) to request
    next();
  });
}

// Middleware function to authorize roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    //console.log("Checking role:", req.user.role);
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access Denied. Insufficient permissions." });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };


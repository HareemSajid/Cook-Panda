require("dotenv").config();
const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJzdXBlcl9hZG1pbiIsInJvbGUiOiJzdXBlckFkbWluIiwiaWF0IjoxNzQzMTQ3NTcxLCJleHAiOjE3NDMxNTExNzF9.TRfc3fqw65UYIPz8ZPO7cFH7HExTZako5BQSVZji45o"; // Replace with your generated token

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded Token:", decoded);
} catch (error) {
  console.error("Token Verification Failed:", error.message);
}

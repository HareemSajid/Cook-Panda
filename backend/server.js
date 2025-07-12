require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sql = require("mssql");
//const authenticateToken = require("./middleware/auth")
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const restaurantAdminRoutes = require("./routes/restaurantAdminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const riderRoutes = require("./routes/riderRoutes");
const { authenticateToken, authorizeRoles } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;
const path =require('path');
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
    trustConnection: false,
    enableArithAbort: true,
  },
  authentication: {
    type: "default",
  },
  port: parseInt(process.env.DB_PORT, 10),
};
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use("/auth/", authRoutes);
// 
app.use("/admin",authenticateToken, authorizeRoles("superAdmin"), adminRoutes);

// app.use(
//   "/radmin",
//   authenticateToken,
//   authorizeRoles("restaurantAdmin"),
//   restaurantAdminRoutes
// );
 
app.use(
  "/radmin",
  authenticateToken,
  authorizeRoles("restaurantAdmin"),
  restaurantAdminRoutes
);
app.use(
  "/customer",
  authenticateToken,
  authorizeRoles("customer"),
  customerRoutes
);

app.use(
  "/rider",
  authenticateToken,
  authorizeRoles("deliveryWorker"),
  riderRoutes
);

app.get(
  "/users",
  authenticateToken, 
  authorizeRoles("superAdmin"),
  async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const customers = await pool.request().query("SELECT * FROM customers");
      const admins = await pool
        .request()
        .query("SELECT * FROM restaurantAdmins");
      const workers = await pool
        .request()
        .query("SELECT * FROM deliveryWorkers");

      res.json({
        customers: customers.recordset,
        restaurantAdmins: admins.recordset,
        deliveryWorkers: workers.recordset,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Database error" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

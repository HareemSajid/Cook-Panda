require("dotenv").config();

const bcrypt = require("bcrypt");
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
router.use(cors());

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
    trustConnection: false,
    //instancename: "SQLEXPRESS",
    enableArithAbort: true,
  },
  authentication: {
    type: "default",
  },
  port: parseInt(process.env.DB_PORT, 10),
};

// test
router.get("/", (req, res) => {
  res.json({ message: "Hello from Backend! I am Ahsan" });
});

router.post("/signup", async (req, res) => {
  const { userName, email, password, role } = req.body;

  if (!userName || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  }

  if (email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase()) {
    return res
      .status(403)
      .json({ message: "This email cannot be used to create an account" });
  }

  try {
    const pool = await sql.connect(config);

    const emailCheckQuery = `
        SELECT email FROM customers WHERE email=@email
        UNION 
        SELECT email FROM restaurantAdmins WHERE email=@email
        UNION
        SELECT email FROM deliveryWorkers WHERE email=@email
    `;

    const emailCheck = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query(emailCheckQuery);

    if (emailCheck.recordset.length > 0) {
      return res.status(400).json({ message: "Email Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    let query;
    if (role === "restaurantAdmin") {
      query = `
        INSERT INTO restaurantAdmins (userName, email, password, statusApprove)
        VALUES (@userName, @email, @password, 0);
      `;
    } else if (role === "deliveryWorker") {
      query = `
        INSERT INTO deliveryWorkers (userName, email, password, statusApprove)
        VALUES (@userName, @email, @password, 0);
      `;
    } else {
      query = `
        INSERT INTO customers (userName, email, password)
        VALUES (@userName, @email, @password);
      `;
    }

    await pool
      .request()
      .input("userName", sql.VarChar, userName)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .query(query);

    res.status(201).json({
      message: "User created",
      role: role || "customer",
      email: email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    let user;
    let restaurantId = null;

    if (
      email === process.env.SUPER_ADMIN_EMAIL &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      user = { id: "super_admin", role: "superAdmin" };
    } else {
      const pool = await sql.connect(config);

      const userQuery = `
        SELECT customerId as id, userName, email, password, 'customer' as role, 1 as statusApprove, disableBit, NULL as restaurantId 
        FROM customers WHERE email = @email
        UNION
        SELECT adminId as id, userName, email, password, 'restaurantAdmin' as role, ISNULL(statusApprove, 0) as statusApprove, disableBit, 
               (SELECT restaurantId FROM restaurants WHERE adminId = restaurantAdmins.adminId) as restaurantId
        FROM restaurantAdmins WHERE email = @email
        UNION
        SELECT riderId as id, userName, email, password, 'deliveryWorker' as role, ISNULL(statusApprove, 0) as statusApprove, disableBit, NULL as restaurantId 
        FROM deliveryWorkers WHERE email = @email;
      `;

      const userResult = await pool
        .request()
        .input("email", sql.VarChar, email)
        .query(userQuery);

      if (userResult.recordset.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      user = userResult.recordset[0];
      console.log(user);
      restaurantId = user.restaurantId;
      bit=user.disableBit;
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      if (user.disableBit === 1) {
        return res.status(401).json({ message: "Account Deleted" });
      }
      if (
        (user.role === "restaurantAdmin" || user.role === "deliveryWorker") &&
        user.statusApprove === 0
      ) {
        return res.status(403).json({
          message: "Please wait for approval",
        });
      }


      if (user.role === "restaurantAdmin" && !restaurantId) {
        return res.status(403).json({
          message: "You are not assigned to any restaurant",
        });
      }
      console.log(restaurantId);
      if (user.role === "restaurantAdmin" && restaurantId) {
        const restaurantQuery = `
          SELECT disableBit FROM restaurants WHERE restaurantId = @restaurantId;
        `;
        const restaurantResult = await pool
          .request()
          .input("restaurantId", sql.Int, restaurantId)
          .query(restaurantQuery);
          console.log(restaurantResult.recordset[0].disableBit);
          if (restaurantResult.recordset[0].disableBit === true) {
          return res.status(403).json({ message: "Your restaurant has been deleted." });
        }
      }
    }

    const tokenPayload = { userId: user.id, role: user.role };
    if (user.role === "restaurantAdmin") {
      tokenPayload.restaurantId = restaurantId;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user.id,
      restaurantId: user.role === "restaurantAdmin" ? restaurantId : undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

module.exports = router;

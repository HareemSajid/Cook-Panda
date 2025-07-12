require("dotenv").config();

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

//1) Show Orders Available to Pick
router.get("/getAvailableOrders", async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .query(
        `SELECT o.orderId, c.customerId, o.restaurantId, o.statusOrder, o.totalAmount, o.orderDate, o.deliveryAddress FROM orders o join customers c on c.customerId=o.customerId WHERE deliveryRiderId IS NULL AND statusOrder NOT IN ('delivered', 'cancelled') and c.disableBit=0`
      );

    if (result.recordset.length === 0) {
      return res.status(200).json({ message: "No available orders" });
    }

    res.json({ availableOrders: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//2) Choose an Order
router.put("/assignOrder", async (req, res) => {
  try {
    const { orderId } = req.body;
    const riderId = req.user.userId;
    if (!riderId || !orderId) {
      return res
        .status(400)
        .json({ message: "Complete parameters are required" });
    }

    const pool = await sql.connect(config);

    const activeOrderCheck = await pool
      .request()
      .input("riderId", sql.Int, riderId)
      .query(
        `SELECT 1 FROM orders WHERE deliveryRiderId = @riderId AND statusOrder NOT IN ('cancelled', 'delivered')`
      );

    if (activeOrderCheck.recordset.length > 0) {
      return res.status(400).json({
        message: "Rider must complete current order before taking a new one",
      });
    }

    const orderCheck = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .query(
        `SELECT 1 FROM orders WHERE orderId = @orderId AND deliveryRiderId IS NULL AND statusOrder NOT IN ('cancelled', 'delivered')`
      );

    if (orderCheck.recordset.length === 0) {
      return res
        .status(400)
        .json({ message: "Order not available for assignment" });
    }

    await pool
      .request()
      .input("riderId", sql.Int, riderId)
      .input("orderId", sql.Int, orderId)
      .query(
        `UPDATE orders SET deliveryRiderId = @riderId WHERE orderId = @orderId`
      );

    await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .query(`insert into deliveryUpdates values(@orderId, 'pending')`);

    res.json({ message: "Order assigned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//3) Update the Status
router.put("/updateDeliveryStatus", async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const riderId = req.user.userId;

    if (!riderId || !orderId || !status) {
      return res
        .status(400)
        .json({ message: "Complete parameters are required" });
    }

    const pool = await sql.connect(config);

    const orderCheck = await pool
      .request()
      .input("riderId", sql.Int, riderId)
      .input("orderId", sql.Int, orderId)
      .query(
        `SELECT statusOrder FROM orders WHERE orderId = @orderId AND deliveryRiderId = @riderId`
      );

    if (orderCheck.recordset.length === 0) {
      return res
        .status(400)
        .json({ message: "Order not assigned to this rider" });
    }

    if (
      orderCheck.recordset[0].statusOrder === "cancelled" ||
      orderCheck.recordset[0].statusOrder === "delivered"
    ) {
      return res.status(400).json({
        message: "Cannot update status, cancelled or already Delivered",
      });
    }

    await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("status", sql.VarChar(50), status)
      .query(
        `UPDATE deliveryUpdates SET status = @status WHERE orderId = @orderId`
      );

    res.json({ message: "Delivery status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//4) Show the Riders Earnings
router.get("/riderEarnings", async (req, res) => {
  try {
    const riderId = req.user.userId;

    if (!riderId) {
      return res.status(400).json({ message: "Rider ID is required" });
    }

    const pool = await sql.connect(config);

    const result = await pool
      .request()
      .input("riderId", sql.Int, riderId)
      .query(
        `SELECT SUM(totalAmount) AS Earnings 
         FROM orders 
         WHERE deliveryRiderId = @riderId AND statusOrder = 'delivered'`
      );

    const totalEarnings = result.recordset[0].Earnings || 0;

    res.json({ riderId, totalEarnings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});


module.exports = router;

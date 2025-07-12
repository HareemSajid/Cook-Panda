require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const router = express.Router();
router.use(cors());

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  authentication: {
    type: "default",
  },
  port: parseInt(process.env.DB_PORT, 10),
};

router.get("/test1", async (req, res) => {
  res.json({ message: "Hello From CUSTOMERS" });
});

//--1) Retrieve the Orders History of a Customer
router.get("/orderHistory", async function (req, res) {
  try {
    const customerId = req.user.userId; // Extract customer ID from token

    if (!customerId) {
      return res
        .status(400)
        .json({ message: "Customer ID not found in token" });
    }

    const pool = await sql.connect(config);
    const orderHistory = await pool
      .request()
      .input("customerId", sql.Int, customerId)
      .query(`SELECT * FROM orderHistory WHERE customerId = @customerId`);

    res.status(200).json({
      orderHistory: orderHistory.recordset,
    });
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({ message: "Database Error" });
  }
});

//2) Show all Restaurants
router.get("/showRestaurants", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const allRestaurants = await pool
      .request()
      .query(`select* from Restaurants where disablebit='false' and adminId is not null`);
    res.status(200).json({
      allRestaurants: allRestaurants.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

//2.5
router.get("/restaurantName/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    const pool = await sql.connect(config);
    const restaurantName = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(`select name from Restaurants where disablebit='false' and restaurantId=@restaurantId`);
    res.status(200).json({
      restaurantName: restaurantName.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});
//3) Show MenuItems of a Specific Restaurant
router.get("/showMenuItems/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    const pool = await sql.connect(config);
    const menuItems = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        `select * from menuItems where restaurantId=@restaurantId and disablebit='false'`
      );

    res.status(201).json({
      menuItems: menuItems.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

//4) Placing an Order by Customer
router.post("/placeOrder", async (req, res) => {
  try {
    const { restaurantId, deliveryAddress, orderItems } = req.body;
    const customerId = req.user.userId;
    console.log(customerId);
    if (
      !customerId ||
      !restaurantId ||
      !deliveryAddress ||
      !orderItems.length
    ) {
      return res.status(400).json({ message: "missing required fields" });
    }

    const pool = await sql.connect(config);

    const pendingOrderResult = await pool
      .request()
      .input("customerid", sql.Int, customerId)
      .query(
        `select orderid from orders where customerid = @customerid and statusorder != 'delivered' and statusorder!='cancelled'`
      );

    if (pendingOrderResult.recordset.length > 0) {
      return res.status(400).json({
        message: "you already have a pending order. please wait...",
      });
    }

    const orderResult = await pool
      .request()
      .input("customerid", sql.Int, customerId)
      .input("restaurantid", sql.Int, restaurantId)
      .input("deliveryaddress", sql.VarChar(150), deliveryAddress)
      .query(
        `insert into orders (customerid, restaurantid, statusorder, totalamount, orderdate, deliveryaddress)
         values (@customerid, @restaurantid, 'pending', 0, getdate(), @deliveryaddress);
         select scope_identity() as orderid;`
      );

    const orderId = orderResult.recordset[0].orderid;
    let totalAmount = 0;

    for (const item of orderItems) {
      const { itemId, quantity } = item;

      const priceresult = await pool
        .request()
        .input("itemid", sql.Int, itemId)
        .query(`select price from menuitems where itemid = @itemid`);

      if (priceresult.recordset.length === 0) {
        return res.status(400).json({ message: `item ${itemId} not found` });
      }

      const price = priceresult.recordset[0].price;
      const subtotal = price * quantity;
      totalAmount += subtotal;

      await pool
        .request()
        .input("orderid", sql.Int, orderId)
        .input("itemid", sql.Int, itemId)
        .input("quantity", sql.Int, quantity)
        .input("subtotal", sql.Decimal(10, 2), subtotal)
        .query(
          `insert into orderitems (orderid, itemid, quantity, subtotal)
           values (@orderid, @itemid, @quantity, @subtotal)`
        );
    }

    await pool
      .request()
      .input("orderid", sql.Int, orderId)
      .input("totalamount", sql.Decimal(10, 2), totalAmount)
      .query(
        `update orders set totalamount = @totalamount where orderid = @orderid`
      );

    res
      .status(201)
      .json({ message: "order placed successfully", orderId, totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

//5) Input Rating from a Customer
router.post("/takeRating", async (req, res) => {
  try {
    const { restaurantId, rating, review } = req.body;
    const customerId = req.user.userId;

    if (!customerId || !restaurantId || !rating || !review) {
      return res
        .status(400)
        .json({ message: "Input Parameters are not Complete" });
    }

    const pool = await sql.connect(config);

    const orderCheck = await pool
      .request()
      .input("customerId", sql.Int, customerId)
      .input("restaurantId", sql.Int, restaurantId).query(`
        SELECT COUNT(*) AS orderCount 
        FROM orders 
        WHERE customerId = @customerId 
          AND restaurantId = @restaurantId 
          AND statusOrder = 'delivered'
      `);

    if (orderCheck.recordset[0].orderCount === 0) {
      return res
        .status(403)
        .json({
          message:
            "You can only rate a restaurant after a successful delivery.",
        });
    }

    await pool
      .request()
      .input("customerId", sql.Int, customerId)
      .input("restaurantId", sql.Int, restaurantId)
      .input("rating", sql.Int, rating)
      .input("review", sql.VarChar, review).query(`
        INSERT INTO Ratings (customerId, restaurantId, rating, review) 
        VALUES (@customerId, @restaurantId, @rating, @review);
      `);

    res.status(201).json({
      message: "Rating Successful",
      rating,
      review,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

//6) View the Details of yourself
router.get("/userDetails", async (req, res) => {
  const customerId = req.user.userId;
  if (!customerId) {
    return res.status(400).json({ message: "Input customerId!" });
  }
  try {
    const pool = await sql.connect(config);
    const customerDetails = await pool
      .request()
      .input("customerId", sql.Int, customerId)
      .query(`select * from customerDetails where customerId=@customerId`);

    if (customerDetails.recordset.length === 0) {
      return res.status(400).json({ message: "Customer Does Not Exist" });
    }

    res.json(customerDetails.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database Error" });
  }
});

//7) Cancel An Order
router.post("/cancelOrder", async (req, res) => {
  try {
    const { orderId } = req.body;
    const customerId = req.user.userId;

    if (!orderId || !customerId) {
      return res
        .status(400)
        .json({ message: "Complete Parameters are required" });
    }

    const pool = await sql.connect(config);

    const orderCheck = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("customerId", sql.Int, customerId)
      .query(
        `SELECT statusOrder FROM orders WHERE orderId = @orderId and customerId=@customerId`
      );

    if (orderCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderCheck.recordset[0].statusOrder === "delivered") {
      return res
        .status(400)
        .json({ message: "Order already delivered, cannot be cancelled" });
    }
    if (orderCheck.recordset[0].statusOrder === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("customerId", sql.Int, customerId)
      .query(
        `UPDATE orders SET statusOrder = 'cancelled' WHERE orderId = @orderId and customerId=@customerId`
      );

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//8) Track Current Order Status
router.get("/trackOrder/:orderId", async (req, res) => {
  console.log(1);
  try {
    console.log(2);
    const {orderId}  = req.params;
    console.log(orderId);
    const customerId = req.user.userId;
    console.log(customerId);
    if (!customerId || !orderId) {
      return res.status(400).json({ message: "Invalid Parameters" });
    }
    const pool = await sql.connect(config);

    const orderStatus = await pool
      .request()
      .input("customerId", sql.Int, customerId)
      .input("orderId", sql.Int, orderId)
      .query(
        `SELECT statusOrder FROM orders WHERE orderId = @orderId and customerId=@customerId`
      );

    if (orderStatus.recordset.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const deliveryUpdates = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .query(`SELECT status FROM deliveryUpdates WHERE orderId = @orderId`);

    if (deliveryUpdates.recordset.length === 0) {
      console.log('here');
      return res
        .status(200)
        .json({
          orderStatus: orderStatus.recordset[0].statusOrder,
          riderStatus: "No Rider Update Yet",
        });
    }

    res.json({
      orderStatus: orderStatus.recordset[0].statusOrder,
      message: "Rider",
      deliveryUpdates: deliveryUpdates.recordset[0].status,
    });
  } catch (err) {
    console.log(1);
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
  console.log(1);
});

//9) Show All Ratings of a Restaurant
router.get("/getRatings/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId) {
      return res.status(400).json({ message: "Invalid Params RestaurantId" });
    }
    const pool = await sql.connect(config);

    const getRatings = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(`select * from Ratings where restaurantId = @restaurantId`);
    res.json(getRatings.recordset);
  } catch (err) {
    console.error(err);
    return req.status(500).json({ message: "Database Error" });
  }
});

router.get("/trackMyOrder", async (req, res) => {
  console.log(1);
  try {
    console.log(2);

    const customerId = req.user.userId;
    console.log(customerId);
    if (!customerId) {
      return res.status(400).json({ message: "Invalid Parameters" });
    }
    const pool = await sql.connect(config);

    const orderStatus = await pool
      .request()
      .input("customerId", sql.Int, customerId)
      .query(
        `SELECT statusOrder, orderId as orderId FROM orders WHERE statusOrder!='delivered' and statusOrder!='cancelled' and customerId=@customerId`
      );

    if (orderStatus.recordset.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    const myUser=orderStatus.recordset[0];
    const orderId=myUser.orderId;
    const deliveryUpdates = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .query(`SELECT status FROM deliveryUpdates WHERE orderId = @orderId`);

    if (deliveryUpdates.recordset.length === 0) {
      console.log('here');
      return res
        .status(200)
        .json({
          orderStatus: orderStatus.recordset[0].statusOrder,
          riderStatus: "No Rider Update Yet",
        });
    }

    res.json({
      orderStatus: orderStatus.recordset[0].statusOrder,
      message: "Rider",
      deliveryUpdates: deliveryUpdates.recordset[0].status,
    });
  } catch (err) {
    console.log(1);
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
  console.log(1);
});

module.exports = router;

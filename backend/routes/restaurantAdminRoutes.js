require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const { route } = require("./riderRoutes");

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

router.get("/test", async (req, res) => {
  res.json({ message: "Hello From Admin" });
});

//1- Add new menu item
const multer = require("multer");
const path = require("path");

// Multer setup (you can reuse the same storage configuration)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Updated endpoint with image upload
router.post("/addMenuItem", upload.single("image"), async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const { name, description, price } = req.body;
  const { file } = req;

  if (!name || !description || !price || !restaurantId) {
    // Clean up uploaded file if validation fails
    if (file) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).send("Missing required fields");
  }

  if (isNaN(price) || price <= 0) {
    if (file) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).send("Invalid price");
  }

  let imageUrl = null;
  if (file) {
    imageUrl = `http://localhost:5000/Uploads/${file.filename}`;
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("description", sql.VarChar, description)
      .input("price", sql.Decimal(10, 2), price)
      .input("restaurantId", sql.Int, restaurantId)
      .input("imageUrl", sql.VarChar, imageUrl)
      .query(
        "EXEC AddMenuItem @name, @description, @price, @restaurantId, @imageUrl"
      );

    res.json({ 
      success: true,
      message: "Menu item added successfully",
      imageUrl: imageUrl
    });
  } catch (err) {
    // Clean up uploaded file if database operation fails
    if (file) {
      fs.unlinkSync(file.path);
    }
    console.error("Error adding menu item:", err);
    res.status(500).json({ 
      success: false,
      message: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error"
    });
  }
});


/*const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/addMenuItem", upload.single("image"), async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const { name, description, price, imageUrl: manualImageUrl } = req.body;
  const { file } = req;

  // Validate required fields
  if (!name || !description || !price || !restaurantId) {
    if (file) {
      try { await fs.unlink(file.path); } catch (err) { console.error(err); }
    }
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Validate price
  if (isNaN(price) || price <= 0) {
    if (file) {
      try { await fs.unlink(file.path); } catch (err) { console.error(err); }
    }
    return res.status(400).json({ success: false, message: "Invalid price" });
  }

  // Validate image
  if (!file && !manualImageUrl) {
    return res.status(400).json({ success: false, message: "Either image file or image URL is required" });
  }

  // Process image
  let finalImageUrl = manualImageUrl;
  if (file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      await fs.unlink(file.path);
      return res.status(400).json({ success: false, message: "Invalid image type" });
    }
    finalImageUrl = `/Uploads/${file.filename}`; // Use relative path
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("description", sql.VarChar, description)
      .input("price", sql.Decimal(10, 2), parseFloat(price))
      .input("restaurantId", sql.Int, restaurantId)
      .input("imageUrl", sql.VarChar, finalImageUrl)
      .execute("AddMenuItem"); // Changed from .query to .execute

    
    res.json({ 
      success: true,
      message: "Menu item added successfully",
      itemId: result.recordset[0]?.ItemId,
      imageUrl: finalImageUrl
    });
  } catch (err) {
    console.error("Error adding menu item:", err);
    if (file) {
      try { await fs.unlink(file.path); } catch (err) { console.error(err); }
    }
    res.status(500).json({ 
      success: false,
      message: process.env.NODE_ENV === 'development' ? err.message : "Internal Server Error"
    });
  }
});*/

//2
router.put("/updateMenuItemPrice", async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const { itemId, newPrice } = req.body;

  if (!restaurantId || !itemId || !newPrice) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (isNaN(newPrice) || newPrice <= 0) {
    return res.status(400).json({ message: "Invalid price" });
  }

  try {
    const pool = await sql.connect(config);

    await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .input("itemId", sql.Int, itemId)
      .input("newPrice", sql.Decimal(10, 2), newPrice)
      .query("EXEC UpdateMenuItemPrice @restaurantId, @itemId, @newPrice");

    res.json({ message: "Menu item price updated successfully" });
  } catch (err) {
    console.error("Error updating menu item price:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

//3
//3-Disable menu item
/*router.put("/disable-menu-item/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const restaurantId = req.user.restaurantId;

  if (isNaN(itemId) || itemId <= 0) {
    return res.status(400).send("Invalid itemId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .input("itemId", sql.Int, itemId)
      .query("EXEC DisableMenuItem @restaurantId, @itemId");
    res.json({ message: "Menu item disabled successfully" });
  } catch (err) {
    console.error("Error disabling menu item:", err);
    res.status(500).send("Internal Server Error");
  }
});*/
router.put("/disable-menu-item/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const restaurantId = req.user.restaurantId;

  if (isNaN(itemId) || itemId <= 0) {
    return res.status(400).send("Invalid itemId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .input("itemId", sql.Int, itemId)
      .query("EXEC DisableMenuItem @restaurantId, @itemId");

    // Check for the returned message from the stored procedure
    if (result.recordset && result.recordset.length > 0 && result.recordset[0].message) {
      return res.status(400).json({ message: result.recordset[0].message });
    }

    res.json({ message: "Menu item disabled successfully" });
  } catch (err) {
    console.error("Error disabling menu item:", err);
    res.status(500).send("Internal Server Error");
  }
});


// 4-Update order status
router.put("/update-order-status", async (req, res) => {
  const restaurantId = req.user.restaurantId;
  const { orderId, newStatus } = req.body;

  if (!restaurantId || isNaN(orderId) || orderId <= 0) {
    return res.status(400).json({ error: "Invalid orderId or restaurantId" });
  }

  const validTransitions = {
    pending: ["in progress", "cancelled"],
    "in progress": ["delivered"],
    delivered: [],
    cancelled: [],
  };

  try {
    const pool = await sql.connect(config);

    // Get current status of the order
    const orderResult = await pool
      .request()
      .input("orderId", sql.Int, orderId)
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        "SELECT statusOrder FROM orders WHERE orderId = @orderId AND restaurantId = @restaurantId"
      );

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const currentStatus = orderResult.recordset[0].statusOrder;
    if (
      !validTransitions[currentStatus] ||
      !validTransitions[currentStatus].includes(newStatus)
    ) {
      return res.status(400).json({
        error: `Invalid status transition from ${currentStatus} to ${newStatus}`

      });
    }

    // Execute stored procedure
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .input("orderId", sql.Int, orderId)
      .input("newStatus", sql.VarChar, newStatus)
      .execute("UpdateOrderStatus");

    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//5-Get total earnings
router.get("/get-total-earnings", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }

  try {
    const pool = await sql.connect(config);
    console.log(restaurantId);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query("EXEC GetTotalEarnings @restaurantId");
    if (result.recordset.length == 0) {
      return res.json("0");
    }
    return res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching total earnings:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 5-Get top selling menu items
/*router.get("/topSeller", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  // Validate restaurantId
  if (!restaurantId || isNaN(restaurantId)) {
    console.log("Invalid restaurantId:", restaurantId);
    return res
      .status(400)
      .json({ message: "Invalid restaurantId. It must be a number." });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, parseInt(restaurantId))
      .query("EXEC GetTopSellingMenuItems @restaurantId");

    res.json({ message: "Success", data: result.recordset });
  } catch (err) {
    console.error("Error fetching top selling items:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});*/
router.get("/topSeller", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  // Validate restaurantId
  if (!restaurantId || isNaN(restaurantId)) {
    console.log("Invalid restaurantId:", restaurantId);
    return res
      .status(400)
      .json({ message: "Invalid restaurantId. It must be a number." });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, parseInt(restaurantId))
      .execute("GetTopSellingMenuItems"); // <-- FIXED HERE

    res.json({ message: "Success", data: result.recordset });
  } catch (err) {
    console.error("Error fetching top selling items:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});


// 6-Get restaurant earnings by date range
router.get(
  "/get-restaurant-earnings-by-date/:startDate/:endDate",
  async (req, res) => {
    const restaurantId = req.user.restaurantId;
    const { startDate, endDate } = req.params;

    if (
      isNaN(restaurantId) ||
      restaurantId <= 0 ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate))
    ) {
      return res.status(400).send("Invalid input");
    }

    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("restaurantId", sql.Int, restaurantId)
        .input("startDate", sql.Date, startDate)
        .input("endDate", sql.Date, endDate)
        .query(
          "EXEC GetRestaurantEarningsByDate @restaurantId, @startDate, @endDate"
        );
      res.json(result.recordset);
    } catch (err) {
      console.error("Error fetching earnings by date:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

// 7-Get all menu items for a restaurant
router.get("/menuItems", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query("EXEC GetRestaurantMenuItems @restaurantId");
    res.json(result.recordset); 
  } catch (err) {
    console.error("Error fetching restaurant menu items:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 8-Get restaurant order history
router.get("/get-restaurant-order-history", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query("EXEC GetRestaurantOrderHistory @restaurantId");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching restaurant order history:", err);
    res.status(500).send("Internal Server Error");
  }
});

//VIEWS
// 1. Get Restaurant Customer Details
router.get("/restaurantCustomerDetails", async (req, res) => {
  const restaurantId = req.user.restaurantId;
  console.log(restaurantId);
  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        "SELECT * FROM RestaurantCustomerDetails WHERE restaurantId = @restaurantId"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching restaurant customer details:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 2. Get Restaurant Average Rating
router.get("/get-restaurant-avg-rating", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        "SELECT * FROM RestaurantAvgRating WHERE restaurantId = @restaurantId"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching restaurant average rating:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 3. Get Pending Orders
router.get("/get-pending-orders", async (req, res) => {
  const restaurantId = req.user.restaurantId;
  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query("SELECT * FROM PendingOrders where restaurantId=@restaurantId");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching pending orders:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 4. Get Orders Without Rider
router.get("/get-orders-without-rider", async (req, res) => {
  const restaurantId = req.user.restaurantId;
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        "SELECT * FROM OrdersWithoutRider where restaurantId=@restaurantId"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching orders without rider:", err);
    res.status(500).send("Internal Server Error");
  }
});

// 5. Get Menu Items Without Description
router.get("/get-menu-items-for-description-update", async (req, res) => {
  const restaurantId = req.user.restaurantId;
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        "SELECT * FROM MenuItemsForDescriptionUpdate where restaurantId=@restaurantId"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching menu items for description update:", err);
    res.status(500).send("Internal Server Error");
  }
});

//6
router.get("/get-restaurant-overview", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        "SELECT * FROM RestaurantOverview WHERE restaurantId = @restaurantId"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching restaurant overview:", err);
    res.status(500).send("Internal Server Error");
  }
});

//7
router.get("/track-order-progress", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        "SELECT * FROM TrackOrderProgress WHERE restaurantId = @restaurantId"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching order progress:", err);
    res.status(500).send("Internal Server Error");
  }
});

//8
router.get("/get-customer-feedback", async (req, res) => {
  const restaurantId = req.user.restaurantId;

  if (isNaN(restaurantId) || restaurantId <= 0) {
    return res.status(400).send("Invalid restaurantId");
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId)
      .query(
        "SELECT * FROM RestaurantCustomerFeedback WHERE restaurantId = @restaurantId"
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching customer feedback:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
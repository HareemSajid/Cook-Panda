require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const cors = require("cors");
const { route } = require("./riderRoutes");
//ye api bhi change hua
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

const multer = require("multer");
const path = require("path");
router.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Multer setup, file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

//1) Show all Existing Users
router.get("/users", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const customers = await pool
      .request()
      .query("select * from customers where disablebit='false'");
    const admins = await pool
      .request()
      .query("select * from restaurantAdmins where disablebit='false'");
    const workers = await pool
      .request()
      .query("select * from deliveryWorkers where disablebit='false'");
    console.log("Customers:", admins.restaurantAdmins);
    res.json({
      customers: customers.recordset,
      restaurantAdmins: admins.recordset,
      deliveryWorkers: workers.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//1b)
router.get("/approved_restaurant_admins", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query("select * from  Display_all_approved_restaurant_admins");

    res.json({
      restaurantAdmins: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//1c)
router.get("/approved_delivery_workers", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query("select * from Display_all_approved_delivery_riders");

    res.json({
      deliveryworkers: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//2a
router.put("/update_ra_status", async (req, res) => {
  try {
    const { adminid } = req.body;
    const pool = await sql.connect(config);
    const result = await pool.request().input("adminid", sql.Int, adminid)
      .query(`
          declare @responseMessage nvarchar(255);
          if not exists (select 1 from restaurantadmins where adminid = @adminid)  
          begin  
          set @responseMessage = 'admin does not exist';  
          end  
          else  
          begin  
          update restaurantadmins  
          set statusapprove = 1  
          where adminid = @adminid;  
          set @responseMessage = 'admin status updated successfully';  
          end  
          select @responseMessage as responseMessage;`);
    res.json({ message: result.recordset[0].responseMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error", error: err.message });
  }
});

//2b
router.put("/update_dw_status", async (req, res) => {
  try {
    const { riderid } = req.body;
    const pool = await sql.connect(config);
    const result = await pool.request().input("riderid", sql.Int, riderid)
      .query(`
            declare @responseMessage nvarchar(255);
            if not exists (select 1 from deliveryworkers where riderid = @riderid)  
            begin  
            set @responseMessage = 'rider does not exist';  
            end  
            else  
            begin  
            update deliveryworkers  
            set statusapprove = 1  
            where riderid = @riderid;  
            set @responseMessage = 'rider status updated successfully';  
            end  
            select @responseMessage as responseMessage;`);
    res.json({ message: result.recordset[0].responseMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error", error: err.message });
  }
});

//3a
router.post("/remove_admin", async (req, res) => {
  try {
    const { adminid } = req.body;
    const pool = await sql.connect(config);
    const result = await pool.request().input("adminid", sql.Int, adminid)
      .query(`
          declare @responseMessage nvarchar(255)
          if not exists (select 1 from restaurantadmins where adminid = @adminid)  
          begin  
          set @responseMessage = 'admin does not exist'  
          end
           else if exists (select 1 from restaurants where adminid = @adminid)  
          begin  
          update restaurants
          set adminId = null
          where adminid = @adminid
          set @responseMessage = 'admin removed successfully';
          update restaurantadmins  
          set statusapprove = 0, disableBit='true'  
          where adminid = @adminid
          set @responseMessage = 'admin removed successfully'
          end   
          else  
          begin  
          update restaurantadmins  
          set statusapprove = 0, disableBit='true'  
          where adminid = @adminid
          set @responseMessage = 'admin removed successfully' 
          end  
          select @responseMessage as responseMessage`);
    res.json({ message: result.recordset[0].responseMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error", error: err.message });
  }
});

//3b
router.post("/removerider", async (req, res) => {
  try {
    const { riderid } = req.body;
    const pool = await sql.connect(config);
    const result = await pool.request().input("riderid", sql.Int, riderid)
      .query(`
            declare @responseMessage nvarchar(255)
            if not exists (select 1 from deliveryWorkers where riderId = @riderid)
            begin set @responseMessage = 'rider does not exist'
            end
            else if exists (
            select 1 from orders 
            where deliveryRiderId = @riderid 
            and statusOrder <> 'Delivered'
            )
            begin
            set @responseMessage = 'rider has not yet delivered the order, so cannot delete'
            end
            else
            begin
            update deliveryWorkers  
            set statusApprove = 0, disableBit='true'  
            where riderId = @riderid
            set @responseMessage = 'rider deleted'
            end
            select @responseMessage as responseMessage`);
    res.json({ message: result.recordset[0].responseMessage });
  } catch (err) {
    res.status(500).json({ message: "database error", error: err.message });
  }
});

//4
// router.post("/newRestaurant", async (req, res) => {
//   try {
//     const { name, address, contact } = req.body;
//     const pool = await sql.connect(config);
//     const result = await pool
//       .request()
//       .input("name", sql.VarChar, name)
//       .input("address", sql.VarChar, address)
//       .input("contact", sql.VarChar, contact)
//       .query(
//         "INSERT INTO restaurants ( name, address, contactNumber) VALUES ( @name, @address, @contact)"
//       );
//     res.json({ message: "Restaurant added successfully", result });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Database error", error: err.message });
//   }
// });

const updateRestaurantImage = async (restaurantId, newImageUrl) => {
  try {
    const response = await api.put(`/restaurants/${restaurantId}/image`, {
      imageUrl: newImageUrl
    });
    
    if (response.data.success) {
      // Update local state
      setRestaurants(restaurants.map(r => 
        r.restaurantId === restaurantId 
          ? { ...r, imageUrl: newImageUrl } 
          : r
      ));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update image:', error);
    return false;
  }
};router.get('/restaurants', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.restaurantId AS restaurant_id,
        r.name,
        r.address,
        r.contactNumber AS contact,
        r.imageUrl AS image_url,
        r.statusApprove,
        r.Disablebit,
        r.adminId as adminId,
        (
          SELECT COUNT(*) 
          FROM menuItems m 
          WHERE m.restaurantId = r.restaurantId
        ) AS menu_items_count,
        NULL AS average_rating
      FROM restaurants r
      WHERE r.Disablebit = 0
    `;

    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
console.log(result.imageUrl);
    const restaurants = result.recordset.map(r => ({
      ...r,
      is_active: !r.Disablebit, // invert bit to get true/false
    }));

    res.json({ success: true, restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
});

//5 
router.post("/newrestaurantadmin", async (req, res) => {
  try {
    const { restaurantid, adminid } = req.body;
    if (!restaurantid || !adminid) {
      return res.status(400).json({ message: "missing restaurant id or admin id" });
    }

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("restaurantid", sql.Int, restaurantid)
      .input("adminid", sql.Int, adminid).query(`
        if exists (select 1 from restaurantadmins where adminid = @adminid)
        and exists (select 1 from restaurants where restaurantid = @restaurantid)
        and not exists(select 1 from restaurants where adminId = @adminid)
        begin
          update restaurants set adminid = @adminid where restaurantid = @restaurantid;
        end
      `);

    if (result.rowsAffected[0] > 0) {
      return res.json({ message: "admin assigned successfully" });
    } else {
      return res.status(400).json({ message: "invalid restaurant or admin" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});
//6
router.get("/restaurantIncome", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .query(`select * from Restaurant_income order by totalIncome desc`);

    res.json({

      message: "Fetched restaurant incomes successfully",
      data: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

//7--Get  all Restaurant Earnings By Date
router.post("/restaurantIncomebyDate", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing startDate or endDate" });
    }

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("startDate", sql.Date, startDate)
      .input("endDate", sql.Date, endDate).query(`
          SELECT  
              r.restaurantId as restaurantId,
              r.name AS restaurantName, 
              SUM(o.totalAmount) AS totalIncome
          FROM 
              restaurants r
          left JOIN 
              orders o ON r.restaurantId = o.restaurantId and o.statusOrder = 'delivered' 
              AND o.orderDate BETWEEN @startDate AND @endDate
          GROUP BY 
              r.restaurantId, r.name
          ORDER BY 
              totalIncome DESC;
        `);

    res.json({
      message: "Data retrieved successfully",
      data: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
});
//8) all users added
router.get("/usersAddedToday", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
       select * from All_acounts_created_today
      `);

    res.json({
      message: "fetched users added today successfully",
      data: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error", error: err.message });
  }
});

//9
router.put("/deleteRestaurant", async (req, res) => {
  const { restaurantId } = req.body;
  try {
    const pool = await sql.connect(config);
    const check = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId).query(`
      select* from restaurants where restaurantId=@restaurantId;
     `);

    if (check.recordset.length == 0) {
      return res.status(400).json({ message: "Restaurant Doesnt Exist" });
    }
    const result = await pool
      .request()
      .input("restaurantId", sql.Int, restaurantId).query(`
       update restaurants set Disablebit='true' where restaurantId=@restaurantId;
      `);

    res.json({
      message: `Query Executed for ${restaurantId}`,
      data: result.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error", error: err.message });
  }
});
router.post("/newRestaurant", upload.single("image"), async (req, res) => {
  try {

    const { name, address, contact } = req.body;
    const { file } = req;

    // Check for missing parameters
    if (!name || !address || !contact) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    let imageUrl = null;
    if (file) {
      imageUrl = `http://localhost:5000/uploads/${file.filename}`;
    }
    

    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("address", sql.VarChar, address)
      .input("contact", sql.VarChar, contact)
      .input("imageUrl", sql.VarChar(255), imageUrl)
      .query(
        "INSERT INTO restaurants (name, address, contactNumber, imageUrl) VALUES (@name, @address, @contact, @imageUrl)"
      );

    res.json({
      message: "Restaurant added successfully",
      result,
      imageUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
}); 

router.get('/totalIncome', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query(`
        SELECT SUM(totalAmount) AS totalIncome
        FROM orders
        WHERE statusOrder = 'delivered'
      `);

    const income = result.recordset[0].totalIncome;

    res.status(200).json({
      success: true,
      totalIncome: income || 0
    });
  } catch (err) {
    console.error('Error fetching total income:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch total income'
    });
  }
});
module.exports = router;

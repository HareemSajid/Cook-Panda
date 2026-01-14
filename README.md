# Cook-Panda

## 📸 Screenshots

![Signup](images/signup.png)
![Login](images/login.png)
![Customer View](images/customer_view.png)
![Restaurant Menu](images/restaurant_menu.png)
![Rider View](images/rider_view.png)
![Restaurant Admin View](images/Restaurant_admin_view.png)
![Main Admin View](images/main_admin_view.png)


CookPanda is a full-stack food ordering system developed as part of a Database Systems Lab project. It includes a customer-facing interface, restaurant admin panel, delivery worker panel, and super admin panel. The system allows customers to browse menus, place orders, and track delivery status, while also enabling administrators to manage restaurants, menus, orders, and delivery logistics. (Inspired from Food-Panda)

## 🚀 Features

### 🔸 Customer Panel
* Browse menus by restaurant
* Add/remove items to cart
* Place orders with address input
* View order confirmation and live status updates
* Cancel pending orders

### 🔸 Restaurant Admin Panel
* Login and manage assigned restaurant
* Add/edit/delete menu items (with image upload)
* View and manage customer orders

### 🔸 Delivery Worker Panel
* View assigned deliveries
* Update order delivery status

### 🔸 Super Admin Panel
* Manage all users: restaurant admins, delivery workers, customers
* View system-wide data and perform administrative tasks

### 🔸 Image Upload Support
* Menu items support image upload via the admin panel
* Images are stored in the server and referenced via URLs in the database (MSSQL)

## 🛠️ Tech Stack

### Frontend:
* React.js
* Axios
* React Router

### Backend:
* Node.js
* Express.js
* Multer (for file/image uploads)
* MSSQL (Microsoft SQL Server) for the database
* Sequelize (optional ORM, if used)

## 🗃️ Database Design
* **Users Table:** Handles customers, admins, and delivery workers (via roles)
* **Restaurants Table**
* **MenuItems Table:** Includes item name, description, price, image URL, etc.
* **Orders Table:** Tracks order status, delivery assignment, and timestamps
* **OrderItems Table:** Mapping of menu items to orders
* **Images stored:** Via server endpoint, URLs stored in the DB

## 📸 Image Upload Feature
* Admins can upload menu item images via a form
* Backend uses multer to store files in the `/uploads` directory
* Images are served statically using Express
* URLs are stored in the database and used in the frontend to display images

## ⚙️ Installation & Setup

### Prerequisites
* Node.js
* SQL Server
* npm or yarn

### Installation Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Cook-Panda.git
   cd Cook-Panda

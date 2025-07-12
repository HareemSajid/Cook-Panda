import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/CustomerPanel.css";

import gallery1Image from "../../assets/gallery-1.jpg";
import gallery2Image from "../../assets/gallery-2.jpg";
import gallery3Image from "../../assets/gallery-3.jpg";
import gallery4Image from "../../assets/crumble.png";
import logoImage from "../../assets/panda.svg";

const CustomerPanel = ({ onLogout }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderHistory, setOrderHistory] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showTrackPopup, setShowTrackPopup] = useState(false);
  const [myTrackOrderDetails, setMyTrackOrderDetails] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("You need to log in first.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/customer/showRestaurants");
        if (response.data.allRestaurants) {
          setRestaurants(response.data.allRestaurants);
          setFilteredRestaurants(response.data.allRestaurants);
        } else {
          setMessage("No restaurants available at the moment.");
        }
      } catch (err) {
        setMessage("Error fetching restaurants: " + (err.response?.data?.message || err.message));
      }
      setLoading(false);
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await api.get("/customer/userDetails", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchTrackOrderDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await api.get("/customer/trackMyOrder", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyTrackOrderDetails(response.data);
      } catch (err) {
        console.error("Error fetching order tracking details:", err);
      }
    };

    fetchTrackOrderDetails();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = restaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  };

  const handleViewMenu = (restaurantId) => {
    navigate(`/menu/${restaurantId}`);
  };

  const groupOrderHistory = (rawHistory) => {
    const grouped = {};
    rawHistory.forEach((entry) => {
      const { orderID, Restaurant, Item, subtotal, orderDate } = entry;
      if (!grouped[orderID]) {
        grouped[orderID] = {
          orderID,
          restaurantName: Restaurant,
          items: [],
          orderDate: orderDate,
        };
      }
      grouped[orderID].items.push({ name: Item, subtotal, orderDate });
    });
    return Object.values(grouped);
  };

  const toggleOrderPopup = async () => {
    if (!showOrderPopup) {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/customer/orderHistory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupedHistory = groupOrderHistory(response.data.orderHistory);
        setOrderHistory(groupedHistory);
      } catch (err) {
        console.error("Failed to fetch order history", err);
      }
    }
    setShowOrderPopup(!showOrderPopup);
  };

  const toggleUserPopup = () => {
    setShowUserPopup(!showUserPopup);
  };

  const formatDate = (date) => {
    const newDate = new Date(date);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return newDate.toLocaleDateString("en-US", options);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout();
    navigate("/");
  };

  return (
    <div className="customer-panel">
      {/* Navbar */}
      <div className="navbar">
        <div className="logo-container2">
          <img src={logoImage} alt="CookPanda Logo" className="navbar-logo" />
          <p className="brand-name">cookpanda</p>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for restaurants..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="navbar-buttons">
          <button className="order-history-btn" onClick={toggleOrderPopup}>Order History</button>
          <button className="user-details-btn" onClick={toggleUserPopup}>User Details</button>
          <button
  className="track-order-btn"
  onClick={async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await api.get("/customer/trackMyOrder", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyTrackOrderDetails(response.data);
      setShowTrackPopup(true);
    } catch (err) {
      console.error("Error fetching order tracking details:", err);
    }
  }}
>
  Track My Order
</button>

          <button
            onClick={handleLogout}
            style={{
              padding: "14px 18px",
              fontSize: "1rem",
              backgroundColor: " #e81c74",
              border: "none",
              borderRadius: "50px",
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              fontFamily: "Inter",
              marginLeft: "10px",
              fontWeight: "bolder",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Order History Popup */}
      {showOrderPopup && (
        <div className="order-popup animated-popup">
          <div className="order-popup-header">
            <h2>Your Order History</h2>
            <button className="close-btn" onClick={toggleOrderPopup}>✕</button>
          </div>
          <div className="order-popup-content">
            {orderHistory.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orderHistory.map((order) => (
                <div key={order.orderID} className="order-item">
                  <p><strong>Order ID:</strong> {order.orderID}</p>
                  <p><strong>Restaurant:</strong> {order.restaurantName}</p>
                  <p><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
                  <p><strong>Items:</strong></p>
                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} - ${item.subtotal.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <hr />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserPopup && userDetails && (
        <div className="user-popup animated-popup">
          <div className="user-popup-header">
            <h2>Your User Details</h2>
            <button className="close-btn" onClick={toggleUserPopup}>✕</button>
          </div>
          <div className="user-popup-content">
            <p><strong>Username:</strong> {userDetails.username}</p>
            <p><strong>Email:</strong> {userDetails.email}</p>
            <p><strong>Account Created On:</strong> {formatDate(userDetails.createDate)}</p>
          </div>
        </div>
      )}

      {/* Track Order Popup */}
      {showTrackPopup && (
  <div className="order-popup animated-popup">
    <div className="order-popup-header">
      <h2>Track My Order</h2>
      <button className="close-btn" onClick={() => setShowTrackPopup(false)}>
        ✕
      </button>
    </div>
    <div className="order-popup-content">
      {myTrackOrderDetails ? (
        <div className="track-info">
          <p><strong>Status:</strong> {myTrackOrderDetails.orderStatus}</p>
          {myTrackOrderDetails.message && (
            <p><strong>Rider:</strong> {myTrackOrderDetails.message}</p>
          )}
          {myTrackOrderDetails.deliveryUpdates && (
            <p><strong>Delivery Update:</strong> {myTrackOrderDetails.deliveryUpdates}</p>
          )}
        </div>
      ) : (
        <p>No order tracking info available.</p>
      )}
    </div>
  </div>
)}


      {/* Restaurant List */}
      {message && <p className="message">{message}</p>}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="restaurants-list">
          {filteredRestaurants.length > 0 ? (
            <div className="restaurant-cards">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant.restaurantId} className="restaurant-card">
                  <div className="restaurant-image-container">
                    <img src={restaurant.imageUrl} alt={restaurant.name} className="restaurant-image" />
                  </div>
                  <div className="restaurant-details">
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.address}</p>
                    <p>{restaurant.contactNumber}</p>
                    <button className="view-menu-button" onClick={() => handleViewMenu(restaurant.restaurantId)}>
                      View Menu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No restaurants available at the moment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerPanel;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/restaurantMenu.css";
import gallery1Image from "../../assets/gallery-1.jpg";

import gallery5Image from "../../assets/cookie1.webp";
import gallery6Image from "../../assets/cookie2.webp";
import gallery7Image from "../../assets/cookie3.webp";
const Menu = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [cart, setCart] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [restaurantName, setRestaurantName] = useState(""); // Added for better header

  useEffect(() => {
    const fetchMenuItemsAndRatings = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("You need to log in first.");
        setLoading(false);
        return;
      }

      try {
        // Fetching menu items
        const menuResponse = await api.get(
          `/customer/showMenuItems/${restaurantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMenuItems(menuResponse.data.menuItems);

        const nameResponse = await api.get(
          `/customer/restaurantName/${restaurantId}`
        );
        if (
          nameResponse.data.restaurantName &&
          nameResponse.data.restaurantName.length > 0
        ) {
          setRestaurantName(nameResponse.data.restaurantName[0].name);
        }
        // You can also fetch restaurant info here if available
        // For now, let's use a placeholder

        // Fetching restaurant ratings
        const ratingsResponse = await api.get(
          `/customer/getRatings/${restaurantId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRatings(ratingsResponse.data);
      } catch (err) {
        setMessage(
          "Error fetching data: " + (err.response?.data?.message || err.message)
        );
      }
      setLoading(false);
    };

    fetchMenuItemsAndRatings();
  }, [restaurantId]);

  const handleAddToCart = (item) => {
    setCart((prevCart) => [
      ...prevCart,
      { ...item, quantity: 1, cartId: Date.now() + Math.random() },
    ]);
  };

  const handleRemoveFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty. Add items before checking out!");
      return;
    }
    navigate(`/checkout/${restaurantId}`, { state: { cart, restaurantId } });
  };

  const handleRatingSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You need to log in first.");
      return;
    }

    try {
      const response = await api.post(
        "/customer/takeRating",
        {
          restaurantId,
          rating,
          review,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setRatingSuccess(true);
      }
    } catch (err) {
      setMessage(
        "Error submitting rating: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Calculate total items in cart
  const totalItems = cart.length;
  // Calculate total price
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2);

  return (
    <div className="menu-container">
      {/* Enhanced header section */}
      <div className="restaurant-header">
        <div className="restaurant-info">
          <h2 className="restaurantName">{restaurantName}</h2>
          <p className="restaurant-tagline">
            Explore our delicious menu and place your order
          </p>
        </div>
        <div
          className="cart-summary"
          onClick={() =>
            document
              .querySelector(".cart-section")
              .scrollIntoView({ behavior: "smooth" })
          }
        >
          <div className="cart-icon">🛒</div>
          <div className="cart-count">{totalItems}</div>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="menu-content">
          <div className="menu-items">
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item.id} className="menu-item-card">
                  <div className="menu-item-image-container">
                    <img
                      src={item.imageUrl || gallery6Image}
                      alt={item.name}
                      className="menu-item-image"
                    />
                  </div>
                  <div className="menu-item-details">
                    <h3>{item.name}</h3>
                    <p className="menu-item-description">{item.description}</p>
                    <div className="menu-item-footer">
                      <p className="menu-item-price">{item.price}Rs</p>
                      <button
                        className="add-to-cart-button"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No menu items available at the moment.</p>
            )}
          </div>

          {/* Cart Section */}
          <div className="cart-section">
            <h3>
              Your Cart{" "}
              <span className="cart-item-count">{totalItems} items</span>
            </h3>

            <ul className="cart-items">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <li key={item.cartId} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">${item.price}</span>
                    </div>
                    <button
                      className="remove-item"
                      onClick={() => handleRemoveFromCart(item.cartId)}
                      aria-label="Remove item"
                    >
                      <span className="remove-icon">×</span>
                    </button>
                  </li>
                ))
              ) : (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <p>Your cart is empty</p>
                  <p className="empty-cart-message">
                    Add items from the menu to get started!
                  </p>
                </div>
              )}
            </ul>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
              <button
                className={`checkout-button ${
                  cart.length === 0 ? "disabled" : ""
                }`}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Button to Open Rating Pop-Up */}
      <div className="rate-button-container">
        <button className="rate-button" onClick={() => setIsPopupVisible(true)}>
          <span className="rate-icon">⭐</span> Rate this Restaurant
        </button>
      </div>

      {/* Rating Pop-Up */}
      {isPopupVisible && (
        <div className="rating-popup">
          <div className="popup-content">
            <h3>Rate this Restaurant</h3>
            <label>
              Rating:
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={0}>Select Rating</option>
                <option value={1}>1 ⭐</option>
                <option value={2}>2 ⭐⭐</option>
                <option value={3}>3 ⭐⭐⭐</option>
                <option value={4}>4 ⭐⭐⭐⭐</option>
                <option value={5}>5 ⭐⭐⭐⭐⭐</option>
              </select>
            </label>
            <label>
              Review:
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write your review"
              />
            </label>
            <button className="submit-rating" onClick={handleRatingSubmit}>
              Submit Rating
            </button>

            {/* Success Tick */}
            {ratingSuccess && (
              <span className="success-tick">
                ✔ Rating Submitted Successfully!
              </span>
            )}

            <button
              className="close-popup"
              onClick={() => setIsPopupVisible(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Ratings Section - Now placed below the menu and cart */}
      <div className="ratings-section">
        <h3>Customer Reviews</h3>
        <div className="ratings-cards">
          {ratings.length > 0 ? (
            ratings.map((rating) => (
              <div key={rating.ratingId} className="rating-card">
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < rating.rating ? "star filled" : "star"}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="rating-review">{rating.review}</p>
                <p className="rating-date">
                  {new Date(rating.createDate).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to rate!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;

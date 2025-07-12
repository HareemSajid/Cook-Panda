import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";

// Add this CSS to your styles file or as a styled component
const styles = `
  .restaurant-overview {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    font-family: 'Poppins', sans-serif;
  }

  .restaurant-overview h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #ff2b85; /* Food Panda pink */
    margin-bottom: 1.5rem;
    position: relative;
    padding-bottom: 0.75rem;
  }

  .restaurant-overview h1:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 4px;
    width: 60px;
    background: #ff2b85;
    border-radius: 2px;
  }

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }

  .loading-spinner {
    border: 4px solid rgba(255, 43, 133, 0.1);
    border-radius: 50%;
    border-top: 4px solid #ff2b85;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error {
    background-color: #fff2f5;
    border-left: 4px solid #ff2b85;
    color: #d63384;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .overview-card {
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    transition: all 0.3s ease;
    margin-bottom: 2rem;
  }

  .overview-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }

  .overview-card h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .stat-card {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .stat-card:hover {
    background: #fff9fb;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #ff2b85;
    margin-bottom: 0.5rem;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .rating-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }

  .star {
    color: #ffc107;
    font-size: 1.25rem;
  }

  @media (max-width: 768px) {
    .stat-grid {
      grid-template-columns: 1fr;
    }
  }
`;

const RestaurantOverview = () => {
  const location = useLocation();
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getHeading = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard Overview";
      case "/menu-management":
        return "Menu Management";
      case "/orders":
        return "Orders";
      case "/analytics":
        return "Analytics";
      default:
        return "Restaurant Overview";
    }
  };

  useEffect(() => {
    const fetchOverview = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You need to log in first.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/radmin/get-restaurant-overview", {
          // headers: { Authorization: Bearer ${token} },
        });
        console.log("API Response:", response.data);

        if (response.data) {
          // Handle both array and object responses
          const data = Array.isArray(response.data) ? response.data[0] : response.data;
          setOverviewData(data);
        } else {
          setError("No data available.");
        }
      } catch (err) {
        console.error("Error:", err.response?.data);
        setError(err.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // Function to render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // for (let i = 0; i < fullStars; i++) {
    //   stars.push(<span key={star-${i}} className="star">★</span>);
    // }
    
    if (hasHalfStar) {
      stars.push(<span key="half-star" className="star">★</span>);
    }
    
    return stars;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="restaurant-overview">
        <h1>{getHeading()}</h1>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <p className="error">{error}</p>
        ) : overviewData ? (
          <div className="overview-card">
            <h2>{overviewData.restaurantName}</h2>
            
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-number">{overviewData.totalOrders || 0}</div>
                <div className="stat-label">Total Orders</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number">{overviewData.totalReviews || 0}</div>
                <div className="stat-label">Total Reviews</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-number">{overviewData.avgRating?.toFixed(1) || 0}</div>
                <div className="stat-label">Average Rating</div>
                <div className="rating-display">
                  {renderStars(overviewData.avgRating || 0)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No data available.</p>
        )}
      </div>
    </>
  );
};

export default RestaurantOverview;
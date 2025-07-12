import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './AvgRating.css';

const AvgRating = () => {
  const [ratingData, setRatingData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvgRating = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You need to log in first.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/radmin/get-restaurant-avg-rating', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.length > 0) {
          setRatingData(response.data[0]);
        } else {
          setError('No rating data found.');
        }
      } catch (err) {
        console.error('Error fetching average rating:', err);

        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError('Failed to fetch average rating.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvgRating();
  }, [navigate]);

  return (
    <div className="avg-rating-container">
      <h2>Restaurant Average Rating</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {ratingData && (
        <div className="rating-box">
          <h3>{ratingData.restaurantName}</h3>
          <p><strong>Average Rating:</strong> ⭐ {Number(ratingData.avgRating).toFixed(2)}</p>
          <p><strong>Total Reviews:</strong> {ratingData.totalReviews}</p>
        </div>
      )}
    </div>
  );
};

export default AvgRating;

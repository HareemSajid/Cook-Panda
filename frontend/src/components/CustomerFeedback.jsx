import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './CustomerManagement.css'; // Reuse same styles

const CustomerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to log in first.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/radmin/get-customer-feedback', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          throw new Error('Session expired');
        }

        if (response.data && response.data.length > 0) {
          setFeedbacks(response.data);
        } else {
          setError('No customer feedback found');
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);

        if (err.response?.status === 401 || err.message === 'Session expired') {
          localStorage.removeItem('token');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response?.data || 'Failed to load feedback data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [navigate]);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="customer-management-container">
        <div className="loading-spinner"></div>
        <p>Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="customer-management-container">
      <div className="header-bar">
        <h1>Customer Feedback</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {error ? (
        <div className="error-message">
          <p>{error}</p>
          {error.includes('expired') ? (
            <p>Redirecting to login page...</p>
          ) : (
            <button onClick={() => window.location.reload()}>Retry</button>
          )}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="no-customers">
          <p>No feedback found</p>
        </div>
      ) : (
        <div className="customer-table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.ratingId}>
                  <td>{fb.ratingId}</td>
                  <td>{fb.customerName}</td>
                  <td>{fb.rating}</td>
                  <td>{fb.review}</td>
                  <td>{formatDate(fb.createDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerFeedback;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './EarningsByDate.css';

const EarningsByDate = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [earnings, setEarnings] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchEarnings = async () => {
    const token = localStorage.getItem('token');
    const restaurantId = localStorage.getItem('restaurantId'); // Adjust based on your storage

    if (!token) {
      setError('You need to log in first.');
      navigate('/login');
      return;
    }

    if (!restaurantId || !startDate || !endDate) {
      setError('Please provide all required inputs.');
      return;
    }

    setLoading(true);
    setError('');
    setEarnings(null);

    try {
      const response = await api.get(
        `/radmin/get-restaurant-earnings-by-date/${restaurantId}/${startDate}/${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        setEarnings(response.data[0]);
      } else {
        setError('No earnings found for the selected date range.');
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);

      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to fetch earnings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="earnings-date-container">
      <h2>Restaurant Earnings by Date</h2>
      <div className="date-inputs">
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={fetchEarnings} disabled={loading}>
          {loading ? 'Loading...' : 'Get Earnings'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {earnings && (
        <div className="earnings-result">
          <h3>{earnings.restaurantName}</h3>
          <p>Total Earnings: {earnings.totalIncome}Rs</p>
        </div>
      )}
    </div>
  );
};

export default EarningsByDate;

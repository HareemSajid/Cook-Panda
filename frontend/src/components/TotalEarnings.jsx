import React, { useState } from 'react';
import api from '../api'; // Adjust path if needed

const TotalEarningsComponent = () => {
  const [totalEarnings, setTotalEarnings] = useState(null);
  const [earningsMessage, setEarningsMessage] = useState('');

  const fetchTotalEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setEarningsMessage('You need to log in first.');
        return;
      }

      const res = await api.get('/radmin/get-total-earnings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if the response is empty or contains 0 earnings
      if (res.data === '0' || !res.data || res.data.length === 0) {
        setTotalEarnings(0);
        setEarningsMessage('No earnings found.');
      } else {
        // Assuming the first record contains the earnings data
        setTotalEarnings(res.data[0].totalIncome);
        setEarningsMessage('');
      }
    } catch (err) {
      console.error('Error fetching total earnings:', err);
      setEarningsMessage('Failed to load total earnings');
    }
  };

  return (
    <div>
      <button onClick={fetchTotalEarnings}>Get Total Earnings</button>

      {earningsMessage && <p style={{ color: 'black' }}>{earningsMessage}</p>}
      {totalEarnings !== null && (
  <p>
    Total Earnings for restaurant ID: {JSON.parse(atob(localStorage.getItem('token').split('.')[1])).restaurantId} —  {totalEarnings}Rs
  </p>
)}

     
    </div>
  );
};

export default TotalEarningsComponent;
//{totalEarnings !== null && <p>Total Earnings: Rs {totalEarnings}</p>}
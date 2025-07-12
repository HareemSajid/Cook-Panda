import React, { useState } from 'react';
import api from '../api'; // Adjust the import path if needed

const RestaurantOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You need to log in first.');
        return;
      }

      const res = await api.get('/radmin/get-restaurant-order-history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data || res.data.length === 0) {
        setMessage('No order history found.');
        setOrders([]);
      } else {
        setOrders(res.data);
        setMessage('');
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
      setMessage('Failed to load order history.');
    }
  };

  return (
    <div>
      <button onClick={fetchOrderHistory}>Get Order History</button>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {orders.length > 0 && (
        <table border="1" cellPadding="10" style={{ marginTop: '15px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer ID</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Order Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.customerId}</td>
                <td>{order.statusOrder}</td>
                <td>{order.totalAmount}Rs</td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RestaurantOrderHistory;

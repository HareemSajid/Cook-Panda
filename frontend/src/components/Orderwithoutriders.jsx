import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './OrdersWithoutRider.css';

const OrdersWithoutRider = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/radmin/get-orders-without-rider');

        if (response.data && response.data.length > 0) {
          setOrders(response.data);
          setError('');
        } else {
          setError('No orders without riders found.');
        }
      } catch (err) {
        console.error('API error:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="simple-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="simple-container">
      <h1>Orders Without Riders</h1>

      <div className="search-placeholder">
        <p>Search orders...</p>
      </div>

      {error ? (
        <div className="message-box">
          <p>{error}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.orderId}>
              <h3>Order #{order.orderId}</h3>
              <p><strong>Customer ID:</strong> {order.customerId}</p>
              <p><strong>Status:</strong> {order.statusOrder}</p>
              <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
              <p><strong>Address:</strong> {order.deliveryAddress}</p>
              <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersWithoutRider;

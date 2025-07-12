import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './OrderProgress.css';

const OrderProgress = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderProgress = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to log in first.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/radmin/track-order-progress', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          throw new Error('Session expired');
        }

        if (response.data && response.data.length > 0) {
          setOrders(groupOrdersById(response.data));
        } else {
          setError('No orders found');
        }
      } catch (err) {
        console.error('Error fetching order progress:', err);

        if (err.response?.status === 401 || err.message === 'Session expired') {
          localStorage.removeItem('token');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response?.data || 'Failed to load order data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderProgress();
  }, [navigate]);

  const groupOrdersById = (orders) => {
    const grouped = {};

    orders.forEach((order) => {
      if (!grouped[order.orderId]) {
        grouped[order.orderId] = {
          ...order,
          items: [],
        };
      }

      grouped[order.orderId].items.push({
        itemId: order.itemId,
        quantity: order.quantity,
        subtotal: order.subtotal,
      });
    });

    return Object.values(grouped);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'pending': 'status-pending',
      'delivered': 'status-delivered'
    };
    return (
      <span className={`status-badge ${statusClasses[status?.toLowerCase()] || ''}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="order-progress-container">
        <div className="loading-spinner"></div>
        <p>Loading order data...</p>
      </div>
    );
  }

  return (
    <div className="order-progress-container">
      <div className="header-bar">
        <h1>Order Progress Tracking</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
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
      ) : orders.length === 0 && !error ? (
        <div className="no-orders">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="order-table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Restaurant</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Rider ID</th>
                <th>Rider Name</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.orderId}>
                  <tr className="order-summary-row">
                    <td>#{order.orderId}</td>
                    <td>{order.restaurantName || 'N/A'}</td>
                    <td>{getStatusBadge(order.statusOrder)}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{order.deliveryRiderId || 'Unassigned'}</td>
                    <td>{order.riderName || 'Unassigned'}</td>
                  </tr>
                  <tr className="order-items-row">
                    <td colSpan="6">
                      <table className="nested-items-table">
                        <thead>
                          <tr>
                            <th>Item ID</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.itemId}</td>
                              <td>{item.quantity}</td>
                              <td>${item.subtotal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderProgress;

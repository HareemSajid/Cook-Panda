import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './PendingOrders.css'; // You can reuse or create similar styles

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to log in first.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/radmin/get-pending-orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          throw new Error('Session expired');
        }

        if (response.data && response.data.length > 0) {
          setOrders(response.data);
        } else {
          setError('No pending orders found');
        }
      } catch (err) {
        console.error('Error fetching pending orders:', err);

        if (err.response?.status === 401 || err.message === 'Session expired') {
          localStorage.removeItem('token');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response?.data?.error || 'Failed to load orders data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, [navigate]);

  const filteredOrders = orders.filter(order =>
    order.orderId.toString().includes(searchTerm.toLowerCase()) ||
    order.customerId.toString().includes(searchTerm.toLowerCase()) ||
    order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="order-management-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-management-container">

      <div className="order-management-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>
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
      ) : filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>No pending orders found</p>
        </div>
      ) : (
        <div className="order-table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Restaurant ID</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Order Date</th>
                <th>Rider ID</th>
                <th>Delivery Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.customerId}</td>
                  <td>{order.restaurantId}</td>
                  <td>
                    <span className={`status-badge status-${order.statusOrder.toLowerCase().replace(' ', '-')}`}>
                      {order.statusOrder}
                    </span>
                  </td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>{order.deliveryRiderId || 'Not assigned'}</td>
                  <td>{order.deliveryAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingOrders;
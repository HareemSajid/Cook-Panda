




/*import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './CustomerManagement.css';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      // Check for token first
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to log in first.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/radmin/restaurantCustomerDetails', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          throw new Error('Session expired');
        }

        if (response.data && response.data.length > 0) {
          setCustomers(response.data);
        } else {
          setError('No customers found');
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
        
        // Handle unauthorized (401) errors
        if (err.response?.status === 401 || err.message === 'Session expired') {
          localStorage.removeItem('token');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response?.data?.message || 'Failed to load customer data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [navigate]);

  const filteredCustomers = customers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="customer-management-container">
        <div className="loading-spinner"></div>
        <p>Loading customer data...</p>
      </div>
    );
  }

  return (
    <div className="customer-management-container">
      <div className="header-bar">
        <h1>Customer Management</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="customer-management-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search customers..."
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
      ) : filteredCustomers.length === 0 && !error ? (
        <div className="no-customers">
          <p>No customers found</p>
        </div>
      ) : (
        <div className="customer-table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.customerId}>
                  <td>{customer.customerId}</td>
                  <td>{customer.customerName}</td>
                  <td>{customer.customerEmail}</td>
                  <td>{formatDate(customer.customerSince)}</td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => navigate(`/customer-details/${customer.customerId}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;*/


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './CustomerManagement.css';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to log in first.');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const response = await api.get('/radmin/restaurantCustomerDetails', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          throw new Error('Session expired');
        }

        if (response.data && response.data.length > 0) {
          setCustomers(response.data);
        } else {
          setError('No customers found');
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
        
        if (err.response?.status === 401 || err.message === 'Session expired') {
          localStorage.removeItem('token');
          setError('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response?.data?.message || 'Failed to load customer data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="customer-management-container">
        <div className="loading-spinner"></div>
        <p>Loading customer data...</p>
      </div>
    );
  }

  return (
    <div className="customer-management-container">
      <div className="header-bar">
        <h1>Customer Management</h1>
        {/* <button onClick={handleLogout} className="logout-btn">
          Logout
        </button> */}
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
      ) : customers.length === 0 ? (
        <div className="no-customers">
          <p>No customers found</p>
        </div>
      ) : (
        <div className="customer-table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Member Since</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerId}>
                  <td>{customer.customerId}</td>
                  <td>{customer.customerName}</td>
                  <td>{customer.customerEmail}</td>
                  <td>{formatDate(customer.customerSince)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;

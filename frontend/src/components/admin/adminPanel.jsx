import React, { useEffect, useState } from 'react';
import api from '../../api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    customers: [],
    restaurantAdmins: [],
    deliveryWorkers: [],
    restaurants: [],
  });

  const [approvedAdmins, setApprovedAdmins] = useState([]);
  const [approvedDeliveryWorkers, setApprovedDeliveryWorkers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [usersAddedToday, setUsersAddedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApproved, setLoadingApproved] = useState(false);
  const [loadingApprovedRiders, setLoadingApprovedRiders] = useState(false);
  const [loadingIncomes, setLoadingIncomes] = useState(false);
  const [loadingIncomesByDate, setLoadingIncomesByDate] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingUsersToday, setLoadingUsersToday] = useState(false);

  // Popup states
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminStatusMessage, setAdminStatusMessage] = useState('');

  const [showRiderPopup, setShowRiderPopup] = useState(false);
  const [riderIdInput, setRiderIdInput] = useState('');
  const [riderStatusMessage, setRiderStatusMessage] = useState('');

  const [showRemoveAdminPopup, setShowRemoveAdminPopup] = useState(false);
  const [removeAdminInput, setRemoveAdminInput] = useState('');
  const [removeAdminMessage, setRemoveAdminMessage] = useState('');

  const [showRemoveRiderPopup, setShowRemoveRiderPopup] = useState(false);
  const [removeRiderInput, setRemoveRiderInput] = useState('');
  const [removeRiderMessage, setRemoveRiderMessage] = useState('');

  const [showNewRestaurantPopup, setShowNewRestaurantPopup] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({ 
    name: '', 
    address: '', 
    contact: '',
    image: null
  });
  const [restaurantMsg, setRestaurantMsg] = useState('');

  const [showAssignAdminPopup, setShowAssignAdminPopup] = useState(false);
  const [restaurantIdInput, setRestaurantIdInput] = useState('');
  const [assignAdminIdInput, setAssignAdminIdInput] = useState('');
  const [assignAdminMessage, setAssignAdminMessage] = useState('');

  const [showDateRangePopup, setShowDateRangePopup] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [restaurantIncomes, setRestaurantIncomes] = useState([]);
  const [incomeError, setIncomeError] = useState(null);

  const [showDeleteRestaurantPopup, setShowDeleteRestaurantPopup] = useState(false);
  const [deleteRestaurantId, setDeleteRestaurantId] = useState('');
  const [deleteRestaurantMessage, setDeleteRestaurantMessage] = useState('');

  useEffect(() => {
    const fetchUsersAndRestaurants = async () => {
      try {
        const res = await api.get('/admin/users');
        const { customers = [], restaurantAdmins = [], deliveryWorkers = [], restaurants = [] } = res.data || {};
        setData({ customers, restaurantAdmins, deliveryWorkers, restaurants });
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsersAndRestaurants();
  }, []);

  useEffect(() => {
    if (activeTab === 'restaurants') {
      fetchRestaurants();
    }
  }, [activeTab]);

  const fetchApprovedAdmins = async () => {
    setLoadingApproved(true);
    try {
      const res = await api.get('/admin/approved_restaurant_admins');
      setApprovedAdmins(res.data.restaurantAdmins || []);
    } catch (err) {
      console.error('Failed to fetch approved restaurant admins:', err);
    } finally {
      setLoadingApproved(false);
    }
  };

  const fetchApprovedDeliveryWorkers = async () => {
    setLoadingApprovedRiders(true);
    try {
      const res = await api.get('/admin/approved_delivery_workers');
      setApprovedDeliveryWorkers(res.data.deliveryworkers || []);
    } catch (err) {
      console.error('Failed to fetch approved delivery workers:', err);
    } finally {
      setLoadingApprovedRiders(false);
    }
  }; 


  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const res = await api.get('/admin/restaurants');
      setRestaurants(res.data.restaurants || []);
      console.log("Restaurant data:", res.data.restaurants);

    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoadingRestaurants(false);
    }
  };
  const fetchUsersAddedToday = async () => {
    setLoadingUsersToday(true);
    try {
      const res = await api.get('/admin/usersAddedToday');
      setUsersAddedToday(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users added today:', err);
    } finally {
      setLoadingUsersToday(false);
    }
  };
  
  const fetchRestaurantIncomes = async () => {
    setIncomeError(null);
    setLoadingIncomes(true);
    try {
      const res = await api.get('/admin/restaurantIncome');
      console.log("RAW API RESPONSE:", res);
      console.log("Response Data Structure:", {
        data: res.data,
        dataType: typeof res.data,
        isArray: Array.isArray(res.data),
        hasDataProp: !!res.data.data,
        dataPropType: typeof res.data?.data
      });
  
      // Handle both array and object responses
      const incomeData = Array.isArray(res.data) 
        ? res.data 
        : res.data.data || [];
  
      console.log("Processed Income Data:", incomeData);
      setRestaurantIncomes(incomeData);
    } catch (err) {
      console.error('Error fetching incomes:', err);
      setIncomeError(err.message);
    } finally {
      setLoadingIncomes(false);
    }
  };
  
  const fetchRestaurantIncomesByDate = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setIncomeError('Please select both start and end dates');
      return;
    }
  
    setIncomeError(null);
    setLoadingIncomesByDate(true);
    try {
      const res = await api.post('/admin/restaurantIncomebyDate', dateRange);
      console.log("API Response by Date:", res.data); // Debug log
      
      // Handle both possible response structures
      const incomeData = res.data.data || res.data;
      
      if (incomeData && Array.isArray(incomeData) && incomeData.length > 0) {
        console.log("Processed Income Data by Date:", incomeData); // Debug log
        setRestaurantIncomes(incomeData);
      } else {
        setIncomeError('No income data available for selected dates');
        setRestaurantIncomes([]);
      }
    } catch (err) {
      console.error('Failed to fetch restaurant incomes by date:', err.response || err);
      setIncomeError(`Failed to load income data: ${err.message}`);
      setRestaurantIncomes([]);
    } finally {
      setLoadingIncomesByDate(false);
      setShowDateRangePopup(false);
    }
  };
  const approveAdminStatus = async () => {
    try {
      const res = await api.put('/admin/update_ra_status', { adminid: parseInt(adminIdInput) });
      setAdminStatusMessage(res.data.message);
      setShowAdminPopup(false);
      setAdminIdInput('');
      fetchApprovedAdmins();
    } catch (err) {
      setAdminStatusMessage('Error updating admin status');
    }
  };

  const approveRiderStatus = async () => {
    try {
      const res = await api.put('/admin/update_dw_status', { riderid: parseInt(riderIdInput) });
      setRiderStatusMessage(res.data.message);
      setShowRiderPopup(false);
      setRiderIdInput('');
      fetchApprovedDeliveryWorkers();
    } catch (err) {
      setRiderStatusMessage('Error updating rider status');
    }
  };

  const removeAdmin = async () => {
    try {
      const res = await api.post('/admin/remove_admin', { adminid: parseInt(removeAdminInput) });
      setRemoveAdminMessage(res.data.message);
      setShowRemoveAdminPopup(false);
      setRemoveAdminInput('');
      fetchApprovedAdmins();
    } catch (err) {
      setRemoveAdminMessage('Error removing admin');
    }
  };

  const removeRider = async () => {
    try {
      const res = await api.post('/admin/removerider', { riderid: parseInt(removeRiderInput) });
      setRemoveRiderMessage(res.data.message);
      setShowRemoveRiderPopup(false);
      setRemoveRiderInput('');
      fetchApprovedDeliveryWorkers();
    } catch (err) {
      setRemoveRiderMessage('Error removing rider');
    }
  }; 
  
  const addRestaurant = async () => {
    try {
      const formData = new FormData();
      formData.append('name', restaurantForm.name);
      formData.append('address', restaurantForm.address);
      formData.append('contact', restaurantForm.contact);
      if (restaurantForm.image) {
        formData.append('image', restaurantForm.image);
      }
  
      for (let [key, value] of formData.entries()) {
       }
  
      const res = await api.post('/admin/newRestaurant', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      setRestaurantMsg(res.data.message);
      setShowNewRestaurantPopup(false);
      setRestaurantForm({ name: '', address: '', contact: '', image: null });
      fetchRestaurants();
    } catch (err) {
      setRestaurantMsg(err.response?.data?.message || 'Error adding restaurant');
    }
  };
  const assignRestaurantAdmin = async () => {
    try {
      const res = await api.post('/admin/newrestaurantadmin', { 
        restaurantid: parseInt(restaurantIdInput), 
        adminid: parseInt(assignAdminIdInput) 
      });
      setAssignAdminMessage(res.data.message);
      setShowAssignAdminPopup(false);
      setRestaurantIdInput('');
      setAssignAdminIdInput('');
      fetchRestaurants();
    } catch (err) {
      setAssignAdminMessage('Error assigning admin');
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!deleteRestaurantId) {
      setDeleteRestaurantMessage('Please select a restaurant to delete');
      return;
    }
    
    try {
      const res = await api.put('/admin/deleteRestaurant', { restaurantId: parseInt(deleteRestaurantId) });
      setDeleteRestaurantMessage(res.data.message);
      setShowDeleteRestaurantPopup(false);
      setDeleteRestaurantId('');
      fetchRestaurants(); // Refresh the restaurants list
    } catch (err) {
      setDeleteRestaurantMessage(err.response?.data?.message || 'Error deleting restaurant');
    }
  };
  const renderTable = (title, list, idKey) => (
    <div className="table-container">
      <h2>{title}</h2>
      {list.length === 0 ? (
        <p>No data available</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Create Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => (
              <tr key={user[idKey]}>
                <td>{user[idKey]}</td>
                <td>{user.userName}</td>
                <td>{user.email}</td>
                <td>{new Date(user.createDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${user.Disablebit ? 'disabled' : 'active'}`}>
                    {user.Disablebit ? 'Disabled' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
//

//
  const renderApprovedSection = (title, list, idKey) => (
    <div className="table-container">
      <h2>{title}</h2>
      {list.length === 0 ? (
        <p>No data loaded yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Create Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((entry) => (
              <tr key={entry[idKey]}>
                <td>{entry[idKey]}</td>
                <td>{entry.userName}</td>
                <td>{entry.email}</td>
                <td>{new Date(entry.createDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${entry.Disablebit ? 'disabled' : 'active'}`}>
                    {entry.Disablebit ? 'Disabled' : 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
  
  const renderIncomeTable = () => {
    console.log("Rendering with incomes:", {
      data: restaurantIncomes,
      loading: loadingIncomes || loadingIncomesByDate,
      error: incomeError
    });
  
    if (loadingIncomes || loadingIncomesByDate) {
      return <div className="loading-indicator">Loading income data...</div>;
    }
  
    if (incomeError) {
      return <div className="error-message">{incomeError}</div>;
    }
  
    if (!restaurantIncomes || restaurantIncomes.length === 0) {
      return <div className="no-data">No income records found</div>;
    }
  
    // Safely access the first item to check for date field
    const hasDateField = restaurantIncomes[0]?.orderDate || 
                        restaurantIncomes[0]?.date || 
                        restaurantIncomes[0]?.createdAt;
  
    return (
      <div className="income-table-container">
        <h2>Restaurant Income Report</h2>
        <table className="income-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Restaurant</th>
              <th>Income</th>
              {hasDateField && <th>Date</th>}
            </tr>
          </thead>
          <tbody>
            {restaurantIncomes.map((item, index) => {
              const record = {
              
                              id: item.id || item.restaurantid || item.restaurantId || item._id || 'N/A',
              
                              name: item.name || item.restaurantname || item.restaurantName || item.restaurant?.name || 'Unknown',
              
                              income: parseFloat(
              
                                item.totalincome ||
              
                                item.totalIncome ||
              
                                item.income ||
              
                                item.total_income ||
                                item.value ||
              
                                0
              
                              ).toFixed(2),
              
                              date: item.orderDate || item.date || item.createdAt
              
                            };
              console.log(`Rendering row ${index}:`, record); // Debug each row
  
              return (
                <tr key={index} className="income-row">
                  <td>{record.id}</td>
                  <td>{record.name}</td>
                  <td>${record.income}</td>
                  {hasDateField && (
                    <td>{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  const renderRestaurants = () => {
    if (loadingRestaurants) return <div className="loading">Loading restaurants...</div>;
  
    return (
      <div className="restaurants-container">
        <div className="restaurants-header">
          <h2>All Restaurants</h2>
          <button 
            onClick={() => setShowNewRestaurantPopup(true)} 
            className="btn btn-primary"
          >
            Add New Restaurant
          </button>
        </div>
        
        {restaurants.length === 0 ? (
          <p className="no-restaurants">No restaurants found</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>AdminID</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Approved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(restaurant => (
                  <tr key={restaurant.restaurant_id}>
                    <td>{restaurant.restaurant_id}</td>
                    <td>
                      <div 
                        className="restaurant-name-with-image"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {restaurant.image_url && (
                          <img 
                            src={restaurant.image_url} 
                            alt={restaurant.name} 
                            style={{ 
                              width: '100px', 
                              height: 'auto', 
                              borderRadius: '8px', 
                              marginRight: '10px' 
                            }} 
                          />
                        )}
                        <span>{restaurant.name}</span>
                      </div>
                    </td>
                    <td>{!restaurant.adminId ? 'Not Set Yet' : restaurant.adminId }</td>
                    <td>{restaurant.address}</td>
                    <td>{restaurant.contact}</td>
                    <td>
                      <span className={`status-badge ${!restaurant.Disablebit ? 'active' : 'inactive'}`}>
                        {!restaurant.Disablebit ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${restaurant.statusApprove ? 'active' : 'inactive'}`}>
                        {restaurant.statusApprove ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => {
                          setDeleteRestaurantId(restaurant.restaurant_id);
                          setShowDeleteRestaurantPopup(true);
                        }} 
                        className="btn btn-danger btn-sm"
                      >
                        Delete
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
  
  const renderUsersAddedToday = () => {
    if (loadingUsersToday) return <div className="loading">Loading users added today...</div>;
    
    return (
      <div className="table-container">
        <h2>Users Added Today</h2>
        {usersAddedToday.length === 0 ? (
          <p>No users added today</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>User Type</th>
                <th>Create Date</th>
              </tr>
            </thead>
            <tbody>
              {usersAddedToday.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.userName}</td>
                  <td>{user.email}</td>
                  <td>{user.userType}</td>
                  <td>{new Date(user.createDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };
  const [totalIncome, setTotalIncome] = useState(0);
  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await api.get("/admin/totalIncome"); // adjust route if needed
        if (res.data.success) {
          setTotalIncome(res.data.totalIncome);
        }
      } catch (err) {
        console.error("Error fetching total income:", err);
      }
    };

    fetchIncome();
  }, []);
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
<div className="stats-card">
      <h3>Earnings</h3>
      <p>${totalIncome.toLocaleString()}</p>
    </div>
            
            <div className="action-buttons">
              <button onClick={fetchApprovedAdmins} className="btn btn-primary" disabled={loadingApproved}>
                {loadingApproved ? 'Loading...' : 'View Approved Admins'}
              </button>
              <button onClick={fetchApprovedDeliveryWorkers} className="btn btn-primary" disabled={loadingApprovedRiders}>
                {loadingApprovedRiders ? 'Loading...' : 'View Approved Riders'}
              </button>
              <button onClick={() => setShowAdminPopup(true)} className="btn btn-success">
                Approve Restaurant Admin
              </button>
              <button onClick={() => setShowRiderPopup(true)} className="btn btn-success">
                Approve Delivery Rider
              </button>
              <button onClick={() => setShowRemoveAdminPopup(true)} className="btn btn-danger">
                Remove Restaurant Admin
              </button>
              <button onClick={() => setShowRemoveRiderPopup(true)} className="btn btn-danger">
                Remove Delivery Rider
              </button>
              <button onClick={() => setShowNewRestaurantPopup(true)} className="btn btn-info">
                Add New Restaurant
              </button>
              <button onClick={() => setShowAssignAdminPopup(true)} className="btn btn-warning">
                Assign Restaurant Admin
              </button>
              <button 
                onClick={fetchRestaurantIncomes} 
                className="btn btn-primary"
                disabled={loadingIncomes}
              >
                {loadingIncomes ? 'Loading...' : 'View Restaurant Incomes'}
              </button>
              <button 
                onClick={() => setShowDateRangePopup(true)} 
                className="btn btn-primary"
                disabled={loadingIncomesByDate}
              >
                {loadingIncomesByDate ? 'Loading...' : 'View Incomes By Date'}
              </button>
              <button onClick={fetchUsersAddedToday} className="btn btn-primary" disabled={loadingUsersToday}>
                {loadingUsersToday ? 'Loading...' : 'View Users Added Today'}
              </button>
              <button 
                onClick={() => {
                  // Before showing delete popup, ensure we have restaurant data
                  if (restaurants.length === 0) {
                    fetchRestaurants();
                  }
                  setShowDeleteRestaurantPopup(true);
                }} 
                className="btn btn-danger"
              >
                Delete Restaurant
              </button>
            </div>

            {approvedAdmins.length > 0 && renderApprovedSection('Approved Restaurant Admins', approvedAdmins, 'adminId')}
            {approvedDeliveryWorkers.length > 0 && renderApprovedSection('Approved Delivery Workers', approvedDeliveryWorkers, 'riderId')}
            {renderIncomeTable()}
            {usersAddedToday.length > 0 && renderUsersAddedToday()}
          </div>
        );
      case 'users':
        return (
          <div className="tab-content">
            {renderTable('Customers', data.customers, 'customerId')}
            {renderTable('Restaurant Admins', data.restaurantAdmins, 'adminId')}
            {renderTable('Delivery Workers', data.deliveryWorkers, 'riderId')}
          </div>
        );
      case 'restaurants':
        return (
          <div className="tab-content">
            <div className="restaurants-header">
              <h2>Restaurants Management</h2>
              <button 
                onClick={() => setShowNewRestaurantPopup(true)} 
                className="btn btn-primary"
              >
                Add New Restaurant
              </button>
            </div>
            {renderRestaurants()}
          </div>
        );
      default:
        return <div className="tab-content">Select a tab to view content</div>;
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin</h2>
        </div>
        <ul className="sidebar-menu">
          <li 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </li>
          <li 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </li>
          <li 
            className={activeTab === 'restaurants' ? 'active' : ''}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurants
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>cookpanda</h1>
        </div>
        {renderContent()}
      </div>

      {/* Popup Modals */}
      {showAdminPopup && (
        <Popup title="Enter Admin ID to Approve" onClose={() => setShowAdminPopup(false)}>
          <input 
            type="number" 
            value={adminIdInput} 
            onChange={(e) => setAdminIdInput(e.target.value)} 
            placeholder="Enter Admin ID"
          />
          <button onClick={approveAdminStatus} className="btn btn-primary">Submit</button>
          {adminStatusMessage && <p className="status-message">{adminStatusMessage}</p>}
        </Popup>
      )}

      {showRiderPopup && (
        <Popup title="Enter Rider ID to Approve" onClose={() => setShowRiderPopup(false)}>
          <input 
            type="number" 
            value={riderIdInput} 
            onChange={(e) => setRiderIdInput(e.target.value)} 
            placeholder="Enter Rider ID"
          />
          <button onClick={approveRiderStatus} className="btn btn-primary">Submit</button>
          {riderStatusMessage && <p className="status-message">{riderStatusMessage}</p>}
        </Popup>
      )}

      {showRemoveAdminPopup && (
        <Popup title="Enter Admin ID to Remove" onClose={() => setShowRemoveAdminPopup(false)}>
          <input 
            type="number" 
            value={removeAdminInput} 
            onChange={(e) => setRemoveAdminInput(e.target.value)} 
            placeholder="Enter Admin ID"
          />
          <button onClick={removeAdmin} className="btn btn-danger">Submit</button>
          {removeAdminMessage && <p className="status-message">{removeAdminMessage}</p>}
        </Popup>
      )}

      {showRemoveRiderPopup && (
        <Popup title="Enter Rider ID to Remove" onClose={() => setShowRemoveRiderPopup(false)}>
          <input 
            type="number" 
            value={removeRiderInput} 
            onChange={(e) => setRemoveRiderInput(e.target.value)} 
            placeholder="Enter Rider ID"
          />
          <button onClick={removeRider} className="btn btn-danger">Submit</button>
          {removeRiderMessage && <p className="status-message">{removeRiderMessage}</p>}
        </Popup>
      )}

      {showNewRestaurantPopup && (
        <Popup title="Add New Restaurant" onClose={() => setShowNewRestaurantPopup(false)}>
          <input 
            placeholder="Name" 
            value={restaurantForm.name} 
            onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })} 
            required
          />
          <input 
            placeholder="Address" 
            value={restaurantForm.address} 
            onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })} 
            required
          />
          <input 
            placeholder="Contact" 
            value={restaurantForm.contact} 
            onChange={(e) => setRestaurantForm({ ...restaurantForm, contact: e.target.value })} 
          />
          <input 
            type="file" 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setRestaurantForm({ ...restaurantForm, image: file });
              }
            }} 
            accept="image/*"
          />
          <button onClick={addRestaurant} className="btn btn-primary">Add</button>
          {restaurantMsg && <p className="status-message">{restaurantMsg}</p>}
        </Popup>
      )}

      {showAssignAdminPopup && (
        <Popup title="Assign Restaurant Admin" onClose={() => setShowAssignAdminPopup(false)}>
          <input 
            placeholder="Restaurant ID" 
            value={restaurantIdInput} 
            onChange={(e) => setRestaurantIdInput(e.target.value)} 
          />
          <input 
            placeholder="Admin ID" 
            value={assignAdminIdInput} 
            onChange={(e) => setAssignAdminIdInput(e.target.value)} 
          />
          <button onClick={assignRestaurantAdmin} className="btn btn-primary">Assign</button>
          {assignAdminMessage && <p className="status-message">{assignAdminMessage}</p>}
        </Popup>
      )}

      {showDateRangePopup && (
        <Popup title="Select Date Range" onClose={() => setShowDateRangePopup(false)}>
          <div className="date-range-inputs">
            <label>
              Start Date:
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </label>
            <label>
              End Date:
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </label>
          </div>
          <button 
            onClick={fetchRestaurantIncomesByDate} 
            className="btn btn-primary"
            disabled={!dateRange.startDate || !dateRange.endDate}
          >
            Submit
          </button>
        </Popup>
      )}

      {showDeleteRestaurantPopup && (
        <Popup title="Delete Restaurant" onClose={() => setShowDeleteRestaurantPopup(false)}>
          <input 
            type="number" 
            value={deleteRestaurantId} 
            onChange={(e) => setDeleteRestaurantId(e.target.value)} 
            placeholder="Enter Restaurant ID"
          />
          <button onClick={handleDeleteRestaurant} className="btn btn-danger">Delete</button>
          {deleteRestaurantMessage && <p className="status-message">{deleteRestaurantMessage}</p>}
        </Popup>
      )}
    </div>
  );
};

const Popup = ({ title, children, onClose }) => (
  <div className="popup-overlay">
    <div className="popup">
      <h3>{title}</h3>
      {children}
      <button onClick={onClose} className="btn btn-close">Close</button>
    </div>
  </div>
);

export default AdminPanel;

// CSS
const styles = `
.admin-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f8f8;
}

.sidebar {
  width: 250px;
  background-color: #d70f64;
  color: white;
  padding: 20px 0;
}

.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
  color: white;
}

.sidebar-menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-menu li.active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.main-content {
  flex: 1;
  background-color: #f8f8f8;
}

.header {
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  color: #d70f64;
  font-size: 1.8rem;
}

.dashboard-content {
  padding: 20px;
}

.stats-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 200px;
}

.stats-card h3 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #666;
}

.stats-card p {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #d70f64;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color:rgb(236, 100, 180);
  color: white;
}

.btn-primary:hover {
  background-color:rgb(218, 75, 75);
}

.btn-success {
  background-color: rgb(236, 100, 180);
  color: white;
}

.btn-success:hover {
  background-color: rgb(244, 54, 54);
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: rgb(244, 54, 54);
}

.btn-info {
  background-color: rgb(235, 94, 176);
  color: white;
}

.btn-info:hover {
  background-color: rgb(244, 54, 54);
}

.btn-warning {
  background-color:rgb(235, 94, 176);
  color: white;
}

.btn-warning:hover {
  background-color:rgb(244, 54, 54);
}

.btn-close {
  background-color: #666;
  color: white;
  margin-top: 15px;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table-container h2 {
  margin-top: 0;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: 600;
  color: #333;
  background-color: #f5f5f5;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e6f7ee;
  color: #4CAF50;
}

.status-badge.disabled {
  background-color: #ffebee;
  color: #f44336;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.popup h3 {
  margin-top: 0;
  color: #d70f64;
}

.popup input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.status-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.loading {
  padding: 2rem;
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}

.date-range-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 15px 0;
}

.date-range-inputs label {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.date-range-inputs input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-message {
  color: #f44336;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 15px;
}

.restaurants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.restaurant-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.restaurant-card:hover {
  transform: translateY(-5px);
}

.restaurant-image {
  height: 200px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  color: #888;
}

.restaurant-info {
  padding: 15px;
}

.restaurant-info h3 {
  margin: 0 0 10px 0;
  color: #d70f64;
}

.restaurant-meta {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  color: #666;
}

.restaurant-status {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.status {
  font-weight: bold;
}

.status.active {
  color: #4CAF50;
}

.status.inactive {
  color: #f44336;
}

.restaurants-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.restaurant-actions {
  padding: 10px 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}
`;

// Inject styles
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);
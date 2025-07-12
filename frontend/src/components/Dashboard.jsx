import React, { useState } from 'react'; 
import { Routes, Route, Link, useLocation } from 'react-router-dom'; 
import RestaurantOverview from './RestaurantOverview.jsx'; 
import CustomerDetailsView from './CustomerDetailsView.jsx'; 
import TotalEarnings from './TotalEarnings.jsx'; 
import PopularItem from './PopularItem.jsx'; 
import AvgRating from './AvgRating.jsx'; 
import CustomerFeedback from './CustomerFeedback.jsx'; 
import OrderProgress from './orderprogress.jsx'; 
import OrderwithoutRiders from './Orderwithoutriders.jsx'; 
import PendingOrders from './PendingOrders.jsx'; 
import RestaurantOrderHistory from './RestaurantOrderHistory.jsx'; 
import UpdateOrderStatus from './UpdateOrderStatus.jsx'; 
import DisplayAllMenuItems from './DisplayAllMenuItems.jsx'; 
import AddMenuItems from './AddMenuItems.jsx'; 
import UpdateMenuItemPrice from './UpdateMenuItemPrice.jsx'; 
import RemoveMenuItem from './RemoveMenuItem.jsx'; 

const Dashboard = () => { 
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Organize sidebar items into categories
  const menuItems = [
    {
      category: "Overview",
      items: [
        { path: "/restaurant-admin/dashboard", label: "Dashboard", icon: "📊" }
      ]
    },
    {
      category: "Menu",
      items: [
        { path: "/restaurant-admin/menu-management", label: "All Menu Items", icon: "🍽️" },
        { path: "/restaurant-admin/AddMenuItems", label: "Add Menu Items", icon: "➕" },
        { path: "/restaurant-admin/UpdateMenuItemPrice", label: "Update Prices", icon: "💲" },
        { path: "/restaurant-admin/RemoveMenuItem", label: "Remove Items", icon: "🗑️" }
      ]
    },
    {
      category: "Orders",
      items: [
        { path: "/restaurant-admin/orders", label: "Order Progress", icon: "🔄" },
        { path: "/restaurant-admin/PendingOrders", label: "Pending Orders", icon: "⏳" },
        { path: "/restaurant-admin/OrderwithoutRiders", label: "Orders Without Riders", icon: "🚫" },
        { path: "/restaurant-admin/UpdateOrderStatus", label: "Update Status", icon: "📝" },
        { path: "/restaurant-admin/RestaurantOrderHistory", label: "Order History", icon: "📜" }
      ]
    },
    {
      category: "Customers",
      items: [
        { path: "/restaurant-admin/customer-management", label: "Customer Details", icon: "👥" },
        { path: "/restaurant-admin/customer-feedback", label: "Feedback", icon: "💬" }
      ]
    },
    {
      category: "Analytics",
      items: [
        { path: "/restaurant-admin/analytics", label: "Ratings", icon: "⭐" },
        { path: "/restaurant-admin/TotalEarnings", label: "Earnings", icon: "💰" },
        { path: "/restaurant-admin/PopularItem", label: "Popular Items", icon: "🔥" }
      ]
    }
  ];

  // Shared styles
  const styles = {
    appContainer: {
      display: 'flex',
      height: '100vh',
      fontFamily: 'Inter',
      background: '#f5f5f7',
      color: '#1d1d1f',
      fontSize: '20px',
      fontWeight: '600',
    },
    sidebar: {
      width: sidebarCollapsed ? '80px' : '280px',
      background: 'linear-gradient(180deg, #d70f64 0%, #9c095a 100%)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      height: '100%',
      overflowY: 'auto',
      transition: 'width 0.3s ease',
      position: 'relative',
      zIndex: 10
    },
    sidebarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: sidebarCollapsed ? 'center' : 'space-between',
      padding: sidebarCollapsed ? '20px 0' : '20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    logo: {
      color: 'white',
      fontSize: '22px',
      fontWeight: 'bold',
      margin: 0,
      display: sidebarCollapsed ? 'none' : 'block'
    },
    logoIcon: {
      fontSize: '24px',
      display: sidebarCollapsed ? 'block' : 'none'
    },
    collapseButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '24px'
    },
    categorySection: {
      marginBottom: '10px',
      paddingTop: '15px'
    },
    categoryTitle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: '18px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      padding: sidebarCollapsed ? '10px 0' : '5px 20px',
      margin: '0',
      textAlign: sidebarCollapsed ? 'center' : 'left',
      display: sidebarCollapsed ? 'none' : 'block'
    },
    navList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    navItem: {
      margin: '2px 0'
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      padding: sidebarCollapsed ? '15px 0' : '10px 20px',
      textDecoration: 'none',
      color: 'white',
      fontSize: '18px',
      borderRadius: sidebarCollapsed ? '0' : '8px',
      margin: sidebarCollapsed ? '0' : '0 10px',
      transition: 'all 0.2s ease',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
    },
    activeLink: {
      background: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
    },
    linkIcon: {
      marginRight: sidebarCollapsed ? '0' : '10px',
      fontSize: '16px',
      minWidth: '20px',
      textAlign: 'center'
    },
    linkText: {
      display: sidebarCollapsed ? 'none' : 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    mainContent: {
      flexGrow: 1,
      padding: '20px',
      overflowY: 'auto',
      background: '#f5f5f7',
      borderRadius: sidebarCollapsed ? '0 0 0 20px' : '20px 0 0 20px',
      marginLeft: '-20px',
      paddingLeft: '40px',
      boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease'
    }
  };

  return ( 
    <div style={styles.appContainer}> 
      <div style={styles.sidebar}> 
        <div style={styles.sidebarHeader}>
          <h2 style={styles.logo}>cookpanda</h2>
          <span style={styles.logoIcon}>🐼</span>
          <button 
            style={styles.collapseButton} 
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {menuItems.map((category, index) => (
          <div key={index} style={styles.categorySection}>
            <h3 style={styles.categoryTitle}>{category.category}</h3>
            <ul style={styles.navList}>
              {category.items.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={idx} style={styles.navItem}>
                    <Link 
                      to={item.path} 
                      style={{
                        ...styles.navLink,
                        ...(isActive ? styles.activeLink : {})
                      }}
                    >
                      <span style={styles.linkIcon}>{item.icon}</span>
                      <span style={styles.linkText}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div> 

      <div style={styles.mainContent}> 
        <Routes> 
          <Route path="dashboard" element={<RestaurantOverview />} /> 
          <Route path="menu-management" element={<DisplayAllMenuItems />} /> 
          <Route path="orders" element={<OrderProgress />} /> 
          <Route path="analytics" element={<AvgRating />} /> 
          <Route path="customer-management" element={<CustomerDetailsView />} /> 
          <Route path="customer-feedback" element={<CustomerFeedback />} /> 
          <Route path="TotalEarnings" element={<TotalEarnings />} /> 
          <Route path="PopularItem" element={<PopularItem />} /> 
          <Route path="OrderwithoutRiders" element={<OrderwithoutRiders />} /> 
          <Route path="PendingOrders" element={<PendingOrders />} /> 
          <Route path="RestaurantOrderHistory" element={<RestaurantOrderHistory />} /> 
          <Route path="UpdateOrderStatus" element={<UpdateOrderStatus />} /> 
          <Route path="UpdateMenuItemPrice" element={<UpdateMenuItemPrice />} /> 
          <Route path="RemoveMenuItem" element={<RemoveMenuItem />} /> 
          <Route path="AddMenuItems" element={<AddMenuItems />} /> 
        </Routes> 
      </div> 
    </div> 
  ); 
}; 
 
export default Dashboard;
import React from 'react';
import './AdminDashboard.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Admin</h2>
      <nav>
        <a href="#" className="active">Dashboard</a>
        <a href="#">Menu</a>
        <a href="#">Orders</a>
        <a href="#">Analytics</a>
      </nav>
    </div>
  );
};

export default Sidebar;

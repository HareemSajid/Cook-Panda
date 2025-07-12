import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from "../api";
import "./SectionStyles.css";

const MenuManagement = () => {
  const [activeTab, setActiveTab] = useState('');

  const renderContent = () => {
    switch(activeTab) {
      case 'add':
        return <AddMenuItem />;
      case 'update':
        return <UpdateMenuItemPrice />;
      // ... other cases
      default:
        return <div>Select an operation</div>;
    }
  };

  return (
    <div className="section-container">
      <h2>Menu Management</h2>
      
      <div className="operation-buttons">
        <h3>Procedures (p)</h3>
        <button onClick={() => setActiveTab('add')}>Add new item to menu</button>
        <button onClick={() => setActiveTab('update')}>Update Menu Item Price</button>
        <button onClick={() => setActiveTab('remove')}>Remove Menu Item</button>
        
        <h3>Views (v)</h3>
        <button onClick={() => setActiveTab('all')}>Get Restaurant MenuItems (All)</button>
        <button onClick={() => setActiveTab('no-desc')}>Menu items without Description</button>
      </div>
      
      <div className="content-area">
        {renderContent()}
      </div>
    </div>
  );
};

// Example sub-component
const AddMenuItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.post('/menu/items', formData);
      alert('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Item name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <button type="submit">Add Item</button>
    </form>
  );
};

export default MenuManagement;
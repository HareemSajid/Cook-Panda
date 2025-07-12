import React, { useState } from 'react';
import './AddMenuItem.css'; // Import the CSS file
import api from '../api';

const AddMenuItem = ({ onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    imageUrl: ''
  });
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setMessageType('error');
        setMessage('Only JPEG, PNG, and GIF images are allowed');
        return;
      }
      
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validate inputs
    if (!form.name || !form.description || !form.price) {
      setMessageType('error');
      setMessage('All fields are required');
      return;
    }

    if (isNaN(form.price) || form.price <= 0) {
      setMessageType('error');
      setMessage('Price must be a positive number');
      return;
    }

    if (useFileUpload && !form.image) {
      setMessageType('error');
      setMessage('Please select an image to upload');
      return;
    }

    if (!useFileUpload && !form.imageUrl) {
      setMessageType('error');
      setMessage('Please provide an image URL');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessageType('error');
      setMessage('You must be logged in to add menu items');
      return;
    }

    setIsLoading(true);
    
    try {
      let response;
      
      if (useFileUpload) {
        // File upload approach
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('image', form.image);

        response = await api.post('/radmin/addMenuItem', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Direct URL approach
        response = await api.post('/radmin/addMenuItem', {
          name: form.name,
          description: form.description,
          price: form.price,
          imageUrl: form.imageUrl
        }, {
          headers: {
          },
        });
      }

      setMessageType('success');
      setMessage('Item added successfully!');
      if (onAdd) onAdd(response.data);
      
      // Reset form
      setForm({ name: '', description: '', price: '', image: null, imageUrl: '' });
      setPreview('');
    } catch (err) {
      console.error('Add item error:', err);
      const errorMsg = err.response?.data?.message || 
                      (err.response?.status === 500 ? 'Internal Server Error' : 'Error adding item');
      setMessageType('error');
      setMessage(errorMsg);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        setTimeout(() => window.location.href = '/login', 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="menu-item-container">
      <h2 className="page-title">Add New Menu Item</h2>
      
      <form onSubmit={handleSubmit} className="menu-form">
        <div className="form-group">
          <label htmlFor="item-name" className="form-label">Item Name</label>
          <input
            id="item-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter item name"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="item-description" className="form-label">Description</label>
          <textarea
            id="item-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter description"
            required
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="item-price" className="form-label">Price</label>
          <div className="price-input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              id="item-price"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className="form-input price-input"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="upload-toggle">
            <label className="radio-label">
              <input
                type="radio"
                checked={useFileUpload}
                onChange={() => setUseFileUpload(true)}
                className="radio-input"
              />
              <span className="radio-text">Upload Image</span>
            </label>

          </div>

          {useFileUpload ? (
            <div className="file-upload-container">
              <label htmlFor="image-upload" className="file-upload-label">
                <span className="upload-icon">+</span>
                <span>Select image</span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg, image/png, image/gif"
                onChange={handleImage}
                className="file-input"
              />
              {preview && (
                <div className="image-preview">
                  <img
                    src={preview}
                    alt="Preview"
                    className="preview-img"
                  />
                </div>
              )}
            </div>
          ) : (
            <input
              type="text"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="Enter image URL (e.g., /Uploads/filename.jpg)"
              className="form-input"
            />
          )}
        </div>

        <button
          type="submit"
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Menu Item'}
        </button>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddMenuItem;
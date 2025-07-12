import React, { useState } from 'react';
import api from '../api'; // Adjust path if needed

const UpdateMenuItemPrice = () => {
  const [itemId, setItemId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePriceUpdate = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessageType('error');
      setMessage('You need to log in first.');
      return;
    }

    if (!itemId || !newPrice) {
      setMessageType('error');
      setMessage('Item ID and new price are required.');
      return;
    }

    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setMessageType('error');
      setMessage('Please enter a valid price greater than 0.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.put(
        '/radmin/updateMenuItemPrice',
        {
          itemId: parseInt(itemId),
          newPrice: parsedPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageType('success');
      setMessage(res.data.message || 'Price updated successfully.');
    } catch (err) {
      console.error('Error updating price:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update price.';
      setMessageType('error');
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Define the colors for the FoodPanda theme
  const colors = {
    foodpandaPink: '#d70f64',
    foodpandaLightPink: '#fce4ef',
    dark: '#333333',
    light: '#ffffff',
    gray: '#f7f7f7',
    border: '#e1e1e1',
    success: '#34c759',
    error: '#ff3b30'
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '32px auto',
      padding: '32px',
      backgroundColor: colors.light,
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: colors.dark,
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        Update Menu Item Price
      </h2>

      <div style={{
        marginBottom: '20px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: colors.dark,
          marginBottom: '8px'
        }}>
          Item ID
        </label>
        <input
          type="number"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          placeholder="Enter item ID"
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            backgroundColor: colors.gray,
            color: colors.dark,
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{
        marginBottom: '24px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: colors.dark,
          marginBottom: '8px'
        }}>
          New Price
        </label>
        <div style={{
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.dark,
            fontWeight: '500'
          }}>
            $
          </span>
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            step="0.01"
            placeholder="0.00"
            style={{
              width: '100%',
              padding: '14px 16px 14px 28px',
              fontSize: '16px',
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              backgroundColor: colors.gray,
              color: colors.dark,
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <button 
        onClick={handlePriceUpdate}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '14px 20px',
          backgroundColor: colors.foodpandaPink,
          color: colors.light,
          fontSize: '16px',
          fontWeight: '600',
          border: 'none',
          borderRadius: '12px',
          cursor: isLoading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isLoading ? '0.8' : '1'
        }}
      >
        {isLoading ? 'Updating...' : 'Update Price'}
      </button>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          backgroundColor: messageType === 'success' 
            ? 'rgba(52, 199, 89, 0.1)' 
            : 'rgba(255, 59, 48, 0.1)',
          color: messageType === 'success' ? colors.success : colors.error,
          border: messageType === 'success' 
            ? '1px solid rgba(52, 199, 89, 0.2)' 
            : '1px solid rgba(255, 59, 48, 0.2)'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default UpdateMenuItemPrice;
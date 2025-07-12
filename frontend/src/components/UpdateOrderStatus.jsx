import React, { useState } from 'react';
import api from '../api'; // Adjust path if needed

const UpdateOrderStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animateButton, setAnimateButton] = useState(false);

  // Define the colors for the FoodPanda theme
  const colors = {
    foodpandaPink: '#d70f64',
    foodpandaLightPink: '#fce4ef',
    foodpandaDarkPink: '#b80d54',
    dark: '#333333',
    light: '#ffffff',
    gray: '#f7f7f7',
    border: '#e1e1e1',
    success: '#34c759',
    error: '#ff3b30',
    neutral: '#8e8e93'
  };

  const handleStatusUpdate = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessageType('error');
      setMessage('You need to log in first.');
      return;
    }

    if (!orderId || !newStatus) {
      setMessageType('error');
      setMessage('Order ID and new status are required.');
      return;
    }

    setIsLoading(true);
    setAnimateButton(true);
    
    try {
      const res = await api.put(
        '/radmin/update-order-status',
        {
          orderId: parseInt(orderId),
          newStatus: newStatus.trim().toLowerCase()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageType('success');
      setMessage(res.data.message || 'Order status updated successfully.');
    } catch (err) {
      console.error('Error updating order status:', err);
      const errorMessage =
        err.response?.data?.error || 'Failed to update order status.';
      setMessageType('error');
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => setAnimateButton(false), 300);
    }
  };

  // Status options with icons and colors
  const statusOptions = [
    { value: "", label: "Select status", icon: "⚡" },
    { value: "in progress", label: "In Progress", icon: "⏳" },
    { value: "delivered", label: "Delivered", icon: "✅" },
    { value: "cancelled", label: "Cancelled", icon: "❌" }
  ];

  // Get the current status option
  const currentStatus = statusOptions.find(option => option.value === newStatus) || statusOptions[0];

  return (
    <div style={{
      maxWidth: '500px',
      margin: '32px auto',
      padding: '32px',
      backgroundColor: colors.light,
      borderRadius: '18px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Pink decorative element for FoodPanda branding */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: colors.foodpandaLightPink,
        opacity: 0.6,
        zIndex: 0
      }}></div>
      
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: colors.dark,
        marginBottom: '32px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        Update Order Status
      </h2>

      <div style={{
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        <label style={{
          display: 'block',
          fontSize: '15px',
          fontWeight: '600',
          color: colors.dark,
          marginBottom: '10px'
        }}>
          Order ID
        </label>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            color: colors.neutral,
            fontSize: '16px'
          }}>
            #
          </span>
          <input
            type="number"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter order ID"
            style={{
              width: '100%',
              padding: '16px 16px 16px 32px',
              fontSize: '16px',
              border: `1px solid ${colors.border}`,
              borderRadius: '14px',
              backgroundColor: colors.gray,
              color: colors.dark,
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
            }}
          />
        </div>
      </div>

      <div style={{
        marginBottom: '32px',
        position: 'relative',
        zIndex: 1
      }}>
        <label style={{
          display: 'block',
          fontSize: '15px',
          fontWeight: '600',
          color: colors.dark,
          marginBottom: '10px'
        }}>
          New Status
        </label>
        <div style={{
          position: 'relative'
        }}>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 40px 16px 16px',
              fontSize: '16px',
              border: `1px solid ${colors.border}`,
              borderRadius: '14px',
              backgroundColor: colors.gray,
              color: colors.dark,
              appearance: 'none',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
              cursor: 'pointer'
            }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
          <span style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '18px'
          }}>
            {currentStatus.icon}
          </span>
          <span style={{
            position: 'absolute',
            right: '36px',
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: '8px',
            height: '8px',
            borderRight: `2px solid ${colors.dark}`,
            borderBottom: `2px solid ${colors.dark}`,
            pointerEvents: 'none'
          }}></span>
        </div>
      </div>

      <button 
        onClick={handleStatusUpdate}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '16px 24px',
          backgroundColor: colors.foodpandaPink,
          color: colors.light,
          fontSize: '16px',
          fontWeight: '600',
          border: 'none',
          borderRadius: '14px',
          cursor: isLoading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isLoading ? '0.8' : '1',
          transform: animateButton ? 'scale(0.98)' : 'scale(1)',
          boxShadow: '0 4px 12px rgba(215, 15, 100, 0.2)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {isLoading && (
          <span style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: colors.light,
            animation: 'spin 0.8s linear infinite',
            marginRight: '10px'
          }}></span>
        )}
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        {isLoading ? 'Updating...' : 'Update Status'}
      </button>

      {message && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '500',
          textAlign: 'center',
          backgroundColor: messageType === 'success' 
            ? 'rgba(52, 199, 89, 0.1)' 
            : 'rgba(255, 59, 48, 0.1)',
          color: messageType === 'success' ? colors.success : colors.error,
          border: messageType === 'success' 
            ? '1px solid rgba(52, 199, 89, 0.2)' 
            : '1px solid rgba(255, 59, 48, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
          <span style={{
            display: 'inline-block', 
            marginRight: '8px',
            fontSize: '18px'
          }}>
            {messageType === 'success' ? '✅' : '⚠️'}
          </span>
          {message}
        </div>
      )}

      <div style={{
        marginTop: '24px',
        fontSize: '13px',
        color: colors.neutral,
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        Once updated, this change cannot be undone.
      </div>
    </div>
  );
};

export default UpdateOrderStatus;
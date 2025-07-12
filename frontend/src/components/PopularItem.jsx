import React, { useState, useEffect } from 'react';
import api from '../api'; // Adjust path if needed

const TopSellingItemsComponent = () => {
  const [topItems, setTopItems] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTopSellingItems = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You need to log in first.');
        setLoading(false);
        return;
      }

      const res = await api.get('/radmin/topSeller', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data || res.data.data.length === 0) {
        setTopItems([]);
        setMessage('No top selling items found.');
      } else {
        setTopItems(res.data.data); // res.data.data is where the recordset comes
      }
    } catch (err) {
      console.error('Error fetching top selling items:', err);
      setMessage('Failed to load top selling items.');
    } finally {
      setLoading(false);
    }
  };

  // Styles object
  const styles = {
    container: {
      padding: '24px',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      borderRadius: '14px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },
    header: {
      marginBottom: '24px',
      borderBottom: '1px solid #f0f0f0',
      paddingBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1d1d1f',
      margin: '0'
    },
    button: {
      backgroundColor: '#d70f64',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '15px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease, transform 0.1s ease',
      boxShadow: '0 2px 8px rgba(215, 15, 100, 0.3)'
    },
    buttonHover: {
      backgroundColor: '#c00c59',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(215, 15, 100, 0.4)'
    },
    message: {
      color: '#666',
      fontSize: '15px',
      padding: '12px',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      marginBottom: '20px',
      textAlign: 'center'
    },
    errorMessage: {
      color: '#d70f64',
      backgroundColor: 'rgba(215, 15, 100, 0.08)'
    },
    loadingIndicator: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      color: '#d70f64'
    },
    itemsList: {
      padding: '0',
      margin: '0',
      listStyle: 'none'
    },
    itemCard: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      borderRadius: '10px',
      marginBottom: '12px',
      backgroundColor: '#f9f9fb',
      borderLeft: '4px solid #d70f64',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    itemCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 12px rgba(0, 0, 0, 0.08)'
    },
    itemName: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#333',
      margin: '0'
    },
    itemQuantity: {
      backgroundColor: '#d70f64',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },
    rankBadge: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: '#f0f0f0',
      color: '#666',
      fontSize: '14px',
      fontWeight: '600',
      marginRight: '12px'
    },
    topRankBadge: {
      backgroundColor: 'rgba(215, 15, 100, 0.15)',
      color: '#d70f64'
    },
    noData: {
      textAlign: 'center',
      padding: '40px 0',
      color: '#888'
    },
    itemDetails: {
      display: 'flex',
      alignItems: 'center'
    },
    subtitle: {
      fontSize: '16px',
      color: '#666',
      marginBottom: '16px'
    }
  };

  const [hoverButtonState, setHoverButtonState] = useState(false);
  const [hoverItemStates, setHoverItemStates] = useState({});

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Popular Menu Items</h2>
        <button 
          style={{
            ...styles.button,
            ...(hoverButtonState ? styles.buttonHover : {})
          }} 
          onClick={fetchTopSellingItems}
          onMouseEnter={() => setHoverButtonState(true)}
          onMouseLeave={() => setHoverButtonState(false)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Top Selling Items'}
        </button>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.includes('Failed') || message.includes('need to log in') ? styles.errorMessage : {})
        }}>
          {message}
        </div>
      )}

      {loading && (
        <div style={styles.loadingIndicator}>
          <div>Loading popular items...</div>
        </div>
      )}

      {!loading && topItems.length > 0 && (
        <div>
          <p style={styles.subtitle}>Based on sales data, these items are your restaurant's bestsellers:</p>
          <ul style={styles.itemsList}>
            {topItems.map((item, index) => (
              <li 
                key={index} 
                style={{
                  ...styles.itemCard,
                  ...(hoverItemStates[index] ? styles.itemCardHover : {})
                }}
                onMouseEnter={() => setHoverItemStates({...hoverItemStates, [index]: true})}
                onMouseLeave={() => setHoverItemStates({...hoverItemStates, [index]: false})}
              >
                <div style={styles.itemDetails}>
                  <span style={{
                    ...styles.rankBadge,
                    ...(index < 3 ? styles.topRankBadge : {})
                  }}>
                    {index + 1}
                  </span>
                  <span style={styles.itemName}>{item.itemName}</span>
                </div>
                <span style={styles.itemQuantity}>
                  {item.totalQuantitySold} sold
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !message && topItems.length === 0 && (
        <div style={styles.noData}>
          Click the button above to load your top selling items
        </div>
      )}
    </div>
  );
};

export default TopSellingItemsComponent;
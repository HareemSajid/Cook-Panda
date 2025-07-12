import React, { useState } from 'react';
import api from '../api'; // Adjust the path as needed

const ItemsWithoutDescription = () => {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');

  const fetchItemsWithoutDescription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You need to log in first.');
        return;
      }

      const res = await api.get('/radmin/get-menu-items-for-description-update', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      

      if (!res.data || res.data.length === 0) {
        setMessage('All menu items have descriptions.');
        setItems([]);
      } else {
        setItems(res.data);
        setMessage('');
      }
    } catch (err) {
      console.error('Error fetching items without description:', err);
      setMessage('Failed to load menu items.');
    }
  };

  return (
    <div>
      <button onClick={fetchItemsWithoutDescription}>Fetch Items Without Description</button>

      {message && <p style={{ color: 'black' }}>{message}</p>}

      {items.length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: '10px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.itemId}>
                <td>{item.itemId}</td>
                <td>{item.name}</td>
                <td>{item.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ItemsWithoutDescription;

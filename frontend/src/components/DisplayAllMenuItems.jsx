import React, { useEffect, useState } from "react";
import api from '../api';

const MenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/radmin/menuItems'); // Adjust base path if needed
      setMenuItems(response.data);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
      setError("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchMenuItems();
  }, []);

  if (loading) return <p>Loading menu items...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Restaurant Menu Items</h2>
      {menuItems.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.itemId}>
                <td>{item.itemId}</td>
                <td>{item.name}</td>
                <td>{item.description || "N/A"}</td>
                <td>{item.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MenuItems;

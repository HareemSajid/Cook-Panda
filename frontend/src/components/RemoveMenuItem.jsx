import React, { useState, useEffect } from "react";
import api from "../api"; // Adjust path if needed

const DisableMenuItem = () => {
  const [itemId, setItemId] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("/radmin/menuItems", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMenuItems(res.data);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setMessage("Failed to fetch menu items.");
        setMessageType("error");
      }
    };

    fetchMenuItems();
  }, []);

  const handleDisableItem = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessageType("error");
      setMessage("You need to log in first.");
      return;
    }

    if (!itemId) {
      setMessageType("error");
      setMessage("Please select an item.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.put(
        `/radmin/disable-menu-item/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessageType("success");
      setMessage(res.data.message || "Menu item disabled successfully.");
    } catch (err) {
      console.error("Error disabling menu item:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to disable the menu item.";
      setMessageType("error");
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const colors = {
    foodpandaPink: "#d70f64",
    foodpandaLightPink: "#fce4ef",
    dark: "#333333",
    light: "#ffffff",
    gray: "#f7f7f7",
    border: "#e1e1e1",
    success: "#34c759",
    error: "#ff3b30",
  };

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "32px auto",
        padding: "32px",
        backgroundColor: colors.light,
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: colors.dark,
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        Disable Menu Item
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: colors.dark,
            marginBottom: "8px",
          }}
        >
          Select Menu Item
        </label>
        <select
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: "16px",
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            backgroundColor: colors.gray,
            color: colors.dark,
            outline: "none",
            boxSizing: "border-box",
          }}
        >
          <option value="">-- Select Item --</option>
          {menuItems.map((item) => (
            <option key={item.itemId} value={item.itemId}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleDisableItem}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "14px 20px",
          backgroundColor: colors.foodpandaPink,
          color: colors.light,
          fontSize: "16px",
          fontWeight: "600",
          border: "none",
          borderRadius: "12px",
          cursor: isLoading ? "default" : "pointer",
          transition: "all 0.2s ease",
          opacity: isLoading ? "0.8" : "1",
          marginTop: "8px",
        }}
      >
        {isLoading ? "Processing..." : "Disable Item"}
      </button>

      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            textAlign: "center",
            backgroundColor:
              messageType === "success"
                ? "rgba(52, 199, 89, 0.1)"
                : "rgba(255, 59, 48, 0.1)",
            color: messageType === "success" ? colors.success : colors.error,
            border:
              messageType === "success"
                ? "1px solid rgba(52, 199, 89, 0.2)"
                : "1px solid rgba(255, 59, 48, 0.2)",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default DisableMenuItem;

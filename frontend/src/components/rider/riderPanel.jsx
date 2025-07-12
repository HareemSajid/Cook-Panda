import React, { useState, useEffect } from "react";
import api from "../../api";
import {
  Clock,
  MapPin,
  User,
  Utensils,
  DollarSign,
  Check,
  AlertCircle,
  TrendingUp,
  X,
} from "lucide-react";
import { LineChart, Line, YAxis, XAxis, ResponsiveContainer } from "recharts";

const RiderPanel = () => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [assignedOrder, setAssignedOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [earningsData, setEarningsData] = useState([]);
  const [deliveryStatusStep, setDeliveryStatusStep] = useState(0);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/rider/getAvailableOrders");
      if (response.data.availableOrders?.length) {
        setOrderDetails(response.data.availableOrders);
        setMessage("");
      } else {
        setOrderDetails([]);
        setMessage("No orders available at the moment.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error fetching available orders.");
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await api.get("/rider/riderEarnings");
      setEarnings(res.data.totalEarnings || 0);

      // Create realistic sample data for earnings graph
      const mockData = [
        { day: "Mon", amount: 1200 },
        { day: "Tue", amount: 1500 },
        { day: "Wed", amount: 1100 },
        { day: "Thu", amount: 1800 },
        { day: "Fri", amount: 2200 },
        { day: "Sat", amount: 2500 },
        { day: "Sun", amount: 2000 },
      ];
      setEarningsData(mockData);
    } catch (err) {
      console.error("Error fetching earnings", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchEarnings();
  }, []);

  const displayPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 30000);
  };

  const assignOrder = async (orderId) => {
    try {
      setAssigning(true);
      const response = await api.put("/rider/assignOrder", { orderId });
      displayPopup(response.data.message || "Order assigned successfully");
      const order = orderDetails.find((o) => o.orderId === orderId);
      setAssignedOrder(order);
      setOrderDetails((prev) => prev.filter((o) => o.orderId !== orderId));
    } catch (err) {
      console.error(err);
      displayPopup(
        err.response?.data?.message || "Error assigning order",
        "error"
      );
    } finally {
      setAssigning(false);
    }
  };

  const markAsDelivered = async (orderId) => {
    let newStatus;
    if (deliveryStatusStep === 0) newStatus = "picked up";
    else if (deliveryStatusStep === 1) newStatus = "on the way";
    else newStatus = "delivered";

    try {
      await api.put("/rider/updateDeliveryStatus", {
        orderId,
        status: newStatus,
      });
      displayPopup(`Order marked as ${newStatus}`);

      if (deliveryStatusStep === 2) {
        setAssignedOrder(null);
        setDeliveryStatusStep(0); // reset for next order
        fetchEarnings();
      } else {
        setDeliveryStatusStep((prev) => prev + 1); // next step
      }
    } catch (err) {
      console.error(err);
      displayPopup("Error updating status", "error");
    }
  };

  return (
    <div className="rider-panel">
      {/* Popup Message */}
      {showPopup && (
        <div className={`popup ${popupType}`}>
          <div className="popup-content">
            <div className="popup-icon">
              {popupType === "success" ? (
                <Check size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
            </div>
            <span className="popup-message">{popupMessage}</span>
            <button onClick={() => setShowPopup(false)} className="close-popup">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <header className="panel-header">
        <h1>Rider Dashboard</h1>
      </header>

      <div className="dashboard-content">
        <div className="side-panel">
          <div className="earnings-card">
            <div className="earnings-header">
              <h3>Total Earnings</h3>
              <span className="earnings-badge">
                <TrendingUp size={14} />
                <span>+12%</span>
              </span>
            </div>
            <h2 className="earnings-amount">{earnings} Rs</h2>
            <div className="earnings-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#999" }}
                  />
                  <YAxis hide={true} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#d60065"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "#d60065",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rider-status-card">
            <h3>Status</h3>
            <div className="status-indicator active">
              <span className="status-dot"></span>
              <span className="status-text">Active</span>
            </div>
          </div>
        </div>

        <main className="main-content">
          {/* Assigned Order */}
          {assignedOrder && (
            <section className="assigned-order-section">
              <h2>Current Delivery</h2>
              <div className="assigned-order">
                <div className="order-header">
                  <h3>Order #{assignedOrder.orderId}</h3>
                  <span className="status-badge">
                    {assignedOrder.statusOrder}
                  </span>
                </div>
                <div className="order-details">
                  <div className="detail-item">
                    <User size={16} />
                    <span>Customer Id: {assignedOrder.customerId}  </span>
                  </div>
                  <div className="detail-item">
                    <Utensils size={16} />
                    <span>Restaurant Id: {assignedOrder.restaurantId}</span>
                  </div>
                  <div className="detail-item location">
                    <MapPin size={16} />
                    <span>Address: {assignedOrder.deliveryAddress}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>
                      {new Date(assignedOrder.orderDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <DollarSign size={16} />
                    <span>{assignedOrder.totalAmount} Rs</span>
                  </div>
                <span className="status-badge">
                  {
                    [
                      "Waiting to Pick Up",
                      "Picked Up",
                      "On The Way",
                      "Delivered",
                    ][deliveryStatusStep]
                  }
                </span>
                </div>

                <button
                  className="action-button"
                  onClick={() => markAsDelivered(assignedOrder.orderId)}
                >
                  {deliveryStatusStep === 0 && "Mark as Picked Up"}
                  {deliveryStatusStep === 1 && "Mark as On The Way"}
                  {deliveryStatusStep === 2 && "Mark as Delivered"}
                </button>
              </div>
            </section>
          )}

          {/* Available Orders */}
          <section className="available-orders-section">
            <h2>Available Orders</h2>
            {message ? (
              <div className="no-orders-message">{message}</div>
            ) : (
              <div className="orders-grid">
                {orderDetails.map((order) => (
                  <div key={order.orderId} className="order-card">
                    <div className="order-header">
                      <h3>Order #{order.orderId}</h3>
                      <span className="status-badge">{order.statusOrder}</span>
                    </div>
                    <div className="order-details">
                      <div className="detail-item">
                        <User size={16} />
                        <span>Customer Id: {order.customerId}</span>
                      </div>
                      <div className="detail-item">
                        <Utensils size={16} />
                        <span>Restaurant Id: {order.restaurantId}</span>
                      </div>
                      <div className="detail-item location">
                        <MapPin size={16} />
                        <span>Address: {order.deliveryAddress}</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>
                          {new Date(order.orderDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="detail-item">
                        <DollarSign size={16} />
                        <span>{order.totalAmount} Rs</span>
                      </div>
                    </div>
                    <button
                      className="action-button"
                      onClick={() => assignOrder(order.orderId)}
                      disabled={assigning}
                    >
                      {assigning ? "Accepting..." : "Accept Order"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Helvetica, Arial, sans-serif;
        }

        body {
          background-color: #f8f8f8;
          color: #333;
        }

        .rider-panel {
          min-height: 100vh;
          padding: 20px;
          position: relative;
        }

        .panel-header {
          padding: 10px 0 25px;
          margin-bottom: 10px;
        }

        .panel-header h1 {
          font-size: 40px;
          font-weight: 600;
          color: #121212;
        }

        .dashboard-content {
          display: flex;
          gap: 30px;
        }

        .side-panel {
          width: 300px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .earnings-card {
          background: white;
          border-radius: 16px;
          padding: 18px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .earnings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .earnings-header h3 {
          font-size: 18px;
          font-weight: 500;
          color: #666;
        }

        .earnings-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          background-color: rgba(214, 0, 101, 0.08);
          color: #d60065;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .earnings-amount {
          font-size: 38px;
          font-weight: 700;
          color: #121212;
          margin-bottom: 20px;
        }

        .earnings-chart {
          height: 120px;
          margin: 0 -24px -24px;
        }

        .rider-status-card {
          background: white;
          border-radius: 16px;
          padding: 14px 26px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .rider-status-card h3 {
          font-size: 15px;
          font-weight: 500;
          color: #666;
          margin-bottom: 15px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10b981;
        }

        .status-text {
          font-size: 15px;
          font-weight: 600;
          color: #121212;
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        section h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #121212;
        }

        .assigned-order,
        .order-card {
          background-color: white;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .assigned-order {
          border-left: 4px solid #d60065;
          position: relative;
          overflow: hidden;
        }

        .assigned-order::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 60px;
          height: 60px;
          background-color: rgba(214, 0, 101, 0.04);
          border-radius: 0 0 0 60px;
        }

        .order-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .order-header h3 {
          font-size: 24px;
          font-weight: 600;
          color: #121212;
        }

        .status-badge {
          background-color: rgba(214, 0, 101, 0.08);
          color: #d60065;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 15px;
          font-weight: 600;
        }

        .order-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #555;
          font-size: 17px;
        }

        .detail-item svg {
          color: #d60065;
          min-width: 16px;
        }

        .detail-item.location {
          padding-bottom: 6px;
          border-bottom: 1px dashed rgba(0, 0, 0, 0.07);
          margin-bottom: 2px;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .action-button {
          width: 100%;
          background-color: #d60065;
          color: white;
          border: none;
          padding: 10px 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(214, 0, 101, 0.2);
        }

        .action-button:hover {
          background-color: #c1005a;
          box-shadow: 0 4px 12px rgba(214, 0, 101, 0.3);
        }

        .action-button:disabled {
          background-color: #f5a6c7;
          cursor: not-allowed;
          box-shadow: none;
        }

        .no-orders-message {
          text-align: center;
          padding: 40px;
          color: #666;
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }

        .popup {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .popup-content {
          display: grid;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 12px;
          background-color: white;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
          min-width: 280px;
        }

        .popup-icon {
          width: 18px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .popup.success .popup-icon {
          background-color: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .popup.error .popup-icon {
          background-color: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .popup-message {
          flex: 2;
          font-size: 14px;
          color: #333;
        }

        .close-popup {
          width: 1px;
          height: 24px;
          background: #f1f1f1;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: background-color 0.2s ease;
        }

        .close-popup:hover {
          background-color: #e1e1e1;
          color: #333;
        }

        @keyframes slideIn {
          from {
            transform: translateX(30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 900px) {
          .dashboard-content {
            flex-direction: column;
          }

          .side-panel {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default RiderPanel;

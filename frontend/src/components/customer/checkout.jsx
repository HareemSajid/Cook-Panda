import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../api";
import { CheckCircle, MapPin, ShoppingBag, Clock, X, ChevronRight, Plus, Minus } from "lucide-react";

const Checkout = () => {
  const { state } = useLocation();
  const { cart: initialCart, restaurantId } = state;

  // Group identical items and assign quantities
  const groupedCart = initialCart.reduce((acc, item) => {
    const existingItem = acc.find(i => i.id === item.id || i.itemId === item.itemId);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
    } else {
      acc.push({
        ...item,
        id: item.id || item.itemId, // Normalize id
        quantity: item.quantity || 1
      });
    }
    return acc;
  }, []);

  const [cart, setCart] = useState(groupedCart);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [riderStatus, setRiderStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCancelDisabled, setIsCancelDisabled] = useState(false);

  useEffect(() => {
    calculateTotal();
  }, [cart]);

  const calculateTotal = () => {
    const total = cart
      .reduce((acc, item) => acc + item.price * item.quantity, 0)
      .toFixed(2);
    setTotalPrice(total);
  };

  const updateQuantity = (itemId, change) => {
    const updatedCart = cart.map(item => {
      if ((item.id === itemId || item.itemId === itemId) && (item.quantity + change > 0)) {
        return { ...item, quantity: item.quantity + change };
      }
      return item;
    }).filter(item => item.quantity > 0); // Remove items with 0 quantity
    
    setCart(updatedCart);
  };

  useEffect(() => {
    let interval;
    if (orderPlaced && orderId) {
      interval = setInterval(fetchOrderStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [orderPlaced, orderId]);

  const fetchOrderStatus = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const res = await api.get(`/customer/trackOrder/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrderStatus(res.data.orderStatus);
      setRiderStatus(res.data.riderStatus || res.data.deliveryUpdates || "N/A");
      if (res.data.orderStatus !== "pending") {
        setIsCancelDisabled(true);
      }
    } catch (err) {
      setError(
        `Failed to fetch order status: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      setError("Please enter your delivery address");
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to log in to place an order");
      return;
    }

    if (cart.length === 0) {
      setError("Cart is empty. Please add items before placing an order");
      return;
    }

    const orderItems = cart.map(item => ({
      itemId: item.id || item.itemId,
      quantity: item.quantity
    }));

    const orderData = { restaurantId, deliveryAddress, orderItems };

    try {
      setLoading(true);
      const response = await api.post("/customer/placeOrder", orderData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setOrderPlaced(true);
      setOrderId(response.data.orderId);
      setError(null);
    } catch (err) {
      setError(`Error placing order: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const res = await api.post(
        "/customer/cancelOrder",
        { orderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsCancelDisabled(true);
      setError(null);
    } catch (err) {
      setError(`Error cancelling order: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Styles object
  const styles = {
    pageContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f7',
      padding: '48px 16px'
    },
    contentContainer: {
      maxWidth: '800px',
      width: '100%'
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden'
    },
    cardContent: {
      padding: '32px'
    },
    pageTitle: {
      fontSize: '40px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '32px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center'
    },
    icon: {
      marginRight: '8px',
      color: '#e81c74'
    },
    summaryContainer: {
      background: '#f9f9f9',
      borderRadius: '12px',
      padding: '18px 24px',
      marginBottom: '22px'
    },
    itemRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #eee'
    },
    itemRowLast: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0'
    },
    itemDetails: {
      display: 'flex',
      alignItems: 'center'
    },
    itemName: {
      color: '#333',
      flex: '1'
    },
    itemPrice: {
      fontWeight: '500',
      marginLeft: '12px'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '20px'
    },
    quantityButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      border: 'none',
      background: '#f5e0e9',
      color: '#e81c74',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease-in-out'
    },
    quantityButtonHover: {
      background: '#ecb3cc'
    },
    quantityText: {
      margin: '0 10px',
      width: '30px',
      textAlign: 'center',
      fontWeight: '500'
    },
    summaryDivider: {
      borderTop: '1px solid #eee',
      margin: '16px 0',
      paddingTop: '16px'
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    summaryLabel: {
      color: '#666'
    },
    summaryValue: {
      fontWeight: '500'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: '1px solid #eee'
    },
    totalLabel: {
      fontSize: '20px',
      fontWeight: '600'
    },
    totalValue: {
      fontSize: '18px',
      fontWeight: '600'
    },
    emptyCart: {
      textAlign: 'center',
      padding: '20px 0',
      color: '#888'
    },
    inputContainer: {
      position: 'relative',
      marginBottom: '32px'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      fontSize: '16px',
      borderRadius: '12px',
      border: '1px solid #ddd',
      transition: 'border-color 0.15s ease-in-out',
      outline: 'none'
    },
    clearButton: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#999'
    },
    errorContainer: {
      padding: '16px',
      background: '#ffefef',
      borderRadius: '8px',
      border: '1px solid #ffdbdb',
      marginBottom: '24px'
    },
    errorText: {
      color: '#d92020'
    },
    primaryButton: {
      width: '100%',
      background: '#e81c74',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 16px',
      fontSize: '22px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'background-color 0.15s ease-in-out'
    },
    primaryButtonHover: {
      background: '#fe4a98'
    },
    primaryButtonDisabled: {
      background: '#9695e0',
      cursor: 'not-allowed'
    },
    buttonText: {
      display: 'flex',
      alignItems: 'center'
    },
    buttonIcon: {
      marginLeft: '8px'
    },
    successContainer: {
      textAlign: 'center'
    },
    successIconContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px'
    },
    successIconBg: {
      background: '#e8f7ee',
      padding: '16px',
      borderRadius: '50%'
    },
    successIcon: {
      color: '#34c759'
    },
    successTitle: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '16px'
    },
    successText: {
      color: '#666',
      marginBottom: '32px'
    },
    statusContainer: {
      background: '#f9f9f9',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    },
    statusHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px'
    },
    statusRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    statusLabel: {
      color: '#666'
    },
    statusValue: {
      fontWeight: '500'
    },
    statusBadge: {
      background: '#e2e1ff',
      color: '#5856d6',
      padding: '4px 12px',
      borderRadius: '50px',
      textTransform: 'capitalize',
      fontWeight: '500'
    },
    cancelButton: {
      width: '100%',
      background: 'white',
      color: '#d92020',
      border: '1px solid #d92020',
      borderRadius: '12px',
      padding: '9px 16px',
      fontSize: '22px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease-in-out'
    },
    cancelButtonHover: {
      background: '#fff0f0'
    },
    cancelButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      marginRight: '12px',
      border: '2px solid rgba(236, 158, 218, 0.3)',
      borderRadius: '50%',
      borderTopColor: 'white',
      animation: 'spin 1s ease-in-out infinite'
    },
    '@keyframes spin': {
      to: { transform: 'rotate(360deg)' }
    }
  };

  // Hover states
  const [inputFocused, setInputFocused] = useState(false);
  const [placeOrderHovered, setPlaceOrderHovered] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);
  const [buttonHoverStates, setButtonHoverStates] = useState({});

  const handleButtonHover = (id, isHovering, type) => {
    setButtonHoverStates(prev => ({
      ...prev,
      [`${id}-${type}`]: isHovering
    }));
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentContainer}>
        {!orderPlaced ? (
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <h1 style={styles.pageTitle}>Checkout</h1>
              
              {/* Order Summary */}
              <div>
                <h2 style={styles.sectionTitle}>
                  <ShoppingBag size={20} style={styles.icon} />
                  Order Summary
                </h2>
                <div style={styles.summaryContainer}>
                  {cart.length > 0 ? (
                    cart.map((item, index) => (
                      <div 
                        key={index} 
                        style={index === cart.length - 1 ? styles.itemRowLast : styles.itemRow}
                      >
                        <div style={styles.itemDetails}>
                          <div style={styles.quantityControls}>
                            <button 
                              style={{
                                ...styles.quantityButton,
                                ...(buttonHoverStates[`${item.id}-minus`] ? styles.quantityButtonHover : {})
                              }}
                              onClick={() => updateQuantity(item.id, -1)}
                              onMouseEnter={() => handleButtonHover(item.id, true, 'minus')}
                              onMouseLeave={() => handleButtonHover(item.id, false, 'minus')}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={styles.quantityText}>{item.quantity}</span>
                            <button 
                              style={{
                                ...styles.quantityButton,
                                ...(buttonHoverStates[`${item.id}-plus`] ? styles.quantityButtonHover : {})
                              }}
                              onClick={() => updateQuantity(item.id, 1)}
                              onMouseEnter={() => handleButtonHover(item.id, true, 'plus')}
                              onMouseLeave={() => handleButtonHover(item.id, false, 'plus')}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span style={styles.itemName}>{item.name}</span>
                        </div>
                        <span style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyCart}>Your cart is empty</div>
                  )}
                  
                  <div style={styles.summaryDivider}>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Subtotal</span>
                      <span style={styles.summaryValue}>${totalPrice}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Delivery Fee</span>
                      <span style={styles.summaryValue}>$0.00</span>
                    </div>
                    <div style={styles.totalRow}>
                      <span style={styles.totalLabel}>Total</span>
                      <span style={styles.totalValue}>${totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Address */}
              <div>
                <h2 style={styles.sectionTitle}>
                  <MapPin size={20} style={styles.icon} />
                  Delivery Address
                </h2>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    style={{
                      ...styles.input,
                      borderColor: inputFocused ? '#fe4a98' : '#ddd',
                      boxShadow: inputFocused ? '0 0 0 3px rgba(228, 178, 212, 0.1)' : 'none'
                    }}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                  />
                  {deliveryAddress && (
                    <button 
                      onClick={() => setDeliveryAddress("")}
                      style={styles.clearButton}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div style={styles.errorContainer}>
                  <p style={styles.errorText}>{error}</p>
                </div>
              )}
              
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
                style={{
                  ...styles.primaryButton,
                  ...(loading || cart.length === 0 ? styles.primaryButtonDisabled : 
                      placeOrderHovered ? styles.primaryButtonHover : {})
                }}
                onMouseEnter={() => setPlaceOrderHovered(true)}
                onMouseLeave={() => setPlaceOrderHovered(false)}
              >
                {loading ? (
                  <span style={styles.buttonText}>
                    <div style={styles.loadingSpinner}></div>
                    Processing...
                  </span>
                ) : (
                  <span style={styles.buttonText}>
                    Place Order
                    <ChevronRight size={20} style={styles.buttonIcon} />
                  </span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <div style={styles.successContainer}>
                <div style={styles.successIconContainer}>
                  <div style={styles.successIconBg}>
                    <CheckCircle size={48} style={styles.successIcon} />
                  </div>
                </div>
                
                <h1 style={styles.successTitle}>Order Confirmed</h1>
                <p style={styles.successText}>Your order #{orderId} has been placed successfully.</p>
                
                {/* Order Status */}
                <div style={styles.statusContainer}>
                  <div style={styles.statusHeader}>
                    <Clock size={20} style={styles.icon} />
                    <h2 style={{...styles.sectionTitle, marginBottom: 0, marginLeft: '8px'}}>Order Status</h2>
                  </div>
                  
                  <div>
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Status</span>
                      <span style={styles.statusBadge}>
                        {loading ? "Loading..." : orderStatus || "Pending"}
                      </span>
                    </div>
                    
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Delivery Update</span>
                      <span style={styles.statusValue}>
                        {loading ? "Loading..." : riderStatus || "Waiting for update"}
                      </span>
                    </div>
                    
                    <div style={styles.statusRow}>
                      <span style={styles.statusLabel}>Delivery Address</span>
                      <span style={styles.statusValue}>{deliveryAddress}</span>
                    </div>
                  </div>
                </div>
                
                {/* Cancel Order Button */}
                {!isCancelDisabled && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={loading || isCancelDisabled}
                    style={{
                      ...styles.cancelButton,
                      ...(loading || isCancelDisabled ? styles.cancelButtonDisabled : 
                          cancelHovered ? styles.cancelButtonHover : {})
                    }}
                    onMouseEnter={() => setCancelHovered(true)}
                    onMouseLeave={() => setCancelHovered(false)}
                  >
                    {loading ? "Processing..." : "Cancel Order"}
                  </button>
                )}
                
                {/* Error Message */}
                {error && (
                  <div style={{...styles.errorContainer, marginTop: '24px'}}>
                    <p style={styles.errorText}>{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Adding keyframes for the spinner animation */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Checkout;
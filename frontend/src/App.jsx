import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
import CustomerPanel from "./components/customer/customerPanel";
import Menu from "./components/customer/restaurantMenu";
import Checkout from "./components/customer/checkout";
import AdminPanel from "./components/admin/adminPanel"; // Real AdminPanel
import DeliveryWorkerPanel from "./components/rider/riderPanel";
import RestaurantAdminPanel from "./components/Dashboard";
import NotFound from "./components/NotFound";

// Placeholder components for other roles
// const RestaurantAdminPanel = () => <div>Restaurant Admin Panel</div>;
// const DeliveryWorkerPanel = () => <div>Delivery Worker Panel</div>;

// Import the ProtectedRoute component
import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  const [userRole, setUserRole] = useState(null);

  const renderDashboard = () => {
    switch (userRole) {
      case "customer":
        return <Navigate to="/customer" />;
      case "restaurantAdmin":
        return <Navigate to="/restaurant-admin" />;
      case "superAdmin":
        return <Navigate to="/admin" />;
      case "deliveryWorker":
        return <Navigate to="/delivery-worker" />;
      default:
        return <Login onLogin={setUserRole} />;
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={renderDashboard()} />
          {/* <Route path="/login" element={<Login />} /> */}

          <Route path="/signup" element={<Signup />} />

          {/* Dashboards */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute
                element={<CustomerPanel onLogout={() => setUserRole(null)} />}
                requiredRole="customer"
              />
            }
          />

          {/* <Route path="/customer" element={<ProtectedRoute element={<CustomerPanel />} requiredRole="customer"/> }/> */}
          <Route
            path="/restaurant-admin/*"
            element={
              <ProtectedRoute
                element={<RestaurantAdminPanel />}
                requiredRole="restaurantAdmin"
              />
            }
          />
          {/* <Route
            path="/restaurant-admin/*"
            element={
                <RestaurantAdminPanel />}
          /> */}
          {/* Protect the /admin route using the ProtectedRoute component */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                element={<AdminPanel />}
                requiredRole="superAdmin"
              />
            }
          />
          <Route path="/delivery-worker" element={<DeliveryWorkerPanel />} />

          {/* would protect them later... customer routes */}
          {/* Customer-specific routes */}
          <Route
            path="/menu/:restaurantId"
            element={
              <ProtectedRoute element={<Menu />} requiredRole="customer" />
            }
          />
          <Route path="/checkout/:restaurantId" element={<ProtectedRoute element={<Checkout />} requiredRole='customer' />}/>
          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

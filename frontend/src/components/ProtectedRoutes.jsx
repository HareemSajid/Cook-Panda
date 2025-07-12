import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ element, requiredRole }) => {
  const [userRole, setUserRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserRole(null);
      setChecking(false);
      return;
    }

    try {
      const decoded = jwtDecode(token); 
      setUserRole(decoded.role);
    } catch (error) {
      console.error("Failed to decode token:", error);
      setUserRole(null);
    } finally {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return <div>Loading...</div>;
  }

  if (!userRole || userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  return element;
};

export default ProtectedRoute;

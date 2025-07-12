import React from 'react';
import { useLocation } from 'react-router-dom';

const RestaurantOverview = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div>
      <h1>
        {currentPath === '/dashboard' && 'Dashboard Overview'}
        {currentPath === '/menu-management' && 'Menu Management'}
        {currentPath === '/orders' && 'Orders'}
        {currentPath === '/analytics' && 'Analytics'}
        {currentPath === '/customer-management' && 'Customer Management'}
      </h1>
      {HELLO}
    </div>
  );
};

export default RestaurantOverview;
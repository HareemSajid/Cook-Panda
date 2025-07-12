import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import "./Sidebar.css";
import TotalEarnings from './TotalEarnings';
import PopularItem from './PopularItem';
import EarningsByDate from './EarningsByDate';
import AvgRating from './AvgRating';
import CustomerFeedback from './CustomerFeedback';

const ADash = () => {
  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Analytics</h2>
        <ul>
          <li><Link to="TotalEarnings">Total Earnings</Link></li>
          <li><Link to="PopularItem">Popular Item</Link></li>
          <li><Link to="EarningsByDate">Earnings By Date</Link></li>
          <li><Link to="AvgRating">Avg Rating</Link></li>
          <li><Link to="CustomerFeedback">Customer Feedback</Link></li>
        </ul>
      </div>

      <div className="main-content">
        <Routes>
          <Route index element={<Navigate to="TotalEarnings" replace />} />
          <Route path="TotalEarnings" element={<TotalEarnings />} />
          <Route path="PopularItem" element={<PopularItem />} />
          <Route path="EarningsByDate" element={<EarningsByDate />} />
          <Route path="AvgRating" element={<AvgRating />} />
          <Route path="CustomerFeedback" element={<CustomerFeedback />} />
        </Routes>
      </div>
    </div>
  );
};

export default ADash;
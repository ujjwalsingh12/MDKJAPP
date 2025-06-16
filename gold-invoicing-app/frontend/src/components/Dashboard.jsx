// Dashboard.js
// This file defines the Dashboard component for the MDKJ Enterprise application.
// The Dashboard displays a welcome message and a brief description for users on the dashboard page.

import React from 'react';

/**
 * Dashboard component
 * Renders the main dashboard page with a heading and a welcome message.
 */
const Dashboard = () => {
  return (
    <div className="dashboard p-4">
      <h2>Dashboard Page</h2>
      <p className="lead">Welcome to the MDKJ Enterprise Dashboard. Here, you can view key metrics and summaries of your business.</p>
    </div>
  );
};

export default Dashboard;

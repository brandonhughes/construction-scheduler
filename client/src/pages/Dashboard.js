import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      
      <div className="dashboard-welcome">
        <h3>Welcome, {currentUser.firstName}!</h3>
        <p>Your role: {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</p>
      </div>
      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h4>My Tasks</h4>
          <p className="placeholder-text">Task management functionality will be implemented in future updates.</p>
        </div>
        
        {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <div className="dashboard-card">
            <h4>Manage Schedules</h4>
            <p className="placeholder-text">Schedule management functionality will be implemented in future updates.</p>
          </div>
        )}
        
        {currentUser.role === 'admin' && (
          <div className="dashboard-card">
            <h4>System Statistics</h4>
            <p className="placeholder-text">System statistics will be implemented in future updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

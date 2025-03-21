import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { currentUser } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h2>Unauthorized Access</h2>
      <p>You do not have permission to access this page.</p>
      <p>
        Your current role: <strong>{currentUser?.role || 'Not logged in'}</strong>
      </p>
      <Link to="/dashboard" className="btn" style={{ marginTop: '20px' }}>
        Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;

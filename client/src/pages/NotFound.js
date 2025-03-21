import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn" style={{ marginTop: '20px' }}>
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;

import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import Profile from './pages/Profile';
import TimeoutWarning from './components/TimeoutWarning';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import { useAuth } from './context/AuthContext';
import { useInactivityTimeout } from './services/timeout.service';

function App() {
  const { loading, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  // State for manual testing of timeout warning
  const [forceShowWarning, setForceShowWarning] = useState(false);

  // Only activate timeout for authenticated users
  const isAuthenticated = currentUser !== null;
  const {
    showWarning: autoShowWarning,
    warningTime,
    continueSession,
    handleLogout
  } = useInactivityTimeout(isAuthenticated, logout, navigate);
  
  // Combine automatic warning with forced warning for testing
  const showWarning = autoShowWarning || forceShowWarning;
  
  // Debug info
  console.log('App render - isAuthenticated:', isAuthenticated, 'showWarning:', showWarning);
  
  // Function to manually show the warning dialog for testing
  const showTestWarning = () => {
    console.log('Manual test: Showing timeout warning');
    setForceShowWarning(true);
  };
  
  // Function to dismiss the test warning
  const dismissTestWarning = () => {
    console.log('Manual test: Dismissing timeout warning');
    setForceShowWarning(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin and Manager routes */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'manager']} />}>
            <Route path="/users" element={<UserList />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      {/* Inactivity timeout warning dialog */}
      {currentUser && (
        <TimeoutWarning 
          show={showWarning}
          warningTime={warningTime || (Date.now() + 60000)} // Fallback for manual testing
          onContinue={forceShowWarning ? dismissTestWarning : continueSession}
          onTimeout={handleLogout}
        />
      )}
      
      {/* Debug testing button - only shown when logged in */}
      {currentUser && (
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          zIndex: 1000 
        }}>
          <button 
            onClick={showTestWarning}
            style={{
              padding: '10px 15px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Timeout Dialog
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

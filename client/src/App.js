import React, { useState, useEffect } from 'react';
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
import { 
  initInactivityTracker, 
  cleanupInactivityTracker, 
  continueSession as continueSess,
  forceShowWarning 
} from './services/inactivity-tracker';

function App() {
  const { loading, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [warningTime, setWarningTime] = useState(0);

  // Set up the inactivity tracker when the user logs in
  useEffect(() => {
    // Only set up for authenticated users
    if (currentUser) {
      console.log('Setting up inactivity tracker for authenticated user');
      
      // Initialize the tracker with callbacks
      initInactivityTracker(
        // Warning callback
        (show, expiryTime) => {
          console.log(`Warning callback called: show=${show}, expiryTime=${expiryTime}`);
          setShowWarning(show);
          setWarningTime(expiryTime);
        },
        // Logout callback
        () => {
          console.log('Logout callback triggered');
          logout();
          navigate('/login');
        }
      );
      
      // Clean up when the component unmounts or user logs out
      return () => {
        console.log('Cleaning up inactivity tracker');
        cleanupInactivityTracker();
      };
    }
  }, [currentUser, logout, navigate]);
  
  // Function to continue the session
  const handleContinueSession = () => {
    console.log('Continuing session');
    continueSess();
  };
  
  // Function to test the warning dialog
  const handleTestWarning = () => {
    console.log('Testing warning dialog');
    forceShowWarning();
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
          onContinue={handleContinueSession}
          onTimeout={() => {}} // Handled by the inactivity tracker
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
            onClick={handleTestWarning}
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

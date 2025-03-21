import React from 'react';
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

  // Only activate timeout for authenticated users
  const isAuthenticated = currentUser !== null;
  const {
    showWarning,
    warningTime,
    continueSession,
    handleLogout
  } = useInactivityTimeout(isAuthenticated, logout, navigate);

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
          warningTime={warningTime}
          onContinue={continueSession}
          onTimeout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;

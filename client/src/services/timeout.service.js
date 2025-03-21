import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Constants for timeout durations (in milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION = 60 * 1000; // 60 seconds

// Events to track for user activity
const USER_ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keydown', 
  'scroll', 'touchstart', 'click'
];

// Hook to manage inactivity timeout
export const useInactivityTimeout = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningTime, setWarningTime] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Reset timers when user shows activity
  const resetTimers = () => {
    setShowWarning(false);
    
    // Clear existing timers if any
    if (window.inactivityTimer) clearTimeout(window.inactivityTimer);
    if (window.warningTimer) clearTimeout(window.warningTimer);
    
    // Set a new inactivity timer
    window.inactivityTimer = setTimeout(() => {
      setShowWarning(true);
      setWarningTime(Date.now() + WARNING_DURATION);
      
      // Set warning timer for auto-logout
      window.warningTimer = setTimeout(() => {
        handleLogout();
      }, WARNING_DURATION);
    }, INACTIVITY_TIMEOUT);
  };
  
  // Handle logout action
  const handleLogout = () => {
    logout();
    setShowWarning(false);
    navigate('/login');
  };
  
  // Continue the session
  const continueSession = () => {
    resetTimers();
  };
  
  // Set up event listeners
  useEffect(() => {
    // User activity event handler
    const handleUserActivity = () => {
      if (!showWarning) {
        resetTimers();
      }
    };
    
    // Register all event listeners
    USER_ACTIVITY_EVENTS.forEach(eventType => {
      window.addEventListener(eventType, handleUserActivity);
    });
    
    // Initial timer setup
    resetTimers();
    
    // Cleanup event listeners on unmount
    return () => {
      USER_ACTIVITY_EVENTS.forEach(eventType => {
        window.removeEventListener(eventType, handleUserActivity);
      });
      
      // Clear timers
      if (window.inactivityTimer) clearTimeout(window.inactivityTimer);
      if (window.warningTimer) clearTimeout(window.warningTimer);
    };
  }, [showWarning]);
  
  return {
    showWarning,
    warningTime,
    continueSession,
    handleLogout
  };
};
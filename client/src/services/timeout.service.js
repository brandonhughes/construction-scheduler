import { useEffect, useState, useRef, useCallback } from 'react';

// Constants for timeout durations (in milliseconds)
// For production, use 15 minutes (15 * 60 * 1000) for inactivity timeout
// For testing purposes, we're using 20 seconds
const INACTIVITY_TIMEOUT = 20 * 1000; // 20 seconds for testing
const WARNING_DURATION = 60 * 1000; // 60 seconds

// Events to track for user activity
const USER_ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keydown', 
  'scroll', 'touchstart', 'click'
];

// Hook to manage inactivity timeout
export const useInactivityTimeout = (isAuthenticated, logout, navigate) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningTime, setWarningTime] = useState(0);
  
  // Use refs to keep track of timers - refs persist across renders
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  
  // Use a ref to track if the component is mounted
  const isMountedRef = useRef(true);
  
  // Reset timers - use useCallback to memoize this function
  const resetTimers = useCallback(() => {
    console.log('Resetting inactivity timers');
    
    if (!isMountedRef.current || !isAuthenticated) return;
    
    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    setShowWarning(false);
    
    // Set a new inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      console.log('Inactivity detected! Showing warning...');
      setShowWarning(true);
      setWarningTime(Date.now() + WARNING_DURATION);
      
      // Set warning timer for auto-logout
      warningTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        console.log('Warning timeout expired! Logging out...');
        handleLogout();
      }, WARNING_DURATION);
    }, INACTIVITY_TIMEOUT);
  }, [isAuthenticated]);
  
  // Handle logout action
  const handleLogout = useCallback(() => {
    if (!isMountedRef.current) return;
    
    console.log('Logout triggered by inactivity');
    if (logout) {
      logout();
      setShowWarning(false);
      if (navigate) navigate('/login');
    }
  }, [logout, navigate]);
  
  // Continue the session
  const continueSession = useCallback(() => {
    console.log('Session continued by user');
    resetTimers();
  }, [resetTimers]);
  
  // Set up event listeners
  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log('Setting up inactivity timeout system');
    isMountedRef.current = true;
    
    // User activity event handler
    const handleUserActivity = () => {
      if (!isMountedRef.current) return;
      
      // Only reset timers if the warning isn't showing
      if (!showWarning) {
        console.log('User activity detected');
        resetTimers();
      }
    };
    
    // Register all event listeners
    USER_ACTIVITY_EVENTS.forEach(eventType => {
      window.addEventListener(eventType, handleUserActivity, { passive: true });
    });
    
    // Initial timer setup
    resetTimers();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up inactivity timeout system');
      isMountedRef.current = false;
      
      // Remove event listeners
      USER_ACTIVITY_EVENTS.forEach(eventType => {
        window.removeEventListener(eventType, handleUserActivity);
      });
      
      // Clear timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    };
  }, [isAuthenticated, resetTimers, showWarning]);
  
  return {
    showWarning,
    warningTime,
    continueSession,
    handleLogout
  };
};
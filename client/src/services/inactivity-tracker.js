/**
 * Global Inactivity Tracker
 * This is a window-level inactivity tracking system that works independently of React components.
 */

// Configuration
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const WARNING_DURATION = 60 * 1000; // 60 seconds

// Events to track for user activity
const USER_ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keydown', 
  'scroll', 'touchstart', 'click'
];

// Global state
let inactivityTimer = null;
let warningTimer = null;
let warningCallback = null;
let logoutCallback = null;
let isWarningShown = false;
let warningTimeout = 0;
let isInitialized = false;

// Utility to reset timers
const resetInactivityTimer = () => {
  // Clear existing timers
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  
  // Don't reset warning timer if warning is showing
  if (isWarningShown) {
    return;
  }
  
  // Clear warning timer
  if (warningTimer) {
    clearTimeout(warningTimer);
  }
  
  // Hide warning if it's showing
  if (isWarningShown) {
    isWarningShown = false;
    if (warningCallback) {
      warningCallback(false, 0);
    }
  }
  
  // Set new inactivity timer
  inactivityTimer = setTimeout(() => {
    // Show warning
    isWarningShown = true;
    warningTimeout = Date.now() + WARNING_DURATION;
    
    if (warningCallback) {
      warningCallback(true, warningTimeout);
    }
    
    // Set warning timer
    warningTimer = setTimeout(() => {
      // Reset state
      isWarningShown = false;
      
      // Execute logout callback
      if (logoutCallback) {
        logoutCallback();
      }
    }, WARNING_DURATION);
    
  }, INACTIVITY_TIMEOUT);
};

// User activity event handler
const handleUserActivity = () => {
  // Only reset if warning is not showing
  if (!isWarningShown) {
    resetInactivityTimer();
  }
};

// Initialize the tracker
export const initInactivityTracker = (onWarning, onLogout) => {
  // Only initialize once
  if (isInitialized) {
    warningCallback = onWarning;
    logoutCallback = onLogout;
    return;
  }
  
  // Store callbacks
  warningCallback = onWarning;
  logoutCallback = onLogout;
  
  // Register all event listeners
  USER_ACTIVITY_EVENTS.forEach(eventType => {
    window.addEventListener(eventType, handleUserActivity, { passive: true });
  });
  
  // Initial timer setup
  resetInactivityTimer();
  
  // Mark as initialized
  isInitialized = true;
};

// Clean up the tracker
export const cleanupInactivityTracker = () => {
  // Remove event listeners
  USER_ACTIVITY_EVENTS.forEach(eventType => {
    window.removeEventListener(eventType, handleUserActivity);
  });
  
  // Clear timers
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
  
  // Reset state
  isWarningShown = false;
  warningCallback = null;
  logoutCallback = null;
  isInitialized = false;
};

// Continue session (dismiss warning)
export const continueSession = () => {
  isWarningShown = false;
  
  if (warningCallback) {
    warningCallback(false, 0);
  }
  
  resetInactivityTimer();
};
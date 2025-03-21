/**
 * Global Inactivity Tracker
 * This is a window-level inactivity tracking system that works independently of React components.
 */

// Configuration
const INACTIVITY_TIMEOUT = 20 * 1000; // 20 seconds for testing (use 15 * 60 * 1000 for production)
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
  console.log('[InactivityTracker] Resetting inactivity timer');
  
  // Clear existing timers
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
  
  // Don't reset warning timer if warning is showing
  if (isWarningShown) {
    console.log('[InactivityTracker] Warning is showing, not resetting warning timer');
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
    console.log('[InactivityTracker] Inactivity detected! Showing warning...');
    
    // Show warning
    isWarningShown = true;
    warningTimeout = Date.now() + WARNING_DURATION;
    
    if (warningCallback) {
      warningCallback(true, warningTimeout);
    }
    
    // Set warning timer
    warningTimer = setTimeout(() => {
      console.log('[InactivityTracker] Warning timeout expired! Logging out...');
      
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
  console.log('[InactivityTracker] Activity detected');
  
  // Only reset if warning is not showing
  if (!isWarningShown) {
    resetInactivityTimer();
  }
};

// Initialize the tracker
export const initInactivityTracker = (onWarning, onLogout) => {
  console.log('[InactivityTracker] Initializing inactivity tracker');
  
  // Only initialize once
  if (isInitialized) {
    console.log('[InactivityTracker] Already initialized, updating callbacks');
    warningCallback = onWarning;
    logoutCallback = onLogout;
    return;
  }
  
  // Store callbacks
  warningCallback = onWarning;
  logoutCallback = onLogout;
  
  // Register all event listeners
  USER_ACTIVITY_EVENTS.forEach(eventType => {
    console.log(`[InactivityTracker] Adding event listener for: ${eventType}`);
    window.addEventListener(eventType, handleUserActivity, { passive: true });
  });
  
  // Initial timer setup
  resetInactivityTimer();
  
  // Mark as initialized
  isInitialized = true;
  
  console.log('[InactivityTracker] Initialization complete');
};

// Clean up the tracker
export const cleanupInactivityTracker = () => {
  console.log('[InactivityTracker] Cleaning up inactivity tracker');
  
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
  
  console.log('[InactivityTracker] Cleanup complete');
};

// Continue session (dismiss warning)
export const continueSession = () => {
  console.log('[InactivityTracker] Continuing session');
  
  isWarningShown = false;
  
  if (warningCallback) {
    warningCallback(false, 0);
  }
  
  resetInactivityTimer();
};

// For testing purposes
export const forceShowWarning = () => {
  console.log('[InactivityTracker] Forcing warning display (test)');
  
  isWarningShown = true;
  warningTimeout = Date.now() + WARNING_DURATION;
  
  if (warningCallback) {
    warningCallback(true, warningTimeout);
  }
};
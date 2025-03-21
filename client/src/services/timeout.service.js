/**
 * DEPRECATED
 * This file is no longer used. See inactivity-tracker.js instead.
 */

import { useEffect, useState, useRef, useCallback } from 'react';

export const useInactivityTimeout = () => {
  console.warn('useInactivityTimeout hook is deprecated. Using inactivity-tracker.js instead.');
  
  return {
    showWarning: false,
    warningTime: 0,
    continueSession: () => {},
    handleLogout: () => {}
  };
};
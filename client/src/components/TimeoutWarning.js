import React, { useState, useEffect } from 'react';
import './TimeoutWarning.css';

const TimeoutWarning = ({ show, onContinue, onTimeout, warningTime }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  
  console.log('TimeoutWarning render - show:', show, 'warningTime:', warningTime);
  
  useEffect(() => {
    console.log('TimeoutWarning useEffect triggered - show:', show, 'warningTime:', warningTime);
    
    if (show && warningTime) {
      console.log('Starting countdown timer');
      // Start countdown timer
      const interval = setInterval(() => {
        const secondsLeft = Math.max(0, Math.ceil((warningTime - Date.now()) / 1000));
        console.log('Countdown: seconds left =', secondsLeft);
        setTimeLeft(secondsLeft);
        
        if (secondsLeft <= 0) {
          console.log('Countdown finished, triggering timeout');
          clearInterval(interval);
          onTimeout();
        }
      }, 1000);
      
      return () => {
        console.log('Clearing countdown interval');
        clearInterval(interval);
      };
    }
  }, [show, warningTime, onTimeout]);
  
  // Debug our rendering logic
  if (!show) {
    console.log('TimeoutWarning not showing - returning null');
    return null;
  }
  
  console.log('TimeoutWarning rendering visible component');
  
  return (
    <div className="timeout-overlay">
      <div className="timeout-dialog">
        <h2>Session Timeout Warning</h2>
        <p>Your session is about to expire due to inactivity.</p>
        <p>You will be automatically logged out in:</p>
        <div className="timeout-countdown">{timeLeft}</div>
        <p>seconds</p>
        <div className="timeout-actions">
          <button 
            className="btn btn-primary"
            onClick={onContinue}
          >
            Yes, Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeoutWarning;
import React, { useState, useEffect } from 'react';
import './TimeoutWarning.css';

const TimeoutWarning = ({ show, onContinue, onTimeout, warningTime }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  
  useEffect(() => {
    if (show && warningTime) {
      // Start countdown timer
      const interval = setInterval(() => {
        const secondsLeft = Math.max(0, Math.ceil((warningTime - Date.now()) / 1000));
        setTimeLeft(secondsLeft);
        
        if (secondsLeft <= 0) {
          clearInterval(interval);
          onTimeout();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [show, warningTime, onTimeout]);
  
  if (!show) return null;
  
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
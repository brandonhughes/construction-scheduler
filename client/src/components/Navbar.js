import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import constructionHatLogo from '../assets/images/ConstructionHat.jpg';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={constructionHatLogo} alt="Construction Hat" className="navbar-logo-image" />
          <span>Construction Scheduler</span>
        </Link>
        <ul className="navbar-menu">
          {currentUser ? (
            <>
              <li className="navbar-item">
                <Link to="/dashboard" className="navbar-link">
                  Dashboard
                </Link>
              </li>
              {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <li className="navbar-item">
                  <Link to="/users" className="navbar-link">
                    User Management
                  </Link>
                </li>
              )}
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link">
                  Profile
                </Link>
              </li>
              <li className="navbar-item">
                <a href="#" onClick={handleLogout} className="navbar-link">
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

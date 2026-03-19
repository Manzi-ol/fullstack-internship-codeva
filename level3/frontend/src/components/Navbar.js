import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">&#9671;</span>
          ProductHub
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            Products
          </Link>
          <Link to="/graphql-demo" className="nav-link">
            GraphQL Demo
          </Link>
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <span className="user-name">{user?.name || 'User'}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import './LandingNavBar.css';
import { Link } from 'react-router-dom';

const LandingNavBar = () => {
  return (
    <div className="nav-container-wrapper">
      <nav className="nav-container">
        <ul className="nav-list">
          <li>
            <Link to="/">
              <button className='home-button'>Home</button>
            </Link>
          </li>
          <li>
            <Link to="/login">
              <button className="login-button">Login</button>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default LandingNavBar;
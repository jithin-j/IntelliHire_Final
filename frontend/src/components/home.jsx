// Home.js

import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';
import usertask from "../images/UserTasks.png";
import TakeSurvey from "../images/TakeSurvey.png";
import NavBar from './NavBar/NavBar';


const Home = () => {

  return (
    <div className='container'>
      <NavBar />
      <div className='user-options'>
        <Link to="/survey">
          <button className='user-link'>
            <img src={TakeSurvey} alt="Assign Task" className='admin-imgs' />
            <p>Take Survey</p>
          </button>
        </Link>
        <Link to="/tasks">
          <button className='user-link'>
            <img src={usertask} alt="Assign Task" className='admin-imgs' />
            <p>View my tasks</p>
          </button>
        </Link>
        {/* <button onClick={handleLogout}>Logout</button> */}
      </div>
    </div>
  );
};

export default Home;

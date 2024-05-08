// AdminDashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import AdminNavBar from '../components/AdminNavbar/AdminNavBar';
import { FilePdfOutlined, FundViewOutlined, EditOutlined, PlusCircleOutlined, BarChartOutlined } from '@ant-design/icons';

const AdminDashboard = () => {

  return (
    <div className="admin-dashboard-container">
      <AdminNavBar />
      <h1>Admin Dashboard</h1>
      <div className="admin-options">
        {/* Option 1: Visualize all employee responses */}
        <Link to="/admin/visualize-responses">
          <button className='admin-link'>
            <BarChartOutlined style={{ "fontSize": "2rem" }} />
            <p>Visualize Employee Responses</p>
          </button>
        </Link>

        {/* Option 2: Signup page for creating new accounts */}
        <Link to="/admin/create-employee">
          <button className='admin-link'>
            <PlusCircleOutlined style={{ "fontSize": "2rem" }} />
            <p>Create Employee Account</p>
          </button>
        </Link>

        <Link to="/admin/assign-task">
          <button className='admin-link'>
            <EditOutlined style={{ "fontSize": "2rem" }} />
            <p>Assign Task</p>
          </button>
        </Link>
        <Link to="/admin/file-upload">
          <button className='admin-link'>
            <FilePdfOutlined style={{ "fontSize": "2rem" }} />
            <p>Resume Screening</p>
          </button>
        </Link>
        <Link to="/admin/view-tasks">
          <button className='admin-link'>
            <FundViewOutlined style={{ "fontSize": "2rem" }} />
            <p>View Tasks</p>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

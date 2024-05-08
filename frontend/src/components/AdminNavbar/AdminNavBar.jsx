import React from 'react'
import { useNavigate } from 'react-router-dom'
import "./NavBar.css"
const AdminNavBar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear access_token from local storage
        localStorage.removeItem('access_token');

        // Redirect to the login page
        navigate('/');
    };
    return (
        <nav className="nav-containerr">
            <ul className="admin-nav-list">
                <li>
                    <h3 className='welcome'>Welcome Admin!</h3>
                </li>
                <li>
                    <button onClick={handleLogout} style={{ "background": "#0E46A3" }}>Logout</button>
                </li>
            </ul>
        </nav>
    )
}

export default AdminNavBar;
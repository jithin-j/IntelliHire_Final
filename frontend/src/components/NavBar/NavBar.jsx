import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "./NavBar.css"
const NavBar = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');

    const handleLogout = () => {
        // Clear access_token from local storage
        localStorage.removeItem('access_token');

        // Redirect to the login page
        navigate('/');
    };

    useEffect(() => {
        // Retrieve username from the token in local storage
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            // Decode the JWT token to get user information
            const decodedToken = parseJwt(storedToken);
            console.log(decodedToken);
            if (decodedToken) {
                setUsername(decodedToken.sub);
            }
        }
    }, []);

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    return (
        <nav className="nav-container">
            <ul className="nav-list">
                <li>
                    <h3 className='welcome-msg'>Welcome {username}</h3>
                </li>
                <li>
                    <button onClick={handleLogout} style={{ "background": "#0E46A3" }}>Logout</button>
                </li>
            </ul>
        </nav>
    )
}

export default NavBar
import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const ProtectedRoute = ({ path, element }) => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
        // Redirect to login if no token is found
        return <Navigate to="/login" />;
    }

    const decodedToken = jwt_decode(storedToken);

    // Check if the user has the 'admin' role
    const isAdmin = decodedToken.role === 'admin';

    if (!isAdmin) {
        // Redirect to login if the user is not an admin
        return <Navigate to="/login" />;
    }

    // Render the component if the user is an admin
    return <Route path={path} element={element()} />;
};

export default ProtectedRoute;

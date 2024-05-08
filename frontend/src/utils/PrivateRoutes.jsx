import { Outlet, Navigate } from 'react-router-dom'

const PrivateRoutes = () => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
        // Redirect to login if no token is found
        return <Navigate to="/login" />;
    }
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };
    const decodedToken = parseJwt(storedToken);
    return (
        decodedToken.role ? <Outlet /> : <Navigate to="/login" />
    )
}

export default PrivateRoutes
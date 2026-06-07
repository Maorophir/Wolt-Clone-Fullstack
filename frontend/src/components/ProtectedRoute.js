import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * Guards routes that require a logged-in user (e.g. checkout). If the user is
 * not authenticated, it redirects to the login screen and remembers where they
 * were heading so the login flow can send them back.
 */
const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default ProtectedRoute;

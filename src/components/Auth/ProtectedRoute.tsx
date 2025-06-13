import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();
  
  // Check if the user is authenticated by token in cookies
  const hasToken = !!Cookies.get('accessToken');
  const hasUserId = !!Cookies.get('userId');

  // If either context state or cookies indicate auth, allow access
  const isAuthorized = isAuthenticated || (hasToken && hasUserId);

  if (!isAuthorized) {
    // Redirect to login and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PrivateRoute = () => {
  const { isAuthenticated, user, checkAuth, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // If we have isAuthenticated but no user, try to fetch user data
      if (isAuthenticated && !user) {
        try {
          await checkAuth();
        } catch (error) {
          // If fetching user fails, logout and clear state
          logout();
        }
      }
      setIsChecking(false);
    };

    // Small delay to ensure zustand has hydrated
    const timer = setTimeout(verifyAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, checkAuth, logout]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f7fa'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Only check isAuthenticated - if user is missing, checkAuth should have fixed it
  if (!isAuthenticated) {
    return <Navigate to="/erp/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;

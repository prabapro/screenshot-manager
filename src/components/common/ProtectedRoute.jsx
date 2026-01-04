// src/components/common/ProtectedRoute.jsx

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@stores/useAuthStore';
import LoadingSpinner from '@components/common/LoadingSpinner';

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 * Shows loading spinner while checking authentication
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isLoading, checkAuth, initialize } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Check auth validity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuth();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkAuth]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Store the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
}

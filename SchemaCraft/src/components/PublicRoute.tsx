import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect authenticated users to their appropriate dashboard
    if (user.is_admin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }

  return <>{children}</>;
};

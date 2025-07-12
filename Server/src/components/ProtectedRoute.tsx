
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  adminOnly = false 
}) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (requireAuth && !isAuthenticated()) {
    toast.error('Please log in to access this feature');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ requireAdmin }) {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!token;
  
  // Check if user has admin privileges if required
  const hasRequiredRole = requireAdmin ? user.isAdmin : true;

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/signin" replace />;
  }
  
  if (requireAdmin && !hasRequiredRole) {
    // Redirect to home page if not admin but trying to access admin page
    return <Navigate to="/home" replace />;
  }

  // Render the protected component
  return <Outlet />;
} 
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ requireAdmin }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!token;
  
  const hasRequiredRole = requireAdmin ? user.isAdmin : true;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  if (requireAdmin && !hasRequiredRole) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
} 
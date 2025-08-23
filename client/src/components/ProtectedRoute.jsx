import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ requireAdmin, requireFullAdmin }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!token;
  
  // requireFullAdmin means only full admins (not accountants)
  // requireAdmin means admin or accountant
  const hasRequiredRole = requireFullAdmin 
    ? user.isAdmin 
    : requireAdmin 
      ? (user.isAdmin || user.isAccountant) 
      : true;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  if ((requireAdmin || requireFullAdmin) && !hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
} 
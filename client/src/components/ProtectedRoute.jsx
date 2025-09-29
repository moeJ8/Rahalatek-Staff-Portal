import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import GuestNotFoundPage from '../pages/GuestNotFoundPage';

export default function ProtectedRoute({ requireAdmin, requireFullAdmin, requireContentManager }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!token;
  
  // requireFullAdmin means only full admins (not accountants or content managers)
  // requireAdmin means admin or accountant or content manager
  // requireContentManager means admin or content manager (for delete operations)
  const hasRequiredRole = requireFullAdmin 
    ? user.isAdmin 
    : requireContentManager
      ? (user.isAdmin || user.isContentManager)
      : requireAdmin 
        ? (user.isAdmin || user.isAccountant || user.isContentManager) 
        : true;

  if (!isAuthenticated) {
    return <GuestNotFoundPage />;
  }
  
  if ((requireAdmin || requireFullAdmin || requireContentManager) && !hasRequiredRole) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
} 
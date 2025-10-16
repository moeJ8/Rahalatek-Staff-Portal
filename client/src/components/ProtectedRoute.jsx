import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import GuestNotFoundPage from '../pages/Visitors/GuestNotFoundPage';

export default function ProtectedRoute({ requireAdmin, requireFullAdmin, requireContentManager, requirePublisher }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!token;
  
  // requireFullAdmin means only full admins (not accountants, content managers, or publishers)
  // requireAdmin means any authenticated user EXCEPT publishers (blocks publishers only)
  // requireContentManager means admin or content manager or publisher (for content operations)
  // requirePublisher means admin, accountant, content manager, or publisher (for dashboard/content access)
  const hasRequiredRole = requireFullAdmin 
    ? user.isAdmin 
    : requirePublisher
      ? (user.isAdmin || user.isAccountant || user.isContentManager || user.isPublisher)
      : requireContentManager
        ? (user.isAdmin || user.isContentManager || user.isPublisher)
        : requireAdmin 
          ? !user.isPublisher  // Allow everyone except publishers
          : true;

  if (!isAuthenticated) {
    return <GuestNotFoundPage />;
  }
  
  if ((requireAdmin || requireFullAdmin || requireContentManager || requirePublisher) && !hasRequiredRole) {
    // Publishers should be redirected to dashboard if trying to access non-allowed routes
    if (user.isPublisher) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
} 
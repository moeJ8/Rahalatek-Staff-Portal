import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function GuestOnlyRoute() {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // If user is authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If user is not authenticated (guest), allow access
  return <Outlet />;
}

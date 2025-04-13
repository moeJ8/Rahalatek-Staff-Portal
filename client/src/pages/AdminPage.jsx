import React from 'react';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">Admin Dashboard</h1>
      <AdminPanel />
    </div>
  );
} 
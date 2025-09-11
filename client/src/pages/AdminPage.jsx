import React from 'react';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  return (
    <div className="">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        <div className="mb-1 md:mb-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
        <AdminPanel />
      </div>
    </div>
  );
} 
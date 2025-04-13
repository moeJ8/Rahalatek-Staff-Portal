import React from 'react';
import WorkerForm from '../components/WorkerForm';
import { Card } from 'flowbite-react';

export default function WorkerPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Worker Dashboard</h1>
        <div className="max-w-3xl mx-auto">
          <Card className="dark:bg-gray-800 shadow-lg">
            <WorkerForm />
          </Card>
        </div>
      </div>
    </div>
  );
} 
import React from 'react';
import WorkerForm from '../components/WorkerForm';
import { Card } from 'flowbite-react';

export default function WorkerPage() {
  return (
            <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="dark:bg-slate-900 shadow-lg">
            <WorkerForm />
          </Card>
        </div>
      </div>
    </div>
  );
} 
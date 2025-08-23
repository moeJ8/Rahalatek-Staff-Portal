import React from 'react';
import BookingForm from '../components/BookingForm';
import { Card } from 'flowbite-react';

export default function BookingPage() {
  return (
            <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="dark:bg-slate-900 shadow-lg">
            <BookingForm />
          </Card>
        </div>
      </div>
    </div>
  );
} 
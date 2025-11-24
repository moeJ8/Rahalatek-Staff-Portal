import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import CustomButton from '../components/CustomButton';
import { Card } from 'flowbite-react';
import { FaList } from 'react-icons/fa';

export default function BookingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[105rem] mx-auto">
          <div className="flex justify-end mb-4">
            <CustomButton
              onClick={() => navigate('/bookings')}
              variant="blueToTeal"
              size="md"
              icon={FaList}
            >
              View Saved Bookings
            </CustomButton>
          </div>
          <Card className="dark:bg-slate-900 shadow-lg">
            <BookingForm />
          </Card>
        </div>
      </div>
    </div>
  );
} 
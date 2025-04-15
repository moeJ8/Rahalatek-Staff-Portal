import React from 'react';
import { Card } from 'flowbite-react';

const HotelInfo = ({ hotelData }) => {
  if (!hotelData) return null;

  return (
    <Card className="dark:bg-gray-800">
      <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        Hotel Information
      </h5>
      <div className="space-y-1">
        <p className="font-normal text-gray-700 dark:text-gray-400">Type: {hotelData.stars} stars</p>
        {hotelData.roomTypes && hotelData.roomTypes.length > 0 ? (
          <div>
            <p className="font-normal text-gray-700 dark:text-gray-400">Available Room Types:</p>
            <ul className="list-disc pl-5">
              {hotelData.roomTypes.map((roomType, index) => (
                <li key={index} className="font-normal text-gray-700 dark:text-gray-400">
                  {roomType.type}: ${roomType.pricePerNight} per night
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Price: ${hotelData.pricePerNightPerPerson} per person per night
          </p>
        )}
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Breakfast: {hotelData.breakfastIncluded ? 'Included' : 'Not included'}
        </p>
        {hotelData.airport && (
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Airport: {hotelData.airport}
          </p>
        )}
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Airport Transfer: ${hotelData.transportationPrice} per person
        </p>
      </div>
    </Card>
  );
};

export default HotelInfo; 
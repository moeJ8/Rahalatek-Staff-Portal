import React from 'react';
import { Card, Label, Checkbox, Button } from 'flowbite-react';

const TourSelector = ({ 
  availableTours, 
  selectedTours, 
  onTourSelection, 
  onMoveTourUp, 
  onMoveTourDown 
}) => {
  if (!availableTours || availableTours.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-2 block">
        <Label value="Select Tours (Order determines day assignment)" className="dark:text-white" />
      </div>
      <Card className="dark:bg-gray-800">
        {availableTours.map(tour => {
          const isSelected = selectedTours.includes(tour._id);
          const dayNumber = isSelected ? selectedTours.indexOf(tour._id) + 1 : null;
          
          return (
            <div key={tour._id} className="flex items-center pb-4 border-b dark:border-gray-700 last:border-b-0 last:pb-0 mb-2">
              <Checkbox
                id={tour._id}
                checked={isSelected}
                onChange={() => onTourSelection(tour._id)}
                className="mr-2"
              />
              {isSelected && (
                <div className="flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 mr-2 text-xs font-bold">
                  {dayNumber}
                </div>
              )}
              <Label htmlFor={tour._id} className="flex-1">
                <div className="font-medium dark:text-white">{tour.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{tour.description}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">${tour.price} per person • {tour.duration} hours</div>
              </Label>
              {isSelected && (
                <div className="flex space-x-1 ml-2">
                  <Button 
                    size="xs" 
                    color="gray" 
                    onClick={() => onMoveTourUp(tour._id)}
                    disabled={selectedTours.indexOf(tour._id) === 0}
                  >
                    ▲
                  </Button>
                  <Button 
                    size="xs" 
                    color="gray" 
                    onClick={() => onMoveTourDown(tour._id)}
                    disabled={selectedTours.indexOf(tour._id) === selectedTours.length - 1}
                  >
                    ▼
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
};

export default TourSelector; 
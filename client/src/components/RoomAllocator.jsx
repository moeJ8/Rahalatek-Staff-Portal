import React from 'react';
import { Button, Select, Label, Alert } from 'flowbite-react';

const RoomAllocator = ({ 
  selectedHotelData, 
  numGuests, 
  roomAllocations, 
  onAddRoom, 
  onRemoveRoom, 
  onRoomTypeSelect, 
  onOccupantsChange 
}) => {
  if (!selectedHotelData || !selectedHotelData.roomTypes || selectedHotelData.roomTypes.length === 0) {
    return null;
  }
  
  // Calculate total guests allocated to rooms
  const totalAllocated = roomAllocations.reduce((sum, room) => sum + room.occupants, 0);
  
  return (
    <>
      <h3 className="text-lg font-medium mb-2 dark:text-white">Room Allocation</h3>
      
      {totalAllocated > numGuests && (
        <Alert color="failure" className="mb-3">
          <span>You've allocated {totalAllocated} people to rooms, but only have {numGuests} guests.</span>
        </Alert>
      )}
      
      {totalAllocated < numGuests && (
        <Alert color="warning" className="mb-3">
          <span>You've allocated {totalAllocated} out of {numGuests} guests to rooms.</span>
        </Alert>
      )}
      
      {totalAllocated === numGuests && roomAllocations.length > 0 && (
        <Alert color="success" className="mb-3">
          <span>All guests are allocated to rooms.</span>
        </Alert>
      )}
      
      {roomAllocations.map((room, index) => (
        <div key={index} className="flex flex-col gap-2 mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="dark:text-white font-medium">Room {index + 1}</span>
            <Button 
              color="failure" 
              size="xs" 
              onClick={() => onRemoveRoom(index)}
            >
              Remove
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-grow">
              <Label htmlFor={`roomType-${index}`} value="Room Type" className="dark:text-white mb-1" />
              <Select 
                id={`roomType-${index}`}
                value={room.roomTypeIndex}
                onChange={(e) => onRoomTypeSelect(index, e.target.value)}
              >
                <option value="">Select Room Type</option>
                {selectedHotelData.roomTypes.map((roomType, typeIndex) => (
                  <option key={typeIndex} value={typeIndex}>
                    {roomType.type} (${roomType.pricePerNight}/night)
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="w-full sm:w-1/3">
              <Label htmlFor={`occupants-${index}`} value="Occupants" className="dark:text-white mb-1" />
              <Select
                id={`occupants-${index}`}
                value={room.occupants}
                onChange={(e) => onOccupantsChange(index, e.target.value)}
              >
                {[1, 2, 3, 4].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      ))}
      
      <Button 
        size="sm"
        onClick={onAddRoom}
        className="mt-2"
      >
        + Add Room
      </Button>
    </>
  );
};

export default RoomAllocator;
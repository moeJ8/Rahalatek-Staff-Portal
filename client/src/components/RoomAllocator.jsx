import React from 'react';
import { Button, Select, Label, Alert } from 'flowbite-react';

const RoomAllocator = ({ 
  selectedHotelData, 
  numGuests, 
  roomAllocations, 
  onAddRoom, 
  onRemoveRoom, 
  onRoomTypeSelect, 
  onOccupantsChange,
  includeChildren,
  childrenUnder3,
  children3to6,
  children6to12,
  onChildrenUnder3Change,
  onChildren3to6Change,
  onChildren6to12Change
}) => {
  if (!selectedHotelData || !selectedHotelData.roomTypes || selectedHotelData.roomTypes.length === 0) {
    return null;
  }
  
  const totalAllocated = roomAllocations.reduce((sum, room) => sum + room.occupants, 0);
  
  const totalChildrenUnder3Allocated = roomAllocations.reduce((sum, room) => sum + (room.childrenUnder3 || 0), 0);
  const totalChildren3to6Allocated = roomAllocations.reduce((sum, room) => sum + (room.children3to6 || 0), 0);
  const totalChildren6to12Allocated = roomAllocations.reduce((sum, room) => sum + (room.children6to12 || 0), 0);
  
  const allChildrenAllocated = 
    totalChildrenUnder3Allocated === childrenUnder3 &&
    totalChildren3to6Allocated === children3to6 &&
    totalChildren6to12Allocated === children6to12;
  
  return (
    <div className="space-y-4">
      {/* Allocation status alerts */}
      <div className="space-y-2">
        {totalAllocated > numGuests && (
          <Alert color="failure" className="mb-2 py-2 text-sm">
            <span>You've allocated {totalAllocated} people to rooms, but only have {numGuests} guests.</span>
          </Alert>
        )}
        
        {totalAllocated < numGuests && (
          <Alert color="warning" className="mb-2 py-2 text-sm">
            <span>You've allocated {totalAllocated} out of {numGuests} guests to rooms.</span>
          </Alert>
        )}
        
        {totalAllocated === numGuests && roomAllocations.length > 0 && !includeChildren && (
          <Alert color="success" className="mb-2 py-2 text-sm">
            <span>All guests are allocated to rooms.</span>
          </Alert>
        )}

        {includeChildren && !allChildrenAllocated && (
          <Alert color="warning" className="mb-2 py-2 text-sm">
            <span>
              Please assign all children to rooms: <br />
              {childrenUnder3 > 0 && <span className="inline-block pr-2">Children 0-3: {totalChildrenUnder3Allocated}/{childrenUnder3}</span>}
              {children3to6 > 0 && <span className="inline-block pr-2">Children 3-6: {totalChildren3to6Allocated}/{children3to6}</span>}
              {children6to12 > 0 && <span className="inline-block">Children 6-12: {totalChildren6to12Allocated}/{children6to12}</span>}
            </span>
          </Alert>
        )}
        
        {totalAllocated === numGuests && includeChildren && allChildrenAllocated && roomAllocations.length > 0 && (
          <Alert color="success" className="mb-2 py-2 text-sm">
            <span>All guests and children are allocated to rooms.</span>
          </Alert>
        )}
      </div>
      
      {/* Room allocations - now in a 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roomAllocations.map((room, index) => (
          <div key={index} className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
              <span className="font-medium text-gray-800 dark:text-white">Room {index + 1}</span>
              <Button 
                color="failure" 
                size="xs" 
                onClick={() => onRemoveRoom(index)}
                className="px-2 py-1 text-xs"
              >
                Remove
              </Button>
            </div>
            
            <div className="flex flex-col gap-4 flex-grow">
              <div>
                <Label htmlFor={`roomType-${index}`} value="Room Type" className="text-sm dark:text-white mb-1" />
                <Select 
                  id={`roomType-${index}`}
                  value={room.roomTypeIndex}
                  onChange={(e) => onRoomTypeSelect(index, e.target.value)}
                  className="text-sm"
                >
                  <option value="">Select Room Type</option>
                  {selectedHotelData.roomTypes.map((roomType, typeIndex) => (
                    <option key={typeIndex} value={typeIndex}>
                      {roomType.type} (${roomType.pricePerNight}/night)
                    </option>
                  ))}
                </Select>
              </div>
                
              <div>
                <Label htmlFor={`occupants-${index}`} value="Adults" className="text-sm dark:text-white mb-1" />
                <Select
                  id={`occupants-${index}`}
                  value={room.occupants}
                  onChange={(e) => onOccupantsChange(index, e.target.value)}
                  className="text-sm"
                >
                  {[1, 2, 3, 4].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                  ))}
                </Select>
              </div>
              
              {includeChildren && (
                <div className="flex flex-col gap-3 mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <div>
                    <Label htmlFor={`children-under-3-${index}`} value="Children (0-3)" className="dark:text-white mb-1 text-xs" />
                    <Select
                      id={`children-under-3-${index}`}
                      size="sm"
                      value={room.childrenUnder3 || 0}
                      onChange={(e) => onChildrenUnder3Change(index, parseInt(e.target.value))}
                      className="text-sm"
                    >
                      {[0, 1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Select>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Free on tours</p>
                  </div>
                  
                  <div>
                    <Label htmlFor={`children-3to6-${index}`} value="Children (3-6)" className="dark:text-white mb-1 text-xs" />
                    <Select
                      id={`children-3to6-${index}`}
                      size="sm"
                      value={room.children3to6 || 0}
                      onChange={(e) => onChildren3to6Change(index, parseInt(e.target.value))}
                      className="text-sm"
                    >
                      {[0, 1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Select>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Free accommodation</p>
                  </div>
                  
                  <div>
                    <Label htmlFor={`children-6to12-${index}`} value="Children (6-12)" className="dark:text-white mb-1 text-xs" />
                    <Select
                      id={`children-6to12-${index}`}
                      size="sm"
                      value={room.children6to12 || 0}
                      onChange={(e) => onChildren6to12Change(index, parseInt(e.target.value))}
                      className="text-sm"
                    >
                      {[0, 1, 2, 3, 4].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </Select>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Special hotel rate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          size="xs"
          color="light"
          onClick={onAddRoom}
          className="px-3 py-1.5 flex items-center"
        >
          <span className="text-sm font-medium flex items-center">
            <span className="mr-1 inline-flex items-center">+</span>
            Add Room
          </span>
        </Button>
      </div>
    </div>
  );
};

export default RoomAllocator;
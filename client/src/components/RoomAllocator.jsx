import React from 'react';
import { Label, Alert } from 'flowbite-react';
import Select from './Select';
import CustomButton from './CustomButton';

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
          <div key={index} className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-600 h-full">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-600 pb-2 mb-2">
              <span className="font-medium text-gray-800 dark:text-white">Room {index + 1}</span>
              <CustomButton 
                variant="red" 
                size="xs" 
                onClick={() => onRemoveRoom(index)}
              >
                Remove
              </CustomButton>
            </div>
            
            <div className="flex flex-col gap-4 flex-grow">
              <div>
                <Select 
                  id={`roomType-${index}`}
                  label="Room Type"
                  value={room.roomTypeIndex}
                  onChange={(value) => onRoomTypeSelect(index, value)}
                  placeholder="Select Room Type"
                  options={[
                    { value: '', label: 'Select Room Type' },
                    ...selectedHotelData.roomTypes.map((roomType, typeIndex) => ({
                      value: typeIndex.toString(),
                      label: `${roomType.type} ($${roomType.pricePerNight}/night)`
                    }))
                  ]}
                  className="text-sm"
                />
              </div>
                
              <div>
                <Select
                  id={`occupants-${index}`}
                  label="Adults"
                  value={room.occupants.toString()}
                  onChange={(value) => onOccupantsChange(index, value)}
                  placeholder="Select Adults"
                  options={[1, 2, 3, 4].map(num => ({
                    value: num.toString(),
                    label: `${num} ${num === 1 ? 'person' : 'people'}`
                  }))}
                  className="text-sm"
                />
              </div>
              
              {includeChildren && (
                <div className="flex flex-col gap-3 mt-1 p-3 bg-gray-100 dark:bg-slate-900 rounded-md">
                  <div>
                    <Select
                      id={`children-under-3-${index}`}
                      label="Children (0-3)"
                      value={(room.childrenUnder3 || 0).toString()}
                      onChange={(value) => onChildrenUnder3Change(index, parseInt(value))}
                      placeholder="Select Count"
                      options={[0, 1, 2, 3, 4].map(num => ({
                        value: num.toString(),
                        label: num.toString()
                      }))}
                      className="text-sm"
                    />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Free on tours</p>
                  </div>
                  
                  <div>
                    <Select
                      id={`children-3to6-${index}`}
                      label="Children (3-6)"
                      value={(room.children3to6 || 0).toString()}
                      onChange={(value) => onChildren3to6Change(index, parseInt(value))}
                      placeholder="Select Count"
                      options={[0, 1, 2, 3, 4].map(num => ({
                        value: num.toString(),
                        label: num.toString()
                      }))}
                      className="text-sm"
                    />
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Free accommodation</p>
                  </div>
                  
                  <div>
                    <Select
                      id={`children-6to12-${index}`}
                      label="Children (6-12)"
                      value={(room.children6to12 || 0).toString()}
                      onChange={(value) => onChildren6to12Change(index, parseInt(value))}
                      placeholder="Select Count"
                      options={[0, 1, 2, 3, 4].map(num => ({
                        value: num.toString(),
                        label: num.toString()
                      }))}
                      className="text-sm"
                    />
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Special hotel rate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-4">
        <CustomButton 
          size="sm"
          variant="pinkToOrange"
          onClick={onAddRoom}
        >
          + Add Room
        </CustomButton>
      </div>
    </div>
  );
};

export default RoomAllocator;
import React, { useState, useEffect, useRef } from 'react';
import { Card, Label, Checkbox, TextInput, Select } from 'flowbite-react';
import { FaCrown, FaUsers, FaCar, FaSearch, FaCheck, FaCalendarDay, FaGripLines, FaArrowsAltV } from 'react-icons/fa';
import CustomScrollbar from './CustomScrollbar';

const TourSelector = ({ 
  availableTours, 
  selectedTours, 
  onTourSelection, 
  onTourDayAssignment
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTours, setFilteredTours] = useState([]);
  const [containerHeight, setContainerHeight] = useState(256);
  const resizableRef = useRef(null);

  useEffect(() => {
    if (!availableTours || availableTours.length === 0) {
      setFilteredTours([]);
      return;
    }

    let filtered = availableTours;

    if (activeTab === 'vip') {
      filtered = filtered.filter(tour => tour.tourType === 'VIP');
    } else if (activeTab === 'group') {
      filtered = filtered.filter(tour => tour.tourType === 'Group');
    } else if (activeTab === 'selected') {
      filtered = filtered.filter(tour => selectedTours.includes(tour._id));
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(tour => 
        tour.name.toLowerCase().includes(searchLower) || 
        (tour.description && tour.description.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredTours(filtered);
  }, [availableTours, searchTerm, activeTab, selectedTours]);
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = containerHeight;
    
    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(128, Math.min(600, startHeight + deltaY));
      setContainerHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    // Get initial touch position without preventDefault
    const touch = e.touches[0];
    const startY = touch.clientY;
    const startHeight = containerHeight;
    
    const handleTouchMove = (moveEvent) => {
      // Don't call preventDefault to avoid passive listener warning
      const touch = moveEvent.touches[0];
      const deltaY = touch.clientY - startY;
      const newHeight = Math.max(128, Math.min(600, startHeight + deltaY));
      setContainerHeight(newHeight);
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    // Don't use { passive: false } which causes the warning
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  useEffect(() => {
    return () => {
      // Use null instead of empty functions
      document.removeEventListener('mousemove', null);
      document.removeEventListener('mouseup', null);
      document.removeEventListener('touchmove', null);
      document.removeEventListener('touchend', null);
    };
  }, []);

  if (!availableTours || availableTours.length === 0) {
    return null;
  }
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const vipCount = availableTours.filter(tour => tour.tourType === 'VIP').length;
  const groupCount = availableTours.filter(tour => tour.tourType === 'Group').length;
  const selectedCount = selectedTours.length;

  return (
    <div>
      <div className="mb-2 block">
        <Label value="Select Tours (Order determines day assignment)" className="dark:text-white" />
      </div>
      
      <Card className="dark:bg-gray-800">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <TextInput
              type="text"
              placeholder="Search tours..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-full"
            />
          </div>
          
          {/* Custom Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px justify-center">
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === 'all' 
                      ? 'text-blue-600 border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500' 
                      : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span>All Tours</span>
                  <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded">
                    {availableTours.length}
                  </span>
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('vip')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === 'vip' 
                      ? 'text-blue-600 border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500' 
                      : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FaCrown className="mr-2 text-amber-500" />
                  <span>VIP Tours</span>
                  <span className="ml-2 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium px-2 py-0.5 rounded">
                    {vipCount}
                  </span>
                </button>
              </li>
              <li className="mr-2">
                <button
                  onClick={() => setActiveTab('group')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === 'group' 
                      ? 'text-blue-600 border-b-2 border-blue-600 active dark:text-blue-500 dark:border-blue-500' 
                      : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FaUsers className="mr-2 text-blue-500" />
                  <span>Group Tours</span>
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded">
                    {groupCount}
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('selected')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                    activeTab === 'selected' 
                      ? 'text-green-600 border-b-2 border-green-600 active dark:text-green-500 dark:border-green-500' 
                      : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <FaCheck className="mr-2 text-green-500" />
                  <span>Selected</span>
                  <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded">
                    {selectedCount}
                  </span>
                </button>
              </li>
            </ul>
          </div>
          
          {/* No Results Message */}
          {filteredTours.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              {activeTab === 'selected' && selectedTours.length === 0 
                ? "No tours selected yet" 
                : "No tours match your search criteria"}
            </div>
          )}
          
          {/* Tours List - resizable container */}
          <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg">
            {/* Main content container with CustomScrollbar */}
            <div 
              ref={resizableRef}
              style={{ 
                height: `${containerHeight}px`, 
                maxHeight: '600px',
              }}
            >
              <CustomScrollbar maxHeight={`${containerHeight}px`}>
                {filteredTours.map(tour => {
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
                        <div className="font-medium dark:text-white flex items-center">
                          {tour.name}
                          {tour.tourType === 'VIP' ? (
                            <span 
                              className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs 
                              bg-gradient-to-r from-amber-500 to-yellow-300 border border-amber-600"
                              style={{ 
                                color: '#7B5804', 
                                fontWeight: 'bold',
                                fontSize: '0.65rem',
                                textShadow: '0 0 2px rgba(255,255,255,0.5)'
                              }}
                            >
                              <FaCrown className="mr-1" style={{fontSize: '0.65rem'}} />VIP
                            </span>
                          ) : (
                            <span 
                              className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs 
                              bg-blue-600 text-white"
                              style={{ 
                                fontSize: '0.65rem'
                              }}
                            >
                              <FaUsers className="mr-1" style={{fontSize: '0.65rem'}} />Group
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{tour.description}</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          ${tour.price} {tour.tourType === 'Group' ? 'per person' : 'per car'} • {tour.duration} hours
                          {tour.tourType === 'VIP' && (
                            <span className="ml-2">
                              <FaCar className="inline mr-1" style={{fontSize: '0.7rem'}} />
                              {tour.vipCarType} ({tour.carCapacity?.min || '?'}-{tour.carCapacity?.max || '?'})
                            </span>
                          )}
                        </div>
                      </Label>
                      {isSelected && (
                        <div className="flex items-center ml-2">
                          <div className="flex items-center">
                            <FaCalendarDay className="text-blue-500 mr-2" />
                            <Select
                              size="sm"
                              value={dayNumber - 1}
                              onChange={(e) => onTourDayAssignment(tour._id, parseInt(e.target.value))}
                              className="!py-1"
                              style={{ minWidth: '100px' }}
                            >
                              {Array.from({ length: selectedTours.length }, (_, i) => (
                                <option key={i} value={i}>
                                  Day {i + 1}{i === dayNumber - 1 ? ' (current)' : ''}
                                </option>
                              ))}
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CustomScrollbar>
            </div>

            <div 
              className="flex items-center justify-center w-full h-10 bg-gray-200 dark:bg-gray-600 cursor-ns-resize hover:bg-gray-300 dark:hover:bg-gray-500 rounded-b-lg"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{ touchAction: 'none' }}
            >
              <FaArrowsAltV className="text-gray-500 dark:text-gray-300 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Drag to resize</span>
            </div>
          </div>

          {selectedTours.length > 0 && (
            <div className="text-center pt-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedTours.length} {selectedTours.length === 1 ? 'tour' : 'tours'} selected
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TourSelector; 
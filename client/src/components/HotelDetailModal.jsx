import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'flowbite-react';
import { FaStar, FaBed, FaUtensils, FaPlane, FaCarSide, FaChild, FaInfo, FaMoneyBillWave, FaChevronDown, FaChevronUp, FaTimes, FaConciergeBell } from 'react-icons/fa';
import { getMonthName } from '../utils/pricingUtils';
import CustomScrollbar from './CustomScrollbar';

const HotelDetailModal = ({ isOpen, onClose, hotelData }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [expandedRooms, setExpandedRooms] = useState({});

  useEffect(() => {
    if (hotelData?.roomTypes?.length) {
      const collapsed = {};
      hotelData.roomTypes.forEach((_, index) => {
        collapsed[index] = false;
      });
      setExpandedRooms(collapsed);
    }
  }, [hotelData]);

  if (!hotelData) return null;

  const toggleRoomExpansion = (roomIndex) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomIndex]: !prev[roomIndex]
    }));
  };

  const renderStars = (count) => {
    return Array(count).fill(0).map((_, i) => (
      <FaStar key={i} className="text-yellow-400 inline" />
    ));
  };

  // Get months for pricing tables
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const tabs = [
    { id: 'general', label: 'General Info', icon: FaInfo },
    { id: 'amenities', label: 'Services', icon: FaConciergeBell },
    { id: 'rooms', label: 'Room Types', icon: FaBed },
    { id: 'pricing', label: 'Monthly Prices', icon: FaMoneyBillWave }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="p-4 space-y-4">
            {hotelData.description && (
              <div className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Description:</h4>
                <p className="text-gray-700 dark:text-gray-300">{hotelData.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <FaUtensils className="text-amber-500 dark:text-amber-400 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-md font-medium text-gray-800 dark:text-gray-200">Breakfast:</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {hotelData.breakfastIncluded ? 
                        <span className="text-green-600 dark:text-green-400">Included</span> : 
                        <span className="text-gray-500 dark:text-gray-400">Not included</span>}
                      {hotelData.breakfastPrice > 0 && 
                        <span className="ml-1">- ${hotelData.breakfastPrice} per room</span>}
                    </p>
                  </div>
                </div>
              </div>

              {hotelData.airport && (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                  <div className="flex items-start">
                    <FaPlane className="text-blue-500 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-md font-medium text-gray-800 dark:text-gray-200">Nearest Airport:</p>
                      <p className="text-gray-700 dark:text-gray-300">{hotelData.airport}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <FaCarSide className="text-purple-500 dark:text-purple-400 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-md font-medium text-gray-800 dark:text-gray-200">Airport Transfer:</p>
                    {hotelData.transportation ? (
                      <div className="space-y-1 mt-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Vito Reception:</span> 
                          <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                            ${hotelData.transportation.vitoReceptionPrice}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Vito Farewell:</span> 
                          <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                            ${hotelData.transportation.vitoFarewellPrice}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Sprinter Reception:</span> 
                          <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                            ${hotelData.transportation.sprinterReceptionPrice}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Sprinter Farewell:</span> 
                          <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                            ${hotelData.transportation.sprinterFarewellPrice}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium text-green-600 dark:text-green-400">${hotelData.transportationPrice}</span> per person
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <FaChild className="text-blue-500 dark:text-blue-400 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-md font-medium text-gray-800 dark:text-gray-200">Children Policy:</p>
                    <div className="space-y-1 mt-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Under 6:</span> {hotelData.childrenPolicies?.under6 || 'Free'}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Ages 6-12:</span> {hotelData.childrenPolicies?.age6to12 || 'Additional charge'}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Above 12:</span> {hotelData.childrenPolicies?.above12 || 'Adult price'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'amenities':
        return (
          <div className="p-4">
            {hotelData.amenities && Object.keys(hotelData.amenities).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(hotelData.amenities).map(([categoryKey, categoryData]) => {
                  if (!categoryData || typeof categoryData !== 'object') return null;
                  
                  const selectedAmenities = Object.entries(categoryData).filter(([, value]) => value === true);
                  if (selectedAmenities.length === 0) return null;

                  // Format category title
                  const categoryTitle = categoryKey
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .replace(/([a-z])([A-Z])/g, '$1 $2');

                  return (
                    <div key={categoryKey} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                        {categoryTitle}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedAmenities.map(([amenityKey]) => {
                          // Format amenity label
                          const amenityLabel = amenityKey
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .replace(/([a-z])([A-Z])/g, '$1 $2')
                            .replace(/24h/g, '24h')
                            .replace(/80 Percent/g, '80%')
                            .replace(/1999/g, '1999');

                          return (
                            <div key={amenityKey} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{amenityLabel}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center">
                <FaConciergeBell className="mx-auto text-gray-400 text-4xl mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Services Listed</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This hotel doesn't have detailed amenities and services information available.
                </p>
              </div>
            )}
          </div>
        );
      case 'rooms':
        return (
          <div className="p-4">
            {hotelData.roomTypes && hotelData.roomTypes.length > 0 ? (
              <div className="space-y-6">
                {hotelData.roomTypes.map((roomType, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {roomType.type}
                    </h4>
                    
                    {/* Room Images */}
                    {roomType.images && roomType.images.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Room Images</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {roomType.images.map((image, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <img
                                src={image.url}
                                alt={image.altText || `${roomType.type} room ${imgIndex + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity cursor-pointer"
                                onClick={() => window.open(image.url, '_blank')}
                              />
                              {image.isPrimary && (
                                <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center space-x-1">
                                  <FaStar className="w-2 h-2" />
                                  <span>Primary</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to enlarge
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Pricing Information */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="text-gray-700 dark:text-gray-300">Base Price Per Night (Adult):</span>
                        <span className="font-medium text-green-600 dark:text-green-400">${roomType.pricePerNight}</span>
                      </div>
                      {roomType.childrenPricePerNight > 0 && (
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                          <span className="text-gray-700 dark:text-gray-300">Base Price Per Night (Child):</span>
                          <span className="font-medium text-green-600 dark:text-green-400">${roomType.childrenPricePerNight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  Standard pricing: ${hotelData.pricePerNightPerPerson} per person per night
                </p>
              </div>
            )}
          </div>
        );
      case 'pricing':
        return (
          <div className="p-4">
            {hotelData.roomTypes && hotelData.roomTypes.length > 0 ? (
              <div className="space-y-4">
                {hotelData.roomTypes.map((roomType, index) => {
                  const isExpanded = expandedRooms[index] === true; // Default to collapsed
                  
                  return (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => toggleRoomExpansion(index)}
                      >
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white flex-1">
                          {roomType.type}
                        </h4>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                            {isExpanded ? 'Hide' : 'Show'} Monthly Prices
                          </span>
                          {isExpanded ? (
                            <FaChevronUp className="text-gray-500 dark:text-gray-400" />
                          ) : (
                            <FaChevronDown className="text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
                          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                            <thead className="text-xs text-gray-800 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                              <tr>
                                <th scope="col" className="px-4 py-3">Month</th>
                                <th scope="col" className="px-4 py-3">Adult Price</th>
                                <th scope="col" className="px-4 py-3">Child Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {months.map((month, monthIndex) => {
                                const adultPrice = roomType.monthlyPrices?.[month]?.adult || 0;
                                const childPrice = roomType.monthlyPrices?.[month]?.child || 0;
                                
                                // Get the current month for highlighting
                                const currentMonth = getMonthName(new Date());
                                const isCurrentMonth = month === currentMonth;
                                
                                return (
                                  <tr key={monthIndex} className={`border-b dark:border-gray-700 ${isCurrentMonth ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}>
                                    <td className="px-4 py-3 font-medium">
                                      {month.charAt(0).toUpperCase() + month.slice(1)}
                                      {isCurrentMonth && (
                                        <span className="ml-2 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs py-0.5 px-1.5 rounded">Current</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-green-600 dark:text-green-400">
                                      ${adultPrice > 0 ? adultPrice : roomType.pricePerNight}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-green-600 dark:text-green-400">
                                      ${childPrice > 0 ? childPrice : roomType.childrenPricePerNight}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
                <p className="text-gray-700 dark:text-gray-300">
                  No monthly pricing available. Standard price: ${hotelData.pricePerNightPerPerson} per night.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size="xl"
      dismissible={true}
      className="bg-gray-50 dark:bg-gray-900"
      popup={false}
      theme={{
        root: {
          base: "fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full",
          show: {
            on: "flex bg-gray-900/50 backdrop-blur-sm dark:bg-opacity-80 items-center justify-center",
            off: "hidden"
          }
        },
        content: {
          base: "relative h-full w-full p-4 md:h-auto",
          inner: "relative flex flex-col rounded-lg bg-white shadow dark:bg-slate-900 max-h-[90vh]"
        }
      }}
    >
      <div className="sticky top-0 z-10">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            aria-label="Close"
          >
            <FaTimes className="w-4 h-4" />
          </button>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {hotelData.name}
          </h3>
          <div className="flex items-center justify-center">
            <span className="flex items-center text-xs bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
              {renderStars(hotelData.stars)}
              <span className="ml-1 text-gray-700 dark:text-gray-300">{hotelData.stars}-star</span>
            </span>
            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">{hotelData.city}</span>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-sm">
          <div className="flex overflow-x-auto justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1.5 sm:px-3 md:px-4 py-1 sm:py-2 mx-0.5 whitespace-nowrap text-xs font-medium border-b-2 focus:outline-none ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className={`mr-1 h-3 w-3 ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Modal.Body className="p-0">
        <CustomScrollbar maxHeight="60vh">
          {renderTabContent()}
        </CustomScrollbar>
      </Modal.Body>

      <Modal.Footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-center">
        <Button color="gray" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HotelDetailModal; 
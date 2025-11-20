import React, { useRef, useState, useEffect } from 'react';
import CustomButton from './CustomButton';
import { FaDownload, FaSpinner, FaTrash, FaPen, FaFileImage, FaFilePdf, FaEye, FaEyeSlash, FaChevronUp, FaChevronDown, FaBuilding } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDisplayDate } from '../utils/voucherGenerator';
import { Link } from 'react-router-dom';
import { inferCountryFromCity } from '../utils/countryCities';

// Helper function to get currency symbol
const getCurrencySymbol = (currency) => {
  if (!currency) return '$'; // default to USD
  switch (currency) {
    case 'EUR': return '€';
    case 'TRY': return '₺';
    case 'USD':
    default: return '$';
  }
};


const VoucherPreview = ({ voucherData, onDelete, editUrl, saveButton, onSave }) => {
  const voucherRef = useRef(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  
  const getStorageKey = (section) => {
    return `voucherPreview_${voucherData?.voucherNumber || 'default'}_${section}`;
  };

  // Load initial visibility state from localStorage
  const getInitialVisibility = (section) => {
    const stored = localStorage.getItem(getStorageKey(section));
    return stored !== null ? JSON.parse(stored) : true;
  };

  const [showHotels, setShowHotels] = useState(() => getInitialVisibility('hotels'));
  const [showTransfers, setShowTransfers] = useState(() => getInitialVisibility('transfers'));
  const [showTrips, setShowTrips] = useState(() => getInitialVisibility('trips'));
  const [showFlights, setShowFlights] = useState(() => getInitialVisibility('flights'));
  const [showOthers, setShowOthers] = useState(() => getInitialVisibility('others'));
  const [showLogo, setShowLogo] = useState(() => getInitialVisibility('logo'));
  const [showAddress, setShowAddress] = useState(() => getInitialVisibility('address'));
  const [showContact, setShowContact] = useState(() => getInitialVisibility('contact'));
  const [showTotalAmount, setShowTotalAmount] = useState(() => getInitialVisibility('totalAmount'));

  const saveVisibilityState = (section, value) => {
    localStorage.setItem(getStorageKey(section), JSON.stringify(value));
  };

  const setShowHotelsWithStorage = (value) => {
    setShowHotels(value);
    saveVisibilityState('hotels', value);
  };

  const setShowTransfersWithStorage = (value) => {
    setShowTransfers(value);
    saveVisibilityState('transfers', value);
  };

  const setShowTripsWithStorage = (value) => {
    setShowTrips(value);
    saveVisibilityState('trips', value);
  };

  const setShowFlightsWithStorage = (value) => {
    setShowFlights(value);
    saveVisibilityState('flights', value);
  };

  const setShowOthersWithStorage = (value) => {
    setShowOthers(value);
    saveVisibilityState('others', value);
  };

  const setShowLogoWithStorage = (value) => {
    setShowLogo(value);
    saveVisibilityState('logo', value);
  };

  const setShowAddressWithStorage = (value) => {
    setShowAddress(value);
    saveVisibilityState('address', value);
  };

  const setShowContactWithStorage = (value) => {
    setShowContact(value);
    saveVisibilityState('contact', value);
  };

  const setShowTotalAmountWithStorage = (value) => {
    setShowTotalAmount(value);
    saveVisibilityState('totalAmount', value);
  };
  
  const [reorderedHotels, setReorderedHotels] = useState([]);
  const [reorderedTransfers, setReorderedTransfers] = useState([]);
  const [reorderedTrips, setReorderedTrips] = useState([]);
  const [reorderedFlights, setReorderedFlights] = useState([]);
  const [reorderedOthers, setReorderedOthers] = useState([]);
  

  useEffect(() => {
    if (voucherData) {
      setReorderedHotels(voucherData.hotels || []);
      setReorderedTransfers(voucherData.transfers || []);
      setReorderedTrips(voucherData.trips || []);
      setReorderedFlights(voucherData.flights || []);
      setReorderedOthers(voucherData.others || []);
    }
  }, [voucherData]);
  
  // Move item up in array
  const moveUp = (index, type) => {
    if (index === 0) return;
    
    if (type === 'hotels') {
      const newArray = [...reorderedHotels];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      setReorderedHotels(newArray);
    } else if (type === 'transfers') {
      const newArray = [...reorderedTransfers];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      setReorderedTransfers(newArray);
    } else if (type === 'trips') {
      const newArray = [...reorderedTrips];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      setReorderedTrips(newArray);
    } else if (type === 'flights') {
      const newArray = [...reorderedFlights];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      setReorderedFlights(newArray);
    } else if (type === 'others') {
      const newArray = [...reorderedOthers];
      [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
      setReorderedOthers(newArray);
    }
  };
  
  // Move item down in array
  const moveDown = (index, type) => {
    let arrayLength;
    if (type === 'hotels') arrayLength = reorderedHotels.length;
    else if (type === 'transfers') arrayLength = reorderedTransfers.length;
    else if (type === 'trips') arrayLength = reorderedTrips.length;
    else if (type === 'flights') arrayLength = reorderedFlights.length;
    else if (type === 'others') arrayLength = reorderedOthers.length;
    
    if (index === arrayLength - 1) return;
    
    if (type === 'hotels') {
      const newArray = [...reorderedHotels];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      setReorderedHotels(newArray);
    } else if (type === 'transfers') {
      const newArray = [...reorderedTransfers];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      setReorderedTransfers(newArray);
    } else if (type === 'trips') {
      const newArray = [...reorderedTrips];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      setReorderedTrips(newArray);
    } else if (type === 'flights') {
      const newArray = [...reorderedFlights];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      setReorderedFlights(newArray);
    } else if (type === 'others') {
      const newArray = [...reorderedOthers];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      setReorderedOthers(newArray);
    }
  };
  
  // Determine if all sections are visible
  const allSectionsVisible = showHotels && showTransfers && showTrips && showFlights && showOthers && showTotalAmount;
  
  const toggleAllSections = () => {
    if (allSectionsVisible) {
      
      setShowHotelsWithStorage(false);
      setShowTransfersWithStorage(false);
      setShowTripsWithStorage(false);
      setShowFlightsWithStorage(false);
      setShowOthersWithStorage(false);
      setShowTotalAmountWithStorage(false);
    } else {
    
      setShowHotelsWithStorage(true);
      setShowTransfersWithStorage(true);
      setShowTripsWithStorage(true);
      setShowFlightsWithStorage(true);
      setShowOthersWithStorage(true);
      setShowTotalAmountWithStorage(true);
    }
  };

  // Determine if all header elements are visible
  const allHeaderElementsVisible = showLogo && showAddress && showContact;
  
  const toggleAllHeaderElements = () => {
    if (allHeaderElementsVisible) {
      setShowLogoWithStorage(false);
      setShowAddressWithStorage(false);
      setShowContactWithStorage(false);
    } else {
      setShowLogoWithStorage(true);
      setShowAddressWithStorage(true);
      setShowContactWithStorage(true);
    }
  };
  
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      setLogoDataUrl(dataUrl);
    };
    img.src = '/Logolight.png';
  }, []);

  // Check user role for office detail button visibility
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.isAdmin || false);
    setIsAccountant(user.isAccountant || false);
  }, []);
  
  const generateDesktopVersionForDownload = () => {
    const currencySymbol = getCurrencySymbol(voucherData.currency);

    const container = document.createElement('div');
    container.style.width = '800px'; // Increased width for better quality
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.fontWeight = 'bold';
    
    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '20px';
    header.style.paddingBottom = '10px';
    header.style.borderBottom = '2px solid #e5efff';
    
    // Logo container (conditionally included)
    if (showLogo) {
      const logoContainer = document.createElement('div');
      logoContainer.style.display = 'flex';
      logoContainer.style.alignItems = 'center';
      
      // If we have the logo data URL, use it
      if (logoDataUrl) {
        const logoImg = document.createElement('img');
        logoImg.src = logoDataUrl;
        logoImg.style.height = '60px';
        logoImg.style.marginRight = '15px';
        logoContainer.appendChild(logoImg);
      }
      
      // Logo text
      const titleContainer = document.createElement('div');
      
      const companyTitle = document.createElement('div');
      companyTitle.textContent = 'RAHALATEK';
      companyTitle.style.color = '#1e40af';
      companyTitle.style.fontSize = '28px';
      companyTitle.style.fontWeight = 'bold';
      companyTitle.style.lineHeight = '1.2';
      
      const companySubtitle = document.createElement('div');
      companySubtitle.textContent = 'TOURISM';
      companySubtitle.style.color = '#3b82f6';
      companySubtitle.style.fontSize = '18px';
      
      titleContainer.appendChild(companyTitle);
      titleContainer.appendChild(companySubtitle);
      logoContainer.appendChild(titleContainer);
      
      header.appendChild(logoContainer);
    }
    container.appendChild(header);
    
    // Client Info
    const clientInfo = document.createElement('div');
    clientInfo.style.backgroundColor = '#ffffff';
    clientInfo.style.border = '1px solid #e5e7eb';
    clientInfo.style.padding = '15px';
    clientInfo.style.borderRadius = '6px';
    clientInfo.style.marginBottom = '20px';
    clientInfo.style.display = 'grid';
    clientInfo.style.gridTemplateColumns = '1fr 1fr';
    clientInfo.style.gap = '10px';
    
    // Client Name
    const clientNameDiv = document.createElement('div');
    const clientNameLabel = document.createElement('span');
    clientNameLabel.textContent = 'Clients: ';
    clientNameLabel.style.fontWeight = '600';
    clientNameDiv.appendChild(clientNameLabel);
    clientNameDiv.appendChild(document.createTextNode(voucherData.clientName));
    
    // Add client nationality directly under client name
    const clientNationalityDiv = document.createElement('div');
    clientNationalityDiv.style.marginTop = '4px';
    
    const nationalityLabel = document.createElement('span');
    nationalityLabel.textContent = 'Nationality: ';
    nationalityLabel.style.fontWeight = '600';
    
    clientNationalityDiv.appendChild(nationalityLabel);
    clientNationalityDiv.appendChild(document.createTextNode(voucherData.nationality));
    
    // Add phone number if provided
    let clientPhoneDiv;
    if (voucherData.phoneNumber) {
      clientPhoneDiv = document.createElement('div');
      clientPhoneDiv.style.marginTop = '4px';
      const phoneLabel = document.createElement('span');
      phoneLabel.textContent = 'Phone Number: ';
      phoneLabel.style.fontWeight = '600';
      clientPhoneDiv.appendChild(phoneLabel);
      clientPhoneDiv.appendChild(document.createTextNode(voucherData.phoneNumber));
    }
    
    // Booking Number under nationality/phone
    const bookingDiv = document.createElement('div');
    bookingDiv.style.marginTop = '4px';
    const bookingLabel = document.createElement('span');
    bookingLabel.textContent = 'Booking №: ';
    bookingLabel.style.fontWeight = '600';
    bookingDiv.appendChild(bookingLabel);
    bookingDiv.appendChild(document.createTextNode(voucherData.voucherNumber || 10000));
    
    // Client container
    const clientContainer = document.createElement('div');
    
    // Office Name if provided - Moved to the top
    let officeDiv;
    if (voucherData.officeName) {
      officeDiv = document.createElement('div');
      const officeLabel = document.createElement('span');
      officeLabel.textContent = 'Office: ';
      officeLabel.style.fontWeight = '600';
      officeDiv.appendChild(officeLabel);
      officeDiv.appendChild(document.createTextNode(voucherData.officeName));
      clientContainer.appendChild(officeDiv);
    }
    
    clientContainer.appendChild(clientNameDiv);
    clientContainer.appendChild(clientNationalityDiv);
    if (clientPhoneDiv) {
      clientContainer.appendChild(clientPhoneDiv);
    }
    if (bookingDiv) {
      clientContainer.appendChild(bookingDiv);
    }
    
    // Dates
    const datesDiv = document.createElement('div');
    datesDiv.style.display = 'flex';
    datesDiv.style.flexDirection = 'column';
    
    // Empty space div for alignment
    const emptySpaceDiv = document.createElement('div');
    emptySpaceDiv.textContent = '\u00A0'; // Non-breaking space
    emptySpaceDiv.style.height = '24px'; // Approximate height of client name
    
    const arrivalDateDiv = document.createElement('div');
    const arrivalLabel = document.createElement('span');
    arrivalLabel.textContent = 'Arrival: ';
    arrivalLabel.style.fontWeight = '600';
    arrivalDateDiv.appendChild(arrivalLabel);
    arrivalDateDiv.appendChild(document.createTextNode(formatDisplayDate(voucherData.arrivalDate)));
    
    const departureDateDiv = document.createElement('div');
    const departureLabel = document.createElement('span');
    departureLabel.textContent = 'Departure: ';
    departureLabel.style.fontWeight = '600';
    departureDateDiv.appendChild(departureLabel);
    departureDateDiv.appendChild(document.createTextNode(formatDisplayDate(voucherData.departureDate)));
    
    datesDiv.appendChild(emptySpaceDiv);
    datesDiv.appendChild(arrivalDateDiv);
    datesDiv.appendChild(departureDateDiv);
    
    clientInfo.appendChild(clientContainer);
    clientInfo.appendChild(datesDiv);
    container.appendChild(clientInfo);
    
    // Hotels Section
    if (showHotels && voucherData.hotels && voucherData.hotels.length > 0) {
      const hotelSection = document.createElement('div');
      hotelSection.style.marginBottom = '15px';
      
      const hotelSectionTitle = document.createElement('h3');
      hotelSectionTitle.textContent = 'Hotels';
      hotelSectionTitle.style.backgroundColor = '#0f3785';
      hotelSectionTitle.style.color = 'white';
      hotelSectionTitle.style.padding = '6px 15px';
      hotelSectionTitle.style.paddingBottom = '18px';
      hotelSectionTitle.style.borderTopLeftRadius = '6px';
      hotelSectionTitle.style.borderTopRightRadius = '6px';
      hotelSectionTitle.style.margin = '0';
      hotelSectionTitle.style.fontSize = '16px';
      hotelSectionTitle.style.fontWeight = '600';
      hotelSectionTitle.style.display = 'flex';
      hotelSectionTitle.style.alignItems = 'center';
      
      const hotelTableWrapper = document.createElement('div');
      hotelTableWrapper.style.overflowX = 'auto';
      
      const hotelTable = document.createElement('table');
      hotelTable.style.width = '100%';
      hotelTable.style.fontSize = '11px';
      hotelTable.style.textAlign = 'left';
      hotelTable.style.color = '#374151';
      hotelTable.style.borderCollapse = 'collapse';
      hotelTable.style.border = '1px solid #bfdbfe';
      hotelTable.style.fontWeight = 'bold';
      
      // Create table header
      const hotelThead = document.createElement('thead');
      hotelThead.style.backgroundColor = '#dbeafe';
      hotelThead.style.textTransform = 'uppercase';
      
      const hotelHeaderRow = document.createElement('tr');
      
      const hotelHeaders = ['CITY', 'HOTEL', 'ROOM TYPE', 'NIGHT', 'CHECK IN', 'CHECK OUT', 'PAX', 'CN'];
      hotelHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '10px 14px';
        th.style.border = '1px solid #f8fafc';
        th.style.fontSize = '11px';
        th.style.fontWeight = 'bold';
        hotelHeaderRow.appendChild(th);
      });
      
      hotelThead.appendChild(hotelHeaderRow);
      hotelTable.appendChild(hotelThead);
      
      // Create table body
      const hotelTbody = document.createElement('tbody');
      
              reorderedHotels.forEach(hotel => {
        const row = document.createElement('tr');
        row.style.backgroundColor = 'white';
        row.style.borderBottom = '1px solid #e5e7eb';
        
        const hotelData = [
          hotel.city,
          hotel.hotelName,
          hotel.roomType,
          hotel.nights,
          formatDisplayDate(hotel.checkIn),
          formatDisplayDate(hotel.checkOut),
          {
            pax: hotel.pax,
            breakdown: hotel.adults !== null && hotel.children !== null && hotel.children > 0
              ? ` (${hotel.adults}Ad ${hotel.children}Ch)`
              : null
          },
          hotel.confirmationNumber || ''
        ];

        hotelData.forEach(cellData => {
          const td = document.createElement('td');
          if (typeof cellData === 'object' && cellData.pax) {
            // Create main pax text
            const paxText = document.createElement('span');
            paxText.textContent = cellData.pax;
            paxText.style.fontSize = '11px';
            paxText.style.fontWeight = 'bold';
            paxText.style.color = '#000000';
            td.appendChild(paxText);

            // Create breakdown text if exists
            if (cellData.breakdown) {
              const breakdownText = document.createElement('span');
              breakdownText.textContent = cellData.breakdown;
              breakdownText.style.fontSize = '7px';
              breakdownText.style.fontWeight = 'normal';
              breakdownText.style.color = '#6b7280'; // text-gray-500 equivalent
              td.appendChild(breakdownText);
            }
          } else {
            td.textContent = cellData;
            td.style.fontSize = '11px';
            td.style.fontWeight = 'bold';
            td.style.color = '#000000';
          }
          td.style.padding = '10px 14px';
          td.style.border = '1px solid #f8fafc';
          row.appendChild(td);
        });
        
        hotelTbody.appendChild(row);
      });
      
      hotelTable.appendChild(hotelTbody);
      hotelTableWrapper.appendChild(hotelTable);
      
      hotelSection.appendChild(hotelSectionTitle);
      hotelSection.appendChild(hotelTableWrapper);
      container.appendChild(hotelSection);
    }
    
    // Transfer Section
    if (showTransfers && voucherData.transfers && voucherData.transfers.length > 0) {
      const transferSection = document.createElement('div');
      transferSection.style.marginBottom = '15px';
      
      const transferSectionTitle = document.createElement('h3');
      transferSectionTitle.textContent = 'Transfer';
      transferSectionTitle.style.backgroundColor = '#0f3785';
      transferSectionTitle.style.color = 'white';
      transferSectionTitle.style.padding = '6px 15px';
      transferSectionTitle.style.paddingBottom = '18px';
      transferSectionTitle.style.borderTopLeftRadius = '6px';
      transferSectionTitle.style.borderTopRightRadius = '6px';
      transferSectionTitle.style.margin = '0';
      transferSectionTitle.style.fontSize = '16px';
      transferSectionTitle.style.fontWeight = '600';
      transferSectionTitle.style.display = 'flex';
      transferSectionTitle.style.alignItems = 'center';
      
      const transferTableWrapper = document.createElement('div');
      transferTableWrapper.style.overflowX = 'auto';
      
      const transferTable = document.createElement('table');
      transferTable.style.width = '100%';
      transferTable.style.fontSize = '11px';
      transferTable.style.textAlign = 'left';
      transferTable.style.color = '#374151';
      transferTable.style.borderCollapse = 'collapse';
      transferTable.style.border = '1px solid #bfdbfe';
      transferTable.style.fontWeight = 'bold';
      
      // Create table header
      const transferThead = document.createElement('thead');
      transferThead.style.backgroundColor = '#dbeafe';
      transferThead.style.textTransform = 'uppercase';
      
      const transferHeaderRow = document.createElement('tr');
      
      const transferHeaders = ['CITY', 'DATE', 'TIME', 'FLIGHT', 'FROM', 'TO', 'PAX', 'TYPE'];
      transferHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '10px 14px';
        th.style.border = '1px solid #f8fafc';
        th.style.fontSize = '11px';
        th.style.fontWeight = 'bold';
        th.style.verticalAlign = 'middle';
        transferHeaderRow.appendChild(th);
      });
      
      transferThead.appendChild(transferHeaderRow);
      transferTable.appendChild(transferThead);
      
      // Create table body
      const transferTbody = document.createElement('tbody');
      
              reorderedTransfers.forEach(transfer => {
        const row = document.createElement('tr');
        row.style.backgroundColor = 'white';
        row.style.borderBottom = '1px solid #e5e7eb';
        
        const transferData = [
          transfer.city || '',
          `${transfer.type} ${formatDisplayDate(transfer.date)}`,
          transfer.time || '',
          transfer.flightNumber || '',
          transfer.from,
          transfer.to,
          {
            pax: transfer.pax,
            breakdown: transfer.adults !== null && transfer.children !== null && transfer.children > 0
              ? ` (${transfer.adults}Ad ${transfer.children}Ch)`
              : null
          },
          transfer.vehicleType
        ];

        transferData.forEach(cellData => {
          const td = document.createElement('td');
          if (typeof cellData === 'object' && cellData.pax) {
            // Create main pax text
            const paxText = document.createElement('span');
            paxText.textContent = cellData.pax;
            paxText.style.fontSize = '11px';
            paxText.style.fontWeight = 'bold';
            paxText.style.color = '#000000';
            td.appendChild(paxText);

            // Create breakdown text if exists
            if (cellData.breakdown) {
              const breakdownText = document.createElement('span');
              breakdownText.textContent = cellData.breakdown;
              breakdownText.style.fontSize = '7px';
              breakdownText.style.fontWeight = 'normal';
              breakdownText.style.color = '#6b7280'; // text-gray-500 equivalent
              td.appendChild(breakdownText);
            }
          } else {
            td.textContent = cellData;
            td.style.fontSize = '11px';
            td.style.fontWeight = 'bold';
            td.style.color = '#000000';
          }
          td.style.padding = '10px 14px';
          td.style.border = '1px solid #f8fafc';
          row.appendChild(td);
        });
        
        transferTbody.appendChild(row);
      });
      
      transferTable.appendChild(transferTbody);
      transferTableWrapper.appendChild(transferTable);
      
      transferSection.appendChild(transferSectionTitle);
      transferSection.appendChild(transferTableWrapper);
      container.appendChild(transferSection);
    }
    
    // Trips Section
    if (showTrips && voucherData.trips && voucherData.trips.length > 0) {
      const tripsSection = document.createElement('div');
      tripsSection.style.marginBottom = '15px';
      
      const tripsSectionTitle = document.createElement('h3');
      tripsSectionTitle.textContent = 'Trips';
      tripsSectionTitle.style.backgroundColor = '#0f3785';
      tripsSectionTitle.style.color = 'white';
      tripsSectionTitle.style.padding = '6px 15px';
      tripsSectionTitle.style.paddingBottom = '18px';
      tripsSectionTitle.style.borderTopLeftRadius = '6px';
      tripsSectionTitle.style.borderTopRightRadius = '6px';
      tripsSectionTitle.style.margin = '0';
      tripsSectionTitle.style.fontSize = '16px';
      tripsSectionTitle.style.fontWeight = '600';
      tripsSectionTitle.style.display = 'flex';
      tripsSectionTitle.style.alignItems = 'center';
      
      const tripsTableWrapper = document.createElement('div');
      tripsTableWrapper.style.overflowX = 'auto';
      
      const tripsTable = document.createElement('table');
      tripsTable.style.width = '100%';
      tripsTable.style.fontSize = '11px';
      tripsTable.style.textAlign = 'left';
      tripsTable.style.color = '#374151';
      tripsTable.style.borderCollapse = 'collapse';
      tripsTable.style.border = '1px solid #bfdbfe';
      tripsTable.style.fontWeight = 'bold';
      
      // Create table header
      const tripsThead = document.createElement('thead');
      tripsThead.style.backgroundColor = '#dbeafe';
      tripsThead.style.textTransform = 'uppercase';
      
      const tripsHeaderRow = document.createElement('tr');
      
      const tripsHeaders = ['CITY', 'TOURS', 'TYPE', 'PAX'];
      tripsHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '10px 14px';
        th.style.border = '1px solid #f8fafc';
        th.style.fontSize = '11px';
        th.style.fontWeight = 'bold';
        tripsHeaderRow.appendChild(th);
      });
      
      tripsThead.appendChild(tripsHeaderRow);
      tripsTable.appendChild(tripsThead);
      
      // Create table body
      const tripsTbody = document.createElement('tbody');
      
              reorderedTrips.forEach(trip => {
        const row = document.createElement('tr');
        row.style.backgroundColor = 'white';
        row.style.borderBottom = '1px solid #e5e7eb';
        
        const tripData = [
          trip.city,
          trip.tourName,
          trip.type || '',
          {
            pax: trip.pax,
            breakdown: trip.adults !== null && trip.children !== null && trip.children > 0
              ? ` (${trip.adults}Ad ${trip.children}Ch)`
              : null
          }
        ];

        tripData.forEach(cellData => {
          const td = document.createElement('td');
          if (typeof cellData === 'object' && cellData.pax) {
            // Create main pax text
            const paxText = document.createElement('span');
            paxText.textContent = cellData.pax;
            paxText.style.fontSize = '11px';
            paxText.style.fontWeight = 'bold';
            paxText.style.color = '#000000';
            td.appendChild(paxText);

            // Create breakdown text if exists
            if (cellData.breakdown) {
              const breakdownText = document.createElement('span');
              breakdownText.textContent = cellData.breakdown;
              breakdownText.style.fontSize = '7px';
              breakdownText.style.fontWeight = 'normal';
              breakdownText.style.color = '#6b7280'; // text-gray-500 equivalent
              td.appendChild(breakdownText);
            }
          } else {
            td.textContent = cellData;
            td.style.fontSize = '11px';
            td.style.fontWeight = 'bold';
            td.style.color = '#000000';
          }
          td.style.padding = '10px 14px';
          td.style.border = '1px solid #f8fafc';
          row.appendChild(td);
        });
        
        tripsTbody.appendChild(row);
      });
      
      tripsTable.appendChild(tripsTbody);
      tripsTableWrapper.appendChild(tripsTable);
      
      tripsSection.appendChild(tripsSectionTitle);
      tripsSection.appendChild(tripsTableWrapper);
      container.appendChild(tripsSection);
    }
    
    // Flights Section
    if (showFlights && voucherData.flights && voucherData.flights.length > 0) {
      const flightsSection = document.createElement('div');
      flightsSection.style.marginBottom = '15px';
      
      const flightsSectionTitle = document.createElement('h3');
      flightsSectionTitle.textContent = 'Flights';
      flightsSectionTitle.style.backgroundColor = '#0f3785';
      flightsSectionTitle.style.color = 'white';
      flightsSectionTitle.style.padding = '6px 15px';
      flightsSectionTitle.style.paddingBottom = '18px';
      flightsSectionTitle.style.borderTopLeftRadius = '6px';
      flightsSectionTitle.style.borderTopRightRadius = '6px';
      flightsSectionTitle.style.margin = '0';
      flightsSectionTitle.style.fontSize = '16px';
      flightsSectionTitle.style.fontWeight = '600';
      flightsSectionTitle.style.display = 'flex';
      flightsSectionTitle.style.alignItems = 'center';
      
      const flightsTableWrapper = document.createElement('div');
      flightsTableWrapper.style.overflowX = 'auto';
      
      const flightsTable = document.createElement('table');
      flightsTable.style.width = '100%';
      flightsTable.style.fontSize = '12px';
      flightsTable.style.textAlign = 'left';
      flightsTable.style.color = '#374151';
      flightsTable.style.borderCollapse = 'collapse';
      flightsTable.style.border = '1px solid #bfdbfe';
      flightsTable.style.fontWeight = 'bold';
      
      // Create table header
      const flightsThead = document.createElement('thead');
      flightsThead.style.backgroundColor = '#dbeafe';
      flightsThead.style.textTransform = 'uppercase';
      
      const flightsHeaderRow = document.createElement('tr');
      
      const flightsHeaders = ['COMPANY', 'FROM', 'TO', 'FLIGHT №', 'DEPARTURE', 'ARRIVAL', 'LUGGAGE'];
      flightsHeaders.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '12px 16px';
        th.style.border = '1px solid #f8fafc';
        th.style.fontSize = '12px';
        th.style.fontWeight = 'bold';
        flightsHeaderRow.appendChild(th);
      });
      
      flightsThead.appendChild(flightsHeaderRow);
      flightsTable.appendChild(flightsThead);
      
      // Create table body
      const flightsTbody = document.createElement('tbody');
      
      reorderedFlights.forEach(flight => {
        const row = document.createElement('tr');
        row.style.backgroundColor = 'white';
        row.style.borderBottom = '1px solid #e5e7eb';
        
        const flightData = [
          flight.companyName,
          flight.from,
          flight.to,
          flight.flightNumber,
          formatDisplayDate(flight.departureDate),
          formatDisplayDate(flight.arrivalDate),
          flight.luggage || ''
        ];
        
        flightData.forEach(cellData => {
          const td = document.createElement('td');
          td.textContent = cellData;
          td.style.padding = '12px 16px';
          td.style.border = '1px solid #f8fafc';
          td.style.fontSize = '12px';
          td.style.fontWeight = 'bold';
          row.appendChild(td);
        });
        
        flightsTbody.appendChild(row);
      });
      
      flightsTable.appendChild(flightsTbody);
      flightsTableWrapper.appendChild(flightsTable);
      
      flightsSection.appendChild(flightsSectionTitle);
      flightsSection.appendChild(flightsTableWrapper);
      container.appendChild(flightsSection);
    }
    
    // Other Services Section
    if (showOthers && voucherData.others && voucherData.others.length > 0) {
      const otherSection = document.createElement('div');
      otherSection.style.marginBottom = '15px';

      const otherSectionTitle = document.createElement('h3');
      otherSectionTitle.textContent = 'Other Services';
      otherSectionTitle.style.backgroundColor = '#0f3785';
      otherSectionTitle.style.color = 'white';
      otherSectionTitle.style.padding = '6px 15px';
      otherSectionTitle.style.paddingBottom = '18px';
      otherSectionTitle.style.borderTopLeftRadius = '6px';
      otherSectionTitle.style.borderTopRightRadius = '6px';
      otherSectionTitle.style.margin = '0';
      otherSectionTitle.style.fontSize = '16px';
      otherSectionTitle.style.fontWeight = '600';
      otherSectionTitle.style.display = 'flex';
      otherSectionTitle.style.alignItems = 'center';

      const otherTableWrapper = document.createElement('div');
      otherTableWrapper.style.overflowX = 'auto';

      const otherTable = document.createElement('table');
      otherTable.style.width = '100%';
      otherTable.style.fontSize = '12px';
      otherTable.style.textAlign = 'left';
      otherTable.style.color = '#374151';
      otherTable.style.borderCollapse = 'collapse';
      otherTable.style.border = '1px solid #bfdbfe';
      otherTable.style.fontWeight = 'bold';

      const otherThead = document.createElement('thead');
      otherThead.style.backgroundColor = '#dbeafe';
      otherThead.style.textTransform = 'uppercase';

      const otherHeaderRow = document.createElement('tr');
      const otherHeaders = ['DESCRIPTION', 'DATE'];
      otherHeaders.forEach((headerText) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '12px 16px';
        th.style.border = '1px solid #f8fafc';
        th.style.fontSize = '12px';
        th.style.fontWeight = 'bold';
        otherHeaderRow.appendChild(th);
      });

      otherThead.appendChild(otherHeaderRow);
      otherTable.appendChild(otherThead);

      const otherTbody = document.createElement('tbody');

      (voucherData.others || []).forEach((other) => {
        const row = document.createElement('tr');
        row.style.backgroundColor = 'white';
        row.style.borderBottom = '1px solid #e5e7eb';

        const otherData = [
          other.description || '',
          other.date ? formatDisplayDate(other.date) : '',
        ];

        otherData.forEach((cellData) => {
          const td = document.createElement('td');
          td.textContent = cellData;
          td.style.fontSize = '12px';
          td.style.fontWeight = 'bold';
          td.style.color = '#000000';
          td.style.padding = '12px 16px';
          td.style.border = '1px solid #f8fafc';
          row.appendChild(td);
        });

        otherTbody.appendChild(row);
      });

      otherTable.appendChild(otherTbody);
      otherTableWrapper.appendChild(otherTable);
      otherSection.appendChild(otherSectionTitle);
      otherSection.appendChild(otherTableWrapper);
      container.appendChild(otherSection);
    }

    // Total Amount Section (conditionally included)
    if (showTotalAmount) {
      const totalSection = document.createElement('div');
      totalSection.style.marginBottom = '15px';
      
      // Total Amount Header
      const totalSectionTitle = document.createElement('h3');
      totalSectionTitle.textContent = 'Total Amount';
      totalSectionTitle.style.backgroundColor = '#0f3785';
      totalSectionTitle.style.color = 'white';
      totalSectionTitle.style.padding = '6px 15px';
      totalSectionTitle.style.paddingBottom = '18px';
      totalSectionTitle.style.borderTopLeftRadius = '6px';
      totalSectionTitle.style.borderTopRightRadius = '6px';
      totalSectionTitle.style.margin = '0';
      totalSectionTitle.style.fontSize = '16px';
      totalSectionTitle.style.fontWeight = '900'; // Extra bold for header
      totalSectionTitle.style.display = 'flex';
      totalSectionTitle.style.alignItems = 'center';
      
      // Value container - Now using a table like other sections
      const totalTableWrapper = document.createElement('div');
      totalTableWrapper.style.overflowX = 'auto';
      
      const totalTable = document.createElement('table');
      totalTable.style.width = '100%';
      totalTable.style.fontSize = '12px';
      totalTable.style.textAlign = 'left';
      totalTable.style.color = '#374151';
      totalTable.style.borderCollapse = 'collapse';
      totalTable.style.border = '1px solid #bfdbfe';
      totalTable.style.fontWeight = 'bold';
      
      // Create table body
      const totalTbody = document.createElement('tbody');
      
      if (voucherData.advancedPayment) {
        // Row for total amount
        const totalRow = document.createElement('tr');
        totalRow.style.backgroundColor = 'white';
        
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total Amount';
        totalLabelCell.style.padding = '12px 16px';
        totalLabelCell.style.border = '1px solid #f8fafc';
        totalLabelCell.style.fontWeight = '900'; // Extra bold
        totalLabelCell.style.width = '70%';
        
        const totalValueCell = document.createElement('td');
        totalValueCell.textContent = `${currencySymbol}${voucherData.totalAmount}`;
        totalValueCell.style.padding = '12px 16px';
        totalValueCell.style.border = '1px solid #f8fafc';
        totalValueCell.style.fontWeight = '900'; // Extra bold
        totalValueCell.style.textAlign = 'right';
        
        totalRow.appendChild(totalLabelCell);
        totalRow.appendChild(totalValueCell);
        totalTbody.appendChild(totalRow);
        
        // Row for advanced payment
        const advancedRow = document.createElement('tr');
        advancedRow.style.backgroundColor = 'white';
        
        const advancedLabelCell = document.createElement('td');
        advancedLabelCell.textContent = 'Advanced Payment';
        advancedLabelCell.style.padding = '12px 16px';
        advancedLabelCell.style.border = '1px solid #f8fafc';
        advancedLabelCell.style.fontWeight = '900'; // Extra bold to match other rows
        
        const advancedValueCell = document.createElement('td');
        advancedValueCell.textContent = `${currencySymbol}${voucherData.advancedAmount}`;
        advancedValueCell.style.padding = '12px 16px';
        advancedValueCell.style.border = '1px solid #f8fafc';
        advancedValueCell.style.textAlign = 'right';
        advancedValueCell.style.fontWeight = '900'; // Extra bold to match other rows
        
        advancedRow.appendChild(advancedLabelCell);
        advancedRow.appendChild(advancedValueCell);
        totalTbody.appendChild(advancedRow);
        
        // Row for remaining amount
        const remainingRow = document.createElement('tr');
        remainingRow.style.backgroundColor = '#f0f7ff'; // Light blue background to highlight
        
        const remainingLabelCell = document.createElement('td');
        remainingLabelCell.textContent = 'Balance Due';
        remainingLabelCell.style.padding = '12px 16px';
        remainingLabelCell.style.border = '1px solid #f8fafc';
        remainingLabelCell.style.fontWeight = '900'; // Extra bold
        
        const remainingValueCell = document.createElement('td');
        remainingValueCell.textContent = `${currencySymbol}${voucherData.remainingAmount}`;
        remainingValueCell.style.padding = '12px 16px';
        remainingValueCell.style.border = '1px solid #f8fafc';
        remainingValueCell.style.fontWeight = '900'; // Extra bold
        remainingValueCell.style.textAlign = 'right';
        
        remainingRow.appendChild(remainingLabelCell);
        remainingRow.appendChild(remainingValueCell);
        totalTbody.appendChild(remainingRow);
      } else {
        // Just a single row for total when no advanced payment
        const singleRow = document.createElement('tr');
        singleRow.style.backgroundColor = 'white';
        
        const totalLabelCell = document.createElement('td');
        totalLabelCell.textContent = 'Total Amount';
        totalLabelCell.style.padding = '12px 16px';
        totalLabelCell.style.border = '1px solid #f8fafc';
        totalLabelCell.style.fontWeight = '900'; // Extra bold
        totalLabelCell.style.width = '70%';
        
        const totalValueCell = document.createElement('td');
        totalValueCell.textContent = `${currencySymbol}${voucherData.totalAmount}`;
        totalValueCell.style.padding = '12px 16px';
        totalValueCell.style.border = '1px solid #f8fafc';
        totalValueCell.style.fontWeight = '900'; // Extra bold
        totalValueCell.style.textAlign = 'right';
        
        singleRow.appendChild(totalLabelCell);
        singleRow.appendChild(totalValueCell);
        totalTbody.appendChild(singleRow);
      }
      
      totalTable.appendChild(totalTbody);
      totalTableWrapper.appendChild(totalTable);
      
      totalSection.appendChild(totalSectionTitle);
      totalSection.appendChild(totalTableWrapper);
      container.appendChild(totalSection);
    }
    
    // Note Section
    if (voucherData.note) {
      const noteSection = document.createElement('div');
      noteSection.style.marginBottom = '15px';
      noteSection.style.fontSize = '12px';
      noteSection.style.color = '#374151';
      
      const noteLabel = document.createElement('span');
      noteLabel.textContent = 'Note: ';
      noteLabel.style.fontWeight = 'bold';
      
      const noteText = document.createElement('span');
      noteText.textContent = voucherData.note;
      
      noteSection.appendChild(noteLabel);
      noteSection.appendChild(noteText);
      container.appendChild(noteSection);
    }
    
    // Contact Info
    const contactSection = document.createElement('div');
    contactSection.style.display = 'grid';
    contactSection.style.gridTemplateColumns = '1fr 1fr 1fr';
    contactSection.style.gap = '10px';
    contactSection.style.marginBottom = '15px';
    
    // Phone
    const phoneDiv = document.createElement('div');
    phoneDiv.style.display = 'flex';
    phoneDiv.style.alignItems = 'center';
    phoneDiv.style.gap = '10px';
    
    const phoneIcon = document.createElement('span');
    phoneIcon.textContent = '📱';
    phoneIcon.style.fontSize = '20px';
    
    const phoneInfo = document.createElement('div');
    
    const phoneLabel = document.createElement('div');
    phoneLabel.textContent = 'Phone';
    phoneLabel.style.fontSize = '12px';
    phoneLabel.style.color = '#6b7280';
    
    const phoneNumber = document.createElement('div');
    phoneNumber.textContent = '+212 772-535475';
    phoneNumber.style.fontSize = '14px';
    
    phoneInfo.appendChild(phoneLabel);
    phoneInfo.appendChild(phoneNumber);
    phoneDiv.appendChild(phoneIcon);
    phoneDiv.appendChild(phoneInfo);
    
    // Email
    const emailDiv = document.createElement('div');
    emailDiv.style.display = 'flex';
    emailDiv.style.alignItems = 'center';
    emailDiv.style.gap = '10px';
    
    const emailIcon = document.createElement('span');
    emailIcon.textContent = '✉️';
    emailIcon.style.fontSize = '20px';
    
    const emailInfo = document.createElement('div');
    
    const emailLabel = document.createElement('div');
    emailLabel.textContent = 'Email';
    emailLabel.style.fontSize = '12px';
    emailLabel.style.color = '#6b7280';
    
    const emailAddress = document.createElement('div');
    emailAddress.textContent = 'rahalatek@gmail.com';
    emailAddress.style.fontSize = '14px';
    
    emailInfo.appendChild(emailLabel);
    emailInfo.appendChild(emailAddress);
    emailDiv.appendChild(emailIcon);
    emailDiv.appendChild(emailInfo);
    
        // Address (conditionally included)
    if (showAddress) {
      const addressDiv = document.createElement('div');
      addressDiv.style.display = 'flex';
      addressDiv.style.alignItems = 'center';
      addressDiv.style.gap = '10px';

      const addressIcon = document.createElement('span');
      addressIcon.textContent = '📍';
      addressIcon.style.fontSize = '20px';

      const addressInfo = document.createElement('div');

      const addressLabel = document.createElement('div');
      addressLabel.textContent = 'Address';
      addressLabel.style.fontSize = '12px';
      addressLabel.style.color = '#6b7280';

      const addressText = document.createElement('div');
      addressText.textContent = 'Molla Gürani, Turgut Özal Millet Cd, Feriha apt(64), Fatih/İstanbul';
      addressText.style.fontSize = '14px';

      addressInfo.appendChild(addressLabel);
      addressInfo.appendChild(addressText);
      addressDiv.appendChild(addressIcon);
      addressDiv.appendChild(addressInfo);
      
      contactSection.appendChild(addressDiv);
    }

    // Only add contact info if showContact is true
    if (showContact) {
      contactSection.appendChild(phoneDiv);
      contactSection.appendChild(emailDiv);
    }
    
    // Only add contact section if it has content
    if (contactSection.children.length > 0) {
      container.appendChild(contactSection);
    }
    
    // Footer
    const footer = document.createElement('div');
    footer.style.textAlign = 'center';
    footer.style.color = '#1e40af';
    footer.style.fontWeight = 'bold';
    footer.style.borderTop = '2px solid #e5efff';
    footer.style.paddingTop = '15px';
    footer.textContent = `Voucher #${voucherData.voucherNumber || 10000}`;
    container.appendChild(footer);
    
    // Add to body temporarily for rendering
    document.body.appendChild(container);
    return container;
  };
  
  const handleDownloadPDF = async () => {
    if (!voucherRef.current) return;
    
    try {
      setIsPdfLoading(true);
      
      // If onSave is provided, call it first to save the voucher
      if (onSave && typeof onSave === 'function') {
        await onSave();
      }
      
      // Generate a desktop-styled element
      const desktopElement = generateDesktopVersionForDownload();
      
      const canvas = await html2canvas(desktopElement, {
        scale: 3, // Increased from 2 for better resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0, // No timeout for images
        onclone: (clonedDoc) => {
          // Ensure all images in the cloned document are loaded
          const images = clonedDoc.querySelectorAll('img');
          for (let img of images) {
            if (!img.complete) {
              // Force image to be fully loaded
              const currentSrc = img.src;
              img.src = '';
              img.src = currentSrc;
            }
          }
        }
      });
      
      // Remove the temporary element
      document.body.removeChild(desktopElement);
      
      const imgData = canvas.toDataURL('image/png', 1.0); // Use maximum quality for PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false, // Disable compression for higher quality
        hotfixes: ["px_scaling"] // Apply pixel scaling fix for better quality
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calculate scale to fit on one page
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxHeight = pageHeight - 10; // Leave small margins
      
      let scale = 1;
      if (imgHeight > maxHeight) {
        scale = maxHeight / imgHeight;
      }
      
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      
      // Center the image
      const xPos = (imgWidth - scaledWidth) / 2;
      const yPos = 5; // Small top margin
      
      pdf.addImage(imgData, 'PNG', xPos, yPos, scaledWidth, scaledHeight, null, 'FAST', 0); // FAST interpolation mode, no rotation
      pdf.save(`voucher_${voucherData.voucherNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsPdfLoading(false);
    }
  };
  
  const handleDownloadImage = async () => {
    if (!voucherRef.current) return;
    
    try {
      setIsImageLoading(true);
      
      // If onSave is provided, call it first to save the voucher
      if (onSave && typeof onSave === 'function') {
        await onSave();
      }
      
      // Generate a desktop-styled element
      const desktopElement = generateDesktopVersionForDownload();
      
      const canvas = await html2canvas(desktopElement, {
        scale: 3, // Reduced scale to ensure proper rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 0, // No timeout for images
        onclone: (clonedDoc) => {
          // Ensure all images in the cloned document are loaded
          const images = clonedDoc.querySelectorAll('img');
          for (let img of images) {
            if (!img.complete) {
              // Force image to be fully loaded
              const currentSrc = img.src;
              img.src = '';
              img.src = currentSrc;
            }
          }
        }
      });
      
      // Remove the temporary element
      document.body.removeChild(desktopElement);
      
      canvas.toBlob((blob) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `voucher_${voucherData.voucherNumber}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setIsImageLoading(false);
      }, 'image/png', 0.95); // Slightly reduced quality for better compatibility
    } catch (error) {
      console.error('Error generating image:', error);
      setIsImageLoading(false);
    }
  };
  
  return (
    <div className="p-2 md:p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:flex sm:flex-row sm:justify-center">
        <CustomButton 
          className="w-full flex justify-center" 
          variant="gray" 
          onClick={handleDownloadImage}
          disabled={isImageLoading}
          loading={isImageLoading}
          icon={isImageLoading ? FaSpinner : FaFileImage}
        >
          <span className="hidden sm:inline">
            {isImageLoading ? 'Generating...' : 'Download as Image'}
          </span>
        </CustomButton>
        
        <CustomButton 
          className="w-full flex justify-center" 
          variant="purple" 
          onClick={handleDownloadPDF}
          disabled={isPdfLoading}
          loading={isPdfLoading}
          icon={isPdfLoading ? FaSpinner : FaFilePdf}
        >
          <span className="hidden sm:inline">
            {isPdfLoading ? 'Generating...' : 'Download as PDF'}
          </span>
        </CustomButton>
        
        {editUrl && (
          <Link to={editUrl} className="w-full">
            <CustomButton
              className="w-full flex justify-center"
              variant="teal"
              icon={FaPen}
            >
              <span className="hidden sm:inline">Edit Voucher</span>
            </CustomButton>
          </Link>
        )}
        
        {/* Office Detail Button - Only for admins and accountants */}
        {(isAdmin || isAccountant) && voucherData?.officeName && (
          <Link to={`/office/${encodeURIComponent(voucherData.officeName)}`} className="w-full">
            <CustomButton
              className="w-full flex justify-center"
              variant="blue"
              icon={FaBuilding}
            >
              <span className="hidden sm:inline">View Office Details</span>
            </CustomButton>
          </Link>
        )}
        
        {onDelete && (
          <CustomButton 
            className="w-full flex justify-center"
            variant="red" 
            onClick={onDelete}
            icon={FaTrash}
          >
            <span className="hidden sm:inline">Delete Voucher</span>
          </CustomButton>
        )}
      </div>
      
      {/* Section Visibility Controls */}
      <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg mb-4">
        <div className="space-y-2">
          {/* Header Elements Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <CustomButton 
              size="xs" 
              variant={showLogo ? "green" : "gray"}
              onClick={() => setShowLogoWithStorage(!showLogo)}
              icon={showLogo ? FaEye : FaEyeSlash}
              className="w-auto"
            >
              Logo
            </CustomButton>

            <CustomButton 
              size="xs" 
              variant={showAddress ? "green" : "gray"}
              onClick={() => setShowAddressWithStorage(!showAddress)}
              icon={showAddress ? FaEye : FaEyeSlash}
              className="w-auto"
            >
              Address
            </CustomButton>
            <CustomButton 
              size="xs" 
              variant={showContact ? "green" : "gray"}
              onClick={() => setShowContactWithStorage(!showContact)}
              icon={showContact ? FaEye : FaEyeSlash}
              className="w-auto"
            >
              Contact
            </CustomButton>
            <CustomButton 
              size="xs" 
              variant={allHeaderElementsVisible ? "gray" : "purple"}
              onClick={toggleAllHeaderElements}
              icon={allHeaderElementsVisible ? FaEyeSlash : FaEye}
              className="w-auto"
            >
              {allHeaderElementsVisible ? 'Hide All' : 'Show All'}
            </CustomButton>
          </div>
          
          {/* Table Sections Controls */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-2">
            <CustomButton 
              size="xs" 
              variant={showHotels ? "green" : "gray"}
              onClick={() => setShowHotelsWithStorage(!showHotels)}
              icon={showHotels ? FaEye : FaEyeSlash}
              className="w-full sm:w-auto"
            >
              Hotels
            </CustomButton>
            <CustomButton 
              size="xs" 
              variant={showTransfers ? "green" : "gray"}
              onClick={() => setShowTransfersWithStorage(!showTransfers)}
              icon={showTransfers ? FaEye : FaEyeSlash}
              className="w-full sm:w-auto"
            >
              Transfers
            </CustomButton>
            <CustomButton 
              size="xs" 
              variant={showTrips ? "green" : "gray"}
              onClick={() => setShowTripsWithStorage(!showTrips)}
              icon={showTrips ? FaEye : FaEyeSlash}
              className="w-full sm:w-auto"
            >
              Trips
            </CustomButton>
            <CustomButton 
              size="xs" 
              variant={showFlights ? "green" : "gray"}
              onClick={() => setShowFlightsWithStorage(!showFlights)}
              icon={showFlights ? FaEye : FaEyeSlash}
              className="w-full sm:w-auto"
            >
              Flights
            </CustomButton>
            <CustomButton 
              size="xs" 
              variant={showOthers ? "green" : "gray"}
              onClick={() => setShowOthersWithStorage(!showOthers)}
              icon={showOthers ? FaEye : FaEyeSlash}
              className="w-full sm:w-auto"
            >
              Other Services
            </CustomButton>
            <CustomButton 
              size="xs" 
              variant={showTotalAmount ? "green" : "gray"}
              onClick={() => setShowTotalAmountWithStorage(!showTotalAmount)}
              icon={showTotalAmount ? FaEye : FaEyeSlash}
              className="w-full sm:w-auto"
            >
              Total Amount
            </CustomButton>
            <CustomButton 
              size="xs" 
              variant={allSectionsVisible ? "gray" : "purple"}
              onClick={toggleAllSections}
              icon={allSectionsVisible ? FaEyeSlash : FaEye}
              className="w-full sm:w-auto"
            >
              {allSectionsVisible ? 'Hide All' : 'Show All'}
            </CustomButton>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg max-w-full font-bold" ref={voucherRef}>
        {/* Voucher Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 pb-4 border-b-2 border-blue-200">
          <div className="flex items-center" style={{ display: showLogo ? 'flex' : 'none' }}>
            <img 
              src="/Logolight.png" 
              alt="Rahalatek Tourism" 
              className="h-12 md:h-16 object-contain"
            />
            <div className="ml-4">
              <h1 className="text-xl md:text-2xl font-bold text-blue-800">RAHALATEK</h1>
              <h2 className="text-lg md:text-xl text-blue-600">TOURISM</h2>
            </div>
          </div>
        </div>
        
        {/* Client Info */}
        <div className="p-3 md:p-4 rounded-md mb-6 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <div className="flex flex-col">
              {/* Display Office first */}
              {voucherData.officeName && (
                <div>
                  <span className="font-semibold">Office:</span> {voucherData.officeName}
                </div>
              )}
              <div>
                <span className="font-semibold">Clients:</span> {voucherData.clientName}
              </div>
              <div>
                <span className="font-semibold">Nationality:</span> {voucherData.nationality}
              </div>
              {voucherData.phoneNumber && (
                <div>
                  <span className="font-semibold">Phone Number:</span> {voucherData.phoneNumber}
                </div>
              )}
              <div>
                <span className="font-semibold">Booking №:</span> {voucherData.voucherNumber || 10000}
              </div>
              {voucherData.capital && (
                <div className="mt-2 flex gap-4">
                  <div>
                    <span className="font-semibold text-amber-800 ">Capital:</span> <span className="text-amber-900 font-bold">{getCurrencySymbol(voucherData.currency)}{voucherData.capital}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-800 ">Profit:</span> <span className="text-green-900 font-bold">{getCurrencySymbol(voucherData.currency)}{((Number(voucherData.totalAmount) || 0) - (Number(voucherData.capital) || 0)).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div>
                &nbsp;
              </div>
              <div>
                <span className="font-semibold">Arrival:</span> {formatDisplayDate(voucherData.arrivalDate)}
              </div>
              <div>
                <span className="font-semibold">Departure:</span> {formatDisplayDate(voucherData.departureDate)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Hotels */}
        <div className="mb-6" style={{ display: showHotels ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md">Hotels</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 font-bold">
              <thead className="text-xs text-gray-700 uppercase bg-blue-100">
                <tr>
                  <th className="px-2 py-2 border w-16"></th>
                  <th className="px-2 md:px-4 py-2 border">CITY</th>
                  <th className="px-2 md:px-4 py-2 border">Hotel</th>
                  <th className="px-2 md:px-4 py-2 border">Room Type</th>
                  <th className="px-2 md:px-4 py-2 border">Night</th>
                  <th className="px-2 md:px-4 py-2 border">Check in</th>
                  <th className="px-2 md:px-4 py-2 border">Check Out</th>
                  <th className="px-2 md:px-4 py-2 border">PAX</th>
                  <th className="px-2 md:px-4 py-2 border">CN</th>
                </tr>
              </thead>
              <tbody>
                {reorderedHotels.map((hotel, index) => (
                  <tr key={`hotel-row-${index}`} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-1 py-2 border text-center">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveUp(index, 'hotels')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronUp size={10} />
                        </button>
                        <button
                          onClick={() => moveDown(index, 'hotels')}
                          disabled={index === reorderedHotels.length - 1}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronDown size={10} />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">
                      {hotel.city}
                      {(hotel.country || inferCountryFromCity(hotel.city)) && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({hotel.country || inferCountryFromCity(hotel.city)})
                        </span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.hotelName}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.roomType}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.nights}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{formatDisplayDate(hotel.checkIn)}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{formatDisplayDate(hotel.checkOut)}</td>
                    <td className="px-2 md:px-4 py-2 border">
                      <div className="text-xs md:text-sm">
                        {hotel.pax}
                        {hotel.adults !== null && hotel.children !== null && hotel.children > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({hotel.adults}Ad {hotel.children}Ch)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.confirmationNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {!showHotels && voucherData.hotels && voucherData.hotels.length > 0 && (
          <div 
            className="mb-6 p-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between"
                            onClick={() => setShowHotelsWithStorage(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">Hotels section hidden</span>
            <CustomButton size="xs" variant="gray" icon={FaEye}>
              Show
            </CustomButton>
          </div>
        )}
        
        {/* Transfers */}
        <div className="mb-6" style={{ display: showTransfers ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md">Transfer</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 font-bold">
              <thead className="text-xs text-gray-700 uppercase bg-blue-100">
                <tr>
                  <th className="px-2 py-2 border w-16"></th>
                  <th className="px-2 md:px-4 py-2 border">City</th>
                  <th className="px-2 md:px-4 py-2 border">Date</th>
                  <th className="px-2 md:px-4 py-2 border">Time</th>
                  <th className="px-2 md:px-4 py-2 border">Flight</th>
                  <th className="px-2 md:px-4 py-2 border">From</th>
                  <th className="px-2 md:px-4 py-2 border">To</th>
                  <th className="px-2 md:px-4 py-2 border">Pax</th>
                  <th className="px-2 md:px-4 py-2 border">TYPE</th>
                </tr>
              </thead>
              <tbody>
                {reorderedTransfers.map((transfer, index) => (
                  <tr key={`transfer-row-${index}`} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-1 py-2 border text-center">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveUp(index, 'transfers')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronUp size={10} />
                        </button>
                        <button
                          onClick={() => moveDown(index, 'transfers')}
                          disabled={index === reorderedTransfers.length - 1}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronDown size={10} />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">
                      {transfer.city || ''}
                      {transfer.city && (transfer.country || inferCountryFromCity(transfer.city)) && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({transfer.country || inferCountryFromCity(transfer.city)})
                        </span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{formatDisplayDate(transfer.date)}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.time || ''}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.flightNumber || ''}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.from}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.to}</td>
                    <td className="px-2 md:px-4 py-2 border">
                      <div className="text-xs md:text-sm">
                        {transfer.pax}
                        {transfer.adults !== null && transfer.children !== null && transfer.children > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({transfer.adults}Ad {transfer.children}Ch)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.vehicleType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {!showTransfers && voucherData.transfers && voucherData.transfers.length > 0 && (
          <div 
            className="mb-6 p-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between"
                            onClick={() => setShowTransfersWithStorage(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">Transfers section hidden</span>
            <CustomButton size="xs" variant="gray" icon={FaEye}>
              Show
            </CustomButton>
          </div>
        )}
        
        {/* Trips */}
        <div className="mb-6" style={{ display: showTrips ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md">Trips</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 font-bold">
              <thead className="text-xs text-gray-700 uppercase bg-blue-100">
                <tr>
                  <th className="px-2 py-2 border w-16"></th>
                  <th className="px-2 md:px-4 py-2 border">City</th>
                  <th className="px-2 md:px-4 py-2 border">Tours</th>
                  <th className="px-2 md:px-4 py-2 border">Type</th>
                  <th className="px-2 md:px-4 py-2 border">Pax</th>
                </tr>
              </thead>
              <tbody>
                {reorderedTrips.map((trip, index) => (
                  <tr key={`trip-row-${index}`} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-1 py-2 border text-center">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveUp(index, 'trips')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronUp size={10} />
                        </button>
                        <button
                          onClick={() => moveDown(index, 'trips')}
                          disabled={index === reorderedTrips.length - 1}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronDown size={10} />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">
                      {trip.city}
                      {(trip.country || inferCountryFromCity(trip.city)) && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({trip.country || inferCountryFromCity(trip.city)})
                        </span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{trip.tourName}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{trip.type}</td>
                    <td className="px-2 md:px-4 py-2 border">
                      <div className="text-xs md:text-sm">
                        {trip.pax}
                        {trip.adults !== null && trip.children !== null && trip.children > 0 && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({trip.adults}Ad {trip.children}Ch)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {!showTrips && voucherData.trips && voucherData.trips.length > 0 && (
          <div 
            className="mb-6 p-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between"
                            onClick={() => setShowTripsWithStorage(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">Trips section hidden</span>
            <CustomButton size="xs" variant="gray" icon={FaEye}>
              Show
            </CustomButton>
          </div>
        )}
        
        {/* Flights */}
        <div className="mb-6" style={{ display: showFlights ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md">Flights</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 font-bold">
              <thead className="text-xs text-gray-700 uppercase bg-blue-100">
                <tr>
                  <th className="px-2 py-2 border w-16"></th>
                  <th className="px-2 md:px-4 py-2 border">Company</th>
                  <th className="px-2 md:px-4 py-2 border">From</th>
                  <th className="px-2 md:px-4 py-2 border">To</th>
                  <th className="px-2 md:px-4 py-2 border">Flight №</th>
                  <th className="px-2 md:px-4 py-2 border">Departure</th>
                  <th className="px-2 md:px-4 py-2 border">Arrival</th>
                  <th className="px-2 md:px-4 py-2 border">Luggage</th>
                </tr>
              </thead>
              <tbody>
                {reorderedFlights.map((flight, index) => (
                  <tr key={`flight-row-${index}`} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-1 py-2 border text-center">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveUp(index, 'flights')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronUp size={10} />
                        </button>
                        <button
                          onClick={() => moveDown(index, 'flights')}
                          disabled={index === reorderedFlights.length - 1}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronDown size={10} />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{flight.companyName}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{flight.from}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{flight.to}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{flight.flightNumber}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{formatDisplayDate(flight.departureDate)}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{formatDisplayDate(flight.arrivalDate)}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{flight.luggage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {!showFlights && voucherData.flights && voucherData.flights.length > 0 && (
          <div 
            className="mb-6 p-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between"
                            onClick={() => setShowFlightsWithStorage(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">Flights section hidden</span>
            <CustomButton size="xs" variant="gray" icon={FaEye}>
              Show
            </CustomButton>
          </div>
        )}

        {/* Other Services */}
        <div className="mb-6" style={{ display: showOthers ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md">
            Other Services
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 font-bold">
              <thead className="text-xs text-gray-700 uppercase bg-blue-100">
                <tr>
                  <th className="px-2 py-2 border w-16"></th>
                  <th className="px-2 md:px-4 py-2 border">Description</th>
                  <th className="px-2 md:px-4 py-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {reorderedOthers.map((other, index) => (
                  <tr
                    key={`other-row-${index}`}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-1 py-2 border text-center">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveUp(index, 'others')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronUp size={10} />
                        </button>
                        <button
                          onClick={() => moveDown(index, 'others')}
                          disabled={index === reorderedOthers.length - 1}
                          className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FaChevronDown size={10} />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">
                      {other.description}
                    </td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">
                      {other.date ? formatDisplayDate(other.date) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!showOthers && voucherData.others && voucherData.others.length > 0 && (
          <div
            className="mb-6 p-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between"
            onClick={() => setShowOthersWithStorage(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">
              Other Services section hidden
            </span>
            <CustomButton size="xs" variant="gray" icon={FaEye}>
              Show
            </CustomButton>
          </div>
        )}
        
        {/* Total Amount */}
        <div className="mb-6" style={{ display: showTotalAmount ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md flex items-center">Total Amount</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 border-t-0 font-bold">
              <tbody>
                {voucherData.advancedPayment ? (
                  <>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3 border font-black w-3/4">Total Amount</td>
                      <td className="px-4 py-3 border text-right font-black">{getCurrencySymbol(voucherData.currency)}{voucherData.totalAmount}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3 border font-black">Advanced Payment</td>
                      <td className="px-4 py-3 border text-right font-black">{getCurrencySymbol(voucherData.currency)}{voucherData.advancedAmount}</td>
                    </tr>
                    <tr className="bg-blue-50 border-b">
                      <td className="px-4 py-3 border font-black">Balance Due</td>
                      <td className="px-4 py-3 border text-right font-black">{getCurrencySymbol(voucherData.currency)}{voucherData.remainingAmount}</td>
                    </tr>
                  </>
                ) : (
                  <tr className="bg-white border-b">
                    <td className="px-4 py-3 border font-black w-3/4">Total Amount</td>
                    <td className="px-4 py-3 border text-right font-black">{getCurrencySymbol(voucherData.currency)}{voucherData.totalAmount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!showTotalAmount && (
          <div 
            className="mb-6 p-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between"
            onClick={() => setShowTotalAmountWithStorage(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">Total Amount section hidden</span>
            <CustomButton size="xs" variant="gray" icon={FaEye}>
              Show
            </CustomButton>
          </div>
        )}
        
        {/* Note */}
        {voucherData.note && (
          <div className="mb-6">
            <div className="text-sm text-gray-700 ">
              <strong>Note:</strong> {voucherData.note}
            </div>
          </div>
        )}
        
        {/* Private Note - Only visible in preview, NOT in downloads */}
        {voucherData.privateNote && (
          <div className="mb-6">
            <div>
              <span className="font-semibold text-orange-800">🔒 Private Note:</span>{' '}
              <span className="text-orange-900 font-bold">{voucherData.privateNote}</span>
            </div>
          </div>
        )}
        
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2" style={{ display: showContact ? 'flex' : 'none' }}>
            <span className="text-2xl">📱</span>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-sm">+212 772-535475</div>
            </div>
          </div>
          <div className="flex items-center gap-2" style={{ display: showContact ? 'flex' : 'none' }}>
            <span className="text-2xl">✉️</span>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm">rahalatek@gmail.com</div>
            </div>
          </div>
          <div className="flex items-center gap-2" style={{ display: showAddress ? 'flex' : 'none' }}>
            <span className="text-2xl">📍</span>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="text-sm">Molla Gürani, Turgut Özal Millet Cd, Feriha apt(64), Fatih/İstanbul</div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-blue-800 font-bold border-t-2 border-blue-200 pt-4">
          Voucher #{voucherData.voucherNumber || 10000}
        </div>
      </div>
      
      {/* Save Voucher Button */}
      {saveButton && (
        <div className="mt-4 flex justify-center">
          {saveButton}
        </div>
      )}
    </div>
  );
};

export default VoucherPreview;
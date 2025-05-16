import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { FaDownload, FaSpinner, FaTrash, FaPen, FaFileImage, FaFilePdf, FaEye, FaEyeSlash } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDisplayDate } from '../utils/voucherGenerator';
import { Link } from 'react-router-dom';

const VoucherPreview = ({ voucherData, onDelete, editUrl, saveButton, onSave }) => {
  const voucherRef = useRef(null);
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  // Visibility state for each section
  const [showHotels, setShowHotels] = useState(true);
  const [showTransfers, setShowTransfers] = useState(true);
  const [showTrips, setShowTrips] = useState(true);
  
  // Determine if all sections are visible
  const allSectionsVisible = showHotels && showTransfers && showTrips;
  
  // Toggle all sections visibility
  const toggleAllSections = () => {
    if (allSectionsVisible) {
      // Hide all sections
      setShowHotels(false);
      setShowTransfers(false);
      setShowTrips(false);
    } else {
      // Show all sections
      setShowHotels(true);
      setShowTransfers(true);
      setShowTrips(true);
    }
  };
  
  // Preload the logo image and convert to data URL
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
  
  const generateDesktopVersionForDownload = () => {
    // Create a completely new element with desktop-only styling
    const container = document.createElement('div');
    container.style.width = '800px'; // Increased width for better quality
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.fontWeight = 'bold'; // Make all text bold by default
    
    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '20px';
    header.style.paddingBottom = '10px';
    header.style.borderBottom = '2px solid #e5efff';
    
    // Logo container
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
    
    // Booking Number under nationality
    const bookingDiv = document.createElement('div');
    bookingDiv.style.marginTop = '4px';
    const bookingLabel = document.createElement('span');
    bookingLabel.textContent = 'Booking №: ';
    bookingLabel.style.fontWeight = '600';
    bookingDiv.appendChild(bookingLabel);
    bookingDiv.appendChild(document.createTextNode(voucherData.voucherNumber || 10000));
    
    // Client container
    const clientContainer = document.createElement('div');
    clientContainer.appendChild(clientNameDiv);
    clientContainer.appendChild(clientNationalityDiv);
    clientContainer.appendChild(bookingDiv);
    
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
      hotelTable.style.fontSize = '12px';
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
        th.style.padding = '6px 10px';
        th.style.border = '1px solid #bfdbfe';
        th.style.fontSize = '12px';
        th.style.fontWeight = 'bold';
        hotelHeaderRow.appendChild(th);
      });
      
      hotelThead.appendChild(hotelHeaderRow);
      hotelTable.appendChild(hotelThead);
      
      // Create table body
      const hotelTbody = document.createElement('tbody');
      
      voucherData.hotels.forEach(hotel => {
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
          hotel.pax,
          hotel.confirmationNumber || ''
        ];
        
        hotelData.forEach(cellData => {
          const td = document.createElement('td');
          td.textContent = cellData;
          td.style.padding = '6px 10px';
          td.style.border = '1px solid #bfdbfe';
          td.style.fontSize = '12px';
          td.style.fontWeight = 'bold';
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
      transferTable.style.fontSize = '12px';
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
        th.style.padding = '6px 10px';
        th.style.border = '1px solid #bfdbfe';
        th.style.fontSize = '12px';
        th.style.fontWeight = 'bold';
        th.style.verticalAlign = 'middle';
        transferHeaderRow.appendChild(th);
      });
      
      transferThead.appendChild(transferHeaderRow);
      transferTable.appendChild(transferThead);
      
      // Create table body
      const transferTbody = document.createElement('tbody');
      
      voucherData.transfers.forEach(transfer => {
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
          transfer.pax,
          transfer.vehicleType
        ];
        
        transferData.forEach(cellData => {
          const td = document.createElement('td');
          td.textContent = cellData;
          td.style.padding = '6px 10px';
          td.style.border = '1px solid #bfdbfe';
          td.style.fontSize = '12px';
          td.style.fontWeight = 'bold';
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
      tripsTable.style.fontSize = '12px';
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
        th.style.padding = '6px 10px';
        th.style.border = '1px solid #bfdbfe';
        th.style.fontSize = '12px';
        th.style.fontWeight = 'bold';
        tripsHeaderRow.appendChild(th);
      });
      
      tripsThead.appendChild(tripsHeaderRow);
      tripsTable.appendChild(tripsThead);
      
      // Create table body
      const tripsTbody = document.createElement('tbody');
      
      voucherData.trips.forEach(trip => {
        const row = document.createElement('tr');
        row.style.backgroundColor = 'white';
        row.style.borderBottom = '1px solid #e5e7eb';
        
        const tripData = [
          trip.city,
          trip.tourName,
          trip.type || '',
          trip.pax
        ];
        
        tripData.forEach(cellData => {
          const td = document.createElement('td');
          td.textContent = cellData;
          td.style.padding = '6px 10px';
          td.style.border = '1px solid #bfdbfe';
          td.style.fontSize = '12px';
          td.style.fontWeight = 'bold';
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
    
    // Total Amount Section
    const totalSection = document.createElement('div');
    totalSection.style.marginBottom = '15px';
    
    // Total Amount Header
    const totalSectionTitle = document.createElement('h3');
    totalSectionTitle.textContent = 'Total amount';
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
      totalLabelCell.style.padding = '8px 15px';
      totalLabelCell.style.border = '1px solid #bfdbfe';
      totalLabelCell.style.fontWeight = '900'; // Extra bold
      totalLabelCell.style.width = '70%';
      
      const totalValueCell = document.createElement('td');
      totalValueCell.textContent = `${voucherData.totalAmount}$`;
      totalValueCell.style.padding = '8px 15px';
      totalValueCell.style.border = '1px solid #bfdbfe';
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
      advancedLabelCell.style.padding = '8px 15px';
      advancedLabelCell.style.border = '1px solid #bfdbfe';
      advancedLabelCell.style.fontWeight = '900'; // Extra bold to match other rows
      
      const advancedValueCell = document.createElement('td');
      advancedValueCell.textContent = `${voucherData.advancedAmount}$`;
      advancedValueCell.style.padding = '8px 15px';
      advancedValueCell.style.border = '1px solid #bfdbfe';
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
      remainingLabelCell.style.padding = '8px 15px';
      remainingLabelCell.style.border = '1px solid #bfdbfe';
      remainingLabelCell.style.fontWeight = '900'; // Extra bold
      
      const remainingValueCell = document.createElement('td');
      remainingValueCell.textContent = `${voucherData.remainingAmount}$`;
      remainingValueCell.style.padding = '8px 15px';
      remainingValueCell.style.border = '1px solid #bfdbfe';
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
      totalLabelCell.style.padding = '8px 15px';
      totalLabelCell.style.border = '1px solid #bfdbfe';
      totalLabelCell.style.fontWeight = '900'; // Extra bold
      totalLabelCell.style.width = '70%';
      
      const totalValueCell = document.createElement('td');
      totalValueCell.textContent = `${voucherData.totalAmount}$`;
      totalValueCell.style.padding = '8px 15px';
      totalValueCell.style.border = '1px solid #bfdbfe';
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
    phoneNumber.textContent = '+90 553 924 1644';
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
    
    // Address
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
    addressText.textContent = 'Merkez, Soğukçu Sk. No:21, 34381 Şişli/İstanbul, Türkiye';
    addressText.style.fontSize = '14px';
    
    addressInfo.appendChild(addressLabel);
    addressInfo.appendChild(addressText);
    addressDiv.appendChild(addressIcon);
    addressDiv.appendChild(addressInfo);
    
    contactSection.appendChild(phoneDiv);
    contactSection.appendChild(emailDiv);
    contactSection.appendChild(addressDiv);
    container.appendChild(contactSection);
    
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
        <Button 
          className="w-full flex justify-center" 
          color="light" 
          onClick={handleDownloadImage}
          disabled={isImageLoading}
        >
          {isImageLoading ? (
            <FaSpinner className="animate-spin sm:mr-2" />
          ) : (
            <FaFileImage className="sm:mr-2 m-0.5" />
          )}
          <span className="hidden sm:inline">
            {isImageLoading ? 'Generating...' : 'Download as Image'}
          </span>
        </Button>
        
        <Button 
          className="w-full flex justify-center" 
          gradientDuoTone="purpleToPink" 
          onClick={handleDownloadPDF}
          disabled={isPdfLoading}
        >
          {isPdfLoading ? (
            <FaSpinner className="animate-spin sm:mr-2" />
          ) : (
            <FaFilePdf className="sm:mr-2 m-0.5" />
          )}
          <span className="hidden sm:inline">
            {isPdfLoading ? 'Generating...' : 'Download as PDF'}
          </span>
        </Button>
        
        {editUrl && (
          <Button
            className="w-full flex justify-center"
            gradientDuoTone="greenToBlue"
            as={Link}
            to={editUrl}
          >
            <FaPen className="sm:mr-2 sm:mt-0.5" />
            <span className="hidden sm:inline">Edit Voucher</span>
          </Button>
        )}
        
        {onDelete && (
          <Button 
            className="w-full flex justify-center"
            color="failure" 
            onClick={onDelete}
          >
            <FaTrash className="sm:mr-2 sm:mt-0.5" />
            <span className="hidden sm:inline">Delete Voucher</span>
          </Button>
        )}
      </div>
      
      {/* Section Visibility Controls */}
      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
        <div className="mb-3 text-center">
          <span className="font-medium text-gray-700 dark:text-gray-300">Toggle Sections</span>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center gap-2">
          <Button 
            size="xs" 
            color={showHotels ? "success" : "light"}
            onClick={() => setShowHotels(!showHotels)}
            className="w-full sm:w-auto flex items-center justify-center py-1 px-3"
          >
            {showHotels ? <FaEye className="mr-1 mt-0.5" /> : <FaEyeSlash className="mr-1 mt-0.5" />} Hotels
          </Button>
          <Button 
            size="xs" 
            color={showTransfers ? "success" : "light"}
            onClick={() => setShowTransfers(!showTransfers)}
            className="w-full sm:w-auto flex items-center justify-center py-1 px-3"
          >
            {showTransfers ? <FaEye className="mr-1 mt-0.5" /> : <FaEyeSlash className="mr-1 mt-0.5" />} Transfers
          </Button>
          <div className="col-span-1 sm:col-span-auto">
            <Button 
              size="xs" 
              color={showTrips ? "success" : "light"}
              onClick={() => setShowTrips(!showTrips)}
              className="w-full sm:w-auto flex items-center justify-center py-1 px-3"
            >
              {showTrips ? <FaEye className="mr-1 mt-0.5" /> : <FaEyeSlash className="mr-1 mt-0.5" />} Trips
            </Button>
          </div>
          <div className="col-span-1 sm:hidden">
            <Button 
              size="xs" 
              color="info"
              onClick={toggleAllSections}
              className="w-full flex items-center justify-center py-1 px-3"
            >
              {allSectionsVisible ? 
                <><FaEyeSlash className="mr-1 mt-0.5" /> Hide All</> : 
                <><FaEye className="mr-1 mt-0.5" /> Show All</>
              }
            </Button>
          </div>
        </div>
        <div className="mt-3 hidden sm:flex justify-center">
          <Button 
            size="xs" 
            color="info"
            onClick={toggleAllSections}
            className="py-1 px-6"
          >
            {allSectionsVisible ? 
              <><FaEyeSlash className="mr-1 mt-0.5" /> Hide All</> : 
              <><FaEye className="mr-1 mt-0.5" /> Show All</>
            }
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg max-w-full font-bold" ref={voucherRef}>
        {/* Voucher Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 pb-4 border-b-2 border-blue-200">
          <div className="flex items-center">
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
              <div>
                <span className="font-semibold">Clients:</span> {voucherData.clientName}
              </div>
              <div>
                <span className="font-semibold">Nationality:</span> {voucherData.nationality}
              </div>
              <div>
                <span className="font-semibold">Booking №:</span> {voucherData.voucherNumber || 10000}
              </div>
              {voucherData.capital && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-md">
                  <span className="font-semibold">Capital:</span> {voucherData.capital}
                  <div className="text-xs text-gray-500 italic mt-1">
                    (This field is only visible in preview)
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
                {voucherData.hotels.map((hotel, index) => (
                  <tr key={`hotel-row-${index}`} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.city}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.hotelName}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.roomType}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.nights}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{formatDisplayDate(hotel.checkIn)}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{formatDisplayDate(hotel.checkOut)}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{hotel.pax}</td>
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
            onClick={() => setShowHotels(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">Hotels section hidden</span>
            <Button size="xs" color="light" className="flex items-center py-1 px-3">
              <FaEye className="mr-1 mt-0.5" /> Show
            </Button>
          </div>
        )}
        
        {/* Transfers */}
        <div className="mb-6" style={{ display: showTransfers ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md">Transfer</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 font-bold">
              <thead className="text-xs text-gray-700 uppercase bg-blue-100">
                <tr>
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
                {voucherData.transfers.map((transfer, index) => (
                  <tr key={`transfer-row-${index}`} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.city || ''}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{formatDisplayDate(transfer.date)}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.time || ''}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.flightNumber || ''}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.from}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.to}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{transfer.pax}</td>
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
            onClick={() => setShowTransfers(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">Transfers section hidden</span>
            <Button size="xs" color="light" className="flex items-center py-1 px-3">
              <FaEye className="mr-1 mt-0.5" /> Show
            </Button>
          </div>
        )}
        
        {/* Trips */}
        <div className="mb-6" style={{ display: showTrips ? 'block' : 'none' }}>
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md">Trips</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 font-bold">
              <thead className="text-xs text-gray-700 uppercase bg-blue-100">
                <tr>
                  <th className="px-2 md:px-4 py-2 border">City</th>
                  <th className="px-2 md:px-4 py-2 border">Tours</th>
                  <th className="px-2 md:px-4 py-2 border">Type</th>
                  <th className="px-2 md:px-4 py-2 border">Pax</th>
                </tr>
              </thead>
              <tbody>
                {voucherData.trips.map((trip, index) => (
                  <tr key={`trip-row-${index}`} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{trip.city}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{trip.tourName}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{trip.type}</td>
                    <td className="px-2 md:px-4 py-2 border text-xs md:text-sm">{trip.pax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {!showTrips && voucherData.trips && voucherData.trips.length > 0 && (
          <div 
            className="mb-6 p-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer flex items-center justify-between"
            onClick={() => setShowTrips(true)}
          >
            <span className="text-gray-600 font-medium text-sm sm:text-base">Trips section hidden</span>
            <Button size="xs" color="light" className="flex items-center py-1 px-3">
              <FaEye className="mr-1 mt-0.5" /> Show
            </Button>
          </div>
        )}
        
        {/* Total Amount */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold bg-blue-800 text-white pt-2 pb-6 px-4 rounded-t-md flex items-center">Total amount</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 border border-blue-200 border-t-0 font-bold">
              <tbody>
                {voucherData.advancedPayment ? (
                  <>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3 border font-black w-3/4">Total Amount</td>
                      <td className="px-4 py-3 border text-right font-black">{voucherData.totalAmount}$</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-4 py-3 border font-black">Advanced Payment</td>
                      <td className="px-4 py-3 border text-right font-black">{voucherData.advancedAmount}$</td>
                    </tr>
                    <tr className="bg-blue-50 border-b">
                      <td className="px-4 py-3 border font-black">Balance Due</td>
                      <td className="px-4 py-3 border text-right font-black">{voucherData.remainingAmount}$</td>
                    </tr>
                  </>
                ) : (
                  <tr className="bg-white border-b">
                    <td className="px-4 py-3 border font-black w-3/4">Total Amount</td>
                    <td className="px-4 py-3 border text-right font-black">{voucherData.totalAmount}$</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-sm">+90 553 924 1644</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✉️</span>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-sm">rahalatek@gmail.com</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <div>
              <div className="text-sm text-gray-500">Address</div>
              <div className="text-sm">Merkez, Soğukçu Sk. No:21, 34381 Şişli/İstanbul, Türkiye</div>
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
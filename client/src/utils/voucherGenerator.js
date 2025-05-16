// Format date to DD/MM/YYYY
export const formatDisplayDate = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

// Function to create a PDF-ready voucher using the voucher data
export const createVoucherTemplate = (voucherData, visibilitySettings = { showHotels: true, showTransfers: true, showTrips: true }) => {
  if (!voucherData) return '';
  
  const {
    voucherNumber,
    clientName,
    nationality,
    arrivalDate,
    departureDate,
    hotels,
    transfers,
    trips,
    totalAmount
  } = voucherData;

  const { showHotels, showTransfers, showTrips } = visibilitySettings;

  // Format dates
  const formattedArrivalDate = formatDisplayDate(arrivalDate);
  const formattedDepartureDate = formatDisplayDate(departureDate);

  // Create a template HTML string that will be converted to PDF
  return `
    <div class="voucher-container">
      <div class="voucher-header">
        <div class="company-logo">
          <img src="/Logolight.png" alt="Rahalatek Tourism" />
          <div class="company-name">
            <h1>RAHALATEK</h1>
            <h2>TOURISM</h2>
          </div>
        </div>
      </div>
      
      <div class="client-info">
        <div><strong>CLIENTS:</strong> ${clientName}</div>
        <div><strong>NATIONALITY:</strong> ${nationality}</div>
        <div><strong>Voucher №:</strong> ${voucherNumber}</div>
        <div class="dates">
          <span><strong>Arrival:</strong> ${formattedArrivalDate}</span>
          <span><strong>Departure:</strong> ${formattedDepartureDate}</span>
        </div>
      </div>
      
      ${showHotels && hotels && hotels.length > 0 ? `
      <h3 class="section-title">Hotels</h3>
      <table class="voucher-table hotels-table">
        <thead>
          <tr>
            <th>CITY</th>
            <th>Hotel</th>
            <th>Room Type</th>
            <th>Night</th>
            <th>Check in</th>
            <th>Check Out</th>
            <th>PAX</th>
            <th>CN</th>
          </tr>
        </thead>
        <tbody>
          ${hotels.map(hotel => `
            <tr>
              <td>${hotel.city}</td>
              <td>${hotel.hotelName}</td>
              <td>${hotel.roomType}</td>
              <td>${hotel.nights}</td>
              <td>${formatDisplayDate(hotel.checkIn)}</td>
              <td>${formatDisplayDate(hotel.checkOut)}</td>
              <td>${hotel.pax}</td>
              <td>${hotel.confirmationNumber || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}
      
      ${showTransfers && transfers && transfers.length > 0 ? `
      <h3 class="section-title">Transfer</h3>
      <table class="voucher-table transfer-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Flight</th>
            <th>From</th>
            <th>To</th>
            <th>Pax</th>
            <th>TYPE</th>
          </tr>
        </thead>
        <tbody>
          ${transfers.map(transfer => `
            <tr>
              <td>${transfer.type} ${formatDisplayDate(transfer.date)}</td>
              <td>${transfer.time || ''}</td>
              <td>${transfer.flightNumber || ''}</td>
              <td>${transfer.from}</td>
              <td>${transfer.to}</td>
              <td>${transfer.pax}</td>
              <td>${transfer.vehicleType}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}
      
      ${showTrips && trips && trips.length > 0 ? `
      <h3 class="section-title">Trips</h3>
      <table class="voucher-table trips-table">
        <thead>
          <tr>
            <th>City</th>
            <th>Tours</th>
            <th>Type</th>
            <th>Pax</th>
          </tr>
        </thead>
        <tbody>
          ${trips.map(trip => `
            <tr>
              <td>${trip.city}</td>
              <td>${trip.tourName}</td>
              <td>${trip.type || ''}</td>
              <td>${trip.pax}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}
      
      <div class="total-amount">
        <div>Total amount</div>
        <div class="amount">${totalAmount}$</div>
      </div>
      
      <div class="contact-info">
        <div class="contact-item">
          <span class="icon">📱</span>
          <span class="label">Phone</span>
          <span>+90 553 924 1644</span>
        </div>
        <div class="contact-item">
          <span class="icon">✉️</span>
          <span class="label">Email</span>
          <span>rahalatek@gmail.com</span>
        </div>
        <div class="contact-item">
          <span class="icon">📍</span>
          <span class="label">Address</span>
          <span>Merkez, Soğukçu Sk. No:21, 34381 Şişli/İstanbul, Türkiye</span>
        </div>
      </div>
      
      <div class="voucher-footer">
        <div class="voucher-number">Voucher #${voucherNumber}</div>
      </div>
    </div>
  `;
}; 
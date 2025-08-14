const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const hotelRoutes = require('./routes/hotelRoutes');
const tourRoutes = require('./routes/tourRoutes');
const authRoutes = require('./routes/authRoutes');
const airportRoutes = require('./routes/airports');
const voucherRoutes = require('./routes/voucherRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const officeRoutes = require('./routes/officeRoutes');
const debtRoutes = require('./routes/debtRoutes');
const officePaymentRoutes = require('./routes/officePaymentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const authController = require('./controllers/authController');
const NotificationService = require('./services/notificationService');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    try {
      await authController.checkAndFixSchema();
      console.log('Schema check completed');
      
      // Initialize notification system
      console.log('Starting notification system...');
      try {
        await NotificationService.generateArrivalReminders();
        await NotificationService.generateDepartureReminders();
        await NotificationService.generateDailyArrivalsSummary();
        await NotificationService.generateDailyDeparturesSummary();
      } catch (err) {
        console.error('Notification system error:', err);
      }
      
      // Schedule arrival and departure reminder generation every hour
      setInterval(async () => {
        try {
          await NotificationService.generateArrivalReminders();
          await NotificationService.generateDepartureReminders();
          await NotificationService.cleanupExpiredNotifications();
        } catch (err) {
          console.error('Scheduled task error:', err);
        }
      }, 1 * 60 * 60 * 1000);
      
      // Schedule daily arrivals and departures summary generation every morning at 8 AM
      const scheduleDailySummary = () => {
        const now = new Date();
        const next8AM = new Date();
        next8AM.setHours(8, 0, 0, 0);
        
        // If it's already past 8 AM today, schedule for tomorrow
        if (now > next8AM) {
          next8AM.setDate(next8AM.getDate() + 1);
        }
        
        const timeUntil8AM = next8AM.getTime() - now.getTime();
        
        setTimeout(async () => {
          try {
            await NotificationService.generateDailyArrivalsSummary();
            await NotificationService.generateDailyDeparturesSummary();
            
            // Schedule the next one (24 hours later)
            setInterval(async () => {
              try {
                await NotificationService.generateDailyArrivalsSummary();
                await NotificationService.generateDailyDeparturesSummary();
              } catch (err) {
                console.error('⚠️ Daily summary error:', err);
              }
            }, 24 * 60 * 60 * 1000); // Run every 24 hours
            
          } catch (err) {
            console.error('⚠️ Daily summary error:', err);
          }
        }, timeUntil8AM);
        

      };
      
      scheduleDailySummary();
      
    } catch (err) {
      console.error('Schema fix error:', err);
    }
  })
  .catch((err) => console.log(err));

// API routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/office-payments', officePaymentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);

// API root route - specify exact path match
app.get('/api', (req, res) => {
    res.send('Tour Management Helper API');
});

// Serve static files - fix the path for Render deployment
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

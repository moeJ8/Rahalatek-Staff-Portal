// Load .env FIRST before any other requires
const path = require('path');
const dotenv = require('dotenv');

// Load .env from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Now require everything else
const express = require('express');
const cors = require('cors');
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
const attendanceRoutes = require('./routes/attendanceRoutes');
const workingDaysRoutes = require('./routes/workingDaysRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const userLeaveRoutes = require('./routes/userLeaveRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');
const imageRoutes = require('./routes/imageRoutes');
const carouselRoutes = require('./routes/carouselRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const authController = require('./controllers/authController');
const NotificationService = require('./services/notificationService');
const SchedulerService = require('./services/schedulerService');

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
      
      // Initialize the new cron-based scheduler
      await SchedulerService.initializeSchedules();
      SchedulerService.startAllJobs();
      
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
app.use('/api/attendance', attendanceRoutes);
app.use('/api/working-days', workingDaysRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/user-leave', userLeaveRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/destinations', destinationRoutes);

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

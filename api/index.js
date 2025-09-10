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
const authController = require('./controllers/authController');
const NotificationService = require('./services/notificationService');

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
      
      // Schedule custom reminder processing every 10 seconds for precise timing
      setInterval(async () => {
        try {
          await NotificationService.processScheduledReminders();
        } catch (err) {
          console.error('Custom reminder processing error:', err);
        }
      }, 10 * 1000); 

      setInterval(async () => {
        try {
          await NotificationService.generateArrivalReminders();
          await NotificationService.generateDepartureReminders();
          await NotificationService.cleanupExpiredNotifications();
        } catch (err) {
          console.error('Scheduled notification task error:', err);
        }
      }, 60 * 60 * 1000); // Run every hour for less time-sensitive tasks
      
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

      // Schedule attendance checkout reminder every day at 8 PM
      const scheduleAttendanceReminder = () => {
        const now = new Date();
        const next8PM = new Date();
        next8PM.setHours(20, 0, 0, 0); // 8 PM
        
        // If it's already past 8 PM today, schedule for tomorrow
        if (now > next8PM) {
          next8PM.setDate(next8PM.getDate() + 1);
        }
        
        const timeUntil8PM = next8PM.getTime() - now.getTime();
        
        setTimeout(async () => {
          try {
            await NotificationService.generateAttendanceCheckoutReminder();
            
            // Schedule the next one (24 hours later)
            setInterval(async () => {
              try {
                await NotificationService.generateAttendanceCheckoutReminder();
              } catch (err) {
                console.error('⚠️ Attendance reminder error:', err);
              }
            }, 24 * 60 * 60 * 1000); // Run every 24 hours
            
          } catch (err) {
            console.error('⚠️ Attendance reminder error:', err);
          }
        }, timeUntil8PM);
      };

      // Schedule auto-checkout every day at 11 PM
      const scheduleAutoCheckout = () => {
        const now = new Date();
        const next11PM = new Date();
        next11PM.setHours(23, 0, 0, 0); // 11 PM
        
        // If it's already past 11 PM today, schedule for tomorrow
        if (now > next11PM) {
          next11PM.setDate(next11PM.getDate() + 1);
        }
        
        const timeUntil11PM = next11PM.getTime() - now.getTime();
        
        setTimeout(async () => {
          try {
            await NotificationService.autoCheckoutForgottenEmployees();
            
            // Schedule the next one (24 hours later)
            setInterval(async () => {
              try {
                await NotificationService.autoCheckoutForgottenEmployees();
              } catch (err) {
                console.error('⚠️ Auto-checkout error:', err);
              }
            }, 24 * 60 * 60 * 1000); // Run every 24 hours
            
          } catch (err) {
            console.error('⚠️ Auto-checkout error:', err);
          }
        }, timeUntil11PM);
      };

      scheduleAttendanceReminder();
      scheduleAutoCheckout();

      // Schedule daily check-in reminder every day at 11 AM
      const scheduleDailyCheckinReminder = () => {
        const now = new Date();
        const next11AM = new Date();
        next11AM.setHours(11, 0, 0, 0);
        
        // If it's already past 11 AM today, schedule for tomorrow
        if (now > next11AM) {
          next11AM.setDate(next11AM.getDate() + 1);
        }
        
        const timeUntil11AM = next11AM.getTime() - now.getTime();
        
        setTimeout(async () => {
          try {
            await NotificationService.generateDailyCheckinReminder();
            
            // Schedule to run every day at 11 AM
            setInterval(async () => {
              try {
                await NotificationService.generateDailyCheckinReminder();
              } catch (err) {
                console.error('⚠️ Daily check-in reminder error:', err);
              }
            }, 24 * 60 * 60 * 1000); // Run every 24 hours
            
          } catch (err) {
            console.error('⚠️ Initial check-in reminder error:', err);
          }
        }, timeUntil11AM);
        
        console.log(`⏰ Daily check-in reminders scheduled for next 11 AM (in ${Math.round(timeUntil11AM / 1000 / 60)} minutes), then daily`);
      };

      // Schedule daily check-out reminder every day at 6:55 PM
      const scheduleDailyCheckoutReminder = () => {
        const now = new Date();
        const next655PM = new Date();
        next655PM.setHours(18, 55, 0, 0); // 6:55 PM
        
        // If it's already past 6:55 PM today, schedule for tomorrow
        if (now > next655PM) {
          next655PM.setDate(next655PM.getDate() + 1);
        }
        
        const timeUntil655PM = next655PM.getTime() - now.getTime();
        
        setTimeout(async () => {
          try {
            await NotificationService.generateDailyCheckoutReminder();
            
            // Schedule to run every day at 6:55 PM
            setInterval(async () => {
              try {
                await NotificationService.generateDailyCheckoutReminder();
              } catch (err) {
                console.error('⚠️ Daily check-out reminder error:', err);
              }
            }, 24 * 60 * 60 * 1000); // Run every 24 hours
            
          } catch (err) {
            console.error('⚠️ Initial check-out reminder error:', err);
          }
        }, timeUntil655PM);
        
        console.log(`⏰ Daily check-out reminders scheduled for next 6:55 PM (in ${Math.round(timeUntil655PM / 1000 / 60)} minutes), then daily`);
      };

      scheduleDailyCheckinReminder();
      scheduleDailyCheckoutReminder();

      // Schedule upcoming events emails every 3 days at 8 AM
      const scheduleUpcomingEventsEmails = () => {
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
            // Send initial upcoming events emails
            await NotificationService.generateUpcomingEventsEmails();
            
            // Schedule to run every 3 days (72 hours)
            setInterval(async () => {
              try {
                await NotificationService.generateUpcomingEventsEmails();
              } catch (err) {
                console.error('⚠️ Upcoming events email error:', err);
              }
            }, 3 * 24 * 60 * 60 * 1000); // Run every 3 days
            
          } catch (err) {
            console.error('⚠️ Initial upcoming events email error:', err);
          }
        }, timeUntil8AM);
        
        console.log(`📅 Upcoming events emails scheduled for next 8 AM (in ${Math.round(timeUntil8AM / 1000 / 60)} minutes), then every 3 days`);
      };

      scheduleUpcomingEventsEmails();

      // Schedule monthly financial summary emails - last day of each month at 11 PM
      const scheduleMonthlyFinancialSummary = () => {
        const now = new Date();
        
        // Calculate next end of month at 11 PM
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
        const lastDayOfMonth = new Date(nextMonth.getTime() - 1); // Last day of current month
        lastDayOfMonth.setHours(23, 0, 0, 0); // Set to 11 PM
        
        // If we've already passed this month's scheduled time, schedule for next month
        const targetDate = lastDayOfMonth < now 
          ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 0, 0, 0) // Last day of next month at 11 PM
          : lastDayOfMonth;
        
        const timeUntilSend = targetDate.getTime() - now.getTime();
        
        setTimeout(async () => {
          try {
            // Send monthly financial summary
            await NotificationService.generateMonthlyFinancialSummaryEmails();
            
            // Schedule for next month
            const scheduleNextMonth = () => {
              const currentDate = new Date();
              const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 0, 0, 0);
              const timeToNext = nextMonthDate.getTime() - currentDate.getTime();
              
              setTimeout(async () => {
                try {
                  await NotificationService.generateMonthlyFinancialSummaryEmails();
                  scheduleNextMonth(); // Schedule the next one
                } catch (err) {
                  console.error('⚠️ Monthly financial summary error:', err);
                  scheduleNextMonth(); // Still schedule the next one even if this one fails
                }
              }, timeToNext);
            };
            
            scheduleNextMonth();
            
          } catch (err) {
            console.error('⚠️ Initial monthly financial summary error:', err);
          }
        }, timeUntilSend);
        
        const targetDateStr = targetDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        console.log(`📊 Monthly financial summary scheduled for ${targetDateStr} (in ${Math.round(timeUntilSend / 1000 / 60 / 60)} hours)`);
      };

      scheduleMonthlyFinancialSummary();
      
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

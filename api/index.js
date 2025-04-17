const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const hotelRoutes = require('./routes/hotelRoutes');
const tourRoutes = require('./routes/tourRoutes');
const authRoutes = require('./routes/authRoutes');
const airportRoutes = require('./routes/airports');
const authController = require('./controllers/authController');
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

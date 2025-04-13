const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const hotelRoutes = require('./routes/hotelRoutes');
const tourRoutes = require('./routes/tourRoutes');
const authRoutes = require('./routes/authRoutes');
const airportRoutes = require('./routes/airports');
const authController = require('./controllers/authController');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Fix database schema after connection is established
    try {
      await authController.checkAndFixSchema();
      console.log('Schema check completed');
    } catch (err) {
      console.error('Schema fix error:', err);
    }
  })
  .catch((err) => console.log(err));

// API routes should come before the catch-all route
app.use('/api/hotels', hotelRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/airports', airportRoutes);

// Root route should be last
app.use('/', (req, res) => {
    res.send('Tour Management Helper API');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

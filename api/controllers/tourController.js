const Tour = require('../models/Tour');

// Get all tours
exports.getAllTours = async (req, res) => {
  try {
    // Sort by updatedAt in descending order (newest first)
    const tours = await Tour.find().sort({ updatedAt: -1 });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tours by city
exports.getToursByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const tours = await Tour.find({ city: { $regex: city, $options: 'i' } });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tour by ID
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new tour
exports.addTour = async (req, res) => {
  try {
    const newTour = new Tour(req.body);
    const savedTour = await newTour.save();
    res.status(201).json(savedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update tour
exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.status(200).json(updatedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete tour
exports.deleteTour = async (req, res) => {
  try {
    // Check if user is authorized to delete tours
    // Only full admins can delete tours, not accountants
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. Only administrators can delete tours.' 
      });
    }

    // Additional check to ensure accountants cannot delete even if they somehow get admin token
    if (req.user.isAccountant && !req.user.isAdmin) {
      return res.status(403).json({ 
        message: 'Accountants are not authorized to delete tours.' 
      });
    }

    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.status(200).json({ message: 'Tour deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

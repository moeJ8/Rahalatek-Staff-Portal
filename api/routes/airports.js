const express = require('express');
const router = express.Router();
const Airport = require('../models/Airport');
const { invalidateDashboardCache } = require('../utils/redis');

// Get all airports
router.get('/', async (req, res) => {
    try {
        const airports = await Airport.find();
        res.status(200).json(airports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new airport
router.post('/', async (req, res) => {
    const airport = new Airport({
        name: req.body.name,
        arabicName: req.body.arabicName
    });

    try {
        const newAirport = await airport.save();
        
        // Invalidate dashboard cache since airport count changed
        await invalidateDashboardCache('Airport added');
        
        res.status(201).json(newAirport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get a specific airport
router.get('/:id', async (req, res) => {
    try {
        const airport = await Airport.findById(req.params.id);
        if (!airport) return res.status(404).json({ message: 'Airport not found' });
        res.status(200).json(airport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update an airport
router.put('/:id', async (req, res) => {
    try {
        const airport = await Airport.findById(req.params.id);
        if (!airport) return res.status(404).json({ message: 'Airport not found' });

        if (req.body.name) airport.name = req.body.name;
        if (req.body.arabicName) airport.arabicName = req.body.arabicName;

        const updatedAirport = await airport.save();
        
        // Invalidate dashboard cache since airport data changed
        await invalidateDashboardCache('Airport updated');
        
        res.status(200).json(updatedAirport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an airport
router.delete('/:id', async (req, res) => {
    try {
        const airport = await Airport.findByIdAndDelete(req.params.id);
        if (!airport) return res.status(404).json({ message: 'Airport not found' });
        
        // Invalidate dashboard cache since airport count changed
        await invalidateDashboardCache('Airport deleted');
        
        res.status(200).json({ message: 'Airport deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 
const Office = require('../models/Office');

// Create a new office
exports.createOffice = async (req, res) => {
    try {
        // Check if user is authorized to create offices
        if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. Only administrators, accountants, and content managers can create offices.' 
            });
        }
        const { name, location, email, phoneNumber, description } = req.body;

        const office = new Office({
            name,
            location,
            email,
            phoneNumber,
            description: description || ''
        });

        await office.save();

        res.status(201).json({
            success: true,
            data: office
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create office',
            error: error.message
        });
    }
};

// Get all offices
exports.getAllOffices = async (req, res) => {
    try {
        const offices = await Office.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: offices.length,
            data: offices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get offices',
            error: error.message
        });
    }
};

// Get office by ID
exports.getOfficeById = async (req, res) => {
    try {
        const office = await Office.findById(req.params.id);

        if (!office) {
            return res.status(404).json({
                success: false,
                message: 'Office not found'
            });
        }

        res.status(200).json({
            success: true,
            data: office
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get office',
            error: error.message
        });
    }
};

// Update office
exports.updateOffice = async (req, res) => {
    try {
        // Check if user is authorized to update offices
        if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. Only administrators, accountants, and content managers can update offices.' 
            });
        }
        const { name, location, email, phoneNumber, description } = req.body;

        const office = await Office.findByIdAndUpdate(
            req.params.id,
            {
                name,
                location,
                email,
                phoneNumber,
                description: description || ''
            },
            { new: true, runValidators: true }
        );

        if (!office) {
            return res.status(404).json({
                success: false,
                message: 'Office not found'
            });
        }

        res.status(200).json({
            success: true,
            data: office
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update office',
            error: error.message
        });
    }
};

// Delete office
exports.deleteOffice = async (req, res) => {
    try {
        // Check if user is authorized to delete offices
        if (!req.user.isAdmin && !req.user.isAccountant && !req.user.isContentManager) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied. Only administrators, accountants, and content managers can delete offices.' 
            });
        }
        const office = await Office.findByIdAndDelete(req.params.id);

        if (!office) {
            return res.status(404).json({
                success: false,
                message: 'Office not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Office deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete office',
            error: error.message
        });
    }
}; 
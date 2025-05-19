const Voucher = require('../models/Voucher');

// Create a new voucher
exports.createVoucher = async (req, res) => {
    try {
        const {
            voucherNumber: providedVoucherNumber,
            clientName,
            nationality,
            phoneNumber,
            officeName,
            bookingReference,
            arrivalDate,
            departureDate,
            capital,
            hotels,
            transfers,
            trips,
            totalAmount,
            advancedPayment,
            advancedAmount,
            remainingAmount
        } = req.body;

        let processedTrips;
        
        try {
            if (typeof trips === 'string') {
                processedTrips = JSON.parse(trips);
            } 
 
            else if (Array.isArray(trips)) {
                processedTrips = trips;
            } 

            else {
                processedTrips = trips || [];
            }
        } catch (error) {
            processedTrips = []; 
        }

        let voucherNumber;
        if (providedVoucherNumber) {
            voucherNumber = providedVoucherNumber;
        } else {
            voucherNumber = await Voucher.getNextVoucherNumber();
        }

        const voucher = new Voucher({
            voucherNumber,
            voucherId: voucherNumber,
            bookingNumber: voucherNumber,
            clientName,
            nationality,
            phoneNumber: phoneNumber || '',
            officeName: officeName || '',
            bookingReference: bookingReference || 'Auto-generated',
            arrivalDate,
            departureDate,
            capital: capital || '',
            hotels,
            transfers,
            trips: processedTrips,
            totalAmount: Number(totalAmount) || 0,
            advancedPayment: advancedPayment || false,
            advancedAmount: advancedPayment ? Number(advancedAmount) || 0 : 0,
            remainingAmount: advancedPayment ? Number(remainingAmount) || 0 : 0,
            createdBy: req.user.userId
        });
        
        await voucher.save();
        
        res.status(201).json({
            success: true,
            data: voucher
        });
    } catch (error) {
        if (error.code === 11000) {            
            try {
                const randomNumber = 10000 + Math.floor(Math.random() * 90000);
                
                const voucher = new Voucher({
                    voucherNumber: randomNumber,
                    voucherId: randomNumber,
                    bookingNumber: randomNumber,
                    clientName,
                    nationality,
                    phoneNumber: phoneNumber || '',
                    officeName: officeName || '',
                    bookingReference: bookingReference || 'Auto-generated',
                    arrivalDate,
                    departureDate,
                    capital: capital || '',
                    hotels,
                    transfers,
                    trips: processedTrips,
                    totalAmount: Number(totalAmount) || 0,
                    advancedPayment: advancedPayment || false,
                    advancedAmount: advancedPayment ? Number(advancedAmount) || 0 : 0,
                    remainingAmount: advancedPayment ? Number(remainingAmount) || 0 : 0,
                    createdBy: req.user.userId
                });
                
                await voucher.save();
                
                return res.status(201).json({
                    success: true,
                    data: voucher
                });
            } catch (retryError) {

            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create voucher',
            error: error.message
        });
    }
};

exports.getAllVouchers = async (req, res) => {
    try {
        const vouchers = await Voucher.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username');
        
        res.status(200).json({
            success: true,
            count: vouchers.length,
            data: vouchers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get vouchers',
            error: error.message
        });
    }
};

exports.getVoucherById = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id)
            .populate('createdBy', 'username');
        
        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: voucher
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get voucher',
            error: error.message
        });
    }
};


exports.getVoucherByNumber = async (req, res) => {
    try {
        const voucher = await Voucher.findOne({ voucherNumber: req.params.number })
            .populate('createdBy', 'username');
        
        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: voucher
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get voucher',
            error: error.message
        });
    }
};

exports.getNextVoucherNumber = async (req, res) => {
    try {
        const nextNumber = await Voucher.getNextVoucherNumber();
        
        res.status(200).json({
            success: true,
            nextNumber
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get next voucher number',
            error: error.message
        });
    }
};

exports.deleteVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        
        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher not found'
            });
        }
        
        // Check if the user is authorized to delete the voucher
        if (!req.user.isAdmin && voucher.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this voucher'
            });
        }
        
        await Voucher.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Voucher deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete voucher',
            error: error.message
        });
    }
};

exports.updateVoucher = async (req, res) => {
    try {
        // First check if the voucher exists and if the user is authorized
        const voucher = await Voucher.findById(req.params.id);
        
        if (!voucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher not found'
            });
        }
        
        // Check if the user is authorized to update the voucher
        if (!req.user.isAdmin && voucher.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this voucher'
            });
        }
        
        const {
            clientName,
            nationality,
            phoneNumber,
            officeName,
            bookingReference,
            arrivalDate,
            departureDate,
            capital,
            hotels,
            transfers,
            trips,
            totalAmount,
            advancedPayment,
            advancedAmount,
            remainingAmount
        } = req.body;

        // Process trips if needed
        let processedTrips;
        try {
            if (typeof trips === 'string') {
                processedTrips = JSON.parse(trips);
            } else if (Array.isArray(trips)) {
                processedTrips = trips;
            } else {
                processedTrips = trips || [];
            }
        } catch (error) {
            processedTrips = [];
        }

        // Find and update the voucher
        const updatedVoucher = await Voucher.findByIdAndUpdate(
            req.params.id,
            {
                clientName,
                nationality,
                phoneNumber: phoneNumber || '',
                officeName: officeName || '',
                bookingReference: bookingReference || 'Auto-generated',
                arrivalDate,
                departureDate,
                capital: capital || '',
                hotels,
                transfers,
                trips: processedTrips,
                totalAmount: Number(totalAmount) || 0,
                advancedPayment: advancedPayment || false,
                advancedAmount: advancedPayment ? Number(advancedAmount) || 0 : 0,
                remainingAmount: advancedPayment ? Number(remainingAmount) || 0 : 0
            },
            { new: true, runValidators: true }
        ).populate('createdBy', 'username');

        if (!updatedVoucher) {
            return res.status(404).json({
                success: false,
                message: 'Voucher not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedVoucher
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update voucher',
            error: error.message
        });
    }
}; 
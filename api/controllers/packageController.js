const Package = require('../models/Package');
const Hotel = require('../models/Hotel');
const Tour = require('../models/Tour');
const { 
    invalidateDashboardCache, 
    invalidatePublicCache,
    featuredPackagesCache,
    packageDetailsCache 
} = require('../utils/redis');

// Create a new package
exports.createPackage = async (req, res) => {
    try {
        
        const {
            name,
            description,
            countries,
            cities,
            duration,
            hotels,
            tours,
            transfers,
            dailyItinerary,
            includes,
            excludes,
            pricing,
            targetAudience,
            images
        } = req.body;

        // Validate required fields
        if (!name || !countries || !cities || !duration || !pricing?.basePrice) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, countries, cities, duration, and base price are required'
            });
        }

        // Only admins and content managers can create packages
        if (!req.user.isAdmin && !req.user.isContentManager) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators and content managers can create packages'
            });
        }

        const package = new Package({
            name,
            description,
            countries,
            cities,
            duration,
            hotels: hotels || [],
            tours: tours || [],
            transfers: transfers || [],
            dailyItinerary: dailyItinerary || [],
            includes: includes || [],
            excludes: excludes || [],
            pricing,
            targetAudience: targetAudience || ['Family'],
            images: images || [],
            createdBy: req.user.userId
        });

        await package.save();

        // Populate related data
        const populatedPackage = await Package.findById(package._id)
            .populate('hotels.hotelId', 'name city stars roomTypes')
            .populate('tours.tourId', 'name city tourType price totalPrice description')
            .populate('createdBy', 'username');

        // Smart cache invalidation
        await invalidateDashboardCache('New package created');
        await invalidatePublicCache('packages', package.slug, 'New package created');

        res.status(201).json({
            success: true,
            data: populatedPackage
        });
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create package',
            error: error.message
        });
    }
};

// Get all packages
exports.getAllPackages = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            country,
            city,
            isActive,
            targetAudience,
            minDuration,
            maxDuration,
            search
        } = req.query;

        // Build query
        let query = {};

        // Only filter by isActive if explicitly provided
        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        if (country) {
            query.countries = { $in: [country] };
        }

        if (city) {
            query.cities = { $in: [city] };
        }

        if (targetAudience) {
            if (Array.isArray(targetAudience)) {
                query.targetAudience = { $in: targetAudience };
            } else {
                query.targetAudience = targetAudience;
            }
        }

        if (minDuration || maxDuration) {
            query.duration = {};
            if (minDuration) query.duration.$gte = parseInt(minDuration);
            if (maxDuration) query.duration.$lte = parseInt(maxDuration);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { cities: { $in: [new RegExp(search, 'i')] } },
                { countries: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: [
                { path: 'hotels.hotelId', select: 'name city stars' },
                { path: 'tours.tourId', select: 'name city tourType price totalPrice' },
                { path: 'createdBy', select: 'username' },
                { path: 'updatedBy', select: 'username' }
            ]
        };

        const packages = await Package.paginate(query, options);

        res.status(200).json({
            success: true,
            data: packages.docs,
            pagination: {
                page: packages.page,
                limit: packages.limit,
                total: packages.totalDocs,
                pages: packages.totalPages,
                hasNext: packages.hasNextPage,
                hasPrev: packages.hasPrevPage
            }
        });
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch packages',
            error: error.message
        });
    }
};

// Get package by ID
exports.getPackageById = async (req, res) => {
    try {
        const package = await Package.findById(req.params.id)
            .populate('hotels.hotelId')
            .populate('tours.tourId')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username');

        if (!package) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Increment views
        package.views += 1;
        await package.save();

        res.status(200).json({
            success: true,
            data: package
        });
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch package',
            error: error.message
        });
    }
};

// Update package
exports.updatePackage = async (req, res) => {
    try {
        const packageId = req.params.id;
        
        // Only admins and content managers can update packages
        if (!req.user.isAdmin && !req.user.isContentManager) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators and content managers can update packages'
            });
        }

        const package = await Package.findById(packageId);
        if (!package) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Content managers have full access to edit all packages

        const updatedData = { ...req.body, updatedBy: req.user.userId };
        
        const updatedPackage = await Package.findByIdAndUpdate(
            packageId,
            updatedData,
            { new: true, runValidators: true }
        )
        .populate('hotels.hotelId', 'name city stars roomTypes')
        .populate('tours.tourId', 'name city tourType price description')
        .populate('createdBy', 'username')
        .populate('updatedBy', 'username');

        // Smart cache invalidation
        await invalidateDashboardCache('Package updated');
        await invalidatePublicCache('packages', updatedPackage.slug, 'Package updated');

        res.status(200).json({
            success: true,
            data: updatedPackage
        });
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update package',
            error: error.message
        });
    }
};

// Delete package
exports.deletePackage = async (req, res) => {
    try {
        const packageId = req.params.id;
        
        // Only admins and content managers can delete packages
        if (!req.user.isAdmin && !req.user.isContentManager) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators and content managers can delete packages'
            });
        }

        const package = await Package.findById(packageId);
        if (!package) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        await Package.findByIdAndDelete(packageId);

        // Smart cache invalidation
        await invalidateDashboardCache('Package deleted');
        await invalidatePublicCache('packages', package.slug, 'Package deleted');

        res.status(200).json({
            success: true,
            message: 'Package deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete package',
            error: error.message
        });
    }
};

// Toggle package active status
exports.togglePackageStatus = async (req, res) => {
    try {
        const packageId = req.params.id;
        
        // Only admins and content managers can toggle status
        if (!req.user.isAdmin && !req.user.isContentManager) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators and content managers can toggle package status'
            });
        }

        const package = await Package.findById(packageId);
        if (!package) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }

        // Content managers have full access to toggle all packages

        package.isActive = !package.isActive;
        package.updatedBy = req.user.userId;
        await package.save();

        res.status(200).json({
            success: true,
            data: package,
            message: `Package ${package.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        console.error('Error toggling package status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle package status',
            error: error.message
        });
    }
};
// Get package statistics
exports.getPackageStats = async (req, res) => {
    try {
        // Only admins and content managers can view stats
        if (!req.user.isAdmin && !req.user.isContentManager) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators and content managers can view package statistics'
            });
        }

        const stats = await Package.aggregate([
            {
                $group: {
                    _id: null,
                    totalPackages: { $sum: 1 },
                    activePackages: { $sum: { $cond: ['$isActive', 1, 0] } },
                    inactivePackages: { $sum: { $cond: ['$isActive', 0, 1] } },
                    totalViews: { $sum: '$views' },
                    averageDuration: { $avg: '$duration' },
                    averagePrice: { $avg: '$pricing.basePrice' }
                }
            }
        ]);

        const countryStats = await Package.aggregate([
            { $unwind: '$countries' },
            { $group: { _id: '$countries', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const audienceStats = await Package.aggregate([
            { $unwind: '$targetAudience' },
            { $group: { _id: '$targetAudience', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalPackages: 0,
                    activePackages: 0,
                    inactivePackages: 0,
                    totalViews: 0,
                    averageDuration: 0,
                    averagePrice: 0
                },
                byCountry: countryStats,
                byAudience: audienceStats
            }
        });
    } catch (error) {
        console.error('Error fetching package stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch package statistics',
            error: error.message
        });
    }
};

// Public route - get package by slug
exports.getPackageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Check Redis cache first
        const cachedPackage = await packageDetailsCache.get(slug);
        if (cachedPackage) {
            console.log(`✅ Serving package ${slug} from Redis cache`);
            return res.status(200).json({
                success: true,
                data: cachedPackage
            });
        }

        console.log(`📦 Fetching fresh package data for ${slug}...`);
        const package = await Package.findOne({ slug: slug })
            .populate('hotels.hotelId')
            .populate('tours.tourId')
            .populate('createdBy', 'username')
            .populate('updatedBy', 'username');
        
        if (!package) {
            return res.status(404).json({ 
                success: false,
                message: 'Package not found' 
            });
        }
        
        // Cache the result
        await packageDetailsCache.set(slug, package);
        
        res.status(200).json({
            success: true,
            data: package
        });
    } catch (error) {
        console.error('Error fetching package by slug:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch package',
            error: error.message
        });
    }
};

// Public route - increment package views
exports.incrementPackageViews = async (req, res) => {
    try {
        const { slug } = req.params;
        const package = await Package.findOneAndUpdate(
            { slug: slug },
            { $inc: { views: 1 } },
            { new: true }
        );
        
        if (!package) {
            return res.status(404).json({ 
                success: false,
                message: 'Package not found' 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            views: package.views 
        });
    } catch (error) {
        console.error('Error incrementing package views:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to increment views',
            error: error.message
        });
    }
};

// Public route - get featured packages (sorted by views)
exports.getFeaturedPackages = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 9; // Default to 9 for carousel
        
        // Check Redis cache first (only for default limit to keep cache simple)
        if (limit === 9) {
            const cachedPackages = await featuredPackagesCache.get();
            if (cachedPackages) {
                console.log('✅ Serving featured packages from Redis cache');
                return res.status(200).json({
                    success: true,
                    data: cachedPackages
                });
            }
        }

        console.log('📦 Fetching fresh featured packages...');
        const packages = await Package.find({ isActive: true })
            .sort({ views: -1, updatedAt: -1 }) // Sort by views first, then by recent updates
            .limit(limit)
            .populate('hotels.hotelId', 'name stars images')
            .populate('tours.tourId', 'name city country tourType duration price totalPrice images');
        
        // Cache the result (only for default limit)
        if (limit === 9) {
            await featuredPackagesCache.set(packages);
        }
        
        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        console.error('Error fetching featured packages:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch featured packages',
            error: error.message
        });
    }
};


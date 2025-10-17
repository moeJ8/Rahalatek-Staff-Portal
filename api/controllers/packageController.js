const Package = require('../models/Package');
const Hotel = require('../models/Hotel');
const Tour = require('../models/Tour');
const { 
    invalidateDashboardCache, 
    invalidatePublicCache,
    featuredPackagesCache,
    packageDetailsCache,
    allPackagesCache
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

        // Only admins, content managers, and publishers can create packages
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators, content managers, and publishers can create packages'
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

// Get all packages (with optional pagination and search)
exports.getAllPackages = async (req, res) => {
  try {
    const { country, city, search, targetAudience, duration, isActive, createdBy, page, limit } = req.query;
    
    let query = {};
    if (country) query.countries = { $in: [country] };
    if (city) query.cities = { $in: [city] };
    if (targetAudience) query.targetAudience = { $in: [targetAudience] };
    if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';
    if (createdBy) query.createdBy = createdBy;
    
    // Duration filter
    if (duration) {
      const durationNum = parseInt(duration);
      if (durationNum === 1) {
        query.duration = { $lte: 3 };
      } else if (durationNum === 2) {
        query.duration = { $gt: 3, $lte: 7 };
      } else if (durationNum === 3) {
        query.duration = { $gt: 7 };
      }
    }
    
    // Search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { cities: { $in: [searchRegex] } },
        { countries: { $in: [searchRegex] } }
      ];
    }
    
    // If NO pagination, return all packages (backward compatible)
    if (!page && !limit) {
      if (!country && !city && !search && !targetAudience && !duration && !isActive && !createdBy) {
        const cachedPackages = await allPackagesCache.get();
        if (cachedPackages) {
          console.log('✅ Serving all packages from Redis cache');
          return res.status(200).json(cachedPackages);
        }
      }
      
      console.log('📦 Fetching all packages from database...');
      const packages = await Package.find(query).sort({ updatedAt: -1 })
        .populate('hotels.hotelId', 'name city stars')
        .populate('tours.tourId', 'name city tourType price totalPrice')
        .populate('createdBy', 'username')
        .populate('updatedBy', 'username');
      
      if (!country && !city && !search && !targetAudience && !duration && !isActive && !createdBy) {
        await allPackagesCache.set(packages);
      }
      
      return res.status(200).json(packages);
    }
    
    // PAGINATION MODE
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 9;
    const skip = (pageNum - 1) * limitNum;
    
    const [packages, totalPackages] = await Promise.all([
      Package.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limitNum)
        .populate('hotels.hotelId', 'name city stars')
        .populate('tours.tourId', 'name city tourType price totalPrice')
        .populate('createdBy', 'username')
        .populate('updatedBy', 'username'),
      Package.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        packages,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalPackages / limitNum),
          totalPackages,
          packagesPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(totalPackages / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        
        // Only admins, content managers, and publishers can update packages
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators, content managers, and publishers can update packages'
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
        
        // Only admins, content managers, and publishers can delete packages
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators, content managers, and publishers can delete packages'
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
        
        // Only admins, content managers, and publishers can toggle status
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators, content managers, and publishers can toggle package status'
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
        // Only admins, content managers, and publishers can view stats
        if (!req.user.isAdmin && !req.user.isContentManager && !req.user.isPublisher) {
            return res.status(403).json({
                success: false,
                message: 'Only administrators, content managers, and publishers can view package statistics'
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

// Public route - get recent packages (sorted by creation date)
exports.getRecentPackages = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4; // Default to 4 for sidebar
        
        console.log('📦 Fetching recent packages...');
        const packages = await Package.find({ isActive: true })
            .sort({ createdAt: -1 }) // Sort by most recent creation date
            .limit(limit)
            .populate('hotels.hotelId', 'name stars images')
            .populate('tours.tourId', 'name city country tourType duration price totalPrice images');
        
        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        console.error('Error fetching recent packages:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch recent packages',
            error: error.message
        });
    }
};


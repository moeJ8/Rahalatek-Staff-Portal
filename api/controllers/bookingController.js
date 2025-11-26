const Booking = require("../models/Booking");
const User = require("../models/User");
const BookingPdfService = require("../services/bookingPdfService");
const BookingPdfServiceArabic = require("../services/bookingPdfServiceArabic");

const denyIfPublisher = (req, res) => {
  if (req.user?.isPublisher) {
    res.status(403).json({
      success: false,
      message: "Publishers are not authorized to access bookings",
    });
    return true;
  }
  return false;
};

const getBookingOwnerId = (booking) => {
  if (!booking || !booking.createdBy) return null;
  if (typeof booking.createdBy === "object" && booking.createdBy._id) {
    return booking.createdBy._id.toString();
  }
  return booking.createdBy.toString();
};

const isOwner = (booking, userId) => {
  const ownerId = getBookingOwnerId(booking);
  return ownerId ? ownerId === userId : false;
};

// Create a new booking
exports.createBooking = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const {
      clientName,
      nationality,
      startDate,
      endDate,
      nights,
      numGuests,
      includeChildren,
      childrenUnder3,
      children3to6,
      children6to12,
      selectedCountries,
      selectedCities,
      hotelEntries,
      selectedTours,
      dailyItinerary,
      calculatedPrice,
      manualPrice,
      finalPrice,
      priceBreakdown,
      generatedMessage,
      generatedMessageEnglish,
    } = req.body;

    // Validate required fields
    if (
      !startDate ||
      !endDate ||
      !selectedCities ||
      !hotelEntries ||
      !generatedMessage
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: startDate, endDate, selectedCities, hotelEntries, and generatedMessage are required",
      });
    }

    // Validate hotel entries
    if (!Array.isArray(hotelEntries) || hotelEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one hotel entry is required",
      });
    }

    // Calculate nights if not provided
    const calculatedNights =
      nights ||
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      );

    const booking = new Booking({
      clientName: clientName || null,
      nationality: nationality || null,
      startDate,
      endDate,
      nights: calculatedNights,
      numGuests: numGuests || 2,
      includeChildren: includeChildren || false,
      childrenUnder3: childrenUnder3 || 0,
      children3to6: children3to6 || 0,
      children6to12: children6to12 || 0,
      selectedCountries: selectedCountries || [],
      selectedCities,
      hotelEntries,
      selectedTours: selectedTours || [],
      dailyItinerary: dailyItinerary || [],
      calculatedPrice: calculatedPrice || 0,
      manualPrice: manualPrice || null,
      finalPrice: finalPrice || calculatedPrice || 0,
      priceBreakdown: priceBreakdown || {
        hotels: [],
        transportation: 0,
        tours: 0,
      },
      generatedMessage,
      generatedMessageEnglish: generatedMessageEnglish || "",
      createdBy: req.user.userId,
    });

    await booking.save();

    // Populate tours for response
    await booking.populate("selectedTours", "name city tourType price");

    res.status(201).json({
      success: true,
      message: "Booking saved successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { userId, isAdmin, isAccountant } = req.user;
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      year,
      month,
      createdBy,
    } = req.query;

    // Build query based on user permissions
    const query = {
      isDeleted: false,
    };

    // Non-admins and non-accountants only see their own bookings
    if (!isAdmin && !isAccountant) {
      query.createdBy = userId;
    } else if (createdBy) {
      query.createdBy = createdBy;
    }

    // Add year filter (for creation date)
    if (year) {
      const yearNum = parseInt(year);
      if (!isNaN(yearNum)) {
        query.createdAt = {
          ...query.createdAt,
          $gte: new Date(yearNum, 0, 1),
          $lt: new Date(yearNum + 1, 0, 1),
        };
      }
    }

    // Add month filter (for creation date) - convert month name to number
    if (month) {
      const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      const monthIndex = monthNames.indexOf(month.toLowerCase());
      if (monthIndex !== -1) {
        const yearNum = year ? parseInt(year) : new Date().getFullYear();
        if (!isNaN(yearNum)) {
          query.createdAt = {
            ...query.createdAt,
            $gte: new Date(yearNum, monthIndex, 1),
            $lt: new Date(yearNum, monthIndex + 1, 1),
          };
        }
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get bookings with pagination
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate("createdBy", "username")
        .populate("updatedBy", "username")
        .populate(
          "selectedTours",
          "name slug city tourType price duration totalPrice country vipCarType carCapacity"
        )
        .populate("relatedVoucher", "voucherNumber clientName")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { userId, isAdmin, isAccountant } = req.user;
    const booking = await Booking.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username")
      .populate(
        "selectedTours",
        "name city tourType price vipCarType carCapacity duration highlights translations"
      )
      .populate({
        path: "dailyItinerary.tourInfo.tourId",
        select:
          "name city tourType price vipCarType carCapacity duration highlights translations description detailedDescription policies",
      })
      .populate(
        "relatedVoucher",
        "voucherNumber clientName totalAmount currency"
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const canViewAll = isAdmin || isAccountant;
    if (!canViewAll && !isOwner(booking, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { userId, isAdmin } = req.user;
    const bookingId = req.params.id;

    // Check if booking exists
    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (existingBooking.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!isAdmin && !isOwner(existingBooking, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this booking",
      });
    }

    const {
      clientName,
      nationality,
      startDate,
      endDate,
      nights,
      numGuests,
      includeChildren,
      childrenUnder3,
      children3to6,
      children6to12,
      selectedCountries,
      selectedCities,
      hotelEntries,
      selectedTours,
      dailyItinerary,
      calculatedPrice,
      manualPrice,
      finalPrice,
      priceBreakdown,
      generatedMessage,
      generatedMessageEnglish,
    } = req.body;

    // Build update object
    const updateData = {
      updatedBy: userId,
    };

    if (clientName !== undefined) updateData.clientName = clientName || null;
    if (nationality !== undefined) updateData.nationality = nationality || null;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (nights !== undefined) updateData.nights = nights;
    if (numGuests !== undefined) updateData.numGuests = numGuests;
    if (includeChildren !== undefined)
      updateData.includeChildren = includeChildren;
    if (childrenUnder3 !== undefined)
      updateData.childrenUnder3 = childrenUnder3;
    if (children3to6 !== undefined) updateData.children3to6 = children3to6;
    if (children6to12 !== undefined) updateData.children6to12 = children6to12;
    if (selectedCountries !== undefined)
      updateData.selectedCountries = selectedCountries;
    if (selectedCities !== undefined)
      updateData.selectedCities = selectedCities;
    if (hotelEntries !== undefined) updateData.hotelEntries = hotelEntries;
    if (selectedTours !== undefined) updateData.selectedTours = selectedTours;
    if (dailyItinerary !== undefined)
      updateData.dailyItinerary = dailyItinerary;
    if (calculatedPrice !== undefined)
      updateData.calculatedPrice = calculatedPrice;
    if (manualPrice !== undefined) updateData.manualPrice = manualPrice;
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;
    if (priceBreakdown !== undefined)
      updateData.priceBreakdown = priceBreakdown;
    if (generatedMessage !== undefined)
      updateData.generatedMessage = generatedMessage;
    if (generatedMessageEnglish !== undefined)
      updateData.generatedMessageEnglish = generatedMessageEnglish || "";

    // Recalculate nights if dates changed
    if (updateData.startDate && updateData.endDate) {
      updateData.nights = Math.ceil(
        (new Date(updateData.endDate) - new Date(updateData.startDate)) /
          (1000 * 60 * 60 * 24)
      );
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "username")
      .populate("updatedBy", "username")
      .populate("selectedTours", "name city tourType price")
      .populate("relatedVoucher", "voucherNumber clientName");

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
      error: error.message,
    });
  }
};

// Delete booking (soft delete)
exports.deleteBooking = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { userId, isAdmin } = req.user;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Booking is already deleted",
      });
    }

    if (!isAdmin && !isOwner(booking, userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this booking",
      });
    }

    // Soft delete
    await Booking.findByIdAndUpdate(bookingId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
    });

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};

// Restore booking from trash
exports.restoreBooking = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { isAdmin } = req.user;
    const bookingId = req.params.id;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators are authorized to restore bookings",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Booking is not deleted",
      });
    }

    await Booking.findByIdAndUpdate(bookingId, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });

    res.status(200).json({
      success: true,
      message: "Booking restored successfully",
    });
  } catch (error) {
    console.error("Error restoring booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore booking",
      error: error.message,
    });
  }
};

// Permanently delete booking
exports.permanentlyDeleteBooking = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { isAdmin } = req.user;
    const bookingId = req.params.id;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Only administrators are authorized to permanently delete bookings",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Booking must be soft-deleted before permanent deletion",
      });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      success: true,
      message: "Booking permanently deleted",
    });
  } catch (error) {
    console.error("Error permanently deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete booking",
      error: error.message,
    });
  }
};

// Get bookings metadata (for filter dropdowns)
exports.getBookingsMetadata = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { userId, isAdmin, isAccountant } = req.user;

    // Build query based on user permissions
    const query = {
      isDeleted: false,
    };

    // Non-admins and non-accountants only see their own bookings
    if (!isAdmin && !isAccountant) {
      query.createdBy = userId;
    }

    // Get creation years and unique users (lightweight aggregations)
    const [creationYears, uniqueUserIds] = await Promise.all([
      // Creation years
      Booking.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $year: "$createdAt" },
          },
        },
        { $sort: { _id: -1 } },
      ]).then((results) => results.map((r) => r._id)),
      // Unique users
      Booking.find(query)
        .distinct("createdBy")
        .then((userIds) => userIds || []),
    ]);

    // Populate user details
    const uniqueUsers =
      uniqueUserIds && uniqueUserIds.length > 0
        ? await User.find({ _id: { $in: uniqueUserIds } })
            .select("_id username")
            .sort({ username: 1 })
            .lean()
        : [];

    res.json({
      success: true,
      data: {
        creationYears,
        users: uniqueUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching bookings metadata:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings metadata",
      error: error.message,
    });
  }
};

// Get trashed bookings
exports.getTrashedBookings = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { userId, isAdmin, isAccountant } = req.user;

    // Only full admins can view trashed bookings (not accountants or regular users)
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only administrators are authorized to view trashed bookings",
      });
    }

    // Accountants cannot view trashed bookings
    if (isAccountant && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Accountants are not authorized to view trashed bookings",
      });
    }

    const bookings = await Booking.find({ isDeleted: true })
      .populate("createdBy", "username")
      .populate("deletedBy", "username")
      .populate(
        "selectedTours",
        "name city tourType price duration totalPrice country vipCarType carCapacity"
      )
      .sort({ deletedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching trashed bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trashed bookings",
      error: error.message,
    });
  }
};

// Download booking as PDF
exports.downloadBookingPDF = async (req, res) => {
  if (denyIfPublisher(req, res)) return;
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await Booking.findById(id)
      .select("clientName selectedCities createdBy isDeleted")
      .lean();

    if (!booking || booking.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const canViewAll = req.user.isAdmin || req.user.isAccountant;
    if (!canViewAll && getBookingOwnerId(booking) !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to download this booking",
      });
    }

    const fullUser = await User.findById(req.user.userId).select(
      "username email isAdmin isAccountant"
    );

    if (!fullUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const language = req.query.lang === "ar" ? "ar" : "en";
    const pdfOptions = {
      hideHeader: req.query.hideHeader === "true",
      hidePrice: req.query.hidePrice === "true",
      hideContact: req.query.hideContact === "true",
      hidePackageMessage: req.query.hidePackageMessage === "true",
    };
    const pdfService =
      language === "ar" ? BookingPdfServiceArabic : BookingPdfService;
    const pdfBuffer = await pdfService.generateBookingPDF(
      id,
      fullUser,
      pdfOptions
    );

    const clientName = booking?.clientName
      ? booking.clientName.replace(/[^a-z0-9]/gi, "-")
      : "client";
    const packageName =
      booking?.selectedCities && booking.selectedCities.length > 0
        ? booking.selectedCities.join("-").replace(/[^a-z0-9-]/gi, "-")
        : "package";

    // Set response headers for PDF download
    const filename =
      `${packageName}-package-${clientName}-${language}.pdf`.toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.end(pdfBuffer);
  } catch (error) {
    console.error("Error downloading booking PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
};

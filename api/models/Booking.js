const mongoose = require("mongoose");

const roomAllocationSchema = new mongoose.Schema(
  {
    roomTypeIndex: { type: String, default: "" },
    occupants: { type: Number, default: 1 },
    childrenUnder3: { type: Number, default: 0 },
    children3to6: { type: Number, default: 0 },
    children6to12: { type: Number, default: 0 },
  },
  { _id: false }
);

const hotelEntrySchema = new mongoose.Schema(
  {
    hotelId: { type: String, required: true },
    hotelData: {
      _id: { type: String },
      name: { type: String, required: true },
      slug: { type: String },
      city: { type: String, required: true },
      country: { type: String },
      stars: { type: Number },
      roomTypes: [mongoose.Schema.Types.Mixed],
      breakfastIncluded: { type: Boolean, default: false },
      breakfastPrice: { type: Number, default: 0 },
      airportTransportation: [mongoose.Schema.Types.Mixed],
      airport: { type: String },
      transportation: mongoose.Schema.Types.Mixed,
      description: { type: String },
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    displayCheckIn: { type: String },
    displayCheckOut: { type: String },
    roomAllocations: [roomAllocationSchema],
    includeBreakfast: { type: Boolean, default: true },
    selectedAirport: { type: String, default: "" },
    includeReception: { type: Boolean, default: true },
    includeFarewell: { type: Boolean, default: true },
    transportVehicleType: {
      type: String,
      default: "Vito",
      enum: ["Vito", "Sprinter", "Bus"],
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    // Client Information
    clientName: { type: String, default: null },
    nationality: { type: String, default: null },

    // Package Information
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    nights: { type: Number, required: true },

    // Guest Information
    numGuests: { type: Number, required: true, min: 1 },
    includeChildren: { type: Boolean, default: false },
    childrenUnder3: { type: Number, default: 0 },
    children3to6: { type: Number, default: 0 },
    children6to12: { type: Number, default: 0 },

    // Location Selection
    selectedCountries: [{ type: String }],
    selectedCities: [{ type: String, required: true }],

    // Hotels
    hotelEntries: [hotelEntrySchema],

    // Tours
    selectedTours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tour" }],

    // Pricing
    calculatedPrice: { type: Number, default: 0 },
    manualPrice: { type: Number, default: null }, // null means use calculated price
    finalPrice: { type: Number, required: true },
    priceBreakdown: {
      hotels: [
        {
          hotel: String,
          roomCost: Number,
          breakfastCost: Number,
          transportCost: Number,
          totalCost: Number,
        },
      ],
      transportation: { type: Number, default: 0 },
      tours: { type: Number, default: 0 },
    },

    // Generated Message
    generatedMessage: { type: String, required: true },
    generatedMessageEnglish: { type: String, default: "" },

    // Voucher Link (if converted to voucher)
    relatedVoucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient querying
bookingSchema.index({ createdBy: 1, createdAt: -1 });
bookingSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Booking", bookingSchema);

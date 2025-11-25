const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const Hotel = require("../models/Hotel");
const Airport = require("../models/Airport");
const puppeteer = require("puppeteer");
const { ensureChrome } = require("../utils/ensureChrome");
const path = require("path");
const fs = require("fs");

let cityTranslations = {};
let countryTranslations = {};
try {
  const arTranslations = require("../../client/src/i18n/locales/ar/translation.json");
  cityTranslations = arTranslations?.countryPage?.cities || {};
  countryTranslations = {
    ...(arTranslations?.countryPage?.countryNames || {}),
    ...(arTranslations?.publicHotelPage?.countries || {}),
  };
} catch (err) {
  console.warn("⚠️ Arabic city translations not found:", err.message);
}

const translateCityName = (city) => {
  if (!city || typeof city !== "string") return city || "";
  return cityTranslations[city] || city;
};

const translateCountryName = (country) => {
  if (!country || typeof country !== "string") return country || "";
  return countryTranslations[country] || country;
};

const translateCityList = (cities) => {
  if (!Array.isArray(cities)) return [];
  return cities.map((city) => translateCityName(city));
};

class BookingPdfServiceArabic {
  /**
   * Generate booking PDF
   */
  static async generateBookingPDF(bookingId, user, options = {}) {
    let browser;
    try {
      console.log("🖨️ Starting PDF generation for booking...");

      // Extract options
      const { hideHeader = false, hidePrice = false } = options;

      // Ensure Chrome is installed
      await ensureChrome();

      // Fetch booking with populated data
      const booking = await Booking.findById(bookingId)
        .populate(
          "selectedTours",
          "name city images duration tourType description highlights translations"
        )
        .populate({
          path: "dailyItinerary.tourInfo.tourId",
          select: "name city tourType price vipCarType carCapacity duration highlights description detailedDescription policies images translations",
        })
        .populate("createdBy", "username")
        .lean();

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Fetch hotel data (including images) for all hotel entries to ensure we have complete data
      if (booking.hotelEntries && booking.hotelEntries.length > 0) {
        for (const hotelEntry of booking.hotelEntries) {
          if (hotelEntry.hotelId) {
            try {
              const hotel = await Hotel.findById(hotelEntry.hotelId)
                .select(
                  "name city country stars images roomTypes description translations"
                )
                .lean();
              if (hotel) {
                // Merge hotel data, prioritizing fetched data for images
                if (!hotelEntry.hotelData) {
                  hotelEntry.hotelData = {};
                }
                // Always update images from the Hotel model to ensure we have them
                if (
                  hotel.images &&
                  Array.isArray(hotel.images) &&
                  hotel.images.length > 0
                ) {
                  hotelEntry.hotelData.images = hotel.images;
                  console.log(
                    `✅ Fetched ${hotel.images.length} images for hotel ${hotel.name}`
                  );
                } else if (
                  !hotelEntry.hotelData.images ||
                  hotelEntry.hotelData.images.length === 0
                ) {
                  console.log(
                    `⚠️ No images found for hotel ${
                      hotel.name || hotelEntry.hotelId
                    }`
                  );
                }
                // Update other fields if missing
                if (!hotelEntry.hotelData.name)
                  hotelEntry.hotelData.name = hotel.name;
                if (!hotelEntry.hotelData.city)
                  hotelEntry.hotelData.city = hotel.city;
                if (!hotelEntry.hotelData.country)
                  hotelEntry.hotelData.country = hotel.country;
                if (!hotelEntry.hotelData.stars)
                  hotelEntry.hotelData.stars = hotel.stars;
                if (!hotelEntry.hotelData.description)
                  hotelEntry.hotelData.description = hotel.description;
                if (!hotelEntry.hotelData.translations)
                  hotelEntry.hotelData.translations = hotel.translations;
                // Update roomTypes if missing (needed for room images)
                if (
                  !hotelEntry.hotelData.roomTypes ||
                  hotelEntry.hotelData.roomTypes.length === 0
                ) {
                  hotelEntry.hotelData.roomTypes = hotel.roomTypes || [];
                }
              } else {
                console.log(`⚠️ Hotel not found for ID: ${hotelEntry.hotelId}`);
              }
            } catch (err) {
              console.error(
                `❌ Error fetching hotel data for ${hotelEntry.hotelId}:`,
                err
              );
            }
          }
        }
      }

      // Launch browser with production-ready options
      const launchOptions = {
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
        ],
        timeout: 180000,
      };

      try {
        browser = await puppeteer.launch(launchOptions);
        console.log("✅ Puppeteer browser launched successfully");
      } catch (launchError) {
        console.error(
          "❌ Primary launch failed, trying fallback:",
          launchError.message
        );
        browser = await puppeteer.launch({
          headless: "new",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      }

      const page = await browser.newPage();

      // Generate HTML content
      const airports = await Airport.find({}, "name arabicName").lean();
      const airportArabicMap = new Map();
      airports.forEach((airport) => {
        if (!airport?.name) return;
        airportArabicMap.set(
          airport.name.trim().toLowerCase(),
          airport.arabicName || airport.name
        );
      });

      const htmlContent = this.getBookingHtmlTemplate(
        booking,
        user,
        airportArabicMap,
        { hideHeader, hidePrice }
      );

      // Set content
      await page.setContent(htmlContent, {
        waitUntil: ["domcontentloaded", "networkidle2"],
        timeout: 90000,
      });

      // Generate PDF
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: "1cm",
          bottom: "1cm",
          left: "1cm",
          right: "1cm",
        },
        displayHeaderFooter: true,
        headerTemplate: `<div></div>`,
        footerTemplate: `
                    <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0; padding: 0;">
                        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                    </div>
                `,
        timeout: 90000,
      });

      console.log("✅ PDF generated successfully");
      return pdf;
    } catch (error) {
      console.error("❌ Error generating booking PDF:", error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.error("Error closing browser:", closeError);
        }
      }
    }
  }

  /**
   * Get HTML template for booking PDF
   */
  static getBookingHtmlTemplate(booking, user, airportArabicMap = new Map(), options = {}) {
    const { hideHeader = false, hidePrice = false } = options;
    // Load and convert logo to base64
    let logoBase64 = "";
    try {
      const logoPath = path.join(__dirname, "../../client/dist/Logolight.png");
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      }
    } catch (err) {
      console.error("Error loading logo:", err);
    }

    const formatDate = (date) => {
      if (!date) return "N/A";
      const d = new Date(date);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Format date as dd/mm/yyyy for package overview
    const formatDateDDMMYYYY = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const translatedSelectedCities = translateCityList(
      booking.selectedCities || []
    );

    // Country code mapping (for flag images)
    const countryCodes = {
      Turkey: "TR",
      Malaysia: "MY",
      Thailand: "TH",
      Indonesia: "ID",
      "Saudi Arabia": "SA",
      Morocco: "MA",
      Egypt: "EG",
      Azerbaijan: "AZ",
      Georgia: "GE",
      Albania: "AL",
      "United Arab Emirates": "AE",
    };

    // Get country from city
    const getCountryFromCity = (city) => {
      const countryCitiesMap = {
        Turkey: [
          "Istanbul",
          "Ankara",
          "Izmir",
          "Antalya",
          "Bodrum",
          "Bursa",
          "Cappadocia",
          "Fethiye",
          "Marmaris",
          "Kusadasi",
          "Pamukkale",
          "Trabzon",
          "Gaziantep",
          "Sanliurfa",
          "Mardin",
          "Van",
          "Kars",
          "Erzurum",
        ],
        Malaysia: [
          "Kuala Lumpur",
          "Penang",
          "Langkawi",
          "Malacca",
          "Johor Bahru",
        ],
        Thailand: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Krabi"],
        Indonesia: ["Jakarta", "Bali", "Yogyakarta", "Bandung", "Surabaya"],
        "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"],
        Morocco: ["Casablanca", "Marrakech", "Fes", "Rabat", "Tangier"],
        Egypt: ["Cairo", "Alexandria", "Luxor", "Aswan", "Sharm El Sheikh"],
        Azerbaijan: ["Baku", "Ganja", "Sumqayit"],
        Georgia: ["Tbilisi", "Batumi", "Kutaisi"],
        Albania: [
          "Tirana",
          "Durres",
          "Shkodra",
          "Fier",
          "Korce",
          "Berat",
          "Gjirokaster",
          "Sarande",
          "Kruje",
        ],
        "United Arab Emirates": [
          "Dubai",
          "Abu Dhabi",
          "Sharjah",
          "Ajman",
          "Ras Al Khaimah",
          "Fujairah",
          "Umm Al Quwain",
          "Al Ain",
        ],
      };

      for (const [country, cities] of Object.entries(countryCitiesMap)) {
        if (cities.includes(city)) {
          return country;
        }
      }
      return "Turkey"; // Default fallback
    };

    // Get unique countries from selected cities
    const getCountriesFromCities = (cities) => {
      if (!cities || !Array.isArray(cities)) return [];
      const countries = [
        ...new Set(cities.map((city) => getCountryFromCity(city))),
      ];
      return countries;
    };

    // Generate flag images HTML from countries
    const getFlagsFromCountries = (countries) => {
      if (!countries || countries.length === 0) return "";
      const flagImages = countries
        .map((country) => {
          const code = countryCodes[country];
          if (!code) return "";
          return `<img src="https://flagcdn.com/w40/${code.toLowerCase()}.png" alt="${country}" style="width: 36px; height: 24px; vertical-align: middle; margin: 4px 4px 0 4px; border: 1px solid #e5e7eb; border-radius: 4px; display: inline-block;" />`;
        })
        .filter((img) => img !== "");
      return flagImages.join(" ");
    };

    const getLocalizedHotelDescription = (hotel) => {
      const translated = hotel?.translations?.description?.ar;
      if (translated && translated.trim().length > 0) {
        return translated;
      }
      return hotel?.description || "";
    };

    const getLocalizedTourName = (tour) => {
      const translated = tour?.translations?.name?.ar;
      if (translated && translated.trim().length > 0) {
        return translated;
      }
      return tour?.name || "N/A";
    };

    const getLocalizedTourDescription = (tour) => {
      const translated = tour?.translations?.description?.ar;
      if (translated && translated.trim().length > 0) {
        return translated;
      }
      return tour?.description || "";
    };

    const getLocalizedTourHighlights = (tour, limit = 4) => {
      if (!tour || !Array.isArray(tour.highlights)) return [];
      const highlights = tour.highlights.slice(0, limit);
      return highlights.map((highlight, index) => {
        const translated =
          tour.translations?.highlights &&
          tour.translations.highlights[index] &&
          tour.translations.highlights[index].ar
            ? tour.translations.highlights[index].ar
            : "";
        return translated && translated.trim().length > 0
          ? translated
          : highlight;
      });
    };

    const translateTourType = (tourType) => {
      if (!tourType || typeof tourType !== "string") return "";
      const lower = tourType.toLowerCase();
      if (lower.includes("vip") || lower.includes("private"))
        return "جولة خاصة";
      if (lower.includes("group")) return "جولة جماعية";
      return tourType;
    };

    const getVehicleTextArabic = (vehicleType) => {
      const type = (vehicleType || "Vito").toLowerCase();
      if (type === "sprinter") return "بسيارة سبرينتر خاصة";
      if (type === "bus") return "بباص خاص";
      return "بسيارة فيتو خاصة";
    };

    const getAirportArabicName = (airportName) => {
      if (!airportName || typeof airportName !== "string") return "المطار";
      const normalized = airportName.trim().toLowerCase();

      if (airportArabicMap && airportArabicMap.has(normalized)) {
        return airportArabicMap.get(normalized);
      }

      if (airportArabicMap && airportArabicMap.size > 0) {
        const match = Array.from(airportArabicMap.entries()).find(([key]) =>
          normalized.includes(key)
        );
        if (match) return match[1];
      }

      const replaced = airportName.replace(/airport/gi, "مطار").trim();
      if (!replaced) return "المطار";
      if (replaced.startsWith("مطار")) return replaced;
      return `مطار ${replaced}`;
    };

    // Generate transportation text
    const generateTransportationText = () => {
      if (!booking.hotelEntries || booking.hotelEntries.length === 0) return "";

      const transportationLines = [];

      booking.hotelEntries.forEach((entry) => {
        const hotelData = entry.hotelData;
        if (!hotelData) return;
        const hotelName = hotelData.name || "الفندق";

        const includeReception =
          typeof entry.includeReception === "boolean"
            ? entry.includeReception
            : false;
        const includeFarewell =
          typeof entry.includeFarewell === "boolean"
            ? entry.includeFarewell
            : false;
        const transportVehicleType = entry.transportVehicleType || "Vito";
        const airportName = getAirportArabicName(
          entry.selectedAirport || hotelData.airport || "المطار"
        );

        const vehicleText = getVehicleTextArabic(transportVehicleType);

        if (includeReception && includeFarewell) {
          transportationLines.push(
            `استقبال وتوديع بين ${airportName} وفندق ${hotelName} ${vehicleText}`
          );
        } else {
          if (includeReception) {
            transportationLines.push(
              `الاستقبال من ${airportName} إلى فندق ${hotelName} ${vehicleText}`
            );
          }

          if (includeFarewell) {
            transportationLines.push(
              `التوديع إلى ${airportName} من فندق ${hotelName} ${vehicleText}`
            );
          }
        }
      });

      return transportationLines.length > 0
        ? transportationLines.map((line) => `• ${line}`).join("<br>")
        : "";
    };

    // Get primary image helper
    const getPrimaryImage = (images) => {
      if (!images || !Array.isArray(images)) return null;
      const primary = images.find((img) => img.isPrimary);
      return primary || images[0] || null;
    };

    // Get room primary image helper
    const getRoomPrimaryImage = (roomTypes, roomTypeIndex) => {
      if (!roomTypes || !Array.isArray(roomTypes) || !roomTypeIndex)
        return null;
      const roomType = roomTypes[parseInt(roomTypeIndex)];
      if (!roomType || !roomType.images) return null;
      const primary = roomType.images.find((img) => img.isPrimary);
      return primary || roomType.images[0] || null;
    };

    const translateRoomType = (roomType) => {
      if (!roomType || typeof roomType !== "string") return "غرفة";
      const type = roomType.toLowerCase();
      if (type.includes("single")) return "غرفة مفردة";
      if (type.includes("double") || type.includes("queen"))
        return "غرفة مزدوجة";
      if (type.includes("twin")) return "غرفة بسريرين منفصلين";
      if (type.includes("triple")) return "غرفة ثلاثية";
      if (type.includes("family")) return "جناح عائلي";
      if (type.includes("suite")) return "جناح";
      return roomType;
    };

    // Organize itinerary by day (using dailyItinerary if available, fallback to selectedTours)
    const itineraryDays = [];
    
    if (booking.dailyItinerary && Array.isArray(booking.dailyItinerary) && booking.dailyItinerary.length > 0) {
      // Use new dailyItinerary structure
      booking.dailyItinerary.forEach((day) => {
        itineraryDays.push({
          day: day.day,
          title: day.title || `اليوم ${day.day}`,
          description: day.description || "",
          activities: day.activities || [],
          isArrivalDay: day.isArrivalDay || false,
          isDepartureDay: day.isDepartureDay || false,
          isRestDay: day.isRestDay || false,
          tourInfo: day.tourInfo,
          images: day.images || [],
          translations: day.translations || {},
        });
      });
    } else if (booking.selectedTours && Array.isArray(booking.selectedTours)) {
      // Fallback to old selectedTours structure
      booking.selectedTours.forEach((tour, index) => {
        const dayNumber = index + 1;
        itineraryDays.push({
          day: dayNumber,
          title: getLocalizedTourName(tour) || `اليوم ${dayNumber}`,
          description: getLocalizedTourDescription(tour) || "",
          activities: [],
          isArrivalDay: false,
          isDepartureDay: false,
          isRestDay: false,
          tourInfo: { tourId: tour },
          images: tour.images || [],
          translations: {},
        });
      });
    }
    
    // Keep toursByDay for backward compatibility (will be removed in HTML generation)
    const toursByDay = itineraryDays;

    // Calculate total children
    const totalChildren =
      (booking.childrenUnder3 || 0) +
      (booking.children3to6 || 0) +
      (booking.children6to12 || 0);

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Booking Details - ${booking.clientName || "Booking"}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Jost:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Cairo', 'Jost', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            padding: 20px;
            color: #111827;
            font-size: 11px;
            background: #ffffff;
            direction: rtl;
            text-align: right;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 3px solid #1e3a8a;
            direction: ltr;
        }
        .header-left {
            flex: 1;
            text-align: left;
        }
        .brand-name {
            font-size: 24px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .report-title {
            font-size: 14px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 4px;
        }
        .logo-img {
            max-width: 120px;
            height: auto;
            margin-left: 16px;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.08;
            z-index: -1;
            width: 400px;
            height: auto;
            pointer-events: none;
        }
        .booking-overview {
            background: transparent;
            padding: 16px 0 32px;
            margin-bottom: 32px;
            border: none;
            direction: rtl;
            text-align: right;
        }
        .booking-overview-header {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 16px;
            display: block;
            text-align: right;
        }
        .package-title {
            font-size: 26px;
            font-weight: 800;
            color: #0b1220;
            text-align: right;
            margin-bottom: 6px;
            display: inline-flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 6px;
        }
        .package-name {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            position: relative;
            padding-bottom: 6px;
            direction: rtl;
            flex-direction: row;
            justify-content: flex-start;
        }
        .package-name img {
            width: 36px;
            height: 24px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            vertical-align: middle;
            display: inline-block;
        }
        .package-name::after {
            content: "";
            position: absolute;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #1e3a8a, #f59e0b);
            border-radius: 999px;
        }
        .booking-overview-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 32px;
            margin-bottom: 24px;
            justify-content: space-between;
        }
        .guest-information-section {
            margin-top: 20px;
        }
        .overview-section {
            display: flex;
            flex-direction: column;
            flex: 1 1 320px;
            min-width: 260px;
        }
        .overview-section-title {
            font-size: 12px;
            color: #1f2937;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            font-weight: 600;
            text-align: right;
        }
        .overview-section-content {
            font-size: 13px;
            color: #111827;
            line-height: 1.6;
            text-align: right;
        }
        .overview-detail-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            flex-direction: row;
            direction: rtl;
            justify-content: flex-start;
        }
        .overview-icon {
            font-size: 14px;
            width: 20px;
            text-align: center;
        }
        .overview-text {
            font-size: 13px;
            color: #1f2937;
        }
        .overview-includes {
            background: rgba(249, 250, 251, 0.5);
            border-right: 4px solid #1e3a8a;
            padding: 12px 16px;
            margin-top: 16px;
            border-radius: 4px;
            text-align: right;
        }
        .overview-includes-title {
            font-size: 13px;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 8px;
        }
        .overview-includes-list {
            font-size: 11px;
            color: #374151;
            line-height: 1.8;
        }
        .overview-includes-item {
            margin-bottom: 4px;
        }
        .section-title {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 24px 0 12px;
            padding-bottom: 8px;
            border-bottom: 3px solid #fcd34d;
            page-break-after: avoid;
            break-after: avoid;
        }
        .tours-section-title {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 24px 0 12px;
            padding-bottom: 8px;
            border-bottom: 3px solid #fcd34d;
            page-break-before: always;
            break-before: page;
            page-break-after: avoid;
            break-after: avoid;
        }
        .hotel-section {
            margin-bottom: 40px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .hotel-section + .hotel-section {
            page-break-before: always;
            break-before: page;
        }
        .hotel-header {
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: flex-start;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .hotel-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 4px;
            flex-shrink: 0;
        }
        .hotel-details {
            flex: 1;
        }
        .hotel-name {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
        }
        .hotel-location {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        .hotel-dates {
            font-size: 13px;
            color: #374151;
        }
        .hotel-description {
            font-size: 13px;
            color: #374151;
            line-height: 1.55;
            margin-top: 6px;
            margin-bottom: 6px;
            display: -webkit-box;
            -webkit-line-clamp: 6;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .room-section {
            margin-top: 6px;
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-before: avoid;
            break-before: avoid;
        }
        .room-section.multiple-rooms {
            margin-top: 20px;
        }
        .room-title {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 18px;
        }
        .room-section.multiple-rooms .room-title {
            font-size: 16px;
            margin-bottom: 14px;
        }
        .room-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 24px;
        }
        .room-section.multiple-rooms .room-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 14px;
        }
        .room-item {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }
        .room-section.multiple-rooms .room-item {
            gap: 10px;
        }
        .room-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 4px;
        }
        .room-section.multiple-rooms .room-image {
            height: 130px;
        }
        .room-info {
            font-size: 12px;
            color: #374151;
        }
        .room-info strong {
            font-size: 13px;
        }
        .room-section.multiple-rooms .room-info {
            font-size: 11px;
        }
        .room-section.multiple-rooms .room-info strong {
            font-size: 12px;
        }
        .tour-section {
            margin-bottom: 18px;
            page-break-inside: avoid;
            background: rgba(255, 255, 255, 0.3);
            border: 1px solid rgba(148, 163, 184, 0.15);
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
        }
        .tour-day-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 14px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: #0f172a;
            background: linear-gradient(90deg, #e0f2fe, #dbeafe);
            border: 1px solid #bfdbfe;
            border-radius: 999px;
            margin-bottom: 14px;
        }
        .tour-header {
            display: flex;
            gap: 16px;
            align-items: center;
            border-top: 1px solid #f3f4f6;
            padding-top: 8px;
        }
        .tour-image {
            width: 250px;
            height: 210px;
            object-fit: cover;
            border-radius: 4px;
            flex-shrink: 0;
        }
        .tour-details {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .tour-name {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
        }
        .tour-summary {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            font-size: 11px;
            color: #475467;
        }
        .tour-summary span {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .tour-summary-icon {
            width: 10px;
            height: 10px;
            display: inline-block;
        }
        .tour-description {
            font-size: 12px;
            color: #374151;
            line-height: 1.5;
        }
        .tour-highlights {
            margin-top: 8px;
        }
        .highlights-title {
            font-size: 13px;
            font-weight: 700;
            color: #a16207;
            margin-bottom: 8px;
        }
        .highlights-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
        }
        .highlight-item {
            font-size: 10px;
            color: #374151;
            line-height: 1.4;
            display: flex;
            align-items: baseline;
            gap: 5px;
        }
        .highlight-icon {
            color: #F59E0B;
            font-size: 11px;
            line-height: 1.4;
            flex-shrink: 0;
        }
        .price-section {
            background: #fef3c7;
            border: 2px solid #fbbf24;
            border-radius: 8px;
            padding: 16px;
            margin-top: 24px;
            text-align: center;
        }
        .price-label {
            font-size: 11px;
            color: #92400e;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .price-value {
            font-size: 24px;
            font-weight: 800;
            color: #78350f;
        }
        @media print {
            body { padding: 10px; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    ${
      !hideHeader && logoBase64
        ? `<img src="${logoBase64}" class="watermark" alt="Watermark" />`
        : ""
    }
    
    ${
      !hideHeader
        ? `<div class="header">
        <div class="header-left">
            <div class="brand-name">Rahalatek Travel</div>
            <div class="report-title">تفاصيل الحجز</div>
        </div>
        ${
          logoBase64
            ? `<img src="${logoBase64}" class="logo-img" alt="Rahalatek Logo" />`
            : ""
        }
    </div>`
        : ""
    }
    
    <!-- Booking Overview Section -->
    <div class="booking-overview">
        <div class="booking-overview-header">
            ${(() => {
              const countries = getCountriesFromCities(
                booking.selectedCities || []
              );
              const flagIcons = getFlagsFromCountries(countries);
              const citiesString =
                translatedSelectedCities.length > 0
                  ? translatedSelectedCities.join(" و ")
                  : "مخصص";
              return `
                <div class="package-title">
                    <div class="package-name">
                        <span>باقة ${citiesString}</span>
                        ${flagIcons || ""}
                    </div>
                </div>
              `;
            })()}
        </div>
        
        <div class="booking-overview-grid">
            <!-- Client Information -->
            <div class="overview-section">
                <div class="overview-section-title">معلومات العميل</div>
                <div class="overview-section-content">
                    <div class="overview-detail-row">
                        <span class="overview-text"><strong>اسم العميل:</strong> ${
                          booking.clientName || "N/A"
                        }</span>
                    </div>
                    <div class="overview-detail-row">
                        <span class="overview-text"><strong>الجنسية:</strong> ${
                          booking.nationality || "N/A"
                        }</span>
                    </div>
                    <div class="overview-detail-row">
                        <span class="overview-text"><strong>المدن:</strong> ${
                          translatedSelectedCities.join("، ") || "غير متوفر"
                        }</span>
                    </div>
                </div>
            </div>

            <!-- Travel Dates & Duration -->
            <div class="overview-section">
                <div class="overview-section-title">تفاصيل الرحلة</div>
                <div class="overview-section-content">
                    <div class="overview-detail-row">
                        <span class="overview-icon">🗓</span>
                        <span class="overview-text">من ${formatDateDDMMYYYY(
                          booking.startDate
                        )} إلى ${formatDateDDMMYYYY(booking.endDate)}</span>
                    </div>
                    <div class="overview-detail-row">
                        <span class="overview-icon">⏰</span>
                        <span class="overview-text">المدة: ${
                          booking.nights || 0
                        } ليلة</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Guest Information - Separate Line -->
        <div class="guest-information-section">
            <div class="overview-section">
                <div class="overview-section-title">معلومات الضيوف</div>
                <div class="overview-section-content">
                    <div class="overview-detail-row">
                        <span class="overview-icon">👥</span>
                        <span class="overview-text">
                            عدد البالغين: ${booking.numGuests || 0}
                            ${
                              totalChildren > 0
                                ? ` و عدد الأطفال: ${totalChildren}`
                                : ""
                            }
                        </span>
                    </div>
                    ${
                      booking.includeChildren && totalChildren > 0
                        ? `
                    <div style="margin-top: 8px; font-size: 11px; color: #1f2937; line-height: 1.6;">
                        ${
                          booking.childrenUnder3 > 0
                            ? `• ${booking.childrenUnder3} طفل من عمر 0 إلى 3 سنوات (مجاني في الجولات)<br>`
                            : ""
                        }
                        ${
                          booking.children3to6 > 0
                            ? `• ${booking.children3to6} طفل من عمر 3 إلى 6 سنوات (إقامة مجانية)<br>`
                            : ""
                        }
                        ${
                          booking.children6to12 > 0
                            ? `• ${booking.children6to12} طفل من عمر 6 إلى 12 سنة (سعر خاص)`
                            : ""
                        }
                    </div>
                    `
                        : ""
                    }
                    ${
                      !hidePrice
                        ? `<div class="overview-detail-row" style="margin-top: 8px;">
                        <span class="overview-icon">💵</span>
                        <span class="overview-text"><strong>سعر الباقة: $${
                          booking.finalPrice?.toFixed(2) || "0.00"
                        }</strong></span>
                    </div>`
                        : ""
                    }
                </div>
            </div>
        </div>

        <!-- Includes Section -->
        ${(() => {
          const transportText = generateTransportationText();
          return transportText
            ? `
        <div class="overview-includes">
            <div class="overview-includes-title">تشمل الباقة:</div>
            <div class="overview-includes-list">
                ${transportText
                  .split("<br>")
                  .map(
                    (line) =>
                      `<div class="overview-includes-item">${line}</div>`
                  )
                  .join("")}
            </div>
        </div>
          `
            : "";
        })()}
    </div>

    <!-- Package Information Text -->
    <div style="margin: 24px 0;">
        <div style="font-size: 14px; color: #374151; line-height: 1.8; font-style: italic;">
            تم إعداد هذه الباقة خصيصًا لكم. يمكن تعديل الجولات المختارة، كما سيتم إضافة أيام الراحة وخدمات الاستقبال والتوديع وفقًا لاحتياجاتكم. بمجرد الموافقة على هذه الباقة سيتم تأكيد الحجز وإرسال قسيمة تفصيلية لكم. نتطلع إلى تزويدكم بتجربة سفر لا تُنسى، وشكرًا لاختياركم رحلاتك.
        </div>
    </div>

    <!-- Hotels Section -->
    ${
      booking.hotelEntries && booking.hotelEntries.length > 0
        ? `
        <div class="section-title">الفنادق</div>
    ${booking.hotelEntries
      .map((hotelEntry, index) => {
        const hotel = hotelEntry.hotelData;
        if (!hotel) return "";

        const hotelPrimaryImage = getPrimaryImage(hotel.images);
        const hotelImageUrl = hotelPrimaryImage?.url || "";

        const hotelCity = translateCityName(hotel.city);
        const hotelCountry = translateCountryName(hotel.country);
        const hotelLocation = [hotelCity, hotelCountry]
          .filter(Boolean)
          .join("، ");
        return `
        <div class="hotel-section">
            <div class="hotel-header">
                ${
                  hotelImageUrl
                    ? `<img src="${hotelImageUrl}" class="hotel-image" alt="${hotel.name}" />`
                    : ""
                }
                <div class="hotel-details">
                    <div class="hotel-name">${hotel.name || "N/A"} ${
          hotel.stars
            ? `<span style="color: #F59E0B;">${"★".repeat(hotel.stars)}</span>`
            : ""
        }</div>
                    <div class="hotel-location">${hotelLocation}</div>
                    <div class="hotel-dates">
                        تسجيل الوصول: ${formatDate(
                          hotelEntry.checkIn
                        )} | تسجيل المغادرة: ${formatDate(hotelEntry.checkOut)}
                        ${hotelEntry.includeBreakfast ? " | يشمل الإفطار" : ""}
                    </div>
                    ${
                      getLocalizedHotelDescription(hotel)
                        ? `<div class="hotel-description">${getLocalizedHotelDescription(
                            hotel
                          )}</div>`
                        : ""
                    }
                </div>
            </div>
            
            ${
              hotelEntry.roomAllocations &&
              hotelEntry.roomAllocations.length > 0
                ? `
          <div class="room-section${
            hotelEntry.roomAllocations.length > 2 ? " multiple-rooms" : ""
          }">
              <div class="room-title">تفاصيل الغرف</div>
              <div class="room-grid">
                    ${hotelEntry.roomAllocations
                      .map((roomAlloc) => {
                        const roomType =
                          hotel.roomTypes &&
                          hotel.roomTypes[parseInt(roomAlloc.roomTypeIndex)];
                        if (!roomType) return "";

                        const roomPrimaryImage = getRoomPrimaryImage(
                          hotel.roomTypes,
                          roomAlloc.roomTypeIndex
                        );
                        const roomImageUrl = roomPrimaryImage?.url || "";

                        return `
                        <div class="room-item">
                            ${
                              roomImageUrl
                                ? `<img src="${roomImageUrl}" class="room-image" alt="${
                                    roomType.type || "Room"
                                  }" />`
                                : ""
                            }
                        <div class="room-info">
                                <strong>${translateRoomType(
                                  roomType.type || "Room"
                                )}</strong><br>
                                عدد البالغين: ${roomAlloc.occupants || 0}
                                ${
                                  roomAlloc.childrenUnder3 > 0
                                    ? `<br>${roomAlloc.childrenUnder3} طفل من عمر 0 إلى 3 سنوات`
                                    : ""
                                }
                                ${
                                  roomAlloc.children3to6 > 0
                                    ? `<br>${roomAlloc.children3to6} طفل من عمر 3 إلى 6 سنوات`
                                    : ""
                                }
                                ${
                                  roomAlloc.children6to12 > 0
                                    ? `<br>${roomAlloc.children6to12} طفل من عمر 6 إلى 12 سنة`
                                    : ""
                                }
                            </div>
                        </div>
                      `;
                      })
                      .join("")}
                </div>
            </div>
            `
                : ""
            }
        </div>
      `;
      })
      .join("")}
    `
        : ""
    }

    <!-- Daily Itinerary Section -->
    ${
      itineraryDays.length > 0
        ? `
    <div class="tours-section-title">البرنامج اليومي</div>
    ${itineraryDays
      .map((dayItem) => {
        // Get the primary image for this day
        let dayImageUrl = "";
        if (dayItem.images && dayItem.images.length > 0) {
          const primaryImage = dayItem.images.find(img => img.url);
          dayImageUrl = primaryImage?.url || dayItem.images[0]?.url || "";
        }
        
        // For tour days, get tour data
        let tour = null;
        if (dayItem.tourInfo && dayItem.tourInfo.tourId) {
          tour = typeof dayItem.tourInfo.tourId === 'object' 
            ? dayItem.tourInfo.tourId 
            : null;
          
          // If tour exists, use tour image if no day image
          if (tour && !dayImageUrl && tour.images && tour.images.length > 0) {
            const tourPrimaryImage = getPrimaryImage(tour.images);
            dayImageUrl = tourPrimaryImage?.url || "";
          }
        }

        // Get title and description with Arabic translations
        let dayTitle = (dayItem.translations?.title?.ar && dayItem.translations.title.ar.trim()) 
          ? dayItem.translations.title.ar 
          : dayItem.title || `اليوم ${dayItem.day}`;
        
        // Remove "Day X:" or "اليوم X:" prefix from title if it exists
        dayTitle = dayTitle.replace(/^(Day\s*\d+\s*:?\s*|اليوم\s*\d+\s*:?\s*)/i, '').trim();
        
        // For tour days, prioritize tour's Arabic description and highlights
        // For static days, use day's Arabic translations
        let finalDescription = "";
        let finalActivities = [];
        
        if (tour) {
          // Tour day - use tour's Arabic translations
          finalDescription = getLocalizedTourDescription(tour);
          finalActivities = getLocalizedTourHighlights(tour).slice(0, 4);
        } else {
          // Static day (arrival, departure, rest) - use day's Arabic translations
          finalDescription = (dayItem.translations?.description?.ar && dayItem.translations.description.ar.trim())
            ? dayItem.translations.description.ar
            : dayItem.description || "";
          
          finalActivities = dayItem.activities && dayItem.activities.length > 0
            ? dayItem.activities.slice(0, 4).map((activity, index) => {
                if (dayItem.translations?.activities && dayItem.translations.activities[index]?.ar) {
                  return dayItem.translations.activities[index].ar;
                }
                return activity;
              })
            : [];
        }
        const translatedTourCity = tour ? translateCityName(tour.city) : "";
        const translatedTourType = tour ? translateTourType(tour.tourType) : "";

        return `
        <div class="tour-section">
            <div class="tour-day-badge">اليوم ${dayItem.day}</div>
            <div class="tour-header">
                <div class="tour-details">
                    <div class="tour-name">${tour ? getLocalizedTourName(tour) : dayTitle}</div>
                    ${
                      tour
                        ? `<div class="tour-summary">
                            <span>📍 ${translatedTourCity || "N/A"}</span>
                            ${
                              translatedTourType
                                ? `<span>
                                    <span class="tour-summary-icon">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 7h16v10H4z" fill="#2563eb" opacity="0.12"/>
                                            <path d="M4 7h16v10H4z" stroke="#2563eb" stroke-width="1.2" stroke-linejoin="round"/>
                                            <path d="M8 7v10M16 7v10" stroke="#2563eb" stroke-width="1.2"/>
                                            <path d="M7 9h2M7 11h2M7 13h2M7 15h2" stroke="#2563eb" stroke-width="1.2" stroke-linecap="round"/>
                                            <path d="M15 9h2M15 11h2M15 13h2M15 15h2" stroke="#2563eb" stroke-width="1.2" stroke-linecap="round"/>
                                        </svg>
                                    </span>
                                    ${translatedTourType}
                                </span>`
                                : ""
                            }
                            <span>
                                <span class="tour-summary-icon">
                                    <svg width="10" height="10" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.4c-3.53 0-6.4-2.87-6.4-6.4S6.47 3.6 10 3.6s6.4 2.87 6.4 6.4-2.87 6.4-6.4 6.4z" fill="#f59e0b"/>
                                        <path d="M10.8 6H9.2v5.2l4.55 2.73.8-1.31-3.75-2.22V6z" fill="#f59e0b"/>
                                    </svg>
                                </span>
                                ${tour.duration || "N/A"} ساعات
                            </span>
                        </div>`
                        : ""
                    }
                    ${
                      finalDescription
                        ? `<div class="tour-description">${finalDescription}</div>`
                        : ""
                    }
                    ${
                      finalActivities.length > 0
                        ? `
                    <div class="tour-highlights">
                        <div class="highlights-title">${tour ? 'أبرز المميزات' : 'الأنشطة'}</div>
                        <div class="highlights-list">
                            ${finalActivities
                              .map(
                                (activity) => `
                            <div class="highlight-item">
                                <span class="highlight-icon">★</span>
                                <span>${activity}</span>
                            </div>
                            `
                              )
                              .join("")}
                        </div>
                    </div>
                    `
                        : ""
                    }
                </div>
                ${
                  dayImageUrl
                    ? `<img src="${dayImageUrl}" class="tour-image" alt="${dayTitle}" />`
                    : ""
                }
            </div>
        </div>
      `;
      })
      .join("")}
    `
        : ""
    }

</body>
</html>
    `;

    return html;
  }
}

module.exports = BookingPdfServiceArabic;

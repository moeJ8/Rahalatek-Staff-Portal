const Tour = require("../models/Tour");
const Hotel = require("../models/Hotel");

// Get all destinations with counts
exports.getDestinations = async (req, res) => {
  try {
    // Define all available countries
    const countries = [
      "Turkey",
      "Malaysia",
      "Thailand",
      "Indonesia",
      "Saudi Arabia",
      "Morocco",
      "Egypt",
      "Azerbaijan",
      "Georgia",
      "Albania",
      "United Arab Emirates",
    ];

    // Get tour and hotel counts for each country
    const destinations = await Promise.all(
      countries.map(async (country) => {
        const [tourCount, hotelCount] = await Promise.all([
          Tour.countDocuments({ country }),
          Hotel.countDocuments({ country }),
        ]);

        // Country code mapping for flags
        const countryCodeMap = {
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

        // Sample images for each country (you can replace with actual images)
        const countryImages = {
          Turkey:
            "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop",
          Malaysia:
            "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop",
          Thailand:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
          Indonesia:
            "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop",
          "Saudi Arabia":
            "https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=400&h=300&fit=crop",
          Morocco:
            "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop",
          Egypt:
            "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop",
          Azerbaijan:
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
          Georgia:
            "https://images.unsplash.com/photo-1576154421306-9ff4b57e4112?w=400&h=300&fit=crop",
          Albania:
            "https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop",
          "United Arab Emirates":
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
        };

        return {
          name: country,
          code: countryCodeMap[country],
          image: countryImages[country],
          tourCount,
          hotelCount,
          totalCount: tourCount + hotelCount,
        };
      })
    );

    // Filter out countries with no tours or hotels and sort by total count
    const activeDestinations = destinations
      .filter((dest) => dest.totalCount > 0)
      .sort((a, b) => b.totalCount - a.totalCount);

    res.json(activeDestinations);
  } catch (err) {
    console.error("Error fetching destinations:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get cities for a specific country
exports.getCitiesByCountry = async (req, res) => {
  try {
    const { country } = req.params;

    // Curated city images from Cloudinary and Unsplash
    const cityImages = {
      // Turkey - Cloudinary hosted
      Istanbul:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671115/istanbul_qjf5sz.jpg",
      Antalya:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671118/antalya_oj1lza.jpg",
      Cappadocia:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671112/cappadocia_znntj1.jpg",
      Trabzon:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/trabzon_l7xlva.jpg",
      Bodrum:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671110/bodrum_tmgojf.jpg",
      Fethiye:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/fethiye_loarta.jpg",
      Bursa:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/bursa_ujwxsb.jpg",

      // Malaysia
      "Kuala Lumpur":
        "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop&q=80",
      Penang:
        "https://images.unsplash.com/photo-1571200669781-0b701df0de68?w=400&h=300&fit=crop&q=80",
      Langkawi:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      Malacca:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80",
      "Johor Bahru":
        "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop&q=80",
      "Kota Kinabalu":
        "https://images.unsplash.com/photo-1596738012750-3707c22e4bb5?w=400&h=300&fit=crop&q=80",
      Kuching:
        "https://images.unsplash.com/photo-1586183778882-44e7b5c1e9a4?w=400&h=300&fit=crop&q=80",
      "Cameron Highlands":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/Tea_fields__Will_Ellis_gpprje.jpg",
      "Genting Highlands":
        "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=300&fit=crop&q=80",
      Selangor:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/istockphoto-587901290-612x612_iqytp8.jpg",

      // Thailand
      Bangkok:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762625637/pexels-jimmy-teoh-294331-2411747_an3jyt.jpg",
      Phuket:
        "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=300&fit=crop&q=80",
      Pattaya:
        "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop&q=80",
      "Chiang Mai":
        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop&q=80",
      Krabi:
        "https://images.unsplash.com/photo-1552550049-db097c9480d1?w=400&h=300&fit=crop&q=80",
      "Koh Samui":
        "https://images.unsplash.com/photo-1561461696-6e4b8bb1b3c1?w=400&h=300&fit=crop&q=80",
      "Hua Hin":
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80",
      Ayutthaya:
        "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&q=80",
      "Chiang Rai":
        "https://images.unsplash.com/photo-1598970605070-a9854a312e8f?w=400&h=300&fit=crop&q=80",
      Kanchanaburi:
        "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop&q=80",

      // Indonesia
      Jakarta:
        "https://images.unsplash.com/photo-1555980221-2b0f44fce7cf?w=400&h=300&fit=crop&q=80",
      Bali: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop&q=80",
      Yogyakarta:
        "https://images.unsplash.com/photo-1595435742656-5272d0d4080f?w=400&h=300&fit=crop&q=80",
      Bandung:
        "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=300&fit=crop&q=80",
      Surabaya:
        "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&h=300&fit=crop&q=80",
      Medan:
        "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=300&fit=crop&q=80",
      Lombok:
        "https://images.unsplash.com/photo-1517632287068-b1a5ba0fe8e6?w=400&h=300&fit=crop&q=80",
      Bogor:
        "https://images.unsplash.com/photo-1598968917050-0e6c7a39b5ab?w=400&h=300&fit=crop&q=80",
      Malang:
        "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=300&fit=crop&q=80",
      Solo: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=300&fit=crop&q=80",
      Ubud: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop&q=80",
      Sanur:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80",
      Seminyak:
        "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&fit=crop&q=80",

      // Saudi Arabia
      Riyadh:
        "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=400&h=300&fit=crop&q=80",
      Jeddah:
        "https://images.unsplash.com/photo-1591608971362-f08b2a75731a?w=400&h=300&fit=crop&q=80",
      Mecca:
        "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&h=300&fit=crop&q=80",
      Medina:
        "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=400&h=300&fit=crop&q=80",
      Dammam:
        "https://images.unsplash.com/photo-1574482620223-1b1d50e8bcc7?w=400&h=300&fit=crop&q=80",
      Khobar:
        "https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80",
      Taif: "https://images.unsplash.com/photo-1562004340-d513bc476c0d?w=400&h=300&fit=crop&q=80",
      Abha: "https://images.unsplash.com/photo-1595435742656-5272d0d4080f?w=400&h=300&fit=crop&q=80",
      Tabuk:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop&q=80",
      "Al Khobar":
        "https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80",

      // Morocco
      Casablanca:
        "https://images.unsplash.com/photo-1560725252-9eb432d3db01?w=400&h=300&fit=crop&q=80",
      Marrakech:
        "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop&q=80",
      Rabat:
        "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=300&fit=crop&q=80",
      Fez: "https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80",
      Tangier:
        "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&h=300&fit=crop&q=80",
      Agadir:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80",
      Meknes:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80",
      Essaouira:
        "https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80",
      Chefchaouen:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop&q=80",
      Ouarzazate:
        "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=300&fit=crop&q=80",

      // Egypt
      Cairo:
        "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=300&fit=crop&q=80",
      Alexandria:
        "https://images.unsplash.com/photo-1574482620223-1b1d50e8bcc7?w=400&h=300&fit=crop&q=80",
      Luxor:
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop&q=80",
      Aswan:
        "https://images.unsplash.com/photo-1550053267-13a2e6b3eac4?w=400&h=300&fit=crop&q=80",
      Hurghada:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      "Sharm El Sheikh":
        "https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80",
      Dahab:
        "https://images.unsplash.com/photo-1561461696-6e4b8bb1b3c1?w=400&h=300&fit=crop&q=80",
      "Marsa Alam":
        "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400&h=300&fit=crop&q=80",
      Taba: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400&h=300&fit=crop&q=80",
      Giza: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=400&h=300&fit=crop&q=80",

      // Azerbaijan
      Baku: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762627146/baku-2024-2025-_2555168725-scaled_rbkjut.jpg",
      Ganja:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80",
      Sumgayit:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80",
      Mingachevir:
        "https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80",
      Qabalah:
        "https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80",
      Shaki:
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop&q=80",
      Lankaran:
        "https://images.unsplash.com/photo-1567202417690-a21b4b2cf7b3?w=400&h=300&fit=crop&q=80",
      Shamakhi:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80",
      Quba: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762627477/quba-azerbaijan-region_bvwr6c.jpg",
      Gabala:
        "https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80",

      // Georgia
      Tbilisi:
        "https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&h=300&fit=crop&q=80",
      Batumi:
        "https://images.unsplash.com/photo-1576154421306-9ff4b57e4112?w=400&h=300&fit=crop&q=80",
      Kutaisi:
        "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop&q=80",
      Rustavi:
        "https://images.unsplash.com/photo-1574482620223-1b1d50e8bcc7?w=400&h=300&fit=crop&q=80",
      Zugdidi:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80",
      Gori: "https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80",
      Telavi:
        "https://images.unsplash.com/photo-1567202417690-a21b4b2cf7b3?w=400&h=300&fit=crop&q=80",
      Mestia:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      Kazbegi:
        "https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80",
      Sighnaghi:
        "https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80",
      Mtskheta:
        "https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80",
      Borjomi:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80",

      // Albania
      Tirana:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840858/Sunset-at-Grand-Park-of-Tiranas-Artificial-Lake-scaled_m83m3k.jpg",
      Durres:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80",
      Vlore:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/albania_16x9_b92fhb.avif",
      Shkoder:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/Shkodra-Scutari-Shkoder-Albania_gaxulo.jpg",
      Fier: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80",
      Korce:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80",
      Berat:
        "https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80",
      Gjirokaster:
        "https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80",
      Sarande:
        "https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80",
      Kruje:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80",

      // United Arab Emirates
      Dubai:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762608122/wael-hneini-QJKEa9n3yN8-unsplash_1_fkutga.jpg",
      "Abu Dhabi":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609331/pexels-kevinvillaruz-1660603_sahkhc.jpg",
      Sharjah:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762608918/vivek-vg-P9cDq28qd7Y-unsplash_hpxfgu.jpg",
      Ajman:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609161/pexels-mikhail-nilov-8319468_ofoptj.jpg",
      "Ras Al Khaimah":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609283/99875486_lpkcll.avif",
      Fujairah:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609484/Gray-Line-Fujairah-United-Arab-Emirates-Cover-Photo-scaled_dbceuh.jpg",
      "Umm Al Quwain":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609600/6ecd49e68f764212e8fdf002b958758d_1000x1000_lapl6w.png",
      "Al Ain":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609669/9WXMYN7x-Al-Ain-1_zmwdad.jpg",
      // Azerbaijan
      Baku: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762627146/baku-2024-2025-_2555168725-scaled_rbkjut.jpg",
      Ganja:
        "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&h=300&fit=crop&q=80",
      Sumgayit:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80",
      Mingachevir:
        "https://images.unsplash.com/photo-1563492065-4c9a4ed7c42d?w=400&h=300&fit=crop&q=80",
      Qabalah:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762626224/3.-Gabala_j9aqx5.jpg",
      Shaki:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762627550/0ce5ef85-75b1-441e-a6eb-6b24bfacc3f9_s2l6oy.jpg",
      Lankaran:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80",
      Shamakhi:
        "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&q=80",
      Quba: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762627477/quba-azerbaijan-region_bvwr6c.jpg",
      Gabala:
        "https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80",
      // Georgia
      Bakuriani:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617005/bakuriani-14_xtm3fv.jpg",
      Batumi:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617582/max-R68FdCxFOII-unsplash_ek7e7d.jpg",
      Tbilisi:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617644/pexels-rudy-kirchner-278171-2759804_yqsmbb.jpg",
      // Indonesia
      Puncak:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617061/pexels-saturnus99-28281932_vuyuq6.jpg",
      Sukabumi:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617127/pexels-willie-dt-715193875-18415669_zbza2f.jpg",
      Bali: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617283/pexels-freestockpro-2166553_rfypja.jpg",
      Jakarta:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617512/pexels-tomfisk-2116719_tgmwtd.jpg",
      Bandung:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617455/dkjlntyqcbcqwqlbmaf8_toohiq.jpg",
    };

    // Get unique cities from both tours and hotels for this country
    const [tourCities, hotelCities] = await Promise.all([
      Tour.distinct("city", { country }),
      Hotel.distinct("city", { country }),
    ]);

    // Combine and deduplicate cities
    const allCities = [...new Set([...tourCities, ...hotelCities])];

    // Sort alphabetically
    const sortedCities = allCities.sort();

    // Get counts for each city
    const citiesWithCounts = await Promise.all(
      sortedCities.map(async (city) => {
        const [tourCount, hotelCount] = await Promise.all([
          Tour.countDocuments({ country, city }),
          Hotel.countDocuments({ country, city }),
        ]);

        // Get curated Unsplash image for the city, or use a default
        const cityImage =
          cityImages[city] ||
          "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=300&fit=crop&q=80";

        return {
          name: city,
          image: cityImage,
          tourCount,
          hotelCount,
          totalCount: tourCount + hotelCount,
        };
      })
    );

    // Sort by total count (most popular first)
    citiesWithCounts.sort((a, b) => b.totalCount - a.totalCount);

    res.json({
      country,
      cities: citiesWithCounts,
      totalCities: citiesWithCounts.length,
    });
  } catch (err) {
    console.error("Error fetching cities for country:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get city details with description, history, and features
exports.getCityDetails = async (req, res) => {
  try {
    const { country, city } = req.params;

    // City data with tourism-focused descriptions and top attractions
    const cityData = {
      // ===== MALAYSIA ADDITIONS =====
      Selangor: {
        country: "Malaysia",
        description:
          "Selangor surrounds Kuala Lumpur and blends modern attractions with nature getaways. Visit Batu Caves, Sunway Lagoon theme park, i-City Shah Alam, and royal town Klang; explore mangrove fireflies in Kuala Selangor and coffee shops in Petaling Jaya. Easy access, great shopping, and family fun make Selangor a perfect base near KL.",
        touristicFeatures: [
          "Batu Caves - Iconic limestone cave temple with giant statue",
          "Sunway Lagoon - Waterpark, amusement rides, and wildlife experiences",
          "i-City Shah Alam - LED light city, Snowalk, and theme attractions",
          "Sultan Salahuddin Mosque - Blue Mosque with massive dome",
          "Kuala Selangor Fireflies - Night boat tours among glowing mangroves",
          "Sky Mirror - Photogenic reflective sandbar experiences",
          "Royal Klang Heritage Walk - Colonial architecture and food trail",
          "Forest Research Institute (FRIM) - Rainforest trails and canopy walk",
          "Petaling Jaya Cafes - Third-wave coffee and dining",
          "Mitsui Outlet Park & Paradigm Mall - Shopping near KLIA and PJ",
        ],
      },

      // ===== ALBANIA ADDITIONS =====
      Shkodra: {
        country: "Albania",
        description:
          "Shkodra (Shkodër) is Albania’s northern cultural hub between Lake Shkodra and the Albanian Alps. Explore Rozafa Castle, Venetian architecture, lakefront cycling, and nearby Theth and Valbona valleys. Bridges, museums, and authentic cuisine make Shkodra a perfect base for nature and history lovers.",
        touristicFeatures: [
          "Rozafa Castle - Hilltop fortress with panoramic views",
          "Lake Shkodra - Cycling paths, boat rides, and birdwatching",
          "Mesi Bridge - Historic Ottoman stone bridge",
          "Marubi National Museum of Photography - Heritage photo archive",
          "Theth & Valbona Valleys - Albanian Alps hiking gateways",
          "Venetian-style Architecture - Historic houses and streets",
          "Shkodra Cathedral & Lead Mosque - Religious heritage sites",
          "Lakefront Restaurants - Fresh fish and traditional cuisine",
          "Shiroka & Zogaj - Lakeside villages near Shkodra",
          "Cultural Events - Festivals and arts scene",
        ],
      },
      Vlora: {
        country: "Albania",
        description:
          "Vlora (Vlorë) is where the Adriatic meets the Ionian—gateway to the Albanian Riviera. Enjoy beaches, Lungomare promenade, Sazan Island boat trips, Karaburun Peninsula, and Independence Square. Great seafood, coastal hotels, and nearby beaches make Vlora a prime summer destination.",
        touristicFeatures: [
          "Lungomare Promenade - Waterfront walkway with cafes and beaches",
          "Zvernec Monastery - Island monastery connected by wooden bridge",
          "Karaburun-Sazan Marine Park - Boat tours and snorkeling",
          "Independence Monument - Historic square and museum",
          "Cold Water (Uji i Ftohte) - Scenic coastal lookout",
          "Radhime & Orikum - Nearby beaches and resorts",
          "Llogara Pass - Mountain road to Riviera with views",
          "Castle of Kanine - Hilltop ruins overlooking Vlora",
          "Boating & Sea Activities - Cruises and water sports",
          "Seafood Restaurants - Fresh catch and Mediterranean cuisine",
        ],
      },
      // ===== TURKEY =====
      Istanbul: {
        country: "Turkey",
        description:
          "Experience the magic where East meets West in Istanbul, the only city in the world spanning two continents. This magnificent metropolis offers an intoxicating blend of ancient history and modern sophistication. Start your days exploring Byzantine masterpieces like Hagia Sophia and the Blue Mosque, wander through the labyrinthine Grand Bazaar with its 4,000 shops, and marvel at the opulent Topkapi Palace where Ottoman sultans once ruled. Take a scenic Bosphorus cruise between Europe and Asia, watching waterfront palaces and fortresses glide by. As evening falls, head to Taksim Square and stroll down bustling Istiklal Avenue, lined with shops, restaurants, and historic tram. Enjoy rooftop bars with stunning skyline views, taste authentic Turkish cuisine from street vendors to Michelin-starred restaurants, and experience the legendary Turkish tea culture in charming cafés. Don't miss the mysterious Basilica Cistern, vibrant Spice Bazaar, contemporary art galleries in trendy Karaköy, and traditional hammam experiences. Whether you're shopping for handmade carpets, photographing breathtaking sunsets over the Golden Horn, or dancing in nightclubs until dawn, Istanbul delivers unforgettable memories at every turn. The city's warm hospitality, rich cultural tapestry, and perfect blend of tradition and modernity make it an essential destination for any traveler.",
        touristicFeatures: [
          "Hagia Sophia - Stunning Byzantine masterpiece with impressive dome and mosaics",
          "Blue Mosque - Magnificent Ottoman architecture with six soaring minarets",
          "Topkapi Palace - Imperial palace with Treasury, Harem, and Bosphorus views",
          "Grand Bazaar - 4,000 shops in world's oldest covered market",
          "Bosphorus Cruise - Scenic boat tour between Europe and Asia",
          "Galata Tower - 360° panoramic views of the city skyline",
          "Basilica Cistern - Atmospheric underground water palace",
          "Taksim Square & Istiklal Avenue - Shopping, dining, and nightlife hub",
          "Dolmabahce Palace - Opulent waterfront palace with crystal staircases",
          "Spice Bazaar - Aromatic market for Turkish delights and spices",
        ],
      },
      Antalya: {
        country: "Turkey",
        description:
          "Welcome to Antalya, the crown jewel of Turkey's Mediterranean coast and gateway to the Turkish Riviera. Blessed with over 300 days of sunshine annually, this stunning coastal paradise combines crystal-clear turquoise waters, pristine beaches, and dramatic Taurus Mountains backdrop. Begin your adventure in Kaleiçi, the charming Old Town, where Ottoman-era houses, boutique hotels, and authentic restaurants line narrow cobblestone streets leading to the ancient Roman harbor. Spend sun-soaked days lounging on world-famous beaches like Konyaaltı and Lara, where modern beach clubs meet family-friendly shores. Adventure seekers can explore spectacular ancient ruins including the remarkably preserved Aspendos Theatre and the magnificent city of Perge. Cool off at the stunning Düden Waterfalls, which cascade dramatically into the Mediterranean Sea. Families love the Antalya Aquarium with its record-breaking tunnel, while thrill-seekers head to Land of Legends Theme Park for water slides and shows. Enjoy fresh Mediterranean seafood at harbor restaurants, shop in modern malls and traditional markets, and experience vibrant nightlife from beach bars to nightclubs. Take day trips to nearby attractions like mountain-top Termessos, the charming coastal town of Kaş, or the beautiful Kemer marina. With luxury all-inclusive resorts, budget-friendly hotels, excellent infrastructure, and warm Turkish hospitality, Antalya delivers the perfect Mediterranean vacation for every traveler and budget.",
        touristicFeatures: [
          "Kaleiçi Old Town - Charming Ottoman quarter with boutique hotels and restaurants",
          "Düden Waterfalls - Breathtaking cascades plunging into the Mediterranean Sea",
          "Konyaaltı Beach - 7km pebble beach with Taurus Mountains backdrop",
          "Lara Beach - Famous golden sand beach with luxury resorts",
          "Antalya Aquarium - World's longest tunnel aquarium",
          "Ancient Perge - Spectacular Greco-Roman city ruins",
          "Aspendos Theatre - Best-preserved Roman amphitheater, hosts opera festivals",
          "Land of Legends Theme Park - Family entertainment with water slides and shows",
          "Termessos - Mountain-top ancient city with stunning views",
          "Kemer Marina - Sailing, yacht tours, and waterfront dining",
        ],
      },
      Cappadocia: {
        country: "Turkey",
        description:
          "Step into a fairy tale landscape in Cappadocia, one of Earth's most extraordinary destinations and a UNESCO World Heritage site. This otherworldly region features spectacular fairy chimneys, ancient cave dwellings, and surreal rock formations created by millions of years of volcanic activity and erosion. Wake before dawn for the experience of a lifetime—floating over the magical landscape in a hot air balloon as hundreds of colorful balloons drift across the sunrise sky, creating one of the world's most photographed scenes. Explore the incredible Göreme Open-Air Museum with its Byzantine rock-carved churches adorned with stunning frescoes dating back to the 10th century. Descend into fascinating underground cities like Derinkuyu, where ancient civilizations created elaborate 8-level subterranean complexes complete with churches, wine cellars, and ventilation systems. Stay in authentic cave hotels carved into the soft volcanic rock, offering modern luxury within ancient walls. Hike through spectacular valleys—Rose Valley with its pink-hued cliffs, Love Valley with unique formations, and Ihlara Valley's 14km gorge lined with rock churches. Experience traditional Turkish culture in the pottery town of Avanos, ride ATVs or horses through lunar landscapes, and enjoy spectacular Turkish Night shows with traditional dancing and music. Watch sunset from Uçhisar Castle, the region's highest point, offering panoramic views across this dreamlike terrain. With its unique cave accommodations, adventure activities, ancient heritage, and photogenic landscapes unlike anywhere on Earth, Cappadocia promises a truly magical Turkish experience.",
        touristicFeatures: [
          "Hot Air Balloon Flights - Unforgettable sunrise balloon rides over fairy chimneys",
          "Göreme Open-Air Museum - Ancient rock-carved churches with Byzantine frescoes",
          "Derinkuyu Underground City - 8-level underground city reaching 85m depth",
          "Love Valley - Unique rock formations and scenic hiking trails",
          "Uçhisar Castle - Highest point with panoramic valley views",
          "Cave Hotels - Sleep in luxurious converted cave dwellings",
          "Ihlara Valley - 14km canyon with hiking trail and rock churches",
          "Avanos - Pottery workshops and traditional Turkish crafts",
          "ATV & Jeep Safaris - Adventure tours through valleys and rock formations",
          "Turkish Night Shows - Traditional dance, music, and dinner entertainment",
        ],
      },
      Trabzon: {
        country: "Turkey",
        description:
          "Discover Trabzon, where the emerald mountains of the Pontic Alps cascade dramatically to Turkey's spectacular Black Sea coast. This enchanting region offers a refreshing alternative to Turkey's beach resorts, with its cooler climate, lush green landscapes, and authentic Turkish mountain culture. The star attraction is the breathtaking Sumela Monastery, a 4th-century Greek Orthodox monastery seemingly suspended on a cliff face 1,200 meters above sea level—one of Turkey's most iconic and photographed sites. Journey to the picture-perfect Uzungöl, an alpine lake surrounded by dense pine forests and traditional wooden houses, where morning mist creates a mystical atmosphere. Experience the Ayder Plateau's natural hot springs and highland hospitality, where locals serve traditional Black Sea cuisine featuring fresh anchovies, cornbread, and local cheeses. Explore working tea plantations that blanket the hillsides in vibrant green, learning about Turkey's tea culture that rivals its coffee tradition. Visit the beautifully preserved Atatürk Pavilion mansion set in peaceful gardens, and discover Trabzon's Byzantine heritage at the 13th-century Hagia Sophia with its remarkable frescoes. Hike through highland plateaus like Zigana with spectacular mountain vistas, explore the ancient Trabzon Castle overlooking the city and sea, and enjoy fresh fish at seaside restaurants. The region's cooler summer temperatures, unspoiled nature, friendly locals, and off-the-beaten-path charm make Trabzon perfect for travelers seeking authentic Turkey away from mass tourism, offering genuine cultural experiences and stunning natural beauty.",
        touristicFeatures: [
          "Sumela Monastery - Dramatic cliff-side monastery with stunning frescoes",
          "Uzungöl Lake - Picture-perfect alpine lake surrounded by pine forests",
          "Ayder Plateau - Mountain retreat with hot springs and hiking trails",
          "Zigana Mountain - Scenic highland plateau with traditional villages",
          "Atatürk Pavilion - Historic mansion set in beautiful gardens",
          "Hagia Sophia of Trabzon - Byzantine church with remarkable frescoes",
          "Trabzon Castle - Ancient fortress with city and sea views",
          "Local Tea Plantations - Visit working tea gardens and taste fresh Turkish tea",
          "Sera Lake - Tranquil lakeside parks and walking paths",
          "Traditional Black Sea Cuisine - Sample unique local dishes and fresh fish",
        ],
      },
      Bodrum: {
        country: "Turkey",
        description:
          "Welcome to Bodrum, Turkey's most glamorous and sophisticated resort destination on the stunning Aegean coast. This cosmopolitan peninsula perfectly balances ancient history with jet-set luxury, attracting celebrities, yachters, and discerning travelers seeking the ultimate Turkish coastal experience. The city's crown jewel is the magnificent Bodrum Castle, a 15th-century Knights Hospitaller fortress that now houses the world-renowned Museum of Underwater Archaeology. Explore the fascinating remains of the Mausoleum of Halicarnassus, one of the Seven Wonders of the Ancient World, and walk through the remarkably preserved ancient amphitheater with breathtaking sea views. Bodrum's coastline is dotted with pristine beaches and exclusive beach clubs—from the lively shores of Gümbet to the tranquil coves of Bitez, from the windsurf paradise of Türkbükü to the bohemian fishing village of Gümüşlük where you dine with your feet in the sand. The glittering marina is the heart of Bodrum's social scene, where superyachts dock alongside traditional gulets, and waterfront restaurants serve fresh Aegean seafood accompanied by rakı. Shop for designer fashion in chic boutiques, browse local markets for handmade leather sandals, and discover the iconic whitewashed windmills overlooking the peninsula. As night falls, Bodrum transforms into Turkey's party capital with world-class nightclubs, beach bars, and rooftop lounges. Take boat tours to hidden coves, nearby Greek islands, or swim in impossibly clear turquoise waters. With its perfect blend of 5-star luxury hotels, charming boutique properties, ancient culture, pristine beaches, and electric nightlife, Bodrum offers an unforgettable Aegean escape that satisfies history buffs, beach lovers, and party-goers alike.",
        touristicFeatures: [
          "Bodrum Castle - Impressive medieval fortress with underwater archaeology museum",
          "Ancient Mausoleum Site - Ruins of one of Seven Wonders of Ancient World",
          "Bodrum Marina - Luxury yacht harbor with waterfront restaurants and bars",
          "Bodrum Beaches - Pristine coves, beach clubs, and water sports",
          "Gümbet - Popular beach resort with vibrant nightlife",
          "Turgutreis - Long sandy beach with spectacular sunsets",
          "Gümüşlük - Charming fishing village with seaside restaurants",
          "Windmills of Bodrum - Iconic whitewashed windmills overlooking the sea",
          "Boat Tours - Daily cruises to hidden bays and Greek islands",
          "Shopping & Nightlife - Designer boutiques, bars, and beach clubs",
        ],
      },
      Fethiye: {
        country: "Turkey",
        description:
          "Discover Fethiye, the gateway to Turkey's spectacular Turquoise Coast, where pine-clad mountains plunge into the crystal-clear Mediterranean Sea. This stunning region is home to Ölüdeniz, consistently rated among the world's most beautiful beaches, with its famous Blue Lagoon creating an Instagram-perfect paradise of turquoise and azure waters. Experience the adrenaline rush of paragliding from Babadağ Mountain—one of the world's premier tandem paragliding sites—soaring 1,960 meters above the coastline with breathtaking bird's-eye views of the lagoon and mountains. The ancient Lycians left their mark with impressive rock-cut tombs carved into the cliffs overlooking Fethiye harbor, creating a dramatic backdrop to the bustling marina filled with traditional wooden gulet boats. Take the iconic 12 Islands boat tour, spending a full day island-hopping to hidden swimming spots, snorkeling in pristine bays, and enjoying freshly grilled fish on board. Venture to the spectacular Butterfly Valley, a secluded canyon beach accessible only by boat, or cool off in Saklıkent Gorge, an 18-kilometer-long canyon where you can wade through icy mountain waters. Explore the haunting Kayaköy Ghost Village with its 500 abandoned stone houses, hike portions of the legendary Lycian Way coastal trail, and discover underwater wonders through world-class scuba diving. The charming town center buzzes with authentic Turkish life—traditional markets, family-run restaurants serving the day's catch, and lively fish market at the harbor. Experience laid-back beach life at Çalış Beach with spectacular sunsets, enjoy water sports from jet skiing to kitesurfing, and relax in boutique hotels and budget pensions. With its unbeatable combination of natural beauty, adventure activities, ancient culture, and genuine Turkish hospitality, Fethiye promises an authentic Mediterranean paradise.",
        touristicFeatures: [
          "Ölüdeniz Blue Lagoon - World-famous turquoise beach and lagoon",
          "Paragliding from Babadağ - Tandem flights with breathtaking coastal views",
          "Butterfly Valley - Secluded beach canyon accessible by boat",
          "Saklıkent Gorge - Dramatic 18km canyon for hiking and rafting",
          "Lycian Rock Tombs - Ancient carved tombs overlooking the marina",
          "12 Islands Boat Tour - Full-day cruise exploring hidden bays",
          "Kayaköy Ghost Village - Abandoned Greek village with stone houses",
          "Fethiye Marina - Waterfront promenade with restaurants and shopping",
          "Çalış Beach - Long sandy beach with sunset views",
          "Scuba Diving & Snorkeling - Explore rich Mediterranean marine life",
        ],
      },
      Bursa: {
        country: "Turkey",
        description:
          "Experience Bursa, the birthplace of the Ottoman Empire and Turkey's most culturally rich city, magnificently situated at the foot of the majestic Uludağ Mountain. This historic treasure trove offers a perfect year-round destination—world-class skiing in winter and refreshing mountain retreats in summer. Bursa's Ottoman heritage shines through its stunning imperial mosques, particularly the Grand Mosque (Ulu Cami) with 20 domes and the exquisite Green Mosque and Green Tomb, showcasing the finest examples of early Ottoman architecture and intricate İznik tile work. The city is legendary for its therapeutic natural hot springs and traditional Turkish baths—relax in centuries-old hammams or modern thermal spa facilities, experiencing authentic wellness traditions passed down through generations. Take the spectacular Uludağ cable car journey, ascending from city level to alpine heights with breathtaking panoramic views. In winter, Uludağ National Park transforms into Turkey's premier ski resort with excellent slopes, modern lifts, and cozy mountain hotels. Summer brings hikers, mountain bikers, and nature lovers to the cool mountain air and scenic trails. Food enthusiasts flock to Bursa as the birthplace of İskender kebab—thin slices of döner meat served over pide bread with tomato sauce, yogurt, and melted butter—a must-try at historic restaurants that perfected the recipe. Explore the historic Silk Road heritage at the Silk Bazaar (Koza Han), where merchants have traded fine silk products for 600 years. Visit the UNESCO World Heritage village of Cumalıkızık, a perfectly preserved Ottoman village with traditional wooden houses and authentic village life. Stroll through beautiful parks and gardens, relax under the massive 600-year-old Inkaya Plane Tree, and enjoy the coastal charm of nearby Mudanya with its waterfront fish restaurants. With excellent shopping in modern malls and traditional markets, affordable prices, minimal crowds, and easy access from Istanbul, Bursa offers authentic Turkish culture, natural beauty, and historical significance without the tourist masses.",
        touristicFeatures: [
          "Uludağ Mountain - Premier ski resort in winter, hiking paradise in summer",
          "Historic Ottoman Mosques - Grand Mosque and Green Mosque with stunning tiles",
          "Thermal Baths - Natural hot springs and traditional Turkish hammams",
          "Bursa Cable Car - Scenic ride offering panoramic city and mountain views",
          "Green Tomb - Iconic turquoise-tiled mausoleum in beautiful gardens",
          "Silk Bazaar - Historic covered market for silk scarves and textiles",
          "Cumalıkızık Village - UNESCO Ottoman village with traditional houses",
          "İskender Kebab - Birthplace of famous Turkish dish",
          "Inkaya Plane Tree - 600-year-old giant tree in peaceful park",
          "Mudanya - Coastal town with fish restaurants and seaside promenade",
        ],
      },

      // ===== MALAYSIA =====
      "Kuala Lumpur": {
        country: "Malaysia",
        description:
          "Kuala Lumpur, Malaysia's dynamic capital, dazzles with futuristic skyscrapers, vibrant street markets, and diverse cultural heritage. Home to the iconic Petronas Twin Towers, world-class shopping malls, and incredible street food. Experience Malay, Chinese, and Indian cultures, explore colonial architecture, and enjoy tropical gardens in this cosmopolitan Southeast Asian hub.",
        touristicFeatures: [
          "Petronas Twin Towers - Iconic 88-floor towers with skybridge and observation deck",
          "Batu Caves - Hindu temple in limestone caves with giant golden statue",
          "KL Tower - 421m tower offering 360° city views and revolving restaurant",
          "Bukit Bintang - Premier shopping and entertainment district",
          "Chinatown & Petaling Street - Bustling markets and authentic street food",
          "KLCC Park - Urban oasis with fountains, walking paths, and tower views",
          "Merdeka Square - Historic colonial buildings and Independence monument",
          "Jalan Alor Food Street - Famous night market with hundreds of food stalls",
          "Islamic Arts Museum - World-class collection of Islamic art and artifacts",
          "Bird Park & Butterfly Park - Tropical wildlife experiences in city center",
        ],
      },
      Penang: {
        country: "Malaysia",
        description:
          "Penang is Malaysia's culinary capital and UNESCO World Heritage site, famous for street art, colonial architecture, and incredible food. George Town's historic streets blend Chinese temples, Indian mosques, and British buildings. Beach resorts, spice gardens, tropical hills, and some of Asia's best street food make Penang unmissable.",
        touristicFeatures: [
          "George Town - UNESCO heritage city with street art and colonial architecture",
          "Street Food Paradise - Hawker centers serving char kway teow, laksa, and more",
          "Penang Hill - Cable car to hilltop with panoramic island views",
          "Kek Lok Si Temple - Largest Buddhist temple in Southeast Asia",
          "Street Art Trail - Famous murals by Ernest Zacharevic and local artists",
          "Batu Ferringhi Beach - Popular beach resort area with night market",
          "Tropical Spice Garden - Beautiful gardens with exotic plants and cooking classes",
          "Clan Jetties - Traditional Chinese water villages on stilts",
          "Penang National Park - Beaches, jungle trails, and canopy walkways",
          "Gurney Drive - Waterfront promenade with restaurants and shopping",
        ],
      },
      Langkawi: {
        country: "Malaysia",
        description:
          "Langkawi is a tropical paradise of 99 islands in the Andaman Sea, offering pristine beaches, duty-free shopping, and natural wonders. Ride the world-famous SkyBridge, island-hop to hidden beaches, spot eagles, and relax at luxury resorts. Crystal-clear waters, jungle-covered mountains, and legendary folklore make Langkawi perfect for romantic getaways and family vacations.",
        touristicFeatures: [
          "Langkawi Sky Bridge - Curved suspended bridge with panoramic jungle views",
          "Cable Car to Mount Mat Cincang - Scenic ride to second-highest peak",
          "Pantai Cenang - Main beach with resorts, restaurants, and water sports",
          "Island Hopping Tours - Visit uninhabited islands, beaches, and snorkeling spots",
          "Mangrove Kayaking - Paddle through ancient mangrove forests and caves",
          "Eagle Square - Iconic landmark with 12m eagle statue at waterfront",
          "Underwater World Langkawi - Large aquarium with marine life exhibits",
          "Duty-Free Shopping - Tax-free chocolates, alcohol, and luxury goods",
          "Kilim Geoforest Park - UNESCO geopark with limestone formations",
          "Sunset Cruises - Romantic yacht tours with dinner and entertainment",
        ],
      },
      Malacca: {
        country: "Malaysia",
        description:
          "Malacca is a living museum of Malaysia's colonial past, where Portuguese, Dutch, and British heritage meets vibrant Peranakan culture. Stroll along the historic river, visit colorful temples, explore museums in colonial buildings, and taste unique Nyonya cuisine. This UNESCO World Heritage city offers charming night markets, river cruises, and authentic cultural experiences.",
        touristicFeatures: [
          "Jonker Street Night Market - Friday-Sunday market with antiques and street food",
          "A Famosa Fort - 16th-century Portuguese fortress ruins",
          "Christ Church & Dutch Square - Iconic red buildings from colonial era",
          "Malacca River Cruise - Evening boat rides past street art and restaurants",
          "Baba & Nyonya Heritage Museum - Peranakan culture and lifestyle exhibits",
          "St. Paul's Hill - Ruins with panoramic city and sea views",
          "Straits Chinese Jewelry Museum - Unique collection of Peranakan jewelry",
          "Malacca Zoo - Night safari experiences with nocturnal animals",
          "Nyonya Cuisine - Traditional Peranakan dishes blending Chinese and Malay flavors",
          "Trishaw Tours - Decorated bicycle rickshaws with music and lights",
        ],
      },

      // ===== THAILAND =====
      Bangkok: {
        country: "Thailand",
        description:
          "Bangkok captivates with golden temples, floating markets, rooftop bars, and legendary street food. Experience the Grand Palace's splendor, shop at massive malls and night markets, cruise the Chao Phraya River, and explore vibrant Chinatown. From ancient temples to modern skyscrapers, Bangkok offers non-stop energy, incredible food, and warm Thai hospitality.",
        touristicFeatures: [
          "Grand Palace & Emerald Buddha - Thailand's most sacred temple complex",
          "Wat Arun - Temple of Dawn with stunning riverside location",
          "Wat Pho - Giant Reclining Buddha and traditional Thai massage school",
          "Chatuchak Weekend Market - World's largest weekend market, 15,000+ stalls",
          "Khao San Road - Backpacker hub with bars, restaurants, and street life",
          "Chao Phraya River Cruise - Scenic boat tours past temples and palaces",
          "Rooftop Bars - Sky-high cocktails with spectacular city views",
          "Street Food Paradise - Pad Thai, mango sticky rice, and endless delicacies",
          "Jim Thompson House - Traditional Thai architecture and silk museum",
          "Floating Markets - Boat vendors selling food and crafts on canals",
        ],
      },
      Phuket: {
        country: "Thailand",
        description:
          "Phuket, Thailand's largest island, is the ultimate tropical beach destination with stunning coastline, vibrant nightlife, and island adventures. From family-friendly Patong to serene Kata Beach, luxury resorts to budget hostels, Phuket offers something for everyone. Enjoy water sports, island hopping, elephant sanctuaries, and spectacular sunsets over the Andaman Sea.",
        touristicFeatures: [
          "Patong Beach - Main beach with nightlife, shopping, and entertainment",
          "Big Buddha - 45m white marble Buddha statue with panoramic views",
          "Phi Phi Islands Day Trip - Snorkeling, beaches, and Maya Bay",
          "Old Phuket Town - Sino-Portuguese architecture and colorful streets",
          "Bangla Road - Famous nightlife street with bars and clubs",
          "Phang Nga Bay - James Bond Island and sea kayaking",
          "Kata & Karon Beaches - Family-friendly beaches with calm waters",
          "Promthep Cape - Spectacular sunset viewpoint",
          "Ethical Elephant Sanctuaries - No riding, ethical elephant interactions",
          "Water Sports - Diving, snorkeling, jet skiing, and parasailing",
        ],
      },
      Pattaya: {
        country: "Thailand",
        description:
          "Pattaya delivers action-packed beach resort fun just 2 hours from Bangkok. Enjoy water sports, cabaret shows, theme parks, and vibrant nightlife. Family attractions include aquarium, waterpark, and Floating Market. Golf courses, shopping malls, and island day trips complement beautiful beaches and energetic atmosphere.",
        touristicFeatures: [
          "Walking Street - Famous nightlife strip with bars, clubs, and entertainment",
          "Sanctuary of Truth - Intricate all-wood temple by the sea",
          "Coral Islands - Boat trips for snorkeling and beach relaxation",
          "Nong Nooch Tropical Garden - Beautifully landscaped gardens with cultural shows",
          "Cartoon Network Amazone Waterpark - Family waterpark with slides and attractions",
          "Art in Paradise - 3D interactive art museum",
          "Pattaya Floating Market - Traditional Thai market on water",
          "Underwater World - Aquarium with glass tunnel walkthrough",
          "Cabaret Shows - World-famous transgender entertainment performances",
          "Terminal 21 Pattaya - Themed shopping mall with airport design",
        ],
      },
      "Chiang Mai": {
        country: "Thailand",
        description:
          'Chiang Mai, the "Rose of the North," enchants with ancient temples, mountain scenery, and rich cultural traditions. Gateway to hill tribe villages, elephant sanctuaries, and jungle adventures. Famous for handicraft markets, cooking classes, meditation retreats, and the magical Yi Peng Lantern Festival. Cooler climate and laid-back atmosphere offer authentic Thai experiences.',
        touristicFeatures: [
          "Old City Temples - 300+ Buddhist temples including Wat Phra Singh",
          "Doi Suthep Temple - Mountain-top golden temple with city views",
          "Night Bazaar - Extensive market for handicrafts, clothes, and souvenirs",
          "Sunday Walking Street - Weekly market on historic Rachadamnoen Road",
          "Ethical Elephant Sanctuaries - Feed and bathe rescued elephants",
          "Thai Cooking Classes - Learn authentic Northern Thai cuisine",
          "Doi Inthanon - Thailand's highest peak with waterfalls and nature trails",
          "Hill Tribe Villages - Visit traditional Hmong and Karen communities",
          "Monk Chat Programs - Learn about Buddhism and Thai culture",
          "Massage & Spa - Traditional Thai massage and wellness retreats",
        ],
      },

      // ===== INDONESIA =====
      Bali: {
        country: "Indonesia",
        description:
          "Bali is Indonesia's paradise island offering world-class surfing, stunning rice terraces, ancient temples, and spiritual retreats. From beach clubs in Seminyak to yoga studios in Ubud, volcano treks to temple ceremonies, Bali delivers magic at every turn. Enjoy warm hospitality, affordable luxury, incredible cuisine, and unforgettable sunsets over the Indian Ocean.",
        touristicFeatures: [
          "Tanah Lot Temple - Iconic sea temple on rock formation at sunset",
          "Ubud Rice Terraces - UNESCO heritage Tegallalang terraced paddies",
          "Sacred Monkey Forest - Temple complex with playful monkeys",
          "Water Temples - Tirta Empul holy spring and Uluwatu clifftop temple",
          "Seminyak Beach Clubs - Luxury beachfront bars and restaurants",
          "Mount Batur Sunrise Trek - Active volcano hike with breakfast at summit",
          "Traditional Dance Performances - Kecak fire dance at Uluwatu Temple",
          "Surfing Spots - World-class waves at Uluwatu, Canggu, and Kuta",
          "Yoga & Wellness Retreats - Meditation, healing, and spiritual experiences",
          "Balinese Cuisine - Cooking classes and authentic warungs",
        ],
      },
      Jakarta: {
        country: "Indonesia",
        description:
          "Jakarta, Indonesia's bustling capital, is Southeast Asia's largest city offering modern skyline, historic Old Town, and vibrant culture. Shop at mega malls, explore museums, taste diverse Indonesian cuisine, and experience energetic nightlife. From traditional markets to luxury hotels, Jakarta provides urban excitement, business conveniences, and gateway to Indonesia's islands.",
        touristicFeatures: [
          "National Monument (Monas) - 132m tower symbolizing Indonesian independence",
          "Old Town (Kota Tua) - Dutch colonial buildings and museums",
          "Grand Indonesia Mall - Massive shopping complex with international brands",
          "Taman Mini Indonesia - Cultural park showcasing all Indonesian provinces",
          "Thousand Islands - Day trips to tropical islands for snorkeling",
          "Jakarta Cathedral & Istiqlal Mosque - Side-by-side symbols of religious harmony",
          "Ancol Dreamland - Beach resort area with theme park and aquarium",
          "SCBD Nightlife - Modern district with rooftop bars and clubs",
          "Museum Nasional - Indonesian history, art, and cultural artifacts",
          "Street Food Tours - Explore authentic Indonesian culinary diversity",
        ],
      },
      Yogyakarta: {
        country: "Indonesia",
        description:
          "Yogyakarta is Java's cultural heart, home to magnificent Borobudur and Prambanan temple complexes. Center of Javanese arts, batik, traditional dance, and shadow puppets. Visit the Sultan's palace, shop for handicrafts, witness volcano sunrises, and explore cave temples. Affordable, authentic, and culturally rich, Yogya offers Indonesia's soul.",
        touristicFeatures: [
          "Borobudur Temple - World's largest Buddhist monument, UNESCO World Heritage",
          "Prambanan Temple - Spectacular Hindu temple complex with evening performances",
          "Mount Merapi Jeep Tour - Active volcano adventure with lava museum",
          "Kraton Sultan Palace - Living palace with traditional ceremonies",
          "Malioboro Street - Shopping street for batik, souvenirs, and street food",
          "Jomblang Cave - Rappel into vertical cave with heavenly light beam",
          "Ramayana Ballet - Traditional dance performance at open-air theater",
          "Batik Making Classes - Learn traditional wax-resist fabric dyeing",
          "Timang Beach - Thrilling gondola ride over ocean waves",
          "Kotagede Silver Village - Traditional silver crafts and workshops",
        ],
      },

      // ===== SAUDI ARABIA =====
      Riyadh: {
        country: "Saudi Arabia",
        description:
          "Riyadh, Saudi Arabia's modern capital, blends futuristic architecture with deep cultural traditions. Experience luxury shopping malls, world-class restaurants, cutting-edge museums, and traditional souks. Visit historical Diriyah, explore the Edge of the World, and discover Saudi hospitality. The city offers authentic Arabian culture with modern conveniences and entertainment.",
        touristicFeatures: [
          "Kingdom Centre Tower - Iconic skyscraper with Sky Bridge viewing platform",
          "Edge of the World - Dramatic cliff formations with panoramic desert views",
          "Diriyah - UNESCO site, birthplace of Saudi state with mud-brick architecture",
          "National Museum - Comprehensive Saudi history and culture exhibitions",
          "Riyadh Boulevard - Entertainment zone with restaurants, shows, and events",
          "Al Masmak Fort - Historic fortress and museum in old city center",
          "Souq Al Zal - Traditional market for carpets, antiques, and crafts",
          "King Fahd Stadium - Sports events and concerts venue",
          "Wadi Hanifah - Urban valley with parks, lakes, and walking trails",
          "Saudi Cuisine - Traditional kabsa, mandi, and Arabic coffee experiences",
        ],
      },
      Jeddah: {
        country: "Saudi Arabia",
        description:
          "Jeddah, the gateway to Mecca, is Saudi Arabia's cosmopolitan Red Sea port city. Explore historic Al-Balad with coral-stone buildings, dive the Red Sea's pristine coral reefs, stroll the world's longest corniche, and admire modern sculptures. International dining, luxury hotels, and beautiful seafront promenades make Jeddah Saudi Arabia's most liberal and welcoming city.",
        touristicFeatures: [
          "Al-Balad Historic District - UNESCO site with traditional coral-stone houses",
          "King Fahd Fountain - World's tallest fountain reaching 300m height",
          "Jeddah Corniche - 30km waterfront promenade with beaches and cafes",
          "Red Sea Diving - World-class coral reefs and marine life",
          "Floating Mosque - Stunning mosque appearing to float on Red Sea",
          "Jeddah Sculpture Museum - Open-air display of international artworks",
          "Red Sea Mall - Premier shopping destination with international brands",
          "Al-Shallal Theme Park - Amusement park with rides and ice skating",
          "Tayebat Museum - Saudi history, culture, and Islamic art collection",
          "Traditional Souks - Gold, spice, and textile markets",
        ],
      },

      // ===== MOROCCO =====
      Marrakech: {
        country: "Morocco",
        description:
          "Marrakech enchants with labyrinthine souks, vibrant Jemaa el-Fnaa square, ornate palaces, and the iconic Koutoubia Mosque. Explore the medina's winding alleys, bargain for treasures, sip mint tea in riads, and experience snake charmers and street performers. Day trips to Atlas Mountains, camel rides, and hammam spas complete the Arabian Nights adventure.",
        touristicFeatures: [
          "Jemaa el-Fnaa Square - UNESCO square with snake charmers, food stalls, entertainers",
          "Majorelle Garden - Stunning blue garden created by Yves Saint Laurent",
          "Bahia Palace - 19th-century palace with beautiful courtyards and tilework",
          "Koutoubia Mosque - Iconic 77m minaret visible across the city",
          "Medina Souks - Maze of markets selling spices, carpets, leather, and crafts",
          "Ben Youssef Madrasa - Former Islamic college with intricate architecture",
          "Traditional Hammam - Authentic Moroccan spa and massage experience",
          "Saadian Tombs - Beautifully decorated 16th-century royal burial grounds",
          "Atlas Mountains Day Trip - Berber villages and scenic mountain valleys",
          "Agafay Desert - Camel rides, quad biking, and desert camps near city",
        ],
      },
      Casablanca: {
        country: "Morocco",
        description:
          "Casablanca is Morocco's modern economic hub and largest city, blending Art Deco architecture, French colonial heritage, and Moroccan traditions. Visit the magnificent Hassan II Mosque rising from the Atlantic, stroll the oceanfront Corniche, explore the old medina, and experience cosmopolitan dining and nightlife. The city offers authentic Moroccan culture with metropolitan energy.",
        touristicFeatures: [
          "Hassan II Mosque - World's 7th largest mosque with ocean-side minaret",
          "Corniche Ain Diab - Beachfront promenade with restaurants and beach clubs",
          "Rick's Café - Recreated bar from classic movie Casablanca",
          "Old Medina - Traditional market area with authentic Moroccan atmosphere",
          "Morocco Mall - Modern shopping with musical fountain and aquarium",
          "Art Deco Architecture - French colonial buildings downtown",
          "Villa des Arts - Contemporary art museum in beautiful mansion",
          "Central Market - Fresh produce, spices, and local food hall",
          "Mohammed V Square - Historic plaza with fountains and colonial buildings",
          "Beach Clubs - Atlantic Ocean beach resorts and water sports",
        ],
      },

      // ===== EGYPT =====
      Cairo: {
        country: "Egypt",
        description:
          "Cairo brings ancient history to life with the iconic Pyramids of Giza, Sphinx, and Egyptian Museum's treasures. Explore Islamic Cairo's medieval mosques, haggle in Khan el-Khalili bazaar, cruise the Nile at sunset, and taste authentic Egyptian cuisine. Africa's largest city offers 5,000 years of civilization, vibrant culture, and unforgettable monuments.",
        touristicFeatures: [
          "Pyramids of Giza - Last standing Wonder of Ancient World with Great Pyramid",
          "The Sphinx - Mysterious 4,500-year-old limestone guardian statue",
          "Egyptian Museum - King Tut's treasures and mummies collection",
          "Khan el-Khalili Bazaar - Historic market for souvenirs, spices, and jewelry",
          "Islamic Cairo - Medieval mosques, madrasas, and city gates",
          "Nile River Cruise - Dinner cruises with belly dancing and entertainment",
          "Citadel of Saladin - Medieval fortress with Muhammad Ali Mosque",
          "Coptic Cairo - Ancient Christian churches and Roman fortress",
          "Saqqara Step Pyramid - Oldest stone pyramid, 4,700 years old",
          "Sound & Light Show - Evening spectacle at the Pyramids",
        ],
      },
      Luxor: {
        country: "Egypt",
        description:
          "Luxor is the world's greatest open-air museum, built on ancient Thebes. Marvel at Karnak Temple's massive columns, explore Valley of the Kings' royal tombs, and witness colossal statues at Luxor Temple. Hot air balloon rides over temples at sunrise, felucca sails on the Nile, and horse-drawn carriage rides create magical experiences in this archaeologist's paradise.",
        touristicFeatures: [
          "Valley of the Kings - Royal tombs including Tutankhamun's burial chamber",
          "Karnak Temple - Massive temple complex with Great Hypostyle Hall",
          "Luxor Temple - Illuminated ancient temple in city center",
          "Hot Air Balloon Rides - Dawn flights over temples and the Nile",
          "Temple of Hatshepsut - Dramatic terraced temple built into cliffs",
          "Colossi of Memnon - Massive twin statues guarding temple ruins",
          "Valley of the Queens - Royal wives and princes burial site",
          "Nile Felucca Rides - Traditional sailboat cruises at sunset",
          "Luxor Museum - Superb collection of ancient artifacts",
          "Sound & Light Shows - Evening performances at Karnak Temple",
        ],
      },

      // ===== AZERBAIJAN =====
      Baku: {
        country: "Azerbaijan",
        description:
          "Baku amazes with futuristic Flame Towers, UNESCO Old City, and Caspian Sea boulevards. Walk medieval cobblestone streets, admire modern architecture, visit ancient fire temples, and explore carpet museums. Experience Azerbaijan's oil-wealth transformation, traditional culture, and warm hospitality. The city offers European sophistication with Eastern mystique.",
        touristicFeatures: [
          "Old City (Icherisheher) - UNESCO medieval walled city with Maiden Tower",
          "Flame Towers - Iconic trio of skyscrapers with LED displays",
          "Baku Boulevard - Long Caspian Sea promenade with parks and attractions",
          "Heydar Aliyev Center - Futuristic Zaha Hadid-designed cultural center",
          "Palace of the Shirvanshahs - 15th-century royal palace complex",
          "Azerbaijan Carpet Museum - Traditional carpet weaving and displays",
          "Gobustan Rock Art - Ancient petroglyphs and mud volcanoes nearby",
          "Maiden Tower - Mysterious 12th-century tower with panoramic views",
          "Fountains Square - Pedestrian area with cafes and shopping",
          "Caspian Sea Beaches - Coastal resorts and waterfront dining",
        ],
      },

      // ===== GEORGIA =====
      Tbilisi: {
        country: "Georgia",
        description:
          "Tbilisi charms with cobblestone Old Town, sulfur baths, wine culture, and legendary hospitality. Ride cable car to Narikala Fortress, explore eclectic architecture from medieval to Art Nouveau, taste khinkali dumplings and Georgian wine. The city offers affordable luxury, thriving art scene, natural hot springs, and warm, welcoming locals.",
        touristicFeatures: [
          "Old Town (Dzveli Tbilisi) - Historic district with balconied houses",
          "Narikala Fortress - Ancient fortress with cable car access and city views",
          "Sulfur Baths District - Traditional Georgian bathhouses with natural hot springs",
          "Rustaveli Avenue - Main boulevard with theaters, museums, and cafes",
          "Georgian Wine Tasting - Sample ancient winemaking traditions and qvevri wines",
          "Bridge of Peace - Modern glass pedestrian bridge over Mtkvari River",
          "Mtatsminda Park - Hilltop amusement park with panoramic city views",
          "Dry Bridge Market - Antiques, Soviet memorabilia, and art market",
          "Traditional Georgian Feast (Supra) - Multi-course dining with toasts",
          "Street Art & Cafes - Hipster neighborhoods with galleries and coffee culture",
        ],
      },
      Batumi: {
        country: "Georgia",
        description:
          "Batumi is Georgia's Black Sea resort jewel with palm-lined boulevards, modern architecture, and beach vibes. Enjoy seaside promenade, botanical gardens, moving Ali & Nino statue, and vibrant nightlife. Perfect blend of beach relaxation, subtropical climate, fresh seafood, and Vegas-style entertainment. Summer playground for families, couples, and party-goers.",
        touristicFeatures: [
          "Batumi Boulevard - 7km palm-lined promenade with beaches and attractions",
          "Ali and Nino Statue - Moving 8m sculpture telling love story",
          "Alphabetic Tower - Unique tower showcasing Georgian alphabet",
          "Batumi Botanical Garden - Subtropical garden with exotic plants and sea views",
          "Batumi Beaches - Pebble beaches with sun loungers and water sports",
          "Batumi Dolphinarium - Shows with trained dolphins and seals",
          "Cable Car to Anuria - Hilltop views of city and coastline",
          "Piazza Square - Italian-style square with restaurants and live music",
          "Casinos & Nightlife - Entertainment venues and beach clubs",
          "Day Trips - Nearby waterfalls, mountain villages, and wine regions",
        ],
      },

      // ===== ALBANIA =====
      Tirana: {
        country: "Albania",
        description:
          "Tirana surprises with colorful buildings, vibrant cafe culture, and fascinating communist history. Explore Skanderbeg Square, ride Dajti Mountain cable car, visit quirky museums, and enjoy affordable dining. Albania's capital offers authentic Balkans experience, friendly locals, and gateway to stunning Albanian Riviera. Perfect for budget travelers seeking undiscovered European destination.",
        touristicFeatures: [
          "Skanderbeg Square - Central plaza with National History Museum",
          "Bunk'Art Museums - Communist-era bunkers converted to art spaces",
          "Dajti Mountain Cable Car - Longest cable car in Balkans with mountain views",
          "Grand Park & Artificial Lake - Green space for walking and paddle boats",
          "Blloku District - Trendy neighborhood with bars, restaurants, and nightlife",
          "Et'hem Bey Mosque - Beautiful 18th-century mosque with frescoes",
          "Pyramid of Tirana - Brutalist landmark hosting cultural events",
          "Mount Dajti National Park - Hiking, panoramic views, and mountain resort",
          "Traditional Albanian Cuisine - Tavë kosi, byrek, and raki tastings",
          "Affordable Shopping - Boutiques, markets, and local crafts",
        ],
      },
      Sarande: {
        country: "Albania",
        description:
          "Sarande is Albania's southern beach gem facing the Greek island of Corfu. Enjoy pristine beaches, ancient ruins, crystal-clear Ionian Sea, and vibrant waterfront promenade. Visit nearby Blue Eye spring, Butrint UNESCO site, and hillside villages. Perfect for beach lovers seeking Mediterranean beauty without crowds at fraction of Greece's prices.",
        touristicFeatures: [
          "Ksamil Beaches - Postcard-perfect white sand beaches with turquoise water",
          "Blue Eye Spring - Natural phenomenon with incredibly blue freshwater spring",
          "Butrint National Park - UNESCO archaeological site with Greek and Roman ruins",
          "Sarande Waterfront - Lively promenade with restaurants and bars",
          "Lëkurësi Castle - Hilltop castle restaurant with sunset views",
          "Boat Trips to Corfu - Day excursions to Greek island",
          "Mirror Beach - Hidden beach with crystal-clear shallow waters",
          "Syri i Kaltër - Diving and swimming in the Blue Eye",
          "Seafood Restaurants - Fresh catch, Mediterranean cuisine, affordable prices",
          "Albanian Riviera Beaches - Easy access to stunning southern coastline",
        ],
      },

      // ===== UNITED ARAB EMIRATES =====
      Dubai: {
        country: "United Arab Emirates",
        description:
          "Dubai dazzles as the UAE's crown jewel and the Middle East's most glamorous city, where futuristic innovation meets Arabian hospitality. Home to the world's tallest building, Burj Khalifa (828m), and the stunning Palm Jumeirah artificial archipelago, Dubai constantly pushes the boundaries of what's possible. Shop at the colossal Dubai Mall with its giant aquarium and indoor ice rink, or haggle for gold and spices in traditional souks. Experience luxury beyond imagination at the iconic sail-shaped Burj Al Arab hotel, unwind on pristine beaches at Jumeirah, or ski indoors at Mall of the Emirates' Ski Dubai. The city offers desert safaris with dune bashing, camel rides, and Bedouin dinners under stars, while the vibrant Dubai Marina showcases ultra-modern architecture along waterfront promenades. Explore the historic Al Fahidi Quarter to discover Dubai's pearl-diving heritage, cruise Dubai Creek on traditional abra boats, or witness the mesmerizing Dubai Fountain show dancing to music. From world-class dining and Michelin-starred restaurants to rooftop bars with spectacular skyline views, Dubai delivers luxury, adventure, and cultural experiences. Whether you're seeking family entertainment at theme parks, underwater experiences at Atlantis Aquaventure, shopping in gold and designer boutiques, or simply soaking up the Arabian sun on immaculate beaches, Dubai offers an unforgettable blend of traditional Emirati culture and futuristic magnificence that must be seen to be believed.",
        touristicFeatures: [
          "Burj Khalifa - World's tallest building with observation decks on 124th and 148th floors",
          "Dubai Mall - Massive shopping complex with aquarium, ice rink, and 1,200+ stores",
          "Palm Jumeirah - Iconic man-made palm-shaped island with luxury resorts and beaches",
          "Dubai Marina - Waterfront district with skyscrapers, yacht clubs, and dining",
          "Burj Al Arab - Iconic 7-star sail-shaped hotel and symbol of Dubai luxury",
          "Dubai Frame - 150m golden frame offering panoramic old and new Dubai views",
          "Gold Souk & Spice Souk - Traditional markets for gold, jewelry, spices, and textiles",
          "Desert Safari - Dune bashing, camel riding, sandboarding, and Bedouin experiences",
          "Dubai Fountain - World's largest choreographed fountain system with daily shows",
          "Ski Dubai - Indoor ski resort with real snow inside Mall of the Emirates",
        ],
      },
      "Abu Dhabi": {
        country: "United Arab Emirates",
        description:
          "Abu Dhabi, the UAE's sophisticated capital and largest emirate, seamlessly blends cultural heritage with modern grandeur across over 200 islands. The magnificent Sheikh Zayed Grand Mosque stands as one of the world's largest mosques, featuring 82 white domes, stunning chandeliers, and the world's largest hand-knotted carpet—a masterpiece of Islamic architecture open to all visitors. Experience world-class culture at Louvre Abu Dhabi, the first universal museum in the Arab world showcasing art from ancient civilizations to contemporary works under its stunning geometric dome. Thrill-seekers head to Yas Island for Formula 1 racing at Yas Marina Circuit, adrenaline rides at Ferrari World (with the world's fastest roller coaster), waterpark fun at Yas Waterworld, and family entertainment at Warner Bros. World. The Corniche offers 8 kilometers of pristine beaches, manicured parks, and cycling paths along turquoise waters. Explore Qasr Al Watan, the stunning Presidential Palace showcasing Arabian craftsmanship, or discover authentic Emirati heritage at Heritage Village. The Emirates Palace hotel epitomizes luxury with gold-decorated interiors and pristine private beaches. Take desert safaris to the Empty Quarter, enjoy mangrove kayaking through Eastern Mangroves, or shop at luxury malls and traditional souqs. Abu Dhabi's commitment to sustainability shines through Masdar City, the world's most sustainable urban development. With excellent dining from street food to Michelin stars, world-class hotels, and a perfect balance of tradition and modernity, Abu Dhabi offers a refined Arabian experience where culture, luxury, and innovation converge.",
        touristicFeatures: [
          "Sheikh Zayed Grand Mosque - Stunning white marble mosque with 82 domes and intricate designs",
          "Louvre Abu Dhabi - World-class museum with art from ancient to contemporary",
          "Ferrari World - Theme park with world's fastest roller coaster Formula Rossa",
          "Yas Island - Entertainment hub with F1 circuit, theme parks, and beaches",
          "Emirates Palace - Ultra-luxury hotel with gold-decorated interiors and private beach",
          "Corniche Beach - 8km waterfront promenade with pristine beaches and parks",
          "Qasr Al Watan - Presidential Palace showcasing Arabian architecture and heritage",
          "Heritage Village - Traditional Bedouin village showcasing Emirati culture",
          "Mangrove National Park - Kayaking through protected mangrove forests",
          "Warner Bros. World - Indoor theme park with DC superheroes and Looney Tunes",
        ],
      },
      Sharjah: {
        country: "United Arab Emirates",
        description:
          "Sharjah, the cultural capital of the UAE and the third-largest emirate, offers an authentic Arabian experience where heritage and tradition take center stage. UNESCO designated Sharjah as the Cultural Capital of the Arab World, a title reflected in its 17 museums, numerous art galleries, and beautifully restored heritage areas. The city uniquely straddles both the Arabian Gulf and Gulf of Oman coasts, offering diverse coastal experiences. Explore the Heart of Sharjah, a beautifully restored heritage district with traditional wind-tower houses, authentic souqs, and the magnificent Al Noor Mosque overlooking Khalid Lagoon. The Sharjah Museum of Islamic Civilization showcases Islamic art, science, and culture across seven galleries, while the Sharjah Art Museum is the largest in the UAE. Unlike neighboring emirates, Sharjah maintains a more conservative, family-friendly atmosphere with no alcohol, making it perfect for cultural immersion and family travel. Wander through the vibrant Blue Souk (Central Market) with its distinctive blue-tiled architecture, shop for carpets, gold, and handicrafts at affordable prices. The Sharjah Desert Park combines natural history museum, Arabian Wildlife Center, and children's farm, showcasing regional flora and fauna. Visit Al Qasba, a picturesque waterfront development with restaurants, Eye of the Emirates Ferris wheel, and cultural performances. Enjoy pristine beaches on both coasts, explore archaeological sites dating back millennia, and experience traditional Emirati hospitality. With excellent museums, restored historical quarters, traditional markets, and significantly lower prices than Dubai, Sharjah delivers rich cultural experiences that showcase authentic Emirati heritage and Islamic culture.",
        touristicFeatures: [
          "Heart of Sharjah - Restored heritage district with traditional architecture and museums",
          "Sharjah Museum of Islamic Civilization - Comprehensive Islamic art and science exhibits",
          "Blue Souk (Central Market) - Iconic blue-tiled market for carpets, gold, and crafts",
          "Al Noor Mosque - Beautiful Ottoman-style mosque open for tours",
          "Sharjah Art Museum - Largest art museum in UAE with regional and international art",
          "Al Qasba - Waterfront development with Eye of the Emirates Ferris wheel",
          "Sharjah Desert Park - Wildlife center, natural history museum, and botanical gardens",
          "Al Majaz Waterfront - Entertainment area with fountain shows and restaurants",
          "Mleiha Archaeological Centre - Ancient archaeological site with desert activities",
          "Traditional Souqs - Authentic markets for spices, perfumes, and traditional goods",
        ],
      },
      Ajman: {
        country: "United Arab Emirates",
        description:
          "Ajman, the UAE's smallest and most affordable emirate, offers an authentic, laid-back Arabian experience away from the glitz of larger emirates. This charming coastal gem boasts pristine beaches with soft white sand and crystal-clear waters perfect for swimming and water sports, all without the crowds of Dubai or Abu Dhabi. The Ajman Museum, housed in an impressive 18th-century fort, showcases the emirate's pearl-diving heritage, traditional weapons, ancient manuscripts, and archaeological finds from the region. Stroll along the picturesque Corniche with its scenic promenade, children's playgrounds, and beachfront cafes offering stunning Arabian Gulf sunsets. The emirate's shipbuilding yards continue the centuries-old tradition of crafting wooden dhows, providing fascinating glimpses into maritime heritage. Ajman's souqs offer authentic shopping experiences for spices, textiles, and local goods at genuine local prices. The nearby Masfout area in the Hajar Mountains provides a cooler climate, date palm plantations, and opportunities for hiking and exploring traditional mountain villages. Enjoy fresh seafood at local restaurants along the coast, experience traditional Emirati hospitality at heritage sites, and discover the emirate's natural beauty at Al Zorah Nature Reserve, home to flamingos and diverse wildlife in protected mangrove ecosystems. With modern shopping malls, luxury beach resorts, and traditional areas coexisting harmoniously, Ajman delivers genuine Emirati culture, beautiful beaches, and warm hospitality at a fraction of the cost of neighboring emirates—perfect for travelers seeking authentic experiences, budget-friendly family holidays, and peaceful coastal retreats.",
        touristicFeatures: [
          "Ajman Museum - 18th-century fort showcasing pearl-diving heritage and local history",
          "Ajman Beach - Pristine white sand beaches with clear waters and water sports",
          "Ajman Corniche - Scenic waterfront promenade with parks and sunset views",
          "Dhow Shipyards - Traditional wooden boat building yards along the creek",
          "Al Zorah Nature Reserve - Protected mangroves with flamingos and wildlife",
          "Masfout - Mountain area with cooler climate, date farms, and hiking trails",
          "Traditional Souqs - Authentic markets for spices, textiles, and local goods",
          "Ajman Marina - Yacht club and waterfront development with dining options",
          "Heritage Fort - Historic fortress with traditional architecture and artifacts",
          "Fresh Seafood Restaurants - Beachfront dining with local catch and Arabian Gulf views",
        ],
      },
      "Ras Al Khaimah": {
        country: "United Arab Emirates",
        description:
          "Ras Al Khaimah, meaning 'Head of the Tent,' combines breathtaking natural landscapes with rich history, offering the UAE's best adventure tourism alongside pristine beaches. Home to Jebel Jais, the UAE's highest mountain peak at 1,934 meters, the emirate delivers adrenaline-pumping experiences including the world's longest zipline (2.83km), mountain hiking, via ferrata climbing routes, and the thrilling Jais Sledder alpine coaster. The dramatic Hajar Mountains provide stunning backdrops for adventures, while the 64-kilometer coastline offers powder-soft beaches perfect for relaxation and water sports. Explore over 1,000 archaeological sites including ancient settlements, forts, and the impressive Dhayah Fort perched on a hilltop with panoramic views. The National Museum of Ras Al Khaimah, housed in a fort, showcases the emirate's pearl-diving history, ancient artifacts, and traditional weaponry. Luxury resorts line the beaches, many with championship golf courses, while Al Hamra village offers authentic Arabian architecture. Visit abandoned village Jazirat Al Hamra, reputedly the UAE's only 'ghost town,' preserving traditional pearl-diving community architecture. Adventure seekers can explore the desert on dune bashing safaris, experience traditional Bedouin culture, or camp under spectacular starry skies. The Suwaidi Pearls Farm demonstrates the region's pearl-diving heritage with tours and pearl cultivation demonstrations. Enjoy mangrove kayaking, mountain biking trails, or relax at Iceland Water Park, the region's largest waterpark. With significantly lower prices than Dubai, stunning mountain and coastal scenery, rich archaeological heritage, and world-class adventure activities, Ras Al Khaimah offers nature lovers and thrill-seekers an unforgettable Arabian adventure.",
        touristicFeatures: [
          "Jebel Jais - UAE's highest peak with world's longest zipline and adventure activities",
          "Jais Flight - World's longest zipline at 2.83km soaring over mountain landscapes",
          "Dhayah Fort - Historic hilltop fort with panoramic mountain and coastline views",
          "Al Hamra Beach - Pristine beaches with luxury resorts and water sports",
          "National Museum - Fort-turned-museum showcasing archaeological finds and heritage",
          "Jazirat Al Hamra - Abandoned traditional pearl-diving village and ghost town",
          "Suwaidi Pearls Farm - Pearl cultivation tours demonstrating diving heritage",
          "Via Ferrata - Mountain climbing routes and adventure courses on Jebel Jais",
          "Iceland Water Park - Largest waterpark in region with slides and attractions",
          "Desert Adventures - Dune bashing, camel riding, and Bedouin camping experiences",
        ],
      },
      Fujairah: {
        country: "United Arab Emirates",
        description:
          "Fujairah stands apart as the UAE's only emirate located entirely on the eastern coast along the Gulf of Oman, offering a dramatically different landscape from the Arabian Gulf emirates. The rugged Hajar Mountains plunge dramatically into crystal-clear waters, creating spectacular scenery and the UAE's best diving and snorkeling destinations with rich coral reefs and abundant marine life. The historic Fujairah Fort, the oldest and largest in the UAE, overlooks the city from a commanding hilltop position, while nearby Al-Bidyah Mosque, built in 1446, holds the distinction of being the country's oldest mosque. Snoopy Island (Dibba) offers exceptional snorkeling with sea turtles, colorful fish, and coral gardens just meters from shore. The modern Sheikh Zayed Mosque features distinctive white architecture with four towering minarets. Adventure seekers explore Wadi Wurayah, a mountain wadi with natural pools, waterfalls, and rare Arabian leopard habitat. The Fujairah Museum houses archaeological discoveries including bronze daggers and ancient pottery from archaeological sites dating back 5,000 years. Friday Market (actually open daily) offers traditional handicrafts, carpets, pottery, and local produce in an authentic setting. Luxurious beach resorts line the coast, offering spa treatments, water sports, and direct beach access with calmer waters than the Arabian Gulf. The city's strategic port location makes it an important trade hub, while traditional bullfighting (non-violent) showcases local culture. Visit ancient watchtowers dotting the landscape, explore traditional villages in the mountains, or simply relax on pristine beaches. With cooler temperatures than western emirates, stunning mountain scenery, exceptional diving, rich history, and authentic Emirati culture away from tourist crowds, Fujairah offers nature lovers and diving enthusiasts an undiscovered Arabian treasure.",
        touristicFeatures: [
          "Fujairah Fort - Oldest and largest fort in UAE with commanding hilltop views",
          "Al-Bidyah Mosque - UAE's oldest mosque dating to 1446 with unique architecture",
          "Snoopy Island - Premier snorkeling site with sea turtles and coral reefs",
          "Diving & Snorkeling - Crystal-clear waters with rich marine life and coral gardens",
          "Wadi Wurayah - Mountain wadi with natural pools, waterfalls, and wildlife",
          "Sheikh Zayed Mosque - Striking white mosque with four towering minarets",
          "Fujairah Museum - Archaeological exhibits with ancient artifacts and pottery",
          "Friday Market - Traditional market for handicrafts, carpets, and local produce",
          "Hajar Mountains - Dramatic mountain landscapes with hiking and scenic drives",
          "Luxury Beach Resorts - Coastal hotels with pristine beaches and calm waters",
        ],
      },
      "Umm Al Quwain": {
        country: "United Arab Emirates",
        description:
          "Umm Al Quwain, the UAE's second smallest and least populated emirate, offers a refreshingly tranquil escape where traditional Emirati life continues largely unchanged by rapid modernization. This peaceful coastal haven is renowned for its rich mangrove ecosystems, pristine islands, and authentic cultural experiences including traditional dhow building, falconry demonstrations, and camel racing at one of the UAE's most scenic racetracks. Al Sinniyah Island, the emirate's largest island, provides sanctuary for flamingos, herons, and diverse migratory birds, while protected mangrove forests support rich marine biodiversity. UAQ Marine Club offers excellent water sports including jet skiing, kayaking, and traditional dhow sailing along the calm creek and coastline. Dreamland Aqua Park, the region's largest waterpark, features over 30 rides and attractions perfect for family entertainment. The Old Town preserves traditional architecture with wind towers, narrow lanes, and the historic fort housing the Marine Museum with exhibits on pearl diving, fishing heritage, and traditional boats. Al Dur archaeological site reveals ancient civilization remains dating back 2,000 years with excavated artifacts displayed in local museums. Falaj Al Mualla oasis area offers date palm plantations and agricultural heritage. The emirate's quiet beaches provide perfect spots for fishing, camping, and watching spectacular sunsets without tourist crowds. UAQ's famous dhow building yards continue centuries-old craftsmanship, creating traditional wooden vessels using time-honored techniques. Seneyah Island features date farms accessible by traditional boat. With significantly lower costs than other emirates, authentic Emirati culture, peaceful natural environments, and genuine hospitality, Umm Al Quwain delivers the perfect antidote to bustling cities—ideal for nature enthusiasts, bird watchers, families seeking quiet beaches, and travelers wanting to experience the UAE as it once was.",
        touristicFeatures: [
          "Dreamland Aqua Park - Largest waterpark in region with 30+ rides and attractions",
          "Al Sinniyah Island - Nature reserve with flamingos, herons, and migratory birds",
          "Mangrove Forests - Protected ecosystems with kayaking and boat tours",
          "UAQ Marine Club - Water sports center with jet skiing and sailing",
          "Old Town & Marine Museum - Historic fort showcasing pearl-diving heritage",
          "Al Dur Archaeological Site - Ancient settlement ruins dating back 2,000 years",
          "Dhow Building Yards - Traditional boat-building craftsmanship demonstrations",
          "Falconry Centers - Traditional falcon training and demonstrations",
          "Camel Racing Track - Scenic racetrack hosting traditional camel races",
          "Peaceful Beaches - Uncrowded beaches perfect for fishing and sunset watching",
        ],
      },
      "Al Ain": {
        country: "United Arab Emirates",
        description:
          "Al Ain, the UAE's fourth-largest city and Abu Dhabi emirate's second-largest, is celebrated as the 'Garden City' of Arabia and the birthplace of UAE's founding father, Sheikh Zayed. This UNESCO World Heritage oasis city nestled near the Omani border offers a dramatically different experience from coastal emirates, with lush date palm plantations, ancient falaj irrigation systems, and year-round greenery. Jebel Hafeet, the UAE's second-highest mountain at 1,240 meters, features one of the world's greatest driving roads with 60 turns ascending to stunning summit views, hot springs at its base, and luxury Mercure Grand hotel. Al Ain Zoo, the Middle East's largest zoo, houses 4,000 animals including endangered Arabian species in innovative habitats, with safari experiences and educational programs. The Al Ain Oasis, a UNESCO site, preserves 147,000 date palms watered by ancient falaj irrigation channels, offering shaded walking trails through 3,000-year-old agricultural tradition. Camel Market provides authentic experiences watching camel trading using time-honored bargaining methods. Al Jahili Fort, one of the UAE's largest forts built in 1891, showcases exhibitions on desert exploration and local heritage. Archaeological sites at Hili Gardens feature ancient tombs and settlements dating back 5,000 years with the iconic Hili Grand Tomb. Al Ain National Museum displays archaeological finds, ethnographic exhibits, and the fort where Sheikh Zayed was born. Wadi Adventure, the Middle East's largest man-made white-water rafting facility, offers rafting, kayaking, and surf pool adventures. The cooler climate (compared to coast), numerous parks including Ain Al Faydah, and family-friendly atmosphere make Al Ain perfect for year-round visits. With authentic Bedouin heritage, green spaces, fascinating archaeological sites, and genuine Emirati culture, Al Ain offers a unique inland Arabian experience.",
        touristicFeatures: [
          "Jebel Hafeet - Second-highest UAE peak with spectacular mountain road and views",
          "Al Ain Zoo - Middle East's largest zoo with 4,000 animals and safari experiences",
          "Al Ain Oasis - UNESCO World Heritage site with 147,000 date palms and ancient irrigation",
          "Hili Archaeological Park - Ancient tombs and settlements dating back 5,000 years",
          "Al Jahili Fort - Historic 1891 fort with desert exploration exhibitions",
          "Camel Market - Authentic traditional camel trading with Bedouin culture",
          "Wadi Adventure - Man-made white-water rafting, kayaking, and surf pool complex",
          "Hot Springs at Jebel Hafeet - Natural thermal springs at mountain base",
          "Al Ain National Museum - Archaeological artifacts and Sheikh Zayed birthplace",
          "Green Mubazzarah Park - Mountain park with hot springs and camping facilities",
        ],
      },
      Tbilisi: {
        country: "Georgia",
        description:
          "Tbilisi, Georgia's captivating capital, enchants visitors with its unique fusion of ancient cobblestone charm and striking modern architecture. The picturesque Old Town features narrow winding streets with colorful wooden balconies, historic sulfur baths in domed bathhouses, and the imposing Narikala Fortress accessible by cable car. Experience authentic Georgian spa culture in centuries-old bathhouses, explore the stunning Holy Trinity Cathedral, wander Rustaveli Avenue with theaters and museums, and discover wine bars pouring natural Georgian wines made in traditional qvevri clay vessels. The city's warm, welcoming locals, excellent food and wine, and vibrant arts scene make it one of Europe's most authentic capitals.",
        touristicFeatures: [
          "Old Town (Dzveli Tbilisi) - Cobblestone streets with colorful wooden balconies and medieval architecture",
          "Narikala Fortress - Ancient hilltop fortress with panoramic city views and cable car access",
          "Sulfur Baths (Abanotubani) - Historic bathhouses with natural therapeutic hot springs",
          "Bridge of Peace - Futuristic glass-and-steel pedestrian bridge illuminated at night",
          "Holy Trinity Cathedral (Sameba) - Massive Orthodox church with golden domes",
          "Rustaveli Avenue - Main boulevard with theaters, museums, and historical buildings",
          "Wine Bars & Qvevri Wine - UNESCO-listed Georgian winemaking in clay vessels",
          "Fabrika - Creative hub in converted Soviet factory with cafes and street art",
          "Georgian Cuisine - Khinkali dumplings, khachapuri cheese bread, and supra feasts",
          "Dry Bridge Market - Flea market with Soviet-era antiques and vintage treasures",
        ],
      },
      Batumi: {
        country: "Georgia",
        description:
          "Batumi, Georgia's vibrant Black Sea gem, dazzles as a subtropical beach destination where palm-lined boulevards meet ultra-modern architecture. The stunning 7-kilometer Batumi Boulevard along the pebble beach ranks among the world's most beautiful coastal walks with palm trees, sculptures, and dancing fountains. The city's extraordinary architecture includes the twisting Alphabet Tower, Ali and Nino moving sculpture, and modern high-rises creating a dramatic skyline. Visit the magnificent Batumi Botanical Garden with 5,000 plant species, experience casinos and entertainment, explore the historic Old Town around Piazza square, and taste Adjarian khachapuri. With Black Sea beaches, botanical wonders, and affordable prices, Batumi offers a unique Caucasian Riviera experience.",
        touristicFeatures: [
          "Batumi Boulevard - 7km palm-lined promenade with beaches and seaside dining",
          "Alphabet Tower - Unique 130-meter tower celebrating Georgian script",
          "Ali and Nino Statue - Moving sculpture telling tragic romance",
          "Batumi Botanical Garden - One of world's largest with 5,000 plant species",
          "Black Sea Beach - Pebble beaches with warm waters and water sports",
          "Old Town & Piazza - European architecture with cafes and wine bars",
          "Dancing Fountains - Choreographed water-and-light shows",
          "Casinos & Entertainment - Gaming venues and vibrant nightlife",
          "Gonio Fortress - Ancient Roman fortress ruins with 2,000-year history",
          "Adjarian Khachapuri - Boat-shaped cheese bread regional specialty",
        ],
      },
      Kazbegi: {
        country: "Georgia",
        description:
          "Kazbegi (Stepantsminda), Georgia's legendary mountain outpost beneath Mount Kazbek (5,047m), offers one of the Caucasus' most dramatic destinations. The iconic Gergeti Trinity Church perched at 2,170 meters with the snow-capped Mount Kazbek behind creates one of the world's most photographed mountain scenes. This remote town serves as base camp for High Caucasus adventures including world-class trekking, mountaineering, and glacier hikes. The dramatic Georgian Military Highway winds through with breathtaking scenery. Experience authentic mountain hospitality in family guesthouses, taste local honey and cheeses, and explore pristine alpine valleys with peaks soaring over 5,000 meters.",
        touristicFeatures: [
          "Gergeti Trinity Church - Iconic 14th-century hilltop church with Mount Kazbek backdrop",
          "Mount Kazbek - 5,047m peak for technical mountaineering",
          "Georgian Military Highway - Dramatic mountain road with spectacular scenery",
          "Gveleti Waterfall - Accessible hiking trail to beautiful waterfall",
          "Truso Valley - Remote valley with abandoned villages and mineral springs",
          "Juta Village - Traditional mountain village for wilderness trekking",
          "Dariali Gorge - Dramatic cliffs with ancient fortresses",
          "Friendship Monument - Panoramic viewpoint on Georgian Military Highway",
          "Mountain Trekking - World-class hiking through alpine meadows and glaciers",
          "Georgian Mountain Hospitality - Family guesthouses with local cuisine and chacha",
        ],
      },
      Mtskheta: {
        country: "Georgia",
        description:
          "Mtskheta, Georgia's spiritual heart and ancient capital, is a UNESCO World Heritage Site just 20 km from Tbilisi at the confluence of two rivers. Home to the magnificent 11th-century Svetitskhoveli Cathedral (burial site of Georgian kings) and the breathtaking hilltop Jvari Monastery from the 6th century. This sacred town serves as the seat of the Georgian Orthodox Church and attracts pilgrims and architecture enthusiasts with stunning medieval churches and spiritual atmosphere. The compact old town features cobblestone streets with craft shops selling traditional Georgian souvenirs and churchkhela sweets.",
        touristicFeatures: [
          "Svetitskhoveli Cathedral - 11th-century UNESCO cathedral, burial site of Georgian kings",
          "Jvari Monastery - 6th-century mountaintop monastery with river confluence views",
          "Samtavro Monastery - Ancient complex with miraculous spring and royal burials",
          "UNESCO World Heritage Site - Ancient capital preserving Georgia's sacred architecture",
          "Armazi Archaeological Site - Fortress ruins from 3rd century BC",
          "Shio-Mgvime Monastery - Cliff monastery with cave cells carved in limestone",
          "River Confluence - Scenic meeting point of Mtkvari and Aragvi rivers",
          "Traditional Crafts - Cloisonné enamelwork, religious icons, and handmade jewelry",
          "Churchkhela Sweets - Traditional candle-shaped walnut confections",
          "Georgian Orthodox Celebrations - Important pilgrimage site for religious holidays",
        ],
      },
      Sighnaghi: {
        country: "Georgia",
        description:
          "Sighnaghi, the enchanting 'City of Love' perched on a hilltop overlooking the Alazani Valley in Kakheti wine region, charms with restored 18th-century architecture and medieval fortress walls. Completely encircled by 4 kilometers of defensive walls with 23 watchtowers offering 360-degree vineyard views to snow-capped Caucasus Mountains. Famous for 24-hour wedding registry, pastel-colored houses with wooden balconies, and cozy wine cellars. Located in Kakheti, Georgia's premier wine region with 8,000-year winemaking tradition, it's perfect for vineyard tours and wine tastings at family estates using traditional qvevri methods.",
        touristicFeatures: [
          "Medieval Fortress Walls - 4km defensive walls with 23 watchtowers offering valley views",
          "Alazani Valley Views - Stunning vineyard panoramas with Caucasus backdrop",
          "City of Love - 24-hour wedding registry and romantic cobblestone streets",
          "Kakheti Wine Region - Birthplace of wine with 8,000-year winemaking tradition",
          "Bodbe Monastery - Sacred pilgrimage site with St. Nino's tomb and holy spring",
          "Traditional Qvevri Wineries - Clay vessel winemaking tours with tastings",
          "Sighnaghi Museum - Archaeological exhibits and Niko Pirosmani artwork",
          "Pastel Architecture - Restored 18th-century houses with wooden balconies",
          "Kakhetian Cuisine - Regional specialties with mtsvadi, wines, and valley dining",
          "Boutique Accommodations - Romantic hotels in traditional restored houses",
        ],
      },
      Borjomi: {
        country: "Georgia",
        description:
          "Borjomi, world-famous spa town nestled in a scenic gorge at 800 meters, is renowned for its naturally carbonated mineral water bottled since 1890 and exported globally. The sprawling 3-kilometer Borjomi Central Park offers free-flowing mineral springs, warm sulfur pools (38°C), cable car rides, and beautiful trails. The historic Kukushka narrow-gauge railway provides one of the world's most scenic train journeys to Bakuriani through mountain forests. Borjomi-Kharagauli National Park, Georgia's largest protected area (85,000 hectares), offers world-class trekking through pristine wilderness. Visit the Romanov Palace, explore mountain trails, and experience traditional Georgian hospitality.",
        touristicFeatures: [
          "Borjomi Mineral Water - World-famous naturally carbonated spring water with free tastings",
          "Borjomi Central Park - 3km riverside park with sulfur pools, cable car, and springs",
          "Kukushka Railway - Historic narrow-gauge scenic train to Bakuriani",
          "Borjomi-Kharagauli National Park - 85,000-hectare wilderness with multi-day trekking",
          "Romanov Palace - Former Russian royal residence, now museum with park",
          "Thermal Sulfur Pool - Natural 38°C warm pool for therapeutic bathing",
          "Green Monastery - Historic monastery hidden in forest",
          "Art Nouveau Architecture - Historic buildings and Russian-style cottages",
          "Mountain Trails - Marked hiking routes through forests and meadows",
          "Likani Palace - Moorish-style palace in beautiful parkland setting",
        ],
      },
      Kutaisi: {
        country: "Georgia",
        description:
          "Kutaisi, Georgia's ancient second city and former capital of the Colchis Kingdom (where Jason sought the Golden Fleece), combines 3,000 years of history with modern energy. Gateway to multiple UNESCO sites including Gelati Monastery with stunning 12th-century frescoes and golden mosaics, and hilltop Bagrati Cathedral. Explore the otherworldly Prometheus Cave with underground rivers, Sataplia Reserve with actual dinosaur footprints and glass-floored canyon viewing platform, and Okatse Canyon with adrenaline-pumping suspended walkways above waterfalls. The city maintains authentic Georgian character with traditional markets, Imeretian khachapuri, and affordable prices.",
        touristicFeatures: [
          "Gelati Monastery - UNESCO World Heritage Site with 12th-century frescoes and mosaics",
          "Bagrati Cathedral - 11th-century hilltop cathedral with panoramic views",
          "Prometheus Cave - Vast underground world with stalactites and boat ride",
          "Motsameta Monastery - Cliff-edge monastery above deep river gorge",
          "Sataplia Nature Reserve - Dinosaur footprints and glass canyon platform",
          "Okatse Canyon - Suspended walkways clinging to cliffs above waterfall",
          "Colchis Fountain - Golden Fleece-themed fountain in city center",
          "Green Bazaar - Traditional market with fresh produce and specialties",
          "Imeretian Khachapuri - Round cheese bread specialty of Western Georgia",
          "Authentic Atmosphere - Less touristy than Tbilisi with genuine character",
        ],
      },
      Rustavi: {
        country: "Georgia",
        description:
          "Rustavi, Georgia's fourth-largest city 25 km southeast of Tbilisi, represents Soviet industrial planning transformed into a modern Georgian city. Founded in 1948 as a planned Soviet industrial center, it features wide boulevards and typical Soviet architecture. Home to Rustavi International Motorpark, Georgia's premier motorsports venue. Its proximity to Tbilisi and strategic location near David Gareja monastery complex on the Azerbaijan border make it a practical base for exploring southeastern Georgia.",
        touristicFeatures: [
          "Rustavi International Motorpark - Georgia's premier racing circuit",
          "David Gareja Monastery - Nearby 6th-century cave monastery complex",
          "Soviet Urban Planning - Wide boulevards from planned industrial city era",
          "Strategic Location - 25km from Tbilisi for southeastern Georgia exploration",
          "Algeti National Park - Nearby protected forests and wildlife area",
          "Cultural Venues - Theaters and museums showcasing local culture",
          "Steel Plant Heritage - Historic industrial center now transformed",
          "Budget Accommodations - Practical lodging for regional exploration",
          "Post-Soviet Transformation - Modern evolution of Georgian industrial city",
          "Day Trip Base - Access point for nearby attractions and monasteries",
        ],
      },
      Zugdidi: {
        country: "Georgia",
        description:
          "Zugdidi, capital of the Samegrelo region in western Georgia, serves as gateway to both the Black Sea coast and Svaneti mountains. The main highlight is Dadiani Palace, displaying Napoleon's death mask and ancient manuscripts. Its strategic location makes it a practical stopover for travelers heading to Mestia (mountain road to Svaneti starts here) or exploring Enguri Dam, one of the world's highest arch dams. The surrounding Samegrelo region is known for unique cuisine, particularly megrelian khachapuri and elarji.",
        touristicFeatures: [
          "Dadiani Palace - Historic royal residence with Napoleon's death mask",
          "Botanical Garden - Palace grounds with exotic plant species",
          "Gateway to Svaneti - Starting point for mountain road to Mestia",
          "Enguri Dam - Nearby hydroelectric dam, one of world's highest arch dams",
          "Megrelian Cuisine - Regional specialties including megrelian khachapuri and elarji",
          "Regional Capital - Commercial center with authentic provincial character",
          "Soviet Architecture - Historic buildings from Soviet development",
          "Strategic Location - Between Black Sea coast and Svaneti mountains",
          "Local Markets - Traditional bazaars showcasing regional products",
          "Budget Transit Hub - Practical stopover with guesthouses",
        ],
      },
      Mestia: {
        country: "Georgia",
        description:
          "Mestia, the remote capital of Svaneti in Georgia's High Caucasus, is a UNESCO World Heritage Site at 1,500m where medieval defensive towers pierce the skyline. The famous Svan towers, unique 9th-13th century stone structures, dot the landscape with over 175 surviving towers. Mestia is the starting point for incredible treks including the famous multi-day Mestia-to-Ushguli trek, Chalaadi Glacier hikes, and visits to Ushguli, Europe's highest permanently inhabited village at 2,200m. Experience legendary Svan hospitality, taste unique kubdari meat pies, and explore pristine wilderness with peaks soaring over 5,000 meters.",
        touristicFeatures: [
          "Svan Defensive Towers - Medieval stone towers from 9th-13th centuries",
          "UNESCO World Heritage Site - Preserved medieval architecture and landscape",
          "Mestia-Ushguli Trek - Multi-day alpine trek through pristine valleys",
          "Ushguli - Europe's highest inhabited village at 2,200m with ancient towers",
          "Chalaadi Glacier - Accessible glacier hike through dramatic landscape",
          "Svaneti Museum - Medieval icons, manuscripts, and treasures",
          "Tetnuldi Ski Resort - Cable car accessing virgin ski terrain",
          "Koruldi Lakes - Turquoise alpine lakes with panoramic mountain views",
          "Svan Cuisine - Unique kubdari meat pies and distinctive Svan salt",
          "Remote Mountain Culture - Authentic Svan traditions in isolation",
        ],
      },
      Telavi: {
        country: "Georgia",
        description:
          "Telavi, the charming capital of Georgia's Kakheti wine region, serves as gateway to the country's most celebrated vineyards. This ancient city blends wine heritage with cultural attractions including the historic Batonis Tsikhe fortress complex with King Erekle II Palace. Located in Georgia's premier wine region (70% of wine production), it's ideal for vineyard tours. Visit nearby Tsinandali Estate with aristocratic palace and European gardens, towering Alaverdi Cathedral, and traditional family wineries using UNESCO-listed qvevri methods. The Alazani Valley stretches with endless vineyards backed by snow-capped Caucasus creating picture-perfect wine country scenery.",
        touristicFeatures: [
          "Kakheti Wine Region - Gateway to Georgia's premier wine area with 70% production",
          "Batonis Tsikhe Fortress - Historic palace complex with museums",
          "Tsinandali Estate - Aristocratic palace with European gardens and wine cellar",
          "Traditional Qvevri Winemaking - UNESCO-listed 8,000-year-old clay vessel method",
          "Alaverdi Cathedral - Towering 11th-century church producing wine",
          "Alazani Valley Views - Panoramic vineyard vistas with Caucasus backdrop",
          "Gremi Citadel - 16th-century royal fortress with church on hilltop",
          "Giant Plane Tree - Ancient 900-year-old tree in city center",
          "Wine Tourism - Family wineries offering tastings with homemade food",
          "Autumn Harvest Festival (Rtveli) - Traditional grape harvest celebrations",
        ],
      },
      Gori: {
        country: "Georgia",
        description:
          "Gori, historic city in eastern Georgia, carries significance as an ancient fortress town and birthplace of Joseph Stalin. The imposing 7th-century Gori Fortress on a rocky hill offers panoramic views. The Stalin Museum presents the Soviet dictator's life in his preserved wooden birthplace and personal armored train car—controversial yet historically significant. Just 10 km away, ancient Uplistsikhe cave city carved into rock cliffs from the 1st millennium BC offers fascinating glimpses into pre-Christian Georgian civilization with cave dwellings, temples, and wine cellars hewn from stone.",
        touristicFeatures: [
          "Stalin Museum - Comprehensive museum in dictator's birthplace with train car",
          "Uplistsikhe Cave City - Ancient rock-hewn city from 1st millennium BC",
          "Gori Fortress - Medieval fortress on rocky hill with panoramic views",
          "Stalin's Birthplace - Preserved wooden house under neo-classical pavilion",
          "Archaeological Significance - 3,000-year-old cave dwellings and temples",
          "Soviet History - Insights into personality cult and 20th-century totalitarianism",
          "Ateni Sioni Church - 7th-century church with well-preserved frescoes",
          "Central Location - Convenient stop between Tbilisi and Western Georgia",
          "Kartli Region - Historic heartland with rolling plains and mountain views",
          "Historical Layers - Strategic site witnessing ancient to modern Georgian history",
        ],
      },
      Bakuriani: {
        country: "Georgia",
        description:
          "Bakuriani, nestled in Georgia's Borjomi district at 1,700 meters elevation, stands as the Caucasus' premier ski resort and year-round mountain destination. Surrounded by pristine coniferous forests, it has welcomed winter sports enthusiasts since the early 20th century. The resort features two main ski areas with 23 pistes totaling 29.1 kilometers. The legendary 'Kukushka' narrow-gauge railway offers scenic train journeys from Borjomi through mountain tunnels with breathtaking views. Winter offers skiing and snowboarding, while summer reveals hiking, mountain biking, and horseback riding through wildflower meadows and access to Borjomi-Kharagauli National Park.",
        touristicFeatures: [
          "Didveli Ski Resort - Modern ski area with 23 pistes, snow-making equipment, and night skiing",
          "Kukushka Railway - Historic narrow-gauge train journey with spectacular mountain views",
          "Kokhta-Mitarbi Slopes - Challenging ski terrain for advanced skiers and snowboarders",
          "Olympic Training Facilities - Historic ski jump and training centers from Soviet era",
          "Borjomi-Kharagauli National Park - Access to Georgia's largest protected wilderness area",
          "Summer Hiking Trails - Alpine meadows, forest trails, and wildflower-filled valleys",
          "Mountain Biking Routes - Forest paths and challenging mountain bike trails",
          "Therapeutic Alpine Climate - Clean mountain air beneficial for respiratory health",
          "Horseback Riding - Traditional horse tours through forests and alpine pastures",
          "Georgian Mountain Cuisine - Authentic khinkali, khachapuri, and local wines in cozy lodges",
        ],
      },
      Puncak: {
        country: "Indonesia",
        description:
          "Puncak, meaning 'peak' in Indonesian, serves as West Java's premier highland retreat, stretching along the scenic mountain pass between the bustling metropolises of Jakarta and Bandung at elevations ranging from 800 to 1,500 meters. This popular weekend escape offers blessed relief from tropical heat with its cool, misty climate averaging 20-25°C year-round, making it Indonesia's favorite highland getaway just 90 kilometers south of Jakarta. The region is world-famous for its mesmerizing tea plantations carpeting rolling hills in countless shades of green—visit working tea estates like Gunung Mas Tea Plantation and Perkebunan Teh Walini to walk through emerald tea terraces, learn about tea processing from leaf to cup, participate in tea-picking experiences, and sip freshly brewed tea while overlooking stunning mountain vistas. Taman Safari Indonesia, one of Asia's most innovative wildlife parks, allows visitors to drive through naturalistic habitats encountering over 2,500 animals from around the world including tigers, elephants, and rare Sumatran species, plus exciting animal shows and baby zoo areas. The dramatic mountain pass journey itself is an attraction, winding through jungle-clad slopes with roadside fruit stalls selling fresh strawberries, corn, and exotic tropical fruits. Cibodas Botanical Garden, established in 1852, showcases incredible plant diversity including rare orchids, giant water lilies, and towering trees in 84 hectares of meticulously landscaped gardens at 1,300 meters elevation. Visit colorful flower gardens at Taman Bunga Nusantara featuring Dutch-inspired landscapes, or explore Cipanas with its natural hot springs offering therapeutic baths. Adventure seekers can paraglide over tea plantations with stunning aerial views, hike forest trails to hidden waterfalls, or visit Gunung Mas for camping and outdoor activities. The Puncak Pass area features numerous villa resorts, mountain lodges, and restaurants serving both international and traditional Sundanese cuisine. Shop for fresh strawberries, homemade jams, local honey, and handicrafts at mountain markets. Weekend traffic can be heavy with Jakarta residents escaping to cooler temperatures, so mid-week visits offer more tranquility. With its intoxicating blend of verdant tea estates, wildlife encounters, botanical wonders, cool mountain climate, and stunning scenery just hours from Indonesia's capital, Puncak delivers the perfect highland escape for families, nature lovers, and city dwellers seeking refreshing mountain air and picturesque landscapes.",
        touristicFeatures: [
          "Tea Plantations - Walk through emerald tea terraces at Gunung Mas and Walini estates",
          "Taman Safari Indonesia - Drive-through wildlife park with 2,500+ animals from around the world",
          "Cibodas Botanical Garden - Historic 84-hectare garden with rare orchids and tropical plants",
          "Taman Bunga Nusantara - Colorful flower gardens with Dutch-inspired landscapes",
          "Cool Mountain Climate - Refreshing temperatures averaging 20-25°C year-round",
          "Tea Factory Tours - Learn tea processing from picking to packaging with fresh tea tasting",
          "Cipanas Hot Springs - Natural thermal baths with therapeutic mineral-rich waters",
          "Paragliding Adventures - Soar over tea plantations with stunning aerial mountain views",
          "Fresh Produce Markets - Roadside stalls selling strawberries, corn, and tropical fruits",
          "Mountain Resorts - Villa accommodations and lodges with panoramic valley views",
        ],
      },
      Sukabumi: {
        country: "Indonesia",
        description:
          "Sukabumi, a hidden gem in West Java nestled between Jakarta and Bandung at Mount Pangrango's base, emerges as Indonesia's adventure capital combining dramatic mountains, pristine beaches, mystical caves, thundering waterfalls, and UNESCO Geopark wonders. This diverse city at 600 meters elevation serves as both a health resort with therapeutic climate and adventure playground offering everything from world-class surfing to spelunking in ancient caves. The crown jewel is Pelabuhan Ratu on the Indian Ocean coast, a legendary surfing destination with powerful waves, dramatic black sand beaches, and local legends about Nyai Loro Kidul, the mythical Queen of the Southern Sea—the beach's mystical reputation adds intrigue to spectacular sunsets and fresh seafood dining in beachfront warungs. Mount Gede Pangrango National Park, a UNESCO Biosphere Reserve protecting virgin tropical montane forests, offers challenging multi-day treks to twin volcanic peaks (2,958m and 3,019m), crater lakes, natural hot springs, and sightings of endemic Javan wildlife including silvery gibbons and rare birds. The newly designated Ciletuh-Palabuhanratu UNESCO Global Geopark showcases 50 million years of geological history with dramatic cliffs, sea caves, fossil-rich rock formations, and the stunning Curug Awang waterfall plunging 100 meters. Adventure seekers explore Buniayu Caves' mysterious chambers adorned with stalactites and stalagmites, requiring torch-lit crawling through narrow passages. Discover countless waterfalls including Curug Cikaso with its triple waterfalls accessible by bamboo raft, Curug Cigamea hidden in jungle, and Curug Sodong's green pools perfect for swimming. The cool mountain town of Cikidang offers strawberry picking farms, while Situ Gunung (Mount Lake) provides serene camping, fishing, and traditional Sundanese villages. Sukabumi's famous for traditional crafts including intricate batik cloth, kris daggers (ceremonial weapons), woven mats, and woodcarvings sold in local markets. The city serves as gateway to numerous natural hot springs like Cipanas and Cisolok offering therapeutic volcanic-heated waters. Experience authentic Sundanese culture, taste local specialties like nasi timbel and pepes ikan, and stay in mountain retreats or beachside bungalows. With its remarkable diversity—from surfing beaches to mountain peaks, from UNESCO geoparks to mystical caves—combined with affordable prices, genuine Indonesian hospitality, and proximity to Jakarta, Sukabumi rewards adventurous travelers with Indonesia's most varied natural playground.",
        touristicFeatures: [
          "Pelabuhan Ratu Beach - Legendary surf destination with powerful waves and black sand beaches",
          "Ciletuh-Palabuhanratu UNESCO Geopark - Dramatic cliffs, fossils, and geological wonders",
          "Mount Gede Pangrango National Park - UNESCO Biosphere Reserve with volcanic peaks and wildlife",
          "Curug Cikaso - Triple waterfalls accessible by bamboo raft through jungle",
          "Buniayu Caves - Adventure spelunking through stalactite-filled chambers",
          "Curug Awang - Spectacular 100-meter waterfall in the UNESCO Geopark",
          "Situ Gunung Lake - Mountain lake with camping, fishing, and Sundanese villages",
          "Natural Hot Springs - Therapeutic volcanic waters at Cipanas and Cisolok",
          "Traditional Crafts - Batik cloth, kris daggers, and Sundanese woodcarvings",
          "Strawberry Farms - Pick-your-own strawberry gardens in cool mountain climate",
        ],
      },
      Jakarta: {
        country: "Indonesia",
        description:
          "Jakarta, Indonesia's sprawling capital and Southeast Asia's largest city, pulses with energy as the nation's political, economic, and cultural heart. This megacity blends Dutch colonial heritage with gleaming modern skyscrapers, creating a fascinating urban landscape where historic Kota Tua meets futuristic business districts. Explore beautifully preserved colonial buildings around Fatahillah Square housing museums, visit the iconic National Monument (Monas) standing 132 meters tall, and discover diverse neighborhoods from upscale Menteng to vibrant Chinatown. Jakarta's world-class shopping ranges from luxury malls like Grand Indonesia to traditional markets, while its culinary scene offers everything from street food serving nasi goreng and satay to high-end restaurants. Despite traffic challenges, the city's new MRT system improves accessibility, making it easier to experience the dynamic energy of this tropical metropolis.",
        touristicFeatures: [
          "National Monument (Monas) - Iconic 132m tower symbolizing Indonesian independence",
          "Kota Tua (Old Town) - Colonial-era buildings, museums, and Fatahillah Square",
          "Grand Indonesia Mall - Massive luxury shopping complex with international brands",
          "Istiqlal Mosque - Southeast Asia's largest mosque with stunning architecture",
          "Jakarta Cathedral - Historic neo-gothic cathedral facing Istiqlal Mosque",
          "Ancol Dreamland - Beach resort complex with theme parks and waterfront dining",
          "Thousand Islands - Day trip to pristine island beaches",
          "Indonesian Cuisine - Street food, nasi goreng, satay, and diverse regional dishes",
          "Museum Nasional - National museum with extensive Indonesian artifacts",
          "Modern Skyline - Skyscrapers, rooftop bars, and contemporary urban development",
        ],
      },
      Yogyakarta: {
        country: "Indonesia",
        description:
          "Yogyakarta (Jogja), Java's cultural soul and former royal capital, stands as Indonesia's artistic and intellectual heart where Javanese traditions thrive amidst ancient temples and vibrant contemporary arts scene. This special region maintains its sultanate with the Kraton still functioning as cultural and political center. Yogyakarta serves as gateway to two magnificent UNESCO World Heritage Sites: the enormous 9th-century Borobudur, the world's largest Buddhist temple, and the Hindu Prambanan temple complex with towering spires. The city buzzes with university students, traditional batik workshops, and wayang kulit shadow puppet performances. Explore Malioboro Street for shopping batik and street food, visit the Water Castle (Taman Sari) with underground passages, and discover nearby natural wonders including Jomblang Cave with heavenly light beams.",
        touristicFeatures: [
          "Borobudur Temple - UNESCO World Heritage, world's largest Buddhist temple",
          "Prambanan Temple - UNESCO Hindu temple complex with towering spires",
          "Kraton (Sultan's Palace) - Functioning royal palace with traditional ceremonies",
          "Malioboro Street - Bustling shopping street for batik, crafts, and street food",
          "Taman Sari (Water Castle) - Former royal garden with underground passages",
          "Jomblang Cave - Spectacular sinkhole cave with heavenly light beams",
          "Batik Workshops - Traditional fabric dyeing demonstrations and shopping",
          "Wayang Kulit - Traditional shadow puppet performances",
          "Javanese Cuisine - Gudeg, bakpia, and authentic Javanese specialties",
          "Arts & Culture - Thriving contemporary art scene and traditional crafts",
        ],
      },
      Bandung: {
        country: "Indonesia",
        description:
          "Bandung, West Java's stylish highland city at 768 meters elevation, captivates as Indonesia's Paris of Java with Art Deco architecture, cool mountain climate, and thriving creative scene. This former Dutch colonial hill station offers blessed relief from tropical heat with temperatures averaging 23°C year-round. The city's remarkable collection of 1920s-1930s Art Deco buildings includes Gedung Sate with its distinctive tower and Villa Isola perched on a hill. Bandung's reputation as Indonesia's fashion capital shines in hundreds of factory outlets selling international and local brands at bargain prices. The surrounding highlands feature stunning natural attractions including the active Tangkuban Perahu volcano with its massive crater, hot springs, and endless tea plantations carpeting hillsides.",
        touristicFeatures: [
          "Art Deco Architecture - 1920s-1930s colonial buildings including iconic Gedung Sate",
          "Tangkuban Perahu Volcano - Active volcano with accessible crater and hot springs",
          "Factory Outlets - Hundreds of shopping outlets with international brands at low prices",
          "Kawah Putih - Stunning turquoise volcanic crater lake in mountains",
          "Tea Plantations - Rancabali and Malabar estates with tours and mountain views",
          "Lembang Floating Market - Traditional market on water with Sundanese food",
          "Cool Highland Climate - Pleasant 23°C average temperatures year-round",
          "Sundanese Cuisine - Regional specialties and innovative cafe culture",
          "Villa Isola - Iconic hilltop Art Deco mansion with panoramic views",
          "Creative Scene - Street art, galleries, and contemporary cultural spaces",
        ],
      },
      Surabaya: {
        country: "Indonesia",
        description:
          "Surabaya, Indonesia's second-largest city and East Java's bustling capital, stands as a major commercial hub combining colonial heritage with modern development. This port city played a crucial role in Indonesian independence, commemorated by the towering Heroes Monument. The historic Arab Quarter (Ampel) features the sacred Sunan Ampel Mosque and traditional markets. Explore the House of Sampoerna museum in a restored Dutch colonial factory showcasing Indonesia's famous clove cigarette heritage, and visit the Submarine Monument featuring an actual Russian submarine converted into a museum. Surabaya serves as gateway to Mount Bromo, one of Java's most spectacular volcanic landscapes. The city offers excellent Javanese and Chinese-Indonesian cuisine, modern shopping malls, and authentic street food.",
        touristicFeatures: [
          "Heroes Monument - Towering monument commemorating Indonesian independence",
          "House of Sampoerna - Museum in colonial factory showing clove cigarette heritage",
          "Arab Quarter (Ampel) - Historic district with Sunan Ampel Mosque and markets",
          "Submarine Monument - Russian submarine converted into unique museum",
          "Gateway to Mount Bromo - Access point for volcanic landscape tours",
          "Old Harbor - Traditional schooners and maritime heritage area",
          "Suramadu Bridge - Indonesia's longest bridge connecting to Madura Island",
          "Traditional Markets - Authentic shopping for textiles, food, and local goods",
          "Javanese Cuisine - Local specialties including rawon and rujak cingur",
          "Modern Shopping - Contemporary malls and commercial development",
        ],
      },
      Medan: {
        country: "Indonesia",
        description:
          "Medan, North Sumatra's vibrant capital and Indonesia's third-largest city, serves as gateway to the region's spectacular natural attractions while offering rich multicultural heritage. This diverse city blends Malay, Chinese, Indian, and Batak cultures, reflected in impressive architecture including the grand Maimun Palace, the stunning Great Mosque of Medan, and ornate Chinese temples. Medan is the primary access point for exploring Lake Toba, the world's largest volcanic lake with unique Batak culture, and Bukit Lawang, the famous orangutan rehabilitation center offering jungle trekking and wildlife encounters. The city's culinary scene excels with diverse influences—taste durian (the city's obsessed with this 'king of fruits'), enjoy authentic North Sumatran cuisine like soto Medan and nasi padang.",
        touristicFeatures: [
          "Maimun Palace - Grand Sultan's palace with Malay architecture",
          "Great Mosque of Medan - Stunning mosque with Moroccan and Indian influences",
          "Gateway to Lake Toba - Access point for world's largest volcanic lake",
          "Bukit Lawang - Nearby orangutan sanctuary and jungle trekking",
          "Tjong A Fie Mansion - Opulent Chinese merchant heritage house",
          "Multicultural Heritage - Malay, Chinese, Indian, and Batak cultural blend",
          "Durian Capital - Famous for 'king of fruits' with numerous durian stalls",
          "North Sumatran Cuisine - Soto Medan, nasi padang, and diverse food",
          "Merdeka Walk - Colonial Dutch architecture and heritage buildings",
          "Strategic Location - Gateway to North Sumatra's natural attractions",
        ],
      },
      Lombok: {
        country: "Indonesia",
        description:
          "Lombok, the stunning island east of Bali, offers pristine beaches, world-class surfing, and the magnificent Mount Rinjani without the crowds that overwhelm its famous neighbor. The island's southern coastline features spectacular white-sand beaches including Kuta Lombok, Selong Belanak, and Tanjung Aan with turquoise waters perfect for surfing and swimming. Mount Rinjani, Indonesia's second-highest volcano at 3,726 meters, attracts adventurous trekkers with challenging multi-day climbs rewarded by the stunning Segara Anak crater lake and hot springs. The Gili Islands off Lombok's northwest coast offer idyllic tropical paradise with no motorized vehicles, excellent snorkeling and diving with sea turtles, and laid-back island atmosphere. Lombok's indigenous Sasak culture provides authentic experiences visiting traditional villages with unique thatched-roof houses.",
        touristicFeatures: [
          "Mount Rinjani - 3,726m volcano with crater lake, hot springs, and challenging trek",
          "Gili Islands - Three idyllic islands with snorkeling, diving, and beach paradise",
          "Kuta Lombok Beaches - Pristine white-sand beaches with world-class surfing",
          "Sasak Culture - Traditional villages with unique thatched houses and weaving",
          "Tiu Kelep Waterfall - Beautiful jungle waterfall near Senaru village",
          "Pink Beach (Tangsi) - Rare pink sand beach with clear waters",
          "Selong Belanak - Horseshoe bay with gentle waves, perfect for surf lessons",
          "Traditional Weaving - Handwoven textiles and songket fabric demonstrations",
          "Senggigi Beach - Main beach resort area with hotels and sunset views",
          "Less Crowded Alternative - Bali's beauty without overwhelming tourist crowds",
        ],
      },
      Bogor: {
        country: "Indonesia",
        description:
          "Bogor, the 'Rain City' nestled in West Java's highlands just 60 kilometers south of Jakarta, serves as a popular weekend escape offering cooler temperatures, botanical wonders, and colonial charm. The city's crown jewel, the magnificent Bogor Botanical Gardens, ranks among the world's oldest and most extensive tropical gardens with 87 hectares showcasing over 15,000 plant species including giant water lilies, towering palms, and rare orchids. The adjacent Bogor Palace, one of six presidential palaces, features beautiful architecture and grounds with deer roaming freely. Bogor's frequent afternoon rainfall creates lush greenery and gives the city its 'Rain City' nickname along with pleasant climate averaging 26°C. With its botanical treasures, presidential palace, proximity to Jakarta, and role as gateway to highland tea estates, Bogor offers a refreshing tropical garden city experience.",
        touristicFeatures: [
          "Bogor Botanical Gardens - 87-hectare world-class garden with 15,000+ plant species",
          "Bogor Palace - Presidential palace with beautiful grounds and deer",
          "Cool Highland Climate - Pleasant temperatures with famous afternoon rains",
          "Taman Topi Square - Unique architecture with upside-down boat-shaped building",
          "Dutch Colonial Heritage - Historic buildings from colonial era",
          "Gateway to Puncak - Access to nearby tea plantations and highlands",
          "Giant Water Lilies - Famous Victoria amazonica in botanical garden ponds",
          "Bogor Cuisine - Local specialties including soto Bogor and talas snacks",
          "Educational Center - Research institutes and botanical science facilities",
          "Day Trip from Jakarta - Popular 60km weekend escape with cooler climate",
        ],
      },
      Malang: {
        country: "Indonesia",
        description:
          "Malang, East Java's charming highland city at 500 meters elevation, enchants with its cool climate, Dutch colonial architecture, and proximity to spectacular natural attractions. Often called 'The Paris of East Java,' this university city maintains a relaxed atmosphere with tree-lined streets and colorful traditional houses. Malang serves as the perfect base for exploring the dramatic Bromo-Tengger-Semeru National Park with Mount Bromo's ethereal volcanic landscape and surrounding sea of sand, best experienced at sunrise. The city's temperate climate, averaging 24°C year-round, attracts visitors seeking relief from tropical heat. Discover nearby natural wonders including Coban Rondo waterfall, the stunning blue waters of Coban Sewu waterfall, and the Instagram-famous Watu Tumpeng beach with rock formations.",
        touristicFeatures: [
          "Gateway to Mount Bromo - Base for Bromo-Tengger-Semeru National Park visits",
          "Dutch Colonial Architecture - Well-preserved buildings and colorful traditional houses",
          "Cool Highland Climate - Pleasant 24°C average temperatures year-round",
          "Kampung Warna-Warni - Rainbow-colored village houses creating vibrant photo spot",
          "Coban Rondo Waterfall - Beautiful waterfall in pine forest setting",
          "Coban Sewu Waterfall - Dramatic waterfall with stunning blue waters",
          "Balai Kota (City Hall) - Impressive Dutch colonial administrative building",
          "University Town - Lively student atmosphere with cafes and nightlife",
          "Traditional Markets - Local produce, flowers, and authentic shopping",
          "Javanese Culture - Authentic East Javanese food and cultural experiences",
        ],
      },
      Solo: {
        country: "Indonesia",
        description:
          "Solo (Surakarta), Central Java's royal city, preserves Javanese courtly culture and traditions more authentically than any other Indonesian city. Home to two functioning royal courts—the Kraton Surakarta Hadiningrat and the smaller Pura Mangkunegaran—this historic city maintains centuries-old traditions including gamelan music, batik craftsmanship, and classical Javanese dance performed in palace settings. Solo's batik industry, centered around Kampung Batik Laweyan and Kampung Batik Kauman, produces Indonesia's finest traditional batik using time-honored hand-waxing techniques. The city serves as gateway to nearby historical sites including Candi Sukuh and Sangiran Early Man Site (a UNESCO World Heritage archaeological site). With genuine Javanese royal culture, superior batik, affordable prices, and authentic atmosphere untouched by mass tourism, Solo offers cultural enthusiasts Indonesia's most traditional Javanese experience.",
        touristicFeatures: [
          "Royal Kratons - Two functioning palaces with traditional ceremonies and gamelan",
          "Batik Capital - Kampung Batik districts with traditional hand-waxing workshops",
          "Mangkunegaran Palace - Smaller royal court with museum and cultural performances",
          "Candi Sukuh - Unusual Hindu temple on Mount Lawu with unique architecture",
          "Sangiran - UNESCO World Heritage Site with ancient human fossils",
          "Pasar Gede Market - Historic traditional market with local products and jamu",
          "Classical Javanese Dance - Traditional performances in palace settings",
          "Solo Cuisine - Unique dishes including nasi liwet, serabi, and timlo",
          "Authentic Culture - Most traditional Javanese city, untouched by mass tourism",
          "Affordable Batik Shopping - High-quality traditional textiles at reasonable prices",
        ],
      },
      Ubud: {
        country: "Indonesia",
        description:
          "Ubud, Bali's cultural heart nestled among emerald rice terraces and lush river valleys, stands as the island's artistic soul where traditional Balinese culture flourishes amidst yoga retreats and creative communities. This enchanting town offers a completely different Bali experience from beach resorts—here, ancient temples hide in forests, artists create traditional paintings and wood carvings in village workshops, and daily Hindu ceremonies infuse daily life with spiritual rhythm. The Sacred Monkey Forest Sanctuary provides one of Bali's most magical experiences walking among ancient trees and moss-covered statues with hundreds of long-tailed macaques. Ubud's surrounding countryside features the stunning Tegallalang Rice Terraces creating iconic stepped green landscapes. The Ubud Royal Palace hosts nightly traditional dance performances including the mesmerizing Legong and Kecak fire dances.",
        touristicFeatures: [
          "Sacred Monkey Forest - Jungle temple complex with hundreds of playful macaques",
          "Tegallalang Rice Terraces - Iconic stepped rice paddies creating stunning landscapes",
          "Ubud Royal Palace - Palace hosting traditional Legong and Kecak dance performances",
          "Traditional Arts - Painting, wood carving, and silver crafts in village workshops",
          "Yoga & Wellness - World-class yoga studios, spas, and meditation retreats",
          "Campuhan Ridge Walk - Scenic ridge trail through rice fields and jungle",
          "Art Museums - ARMA, Neka Museum, and galleries showcasing Balinese art",
          "Organic Cafes - Health-focused restaurants and farm-to-table dining",
          "Hindu Temples - Ancient shrines including Tirta Empul holy spring temple",
          "Cultural Performances - Nightly traditional Balinese dance shows",
        ],
      },
      Sanur: {
        country: "Indonesia",
        description:
          "Sanur, Bali's original beach resort on the island's southeast coast, offers a more laid-back and family-friendly alternative to bustling Seminyak or Kuta. This tranquil beachside village features a beautiful 5-kilometer paved beachfront path perfect for walking, cycling, or jogging while watching traditional jukung fishing boats and spectacular sunrises over the ocean. The calm, shallow waters protected by offshore reefs make Sanur Beach ideal for swimming, especially for families with children, stand-up paddleboarding, and kitesurfing when winds pick up. The area maintains a relaxed, upscale atmosphere with boutique resorts and beachfront restaurants serving fresh seafood. Sanur's heritage as Bali's first tourist area means mature trees shade the streets, creating a green, established neighborhood feel.",
        touristicFeatures: [
          "Sanur Beach Promenade - 5km paved beachfront path for walking and cycling",
          "Calm Swimming Beach - Shallow, reef-protected waters ideal for families",
          "Spectacular Sunrises - East-facing beach offering beautiful morning views",
          "Traditional Jukung Boats - Colorful fishing boats adding authentic charm",
          "Fast Boat Hub - Departure point for Nusa Islands and Gili Islands",
          "Le Mayeur Museum - Belgian artist's home with paintings and Balinese heritage",
          "Kitesurfing - Popular spot for kitesurfing with seasonal winds",
          "Family-Friendly Resorts - Upscale yet relaxed beachfront accommodations",
          "Laid-Back Atmosphere - Quieter alternative to Kuta and Seminyak",
          "Mature Neighborhood - Tree-lined streets with established, green character",
        ],
      },
      Seminyak: {
        country: "Indonesia",
        description:
          "Seminyak, Bali's most sophisticated beach resort area north of Kuta, dazzles with upscale beach clubs, designer boutiques, world-class restaurants, and vibrant nightlife creating the island's most cosmopolitan atmosphere. The wide stretch of golden sand beach offers stunning sunset views, with legendary beach clubs like Potato Head, Ku De Ta, and La Plancha featuring infinity pools, DJs, cocktails, and lounging in style. Seminyak's restaurant scene rivals any global destination with acclaimed dining from Sarong to Merah Putih, innovative cafes, and beachfront seafood grills. The area's shopping ranges from high-end international boutiques to local designer shops showcasing Indonesian fashion, homewares, and jewelry. While more expensive than other Bali areas, Seminyak delivers luxury and sophistication with stylish villas and upscale spas.",
        touristicFeatures: [
          "Beach Clubs - Iconic venues like Potato Head and Ku De Ta with pools and DJs",
          "Sunset Beach - Wide golden sand beach with spectacular evening views",
          "World-Class Dining - Acclaimed restaurants including Sarong and Merah Putih",
          "Designer Shopping - Upscale boutiques and Indonesian designer stores",
          "Surfing - Consistent waves suitable for intermediate surfers",
          "Luxury Villas - Stylish private villa accommodations with pools",
          "Upscale Spas - Lavish treatment centers and wellness facilities",
          "Vibrant Nightlife - Bars, lounges, and clubs with cosmopolitan atmosphere",
          "Petitenget Temple - Local Hindu temple with traditional ceremonies",
          "Sophisticated Atmosphere - Bali's most fashionable and upscale beach area",
        ],
      },
      "Kuala Lumpur": {
        country: "Malaysia",
        description:
          "Kuala Lumpur, Malaysia's dynamic capital, dazzles as a modern metropolis where gleaming skyscrapers stand alongside colonial architecture and ancient temples. The iconic Petronas Twin Towers, standing at 452 meters, dominate the skyline as the world's tallest twin structures, offering observation decks with breathtaking city views. This multicultural city perfectly blends Malay, Chinese, and Indian cultures, evident in diverse neighborhoods like Chinatown with its bustling Petaling Street market and Little India's colorful shops. Marvel at historic landmarks including the stunning Sultan Abdul Samad Building, Merdeka Square where Malaysian independence was declared, and the beautiful Batu Caves—a limestone hill featuring ancient Hindu temples reached by climbing 272 rainbow-colored steps. The city's culinary scene is legendary, from hawker stalls serving affordable nasi lemak and satay to high-end restaurants. With efficient public transport including modern MRT systems, affordable prices, and world-class dining, Kuala Lumpur offers an unforgettable Southeast Asian urban experience.",
        touristicFeatures: [
          "Petronas Twin Towers - Iconic 452m twin skyscrapers with Sky Bridge and observation deck",
          "Batu Caves - Hindu temple complex in limestone caves with 272 colorful steps",
          "Chinatown & Petaling Street - Bustling markets, street food, and authentic atmosphere",
          "KL Tower - Communications tower with observation deck and revolving restaurant",
          "Merdeka Square - Historical independence square with colonial buildings",
          "KLCC Park - Beautiful 50-acre park at base of Petronas Towers",
          "Bukit Bintang - Shopping and entertainment district with malls and nightlife",
          "Central Market - Cultural landmark selling Malaysian crafts and artwork",
          "Street Food Paradise - Hawker stalls serving nasi lemak, satay, and local delicacies",
          "Thean Hou Temple - Stunning six-tiered Chinese temple with city views",
        ],
      },
      Penang: {
        country: "Malaysia",
        description:
          "Penang, the 'Pearl of the Orient,' enchants as a UNESCO World Heritage island destination where centuries of cultural fusion create Malaysia's most captivating heritage city. George Town, the historic capital, mesmerizes with its perfectly preserved colonial architecture and world-famous street art murals. This multicultural masterpiece blends Chinese, Indian, Malay, and European influences, reflected in stunning places of worship including the Kek Lok Si Temple (Southeast Asia's largest Buddhist temple complex), the Kapitan Keling Mosque, and numerous churches. Penang has earned legendary status as Malaysia's undisputed food capital—the island's hawker food scene is internationally acclaimed, with streets lined with vendors serving heavenly Char Kway Teow, Penang Assam Laksa, and Hokkien Mee. Escape to Penang Hill via funicular railway for cool mountain air and panoramic views, or relax at Batu Ferringhi Beach. The Clan Jetties—historic waterfront settlements built on stilts over the sea—offer unique cultural immersion.",
        touristicFeatures: [
          "George Town UNESCO Site - Preserved colonial architecture and heritage streets",
          "Penang Street Food - World-renowned hawker cuisine including Char Kway Teow",
          "Kek Lok Si Temple - Southeast Asia's largest Buddhist temple complex",
          "Street Art - Famous murals and sculptures throughout George Town",
          "Penang Hill - Funicular railway to hilltop with panoramic views",
          "Clan Jetties - Historic Chinese settlements on stilts over water",
          "Khoo Kongsi - Ornate clan house with intricate carvings",
          "Batu Ferringhi Beach - Beach resort area with water sports and night market",
          "Colonial Architecture - British-era buildings and heritage sites",
          "Multicultural Heritage - Temples, mosques, and churches reflecting diverse cultures",
        ],
      },
      Langkawi: {
        country: "Malaysia",
        description:
          "Langkawi, Malaysia's legendary tropical archipelago of 99 islands floating in the Andaman Sea, captivates as a duty-free paradise where pristine beaches meet ancient rainforests and dramatic limestone cliffs. The main island offers spectacular natural beauty with UNESCO Global Geopark status recognizing its 550-million-year-old rock formations. The breathtaking Langkawi Sky Bridge, a 125-meter curved pedestrian bridge suspended 660 meters above sea level, provides stunning views accessed via the Langkawi Cable Car ascending through the rainforest canopy. Langkawi's beaches rank among Southeast Asia's finest: Pantai Cenang buzzes with beach bars and water sports; Tanjung Rhu offers serene white sands. Explore natural wonders including the Kilim Karst Geoforest Park with mangrove tours spotting eagles and monkeys, and the Seven Wells Waterfall. The island's duty-free status makes it a shopping haven.",
        touristicFeatures: [
          "Langkawi Sky Bridge - Spectacular curved bridge 660m above sea level",
          "Cable Car (SkyCab) - Scenic ride to Mount Mat Cincang peak",
          "UNESCO Geopark - 550-million-year-old rock formations",
          "Pantai Cenang Beach - Main beach with water sports and vibrant atmosphere",
          "Duty-Free Shopping - Tax-free shopping for chocolates, alcohol, and electronics",
          "Kilim Geoforest Park - Mangrove tours and wildlife spotting",
          "Tanjung Rhu Beach - Pristine white sand beach with limestone backdrop",
          "Eagle Feeding - Boat tours to watch eagles swooping for fish",
          "Seven Wells Waterfall - Cascading waterfall with natural pools",
          "Island Hopping Tours - Explore nearby islands and snorkel",
        ],
      },
      Malacca: {
        country: "Malaysia",
        description:
          "Malacca (Melaka), Malaysia's most historically significant city and a UNESCO World Heritage Site, transports visitors through 600 years of colonial heritage where Portuguese, Dutch, and British influences blend with Malay and Chinese cultures. This compact riverside city preserves its multicultural past in remarkably intact colonial buildings and unique Peranakan heritage. The iconic red Dutch Square (Stadthuys) forms the historic heart with Christ Church Melaka (built 1753). Explore A Famosa fortress ruins, the last remaining Portuguese fortification in Asia dating to 1511, and climb St. Paul's Hill for sunset views. Jonker Street, the atmospheric heart of Chinatown, transforms into a vibrant weekend night market with antique shops and hawker stalls serving Nyonya cuisine—the unique Peranakan fusion of Chinese and Malay flavors. Take a scenic river cruise along the Malacca River past colorful murals.",
        touristicFeatures: [
          "UNESCO World Heritage Site - 600 years of colonial history preserved",
          "Dutch Square (Stadthuys) - Iconic red colonial buildings and Christ Church",
          "Jonker Street Night Market - Weekend market with antiques and Nyonya food",
          "A Famosa - Portuguese fortress ruins from 1511",
          "Malacca River Cruise - Scenic boat ride past murals and heritage buildings",
          "Baba-Nyonya Heritage Museum - Opulent Peranakan mansion",
          "St. Paul's Hill - Ruined church with panoramic city views",
          "Peranakan Cuisine - Unique Nyonya fusion of Chinese and Malay flavors",
          "Cheng Hoon Teng Temple - Malaysia's oldest functioning Chinese temple from 1673",
          "Compact Walkable City - Easy to explore historical sites on foot",
        ],
      },
      "Johor Bahru": {
        country: "Malaysia",
        description:
          "Johor Bahru, Malaysia's rapidly modernizing southern gateway strategically located across the causeway from Singapore, has transformed into a dynamic destination combining family entertainment, shopping havens, and cultural attractions. This border city serves as an increasingly popular alternative to expensive Singapore, offering affordable hotels, shopping, and dining just minutes across the causeway. The city's crown jewel, Legoland Malaysia, is Asia's first Legoland theme park featuring over 70 rides and attractions including the Water Park and SEA LIFE aquarium. The stunning Sultan Abu Bakar State Mosque showcases Victorian-Moorish architecture with views of Singapore's skyline. Shopping enthusiasts flock to massive complexes like Johor Premium Outlets with international designer brands at discount prices. The city's vibrant food scene combines Malay, Chinese, and Indian influences.",
        touristicFeatures: [
          "Legoland Malaysia - Asia's first Legoland with theme park and water park",
          "Sultan Abu Bakar Mosque - Victorian-Moorish hilltop mosque with Singapore views",
          "Johor Premium Outlets - Designer shopping with discounted international brands",
          "Gateway to Singapore - Connected by causeway, affordable alternative",
          "Arulmigu Glass Temple - Unique Hindu temple covered in colorful glass tiles",
          "Johor Bahru City Square - Major shopping and entertainment complex",
          "Grand Palace Museum - Royal Abu Bakar Museum with Johor heritage",
          "Danga Bay - Waterfront area with dining and recreational activities",
          "Johor Laksa - Local specialty noodle dish unique to the region",
          "Strategic Shopping Hub - Malls, night markets, and duty-free shopping",
        ],
      },
      "Kota Kinabalu": {
        country: "Malaysia",
        description:
          "Kota Kinabalu (KK), the vibrant coastal capital of Sabah in Malaysian Borneo, serves as the gateway to extraordinary natural wonders including Mount Kinabalu (Southeast Asia's highest peak at 4,095 meters), pristine tropical islands, and some of the world's best sunsets. This relaxed waterfront city combines modern amenities with easy access to incredible nature—the Tunku Abdul Rahman Marine Park, comprising five idyllic islands just 15 minutes by boat, offers crystal-clear waters, coral reefs, excellent snorkeling and diving. The legendary KK sunsets, best viewed from Tanjung Aru Beach, paint the sky in spectacular oranges and purples. The bustling Gaya Street Sunday Market offers local crafts, fresh produce, and Sabahan delicacies. Mount Kinabalu, a UNESCO World Heritage Site, attracts climbers worldwide for the challenging two-day trek to Low's Peak. Discover Sabah's indigenous cultures at the Mari Mari Cultural Village.",
        touristicFeatures: [
          "Tunku Abdul Rahman Marine Park - Five tropical islands with snorkeling",
          "Mount Kinabalu - Southeast Asia's highest peak at 4,095m, UNESCO site",
          "Legendary Sunsets - World-famous sunset views from Tanjung Aru Beach",
          "Gaya Street Sunday Market - Weekly market with local crafts and food",
          "Signal Hill Observatory - Panoramic city and sea views",
          "Mari Mari Cultural Village - Experience indigenous Sabahan cultures",
          "Filipino Market - Waterfront market with fresh seafood",
          "Lok Kawi Wildlife Park - See proboscis monkeys and orangutans",
          "Sabahan Cuisine - Unique dishes like Hinava and Tuaran Mee",
          "Island Hopping - Day trips to pristine islands",
        ],
      },
      Kuching: {
        country: "Malaysia",
        description:
          "Kuching, Sarawak's charming 'Cat City' capital on Borneo island, enchants as a UNESCO Creative City of Gastronomy where colonial heritage meets indigenous Dayak culture along the scenic Sarawak River. This laid-back yet culturally rich city maintains Old World charm with its beautifully restored waterfront and colonial buildings. The picturesque Kuching Waterfront stretches for nearly a kilometer with riverside promenades and restaurants. Kuching serves as the gateway to Borneo's incredible wildlife adventures: visit the Semenggoh Wildlife Centre to see orangutans during feeding times, explore the UNESCO-listed Gunung Mulu National Park with the world's largest cave chamber, or discover Bako National Park with its rare proboscis monkeys. The city's cultural tapestry shines in museums and the Sarawak Cultural Village showcasing traditional longhouses. Sarawak Laksa, a distinctive noodle soup, represents the must-try local dish.",
        touristicFeatures: [
          "Kuching Waterfront - Scenic 1km riverside promenade with colonial buildings",
          "Semenggoh Wildlife Centre - Orangutan rehabilitation center",
          "UNESCO Creative City - Recognized for exceptional Sarawakian cuisine",
          "Bako National Park - Wildlife sanctuary with proboscis monkeys",
          "Gunung Mulu National Park - UNESCO site with world's largest cave chamber",
          "Sarawak Cultural Village - Living museum showcasing indigenous longhouses",
          "Cat Statues & Museum - City's unique feline theme",
          "Sarawak Laksa - Distinctive local noodle soup specialty",
          "Colonial Architecture - White Rajah heritage with Astana",
          "Indigenous Crafts - Iban weavings and traditional handicrafts",
        ],
      },
      "Cameron Highlands": {
        country: "Malaysia",
        description:
          "Cameron Highlands, Malaysia's premier hill station nestled in the cool mountains of Pahang at 1,500 meters elevation, offers blessed escape from tropical heat with its temperate climate, endless rolling tea plantations, and misty mountain scenery. This vast highland plateau maintains average temperatures of 18-25°C year-round, making it a refreshing retreat. The region's iconic BOH Tea Plantations carpet entire hillsides in vibrant green terraces—visit the BOH Sungei Palas Tea Centre for guided tours and tea tastings while overlooking endless emerald slopes. Cameron Highlands delights with numerous strawberry farms where visitors pick their own berries, and explore butterfly gardens, rose gardens, and lavender farms. Adventure into the mystical Mossy Forest, an ancient ecosystem creating an otherworldly atmosphere. The charming towns of Tanah Rata and Brinchang offer colonial-era cottages and traditional English-style teahouses.",
        touristicFeatures: [
          "BOH Tea Plantations - Vast tea estates with tours and tastings",
          "Cool Mountain Climate - Pleasant 18-25°C temperatures year-round",
          "Strawberry Farms - Pick-your-own strawberries and farm tours",
          "Mossy Forest - Mystical ancient ecosystem on mountain peaks",
          "Tea Factory Tours - Learn tea processing and taste fresh teas",
          "Butterfly & Rose Gardens - Colorful gardens with floral displays",
          "Tanah Rata Town - Colonial-era charm with restaurants",
          "Hiking Trails - Mountain trails through jungle and tea estates",
          "English-Style Scones - Traditional afternoon tea with strawberry jam",
          "Night Markets - Local produce and highland vegetables",
        ],
      },
      "Genting Highlands": {
        country: "Malaysia",
        description:
          "Genting Highlands, Malaysia's 'City of Entertainment' perched atop misty mountains at 1,800 meters elevation just one hour from Kuala Lumpur, dazzles as an integrated resort destination offering cool mountain climate, world-class entertainment, and Southeast Asia's only legal casino. The journey itself thrills—the Awana Skyway cable car soars spectacularly above lush rainforest canopy. This mountain resort city centers around Resorts World Genting, a massive entertainment complex featuring the glamorous Casino de Genting, numerous restaurants, and shopping outlets. The Genting SkyWorlds Theme Park offers 26 movie-themed rides including the world's first Jurassic World indoor roller coaster. Cool temperatures averaging 15-25°C provide relief from lowland heat. Visit the serene Chin Swee Caves Temple with its ornate pagodas. With cable car thrills, casino excitement, theme park adventures, and cool climate, Genting Highlands delivers Malaysia's most complete entertainment-focused mountain escape.",
        touristicFeatures: [
          "Awana Skyway Cable Car - Southeast Asia's longest gondola with glass floors",
          "Casino de Genting - Malaysia's only legal land-based casino",
          "Genting SkyWorlds Theme Park - Movie-themed rides including Jurassic World",
          "Cool Mountain Climate - Refreshing 15-25°C temperatures",
          "Resorts World Genting - Massive integrated resort with hotels",
          "Chin Swee Caves Temple - Buddhist temple with pagodas and mountain views",
          "Shopping & Dining - Outlets and restaurants in resort complex",
          "Genting Strawberry Farm - Pick strawberries in cool climate",
          "Rainforest Cable Car Views - Spectacular journey above jungle canopy",
          "One Hour from KL - Easy day trip from capital",
        ],
      },
      Selangor: {
        country: "Malaysia",
        description:
          "Selangor, Malaysia's most developed and prosperous state surrounding Kuala Lumpur, offers diverse attractions from its capital Shah Alam's modern Islamic architecture to natural wonders and theme parks. Shah Alam stands out with the magnificent Sultan Salahuddin Abdul Aziz Shah Mosque (the Blue Mosque)—one of Southeast Asia's largest mosques featuring stunning blue and silver domes accommodating 24,000 worshippers. The futuristic i-City in Shah Alam transforms into a dazzling LED wonderland after dark with millions of colorful lights. Selangor encompasses numerous attractions: Sunway Lagoon—a world-class multi-park destination with water park, amusement rides, and wildlife park all in one location. Nature lovers explore the Kuala Selangor Nature Park for firefly watching along the river—thousands of synchronized fireflies lighting up mangrove trees create a magical nighttime spectacle, while Bukit Melawati offers historical fort ruins.",
        touristicFeatures: [
          "Blue Mosque (Shah Alam) - Massive mosque with stunning blue domes",
          "i-City LED Theme Park - Digital light park with millions of LED lights",
          "Firefly Watching - Magical synchronized firefly displays",
          "Sunway Lagoon - Multi-park destination with water park and theme park",
          "Bukit Melawati - Historical fort ruins on hilltop with monkeys",
          "Shah Alam Gallery - State gallery showcasing art exhibitions",
          "Sultan Abdul Aziz Gallery - Royal heritage and Selangor regalia",
          "Agricultural Parks - Farms and agro-tourism attractions",
          "Strategic Location - Surrounds KL with easy access to capital",
          "Modern Infrastructure - Well-developed state with excellent facilities",
        ],
      },
      Bangkok: {
        country: "Thailand",
        description:
          "Bangkok, Thailand's exhilarating capital known as the 'City of Angels,' mesmerizes as a dynamic metropolis where glittering golden temples coexist with futuristic skyscrapers and ancient traditions thrive amidst contemporary energy. This vibrant city along the Chao Phraya River serves as Thailand's political, economic, and cultural heart. The magnificent Grand Palace complex dazzles with its intricate golden spires and the sacred Wat Phra Kaew housing the revered Emerald Buddha. Explore hundreds of ornate temples including Wat Pho with its enormous 46-meter Reclining Buddha and Wat Arun (Temple of Dawn) with its iconic riverside spires. Experience legendary Thai street food at every corner with Michelin-starred street food stalls. The famous Chatuchak Weekend Market, one of the world's largest markets, sells everything imaginable. With efficient BTS Skytrain and MRT systems, affordable prices, and endless energy, Bangkok delivers an unforgettable Southeast Asian urban adventure.",
        touristicFeatures: [
          "Grand Palace & Emerald Buddha - Ornate royal complex with Thailand's most sacred Buddha",
          "Wat Pho - Giant 46m Reclining Buddha and traditional Thai massage school",
          "Wat Arun (Temple of Dawn) - Iconic riverside temple with porcelain-covered spires",
          "Chatuchak Weekend Market - Massive market with 15,000+ stalls",
          "Street Food Paradise - Michelin-starred street stalls serving legendary cuisine",
          "Floating Markets - Traditional canal markets like Damnoen Saduak",
          "Khao San Road - Famous backpacker street with bars and street vendors",
          "Chao Phraya River - Long-tail boat rides through canals and temples",
          "Rooftop Sky Bars - Spectacular city views from bars like Sky Bar",
          "BTS Skytrain & MRT - Efficient modern transit system",
        ],
      },
      Phuket: {
        country: "Thailand",
        description:
          "Phuket, Thailand's largest island and the 'Pearl of the Andaman,' captivates as Southeast Asia's most famous beach destination where powder-white sands, crystal-clear turquoise waters, and dramatic limestone cliffs create tropical paradise. The island offers stunning beaches for every taste: Patong Beach buzzes with nightlife and water sports; Kata and Karon beaches provide softer sand; while Bang Tao and Surin offer upscale resort tranquility. Phuket Town's beautifully restored Old Town showcases colorful Sino-Portuguese mansions and vibrant markets. The island serves as gateway to spectacular day trips to Phang Nga Bay with James Bond Island, the Similan Islands for world-class diving, and the famous Phi Phi Islands. The 45-meter-tall Big Buddha offers panoramic island views. With stunning beaches, cultural sites, and island adventures, Phuket remains Thailand's premier island destination.",
        touristicFeatures: [
          "Patong Beach - Main beach with nightlife and Bangla Road",
          "Phuket Old Town - Colorful Sino-Portuguese architecture",
          "Phi Phi Islands - Famous day trip destination with Maya Bay",
          "Phang Nga Bay - Limestone karsts and James Bond Island",
          "Big Buddha - 45m white marble statue with panoramic views",
          "Kata & Karon Beaches - Beautiful beaches with better surf",
          "Similan Islands - World-class diving and snorkeling",
          "Wat Chalong - Phuket's most important Buddhist temple",
          "Promthep Cape - Famous for spectacular sunsets",
          "Island Hopping - Explore numerous islands with pristine beaches",
        ],
      },
      "Chiang Mai": {
        country: "Thailand",
        description:
          "Chiang Mai, the enchanting 'Rose of the North' nestled in Thailand's mountainous highlands, captivates as the cultural and spiritual heart of northern Thailand where over 300 ancient temples and traditional Lanna heritage create a completely different Thailand experience. The atmospheric Old City, surrounded by a square moat and ancient walls, is packed with historic temples including Wat Phra Singh and Wat Chedi Luang. The sacred mountain temple Wat Phra That Doi Suthep, perched at 1,073 meters, is reached via a dramatic 306-step naga staircase. The legendary Sunday Walking Street transforms the entire Old City into a massive market with handicrafts, silk, and endless street food. Surrounding mountains offer incredible experiences: visit ethical elephant sanctuaries, trek to hilltribe villages, or zip-line through rainforest. Chiang Mai has become a digital nomad hub with countless cozy cafes.",
        touristicFeatures: [
          "Wat Phra That Doi Suthep - Sacred hilltop temple with 306 steps",
          "Old City Temples - Over 300 temples with ancient architecture",
          "Sunday Walking Street - Massive weekly market closing Old City to traffic",
          "Night Bazaar - Famous market with handicrafts and street food",
          "Ethical Elephant Sanctuaries - Bathe and feed rescued elephants",
          "Thai Cooking Classes - Learn authentic northern Thai dishes",
          "Hilltribe Trekking - Mountain treks visiting traditional villages",
          "Doi Inthanon National Park - Thailand's highest mountain",
          "Lanna Culture - Northern Thai heritage with traditional crafts",
          "Digital Nomad Hub - Countless cafes with excellent coffee and wifi",
        ],
      },
      Pattaya: {
        country: "Thailand",
        description:
          "Pattaya, Thailand's most famous beach resort city on the Eastern Gulf coast just 150 kilometers from Bangkok, has evolved into a vibrant destination offering beautiful beaches, family attractions, and legendary nightlife. Pattaya Beach stretches 4 kilometers with water sports, while quieter Jomtien Beach offers windsurfing. The Sanctuary of Truth, an enormous 105-meter-tall wooden temple entirely hand-carved from teak without a single nail, showcases intricate religious motifs. Family-friendly attractions include Nong Nooch Tropical Garden, one of the world's most beautiful botanical gardens, and nearby Coral Island (Koh Larn) with pristine beaches. Walking Street, Pattaya's famous 500-meter entertainment zone, transforms into a neon-lit carnival after 6pm. With diverse attractions and easy Bangkok access, Pattaya remains a popular destination.",
        touristicFeatures: [
          "Sanctuary of Truth - Massive 105m hand-carved wooden temple",
          "Pattaya Beach - 4km main beach with water sports",
          "Walking Street - Famous 500m nightlife entertainment zone",
          "Nong Nooch Tropical Garden - World-class botanical garden",
          "Coral Island (Koh Larn) - Pristine island beaches 45 minutes by ferry",
          "Jomtien Beach - Quieter southern beach with windsurfing",
          "Underwater World Pattaya - Aquarium with underwater tunnel",
          "Floating Market - Four Regions Floating Market with Thai culture",
          "Cabaret Shows - Famous ladyboy cabaret performances",
          "Easy Bangkok Access - Just 150km from capital",
        ],
      },
      Krabi: {
        country: "Thailand",
        description:
          "Krabi, Thailand's spectacular Andaman Coast province, stands as nature's masterpiece where towering limestone karsts rise dramatically from emerald waters. This province serves as gateway to over 150 islands and Thailand's most iconic beaches. The stunning Railay Beach, accessible only by long-tail boat, features four interconnected beaches beneath sheer limestone cliffs—a rock-climbing paradise with over 700 bolted routes. Ao Nang, the main beach town, offers island-hopping adventures including the famous Four Islands Tour. The emerald-green Emerald Pool in virgin rainforest offers natural swimming, while the Tiger Cave Temple challenges visitors with 1,237 steps to summit views of limestone karsts and Andaman Sea. With dramatic landscapes, world-class climbing, and pristine islands, Krabi offers Thailand's most breathtaking coastal scenery.",
        touristicFeatures: [
          "Railay Beach - Stunning limestone cliff beach accessible only by boat",
          "Four Islands Tour - Island hopping to Phra Nang Cave and pristine beaches",
          "Rock Climbing - Over 700 routes, world-class climbing destination",
          "Emerald Pool - Natural swimming hole in virgin rainforest",
          "Tiger Cave Temple - 1,237 steps to summit for panoramic views",
          "Ao Nang Beach - Main beach town hub with restaurants",
          "Phi Phi Islands Access - Day trips to nearby Phi Phi islands",
          "Hong Islands - Lagoon islands with dramatic karsts",
          "Krabi Town - Authentic Thai town with night market",
          "150+ Islands - Gateway to numerous islands with pristine beaches",
        ],
      },
      "Koh Samui": {
        country: "Thailand",
        description:
          "Koh Samui, Thailand's second-largest island floating in the Gulf of Thailand, enchants as an idyllic tropical paradise where coconut palm-fringed beaches, luxury resorts, and laid-back island atmosphere create the perfect blend of relaxation and adventure. The island offers diverse beach experiences: Chaweng Beach, the longest, buzzes with beach clubs and nightlife; Lamai Beach provides a quieter alternative; while secluded beaches offer tranquil luxury. The iconic Big Buddha, a gleaming 12-meter golden statue, sits majestically on a small connected island. Discover the magical Secret Buddha Garden hidden in jungle-covered hills. Experience Ang Thong National Marine Park, an archipelago of 42 islands with dramatic limestone mountains and the stunning Emerald Lake viewpoint. Fisherman's Village in Bophut transforms into a charming Walking Street every Friday with lanterns and seafood.",
        touristicFeatures: [
          "Chaweng Beach - Main 7km beach with nightlife and beach clubs",
          "Big Buddha - Iconic 12-meter golden Buddha statue",
          "Ang Thong Marine Park - 42-island archipelago with Emerald Lake",
          "Lamai Beach - Second main beach with Grandmother and Grandfather Rocks",
          "Fisherman's Village Bophut - Friday Walking Street with lanterns",
          "Secret Buddha Garden - Hidden hilltop garden with statues",
          "Luxury Beach Resorts - World-class resorts along coastline",
          "Na Muang Waterfalls - Twin waterfalls with natural pools",
          "Coconut Groves - Working coconut plantations",
          "Island Hopping - Access to nearby Koh Phangan and Koh Tao",
        ],
      },
      Ayutthaya: {
        country: "Thailand",
        description:
          "Ayutthaya, Thailand's magnificent ancient capital and a UNESCO World Heritage Site, transports visitors 400 years back in time to when this powerful city-state ruled Southeast Asia. From 1350 to 1767, Ayutthaya served as the glorious capital of the Siamese Kingdom—until Burmese armies destroyed it in 1767, leaving behind atmospheric ruins. The sprawling Ayutthaya Historical Park preserves dozens of temple ruins and Buddha statues—explore by bicycle for the most atmospheric experience. Wat Mahathat features the iconic Buddha head entwined in ancient tree roots, Thailand's most photographed image. Wat Phra Si Sanphet showcases three distinctive chedis in classic Ayutthaya style, while Wat Chaiwatthanaram resembles Cambodia's Angkor Wat. Take scenic boat tours around the island city encircled by three rivers. Just 80km north of Bangkok, it's an easy and rewarding day trip.",
        touristicFeatures: [
          "UNESCO World Heritage Site - Ancient capital ruins from 1350-1767",
          "Wat Mahathat - Iconic Buddha head in tree roots",
          "Wat Phra Si Sanphet - Three chedis of royal temple",
          "Wat Chaiwatthanaram - Stunning riverside Khmer-style temple",
          "Bicycle Tours - Explore ruins by bike through historical park",
          "River Boat Cruises - Circle island city passing temples",
          "Bang Pa-In Palace - Nearby royal summer palace",
          "Giant Buddha Statues - Massive reclining and seated Buddha images",
          "Night Temple Illumination - Ruins beautifully lit after dark",
          "Easy Day Trip from Bangkok - Just 80km north",
        ],
      },
      "Hua Hin": {
        country: "Thailand",
        description:
          "Hua Hin, Thailand's original beach resort and the Thai royal family's beloved seaside retreat since the 1920s, offers a more refined and family-friendly alternative with its long sandy beach, excellent seafood, and vibrant night markets. This elegant coastal town, 200 kilometers south of Bangkok, maintains a sophisticated Thai-oriented atmosphere—the presence of the royal Klai Kangwon Palace lends prestige. The 5-kilometer Hua Hin Beach provides peaceful beachfront strolls and horseback riding along the sand. The legendary Hua Hin Night Market transforms the town center into a culinary paradise with endless stalls serving fresh grilled seafood. The artistic Cicada Weekend Market offers upscale market experience with handmade crafts and live music. Hua Hin's heritage shines in the beautifully restored historic Railway Station. Nearby Khao Takiab offers hilltop temple views, while world-class golf courses make Hua Hin a golfer's paradise.",
        touristicFeatures: [
          "Royal Beach Resort - Thai royal family's favorite retreat since 1920s",
          "Hua Hin Beach - 5km sandy beach with horseback riding",
          "Hua Hin Night Market - Famous market with fresh seafood",
          "Cicada Weekend Market - Upscale arts and crafts market",
          "Historic Railway Station - Thailand's most beautiful train station",
          "Khao Takiab (Monkey Mountain) - Hilltop temple with monkeys",
          "World-Class Golf Courses - Multiple championship golf courses",
          "Maruekhathaiyawan Palace - Elegant seaside teakwood royal palace",
          "Family-Friendly Atmosphere - Refined resort town",
          "Easy Bangkok Weekend Escape - 3-hour drive from capital",
        ],
      },
      "Chiang Rai": {
        country: "Thailand",
        description:
          "Chiang Rai, Thailand's northernmost province bordering Myanmar and Laos, captivates as an artistic and cultural haven where contemporary temple architecture reaches unprecedented creativity. This laid-back city, far less touristy than Chiang Mai, has gained international fame for its extraordinary temples: the dazzling Wat Rong Khun (White Temple), a contemporary masterpiece entirely covered in white plaster and mirrored glass creating an ethereal appearance; the stunning Wat Rong Suea Ten (Blue Temple) with its deep blue exterior and intricate gold designs; and the Black House (Baan Dam Museum) with 40 black buildings filled with dark art installations. The Golden Triangle, where the Mekong River forms the border between Thailand, Myanmar, and Laos, offers the Hall of Opium Museum and views of three countries meeting. Explore hilltribe villages in surrounding mountains and experience authentic northern Thai culture.",
        touristicFeatures: [
          "Wat Rong Khun (White Temple) - Stunning all-white temple with mirror glass",
          "Wat Rong Suea Ten (Blue Temple) - Vibrant blue temple with gold designs",
          "Black House (Baan Dam Museum) - Dark art museum with 40 buildings",
          "Golden Triangle - Three-country border point with Mekong views",
          "Hall of Opium Museum - Museum explaining region's opium history",
          "Hilltribe Villages - Visit Akha, Lahu, and Karen communities",
          "Singha Park - Vast farm with tea plantations and ziplines",
          "Night Bazaar - Evening market with local crafts",
          "Mae Fah Luang Garden - Beautiful royal botanical garden",
          "Less Touristy Alternative - Authentic northern Thailand",
        ],
      },
      Kanchanaburi: {
        country: "Thailand",
        description:
          "Kanchanaburi, the historically poignant yet naturally beautiful province in western Thailand, is forever associated with the infamous Death Railway and Bridge over the River Kwai from World War II, yet also captivates with spectacular waterfalls and jungle rivers. The Bridge over the River Kwai, built by Allied POWs under brutal conditions, stands as a somber memorial—walk across the steel bridge still used by trains today. The stunning Erawan National Park features the magnificent seven-tiered Erawan Waterfall, each level offering emerald pools for swimming. Float down the River Kwai on bamboo rafts and stay in unique floating raft houses. Explore the dramatic Hellfire Pass Memorial walking trail and museum documenting the harrowing construction story. With WWII history combined with natural beauty, Kanchanaburi offers a moving and scenic destination just 130km west of Bangkok.",
        touristicFeatures: [
          "Bridge over River Kwai - Famous WWII bridge, walk across",
          "Death Railway & Museums - JEATH Museum and Allied War Cemetery",
          "Erawan Waterfall - Seven-tiered waterfall with emerald pools",
          "Hellfire Pass Memorial - Trail and museum honoring POW workers",
          "River Kwai Floating Hotels - Unique bamboo raft accommodations",
          "Bamboo Rafting - Float down River Kwai through jungle",
          "Prasat Muang Singh - Ancient Khmer temple ruins",
          "Sai Yok National Park - Waterfalls and jungle trekking",
          "Historical Significance - WWII history with natural beauty",
          "Easy Bangkok Day Trip - 130km west of capital",
        ],
      },
      Baku: {
        country: "Azerbaijan",
        description:
          "Baku, Azerbaijan's mesmerizing capital on the Caspian Sea shores, dazzles as a city where East meets West, where ancient Silk Road heritage merges with futuristic skyscrapers creating one of the world's most unique urban landscapes. This cosmopolitan metropolis of over 2 million serves as the Caucasus region's largest and most dynamic city. The UNESCO-listed Old City (Icherisheher) transports visitors to medieval times with its cobblestone streets, the iconic 12th-century Maiden Tower, and the magnificent Palace of the Shirvanshahs. The modern city features the iconic Flame Towers—three flame-shaped skyscrapers with LED displays representing Azerbaijan's fire worship heritage—and the stunning Heydar Aliyev Center designed by Zaha Hadid. Stroll the elegant Baku Boulevard along the Caspian waterfront, explore Fountains Square, and visit the Carpet Museum shaped like a rolled carpet. With its blend of ancient and modern, Baku offers an unforgettable Caucasus experience.",
        touristicFeatures: [
          "Old City (Icherisheher) - UNESCO medieval walled city with Maiden Tower",
          "Flame Towers - Iconic trio of flame-shaped skyscrapers with LED displays",
          "Heydar Aliyev Center - Zaha Hadid's futuristic architectural masterpiece",
          "Palace of Shirvanshahs - 15th-century royal palace complex",
          "Baku Boulevard - Seaside promenade along Caspian Sea",
          "Azerbaijan Carpet Museum - Building shaped like rolled carpet",
          "Fountain Square - Central square with shopping and dining",
          "Modern Art Museum - Contemporary art collection",
          "Caspian Sea Waterfront - Stunning seafront with beaches",
          "Oil Boom Architecture - Mix of historic and modern petroleum wealth",
        ],
      },
      Ganja: {
        country: "Azerbaijan",
        description:
          "Ganja, Azerbaijan's second-largest city and ancient cultural capital, enchants as a 2,000-year-old settlement where Persian poetry, Islamic architecture, and Azerbaijani traditions blend in the birthplace of legendary poet Nizami Ganjavi. This historic city nestled in the Lesser Caucasus foothills served as a major Silk Road trading hub. The magnificent Nizami Mausoleum honors Azerbaijan's greatest poet, while the quirky Bottle House—constructed from 48,000 glass bottles—has become an iconic attraction. The beautiful Javad Khan Street buzzes with cafes and architectural gems. Explore the atmospheric Juma Mosque with its distinctive cylindrical brick minaret from 1606, wander through Heydar Aliyev Park, and discover the city's wine-making tradition. Lake Goygol, just 50 kilometers away in the Caucasus mountains, offers breathtaking natural beauty with crystal-clear alpine waters.",
        touristicFeatures: [
          "Nizami Mausoleum - Modern tribute to 12th-century Persian poet",
          "Bottle House - Unique residence built from 48,000 glass bottles",
          "Javad Khan Street - Main pedestrian boulevard with historic architecture",
          "Juma Mosque - 17th-century mosque with distinctive brick minaret",
          "Lake Goygol - Stunning mountain lake 50km from city",
          "Ganja Gate - Reconstructed ancient city gate",
          "Shah Abbas Caravanserai - Historic Silk Road trading post",
          "Heydar Aliyev Park - Large park with fountains",
          "Wine-making Tradition - Local vineyards and wine culture",
          "Nizami's Birthplace - Birthplace of Azerbaijan's national poet",
        ],
      },
      Sumgayit: {
        country: "Azerbaijan",
        description:
          "Sumgayit, Azerbaijan's third-largest city proudly designated 'Youth Capital 2025,' rises as a dynamic industrial and cultural hub on the Caspian Sea coast just 30 kilometers north of Baku, transforming from Soviet-era petrochemical center into a modern city embracing environmental sustainability and youth culture. Founded in 1949, this city of 427,000 has evolved into a greener metropolis with extensive parks and modern facilities. The beautiful Sumgayit Boulevard stretches along the Caspian seafront offering beaches and cafes. The city's Olympic Sports Complex hosts international competitions, while the striking Sumgayit State Drama Theatre features unique circular design. Visit the expansive Heydar Aliyev Park, explore Caspian beaches, and experience the city's transformation. The nearby Shirvan National Park protects rare gazelles and desert landscapes.",
        touristicFeatures: [
          "Youth Capital 2025 - Designated hub for youth culture",
          "Sumgayit Boulevard - Seaside promenade along Caspian",
          "Olympic Sports Complex - Modern facilities hosting competitions",
          "Sumgayit State Drama Theatre - Distinctive circular building",
          "Heydar Aliyev Park - Large green space with facilities",
          "Caspian Beaches - Clean beaches along the coast",
          "Environmental Transformation - City's shift toward sustainability",
          "Industrial Heritage - Former Soviet petrochemical center",
          "Shirvan National Park - Nearby nature reserve with gazelles",
          "Easy Baku Access - Just 30km from capital",
        ],
      },
      Mingachevir: {
        country: "Azerbaijan",
        description:
          "Mingachevir, romantically known as Azerbaijan's 'City of Lights,' glows as the country's energy capital on the banks of the Kura River, dominated by one of the world's largest earth-fill dams creating the vast Mingachevir Reservoir. This strategically important city of 103,000 serves as Azerbaijan's fourth-largest urban center and electricity generation hub. The impressive dam, built in the 1950s, generates up to 402 megawatts while creating a 605-square-kilometer artificial lake that provides irrigation and recreation. The city's riverside setting offers beautiful waterfront parks along the Kura River, while the Mingachevir History Museum showcases ancient artifacts from the Early Iron Age. Enjoy fresh fish restaurants featuring the reservoir's catch, explore green parks, and visit during summer when beaches come alive with locals enjoying Azerbaijan's largest lake.",
        touristicFeatures: [
          "Mingachevir Dam - Massive hydroelectric dam and power station",
          "Mingachevir Reservoir - Azerbaijan's largest lake, 605 sq km",
          "City of Lights - Electricity generation hub powering the nation",
          "Kura River Waterfront - Scenic riverside parks and promenades",
          "Water Sports & Fishing - Boating and fishing on reservoir",
          "History and Ethnography Museum - Ancient archaeological artifacts",
          "Energy Tourism - Tours of hydroelectric facilities",
          "Beach Recreation - Summer beaches along reservoir shores",
          "Fresh Fish Restaurants - Local cuisine featuring reservoir catch",
          "Strategic Location - Energy and transportation hub",
        ],
      },
      Gabala: {
        country: "Azerbaijan",
        description:
          "Gabala (Qabala), Azerbaijan's premier mountain resort destination and ancient historical center, captivates as the perfect blend of outdoor adventure and natural beauty in the stunning Greater Caucasus Mountains, transforming from 2,000-year-old Silk Road city to modern tourism hotspot. This scenic city serves as gateway to Azerbaijan's most spectacular mountain landscapes and family entertainment hub. The crown jewel is Tufandag Mountain Resort, Azerbaijan's premier ski destination with an advanced cable car system ascending to 3,000 meters offering year-round activities: skiing in winter, mountain biking and hiking in summer. Gabala Entertainment Center, one of the largest amusement parks in the Caucasus, delights families with roller coasters and attractions. Explore the ancient Gabala Archaeological Center with remnants dating to the 4th century BC, visit beautiful Nohur Lake nestled in forested mountains, and attend the annual Gabala International Music Festival.",
        touristicFeatures: [
          "Tufandag Mountain Resort - Premier ski resort with cable car to 3,000m",
          "Gabala Entertainment Center - Large Caucasus amusement park",
          "Nohur Lake - Picturesque mountain lake surrounded by forests",
          "Gabala Archaeological Center - Ruins of ancient 4th-century BC city",
          "Gabaland - Traditional Azerbaijani-themed amusement park",
          "Gabala International Music Festival - Annual classical music event",
          "Year-Round Mountain Activities - Skiing, hiking, mountain biking",
          "Seven Beauties Waterfall - Multi-tiered mountain waterfall",
          "Traditional Mountain Villages - Authentic Caucasus village culture",
          "Yeddi Gozel Waterfall - Scenic cascade in forested mountains",
        ],
      },
      Shaki: {
        country: "Azerbaijan",
        description:
          "Shaki (Sheki), Azerbaijan's most picturesque and historically significant mountain town, enchants as a UNESCO World Heritage treasure where Silk Road caravanserais and the spectacular Khan's Palace with its stained glass mastery create an unforgettable journey. This charming city of 65,000 nestled in the Greater Caucasus foothills served for centuries as a crucial Silk Road trading hub. The breathtaking Palace of Shaki Khans, an 18th-century masterpiece, features walls covered in intricate frescoes and stunning shebeke (traditional stained glass) windows created from thousands of hand-cut colored glass pieces without any glue or nails—sunlight creates kaleidoscopic patterns on interior walls. The beautifully restored Upper and Lower Caravanserais now house craft shops, restaurants, and small hotels. Explore Shaki's fortress walls offering panoramic valley views, visit active workshops where artisans create traditional shebeke windows, and sample Shaki's famous halva.",
        touristicFeatures: [
          "Palace of Shaki Khans - UNESCO site with spectacular stained glass",
          "Shebeke Stained Glass - Traditional art of cut glass without glue",
          "Silk Road Caravanserais - Restored merchants' inns",
          "Shaki Fortress - Ancient fortress walls with panoramic views",
          "Traditional Crafts - Active workshops for shebeke and embroidery",
          "Shaki Halva - Famous local sweet made with rice flour",
          "Albanian Church - Ancient church with mountain backdrop",
          "Artisan Workshops - Watch craftsmen create traditional arts",
          "Mountain Scenery - Stunning Greater Caucasus foothill location",
          "UNESCO World Heritage - Protected historical site",
        ],
      },
      Lankaran: {
        country: "Azerbaijan",
        description:
          "Lankaran, Azerbaijan's southernmost coastal gem on the Caspian Sea, enchants as a subtropical paradise where Persian influences, Talysh culture, lush tea plantations, and pristine beaches create a distinctly different Azerbaijan experience. This historic city of 52,000 serves as capital of the Talysh region, blessed with unique humid subtropical climate allowing cultivation of tea, citrus fruits, and rice that don't grow elsewhere in Azerbaijan—earning its reputation as the country's 'tea capital.' The beautiful Lankaran coastline offers sandy beaches, while the dramatic Talysh Mountains rising behind create stunning contrasts. Visit working tea plantations in surrounding hills, explore the Khanbulanchay River flowing through the city center, and discover the region's unique Talysh culture. The nearby Hirkan National Park, a UNESCO World Heritage Site, protects ancient Hyrcanian forests that have existed for 25-50 million years.",
        touristicFeatures: [
          "Tea Capital - Hillside tea plantations and tea factories",
          "Subtropical Climate - Only region with humid subtropical weather",
          "Caspian Sea Beaches - Sandy beaches along southern coast",
          "Talysh Mountains - Dramatic mountains rising behind city",
          "Hirkan National Park - UNESCO-listed ancient Hyrcanian forests",
          "Talysh Culture - Unique ethnic culture with distinct language",
          "Citrus & Rice Fields - Agricultural landscapes with subtropical crops",
          "Persian Leopard Habitat - Endangered big cats in mountains",
          "Khanbulanchay River - Scenic river through city center",
          "Fresh Seafood - Caspian fish and local Talysh cuisine",
        ],
      },
      Shamakhi: {
        country: "Azerbaijan",
        description:
          "Shamakhi, Azerbaijan's ancient mountain city steeped in over 2,000 years of history, mesmerizes as the country's astronomical capital and former Shirvan Kingdom seat where medieval mosques, the oldest functioning observatory in the Islamic world, and dramatic Caucasus mountain scenery create an atmospheric journey through time. This historic city of 32,000 served as capital of the Shirvanshah dynasty from the 8th to 15th centuries, becoming a crucial Silk Road trading center. The magnificent Juma Mosque, Azerbaijan's largest and oldest Friday mosque built in 743 AD, stands as an architectural masterpiece spanning 13 centuries of construction. The Shamakhi Astrophysical Observatory, perched at 1,500 meters elevation, operates as one of the Islamic world's most important astronomical research centers. Explore the Seven Domes mausoleum complex containing ornate tombs of Shirvanshah dynasty rulers and wander the ruins of Gulistan Fortress.",
        touristicFeatures: [
          "Shamakhi Astrophysical Observatory - Major observatory at 1,500m",
          "Juma Mosque - Azerbaijan's oldest Friday mosque from 743 AD",
          "Seven Domes - Yeddi Gumbez mausoleum complex with tombs",
          "Shirvanshah Capital - Former capital of medieval Shirvan Kingdom",
          "Gulistan Fortress Ruins - Ancient fortress with panoramic views",
          "Astronomy Heritage - Islamic world's astronomical research center",
          "Wine & Grape Traditions - Historic viticulture region",
          "Silk Road History - Important medieval trading route city",
          "Mountain Setting - Dramatic Greater Caucasus scenery",
          "Ancient Learning Center - Historical hub of Islamic scholarship",
        ],
      },
      Quba: {
        country: "Azerbaijan",
        description:
          "Quba (Guba), Azerbaijan's captivating mountain resort town and carpet-weaving capital, charms as a green oasis in the Greater Caucasus where apple orchards, world-famous handmade carpets, and pristine mountain scenery create an unforgettable cultural experience. This picturesque city of 38,000 nestled in lush valleys at 600 meters elevation serves as gateway to spectacular mountain landscapes including the towering Shahdag peak and traditional shepherd villages. Quba's worldwide reputation rests on its exceptional carpet-weaving tradition producing renowned 'Quba carpets' with geometric patterns—visit workshops to watch master weavers create these intricate works using centuries-old techniques. The region is blessed with abundant apple orchards producing some of Azerbaijan's finest apples celebrated throughout the Caucasus. Explore the beautiful Quba Mosque with its cylindrical design and golden dome, visit nearby Afurja Waterfall cascading down mountain cliffs, and access the remote Khinalug village, one of Europe's highest settlements at over 2,300 meters elevation.",
        touristicFeatures: [
          "Quba Carpets - World-famous handmade carpets with geometric patterns",
          "Carpet Weaving Workshops - Watch master artisans create rugs",
          "Apple Orchards - Famous regional apple production and vast orchards",
          "Quba Mosque - Distinctive cylindrical mosque with golden dome",
          "Shahdag Access - Gateway to Shahdag Mountain Resort",
          "Afurja Waterfall - Dramatic waterfall in mountain setting",
          "Khinalug Village - One of Europe's highest ancient villages at 2,300m",
          "Sakina-Khanum Mosque - Sacred mosque with beautiful architecture",
          "Traditional Shepherd Villages - Ancient Caucasus mountain culture",
          "Caucasus Mountain Gateway - Access to Greater Caucasus adventures",
        ],
      },
      Qabalah: {
        country: "Azerbaijan",
        description:
          "Qabalah serves as an alternative spelling for Gabala, Azerbaijan's premier mountain resort destination in the Greater Caucasus Mountains. This stunning destination features Tufandag Mountain Resort with cable car to 3,000 meters, the Gabala Entertainment Center amusement park, ancient archaeological sites dating to the 4th century BC, beautiful Nohur Lake, and year-round mountain activities including skiing, hiking, and mountain biking. The annual Gabala International Music Festival attracts world-renowned classical musicians. With its perfect blend of outdoor adventure, natural beauty, and archaeological heritage, Qabalah/Gabala ranks among Azerbaijan's most popular tourist destinations. See the Gabala entry for full details about this spectacular mountain paradise.",
        touristicFeatures: [
          "See Gabala entry - Qabalah is alternative spelling of Gabala",
          "Tufandag Mountain Resort - Premier ski and mountain resort",
          "Entertainment Centers - Large amusement parks",
          "Ancient History - 2,000-year-old archaeological sites",
          "Mountain Recreation - Year-round outdoor activities",
          "International Music Festival - Annual classical music event",
          "Natural Beauty - Stunning Caucasus mountain scenery",
          "Lakes and Waterfalls - Nohur Lake and scenic cascades",
          "Traditional Villages - Access to authentic communities",
          "Modern Infrastructure - Well-developed tourism facilities",
        ],
      },
      Tirana: {
        country: "Albania",
        description:
          "Tirana, Albania's vibrant and colorful capital, bursts with energy as one of Europe's most dramatically transformed cities where communist-era brutalist architecture painted in bold colors coexists with trendy cafes and dynamic cultural scene. This city of 900,000 serves as Albania's political and cultural heart. Skanderbeg Square anchors downtown with its imposing statue and museums, while the former communist Blloku neighborhood has transformed into Tirana's hippest district with restaurants, bars, and nightclubs. Mount Dajti, accessible via cable car, offers stunning panoramic views. Explore the Pyramid of Tirana and the National History Museum's massive socialist-realist mosaic. With its colorful buildings, vibrant cafe culture, and Bunk'Art bunker museums, Tirana offers an unforgettable Balkan urban experience.",
        touristicFeatures: [
          "Skanderbeg Square - Massive central square with national hero statue",
          "Blloku District - Trendy neighborhood with nightlife",
          "Dajti Ekspres Cable Car - Ride to Mount Dajti for views",
          "Colorful Buildings - Communist architecture in bright colors",
          "Pyramid of Tirana - Controversial brutalist structure",
          "National History Museum - Socialist-realist mosaic facade",
          "Grand Park - Large green space with lake",
          "Et'hem Bey Mosque - 18th-century mosque with frescoes",
          "Bunk'Art Museums - Nuclear bunkers turned art museums",
          "Cafe Culture - Vibrant street life with endless cafes",
        ],
      },
      Berat: {
        country: "Albania",
        description:
          "Berat, Albania's 'City of a Thousand Windows' and UNESCO World Heritage Site, mesmerizes as one of the Balkans' most beautifully preserved Ottoman towns where whitewashed houses with countless windows cascade down steep hillsides. This ancient city dates back over 2,400 years with three historic quarters. The imposing Berat Castle, still inhabited by local families, contains Byzantine churches including the Onufri Museum with magnificent 16th-century religious icons. The iconic Ottoman houses of Mangalem quarter create the 'thousand windows' effect. Cross the seven-arched Gorica Bridge spanning the Osum River and explore traditional craft shops. With its Ottoman architecture, living castle, and riverside setting, Berat offers Albania's most photogenic historic townscape.",
        touristicFeatures: [
          "UNESCO World Heritage Site - Ottoman town with thousand windows",
          "Berat Castle - Inhabited hilltop fortress with Byzantine churches",
          "Onufri Museum - 16th-century icons with unique red pigment",
          "Mangalem Quarter - White Ottoman houses cascading down hillside",
          "Gorica Bridge - Seven-arched bridge spanning Osum River",
          "Three Historic Quarters - Muslim, Christian, and castle districts",
          "Ottoman Architecture - Best-preserved Ottoman town in Balkans",
          "Traditional Crafts - Embroidery and copperwork workshops",
          "Osum River Views - Scenic river through city center",
          "Living Museum - Families inhabiting the ancient castle",
        ],
      },
      Gjirokaster: {
        country: "Albania",
        description:
          "Gjirokaster, Albania's 'Stone City' and UNESCO World Heritage Site, captivates as a fortress town where hundreds of distinctive stone-roofed Ottoman tower houses climb steep mountainsides. This ancient city of 25,000, birthplace of dictator Enver Hoxha and writer Ismail Kadare, has preserved its unique architecture intact. The massive Gjirokaster Castle dominates from its hilltop perch with military museum, communist tunnels, and breathtaking views of stone houses cascading down and the Drino Valley beyond. The Old Bazaar sells traditional qilim rugs, copper goods, and local crafts. Explore the Skenduli House, a finest preserved Ottoman tower house museum. With its stone architecture and dramatic setting, Gjirokaster offers an unforgettable journey into Ottoman Albania.",
        touristicFeatures: [
          "UNESCO World Heritage Site - Ottoman stone tower house town",
          "Gjirokaster Castle - Massive fortress with military museum",
          "Stone Tower Houses - Unique Ottoman kullë with slate roofs",
          "Old Bazaar - Traditional market with local crafts",
          "Skenduli House - Preserved Ottoman tower house museum",
          "National Folklore Festival - Traditional music festival every 5 years",
          "Birthplace of Enver Hoxha - Communist dictator's home",
          "Ismail Kadare Connection - Famous writer's hometown",
          "Dramatic Mountain Setting - Houses cascading down slopes",
          "Drino Valley Views - Panoramic valley vistas",
        ],
      },
      Sarande: {
        country: "Albania",
        description:
          "Sarande, Albania's sun-drenched Riviera capital on the Ionian Sea, enchants as the country's premier beach resort with crystal-clear turquoise waters and proximity to spectacular beaches. This coastal city of 35,000 sits in a horseshoe-shaped bay facing Greek island Corfu just 15 kilometers across the strait. The UNESCO-listed Butrint National Park, 20 kilometers south, features 2,500 years of Greek, Roman, Byzantine ruins. The magical Blue Eye natural spring offers impossibly blue water bubbling from a 50-meter-deep karst hole. Nearby Ksamil beaches feature white sand and shallow turquoise waters creating Caribbean-like paradise. With vibrant nightlife, seafood restaurants, and stunning Riviera access, Sarande is Albania's most popular coastal destination.",
        touristicFeatures: [
          "Albanian Riviera Capital - Premier beach resort on Ionian Sea",
          "Butrint UNESCO Site - 2,500-year-old archaeological ruins",
          "Ksamil Beaches - Caribbean-like white sand beaches",
          "Blue Eye Spring - Mesmerizing natural spring",
          "Corfu Views - Greek island visible across strait",
          "Palm-Lined Promenade - Waterfront with cafes",
          "Lëkurësi Castle - Hilltop castle with bay views",
          "Beach Nightlife - Vibrant summer party scene",
          "Fresh Seafood - Waterfront restaurants",
          "Gateway to Riviera - Access to spectacular beaches",
        ],
      },
      Durres: {
        country: "Albania",
        description:
          "Durres, Albania's principal port city and oldest urban center, fascinates as a 3,000-year-old Adriatic hub where one of the world's largest Roman amphitheaters sits in the city center and broad sandy beaches stretch for kilometers. Founded by Greeks in 627 BC, this historic city of 200,000 served as the starting point of Via Egnatia Roman road to Constantinople. The enormous 2nd-century Roman Amphitheatre, largest in the Balkans seating 20,000, was rediscovered in 1966. The long sandy beach has made Durres Albania's primary summer resort. Explore the Archaeological Museum, ancient city walls, and Royal Villa of King Zog. With its Roman heritage, beaches, and port atmosphere, Durres blends ancient history with seaside resort life.",
        touristicFeatures: [
          "Roman Amphitheatre - Balkans' largest, 20,000 capacity",
          "3,000-Year History - Ancient Greek and Roman city",
          "Sandy Beaches - Long Adriatic beach stretch",
          "Albania's Main Port - Principal maritime gateway",
          "Via Egnatia Starting Point - Roman road to Constantinople",
          "Archaeological Museum - Greek, Roman, Byzantine artifacts",
          "Venetian Tower - Historic tower overlooking port",
          "Beach Promenade - Waterfront with hotels",
          "Byzantine City Walls - Ancient fortifications",
          "Royal Villa of Zog - 1920s royal residence",
        ],
      },
      Shkoder: {
        country: "Albania",
        description:
          "Shkoder, Albania's cultural capital and one of Europe's oldest cities, captivates where the imposing Rozafa Castle offers legendary panoramas, Lake Shkoder creates stunning beauty as the Balkans' largest lake, and the city serves as gateway to the Albanian Alps. This ancient city of 135,000, dating to 4th century BC as Illyrian capital Scodra, preserves rich heritage through elegant architecture and lively arts scene. The legendary Rozafa Castle offers breathtaking 360-degree views of the lake stretching to Montenegro. The pedestrian Kolë Idromeno Street buzzes with cafes and the iconic Marubi Photography Museum showcasing Europe's oldest photographic archives from 1850s. Lake Shkoder National Park offers kayaking and bird-watching. With its castle, lake, and gateway to mountains, Shkoder charms visitors.",
        touristicFeatures: [
          "Rozafa Castle - Legendary fortress with 360-degree views",
          "Lake Shkoder - Balkans' largest lake shared with Montenegro",
          "Gateway to Albanian Alps - Access to Accursed Mountains",
          "Marubi Photography Museum - Europe's oldest archive from 1850s",
          "Pedestrian Kolë Idromeno Street - Lively promenade",
          "Ancient Illyrian Capital - Inhabited since 4th century BC",
          "Lead Mosque - Ottoman mosque with lead-covered dome",
          "Mes Bridge - Medieval stone bridge",
          "Cultural Capital - Albania's arts center",
          "Lake Activities - Kayaking and bird-watching",
        ],
      },
      Vlore: {
        country: "Albania",
        description:
          "Vlore, Albania's 'City of Independence' where the nation declared freedom in 1912, shines as a vibrant coastal hub where the Adriatic meets the Ionian Sea, serving as gateway to the stunning Albanian Riviera and dramatic Llogara Pass. This strategic port city of 130,000 occupies a spectacular bay setting. The Independence Monument commemorates Albania's 1912 declaration when the Albanian flag was raised here. The city provides perfect base for exploring the incredible Albanian Riviera extending south with pristine beaches like Jale and Drymades accessible via the spectacular Llogara Pass. The remote Karaburun-Sazan Marine Park protects untouched coastlines and underwater caves. With its historical significance and Riviera access, Vlore offers both heritage and beach paradise.",
        touristicFeatures: [
          "Independence Monument - Site of 1912 independence declaration",
          "Gateway to Albanian Riviera - Access to southern beaches",
          "Llogara Pass - Spectacular mountain pass with coastal views",
          "Karaburun Peninsula - Wild coastline accessible by boat",
          "Adriatic-Ionian Meeting Point - Where two seas meet",
          "Independence Museum - Commemorating freedom declaration",
          "Albanian Riviera Beaches - Jale, Drymades with clear waters",
          "Sazan Island - Former military island with beaches",
          "Karaburun-Sazan Marine Park - Protected marine area",
          "Coastal Promenade - Waterfront walkway with cafes",
        ],
      },
      Korce: {
        country: "Albania",
        description:
          "Korce, Albania's elegant 'City of Serenades' in southeastern highlands near North Macedonia and Greece borders, charms as the nation's intellectual heart where French architectural influences and famous local beer create sophisticated atmosphere. This refined city of 75,000 at 850 meters elevation earned its romantic nickname from the tradition of young men serenading beneath windows—it remains Albania's center of culture and education. The beautiful Old Bazaar features artisan workshops and traditional restaurants serving Korce beer produced since 1928. The National Museum of Medieval Art displays outstanding Albanian Orthodox icons spanning 13th-19th centuries. The Education Museum celebrates the first Albanian-language school opened here in 1887. With its French-style architecture, beer culture, and intellectual atmosphere, Korce offers sophisticated Albania.",
        touristicFeatures: [
          "City of Serenades - Famous for serenade culture",
          "Old Bazaar - Albania's largest traditional market",
          "Korce Beer Brewery - Albania's oldest brewery since 1928",
          "National Museum of Medieval Art - Outstanding icon collection",
          "First Albanian School - Site of 1887 Albanian-language school",
          "French Architecture - Neo-Baroque and Art Nouveau",
          "Orthodox Cathedral - Cathedral of the Resurrection",
          "Intellectual Center - Albania's education hub",
          "Apple Orchards - Surrounded by farmland",
          "Festival City - Numerous cultural festivals",
        ],
      },
      Kruje: {
        country: "Albania",
        description:
          "Kruje, Albania's most historically significant town perched dramatically on mountainside 600 meters above the Adriatic plain, stands as the nation's spiritual heart where national hero Skanderbeg defended Albanian independence from Ottomans for 25 years in the 15th century. This small town of 20,000 with stunning panoramic sea views serves as Albania's most important pilgrimage site for national identity. The imposing Kruje Castle houses the excellent Skanderbeg Museum chronicling the hero's resistance. The atmospheric Old Bazaar, one of Albania's best-preserved traditional markets, sells traditional handicrafts including handwoven kilims, copper goods, and silver filigree. The Ethnographic Museum showcases traditional Albanian family life. With its castle, mountain setting, and national symbolism, Kruje is Albania's spiritual heartland.",
        touristicFeatures: [
          "Skanderbeg Castle - Fortress of national hero",
          "Skanderbeg Museum - 15th-century resistance chronicle",
          "Old Bazaar - Traditional market with handicrafts",
          "National Symbol - Albania's spiritual independence heart",
          "Panoramic Views - Stunning Adriatic plain vistas",
          "Ethnographic Museum - Traditional Albanian house",
          "Traditional Handicrafts - Kilims, copper, silver filigree",
          "Mountain Setting - Perched 600m above sea level",
          "Pilgrimage Site - Most important for national identity",
          "Day Trip from Tirana - Just 30km from capital",
        ],
      },
      Fier: {
        country: "Albania",
        description:
          "Fier, Albania's industrial and agricultural hub in the southwestern region, serves primarily as gateway to the spectacular Apollonia ruins—one of the most significant Greek and Roman archaeological sites in the Balkans located just 12 kilometers west. This modern city of 85,000 plays crucial role as Albania's oil production center. The magnificent Apollonia Archaeological Park, founded as Greek colony in 588 BC and later a major Roman city where young Octavian studied philosophy, features remarkably preserved ruins including a 3rd-century BC city wall, the Library of Apollonia with Ionic columns, and a Roman theater. The nearby Ardenica Monastery ranks among Albania's most important Orthodox monasteries. With Apollonia's ancient splendor and strategic location, Fier provides access to Albania's classical heritage.",
        touristicFeatures: [
          "Gateway to Apollonia - Access to Greek and Roman ruins",
          "Apollonia Ruins - Ancient Greek colony from 588 BC",
          "Library of Apollonia - Elegant ruins with Ionic columns",
          "Roman Theatre - Well-preserved ancient theater",
          "Ardenica Monastery - Orthodox monastery where Skanderbeg married",
          "Byzantine Monastery - Beautiful monastery at Apollonia",
          "Industrial Center - Albania's oil production hub",
          "Myzeqe Plain - Fertile agricultural region",
          "Strategic Location - Central access to attractions",
          "Archaeological Museum - Artifacts from Apollonia",
        ],
      },
    };

    const decodedCity = decodeURIComponent(city);
    const decodedCountry = decodeURIComponent(country);

    // Get city info or return default
    const cityInfo = cityData[decodedCity] || {
      country: decodedCountry,
      description: `${decodedCity} is a beautiful destination in ${decodedCountry}, offering unique experiences for travelers seeking authentic cultural encounters and stunning natural landscapes.`,
      touristicFeatures: [
        "Historic sites and cultural landmarks",
        "Local markets and authentic cuisine",
        "Natural beauty and scenic views",
        "Traditional arts and crafts",
        "Welcoming local hospitality",
      ],
    };

    // Get tour and hotel counts
    const [tourCount, hotelCount, tours, hotels] = await Promise.all([
      Tour.countDocuments({ country: decodedCountry, city: decodedCity }),
      Hotel.countDocuments({ country: decodedCountry, city: decodedCity }),
      Tour.find({ country: decodedCountry, city: decodedCity })
        .sort({ views: -1 })
        .limit(9),
      Hotel.find({ country: decodedCountry, city: decodedCity })
        .sort({ views: -1 })
        .limit(9),
    ]);

    // City images mapping (reuse from getCitiesByCountry)
    const cityImages = {
      Istanbul:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671115/istanbul_qjf5sz.jpg",
      Antalya:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671118/antalya_oj1lza.jpg",
      Cappadocia:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671112/cappadocia_znntj1.jpg",
      Trabzon:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/trabzon_l7xlva.jpg",
      Bodrum:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671110/bodrum_tmgojf.jpg",
      Fethiye:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/fethiye_loarta.jpg",
      Bursa:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759671111/bursa_ujwxsb.jpg",
      // Malaysia
      "Kuala Lumpur":
        "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop&q=80",
      Penang:
        "https://images.unsplash.com/photo-1571200669781-0b701df0de68?w=400&h=300&fit=crop&q=80",
      Langkawi:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80",
      Malacca:
        "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80",
      "Johor Bahru":
        "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop&q=80",
      "Kota Kinabalu":
        "https://images.unsplash.com/photo-1596738012750-3707c22e4bb5?w=400&h=300&fit=crop&q=80",
      Kuching:
        "https://images.unsplash.com/photo-1586183778882-44e7b5c1e9a4?w=400&h=300&fit=crop&q=80",
      "Cameron Highlands":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/Tea_fields__Will_Ellis_gpprje.jpg",
      "Genting Highlands":
        "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=300&fit=crop&q=80",
      Selangor:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/istockphoto-587901290-612x612_iqytp8.jpg",
      // Thailand
      Bangkok:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762625637/pexels-jimmy-teoh-294331-2411747_an3jyt.jpg",
      Phuket:
        "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=400&h=300&fit=crop&q=80",
      Pattaya:
        "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400&h=300&fit=crop&q=80",
      "Chiang Mai":
        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=300&fit=crop&q=80",
      Krabi:
        "https://images.unsplash.com/photo-1552550049-db097c9480d1?w=400&h=300&fit=crop&q=80",
      "Koh Samui":
        "https://images.unsplash.com/photo-1561461696-6e4b8bb1b3c1?w=400&h=300&fit=crop&q=80",
      "Hua Hin":
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80",
      Ayutthaya:
        "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&q=80",
      "Chiang Rai":
        "https://images.unsplash.com/photo-1598970605070-a9854a312e8f?w=400&h=300&fit=crop&q=80",
      Kanchanaburi:
        "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop&q=80",
      // United Arab Emirates
      Dubai:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762608122/wael-hneini-QJKEa9n3yN8-unsplash_1_fkutga.jpg",
      "Abu Dhabi":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609331/pexels-kevinvillaruz-1660603_sahkhc.jpg",
      Sharjah:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762608918/vivek-vg-P9cDq28qd7Y-unsplash_hpxfgu.jpg",
      Ajman:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609161/pexels-mikhail-nilov-8319468_ofoptj.jpg",
      "Ras Al Khaimah":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609283/99875486_lpkcll.avif",
      Fujairah:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609484/Gray-Line-Fujairah-United-Arab-Emirates-Cover-Photo-scaled_dbceuh.jpg",
      "Umm Al Quwain":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609600/6ecd49e68f764212e8fdf002b958758d_1000x1000_lapl6w.png",
      "Al Ain":
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762609669/9WXMYN7x-Al-Ain-1_zmwdad.jpg",
      // Azerbaijan
      Baku: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762627146/baku-2024-2025-_2555168725-scaled_rbkjut.jpg",
      Ganja:
        "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=400&h=300&fit=crop&q=80",
      Sumgayit:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80",
      Mingachevir:
        "https://images.unsplash.com/photo-1563492065-4c9a4ed7c42d?w=400&h=300&fit=crop&q=80",
      Qabalah:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762626224/3.-Gabala_j9aqx5.jpg",
      Shaki:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762627550/0ce5ef85-75b1-441e-a6eb-6b24bfacc3f9_s2l6oy.jpg",
      Lankaran:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80",
      Shamakhi:
        "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&q=80",
      Quba: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762627477/quba-azerbaijan-region_bvwr6c.jpg",
      Gabala:
        "https://images.unsplash.com/photo-1518904221920-0c95d8b81cb3?w=400&h=300&fit=crop&q=80",
      // Georgia
      Bakuriani:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617005/bakuriani-14_xtm3fv.jpg",
      Batumi:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617582/max-R68FdCxFOII-unsplash_ek7e7d.jpg",
      Tbilisi:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617644/pexels-rudy-kirchner-278171-2759804_yqsmbb.jpg",
      // Indonesia
      Puncak:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617061/pexels-saturnus99-28281932_vuyuq6.jpg",
      Sukabumi:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617127/pexels-willie-dt-715193875-18415669_zbza2f.jpg",
      Bali: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617283/pexels-freestockpro-2166553_rfypja.jpg",
      Jakarta:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617512/pexels-tomfisk-2116719_tgmwtd.jpg",
      Bandung:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762617455/dkjlntyqcbcqwqlbmaf8_toohiq.jpg",
      Yogyakarta:
        "https://images.unsplash.com/photo-1595435742656-5272d0d4080f?w=400&h=300&fit=crop&q=80",
      Surabaya:
        "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&h=300&fit=crop&q=80",
      Medan:
        "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=300&fit=crop&q=80",
      Lombok:
        "https://images.unsplash.com/photo-1517632287068-b1a5ba0fe8e6?w=400&h=300&fit=crop&q=80",
      Bogor:
        "https://images.unsplash.com/photo-1598968917050-0e6c7a39b5ab?w=400&h=300&fit=crop&q=80",
      Malang:
        "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=300&fit=crop&q=80",
      Solo: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=300&fit=crop&q=80",
      Ubud: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop&q=80",
      Sanur:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop&q=80",
      Seminyak:
        "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&fit=crop&q=80",
      // Albania
      Tirana:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840858/Sunset-at-Grand-Park-of-Tiranas-Artificial-Lake-scaled_m83m3k.jpg",
      Durres:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop&q=80",
      Vlore:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/albania_16x9_b92fhb.avif",
      Shkoder:
        "https://res.cloudinary.com/dnzqnr6js/image/upload/v1761840857/Shkodra-Scutari-Shkoder-Albania_gaxulo.jpg",
      Fier: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop&q=80",
      Korce:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=300&fit=crop&q=80",
      Berat:
        "https://images.unsplash.com/photo-1589769371245-e1d1e6bd9cd7?w=400&h=300&fit=crop&q=80",
      Gjirokaster:
        "https://images.unsplash.com/photo-1551793919-6020baf0e3a5?w=400&h=300&fit=crop&q=80",
      Sarande:
        "https://images.unsplash.com/photo-1544492503-7ad5ac882d5d?w=400&h=300&fit=crop&q=80",
      Kruje:
        "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=300&fit=crop&q=80",
    };

    const cityImage =
      cityImages[decodedCity] ||
      "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=1200&h=600&fit=crop&q=80";

    res.json({
      name: decodedCity,
      country: decodedCountry,
      image: cityImage,
      ...cityInfo,
      tourCount,
      hotelCount,
      tours,
      hotels,
    });
  } catch (err) {
    console.error("Error fetching city details:", err);
    res.status(500).json({ message: err.message });
  }
};

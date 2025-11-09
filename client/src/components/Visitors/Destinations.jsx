import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Flag from "react-world-flags";
import HorizontalScrollbar from "../HorizontalScrollbar";
import { useLocalizedNavigate } from "../../hooks/useLocalizedNavigate";

const Destinations = () => {
  const { t, i18n } = useTranslation();
  const navigate = useLocalizedNavigate();
  const isRTL = i18n.language === "ar";
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  // Static destinations data with high-quality optimized Cloudinary images
  const destinations = useMemo(
    () => [
      {
        name: "Turkey",
        code: "TR",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759680467/turkey_uabvzb.jpg",
      },
      {
        name: "United Arab Emirates",
        code: "AE",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762608122/wael-hneini-QJKEa9n3yN8-unsplash_1_fkutga.jpg",
      },
      {
        name: "Georgia",
        code: "GE",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681595/georgia_id0au5.jpg",
      },
      {
        name: "Azerbaijan",
        code: "AZ",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681625/azerbaijan_d4mecb.jpg",
      },
      {
        name: "Malaysia",
        code: "MY",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681612/malaysia_y1j9qm.jpg",
      },
      {
        name: "Thailand",
        code: "TH",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681613/thailand_mevzsd.jpg",
      },
      {
        name: "Albania",
        code: "AL",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681631/albania_ftb9qt.jpg",
      },
      {
        name: "Indonesia",
        code: "ID",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681593/indonesia_z0it15.jpg",
      },
      {
        name: "Saudi Arabia",
        code: "SA",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681608/saudi-arabia_n7v7gs.jpg",
      },
      {
        name: "Morocco",
        code: "MA",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681610/morocco_hll4kh.jpg",
      },
      {
        name: "Egypt",
        code: "EG",
        image:
          "https://res.cloudinary.com/dnzqnr6js/image/upload/f_auto,q_80,w_600,h_450,c_fill,g_auto,dpr_auto/v1759681770/egypt_ehyxvu.jpg",
      },
    ],
    []
  );

  // Calculate responsive items per slide
  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerSlide(3); // lg: 3 items
      } else if (window.innerWidth >= 768) {
        setItemsPerSlide(2); // md: 2 items
      } else {
        setItemsPerSlide(1); // sm: 1 item
      }
    };

    updateItemsPerSlide();
    window.addEventListener("resize", updateItemsPerSlide);
    return () => window.removeEventListener("resize", updateItemsPerSlide);
  }, []);

  // Calculate total slides
  const totalSlides = Math.ceil(destinations.length / itemsPerSlide);

  // Navigation functions
  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Get slide destinations - ensure last slide always has full items
  const getSlideDestinations = (slideIndex) => {
    const isLastSlide = slideIndex === totalSlides - 1;
    const remainingItems = destinations.length % itemsPerSlide;

    // If it's the last slide and has fewer than itemsPerSlide items
    if (isLastSlide && remainingItems > 0 && remainingItems < itemsPerSlide) {
      // Start from the position that ensures we show exactly itemsPerSlide items
      const startIndex = destinations.length - itemsPerSlide;
      return destinations.slice(startIndex, destinations.length);
    }

    // Normal slides
    const startIndex = slideIndex * itemsPerSlide;
    return destinations.slice(startIndex, startIndex + itemsPerSlide);
  };

  // Memoized DestinationCard component for better performance
  const DestinationCard = React.memo(({ destination }) => {
    const handleCardClick = () => {
      navigate(`/country/${encodeURIComponent(destination.name)}`);
    };

    return (
      <div
        className="relative bg-white dark:bg-slate-900 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group h-40 sm:h-48 md:h-56 w-full cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform"
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>

        {/* Flag Icon */}
        <div className="absolute top-3 right-3 z-10">
          <Flag
            code={destination.code}
            height="24"
            width="32"
            className="rounded-sm shadow-md border border-white/20"
          />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6 text-white z-10">
          {/* Country Name */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold group-hover:text-yellow-300 dark:group-hover:text-blue-400 transition-colors">
            {t(
              `countryPage.countryNames.${destination.name}`,
              destination.name
            )}
          </h3>
        </div>
      </div>
    );
  });

  return (
    <section
      className="pt-8 sm:pt-10 md:pt-12 pb-4 sm:pb-6 md:pb-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t("home.destinations.title")}
          </h2>
          <div
            className={`flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <FaMapMarkerAlt className="hidden sm:block w-4 h-4" />
            <p>{t("home.destinations.subtitle")}</p>
          </div>
        </div>

        {/* Mobile & Tablet: Horizontal Scroll */}
        <div className="block lg:hidden overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-6" style={{ width: "max-content" }}>
            {destinations.map((destination) => (
              <div key={destination.code} className="flex-shrink-0 w-[385px]">
                <DestinationCard destination={destination} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Carousel with Arrows */}
        <div className="hidden lg:block relative">
          {/* Previous Button - Hover Area (Left side in LTR, Right side in RTL) */}
          <div
            className={`absolute ${
              isRTL ? "right-0" : "left-0"
            } top-0 bottom-0 w-32 z-20 group/left flex items-center ${
              isRTL ? "justify-start" : "justify-start"
            }`}
          >
            <button
              onClick={goToPrevious}
              className={`${
                isRTL ? "mr-6" : "ml-6"
              } relative bg-gradient-to-br from-blue-500 to-blue-600 dark:from-yellow-400 dark:to-yellow-500 hover:from-blue-600 hover:to-blue-700 dark:hover:from-yellow-500 dark:hover:to-yellow-600 text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 opacity-0 group-hover/left:opacity-100 backdrop-blur-sm border border-white/20`}
              aria-label="Previous destinations"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
              {isRTL ? (
                <FaChevronRight className="w-4 h-4 relative z-10 drop-shadow-lg" />
              ) : (
                <FaChevronLeft className="w-4 h-4 relative z-10 drop-shadow-lg" />
              )}
            </button>
          </div>

          {/* Next Button - Hover Area (Right side in LTR, Left side in RTL) */}
          <div
            className={`absolute ${
              isRTL ? "left-0" : "right-0"
            } top-0 bottom-0 w-32 z-20 group/right flex items-center ${
              isRTL ? "justify-end" : "justify-end"
            }`}
          >
            <button
              onClick={goToNext}
              className={`${
                isRTL ? "ml-6" : "mr-6"
              } relative bg-gradient-to-br from-blue-500 to-blue-600 dark:from-yellow-400 dark:to-yellow-500 hover:from-blue-600 hover:to-blue-700 dark:hover:from-yellow-500 dark:hover:to-yellow-600 text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-yellow-400/50 opacity-0 group-hover/right:opacity-100 backdrop-blur-sm border border-white/20`}
              aria-label="Next destinations"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
              {isRTL ? (
                <FaChevronLeft className="w-4 h-4 relative z-10 drop-shadow-lg" />
              ) : (
                <FaChevronRight className="w-4 h-4 relative z-10 drop-shadow-lg" />
              )}
            </button>
          </div>

          {/* Carousel Content */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(${
                  isRTL ? currentSlide * 100 : -currentSlide * 100
                }%)`,
              }}
            >
              {/* Generate slides with always full items */}
              {Array.from({ length: totalSlides }, (_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="w-full flex-shrink-0 grid grid-cols-3 gap-6"
                >
                  {getSlideDestinations(slideIndex).map((destination) => (
                    <DestinationCard
                      key={destination.code}
                      destination={destination}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Destinations;

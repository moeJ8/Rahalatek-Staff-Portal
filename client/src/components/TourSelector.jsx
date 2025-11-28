import React, { useState, useEffect } from "react";
import { Card, Label, Alert } from "flowbite-react";
import { FaCalendarAlt, FaSyncAlt, FaPlus } from "react-icons/fa";
import CustomButton from "./CustomButton";
import PackageDayBlock from "./PackageDayBlock";
import { calculateDuration } from "../utils/pricingUtils";

// Pre-defined templates for special days
const getArrivalDayTemplate = (dayNumber) => ({
  day: dayNumber,
  title: `Day ${dayNumber}: Arrival & Hotel Check-in`,
  description:
    "Welcome to your journey! Upon arrival, you will be greeted by our representative who will assist you with the transfer to your hotel. After checking in, take time to rest and prepare for the exciting adventures ahead.",
  activities: [
    "Airport reception service",
    "Meet & greet with tour representative",
    "Transfer to hotel",
    "Hotel check-in assistance",
    "Welcome briefing",
    "Rest and prepare for upcoming tours",
  ],
  meals: { breakfast: false, lunch: false, dinner: false },
  isArrivalDay: true,
  isDepartureDay: false,
  isRestDay: false,
  tourInfo: null,
  translations: {
    title: { ar: `اليوم ${dayNumber}: الوصول وتسجيل الدخول في الفندق`, fr: "" },
    description: {
      ar: "مرحباً بك في رحلتك! عند الوصول، سيستقبلك ممثلنا الذي سيساعدك في الانتقال إلى فندقك. بعد تسجيل الدخول، خذ بعض الوقت للراحة والاستعداد للمغامرات المثيرة القادمة.",
      fr: "",
    },
    activities: [
      { ar: "خدمة الاستقبال في المطار", fr: "" },
      { ar: "الترحيب والاستقبال مع ممثل الجولة", fr: "" },
      { ar: "النقل إلى الفندق", fr: "" },
      { ar: "المساعدة في تسجيل الدخول بالفندق", fr: "" },
      { ar: "إحاطة ترحيبية", fr: "" },
      { ar: "الراحة والاستعداد للجولات القادمة", fr: "" },
    ],
  },
  images: [
    {
      url: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759851638/merc_wtaghb.jpg",
      altText: "Airport arrival and welcome",
    },
    {
      url: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762087383/675014510_aul2zd.jpg",
      altText: "Hotel check-in",
    },
    {
      url: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1759855915/492475786-960x630_kjybmn.jpg",
      altText: "Hotel room",
    },
  ],
});

const getDepartureDayTemplate = (dayNumber) => ({
  day: dayNumber,
  title: `Day ${dayNumber}: Departure & Airport Transfer`,
  description:
    "Time to say goodbye! After breakfast and hotel check-out, you will be transferred to the airport for your departure flight. We hope you had an amazing journey and look forward to welcoming you again.",
  activities: [
    "Hotel check-out",
    "Transfer to airport",
    "Departure assistance",
  ],
  meals: { breakfast: false, lunch: false, dinner: false },
  isArrivalDay: false,
  isDepartureDay: true,
  isRestDay: false,
  tourInfo: null,
  translations: {
    title: { ar: `اليوم ${dayNumber}: المغادرة والانتقال إلى المطار`, fr: "" },
    description: {
      ar: "حان وقت الوداع! بعد الإفطار وتسجيل المغادرة من الفندق، سيتم نقلك إلى المطار لرحلة العودة. نأمل أن تكون قد قضيت رحلة رائعة ونتطلع للترحيب بك مرة أخرى.",
      fr: "",
    },
    activities: [
      { ar: "تسجيل المغادرة من الفندق", fr: "" },
      { ar: "النقل إلى المطار", fr: "" },
      { ar: "المساعدة في إجراءات المغادرة", fr: "" },
    ],
  },
  images: [
    {
      url: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762087700/Istanbul-Airport-Transfer-By-VIP-Turkey-Transfer_sr0poy.jpg",
      altText: "Airport transfer",
    },
    {
      url: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762087383/675014510_aul2zd.jpg",
      altText: "Hotel checkout",
    },
  ],
});

const _getRestDayTemplate = (dayNumber) => ({
  day: dayNumber,
  title: `Day ${dayNumber}: Free Time / Rest Day`,
  description:
    "Enjoy a relaxing day at your own pace. This is your time to explore independently, unwind at the hotel, or join optional activities.",
  activities: ["Free time", "Optional excursions", "Hotel amenities"],
  meals: { breakfast: false, lunch: false, dinner: false },
  isArrivalDay: false,
  isDepartureDay: false,
  isRestDay: true,
  tourInfo: null,
  translations: {
    title: { ar: `اليوم ${dayNumber}: يوم حر / يوم راحة`, fr: "" },
    description: {
      ar: "استمتع بيوم مريح وفق وتيرتك الخاصة. يمكنك استكشاف المنطقة بشكل مستقل، أو الاسترخاء في الفندق، أو المشاركة في أنشطة اختيارية.",
      fr: "",
    },
    activities: [
      { ar: "وقت حر", fr: "" },
      { ar: "رحلات اختيارية", fr: "" },
      { ar: "الاستمتاع بمرافق الفندق", fr: "" },
    ],
  },
  images: [
    {
      url: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762095180/istockphoto-1160947136-612x612_xpapqb.jpg",
      altText: "Beach relaxation",
    },
    {
      url: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762095180/48a81561f429a6047d512eacff03ddd34a4d0441_ojuyyd.jpg",
      altText: "Spa and wellness",
    },
    {
      url: "https://res.cloudinary.com/dnzqnr6js/image/upload/v1762095180/high-angle-view-of-shirtless-man-relaxing-while-sitting-in-pool-at-tourist-resort-CAVF48773_zgsjzo.jpg",
      altText: "Relaxing by the pool",
    },
  ],
});

const createDefaultDay = (dayNumber, totalDays) => {
  const baseDay = {
    day: dayNumber,
    title: `Day ${dayNumber}`,
    description: "",
    activities: [],
    meals: { breakfast: false, lunch: false, dinner: false },
    isArrivalDay: false,
    isDepartureDay: false,
    isRestDay: false,
    tourInfo: null,
    translations: {
      title: { ar: "", fr: "" },
      description: { ar: "", fr: "" },
      activities: [],
    },
  };

  if (dayNumber === 1) {
    return {
      ...baseDay,
      ...getArrivalDayTemplate(dayNumber),
      isArrivalDay: true,
    };
  }

  if (dayNumber === totalDays && totalDays > 1) {
    return {
      ...baseDay,
      ...getDepartureDayTemplate(dayNumber),
      isDepartureDay: true,
    };
  }

  return baseDay;
};

const TourSelector = ({
  availableTours = [],
  dailyItinerary = [],
  onDailyItineraryChange,
  startDate,
  endDate,
}) => {
  const [localItinerary, setLocalItinerary] = useState(dailyItinerary);

  // Calculate total DAYS (nights + 1) for the itinerary
  // For example: 7 days / 6 nights package should have 7 days in itinerary
  const totalDays =
    startDate && endDate ? calculateDuration(startDate, endDate) + 1 : 0;

  // Sync with parent dailyItinerary prop (for edit mode)
  useEffect(() => {
    if (dailyItinerary && dailyItinerary.length > 0) {
      setLocalItinerary(dailyItinerary);
    }
  }, [dailyItinerary]);

  // Generate day blocks when dates change
  useEffect(() => {
    if (!totalDays || totalDays <= 0) {
      setLocalItinerary([]);
      return;
    }

    // If we already have the right number of days with data, keep them
    if (localItinerary.length === totalDays && localItinerary.length > 0) {
      return;
    }

    // Generate new itinerary
    const newItinerary = [];
    for (let i = 1; i <= totalDays; i++) {
      const existingDay = localItinerary.find((d) => d.day === i);
      if (existingDay) {
        newItinerary.push({ ...existingDay, day: i });
      } else {
        newItinerary.push(createDefaultDay(i, totalDays));
      }
    }

    setLocalItinerary(newItinerary);
    if (onDailyItineraryChange) {
      onDailyItineraryChange(newItinerary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalDays, startDate, endDate]);

  // Sync with parent when localItinerary changes
  useEffect(() => {
    if (localItinerary.length > 0 && onDailyItineraryChange) {
      onDailyItineraryChange(localItinerary);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localItinerary]);

  const handleDayChange = (updatedDay) => {
    const newItinerary = localItinerary.map((day) =>
      day.day === updatedDay.day ? updatedDay : day
    );
    setLocalItinerary(newItinerary);
  };

  const regenerateItinerary = () => {
    if (!totalDays) return;

    const newItinerary = Array.from({ length: totalDays }, (_, i) =>
      createDefaultDay(i + 1, totalDays)
    );

    setLocalItinerary(newItinerary);
    if (onDailyItineraryChange) {
      onDailyItineraryChange(newItinerary);
    }
  };

  if (!startDate || !endDate) {
    return (
      <div>
        <div className="mb-2 block">
          <Label value="Daily Itinerary" className="dark:text-white" />
        </div>
        <Card className="dark:bg-slate-900">
          <Alert color="warning">
            Please select the start and end dates to generate the itinerary.
          </Alert>
        </Card>
      </div>
    );
  }

  if (totalDays <= 0) {
    return (
      <div>
        <div className="mb-2 block">
          <Label value="Daily Itinerary" className="dark:text-white" />
        </div>
        <Card className="dark:bg-slate-900">
          <Alert color="failure">
            Invalid date range. Please ensure the end date is after the start
            date.
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 block">
        <Label value="Daily Itinerary" className="dark:text-white" />
      </div>

      <Card className="dark:bg-slate-900">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-yellow-500 dark:to-orange-500 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-4 h-4 text-white dark:text-gray-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {totalDays}-Day Itinerary
              </h3>
            </div>

            {localItinerary.length > 0 && (
              <CustomButton
                onClick={regenerateItinerary}
                variant="orange"
                size="sm"
                icon={FaSyncAlt}
              >
                Reset
              </CustomButton>
            )}
          </div>

          {/* Day Blocks */}
          {localItinerary.length === 0 ? (
            <Card className="dark:bg-slate-900 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
              <div className="text-center py-4">
                <p className="text-yellow-800 dark:text-yellow-300 font-medium mb-3">
                  Day blocks not generated yet for {totalDays} days
                </p>
                <CustomButton
                  onClick={regenerateItinerary}
                  variant="pinkToOrange"
                  size="md"
                  icon={FaPlus}
                >
                  Generate {totalDays} Day Blocks
                </CustomButton>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {localItinerary
                .sort((a, b) => a.day - b.day)
                .map((day) => (
                  <PackageDayBlock
                    key={day.day}
                    day={day}
                    dayNumber={day.day}
                    totalDays={totalDays}
                    tours={availableTours}
                    onChange={handleDayChange}
                    enableTranslations={false}
                  />
                ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TourSelector;

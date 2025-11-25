import React, { useState } from "react";
import { Card, Label } from "flowbite-react";
import {
  FaPlane,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaBed,
  FaUtensils,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaCrown,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import { HiPlus } from "react-icons/hi";
import Select from "./Select";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import CustomCheckbox from "./CustomCheckbox";
import SearchableSelect from "./SearchableSelect";
import CustomModal from "./CustomModal";
import Search from "./Search";

export default function PackageDayBlock({
  day,
  dayNumber,
  totalDays,
  tours = [],
  onChange,
}) {
  const [showTourModal, setShowTourModal] = useState(false);
  const [tourSearch, setTourSearch] = useState("");
  const [showTitleTranslations, setShowTitleTranslations] = useState(false);
  const [showDescriptionTranslations, setShowDescriptionTranslations] =
    useState(false);
  const [showActivitiesTranslations, setShowActivitiesTranslations] =
    useState(false);

  // Day type options based on position
  const getDayTypeOptions = () => {
    const options = [
      { value: "tour", label: "Tour Day" },
      { value: "rest", label: "Rest Day / Free Time" },
    ];

    if (dayNumber === 1) {
      options.unshift({ value: "arrival", label: "Arrival Day" });
    }

    if (dayNumber === totalDays) {
      options.push({ value: "departure", label: "Departure Day" });
    }

    return options;
  };

  // Determine day type
  const dayType = day.isArrivalDay
    ? "arrival"
    : day.isDepartureDay
    ? "departure"
    : day.isRestDay
    ? "rest"
    : day.tourInfo
    ? "tour"
    : "";

  // Handle day type change
  const handleDayTypeChange = (newType) => {
    const updates = {
      ...day,
      isArrivalDay: newType === "arrival",
      isDepartureDay: newType === "departure",
      isRestDay: newType === "rest",
    };

    // Clear tour if not a tour day
    if (newType !== "tour") {
      delete updates.tourInfo;
    }

    // Set default titles, descriptions, activities, and translations based on type
    if (newType === "arrival") {
      updates.title = `Day ${dayNumber}: Arrival & Hotel Check-in`;
      updates.description =
        "Welcome to your journey! Upon arrival at the airport, you will be greeted by our representative who will assist you with the transfer to your hotel. After checking in, take some time to rest and prepare for the exciting adventures ahead.";
      updates.activities = [
        "Airport reception service",
        "Meet & greet with tour representative",
        "Transfer to hotel",
        "Hotel check-in assistance",
        "Welcome briefing",
        "Rest and prepare for upcoming tours",
      ];
      updates.translations = {
        title: {
          ar: "اليوم 1: الوصول وتسجيل الدخول في الفندق",
          fr: "Jour 1 : Arrivée et enregistrement à l'hôtel",
        },
        description: {
          ar: "مرحباً بك في رحلتك! عند الوصول إلى المطار، سيستقبلك ممثلنا الذي سيساعدك في الانتقال إلى فندقك. بعد تسجيل الدخول، خذ بعض الوقت للراحة والاستعداد للمغامرات المثيرة القادمة.",
          fr: "Bienvenue dans votre voyage ! À votre arrivée à l'aéroport, vous serez accueilli par notre représentant qui vous aidera lors du transfert vers votre hôtel. Après l'enregistrement, prenez le temps de vous reposer et de vous préparer pour les aventures passionnantes à venir.",
        },
        activities: [
          {
            ar: "خدمة الاستقبال في المطار",
            fr: "Service de réception à l'aéroport",
          },
          {
            ar: "الترحيب والاستقبال مع ممثل الجولة",
            fr: "Accueil avec le représentant de la visite",
          },
          { ar: "النقل إلى الفندق", fr: "Transfert vers l'hôtel" },
          {
            ar: "المساعدة في تسجيل الدخول بالفندق",
            fr: "Assistance à l'enregistrement à l'hôtel",
          },
          { ar: "إحاطة ترحيبية", fr: "Briefing de bienvenue" },
          {
            ar: "الراحة والاستعداد للجولات القادمة",
            fr: "Repos et préparation pour les visites à venir",
          },
        ],
      };
    } else if (newType === "departure") {
      updates.title = `Day ${dayNumber}: Departure & Airport Transfer`;
      updates.description =
        "Time to say goodbye! After breakfast and hotel check-out, you will be transferred to the airport for your departure flight. We hope you had an amazing journey and look forward to welcoming you again.";
      updates.activities = [
        "Hotel check-out",
        "Transfer to airport",
        "Departure assistance",
      ];
      updates.translations = {
        title: {
          ar: `اليوم ${dayNumber}: المغادرة والانتقال إلى المطار`,
          fr: `Jour ${dayNumber} : Départ et transfert à l'aéroport`,
        },
        description: {
          ar: "حان وقت الوداع! بعد الإفطار وتسجيل المغادرة من الفندق، سيتم نقلك إلى المطار لرحلة المغادرة. نأمل أن تكون قد قضيت رحلة رائعة ونتطلع للترحيب بك مرة أخرى.",
          fr: "Il est temps de dire au revoir ! Après le petit-déjeuner et le check-out de l'hôtel, vous serez transféré à l'aéroport pour votre vol de départ. Nous espérons que vous avez passé un voyage merveilleux et nous avons hâte de vous accueillir à nouveau.",
        },
        activities: [
          { ar: "تسجيل المغادرة من الفندق", fr: "Check-out de l'hôtel" },
          { ar: "النقل إلى المطار", fr: "Transfert vers l'aéroport" },
          { ar: "المساعدة في المغادرة", fr: "Assistance au départ" },
        ],
      };
    } else if (newType === "rest") {
      updates.title = `Day ${dayNumber}: Free Time / Rest Day`;
      updates.description =
        "Enjoy a relaxing day at your own pace. This is your time to explore the area independently, relax at the hotel, or participate in optional activities.";
      updates.activities = [];
      updates.translations = {
        title: {
          ar: `اليوم ${dayNumber}: يوم حر / يوم راحة`,
          fr: `Jour ${dayNumber} : Temps libre / Jour de repos`,
        },
        description: {
          ar: "استمتع بيوم مريح على وتيرتك الخاصة. هذا هو وقتك لاستكشاف المنطقة بشكل مستقل، أو الاسترخاء في الفندق، أو المشاركة في الأنشطة الاختيارية.",
          fr: "Profitez d'une journée relaxante à votre rythme. C'est votre temps pour explorer la région de manière indépendante, vous détendre à l'hôtel ou participer à des activités optionnelles.",
        },
        activities: [],
      };
      // Predefined images for rest day
      updates.images = [
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
      ];
    } else if (newType === "tour") {
      // Clear static day defaults when switching to tour day
      updates.title = "";
      updates.description = "";
      updates.activities = [];
      updates.translations = {
        title: { ar: "", fr: "" },
        description: { ar: "", fr: "" },
        activities: [],
      };

      if (!day.tourInfo) {
        setShowTourModal(true);
      }
    }

    onChange(updates);
  };

  // Handle tour selection
  const handleTourSelect = (tour) => {
    const updates = {
      ...day,
      title: `Day ${dayNumber}: ${tour.name}`,
      description: tour.description || "",
      activities: tour.highlights || [],
      tourInfo: {
        tourId: tour._id,
        name: tour.name,
        city: tour.city,
        duration: tour.duration,
        price: tour.price || tour.totalPrice || 0,
        tourType: tour.tourType,
      },
    };
    onChange(updates);
    setShowTourModal(false);
  };

  // Add activity
  const handleAddActivity = () => {
    const newActivities = [...(day.activities || []), ""];
    onChange({ ...day, activities: newActivities });
  };

  // Remove activity
  const handleRemoveActivity = (index) => {
    const newActivities = (day.activities || []).filter((_, i) => i !== index);

    // Also remove corresponding translation if it exists
    const newTranslations = { ...(day.translations || {}) };
    if (
      newTranslations.activities &&
      newTranslations.activities.length > index
    ) {
      newTranslations.activities = newTranslations.activities.filter(
        (_, i) => i !== index
      );
    }

    onChange({
      ...day,
      activities: newActivities,
      translations: newTranslations,
    });
  };

  // Update activity
  const handleActivityChange = (index, value) => {
    const newActivities = [...(day.activities || [])];
    newActivities[index] = value;
    onChange({ ...day, activities: newActivities });
  };

  // Get background color based on day type
  const getCardColor = () => {
    return "bg-white dark:bg-slate-900 border-gray-300 dark:border-gray-700";
  };

  // Filter tours based on search
  const filteredTours = tours.filter((tour) => {
    const searchValue = typeof tourSearch === "string" ? tourSearch : "";
    if (!searchValue.trim()) return true;
    const searchLower = searchValue.toLowerCase();
    return (
      tour.name.toLowerCase().includes(searchLower) ||
      tour.city.toLowerCase().includes(searchLower) ||
      (tour.country && tour.country.toLowerCase().includes(searchLower)) ||
      tour.tourType.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <Card
        className={`${getCardColor()} border-2 transition-all duration-300 hover:shadow-lg`}
      >
        {/* Day Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-yellow-500 dark:to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
            {dayNumber}
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">
            Day {dayNumber}
          </span>
        </div>

        {/* Day Type Selection */}
        <div className="mb-3">
          <Label value="Day Type" className="dark:text-white mb-1" />
          <Select
            value={dayType}
            onChange={handleDayTypeChange}
            options={getDayTypeOptions()}
            placeholder="Select day type..."
          />
        </div>

        {/* Tour Selection (only for tour days) */}
        {dayType === "tour" && !day.tourInfo && (
          <div className="mb-3">
            <CustomButton
              onClick={() => setShowTourModal(true)}
              variant="blue"
              size="md"
              className="w-full"
            >
              Select Tour
            </CustomButton>
          </div>
        )}

        {/* Selected Tour Display */}
        {dayType === "tour" && day.tourInfo && (
          <div className="mb-3 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {day.tourInfo.name}
                  </h4>
                  {day.tourInfo.tourType === "VIP" ? (
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gradient-to-r from-amber-500 to-yellow-300 border border-amber-600"
                      style={{
                        color: "#7B5804",
                        fontWeight: "bold",
                        fontSize: "0.65rem",
                        textShadow: "0 0 2px rgba(255,255,255,0.5)",
                      }}
                    >
                      <FaCrown
                        className="mr-1"
                        style={{ fontSize: "0.65rem" }}
                      />
                      VIP
                    </span>
                  ) : day.tourInfo.tourType === "Group" ? (
                    <span
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-600 text-white"
                      style={{
                        fontSize: "0.65rem",
                      }}
                    >
                      <FaUsers
                        className="mr-1"
                        style={{ fontSize: "0.65rem" }}
                      />
                      Group
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    {day.tourInfo.city}
                  </span>
                  {day.tourInfo.duration && day.tourInfo.duration > 0 && (
                    <span className="flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      {day.tourInfo.duration}h
                    </span>
                  )}
                  {day.tourInfo.price && day.tourInfo.price > 0 && (
                    <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                      <FaDollarSign className="w-3 h-3" />${day.tourInfo.price}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CustomButton
                  onClick={() => setShowTourModal(true)}
                  variant="orange"
                  size="sm"
                  shape="circular"
                  icon={FaSearch}
                />
                <CustomButton
                  onClick={() => {
                    const { tourInfo: _tourInfo, ...rest } = day;
                    onChange({
                      ...rest,
                      title: `Day ${dayNumber}`,
                      activities: [],
                      description: "",
                    });
                  }}
                  variant="red"
                  size="sm"
                  shape="circular"
                  icon={FaTimes}
                />
              </div>
            </div>
          </div>
        )}

        {/* Day Title */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <Label value="Day Title (English)" className="dark:text-white" />
            {(dayType === "arrival" ||
              dayType === "departure" ||
              dayType === "rest") && (
              <button
                type="button"
                onClick={() => setShowTitleTranslations(!showTitleTranslations)}
                className="text-xs text-blue-600 dark:text-yellow-400 hover:underline flex items-center gap-1"
              >
                {showTitleTranslations ? (
                  <FaChevronUp className="w-3 h-3" />
                ) : (
                  <FaChevronDown className="w-3 h-3" />
                )}
                Translations
              </button>
            )}
          </div>
          <TextInput
            value={day.title || ""}
            onChange={(e) => onChange({ ...day, title: e.target.value })}
            placeholder={`e.g., Day ${dayNumber}: ${
              dayType === "arrival"
                ? "Arrival & Check-in"
                : dayType === "departure"
                ? "Departure"
                : dayType === "rest"
                ? "Free Time"
                : "Tour Activity"
            }`}
          />

          {/* Title Translations (only for arrival/departure/rest days) */}
          {(dayType === "arrival" ||
            dayType === "departure" ||
            dayType === "rest") &&
            showTitleTranslations && (
              <div className="mt-2 space-y-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <Label
                    value="Arabic (العربية)"
                    className="dark:text-white mb-1 text-xs"
                  />
                  <TextInput
                    value={day.translations?.title?.ar || ""}
                    onChange={(e) =>
                      onChange({
                        ...day,
                        translations: {
                          ...(day.translations || {}),
                          title: {
                            ...(day.translations?.title || {}),
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="عنوان اليوم بالعربية..."
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label
                    value="French (Français)"
                    className="dark:text-white mb-1 text-xs"
                  />
                  <TextInput
                    value={day.translations?.title?.fr || ""}
                    onChange={(e) =>
                      onChange({
                        ...day,
                        translations: {
                          ...(day.translations || {}),
                          title: {
                            ...(day.translations?.title || {}),
                            fr: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Titre du jour en français..."
                  />
                </div>
              </div>
            )}
        </div>

        {/* Description */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <Label value="Description (English)" className="dark:text-white" />
            {(dayType === "arrival" ||
              dayType === "departure" ||
              dayType === "rest") && (
              <button
                type="button"
                onClick={() =>
                  setShowDescriptionTranslations(!showDescriptionTranslations)
                }
                className="text-xs text-blue-600 dark:text-yellow-400 hover:underline flex items-center gap-1"
              >
                {showDescriptionTranslations ? (
                  <FaChevronUp className="w-3 h-3" />
                ) : (
                  <FaChevronDown className="w-3 h-3" />
                )}
                Translations
              </button>
            )}
          </div>
          <TextInput
            as="textarea"
            value={day.description || ""}
            onChange={(e) => onChange({ ...day, description: e.target.value })}
            placeholder="Describe what happens on this day..."
            rows={2}
          />

          {/* Description Translations (only for arrival/departure/rest days) */}
          {(dayType === "arrival" ||
            dayType === "departure" ||
            dayType === "rest") &&
            showDescriptionTranslations && (
              <div className="mt-2 space-y-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <Label
                    value="Arabic (العربية)"
                    className="dark:text-white mb-1 text-xs"
                  />
                  <TextInput
                    as="textarea"
                    value={day.translations?.description?.ar || ""}
                    onChange={(e) =>
                      onChange({
                        ...day,
                        translations: {
                          ...(day.translations || {}),
                          description: {
                            ...(day.translations?.description || {}),
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="وصف اليوم بالعربية..."
                    rows={2}
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label
                    value="French (Français)"
                    className="dark:text-white mb-1 text-xs"
                  />
                  <TextInput
                    as="textarea"
                    value={day.translations?.description?.fr || ""}
                    onChange={(e) =>
                      onChange({
                        ...day,
                        translations: {
                          ...(day.translations || {}),
                          description: {
                            ...(day.translations?.description || {}),
                            fr: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Description de la journée en français..."
                    rows={2}
                  />
                </div>
              </div>
            )}
        </div>

        {/* Activities */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Label value="Activities (English)" className="dark:text-white" />
              {(dayType === "arrival" ||
                dayType === "departure" ||
                dayType === "rest") && (
                <button
                  type="button"
                  onClick={() =>
                    setShowActivitiesTranslations(!showActivitiesTranslations)
                  }
                  className="text-xs text-blue-600 dark:text-yellow-400 hover:underline flex items-center gap-1"
                >
                  {showActivitiesTranslations ? (
                    <FaChevronUp className="w-3 h-3" />
                  ) : (
                    <FaChevronDown className="w-3 h-3" />
                  )}
                  Translations
                </button>
              )}
            </div>
            <CustomButton
              onClick={handleAddActivity}
              variant="green"
              size="sm"
              shape="circular"
              icon={HiPlus}
            />
          </div>

          <div className="space-y-2">
            {(day.activities || []).map((activity, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <TextInput
                    value={activity}
                    onChange={(e) =>
                      handleActivityChange(index, e.target.value)
                    }
                    placeholder={`Activity ${index + 1}...`}
                    className="flex-1"
                  />
                  <CustomButton
                    onClick={() => handleRemoveActivity(index)}
                    variant="red"
                    size="sm"
                    shape="circular"
                    icon={FaTimes}
                  />
                </div>

                {/* Activity Translations (only for arrival/departure/rest days) */}
                {(dayType === "arrival" ||
                  dayType === "departure" ||
                  dayType === "rest") &&
                  showActivitiesTranslations && (
                    <div className="ml-4 pl-3 border-l-2 border-gray-300 dark:border-gray-600 space-y-2">
                      <div>
                        <Label
                          value="Arabic"
                          className="dark:text-white mb-1 text-xs"
                        />
                        <TextInput
                          value={
                            day.translations?.activities?.[index]?.ar || ""
                          }
                          onChange={(e) => {
                            const newTranslations = {
                              ...(day.translations || {}),
                            };
                            if (!newTranslations.activities)
                              newTranslations.activities = [];
                            if (!newTranslations.activities[index])
                              newTranslations.activities[index] = {};
                            newTranslations.activities[index].ar =
                              e.target.value;
                            onChange({ ...day, translations: newTranslations });
                          }}
                          placeholder="النشاط بالعربية..."
                          dir="rtl"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label
                          value="French"
                          className="dark:text-white mb-1 text-xs"
                        />
                        <TextInput
                          value={
                            day.translations?.activities?.[index]?.fr || ""
                          }
                          onChange={(e) => {
                            const newTranslations = {
                              ...(day.translations || {}),
                            };
                            if (!newTranslations.activities)
                              newTranslations.activities = [];
                            if (!newTranslations.activities[index])
                              newTranslations.activities[index] = {};
                            newTranslations.activities[index].fr =
                              e.target.value;
                            onChange({ ...day, translations: newTranslations });
                          }}
                          placeholder="Activité en français..."
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
              </div>
            ))}
            {(day.activities || []).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                No activities added yet
              </p>
            )}
          </div>
        </div>

        {/* Meals */}
        <div className="mb-3">
          <Label value="Meals Included" className="dark:text-white mb-2" />
          <div className="flex flex-wrap gap-4">
            <CustomCheckbox
              label="Breakfast"
              checked={day.meals?.breakfast || false}
              onChange={(checked) =>
                onChange({
                  ...day,
                  meals: { ...day.meals, breakfast: checked },
                })
              }
            />
            <CustomCheckbox
              label="Lunch"
              checked={day.meals?.lunch || false}
              onChange={(checked) =>
                onChange({
                  ...day,
                  meals: { ...day.meals, lunch: checked },
                })
              }
            />
            <CustomCheckbox
              label="Dinner"
              checked={day.meals?.dinner || false}
              onChange={(checked) =>
                onChange({
                  ...day,
                  meals: { ...day.meals, dinner: checked },
                })
              }
            />
          </div>
        </div>
      </Card>

      {/* Tour Selection Modal */}
      <CustomModal
        isOpen={showTourModal}
        onClose={() => {
          setShowTourModal(false);
          setTourSearch("");
        }}
        title={`Select Tour for Day ${dayNumber}`}
        subtitle={`Choose from ${filteredTours.length} available tours in selected cities`}
        maxWidth="md:max-w-6xl"
      >
        <div className="space-y-4">
          <Search
            placeholder="Search tours by name, city, or type..."
            value={tourSearch}
            onChange={(e) => setTourSearch(e.target.value)}
          />

          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTours.map((tour) => {
                const primaryImage =
                  tour.images?.find((img) => img.isPrimary) || tour.images?.[0];
                const isSelected = day.tourInfo?.tourId === tour._id;

                return (
                  <div
                    key={tour._id}
                    onClick={() => handleTourSelect(tour)}
                    className={`group cursor-pointer bg-white dark:bg-slate-800 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                      isSelected
                        ? "border-purple-500 dark:border-yellow-500 ring-2 ring-purple-200 dark:ring-yellow-200 shadow-lg"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-yellow-400"
                    }`}
                  >
                    {/* Tour Image */}
                    {primaryImage ? (
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={primaryImage.url}
                          alt={tour.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                        {/* Tour Type Badge */}
                        <div className="absolute top-2 right-2">
                          {tour.tourType === "VIP" ? (
                            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold shadow-md">
                              <FaCrown className="w-3 h-3" />
                              VIP
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                              <FaUsers className="w-3 h-3" />
                              Group
                            </div>
                          )}
                        </div>

                        {/* Selected Checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1 shadow-md">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        <FaMapMarkerAlt className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}

                    {/* Tour Details */}
                    <div className="p-3">
                      <h4
                        className={`font-bold text-sm mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-yellow-400 transition-colors ${
                          isSelected
                            ? "text-purple-600 dark:text-yellow-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {tour.name}
                      </h4>

                      <div className="space-y-1 text-xs">
                        {/* Location */}
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <FaMapMarkerAlt className="w-3 h-3 text-red-500 flex-shrink-0" />
                          <span className="truncate">
                            {tour.city}
                            {tour.country ? `, ${tour.country}` : ""}
                          </span>
                        </div>

                        {/* Duration */}
                        {tour.duration && tour.duration > 0 && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <FaClock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span>{tour.duration} hours</span>
                          </div>
                        )}

                        {/* Price */}
                        {(tour.price > 0 || tour.totalPrice > 0) && (
                          <div className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                            <FaDollarSign className="w-3 h-3 flex-shrink-0" />
                            <span>${tour.price || tour.totalPrice}</span>
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                              {tour.tourType === "Group"
                                ? "per person"
                                : "per car"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description Preview */}
                      {tour.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                          {tour.description}
                        </p>
                      )}

                      {/* Highlights Preview */}
                      {tour.highlights && tour.highlights.length > 0 && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Highlights:</span>{" "}
                          {tour.highlights.slice(0, 2).join(", ")}
                          {tour.highlights.length > 2 &&
                            ` +${tour.highlights.length - 2} more`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaSearch className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400">
                {tourSearch
                  ? "No tours match your search"
                  : "No tours available in selected cities"}
              </p>
              {tourSearch && (
                <CustomButton
                  onClick={() => setTourSearch("")}
                  variant="blue"
                  size="sm"
                  className="mt-4"
                >
                  Clear Search
                </CustomButton>
              )}
            </div>
          )}
        </div>
      </CustomModal>
    </>
  );
}

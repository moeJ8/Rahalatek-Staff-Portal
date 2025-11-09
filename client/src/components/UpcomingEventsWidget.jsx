import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaPlane,
  FaPlaneArrival,
  FaPlaneDeparture,
  FaGift,
  FaClock,
  FaUsers,
  FaExternalLinkAlt,
} from "react-icons/fa";
import axios from "axios";
import RahalatekLoader from "./RahalatekLoader";
import CustomButton from "./CustomButton";
import CustomScrollbar from "./CustomScrollbar";

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState({
    departures: [],
    arrivals: [],
    holidays: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("departures");

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch optimized events and holidays in parallel
      const [eventsResponse, holidaysResponse] = await Promise.all([
        axios.get("/api/vouchers/upcoming-events", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/holidays", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const { departures, arrivals } = eventsResponse.data.data || {
        departures: [],
        arrivals: [],
      };
      const holidays = holidaysResponse.data.data || [];

      // Filter holidays (next 30 days)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const next30Days = new Date(today);
      next30Days.setDate(next30Days.getDate() + 30);

      const upcomingHolidays = holidays
        .filter((holiday) => {
          if (!holiday.isActive) return false;

          let holidayDate;
          if (holiday.holidayType === "single-day") {
            holidayDate = new Date(holiday.date);
          } else {
            holidayDate = new Date(holiday.startDate);
          }

          const holidayDateOnly = new Date(
            holidayDate.getFullYear(),
            holidayDate.getMonth(),
            holidayDate.getDate()
          );
          return holidayDateOnly >= today && holidayDateOnly <= next30Days;
        })
        .sort((a, b) => {
          const dateA = new Date(
            a.holidayType === "single-day" ? a.date : a.startDate
          );
          const dateB = new Date(
            b.holidayType === "single-day" ? b.date : b.startDate
          );
          return dateA - dateB;
        })
        .slice(0, 10);

      setEvents({
        departures: departures || [],
        arrivals: arrivals || [],
        holidays: upcomingHolidays,
      });
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const tomorrowOnly = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate()
    );

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Today";
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    }
  };

  const formatDateWithTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: formatDate(dateString),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "departures":
        return events.departures.length === 0 ? (
          <div className="text-center py-8">
            <FaPlaneDeparture className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No departures in next 7 days
            </p>
          </div>
        ) : (
          <CustomScrollbar maxHeight="350px">
            <div className="space-y-3">
              {events.departures.map((voucher) => {
                const { date, time } = formatDateWithTime(
                  voucher.departureDate
                );
                return (
                  <div
                    key={voucher._id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <FaPlaneDeparture className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            #{voucher.voucherNumber}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {voucher.clientName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {date} • {time}
                        </div>
                      </div>
                    </div>
                    <Link to={`/vouchers/${voucher._id}`}>
                      <CustomButton variant="teal" size="xs" icon={FaPlane} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </CustomScrollbar>
        );

      case "arrivals":
        return events.arrivals.length === 0 ? (
          <div className="text-center py-8">
            <FaPlaneArrival className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No arrivals in next 7 days
            </p>
          </div>
        ) : (
          <CustomScrollbar maxHeight="350px">
            <div className="space-y-3">
              {events.arrivals.map((voucher) => {
                const { date, time } = formatDateWithTime(voucher.arrivalDate);
                return (
                  <div
                    key={voucher._id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FaPlaneArrival className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            #{voucher.voucherNumber}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 text-xs">
                            {voucher.clientName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {date} • {time}
                        </div>
                      </div>
                    </div>
                    <Link to={`/vouchers/${voucher._id}`}>
                      <CustomButton variant="teal" size="xs" icon={FaPlane} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </CustomScrollbar>
        );

      case "holidays":
        return events.holidays.length === 0 ? (
          <div className="text-center py-8">
            <FaGift className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No holidays in next 30 days
            </p>
          </div>
        ) : (
          <CustomScrollbar maxHeight="350px">
            <div className="space-y-3">
              {events.holidays.map((holiday) => {
                const holidayDate =
                  holiday.holidayType === "single-day"
                    ? holiday.date
                    : holiday.startDate;
                const endDate =
                  holiday.holidayType === "multiple-day"
                    ? holiday.endDate
                    : null;

                return (
                  <div
                    key={holiday._id}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                  >
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <FaGift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {holiday.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(holidayDate)}
                        {endDate && ` - ${formatDate(endDate)}`}
                        {holiday.holidayType === "multiple-day" && (
                          <span className="ml-1 text-purple-600 dark:text-purple-400">
                            (Multi-day)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CustomScrollbar>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
            <FaCalendarAlt className="text-blue-600 dark:text-teal-400 text-base sm:text-lg" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
            Upcoming Events
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <button
          onClick={() => setActiveTab("departures")}
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
            activeTab === "departures"
              ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
          }`}
        >
          <FaPlaneDeparture className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Departures</span>
          {events.departures.length > 0 && (
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1 sm:px-2 py-0.5 rounded-full text-xs">
              {events.departures.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("arrivals")}
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
            activeTab === "arrivals"
              ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
          }`}
        >
          <FaPlaneArrival className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Arrivals</span>
          {events.arrivals.length > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1 sm:px-2 py-0.5 rounded-full text-xs">
              {events.arrivals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("holidays")}
          className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
            activeTab === "holidays"
              ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-b-2 border-purple-500"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
          }`}
        >
          <FaGift className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">Holidays</span>
          {events.holidays.length > 0 && (
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1 sm:px-2 py-0.5 rounded-full text-xs">
              {events.holidays.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <RahalatekLoader size="md" />
          </div>
        ) : (
          getTabContent()
        )}
      </div>
    </div>
  );
}

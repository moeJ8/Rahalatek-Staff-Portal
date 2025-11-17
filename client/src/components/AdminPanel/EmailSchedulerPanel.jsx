import React, { useState, useEffect } from "react";
import { Card, Label } from "flowbite-react";
import {
  FaCog,
  FaUser,
  FaCalendarDay,
  FaBell,
  FaFileInvoiceDollar,
  FaChartLine,
  FaEnvelope,
  FaEdit,
  FaGlobe,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import CustomButton from "../CustomButton";
import CustomModal from "../CustomModal";
import TextInput from "../TextInput";
import CustomCheckbox from "../CustomCheckbox";
import Select from "../Select";
import axios from "axios";
import toast from "react-hot-toast";

// Time conversion utility functions
const convertTo24Hour = (time12h) => {
  if (!time12h) return "";
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":");
  if (hours === "12") {
    hours = "00";
  }
  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const convertTo12Hour = (time24h) => {
  if (!time24h) return "";
  const [hours, minutes] = time24h.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};

export default function EmailSchedulerPanel({
  isAdmin,
  notificationLoading,
  setNotificationLoading,
}) {
  // State for schedule management
  const [schedules, setSchedules] = useState([]);
  const [timezones, setTimezones] = useState([]);
  const [currentTimezone, setCurrentTimezone] = useState("UTC");
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  // Individual loading states for manual email buttons
  const [loadingStates, setLoadingStates] = useState({});

  // Load schedules and timezones on component mount
  useEffect(() => {
    if (isAdmin) {
      loadSchedules();
      loadTimezones();
    }
  }, [isAdmin]);

  // Load all schedules
  const loadSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/scheduler/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSchedules(response.data.schedules || []);
      const dbTimezone = response.data.timezone || "UTC";
      setCurrentTimezone(dbTimezone);
      setSelectedTimezone(dbTimezone);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Failed to load schedules", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
    } finally {
      setSchedulesLoading(false);
    }
  };

  // Load available timezones
  const loadTimezones = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/scheduler/timezones", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTimezones(response.data.timezones || []);
      // Don't override currentTimezone here - it should come from loadSchedules
    } catch (error) {
      console.error("Error loading timezones:", error);
    }
  };

  // Handle schedule editing
  const handleEditSchedule = (schedule) => {
    const hour = schedule.metadata?.hour || 0;
    const minute = schedule.metadata?.minute || 0;
    const timeString = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    setEditingSchedule({
      ...schedule,
      hour: hour,
      minute: minute,
      timeDisplay: convertTo12Hour(timeString), // For display in time input
      dayOfWeek: schedule.metadata?.dayOfWeek || [],
      dayOfMonth: schedule.metadata?.dayOfMonth || null,
      intervalSeconds: schedule.metadata?.intervalSeconds || null,
    });
    setShowEditModal(true);
  };

  // Save schedule changes
  const handleSaveSchedule = async () => {
    if (!editingSchedule) return;

    try {
      setNotificationLoading(true);
      const token = localStorage.getItem("token");

      // Parse time from timeDisplay if it's been changed
      let hour = editingSchedule.hour;
      let minute = editingSchedule.minute;

      if (editingSchedule.timeDisplay && !editingSchedule.intervalSeconds) {
        const time24h = convertTo24Hour(editingSchedule.timeDisplay);
        const [parsedHour, parsedMinute] = time24h.split(":").map(Number);
        hour = parsedHour;
        minute = parsedMinute;
      }

      const updateData = {
        metadata: {
          hour: hour,
          minute: minute,
          dayOfWeek:
            editingSchedule.dayOfWeek.length > 0
              ? editingSchedule.dayOfWeek
              : undefined,
          dayOfMonth: editingSchedule.dayOfMonth,
          intervalSeconds: editingSchedule.intervalSeconds,
        },
        description: editingSchedule.description,
        enabled: editingSchedule.enabled,
      };

      await axios.put(
        `/api/scheduler/schedules/${editingSchedule.jobName}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        `Schedule for ${editingSchedule.jobName} updated successfully!`,
        {
          duration: 3000,
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#4CAF50",
          },
        }
      );
      setShowEditModal(false);
      setEditingSchedule(null);
      await loadSchedules(); // Reload schedules
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error(
        error.response?.data?.message || "Failed to update schedule",
        {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        }
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // Toggle job enabled/disabled
  const handleToggleJob = async (jobName, enabled) => {
    try {
      setNotificationLoading(true);
      const token = localStorage.getItem("token");

      await axios.patch(
        `/api/scheduler/schedules/${jobName}/toggle`,
        { enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        `${jobName} ${enabled ? "enabled" : "disabled"} successfully!`,
        {
          duration: 3000,
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#4CAF50",
          },
        }
      );
      await loadSchedules(); // Reload schedules
    } catch (error) {
      console.error("Error toggling job:", error);
      toast.error(error.response?.data?.message || "Failed to toggle job", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  // Update timezone
  const handleUpdateTimezone = async () => {
    try {
      setNotificationLoading(true);
      const token = localStorage.getItem("token");

      await axios.put(
        "/api/scheduler/timezone",
        { timezone: selectedTimezone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Timezone updated to ${selectedTimezone} successfully!`, {
        duration: 3000,
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#4CAF50",
        },
      });
      setCurrentTimezone(selectedTimezone);
      setShowTimezoneModal(false);
      await loadSchedules(); // Reload schedules to see changes
    } catch (error) {
      console.error("Error updating timezone:", error);
      toast.error(
        error.response?.data?.message || "Failed to update timezone",
        {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        }
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // Helper function to get job icon
  const getJobIcon = (jobName) => {
    const icons = {
      "checkin-reminder": FaUser,
      "checkout-reminder": FaUser,
      "auto-checkout": FaCog,
      "daily-summary": FaCalendarDay,
      "upcoming-events": FaBell,
      "monthly-financial": FaFileInvoiceDollar,
      "custom-reminders": FaBell,
      cleanup: FaCog,
    };
    return icons[jobName] || FaCog;
  };

  // Helper function to format job name for display
  const jobNameOverrides = {
    "weekly-blog-whatsapp-report": "Blog Whatsapp Report",
  };

  const formatJobName = (jobName) => {
    if (jobNameOverrides[jobName]) {
      return jobNameOverrides[jobName];
    }
    return jobName
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Scheduler Management Handlers
  const handleTriggerSchedulerJob = async (jobName) => {
    if (!isAdmin) return;

    setLoadingStates((prev) => ({ ...prev, [jobName]: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/scheduler/trigger/${jobName}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        response.data.message || `Job '${jobName}' triggered successfully`,
        {
          duration: 3000,
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#4CAF50",
          },
        }
      );
    } catch (err) {
      console.error(`Error triggering scheduler job ${jobName}:`, err);
      toast.error(
        err.response?.data?.message || `Failed to trigger job '${jobName}'`,
        {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        }
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [jobName]: false }));
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card
      className="w-full dark:bg-slate-950 mx-auto max-w-7xl"
      id="scheduler-panel"
      role="tabpanel"
      aria-labelledby="tab-scheduler"
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 dark:text-white text-center flex items-center justify-center flex-wrap">
        <FaEnvelope className="mr-2 sm:mr-3 text-teal-600 dark:text-teal-400" />
        <span className="break-words">Email Scheduler Management</span>
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {/* Schedule Management */}
        <div className="bg-teal-50 dark:bg-teal-900/20 p-3 sm:p-4 lg:p-6 rounded-lg border border-teal-200 dark:border-teal-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-teal-800 dark:text-teal-300 mb-2 sm:mb-0">
              Email Schedule Management
            </h3>
            <div className="flex flex-col xs:flex-row gap-2">
              <CustomButton
                variant="blue"
                onClick={() => {
                  // Reset timezone selection to current database value when opening modal
                  setSelectedTimezone(currentTimezone);
                  setShowTimezoneModal(true);
                }}
                disabled={notificationLoading}
                icon={FaGlobe}
                size="sm"
              >
                <span className="hidden sm:inline">Change Timezone</span>
                <span className="sm:hidden">Timezone</span>
              </CustomButton>
              <CustomButton
                variant="teal"
                onClick={loadSchedules}
                disabled={schedulesLoading}
                icon={HiRefresh}
                size="sm"
              >
                {schedulesLoading ? "Loading..." : "Refresh"}
              </CustomButton>
            </div>
          </div>

          {/* Current Timezone Display */}
          <div className="mb-4 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-teal-100 dark:border-teal-800/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Timezone:
              </span>
              <span className="text-sm font-mono bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded text-teal-800 dark:text-teal-200">
                {currentTimezone}
              </span>
            </div>
          </div>

          {/* Schedule List */}
          {schedulesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Loading schedules...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {schedules.map((schedule) => {
                const IconComponent = getJobIcon(schedule.jobName);
                return (
                  <div
                    key={schedule.jobName}
                    className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg border border-teal-100 dark:border-teal-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <IconComponent className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {formatJobName(schedule.jobName)}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {schedule.displaySchedule || schedule.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {/* Enable/Disable Toggle */}
                        <button
                          onClick={() =>
                            handleToggleJob(schedule.jobName, !schedule.enabled)
                          }
                          disabled={notificationLoading}
                          className={`text-lg transition-colors ${
                            schedule.enabled
                              ? "text-green-500 hover:text-green-600"
                              : "text-gray-400 hover:text-gray-500"
                          }`}
                          title={schedule.enabled ? "Disable" : "Enable"}
                        >
                          {schedule.enabled ? <FaToggleOn /> : <FaToggleOff />}
                        </button>

                        {/* Edit Button */}
                        <CustomButton
                          variant="teal"
                          onClick={() => handleEditSchedule(schedule)}
                          disabled={notificationLoading}
                          icon={FaEdit}
                          size="xs"
                          title="Edit schedule"
                        >
                          <span className="hidden sm:inline">Edit</span>
                        </CustomButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Manual Emails */}
        <div className="bg-teal-50 dark:bg-teal-900/20 p-3 sm:p-4 lg:p-6 rounded-lg border border-teal-200 dark:border-teal-700">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-teal-800 dark:text-teal-300">
            Manual Emails
          </h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <CustomButton
              variant="teal"
              onClick={() => handleTriggerSchedulerJob("checkin-reminder")}
              disabled={loadingStates["checkin-reminder"]}
              title="Send check-in reminder emails"
            >
              {loadingStates["checkin-reminder"] ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>Check-in</>
              )}
            </CustomButton>

            <CustomButton
              variant="blue"
              onClick={() => handleTriggerSchedulerJob("checkout-reminder")}
              disabled={loadingStates["checkout-reminder"]}
              title="Send check-out reminder emails"
            >
              {loadingStates["checkout-reminder"] ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>Check-out</>
              )}
            </CustomButton>

            <CustomButton
              variant="orange"
              onClick={() => handleTriggerSchedulerJob("auto-checkout")}
              disabled={loadingStates["auto-checkout"]}
              title="Run auto-checkout process"
            >
              {loadingStates["auto-checkout"] ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>Auto-checkout</>
              )}
            </CustomButton>

            <CustomButton
              variant="purple"
              onClick={() => handleTriggerSchedulerJob("daily-summary")}
              disabled={loadingStates["daily-summary"]}
              title="Send daily summary emails"
            >
              {loadingStates["daily-summary"] ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>Daily Summary</>
              )}
            </CustomButton>

            <CustomButton
              variant="green"
              onClick={() => handleTriggerSchedulerJob("upcoming-events")}
              disabled={loadingStates["upcoming-events"]}
              title="Send upcoming events emails"
            >
              {loadingStates["upcoming-events"] ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>Upcoming Events</>
              )}
            </CustomButton>

            <CustomButton
              variant="indigo"
              onClick={() => handleTriggerSchedulerJob("monthly-financial")}
              disabled={loadingStates["monthly-financial"]}
              title="Send monthly financial summary"
            >
              {loadingStates["monthly-financial"] ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>Financial Summary</>
              )}
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Edit Schedule Modal */}
      <CustomModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Schedule: ${
          editingSchedule && formatJobName(editingSchedule.jobName)
        }`}
        maxWidth="md:max-w-2xl"
      >
        {editingSchedule && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSchedule();
            }}
            className="space-y-4"
          >
            {/* Description */}
            <TextInput
              label="Description"
              value={editingSchedule.description || ""}
              onChange={(e) =>
                setEditingSchedule({
                  ...editingSchedule,
                  description: e.target.value,
                })
              }
              placeholder="Enter job description"
              required
            />

            {/* Time Settings (for non-interval jobs) */}
            {!editingSchedule.intervalSeconds && (
              <TextInput
                type="time"
                label="Schedule Time"
                value={
                  editingSchedule.timeDisplay?.includes("AM") ||
                  editingSchedule.timeDisplay?.includes("PM")
                    ? convertTo24Hour(editingSchedule.timeDisplay)
                    : `${(editingSchedule.hour || 0)
                        .toString()
                        .padStart(2, "0")}:${(editingSchedule.minute || 0)
                        .toString()
                        .padStart(2, "0")}`
                }
                onChange={(e) =>
                  setEditingSchedule({
                    ...editingSchedule,
                    timeDisplay: convertTo12Hour(e.target.value),
                  })
                }
                placeholder="09:00 AM"
                step="60"
              />
            )}

            {/* Day of Week Settings (for weekly jobs) */}
            {editingSchedule.jobName === "upcoming-events" && (
              <div>
                <Label
                  value="Days of Week (for upcoming events)"
                  className="text-gray-700 dark:text-gray-200 font-medium mb-2 block"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 0, label: "Sunday" },
                    { value: 1, label: "Monday" },
                    { value: 2, label: "Tuesday" },
                    { value: 3, label: "Wednesday" },
                    { value: 4, label: "Thursday" },
                    { value: 5, label: "Friday" },
                    { value: 6, label: "Saturday" },
                  ].map((day) => (
                    <CustomCheckbox
                      key={day.value}
                      id={`day-${day.value}`}
                      label={day.label}
                      checked={
                        editingSchedule.dayOfWeek?.includes(day.value) || false
                      }
                      onChange={(checked) => {
                        const currentDays = editingSchedule.dayOfWeek || [];
                        const newDays = checked
                          ? [...currentDays, day.value]
                          : currentDays.filter((d) => d !== day.value);
                        setEditingSchedule({
                          ...editingSchedule,
                          dayOfWeek: newDays,
                        });
                      }}
                      className="p-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Day of Month (for monthly jobs) */}
            {editingSchedule.jobName === "monthly-financial" && (
              <div>
                <Select
                  id="dayOfMonth"
                  label="Day of Month"
                  value={editingSchedule.dayOfMonth || 1}
                  onChange={(value) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      dayOfMonth: parseInt(value),
                    })
                  }
                  options={[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const suffix =
                      day === 1
                        ? "st"
                        : day === 2
                        ? "nd"
                        : day === 3
                        ? "rd"
                        : "th";
                    return {
                      value: day,
                      label: `${day}${suffix} of the month`,
                    };
                  })}
                  placeholder="Select day of month"
                  required
                />
              </div>
            )}

            {/* Interval Settings (for custom reminders) */}
            {editingSchedule.jobName === "custom-reminders" && (
              <div>
                <Select
                  id="intervalSeconds"
                  label="Check Interval"
                  value={editingSchedule.intervalSeconds || 10}
                  onChange={(value) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      intervalSeconds: parseInt(value),
                    })
                  }
                  options={[
                    { value: 5, label: "Every 5 seconds" },
                    { value: 10, label: "Every 10 seconds" },
                    { value: 30, label: "Every 30 seconds" },
                    { value: 60, label: "Every 1 minute" },
                    { value: 300, label: "Every 5 minutes" },
                  ]}
                  placeholder="Select check interval"
                  required
                />
              </div>
            )}

            {/* Enable/Disable */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <input
                type="checkbox"
                id="enabled"
                checked={editingSchedule.enabled || false}
                onChange={(e) =>
                  setEditingSchedule({
                    ...editingSchedule,
                    enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 dark:focus:ring-teal-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <Label
                htmlFor="enabled"
                value="Enable this schedule"
                className="text-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-600">
              <CustomButton
                variant="gray"
                onClick={() => setShowEditModal(false)}
                disabled={notificationLoading}
              >
                Cancel
              </CustomButton>
              <CustomButton
                type="submit"
                variant="teal"
                disabled={notificationLoading}
                loading={notificationLoading}
              >
                {notificationLoading ? "Saving..." : "Save Changes"}
              </CustomButton>
            </div>
          </form>
        )}
      </CustomModal>

      {/* Timezone Selection Modal */}
      <CustomModal
        isOpen={showTimezoneModal}
        onClose={() => setShowTimezoneModal(false)}
        title="Change System Timezone"
        subtitle="Update the timezone for all scheduled email notifications"
        maxWidth="md:max-w-lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateTimezone();
          }}
          className="space-y-4"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              📍 Changing the timezone will restart all scheduled jobs and
              update their execution times. This affects all email notifications
              system-wide.
            </p>
          </div>

          <div>
            <Select
              id="timezone"
              label="Select Timezone"
              value={selectedTimezone}
              onChange={(value) => setSelectedTimezone(value)}
              options={timezones.map((tz) => ({
                value: tz.value,
                label: `${tz.label} (${tz.offset})`,
              }))}
              placeholder="Choose a timezone"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-600">
            <CustomButton
              variant="gray"
              onClick={() => setShowTimezoneModal(false)}
              disabled={notificationLoading}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              variant="orange"
              disabled={
                notificationLoading || selectedTimezone === currentTimezone
              }
              loading={notificationLoading}
            >
              {notificationLoading ? "Updating..." : "Update Timezone"}
            </CustomButton>
          </div>
        </form>
      </CustomModal>
    </Card>
  );
}

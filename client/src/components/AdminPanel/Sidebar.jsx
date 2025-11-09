import React from "react";
import {
  FaCog,
  FaChartLine,
  FaBlog,
  FaMapMarkedAlt,
  FaPlaneDeparture,
  FaBuilding,
  FaDollarSign,
  FaFileInvoiceDollar,
  FaCoins,
  FaCalendarDay,
  FaBell,
  FaEnvelope,
  FaPalette,
  FaBox,
} from "react-icons/fa";

export default function Sidebar({
  activeTab,
  handleTabChange,
  handleTabKeyDown,
  isAdmin,
  isAccountant,
  isContentManager,
  isPublisher,
}) {
  return (
    <div className="hidden lg:block fixed left-0 top-20 h-[calc(100vh-5rem)] z-40 group">
      {/* Sidebar Container with Hover Effect */}
      <div className="relative h-full bg-white dark:bg-slate-950 shadow-2xl border-r border-gray-200 dark:border-slate-900 transition-all duration-300 ease-in-out w-16 group-hover:w-64 overflow-hidden">
        {/* Header */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 whitespace-nowrap">
            <FaCog className="h-5 w-5 text-blue-600 dark:text-teal-400 flex-shrink-0" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Dashboard
            </h3>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="overflow-y-auto overflow-x-hidden h-[calc(100vh-9rem)] py-2 scrollbar-hide group-hover:scrollbar-default">
          <style>{`
            .scrollbar-default::-webkit-scrollbar {
              width: 8px;
            }
            .scrollbar-default::-webkit-scrollbar-track {
              background: #f1f5f9;
            }
            .dark .scrollbar-default::-webkit-scrollbar-track {
              background: #1e293b;
            }
            .scrollbar-default::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 4px;
            }
            .dark .scrollbar-default::-webkit-scrollbar-thumb {
              background: #475569;
              border-radius: 4px;
            }
            .scrollbar-default::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
            .dark .scrollbar-default::-webkit-scrollbar-thumb:hover {
              background: #64748b;
            }
          `}</style>
          <nav role="tablist" aria-label="Admin Sections">
            {!isContentManager && !isPublisher && (
              <button
                id="tab-analytics"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "analytics"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("analytics")}
                onKeyDown={(e) => handleTabKeyDown(e, "analytics")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "analytics"}
                aria-controls="analytics-panel"
                title="Analytics"
              >
                {/* Active Indicator */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "analytics" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaChartLine className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Analytics
                </span>
              </button>
            )}
            {/* Blog tab first for publishers */}
            {isPublisher && (
              <button
                id="tab-blog"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "blog"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("blog")}
                onKeyDown={(e) => handleTabKeyDown(e, "blog")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "blog"}
                aria-controls="blog-panel"
                title="Blog"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "blog" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaBlog className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Blog
                </span>
              </button>
            )}
            <button
              id="tab-hotels"
              className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                activeTab === "hotels"
                  ? "text-blue-600 dark:text-teal-400 font-medium"
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
              }`}
              onClick={() => handleTabChange("hotels")}
              onKeyDown={(e) => handleTabKeyDown(e, "hotels")}
              tabIndex={0}
              role="tab"
              aria-selected={activeTab === "hotels"}
              aria-controls="hotels-panel"
              title="Hotels"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                  activeTab === "hotels" ? "opacity-100" : "opacity-0"
                }`}
              ></div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Hotels
              </span>
            </button>
            <button
              id="tab-tours"
              className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                activeTab === "tours"
                  ? "text-blue-600 dark:text-teal-400 font-medium"
                  : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
              }`}
              onClick={() => handleTabChange("tours")}
              onKeyDown={(e) => handleTabKeyDown(e, "tours")}
              tabIndex={0}
              role="tab"
              aria-selected={activeTab === "tours"}
              aria-controls="tours-panel"
              title="Tours"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                  activeTab === "tours" ? "opacity-100" : "opacity-0"
                }`}
              ></div>
              <FaMapMarkedAlt className="h-5 w-5 flex-shrink-0" />
              <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Tours
              </span>
            </button>
            {(isAdmin || isContentManager || isPublisher) && (
              <button
                id="tab-packages"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "packages"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("packages")}
                onKeyDown={(e) => handleTabKeyDown(e, "packages")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "packages"}
                aria-controls="packages-panel"
                title="Packages"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "packages" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaBox className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Packages
                </span>
              </button>
            )}
            {/* Blog tab for non-publishers (publishers get it first) */}
            {(isAdmin || isContentManager) && !isPublisher && (
              <button
                id="tab-blog"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "blog"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("blog")}
                onKeyDown={(e) => handleTabKeyDown(e, "blog")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "blog"}
                aria-controls="blog-panel"
                title="Blog"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "blog" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaBlog className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Blog
                </span>
              </button>
            )}
            {!isPublisher && (
              <button
                id="tab-airports"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "airports"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("airports")}
                onKeyDown={(e) => handleTabKeyDown(e, "airports")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "airports"}
                aria-controls="airports-panel"
                title="Airports"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "airports" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaPlaneDeparture className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Airports
                </span>
              </button>
            )}
            {!isPublisher && (
              <button
                id="tab-offices"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "offices"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("offices")}
                onKeyDown={(e) => handleTabKeyDown(e, "offices")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "offices"}
                aria-controls="offices-panel"
                title="Offices"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "offices" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaBuilding className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Offices
                </span>
              </button>
            )}
            {!isContentManager && !isPublisher && (
              <button
                id="tab-office-vouchers"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "office-vouchers"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("office-vouchers")}
                onKeyDown={(e) => handleTabKeyDown(e, "office-vouchers")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "office-vouchers"}
                aria-controls="office-vouchers-panel"
                title="Office Vouchers"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "office-vouchers"
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
                ></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Office Vouchers
                </span>
              </button>
            )}
            {!isContentManager && !isPublisher && (
              <button
                id="tab-financials"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "financials"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("financials")}
                onKeyDown={(e) => handleTabKeyDown(e, "financials")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "financials"}
                aria-controls="financials-panel"
                title="Financials"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "financials" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaDollarSign className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Financials
                </span>
              </button>
            )}
            {!isContentManager && !isPublisher && (
              <button
                id="tab-debts"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "debts"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("debts")}
                onKeyDown={(e) => handleTabKeyDown(e, "debts")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "debts"}
                aria-controls="debts-panel"
                title="Debt Management"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "debts" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaFileInvoiceDollar className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Debts
                </span>
              </button>
            )}
            {(isAdmin || isAccountant) && !isPublisher && (
              <button
                id="tab-salaries"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "salaries"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("salaries")}
                onKeyDown={(e) => handleTabKeyDown(e, "salaries")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "salaries"}
                aria-controls="salaries-panel"
                title="Salaries & Bonuses"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "salaries" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaCoins className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Salaries
                </span>
              </button>
            )}

            {(isAdmin || isAccountant) && !isPublisher && (
              <button
                id="tab-attendance"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "attendance"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("attendance")}
                onKeyDown={(e) => handleTabKeyDown(e, "attendance")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "attendance"}
                aria-controls="attendance-panel"
                title="Attendance"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "attendance" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaCalendarDay className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Attendance
                </span>
              </button>
            )}

            {/* Show Users tab to admins and accountants only, not content managers */}
            {!isContentManager && !isPublisher && (
              <button
                id="tab-users"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "users"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("users")}
                onKeyDown={(e) => handleTabKeyDown(e, "users")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "users"}
                aria-controls="users-panel"
                title="Users"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "users" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Users
                </span>
              </button>
            )}

            {/* Only show User Requests tab to full admins */}
            {isAdmin && (
              <button
                id="tab-requests"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "requests"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("requests")}
                onKeyDown={(e) => handleTabKeyDown(e, "requests")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "requests"}
                aria-controls="requests-panel"
                title="User Requests"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "requests" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                  />
                </svg>
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Requests
                </span>
              </button>
            )}

            {/* Show Notifications tab to admins and accountants only, not content managers */}
            {!isContentManager && !isPublisher && (
              <button
                id="tab-notifications"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "notifications"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("notifications")}
                onKeyDown={(e) => handleTabKeyDown(e, "notifications")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "notifications"}
                aria-controls="notifications-panel"
                title="Notifications"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "notifications" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaBell className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Notifications
                </span>
              </button>
            )}

            {/* Show Scheduler tab to admin only */}
            {isAdmin && (
              <button
                id="tab-scheduler"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "scheduler"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("scheduler")}
                onKeyDown={(e) => handleTabKeyDown(e, "scheduler")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "scheduler"}
                aria-controls="scheduler-panel"
                title="Email Scheduler"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "scheduler" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaEnvelope className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Scheduler
                </span>
              </button>
            )}

            {/* Show UI Management tab to admin, content managers, and publishers */}
            {(isAdmin || isContentManager || isPublisher) && (
              <button
                id="tab-ui-management"
                className={`flex items-center w-full px-4 py-3 mb-1 text-left transition-all duration-200 relative ${
                  activeTab === "ui-management"
                    ? "text-blue-600 dark:text-teal-400 font-medium"
                    : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-teal-400"
                }`}
                onClick={() => handleTabChange("ui-management")}
                onKeyDown={(e) => handleTabKeyDown(e, "ui-management")}
                tabIndex={0}
                role="tab"
                aria-selected={activeTab === "ui-management"}
                aria-controls="ui-management-panel"
                title="UI Management"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-teal-400 transition-opacity duration-200 ${
                    activeTab === "ui-management" ? "opacity-100" : "opacity-0"
                  }`}
                ></div>
                <FaPalette className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  UI
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}

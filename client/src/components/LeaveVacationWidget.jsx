import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCalendarAlt, 
    FaUserClock, 
    FaExternalLinkAlt,
    FaClock,
    FaCalendarCheck,
    FaCalendarTimes,
    FaUserMinus
} from 'react-icons/fa';
import CustomScrollbar from './CustomScrollbar';
import RahalatekLoader from './RahalatekLoader';

export default function LeaveVacationWidget({ analytics }) {
    const [loading, setLoading] = useState(!analytics);

    useEffect(() => {
        if (analytics) {
            setLoading(false);
        }
    }, [analytics]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        
        if (dateOnly.getTime() === todayOnly.getTime()) {
            return 'Today';
        } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
            });
        }
    };

    const formatLeaveType = (leaveType, isMobile = false) => {
        const typeMap = {
            'sick': isMobile ? 'Sick' : 'Sick Leave',
            'annual': isMobile ? 'Annual' : 'Annual Leave',
            'emergency': 'Emergency',
            'maternity': 'Maternity',
            'paternity': 'Paternity',
            'unpaid': isMobile ? 'Unpaid' : 'Unpaid Leave',
            'personal': 'Personal',
            'bereavement': 'Bereavement',
            'custom': 'Other'
        };
        return typeMap[leaveType] || leaveType;
    };

    const getLeaveTypeColor = (leaveType) => {
        const colorMap = {
            'sick': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            'annual': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            'emergency': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            'maternity': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
            'paternity': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'unpaid': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            'personal': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            'bereavement': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
            'custom': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
        };
        return colorMap[leaveType] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    };

    const formatDateRange = (leave) => {
        if (leave.leaveCategory === 'multiple-day') {
            return `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`;
        } else {
            return formatDate(leave.date);
        }
    };

    const formatDuration = (leave) => {
        if (leave.leaveCategory === 'hourly') {
            return `${leave.hoursCount || 0}h`;
        } else {
            return `${leave.daysCount || 0}d`;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm min-h-[400px] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
                        <FaUserClock className="text-blue-600 dark:text-teal-400 text-base sm:text-lg" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                        <span className="hidden sm:inline">Leave & Vacation</span>
                        <span className="sm:hidden">Leave</span>
                    </h3>
                </div>
                <Link 
                    to="/dashboard?tab=attendance"
                    className="p-1.5 sm:p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl hover:bg-blue-200 dark:hover:bg-teal-800/50 transition-colors"
                    title="View attendance panel"
                >
                    <FaExternalLinkAlt className="text-blue-600 dark:text-teal-400 text-xs sm:text-sm" />
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="px-4 py-3 sm:px-6 bg-gray-50 dark:bg-slate-800/50">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    {/* Users on Leave Today */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg mx-auto mb-1">
                            <FaUserMinus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-xs sm:text-xs font-semibold text-gray-900 dark:text-white">
                            {analytics?.leaves?.usersOnLeaveToday || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="hidden sm:inline">On Leave Today</span>
                            <span className="sm:hidden">On Leave</span>
                        </div>
                    </div>

                    {/* Active Leaves */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-900/30 rounded-lg mx-auto mb-1">
                            <FaCalendarTimes className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {analytics?.leaves?.activeToday || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="hidden sm:inline">Active Leaves</span>
                            <span className="sm:hidden">Active</span>
                        </div>
                    </div>

                    {/* Leave Requests */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-1">
                            <FaClock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {analytics?.leaves?.monthlyCount || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="hidden sm:inline">Leave Requests</span>
                            <span className="sm:hidden">Requests</span>
                        </div>
                    </div>

                    {/* Total Days */}
                    <div className="text-center">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg mx-auto mb-1">
                            <FaCalendarCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {analytics?.leaves?.leavesByType ? 
                                Object.values(analytics.leaves.leavesByType).reduce((total, type) => total + (type.totalDays || 0), 0) 
                                : 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="hidden sm:inline">Days This Month</span>
                            <span className="sm:hidden">Days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 flex-1">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <RahalatekLoader size="md" />
                    </div>
                ) : !analytics?.leaves?.monthlyLeaves || analytics.leaves.monthlyLeaves.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                        <FaUserClock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">No leave activity this month</p>
                    </div>
                ) : (
                    <CustomScrollbar maxHeight="400px">
                        <div className="space-y-2 sm:space-y-3">
                            {analytics.leaves.monthlyLeaves.map((leave, index) => (
                                <div key={leave._id || index} className="flex items-center justify-between p-2 sm:p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <FaCalendarAlt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Link 
                                                    to={`/profile/${leave.userId._id}`}
                                                    className="font-medium text-sm sm:text-base text-blue-600 dark:text-teal-400 hover:text-blue-800 dark:hover:text-teal-300 hover:underline transition-colors truncate"
                                                    title="View user profile"
                                                >
                                                    {leave.userId.username}
                                                </Link>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                                                    <span className="sm:hidden">{formatLeaveType(leave.leaveType, true)}</span>
                                                    <span className="hidden sm:inline">{formatLeaveType(leave.leaveType, false)}</span>
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDateRange(leave)}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {formatDuration(leave)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                            {leave.leaveCategory.replace('-', ' ')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CustomScrollbar>
                )}
            </div>
        </div>
    );
}

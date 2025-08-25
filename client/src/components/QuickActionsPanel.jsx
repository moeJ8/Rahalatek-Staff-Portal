import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaTicketAlt, 
  FaHotel, 
  FaPlane, 
  FaUsers, 
  FaCalendarCheck, 
  FaMoneyBillWave, 
  FaChartBar,
  FaCog,
  FaFileInvoiceDollar,
  FaBuilding,
  FaUserTie,
  FaBell,
  FaTrash,
  FaBellSlash
} from 'react-icons/fa';

export default function QuickActionsPanel() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  // Define actions based on user roles
  const getQuickActions = () => {
    if (!user) return [];

    const commonActions = [
      {
        id: 'create-voucher',
        title: 'Create Voucher',
        description: 'New booking voucher',
        icon: <FaTicketAlt className="w-5 h-5" />,
        link: '/vouchers/new',
        color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
        hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/50'
      },
      {
        id: 'view-vouchers',
        title: 'View Vouchers',
        description: 'Manage all vouchers',
        icon: <FaFileInvoiceDollar className="w-5 h-5" />,
        link: '/vouchers',
        color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/50'
      }
    ];

    const adminActions = [
      {
        id: 'manage-attendance',
        title: 'Manage Attendance',
        description: 'Staff attendance',
        icon: <FaUsers className="w-5 h-5" />,
        link: '/dashboard?tab=attendance',
        color: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        hoverColor: 'hover:bg-pink-100 dark:hover:bg-pink-900/50'
      },
      {
        id: 'manage-hotels',
        title: 'Manage Hotels',
        description: 'Add & edit hotels',
        icon: <FaHotel className="w-5 h-5" />,
        link: '/hotels',
        color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/50'
      },
      {
        id: 'manage-tours',
        title: 'Manage Tours',
        description: 'Tours & activities',
        icon: <FaPlane className="w-5 h-5" />,
        link: '/tours',
        color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        hoverColor: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
      },
      {
        id: 'manage-offices',
        title: 'Manage Offices',
        description: 'Office payments',
        icon: <FaBuilding className="w-5 h-5" />,
        link: '/dashboard?tab=offices',
        color: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
        hoverColor: 'hover:bg-teal-100 dark:hover:bg-teal-900/50'
      }
    ];

    const accountantActions = [
      {
        id: 'check-attendance',
        title: 'Check Attendance',
        description: 'Staff attendance',
        icon: <FaUsers className="w-5 h-5" />,
        link: '/dashboard?tab=attendance',
        color: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
        hoverColor: 'hover:bg-pink-100 dark:hover:bg-pink-900/50'
      },
      {
        id: 'manage-hotels',
        title: 'Manage Hotels',
        description: 'Add & edit hotels',
        icon: <FaHotel className="w-5 h-5" />,
        link: '/hotels',
        color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
        hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/50'
      },
      {
        id: 'manage-tours',
        title: 'Manage Tours',
        description: 'Tours & activities',
        icon: <FaPlane className="w-5 h-5" />,
        link: '/tours',
        color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
        hoverColor: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
      },
      {
        id: 'office-payments',
        title: 'Office Payments',
        description: 'Financial tracking',
        icon: <FaMoneyBillWave className="w-5 h-5" />,
        link: '/dashboard',
        color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
      }
    ];

    const personalActions = [
      {
        id: 'attendance',
        title: 'My Attendance',
        description: 'Check attendance',
        icon: <FaCalendarCheck className="w-5 h-5" />,
        link: '/attendance',
        color: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
        hoverColor: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/50'
      },
      {
        id: 'profile',
        title: 'My Profile',
        description: 'Update profile',
        icon: <FaUserTie className="w-5 h-5" />,
        link: '/profile',
        color: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
        hoverColor: 'hover:bg-rose-100 dark:hover:bg-rose-900/50'
      }
    ];

    let actions = [...commonActions, ...personalActions];

    if (user.isAdmin) {
      actions = [...actions, ...adminActions];
    } else if (user.isAccountant) {
      actions = [...actions, ...accountantActions];
    }

    // Add notifications for all users, but limit other actions to admins
    actions.push(
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'System alerts',
        icon: <FaBell className="w-5 h-5" />,
        link: '/notifications',
        color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900/50'
      },
              {
          id: 'create-reminder',
          title: 'Create Reminder',
          description: user.isAdmin ? 'Custom notifications' : 'Personal reminders',
          icon: <FaBellSlash className="w-5 h-5" />,
          link: user.isAdmin || user.isAccountant ? '/dashboard?tab=notifications' : '/notifications/manage',
          color: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
          hoverColor: 'hover:bg-teal-100 dark:hover:bg-teal-900/50'
        }
    );

    // Add admin-only actions
    if (user.isAdmin) {
      actions.push(
        {
          id: 'trash',
          title: 'Manage Trash',
          description: 'Deleted items',
          icon: <FaTrash className="w-5 h-5" />,
          link: '/vouchers/trash',
          color: 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400',
          hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-900/50'
        }
      );
    }

    return actions;
  };

  const quickActions = getQuickActions();

  if (!user || quickActions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-xl border-0 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-950/30 dark:to-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-teal-900/50 rounded-xl">
            <FaCog className="text-blue-600 dark:text-teal-400 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Quick Actions</h3>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.id}
              to={action.link}
              className={`
                group flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 
                ${action.color} ${action.hoverColor}
                hover:shadow-md hover:scale-105 transform
              `}
            >
              <div className="flex items-center justify-center">
                {action.icon}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm mb-1">
                  {action.title}
                </div>
                <div className="text-xs opacity-75">
                  {action.description}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Role Badge */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
          <div className="flex items-center justify-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {user.isAdmin ? '👑 Administrator' : user.isAccountant ? '💼 Accountant' : '👤 User'} • {quickActions.length} actions available
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

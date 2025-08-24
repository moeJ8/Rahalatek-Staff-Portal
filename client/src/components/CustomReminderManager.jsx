import React, { useState, useEffect } from 'react';
import { Label, Badge } from 'flowbite-react';
import { FaBell, FaEdit, FaTrash, FaClock, FaCheckCircle, FaTimesCircle, FaUsers, FaUser, FaCalendarCheck } from 'react-icons/fa';
import CustomButton from './CustomButton';
import CustomModal from './CustomModal';
import CustomSelect from './Select';
import CustomDatePicker from './CustomDatePicker';
import CheckBoxDropDown from './CheckBoxDropDown';
import CustomCheckbox from './CustomCheckbox';
import TextInput from './TextInput';
import CustomScrollbar from './CustomScrollbar';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function CustomReminderManager({ allUsers, fetchAllUsersForReminders }) {
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [deletingReminder, setDeletingReminder] = useState(null);
    const [selectedReminders, setSelectedReminders] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [reminderLoading, setReminderLoading] = useState(false);
    const [loadingReminders, setLoadingReminders] = useState(false);
    const [deletingLoading, setDeletingLoading] = useState(false);
    const [bulkDeletingLoading, setBulkDeletingLoading] = useState(false);
    const [hoveredUsersBadge, setHoveredUsersBadge] = useState(null);
    const [hoveredDropdown, setHoveredDropdown] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [reminderForm, setReminderForm] = useState({
        title: '',
        message: '',
        scheduledDate: '',
        scheduledTime: '',
        targetUsers: [],
        isSystemWide: false,
        sendInstantly: false,
        priority: 'medium'
    });

    // Handle reminder form changes
    const handleReminderFormChange = (field, value) => {
        setReminderForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle target users change for reminder
    const handleReminderTargetUsersChange = (selectedUserIds) => {
        setReminderForm(prev => ({
            ...prev,
            targetUsers: selectedUserIds
        }));
    };

    // Reset reminder form
    const resetReminderForm = () => {
        setReminderForm({
            title: '',
            message: '',
            scheduledDate: '',
            scheduledTime: '',
            targetUsers: [],
            isSystemWide: false,
            sendInstantly: false,
            priority: 'medium'
        });
    };

    // Fetch all reminders
    const fetchReminders = async () => {
        try {
            setLoadingReminders(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/notifications/reminders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReminders(response.data.data || []);
        } catch (error) {
            console.error('Error fetching reminders:', error);
            toast.error('Failed to fetch reminders');
        } finally {
            setLoadingReminders(false);
        }
    };

    // Load reminders on component mount
    useEffect(() => {
        fetchReminders();
    }, []);

    // Open delete confirmation modal
    const handleDeleteReminder = (reminder) => {
        setDeletingReminder(reminder);
        setShowDeleteModal(true);
    };

    // Confirm delete reminder
    const confirmDeleteReminder = async () => {
        if (!deletingReminder) return;

        try {
            setDeletingLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(`/api/notifications/reminders/${deletingReminder._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Reminder deleted successfully');
            setShowDeleteModal(false);
            setDeletingReminder(null);
            fetchReminders(); // Refresh the list
        } catch (error) {
            console.error('Error deleting reminder:', error);
            toast.error(error.response?.data?.message || 'Failed to delete reminder');
        } finally {
            setDeletingLoading(false);
        }
    };

    // Bulk selection functions
    const handleSelectReminder = (reminderId, isChecked) => {
        if (isChecked) {
            setSelectedReminders(prev => [...prev, reminderId]);
        } else {
            setSelectedReminders(prev => prev.filter(id => id !== reminderId));
        }
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            setSelectedReminders(reminders.map(reminder => reminder._id));
        } else {
            setSelectedReminders([]);
        }
    };

    const handleBulkDelete = () => {
        if (selectedReminders.length === 0) {
            toast.error('Please select reminders to delete');
            return;
        }
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = async () => {
        if (selectedReminders.length === 0) return;

        try {
            setBulkDeletingLoading(true);
            const token = localStorage.getItem('token');
            
            // Delete all selected reminders in parallel
            await Promise.all(
                selectedReminders.map(reminderId =>
                    axios.delete(`/api/notifications/reminders/${reminderId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                )
            );
            
            toast.success(`${selectedReminders.length} reminder${selectedReminders.length !== 1 ? 's' : ''} deleted successfully`);
            setShowBulkDeleteModal(false);
            setSelectedReminders([]);
            fetchReminders(); // Refresh the list
        } catch (error) {
            console.error('Error deleting reminders:', error);
            toast.error('Failed to delete some reminders');
        } finally {
            setBulkDeletingLoading(false);
        }
    };

    // Edit reminder
    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        
        // Parse the scheduled date and time
        const scheduledDate = reminder.scheduledFor ? new Date(reminder.scheduledFor) : new Date();
        const dateStr = scheduledDate.toISOString().split('T')[0];
        const timeStr = scheduledDate.toTimeString().slice(0, 5);
        
        setReminderForm({
            title: reminder.title || '',
            message: reminder.message || '',
            scheduledDate: dateStr,
            scheduledTime: timeStr,
            targetUsers: reminder.targetUsers?.map(user => user._id) || [],
            isSystemWide: reminder.isSystemWide || false,
            sendInstantly: false,
            priority: reminder.priority || 'medium'
        });
        
        setShowEditModal(true);
    };

    // Update reminder
    const handleUpdateReminder = async (e) => {
        e.preventDefault();
        
        if (!editingReminder) return;

        try {
            setReminderLoading(true);
            const token = localStorage.getItem('token');
            
            // Prepare scheduled time
            let scheduledDateTime;
            if (reminderForm.sendInstantly) {
                scheduledDateTime = new Date();
            } else {
                if (!reminderForm.scheduledDate || !reminderForm.scheduledTime) {
                    toast.error('Please select both date and time for the reminder');
                    return;
                }
                scheduledDateTime = new Date(`${reminderForm.scheduledDate}T${reminderForm.scheduledTime}`);
                
                // Only validate future time if the scheduled time is actually being changed
                const originalScheduledTime = editingReminder?.scheduledFor ? new Date(editingReminder.scheduledFor) : null;
                if (originalScheduledTime && scheduledDateTime.getTime() !== originalScheduledTime.getTime()) {
                    // If changing the time, require it to be in the future
                    if (scheduledDateTime <= new Date()) {
                        toast.error('New scheduled time must be in the future');
                        return;
                    }
                }
            }
            
            const payload = {
                title: reminderForm.title,
                message: reminderForm.message,
                scheduledFor: scheduledDateTime.toISOString(),
                targetUsers: reminderForm.isSystemWide ? [] : reminderForm.targetUsers.filter(id => id !== ''),
                isSystemWide: reminderForm.isSystemWide,
                priority: reminderForm.priority
            };
            
            await axios.put(`/api/notifications/reminders/${editingReminder._id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Reminder updated successfully');
            setShowEditModal(false);
            setEditingReminder(null);
            resetReminderForm();
            fetchReminders(); // Refresh the list
        } catch (error) {
            console.error('Error updating reminder:', error);
            toast.error(error.response?.data?.message || 'Failed to update reminder');
        } finally {
            setReminderLoading(false);
        }
    };

    // Utility functions for displaying data
    const getStatusIcon = (reminder) => {
        const status = reminder.reminderStatus;
        switch (status) {
            case 'scheduled':
                return <FaClock className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
            case 'sent':
                return <FaCheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
            case 'cancelled':
                return <FaTimesCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
            default:
                return <FaCalendarCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
        }
    };

    const getStatusColor = (reminder) => {
        const status = reminder.reminderStatus;
        switch (status) {
            case 'scheduled':
                return 'bg-orange-100 dark:bg-orange-900/30';
            case 'sent':
                return 'bg-green-100 dark:bg-green-900/30';
            case 'cancelled':
                return 'bg-red-100 dark:bg-red-900/30';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'text-gray-600 dark:text-gray-400';
            case 'medium':
                return 'text-blue-600 dark:text-blue-400';
            case 'high':
                return 'text-yellow-600 dark:text-yellow-400';
            case 'urgent':
                return 'text-red-600 dark:text-red-400';
            default:
                return 'text-blue-600 dark:text-blue-400';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
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

    const formatDateWithTime = (dateString) => {
        if (!dateString) return { date: 'N/A', time: 'N/A' };
        const date = new Date(dateString);
        return {
            date: formatDate(dateString),
            time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            })
        };
    };

    // Tooltip functions
    const handleUsersBadgeHover = (e, reminder) => {
        if (!reminder.targetUsers || reminder.targetUsers.length === 0 || reminder.isSystemWide) {
            return;
        }
        
        const rect = e.target.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
        
        setHoveredUsersBadge({
            users: reminder.targetUsers,
            count: reminder.targetUsers.length
        });
    };

    const handleUsersBadgeLeave = () => {
        setHoveredUsersBadge(null);
    };

    // Dropdown tooltip functions
    const handleDropdownHover = (e) => {
        if (!reminderForm.targetUsers || reminderForm.targetUsers.length === 0 || reminderForm.isSystemWide) {
            return;
        }
        
        const rect = e.target.getBoundingClientRect();
        setTooltipPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
        
        // Find selected users from allUsers array
        const selectedUsers = allUsers.filter(user => 
            reminderForm.targetUsers.includes(user._id)
        );
        
        setHoveredDropdown({
            users: selectedUsers,
            count: selectedUsers.length
        });
    };

    const handleDropdownLeave = () => {
        setHoveredDropdown(null);
    };

    // Handle creating custom reminder
    const handleCreateReminder = async (e) => {
        e.preventDefault();
        
        if (!reminderForm.title || !reminderForm.message) {
            toast.error('Please fill in title and message');
            return;
        }

        // Only validate date/time if not sending instantly
        if (!reminderForm.sendInstantly) {
            if (!reminderForm.scheduledDate || !reminderForm.scheduledTime) {
                toast.error('Please select date and time for scheduling');
                return;
            }

            // Combine date and time and validate future time
            const scheduledDateTime = new Date(`${reminderForm.scheduledDate}T${reminderForm.scheduledTime}`);
            if (scheduledDateTime <= new Date()) {
                toast.error('Scheduled time must be in the future');
                return;
            }
        }

        if (!reminderForm.isSystemWide && (reminderForm.targetUsers.length === 0 || (reminderForm.targetUsers.length === 1 && reminderForm.targetUsers[0] === ''))) {
            toast.error('Please select target users or make it system-wide');
            return;
        }

        setReminderLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Determine scheduled time
            let scheduledDateTime;
            if (reminderForm.sendInstantly) {
                // Set to current time for instant delivery
                scheduledDateTime = new Date();
            } else {
                // Use selected date and time
                scheduledDateTime = new Date(`${reminderForm.scheduledDate}T${reminderForm.scheduledTime}`);
            }
            
            // Prepare the payload
            const payload = {
                ...reminderForm,
                scheduledFor: scheduledDateTime.toISOString(),
                // If "All Users" is selected (empty string), filter it out and make it system-wide
                targetUsers: reminderForm.targetUsers.includes('') ? [] : reminderForm.targetUsers.filter(id => id !== ''),
                isSystemWide: reminderForm.isSystemWide || reminderForm.targetUsers.includes('')
            };
            
            // Remove the separate date/time fields and sendInstantly from payload
            delete payload.scheduledDate;
            delete payload.scheduledTime;
            delete payload.sendInstantly;
            
            await axios.post('/api/notifications/reminders', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Custom reminder created successfully', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#4CAF50',
                },
            });

            setShowReminderModal(false);
            resetReminderForm();
            fetchReminders(); // Refresh the list
        } catch (error) {
            console.error('Error creating reminder:', error);
            toast.error(error.response?.data?.message || 'Failed to create reminder', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#f44336',
                },
            });
        } finally {
            setReminderLoading(false);
        }
    };

    return (
        <>
            {/* Custom Reminders Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-300">
                    Custom Reminders
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Create custom notifications with scheduled delivery to specific users or system-wide.
                </p>
                
                <CustomButton
                    variant="blueToTeal"
                    onClick={() => {
                        setShowReminderModal(true);
                        fetchAllUsersForReminders();
                    }}
                    icon={FaBell}
                    title="Create custom reminder"
                >
                    Create Custom Reminder
                </CustomButton>

                {/* Reminders List */}
                <div className="mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-3">
                        <h4 className="text-md font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <FaCalendarCheck className="w-4 h-4" />
                            <span className="hidden sm:inline">Existing Reminders</span>
                            <span className="sm:hidden">Reminders</span>
                            {reminders.length > 0 && (
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
                                    {reminders.length}
                                </span>
                            )}
                        </h4>
                        
                        {reminders.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                <CustomCheckbox
                                    id="select-all-reminders"
                                    label={`Select All (${selectedReminders.length}/${reminders.length})`}
                                    checked={selectedReminders.length === reminders.length && reminders.length > 0}
                                    onChange={handleSelectAll}
                                />
                                {selectedReminders.length > 0 && (
                                    <CustomButton
                                        variant="red"
                                        size="xs"
                                        onClick={handleBulkDelete}
                                        icon={FaTrash}
                                        title={`Delete ${selectedReminders.length} selected reminder${selectedReminders.length !== 1 ? 's' : ''}`}
                                    >
                                        <span className="hidden sm:inline">Delete Selected ({selectedReminders.length})</span>
                                        <span className="sm:hidden">Delete ({selectedReminders.length})</span>
                                    </CustomButton>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {loadingReminders ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500 dark:text-gray-400">Loading reminders...</div>
                        </div>
                    ) : reminders.length === 0 ? (
                        <div className="text-center py-8">
                            <FaCalendarCheck className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No reminders created yet. Create your first reminder above!</p>
                        </div>
                    ) : (
                        <CustomScrollbar maxHeight="350px">
                            <div className="space-y-3">
                                {reminders.map((reminder) => {
                                    const { date, time } = formatDateWithTime(reminder.scheduledFor);
                                    return (
                                        <div key={reminder._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-3">
                                            <div className="flex items-start sm:items-center gap-3 flex-1">
                                                <CustomCheckbox
                                                    id={`reminder-${reminder._id}`}
                                                    checked={selectedReminders.includes(reminder._id)}
                                                    onChange={(checked) => handleSelectReminder(reminder._id, checked)}
                                                />
                                                <div className={`p-2 rounded-lg ${getStatusColor(reminder)} flex-shrink-0`}>
                                                    {getStatusIcon(reminder)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                            {reminder.title}
                                                        </span>
                                                        <span className={`text-xs font-medium ${getPriorityColor(reminder.priority)} flex-shrink-0`}>
                                                            {reminder.priority?.toUpperCase()}
                                                        </span>
                                                        {reminder.isSystemWide ? (
                                                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                                                                <FaUsers className="w-3 h-3" />
                                                                <span className="hidden sm:inline">All Users</span>
                                                                <span className="sm:hidden">All</span>
                                                            </span>
                                                        ) : (
                                                            <span 
                                                                className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors flex-shrink-0"
                                                                onMouseEnter={(e) => handleUsersBadgeHover(e, reminder)}
                                                                onMouseLeave={handleUsersBadgeLeave}
                                                            >
                                                                <FaUser className="w-3 h-3" />
                                                                {reminder.targetUsers?.length || 0} <span className="hidden sm:inline">User{(reminder.targetUsers?.length || 0) !== 1 ? 's' : ''}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                        <span className="block sm:hidden">
                                                            {reminder.message.length > 40 ? `${reminder.message.substring(0, 40)}...` : reminder.message}
                                                        </span>
                                                        <span className="hidden sm:block">
                                                            {reminder.message.length > 60 ? `${reminder.message.substring(0, 60)}...` : reminder.message}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {date} • {time}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 sm:ml-3 justify-end sm:justify-start">
                                                <CustomButton
                                                    variant="blue"
                                                    size="xs"
                                                    onClick={() => handleEditReminder(reminder)}
                                                    icon={FaEdit}
                                                    title="Edit reminder"
                                                />
                                                <CustomButton
                                                    variant="red"
                                                    size="xs"
                                                    onClick={() => handleDeleteReminder(reminder)}
                                                    icon={FaTrash}
                                                    title="Delete reminder"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CustomScrollbar>
                    )}
                </div>
            </div>

            {/* Custom Reminder Modal */}
            <CustomModal
                isOpen={showReminderModal}
                onClose={() => setShowReminderModal(false)}
                title="Create Custom Reminder"
                maxWidth="md:max-w-2xl"
            >
                    <form onSubmit={handleCreateReminder} className="space-y-4">
                        <div>
                            <Label htmlFor="reminder-title" value="Title *" />
                            <TextInput
                                id="reminder-title"
                                type="text"
                                value={reminderForm.title}
                                onChange={(e) => handleReminderFormChange('title', e.target.value)}
                                placeholder="Enter reminder title"
                                required
                            />
                        </div>

                        <div>
                            <TextInput
                                id="reminder-message"
                                label="Message *"
                                as="textarea"
                                value={reminderForm.message}
                                onChange={(e) => handleReminderFormChange('message', e.target.value)}
                                placeholder="Enter reminder message"
                                rows={4}
                                required
                            />
                        </div>

                        <div>
                            <CustomCheckbox
                                id="reminder-system-wide"
                                label="Send to all users (system-wide)"
                                checked={reminderForm.isSystemWide}
                                onChange={(checked) => handleReminderFormChange('isSystemWide', checked)}
                            />
                        </div>

                        {!reminderForm.isSystemWide && (
                            <div>
                                {allUsers.length === 0 ? (
                                    <div>
                                        <Label value="Target Users *" />
                                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-center">
                                            Loading users...
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onMouseEnter={handleDropdownHover}
                                        onMouseLeave={handleDropdownLeave}
                                    >
                                        <CheckBoxDropDown
                                            label="Target Users *"
                                            options={allUsers.map(user => ({
                                                value: user._id,
                                                label: `${user.username} ${user.isAdmin ? '(Admin)' : user.isAccountant ? '(Accountant)' : ''}`
                                            }))}
                                            value={reminderForm.targetUsers}
                                            onChange={handleReminderTargetUsersChange}
                                            placeholder="Select users to send reminder to..."
                                            allowMultiple={true}
                                            allOptionsLabel="All Users"
                                            id="reminder-target-users"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <CustomCheckbox
                                id="reminder-send-instantly"
                                label="Send notification instantly"
                                checked={reminderForm.sendInstantly}
                                onChange={(checked) => handleReminderFormChange('sendInstantly', checked)}
                            />
                        </div>

                        {!reminderForm.sendInstantly && (
                            <div className="grid grid-cols-2 gap-4">
                                <CustomDatePicker
                                    id="reminder-date"
                                    label="Scheduled Date *"
                                    value={reminderForm.scheduledDate}
                                    onChange={(date) => handleReminderFormChange('scheduledDate', date)}
                                    placeholder="Select date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                <TextInput
                                    type="time"
                                    label="Scheduled Time *"
                                    value={reminderForm.scheduledTime}
                                    onChange={(e) => handleReminderFormChange('scheduledTime', e.target.value)}
                                    step="60"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <CustomSelect
                                id="reminder-priority"
                                label="Priority"
                                value={reminderForm.priority}
                                onChange={(value) => handleReminderFormChange('priority', value)}
                                options={[
                                    { value: "low", label: "Low" },
                                    { value: "medium", label: "Medium" },
                                    { value: "high", label: "High" },
                                    { value: "urgent", label: "Urgent" }
                                ]}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <CustomButton
                                variant="gray"
                                onClick={() => {
                                    setShowReminderModal(false);
                                    resetReminderForm();
                                }}
                                disabled={reminderLoading}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                type="submit"
                                variant="blueToTeal"
                                disabled={reminderLoading}
                                icon={reminderLoading ? null : FaBell}
                            >
                                {reminderLoading ? 'Creating...' : 'Create Reminder'}
                            </CustomButton>
                        </div>
                    </form>
            </CustomModal>

            {/* Edit Reminder Modal */}
            <CustomModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingReminder(null);
                    resetReminderForm();
                }}
                title="Edit Custom Reminder"
                maxWidth="md:max-w-2xl"
            >
                <form onSubmit={handleUpdateReminder} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-reminder-title" value="Title *" />
                        <TextInput
                            id="edit-reminder-title"
                            type="text"
                            value={reminderForm.title}
                            onChange={(e) => handleReminderFormChange('title', e.target.value)}
                            placeholder="Enter reminder title"
                            required
                        />
                    </div>

                    <div>
                        <TextInput
                            id="edit-reminder-message"
                            label="Message *"
                            as="textarea"
                            value={reminderForm.message}
                            onChange={(e) => handleReminderFormChange('message', e.target.value)}
                            placeholder="Enter reminder message"
                            rows={4}
                            required
                        />
                    </div>

                    <div>
                        <CustomCheckbox
                            id="edit-reminder-system-wide"
                            label="Send to all users (system-wide)"
                            checked={reminderForm.isSystemWide}
                            onChange={(checked) => handleReminderFormChange('isSystemWide', checked)}
                        />
                    </div>

                    {!reminderForm.isSystemWide && (
                        <div>
                            {allUsers.length === 0 ? (
                                <div>
                                    <Label value="Target Users *" />
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-center">
                                        Loading users...
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onMouseEnter={handleDropdownHover}
                                    onMouseLeave={handleDropdownLeave}
                                >
                                    <CheckBoxDropDown
                                        label="Target Users *"
                                        options={allUsers.map(user => ({
                                            value: user._id,
                                            label: `${user.username} ${user.isAdmin ? '(Admin)' : user.isAccountant ? '(Accountant)' : ''}`
                                        }))}
                                        value={reminderForm.targetUsers}
                                        onChange={handleReminderTargetUsersChange}
                                        placeholder="Select users to send reminder to..."
                                        allowMultiple={true}
                                        allOptionsLabel="All Users"
                                        id="edit-reminder-target-users"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <CustomCheckbox
                            id="edit-reminder-send-instantly"
                            label="Send notification instantly"
                            checked={reminderForm.sendInstantly}
                            onChange={(checked) => handleReminderFormChange('sendInstantly', checked)}
                        />
                    </div>

                    {!reminderForm.sendInstantly && (
                        <div className="grid grid-cols-2 gap-4">
                            <CustomDatePicker
                                id="edit-reminder-date"
                                label="Scheduled Date *"
                                value={reminderForm.scheduledDate}
                                onChange={(date) => handleReminderFormChange('scheduledDate', date)}
                                placeholder="Select date"
                                required
                            />
                            <TextInput
                                type="time"
                                label="Scheduled Time *"
                                value={reminderForm.scheduledTime}
                                onChange={(e) => handleReminderFormChange('scheduledTime', e.target.value)}
                                step="60"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <CustomSelect
                            id="edit-reminder-priority"
                            label="Priority"
                            value={reminderForm.priority}
                            onChange={(value) => handleReminderFormChange('priority', value)}
                            options={[
                                { value: "low", label: "Low" },
                                { value: "medium", label: "Medium" },
                                { value: "high", label: "High" },
                                { value: "urgent", label: "Urgent" }
                            ]}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <CustomButton
                            variant="gray"
                            onClick={() => {
                                setShowEditModal(false);
                                setEditingReminder(null);
                                resetReminderForm();
                            }}
                            disabled={reminderLoading}
                        >
                            Cancel
                        </CustomButton>
                        <CustomButton
                            type="submit"
                            variant="blueToTeal"
                            disabled={reminderLoading}
                            icon={reminderLoading ? null : FaEdit}
                        >
                            {reminderLoading ? 'Updating...' : 'Update Reminder'}
                        </CustomButton>
                    </div>
                </form>
            </CustomModal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletingReminder(null);
                }}
                onConfirm={confirmDeleteReminder}
                isLoading={deletingLoading}
                itemType="reminder"
                itemName={deletingReminder?.title || ''}
                itemExtra={deletingReminder?.message ? `"${deletingReminder.message.substring(0, 50)}${deletingReminder.message.length > 50 ? '...' : ''}"` : ''}
            />

            {/* Bulk Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={showBulkDeleteModal}
                onClose={() => {
                    setShowBulkDeleteModal(false);
                }}
                onConfirm={confirmBulkDelete}
                isLoading={bulkDeletingLoading}
                itemType={`${selectedReminders.length} reminder${selectedReminders.length !== 1 ? 's' : ''}`}
                itemName="selected items"
                itemExtra="This action cannot be undone"
            />

            {/* Users Tooltip */}
            {(hoveredUsersBadge || hoveredDropdown) && (
                <div
                    className="fixed bg-white/95 dark:bg-slate-950/95 text-gray-900 dark:text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none border border-gray-200 dark:border-gray-700 backdrop-blur-md"
                    style={{
                        left: Math.min(Math.max(tooltipPosition.x, 5), window.innerWidth - 200),
                        top: tooltipPosition.y,
                        transform: 'translate(-50%, -100%)',
                        zIndex: 9999,
                        fontSize: '11px',
                        lineHeight: '1.4',
                        maxWidth: '200px'
                    }}
                >
                    <div className="font-medium text-xs mb-1">
                        {hoveredUsersBadge ? 'Target Users' : 'Selected Users'} ({(hoveredUsersBadge || hoveredDropdown).count})
                    </div>
                    <div className="space-y-0.5">
                        {(hoveredUsersBadge || hoveredDropdown).users.map((user, index) => (
                            <div key={user._id || index} className="text-xs opacity-90">
                                {user.username || user.email || 'Unknown User'}
                                {user.isAdmin && <span className="text-red-500 ml-1">(Admin)</span>}
                                {user.isAccountant && <span className="text-blue-500 ml-1">(Accountant)</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

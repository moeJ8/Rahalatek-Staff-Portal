import React, { Suspense } from 'react'
import axios from 'axios'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Checkbox, Card, Label, Table, Select, Accordion, Modal, Textarea } from 'flowbite-react'
import { HiPlus, HiX, HiTrash, HiRefresh } from 'react-icons/hi'
import { FaPlaneDeparture, FaMapMarkedAlt, FaBell, FaCalendarDay, FaBuilding, FaDollarSign, FaFileInvoiceDollar, FaUser, FaChartLine, FaEdit, FaCheck, FaTimes, FaCoins, FaCog, FaBox, FaArchive, FaEnvelope, FaPalette } from 'react-icons/fa'
import toast from 'react-hot-toast'
import UserBadge from '../UserBadge'
import CustomButton from '../CustomButton'
import RahalatekLoader from '../RahalatekLoader'
import SearchableSelect from '../SearchableSelect'
import Search from '../Search'
import CustomTable from '../CustomTable'
import CustomScrollbar from '../CustomScrollbar'
import CustomSelect from '../Select'
import CustomDatePicker from '../CustomDatePicker'
import CustomModal from '../CustomModal'
import TextInput from '../TextInput'
import CustomReminderManager from '../CustomReminderManager'
import FinancialFloatingTotalsPanel from '../FinancialFloatingTotalsPanel'
import { generateArrivalReminders, generateDepartureReminders, cleanupExpiredNotifications } from '../../utils/notificationApi'
import { getAllVouchers, updateVoucherStatus } from '../../utils/voucherApi'
import { getUserBonuses, saveMonthlyBonus, getUserSalary, updateUserSalary, getUserSalaryBaseEntries, editMonthBonus, saveMonthlyBaseSalary, editMonthSalary, deleteSalaryEntry, deleteBonusEntry } from '../../utils/profileApi'
import StatusControls from '../StatusControls'
import PaymentDateControls from '../PaymentDateControls'
import DeleteConfirmationModal from '../DeleteConfirmationModal'
// Lazy-loaded components for better bundle splitting
const AttendancePanel = React.lazy(() => import('./AttendancePanel'))
const EmailSchedulerPanel = React.lazy(() => import('./EmailSchedulerPanel'))
const Dashboard = React.lazy(() => import('./Dashboard'))
const Hotels = React.lazy(() => import('./Hotels'))
const Airports = React.lazy(() => import('./Airports'))
const Tours = React.lazy(() => import('./Tours'))
const Packages = React.lazy(() => import('./Packages'))
const Offices = React.lazy(() => import('./Offices'))
const Users = React.lazy(() => import('./Users'))
const UserRequests = React.lazy(() => import('./UserRequests'))
const UIManagement = React.lazy(() => import('./UIManagement'))
import { Link, useNavigate } from 'react-router-dom'

export default function AdminPanel() {
    const navigate = useNavigate();
    
    
    // Check user role
    const authUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = authUser.isAdmin || false;
    const isAccountant = authUser.isAccountant || false;
    const isContentManager = authUser.isContentManager || false;
    const isNotificationsOnlyRoute = window.location.pathname === '/notifications/manage';
    
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            // Check if accessed from the notifications/manage route
            if (window.location.pathname === '/notifications/manage') {
                return 'notifications';
            }
            
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            // Filter available tabs based on user role
            const availableTabs = isAdmin 
            ? ['dashboard', 'hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials', 'debts', 'salaries', 'attendance', 'users', 'requests', 'notifications', 'scheduler']
            : isContentManager
            ? ['hotels', 'tours', 'airports', 'offices'] // Content Managers can only access content management tabs
            : ['dashboard', 'hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials', 'debts', 'salaries', 'attendance', 'users', 'notifications']; // Accountants can access users tab but not requests, scheduler is admin-only
            if (availableTabs.includes(tabParam)) {
                return tabParam;
            }
        }
        return isContentManager ? 'hotels' : 'dashboard';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Listen for URL changes and update active tab accordingly
    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            const availableTabs = isAdmin 
                ? ['dashboard', 'hotels', 'tours', 'packages', 'airports', 'offices', 'office-vouchers', 'financials', 'debts', 'salaries', 'attendance', 'users', 'requests', 'notifications', 'scheduler']
                : isContentManager
                ? ['hotels', 'tours', 'packages', 'airports', 'offices'] // Content Managers can only access content management tabs
                : ['dashboard', 'hotels', 'tours', 'packages', 'airports', 'offices', 'office-vouchers', 'financials', 'debts', 'salaries', 'attendance', 'users', 'notifications'];
            
            if (availableTabs.includes(tabParam)) {
                setActiveTab(tabParam);
            } else {
                setActiveTab(isContentManager ? 'hotels' : 'dashboard');
            }
        };

        // Listen for popstate events (back/forward browser navigation)
        window.addEventListener('popstate', handlePopState);
        
        // Also listen for programmatic navigation by checking URL changes
        const checkUrlChange = () => {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab') || (isContentManager ? 'hotels' : 'dashboard');
            if (tabParam !== activeTab) {
                const availableTabs = isAdmin 
                    ? ['dashboard', 'hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials', 'debts', 'salaries', 'attendance', 'users', 'requests', 'notifications', 'scheduler', 'ui-management']
                    : isContentManager
                    ? ['hotels', 'tours', 'airports', 'offices', 'ui-management'] // Content Managers can only access content management tabs
                    : ['dashboard', 'hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials', 'debts', 'salaries', 'attendance', 'users', 'notifications'];
                
                if (availableTabs.includes(tabParam)) {
                    setActiveTab(tabParam);
                }
            }
        };

        // Check URL changes periodically (fallback for programmatic navigation)
        const interval = setInterval(checkUrlChange, 100);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            clearInterval(interval);
        };
    }, [activeTab, isAdmin, isContentManager]);

    const handleTabChange = (tabName) => {
        // Prevent unauthorized access to restricted tabs
        if (!isAdmin && tabName === 'requests') {
            console.warn('Access denied: Only administrators can access user requests tab');
            return;
        }
        if (isContentManager && !['hotels', 'tours', 'airports', 'offices', 'packages', 'ui-management'].includes(tabName)) {
            console.warn('Access denied: Content managers can only access content management tabs');
            return;
        }
        
        setActiveTab(tabName);
        
        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.pushState({}, '', url);
        
        // Fetch users data only when switching to users/salaries tab
        if ((tabName === 'users' || tabName === 'salaries') && dataLoaded) {
            fetchUsers();
        }
        
        // User requests are now handled by UserRequests component
        
        
        // Tours data is now handled by the Tours component
        
        // Fetch offices data when switching to offices tab and data not loaded yet
        if (tabName === 'offices' && offices.length === 0 && dataLoaded) {
            fetchOffices();
        }
        
        // Reset office vouchers when switching to office-vouchers tab
        if (tabName === 'office-vouchers') {
            setSelectedOfficeForVouchers('');
            setOfficeVouchers([]);
            // Fetch users for the dropdown if not already fetched
            if (allUsers.length === 0) {
                fetchAllUsersForVouchers();
            }
        }
        
        // Fetch financial data when switching to financials tab
        if (tabName === 'financials' && dataLoaded) {
            fetchFinancialData();
        }
        
        // Fetch debt data when switching to debts tab
        if (tabName === 'debts' && dataLoaded) {
            fetchDebts();
        }
    };

    const [offices, setOffices] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    
    // Add state for available hotels and duplicate modal
    const [hotels, setHotels] = useState([]);
    
    
    // Add state for notification management
    const [notificationLoading, setNotificationLoading] = useState(false);
    

    
    // Add state for office vouchers functionality
    const [selectedOfficeForVouchers, setSelectedOfficeForVouchers] = useState('');
    const [officeVouchers, setOfficeVouchers] = useState([]);
    const [officeVouchersLoading, setOfficeVouchersLoading] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    
    // Add state for financials functionality
    const [financialData, setFinancialData] = useState([]);
    const [financialLoading, setFinancialLoading] = useState(false);
    const [allVouchers, setAllVouchers] = useState([]);
    const [officePayments, setOfficePayments] = useState({}); // Store payments by office name
    const [financialFilters, setFinancialFilters] = useState({
        month: (new Date().getMonth() + 1).toString(), // Current month (1-12)
        year: new Date().getFullYear().toString(),
        currency: 'USD', // Default to USD
        viewType: 'providers' // 'providers' or 'clients'
    });
    
    // Add state for financial search
    const [financialSearchQuery, setFinancialSearchQuery] = useState('');
    const [clientTypeFilter, setClientTypeFilter] = useState('all');
    
    // Add state for PDF download
    const [pdfDownloading, setPdfDownloading] = useState(false);
    
    // Add state for auto-refresh indicator
    
    const [, setLastRefreshTime] = useState(null);
    
    // Add state for debt management
    const [debts, setDebts] = useState([]);
    const [debtLoading, setDebtLoading] = useState(false);
    const [debtFilters, setDebtFilters] = useState({
        office: '',
        status: '',
        type: ''
    });
    const [showDebtModal, setShowDebtModal] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const [debtForm, setDebtForm] = useState({
        officeName: '',
        amount: '',
        currency: 'USD',
        type: 'OWED_TO_OFFICE',
        description: '',
        dueDate: '',
        notes: ''
    });

    // Add state for debt deletion modal
    const [deleteDebtModalOpen, setDeleteDebtModalOpen] = useState(false);
    const [debtToDelete, setDebtToDelete] = useState(null);
    const [deleteDebtLoading, setDeleteDebtLoading] = useState(false);
    
    
    // Calculate totals by currency
    const totalsByCurrency = useMemo(() => {
        if (officeVouchers.length === 0) return {};
        
        return officeVouchers.reduce((acc, voucher) => {
            const currency = voucher.currency || 'USD';
            const total = parseFloat(voucher.totalAmount) || 0;
            const advanced = parseFloat(voucher.advancedPayment) || 0;

            if (!acc[currency]) {
                acc[currency] = { totalAmount: 0, totalAdvanced: 0 };
            }

            acc[currency].totalAmount += total;
            acc[currency].totalAdvanced += advanced;

            return acc;
        }, {});
    }, [officeVouchers]);


    // Salaries/Bonuses tab state
    const [selectedUserForSalary, setSelectedUserForSalary] = useState('');
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [bonusForm, setBonusForm] = useState({ amount: '', currency: 'USD', note: '' });
    const [bonuses, setBonuses] = useState([]);
    const [salaryBaseEntries, setSalaryBaseEntries] = useState([]);
    const [salaryTabLoading, setSalaryTabLoading] = useState(false);
    const [salaryForm, setSalaryForm] = useState({ salaryAmount: '', salaryCurrency: 'USD', salaryDayOfMonth: '', salaryNotes: '' });
    const [updateFromNextCycleAdmin, setUpdateFromNextCycleAdmin] = useState(false);
    
    // Inline editing state for salary table
    const [editingAmount, setEditingAmount] = useState(null); // Store entry id being edited
    const [editAmount, setEditAmount] = useState(''); // Store the edited amount value
    const [saveAmountLoading, setSaveAmountLoading] = useState(false);
    
    // Inline editing state for bonus table
    const [editingBonusAmount, setEditingBonusAmount] = useState(null); // Store bonus id being edited
    const [editBonusAmount, setEditBonusAmount] = useState(''); // Store the edited bonus amount value
    const [saveBonusAmountLoading, setSaveBonusAmountLoading] = useState(false);
    
    // Delete salary entry state
    const [salaryDeleteConfirmation, setSalaryDeleteConfirmation] = useState({ 
        show: false, 
        entry: null, 
        entryDescription: '' 
    });
    
    // Delete bonus entry state
    const [bonusDeleteConfirmation, setBonusDeleteConfirmation] = useState({ 
        show: false, 
        entry: null, 
        entryDescription: '' 
    });
    
    // Inner tabs for salaries section
    const [salaryInnerTab, setSalaryInnerTab] = useState('salaries'); // 'salaries' for cards view, 'salary'/'bonus' for settings functionality
    
    // Inner tabs for debt management section
    const [debtInnerTab, setDebtInnerTab] = useState('active'); // 'active' for open debts, 'archived' for closed debts
    
    // Month editor state
    const [selectedMonthToEdit, setSelectedMonthToEdit] = useState('');
    const [selectedBonusMonthToEdit, setSelectedBonusMonthToEdit] = useState('');
    
    // Cards view state
    const [salaryCardsYear, setSalaryCardsYear] = useState(new Date().getFullYear());
    const [salaryCardsMonth, setSalaryCardsMonth] = useState(new Date().getMonth().toString()); // Current month (0-11)
    const [allUsersSalaryData, setAllUsersSalaryData] = useState([]);
    const [salaryCardsLoading, setSalaryCardsLoading] = useState(false);
    const [availableSalaryYears, setAvailableSalaryYears] = useState([]);
    const [availableSalaryMonths, setAvailableSalaryMonths] = useState([]);

    // Generate month options - always show months up to current month, plus any existing salary entries
    const getMonthOptions = () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        
        // Create a set to store unique months
        const monthsSet = new Set();
        
        // Always add all months from current year up to current month
        for (let month = 0; month <= currentMonth; month++) {
            monthsSet.add(`${currentYear}-${month}`);
        }
        
        // Add any existing salary entry months (from current or previous years)
        if (salaryBaseEntries && salaryBaseEntries.length > 0) {
            salaryBaseEntries.forEach(entry => {
                // Only show entries for current month or earlier
                if (entry.year < currentYear || (entry.year === currentYear && entry.month <= currentMonth)) {
                    monthsSet.add(`${entry.year}-${entry.month}`);
                }
            });
        }
        
        // Convert set to array and sort (newest first)
        return Array.from(monthsSet)
            .map(monthKey => {
                const [year, month] = monthKey.split('-').map(Number);
                return {
                    value: monthKey,
                    label: new Date(year, month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' }),
                    year,
                    month
                };
            })
            .sort((a, b) => (b.year - a.year) || (b.month - a.month));
    };

    // Check if selected month is the current month
    const isCurrentMonth = (monthKey) => {
        if (!monthKey) return true; // No month selected = editing current
        const [year, month] = monthKey.split('-').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        return year === currentYear && month === currentMonth;
    };

    // Handle month selection for editing
    const handleMonthSelection = (monthKey) => {
        setSelectedMonthToEdit(monthKey);
        
        // Reset next cycle checkbox when selecting a non-current month
        if (!isCurrentMonth(monthKey)) {
            setUpdateFromNextCycleAdmin(false);
        }
        
        if (monthKey) {
            const [year, month] = monthKey.split('-').map(Number);
            const entry = salaryBaseEntries.find(e => e.year === year && e.month === month);
            if (entry) {
                // When selecting a month to edit, only update the notes
                // Amount should always start empty, not pre-filled
                setSalaryForm(prevForm => ({
                    ...prevForm,
                    salaryNotes: entry.note || ''
                }));
            }
        } else {
            // Reset to current user salary data when no month selected
            if (selectedUserForSalary) {
                handleLoadUserSalary(selectedUserForSalary);
            }
        }
    };

    // Handle bonus month selection for editing
    const handleBonusMonthSelection = (monthKey) => {
        setSelectedBonusMonthToEdit(monthKey);
        if (monthKey) {
            const [year, month] = monthKey.split('-').map(Number);
            const bonus = bonuses.find(b => b.year === year && b.month === month);
            
            // Find the salary entry for this month to get the correct currency
            const salaryEntry = (salaryBaseEntries || []).find(entry => 
                entry.year === year && entry.month === month
            );
            const correctCurrency = salaryEntry ? salaryEntry.currency : (selectedUserData?.salaryCurrency || 'USD');
            
            if (bonus) {
                // Populate bonus form with existing bonus data
                setBonusForm({
                    amount: bonus.amount.toString(),
                    currency: bonus.currency,
                    note: bonus.note || ''
                });
            } else {
                // No bonus exists for this salary month - use the salary entry's currency
                setBonusForm({ amount: '', currency: correctCurrency, note: '' });
            }
        } else {
            // Reset to empty bonus form when no month selected
            setBonusForm({ amount: '', currency: selectedUserData?.salaryCurrency || 'USD', note: '' });
        }
    };

    // Update bonus form currency when salary data changes and a month is selected
    useEffect(() => {
        if (selectedBonusMonthToEdit && salaryBaseEntries) {
            const [year, month] = selectedBonusMonthToEdit.split('-').map(Number);
            const bonus = bonuses.find(b => b.year === year && b.month === month);
            
            // Find the salary entry for this month to get the correct currency
            const salaryEntry = salaryBaseEntries.find(entry => 
                entry.year === year && entry.month === month
            );
            const correctCurrency = salaryEntry ? salaryEntry.currency : (selectedUserData?.salaryCurrency || 'USD');
            
            // Only update if we don't already have a bonus (existing bonuses keep their currency)
            if (!bonus) {
                setBonusForm(prev => ({ ...prev, currency: correctCurrency }));
            }
        }
    }, [salaryBaseEntries, selectedBonusMonthToEdit, bonuses, selectedUserData?.salaryCurrency]);

    const handleLoadUserBonuses = async (userId) => {
        try {
            setSalaryTabLoading(true);
            const res = await getUserBonuses(userId);
            const bonusEntries = res.bonuses || [];
            setBonuses(bonusEntries);
            
            // Auto-select current month if it exists
            if (bonusEntries.length > 0) {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth();
                
                const currentMonthBonus = bonusEntries.find(b => b.year === currentYear && b.month === currentMonth);
                if (currentMonthBonus) {
                    const monthKey = `${currentYear}-${currentMonth}`;
                    handleBonusMonthSelection(monthKey);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load bonuses', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSalaryTabLoading(false);
        }
    };

    const handleLoadUserSalaryBaseEntries = async (userId, autoSelectCurrentMonth = false) => {
        try {
            setSalaryTabLoading(true);
            const res = await getUserSalaryBaseEntries(userId);
            const entries = res.salaryBaseEntries || [];
            setSalaryBaseEntries(entries);
            
            // Auto-select current month only if explicitly requested (initial load)
            if (autoSelectCurrentMonth && entries.length > 0) {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth();
                
                const currentMonthEntry = entries.find(e => e.year === currentYear && e.month === currentMonth);
                if (currentMonthEntry) {
                    const monthKey = `${currentYear}-${currentMonth}`;
                    setSelectedMonthToEdit(monthKey);
                    // Populate form with current month's salary data
                    setSalaryForm(prevForm => ({
                        salaryAmount: currentMonthEntry.amount.toString(),
                        salaryCurrency: currentMonthEntry.currency,
                        salaryDayOfMonth: prevForm.salaryDayOfMonth, // Keep current day setting
                        salaryNotes: currentMonthEntry.note || ''
                    }));
                }
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load salary history', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSalaryTabLoading(false);
        }
    };

    const handleLoadUserSalary = async (userId) => {
        try {
            setSalaryTabLoading(true);
            const res = await getUserSalary(userId);
            setSalaryForm({
                salaryAmount: '', // Start with empty amount field
                salaryCurrency: res.salaryCurrency || 'USD',
                salaryDayOfMonth: res.salaryDayOfMonth ?? '',
                salaryNotes: res.salaryNotes || ''
            });
            
            // Load complete user data for raise detection
            try {
                const userResponse = await axios.get(`/api/profile/${userId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSelectedUserData(userResponse.data);
            } catch (err) {
                console.error('Failed to load user data:', err);
                setSelectedUserData(null);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load salary', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSalaryTabLoading(false);
        }
    };

    // Inline editing helper functions for salary table
    const handleEditAmount = (entry) => {
        setEditingAmount(`${entry.year}-${entry.month}`);
        setEditAmount(entry.amount.toString());
    };

    const handleCancelEdit = () => {
        setEditingAmount(null);
        setEditAmount('');
    };

    const handleSaveAmount = async (entry) => {
        if (!selectedUserForSalary || saveAmountLoading) return;
        
        const newAmount = parseFloat(editAmount);
        if (isNaN(newAmount) || newAmount < 0) {
            toast.error('Please enter a valid amount', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            return;
        }

        if (newAmount === entry.amount) {
            handleCancelEdit();
            return;
        }

        try {
            setSaveAmountLoading(true);
            
            try {
                // First try to edit existing entry (preserves currency)
                await editMonthSalary(selectedUserForSalary, {
                    year: entry.year,
                    month: entry.month,
                    amount: newAmount,
                    currency: entry.currency,
                    note: entry.note
                });
            } catch (editError) {
                // If edit fails, fall back to create (though this shouldn't happen for inline editing)
                if (editError.response?.status === 404) {
                    await saveMonthlyBaseSalary(selectedUserForSalary, {
                        year: entry.year,
                        month: entry.month,
                        amount: newAmount,
                        note: entry.note,
                        currency: entry.currency
                    });
                } else {
                    throw editError;
                }
            }

            // Refresh the salary entries
            await handleLoadUserSalaryBaseEntries(selectedUserForSalary, false);
            
            // Update selected user data if needed
            const userResponse = await axios.get(`/api/profile/${selectedUserForSalary}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSelectedUserData(userResponse.data);

            toast.success('Salary amount updated', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: '500'
                }
            });

            handleCancelEdit();
        } catch (error) {
            console.error('Error updating salary amount:', error);
            toast.error('Failed to update salary amount', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSaveAmountLoading(false);
        }
    };

    // Bonus amount editing helper functions
    const handleEditBonusAmount = (bonus) => {
        setEditingBonusAmount(`${bonus.year}-${bonus.month}`);
        setEditBonusAmount(bonus.amount.toString());
    };

    const handleCancelBonusEdit = () => {
        setEditingBonusAmount(null);
        setEditBonusAmount('');
    };

    // Handle salary entry deletion
    const handleDeleteSalaryEntry = async () => {
        if (!salaryDeleteConfirmation.entry || !selectedUserForSalary) return;
        
        try {
            setSalaryTabLoading(true);
            
            await deleteSalaryEntry(selectedUserForSalary, {
                year: salaryDeleteConfirmation.entry.year,
                month: salaryDeleteConfirmation.entry.month
            });
            
            // Refresh salary entries
            await handleLoadUserSalaryBaseEntries(selectedUserForSalary, false);
            
            toast.success('Salary entry deleted successfully', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            
            // Close confirmation modal
            setSalaryDeleteConfirmation({ show: false, entry: null, entryDescription: '' });
            
        } catch (error) {
            console.error('Error deleting salary entry:', error);
            toast.error('Failed to delete salary entry', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSalaryTabLoading(false);
        }
    };

    // Open delete confirmation modal
    const openSalaryDeleteConfirmation = (entry) => {
        const monthName = new Date(entry.year, entry.month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
        setSalaryDeleteConfirmation({
            show: true,
            entry: entry,
            entryDescription: `${monthName} salary entry (${entry.amount} ${entry.currency})`
        });
    };

    // Handle bonus entry deletion
    const handleDeleteBonusEntry = async () => {
        if (!bonusDeleteConfirmation.entry || !selectedUserForSalary) return;
        
        try {
            setSalaryTabLoading(true);
            
            await deleteBonusEntry(selectedUserForSalary, {
                year: bonusDeleteConfirmation.entry.year,
                month: bonusDeleteConfirmation.entry.month
            });
            
            // Refresh bonus entries
            await handleLoadUserBonuses(selectedUserForSalary);
            
            toast.success('Bonus entry deleted successfully', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            
            // Close confirmation modal
            setBonusDeleteConfirmation({ show: false, entry: null, entryDescription: '' });
            
        } catch (error) {
            console.error('Error deleting bonus entry:', error);
            toast.error('Failed to delete bonus entry', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSalaryTabLoading(false);
        }
    };

    // Open bonus delete confirmation modal
    const openBonusDeleteConfirmation = (entry) => {
        const monthName = new Date(entry.year, entry.month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
        setBonusDeleteConfirmation({
            show: true,
            entry: entry,
            entryDescription: `${monthName} bonus entry (${entry.amount} ${entry.currency})`
        });
    };

    // Load available years and months from all users' salary data
    const loadAvailableSalaryOptions = useCallback(async () => {
        try {
            const yearsSet = new Set();
            const monthsSet = new Set();
            
            // Filter users based on role permissions
            const filteredUsers = isAccountant && !isAdmin ? users.filter(u => !u.isAdmin) : users;
            
            // Make all API calls in parallel instead of sequential
            const userPromises = filteredUsers.map(async (user) => {
                try {
                    // Get user's salary base entries and bonuses in parallel
                    const [baseEntriesRes, bonusesRes] = await Promise.all([
                        getUserSalaryBaseEntries(user._id),
                        getUserBonuses(user._id)
                    ]);
                    const baseEntries = baseEntriesRes.salaryBaseEntries || [];
                    const bonuses = bonusesRes.bonuses || [];
                    
                    return { baseEntries, bonuses };
                } catch (userError) {
                    console.error(`Error loading data for user ${user.username}:`, userError);
                    return { baseEntries: [], bonuses: [] };
                }
            });
            
            // Wait for all user data to load in parallel
            const allUserData = await Promise.all(userPromises);
            
            // Process all the data to collect years and months
            allUserData.forEach(({ baseEntries, bonuses }) => {
                // Collect years and months from base entries
                baseEntries.forEach(entry => {
                    yearsSet.add(entry.year);
                    monthsSet.add(entry.month);
                });
                
                // Collect years and months from bonuses
                bonuses.forEach(bonus => {
                    yearsSet.add(bonus.year);
                    monthsSet.add(bonus.month);
                });
            });
            
            // Convert sets to sorted arrays
            const sortedYears = Array.from(yearsSet).sort((a, b) => b - a); // Newest first
            const sortedMonths = Array.from(monthsSet).sort((a, b) => a - b); // January to December
            
            setAvailableSalaryYears(sortedYears);
            setAvailableSalaryMonths(sortedMonths);
            
        } catch (error) {
            console.error('Error loading available salary options:', error);
        }
    }, [users, isAccountant, isAdmin]);

    // Load all users salary data for cards view
    const loadAllUsersSalaryData = useCallback(async () => {
        try {
            setSalaryCardsLoading(true);
            
            // Filter users based on role permissions
            const filteredUsers = isAccountant && !isAdmin ? users.filter(u => !u.isAdmin) : users;
            
            // Make all API calls in parallel for all users
            const userPromises = filteredUsers.map(async (user) => {
                try {
                    // Get all user data in parallel
                    const [salaryRes, baseEntriesRes, bonusesRes] = await Promise.all([
                        getUserSalary(user._id),
                        getUserSalaryBaseEntries(user._id),
                        getUserBonuses(user._id)
                    ]);
                    
                    const baseEntries = baseEntriesRes.salaryBaseEntries || [];
                    const bonuses = bonusesRes.bonuses || [];
                    
                    // Calculate current salary for the selected month
                    let currentSalary = salaryRes.salaryAmount || 0;
                    let currentCurrency = salaryRes.salaryCurrency || 'USD';
                    
                    if (salaryCardsMonth !== 'all') {
                        // Find specific month's salary
                        const monthEntry = baseEntries.find(entry => 
                            entry.year === salaryCardsYear && entry.month === parseInt(salaryCardsMonth)
                        );
                        if (monthEntry) {
                            currentSalary = monthEntry.amount;
                            currentCurrency = monthEntry.currency;
                        }
                    }
                    
                    // Filter bonuses for the selected year and month
                    const filteredBonuses = bonuses.filter(bonus => {
                        if (bonus.year !== salaryCardsYear) return false;
                        if (salaryCardsMonth !== 'all' && bonus.month !== parseInt(salaryCardsMonth)) return false;
                        return true;
                    });
                    
                    // Calculate total bonus for the period
                    const totalBonus = filteredBonuses.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);
                    
                    return {
                        userId: user._id,
                        username: user.username,
                        isAdmin: user.isAdmin || false,
                        isAccountant: user.isAccountant || false,
                        isContentManager: user.isContentManager || false,
                        salary: currentSalary,
                        currency: currentCurrency,
                        totalBonus: totalBonus,
                        bonuses: filteredBonuses,
                        salaryDay: salaryRes.salaryDayOfMonth,
                        salaryNotes: salaryRes.salaryNotes
                    };
                } catch (userError) {
                    console.error(`Error loading data for user ${user.username}:`, userError);
                    // Return user with default/empty data
                    return {
                        userId: user._id,
                        username: user.username,
                        isAdmin: user.isAdmin || false,
                        isAccountant: user.isAccountant || false,
                        isContentManager: user.isContentManager || false,
                        salary: 0,
                        currency: 'USD',
                        totalBonus: 0,
                        bonuses: [],
                        salaryDay: null,
                        salaryNotes: ''
                    };
                }
            });
            
            // Wait for all user data to load in parallel
            const allUsersData = await Promise.all(userPromises);
            
            setAllUsersSalaryData(allUsersData);
        } catch (error) {
            console.error('Error loading all users salary data:', error);
            toast.error('Failed to load salary data', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSalaryCardsLoading(false);
        }
    }, [users, isAccountant, isAdmin, salaryCardsYear, salaryCardsMonth]);

    const handleSaveBonusAmount = async (bonus) => {
        if (!selectedUserForSalary || saveBonusAmountLoading) return;
        
        const newAmount = parseFloat(editBonusAmount);
        if (isNaN(newAmount) || newAmount < 0) {
            toast.error('Please enter a valid amount', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            return;
        }

        if (newAmount === bonus.amount) {
            handleCancelBonusEdit();
            return;
        }

        try {
            setSaveBonusAmountLoading(true);
            
            // Use the existing editMonthBonus function
            await editMonthBonus(selectedUserForSalary, {
                year: bonus.year,
                month: bonus.month,
                amount: newAmount,
                note: bonus.note
            });

            // Refresh the bonus entries
            await handleLoadUserBonuses(selectedUserForSalary);

            toast.success('Bonus amount updated', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: '500'
                }
            });

            handleCancelBonusEdit();
        } catch (error) {
            console.error('Error updating bonus amount:', error);
            toast.error('Failed to update bonus amount', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSaveBonusAmountLoading(false);
        }
    };

    const computePreviousCycle = () => {
        // Determine previous month for user's salary cycle
        const now = new Date();
        // Previous month relative to now
        const prevMonthIndex = (now.getMonth() + 11) % 12;
        const year = now.getFullYear() - (now.getMonth() === 0 ? 1 : 0);
        return { year, month: prevMonthIndex };
    };

    const getNextSalaryDateAdmin = (dayOfMonth) => {
        const day = parseInt(dayOfMonth, 10);
        if (!day || day < 1 || day > 31) return '';
        const now = new Date();
        const nextMonthIndex = now.getMonth() + 1;
        const year = now.getFullYear() + Math.floor(nextMonthIndex / 12);
        const month = nextMonthIndex % 12;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const clampedDay = Math.min(day, daysInMonth);
        const nextDate = new Date(year, month, clampedDay);
        return nextDate.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    };

    const getScheduledRaiseInfoAdmin = () => {
        if (!selectedUserData?.salaryBaseEntries || selectedUserData.salaryBaseEntries.length === 0) return null;
        
        const now = new Date();
        const nextMonth = now.getMonth() + 1;
        const nextYear = now.getFullYear() + Math.floor(nextMonth / 12);
        const nextMonthIndex = nextMonth % 12;
        
        // Current month's salary
        const currentMonthEntry = selectedUserData.salaryBaseEntries.find(e => 
            e.year === now.getFullYear() && e.month === now.getMonth()
        );
        const currentSalary = currentMonthEntry?.amount ?? selectedUserData.salaryAmount ?? 0;
        
        // Next month's salary
        const nextMonthEntry = selectedUserData.salaryBaseEntries.find(e => 
            e.year === nextYear && e.month === nextMonthIndex
        );
        
        if (!nextMonthEntry) return null;
        
        const nextSalary = nextMonthEntry.amount;
        const salaryDifference = nextSalary - currentSalary;
        
        // Show if there's any change (raise or decrease)
        if (salaryDifference !== 0) {
            const nextSalaryDate = selectedUserData.salaryDayOfMonth ? getNextSalaryDateAdmin(selectedUserData.salaryDayOfMonth) : null;
            return {
                amount: salaryDifference,
                currency: nextMonthEntry.currency || selectedUserData.salaryCurrency || 'USD',
                newTotal: nextSalary,
                date: nextSalaryDate,
                username: selectedUserData.username,
                note: nextMonthEntry.note || '',
                isIncrease: salaryDifference > 0
            };
        }
        
        return null;
    };

    const handleGrantBonus = async () => {
        if (!selectedUserForSalary) return;
        const selected = users.find(u => u._id === selectedUserForSalary);
        if (!selected) return;
        const amountNum = parseFloat(bonusForm.amount);
        if (isNaN(amountNum) || amountNum < 0) {
            toast.error('Enter a valid bonus amount', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            return;
        }
        
        try {
            setSalaryTabLoading(true);
            
            // If editing a specific month, check if bonus exists
            if (selectedBonusMonthToEdit) {
                const [year, month] = selectedBonusMonthToEdit.split('-').map(Number);
                const existingBonus = bonuses.find(b => b.year === year && b.month === month);
                
                if (existingBonus) {
                    // Edit existing bonus
                    await editMonthBonus(selected._id, {
                        year,
                        month,
                        amount: amountNum,
                        note: bonusForm.note || ''
                    });
                } else {
                    // Create new bonus for this salary month
                    await saveMonthlyBonus(selected._id, { year, month, amount: amountNum, note: bonusForm.note });
                }
            } else {
                // Normal bonus save for previous cycle
                const { year, month } = computePreviousCycle();
                await saveMonthlyBonus(selected._id, { year, month, amount: amountNum, note: bonusForm.note });
            }
            
            toast.success('Bonus saved', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            await handleLoadUserBonuses(selected._id);
        } catch (e) {
            console.error(e);
            toast.error('Failed to save bonus', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSalaryTabLoading(false);
        }
    };

    // Fetch users data function - defined early to be used in useEffects
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // setError('You must be logged in to view users');
                setLoading(false);
                return;
            }
            
            const response = await axios.get('/api/auth/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const approvedUsers = response.data.filter(user => user.isApproved);
            // Ensure current user is included (backend may exclude requester)
            const currentUserId = authUser.id || authUser._id;
            if (currentUserId && !approvedUsers.some(u => u._id === currentUserId)) {
                approvedUsers.unshift({
                    _id: currentUserId,
                    username: authUser.username || 'Me',
                    isAdmin: !!authUser.isAdmin,
                    isAccountant: !!authUser.isAccountant,
                    isApproved: true
                });
            }
            // If current user's record lacks salary fields, hydrate them from /me/salary
            if (currentUserId) {
                const meIndex = approvedUsers.findIndex(u => u._id === currentUserId);
                if (meIndex !== -1 && typeof approvedUsers[meIndex].salaryAmount === 'undefined') {
                    try {
                        const meSalaryRes = await axios.get('/api/profile/me/salary', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        approvedUsers[meIndex] = {
                            ...approvedUsers[meIndex],
                            salaryAmount: meSalaryRes.data?.salaryAmount ?? null,
                            salaryCurrency: meSalaryRes.data?.salaryCurrency ?? 'USD'
                        };
                    } catch {
                        // ignore, leave as-is
                    }
                }
            }
            setUsers(approvedUsers);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            // setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [authUser.id, authUser._id, authUser.username, authUser.isAdmin, authUser.isAccountant]);

    // Fetch debts data function - defined early to be used in useEffects
    const fetchDebts = useCallback(async () => {
        setDebtLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (debtFilters.office) params.append('office', debtFilters.office);
            if (debtFilters.status) params.append('status', debtFilters.status);
            if (debtFilters.type) params.append('type', debtFilters.type);
            
            const response = await axios.get(`/api/debts?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setDebts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch debts:', err);
            // setError(err.response?.data?.message || 'Failed to fetch debts');
        } finally {
            setDebtLoading(false);
        }
    }, [debtFilters.office, debtFilters.status, debtFilters.type]);

    // Fetch office payments function - defined early to be used in useEffects
    const fetchOfficePayments = useCallback(async (uniqueOffices) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return {};

            const paymentsPromises = uniqueOffices.map(async (officeName) => {
                try {
                    const params = {};
                    if (financialFilters.currency && financialFilters.currency !== 'ALL') {
                        params.currency = financialFilters.currency;
                    }

                    const response = await axios.get(`/api/office-payments/${encodeURIComponent(officeName)}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: params
                    });
                    return { officeName, payments: response.data || [] };
                } catch (err) {
                    if (err.response?.status !== 404) {
                        console.error(`Failed to fetch payments for ${officeName}:`, err);
                    }
                    return { officeName, payments: [] };
                }
            });

            const results = await Promise.all(paymentsPromises);
            const paymentsMap = {};
            results.forEach(({ officeName, payments }) => {
                paymentsMap[officeName] = payments;
            });
            
            return paymentsMap;
        } catch (error) {
            console.error('Error fetching office payments:', error);
            return {};
        }
    }, [financialFilters.currency]);

    // Fetch financial data function - defined early to be used in useEffects
    const fetchFinancialData = useCallback(async () => {
        setFinancialLoading(true);
        try {
            const response = await getAllVouchers();
            const vouchers = response.data;
            
            // Store all vouchers for client office calculations
            setAllVouchers(vouchers);
            
            // Filter vouchers by selected currency first
            const filteredVouchers = vouchers.filter(voucher => {
                const voucherCurrency = voucher.currency || 'USD';
                return voucherCurrency === financialFilters.currency;
            });
            
            // Aggregate payment data by office and month for selected currency
            const aggregatedData = {};
            const voucherTracker = {}; // Track vouchers per office-month to avoid double counting
            
            filteredVouchers.forEach(voucher => {
                const voucherDate = new Date(voucher.createdAt);
                const monthYear = `${voucherDate.getFullYear()}-${String(voucherDate.getMonth() + 1).padStart(2, '0')}`;

                // Process each payment type from the old payments structure
                if (voucher.payments) {
                    Object.keys(voucher.payments).forEach(paymentType => {
                        const payment = voucher.payments[paymentType];
                        if (payment.officeName && payment.price > 0) {
                            const key = `${payment.officeName}-${monthYear}`;

                            if (!aggregatedData[key]) {
                                aggregatedData[key] = {
                                    officeName: payment.officeName,
                                    month: monthYear,
                                    year: voucherDate.getFullYear(),
                                    monthName: voucherDate.toLocaleString('default', { month: 'long' }),
                                    hotels: 0,
                                    transfers: 0,
                                    trips: 0,
                                    flights: 0,
                                    total: 0,
                                    currency: voucher.currency || 'USD',
                                    voucherCount: 0,
                                    voucherIds: new Set()
                                };
                                voucherTracker[key] = new Set();
                            }

                            aggregatedData[key][paymentType] += payment.price;
                            aggregatedData[key].total += payment.price;

                            // Track unique vouchers
                            if (!voucherTracker[key].has(voucher._id)) {
                                voucherTracker[key].add(voucher._id);
                                aggregatedData[key].voucherCount++;
                            }
                        }
                    });
                }

                // Process hotels array for office payments
                if (voucher.hotels && Array.isArray(voucher.hotels)) {
                    voucher.hotels.forEach(hotel => {
                        if (hotel.officeName && hotel.price > 0) {
                            const key = `${hotel.officeName}-${monthYear}`;

                            if (!aggregatedData[key]) {
                                aggregatedData[key] = {
                                    officeName: hotel.officeName,
                                    month: monthYear,
                                    year: voucherDate.getFullYear(),
                                    monthName: voucherDate.toLocaleString('default', { month: 'long' }),
                                    hotels: 0,
                                    transfers: 0,
                                    trips: 0,
                                    flights: 0,
                                    total: 0,
                                    currency: voucher.currency || 'USD',
                                    voucherCount: 0,
                                    voucherIds: new Set()
                                };
                                voucherTracker[key] = new Set();
                            }

                            aggregatedData[key].hotels += hotel.price;
                            aggregatedData[key].total += hotel.price;

                            // Track unique vouchers
                            if (!voucherTracker[key].has(voucher._id)) {
                                voucherTracker[key].add(voucher._id);
                                aggregatedData[key].voucherCount++;
                            }
                        }
                    });
                }

                // Process transfers array for office payments
                if (voucher.transfers && Array.isArray(voucher.transfers)) {
                    voucher.transfers.forEach(transfer => {
                        if (transfer.officeName && transfer.price > 0) {
                            const key = `${transfer.officeName}-${monthYear}`;

                            if (!aggregatedData[key]) {
                                aggregatedData[key] = {
                                    officeName: transfer.officeName,
                                    month: monthYear,
                                    year: voucherDate.getFullYear(),
                                    monthName: voucherDate.toLocaleString('default', { month: 'long' }),
                                    hotels: 0,
                                    transfers: 0,
                                    trips: 0,
                                    flights: 0,
                                    total: 0,
                                    currency: voucher.currency || 'USD',
                                    voucherCount: 0,
                                    voucherIds: new Set()
                                };
                                voucherTracker[key] = new Set();
                            }

                            aggregatedData[key].transfers += transfer.price;
                            aggregatedData[key].total += transfer.price;

                            // Track unique vouchers
                            if (!voucherTracker[key].has(voucher._id)) {
                                voucherTracker[key].add(voucher._id);
                                aggregatedData[key].voucherCount++;
                            }
                        }
                    });
                }

                // Process trips array for office payments
                if (voucher.trips && Array.isArray(voucher.trips)) {
                    voucher.trips.forEach(trip => {
                        if (trip.officeName && trip.price > 0) {
                            const key = `${trip.officeName}-${monthYear}`;

                            if (!aggregatedData[key]) {
                                aggregatedData[key] = {
                                    officeName: trip.officeName,
                                    month: monthYear,
                                    year: voucherDate.getFullYear(),
                                    monthName: voucherDate.toLocaleString('default', { month: 'long' }),
                                    hotels: 0,
                                    transfers: 0,
                                    trips: 0,
                                    flights: 0,
                                    total: 0,
                                    currency: voucher.currency || 'USD',
                                    voucherCount: 0,
                                    voucherIds: new Set()
                                };
                                voucherTracker[key] = new Set();
                            }

                            aggregatedData[key].trips += trip.price;
                            aggregatedData[key].total += trip.price;

                            // Track unique vouchers
                            if (!voucherTracker[key].has(voucher._id)) {
                                voucherTracker[key].add(voucher._id);
                                aggregatedData[key].voucherCount++;
                            }
                        }
                    });
                }

                // Process flights array for office payments
                if (voucher.flights && Array.isArray(voucher.flights)) {
                    voucher.flights.forEach(flight => {
                        if (flight.officeName && flight.price > 0) {
                            const key = `${flight.officeName}-${monthYear}`;

                            if (!aggregatedData[key]) {
                                aggregatedData[key] = {
                                    officeName: flight.officeName,
                                    month: monthYear,
                                    year: voucherDate.getFullYear(),
                                    monthName: voucherDate.toLocaleString('default', { month: 'long' }),
                                    hotels: 0,
                                    transfers: 0,
                                    trips: 0,
                                    flights: 0,
                                    total: 0,
                                    currency: voucher.currency || 'USD',
                                    voucherCount: 0,
                                    voucherIds: new Set()
                                };
                                voucherTracker[key] = new Set();
                            }

                            aggregatedData[key].flights += flight.price;
                            aggregatedData[key].total += flight.price;

                            // Track unique vouchers
                            if (!voucherTracker[key].has(voucher._id)) {
                                voucherTracker[key].add(voucher._id);
                                aggregatedData[key].voucherCount++;
                            }
                        }
                    });
                }
            });
            
            // Convert to array, clean up, and sort
            const financialArray = Object.values(aggregatedData).map(item => {
                // Remove the voucherIds set that was used for tracking
                const { voucherIds: _voucherIds, ...cleanItem } = item;
                return cleanItem;
            }).sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                if (a.month !== b.month) return b.month.localeCompare(a.month);
                return b.total - a.total;
            });

            // Fetch office payments for remaining calculations
            const uniqueOffices = [...new Set(financialArray.map(item => item.officeName))];
            
            // Also get unique client offices for client payments
            const uniqueClientOffices = [...new Set(filteredVouchers.map(voucher => {
                return voucher.officeName || voucher.clientName;
            }).filter(Boolean))];
            
            // Combine both provider and client offices
            const allUniqueOffices = [...new Set([...uniqueOffices, ...uniqueClientOffices])];
            
            const paymentsMap = await fetchOfficePayments(allUniqueOffices);
            setOfficePayments(paymentsMap);
            
            setFinancialData(financialArray);
            
            // Update last refresh time
            setLastRefreshTime(new Date());
        } catch (err) {
            console.error('Failed to fetch financial data:', err);
            // setError(err.response?.data?.message || 'Failed to fetch financial data');
        } finally {
            setFinancialLoading(false);
        }
    }, [financialFilters.currency, fetchOfficePayments]);

    
    useEffect(() => {
        // Only fetch data on first load or when explicitly needed
        if (!dataLoaded) {
            const fetchInitialData = async () => {
                setLoading(true);
                try {
                    const [hotelsResponse, officesResponse] = await Promise.all([
                        axios.get('/api/hotels'),
                        axios.get('/api/offices')
                    ]);
                    
                    setHotels(hotelsResponse.data);
                    setOffices(officesResponse.data.data);
                    
                    // Only fetch users if starting on users/salaries tab
                    if (activeTab === 'users' || activeTab === 'salaries') {
                        await fetchUsers();
                    }
                    // User requests are now handled by UserRequests component
                    
                    setDataLoaded(true);
                } catch (err) {
                    console.error('Failed to fetch data:', err);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchInitialData();
        }
    }, [activeTab, dataLoaded, fetchUsers]);
    
    // Only fetch users data when switching to users tab and haven't loaded it yet
    useEffect(() => {
        if (activeTab === 'users' && dataLoaded && users.length === 0) {
            fetchUsers();
        }
        
        // User requests are now handled by UserRequests component
        
        
        // Tours are now handled by Tours component
    }, [activeTab, dataLoaded, hotels.length, fetchUsers, users.length]);

    // Auto-fetch debts when filters change
    useEffect(() => {
        if (activeTab === 'debts' && dataLoaded) {
            fetchDebts();
        }
    }, [debtFilters, activeTab, dataLoaded, fetchDebts]);

    // Auto-fetch financial data when currency filter changes
    useEffect(() => {
        if (activeTab === 'financials' && dataLoaded) {
            fetchFinancialData();
        }
    }, [financialFilters.currency, activeTab, dataLoaded, fetchFinancialData]);

    // Auto-refresh financial data every 2 minutes when on financials tab
    useEffect(() => {
        let intervalId;
        
        if (activeTab === 'financials' && dataLoaded) {
            // Set up auto-refresh every 2 minutes (120000ms)
            intervalId = setInterval(() => {
                console.log('Auto-refreshing financial data...');
                fetchFinancialData();
            }, 120000);
        }
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [activeTab, dataLoaded, fetchFinancialData]);

    // Single useEffect to handle all salary data loading
    useEffect(() => {
        if (activeTab === 'salaries' && salaryInnerTab === 'salaries' && dataLoaded && users.length > 0) {
            loadAvailableSalaryOptions().then(() => {
                loadAllUsersSalaryData();
            });
        }
    }, [activeTab, salaryInnerTab, dataLoaded, users.length, salaryCardsYear, salaryCardsMonth, loadAvailableSalaryOptions, loadAllUsersSalaryData]);


    const fetchOffices = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/offices');
            setOffices(response.data.data);
        } catch (err) {
            console.error('Failed to fetch offices:', err);
        } finally {
            setLoading(false);
        }
    };

    




    // Inside the component, handle keyboard navigation with tab changing
    const handleTabKeyDown = (e, tabName) => {
        // Navigate with arrow keys
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const tabs = isAdmin 
                ? ['hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials', 'users', 'requests']
                : isContentManager
                ? ['hotels', 'tours', 'airports', 'offices'] // Content Managers can only access content management tabs
                : ['hotels', 'tours', 'airports', 'offices', 'office-vouchers', 'financials']; // Accountants can access financials but not users/requests
            const currentIndex = tabs.indexOf(activeTab);
            
            let newIndex;
            if (e.key === 'ArrowRight') {
                newIndex = (currentIndex + 1) % tabs.length;
            } else {
                newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            }
            
            handleTabChange(tabs[newIndex]);
            
            // Focus the newly active tab button
            setTimeout(() => {
                document.getElementById(`tab-${tabs[newIndex]}`).focus();
            }, 10);
        }
        // Activate tab with Enter or Space
        else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTabChange(tabName);
        }
    };




    // Add a new function to fetch pending requests
    // Handle generating arrival reminders manually
    const handleGenerateArrivalReminders = async () => {
        if (!isAdmin) return;
        
        setNotificationLoading(true);
        try {
            const result = await generateArrivalReminders();
            toast.success(result.message || 'Arrival reminders generated successfully', {
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
        } catch (err) {
            console.error('Error generating arrival reminders:', err);
            toast.error(err.response?.data?.message || 'Failed to generate arrival reminders', {
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
            setNotificationLoading(false);
        }
    };

    // Handle generating departure reminders manually
    const handleGenerateDepartureReminders = async () => {
        if (!isAdmin) return;
        
        setNotificationLoading(true);
        try {
            const result = await generateDepartureReminders();
            toast.success(result.message || 'Departure reminders generated successfully', {
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
        } catch (err) {
            console.error('Error generating departure reminders:', err);
            toast.error(err.response?.data?.message || 'Failed to generate departure reminders', {
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
            setNotificationLoading(false);
        }
    };

    // Handle generating daily arrivals and departures summary manually
    const handleGenerateDailySummary = async () => {
        if (!isAdmin) return;
        
        setNotificationLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/notifications/generate-daily-summary', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(response.data.message || 'Daily summary generated successfully', {
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
        } catch (err) {
            console.error('Error generating daily summary:', err);
            toast.error(err.response?.data?.message || 'Failed to generate daily summary', {
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
            setNotificationLoading(false);
        }
    };


    // Handle cleaning up expired notifications
    const handleCleanupExpiredNotifications = async () => {
        if (!isAdmin) return;
        
        setNotificationLoading(true);
        try {
            const result = await cleanupExpiredNotifications();
            toast.success(result.message || 'Expired notifications cleaned up successfully', {
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
        } catch (err) {
            console.error('Error cleaning up expired notifications:', err);
            toast.error(err.response?.data?.message || 'Failed to cleanup expired notifications', {
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
            setNotificationLoading(false);
        }
    };

    // Fetch all users for reminder targeting
    const fetchAllUsersForReminders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/notifications/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users for reminders:', error);
            toast.error('Failed to load users for targeting');
        }
    };



    // Calculate remaining amount for an office in the financial table
    const calculateOfficeRemaining = (officeName, total) => {
        const payments = officePayments[officeName] || [];
        
        // Only count approved OUTGOING payments (payments made to the office)
        const totalPaid = payments.reduce((sum, payment) => {
            if (payment.status === 'approved' && payment.type === 'OUTGOING') {
                return sum + payment.amount;
            }
            return sum;
        }, 0);
        
        return total - totalPaid;
    };


    // Helper functions for vouchers
    const getCurrencySymbol = (currency) => {
        if (!currency) return '$';
        switch (currency) {
            case 'EUR': return '€';
            case 'TRY': return '₺';
            case 'USD':
            default: return '$';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Fetch vouchers for selected office
    const fetchOfficeVouchers = async (officeName) => {
        if (!officeName) return;
        
        setOfficeVouchersLoading(true);
        try {
            const response = await getAllVouchers();
            
            // Filter vouchers by office name
            const filteredVouchers = response.data.filter(voucher => 
                voucher.officeName === officeName
            );
            
            setOfficeVouchers(filteredVouchers);
        } catch (err) {
            console.error('Failed to fetch office vouchers:', err);
            // setError(err.response?.data?.message || 'Failed to fetch office vouchers');
        } finally {
            setOfficeVouchersLoading(false);
        }
    };

    // Handle office selection for vouchers
    const handleOfficeSelection = async (eventOrOfficeName) => {
        // Handle both event objects and direct string values for compatibility
        const officeName = typeof eventOrOfficeName === 'string' 
            ? eventOrOfficeName 
            : eventOrOfficeName?.target?.value || eventOrOfficeName;
            
        setSelectedOfficeForVouchers(officeName);
        if (officeName) {
            await fetchOfficeVouchers(officeName);
        } else {
            setOfficeVouchers([]);
        }
    };

    // Handle status update for vouchers
    const handleVoucherStatusUpdate = async (voucherId, newStatus) => {
        try {
            await updateVoucherStatus(voucherId, newStatus);
            setOfficeVouchers(prevVouchers =>
                prevVouchers.map(voucher =>
                    voucher._id === voucherId
                        ? { ...voucher, status: newStatus }
                        : voucher
                )
            );
            toast.success('Voucher status updated successfully');
        } catch (err) {
            console.error('Error updating voucher status:', err);
            toast.error('Failed to update voucher status');
        }
    };

    // Handle payment date update for vouchers
    const handlePaymentDateUpdate = async (voucherId, paymentDate) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/vouchers/${voucherId}/payment-date`, 
                { paymentDate },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setOfficeVouchers(prevVouchers =>
                prevVouchers.map(voucher =>
                    voucher._id === voucherId
                        ? { ...voucher, paymentDate }
                        : voucher
                )
            );
            toast.success('Payment date updated successfully');
        } catch (err) {
            console.error('Error updating payment date:', err);
            toast.error('Failed to update payment date');
        }
    };

    // Check if user can manage a voucher
    const canManageVoucher = (voucher) => {
        if (isAdmin || isAccountant) return true;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        return voucher.createdBy && voucher.createdBy._id === currentUser.id;
    };

    // Fetch all users for the created by dropdown
    const fetchAllUsersForVouchers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/auth/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };



    // Filter financial data based on current filters
    const filteredFinancialData = financialData.filter(item => {
        if (financialFilters.year && item.year.toString() !== financialFilters.year) return false;
        
        // Only apply month filter if a specific month is selected (not "All Months")
        if (financialFilters.month && typeof financialFilters.month === 'string' && financialFilters.month.trim() !== '') {
            const expectedMonth = `${financialFilters.year}-${financialFilters.month.padStart(2, '0')}`;
            if (item.month !== expectedMonth) return false;
        }
        
        // Apply search filter
        if (financialSearchQuery.trim()) {
            const searchLower = financialSearchQuery.toLowerCase();
            if (!item.officeName.toLowerCase().includes(searchLower)) return false;
        }
        
        return true;
    });

    // Calculate totals for filtered data
    const financialTotals = filteredFinancialData.reduce((acc, item) => {
        acc.hotels += item.hotels;
        acc.transfers += item.transfers;
        acc.trips += item.trips;
        acc.flights += item.flights;
        acc.total += item.total;
        acc.totalRemaining += calculateOfficeRemaining(item.officeName, item.total);
        acc.voucherCount += item.voucherCount;
        return acc;
    }, { hotels: 0, transfers: 0, trips: 0, flights: 0, total: 0, totalRemaining: 0, voucherCount: 0 });

    // Calculate total client revenue (independent of view filter)
    const totalClientRevenue = useMemo(() => {
        // Filter vouchers by currency and date filters only
        const filteredVouchers = allVouchers.filter(voucher => {
            const voucherCurrency = voucher.currency || 'USD';
            if (voucherCurrency !== financialFilters.currency) return false;
            
            // Apply date filters
            const voucherDate = new Date(voucher.createdAt);
            const voucherYear = voucherDate.getFullYear();
            const voucherMonth = voucherDate.getMonth() + 1;
            
            if (financialFilters.year && voucherYear.toString() !== financialFilters.year) return false;
            
            // Only apply month filter if a specific month is selected
            if (financialFilters.month && typeof financialFilters.month === 'string' && financialFilters.month.trim() !== '') {
                if (voucherMonth.toString() !== financialFilters.month) return false;
            }
            
            return true;
        });

        return filteredVouchers.reduce((total, voucher) => total + (voucher.totalAmount || 0), 0);
    }, [allVouchers, financialFilters.currency, financialFilters.year, financialFilters.month]);

    // Calculate total supplier revenue (independent of view filter)
    const totalSupplierRevenue = useMemo(() => {
        // Filter financial data by currency and date filters only
        const filteredSupplierData = financialData.filter(item => {
            if (financialFilters.year && item.year.toString() !== financialFilters.year) return false;
            
            // Only apply month filter if a specific month is selected
            if (financialFilters.month && typeof financialFilters.month === 'string' && financialFilters.month.trim() !== '') {
                const expectedMonth = `${financialFilters.year}-${financialFilters.month.padStart(2, '0')}`;
                if (item.month !== expectedMonth) return false;
            }
            
            return true;
        });

        return filteredSupplierData.reduce((total, item) => total + (item.total || 0), 0);
    }, [financialData, financialFilters.year, financialFilters.month]);

    // Calculate client office data when viewType is 'clients'
    const clientOfficeData = useMemo(() => {
        if (financialFilters.viewType !== 'clients') return [];

        // Filter vouchers by currency and filters
        const filteredVouchers = allVouchers.filter(voucher => {
            const voucherCurrency = voucher.currency || 'USD';
            if (voucherCurrency !== financialFilters.currency) return false;
            
            // Apply date filters
            const voucherDate = new Date(voucher.createdAt);
            const voucherYear = voucherDate.getFullYear();
            const voucherMonth = voucherDate.getMonth() + 1;
            
            if (financialFilters.year && voucherYear.toString() !== financialFilters.year) return false;
            
            // Only apply month filter if a specific month is selected (not "All Months")
            if (financialFilters.month && typeof financialFilters.month === 'string' && financialFilters.month.trim() !== '') {
                if (voucherMonth.toString() !== financialFilters.month) return false;
            }
            
            return true;
        });

        // Group vouchers by office and month (like suppliers)
        const clientOfficesMap = new Map();
        
        filteredVouchers.forEach(voucher => {
            // Include both office-based clients and direct clients
            const clientName = voucher.officeName || voucher.clientName;
            const isDirectClient = !voucher.officeName;
            
            if (!clientName) return; // Skip if no client identifier
            
            const voucherDate = new Date(voucher.createdAt);
            const monthYear = `${voucherDate.getFullYear()}-${String(voucherDate.getMonth() + 1).padStart(2, '0')}`;
            const monthName = voucherDate.toLocaleString('default', { month: 'long' });
            const year = voucherDate.getFullYear();
            
            const key = `${clientName}-${monthYear}`;
            
            if (!clientOfficesMap.has(key)) {
                clientOfficesMap.set(key, {
                    officeName: clientName, // Use clientName for direct clients
                    isDirectClient: isDirectClient,
                    month: monthYear,
                    monthName,
                    year,
                    totalAmount: 0,
                    voucherCount: 0,
                    vouchers: []
                });
            }
            
            const officeData = clientOfficesMap.get(key);
            officeData.totalAmount += parseFloat(voucher.totalAmount) || 0;
            officeData.voucherCount += 1;
            officeData.vouchers.push(voucher);
        });
        
        // Convert to array and sort by year desc, month desc, then total amount desc
        return Array.from(clientOfficesMap.values())
            .filter(office => {
                // Apply search filter
                if (financialSearchQuery.trim()) {
                    const searchLower = financialSearchQuery.toLowerCase();
                    if (!office.officeName.toLowerCase().includes(searchLower)) return false;
                }
                
                // Apply client type filter
                if (clientTypeFilter === 'office' && office.isDirectClient) return false;
                if (clientTypeFilter === 'direct' && !office.isDirectClient) return false;
                
                return true;
            })
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                if (a.month !== b.month) return b.month.localeCompare(a.month);
                return b.totalAmount - a.totalAmount;
            });
    }, [financialFilters, allVouchers, financialSearchQuery, clientTypeFilter]);

    // Handle filter changes
    const handleFinancialFilterChange = (filterType, value) => {
        setFinancialFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        
        if (filterType === 'viewType') {
            setClientTypeFilter('all');
        }
    };

    const clearFinancialFilters = () => {
        setFinancialFilters({
            month: (new Date().getMonth() + 1).toString(), // Current month (1-12)
            year: new Date().getFullYear().toString(),
            currency: 'USD',
            viewType: 'providers'
        });
        setClientTypeFilter('all');
    };

    // Download Financial Summary PDF
    const downloadFinancialSummaryPDF = async () => {
        setPdfDownloading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Use current financial filters
            const year = financialFilters.year;
            const month = financialFilters.month;
            
            const response = await axios.get('/api/notifications/download-financial-summary-pdf', {
                headers: { Authorization: `Bearer ${token}` },
                params: { year, month },
                responseType: 'blob'
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from response headers or create default
            const contentDisposition = response.headers['content-disposition'];
            const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
            let filename = `financial-summary-${monthName}-${year}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            // Show success toast with green styling
            toast.success(`PDF downloaded successfully: ${filename}`, {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: 'white',
                },
            });
        } catch (err) {
            console.error('Error downloading PDF:', err);
            // Show error toast with red styling
            toast.error(err.response?.data?.message || 'Failed to download PDF', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: 'white',
                },
            });
        } finally {
            setPdfDownloading(false);
        }
    };

    // Debt management functions

    const handleDebtSubmit = async (e) => {
        e.preventDefault();
        setDebtLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = editingDebt ? `/api/debts/${editingDebt._id}` : '/api/debts';
            const method = editingDebt ? 'PUT' : 'POST';
            
            await axios({
                method,
                url,
                data: debtForm,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success(`Debt ${editingDebt ? 'updated' : 'created'} successfully!`, {
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
            setShowDebtModal(false);
            setEditingDebt(null);
            resetDebtForm();
            fetchDebts();
        } catch (err) {
            console.error('Failed to save debt:', err);
            toast.error(err.response?.data?.message || 'Failed to save debt');
        } finally {
            setDebtLoading(false);
        }
    };

    const handleCloseDebt = async (debtId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/debts/${debtId}/close`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Debt closed successfully!', {
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
            fetchDebts();
        } catch (err) {
            console.error('Failed to close debt:', err);
            toast.error(err.response?.data?.message || 'Failed to close debt');
        }
    };

    const handleReopenDebt = async (debtId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/debts/${debtId}/reopen`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Debt reopened successfully!', {
                duration: 3000,
                style: {
                    background: '#2196F3',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#2196F3',
                },
            });
            fetchDebts();
        } catch (err) {
            console.error('Failed to reopen debt:', err);
            toast.error(err.response?.data?.message || 'Failed to reopen debt');
        }
    };

    const handleDeleteDebt = async () => {
        if (!debtToDelete) return;
        
        setDeleteDebtLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/debts/${debtToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            toast.success('Debt deleted successfully!', {
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
            
            fetchDebts();
            closeDeleteDebtModal();
        } catch (err) {
            console.error('Failed to delete debt:', err);
            toast.error(err.response?.data?.message || 'Failed to delete debt');
        } finally {
            setDeleteDebtLoading(false);
        }
    };

    // Add functions to open and close the delete debt modal
    const openDeleteDebtModal = (debt) => {
        setDebtToDelete(debt);
        setDeleteDebtModalOpen(true);
    };

    const closeDeleteDebtModal = () => {
        setDeleteDebtModalOpen(false);
        setDebtToDelete(null);
    };

    const openDebtModal = (debt = null) => {
        if (debt) {
            setEditingDebt(debt);
            setDebtForm({
                officeName: debt.officeName,
                amount: debt.amount.toString(),
                currency: debt.currency,
                type: debt.type,
                description: debt.description || '',
                dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '',
                notes: debt.notes || ''
            });
        } else {
            setEditingDebt(null);
            resetDebtForm();
        }
        setShowDebtModal(true);
    };

    const resetDebtForm = () => {
        setDebtForm({
            officeName: '',
            amount: '',
            currency: 'USD',
            type: 'OWED_TO_OFFICE',
            description: '',
            dueDate: '',
            notes: ''
        });
    };

    const handleDebtFilterChange = (filterType, value) => {
        setDebtFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    // Clear debt filters
    const clearDebtFilters = () => {
        setDebtFilters({
            office: '',
            status: '',
            type: ''
        });
    };

    // Check if financial filters are applied
    const hasFinancialFiltersApplied = () => {
        const currentYear = new Date().getFullYear().toString();
        const currentMonth = (new Date().getMonth() + 1).toString();
        return financialFilters.month !== currentMonth || 
               financialFilters.year !== currentYear || 
               financialFilters.currency !== 'USD' ||
               financialFilters.viewType !== 'providers';
    };

    // Check if debt filters are applied
    const hasDebtFiltersApplied = () => {
        return debtFilters.office !== '' || 
               debtFilters.status !== '' || 
               debtFilters.type !== '';
    };

    // Get unique offices from debt data
    const getOfficesWithDebts = () => {
        const uniqueOffices = [...new Set(debts.map(debt => debt.officeName))];
        return uniqueOffices.sort().map(office => ({
            value: office,
            label: office
        }));
    };


    if (loading) {
        return (
            <div className="py-8">
                <RahalatekLoader size="lg" />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center">
            {/* Mobile/Tablet tabs - sticky at bottom for mobile and tablet */}
            {!loading && !isNotificationsOnlyRoute && (
                <div className="lg:hidden w-full fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex space-x-1 px-4 py-2 min-w-max" role="tablist" aria-label="Admin Sections">
                                {!isContentManager && (
                                    <button
                                    id="tab-dashboard-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'dashboard' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('dashboard')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'dashboard')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'dashboard'}
                                        aria-controls="dashboard-panel"
                                    >
                                        Dashboard
                                    </button>
                                )}
                                <button
                                id="tab-hotels-mobile"
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        activeTab === 'hotels' 
                                        ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                    }`}
                                    onClick={() => handleTabChange('hotels')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'hotels')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'hotels'}
                                    aria-controls="hotels-panel"
                                >
                                    Hotels
                                </button>
                                <button
                                id="tab-tours-mobile"
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        activeTab === 'tours' 
                                        ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                    }`}
                                    onClick={() => handleTabChange('tours')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'tours')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'tours'}
                                    aria-controls="tours-panel"
                                >
                                    Tours
                                </button>
                                {(isAdmin || isContentManager) && (
                                <button
                                id="tab-packages-mobile"
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        activeTab === 'packages' 
                                        ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                    }`}
                                    onClick={() => handleTabChange('packages')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'packages')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'packages'}
                                    aria-controls="packages-panel"
                                >
                                    Packages
                                </button>
                                )}
                                <button
                                id="tab-airports-mobile"
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        activeTab === 'airports' 
                                        ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                    }`}
                                    onClick={() => handleTabChange('airports')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'airports')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'airports'}
                                    aria-controls="airports-panel"
                                >
                                    Airports
                                </button>
                                <button
                                id="tab-offices-mobile"
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                        activeTab === 'offices' 
                                        ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                    }`}
                                    onClick={() => handleTabChange('offices')}
                                    onKeyDown={(e) => handleTabKeyDown(e, 'offices')}
                                    tabIndex={0}
                                    role="tab"
                                    aria-selected={activeTab === 'offices'}
                                    aria-controls="offices-panel"
                                >
                                    Offices
                                </button>
                                {!isContentManager && (
                                    <button
                                    id="tab-office-vouchers-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'office-vouchers' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('office-vouchers')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'office-vouchers')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'office-vouchers'}
                                        aria-controls="office-vouchers-panel"
                                    >
                                        Office Vouchers
                                    </button>
                                )}
                                {!isContentManager && (
                                    <button
                                    id="tab-financials-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'financials' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('financials')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'financials')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'financials'}
                                        aria-controls="financials-panel"
                                    >
                                        Financials
                                    </button>
                                )}
                                {!isContentManager && (
                                    <button
                                    id="tab-debts-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'debts' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('debts')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'debts')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'debts'}
                                        aria-controls="debts-panel"
                                    >
                                    Debts
                                    </button>
                                )}
                                {(isAdmin || isAccountant) && !isContentManager && (
                                    <button
                                    id="tab-salaries-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'salaries' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('salaries')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'salaries')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'salaries'}
                                        aria-controls="salaries-panel"
                                    >
                                        Salaries & Bonuses
                                    </button>
                                )}
                                {(isAdmin || isAccountant) && (
                                    <button
                                    id="tab-attendance-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'attendance' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('attendance')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'attendance')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'attendance'}
                                        aria-controls="attendance-panel"
                                    >
                                        Attendance
                                    </button>
                                )}
                                {!isContentManager && (
                                    <button
                                    id="tab-users-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'users' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('users')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'users')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'users'}
                                        aria-controls="users-panel"
                                    >
                                        Users
                                    </button>
                                )}
                                {isAdmin && (
                                    <button
                                    id="tab-requests-mobile"
                                    className={`relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'requests' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('requests')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'requests')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'requests'}
                                        aria-controls="requests-panel"
                                    >
                                    User Requests
                                    </button>
                                )}
                                {!isContentManager && (
                                    <button
                                    id="tab-notifications-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'notifications' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('notifications')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'notifications')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'notifications'}
                                        aria-controls="notifications-panel"
                                    >
                                        Notifications
                                    </button>
                                )}

                                {/* Show Scheduler tab to admin only */}
                                {isAdmin && (
                                    <button
                                    id="tab-scheduler-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'scheduler' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('scheduler')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'scheduler')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'scheduler'}
                                        aria-controls="scheduler-panel"
                                    >
                                        Email Scheduler
                                    </button>
                                )}
                                
                                {/* Show UI Management tab to admin and content managers */}
                                {(isAdmin || isContentManager) && (
                                    <button
                                    id="tab-ui-management-mobile"
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                            activeTab === 'ui-management' 
                                            ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-slate-700 dark:text-teal-400' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                        onClick={() => handleTabChange('ui-management')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'ui-management')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'ui-management'}
                                        aria-controls="ui-management-panel"
                                    >
                                        UI Management
                                    </button>
                                )}
                        </div>
                    </div>
                            </div>
                        )}
                        
            {loading ? (
                <div className="py-8">
                    <RahalatekLoader size="lg" />
                </div>
            ) : (
                <div className="w-full">
                    {/* Modern layout with sidebar and content */}
                    <div className="flex flex-col md:flex-row w-full">
                        {/* Sidebar for desktop - Hide for notifications-only route */}
                            {!isNotificationsOnlyRoute && (
                            <div className="hidden lg:block w-64 bg-white dark:bg-slate-900 shadow-lg rounded-lg mr-4 h-fit sticky top-4">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Management</h3>
                            </div>
                            <nav className="p-2" role="tablist" aria-label="Admin Sections">
                                    {!isContentManager && (
                                        <button
                                        id="tab-dashboard"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'dashboard' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                            onClick={() => handleTabChange('dashboard')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'dashboard')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'dashboard'}
                                            aria-controls="dashboard-panel"
                                        >
                                        <FaChartLine className="h-5 w-5 mr-3" />
                                            Dashboard
                                        </button>
                                    )}
                                    <button
                                    id="tab-hotels"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'hotels' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('hotels')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'hotels')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'hotels'}
                                        aria-controls="hotels-panel"
                                    >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                        Hotels
                                    </button>
                                    <button
                                    id="tab-tours"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'tours' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('tours')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'tours')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'tours'}
                                        aria-controls="tours-panel"
                                    >
                                    <FaMapMarkedAlt className="h-5 w-5 mr-3" />
                                        Tours
                                    </button>
                                    {(isAdmin || isContentManager) && (
                                    <button
                                    id="tab-packages"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'packages' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('packages')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'packages')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'packages'}
                                        aria-controls="packages-panel"
                                    >
                                    <FaBox className="h-5 w-5 mr-3" />
                                        Packages
                                    </button>
                                    )}
                                    <button
                                    id="tab-airports"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'airports' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('airports')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'airports')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'airports'}
                                        aria-controls="airports-panel"
                                    >
                                    <FaPlaneDeparture className="h-5 w-5 mr-3" />
                                        Airports
                                    </button>
                                    <button
                                    id="tab-offices"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'offices' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('offices')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'offices')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'offices'}
                                        aria-controls="offices-panel"
                                    >
                                    <FaBuilding className="h-5 w-5 mr-3" />
                                        Offices
                                    </button>
                                    {!isContentManager && (
                                        <button
                                        id="tab-office-vouchers"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'office-vouchers' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                            onClick={() => handleTabChange('office-vouchers')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'office-vouchers')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'office-vouchers'}
                                            aria-controls="office-vouchers-panel"
                                        >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                            Office Vouchers
                                        </button>
                                    )}
                                    {!isContentManager && (
                                        <button
                                        id="tab-financials"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'financials' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                            onClick={() => handleTabChange('financials')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'financials')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'financials'}
                                            aria-controls="financials-panel"
                                        >
                                        <FaDollarSign className="h-5 w-5 mr-3" />
                                            Financials
                                        </button>
                                    )}
                                    {!isContentManager && (
                                        <button
                                        id="tab-debts"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'debts' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                            onClick={() => handleTabChange('debts')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'debts')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'debts'}
                                            aria-controls="debts-panel"
                                        >
                                        <FaFileInvoiceDollar className="h-5 w-5 mr-3" />
                                        Debt Management
                                        </button>
                                    )}
                                    {(isAdmin || isAccountant) && (
                                        <button
                                        id="tab-salaries"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'salaries' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                            onClick={() => handleTabChange('salaries')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'salaries')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'salaries'}
                                            aria-controls="salaries-panel"
                                        >
                                        <FaCoins className="h-5 w-5 mr-3" />
                                            Salaries & Bonuses
                                        </button>
                                    )}
                                
                                    {(isAdmin || isAccountant) && (
                                        <button
                                        id="tab-attendance"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'attendance' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                            onClick={() => handleTabChange('attendance')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'attendance')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'attendance'}
                                            aria-controls="attendance-panel"
                                        >
                                        <FaCalendarDay className="h-5 w-5 mr-3" />
                                            Attendance
                                        </button>
                                    )}
                                
                                {/* Show Users tab to admins and accountants only, not content managers */}
                                {!isContentManager && (
                                    <button
                                    id="tab-users"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'users' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('users')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'users')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'users'}
                                        aria-controls="users-panel"
                                    >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                        Users
                                    </button>
                                )}
                                
                                {/* Only show User Requests tab to full admins */}
                                    {isAdmin && (
                                        <button
                                        id="tab-requests"
                                        className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                            activeTab === 'requests' 
                                                ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                            onClick={() => handleTabChange('requests')}
                                            onKeyDown={(e) => handleTabKeyDown(e, 'requests')}
                                            tabIndex={0}
                                            role="tab"
                                            aria-selected={activeTab === 'requests'}
                                            aria-controls="requests-panel"
                                        >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                                        </svg>
                                        User Requests
                                        </button>
                                    )}
                                
                                {/* Show Notifications tab to admins and accountants only, not content managers */}
                                {!isContentManager && (
                                    <button
                                    id="tab-notifications"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'notifications' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('notifications')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'notifications')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'notifications'}
                                        aria-controls="notifications-panel"
                                    >
                                    <FaBell className="h-5 w-5 mr-3" />
                                        Notifications
                                    </button>
                                )}

                                {/* Show Scheduler tab to admin only */}
                                {isAdmin && (
                                    <button
                                    id="tab-scheduler"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'scheduler' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('scheduler')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'scheduler')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'scheduler'}
                                        aria-controls="scheduler-panel"
                                    >
                                    <FaEnvelope className="h-5 w-5 mr-3" />
                                        Email Scheduler
                                    </button>
                                )}

                                {/* Show UI Management tab to admin and content managers */}
                                {(isAdmin || isContentManager) && (
                                    <button
                                    id="tab-ui-management"
                                    className={`flex items-center w-full px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                                        activeTab === 'ui-management' 
                                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-slate-800 dark:text-teal-400' 
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                    }`}
                                        onClick={() => handleTabChange('ui-management')}
                                        onKeyDown={(e) => handleTabKeyDown(e, 'ui-management')}
                                        tabIndex={0}
                                        role="tab"
                                        aria-selected={activeTab === 'ui-management'}
                                        aria-controls="ui-management-panel"
                                    >
                                    <FaPalette className="h-5 w-5 mr-3" />
                                        UI Management
                                    </button>
                                )}
                            </nav>
                                </div>
                            )}
                        
                        {/* Main content area */}
                        <div className="flex-1">
                            
                            {/* Tab panels */}
                            {activeTab === 'dashboard' && !isContentManager && (
                                <div id="dashboard-panel" role="tabpanel" aria-labelledby="tab-dashboard">
                                    <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                        <Dashboard />
                                    </Suspense>
                                </div>
                            )}
                            
                            {activeTab === 'hotels' && (
                                <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                    <Hotels />
                                </Suspense>
                            )}
                            
                            {activeTab === 'tours' && (
                                <div id="tours-panel" role="tabpanel" aria-labelledby="tab-tours">
                                    <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                        <Tours />
                                    </Suspense>
                                </div>
                            )}
                            
                            {activeTab === 'packages' && (isAdmin || isContentManager) && (
                                <div id="packages-panel" role="tabpanel" aria-labelledby="tab-packages">
                                    <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                        <Packages user={authUser} />
                                    </Suspense>
                                </div>
                            )}

                            {activeTab === 'airports' && (
                                <div id="airports-panel" role="tabpanel" aria-labelledby="tab-airports">
                                    <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                        <Airports />
                                    </Suspense>
                                </div>
                            )}

                            {activeTab === 'offices' && (
                                <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                    <Offices />
                                </Suspense>
                            )}

                            {activeTab === 'office-vouchers' && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-950" id="office-vouchers-panel" role="tabpanel" aria-labelledby="tab-office-vouchers">
                                    <h2 className="text-xl md:text-2xl font-bold mb-4 dark:text-white text-center">Vouchers by Office</h2>
                                    
                                    <div className="mb-6">
                                        <div className="mb-2 block">
                                            <Label htmlFor="officeSelect" value="Select Office" className="text-lg font-medium" />
                                        </div>
                                        <SearchableSelect
                                            options={offices.map(office => ({
                                                value: office.name,
                                                label: `${office.name} - ${office.location}`
                                            }))}
                                            value={selectedOfficeForVouchers}
                                            onChange={handleOfficeSelection}
                                            placeholder="Choose an office to view vouchers"
                                            className="w-full"
                                        />
                                    </div>

                                    {selectedOfficeForVouchers && (
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4 dark:text-white">
                                                Vouchers for {selectedOfficeForVouchers}
                                            </h3>
                                            
                                            {officeVouchersLoading ? (
                                                <div className="py-8">
                                                    <RahalatekLoader size="lg" />
                                                </div>
                                            ) : officeVouchers.length > 0 ? (
                                                <>
                                                    {/* Desktop Table View */}
                                                    <div className="hidden md:block">
                                                        <CustomScrollbar maxHeight="70vh">
                                                            <CustomTable
                                                            headers={[
                                                                { label: "Voucher #", className: "" },
                                                                { label: "Client Name", className: "" },
                                                                { label: "Status", className: "" },
                                                                { label: "Hotel Name", className: "" },
                                                                { label: "Note", className: "" },
                                                                { label: "Pax", className: "" },
                                                                { label: "Advanced Payment", className: "" },
                                                                { label: "Total Amount", className: "text-blue-600 dark:text-blue-400" },
                                                                { label: "Arrival", className: "" },
                                                                { label: "Departure", className: "" },
                                                                { label: "Payment Status", className: "" },
                                                                { label: "Date of Payment", className: "" },
                                                                { label: "Actions", className: "" }
                                                            ]}
                                                            data={officeVouchers}
                                                            renderRow={(voucher) => (
                                                                <>
                                                                    <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        <button
                                                                            onClick={() => navigate(`/vouchers/${voucher._id}`)}
                                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-sm"
                                                                            title="View voucher details"
                                                                        >
                                                                            #{voucher.voucherNumber}
                                                                        </button>
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        <div className="truncate max-w-[150px]" title={voucher.clientName}>
                                                                            {voucher.clientName}
                                                                        </div>
                                                                    </Table.Cell>
                                                                    <Table.Cell className="px-4 py-3">
                                                                        <StatusControls
                                                                            currentStatus={voucher.status || 'await'}
                                                                            onStatusUpdate={(newStatus) => handleVoucherStatusUpdate(voucher._id, newStatus)}
                                                                            canEdit={isAdmin || isAccountant}
                                                                            arrivalDate={voucher.arrivalDate}
                                                                        />
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        <div className="truncate max-w-[150px]" title={voucher.hotels && voucher.hotels.length > 0 ? voucher.hotels.map(hotel => hotel.hotelName).filter(Boolean).join(', ') || 'N/A' : 'N/A'}>
                                                                            {voucher.hotels && voucher.hotels.length > 0 
                                                                                ? voucher.hotels.map(hotel => hotel.hotelName).filter(Boolean).join(', ') || 'N/A'
                                                                                : 'N/A'}
                                                                        </div>
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        <div className="truncate max-w-[120px]" title={voucher.note || 'N/A'}>
                                                                            {voucher.note || 'N/A'}
                                                                        </div>
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        {voucher.hotels && voucher.hotels.length > 0 
                                                                            ? voucher.hotels.reduce((total, hotel) => total + (hotel.pax || 0), 0) || 'N/A'
                                                                            : 'N/A'}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        {voucher.advancedPayment && voucher.advancedAmount 
                                                                            ? `${getCurrencySymbol(voucher.currency)}${voucher.advancedAmount}` 
                                                                            : 'N/A'}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm font-medium text-blue-600 dark:text-blue-400 px-4 py-3">
                                                                        {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        {formatDate(voucher.arrivalDate)}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                        {formatDate(voucher.departureDate)}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="px-4 py-3">
                                                                        {(() => {
                                                                            // Check if voucher has any office payments and their status
                                                                            const hasApprovedPayments = voucher.officePayments && voucher.officePayments.some(payment => payment.status === 'approved');
                                                                            const hasPendingPayments = voucher.officePayments && voucher.officePayments.some(payment => payment.status === 'pending');
                                                                            const hasPayments = voucher.payments && Object.values(voucher.payments).some(payment => payment.officeName === selectedOfficeForVouchers && payment.price > 0);
                                                                            
                                                                            if (hasApprovedPayments) {
                                                                                return (
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-green-500 text-white border border-green-600 shadow-md text-[11px] px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-16">
                                                                                        Approved
                                                                                    </span>
                                                                                );
                                                                            } else if (hasPendingPayments) {
                                                                                return (
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-yellow-500 text-white border border-yellow-600 shadow-md text-[11px] px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-16">
                                                                                        Pending
                                                                                    </span>
                                                                                );
                                                                            } else if (hasPayments) {
                                                                                return (
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-500 text-white border border-gray-600 shadow-md text-[11px] px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-16">
                                                                                        No Payment
                                                                                    </span>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-400 text-white border border-gray-500 shadow-md text-[11px] px-2 py-0.5 font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-16">
                                                                                        N/A
                                                                                    </span>
                                                                                );
                                                                            }
                                                                        })()}
                                                                    </Table.Cell>
                                                                    <Table.Cell className="px-4 py-3">
                                                                        <PaymentDateControls
                                                                            currentPaymentDate={voucher.paymentDate}
                                                                            onPaymentDateUpdate={(paymentDate) => handlePaymentDateUpdate(voucher._id, paymentDate)}
                                                                            canEdit={isAdmin || isAccountant}
                                                                        />
                                                                    </Table.Cell>
                                                                    <Table.Cell className="px-4 py-3">
                                                                        <div className="flex space-x-2">
                                                                            <Link 
                                                                                to={`/vouchers/${voucher._id}`}
                                                                                className="font-medium text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                                            >
                                                                                View
                                                                            </Link>
                                                                            {canManageVoucher(voucher) && (
                                                                                <Link 
                                                                                    to={`/edit-voucher/${voucher._id}`}
                                                                                    className="font-medium text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                                                                                >
                                                                                    Edit
                                                                                </Link>
                                                                            )}
                                                                        </div>
                                                                    </Table.Cell>
                                                                </>
                                                            )}
                                                            emptyMessage="No vouchers found for this office"
                                                            emptyIcon={() => (
                                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            )}
                                                        />
                                                    </CustomScrollbar>
                                                    
                                                    {/* Currency Totals */}
                                                    {Object.keys(totalsByCurrency).length > 0 && (
                                                        <div className="mt-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                {Object.entries(totalsByCurrency).map(([currency, amounts]) => {
                                                                    const getCardColor = (curr) => {
                                                                        switch(curr) {
                                                                            case 'USD': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
                                                                            case 'EUR': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
                                                                            case 'TRY': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
                                                                            default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
                                                                        }
                                                                    };

                                                                    const getHeaderColor = (curr) => {
                                                                        switch(curr) {
                                                                            case 'USD': return 'text-green-800 dark:text-green-300';
                                                                            case 'EUR': return 'text-blue-800 dark:text-blue-300';
                                                                            case 'TRY': return 'text-red-800 dark:text-red-300';
                                                                            default: return 'text-gray-800 dark:text-gray-300';
                                                                        }
                                                                    };

                                                                    const getTextColor = (curr) => {
                                                                        switch(curr) {
                                                                            case 'USD': return 'text-green-700 dark:text-green-400';
                                                                            case 'EUR': return 'text-blue-700 dark:text-blue-400';
                                                                            case 'TRY': return 'text-red-700 dark:text-red-400';
                                                                            default: return 'text-gray-700 dark:text-gray-400';
                                                                        }
                                                                    };

                                                                    const getBoldTextColor = (curr) => {
                                                                        switch(curr) {
                                                                            case 'USD': return 'text-green-900 dark:text-green-200';
                                                                            case 'EUR': return 'text-blue-900 dark:text-blue-200';
                                                                            case 'TRY': return 'text-red-900 dark:text-red-200';
                                                                            default: return 'text-gray-900 dark:text-gray-200';
                                                                        }
                                                                    };

                                                                    return (
                                                                        <div key={currency} className={`p-4 rounded-lg border ${getCardColor(currency)}`}>
                                                                            <h4 className={`text-lg font-semibold mb-2 ${getHeaderColor(currency)}`}>{currency} Total</h4>
                                                                            <div className="space-y-1">
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span className={getTextColor(currency)}>Total Amount:</span>
                                                                                    <span className={`font-medium ${getBoldTextColor(currency)}`}>
                                                                                        {getCurrencySymbol(currency)}{amounts.totalAmount.toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span className={getTextColor(currency)}>Advanced Payments:</span>
                                                                                    <span className={`font-medium ${getBoldTextColor(currency)}`}>
                                                                                        {getCurrencySymbol(currency)}{amounts.totalAdvanced.toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    </div>

                                                    {/* Mobile Cards View - same style as AttendancePanel */}
                                                    <div className="md:hidden space-y-5">
                                                        {officeVouchers.map((voucher, index) => (
                                                            <div 
                                                                key={voucher._id} 
                                                                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                                                style={{
                                                                    animationDelay: `${index * 100}ms`
                                                                }}
                                                            >
                                                                <div className="space-y-3">
                                                                    {/* Header with Voucher Number and Status */}
                                                                    <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                                                                        <div>
                                                                            <button
                                                                                onClick={() => navigate(`/vouchers/${voucher._id}`)}
                                                                                className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                                                                title="View voucher details"
                                                                            >
                                                                                #{voucher.voucherNumber}
                                                                            </button>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                                                                                {voucher.clientName}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <StatusControls
                                                                                currentStatus={voucher.status || 'await'}
                                                                                onStatusUpdate={(newStatus) => handleVoucherStatusUpdate(voucher._id, newStatus)}
                                                                                canEdit={isAdmin || isAccountant}
                                                                                arrivalDate={voucher.arrivalDate}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Voucher Details */}
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Hotel</div>
                                                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                                {voucher.hotels && voucher.hotels.length > 0 
                                                                                    ? voucher.hotels.map(hotel => hotel.hotelName).filter(Boolean).join(', ') || 'N/A'
                                                                                    : 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Total Amount</div>
                                                                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                                {getCurrencySymbol(voucher.currency)}{voucher.totalAmount}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Pax</div>
                                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                {voucher.hotels && voucher.hotels.length > 0 
                                                                                    ? voucher.hotels.reduce((total, hotel) => total + (hotel.pax || 0), 0) || 'N/A'
                                                                                    : 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Advanced Payment</div>
                                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                {voucher.advancedPayment && voucher.advancedAmount 
                                                                                    ? `${getCurrencySymbol(voucher.currency)}${voucher.advancedAmount}` 
                                                                                    : 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Dates */}
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Arrival</div>
                                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                {formatDate(voucher.arrivalDate)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Departure</div>
                                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                                {formatDate(voucher.departureDate)}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Payment Status and Controls */}
                                                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Payment Status</div>
                                                                                {(() => {
                                                                                    const hasApprovedPayments = voucher.officePayments && voucher.officePayments.some(payment => payment.status === 'approved');
                                                                                    const hasPendingPayments = voucher.officePayments && voucher.officePayments.some(payment => payment.status === 'pending');
                                                                                    const hasPayments = voucher.payments && Object.values(voucher.payments).some(payment => payment.officeName === selectedOfficeForVouchers && payment.price > 0);
                                                                                    
                                                                                    if (hasApprovedPayments) {
                                                                                        return (
                                                                                            <span className="inline-flex items-center justify-center rounded-lg bg-green-500 text-white border border-green-600 shadow-md text-[10px] px-1.5 py-0.5 font-semibold">
                                                                                                Approved
                                                                                            </span>
                                                                                        );
                                                                                    } else if (hasPendingPayments) {
                                                                                        return (
                                                                                            <span className="inline-flex items-center justify-center rounded-lg bg-yellow-500 text-white border border-yellow-600 shadow-md text-[10px] px-1.5 py-0.5 font-semibold">
                                                                                                Pending
                                                                                            </span>
                                                                                        );
                                                                                    } else if (hasPayments) {
                                                                                        return (
                                                                                            <span className="inline-flex items-center justify-center rounded-lg bg-gray-500 text-white border border-gray-600 shadow-md text-[10px] px-1.5 py-0.5 font-semibold">
                                                                                                No Payment
                                                                                            </span>
                                                                                        );
                                                                                    } else {
                                                                                        return (
                                                                                            <span className="inline-flex items-center justify-center rounded-lg bg-gray-400 text-white border border-gray-500 shadow-md text-[10px] px-1.5 py-0.5 font-semibold">
                                                                                                N/A
                                                                                            </span>
                                                                                        );
                                                                                    }
                                                                                })()}
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <CustomButton
                                                                                    variant="blue"
                                                                                    size="xs"
                                                                                    onClick={() => navigate(`/vouchers/${voucher._id}`)}
                                                                                    title="View voucher details"
                                                                                    className="text-xs"
                                                                                >
                                                                                    View
                                                                                </CustomButton>
                                                                                {canManageVoucher(voucher) && (
                                                                                    <CustomButton
                                                                                        variant="purple"
                                                                                        size="xs"
                                                                                        onClick={() => navigate(`/edit-voucher/${voucher._id}`)}
                                                                                        title="Edit voucher"
                                                                                        className="text-xs"
                                                                                    >
                                                                                        Edit
                                                                                    </CustomButton>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Payment Date Controls */}
                                                                        <div className="mt-2">
                                                                            <PaymentDateControls
                                                                                currentPaymentDate={voucher.paymentDate}
                                                                                onPaymentDateUpdate={(paymentDate) => handlePaymentDateUpdate(voucher._id, paymentDate)}
                                                                                canEdit={isAdmin || isAccountant}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Note if available */}
                                                                    {voucher.note && (
                                                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Note</div>
                                                                            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                                                {voucher.note}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No vouchers found for {selectedOfficeForVouchers}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">This office doesn't have any vouchers yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!selectedOfficeForVouchers && (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            <p className="text-lg font-medium">Select an office to view vouchers</p>
                                            <p className="text-sm">Choose an office from the dropdown above to see all vouchers assigned to that office.</p>
                                        </div>
                                    )}

                                </Card>
                            )}

                            {activeTab === 'financials' && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-950" id="financials-panel" role="tabpanel" aria-labelledby="tab-financials">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 md:mb-6 gap-4">
                                        <h2 className="text-xl md:text-2xl font-bold dark:text-white flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            Financial Reports
                                        </h2>
                                        
                                        {/* PDF Download Button */}
                                        <CustomButton
                                            onClick={downloadFinancialSummaryPDF}
                                            disabled={pdfDownloading}
                                            variant="green"
                                            size="md"
                                            className="flex items-center gap-2"
                                            title={`Download ${financialFilters.month ? new Date(financialFilters.year, financialFilters.month - 1).toLocaleString('en-US', { month: 'long' }) : 'Current'} ${financialFilters.year} Financial Report`}
                                        >
                                            {pdfDownloading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    📄 Download PDF
                                                </>
                                            )}
                                        </CustomButton>
                                    </div>
                                    
                                    {/* Overview Cards */}
                                    <div className={`grid grid-cols-2 sm:grid-cols-2 ${financialFilters.viewType === 'clients' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-2 md:gap-4 mb-2 md:mb-6`}>
                                        {financialFilters.viewType === 'providers' ? (
                                            <>
                                                {/* Suppliers Cost */}
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 md:p-6 rounded-lg md:rounded-xl border border-blue-200 dark:border-blue-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 leading-tight">Suppliers Cost</p>
                                                            <p className="text-sm md:text-2xl font-bold text-blue-900 dark:text-blue-100 leading-tight mt-1">
                                                                {getCurrencySymbol(financialFilters.currency)}{financialTotals.total.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-500 dark:bg-blue-600 rounded-md md:rounded-md flex items-center justify-center flex-shrink-0">
                                                            <FaDollarSign className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Active Suppliers */}
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 md:p-6 rounded-lg md:rounded-xl border border-green-200 dark:border-green-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400 leading-tight">Active Suppliers</p>
                                                            <p className="text-sm md:text-2xl font-bold text-green-900 dark:text-green-100 leading-tight mt-1">
                                                                {[...new Set(filteredFinancialData.map(item => item.officeName))].length}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-green-500 dark:bg-green-600 rounded-md md:rounded-md flex items-center justify-center flex-shrink-0">
                                                            <FaBuilding className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Total Vouchers */}
                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 md:p-6 rounded-lg md:rounded-xl border border-purple-200 dark:border-purple-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-xs md:text-sm font-medium text-purple-600 dark:text-purple-400 leading-tight">Total Vouchers</p>
                                                            <p className="text-sm md:text-2xl font-bold text-purple-900 dark:text-purple-100 leading-tight mt-1">
                                                                {financialTotals.voucherCount.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-500 dark:bg-purple-600 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaFileInvoiceDollar className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>



                                                {/* Profit */}
                                                <div className={`bg-gradient-to-br p-3 md:p-6 rounded-lg md:rounded-xl border ${
                                                    (totalClientRevenue - totalSupplierRevenue) >= 0
                                                        ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                                                        : 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'
                                                }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className={`text-xs md:text-sm font-medium leading-tight ${
                                                                (totalClientRevenue - totalSupplierRevenue) >= 0
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}>Profit</p>
                                                            <p className={`text-sm md:text-2xl font-bold leading-tight mt-1 ${
                                                                (totalClientRevenue - totalSupplierRevenue) >= 0 
                                                                    ? 'text-green-900 dark:text-green-100' 
                                                                    : 'text-red-900 dark:text-red-100'
                                                            }`}>
                                                                {getCurrencySymbol(financialFilters.currency)}{(totalClientRevenue - totalSupplierRevenue).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-md md:rounded-md flex items-center justify-center flex-shrink-0 ${
                                                            (totalClientRevenue - totalSupplierRevenue) >= 0
                                                                ? 'bg-green-500 dark:bg-green-600'
                                                                : 'bg-red-500 dark:bg-red-600'
                                                        }`}>
                                                            <FaChartLine className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Total Client Revenue */}
                                                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 p-3 md:p-6 rounded-lg md:rounded-xl border border-cyan-200 dark:border-cyan-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-xs md:text-sm font-medium leading-tight text-cyan-600 dark:text-cyan-400">Total Revenue</p>
                                                            <p className="text-sm md:text-2xl font-bold leading-tight mt-1 text-cyan-900 dark:text-cyan-100">
                                                                {getCurrencySymbol(financialFilters.currency)}{clientOfficeData.reduce((sum, office) => sum + office.totalAmount, 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-cyan-500 dark:bg-cyan-600 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaDollarSign className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Unique Clients */}
                                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 md:p-6 rounded-lg md:rounded-xl border border-indigo-200 dark:border-indigo-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-xs md:text-sm font-medium leading-tight text-indigo-600 dark:text-indigo-400">Clients</p>
                                                            <p className="text-sm md:text-2xl font-bold leading-tight mt-1 text-indigo-900 dark:text-indigo-100">
                                                                {[...new Set(clientOfficeData.map(office => office.officeName))].length}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-500 dark:bg-indigo-600 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaBuilding className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Direct Clients Count */}
                                                <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 p-3 md:p-6 rounded-lg md:rounded-xl border border-rose-200 dark:border-rose-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-xs md:text-sm font-medium leading-tight text-rose-600 dark:text-rose-400">Direct Clients</p>
                                                            <p className="text-sm md:text-2xl font-bold leading-tight mt-1 text-rose-900 dark:text-rose-100">
                                                                {[...new Set(clientOfficeData.filter(office => office.isDirectClient).map(office => office.officeName))].length}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-rose-500 dark:bg-rose-600 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaUser className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Total Client Vouchers */}
                                                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 p-3 md:p-6 rounded-lg md:rounded-xl border border-teal-200 dark:border-teal-700">
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-xs md:text-sm font-medium leading-tight text-teal-600 dark:text-teal-400">Total Vouchers</p>
                                                            <p className="text-sm md:text-2xl font-bold leading-tight mt-1 text-teal-900 dark:text-teal-100">
                                                                {clientOfficeData.reduce((sum, office) => sum + office.voucherCount, 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-teal-500 dark:bg-teal-600 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <FaFileInvoiceDollar className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>



                                                {/* Profit */}
                                                <div className={`bg-gradient-to-br p-3 md:p-6 rounded-lg md:rounded-xl border ${
                                                    (totalClientRevenue - totalSupplierRevenue) >= 0
                                                        ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                                                        : 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'
                                                }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className={`text-xs md:text-sm font-medium leading-tight ${
                                                                (totalClientRevenue - totalSupplierRevenue) >= 0
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-red-600 dark:text-red-400'
                                                            }`}>Profit</p>
                                                            <p className={`text-sm md:text-2xl font-bold leading-tight mt-1 ${
                                                                (totalClientRevenue - totalSupplierRevenue) >= 0 
                                                                    ? 'text-green-900 dark:text-green-100' 
                                                                    : 'text-red-900 dark:text-red-100'
                                                            }`}>
                                                                {getCurrencySymbol(financialFilters.currency)}{(totalClientRevenue - totalSupplierRevenue).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-md md:rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                            (totalClientRevenue - totalSupplierRevenue) >= 0
                                                                ? 'bg-green-500 dark:bg-green-600'
                                                                : 'bg-red-500 dark:bg-red-600'
                                                        }`}>
                                                            <FaChartLine className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Filters */}
                                    <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700 p-6 rounded-lg mb-2 md:mb-6">
                                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                            <div>
                                                <Label htmlFor="view-type-filter" value="View Type" className="mb-2" />
                                                {/* Mobile: CustomSelect */}
                                                <div className="md:hidden">
                                                    <CustomSelect
                                                    id="view-type-filter"
                                                        options={[
                                                            { value: 'providers', label: 'Suppliers' },
                                                            { value: 'clients', label: 'Clients' }
                                                        ]}
                                                        value={financialFilters.viewType}
                                                        onChange={(value) => handleFinancialFilterChange('viewType', value)}
                                                        placeholder="Select view type..."
                                                    />
                                                </div>
                                                {/* Desktop: SearchableSelect */}
                                                <div className="hidden md:block">
                                                    <SearchableSelect
                                                        id="view-type-filter-desktop"
                                                    options={[
                                                        { value: 'providers', label: 'Suppliers' },
                                                        { value: 'clients', label: 'Clients' }
                                                    ]}
                                                    value={financialFilters.viewType}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleFinancialFilterChange('viewType', value);
                                                    }}
                                                    placeholder="Select view type..."
                                                />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="currency-filter" value="Currency" className="mb-2" />
                                                {/* Mobile: CustomSelect */}
                                                <div className="md:hidden">
                                                    <CustomSelect
                                                    id="currency-filter"
                                                        options={[
                                                            { value: 'USD', label: 'USD ($)' },
                                                            { value: 'EUR', label: 'EUR (€)' },
                                                            { value: 'TRY', label: 'TRY (₺)' }
                                                        ]}
                                                        value={financialFilters.currency}
                                                        onChange={(value) => handleFinancialFilterChange('currency', value)}
                                                        placeholder="Select currency..."
                                                    />
                                                </div>
                                                {/* Desktop: SearchableSelect */}
                                                <div className="hidden md:block">
                                                    <SearchableSelect
                                                        id="currency-filter-desktop"
                                                    options={[
                                                        { value: 'USD', label: 'USD ($)' },
                                                        { value: 'EUR', label: 'EUR (€)' },
                                                        { value: 'TRY', label: 'TRY (₺)' }
                                                    ]}
                                                    value={financialFilters.currency}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleFinancialFilterChange('currency', value);
                                                    }}
                                                    placeholder="Search or select currency..."
                                                />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="month-filter" value="Month" className="mb-2" />
                                                {/* Mobile: CustomSelect */}
                                                <div className="md:hidden">
                                                    <CustomSelect
                                                    id="month-filter"
                                                        options={(() => {
                                                            // Get months that have data for the selected year
                                                            const selectedYear = parseInt(financialFilters.year);
                                                            const dataMonths = [...new Set(
                                                                financialData
                                                                    .filter(item => item.year === selectedYear)
                                                                    .map(item => {
                                                                        // Extract month from "YYYY-MM" format
                                                                        const monthPart = item.month.split('-')[1];
                                                                        return parseInt(monthPart);
                                                                    })
                                                            )];
                                                            
                                                            // If viewing current year, always include current month
                                                            const currentYear = new Date().getFullYear();
                                                            const currentMonth = new Date().getMonth() + 1;
                                                            let allMonths = dataMonths;
                                                            
                                                            if (selectedYear === currentYear) {
                                                                allMonths = [...new Set([currentMonth, ...dataMonths])];
                                                            }
                                                            
                                                            // Create options with "All Months" first, then sorted months
                                                            const monthOptions = [{ value: '', label: 'All Months' }];
                                                            
                                                            allMonths
                                                                .sort((a, b) => a - b)
                                                                .forEach(month => {
                                                                    monthOptions.push({
                                                                        value: month.toString(),
                                                                        label: new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
                                                                    });
                                                                });
                                                            
                                                            return monthOptions;
                                                        })()}
                                                        value={financialFilters.month}
                                                        onChange={(value) => handleFinancialFilterChange('month', value)}
                                                        placeholder="Select month..."
                                                    />
                                                </div>
                                                {/* Desktop: SearchableSelect */}
                                                <div className="hidden md:block">
                                                    <SearchableSelect
                                                        id="month-filter-desktop"
                                                    options={(() => {
                                                        // Get months that have data for the selected year
                                                        const selectedYear = parseInt(financialFilters.year);
                                                        const dataMonths = [...new Set(
                                                            financialData
                                                                .filter(item => item.year === selectedYear)
                                                                .map(item => {
                                                                    // Extract month from "YYYY-MM" format
                                                                    const monthPart = item.month.split('-')[1];
                                                                    return parseInt(monthPart);
                                                                })
                                                        )];
                                                        
                                                        // If viewing current year, always include current month
                                                        const currentYear = new Date().getFullYear();
                                                        const currentMonth = new Date().getMonth() + 1;
                                                        let allMonths = dataMonths;
                                                        
                                                        if (selectedYear === currentYear) {
                                                            allMonths = [...new Set([currentMonth, ...dataMonths])];
                                                        }
                                                        
                                                        // Create options with "All Months" first, then sorted months
                                                        const monthOptions = [{ value: '', label: 'All Months' }];
                                                        
                                                        allMonths
                                                            .sort((a, b) => a - b)
                                                            .forEach(month => {
                                                                monthOptions.push({
                                                                    value: month.toString(),
                                                                    label: new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
                                                                });
                                                            });
                                                        
                                                        return monthOptions;
                                                    })()}
                                                    value={financialFilters.month}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleFinancialFilterChange('month', value);
                                                    }}
                                                    placeholder="Select month..."
                                                />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="year-filter" value="Year" className="mb-2" />
                                                {/* Mobile: CustomSelect */}
                                                <div className="md:hidden">
                                                    <CustomSelect
                                                    id="year-filter"
                                                        options={(() => {
                                                            // Get unique years from financial data
                                                            const dataYears = [...new Set(financialData.map(item => item.year))];
                                                            
                                                            // Always include current year even if no data exists
                                                            const currentYear = new Date().getFullYear();
                                                            const allYears = [...new Set([currentYear, ...dataYears])];
                                                            
                                                            // Sort in descending order (newest first) and create options
                                                            return allYears
                                                                .sort((a, b) => b - a)
                                                                .map(year => ({
                                                                    value: year.toString(),
                                                                    label: year.toString()
                                                                }));
                                                        })()}
                                                        value={financialFilters.year}
                                                        onChange={(value) => handleFinancialFilterChange('year', value)}
                                                        placeholder="Select year..."
                                                    />
                                                </div>
                                                {/* Desktop: SearchableSelect */}
                                                <div className="hidden md:block">
                                                    <SearchableSelect
                                                        id="year-filter-desktop"
                                                    options={(() => {
                                                        // Get unique years from financial data
                                                        const dataYears = [...new Set(financialData.map(item => item.year))];
                                                        
                                                        // Always include current year even if no data exists
                                                        const currentYear = new Date().getFullYear();
                                                        const allYears = [...new Set([currentYear, ...dataYears])];
                                                        
                                                        // Sort in descending order (newest first) and create options
                                                        return allYears
                                                            .sort((a, b) => b - a)
                                                            .map(year => ({
                                                                value: year.toString(),
                                                                label: year.toString()
                                                            }));
                                                    })()}
                                                    value={financialFilters.year}
                                                    onChange={(eventOrValue) => {
                                                        const value = typeof eventOrValue === 'string' 
                                                            ? eventOrValue 
                                                            : eventOrValue?.target?.value || eventOrValue;
                                                        handleFinancialFilterChange('year', value);
                                                    }}
                                                    placeholder="Select year..."
                                                />
                                            </div>
                                            </div>
                                            <div className="flex items-end col-span-2 md:col-span-1">
                                                <CustomButton
                                                    variant="red"
                                                    onClick={clearFinancialFilters}
                                                    disabled={!hasFinancialFiltersApplied()}
                                                    className="w-full h-12"
                                                    title={hasFinancialFiltersApplied() ? "Clear all financial filters" : "No filters to clear"}
                                                    icon={HiX}
                                                >
                                                    Clear Filters
                                                </CustomButton>
                                            </div>
                                            <div className="flex items-end col-span-2 md:col-span-1">
                                                <CustomButton
                                                    variant="blue"
                                                    onClick={fetchFinancialData}
                                                    disabled={financialLoading}
                                                    className="w-full h-12"
                                                    title="Refresh financial data"
                                                >
                                                    {financialLoading ? 'Refreshing...' : 'Refresh Data'}
                                                </CustomButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Search Bar and Filters */}
                                    <div className="mb-2 md:mb-6 -ml-2">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-80">
                                                <Search
                                                    placeholder={financialFilters.viewType === 'clients' ? "Search clients by name..." : "Search offices by name..."}
                                                    value={financialSearchQuery}
                                                    onChange={(e) => setFinancialSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            
                                            {/* Client Type Filter - Only show in clients section */}
                                            {financialFilters.viewType === 'clients' && (
                                                <div className="w-48">
                                                    <SearchableSelect
                                                        value={clientTypeFilter}
                                                        onChange={(eventOrValue) => {
                                                            const value = typeof eventOrValue === 'string' 
                                                                ? eventOrValue 
                                                                : eventOrValue?.target?.value || eventOrValue;
                                                            setClientTypeFilter(value);
                                                        }}
                                                        options={[
                                                            { value: 'all', label: 'All Clients' },
                                                            { value: 'office', label: 'Office Clients' },
                                                            { value: 'direct', label: 'Direct Clients' }
                                                        ]}
                                                        placeholder="Client Type..."
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Reset Button */}
                                            {(financialSearchQuery || (financialFilters.viewType === 'clients' && clientTypeFilter !== 'all')) && (
                                                <CustomButton
                                                    variant="red"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFinancialSearchQuery('');
                                                        if (financialFilters.viewType === 'clients') {
                                                            setClientTypeFilter('all');
                                                        }
                                                    }}
                                                    className="whitespace-nowrap"
                                                >
                                                    <HiX className="h-4 w-4 mr-1" />
                                                    Clear
                                                </CustomButton>
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial Data Table */}
                    {financialLoading ? (
                        <div className="py-8">
                            <RahalatekLoader size="lg" />
                        </div>
                                        ) : (
                        <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                        <CustomScrollbar maxHeight="400px">
                            {financialFilters.viewType === 'providers' ? (
                                <CustomTable
                                    headers={[
                                        { label: '#', className: 'text-center' },
                                        { label: 'Office', className: '' },
                                        { label: 'Month', className: '' },
                                        { label: 'Hotels', className: 'text-blue-600 dark:text-blue-400' },
                                        { label: 'Transfers', className: 'text-green-600 dark:text-green-400' },
                                        { label: 'Trips', className: 'text-purple-600 dark:text-purple-400' },
                                        { label: 'Flights', className: 'text-orange-600 dark:text-orange-400' },
                                        { label: 'Total', className: 'text-gray-900 dark:text-white' },
                                        { label: 'Remaining', className: 'text-red-600 dark:text-red-400' },
                                        { label: 'Vouchers', className: '' }
                                    ]}
                                    data={filteredFinancialData}
                                    renderRow={(item, index) => (
                                        <>
                                            <Table.Cell className="text-sm text-gray-600 dark:text-gray-300 px-4 py-3 text-center">
                                                {index + 1}
                                            </Table.Cell>
                                            <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                                <Link 
                                                    to={`/office/${encodeURIComponent(item.officeName)}`}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:underline transition-colors duration-200"
                                                >
                                                    {item.officeName}
                                                </Link>
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                {item.monthName} {item.year}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-blue-600 dark:text-blue-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.hotels.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-green-600 dark:text-green-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.transfers.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-purple-600 dark:text-purple-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.trips.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-orange-600 dark:text-orange-400 font-medium px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.flights.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm font-bold text-gray-900 dark:text-white px-4 py-3">
                                                {getCurrencySymbol(financialFilters.currency)}{item.total.toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className={`text-sm font-bold px-4 py-3 ${calculateOfficeRemaining(item.officeName, item.total) <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {getCurrencySymbol(financialFilters.currency)}{calculateOfficeRemaining(item.officeName, item.total).toFixed(2)}
                                            </Table.Cell>
                                            <Table.Cell className="text-sm text-gray-600 dark:text-gray-400 px-4 py-3">
                                                {item.voucherCount}
                                            </Table.Cell>
                                        </>
                                    )}
                                    emptyMessage="No financial data found for the selected period"
                                    emptyIcon={() => (
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    )}
                                />
                            ) : (
                                <CustomTable
                                    headers={[
                                        { label: '#', className: 'text-center' },
                                        { label: 'Client', className: '' },
                                        { label: 'Month', className: '' },
                                        { label: 'Total Amount', className: 'text-blue-600 dark:text-blue-400' },
                                        { label: 'Paid', className: 'text-green-600 dark:text-green-400' },
                                        { label: 'Remaining', className: 'text-red-600 dark:text-red-400' },
                                        { label: 'Vouchers', className: 'text-gray-900 dark:text-white' }
                                    ]}
                                    data={clientOfficeData}
                                    renderRow={(office, index) => {
                                        const totalPaid = office.vouchers.reduce((sum, voucher) => {
                                            const voucherSpecificPayments = Object.values(officePayments).flat().filter(payment => {
                                                const relatedVoucherId = payment.relatedVoucher?._id || payment.relatedVoucher;
                                                return relatedVoucherId === voucher._id && payment.status === 'approved' && payment.type === 'INCOMING';
                                            });
                                            return sum + voucherSpecificPayments.reduce((paidSum, payment) => paidSum + payment.amount, 0);
                                        }, 0);
                                        
                                        const remaining = office.totalAmount - totalPaid;
                                        
                                        return (
                                            <>
                                                <Table.Cell className="text-sm text-gray-600 dark:text-gray-300 px-4 py-3 text-center">
                                                    {index + 1}
                                                </Table.Cell>
                                                <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Link 
                                                            to={office.isDirectClient ? `/client/${encodeURIComponent(office.officeName)}` : `/office/${encodeURIComponent(office.officeName)}`}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:underline transition-colors duration-200"
                                                        >
                                                            {office.officeName}
                                                        </Link>
                                                        {office.isDirectClient && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                                                <FaUser className="w-3 h-3 mr-1" />
                                                                Direct
                                                            </span>
                                                        )}
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                    {office.monthName} {office.year}
                                                </Table.Cell>
                                                <Table.Cell className="text-sm text-blue-600 dark:text-blue-400 font-medium px-4 py-3">
                                                    {getCurrencySymbol(financialFilters.currency)}{office.totalAmount.toFixed(2)}
                                                </Table.Cell>
                                                <Table.Cell className="text-sm text-green-600 dark:text-green-400 font-medium px-4 py-3">
                                                    {getCurrencySymbol(financialFilters.currency)}{totalPaid.toFixed(2)}
                                                </Table.Cell>
                                                <Table.Cell className={`text-sm font-bold px-4 py-3 ${remaining <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {getCurrencySymbol(financialFilters.currency)}{remaining.toFixed(2)}
                                                </Table.Cell>
                                                <Table.Cell className="text-sm text-gray-600 dark:text-gray-400 px-4 py-3">
                                                    {office.voucherCount}
                                                </Table.Cell>
                                            </>
                                        );
                                    }}
                                    emptyMessage="No clients found"
                                    emptyIcon={() => (
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )}
                                />
                            )}
                        </CustomScrollbar>
                        </div>

                        {/* Mobile Cards View - same style as AttendancePanel */}
                        <div className="md:hidden">
                            {financialFilters.viewType === 'providers' ? (
                                <div className="sm:hidden space-y-5">
                                    {filteredFinancialData.length === 0 ? (
                                        <div className="text-center py-12">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No financial data found</p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No financial data found for the selected period</p>
                                        </div>
                                    ) : (
                                        filteredFinancialData.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                                style={{
                                                    animationDelay: `${index * 100}ms`
                                                }}
                                            >
                                                <div className="space-y-3">
                                                    {/* Header with Office and Total */}
                                                    <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                                                        <div>
                                                            <Link 
                                                                to={`/office/${encodeURIComponent(item.officeName)}`}
                                                                className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                                            >
                                                                {item.officeName}
                                                            </Link>
                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                                                                {item.monthName} {item.year}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                                {getCurrencySymbol(financialFilters.currency)}{item.total.toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-slate-300">
                                                                {item.voucherCount} vouchers
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Service Breakdown */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Hotels</div>
                                                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                {getCurrencySymbol(financialFilters.currency)}{item.hotels.toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-green-600 dark:text-green-400 mb-1">Transfers</div>
                                                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                                                {getCurrencySymbol(financialFilters.currency)}{item.transfers.toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Trips</div>
                                                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                                {getCurrencySymbol(financialFilters.currency)}{item.trips.toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">Flights</div>
                                                            <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                                                {getCurrencySymbol(financialFilters.currency)}{item.flights.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Remaining Amount */}
                                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                Remaining Amount
                                                            </div>
                                                            <div className={`text-sm font-bold ${calculateOfficeRemaining(item.officeName, item.total) <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {getCurrencySymbol(financialFilters.currency)}{calculateOfficeRemaining(item.officeName, item.total).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="sm:hidden space-y-5">
                                    {clientOfficeData.length === 0 ? (
                                        <div className="text-center py-12">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">No clients found</p>
                                        </div>
                                    ) : (
                                        clientOfficeData.map((office, index) => {
                                            const totalPaid = office.vouchers.reduce((sum, voucher) => {
                                                const voucherSpecificPayments = Object.values(officePayments).flat().filter(payment => {
                                                    const relatedVoucherId = payment.relatedVoucher?._id || payment.relatedVoucher;
                                                    return relatedVoucherId === voucher._id && payment.status === 'approved' && payment.type === 'INCOMING';
                                                });
                                                return sum + voucherSpecificPayments.reduce((paidSum, payment) => paidSum + payment.amount, 0);
                                            }, 0);
                                            
                                            const remaining = office.totalAmount - totalPaid;
                                            
                                            return (
                                                <div 
                                                    key={index} 
                                                    className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                                    style={{
                                                        animationDelay: `${index * 100}ms`
                                                    }}
                                                >
                                                    <div className="space-y-3">
                                                        {/* Header with Client and Total */}
                                                        <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <Link 
                                                                        to={office.isDirectClient ? `/client/${encodeURIComponent(office.officeName)}` : `/office/${encodeURIComponent(office.officeName)}`}
                                                                        className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                                                    >
                                                                        {office.officeName}
                                                                    </Link>
                                                                    {office.isDirectClient && (
                                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                                                            <FaUser className="w-2 h-2 mr-1" />
                                                                            Direct
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                                                                    {office.monthName} {office.year}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xs text-gray-600 dark:text-slate-300">
                                                                    {office.voucherCount} vouchers
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Payment Details */}
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Total Amount</div>
                                                                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                                    {getCurrencySymbol(financialFilters.currency)}{office.totalAmount.toFixed(2)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-green-600 dark:text-green-400 mb-1">Paid</div>
                                                                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                                                    {getCurrencySymbol(financialFilters.currency)}{totalPaid.toFixed(2)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-red-600 dark:text-red-400 mb-1">Remaining</div>
                                                                <div className={`text-sm font-bold ${remaining <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                    {getCurrencySymbol(financialFilters.currency)}{remaining.toFixed(2)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                        </>
                    )}

                                </Card>
                            )}

                            {/* Financial Floating Totals Panel */}
                            {activeTab === 'financials' && (isAdmin || isAccountant) && (
                                <FinancialFloatingTotalsPanel
                                    viewType={financialFilters.viewType}
                                    totals={financialTotals}
                                    clientOfficeData={clientOfficeData}
                                    currency={financialFilters.currency}
                                    getCurrencySymbol={getCurrencySymbol}
                                    totalClientRevenue={totalClientRevenue}
                                    totalSupplierRevenue={totalSupplierRevenue}
                                />
                            )}

                            {activeTab === 'debts' && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-950" id="debts-panel" role="tabpanel" aria-labelledby="tab-debts">
                                    <h2 className="text-xl md:text-2xl font-bold mb-1 dark:text-white mx-auto">Debt Management</h2>
                                    
                                    {/* Inner Tab Navigation */}
                                    <div className="mb-1">
                                        <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-t-lg overflow-hidden shadow-sm">
                                            <button 
                                                onClick={() => setDebtInnerTab('active')}
                                                className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                                                    debtInnerTab === 'active'
                                                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                                                }`}
                                            >
                                                <FaFileInvoiceDollar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Active Debts</span>
                                                <span className="sm:hidden">Active</span>
                                            </button>
                                            <button 
                                                onClick={() => setDebtInnerTab('archived')}
                                                className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                                                    debtInnerTab === 'archived'
                                                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                                                }`}
                                            >
                                                <FaArchive className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Archived Debts</span>
                                                <span className="sm:hidden">Archived</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Debts Tab Content */}
                                    {debtInnerTab === 'active' && (
                                        <div>
                                            {/* Add Debt Button - Only show for active debts */}
                                            <div className="flex justify-end mb-3">
                                                <CustomButton
                                                    variant="green"
                                                    onClick={() => openDebtModal()}
                                                    icon={HiPlus}
                                                    title="Add new debt record"
                                                >
                                                    Add Debt
                                                </CustomButton>
                                            </div>

                                            {/* Debt Filters */}
                                            <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-6">
                                        <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Debt Filters</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <div>
                                                <SearchableSelect
                                                    id="debt-office-filter"
                                                    label="Office"
                                                    value={debtFilters.office}
                                                    onChange={(e) => handleDebtFilterChange('office', e.target.value)}
                                                    options={[
                                                        { value: '', label: 'All Offices' },
                                                        ...getOfficesWithDebts()
                                                    ]}
                                                    placeholder="Search offices..."
                                                />
                                            </div>
                                            <div>
                                                <SearchableSelect
                                                    id="debt-status-filter"
                                                    label="Status"
                                                    value={debtFilters.status}
                                                    onChange={(e) => handleDebtFilterChange('status', e.target.value)}
                                                    options={[
                                                        { value: "", label: "All Status" },
                                                        { value: "OPEN", label: "Open" },
                                                        { value: "CLOSED", label: "Closed" }
                                                    ]}
                                                    placeholder="Select status..."
                                                />
                                            </div>
                                            <div>
                                                <SearchableSelect
                                                    id="debt-type-filter"
                                                    label="Type"
                                                    value={debtFilters.type}
                                                    onChange={(e) => handleDebtFilterChange('type', e.target.value)}
                                                    options={[
                                                        { value: "", label: "All Types" },
                                                        { value: "OWED_TO_OFFICE", label: "We Owe Them" },
                                                        { value: "OWED_FROM_OFFICE", label: "They Owe Us" }
                                                    ]}
                                                    placeholder="Select type..."
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <CustomButton
                                                    variant="red"
                                                    onClick={clearDebtFilters}
                                                    disabled={!hasDebtFiltersApplied()}
                                                    className="w-full h-[44px]"
                                                    title={hasDebtFiltersApplied() ? "Clear all debt filters" : "No filters to clear"}
                                                    icon={HiX}
                                                >
                                                    Clear Filters
                                                </CustomButton>
                                            </div>
                                            <div className="flex items-end">
                                                <CustomButton
                                                    variant="blue"
                                                    onClick={fetchDebts}
                                                    disabled={debtLoading}
                                                    className="w-full h-[44px]"
                                                    title="Refresh debt data"
                                                >
                                                    {debtLoading ? 'Loading...' : 'Refresh Debts'}
                                                </CustomButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block">
                                                        {debtLoading ? (
                        <div className="py-8">
                            <RahalatekLoader size="lg" />
                        </div>
                    ) : (
                        <CustomTable
                            headers={[
                                { label: 'Office', className: '' },
                                { label: 'Amount', className: '' },
                                { label: 'Type', className: '' },
                                { label: 'Description', className: '' },
                                { label: 'Status', className: '' },
                                { label: 'Due Date', className: '' },
                                { label: 'Created', className: '' },
                                { label: 'Created By', className: '' },
                                { label: 'Actions', className: '' }
                            ]}
                            data={debts.filter(debt => debt.status === 'OPEN')}
                            renderRow={(debt) => (
                                <>
                                    <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                        {debt.officeName}
                                    </Table.Cell>
                                    <Table.Cell className="text-sm px-4 py-3">
                                        <span className={`font-medium ${
                                            debt.type === 'OWED_TO_OFFICE' 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {getCurrencySymbol(debt.currency)}{debt.amount.toFixed(2)}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="text-sm px-4 py-3">
                                        <span 
                                            className={`
                                                inline-flex items-center justify-center rounded-lg 
                                                ${debt.type === 'OWED_TO_OFFICE' 
                                                    ? 'bg-red-500 text-white border border-red-600 shadow-md' 
                                                    : 'bg-green-500 text-white border border-green-600 shadow-md'
                                                }
                                                text-[11px] px-2 py-0.5 font-semibold
                                                transition-all duration-200 
                                                hover:scale-105 hover:shadow-lg
                                                min-w-16
                                            `}
                                        >
                                            {debt.type === 'OWED_TO_OFFICE' ? 'We Owe' : 'They Owe'}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3 max-w-[200px]">
                                        <div className="truncate" title={debt.description}>
                                            {debt.description || 'N/A'}
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell className="px-4 py-3">
                                        <span 
                                            className={`
                                                inline-flex items-center justify-center rounded-lg 
                                                ${debt.status === 'OPEN' 
                                                    ? 'bg-yellow-500 text-white border border-yellow-600 shadow-md' 
                                                    : 'bg-gray-500 text-white border border-gray-600 shadow-md'
                                                }
                                                text-[11px] px-2 py-0.5 font-semibold
                                                transition-all duration-200 
                                                hover:scale-105 hover:shadow-lg
                                                min-w-16
                                            `}
                                        >
                                            {debt.status}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                        {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'N/A'}
                                    </Table.Cell>
                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                        {new Date(debt.createdAt).toLocaleDateString()}
                                    </Table.Cell>
                                    <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                        {debt.createdBy?.username || 'Unknown'}
                                    </Table.Cell>
                                    <Table.Cell className="px-4 py-3">
                                        <div className="flex space-x-2">
                                            {debt.status === 'OPEN' && (
                                                <>
                                                    <CustomButton
                                                        variant="purple"
                                                        size="xs"
                                                        onClick={() => openDebtModal(debt)}
                                                        title="Edit debt"
                                                    >
                                                        Edit
                                                    </CustomButton>
                                                    <CustomButton
                                                        variant="green"
                                                        size="xs"
                                                        onClick={() => handleCloseDebt(debt._id)}
                                                        title="Mark as paid/closed"
                                                    >
                                                        Close
                                                    </CustomButton>
                                                </>
                                            )}
                                            {isAdmin && (
                                                <CustomButton
                                                    variant="red"
                                                    size="xs"
                                                    onClick={() => openDeleteDebtModal(debt)}
                                                    title="Delete debt"
                                                >
                                                    Delete
                                                </CustomButton>
                                            )}
                                        </div>
                                    </Table.Cell>
                                </>
                            )}
                            emptyMessage="No debts found"
                            emptyDescription="Create debt records to track financial obligations with offices."
                            emptyIcon={() => (
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                                                        )}
                        />
                    )}
                                    </div>

                                    {/* Mobile Cards View - Active Debts */}
                                    <div className="md:hidden">
                                        {debtLoading ? (
                                            <div className="py-8">
                                                <RahalatekLoader size="lg" />
                                            </div>
                                        ) : (
                                            <div className="sm:hidden space-y-5">
                                                {debts.filter(debt => debt.status === 'OPEN').length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <p className="text-gray-500 dark:text-gray-400 font-medium">No debts found</p>
                                                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create debt records to track financial obligations with offices.</p>
                                                    </div>
                                                ) : (
                                                    debts.filter(debt => debt.status === 'OPEN').map((debt, index) => (
                                                        <div 
                                                            key={debt._id} 
                                                            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                                            style={{
                                                                animationDelay: `${index * 100}ms`
                                                            }}
                                                        >
                                                            <div className="space-y-3">
                                                                {/* Header with Office and Amount */}
                                                                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                                                                    <div>
                                                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                                            {debt.officeName}
                                                                        </div>
                                                                        <div className="flex items-center space-x-2 mt-1">
                                                                            <span 
                                                                                className={`
                                                                                    inline-flex items-center justify-center rounded-lg 
                                                                                    ${debt.type === 'OWED_TO_OFFICE' 
                                                                                        ? 'bg-red-500 text-white border border-red-600 shadow-md' 
                                                                                        : 'bg-green-500 text-white border border-green-600 shadow-md'
                                                                                    }
                                                                                    text-[10px] px-1.5 py-0.5 font-semibold
                                                                                `}
                                                                            >
                                                                                {debt.type === 'OWED_TO_OFFICE' ? 'We Owe' : 'They Owe'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className={`text-lg font-bold ${
                                                                            debt.type === 'OWED_TO_OFFICE' 
                                                                                ? 'text-red-600 dark:text-red-400' 
                                                                                : 'text-green-600 dark:text-green-400'
                                                                        }`}>
                                                                            {getCurrencySymbol(debt.currency)}{debt.amount.toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Description and Dates */}
                                                                <div className="grid grid-cols-1 gap-3">
                                                                    <div>
                                                                        <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Description</div>
                                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                                            {debt.description || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Due Date</div>
                                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                                {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Created By</div>
                                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                                {debt.createdBy?.username || 'Unknown'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 justify-center">
                                                                    {debt.status === 'OPEN' && (
                                                                        <>
                                                                            <CustomButton
                                                                                variant="purple"
                                                                                size="xs"
                                                                                onClick={() => openDebtModal(debt)}
                                                                                title="Edit debt"
                                                                                className="text-xs"
                                                                            >
                                                                                Edit
                                                                            </CustomButton>
                                                                            <CustomButton
                                                                                variant="green"
                                                                                size="xs"
                                                                                onClick={() => handleCloseDebt(debt._id)}
                                                                                title="Mark as paid/closed"
                                                                                className="text-xs"
                                                                            >
                                                                                Close
                                                                            </CustomButton>
                                                                        </>
                                                                    )}
                                                                    {isAdmin && (
                                                                        <CustomButton
                                                                            variant="red"
                                                                            size="xs"
                                                                            onClick={() => openDeleteDebtModal(debt)}
                                                                            title="Delete debt"
                                                                            className="text-xs"
                                                                        >
                                                                            Delete
                                                                        </CustomButton>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>

                                        </div>
                                    )}

                                    {/* Archived Debts Tab Content */}
                                    {debtInnerTab === 'archived' && (
                                        <div>
                                            {/* Archived Debt Filters */}
                                            <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-6">
                                                <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">Archived Debt Filters</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                    <div>
                                                        <SearchableSelect
                                                            id="archived-debt-office-filter"
                                                            label="Office"
                                                            value={debtFilters.office}
                                                            onChange={(e) => handleDebtFilterChange('office', e.target.value)}
                                                            options={[
                                                                { value: '', label: 'All Offices' },
                                                                ...getOfficesWithDebts()
                                                            ]}
                                                            placeholder="Search offices..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <SearchableSelect
                                                            id="archived-debt-type-filter"
                                                            label="Type"
                                                            value={debtFilters.type}
                                                            onChange={(e) => handleDebtFilterChange('type', e.target.value)}
                                                            options={[
                                                                { value: "", label: "All Types" },
                                                                { value: "OWED_TO_OFFICE", label: "We Owe Them" },
                                                                { value: "OWED_FROM_OFFICE", label: "They Owe Us" }
                                                            ]}
                                                            placeholder="Select type..."
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <CustomButton
                                                            variant="red"
                                                            onClick={clearDebtFilters}
                                                            disabled={!hasDebtFiltersApplied()}
                                                            className="w-full h-[44px]"
                                                            title={hasDebtFiltersApplied() ? "Clear all debt filters" : "No filters to clear"}
                                                            icon={HiX}
                                                        >
                                                            Clear Filters
                                                        </CustomButton>
                                                    </div>
                                                    <div className="flex items-end">
                                                        <CustomButton
                                                            variant="blue"
                                                            onClick={fetchDebts}
                                                            disabled={debtLoading}
                                                            className="w-full h-[44px]"
                                                            title="Refresh debt data"
                                                            icon={HiRefresh}
                                                        >
                                                            {debtLoading ? 'Loading...' : 'Refresh Debts'}
                                                        </CustomButton>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desktop Table View - Archived */}
                                            <div className="hidden md:block">
                                            {debtLoading ? (
                                                <div className="py-8">
                                                    <RahalatekLoader size="lg" />
                                                </div>
                                            ) : (
                                                <CustomTable
                                                    headers={[
                                                        { label: 'Office', className: '' },
                                                        { label: 'Amount', className: '' },
                                                        { label: 'Type', className: '' },
                                                        { label: 'Status', className: '' },
                                                        { label: 'Description', className: '' },
                                                        { label: 'Due Date', className: '' },
                                                        { label: 'Closed Date', className: '' },
                                                        { label: 'Created By', className: '' },
                                                        { label: 'Actions', className: '' }
                                                    ]}
                                                    data={debts.filter(debt => debt.status === 'CLOSED')}
                                                    renderRow={(debt) => (
                                                        <>
                                                            <Table.Cell className="font-medium text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                {debt.officeName}
                                                            </Table.Cell>
                                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold">{debt.currency} {debt.amount.toLocaleString()}</span>
                                                                    {debt.amountInUSD && debt.currency !== 'USD' && (
                                                                        <span className="text-xs text-gray-500 dark:text-gray-400">≈ ${debt.amountInUSD.toLocaleString()}</span>
                                                                    )}
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                    debt.type === 'OWED_TO_OFFICE' 
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                }`}>
                                                                    {debt.type === 'OWED_TO_OFFICE' ? 'We Owe Them' : 'They Owe Us'}
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                                                    CLOSED
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3 max-w-xs">
                                                                <div className="truncate" title={debt.description}>
                                                                    {debt.description || 'No description'}
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'No due date'}
                                                            </Table.Cell>
                                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                <div className="text-green-600 dark:text-green-400 font-medium">
                                                                    {debt.closedDate ? new Date(debt.closedDate).toLocaleDateString() : 'N/A'}
                                                                </div>
                                                            </Table.Cell>
                                                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                                                {debt.createdBy?.username || 'Unknown'}
                                                            </Table.Cell>
                                                            <Table.Cell className="px-4 py-3">
                                                                <div className="flex space-x-2">
                                                                    {isAdmin && (
                                                                        <>
                                                                            <CustomButton
                                                                                variant="blue"
                                                                                size="xs"
                                                                                onClick={() => handleReopenDebt(debt._id)}
                                                                                title="Reopen debt"
                                                                            >
                                                                                Reopen
                                                                            </CustomButton>
                                                                            <CustomButton
                                                                                variant="red"
                                                                                size="xs"
                                                                                onClick={() => openDeleteDebtModal(debt)}
                                                                                title="Delete debt"
                                                                            >
                                                                                Delete
                                                                            </CustomButton>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </Table.Cell>
                                                        </>
                                                    )}
                                                    emptyMessage="No archived debts found"
                                                    emptyDescription="Closed debt records will appear here."
                                                    emptyIcon={() => (
                                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-9 4h4" />
                                                        </svg>
                                                    )}
                                                />
                                            )}
                                            </div>

                                            {/* Mobile Cards View - Archived Debts */}
                                            <div className="md:hidden">
                                                {debtLoading ? (
                                                    <div className="py-8">
                                                        <RahalatekLoader size="lg" />
                                                    </div>
                                                ) : (
                                                    <div className="sm:hidden space-y-5">
                                                        {debts.filter(debt => debt.status === 'CLOSED').length === 0 ? (
                                                            <div className="text-center py-12">
                                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h8a2 2 0 002-2V8m-9 4h4" />
                                                                </svg>
                                                                <p className="text-gray-500 dark:text-gray-400 font-medium">No archived debts found</p>
                                                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Closed debt records will appear here.</p>
                                                            </div>
                                                        ) : (
                                                            debts.filter(debt => debt.status === 'CLOSED').map((debt, index) => (
                                                                <div 
                                                                    key={debt._id} 
                                                                    className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                                                    style={{
                                                                        animationDelay: `${index * 100}ms`
                                                                    }}
                                                                >
                                                                    <div className="space-y-3">
                                                                        {/* Header with Office and Amount */}
                                                                        <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                                                                            <div>
                                                                                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                                                                    {debt.officeName}
                                                                                </div>
                                                                                <div className="flex items-center space-x-2 mt-1">
                                                                                    <span 
                                                                                        className={`
                                                                                            inline-flex items-center justify-center rounded-lg 
                                                                                            ${debt.type === 'OWED_TO_OFFICE' 
                                                                                                ? 'bg-red-500 text-white border border-red-600 shadow-md' 
                                                                                                : 'bg-green-500 text-white border border-green-600 shadow-md'
                                                                                            }
                                                                                            text-[10px] px-1.5 py-0.5 font-semibold
                                                                                        `}
                                                                                    >
                                                                                        {debt.type === 'OWED_TO_OFFICE' ? 'We Owe' : 'They Owe'}
                                                                                    </span>
                                                                                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-500 text-white border border-gray-600 shadow-md text-[10px] px-1.5 py-0.5 font-semibold">
                                                                                        CLOSED
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className={`text-lg font-bold ${
                                                                                    debt.type === 'OWED_TO_OFFICE' 
                                                                                        ? 'text-red-600 dark:text-red-400' 
                                                                                        : 'text-green-600 dark:text-green-400'
                                                                                }`}>
                                                                                    {getCurrencySymbol(debt.currency)}{debt.amount.toFixed(2)}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Description and Dates */}
                                                                        <div className="grid grid-cols-1 gap-3">
                                                                            <div>
                                                                                <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Description</div>
                                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                                    {debt.description || 'N/A'}
                                                                                </div>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div>
                                                                                    <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Due Date</div>
                                                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                                                        {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : 'N/A'}
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Closed Date</div>
                                                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                                                        {debt.closedAt ? new Date(debt.closedAt).toLocaleDateString() : 'N/A'}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Created By</div>
                                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                                    {debt.createdBy?.username || 'Unknown'}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Action Buttons */}
                                                                        {isAdmin && (
                                                                            <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 justify-center">
                                                                                <CustomButton
                                                                                    variant="red"
                                                                                    size="xs"
                                                                                    onClick={() => openDeleteDebtModal(debt)}
                                                                                    title="Delete debt"
                                                                                    className="text-xs"
                                                                                >
                                                                                    Delete
                                                                                </CustomButton>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )}

                            {activeTab === 'users' && (isAdmin || isAccountant) && (
                                <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                    <Users />
                                </Suspense>
                            )}

                            {(activeTab === 'salaries') && (isAdmin || isAccountant) && (
                                <Card className="w-full dark:bg-slate-950" id="salaries-panel" role="tabpanel" aria-labelledby="tab-salaries">
                                    <h2 className="text-2xl font-bold mb-4 dark:text-white mx-auto">Salaries & Bonuses</h2>
                                    
                                    {/* Inner Tab Navigation - Always visible */}
                                    <div className="mb-6">
                                        <div className="flex border-b border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-t-lg overflow-hidden shadow-sm">
                                            <button 
                                                onClick={() => setSalaryInnerTab('salaries')}
                                                className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                                                    salaryInnerTab === 'salaries'
                                                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                                                }`}
                                            >
                                                <FaCoins className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Salaries Overview</span>
                                                <span className="sm:hidden">Salaries</span>
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSalaryInnerTab('salary'); // Default to salary management when switching to settings
                                                }}
                                                className={`flex-1 px-1 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 ${
                                                    salaryInnerTab === 'salary' || salaryInnerTab === 'bonus'
                                                        ? 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-md text-blue-600 dark:text-teal-400 border-b-2 border-blue-500 dark:border-teal-500 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:backdrop-blur-sm'
                                                }`}
                                            >
                                                <FaCog className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="hidden sm:inline">Salary Management</span>
                                                <span className="sm:hidden">Settings</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Salaries Cards View */}
                                    {salaryInnerTab === 'salaries' && (
                                        <div>
                                            {/* Year and Month Filters */}
                                            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
                                                    <div>
                                                        <Label value="Year" className="mb-2" />
                                                        <CustomSelect
                                                            value={salaryCardsYear}
                                                            onChange={(value) => setSalaryCardsYear(parseInt(value))}
                                                            options={availableSalaryYears.length > 0 ? availableSalaryYears.map(year => ({
                                                                value: year,
                                                                label: year.toString()
                                                            })) : [{ value: new Date().getFullYear(), label: new Date().getFullYear().toString() }]}
                                                            placeholder="Select year..."
                                                            disabled={salaryCardsLoading}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label value="Month" className="mb-2" />
                                                        <CustomSelect
                                                            value={salaryCardsMonth}
                                                            onChange={(value) => setSalaryCardsMonth(value)}
                                                            options={[
                                                                { value: 'all', label: 'All Months' },
                                                                ...availableSalaryMonths.map(month => ({
                                                                    value: month.toString(),
                                                                    label: new Date(2024, month).toLocaleDateString('en-US', { month: 'long' })
                                                                }))
                                                            ]}
                                                            placeholder="Select month..."
                                                            disabled={salaryCardsLoading}
                                                        />
                                                    </div>
                                                </div>
                                                <CustomButton
                                                    variant="orange"
                                                    size="sm"
                                                    onClick={() => {
                                                        // Force refresh by clearing state first
                                                        setAllUsersSalaryData([]);
                                                        setAvailableSalaryYears([]);
                                                        setAvailableSalaryMonths([]);
                                                        
                                                        // Then reload everything
                                                        loadAvailableSalaryOptions().then(() => {
                                                            loadAllUsersSalaryData();
                                                        });
                                                    }}
                                                    icon={HiRefresh}
                                                    disabled={salaryCardsLoading}
                                                >
                                                    Refresh Data
                                                </CustomButton>
                                            </div>

                                            {/* Loading State */}
                                            {salaryCardsLoading && (
                                                <div className="flex justify-center py-8">
                                                    <RahalatekLoader size="md" />
                                                </div>
                                            )}

                                            {/* Salary Cards */}
                                            {!salaryCardsLoading && allUsersSalaryData.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <FaCoins className="w-5 h-5 mr-2 text-blue-800 dark:text-teal-400" />
                                                            Salary Overview ({salaryCardsYear})
                                                            {salaryCardsMonth !== 'all' && (
                                                                <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                                                                    - {new Date(2024, parseInt(salaryCardsMonth)).toLocaleDateString('en-US', { month: 'long' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                                                            {allUsersSalaryData.length} employees
                                                        </span>
                                                    </h4>
                                                    
                                                    <style>
                                                        {`
                                                            @keyframes progressScale {
                                                                from {
                                                                    transform: scaleX(0);
                                                                }
                                                                to {
                                                                    transform: scaleX(1);
                                                                }
                                                            }
                                                        `}
                                                    </style>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                                                        {allUsersSalaryData.map((userData, index) => {
                                                            const totalCompensation = userData.salary + userData.totalBonus;
                                                            const bonusPercentage = userData.salary > 0 ? (userData.totalBonus / userData.salary) * 100 : 0;
                                                            
                                                            return (
                                                                <div 
                                                                    key={userData.userId} 
                                                                    className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                                                    style={{
                                                                        animationDelay: `${index * 100}ms`
                                                                    }}
                                                                >
                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <div className="flex items-center">
                                                                            <h5 className="font-semibold text-gray-900 dark:text-white mr-2">
                                                                                {userData.username}
                                                                            </h5>
                                                                            <UserBadge user={userData} size="sm" />
                                                                        </div>
                                                                        
                                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                            userData.salary > 0 
                                                                                ? 'bg-green-500 text-white'
                                                                                : 'bg-gray-500 text-white'
                                                                        }`}>
                                                                            {userData.currency}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="text-gray-600 dark:text-slate-300">Base Salary:</span>
                                                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                                                {getCurrencySymbol(userData.currency)}{userData.salary.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {userData.totalBonus > 0 && (
                                                                            <div className="flex justify-between text-sm">
                                                                                <span className="text-gray-600 dark:text-slate-300">Bonuses:</span>
                                                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                                                    +{getCurrencySymbol(userData.currency)}{userData.totalBonus.toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                                                                            <span className="text-gray-900 dark:text-white">Total:</span>
                                                                            <span className="text-blue-600 dark:text-teal-400">
                                                                                {getCurrencySymbol(userData.currency)}{totalCompensation.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {userData.totalBonus > 0 && (
                                                                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                                                <div 
                                                                                    className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-400 to-green-600"
                                                                                    style={{ 
                                                                                        width: `${Math.min(bonusPercentage, 100)}%`,
                                                                                        transform: `scaleX(0)`,
                                                                                        transformOrigin: 'left',
                                                                                        animation: `progressScale 0.6s ease-out ${index * 150}ms forwards`
                                                                                    }}
                                                                                ></div>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {userData.totalBonus > 0 && (
                                                                            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                                                                                Bonus: {bonusPercentage.toFixed(1)}% of base salary
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Individual Bonuses List */}
                                                                    {userData.bonuses.length > 0 && (
                                                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                                                                            <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Bonus Details:</h6>
                                                                            <div className="space-y-1">
                                                                                {userData.bonuses.map((bonus, bonusIndex) => (
                                                                                    <div key={bonusIndex} className="flex justify-between text-xs">
                                                                                        <span className="text-gray-600 dark:text-gray-400">
                                                                                            {new Date(bonus.year, bonus.month, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                                                        </span>
                                                                                        <span className="font-medium text-green-600 dark:text-green-400">
                                                                                            +{getCurrencySymbol(bonus.currency)}{bonus.amount.toFixed(2)}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {!salaryCardsLoading && allUsersSalaryData.length === 0 && (
                                                <div className="text-center py-12">
                                                    <FaCoins className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Salary Data</h4>
                                                    <p className="text-gray-500 dark:text-gray-400">Salary information will appear here once configured for employees.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Settings Tab Content */}
                                    {(salaryInnerTab === 'salary' || salaryInnerTab === 'bonus') && (
                                        <div>
                                            {/* User Selection */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                <div>
                                                    <Label value="Select User" className="mb-2" />
                                                    <SearchableSelect
                                                        id="salaryUserSelect"
                                                        value={selectedUserForSalary}
                                                        onChange={async (val) => { 
                                                            const v = val?.target?.value ?? val; 
                                                            const selected = users.find(u => u._id === v); 
                                                            if (isAccountant && !isAdmin && selected?.isAdmin) { 
                                                                toast.error('Accountants cannot manage admin salaries', {
                                                                    duration: 3000,
                                                                    style: {
                                                                        background: '#f44336',
                                                                        color: '#fff',
                                                                        fontWeight: '500'
                                                                    }
                                                                }); 
                                                                setSelectedUserForSalary(''); 
                                                                return; 
                                                            } 
                                                            setSelectedUserForSalary(v); 
                                                            if (v) { 
                                                                // Reset month selections when switching users
                                                                setSelectedMonthToEdit('');
                                                                setSelectedBonusMonthToEdit('');
                                                                
                                                                // Load data in parallel
                                                                await Promise.all([
                                                                    handleLoadUserSalary(v),
                                                                    handleLoadUserBonuses(v), 
                                                                    handleLoadUserSalaryBaseEntries(v, true) // Auto-select current month on initial load
                                                                ]);
                                                            } 
                                                        }}
                                                        options={(isAccountant && !isAdmin ? users.filter(u => !u.isAdmin) : users).map(u => ({ value: u._id, label: u.username }))}
                                                        placeholder="Search user..."
                                                        clearable
                                                    />
                                                </div>
                                            </div>

                                            {/* Settings Inner Tab Navigation */}
                                            {selectedUserForSalary && (
                                                <div className="mb-6">
                                                    <div className="border-b border-gray-200 dark:border-gray-700">
                                                        <nav className="-mb-px flex space-x-8">
                                                            <button
                                                                onClick={() => setSalaryInnerTab('salary')}
                                                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                                                    salaryInnerTab === 'salary'
                                                                        ? 'border-blue-500 dark:border-teal-500 text-blue-600 dark:text-teal-400'
                                                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                                                }`}
                                                            >
                                                                <FaCog className="w-4 h-4 inline-block mr-2" />
                                                                Salary Management
                                                            </button>
                                                            <button
                                                                onClick={() => setSalaryInnerTab('bonus')}
                                                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                                                    salaryInnerTab === 'bonus'
                                                                        ? 'border-blue-500 dark:border-teal-500 text-blue-600 dark:text-teal-400'
                                                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                                                }`}
                                                            >
                                                                <FaGift className="w-4 h-4 inline-block mr-2" />
                                                                Bonus Management
                                                            </button>
                                                        </nav>
                                                    </div>
                                                </div>
                                            )}

                                    {/* Salary Tab Content */}
                                    {selectedUserForSalary && salaryInnerTab === 'salary' && (
                                        <div>
                                            {/* Month Filter Section */}
                                            {(isAdmin || isAccountant) && salaryBaseEntries && salaryBaseEntries.length > 0 && (
                                                <div className="mb-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <Label value="Select Month to Edit" className="mb-2" />
                                                            <SearchableSelect
                                                                value={selectedMonthToEdit}
                                                                onChange={(val) => {
                                                                    const value = val?.target?.value ?? val;
                                                                    handleMonthSelection(value);
                                                                }}
                                                                options={getMonthOptions()}
                                                                placeholder="Select a month to edit..."
                                                                clearable
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Current Salary Management */}
                                            <div className="mt-4">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Salary</h3>
                                        
                                        {/* Scheduled Raise Notification */}
                                        {(() => {
                                            const raiseInfo = getScheduledRaiseInfoAdmin();
                                            if (raiseInfo) {
                                                return (
                                                    <div className="mb-4 relative">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                                    Scheduled salary {raiseInfo.isIncrease ? 'increase' : 'decrease'}: {raiseInfo.isIncrease ? '+' : ''}{raiseInfo.amount.toFixed(2)} {raiseInfo.currency} effective {raiseInfo.date}
                                                                </div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                    Current: {(raiseInfo.newTotal - raiseInfo.amount).toFixed(2)} {raiseInfo.currency} → New: <span className={`${raiseInfo.isIncrease ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} font-medium`}>{raiseInfo.newTotal.toFixed(2)} {raiseInfo.currency}</span>
                                                                </div>
                                                                {raiseInfo.note && (
                                                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                                                                        Note: {raiseInfo.note}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <CustomButton
                                                                onClick={async () => {
                                                                    if (!selectedUserForSalary) return;
                                                                    
                                                                    try {
                                                                        setSalaryTabLoading(true);
                                                                        
                                                                        // Delete the scheduled salary entry
                                                                        const now = new Date();
                                                                        const nextMonth = now.getMonth() + 1;
                                                                        const nextYear = now.getFullYear() + Math.floor(nextMonth / 12);
                                                                        const nextMonthIndex = nextMonth % 12;
                                                                        
                                                                        await axios.delete(`/api/profile/${selectedUserForSalary}/salary/base`, {
                                                                            data: { year: nextYear, month: nextMonthIndex },
                                                                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                                                        });
                                                                        
                                                                        // Refresh user data and salary entries
                                                                        const userResponse = await axios.get(`/api/profile/${selectedUserForSalary}`, {
                                                                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                                                        });
                                                                        setSelectedUserData(userResponse.data);
                                                                        await handleLoadUserSalaryBaseEntries(selectedUserForSalary, false);
                                                                        
                                                                        toast.success('Scheduled salary change removed', {
                                                                            duration: 3000,
                                                                            style: {
                                                                                background: '#4CAF50',
                                                                                color: '#fff',
                                                                                fontWeight: '500'
                                                                            }
                                                                        });
                                                                    } catch (error) {
                                                                        console.error('Error removing scheduled salary:', error);
                                                                        toast.error('Failed to remove scheduled salary change', {
                                                                            duration: 3000,
                                                                            style: {
                                                                                background: '#f44336',
                                                                                color: '#fff',
                                                                                fontWeight: '500'
                                                                            }
                                                                        });
                                                                    } finally {
                                                                        setSalaryTabLoading(false);
                                                                    }
                                                                }}
                                                                variant="red"
                                                                size="sm"
                                                                disabled={salaryTabLoading}
                                                                className="ml-2"
                                                            >
                                                                Remove Scheduled Salary {raiseInfo.isIncrease ? 'Increase' : 'Decrease'}
                                                            </CustomButton>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <Label value="Amount" className="mb-2" />
                                                <TextInput
                                                    value={salaryForm.salaryAmount}
                                                    onChange={(e) => setSalaryForm({ ...salaryForm, salaryAmount: e.target.value })}
                                                    placeholder="0.00"
                                                    disabled={!selectedUserForSalary}
                                                />
                                                
                                                {/* Show current salary when checkbox is enabled */}
                                                {updateFromNextCycleAdmin && selectedUserData && salaryForm.salaryAmount && (
                                                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                                        Current: {(() => {
                                                            // Get the actual current salary (same logic as Recent Salaries table)
                                                            const now = new Date();
                                                            const currentYear = now.getFullYear();
                                                            const currentMonth = now.getMonth();
                                                            
                                                            // Find the most recent salary entry for current month or earlier
                                                            const currentSalaryEntry = (salaryBaseEntries || [])
                                                                .filter(entry => {
                                                                    return entry.year < currentYear || (entry.year === currentYear && entry.month <= currentMonth);
                                                                })
                                                                .sort((a, b) => (b.year - a.year) || (b.month - a.month))[0];
                                                            
                                                            const currentSalary = currentSalaryEntry ? currentSalaryEntry.amount.toFixed(2) : (selectedUserData.salaryAmount || 0).toFixed(2);
                                                            const currency = currentSalaryEntry ? currentSalaryEntry.currency : (selectedUserData.salaryCurrency || 'USD');
                                                            const newSalary = (parseFloat(salaryForm.salaryAmount) || 0).toFixed(2);
                                                            
                                                            return `${currentSalary} → ${newSalary} ${currency}`;
                                                        })()}
                                                    </div>
                                                )}
                                                
                                                {/* Next Cycle Checkbox - Only show when editing current month */}
                                                {isCurrentMonth(selectedMonthToEdit) && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="updateFromNextCycleAdmin"
                                                                checked={updateFromNextCycleAdmin}
                                                                onChange={(e) => setUpdateFromNextCycleAdmin(e.target.checked)}
                                                                disabled={!selectedUserForSalary}
                                                            />
                                                            <label htmlFor="updateFromNextCycleAdmin" className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                                                Update from next cycle {salaryForm.salaryDayOfMonth ? `(${(() => {
                                                                    const day = parseInt(salaryForm.salaryDayOfMonth, 10);
                                                                    if (!day || day < 1 || day > 31) return '';
                                                                    const now = new Date();
                                                                    const nextMonth = now.getMonth() + 1;
                                                                    const year = now.getFullYear() + Math.floor(nextMonth / 12);
                                                                    const month = nextMonth % 12;
                                                                    const clampedDay = Math.min(day, new Date(year, month + 1, 0).getDate());
                                                                    const nextDate = new Date(year, month, clampedDay);
                                                                    const dd = String(nextDate.getDate()).padStart(2, '0');
                                                                    const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
                                                                    const yyyy = nextDate.getFullYear();
                                                                    return `${dd}/${mm}/${yyyy}`;
                                                                })()})` : ''}
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <Label value="Currency" className="mb-2" />
                                                <CustomSelect
                                                    id="salaryCurrencyAdmin"
                                                    value={salaryForm.salaryCurrency}
                                                    onChange={(val) => setSalaryForm({ ...salaryForm, salaryCurrency: val })}
                                                    options={[{ value: 'USD', label: 'USD' },{ value: 'EUR', label: 'EUR' },{ value: 'TRY', label: 'TRY' }]}
                                                    disabled={!selectedUserForSalary}
                                                />
                                            </div>
                                            <div>
                                                <Label value="Salary Day" className="mb-2" />
                                                <CustomSelect
                                                    id="salaryDayAdmin"
                                                    value={salaryForm.salaryDayOfMonth}
                                                    onChange={(val) => setSalaryForm({ ...salaryForm, salaryDayOfMonth: val })}
                                                    options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                                                    placeholder="Day (1-31)"
                                                    disabled={!selectedUserForSalary}
                                                />
                                            </div>
                                            <div>
                                                <Label value="Next Salary" className="mb-2" />
                                                <div className="h-[42px] flex items-center px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {salaryForm.salaryDayOfMonth ? (() => { const now=new Date(); const nm=now.getMonth()+1; const y=now.getFullYear()+Math.floor(nm/12); const m=nm%12; const dim=new Date(y,m+1,0).getDate(); const dd=String(Math.min(parseInt(salaryForm.salaryDayOfMonth,10)||1,dim)).padStart(2,'0'); const mm=String(m+1).padStart(2,'0'); return `${dd}/${mm}/${y}`; })() : '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Label value="Notes" className="mb-2" />
                                            <TextInput
                                                value={salaryForm.salaryNotes}
                                                onChange={(e) => setSalaryForm({ ...salaryForm, salaryNotes: e.target.value })}
                                                placeholder="Optional notes"
                                                disabled={!selectedUserForSalary}
                                            />
                                        </div>

                                        <div className="flex justify-end mt-4">
                                            <CustomButton
                                                onClick={async () => {
                                                    if (!selectedUserForSalary) return;
                                                    
                                                    try {
                                                        setSalaryTabLoading(true);
                                                        
                                                        // If next cycle is checked, always use normal salary update
                                                        if (updateFromNextCycleAdmin) {
                                                            const payload = {
                                                                salaryAmount: parseFloat(salaryForm.salaryAmount) || 0,
                                                                salaryCurrency: salaryForm.salaryCurrency,
                                                                salaryDayOfMonth: parseInt(salaryForm.salaryDayOfMonth,10) || undefined,
                                                                salaryNotes: salaryForm.salaryNotes || '',
                                                                updateFromNextCycle: updateFromNextCycleAdmin
                                                            };
                                                            await updateUserSalary(selectedUserForSalary, payload);
                                                        } else if (selectedMonthToEdit) {
                                                            // If editing a specific month, try to edit first (with currency), then create if needed
                                                            const [year, month] = selectedMonthToEdit.split('-').map(Number);
                                                            
                                                            try {
                                                                // First try to edit existing entry (supports currency changes)
                                                                await editMonthSalary(selectedUserForSalary, {
                                                                    year,
                                                                    month,
                                                                    amount: parseFloat(salaryForm.salaryAmount) || 0,
                                                                    currency: salaryForm.salaryCurrency,
                                                                    note: salaryForm.salaryNotes || ''
                                                                });
                                                            } catch (editError) {
                                                                // If edit fails (entry doesn't exist), create new entry
                                                                if (editError.response?.status === 404) {
                                                                    await saveMonthlyBaseSalary(selectedUserForSalary, {
                                                                        year,
                                                                        month,
                                                                        amount: parseFloat(salaryForm.salaryAmount) || 0,
                                                                        note: salaryForm.salaryNotes || '',
                                                                        currency: salaryForm.salaryCurrency
                                                                    });
                                                                } else {
                                                                    throw editError; // Re-throw if it's not a 404 error
                                                                }
                                                            }
                                                        } else {
                                                            // Normal salary update for current month
                                                            const payload = {
                                                                salaryAmount: parseFloat(salaryForm.salaryAmount) || 0,
                                                                salaryCurrency: salaryForm.salaryCurrency,
                                                                salaryDayOfMonth: parseInt(salaryForm.salaryDayOfMonth,10) || undefined,
                                                                salaryNotes: salaryForm.salaryNotes || '',
                                                                updateFromNextCycle: false
                                                            };
                                                            await updateUserSalary(selectedUserForSalary, payload);
                                                        }
                                                        
                                                        // Refresh user data to update raise notification
                                                        try {
                                                            const userResponse = await axios.get(`/api/profile/${selectedUserForSalary}`, {
                                                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                                            });
                                                            setSelectedUserData(userResponse.data);
                                                        } catch (err) {
                                                            console.error('Failed to refresh user data:', err);
                                                        }
                                                        
                                                        // Refresh salary base entries to update Recent Salaries table
                                                        await handleLoadUserSalaryBaseEntries(selectedUserForSalary, false); // Don't auto-select month after save
                                                        
                                                        // Refresh salary form data to show updated values
                                                        await handleLoadUserSalary(selectedUserForSalary);
                                                        
                                                        toast.success('Salary updated', {
                                                            duration: 3000,
                                                            style: {
                                                                background: '#4CAF50',
                                                                color: '#fff',
                                                                fontWeight: '500'
                                                            }
                                                        });
                                                    } catch (e) {
                                                        console.error(e);
                                                        toast.error('Failed to update salary', {
                                                            duration: 3000,
                                                            style: {
                                                                background: '#f44336',
                                                                color: '#fff',
                                                                fontWeight: '500'
                                                            }
                                                        });
                                                    } finally {
                                                        setSalaryTabLoading(false);
                                                    }
                                                }}
                                                disabled={!selectedUserForSalary || salaryTabLoading}
                                            >
                                                {selectedMonthToEdit ? `Save ${getMonthOptions().find(opt => opt.value === selectedMonthToEdit)?.label || 'Month'} Salary` : 'Save Salary'}
                                            </CustomButton>
                                        </div>
                                    </div>

                                    {/* Recent Salaries Table */}
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold dark:text-white mb-3">Recent Salaries</h3>
                                        <CustomTable
                                            headers={[
                                                { label: 'Month', className: '' },
                                                { label: 'Amount', className: '' },
                                                { label: 'Currency', className: '' },
                                                { label: 'Note', className: '' },
                                                ...((isAdmin || isAccountant) ? [{ label: 'DELETE', className: 'text-center' }] : [])
                                            ]}
                                            data={(salaryBaseEntries || [])
                                                .filter(entry => {
                                                    const now = new Date();
                                                    const currentYear = now.getFullYear();
                                                    const currentMonth = now.getMonth();
                                                    // Only show entries for current month or earlier
                                                    return entry.year < currentYear || (entry.year === currentYear && entry.month <= currentMonth);
                                                })
                                                .slice().sort((a,b)=> (b.year - a.year) || (b.month - a.month))}
                                            renderRow={(entry) => (
                                                <>
                                                    <Table.Cell className="text-sm text-gray-800 dark:text-gray-100 px-4 py-3">
                                                        {new Date(entry.year, entry.month, 1).toLocaleString(undefined,{ month:'long', year:'numeric' })}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-sm text-gray-800 dark:text-gray-100 px-4 py-3">
                                                        {editingAmount === `${entry.year}-${entry.month}` ? (
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="number"
                                                                    value={editAmount}
                                                                    onChange={(e) => setEditAmount(e.target.value)}
                                                                    className="w-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    step="0.01"
                                                                    min="0"
                                                                    disabled={saveAmountLoading}
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveAmount(entry)}
                                                                    disabled={saveAmountLoading}
                                                                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                                                    title="Save"
                                                                >
                                                                    <FaCheck className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    disabled={saveAmountLoading}
                                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                                    title="Cancel"
                                                                >
                                                                    <FaTimes className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2">
                                                                <span>{entry.amount}</span>
                                                                <button
                                                                    onClick={() => handleEditAmount(entry)}
                                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Edit amount"
                                                                >
                                                                    <FaEdit className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-sm text-gray-800 dark:text-gray-100 px-4 py-3">
                                                        {entry.currency}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-sm text-gray-600 dark:text-gray-300 px-4 py-3">
                                                        {entry.note || '-'}
                                                    </Table.Cell>
                                                    {(isAdmin || isAccountant) && (
                                                        <Table.Cell className="px-4 py-3 text-center align-middle">
                                                            <div className="flex justify-center items-center h-full">
                                                                <CustomButton
                                                                    variant="red"
                                                                    size="sm"
                                                                    onClick={() => openSalaryDeleteConfirmation(entry)}
                                                                    title="Delete salary entry"
                                                                    disabled={salaryTabLoading}
                                                                    icon={HiTrash}
                                                                />
                                                            </div>
                                                        </Table.Cell>
                                                    )}
                                                </>
                                            )}
                                            emptyMessage="No salary history recorded"
                                        />
                                    </div>
                                        </div>
                                    )}

                                    {/* Bonus Tab Content */}
                                    {selectedUserForSalary && salaryInnerTab === 'bonus' && (
                                        <div>
                                            {/* Bonus Month Filter Section */}
                                            {(isAdmin || isAccountant) && salaryBaseEntries && salaryBaseEntries.length > 0 && (
                                                <div className="mb-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <Label value="Select Month to Edit" className="mb-2" />
                                                            <SearchableSelect
                                                                value={selectedBonusMonthToEdit}
                                                                onChange={(val) => {
                                                                    const value = val?.target?.value ?? val;
                                                                    handleBonusMonthSelection(value);
                                                                }}
                                                                options={getMonthOptions()}
                                                                placeholder="Select a month to edit..."
                                                                clearable
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Bonus editor */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                        <div>
                                            <Label value="Bonus Amount" className="mb-2" />
                                            <TextInput
                                                value={bonusForm.amount}
                                                onChange={(e) => setBonusForm({ ...bonusForm, amount: e.target.value })}
                                                placeholder="0.00"
                                                disabled={!selectedUserForSalary}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Label value="Bonus Note (optional)" className="mb-2" />
                                        <TextInput
                                            value={bonusForm.note}
                                            onChange={(e) => setBonusForm({ ...bonusForm, note: e.target.value })}
                                            placeholder="e.g., Outstanding performance in previous cycle"
                                            disabled={!selectedUserForSalary}
                                        />
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <CustomButton onClick={handleGrantBonus} disabled={!selectedUserForSalary || salaryTabLoading}>
                                            {selectedBonusMonthToEdit ? `Save ${getMonthOptions().find(opt => opt.value === selectedBonusMonthToEdit)?.label || 'Month'} Bonus` : 'Save Bonus for Previous Cycle'}
                                        </CustomButton>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold dark:text-white mb-3">Recent Bonuses</h3>
                                        <CustomTable
                                            headers={[
                                                { label: 'Month', className: '' },
                                                { label: 'Amount', className: '' },
                                                { label: 'Currency', className: '' },
                                                { label: 'Note', className: '' },
                                                ...((isAdmin || isAccountant) ? [{ label: 'DELETE', className: 'text-center' }] : [])
                                            ]}
                                            data={(bonuses || [])
                                                .filter(bonus => {
                                                    const now = new Date();
                                                    const currentYear = now.getFullYear();
                                                    const currentMonth = now.getMonth();
                                                    // Only show entries for current month or earlier
                                                    return bonus.year < currentYear || (bonus.year === currentYear && bonus.month <= currentMonth);
                                                })
                                                .slice().sort((a,b)=> (b.year - a.year) || (b.month - a.month))}
                                            renderRow={(bonus) => (
                                                <>
                                                    <Table.Cell className="text-sm text-gray-800 dark:text-gray-100 px-4 py-3">
                                                        {new Date(bonus.year, bonus.month, 1).toLocaleString(undefined,{ month:'long', year:'numeric' })}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-sm text-gray-800 dark:text-gray-100 px-4 py-3">
                                                        {editingBonusAmount === `${bonus.year}-${bonus.month}` ? (
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="number"
                                                                    value={editBonusAmount}
                                                                    onChange={(e) => setEditBonusAmount(e.target.value)}
                                                                    className="w-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 shadow-sm hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-md transition-colors duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    step="0.01"
                                                                    min="0"
                                                                    disabled={saveBonusAmountLoading}
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveBonusAmount(bonus)}
                                                                    disabled={saveBonusAmountLoading}
                                                                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                                                    title="Save"
                                                                >
                                                                    <FaCheck className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelBonusEdit}
                                                                    disabled={saveBonusAmountLoading}
                                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                                    title="Cancel"
                                                                >
                                                                    <FaTimes className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2">
                                                                <span>{bonus.amount}</span>
                                                                <button
                                                                    onClick={() => handleEditBonusAmount(bonus)}
                                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Edit amount"
                                                                >
                                                                    <FaEdit className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-sm text-gray-800 dark:text-gray-100 px-4 py-3">
                                                        {bonus.currency}
                                                    </Table.Cell>
                                                    <Table.Cell className="text-sm text-gray-600 dark:text-gray-300 px-4 py-3">
                                                        {bonus.note || '-'}
                                                    </Table.Cell>
                                                    {(isAdmin || isAccountant) && (
                                                        <Table.Cell className="px-4 py-3 text-center align-middle">
                                                            <div className="flex justify-center items-center h-full">
                                                                <CustomButton
                                                                    variant="red"
                                                                    size="sm"
                                                                    onClick={() => openBonusDeleteConfirmation(bonus)}
                                                                    title="Delete bonus entry"
                                                                    disabled={salaryTabLoading}
                                                                    icon={HiTrash}
                                                                />
                                                            </div>
                                                        </Table.Cell>
                                                    )}
                                                </>
                                            )}
                                            emptyMessage="No bonuses recorded"
                                        />
                                    </div>
                                        </div>
                                    )}


                                        </div>
                                    )}
                                </Card>
                            )}
                            
                            {activeTab === 'requests' && isAdmin && (
                                <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                    <UserRequests />
                                </Suspense>
                            )}
                            
                            {/* Attendance Panel */}
                            {activeTab === 'attendance' && (isAdmin || isAccountant) && (
                                <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                    <AttendancePanel />
                                </Suspense>
                            )}
                            
                            {/* Notifications Panel */}
                            {activeTab === 'notifications' && (
                                <Card className="w-full dark:bg-slate-950" id="notifications-panel" role="tabpanel" aria-labelledby="tab-notifications">
                                    <h2 className="text-2xl font-bold mb-6 dark:text-white text-center flex items-center justify-center">
                                        <FaBell className="mr-3 text-teal-600 dark:text-teal-400" />
                                        Notification Management
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        {/* System Tools - Admin Only */}
                                        {isAdmin && (
                                            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 sm:p-6 rounded-lg border border-teal-200 dark:border-teal-700">
                                                <h3 className="text-lg font-semibold mb-4 text-teal-800 dark:text-teal-300">
                                                    System Tools
                                                </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Arrival Reminders
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Generate notifications for vouchers with clients arriving tomorrow.
                                                    </p>
                                                    <CustomButton
                                                        variant="teal"
                                                        onClick={handleGenerateArrivalReminders}
                                                        disabled={notificationLoading}
                                                        title="Generate arrival reminder notifications"
                                                        icon={notificationLoading ? null : FaBell}
                                                    >
                                                        {notificationLoading ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="hidden sm:inline">Generate Arrival Reminders</span>
                                                                <span className="sm:hidden">Arrival Reminders</span>
                                                            </>
                                                        )}
                                                    </CustomButton>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Departure Reminders
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Generate notifications for vouchers with clients departing tomorrow.
                                                    </p>
                                                    <CustomButton
                                                        variant="blue"
                                                        onClick={handleGenerateDepartureReminders}
                                                        disabled={notificationLoading}
                                                        title="Generate departure reminder notifications"
                                                        icon={notificationLoading ? null : FaPlaneDeparture}
                                                    >
                                                        {notificationLoading ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="hidden sm:inline">Generate Departure Reminders</span>
                                                                <span className="sm:hidden">Departure Reminders</span>
                                                            </>
                                                        )}
                                                    </CustomButton>
                                                </div>

                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Daily Summary
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Generate morning summary of today's arrivals and departures.
                                                    </p>
                                                    <CustomButton
                                                        variant="orange"
                                                        onClick={handleGenerateDailySummary}
                                                        disabled={notificationLoading}
                                                        title="Generate daily arrivals and departures summary"
                                                        icon={notificationLoading ? null : FaCalendarDay}
                                                    >
                                                        {notificationLoading ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="hidden sm:inline">Generate Daily Summary</span>
                                                                <span className="sm:hidden">Daily Summary</span>
                                                            </>
                                                        )}
                                                    </CustomButton>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Cleanup
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Remove expired notifications from the system.
                                                    </p>
                                                    <CustomButton
                                                        variant="red"
                                                        onClick={handleCleanupExpiredNotifications}
                                                        disabled={notificationLoading}
                                                        title="Remove expired notifications"
                                                        icon={notificationLoading ? null : HiTrash}
                                                    >
                                                        {notificationLoading ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Cleaning...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="hidden sm:inline">Cleanup Expired</span>
                                                                <span className="sm:hidden">Cleanup</span>
                                                            </>
                                                        )}
                                                    </CustomButton>
                                                </div>

                                            </div>
                                            </div>
                                        )}

                                        {/* Custom Reminders Section */}
                                        <CustomReminderManager
                                            allUsers={allUsers}
                                            fetchAllUsersForReminders={fetchAllUsersForReminders}
                                        />

                                    </div>
                                </Card>
                            )}
                            
                            {/* Scheduler Management Panel - Admin Only */}
                            {activeTab === 'scheduler' && (
                                <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                    <EmailSchedulerPanel 
                                        isAdmin={isAdmin}
                                        notificationLoading={notificationLoading}
                                        setNotificationLoading={setNotificationLoading}
                                    />
                                </Suspense>
                            )}

                            {/* UI Management Panel - Admin and Content Manager */}
                            {activeTab === 'ui-management' && (isAdmin || isContentManager) && (
                                <div id="ui-management-panel" role="tabpanel" aria-labelledby="tab-ui-management">
                                    <Suspense fallback={<div className="flex justify-center items-center py-12"><RahalatekLoader size="md" /></div>}>
                                        <UIManagement />
                                    </Suspense>
                                </div>
                            )}
                            


                            {/* Debt Modal */}
                            <CustomModal
                                isOpen={showDebtModal}
                                onClose={() => setShowDebtModal(false)}
                                title={editingDebt ? 'Edit Debt' : 'Add New Debt'}
                                maxWidth="md:max-w-2xl"
                            >
                                <form onSubmit={handleDebtSubmit} className="space-y-1 md:space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-2 gap-1 md:gap-4">
                                            <div>
                                                <CustomSelect
                                                    id="debt-office"
                                                    label="Office"
                                                    value={debtForm.officeName}
                                                    onChange={(value) => setDebtForm({ ...debtForm, officeName: value })}
                                                    options={[
                                                        { value: "", label: "Select an office" },
                                                        ...offices.map(office => ({
                                                            value: office.name,
                                                            label: office.name
                                                        }))
                                                    ]}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <CustomSelect
                                                    id="debt-type"
                                                    label="Debt Type"
                                                    value={debtForm.type}
                                                    onChange={(value) => setDebtForm({ ...debtForm, type: value })}
                                                    options={[
                                                        { value: "OWED_TO_OFFICE", label: "We Owe Them" },
                                                        { value: "OWED_FROM_OFFICE", label: "They Owe Us" }
                                                    ]}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-2 gap-1 md:gap-4">
                                            <div>
                                                <div className="mb-2 block">
                                                    <Label htmlFor="debt-amount" value="Amount" className="text-gray-700 dark:text-gray-200 font-medium" />
                                                </div>
                                                <TextInput
                                                    id="debt-amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={debtForm.amount}
                                                    onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <CustomSelect
                                                    id="debt-currency"
                                                    label="Currency"
                                                    value={debtForm.currency}
                                                    onChange={(value) => setDebtForm({ ...debtForm, currency: value })}
                                                    options={[
                                                        { value: "USD", label: "USD ($)" },
                                                        { value: "EUR", label: "EUR (€)" },
                                                        { value: "TRY", label: "TRY (₺)" }
                                                    ]}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="debt-description" value="Description" className="mb-1 md:mb-2" />
                                            <TextInput
                                                id="debt-description"
                                                value={debtForm.description}
                                                onChange={(e) => setDebtForm({ ...debtForm, description: e.target.value })}
                                                placeholder="Brief description of the debt"
                                            />
                                        </div>

                                        <div>
                                            <CustomDatePicker
                                                id="debt-due-date"
                                                label="Due Date (Optional)"
                                                value={debtForm.dueDate}
                                                onChange={(value) => setDebtForm({ ...debtForm, dueDate: value })}
                                                placeholder="DD/MM/YYYY"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="debt-notes" value="Notes (Optional)" className="mb-1 md:mb-2" />
                                            <TextInput
                                                id="debt-notes"
                                                as="textarea"
                                                rows={2}
                                                value={debtForm.notes}
                                                onChange={(e) => setDebtForm({ ...debtForm, notes: e.target.value })}
                                                placeholder="Additional notes about this debt"
                                            />
                                        </div>

                                        <div className="flex flex-row justify-end gap-2 pt-1 md:pt-4">
                                            <CustomButton
                                                variant="gray"
                                                onClick={() => setShowDebtModal(false)}
                                                disabled={debtLoading}
                                            >
                                                Cancel
                                            </CustomButton>
                                            <CustomButton
                                                type="submit"
                                                variant="green"
                                                disabled={debtLoading}
                                                icon={editingDebt ? null : HiPlus}
                                            >
                                                {debtLoading ? 'Saving...' : (editingDebt ? 'Update Debt' : 'Create Debt')}
                                            </CustomButton>
                                        </div>
                                </form>
                            </CustomModal>

                            {/* Delete Debt Confirmation Modal */}
                            <DeleteConfirmationModal
                                show={deleteDebtModalOpen}
                                onClose={closeDeleteDebtModal}
                                onConfirm={handleDeleteDebt}
                                isLoading={deleteDebtLoading}
                                itemType="debt record"
                                itemName={debtToDelete ? `${getCurrencySymbol(debtToDelete.currency)}${debtToDelete.amount.toFixed(2)} for ${debtToDelete.officeName}` : ''}
                                itemExtra={debtToDelete ? debtToDelete.description : ''}
                            />

                            {/* Delete Salary Entry Confirmation Modal */}
                            <DeleteConfirmationModal
                                show={salaryDeleteConfirmation.show}
                                onClose={() => setSalaryDeleteConfirmation({ show: false, entry: null, entryDescription: '' })}
                                onConfirm={handleDeleteSalaryEntry}
                                isLoading={salaryTabLoading}
                                itemType="salary entry"
                                itemName={salaryDeleteConfirmation.entryDescription}
                                itemExtra="This action cannot be undone."
                            />

                            {/* Delete Bonus Entry Confirmation Modal */}
                            <DeleteConfirmationModal
                                show={bonusDeleteConfirmation.show}
                                onClose={() => setBonusDeleteConfirmation({ show: false, entry: null, entryDescription: '' })}
                                onConfirm={handleDeleteBonusEntry}
                                isLoading={salaryTabLoading}
                                itemType="bonus entry"
                                itemName={bonusDeleteConfirmation.entryDescription}
                                itemExtra="This action cannot be undone."
                            />


                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
    
    
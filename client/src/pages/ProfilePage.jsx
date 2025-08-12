import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Label, Modal, Spinner, Checkbox } from 'flowbite-react';
import { HiUser, HiLockClosed, HiSave, HiArrowLeft, HiEye, HiEyeOff } from 'react-icons/hi';
import { FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import TextInput from '../components/TextInput';
import CustomButton from '../components/CustomButton';
import UserBadge from '../components/UserBadge';
import CustomSelect from '../components/Select';
import UserAnalytics from '../components/UserAnalytics';
import RahalatekLoader from '../components/RahalatekLoader';
import { getMyBonuses, getUserBonuses, saveMonthlyBaseSalary } from '../utils/profileApi';

const securityQuestions = [
    { value: "What was your childhood nickname?", label: "What was your childhood nickname?" },
    { value: "What is the name of your first pet?", label: "What is the name of your first pet?" },
    { value: "What is your mother's maiden name?", label: "What is your mother's maiden name?" },
    { value: "What was the model of your first car?", label: "What was the model of your first car?" },
    { value: "In what city were you born?", label: "In what city were you born?" }
];

export default function ProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Salary state
    const [salaryLoading, setSalaryLoading] = useState(false);
    const [salarySaving, setSalarySaving] = useState(false);

    const [salaryData, setSalaryData] = useState({
        salaryAmount: '',
        salaryCurrency: 'USD',
        salaryDayOfMonth: '',
        salaryNotes: ''
    });
    const [updateFromNextCycle, setUpdateFromNextCycle] = useState(false);
    const [lastMonthBonus, setLastMonthBonus] = useState(null);
    const [salaryModalOpen, setSalaryModalOpen] = useState(false);
    const [animateBars, setAnimateBars] = useState(false);
    const [modalEnter, setModalEnter] = useState(false);
    const [allBonuses, setAllBonuses] = useState([]);
    const [salaryYears, setSalaryYears] = useState([]);
    const [selectedSalaryYear, setSelectedSalaryYear] = useState('');
    
    // Form data
    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        securityQuestion: '',
        securityAnswer: ''
    });

    useEffect(() => {
        // Get current user info
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
            const currentUserData = JSON.parse(userInfo);
            setCurrentUser(currentUserData);
            
            // If no userId in params, we're viewing our own profile
            if (!userId) {
                fetchCurrentUserProfile();
            } else {
                fetchUserProfile(userId);
            }
        } else {
            navigate('/signin');
        }
    }, [userId, navigate]);

    const fetchCurrentUserProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/profile/me');
            setUser(response.data);
            setFormData({
                username: response.data.username || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                securityQuestion: response.data.securityQuestion || '',
                securityAnswer: ''
            });
        } catch {
            toast.error('Failed to load profile', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSalary = useCallback(async (targetUserId) => {
        try {
            setSalaryLoading(true);
            const endpoint = targetUserId ? `/api/profile/${targetUserId}/salary` : '/api/profile/me/salary';
            const response = await axios.get(endpoint);
            // Calculate current month's actual salary
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const monthlyBaseEntry = (user?.salaryBaseEntries || []).find(e => e.year === currentYear && e.month === currentMonth);
            const currentMonthSalary = monthlyBaseEntry?.amount ?? response.data.salaryAmount ?? '';
            
            setSalaryData({
                salaryAmount: currentMonthSalary,
                salaryCurrency: response.data.salaryCurrency || 'USD',
                salaryDayOfMonth: response.data.salaryDayOfMonth ?? '',
                salaryNotes: response.data.salaryNotes || ''
            });
        } catch (_err) {
            // If forbidden, hide silently for regular users viewing others (shouldn't happen due to route guard)
            console.error('Failed to load salary info:', _err.response?.data?.message || _err.message);
        } finally {
            setSalaryLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // Fetch salary data after user is known
        if (!currentUser) return;
        const viewingOwn = !userId;
        const isRestricted = !viewingOwn && currentUser.isAccountant && user?.isAdmin;
        if (isRestricted) return; // Accountants cannot view admin salaries
        const canSeeOtherSalary = currentUser.isAdmin || currentUser.isAccountant;
        if (viewingOwn || canSeeOtherSalary) {
            fetchSalary(viewingOwn ? undefined : userId);
        }
    }, [currentUser, userId, user, fetchSalary]);

    // Load last month's bonus for header display
    useEffect(() => {
        const loadBonus = async () => {
            if (!currentUser) return;
            if (userId && currentUser.isAccountant && user?.isAdmin) {
                setLastMonthBonus(null);
                return;
            }
            try {
                let bonuses = [];
                if (!userId) {
                    const res = await getMyBonuses();
                    bonuses = res.bonuses || [];
                } else if (currentUser.isAdmin || currentUser.isAccountant) {
                    const res = await getUserBonuses(userId);
                    bonuses = res.bonuses || [];
                } else {
                    setLastMonthBonus(null);
                    return;
                }
                const now = new Date();
                const prevMonth = (now.getMonth() + 11) % 12;
                const prevYear = now.getFullYear() - (now.getMonth() === 0 ? 1 : 0);
                const match = bonuses.find(b => b.month === prevMonth && b.year === prevYear);
                setLastMonthBonus(match || null);
            } catch {
                // ignore silently
            }
        };
        loadBonus();
    }, [currentUser, userId, user]);

    const openSalariesModal = async () => {
        if (userId && currentUser?.isAccountant && user?.isAdmin) {
            return;
        }
        try {
            let bonuses = [];
            if (!userId) {
                const res = await getMyBonuses();
                bonuses = res.bonuses || [];
            } else if (currentUser?.isAdmin || currentUser?.isAccountant) {
                const res = await getUserBonuses(userId);
                bonuses = res.bonuses || [];
            }
            setAllBonuses(bonuses);
            // Refresh user profile to ensure latest salaryBaseEntries are present
            try {
                const profileRes = await axios.get(userId ? `/api/profile/${userId}` : '/api/profile/me');
                setUser(profileRes.data);
            } catch {
                // ignore; use existing state
            }
            const years = Array.from(new Set([new Date().getFullYear(), ...bonuses.map(b => b.year)])).sort((a,b) => b - a);
            setSalaryYears(years);
            setSelectedSalaryYear(String(years[0] || new Date().getFullYear()));
            setSalaryModalOpen(true);
        } catch {
            setAllBonuses([]);
            setSalaryYears([new Date().getFullYear()]);
            setSelectedSalaryYear(String(new Date().getFullYear()));
            setSalaryModalOpen(true);
        }
    };

    useEffect(() => {
        if (salaryModalOpen) {
            setAnimateBars(false);
            setModalEnter(false);
            const t = setTimeout(() => setAnimateBars(true), 60); // trigger bar transition
            const raf = requestAnimationFrame(() => setModalEnter(true)); // trigger modal enter
            return () => {
                clearTimeout(t);
                cancelAnimationFrame(raf);
            };
        } else {
            setModalEnter(false);
        }
    }, [salaryModalOpen]);

    const closeSalariesModal = () => {
        // play exit animation then hide modal
        setModalEnter(false);
        setTimeout(() => setSalaryModalOpen(false), 300);
    };

    const monthLabelsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const computeMonthlySalaryData = (year) => {
        const y = parseInt(year, 10);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIndex = now.getMonth();
        const monthly = [];
        const baseEntries = user?.salaryBaseEntries || [];
        for (let m = 0; m < 12; m++) {
            const isFutureMonth = (y > currentYear) || (y === currentYear && m > currentMonthIndex);
            const monthlyBaseEntry = baseEntries.find(e => e.year === y && e.month === m);
            const bonusEntry = (allBonuses || []).find(b => b.year === y && b.month === m);
            // Smart fallback: use current salary for months after employment start (determined by first salary record)
            const firstSalaryEntry = user?.salaryBaseEntries?.reduce((earliest, entry) => {
                const entryDate = new Date(entry.year, entry.month);
                const earliestDate = new Date(earliest.year, earliest.month);
                return entryDate < earliestDate ? entry : earliest;
            }, user?.salaryBaseEntries?.[0]);
            
            const firstBonusEntry = allBonuses?.reduce((earliest, bonus) => {
                const bonusDate = new Date(bonus.year, bonus.month);
                const earliestDate = new Date(earliest.year, earliest.month);
                return bonusDate < earliestDate ? bonus : earliest;
            }, allBonuses?.[0]);
            
            // Employment started when we have the first salary or bonus record
            const employmentStart = firstSalaryEntry && firstBonusEntry ? 
                (new Date(firstSalaryEntry.year, firstSalaryEntry.month) <= new Date(firstBonusEntry.year, firstBonusEntry.month) ? firstSalaryEntry : firstBonusEntry) :
                (firstSalaryEntry || firstBonusEntry);
            
            const isEmployed = employmentStart && new Date(y, m) >= new Date(employmentStart.year, employmentStart.month);
            const base = isFutureMonth ? 0 : Number(monthlyBaseEntry?.amount ?? (isEmployed ? user?.salaryAmount ?? 0 : 0));
            const bonus = isFutureMonth ? 0 : Number(bonusEntry?.amount ?? 0);
            // Currency per month: prefer base entry currency, then bonus entry currency, else current salary currency
            const currency = monthlyBaseEntry?.currency || bonusEntry?.currency || salaryData.salaryCurrency || '';
            monthly.push({
                month: monthLabelsShort[m],
                base,
                bonus,
                total: Number(base) + Number(bonus),
                currency,
                baseCurrency: monthlyBaseEntry?.currency || currency,
                bonusCurrency: bonusEntry?.currency || currency
            });
        }
        return monthly;
    };

    const handleSalaryChange = (name, value) => {
        setSalaryData(prev => ({ ...prev, [name]: value }));

    };

    const getNextSalaryDate = (dayOfMonth) => {
        // Business rule: upcoming salary is always the next month's cycle date
        const day = parseInt(dayOfMonth, 10);
        if (!day || day < 1 || day > 31) return '';
        const now = new Date();
        const nextMonthIndex = now.getMonth() + 1; // Always next month
        const year = now.getFullYear() + Math.floor(nextMonthIndex / 12);
        const month = nextMonthIndex % 12;
        const clampedDay = Math.min(day, daysInMonth(year, month));
        const nextDate = new Date(year, month, clampedDay);
        return formatDisplayDDMMYYYY(nextDate);
    };

    const daysInMonth = (year, monthIndex) => {
        return new Date(year, monthIndex + 1, 0).getDate();
    };

    const formatDisplayDDMMYYYY = (dateObj) => {
        const d = dateObj;
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const handleSaveSalary = async () => {
        try {
            setSalarySaving(true);

            // Validation
            const amount = parseFloat(salaryData.salaryAmount);
            if (isNaN(amount) || amount < 0) {
                toast.error('Salary amount must be a non-negative number', {
                    duration: 3000,
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontWeight: '500'
                    }
                });
                return;
            }
            const day = parseInt(salaryData.salaryDayOfMonth, 10);
            if (!day || day < 1 || day > 31) {
                toast.error('Please select a valid salary day (1-31)', {
                    duration: 3000,
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontWeight: '500'
                    }
                });
                return;
            }

            const targetId = userId || currentUser?.id || currentUser?._id;

            // 1) Update global salary settings (day, notes, currency baseline)
            const payload = {
                salaryAmount: amount,
                salaryCurrency: salaryData.salaryCurrency,
                salaryDayOfMonth: day,
                salaryNotes: salaryData.salaryNotes || '',
                updateFromNextCycle: updateFromNextCycle
            };
            await axios.put(`/api/profile/${targetId}/salary`, payload);

            // 2) Ensure monthly base entry for current/next month reflects the new base and currency
            // If updateFromNextCycle is true, the backend will handle this properly
            if (!updateFromNextCycle) {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
                try {
                    await saveMonthlyBaseSalary(targetId, {
                        year: currentYear,
                        month: currentMonth,
                        amount: amount,
                        note: salaryData.salaryNotes || ''
                    });
                } catch {
                    // ignore; monthly base may already exist
                }
            }

            // 3) Refresh user profile and bonuses to update header instantly
            try {
                const refreshed = await axios.get(userId ? `/api/profile/${userId}` : '/api/profile/me');
                setUser(refreshed.data);
            } catch {
                // ignore
            }
            try {
                if (!userId) {
                    const res = await getMyBonuses();
                    setAllBonuses(res.bonuses || []);
                } else if (currentUser?.isAdmin || currentUser?.isAccountant) {
                    const res = await getUserBonuses(userId);
                    setAllBonuses(res.bonuses || []);
                }
            } catch {
                // ignore
            }

            toast.success('Salary updated successfully', {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } catch (_err) {
            toast.error(_err.response?.data?.message || 'Failed to save salary', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSalarySaving(false);
        }
    };

    const fetchUserProfile = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/profile/${id}`);
            setUser(response.data);
            setFormData({
                username: response.data.username || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                securityQuestion: response.data.securityQuestion || '',
                securityAnswer: ''
            });
        } catch {
            toast.error('Failed to load user profile', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        // Validation
        if (!formData.username.trim()) {
            toast.error('Username is required', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            return;
        }

        // Only allow password changes for own profile
        if (formData.newPassword && !isOwnProfile) {
            toast.error('You cannot change another user\'s password', {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            return;
        }

        if (formData.newPassword && isOwnProfile) {
            if (formData.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters long', {
                    duration: 3000,
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontWeight: '500'
                    }
                });
                return;
            }
            
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error('New passwords do not match', {
                    duration: 3000,
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontWeight: '500'
                    }
                });
                return;
            }

            if (!formData.currentPassword) {
                toast.error('Current password is required to change password', {
                    duration: 3000,
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontWeight: '500'
                    }
                });
                return;
            }
        }

        try {
            setSaving(true);
            
            const updateData = {
                username: formData.username
            };

            // Only include password and security data for own profile
            if (isOwnProfile) {
                if (formData.newPassword) {
                    updateData.newPassword = formData.newPassword;
                    updateData.currentPassword = formData.currentPassword;
                }
                // Security question can only be changed by the user themselves
                updateData.securityQuestion = formData.securityQuestion;
                updateData.securityAnswer = formData.securityAnswer || undefined;
            }

            const endpoint = userId ? `/api/profile/${userId}` : '/api/profile/me';
            const response = await axios.put(endpoint, updateData);

            toast.success(response.data.message, {
                duration: 3000,
                style: {
                    background: '#4CAF50',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
            
            // Update local user data (include salaryBaseEntries if returned)
            setUser(prev => ({ ...prev, ...(response.data.user || {}), salaryBaseEntries: response.data.user?.salaryBaseEntries || prev?.salaryBaseEntries }));

            // If base changed, refresh profile so monthly base entries applied by backend are reflected immediately
            if (updateData.username || updateData.currentPassword || updateData.securityQuestion !== undefined) {
                // not a base-only change
            }
            try {
                const refreshed = await axios.get(userId ? `/api/profile/${userId}` : '/api/profile/me');
                setUser(refreshed.data);
            } catch {
                // ignore
            }
            
            // If updating own profile, update localStorage
            if (!userId) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.dispatchEvent(new Event('auth-change'));
            }
            
            // Reset password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                securityAnswer: ''
            }));
            
            setIsEditing(false);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage, {
                duration: 3000,
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: '500'
                }
            });
        } finally {
            setSaving(false);
        }
    };

    const canEdit = () => {
        if (!currentUser) return false;
        
        // Users can always edit their own profile
        if (!userId) return true;
        
        // Admins can edit any profile
        if (currentUser.isAdmin) return true;
        
        // Accountants cannot edit profiles
        return false;
    };

    const canView = () => {
        if (!currentUser) return false;
        
        // Users can always view their own profile
        if (!userId) return true;
        
        // Admins and accountants can view any profile
        return currentUser.isAdmin || currentUser.isAccountant;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <RahalatekLoader size="xl" />
            </div>
        );
    }

    if (!canView()) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
                <Card className="max-w-md">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Access Denied
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            You don't have permission to view this profile.
                        </p>
                        <CustomButton onClick={() => navigate(-1)}>
                            Go Back
                        </CustomButton>
                    </div>
                </Card>
            </div>
        );
    }

    const isOwnProfile = !userId;
    const canViewSalary = isOwnProfile || currentUser?.isAdmin || (currentUser?.isAccountant && !user?.isAdmin);
    const canEditSalary = currentUser?.isAdmin || (currentUser?.isAccountant && !user?.isAdmin);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-6">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 relative">
                    <div className="mb-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isOwnProfile ? 'My Profile' : `${user?.username}'s Profile`}
                        </h1>
                        {/* Removed subtitle */}
                    </div>
                    {/* Back arrow removed */}
                </div>

                {/* Profile Card */}
                <Card className="mb-6 bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-700">
                    <div className="p-5">
                        {/* User Info Header */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img 
                                    src={user?.isAdmin ? '/adminAvatar.png' : user?.isAccountant ? '/accountantAvatar.png' : '/normalUserAvatar.png'}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {user?.username}
                                    </h2>
                                    {user && <UserBadge user={user} size="sm" />}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            </div>
                            {/* Compensation summary on header (text only) */}
                            {(isOwnProfile || currentUser?.isAdmin || (currentUser?.isAccountant && !user?.isAdmin)) && (
                                <div className="w-full md:w-auto text-left md:text-right">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Base: {(() => {
                                            // Show current month's actual salary
                                            const now = new Date();
                                            const currentMonth = now.getMonth();
                                            const currentYear = now.getFullYear();
                                            const monthlyBaseEntry = (user?.salaryBaseEntries || []).find(e => e.year === currentYear && e.month === currentMonth);
                                            const currentBaseSalary = monthlyBaseEntry?.amount ?? user?.salaryAmount ?? 0;
                                            const currency = monthlyBaseEntry?.currency || user?.salaryCurrency || '';
                                            return typeof currentBaseSalary !== 'undefined' ? `${currentBaseSalary} ${currency}` : '-';
                                        })()}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Bonus last month: {lastMonthBonus ? `${lastMonthBonus.amount} ${lastMonthBonus.currency}` : '0'}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Total last month: <span className="text-green-600 dark:text-green-400">{(() => {
                                            const now = new Date();
                                            const prevMonth = (now.getMonth() + 11) % 12;
                                            const prevYear = now.getFullYear() - (now.getMonth() === 0 ? 1 : 0);
                                            const monthlyBaseEntry = (user?.salaryBaseEntries || []).find(e => e.year === prevYear && e.month === prevMonth);
                                            const base = Number(monthlyBaseEntry?.amount ?? user?.salaryAmount ?? 0) || 0;
                                            const b = lastMonthBonus ? Number(lastMonthBonus.amount) || 0 : 0;
                                            const cur = monthlyBaseEntry?.currency || lastMonthBonus?.currency || user?.salaryCurrency || '';
                                            if (!base && !b) return '-';
                                            return `${(base + b).toFixed(2)} ${cur}`;
                                        })()}</span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Next salary: {salaryData.salaryDayOfMonth ? getNextSalaryDate(salaryData.salaryDayOfMonth) : '-'}
                                    </div>
                                    <div className="mt-2 flex justify-center md:justify-end">
                                        <CustomButton
                                            variant="green"
                                            onClick={openSalariesModal}
                                            className="!px-3 !py-1.5 !text-sm"
                                        >
                                            View all salaries
                                        </CustomButton>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mb-5">
                            {canEdit() && (
                                <div className="flex gap-2">
                                    {!isEditing ? (
                                        <CustomButton 
                                            onClick={() => setIsEditing(true)}
                                            className="!px-3 !py-1.5 !text-sm"
                                        >
                                            <HiUser className="w-3 h-3 mr-1" />
                                            Edit
                                        </CustomButton>
                                    ) : (
                                        <CustomButton 
                                            variant="red"
                                            onClick={() => {
                                                setIsEditing(false);
                                                // Reset form data
                                                setFormData({
                                                    username: user?.username || '',
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: '',
                                                    securityQuestion: user?.securityQuestion || '',
                                                    securityAnswer: ''
                                                });
                                            }}
                                            className="!px-3 !py-1.5 !text-sm"
                                        >
                                            Cancel
                                        </CustomButton>
                                    )}
                                </div>
                            )}
                        </div>



                        {/* Profile Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Basic Information - Only when editing */}
                            {isEditing && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <HiUser className="w-4 h-4" />
                                        Basic Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="username" value="Username" />
                                            <TextInput
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Salary - inside information section, only shown when editing */}
                                    {canViewSalary && (
                                        <div className="mt-6">
                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Salary</h3>



                                            {canEditSalary ? (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div>
                                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Amount</label>
                                                            <TextInput
                                                                name="salaryAmount"
                                                                value={salaryData.salaryAmount}
                                                                onChange={(e) => handleSalaryChange('salaryAmount', e.target.value)}
                                                                placeholder="0.00"
                                                                disabled={salaryLoading}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Currency</label>
                                                            <CustomSelect
                                                                id="salaryCurrency"
                                                                value={salaryData.salaryCurrency}
                                                                onChange={(val) => handleSalaryChange('salaryCurrency', val)}
                                                                options={[
                                                                    { value: 'USD', label: 'USD' },
                                                                    { value: 'EUR', label: 'EUR' },
                                                                    { value: 'TRY', label: 'TRY' }
                                                                ]}
                                                                placeholder="Select currency"
                                                                disabled={salaryLoading}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Salary Day</label>
                                                            <CustomSelect
                                                                id="salaryDayOfMonth"
                                                                value={salaryData.salaryDayOfMonth}
                                                                onChange={(val) => handleSalaryChange('salaryDayOfMonth', val)}
                                                                options={Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                                                                placeholder="Day (1-31)"
                                                                disabled={salaryLoading}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Next Salary</label>
                                                            <div className="h-[42px] flex items-center px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {salaryData.salaryDayOfMonth ? getNextSalaryDate(salaryData.salaryDayOfMonth) : '-'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Notes</label>
                                                        <TextInput
                                                            name="salaryNotes"
                                                            value={salaryData.salaryNotes}
                                                            onChange={(e) => handleSalaryChange('salaryNotes', e.target.value)}
                                                            placeholder="Optional notes"
                                                            disabled={salaryLoading}
                                                        />
                                                    </div>

                                                    <div className="mt-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id="updateFromNextCycle"
                                                                checked={updateFromNextCycle}
                                                                onChange={(e) => setUpdateFromNextCycle(e.target.checked)}
                                                                disabled={salaryLoading}
                                                            />
                                                            <label htmlFor="updateFromNextCycle" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                Update starting from next salary cycle {salaryData.salaryDayOfMonth ? `(${getNextSalaryDate(salaryData.salaryDayOfMonth)})` : ''}
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end mt-5">
                                                        <CustomButton type="button" onClick={handleSaveSalary} disabled={salarySaving || salaryLoading} className="!px-4 !py-2">
                                                            {salarySaving ? 'Saving...' : 'Save Salary'}
                                                        </CustomButton>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="md:col-span-1">
                                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Next Salary</label>
                                                        <div className="h-[42px] flex items-center px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {salaryData.salaryDayOfMonth ? getNextSalaryDate(salaryData.salaryDayOfMonth) : '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Password Section - Only for own profile */}
                            {isEditing && isOwnProfile && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <HiLockClosed className="w-4 h-4" />
                                        Change Password
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="currentPassword" value="Current Password" />
                                            <div className="relative">
                                                                                                 <TextInput
                                                     id="currentPassword"
                                                     name="currentPassword"
                                                     type={showCurrentPassword ? "text" : "password"}
                                                     value={formData.currentPassword}
                                                     onChange={handleInputChange}
                                                     placeholder="Enter current password to change"
                                                     style={{
                                                         WebkitTextSecurity: showCurrentPassword ? 'none' : 'disc',
                                                     }}
                                                     className="[&::-ms-reveal]:hidden [&::-webkit-textfield-decoration-container]:hidden"
                                                 />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                >
                                                    {showCurrentPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="newPassword" value="New Password" />
                                            <div className="relative">
                                                                                                 <TextInput
                                                     id="newPassword"
                                                     name="newPassword"
                                                     type={showNewPassword ? "text" : "password"}
                                                     value={formData.newPassword}
                                                     onChange={handleInputChange}
                                                     placeholder="Enter new password"
                                                     style={{
                                                         WebkitTextSecurity: showNewPassword ? 'none' : 'disc',
                                                     }}
                                                     className="[&::-ms-reveal]:hidden [&::-webkit-textfield-decoration-container]:hidden"
                                                 />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="confirmPassword" value="Confirm New Password" />
                                            <div className="relative">
                                                                                                 <TextInput
                                                     id="confirmPassword"
                                                     name="confirmPassword"
                                                     type={showConfirmPassword ? "text" : "password"}
                                                     value={formData.confirmPassword}
                                                     onChange={handleInputChange}
                                                     placeholder="Confirm new password"
                                                     style={{
                                                         WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc',
                                                     }}
                                                     className="[&::-ms-reveal]:hidden [&::-webkit-textfield-decoration-container]:hidden"
                                                 />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* Security Question - Only for own profile and when editing */}
                            {isOwnProfile && isEditing && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <FaShieldAlt className="w-4 h-4" />
                                        Security Question
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div>
                                            <CustomSelect
                                                id="securityQuestion"
                                                label="Security Question"
                                                value={formData.securityQuestion}
                                                onChange={(value) => handleSelectChange('securityQuestion', value)}
                                                options={securityQuestions}
                                                placeholder="Select a security question"
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label htmlFor="securityAnswer" value="Security Answer" />
                                            <TextInput
                                                id="securityAnswer"
                                                name="securityAnswer"
                                                value={formData.securityAnswer}
                                                onChange={handleInputChange}
                                                placeholder="Enter answer to security question"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            {isEditing && (
                                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <CustomButton 
                                        type="submit" 
                                        disabled={saving}
                                        className="!px-4 !py-2"
                                    >
                                        {saving ? (
                                            <>
                                                <Spinner size="sm" className="mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <HiSave className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </CustomButton>
                                </div>
                            )}
                        </form>
                    </div>
                </Card>

                {/* Salaries modal */}
                <Modal
                    show={salaryModalOpen}
                    onClose={closeSalariesModal}
                    size="lg"
                    popup
                    theme={{
                        content: {
                            inner: `relative rounded-lg bg-white dark:bg-slate-900 transform transition-all duration-300 ${modalEnter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`
                        },
                        root: {
                            base: `fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full ${modalEnter ? 'backdrop-blur-sm bg-black/30' : 'backdrop-blur-0 bg-black/0'} transition-all duration-300`
                        }
                    }}
                >
                    <Modal.Header>
                        <div className="text-center w-full">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Salaries</h3>
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Year</span>
                                <div className="min-w-[120px]">
                                    <CustomSelect
                                        id="salaryYear"
                                        value={selectedSalaryYear}
                                        onChange={(val) => setSelectedSalaryYear(val)}
                                        options={salaryYears.map(y => ({ value: String(y), label: String(y) }))}
                                    />
                                </div>
                            </div>

                            {/* Chart-like list similar to profile analytics chart */}
                            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Total per Month</h4>
                                {computeMonthlySalaryData(selectedSalaryYear).map((row, idx, arr) => {
                                    const max = Math.max(...arr.map(r => r.total));
                                    const pct = max > 0 ? (row.total / max) * 100 : 0;
                                    return (
                                        <div key={idx} className="flex items-center gap-3 mb-2">
                                            <div className="w-10 text-xs text-gray-600 dark:text-gray-400">{row.month}</div>
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div className="h-2 rounded-full bg-green-500 transition-[width] duration-700 ease-out will-change-[width]" style={{ width: animateBars ? `${pct}%` : '0%' }} />
                                            </div>
                                            <div className="w-28 text-right text-sm font-medium text-gray-900 dark:text-white">
                                                {row.total.toFixed(2)} {row.currency || salaryData.salaryCurrency || ''}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Breakdown table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-600 dark:text-gray-300">
                                            <th className="py-2 pr-4">Month</th>
                                            <th className="py-2 pr-4">Base</th>
                                            <th className="py-2 pr-4">Bonus</th>
                                            <th className="py-2 pr-4">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-800 dark:text-gray-100">
                                        {computeMonthlySalaryData(selectedSalaryYear).map((row, idx) => (
                                            <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
                                                <td className="py-2 pr-4">{row.month}</td>
                                                <td className="py-2 pr-4">{row.base} {row.baseCurrency || row.currency || salaryData.salaryCurrency}</td>
                                                <td className="py-2 pr-4">{row.bonus} {row.bonusCurrency || row.currency || salaryData.salaryCurrency}</td>
                                                <td className="py-2 pr-4 font-semibold">{row.total.toFixed(2)} {row.currency || salaryData.salaryCurrency}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                {/* Analytics Section */}
                <UserAnalytics userId={user?.id || user?._id} />
            </div>
        </div>
    );
}

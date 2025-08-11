import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Label, Alert, Spinner } from 'flowbite-react';
import { HiUser, HiLockClosed, HiSave, HiArrowLeft, HiEye, HiEyeOff } from 'react-icons/hi';
import { FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import TextInput from '../components/TextInput';
import CustomButton from '../components/CustomButton';
import UserBadge from '../components/UserBadge';
import CustomSelect from '../components/Select';
import UserAnalytics from '../components/UserAnalytics';

const securityQuestions = [
    { value: "What was your childhood nickname?", label: "What was your childhood nickname?" },
    { value: "What is the name of your first pet?", label: "What is the name of your first pet?" },
    { value: "What is your mother's maiden name?", label: "What is your mother's maiden name?" },
    { value: "What was the model of your first car?", label: "What was the model of your first car?" },
    { value: "In what city were you born?", label: "In what city were you born?" },
    { value: "What was the name of your elementary school?", label: "What was the name of your elementary school?" },
    { value: "What is your favorite movie?", label: "What is your favorite movie?" },
    { value: "What is the name of the street you grew up on?", label: "What is the name of the street you grew up on?" },
    { value: "What was your first car's make and model?", label: "What was your first car's make and model?" },
    { value: "What is your favorite food?", label: "What is your favorite food?" },
    { value: "What was the name of your first boss?", label: "What was the name of your first boss?" }
];

export default function ProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load profile');
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
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
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load user profile');
            toast.error('Failed to load user profile');
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
        setError('');
        setSuccess('');
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.username.trim()) {
            setError('Username is required');
            return;
        }

        // Only allow password changes for own profile
        if (formData.newPassword && !isOwnProfile) {
            setError('You cannot change another user\'s password');
            return;
        }

        if (formData.newPassword && isOwnProfile) {
            if (formData.newPassword.length < 6) {
                setError('New password must be at least 6 characters long');
                return;
            }
            
            if (formData.newPassword !== formData.confirmPassword) {
                setError('New passwords do not match');
                return;
            }

            if (!formData.currentPassword) {
                setError('Current password is required to change password');
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

            setSuccess(response.data.message);
            toast.success(response.data.message);
            
            // Update local user data
            setUser(response.data.user);
            
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
            setError(errorMessage);
            toast.error(errorMessage);
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
                <div className="flex items-center gap-3">
                    <Spinner size="lg" />
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Loading profile...
                    </span>
                </div>
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
    const isViewingOtherProfile = userId && userId !== currentUser?.id;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-6">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <CustomButton
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="!px-2 !py-2"
                        >
                            <HiArrowLeft className="w-4 h-4" />
                        </CustomButton>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {isOwnProfile ? 'My Profile' : `${user?.username}'s Profile`}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {isOwnProfile 
                                    ? 'Manage your account settings'
                                    : `View ${canEdit() ? 'and edit' : ''} user profile`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Card */}
                <Card className="mb-6 bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-700">
                    <div className="p-5">
                        {/* User Info Header */}
                        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-200 dark:border-gray-700">
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
                                                setError('');
                                                setSuccess('');
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

                        {/* Alerts */}
                        {error && (
                            <Alert color="failure" className="mb-4">
                                {error}
                            </Alert>
                        )}
                        
                        {success && (
                            <Alert color="success" className="mb-4">
                                {success}
                            </Alert>
                        )}

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

                {/* Analytics Section */}
                <UserAnalytics userId={user?.id || user?._id} />
            </div>
        </div>
    );
}

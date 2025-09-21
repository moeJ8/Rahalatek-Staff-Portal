import React, { useState, useEffect } from 'react';
import { Card, Table } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomButton from '../CustomButton';
import CustomTable from '../CustomTable';
import RahalatekLoader from '../RahalatekLoader';

export default function UserRequests() {
    const navigate = useNavigate();

    // Component handles its own access control

    // State management
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper function to format date as dd/mm/yyyy
    const formatDateDDMMYYYY = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Fetch pending requests
    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            
            const response = await axios.get('/api/auth/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Filter only users who are not approved
            const pendingUsers = response.data.filter(user => !user.isApproved);
            setPendingRequests(pendingUsers);
        } catch (err) {
            console.error('Failed to fetch pending requests:', err);
            toast.error('Failed to load pending requests. Please refresh the page.', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchPendingRequests();
    }, []);

    // Handle user approval
    const handleToggleApprovalStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            
            await axios.patch('/api/auth/users/approve', 
                { userId, isApproved: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Remove from pending requests since user is now approved
            setPendingRequests(pendingRequests.filter(user => user._id !== userId));
            
            toast.success(`User ${!currentStatus ? 'approved' : 'unapproved'} successfully!`, {
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
            console.log(err);
            toast.error('Failed to update user approval status. Please try again.', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
                iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                },
            });
        }
    };

    // Handle user rejection
    const handleRejectUserRequest = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            await axios.delete(`/api/auth/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setPendingRequests(pendingRequests.filter(user => user._id !== userId));
            toast.success('User request rejected successfully!', {
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
            console.log(err);
            toast.error('Failed to reject user request', {
                duration: 4000,
                style: {
                    background: '#EF4444',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    padding: '16px',
                },
            });
        }
    };

    if (loading) {
        return (
            <Card className="w-full dark:bg-slate-950" id="requests-panel" role="tabpanel" aria-labelledby="tab-requests">
                <div className="flex flex-col items-center justify-center py-12">
                    <RahalatekLoader size="md" />
                    <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg font-medium">Loading pending requests...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="w-full dark:bg-slate-950" id="requests-panel" role="tabpanel" aria-labelledby="tab-requests">
            <h2 className="text-xl md:text-2xl font-bold mb-1 dark:text-white mx-auto">Pending User Approval Requests</h2>
            
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <CustomTable
                    headers={[
                        { label: 'Username', className: '' },
                        { label: 'Email', className: '' },
                        { label: 'Phone Number', className: '' },
                        { label: 'Registration Date', className: '' },
                        { label: 'Actions', className: '' }
                    ]}
                    data={pendingRequests}
                    renderRow={(user) => (
                        <>
                            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white px-4 py-3">
                                <button
                                    onClick={() => navigate(`/profile/${user._id}`)}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium cursor-pointer"
                                    title="View user profile"
                                >
                                    {user.username}
                                </button>
                            </Table.Cell>
                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                {user.email || '-'}
                            </Table.Cell>
                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                {user.phoneNumber && user.countryCode 
                                    ? `${user.countryCode} ${user.phoneNumber}`
                                    : user.phoneNumber || '-'
                                }
                            </Table.Cell>
                            <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                                {formatDateDDMMYYYY(user.createdAt)}
                            </Table.Cell>
                            <Table.Cell className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                    <CustomButton
                                        variant="green"
                                        onClick={() => handleToggleApprovalStatus(user._id, user.isApproved)}
                                        title="Approve user account"
                                        icon={({ className }) => (
                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    >
                                        Approve
                                    </CustomButton>
                                    <CustomButton
                                        variant="red"
                                        onClick={() => handleRejectUserRequest(user._id)}
                                        title="Reject user account"
                                        icon={({ className }) => (
                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    >
                                        Reject
                                    </CustomButton>
                                </div>
                            </Table.Cell>
                        </>
                    )}
                    emptyMessage="No pending requests"
                    emptyDescription="There are no new user accounts awaiting approval at this time. New registration requests will appear here when users sign up."
                    emptyIcon={() => (
                        <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full">
                            <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                        </div>
                    )}
                />
            </div>

            {/* Mobile Cards View */}
            <div className="sm:hidden space-y-5">
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full">
                            <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No pending requests</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">There are no new user accounts awaiting approval at this time. New registration requests will appear here when users sign up.</p>
                    </div>
                ) : (
                    pendingRequests.map((user, index) => (
                        <div 
                            key={user._id} 
                            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            style={{
                                animationDelay: `${index * 100}ms`
                            }}
                        >
                            <div className="space-y-3">
                                {/* Header with Username and Registration Date */}
                                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                                    <div>
                                        <button
                                            onClick={() => navigate(`/profile/${user._id}`)}
                                            className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                            title="View user profile"
                                        >
                                            {user.username}
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-600 dark:text-slate-300">Registered</div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formatDateDDMMYYYY(user.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Email</div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.email || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Phone Number</div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.phoneNumber && user.countryCode 
                                                ? `${user.countryCode} ${user.phoneNumber}`
                                                : user.phoneNumber || '-'
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 justify-center">
                                    <CustomButton
                                        variant="green"
                                        size="xs"
                                        onClick={() => handleToggleApprovalStatus(user._id, user.isApproved)}
                                        title="Approve user account"
                                        className="text-xs"
                                        icon={({ className }) => (
                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    >
                                        Approve
                                    </CustomButton>
                                    <CustomButton
                                        variant="red"
                                        size="xs"
                                        onClick={() => handleRejectUserRequest(user._id)}
                                        title="Reject user account"
                                        className="text-xs"
                                        icon={({ className }) => (
                                            <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    >
                                        Reject
                                    </CustomButton>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}

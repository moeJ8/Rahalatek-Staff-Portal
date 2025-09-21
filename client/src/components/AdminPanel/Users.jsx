import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import CustomButton from '../CustomButton';
import CustomTable from '../CustomTable';
import UserBadge from '../UserBadge';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import RahalatekLoader from '../RahalatekLoader';

export default function Users() {
    const navigate = useNavigate();

    // Get current user info
    const authUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = authUser.isAdmin || false;
    const isAccountant = authUser.isAccountant || false;

    // State management
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteUserLoading, setDeleteUserLoading] = useState(false);

    // Currency symbol helper
    const getCurrencySymbol = (currency) => {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'TRY': '₺',
        };
        return symbols[currency] || currency;
    };

    // Fetch users data
    const fetchUsers = useCallback(async () => {
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
            if (currentUserId) {
                try {
                    const salaryResponse = await axios.get('/api/auth/me/salary', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const userInList = approvedUsers.find(u => u._id === currentUserId);
                    if (userInList && salaryResponse.data) {
                        userInList.salaryAmount = salaryResponse.data.salaryAmount;
                        userInList.salaryCurrency = salaryResponse.data.salaryCurrency;
                    }
                } catch (err) {
                    console.log(err);
                }
            }
            
            setUsers(approvedUsers);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            toast.error('Failed to load users. Please refresh the page.', {
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
    }, [authUser.id, authUser._id, authUser.username, authUser.isAdmin, authUser.isAccountant]);

    // Load data on component mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle admin status toggle
    const handleToggleAdminStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            
            await axios.patch('/api/auth/users/role', 
                { userId, isAdmin: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Update the user in the local state
            setUsers(users.map(user => 
                user._id === userId 
                    ? { ...user, isAdmin: !currentStatus, isAccountant: false } // Remove accountant role when making admin
                    : user
            ));
            
            toast.success(`User ${!currentStatus ? 'promoted to' : 'removed from'} admin successfully!`, {
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
            toast.error('Failed to update user role. Please try again.', {
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

    // Handle accountant status toggle
    const handleToggleAccountantStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            
            await axios.patch('/api/auth/users/role', 
                { userId, isAccountant: !currentStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // Update the user in the local state
            setUsers(users.map(user => 
                user._id === userId 
                    ? { ...user, isAccountant: !currentStatus, isAdmin: false } // Remove admin role when making accountant
                    : user
            ));
            
            toast.success(`User ${!currentStatus ? 'promoted to' : 'removed from'} accountant successfully!`, {
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
            toast.error('Failed to update user role. Please try again.', {
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

    // Handle user deletion
    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        setDeleteUserLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setDeleteUserLoading(false);
                return;
            }
            
            await axios.delete(`/api/auth/users/${userToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setUsers(users.filter(user => user._id !== userToDelete._id));
            toast.success('User deleted successfully!', {
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
            
            // Close modal
            closeDeleteUserModal();
            
        } catch (err) {
            console.log(err);
            toast.error('Failed to delete user. Please try again.', {
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
            setDeleteUserLoading(false);
        }
    };

    // Modal management functions
    const openDeleteUserModal = (user) => {
        setUserToDelete(user);
        setDeleteUserModalOpen(true);
    };

    const closeDeleteUserModal = () => {
        setDeleteUserModalOpen(false);
        setUserToDelete(null);
    };

    if (loading) {
        return (
            <Card className="w-full dark:bg-slate-950" id="users-panel" role="tabpanel" aria-labelledby="tab-users">
                <div className="flex flex-col items-center justify-center py-12">
                    <RahalatekLoader size="md" />
                    <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg font-medium">Loading users...</p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="w-full dark:bg-slate-950" id="users-panel" role="tabpanel" aria-labelledby="tab-users">
                <h2 className="text-xl md:text-2xl font-bold mb-1 dark:text-white mx-auto">User Management</h2>
                
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <CustomTable
                        headers={[
                            { label: 'Username', className: '' },
                            { label: 'Role', className: 'text-center' },
                            ...(isAdmin ? [
                                { label: 'Admin Actions', className: '' },
                                { label: 'Accountant Actions', className: '' },
                                { label: 'Salary', className: '' },
                                { label: 'Delete', className: '' }
                            ] : [
                                { label: 'Salary', className: '' }
                            ])
                        ]}
                        data={users.sort((a, b) => {
                            // Sort by role priority: Admin (3) > Accountant (2) > User (1)
                            const getRolePriority = (user) => {
                                if (user.isAdmin) return 3;
                                if (user.isAccountant) return 2;
                                return 1;
                            };
                            return getRolePriority(b) - getRolePriority(a);
                        })}
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
                                <Table.Cell className="flex items-center justify-center px-4 py-3">
                                    <UserBadge user={user} />
                                </Table.Cell>
                                {isAdmin && (
                                    <>
                                        <Table.Cell className="px-4 py-3">
                                            <div className="flex items-center">
                                                {user.isAdmin ? (
                                                    <CustomButton
                                                        variant="orange"
                                                        onClick={() => handleToggleAdminStatus(user._id, user.isAdmin)}
                                                        title="Revoke admin privileges"
                                                    >
                                                        Revoke
                                                    </CustomButton>
                                                ) : (
                                                    <CustomButton
                                                        variant="blue"
                                                        onClick={() => handleToggleAdminStatus(user._id, user.isAdmin)}
                                                        disabled={user.isAccountant}
                                                        title="Assign admin privileges"
                                                    >
                                                        Assign
                                                    </CustomButton>
                                                )}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell className="px-4 py-3">
                                            <div className="flex items-center">
                                                {user.isAccountant ? (
                                                    <CustomButton
                                                        variant="orange"
                                                        onClick={() => handleToggleAccountantStatus(user._id, user.isAccountant)}
                                                        title="Revoke accountant privileges"
                                                    >
                                                        Revoke
                                                    </CustomButton>
                                                ) : (
                                                    <CustomButton
                                                        variant="teal"
                                                        onClick={() => handleToggleAccountantStatus(user._id, user.isAccountant)}
                                                        disabled={user.isAdmin}
                                                        title="Assign accountant privileges"
                                                    >
                                                        Assign
                                                    </CustomButton>
                                                )}
                                            </div>
                                        </Table.Cell>
                                    </>
                                )}
                                {(isAdmin || isAccountant) && (
                                    <Table.Cell className="px-4 py-3 text-sm">
                                        {isAccountant && user.isAdmin ? (
                                            <span className="text-gray-500 dark:text-gray-400">Restricted</span>
                                        ) : (
                                            typeof user.salaryAmount === 'number' ? (
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {getCurrencySymbol(user.salaryCurrency || 'USD')}{Number(user.salaryAmount).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                            )
                                        )}
                                    </Table.Cell>
                                )}
                                {isAdmin && (
                                    <Table.Cell className="px-4 py-3">
                                        <CustomButton
                                            variant="red"
                                            onClick={() => openDeleteUserModal(user)}
                                            title="Delete user"
                                            icon={({ className }) => (
                                                <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                        >
                                            Delete
                                        </CustomButton>
                                    </Table.Cell>
                                )}
                            </>
                        )}
                        emptyMessage="No users found. Admin users can manage other users here."
                        emptyIcon={() => (
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        )}
                    />
                </div>

                {/* Mobile Cards View */}
                <div className="sm:hidden space-y-5">
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-gray-500 dark:text-gray-400">No users found. Admin users can manage other users here.</p>
                        </div>
                    ) : (
                        users.sort((a, b) => {
                            // Sort by role priority: Admin (3) > Accountant (2) > User (1)
                            const getRolePriority = (user) => {
                                if (user.isAdmin) return 3;
                                if (user.isAccountant) return 2;
                                return 1;
                            };
                            return getRolePriority(b) - getRolePriority(a);
                        }).map((user, index) => (
                            <div 
                                key={user._id} 
                                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    animationDelay: `${index * 100}ms`
                                }}
                            >
                                <div className="space-y-3">
                                    {/* Header with Username and Role */}
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
                                            <UserBadge user={user} />
                                        </div>
                                    </div>

                                    {/* Salary Information */}
                                    {(isAdmin || isAccountant) && (
                                        <div>
                                            <div className="text-xs text-gray-600 dark:text-slate-300 mb-1">Salary</div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {isAccountant && user.isAdmin ? (
                                                    <span className="text-gray-500 dark:text-gray-400">Restricted</span>
                                                ) : (
                                                    typeof user.salaryAmount === 'number' ? (
                                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                                            {getCurrencySymbol(user.salaryCurrency || 'USD')}{Number(user.salaryAmount).toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Actions */}
                                    {isAdmin && (
                                        <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700 justify-center">
                                            {/* Admin Status Toggle */}
                                            {user.isAdmin ? (
                                                <CustomButton
                                                    variant="orange"
                                                    size="xs"
                                                    onClick={() => handleToggleAdminStatus(user._id, user.isAdmin)}
                                                    title="Revoke admin privileges"
                                                    className="text-xs"
                                                >
                                                    Revoke
                                                </CustomButton>
                                            ) : (
                                                <CustomButton
                                                    variant="blue"
                                                    size="xs"
                                                    onClick={() => handleToggleAdminStatus(user._id, user.isAdmin)}
                                                    disabled={user.isAccountant}
                                                    title="Assign admin privileges"
                                                    className="text-xs"
                                                >
                                                    Admin
                                                </CustomButton>
                                            )}

                                            {/* Accountant Status Toggle */}
                                            {user.isAccountant ? (
                                                <CustomButton
                                                    variant="orange"
                                                    size="xs"
                                                    onClick={() => handleToggleAccountantStatus(user._id, user.isAccountant)}
                                                    title="Revoke accountant privileges"
                                                    className="text-xs"
                                                >
                                                    Revoke
                                                </CustomButton>
                                            ) : (
                                                <CustomButton
                                                    variant="teal"
                                                    size="xs"
                                                    onClick={() => handleToggleAccountantStatus(user._id, user.isAccountant)}
                                                    disabled={user.isAdmin}
                                                    title="Assign accountant privileges"
                                                    className="text-xs"
                                                >
                                                    Accountant
                                                </CustomButton>
                                            )}

                                            {/* Delete Button */}
                                            <CustomButton
                                                variant="red"
                                                size="xs"
                                                onClick={() => openDeleteUserModal(user)}
                                                title="Delete user"
                                                className="text-xs"
                                                icon={({ className }) => (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
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
            </Card>

            {/* Delete User Confirmation Modal */}
            <DeleteConfirmationModal
                show={deleteUserModalOpen}
                onClose={closeDeleteUserModal}
                onConfirm={handleDeleteUser}
                isLoading={deleteUserLoading}
                itemType="user"
                itemName={userToDelete?.username}
            />
        </>
    );
}

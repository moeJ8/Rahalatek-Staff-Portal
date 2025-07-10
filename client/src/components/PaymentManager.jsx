import React, { useState, useEffect } from 'react';
import { Modal, Select, TextInput, Textarea, Label } from 'flowbite-react';
import { HiPlus, HiCurrencyDollar } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import CustomButton from './CustomButton';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const PaymentManager = ({ officeName, originalTotal, currency, onPaymentsChange }) => {
    const [payments, setPayments] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        type: 'INCOMING', // INCOMING or OUTGOING
        amount: '',
        notes: ''
    });
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAccountant, setIsAccountant] = useState(false);

    const getCurrencySymbol = (curr) => {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            AED: 'د.إ',
            SAR: 'ر.س',
            TRY: '₺',
            EGP: 'ج.م'
        };
        return symbols[curr] || curr;
    };

    // Load payments from backend API (currency-specific)
    useEffect(() => {
        fetchPayments();
    }, [officeName, currency]);

    // Check user role
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user) {
                    setIsAdmin(user.isAdmin || false);
                    setIsAccountant(user.isAccountant || false);
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('No authentication token found');
                return;
            }

            const response = await axios.get(`/api/office-payments/${encodeURIComponent(officeName)}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    currency: currency
                }
            });

            const fetchedPayments = response.data || [];
            setPayments(fetchedPayments);
            onPaymentsChange?.(fetchedPayments);
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error('Failed to fetch payments:', err);
                toast.error('Failed to load payments');
            }
            // If 404, it means no payments exist yet, which is fine
            setPayments([]);
            onPaymentsChange?.([]);
        }
    };

    // Update form when currency changes
    useEffect(() => {
        if (showPaymentModal) {
            resetPaymentForm();
        }
    }, [currency]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setPaymentLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You must be logged in to add payments');
                return;
            }

            const paymentData = {
                type: paymentForm.type,
                amount: parseFloat(paymentForm.amount),
                currency: currency,
                notes: paymentForm.notes,
                officeName: officeName
            };

            const response = await axios.post('/api/office-payments', paymentData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Refresh payments from server
            await fetchPayments();
            
            toast.success(`${paymentForm.type === 'INCOMING' ? 'Incoming' : 'Outgoing'} payment added successfully!`, {
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
            setShowPaymentModal(false);
            resetPaymentForm();
        } catch (err) {
            console.error('Failed to save payment:', err);
            toast.error(err.response?.data?.message || 'Failed to save payment');
        } finally {
            setPaymentLoading(false);
        }
    };

    const resetPaymentForm = () => {
        setPaymentForm({
            type: 'INCOMING',
            amount: '',
            notes: ''
        });
    };

    const openPaymentModal = () => {
        resetPaymentForm();
        setShowPaymentModal(true);
    };

    const openDeleteModal = (payment) => {
        setPaymentToDelete(payment);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setPaymentToDelete(null);
    };

    const deletePayment = async (paymentId) => {
        setDeleteLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You must be logged in to delete payments');
                return;
            }

            await axios.delete(`/api/office-payments/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Refresh payments from server
            await fetchPayments();
            toast.success('Payment deleted successfully!', {
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
            closeDeleteModal();
        } catch (err) {
            console.error('Failed to delete payment:', err);
            toast.error(err.response?.data?.message || 'Failed to delete payment');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (paymentToDelete) {
            await deletePayment(paymentToDelete._id);
        }
    };

    // Calculate total adjustment
    const calculateAdjustment = () => {
        return payments.reduce((total, payment) => {
            if (payment.type === 'INCOMING') {
                return total + payment.amount;
            } else {
                return total - payment.amount;
            }
        }, 0);
    };

    const adjustment = calculateAdjustment();
    const adjustedTotal = originalTotal + adjustment;

    return (
        <div>
            {/* Add Payment Button */}
            <CustomButton
                variant="green"
                onClick={openPaymentModal}
                icon={HiPlus}
                title={`Add payment record in ${currency}`}
            >
                Add Payment ({currency})
            </CustomButton>

            {/* Adjusted Total Display */}
            {payments.length > 0 && (
                <div className="mt-4 p-4 bg-white dark:bg-slate-950 rounded-lg border dark:border-slate-600">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Adjusted Total ({currency})</p>
                        <div className="flex items-center justify-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {getCurrencySymbol(currency)}{originalTotal.toFixed(2)}
                            </span>
                            {adjustment !== 0 && (
                                <>
                                    <span className="text-xl text-gray-500 dark:text-gray-400">
                                        {adjustment > 0 ? '+' : '-'}
                                    </span>
                                    <span className={`text-2xl font-bold ${
                                        adjustment > 0 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {getCurrencySymbol(currency)}{Math.abs(adjustment).toFixed(2)}
                                    </span>
                                    <span className="text-xl text-gray-500 dark:text-gray-400">=</span>
                                    <span className={`text-2xl font-bold ${
                                        adjustedTotal >= originalTotal 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : 'text-red-600 dark:text-red-400'
                                    }`}>
                                        {getCurrencySymbol(currency)}{adjustedTotal.toFixed(2)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payments List */}
            {payments.length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <HiCurrencyDollar className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                        Payment History ({currency})
                    </h4>
                    <div className="space-y-3">
                        {payments.map((payment) => (
                            <div 
                                key={payment._id} 
                                className={`p-4 rounded-lg border ${
                                    payment.autoGenerated 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                        : payment.type === 'INCOMING'
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <span 
                                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                                                    payment.type === 'INCOMING' 
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700' 
                                                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                                                }`}
                                            >
                                                {payment.type === 'INCOMING' ? 'Incoming' : 'Outgoing'}
                                            </span>
                                            {payment.autoGenerated && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                                                    Auto-generated
                                                </span>
                                            )}
                                            <span className={`text-lg font-bold ${
                                                payment.type === 'INCOMING'
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {payment.type === 'INCOMING' ? '+' : '-'}{getCurrencySymbol(payment.currency)}{payment.amount.toFixed(2)}
                                            </span>
                                        </div>
                                        {payment.notes && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                                {payment.notes}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(payment.createdAt).toLocaleDateString()} {new Date(payment.createdAt).toLocaleTimeString()}
                                            {payment.createdBy && payment.createdBy.name && (
                                                <span className="ml-2">• by {payment.createdBy.name}</span>
                                            )}
                                        </p>
                                    </div>
                                    {!payment.autoGenerated && (
                                        <CustomButton
                                            variant="red"
                                            size="xs"
                                            onClick={() => openDeleteModal(payment)}
                                            title="Delete payment"
                                        >
                                            Delete
                                        </CustomButton>
                                    )}
                                    {payment.autoGenerated && (
                                        <div className="flex flex-col items-end space-y-2">
                                            {(isAdmin || isAccountant) && (
                                                <CustomButton
                                                    variant="red"
                                                    size="xs"
                                                    onClick={() => openDeleteModal(payment)}
                                                    title="Delete auto-generated payment (Admin/Accountant only)"
                                                >
                                                    Delete
                                                </CustomButton>
                                            )}
                                            <div className="text-xs text-blue-600 dark:text-blue-400 text-center">
                                                <p>Generated from</p>
                                                <p>voucher</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            <Modal
                show={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                size="lg"
                popup
                theme={{
                    content: {
                        base: "relative h-full w-full p-4 h-auto",
                        inner: "relative rounded-lg bg-slate-900 shadow flex flex-col max-h-[90vh]"
                    }
                }}
            >
                <Modal.Header className="border-b border-gray-600">
                    <div className="text-center">
                        <h3 className="text-xl font-medium text-white">
                            Add Payment ({getCurrencySymbol(currency)} - {currency})
                        </h3>
                    </div>
                </Modal.Header>
                <Modal.Body className="bg-slate-900">
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="payment-type" value="Payment Type" className="mb-2 text-white" />
                            <Select
                                id="payment-type"
                                value={paymentForm.type}
                                onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                                required
                                className="bg-gray-700 border-gray-600 text-white"
                            >
                                <option value="INCOMING">Incoming Payment</option>
                                <option value="OUTGOING">Outgoing Payment</option>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="payment-amount" value={`Amount (${getCurrencySymbol(currency)})`} className="mb-2 text-white" />
                            <TextInput
                                id="payment-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                required
                                className="bg-gray-700 border-gray-600 text-white"
                                placeholder={`Enter amount in ${currency}`}
                            />
                        </div>

                        <div>
                            <Label htmlFor="payment-notes" value="Notes (Optional)" className="mb-2 text-white" />
                            <Textarea
                                id="payment-notes"
                                rows={3}
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                placeholder="Additional notes about this payment"
                                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <CustomButton
                                variant="gray"
                                onClick={() => setShowPaymentModal(false)}
                                disabled={paymentLoading}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                type="submit"
                                variant="green"
                                disabled={paymentLoading}
                                icon={HiPlus}
                            >
                                {paymentLoading ? 'Saving...' : 'Add Payment'}
                            </CustomButton>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={deleteLoading}
                itemType={paymentToDelete?.autoGenerated ? "auto-generated payment" : "payment"}
                itemName={paymentToDelete ? `${getCurrencySymbol(paymentToDelete.currency)}${paymentToDelete.amount.toFixed(2)} ${paymentToDelete.type.toLowerCase()} payment` : ""}
                itemExtra={paymentToDelete?.autoGenerated ? "auto-created from voucher" : ""}
            />
        </div>
    );
};

export default PaymentManager; 
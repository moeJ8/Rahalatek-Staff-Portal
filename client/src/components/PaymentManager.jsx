import React, { useState, useEffect } from "react";
import { Modal, Label } from "flowbite-react";
import { HiPlus, HiCurrencyDollar, HiDownload } from "react-icons/hi";
import { toast } from "react-hot-toast";
import axios from "axios";
import CustomButton from "./CustomButton";
import CustomSelect from "./Select";
import CustomTextInput from "./TextInput";
import CustomModal from "./CustomModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import SearchableSelect from "./SearchableSelect";
import CustomDatePicker from "./CustomDatePicker";
import CustomScrollbar from "./CustomScrollbar";
import PaymentDateControls from "./PaymentDateControls";

const PaymentManager = ({
  officeName,
  currency,
  filters,
  onPaymentsChange,
  serviceVouchers = [],
  clientVouchers = [],
}) => {
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: "INCOMING", // INCOMING or OUTGOING
    amount: "",
    currency: "USD", // Add currency field back
    notes: "",
    voucherId: "",
    paymentDate: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);

  // Approval modal state for auto-generated payments
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [paymentToApprove, setPaymentToApprove] = useState(null);
  const [approvalPaymentDate, setApprovalPaymentDate] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  const getCurrencySymbol = (curr) => {
    const symbols = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      AED: "د.إ",
      SAR: "ر.س",
      TRY: "₺",
      EGP: "ج.م",
    };
    return symbols[curr] || curr;
  };

  // Filter payments by month and year filters
  const filterPaymentsByDateFilters = (payments) => {
    if (!filters) return payments;

    return payments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      const paymentMonth = paymentDate.getMonth() + 1; // 1-based month
      const paymentYear = paymentDate.getFullYear();

      // Year filter
      if (filters.year && paymentYear.toString() !== filters.year) return false;

      // Month filter - only apply if specific months are selected
      if (
        filters.month &&
        Array.isArray(filters.month) &&
        filters.month.length > 0 &&
        !filters.month.includes("")
      ) {
        if (!filters.month.includes(paymentMonth.toString())) return false;
      }

      return true;
    });
  };

  // Group payments by currency for display when 'ALL' is selected
  const groupPaymentsByCurrency = (payments) => {
    // First filter by date filters
    const filteredPayments = filterPaymentsByDateFilters(payments);

    if (currency !== "ALL") {
      return { [currency]: filteredPayments };
    }

    return filteredPayments.reduce((groups, payment) => {
      const payCurrency = payment.currency || "USD";
      if (!groups[payCurrency]) {
        groups[payCurrency] = [];
      }
      groups[payCurrency].push(payment);
      return groups;
    }, {});
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Check user role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          setIsAdmin(user.isAdmin || false);
          setIsAccountant(user.isAccountant || false);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchPayments = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No authentication token found");
        return;
      }

      const params = {};
      // Only add currency param if not 'ALL'
      if (currency && currency !== "ALL") {
        params.currency = currency;
      }

      const response = await axios.get(
        `/api/office-payments/${encodeURIComponent(officeName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        }
      );

      const fetchedPayments = response.data || [];
      setPayments(fetchedPayments);
      onPaymentsChange?.(fetchedPayments);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Failed to fetch payments:", err);
        toast.error("Failed to load payments", {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
      }
      // If 404, it means no payments exist yet, which is fine
      setPayments([]);
      onPaymentsChange?.([]);
    }
  }, [officeName, currency, onPaymentsChange]);

  // Load payments from backend API (currency-specific or all currencies)
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const resetPaymentForm = React.useCallback(
    (selectedCurrency = null) => {
      setPaymentForm({
        type: "INCOMING",
        amount: "",
        currency: selectedCurrency || (currency === "ALL" ? "USD" : currency),
        notes: "",
        voucherId: "",
        paymentDate: "",
      });
    },
    [currency]
  );

  // Update form when currency changes
  useEffect(() => {
    if (showPaymentModal) {
      resetPaymentForm();
    }
  }, [currency, showPaymentModal, resetPaymentForm]);

  // Reset voucher selection if selected voucher doesn't match current form currency
  useEffect(() => {
    if (paymentForm.voucherId && showPaymentModal) {
      const allVouchers = [...serviceVouchers, ...clientVouchers];
      const selectedVoucher = allVouchers.find(
        (v) => v._id === paymentForm.voucherId
      );

      if (
        selectedVoucher &&
        selectedVoucher.currency !== paymentForm.currency
      ) {
        setPaymentForm((prev) => ({
          ...prev,
          voucherId: "",
        }));
      }
    }
  }, [
    paymentForm.currency,
    paymentForm.voucherId,
    serviceVouchers,
    clientVouchers,
    showPaymentModal,
  ]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      // Custom validation
      if (!paymentForm.voucherId) {
        toast.error("Please select a voucher for this payment", {
          duration: 4000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        setPaymentLoading(false);
        return;
      }

      if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
        toast.error("Please enter a valid amount greater than 0", {
          duration: 4000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        setPaymentLoading(false);
        return;
      }

      if (!paymentForm.type) {
        toast.error("Please select a payment type", {
          duration: 4000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        setPaymentLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to add payments", {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        setPaymentLoading(false);
        return;
      }

      const paymentData = {
        type: paymentForm.type,
        amount: parseFloat(paymentForm.amount),
        currency: currency === "ALL" ? paymentForm.currency : currency, // Use form currency when 'ALL' is selected
        notes: paymentForm.notes,
        officeName: officeName,
        voucherId: paymentForm.voucherId,
        paymentDate: paymentForm.paymentDate || null,
      };

      await axios.post("/api/office-payments", paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Refresh payments from server
      await fetchPayments();

      toast.success(
        `${
          paymentForm.type === "INCOMING" ? "Incoming" : "Outgoing"
        } payment of ${getCurrencySymbol(paymentForm.currency)}${parseFloat(
          paymentForm.amount
        ).toFixed(2)} added successfully!`,
        {
          duration: 3000,
          style: {
            background: "#4CAF50",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#4CAF50",
          },
        }
      );
      setShowPaymentModal(false);
      resetPaymentForm();
    } catch (err) {
      console.error("Failed to save payment:", err);
      toast.error(err.response?.data?.message || "Failed to save payment", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const openPaymentModal = (selectedCurrency = null) => {
    resetPaymentForm(selectedCurrency);
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

  // Approval modal functions
  const openApprovalModal = (payment) => {
    setPaymentToApprove(payment);
    setApprovalPaymentDate(new Date().toISOString().split("T")[0]); // Default to today
    setShowApprovalModal(true);
  };

  const closeApprovalModal = () => {
    setShowApprovalModal(false);
    setPaymentToApprove(null);
    setApprovalPaymentDate("");
  };

  // Handle payment date update
  const handlePaymentDateUpdate = async (paymentId, paymentDate) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to update payment dates", {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        return;
      }

      await axios.patch(
        `/api/office-payments/${paymentId}/payment-date`,
        { paymentDate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh payments from server
      await fetchPayments();

      toast.success("Payment date updated successfully!", {
        duration: 3000,
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#4CAF50",
        },
      });
    } catch (err) {
      console.error("Failed to update payment date:", err);
      toast.error(
        err.response?.data?.message || "Failed to update payment date",
        {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        }
      );
      throw err; // Re-throw to let PaymentDateControls handle the error state
    }
  };

  const handleApprovalConfirm = async () => {
    if (!paymentToApprove) return;

    // Custom validation for payment date
    if (!approvalPaymentDate) {
      toast.error("Please select a payment date before approving", {
        duration: 4000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
      return;
    }

    setApprovalLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to approve payments", {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        setApprovalLoading(false);
        return;
      }

      await axios.patch(
        `/api/office-payments/${paymentToApprove._id}/approve`,
        {
          paymentDate: approvalPaymentDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh payments from server
      await fetchPayments();
      toast.success("Payment approved successfully!", {
        duration: 3000,
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#4CAF50",
        },
      });

      closeApprovalModal();
    } catch (err) {
      console.error("Failed to approve payment:", err);
      toast.error(err.response?.data?.message || "Failed to approve payment", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
    } finally {
      setApprovalLoading(false);
    }
  };

  const deletePayment = async (paymentId) => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to delete payments", {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        return;
      }

      await axios.delete(`/api/office-payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh payments from server
      await fetchPayments();
      toast.success("Payment deleted successfully!", {
        duration: 3000,
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#4CAF50",
        },
      });
      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete payment:", err);
      toast.error(err.response?.data?.message || "Failed to delete payment", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (paymentToDelete) {
      await deletePayment(paymentToDelete._id);
    }
  };

  // Handle payment approval
  const handleApprovePayment = async (paymentId) => {
    const payment = payments.find((p) => p._id === paymentId);

    // If it's an auto-generated payment, open the approval modal
    if (payment && payment.autoGenerated) {
      openApprovalModal(payment);
      return;
    }

    // For regular payments, approve directly
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to approve payments", {
          duration: 3000,
          style: {
            background: "#f44336",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "16px",
            padding: "16px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f44336",
          },
        });
        return;
      }

      await axios.patch(
        `/api/office-payments/${paymentId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh payments from server
      await fetchPayments();
      toast.success("Payment approved successfully!", {
        duration: 3000,
        style: {
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#4CAF50",
        },
      });
    } catch (err) {
      console.error("Failed to approve payment:", err);
      toast.error(err.response?.data?.message || "Failed to approve payment", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
    }
  };

  const handleDownloadReceipt = async (payment) => {
    if (!payment?._id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to download receipts", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
      return;
    }

    setDownloadingReceiptId(payment._id);
    try {
      const response = await axios.get(
        `/api/office-payments/payment/${payment._id}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      const filename = `payment-receipt-${payment._id}.pdf`;
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Payment receipt downloaded!", {
        duration: 2500,
        style: {
          background: "#2563eb",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "15px",
          padding: "14px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#2563eb",
        },
      });
    } catch (err) {
      console.error("Failed to download payment receipt:", err);
      toast.error(err.response?.data?.message || "Failed to download receipt", {
        duration: 3000,
        style: {
          background: "#f44336",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "16px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#f44336",
        },
      });
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  return (
    <div>
      {/* Payments List */}
      {(() => {
        const filteredPayments = filterPaymentsByDateFilters(payments);
        return filteredPayments.length > 0;
      })() && (
        <div>
          {/* Main Payment History Header */}
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
            <HiCurrencyDollar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-teal-600 dark:text-teal-400" />
            Payment History
          </h4>

          {(() => {
            const groupedPayments = groupPaymentsByCurrency(payments);
            const currencyOrder = ["USD", "EUR", "TRY"];
            const currencies = Object.keys(groupedPayments).sort((a, b) => {
              const indexA = currencyOrder.indexOf(a);
              const indexB = currencyOrder.indexOf(b);
              if (indexA === -1 && indexB === -1) return a.localeCompare(b);
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            });

            return currencies.map((payCurrency, index) => (
              <div
                key={payCurrency}
                className={index > 0 ? "mt-6 sm:mt-8" : ""}
              >
                {/* Mobile Layout */}
                <div className="sm:hidden mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-100 dark:bg-purple-900/50 px-3 py-1.5 rounded-full text-sm font-semibold text-purple-800 dark:text-purple-200">
                        {payCurrency} ({getCurrencySymbol(payCurrency)})
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {groupedPayments[payCurrency].length}
                      </span>
                    </div>
                  </div>
                  <CustomButton
                    variant="green"
                    size="sm"
                    onClick={() =>
                      openPaymentModal(
                        currency === "ALL" ? payCurrency : currency
                      )
                    }
                    icon={HiPlus}
                    title={`Add payment record in ${
                      currency === "ALL" ? payCurrency : currency
                    }`}
                    className="w-full"
                  >
                    Add Payment ({currency === "ALL" ? payCurrency : currency})
                  </CustomButton>
                </div>

                {/* Desktop Layout - Original */}
                <div className="hidden sm:flex sm:justify-between sm:items-center mb-4">
                  <h5 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                    {currency === "ALL" ? (
                      <span className="flex items-center">
                        <span className="bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full text-sm">
                          {payCurrency} ({getCurrencySymbol(payCurrency)})
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          {groupedPayments[payCurrency].length} payment
                          {groupedPayments[payCurrency].length !== 1 ? "s" : ""}
                        </span>
                      </span>
                    ) : (
                      `${currency} Payments`
                    )}
                  </h5>
                  {/* Add Payment Button for each currency */}
                  <CustomButton
                    variant="green"
                    size="sm"
                    onClick={() =>
                      openPaymentModal(
                        currency === "ALL" ? payCurrency : currency
                      )
                    }
                    icon={HiPlus}
                    title={`Add payment record in ${
                      currency === "ALL" ? payCurrency : currency
                    }`}
                  >
                    Add Payment ({currency === "ALL" ? payCurrency : currency})
                  </CustomButton>
                </div>
                <div className="space-y-3">
                  {groupedPayments[payCurrency].map((payment) => (
                    <div
                      key={payment._id}
                      className={`p-3 sm:p-4 rounded-lg border relative ${
                        payment.autoGenerated
                          ? payment.type === "INCOMING"
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : payment.status === "approved"
                          ? payment.type === "INCOMING"
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                      }`}
                    >
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        {/* Mobile: Amount first and prominent */}
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`text-xl font-bold ${
                              payment.status === "approved"
                                ? payment.type === "INCOMING"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {payment.type === "INCOMING" ? "+" : "-"}
                            {getCurrencySymbol(payment.currency)}
                            {payment.amount.toFixed(2)}
                          </span>
                        </div>

                        {/* Mobile: Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                              payment.type === "INCOMING"
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700"
                            }`}
                          >
                            {payment.type === "INCOMING"
                              ? "Incoming"
                              : "Outgoing"}
                          </span>

                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                              payment.status === "approved"
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                                : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700"
                            }`}
                          >
                            {payment.status === "approved"
                              ? "Approved"
                              : "Pending"}
                          </span>

                          {payment.autoGenerated && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                              Auto-generated
                            </span>
                          )}
                        </div>

                        {payment.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            {payment.notes}
                          </p>
                        )}

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(payment.createdAt)}{" "}
                          {new Date(payment.createdAt).toLocaleTimeString()}
                          {payment.createdBy && payment.createdBy.name && (
                            <span className="ml-2">
                              • by {payment.createdBy.name}
                            </span>
                          )}
                        </p>

                        {payment.relatedVoucher && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Applied to:{" "}
                            {payment.relatedVoucher.voucherNumber
                              ? `#${payment.relatedVoucher.voucherNumber} - ${payment.relatedVoucher.clientName}`
                              : "Voucher not found"}
                          </p>
                        )}

                        {(payment.paymentDate || isAdmin || isAccountant) && (
                          <div className="mt-1">
                            <PaymentDateControls
                              currentPaymentDate={payment.paymentDate}
                              onPaymentDateUpdate={(paymentDate) =>
                                handlePaymentDateUpdate(
                                  payment._id,
                                  paymentDate
                                )
                              }
                              canEdit={isAdmin || isAccountant}
                              className="text-xs"
                            />
                          </div>
                        )}

                        {payment.status === "approved" &&
                          payment.approvedBy && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Approved by: {payment.approvedBy.name} on{" "}
                              {formatDate(payment.approvedAt)}
                            </p>
                          )}

                        {/* Mobile: Action buttons */}
                        <div className="flex space-x-2 mt-3">
                          {payment.status === "approved" && (
                            <CustomButton
                              variant="blue"
                              size="xs"
                              onClick={() => handleDownloadReceipt(payment)}
                              title="Download payment receipt"
                              className="flex-1"
                              icon={HiDownload}
                              loading={downloadingReceiptId === payment._id}
                            >
                              {downloadingReceiptId === payment._id
                                ? "Downloading"
                                : "Receipt"}
                            </CustomButton>
                          )}
                          {(isAdmin || isAccountant) &&
                            payment.status === "pending" && (
                              <CustomButton
                                variant="green"
                                size="xs"
                                onClick={() =>
                                  handleApprovePayment(payment._id)
                                }
                                title="Approve payment"
                                className="flex-1"
                              >
                                Approve
                              </CustomButton>
                            )}

                          {!payment.autoGenerated && (
                            <CustomButton
                              variant="red"
                              size="xs"
                              onClick={() => openDeleteModal(payment)}
                              title="Delete payment"
                              className="flex-1"
                            >
                              Delete
                            </CustomButton>
                          )}

                          {payment.autoGenerated &&
                            (isAdmin || isAccountant) && (
                              <CustomButton
                                variant="red"
                                size="xs"
                                onClick={() => openDeleteModal(payment)}
                                title="Delete auto-generated payment (Admin/Accountant only)"
                                className="flex-1"
                              >
                                Delete
                              </CustomButton>
                            )}
                        </div>

                        {payment.autoGenerated && (
                          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                            <p>Generated from voucher</p>
                          </div>
                        )}
                      </div>

                      {/* Desktop Layout - Original Design */}
                      <div className="hidden sm:block">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                                  payment.type === "INCOMING"
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                                    : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700"
                                }`}
                              >
                                {payment.type === "INCOMING"
                                  ? "Incoming"
                                  : "Outgoing"}
                              </span>

                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                                  payment.status === "approved"
                                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                                    : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700"
                                }`}
                              >
                                {payment.status === "approved"
                                  ? "Approved"
                                  : "Pending"}
                              </span>

                              {payment.autoGenerated && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                                  Auto-generated
                                </span>
                              )}

                              <span
                                className={`text-lg font-bold ${
                                  payment.status === "approved"
                                    ? payment.type === "INCOMING"
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {payment.type === "INCOMING" ? "+" : "-"}
                                {getCurrencySymbol(payment.currency)}
                                {payment.amount.toFixed(2)}
                              </span>
                            </div>

                            {payment.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                {payment.notes}
                              </p>
                            )}

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(payment.createdAt)}{" "}
                              {new Date(payment.createdAt).toLocaleTimeString()}
                              {payment.createdBy && payment.createdBy.name && (
                                <span className="ml-2">
                                  • by {payment.createdBy.name}
                                </span>
                              )}
                            </p>

                            {payment.relatedVoucher && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Applied to:{" "}
                                {payment.relatedVoucher.voucherNumber
                                  ? `#${payment.relatedVoucher.voucherNumber} - ${payment.relatedVoucher.clientName}`
                                  : "Voucher not found"}
                              </p>
                            )}

                            {(payment.paymentDate ||
                              isAdmin ||
                              isAccountant) && (
                              <div className="mt-1">
                                <PaymentDateControls
                                  currentPaymentDate={payment.paymentDate}
                                  onPaymentDateUpdate={(paymentDate) =>
                                    handlePaymentDateUpdate(
                                      payment._id,
                                      paymentDate
                                    )
                                  }
                                  canEdit={isAdmin || isAccountant}
                                  className="text-xs"
                                />
                              </div>
                            )}

                            {payment.status === "approved" &&
                              payment.approvedBy && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Approved by: {payment.approvedBy.name} on{" "}
                                  {formatDate(payment.approvedAt)}
                                </p>
                              )}
                          </div>

                          <div className="flex flex-row items-center space-x-2">
                            {payment.status === "approved" && (
                              <CustomButton
                                variant="blue"
                                size="xs"
                                onClick={() => handleDownloadReceipt(payment)}
                                title="Download payment receipt"
                                icon={HiDownload}
                                loading={downloadingReceiptId === payment._id}
                              >
                                {downloadingReceiptId === payment._id
                                  ? "Downloading"
                                  : "Receipt"}
                              </CustomButton>
                            )}
                            {(isAdmin || isAccountant) &&
                              payment.status === "pending" && (
                                <CustomButton
                                  variant="green"
                                  size="xs"
                                  onClick={() =>
                                    handleApprovePayment(payment._id)
                                  }
                                  title="Approve payment"
                                >
                                  Approve
                                </CustomButton>
                              )}

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

                            {payment.autoGenerated &&
                              (isAdmin || isAccountant) && (
                                <CustomButton
                                  variant="red"
                                  size="xs"
                                  onClick={() => openDeleteModal(payment)}
                                  title="Delete auto-generated payment (Admin/Accountant only)"
                                >
                                  Delete
                                </CustomButton>
                              )}
                          </div>
                        </div>

                        {payment.autoGenerated && (
                          <div className="absolute bottom-2 right-2 text-xs text-blue-600 dark:text-blue-400 text-right">
                            <p>Generated from voucher</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Single currency with no payments */}
      {currency !== "ALL" &&
        (() => {
          const filteredPayments = filterPaymentsByDateFilters(payments);
          return filteredPayments.length === 0;
        })() && (
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <HiCurrencyDollar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-teal-600 dark:text-teal-400" />
              Payment History
            </h4>

            {/* Mobile Layout */}
            <div className="sm:hidden mb-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-purple-100 dark:bg-purple-900/50 px-3 py-1.5 rounded-full text-sm font-semibold text-purple-800 dark:text-purple-200">
                  {currency} ({getCurrencySymbol(currency)})
                </span>
              </div>
              <CustomButton
                variant="green"
                size="sm"
                onClick={() => openPaymentModal(currency)}
                icon={HiPlus}
                title={`Add payment record in ${currency}`}
                className="w-full"
              >
                Add Payment ({currency})
              </CustomButton>
            </div>

            {/* Desktop Layout - Original */}
            <div className="hidden sm:flex sm:justify-between sm:items-center mb-4">
              <h5 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                {currency} Payments
              </h5>
              <CustomButton
                variant="green"
                size="sm"
                onClick={() => openPaymentModal(currency)}
                icon={HiPlus}
                title={`Add payment record in ${currency}`}
              >
                Add Payment ({currency})
              </CustomButton>
            </div>

            <div className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                No {currency} payments yet.
              </p>
            </div>
          </div>
        )}

      {/* Add Payment Buttons for each currency when ALL is selected and no payments exist */}
      {currency === "ALL" &&
        (() => {
          const filteredPayments = filterPaymentsByDateFilters(payments);
          return filteredPayments.length === 0;
        })() && (
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
              <HiCurrencyDollar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-teal-600 dark:text-teal-400" />
              Payment History
            </h4>
            <div className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                No payment history yet. Start by adding a payment:
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 sm:gap-3">
                {["USD", "EUR", "TRY"].map((curr) => (
                  <CustomButton
                    key={curr}
                    variant="green"
                    onClick={() => openPaymentModal(curr)}
                    icon={HiPlus}
                    title={`Add payment record in ${curr}`}
                    className="w-full sm:w-auto"
                  >
                    Add Payment ({curr})
                  </CustomButton>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Payment Modal */}
      <CustomModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Add Payment (${getCurrencySymbol(paymentForm.currency)} - ${
          paymentForm.currency
        })`}
        maxWidth="md:max-w-2xl"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <CustomSelect
              id="payment-type"
              label="Payment Type"
              value={paymentForm.type}
              onChange={(value) =>
                setPaymentForm({ ...paymentForm, type: value })
              }
              options={[
                { value: "INCOMING", label: "Incoming Payment" },
                { value: "OUTGOING", label: "Outgoing Payment" },
              ]}
              required
            />
          </div>

          {(paymentForm.type === "OUTGOING" ||
            paymentForm.type === "INCOMING") &&
            (serviceVouchers.filter((v) => v.currency === paymentForm.currency)
              .length > 0 ||
              clientVouchers.filter((v) => v.currency === paymentForm.currency)
                .length > 0) && (
              <div>
                <Label
                  htmlFor="voucher-select"
                  value={`Apply to Voucher - ${paymentForm.currency} only`}
                  className="mb-2 text-gray-900 dark:text-white"
                />
                <SearchableSelect
                  id="voucher-select"
                  value={paymentForm.voucherId}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      voucherId: e.target.value,
                    })
                  }
                  options={[
                    { value: "", label: "Select a voucher" },
                    // Service vouchers (vouchers with services from this office) - filtered by currency
                    ...serviceVouchers
                      .filter(
                        (voucher) => voucher.currency === paymentForm.currency
                      )
                      .map((voucher) => ({
                        value: voucher._id,
                        label: `#${voucher.voucherNumber} - ${
                          voucher.clientName
                        } (Service: ${getCurrencySymbol(voucher.currency)}${
                          voucher.totalAmount
                        })`,
                      })),
                    // Client vouchers (vouchers that belong to this office) - filtered by currency
                    ...clientVouchers
                      .filter(
                        (voucher) => voucher.currency === paymentForm.currency
                      )
                      .map((voucher) => ({
                        value: voucher._id,
                        label: `#${voucher.voucherNumber} - ${
                          voucher.clientName
                        } (Client: ${getCurrencySymbol(voucher.currency)}${
                          voucher.totalAmount
                        })`,
                      })),
                  ]}
                  placeholder={`Search ${paymentForm.currency} vouchers...`}
                />
              </div>
            )}

          {/* Message when no vouchers available in selected currency */}
          {(paymentForm.type === "OUTGOING" ||
            paymentForm.type === "INCOMING") &&
            (serviceVouchers.length > 0 || clientVouchers.length > 0) &&
            serviceVouchers.filter((v) => v.currency === paymentForm.currency)
              .length === 0 &&
            clientVouchers.filter((v) => v.currency === paymentForm.currency)
              .length === 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  No vouchers available in {paymentForm.currency} for this
                  office. Create a voucher for this office in this currency
                  before adding a payment.
                </p>
              </div>
            )}

          <div>
            <CustomDatePicker
              id="payment-date"
              label="Payment Date"
              value={paymentForm.paymentDate}
              onChange={(date) =>
                setPaymentForm({ ...paymentForm, paymentDate: date })
              }
              placeholder="Select payment date"
            />
          </div>

          <div>
            <CustomTextInput
              id="payment-amount"
              label={`Amount (${getCurrencySymbol(paymentForm.currency)})`}
              type="number"
              step="0.01"
              min="0"
              value={paymentForm.amount}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, amount: e.target.value })
              }
              placeholder={`Enter amount in ${paymentForm.currency}`}
            />
          </div>

          <div>
            <CustomTextInput
              id="payment-notes"
              label="Notes (Optional)"
              as="textarea"
              rows={3}
              value={paymentForm.notes}
              onChange={(e) =>
                setPaymentForm({ ...paymentForm, notes: e.target.value })
              }
              placeholder="Additional notes about this payment"
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
              {paymentLoading ? "Saving..." : "Add Payment"}
            </CustomButton>
          </div>
        </form>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
        itemType={
          paymentToDelete?.autoGenerated ? "auto-generated payment" : "payment"
        }
        itemName={
          paymentToDelete
            ? `${getCurrencySymbol(
                paymentToDelete.currency
              )}${paymentToDelete.amount.toFixed(
                2
              )} ${paymentToDelete.type.toLowerCase()} payment`
            : ""
        }
        itemExtra={
          paymentToDelete?.autoGenerated ? "auto-created from voucher" : ""
        }
      />

      {/* Approval Modal for Auto-Generated Payments */}
      <CustomModal
        isOpen={showApprovalModal}
        onClose={closeApprovalModal}
        title="Approve auto-generated payment"
        maxWidth="md:max-w-lg"
      >
        <div className="text-center">
          <HiCurrencyDollar className="mx-auto mb-4 h-12 w-12 text-green-500" />

          {paymentToApprove && (
            <div className="font-bold text-gray-900 dark:text-white mb-5 text-xl">
              {getCurrencySymbol(paymentToApprove.currency)}
              {paymentToApprove.amount.toFixed(2)}{" "}
              {paymentToApprove.type.toLowerCase()}
            </div>
          )}

          {paymentToApprove && (
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg mb-4 text-left">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Notes:</strong> {paymentToApprove.notes}
              </div>
            </div>
          )}

          <div className="mb-4">
            <CustomDatePicker
              id="approval-payment-date"
              label="Payment Date"
              value={approvalPaymentDate}
              onChange={(date) => setApprovalPaymentDate(date)}
              placeholder="Select payment date"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select the date when this payment was actually made.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <CustomButton
              variant="green"
              onClick={handleApprovalConfirm}
              disabled={approvalLoading || !approvalPaymentDate}
              loading={approvalLoading}
              icon={HiCurrencyDollar}
            >
              {approvalLoading ? "Approving..." : "Approve Payment"}
            </CustomButton>
            <CustomButton
              variant="gray"
              onClick={closeApprovalModal}
              disabled={approvalLoading}
            >
              Cancel
            </CustomButton>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default PaymentManager;

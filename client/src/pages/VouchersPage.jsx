import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Table, Modal, Alert, TextInput } from "flowbite-react";
import SearchableSelect from "../components/SearchableSelect";
import Select from "../components/Select";
import Search from "../components/Search";
import CustomDatePicker from "../components/CustomDatePicker";
import StatusControls from "../components/StatusControls";
import CreatedByControls from "../components/CreatedByControls";
import FloatingTotalsPanel from "../components/FloatingTotalsPanel";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import RahalatekLoader from "../components/RahalatekLoader";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import CustomScrollbar from "../components/CustomScrollbar";
import { toast } from "react-hot-toast";
import { updateVoucherStatus } from "../utils/voucherApi";
import {
  FaTrash,
  FaPen,
  FaCalendarAlt,
  FaPlane,
  FaMoneyBill,
  FaUser,
  FaSearch,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

export default function VouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");
  const [uniqueOffices, setUniqueOffices] = useState([]);
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  ); // Default to current year
  const [availableYears, setAvailableYears] = useState([]);
  const [dateFilter, setDateFilter] = useState(() => {
    // Default to current month
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    return monthNames[new Date().getMonth()];
  });
  const [customDate, setCustomDate] = useState("");
  const [arrivalDateFilter, setArrivalDateFilter] = useState("");
  const [customArrivalDate, setCustomArrivalDate] = useState("");
  const [arrivalYearFilter, setArrivalYearFilter] = useState("");
  const [availableArrivalYears, setAvailableArrivalYears] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency) => {
    if (!currency) return "$"; // default to USD
    switch (currency) {
      case "EUR":
        return "€";
      case "TRY":
        return "₺";
      case "USD":
      default:
        return "$";
    }
  };

  // Helper function to get profit color classes based on value
  const getProfitColorClass = (profit, isBold = false) => {
    const baseClass = isBold ? "font-bold text-sm" : "text-sm font-medium";
    if (profit < 0) {
      return `${baseClass} text-red-600 dark:text-red-400`;
    }
    return `${baseClass} text-green-600 dark:text-green-400`;
  };

  // Fetch all users for the created by dropdown (admin only)
  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const usersWithCurrentUser = [...response.data];

      const currentUserExists = usersWithCurrentUser.some(
        (user) => user._id === currentUser.id
      );
      if (!currentUserExists && currentUser.id && currentUser.username) {
        usersWithCurrentUser.unshift({
          _id: currentUser.id,
          username: currentUser.username,
          isAdmin: currentUser.isAdmin,
          isAccountant: currentUser.isAccountant,
        });
      }

      usersWithCurrentUser.sort((a, b) => a.username.localeCompare(b.username));

      setAllUsers(usersWithCurrentUser);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch vouchers function - defined early to be used in useEffect
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Build query parameters for server-side filtering
      const params = new URLSearchParams();

      // Add year filter (for creation date)
      if (yearFilter) {
        params.append("year", yearFilter);
      }

      // Add month filter (for creation date) - convert month name to number
      if (
        dateFilter &&
        dateFilter !== "custom" &&
        dateFilter !== "this-year" &&
        dateFilter !== "last-year"
      ) {
        const monthNames = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ];
        const monthIndex = monthNames.indexOf(dateFilter);
        if (monthIndex !== -1) {
          params.append("month", (monthIndex + 1).toString());
        }
      }

      // Add arrival year filter
      if (arrivalYearFilter) {
        params.append("arrivalYear", arrivalYearFilter);
      }

      // Add arrival month filter - convert month name to number
      if (arrivalDateFilter && arrivalDateFilter !== "custom") {
        const monthNames = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ];
        const monthIndex = monthNames.indexOf(arrivalDateFilter);
        if (monthIndex !== -1) {
          params.append("arrivalMonth", (monthIndex + 1).toString());
        }
      }

      // Add status filter
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      // Add office filter
      if (officeFilter) {
        params.append("office", officeFilter);
      }

      // Add createdBy filter
      if (userFilter) {
        params.append("createdBy", userFilter);
      }

      // Use optimized list endpoint with server-side filtering
      const response = await axios.get(
        `/api/vouchers/list?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const vouchersToShow = response.data.data || [];

      setVouchers(vouchersToShow);
      setFilteredVouchers(vouchersToShow);
      setError("");
    } catch (err) {
      console.error("Error fetching vouchers:", err);
      setError("Failed to load vouchers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    yearFilter,
    dateFilter,
    arrivalYearFilter,
    arrivalDateFilter,
    statusFilter,
    officeFilter,
    userFilter,
  ]);

  // Fetch metadata for dropdowns
  const fetchMetadata = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/vouchers/metadata", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const metadata = response.data.data;
      setUniqueUsers(metadata.users || []);
      setUniqueOffices(metadata.offices || []);
      setAvailableYears(metadata.creationYears || []);
      setAvailableArrivalYears(metadata.arrivalYears || []);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  }, []);

  // Initialize user info and fetch data
  useEffect(() => {
    const initializeUserAndFetchData = async () => {
      // Check if the current user is an admin or accountant
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userIsAdmin = user.isAdmin || false;
      const userIsAccountant = user.isAccountant || false;
      const userId = user.id || null;

      setIsAdmin(userIsAdmin);
      setIsAccountant(userIsAccountant);
      setCurrentUserId(userId);

      // Fetch metadata for dropdowns
      await fetchMetadata();

      // Now fetch vouchers with the correct user info
      await fetchVouchers(userIsAdmin, userIsAccountant, userId);

      // Fetch all users if admin (for created by dropdown)
      if (userIsAdmin) {
        fetchAllUsers();
      }
    };

    initializeUserAndFetchData();
  }, [fetchVouchers, fetchMetadata]);

  const handleCreatedByUpdate = async (voucherId, newCreatedBy) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/vouchers/${voucherId}/created-by`,
        { createdBy: newCreatedBy },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setVouchers((prevVouchers) =>
        prevVouchers.map((voucher) =>
          voucher._id === voucherId
            ? { ...voucher, ...response.data.data }
            : voucher
        )
      );

      toast.success(`Voucher ownership transferred successfully`, {
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
      console.error("Error updating voucher created by:", err);
      toast.error(
        err.response?.data?.message || "Failed to update voucher ownership",
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
      throw err; // Re-throw to let CreatedByControls handle the error
    }
  };

  // Simple helper function to check if user can manage a voucher
  const canManageVoucher = (voucher) => {
    if (isAdmin || isAccountant) return true;
    return voucher.createdBy && voucher.createdBy._id === currentUserId;
  };

  // Check if user can delete vouchers (only full admins, not accountants or regular users)
  const canDeleteVoucher = () => {
    // Only full admins can delete vouchers
    return isAdmin && !isAccountant;
  };

  // Handle status update
  const handleStatusUpdate = async (voucherId, newStatus) => {
    try {
      const response = await updateVoucherStatus(voucherId, newStatus);

      // Update the voucher in the local state
      setVouchers((prevVouchers) =>
        prevVouchers.map((voucher) =>
          voucher._id === voucherId ? { ...voucher, ...response.data } : voucher
        )
      );

      toast.success(`Voucher status updated to "${newStatus}"`, {
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
      console.error("Error updating voucher status:", err);
      toast.error(
        err.response?.data?.message || "Failed to update voucher status",
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
      throw err; // Re-throw to let StatusControls handle the error
    }
  };

  // Helper function to check if a date falls within a range
  const isDateInRange = useCallback(
    (dateString, range, customDateValue = null, isArrivalDate = false) => {
      if (!dateString || !range) return true;

      const date = new Date(dateString);
      const now = new Date();

      // Handle custom date
      if (range === "custom" && customDateValue) {
        const selectedDate = new Date(customDateValue);
        const dateOnly = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const selectedDateOnly = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        return dateOnly.getTime() === selectedDateOnly.getTime();
      }

      // Handle month-based filtering
      const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];

      const monthIndex = monthNames.indexOf(range);
      if (monthIndex !== -1) {
        // Use the appropriate year filter based on whether it's arrival or creation date
        const relevantYearFilter = isArrivalDate
          ? arrivalYearFilter
          : yearFilter;
        const targetYear = relevantYearFilter
          ? parseInt(relevantYearFilter)
          : now.getFullYear();
        return (
          date.getMonth() === monthIndex && date.getFullYear() === targetYear
        );
      }

      // Handle year-based filtering
      switch (range) {
        case "this-year": {
          return date.getFullYear() === now.getFullYear();
        }

        case "last-year": {
          return date.getFullYear() === now.getFullYear() - 1;
        }

        default:
          return true;
      }
    },
    [yearFilter, arrivalYearFilter]
  );

  // Apply client-side filters (only for search query and custom dates)
  useEffect(() => {
    const applyFilters = async () => {
      // Show loading if search query is active
      if (searchQuery.trim() && vouchers.length > 0) {
        setFilterLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      let filtered = vouchers;

      // Apply search filter (client-side for real-time search)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (voucher) =>
            voucher.clientName.toLowerCase().includes(query) ||
            voucher.voucherNumber.toString().includes(query)
        );
      }

      // Apply custom creation date filter (client-side only for custom dates)
      if (dateFilter === "custom" && customDate) {
        filtered = filtered.filter((voucher) =>
          isDateInRange(voucher.createdAt, dateFilter, customDate, false)
        );
      }

      // Apply custom arrival date filter (client-side only for custom dates)
      if (arrivalDateFilter === "custom" && customArrivalDate) {
        filtered = filtered.filter((voucher) =>
          isDateInRange(
            voucher.arrivalDate,
            arrivalDateFilter,
            customArrivalDate,
            true
          )
        );
      }

      setFilteredVouchers(filtered);
      setFilterLoading(false);
    };

    applyFilters();
  }, [
    searchQuery,
    customDate,
    customArrivalDate,
    dateFilter,
    arrivalDateFilter,
    vouchers,
    isDateInRange,
  ]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatFilterLabel = (filter) => {
    if (filter === "custom") return "Custom Date";
    if (filter === "this-year") return "This Year";
    if (filter === "last-year") return "Last Year";
    return filter.charAt(0).toUpperCase() + filter.slice(1);
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);
    if (value !== "custom") {
      setCustomDate("");
    }
  };

  const handleArrivalDateFilterChange = (value) => {
    setArrivalDateFilter(value);
    if (value !== "custom") {
      setCustomArrivalDate("");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setUserFilter("");
    setOfficeFilter("");
    setYearFilter(new Date().getFullYear().toString()); // Reset to current year
    setArrivalYearFilter("");
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    setDateFilter(monthNames[new Date().getMonth()]); // Reset to current month
    setCustomDate("");
    setArrivalDateFilter("");
    setCustomArrivalDate("");
    setStatusFilter("");
  };

  // Check if any non-default filters are applied
  const hasNonDefaultFilters = () => {
    const currentYear = new Date().getFullYear().toString();
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const currentMonth = monthNames[new Date().getMonth()];

    return (
      searchQuery ||
      userFilter ||
      officeFilter ||
      yearFilter !== currentYear ||
      arrivalYearFilter ||
      dateFilter !== currentMonth ||
      arrivalDateFilter ||
      statusFilter
    );
  };

  const calculateTotals = () => {
    if (filteredVouchers.length === 0) return {};

    const totalsByCurrency = filteredVouchers.reduce((acc, voucher) => {
      const currency = voucher.currency || "USD";
      const capital = parseFloat(voucher.capital) || 0;
      const total = parseFloat(voucher.totalAmount) || 0;
      const profit = capital > 0 ? total - capital : 0;

      if (!acc[currency]) {
        acc[currency] = { totalCapital: 0, totalAmount: 0, totalProfit: 0 };
      }

      acc[currency].totalCapital += capital;
      acc[currency].totalAmount += total;
      acc[currency].totalProfit += profit;

      return acc;
    }, {});

    return totalsByCurrency;
  };

  const totals = calculateTotals();

  const handleDeleteClick = (voucher) => {
    setVoucherToDelete(voucher);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!voucherToDelete) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/vouchers/${voucherToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVouchers((prevVouchers) =>
        prevVouchers.filter((v) => v._id !== voucherToDelete._id)
      );

      toast.success(
        `Voucher #${voucherToDelete.voucherNumber} for ${voucherToDelete.clientName} has been moved to trash.`,
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
      setDeleteModal(false);
      setVoucherToDelete(null);
    } catch (err) {
      console.error("Error deleting voucher:", err);
      toast.error("Failed to delete voucher. Please try again.", {
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

  return (
    <div className="max-w-[105rem] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Vouchers
        </h1>
        <div className="flex gap-2 sm:gap-3">
          <CustomButton
            variant="gray"
            onClick={() => navigate("/vouchers/trash")}
            icon={FaTrash}
          >
            <span className="hidden sm:inline">View Trash</span>
          </CustomButton>
          <CustomButton
            variant="blueToTeal"
            onClick={() => navigate("/vouchers/new")}
            icon={FaPlus}
          >
            <span className="hidden sm:inline">Create New Voucher</span>
          </CustomButton>
        </div>
      </div>

      <Card className="dark:bg-slate-950">
        <div className="mb-4">
          <div className="mb-4">
            <Search
              id="voucher-search"
              placeholder="Search by client name or voucher number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 sm:gap-4 lg:justify-center">
            {/* Year Filter (Created) */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48">
                <Select
                  id="yearFilter"
                  value={yearFilter}
                  onChange={(value) => setYearFilter(value)}
                  placeholder="Year (Created) - All Years"
                  options={[
                    { value: "", label: "Year (Created) - All Years" },
                    ...availableYears.map((year) => ({
                      value: year.toString(),
                      label: year.toString(),
                    })),
                  ]}
                />
              </div>
            </div>

            {/* Arrival Year Filter */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48">
                <Select
                  id="arrivalYearFilter"
                  value={arrivalYearFilter}
                  onChange={(value) => setArrivalYearFilter(value)}
                  placeholder="Year (Arrival) - All Years"
                  options={[
                    { value: "", label: "Year (Arrival) - All Years" },
                    ...availableArrivalYears.map((year) => ({
                      value: year.toString(),
                      label: year.toString(),
                    })),
                  ]}
                />
              </div>
            </div>

            {/* Creation Date Filter */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48 relative">
                {/* Default filter indicator */}
                {dateFilter && dateFilter !== "" && (
                  <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-yellow-500"></span>
                    </span>
                  </div>
                )}
                <Select
                  id="dateFilter"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  placeholder="Created - All Time"
                  options={[
                    { value: "", label: "Created - All Time" },
                    { value: "january", label: "Created - January" },
                    { value: "february", label: "Created - February" },
                    { value: "march", label: "Created - March" },
                    { value: "april", label: "Created - April" },
                    { value: "may", label: "Created - May" },
                    { value: "june", label: "Created - June" },
                    { value: "july", label: "Created - July" },
                    { value: "august", label: "Created - August" },
                    { value: "september", label: "Created - September" },
                    { value: "october", label: "Created - October" },
                    { value: "november", label: "Created - November" },
                    { value: "december", label: "Created - December" },
                    { value: "custom", label: "Created - Custom Date" },
                  ]}
                />
              </div>

              {/* Custom Creation Date Picker */}
              {dateFilter === "custom" && (
                <div className="w-32 sm:w-40">
                  <CustomDatePicker
                    value={customDate}
                    onChange={setCustomDate}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              )}
            </div>

            {/* Arrival Date Filter */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48">
                <Select
                  id="arrivalDateFilter"
                  value={arrivalDateFilter}
                  onChange={handleArrivalDateFilterChange}
                  placeholder="Arrival - All Time"
                  options={[
                    { value: "", label: "Arrival - All Time" },
                    { value: "january", label: "Arrival - January" },
                    { value: "february", label: "Arrival - February" },
                    { value: "march", label: "Arrival - March" },
                    { value: "april", label: "Arrival - April" },
                    { value: "may", label: "Arrival - May" },
                    { value: "june", label: "Arrival - June" },
                    { value: "july", label: "Arrival - July" },
                    { value: "august", label: "Arrival - August" },
                    { value: "september", label: "Arrival - September" },
                    { value: "october", label: "Arrival - October" },
                    { value: "november", label: "Arrival - November" },
                    { value: "december", label: "Arrival - December" },
                    { value: "custom", label: "Arrival - Custom Date" },
                  ]}
                />
              </div>

              {/* Custom Arrival Date Picker */}
              {arrivalDateFilter === "custom" && (
                <div className="w-32 sm:w-40">
                  <CustomDatePicker
                    value={customArrivalDate}
                    onChange={setCustomArrivalDate}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select
                id="statusFilter"
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All Statuses"
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "await", label: "Awaiting" },
                  { value: "arrived", label: "Arrived" },
                  { value: "canceled", label: "Canceled" },
                ]}
              />
            </div>

            {/* User Filter - Show for admins or when there are multiple users */}
            {(isAdmin || isAccountant || uniqueUsers.length > 1) && (
              <div className="w-full sm:w-64 sm:col-span-2 lg:col-span-1">
                <SearchableSelect
                  id="userFilter"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  options={[
                    { value: "", label: "All Users" },
                    ...uniqueUsers.map((user) => ({
                      value: user._id,
                      label: user.username,
                    })),
                  ]}
                  placeholder="Search users..."
                />
              </div>
            )}

            {/* Office Filter */}
            {uniqueOffices.length > 0 && (
              <div className="w-full sm:w-64 sm:col-span-2 lg:col-span-1">
                <SearchableSelect
                  id="officeFilter"
                  value={officeFilter}
                  onChange={(e) => setOfficeFilter(e.target.value)}
                  options={[
                    { value: "", label: "All Offices" },
                    ...uniqueOffices.map((office) => ({
                      value: office,
                      label: office,
                    })),
                  ]}
                  placeholder="Search offices..."
                />
              </div>
            )}

            {/* Clear Filters Button */}
            {hasNonDefaultFilters() && (
              <div className="flex items-start sm:col-span-2 lg:col-span-1 justify-center sm:justify-start">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                >
                  <FaTimes className="w-3 h-3" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {hasNonDefaultFilters() && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Search: "{searchQuery}"
                </span>
              )}
              {userFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  User:{" "}
                  {uniqueUsers.find((user) => user._id === userFilter)
                    ?.username || "Unknown"}
                </span>
              )}
              {officeFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  Office: {officeFilter}
                </span>
              )}
              {yearFilter &&
                yearFilter !== new Date().getFullYear().toString() && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Created Year: {yearFilter}
                  </span>
                )}
              {arrivalYearFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                  Arrival Year: {arrivalYearFilter}
                </span>
              )}
              {dateFilter &&
                dateFilter !==
                  [
                    "january",
                    "february",
                    "march",
                    "april",
                    "may",
                    "june",
                    "july",
                    "august",
                    "september",
                    "october",
                    "november",
                    "december",
                  ][new Date().getMonth()] && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Created:{" "}
                    {dateFilter === "custom"
                      ? formatDate(customDate)
                      : formatFilterLabel(dateFilter)}
                    {yearFilter &&
                    [
                      "january",
                      "february",
                      "march",
                      "april",
                      "may",
                      "june",
                      "july",
                      "august",
                      "september",
                      "october",
                      "november",
                      "december",
                    ].includes(dateFilter)
                      ? ` ${yearFilter}`
                      : ""}
                  </span>
                )}
              {arrivalDateFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Arrival:{" "}
                  {arrivalDateFilter === "custom"
                    ? formatDate(customArrivalDate)
                    : formatFilterLabel(arrivalDateFilter)}
                  {arrivalYearFilter &&
                  [
                    "january",
                    "february",
                    "march",
                    "april",
                    "may",
                    "june",
                    "july",
                    "august",
                    "september",
                    "october",
                    "november",
                    "december",
                  ].includes(arrivalDateFilter)
                    ? ` ${arrivalYearFilter}`
                    : ""}
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  Status:{" "}
                  {statusFilter === "await"
                    ? "Awaiting"
                    : statusFilter === "arrived"
                    ? "Arrived"
                    : "Canceled"}
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filterLoading ? (
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ||
            userFilter ||
            officeFilter ||
            yearFilter ||
            dateFilter ||
            arrivalDateFilter
              ? "No vouchers match your filter criteria."
              : 'No vouchers found. Click "Create New Voucher" to create one.'}
          </div>
        ) : (
          <>
            {/* Voucher Count Display */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Showing {filteredVouchers.length} voucher
              {filteredVouchers.length !== 1 ? "s" : ""}
            </div>

            {/* Desktop Table View (visible on sm screens and up) */}
            <div className="hidden sm:block">
              <CustomScrollbar>
                <CustomTable
                  headers={[
                    { label: "Voucher\u00A0#" },
                    { label: "Client" },
                    { label: "Office" },
                    { label: "Status" },
                    { label: "Arrival" },
                    { label: "Departure" },
                    { label: "Capital" },
                    { label: "Total" },
                    { label: "Profit" },
                    { label: "Created" },
                    ...(isAdmin || isAccountant
                      ? [{ label: "Created By" }]
                      : []),
                    { label: "Actions" },
                  ]}
                  data={[
                    ...filteredVouchers,
                    ...(filteredVouchers.length > 0
                      ? Object.keys(totals).map((currency, index) => ({
                          _id: `totals-${currency}`,
                          isTotal: true,
                          currency,
                          isFirstTotal: index === 0,
                          ...totals[currency],
                        }))
                      : []),
                  ]}
                  renderRow={(item) => {
                    if (item.isTotal) {
                      return (
                        <>
                          {/* Voucher # */}
                          <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {item.isFirstTotal ? "TOTALS" : ""}
                          </Table.Cell>
                          {/* Client */}
                          <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {item.currency}
                          </Table.Cell>
                          {/* Office */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Status */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Arrival */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Departure */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Capital */}
                          <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {getCurrencySymbol(item.currency)}
                            {item.totalCapital.toFixed(2)}
                          </Table.Cell>
                          {/* Total */}
                          <Table.Cell className="font-bold text-sm text-gray-900 dark:text-white px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {getCurrencySymbol(item.currency)}
                            {item.totalAmount.toFixed(2)}
                          </Table.Cell>
                          {/* Profit */}
                          <Table.Cell className="font-bold text-sm text-green-600 dark:text-green-400 px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600">
                            {getCurrencySymbol(item.currency)}
                            {item.totalProfit.toFixed(2)}
                          </Table.Cell>
                          {/* Created */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          {/* Created By (if admin/accountant) */}
                          {(isAdmin || isAccountant) && (
                            <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                          )}
                          {/* Actions */}
                          <Table.Cell className="px-4 py-3 bg-gray-100 dark:bg-slate-900 border-t-2 border-gray-300 dark:border-gray-600"></Table.Cell>
                        </>
                      );
                    }

                    // Regular voucher row
                    const voucher = item;
                    return (
                      <>
                        <Table.Cell className="px-4 py-3">
                          <Link
                            to={`/vouchers/${voucher._id}`}
                            className="font-medium text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                            title={`View voucher #${voucher.voucherNumber} details`}
                          >
                            {voucher.voucherNumber}
                          </Link>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-white truncate max-w-[200px]">
                            {voucher.clientName}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {voucher.nationality}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          {voucher.officeName ? (
                            voucher.officeName.toLowerCase() ===
                            "direct client" ? (
                              <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                                Direct Client
                              </div>
                            ) : isAdmin || isAccountant ? (
                              <Link
                                to={`/office/${encodeURIComponent(
                                  voucher.officeName
                                )}`}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline truncate max-w-[150px] block"
                                title={`View ${voucher.officeName} office details`}
                              >
                                {voucher.officeName}
                              </Link>
                            ) : (
                              <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                                {voucher.officeName}
                              </div>
                            )
                          ) : (
                            <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                              Direct Client
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <StatusControls
                            currentStatus={voucher.status || "await"}
                            onStatusUpdate={(newStatus) =>
                              handleStatusUpdate(voucher._id, newStatus)
                            }
                            canEdit={isAdmin || isAccountant}
                            arrivalDate={voucher.arrivalDate}
                          />
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                          {formatDate(voucher.arrivalDate)}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                          {formatDate(voucher.departureDate)}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                          {voucher.capital
                            ? `${getCurrencySymbol(voucher.currency)}${
                                voucher.capital
                              }`
                            : "-"}
                        </Table.Cell>
                        <Table.Cell className="text-sm font-medium text-gray-900 dark:text-white px-4 py-3">
                          {getCurrencySymbol(voucher.currency)}
                          {voucher.totalAmount}
                        </Table.Cell>
                        <Table.Cell
                          className={`${getProfitColorClass(
                            voucher.capital
                              ? voucher.totalAmount - voucher.capital
                              : 0
                          )} px-4 py-3`}
                        >
                          {voucher.capital
                            ? `${getCurrencySymbol(voucher.currency)}${(
                                voucher.totalAmount - voucher.capital
                              ).toFixed(2)}`
                            : "-"}
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                          {formatDate(voucher.createdAt)}
                        </Table.Cell>
                        {(isAdmin || isAccountant) && (
                          <Table.Cell className="px-4 py-3">
                            <CreatedByControls
                              currentUserId={voucher.createdBy?._id}
                              currentUsername={voucher.createdBy?.username}
                              users={allUsers}
                              onUserUpdate={(newUserId) =>
                                handleCreatedByUpdate(voucher._id, newUserId)
                              }
                              canEdit={isAdmin} // Only full admins can edit, not accountants
                            />
                          </Table.Cell>
                        )}
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {canManageVoucher(voucher) && (
                              <>
                                <CustomButton
                                  as={Link}
                                  to={`/edit-voucher/${voucher._id}`}
                                  variant="teal"
                                  size="xs"
                                  icon={FaPen}
                                  title="Edit voucher"
                                />
                                {canDeleteVoucher() && (
                                  <CustomButton
                                    onClick={() => handleDeleteClick(voucher)}
                                    variant="red"
                                    size="xs"
                                    icon={FaTrash}
                                    title="Delete voucher"
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </Table.Cell>
                      </>
                    );
                  }}
                  emptyMessage={
                    searchQuery ||
                    userFilter ||
                    officeFilter ||
                    yearFilter ||
                    dateFilter ||
                    arrivalDateFilter
                      ? "No vouchers match your filter criteria."
                      : 'No vouchers found. Click "Create New Voucher" to create one.'
                  }
                />
              </CustomScrollbar>
            </div>

            {/* Mobile Card View (visible on xs screens) */}
            <div className="sm:hidden">
              <CustomScrollbar className="pr-1">
                <div className="grid grid-cols-1 gap-4">
                  {filteredVouchers.map((voucher) => (
                    <Card
                      key={voucher._id}
                      className="overflow-hidden shadow-sm hover:shadow dark:border-gray-700"
                    >
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                        <div>
                          <Link
                            to={`/vouchers/${voucher._id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                            title={`View voucher #${voucher.voucherNumber} details`}
                          >
                            #{voucher.voucherNumber}
                          </Link>
                          <div className="text-sm text-gray-800 dark:text-gray-200">
                            {voucher.clientName}
                          </div>
                          {voucher.officeName ? (
                            voucher.officeName.toLowerCase() ===
                            "direct client" ? (
                              <div className="text-xs text-gray-800 dark:text-gray-200">
                                Direct Client
                              </div>
                            ) : isAdmin || isAccountant ? (
                              <Link
                                to={`/office/${encodeURIComponent(
                                  voucher.officeName
                                )}`}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                title={`View ${voucher.officeName} office details`}
                              >
                                {voucher.officeName}
                              </Link>
                            ) : (
                              <div className="text-xs text-gray-800 dark:text-gray-200">
                                {voucher.officeName}
                              </div>
                            )
                          ) : (
                            <div className="text-xs text-gray-800 dark:text-gray-200">
                              Direct Client
                            </div>
                          )}
                        </div>
                        <div className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                          {voucher.nationality}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <FaPlane className="mr-2 text-blue-600 dark:text-blue-400" />
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Arrival
                            </div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(voucher.arrivalDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <FaPlane className="mr-2 text-red-600 dark:text-red-400 transform rotate-180" />
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Departure
                            </div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(voucher.departureDate)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center col-span-2">
                          <div className="flex items-center">
                            <svg
                              className="mr-2 text-purple-600 dark:text-purple-400 w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div className="mr-3">
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Status
                              </div>
                            </div>
                          </div>
                          <StatusControls
                            currentStatus={voucher.status || "await"}
                            onStatusUpdate={(newStatus) =>
                              handleStatusUpdate(voucher._id, newStatus)
                            }
                            canEdit={isAdmin || isAccountant}
                            arrivalDate={voucher.arrivalDate}
                            size="xs"
                          />
                        </div>

                        <div className="flex items-center">
                          <FaMoneyBill className="mr-2 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Total
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {getCurrencySymbol(voucher.currency)}
                              {voucher.totalAmount}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-purple-600 dark:text-purple-400" />
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Created
                            </div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(voucher.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <svg
                            className="mr-2 text-orange-600 dark:text-orange-400 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Capital
                            </div>
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {voucher.capital
                                ? `${getCurrencySymbol(voucher.currency)}${
                                    voucher.capital
                                  }`
                                : "-"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <svg
                            className="mr-2 text-emerald-600 dark:text-emerald-400 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Profit
                            </div>
                            <div
                              className={getProfitColorClass(
                                voucher.capital
                                  ? voucher.totalAmount - voucher.capital
                                  : 0
                              )}
                            >
                              {voucher.capital
                                ? `${getCurrencySymbol(voucher.currency)}${(
                                    voucher.totalAmount - voucher.capital
                                  ).toFixed(2)}`
                                : "-"}
                            </div>
                          </div>
                        </div>

                        {(isAdmin || isAccountant) && voucher.createdBy && (
                          <div className="flex items-center col-span-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <FaUser className="mr-2 text-indigo-600 dark:text-indigo-400" />
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  Created By
                                </div>
                              </div>
                              <CreatedByControls
                                currentUserId={voucher.createdBy?._id}
                                currentUsername={voucher.createdBy?.username}
                                users={allUsers}
                                onUserUpdate={(newUserId) =>
                                  handleCreatedByUpdate(voucher._id, newUserId)
                                }
                                canEdit={isAdmin} // Only full admins can edit, not accountants
                                size="xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {canManageVoucher(voucher) && (
                        <div className="flex justify-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <CustomButton
                            as={Link}
                            to={`/edit-voucher/${voucher._id}`}
                            variant="teal"
                            size="sm"
                            icon={FaPen}
                            title="Edit voucher"
                          >
                            Edit
                          </CustomButton>
                          {canDeleteVoucher() && (
                            <CustomButton
                              onClick={() => handleDeleteClick(voucher)}
                              variant="red"
                              size="sm"
                              icon={FaTrash}
                              title="Delete voucher"
                            >
                              Delete
                            </CustomButton>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CustomScrollbar>
            </div>

            {/* Mobile Totals Summary - Visible to all users */}
            {filteredVouchers.length > 0 && (
              <div className="sm:hidden mt-4 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Totals Summary
                </h3>
                {Object.keys(totals).map((currency) => (
                  <Card
                    key={currency}
                    className="mb-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {currency}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Capital
                        </div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {getCurrencySymbol(currency)}
                          {totals[currency].totalCapital.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Total
                        </div>
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {getCurrencySymbol(currency)}
                          {totals[currency].totalAmount.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Profit
                        </div>
                        <div className="font-bold text-sm text-green-600 dark:text-green-400">
                          {getCurrencySymbol(currency)}
                          {totals[currency].totalProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setVoucherToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
        itemType="voucher (move to trash)"
        itemName={`#${voucherToDelete?.voucherNumber || ""}`}
        itemExtra={voucherToDelete?.clientName || ""}
      />

      {/* Floating Totals Panel Component - Only for Admins and Accountants */}
      {(isAdmin || isAccountant) && (
        <FloatingTotalsPanel
          vouchers={vouchers}
          filteredVouchers={filteredVouchers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          uniqueUsers={uniqueUsers}
          officeFilter={officeFilter}
          setOfficeFilter={setOfficeFilter}
          uniqueOffices={uniqueOffices}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          availableYears={availableYears}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customDate={customDate}
          setCustomDate={setCustomDate}
          arrivalDateFilter={arrivalDateFilter}
          setArrivalDateFilter={setArrivalDateFilter}
          customArrivalDate={customArrivalDate}
          setCustomArrivalDate={setCustomArrivalDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleDateFilterChange={handleDateFilterChange}
          handleArrivalDateFilterChange={handleArrivalDateFilterChange}
          handleClearFilters={handleClearFilters}
          formatFilterLabel={formatFilterLabel}
        />
      )}
    </div>
  );
}

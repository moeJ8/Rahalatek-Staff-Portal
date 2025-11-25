import React, { useState, useEffect } from "react";
import { Card, Table, Alert } from "flowbite-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import CustomScrollbar from "../components/CustomScrollbar";
import CustomModal from "../components/CustomModal";
import RahalatekLoader from "../components/RahalatekLoader";
import Search from "../components/Search";
import Select from "../components/Select";
import SearchableSelect from "../components/SearchableSelect";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import BookingMessage from "../components/BookingMessage";
import CustomCheckbox from "../components/CustomCheckbox";
import DownloadPdfModal from "../components/DownloadPdfModal";
import CustomTooltip from "../components/CustomTooltip";
import {
  FaTrash,
  FaEye,
  FaEdit,
  FaCalendarAlt,
  FaDollarSign,
  FaHotel,
  FaMapMarkerAlt,
  FaUsers,
  FaPlus,
  FaUser,
  FaRoute,
  FaStar,
  FaCrown,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import Flag from "react-world-flags";

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [dateFilter, setDateFilter] = useState(() => {
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
  const [availableYears, setAvailableYears] = useState([]);
  const [userFilter, setUserFilter] = useState("");
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showHotelsModal, setShowHotelsModal] = useState(false);
  const [showToursModal, setShowToursModal] = useState(false);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [isContentManager, setIsContentManager] = useState(false);
  const [currentUserId] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || null;
  });

  // Multi-select states for bulk operations
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [bookingToDownload, setBookingToDownload] = useState(null);
  const [viewDownloadModalOpen, setViewDownloadModalOpen] = useState(false);
  const [viewBookingToDownload, setViewBookingToDownload] = useState(null);

  const getCountryCode = (country) => {
    const codes = {
      Turkey: "TR",
      Malaysia: "MY",
      Thailand: "TH",
      Indonesia: "ID",
      "Saudi Arabia": "SA",
      Morocco: "MA",
      Egypt: "EG",
      Azerbaijan: "AZ",
      Georgia: "GE",
      Albania: "AL",
    };
    return codes[country] || null;
  };

  const renderStars = (count) => {
    return Array(count)
      .fill(0)
      .map((_, i) => <FaStar key={i} className="text-yellow-400 w-4 h-4" />);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Fetch all users for the created by dropdown (admin/accountant only)
  const fetchAllUsers = React.useCallback(async () => {
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
  }, []);

  // Fetch metadata for dropdowns
  const fetchMetadata = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings/metadata", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const metadata = response.data.data;
      const yearsFromDB = metadata.creationYears || [];
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      // Combine DB years with next year, remove duplicates, and sort descending
      const allYears = [
        ...new Set([...yearsFromDB, currentYear, nextYear]),
      ].sort((a, b) => b - a);
      setAvailableYears(allYears);
      setUniqueUsers(metadata.users || []);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  }, []);

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "20");

      // Add year filter
      if (yearFilter && yearFilter !== "") {
        params.append("year", yearFilter);
      }

      // Add month filter - convert month name to number
      if (dateFilter && dateFilter !== "" && dateFilter !== "all-time") {
        params.append("month", dateFilter);
      }

      // Add createdBy filter
      if (userFilter) {
        params.append("createdBy", userFilter);
      }

      const response = await axios.get(`/api/bookings?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(response.data.data || []);
      setFilteredBookings(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setError("");
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [currentPage, yearFilter, dateFilter, userFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [yearFilter, dateFilter, userFilter]);

  // Initialize user info and fetch data
  useEffect(() => {
    const initializeUserAndFetchData = async () => {
      // Check if the current user is an admin or accountant
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userIsAdmin = user.isAdmin || false;
      const userIsAccountant = user.isAccountant || false;
      const userIsContentManager = user.isContentManager || false;

      setIsAdmin(userIsAdmin);
      setIsAccountant(userIsAccountant);
      setIsContentManager(userIsContentManager);

      // Fetch metadata for dropdowns
      await fetchMetadata();

      // Fetch all users if admin or accountant
      if (userIsAdmin || userIsAccountant) {
        await fetchAllUsers();
      }

      // Now fetch bookings with the correct filters
      await fetchBookings();
    };

    initializeUserAndFetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch bookings when filters or page change
  useEffect(() => {
    // Skip initial fetch (handled by initialization effect)
    if (
      isAdmin === false &&
      isAccountant === false &&
      isContentManager === false
    ) {
      return;
    }
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, yearFilter, dateFilter, userFilter]);

  // Clear selected bookings when filters change
  useEffect(() => {
    setSelectedBookings(new Set());
  }, [searchQuery, yearFilter, dateFilter, userFilter, currentPage]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = bookings.filter((booking) => {
      const cities = booking.selectedCities?.join(" ") || "";
      const hotels =
        booking.hotelEntries?.map((e) => e.hotelData?.name || "").join(" ") ||
        "";
      const tours =
        booking.selectedTours?.map((t) => t.name || "").join(" ") || "";
      const clientName = booking.clientName || "";
      return (
        cities.toLowerCase().includes(query) ||
        hotels.toLowerCase().includes(query) ||
        tours.toLowerCase().includes(query) ||
        clientName.toLowerCase().includes(query) ||
        booking.finalPrice?.toString().includes(query)
      );
    });
    setFilteredBookings(filtered);
  }, [searchQuery, bookings]);

  // Check if user can manage a specific booking (edit/view)
  const canManageBooking = (booking) => {
    // Full admins can manage any booking
    if (isAdmin && !isAccountant) return true;
    // Accountants can only manage their own bookings
    if (isAccountant) {
      return booking.createdBy && booking.createdBy._id === currentUserId;
    }
    // Content managers and regular users can manage their own bookings
    return booking.createdBy && booking.createdBy._id === currentUserId;
  };

  // Check if user can delete a specific booking
  const canDeleteBooking = (booking) => {
    // Full admins can delete any booking
    if (isAdmin && !isAccountant) return true;
    // Content managers can delete their own bookings
    if (
      isContentManager &&
      booking.createdBy &&
      booking.createdBy._id === currentUserId
    )
      return true;
    // Accountants can delete their own bookings
    if (
      isAccountant &&
      booking.createdBy &&
      booking.createdBy._id === currentUserId
    )
      return true;
    return false;
  };

  // Check if user can do bulk operations (only full admins)
  const canDoBulkOperations = () => {
    return isAdmin && !isAccountant;
  };

  const handleSelectBooking = (bookingId, isSelected) => {
    const newSelected = new Set(selectedBookings);
    if (isSelected) {
      newSelected.add(bookingId);
    } else {
      newSelected.delete(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      if (canDoBulkOperations()) {
        setSelectedBookings(
          new Set(filteredBookings.map((booking) => booking._id))
        );
      }
    } else {
      setSelectedBookings(new Set());
    }
  };

  const isAllSelected = () => {
    if (!canDoBulkOperations() || filteredBookings.length === 0) return false;
    return filteredBookings.every((booking) =>
      selectedBookings.has(booking._id)
    );
  };

  const handleBulkDelete = () => {
    if (selectedBookings.size === 0) return;
    setBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const bookingIds = Array.from(selectedBookings);

      // Delete all selected bookings
      await Promise.all(
        bookingIds.map((bookingId) =>
          axios.delete(`/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setSelectedBookings(new Set());
      setBulkDeleteModal(false);

      toast.success(
        `${bookingIds.length} booking${
          bookingIds.length > 1 ? "s" : ""
        } moved to trash successfully.`,
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

      fetchBookings(); // Refresh the list
    } catch (err) {
      console.error("Error bulk deleting bookings:", err);
      toast.error("Failed to delete some bookings. Please try again.", {
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
      setBulkActionLoading(false);
    }
  };

  const handleDelete = (booking) => {
    setBookingToDelete(booking);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/bookings/${bookingToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Booking moved to trash successfully", {
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
      setDeleteModal(false);
      setBookingToDelete(null);
      fetchBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
      toast.error(err.response?.data?.message || "Failed to delete booking");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setViewModal(true);
  };

  const openDownloadModal = (booking) => {
    setBookingToDownload(booking);
    setDownloadModalOpen(true);
  };

  const closeDownloadModal = () => {
    setDownloadModalOpen(false);
    setBookingToDownload(null);
  };

  const openViewDownloadModal = () => {
    if (!selectedBooking) return;
    setViewBookingToDownload(selectedBooking);
    setViewDownloadModalOpen(true);
  };

  const closeViewDownloadModal = () => {
    setViewDownloadModalOpen(false);
    setViewBookingToDownload(null);
  };

  const handleDownloadEnglish = (options = {}) => {
    if (!bookingToDownload) return;
    downloadBookingPDF(bookingToDownload._id, "en", options);
    setDownloadModalOpen(false);
  };

  const handleDownloadArabic = (options = {}) => {
    if (!bookingToDownload) return;
    downloadBookingPDF(bookingToDownload._id, "ar", options);
    setDownloadModalOpen(false);
  };

  const handleViewDownloadEnglish = (options = {}) => {
    if (!viewBookingToDownload) return;
    downloadBookingPDF(viewBookingToDownload._id, "en", options);
    closeViewDownloadModal();
  };

  const handleViewDownloadArabic = (options = {}) => {
    if (!viewBookingToDownload) return;
    downloadBookingPDF(viewBookingToDownload._id, "ar", options);
    closeViewDownloadModal();
  };

  // Download booking as PDF
  const downloadBookingPDF = async (
    bookingId,
    language = "en",
    options = {}
  ) => {
    setPdfDownloading(bookingId);
    try {
      const token = localStorage.getItem("token");

      // Build query parameters
      const params = new URLSearchParams({ lang: language });
      if (options.hideHeader) params.append("hideHeader", "true");
      if (options.hidePrice) params.append("hidePrice", "true");

      const response = await axios.get(
        `/api/bookings/${bookingId}/download-pdf?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get filename from response headers or create default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `booking-${language}-${bookingId.slice(-8)}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        language === "ar"
          ? "تم تنزيل ملف الـ PDF العربي بنجاح!"
          : "PDF downloaded successfully!",
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
    } catch (err) {
      console.error("Error downloading PDF:", err);
      toast.error(
        language === "ar"
          ? "فشل تنزيل ملف الـ PDF. يرجى المحاولة مرة أخرى."
          : "Failed to download PDF. Please try again.",
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
    } finally {
      setPdfDownloading(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setUserFilter("");
    setYearFilter(new Date().getFullYear().toString()); // Reset to current year
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
      yearFilter !== currentYear ||
      dateFilter !== currentMonth
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const truncateClientName = (name, maxLength = 12) => {
    if (!name) return "N/A";
    return name.length > maxLength ? `${name.slice(0, maxLength)}…` : name;
  };

  return (
    <div className="max-w-[110rem] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Bookings
        </h1>
        <div className="flex gap-2 sm:gap-3">
          {/* View Trash Button - Only for admins and accountants */}
          {(isAdmin || isAccountant) && (
            <CustomButton
              onClick={() => navigate("/bookings/trash")}
              variant="gray"
              icon={FaTrash}
            >
              <span className="hidden sm:inline">View Trash</span>
            </CustomButton>
          )}
          {/* Bulk Action Buttons - Show when bookings are selected */}
          {selectedBookings.size > 0 && canDoBulkOperations() && (
            <CustomButton
              variant="red"
              onClick={handleBulkDelete}
              icon={FaTrash}
            >
              <span className="hidden sm:inline">
                Delete Selected ({selectedBookings.size})
              </span>
              <span className="sm:hidden">
                Delete ({selectedBookings.size})
              </span>
            </CustomButton>
          )}
          <CustomButton
            onClick={() => navigate("/create-booking")}
            variant="blueToTeal"
            size="md"
            icon={FaPlus}
          >
            <span className="hidden sm:inline">Create New Booking</span>
            <span className="sm:hidden">New</span>
          </CustomButton>
        </div>
      </div>

      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

      <Card className="dark:bg-slate-950">
        <div className="mb-4">
          <div className="mb-4">
            <Search
              id="booking-search"
              placeholder="Search by cities, hotels, tours, client name, or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-2 sm:gap-4 lg:justify-center">
            {/* Year Filter */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48">
                <Select
                  id="yearFilter"
                  value={yearFilter}
                  onChange={(value) => setYearFilter(value)}
                  placeholder="Year - All Years"
                  options={[
                    { value: "", label: "Year - All Years" },
                    ...availableYears.map((year) => ({
                      value: year.toString(),
                      label: year.toString(),
                    })),
                  ]}
                />
              </div>
            </div>

            {/* Month Filter */}
            <div className="flex gap-2">
              <div className="w-full sm:w-48 relative">
                {/* Default filter indicator */}
                {dateFilter &&
                  dateFilter !== "" &&
                  dateFilter !== "all-time" && (
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
                  onChange={setDateFilter}
                  placeholder="Created - All Time"
                  options={[
                    { value: "all-time", label: "Created - All Time" },
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
                  ]}
                />
              </div>
            </div>

            {/* User Filter - Show for admins/accountants or when there are multiple users */}
            {(isAdmin || isAccountant || uniqueUsers.length > 1) && (
              <div className="w-full sm:w-64 sm:col-span-2 lg:col-span-1">
                <SearchableSelect
                  id="userFilter"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  options={[
                    { value: "", label: "All Users" },
                    ...(isAdmin || isAccountant
                      ? allUsers.map((user) => ({
                          value: user._id,
                          label: user.username,
                        }))
                      : uniqueUsers.map((user) => ({
                          value: user._id,
                          label: user.username,
                        }))),
                  ]}
                  placeholder="Search users..."
                />
              </div>
            )}

            {/* Clear Filters Button */}
            <div className="flex items-center sm:col-span-2 lg:col-span-1 justify-center sm:justify-start">
              <button
                onClick={handleClearFilters}
                disabled={!hasNonDefaultFilters()}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 hover:scale-105 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <FaTimes className="w-3 h-3" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-8">
            <RahalatekLoader size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "No bookings match your filter criteria."
              : 'No bookings found. Click "Create New Booking" to create one.'}
          </div>
        ) : (
          <>
            {/* Booking Count Display */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Showing {filteredBookings.length} booking
              {filteredBookings.length !== 1 ? "s" : ""}
            </div>

            {/* Desktop Table View (visible on lg screens and up) */}
            <div className="hidden lg:block">
              <CustomScrollbar>
                <CustomTable
                  headers={[
                    ...(canDoBulkOperations()
                      ? [
                          {
                            label: (
                              <div className="flex items-center justify-center">
                                <CustomCheckbox
                                  id="select-all-bookings"
                                  checked={isAllSelected()}
                                  onChange={handleSelectAll}
                                />
                              </div>
                            ),
                            className: "w-10 min-w-[40px] max-w-[40px]",
                          },
                        ]
                      : []),
                    { label: "Date Range" },
                    { label: "Client Name" },
                    { label: "Cities" },
                    { label: "Hotels" },
                    { label: "Tours" },
                    { label: "Guests" },
                    { label: "Price" },
                    { label: "Created" },
                    ...(isAdmin || isAccountant
                      ? [
                          {
                            label: "Created By",
                          },
                        ]
                      : []),
                    { label: "Actions" },
                  ]}
                  data={filteredBookings}
                  renderRow={(booking) => {
                    const isSelected = selectedBookings.has(booking._id);

                    return (
                      <>
                        {/* Checkbox column */}
                        {canDoBulkOperations() && (
                          <Table.Cell className="px-2 py-3 w-10 min-w-[40px] max-w-[40px]">
                            <div className="flex items-center justify-center">
                              <CustomCheckbox
                                id={`booking-checkbox-${booking._id}`}
                                checked={isSelected}
                                onChange={(checked) =>
                                  handleSelectBooking(booking._id, checked)
                                }
                              />
                            </div>
                          </Table.Cell>
                        )}
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(booking.startDate)}
                              </div>
                              <div className="text-xs text-gray-500">
                                to {formatDate(booking.endDate)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {booking.nights} nights
                              </div>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-3 py-3">
                          <CustomTooltip
                            disabled={!booking.nationality}
                            title={booking.clientName || "N/A"}
                            content={
                              booking.nationality
                                ? `Nationality: ${booking.nationality}`
                                : ""
                            }
                          >
                            <span className="text-sm text-gray-900 dark:text-white cursor-help block">
                              {truncateClientName(booking.clientName)}
                            </span>
                          </CustomTooltip>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {booking.selectedCities?.slice(0, 2).join(", ")}
                              {booking.selectedCities?.length > 2 &&
                                ` +${booking.selectedCities.length - 2}`}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <FaHotel className="text-gray-400" />
                            <span
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer hover:underline"
                              onClick={() => {
                                setSelectedBookingForModal(booking);
                                setShowHotelsModal(true);
                              }}
                            >
                              {booking.hotelEntries?.length || 0} hotel
                              {booking.hotelEntries?.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <FaRoute className="text-gray-400" />
                            <span
                              className="text-sm text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer hover:underline"
                              onClick={() => {
                                setSelectedBookingForModal(booking);
                                setShowToursModal(true);
                              }}
                            >
                              {booking.selectedTours?.length || 0} tour
                              {booking.selectedTours?.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <FaUsers className="text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {booking.numGuests} adult
                              {booking.numGuests !== 1 ? "s" : ""}
                              {booking.includeChildren && (
                                <span className="text-gray-500">
                                  {" "}
                                  +{" "}
                                  {booking.childrenUnder3 +
                                    booking.children3to6 +
                                    booking.children6to12}{" "}
                                  children
                                </span>
                              )}
                            </span>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            ${booking.finalPrice?.toFixed(2) || "0.00"}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                          {formatDate(booking.createdAt)}
                        </Table.Cell>
                        {(isAdmin || isAccountant) && (
                          <Table.Cell className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <FaUser className="text-gray-400" />
                              {booking.createdBy?._id ? (
                                <Link
                                  to={`/profile/${booking.createdBy._id}`}
                                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
                                >
                                  {booking.createdBy.username || "N/A"}
                                </Link>
                              ) : (
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {booking.createdBy?.username || "N/A"}
                                </span>
                              )}
                            </div>
                          </Table.Cell>
                        )}
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <CustomButton
                              variant="gray"
                              size="xs"
                              onClick={() => handleView(booking)}
                              icon={FaEye}
                              title="View booking details"
                            />
                            <CustomButton
                              variant="green"
                              size="xs"
                              onClick={() => openDownloadModal(booking)}
                              icon={FaDownload}
                              title="Download PDF"
                              disabled={pdfDownloading === booking._id}
                              loading={pdfDownloading === booking._id}
                            />
                            {canManageBooking(booking) && (
                              <CustomButton
                                variant="blueToTeal"
                                size="xs"
                                onClick={() =>
                                  navigate(`/bookings/edit/${booking._id}`)
                                }
                                icon={FaEdit}
                                title="Edit booking"
                              />
                            )}
                            {canDeleteBooking(booking) && (
                              <CustomButton
                                variant="red"
                                size="xs"
                                onClick={() => handleDelete(booking)}
                                icon={FaTrash}
                                title="Delete booking"
                              />
                            )}
                          </div>
                        </Table.Cell>
                      </>
                    );
                  }}
                  emptyMessage={
                    searchQuery
                      ? "No bookings match your filter criteria."
                      : 'No bookings found. Click "Create New Booking" to create one.'
                  }
                />
              </CustomScrollbar>
            </div>

            {/* Mobile/Tablet Card View (visible on screens smaller than lg) */}
            <div className="lg:hidden">
              <CustomScrollbar className="pr-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBookings.map((booking) => {
                    const isSelected = selectedBookings.has(booking._id);

                    return (
                      <Card
                        key={booking._id}
                        className={`overflow-hidden shadow-sm hover:shadow dark:border-gray-700 dark:bg-slate-900 ${
                          isSelected
                            ? "ring-2 ring-blue-500 dark:ring-blue-400"
                            : ""
                        }`}
                      >
                        {/* Mobile Checkbox */}
                        {canDoBulkOperations() && (
                          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <CustomCheckbox
                              id={`mobile-booking-checkbox-${booking._id}`}
                              label="Select for bulk action"
                              checked={isSelected}
                              onChange={(checked) =>
                                handleSelectBooking(booking._id, checked)
                              }
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                          <div>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                              Booking
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(booking.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Date Range
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {formatDate(booking.startDate)} -{" "}
                                {formatDate(booking.endDate)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.nights} nights
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FaUser className="mr-2 text-teal-600 dark:text-teal-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Client Name
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100 max-w-[8rem] truncate">
                                {truncateClientName(booking.clientName, 14)}
                              </div>
                              {booking.nationality && (
                                <div className="text-xs text-gray-500 dark:text-gray-300">
                                  {booking.nationality}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FaDollarSign className="mr-2 text-green-600 dark:text-green-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Price
                              </div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                ${booking.finalPrice?.toFixed(2) || "0.00"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-purple-600 dark:text-purple-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Cities
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {booking.selectedCities?.slice(0, 2).join(", ")}
                                {booking.selectedCities?.length > 2 &&
                                  ` +${booking.selectedCities.length - 2}`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FaHotel className="mr-2 text-orange-600 dark:text-orange-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Hotels
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {booking.hotelEntries?.length || 0} hotel
                                {booking.hotelEntries?.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FaRoute className="mr-2 text-purple-600 dark:text-purple-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Tours
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {booking.selectedTours?.length || 0} tour
                                {booking.selectedTours?.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center col-span-2">
                            <FaUsers className="mr-2 text-indigo-600 dark:text-indigo-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Guests
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {booking.numGuests} adult
                                {booking.numGuests !== 1 ? "s" : ""}
                                {booking.includeChildren && (
                                  <span className="text-gray-500">
                                    {" "}
                                    +{" "}
                                    {booking.childrenUnder3 +
                                      booking.children3to6 +
                                      booking.children6to12}{" "}
                                    children
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {(isAdmin || isAccountant) && (
                            <div className="flex items-center col-span-2">
                              <FaUser className="mr-2 text-teal-600 dark:text-teal-400" />
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  Created By
                                </div>
                                {booking.createdBy?._id ? (
                                  <Link
                                    to={`/profile/${booking.createdBy._id}`}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
                                  >
                                    {booking.createdBy.username || "N/A"}
                                  </Link>
                                ) : (
                                  <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {booking.createdBy?.username || "N/A"}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <CustomButton
                            variant="gray"
                            size="xs"
                            onClick={() => handleView(booking)}
                            icon={FaEye}
                          >
                            View
                          </CustomButton>
                          <CustomButton
                            variant="green"
                            size="xs"
                            onClick={() => openDownloadModal(booking)}
                            icon={FaDownload}
                            disabled={pdfDownloading === booking._id}
                            loading={pdfDownloading === booking._id}
                          >
                            {pdfDownloading === booking._id
                              ? "Downloading..."
                              : "PDF"}
                          </CustomButton>
                          {canManageBooking(booking) && (
                            <CustomButton
                              variant="blueToTeal"
                              size="xs"
                              onClick={() =>
                                navigate(`/bookings/edit/${booking._id}`)
                              }
                              icon={FaEdit}
                            >
                              Edit
                            </CustomButton>
                          )}
                          {canDeleteBooking(booking) && (
                            <CustomButton
                              variant="red"
                              size="xs"
                              onClick={() => handleDelete(booking)}
                              icon={FaTrash}
                            >
                              Delete
                            </CustomButton>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CustomScrollbar>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <CustomButton
                  variant="gray"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </CustomButton>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <CustomButton
                  variant="gray"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </CustomButton>
              </div>
            )}
          </>
        )}
      </Card>

      {/* View Modal */}
      <CustomModal
        isOpen={viewModal}
        onClose={() => {
          setViewModal(false);
          closeViewDownloadModal();
        }}
        title="Booking Details"
        maxWidth="md:max-w-screen-2xl"
        maxHeight="max-h-[95vh]"
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Client
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-[10rem] sm:max-w-none truncate">
                  {selectedBooking.clientName || "N/A"}
                  {selectedBooking.nationality && (
                    <span className="text-xs text-gray-500 block sm:inline sm:ml-1">
                      {selectedBooking.nationality}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Date Range
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {formatDate(selectedBooking.startDate)} -{" "}
                  {formatDate(selectedBooking.endDate)}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedBooking.nights} nights
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Cities
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedBooking.selectedCities?.join(", ")}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Guests
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedBooking.numGuests} adults
                  {selectedBooking.includeChildren && (
                    <>
                      <br />
                      {selectedBooking.childrenUnder3 > 0 &&
                        `${selectedBooking.childrenUnder3} children 0-3, `}
                      {selectedBooking.children3to6 > 0 &&
                        `${selectedBooking.children3to6} children 3-6, `}
                      {selectedBooking.children6to12 > 0 &&
                        `${selectedBooking.children6to12} children 6-12`}
                    </>
                  )}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Hotels
                </h3>
                <p
                  className="text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer hover:underline"
                  onClick={() => {
                    setSelectedBookingForModal(selectedBooking);
                    setShowHotelsModal(true);
                  }}
                >
                  {selectedBooking.hotelEntries?.length || 0} hotel(s)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Tours
                </h3>
                <p
                  className="text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer hover:underline"
                  onClick={() => {
                    setSelectedBookingForModal(selectedBooking);
                    setShowToursModal(true);
                  }}
                >
                  {selectedBooking.selectedTours?.length || 0} tour(s)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Price
                </h3>
                <p className="text-lg font-bold text-green-600">
                  ${selectedBooking.finalPrice?.toFixed(2)}
                </p>
                {selectedBooking.manualPrice && (
                  <p className="text-xs text-gray-500">
                    Manual price (calculated: $
                    {selectedBooking.calculatedPrice?.toFixed(2)})
                  </p>
                )}
              </div>
              {(isAdmin || isAccountant) && (
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Created By
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedBooking.createdBy?.username ? (
                      <Link
                        to={`/profile/${selectedBooking.createdBy._id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        {selectedBooking.createdBy.username}
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Generated Message
                </h3>
                <CustomButton
                  variant="green"
                  size="sm"
                  icon={FaDownload}
                  onClick={openViewDownloadModal}
                  disabled={pdfDownloading === selectedBooking._id}
                  loading={pdfDownloading === selectedBooking._id}
                >
                  Download PDF
                </CustomButton>
              </div>
              <BookingMessage
                message={selectedBooking.generatedMessage}
                messageEnglish={selectedBooking.generatedMessageEnglish || ""}
              />
            </div>

            <DownloadPdfModal
              show={viewDownloadModalOpen}
              onClose={closeViewDownloadModal}
              booking={viewBookingToDownload}
              onDownloadEnglish={handleViewDownloadEnglish}
              onDownloadArabic={handleViewDownloadArabic}
              isDownloading={
                viewBookingToDownload
                  ? pdfDownloading === viewBookingToDownload._id
                  : false
              }
            />
          </div>
        )}
      </CustomModal>

      <DownloadPdfModal
        show={downloadModalOpen}
        onClose={closeDownloadModal}
        booking={bookingToDownload}
        onDownloadEnglish={handleDownloadEnglish}
        onDownloadArabic={handleDownloadArabic}
        isDownloading={
          bookingToDownload ? pdfDownloading === bookingToDownload._id : false
        }
      />

      {/* Single Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setBookingToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
        itemType="booking (move to trash)"
        itemName={`Booking from ${formatDate(bookingToDelete?.startDate)}`}
      />

      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteConfirm}
        isLoading={bulkActionLoading}
        itemType={`${selectedBookings.size} booking${
          selectedBookings.size > 1 ? "s" : ""
        } (move to trash)`}
        itemName=""
        itemExtra=""
      />

      {/* Hotels Modal */}
      <CustomModal
        isOpen={showHotelsModal}
        onClose={() => {
          setShowHotelsModal(false);
          setSelectedBookingForModal(null);
        }}
        title="Booking Hotels"
        subtitle={
          selectedBookingForModal?.hotelEntries?.length
            ? `${selectedBookingForModal.hotelEntries.length} hotel${
                selectedBookingForModal.hotelEntries.length !== 1 ? "s" : ""
              } included`
            : "No hotels"
        }
        maxWidth="md:max-w-2xl"
        zIndex={10000}
      >
        <div className="space-y-3">
          {selectedBookingForModal?.hotelEntries?.map((hotel, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2 text-sm">
                    {hotel.hotelData?.slug ? (
                      <Link
                        to={`/hotels/${hotel.hotelData.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
                      >
                        {hotel.hotelData.name || `Hotel ${index + 1}`}
                      </Link>
                    ) : (
                      <span className="text-gray-900 dark:text-white">
                        {hotel.hotelData?.name || `Hotel ${index + 1}`}
                      </span>
                    )}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                      <span>
                        {hotel.hotelData?.city || "City not specified"}
                      </span>
                      {hotel.hotelData?.country &&
                        getCountryCode(hotel.hotelData.country) && (
                          <Flag
                            code={getCountryCode(hotel.hotelData.country)}
                            height="16"
                            width="20"
                            className="rounded-sm"
                          />
                        )}
                    </div>
                    {hotel.hotelData?.stars && (
                      <div className="flex items-center gap-2">
                        <FaStar className="w-4 h-4 text-yellow-500" />
                        <span>{hotel.hotelData.stars} star hotel</span>
                        <div className="flex">
                          {renderStars(hotel.hotelData.stars)}
                        </div>
                      </div>
                    )}
                    {hotel.checkIn && hotel.checkOut && (
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-4 h-4 text-blue-600 dark:text-teal-400" />
                        <span>
                          {formatDateForDisplay(hotel.checkIn)} -{" "}
                          {formatDateForDisplay(hotel.checkOut)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-bold ${
                            hotel.includeBreakfast
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {hotel.includeBreakfast ? "✓" : "✗"}
                        </span>
                        <span className="text-xs">Breakfast</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-bold ${
                            hotel.includeReception
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {hotel.includeReception ? "✓" : "✗"}
                        </span>
                        <span className="text-xs">Airport Reception</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-bold ${
                            hotel.includeFarewell
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {hotel.includeFarewell ? "✓" : "✗"}
                        </span>
                        <span className="text-xs">Airport Farewell</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CustomModal>

      {/* Tours Modal */}
      <CustomModal
        isOpen={showToursModal}
        onClose={() => {
          setShowToursModal(false);
          setSelectedBookingForModal(null);
        }}
        title="Booking Tours"
        subtitle={
          selectedBookingForModal?.selectedTours?.length
            ? `${selectedBookingForModal.selectedTours.length} tour${
                selectedBookingForModal.selectedTours.length !== 1 ? "s" : ""
              } included`
            : "No tours"
        }
        maxWidth="md:max-w-2xl"
        zIndex={10000}
      >
        <div className="space-y-3">
          {selectedBookingForModal?.selectedTours?.length > 0 ? (
            selectedBookingForModal.selectedTours.map((tour, index) => {
              const tourData = typeof tour === "object" ? tour : { _id: tour };
              return (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">
                          {tourData.slug ? (
                            <Link
                              to={`/tours/${tourData.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
                            >
                              {tourData.name || `Tour ${index + 1}`}
                            </Link>
                          ) : (
                            <span className="text-gray-900 dark:text-white">
                              {tourData.name || `Tour ${index + 1}`}
                            </span>
                          )}
                        </h4>
                        {tourData.tourType === "VIP" ? (
                          <FaCrown className="text-amber-500 w-4 h-4" />
                        ) : (
                          <FaUsers className="text-blue-600 dark:text-teal-400 w-4 h-4" />
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            tourData.tourType === "VIP"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                              : "bg-blue-100 text-blue-800 dark:bg-teal-900 dark:text-teal-200"
                          }`}
                        >
                          {tourData.tourType || "Tour"}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                          <span>{tourData.city || "City not specified"}</span>
                          {tourData.country &&
                            getCountryCode(tourData.country) && (
                              <Flag
                                code={getCountryCode(tourData.country)}
                                height="16"
                                width="20"
                                className="rounded-sm"
                              />
                            )}
                        </div>
                        {tourData.duration && (
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="w-4 h-4 text-blue-500" />
                            <span>{tourData.duration} hours</span>
                          </div>
                        )}
                        {tourData.price && tourData.price > 0 ? (
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              Capital: ${tourData.price}
                              {tourData.totalPrice &&
                                tourData.totalPrice > 0 && (
                                  <span className="ml-2 text-green-600 dark:text-green-400">
                                    | Total: ${tourData.totalPrice}
                                  </span>
                                )}
                              <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                                {tourData.tourType === "Group"
                                  ? "per person"
                                  : "per car"}
                              </span>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <FaDollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-500 dark:text-gray-400">
                              No price available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FaUsers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tours assigned to this booking</p>
            </div>
          )}
        </div>
      </CustomModal>
    </div>
  );
}

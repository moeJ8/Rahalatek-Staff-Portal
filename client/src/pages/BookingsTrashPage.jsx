import React, { useState, useEffect, useCallback } from "react";
import { Card, Table, Alert } from "flowbite-react";
import RahalatekLoader from "../components/RahalatekLoader";
import CustomButton from "../components/CustomButton";
import CustomTable from "../components/CustomTable";
import Search from "../components/Search";
import CustomScrollbar from "../components/CustomScrollbar";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import RestoreConfirmationModal from "../components/RestoreConfirmationModal";
import CustomCheckbox from "../components/CustomCheckbox";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaTrash,
  FaTrashRestore,
  FaCalendarAlt,
  FaDollarSign,
  FaHotel,
  FaMapMarkerAlt,
  FaUsers,
  FaUser,
  FaRoute,
  FaStar,
  FaCrown,
} from "react-icons/fa";
import Flag from "react-world-flags";
import CustomModal from "../components/CustomModal";

export default function BookingsTrashPage() {
  const [trashedBookings, setTrashedBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restoreModal, setRestoreModal] = useState(false);
  const [permanentDeleteModal, setPermanentDeleteModal] = useState(false);
  const [bookingToRestore, setBookingToRestore] = useState(null);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAccountant, setIsAccountant] = useState(false);
  const [showHotelsModal, setShowHotelsModal] = useState(false);
  const [showToursModal, setShowToursModal] = useState(false);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);

  // Multi-select states for bulk operations
  const [selectedBookings, setSelectedBookings] = useState(new Set());
  const [bulkRestoreModal, setBulkRestoreModal] = useState(false);
  const [bulkPermanentDeleteModal, setBulkPermanentDeleteModal] =
    useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const fetchTrashedBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings/trash", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTrashedBookings(response.data.data || []);
      setFilteredBookings(response.data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching trashed bookings:", err);
      setError("Failed to load trashed bookings. Please try again.");
      toast.error("Failed to load trashed bookings", {
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsAdmin(user.isAdmin || false);
    setIsAccountant(user.isAccountant || false);

    fetchTrashedBookings();
  }, [fetchTrashedBookings]);

  // Apply search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookings(trashedBookings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = trashedBookings.filter((booking) => {
      const cities = booking.selectedCities?.join(" ") || "";
      const hotels =
        booking.hotelEntries?.map((e) => e.hotelData?.name || "").join(" ") ||
        "";
      return (
        cities.toLowerCase().includes(query) ||
        hotels.toLowerCase().includes(query) ||
        booking.finalPrice?.toString().includes(query)
      );
    });
    setFilteredBookings(filtered);
  }, [searchQuery, trashedBookings]);

  // Multi-select helper functions
  const canManageBooking = () => {
    // Only full admins can manage bookings in trash (restore/delete)
    // Regular users and accountants cannot restore or permanently delete bookings
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
      if (canManageBooking()) {
        setSelectedBookings(
          new Set(filteredBookings.map((booking) => booking._id))
        );
      }
    } else {
      setSelectedBookings(new Set());
    }
  };

  const isAllSelected = () => {
    if (!canManageBooking() || filteredBookings.length === 0) return false;
    return filteredBookings.every((booking) =>
      selectedBookings.has(booking._id)
    );
  };

  const handleBulkRestore = () => {
    if (selectedBookings.size === 0) return;
    setBulkRestoreModal(true);
  };

  const handleBulkPermanentDelete = () => {
    if (selectedBookings.size === 0) return;
    setBulkPermanentDeleteModal(true);
  };

  const handleBulkRestoreConfirm = async () => {
    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const bookingIds = Array.from(selectedBookings);

      // Restore all selected bookings
      await Promise.all(
        bookingIds.map((bookingId) =>
          axios.post(
            `/api/bookings/${bookingId}/restore`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
      );

      setSelectedBookings(new Set());
      setBulkRestoreModal(false);

      toast.success(
        `${bookingIds.length} booking${
          bookingIds.length > 1 ? "s" : ""
        } restored successfully.`,
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

      fetchTrashedBookings(); // Refresh the list
    } catch (err) {
      console.error("Error bulk restoring bookings:", err);
      toast.error("Failed to restore some bookings. Please try again.", {
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

  const handleBulkPermanentDeleteConfirm = async () => {
    setBulkActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const bookingIds = Array.from(selectedBookings);

      // Permanently delete all selected bookings
      await Promise.all(
        bookingIds.map((bookingId) =>
          axios.delete(`/api/bookings/${bookingId}/permanent`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setSelectedBookings(new Set());
      setBulkPermanentDeleteModal(false);

      toast.success(
        `${bookingIds.length} booking${
          bookingIds.length > 1 ? "s" : ""
        } permanently deleted.`,
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

      fetchTrashedBookings(); // Refresh the list
    } catch (err) {
      console.error("Error bulk permanently deleting bookings:", err);
      toast.error(
        "Failed to permanently delete some bookings. Please try again.",
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
      setBulkActionLoading(false);
    }
  };

  const handleRestoreClick = (booking) => {
    setBookingToRestore(booking);
    setRestoreModal(true);
  };

  const handleRestoreConfirm = async () => {
    if (!bookingToRestore) return;

    setRestoreLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/bookings/${bookingToRestore._id}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Booking restored successfully", {
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

      setRestoreModal(false);
      setBookingToRestore(null);
      fetchTrashedBookings();
    } catch (err) {
      console.error("Error restoring booking:", err);
      toast.error(err.response?.data?.message || "Failed to restore booking", {
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
      setRestoreLoading(false);
    }
  };

  const handlePermanentDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setPermanentDeleteModal(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!bookingToDelete) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/bookings/${bookingToDelete._id}/permanent`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Booking permanently deleted", {
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

      setPermanentDeleteModal(false);
      setBookingToDelete(null);
      fetchTrashedBookings();
    } catch (err) {
      console.error("Error permanently deleting booking:", err);
      toast.error(
        err.response?.data?.message || "Failed to permanently delete booking",
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
      setDeleteLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="dark:bg-slate-900">
          <Alert color="failure">
            You do not have permission to view trashed bookings. Only
            administrators can access this page.
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[105rem] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Bookings Trash
        </h1>
        <div className="flex gap-2 sm:gap-3">
          {/* Bulk Action Buttons - Show when bookings are selected */}
          {selectedBookings.size > 0 && canManageBooking() && (
            <>
              <CustomButton
                variant="green"
                onClick={handleBulkRestore}
                icon={FaTrashRestore}
              >
                <span className="hidden sm:inline">
                  Restore Selected ({selectedBookings.size})
                </span>
                <span className="sm:hidden">
                  Restore ({selectedBookings.size})
                </span>
              </CustomButton>
              <CustomButton
                variant="red"
                onClick={handleBulkPermanentDelete}
                icon={FaTrash}
              >
                <span className="hidden sm:inline">
                  Delete Forever ({selectedBookings.size})
                </span>
                <span className="sm:hidden">
                  Delete ({selectedBookings.size})
                </span>
              </CustomButton>
            </>
          )}
          <Link to="/bookings">
            <CustomButton variant="gray">Back to Bookings</CustomButton>
          </Link>
        </div>
      </div>

      <Card className="dark:bg-slate-950">
        <div className="mb-4">
          <Search
            id="trash-booking-search"
            placeholder="Search by cities, hotels, or price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              ? "No trashed bookings match your search."
              : "No trashed bookings found."}
          </div>
        ) : (
          <>
            {/* Booking Count Display */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Showing {filteredBookings.length} trashed booking
              {filteredBookings.length !== 1 ? "s" : ""}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block">
              <CustomScrollbar>
                <CustomTable
                  headers={[
                    ...(canManageBooking()
                      ? [
                          {
                            label: (
                              <div className="flex items-center justify-center">
                                <CustomCheckbox
                                  id="select-all-trash-bookings"
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
                    { label: "Nationality" },
                    { label: "Cities" },
                    { label: "Hotels" },
                    { label: "Tours" },
                    { label: "Guests" },
                    { label: "Price" },
                    { label: "Created By" },
                    { label: "Deleted" },
                    { label: "Actions" },
                  ]}
                  data={filteredBookings}
                  renderRow={(booking) => {
                    const isSelected = selectedBookings.has(booking._id);

                    return (
                      <>
                        {/* Checkbox column */}
                        {canManageBooking() && (
                          <Table.Cell className="px-2 py-3 w-10 min-w-[40px] max-w-[40px]">
                            <div className="flex items-center justify-center">
                              <CustomCheckbox
                                id={`trash-booking-checkbox-${booking._id}`}
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
                        <Table.Cell className="px-4 py-3">
                          <div className="text-sm text-gray-900 dark:text-white truncate max-w-[200px]">
                            {booking.clientName || "N/A"}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {booking.nationality || "N/A"}
                          </span>
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
                          <div className="font-semibold text-gray-900 dark:text-white">
                            ${booking.finalPrice?.toFixed(2) || "0.00"}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                            <FaUser className="text-gray-400" />
                            {booking.createdBy?._id ? (
                              <Link
                                to={`/profile/${booking.createdBy._id}`}
                                className="text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
                              >
                                {booking.createdBy.username || "N/A"}
                              </Link>
                            ) : (
                              <span>
                                {booking.createdBy?.username || "N/A"}
                              </span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-sm text-gray-900 dark:text-white px-4 py-3">
                          {formatDate(booking.deletedAt)}
                        </Table.Cell>
                        <Table.Cell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <CustomButton
                              variant="green"
                              size="xs"
                              onClick={() => handleRestoreClick(booking)}
                              icon={FaTrashRestore}
                              title="Restore booking"
                            />
                            <CustomButton
                              variant="red"
                              size="xs"
                              onClick={() =>
                                handlePermanentDeleteClick(booking)
                              }
                              icon={FaTrash}
                              title="Delete forever"
                            />
                          </div>
                        </Table.Cell>
                      </>
                    );
                  }}
                  emptyMessage={
                    searchQuery
                      ? "No trashed bookings match your search."
                      : "No trashed bookings found."
                  }
                />
              </CustomScrollbar>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden">
              <CustomScrollbar className="pr-1">
                <div className="grid grid-cols-1 gap-4">
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
                        {canManageBooking() && (
                          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <CustomCheckbox
                              id={`mobile-trash-booking-checkbox-${booking._id}`}
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
                              Deleted {formatDate(booking.deletedAt)}
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
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {booking.clientName || "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <FaUser className="mr-2 text-blue-600 dark:text-blue-400" />
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                Nationality
                              </div>
                              <div className="text-sm text-gray-900 dark:text-gray-100">
                                {booking.nationality || "N/A"}
                              </div>
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
                        </div>

                        <div className="flex justify-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <CustomButton
                            variant="green"
                            size="sm"
                            onClick={() => handleRestoreClick(booking)}
                            icon={FaTrashRestore}
                          >
                            Restore
                          </CustomButton>
                          <CustomButton
                            variant="red"
                            size="sm"
                            onClick={() => handlePermanentDeleteClick(booking)}
                            icon={FaTrash}
                          >
                            Delete Forever
                          </CustomButton>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CustomScrollbar>
            </div>
          </>
        )}
      </Card>

      {/* Restore Confirmation Modal */}
      <RestoreConfirmationModal
        show={restoreModal}
        onClose={() => {
          setRestoreModal(false);
          setBookingToRestore(null);
        }}
        onConfirm={handleRestoreConfirm}
        isLoading={restoreLoading}
        itemType="booking"
        itemName={`Booking from ${formatDate(bookingToRestore?.startDate)}`}
      />

      {/* Permanent Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={permanentDeleteModal}
        onClose={() => {
          setPermanentDeleteModal(false);
          setBookingToDelete(null);
        }}
        onConfirm={handlePermanentDeleteConfirm}
        isLoading={deleteLoading}
        itemType="booking (permanently delete)"
        itemName={`Booking from ${formatDate(bookingToDelete?.startDate)}`}
        itemExtra="This action cannot be undone!"
        confirmText="Delete Forever"
        confirmVariant="red"
      />

      {/* Bulk Restore Confirmation Modal */}
      <RestoreConfirmationModal
        show={bulkRestoreModal}
        onClose={() => setBulkRestoreModal(false)}
        onConfirm={handleBulkRestoreConfirm}
        isLoading={bulkActionLoading}
        itemType={`${selectedBookings.size} booking${
          selectedBookings.size > 1 ? "s" : ""
        }`}
        itemName=""
        itemExtra=""
      />

      {/* Bulk Permanent Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={bulkPermanentDeleteModal}
        onClose={() => setBulkPermanentDeleteModal(false)}
        onConfirm={handleBulkPermanentDeleteConfirm}
        isLoading={bulkActionLoading}
        itemType={`${selectedBookings.size} booking${
          selectedBookings.size > 1 ? "s" : ""
        } (permanently delete)`}
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
                          {formatDate(hotel.checkIn)} -{" "}
                          {formatDate(hotel.checkOut)}
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

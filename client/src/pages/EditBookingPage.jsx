import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Alert } from "flowbite-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import BookingForm from "../components/BookingForm";
import CustomButton from "../components/CustomButton";
import RahalatekLoader from "../components/RahalatekLoader";
import { FaArrowLeft } from "react-icons/fa";

export default function EditBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch booking data
        const response = await axios.get(`/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const bookingData = response.data.data;

        // Check permissions
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const isAdmin = user.isAdmin || false;
        const isAccountant = user.isAccountant || false;
        const currentUserId = user.id || null;

        // Check if user has permission to edit
        if (
          !isAdmin &&
          !isAccountant &&
          (!bookingData.createdBy ||
            bookingData.createdBy._id !== currentUserId)
        ) {
          toast.error("You do not have permission to edit this booking.", {
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
          navigate("/bookings");
          return;
        }

        setBooking(bookingData);
        setError("");
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Failed to load booking. Please try again.");
        toast.error("Failed to load booking data. Please try again.", {
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
        navigate("/bookings");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBooking();
    }
  }, [id, navigate]);

  const handleUpdate = () => {
    // BookingForm already shows a success toast on save
    // Here we can add any additional logic if needed in the future
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RahalatekLoader size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="dark:bg-slate-900">
          <div className="text-center py-8">
            <Alert color="failure">{error || "Booking not found"}</Alert>
            <div className="mt-4">
              <Link to="/bookings">
                <CustomButton variant="gray">Back to Bookings</CustomButton>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Prepare initial data for BookingForm
  // Convert dates to ISO string format for date inputs
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const initialData = {
    clientName: booking.clientName || "",
    nationality: booking.nationality || "",
    startDate: formatDateForInput(booking.startDate),
    endDate: formatDateForInput(booking.endDate),
    nights: booking.nights,
    numGuests: booking.numGuests,
    includeChildren: booking.includeChildren,
    childrenUnder3: booking.childrenUnder3,
    children3to6: booking.children3to6,
    children6to12: booking.children6to12,
    selectedCountries: booking.selectedCountries || [],
    selectedCities: booking.selectedCities || [],
    hotelEntries: (booking.hotelEntries || []).map((entry) => ({
      ...entry,
      checkIn: formatDateForInput(entry.checkIn),
      checkOut: formatDateForInput(entry.checkOut),
    })),
    selectedTours: booking.selectedTours || [],
    dailyItinerary: booking.dailyItinerary || [],
    calculatedPrice: booking.calculatedPrice,
    manualPrice: booking.manualPrice ?? null,
    finalPrice: booking.finalPrice,
    priceBreakdown: booking.priceBreakdown,
    generatedMessage: booking.generatedMessage,
    generatedMessageEnglish: booking.generatedMessageEnglish || "",
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[105rem] mx-auto">
          <div className="mb-4">
            <Link
              to="/bookings"
              className="flex items-center text-blue-600 hover:underline dark:text-blue-500"
            >
              <FaArrowLeft className="mr-2" />
              Back to Bookings
            </Link>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold dark:text-white">Edit Booking</h1>
            <CustomButton
              onClick={() => navigate("/bookings")}
              variant="blueToTeal"
              size="md"
            >
              View All Bookings
            </CustomButton>
          </div>

          <Card className="dark:bg-slate-900 shadow-lg">
            <BookingForm
              initialData={initialData}
              bookingId={id}
              onUpdate={handleUpdate}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

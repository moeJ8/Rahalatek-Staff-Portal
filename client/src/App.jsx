import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import React, { useState, useEffect, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestOnlyRoute from "./components/GuestOnlyRoute";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StayOnTop from "./components/StayOnTop";
import ScrollToTop from "./components/ScrollToTop";
import RahalatekLoader from "./components/RahalatekLoader";
import FloatingContactButtons from "./components/FloatingContactButtons";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";

// Lazy load all page components
import AdminPage from "./pages/AdminPage"; // Import directly for faster load
import HomePage from "./pages/HomePage"; // Import directly - default landing page after sign-in
const BookingPage = React.lazy(() => import("./pages/BookingPage"));
const SignInPage = React.lazy(() => import("./pages/SignInPage"));
const ToursPage = React.lazy(() => import("./pages/ToursPage"));
const EditTourPage = React.lazy(() => import("./pages/EditTourPage"));
const HotelsPage = React.lazy(() => import("./pages/HotelsPage"));
const EditHotelPage = React.lazy(() => import("./pages/EditHotelPage"));
const EditOfficePage = React.lazy(() => import("./pages/EditOfficePage"));
const VouchersPage = React.lazy(() => import("./pages/VouchersPage"));
const VoucherDetailPage = React.lazy(() => import("./pages/VoucherDetailPage"));
const EditVoucherPage = React.lazy(() => import("./pages/EditVoucherPage"));
const CreateVoucherPage = React.lazy(() => import("./pages/CreateVoucherPage"));
const TrashPage = React.lazy(() => import("./pages/TrashPage"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const OfficeDetailPage = React.lazy(() => import("./pages/OfficeDetailPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const AttendancePage = React.lazy(() => import("./pages/AttendancePage"));
const EmailVerificationPage = React.lazy(() =>
  import("./pages/EmailVerificationPage")
);
const PublicHotelPage = React.lazy(() =>
  import("./pages/Visitors/PublicHotelPage")
);
const PublicTourPage = React.lazy(() =>
  import("./pages/Visitors/PublicTourPage")
);
const GuestHotelsPage = React.lazy(() =>
  import("./pages/Visitors/GuestHotelsPage")
);
const GuestToursPage = React.lazy(() =>
  import("./pages/Visitors/GuestToursPage")
);
const TourismPage = React.lazy(() => import("./pages/Visitors/TourismPage"));
const HotelBookingPage = React.lazy(() =>
  import("./pages/Visitors/HotelBookingPage")
);
const AirportServicePage = React.lazy(() =>
  import("./pages/Visitors/AirportServicePage")
);
const LuxurySuitesPage = React.lazy(() =>
  import("./pages/Visitors/LuxurySuitesPage")
);
const GuestHomePage = React.lazy(() =>
  import("./pages/Visitors/GuestHomePage")
);
const GuestCountryPage = React.lazy(() =>
  import("./pages/Visitors/GuestCountryPage")
);
const GuestCityPage = React.lazy(() =>
  import("./pages/Visitors/GuestCityPage")
);
const PublicPackagesPage = React.lazy(() =>
  import("./pages/Visitors/PublicPackagesPage")
);
const PublicPackagePage = React.lazy(() =>
  import("./pages/Visitors/PublicPackagePage")
);
const ContactUsPage = React.lazy(() =>
  import("./pages/Visitors/ContactUsPage")
);
const AboutUsPage = React.lazy(() => import("./pages/Visitors/AboutUsPage"));
const BlogListPage = React.lazy(() => import("./pages/Visitors/BlogListPage"));
const BlogDetailPage = React.lazy(() =>
  import("./pages/Visitors/BlogDetailPage")
);
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage"));
const GuestNotFoundPage = React.lazy(() =>
  import("./pages/Visitors/GuestNotFoundPage")
);

// Component to track route changes for Google Analytics
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when route changes
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-R4QCLW1LT3", {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);

  return null; // This component doesn't render anything
};

// Component to conditionally render ScrollToTop based on current route
const ConditionalScrollToTop = () => {
  const location = useLocation();
  const isOfficeDetailPage = location.pathname.startsWith("/office/");

  return <ScrollToTop className={isOfficeDetailPage ? "md:hidden" : ""} />;
};

// Component to conditionally render FloatingContactButtons on guest/public pages
const ConditionalFloatingContact = () => {
  const location = useLocation();

  // Show on guest pages and public detail pages, hide on authenticated pages
  const isGuestPage =
    location.pathname === "/" ||
    location.pathname === "/signin" ||
    location.pathname === "/ar/signin" ||
    location.pathname === "/fr/signin" ||
    location.pathname === "/contact" ||
    location.pathname === "/about" ||
    location.pathname === "/tourism" ||
    location.pathname === "/hotel-booking" ||
    location.pathname === "/airport-service" ||
    location.pathname === "/luxury-suites" ||
    location.pathname.startsWith("/guest/") ||
    location.pathname.startsWith("/ar/") ||
    location.pathname.startsWith("/fr/") ||
    location.pathname.startsWith("/hotels/") ||
    location.pathname.startsWith("/tours/") ||
    location.pathname.startsWith("/packages/") ||
    location.pathname.startsWith("/country/") ||
    location.pathname.startsWith("/blog") ||
    location.pathname.includes("/city/");
  // Hide specifically on blog detail pages
  const isBlogDetail = /^\/(ar|fr)\/blog\/.+|^\/blog\/.+/.test(
    location.pathname
  );

  if (!isGuestPage || isBlogDetail) return null;

  return <FloatingContactButtons />;
};

// Show only on blog detail pages: WhatsApp floating button
const ConditionalFloatingWhatsApp = () => {
  const location = useLocation();
  const isBlogDetail = /^\/(ar|fr)\/blog\/.+|^\/blog\/.+/.test(
    location.pathname
  );
  if (!isBlogDetail) return null;
  return <FloatingWhatsAppButton />;
};

// Component to conditionally render Footer (hide on sign-in page)
const ConditionalFooter = () => {
  const location = useLocation();

  // Hide footer on sign-in page (including language-prefixed versions)
  if (
    location.pathname === "/signin" ||
    location.pathname === "/ar/signin" ||
    location.pathname === "/fr/signin"
  )
    return null;

  return <Footer />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userInfo = localStorage.getItem("user");
      if (userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="xl" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen flex flex-col">
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            zIndex: 9999,
          },
        }}
      />
      <BrowserRouter>
        <RouteTracker />
        <StayOnTop />
        <ConditionalScrollToTop />
        <ConditionalFloatingContact />
        <ConditionalFloatingWhatsApp />
        <Header />

        <main className="flex-grow">
          <Suspense
            fallback={
              <div className="py-8 flex justify-center">
                <RahalatekLoader size="md" />
              </div>
            }
          >
            <Routes>
              <Route
                path="/signin"
                element={
                  user ? (
                    <Navigate
                      to={user.isPublisher ? "/dashboard?tab=blog" : "/home"}
                    />
                  ) : (
                    <SignInPage />
                  )
                }
              />
              <Route
                path="/ar/signin"
                element={
                  user ? (
                    <Navigate
                      to={user.isPublisher ? "/dashboard?tab=blog" : "/home"}
                    />
                  ) : (
                    <SignInPage />
                  )
                }
              />
              <Route
                path="/fr/signin"
                element={
                  user ? (
                    <Navigate
                      to={user.isPublisher ? "/dashboard?tab=blog" : "/home"}
                    />
                  ) : (
                    <SignInPage />
                  )
                }
              />
              <Route path="/verify-email" element={<EmailVerificationPage />} />

              {/* Protected Routes - Admin, Accountant, ContentManager, and Publisher access */}
              <Route element={<ProtectedRoute requirePublisher={true} />}>
                <Route path="/dashboard" element={<AdminPage />} />
                <Route
                  path="/dashboard/edit-tour/:id"
                  element={<EditTourPage />}
                />
                <Route
                  path="/dashboard/edit-hotel/:id"
                  element={<EditHotelPage />}
                />
                <Route path="/edit-office/:id" element={<EditOfficePage />} />
                <Route
                  path="/office/:officeName"
                  element={<OfficeDetailPage />}
                />
                <Route
                  path="/client/:clientName"
                  element={<OfficeDetailPage />}
                />
              </Route>

              {/* Internal system routes - NOT for Publishers */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/vouchers" element={<VouchersPage />} />
                <Route path="/vouchers/new" element={<CreateVoucherPage />} />
                <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
                <Route path="/edit-voucher/:id" element={<EditVoucherPage />} />
                <Route path="/vouchers/trash" element={<TrashPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/notifications/manage" element={<AdminPage />} />
              </Route>

              {/* Routes accessible to all authenticated users (including Publishers and normal users) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/tours" element={<ToursPage />} />
                <Route path="/hotels" element={<HotelsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/attendance" element={<AttendancePage />} />
              </Route>

              {/* Public Routes - Accessible to everyone (authenticated or not) */}

              {/* Language-specific public pages for SEO (Arabic and French) */}
              <Route path="/ar" element={<GuestHomePage />} />
              <Route path="/fr" element={<GuestHomePage />} />
              <Route path="/ar/guest/tours" element={<GuestToursPage />} />
              <Route path="/fr/guest/tours" element={<GuestToursPage />} />
              <Route path="/ar/guest/hotels" element={<GuestHotelsPage />} />
              <Route path="/fr/guest/hotels" element={<GuestHotelsPage />} />
              <Route path="/ar/tourism" element={<TourismPage />} />
              <Route path="/fr/tourism" element={<TourismPage />} />
              <Route path="/ar/hotel-booking" element={<HotelBookingPage />} />
              <Route path="/fr/hotel-booking" element={<HotelBookingPage />} />
              <Route
                path="/ar/airport-service"
                element={<AirportServicePage />}
              />
              <Route
                path="/fr/airport-service"
                element={<AirportServicePage />}
              />
              <Route path="/ar/luxury-suites" element={<LuxurySuitesPage />} />
              <Route path="/fr/luxury-suites" element={<LuxurySuitesPage />} />
              <Route path="/ar/packages" element={<PublicPackagesPage />} />
              <Route path="/fr/packages" element={<PublicPackagesPage />} />
              <Route path="/ar/contact" element={<ContactUsPage />} />
              <Route path="/fr/contact" element={<ContactUsPage />} />
              <Route path="/ar/about" element={<AboutUsPage />} />
              <Route path="/fr/about" element={<AboutUsPage />} />
              <Route path="/ar/blog" element={<BlogListPage />} />
              <Route path="/fr/blog" element={<BlogListPage />} />
              <Route path="/ar/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/fr/blog/:slug" element={<BlogDetailPage />} />
              <Route
                path="/ar/country/:country"
                element={<GuestCountryPage />}
              />
              <Route
                path="/fr/country/:country"
                element={<GuestCountryPage />}
              />
              <Route
                path="/ar/country/:country/city/:city"
                element={<GuestCityPage />}
              />
              <Route
                path="/fr/country/:country/city/:city"
                element={<GuestCityPage />}
              />
              <Route path="/ar/tours/:slug" element={<PublicTourPage />} />
              <Route path="/fr/tours/:slug" element={<PublicTourPage />} />
              <Route path="/ar/hotels/:slug" element={<PublicHotelPage />} />
              <Route path="/fr/hotels/:slug" element={<PublicHotelPage />} />
              <Route
                path="/ar/packages/:slug"
                element={<PublicPackagePage />}
              />
              <Route
                path="/fr/packages/:slug"
                element={<PublicPackagePage />}
              />

              {/* Regular public pages (English/default) */}
              <Route path="/" element={<GuestHomePage />} />
              <Route path="/guest/hotels" element={<GuestHotelsPage />} />
              <Route path="/guest/tours" element={<GuestToursPage />} />
              <Route path="/tourism" element={<TourismPage />} />
              <Route path="/hotel-booking" element={<HotelBookingPage />} />
              <Route path="/airport-service" element={<AirportServicePage />} />
              <Route path="/luxury-suites" element={<LuxurySuitesPage />} />
              <Route path="/packages" element={<PublicPackagesPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/country/:country" element={<GuestCountryPage />} />
              <Route
                path="/country/:country/city/:city"
                element={<GuestCityPage />}
              />

              {/* Regular detail routes (English/default) */}
              <Route path="/hotels/:slug" element={<PublicHotelPage />} />
              <Route path="/tours/:slug" element={<PublicTourPage />} />
              <Route path="/packages/:slug" element={<PublicPackagePage />} />

              <Route
                path="*"
                element={user ? <NotFoundPage /> : <GuestNotFoundPage />}
              />
            </Routes>
          </Suspense>
        </main>

        <ConditionalFooter />
      </BrowserRouter>
    </div>
  );
}

export default App;

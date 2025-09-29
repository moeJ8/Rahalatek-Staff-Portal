import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import React, { useState, useEffect, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/ProtectedRoute'
import GuestOnlyRoute from './components/GuestOnlyRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import StayOnTop from './components/StayOnTop'
import ScrollToTop from './components/ScrollToTop'
import RahalatekLoader from './components/RahalatekLoader'

// Lazy load all page components
const AdminPage = React.lazy(() => import('./pages/AdminPage'))
const BookingPage = React.lazy(() => import('./pages/BookingPage'))
const HomePage = React.lazy(() => import('./pages/HomePage'))
const SignInPage = React.lazy(() => import('./pages/SignInPage'))
const ToursPage = React.lazy(() => import('./pages/ToursPage'))
const EditTourPage = React.lazy(() => import('./pages/EditTourPage'))
const HotelsPage = React.lazy(() => import('./pages/HotelsPage'))
const EditHotelPage = React.lazy(() => import('./pages/EditHotelPage'))
const EditOfficePage = React.lazy(() => import('./pages/EditOfficePage'))
const VouchersPage = React.lazy(() => import('./pages/VouchersPage'))
const VoucherDetailPage = React.lazy(() => import('./pages/VoucherDetailPage'))
const EditVoucherPage = React.lazy(() => import('./pages/EditVoucherPage'))
const CreateVoucherPage = React.lazy(() => import('./pages/CreateVoucherPage'))
const TrashPage = React.lazy(() => import('./pages/TrashPage'))
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'))
const OfficeDetailPage = React.lazy(() => import('./pages/OfficeDetailPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))
const AttendancePage = React.lazy(() => import('./pages/AttendancePage'))
const EmailVerificationPage = React.lazy(() => import('./pages/EmailVerificationPage'))
const PublicHotelPage = React.lazy(() => import('./pages/PublicHotelPage'))
const PublicTourPage = React.lazy(() => import('./pages/PublicTourPage'))
const GuestHotelsPage = React.lazy(() => import('./pages/GuestHotelsPage'))
const GuestToursPage = React.lazy(() => import('./pages/GuestToursPage'))
const GuestHomePage = React.lazy(() => import('./pages/Visitors/GuestHomePage'))
const GuestCountryPage = React.lazy(() => import('./pages/Visitors/GuestCountryPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))
const GuestNotFoundPage = React.lazy(() => import('./pages/GuestNotFoundPage'))

// Component to conditionally render ScrollToTop based on current route
const ConditionalScrollToTop = () => {
  const location = useLocation();
  const isOfficeDetailPage = location.pathname.startsWith('/office/');
  
  return (
    <ScrollToTop 
      className={isOfficeDetailPage ? 'md:hidden' : ''} 
    />
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          setUser(JSON.parse(userInfo));
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
    
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
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
      <Toaster position="bottom-center" />
      <BrowserRouter>
        <StayOnTop />
        <ConditionalScrollToTop />
        <Header />
        
        <main className="flex-grow">
          <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
              <RahalatekLoader size="xl" />
            </div>
          }>
            <Routes>
              <Route path="/signin" element={user ? <Navigate to="/home" /> : <SignInPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              
              {/* Protected Routes - Admin and Accountant access */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/dashboard" element={<AdminPage />} />
                <Route path="/dashboard/edit-tour/:id" element={<EditTourPage />} />
                <Route path="/dashboard/edit-hotel/:id" element={<EditHotelPage />} />
                <Route path="/edit-office/:id" element={<EditOfficePage />} />
                <Route path="/office/:officeName" element={<OfficeDetailPage />} />
                <Route path="/client/:clientName" element={<OfficeDetailPage />} />
              </Route>
              
              <Route element={<ProtectedRoute requireAdmin={false} />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/vouchers" element={<VouchersPage />} />
                <Route path="/vouchers/new" element={<CreateVoucherPage />} />
                <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
                <Route path="/edit-voucher/:id" element={<EditVoucherPage />} />
                <Route path="/vouchers/trash" element={<TrashPage />} />
                <Route path="/tours" element={<ToursPage />} />
                <Route path="/hotels" element={<HotelsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/notifications/manage" element={<AdminPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
              </Route>
              
              {/* Guest Only Routes - Only accessible to non-authenticated users */}
              <Route element={<GuestOnlyRoute />}>
                <Route path="/" element={<GuestHomePage />} />
                <Route path="/guest/hotels" element={<GuestHotelsPage />} />
                <Route path="/guest/tours" element={<GuestToursPage />} />
                <Route path="/country/:country" element={<GuestCountryPage />} />
              </Route>
              
              {/* Public Routes - Accessible without authentication */}
              <Route path="/hotels/:slug" element={<PublicHotelPage />} />
              <Route path="/tours/:slug" element={<PublicTourPage />} />
              
              <Route path="*" element={user ? <NotFoundPage /> : <GuestNotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import BookingPage from './pages/BookingPage'
import HomePage from './pages/HomePage'
import SignInPage from './pages/SignInPage'
import ToursPage from './pages/ToursPage'
import EditTourPage from './pages/EditTourPage'
import HotelsPage from './pages/HotelsPage'
import EditHotelPage from './pages/EditHotelPage'
import EditOfficePage from './pages/EditOfficePage'
import VouchersPage from './pages/VouchersPage'
import VoucherDetailPage from './pages/VoucherDetailPage'
import EditVoucherPage from './pages/EditVoucherPage'
import CreateVoucherPage from './pages/CreateVoucherPage'
import TrashPage from './pages/TrashPage'
import NotificationsPage from './pages/NotificationsPage'
import OfficeDetailPage from './pages/OfficeDetailPage'
import ProfilePage from './pages/ProfilePage'
import AttendancePage from './pages/AttendancePage'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import StayOnTop from './components/StayOnTop'
import ScrollToTop from './components/ScrollToTop'
import RahalatekLoader from './components/RahalatekLoader'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

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
          <Routes>
            <Route path="/signin" element={user ? <Navigate to="/" /> : <SignInPage />} />
            
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
              <Route path="/" element={<HomePage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/home" element={<Navigate to="/booking" replace />} />
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
            
            <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/signin" />} />
          </Routes>
        </main>
        
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App

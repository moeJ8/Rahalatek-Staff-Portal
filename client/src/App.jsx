import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import WorkerPage from './pages/WorkerPage'
import SignInPage from './pages/SignInPage'
import ToursPage from './pages/ToursPage'
import EditTourPage from './pages/EditTourPage'
import HotelsPage from './pages/HotelsPage'
import EditHotelPage from './pages/EditHotelPage'
import VouchersPage from './pages/VouchersPage'
import VoucherDetailPage from './pages/VoucherDetailPage'
import EditVoucherPage from './pages/EditVoucherPage'
import CreateVoucherPage from './pages/CreateVoucherPage'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import StayOnTop from './components/StayOnTop'
import ScrollToTop from './components/ScrollToTop'
import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

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
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <Toaster position="bottom-center" />
      <BrowserRouter>
        <StayOnTop />
        <ScrollToTop />
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              user ? <Navigate to="/home" /> : <Navigate to="/signin" />
            } />
            <Route path="/signin" element={user ? <Navigate to="/" /> : <SignInPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/edit-tour/:id" element={<EditTourPage />} />
              <Route path="/admin/edit-hotel/:id" element={<EditHotelPage />} />
            </Route>
            
            <Route element={<ProtectedRoute requireAdmin={false} />}>
              <Route path="/home" element={<WorkerPage />} />
              <Route path="/vouchers" element={<VouchersPage />} />
              <Route path="/vouchers/new" element={<CreateVoucherPage />} />
              <Route path="/vouchers/:id" element={<VoucherDetailPage />} />
              <Route path="/edit-voucher/:id" element={<EditVoucherPage />} />
              <Route path="/tours" element={<ToursPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
            </Route>
            
            <Route path="*" element={user ? <Navigate to="/home" /> : <Navigate to="/signin" />} />
          </Routes>
        </main>
        
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App

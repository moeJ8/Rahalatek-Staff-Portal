import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import WorkerPage from './pages/WorkerPage'
import SignInPage from './pages/SignInPage'
import ToursPage from './pages/ToursPage'
import EditTourPage from './pages/EditTourPage'
import HotelsPage from './pages/HotelsPage'
import EditHotelPage from './pages/EditHotelPage'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from 'react-hot-toast'


// Flowbite theme customization


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
        <Toaster position="bottom-center" />
        <BrowserRouter>
          <Header />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                user ? <Navigate to="/home" /> : <Navigate to="/signin" />
              } />
              <Route path="/signin" element={user ? <Navigate to="/" /> : <SignInPage />} />

              <Route path="/tours" element={<ToursPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/edit-tour/:id" element={<EditTourPage />} />
                <Route path="/admin/edit-hotel/:id" element={<EditHotelPage />} />
              </Route>
              
              <Route element={<ProtectedRoute requireAdmin={false} />}>
                <Route path="/home" element={<WorkerPage />} />
              </Route>
              
              {/* Catch-all route - redirect any undefined path to home */}
              <Route path="*" element={user ? <Navigate to="/home" /> : <Navigate to="/signin" />} />
            </Routes>
          </main>
          
          <Footer />
        </BrowserRouter>
      </div>
    </ThemeProvider>
  )
}

export default App

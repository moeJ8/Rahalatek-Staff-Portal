import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from 'flowbite-react';
import QrScanner from 'qr-scanner';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { FaCalendarDay, FaClock, FaQrcode, FaSignInAlt, FaSignOutAlt, FaCamera, FaStop } from 'react-icons/fa';
import CustomButton from '../components/CustomButton';
import RahalatekLoader from '../components/RahalatekLoader';

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch attendance status on component mount
  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  // Cleanup QR scanner on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const fetchAttendanceStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/attendance/status', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAttendanceStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance status:', error);
      toast.error('Failed to load attendance status');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDisplayTime = (timeString) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30';
      case 'checked-out':
        return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30';
      case 'not-checked-in':
      default:
        return 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-500/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'checked-in':
        return 'Checked In';
      case 'checked-out':
        return 'Checked Out';
      case 'not-checked-in':
      default:
        return 'Not Checked In';
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      // Wait a bit for the video element to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Stop existing scanner if any
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }

      // Create new scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleQRScan(result.data);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast.error('Failed to start camera. Please check camera permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const handleQRScan = async (qrData) => {
    try {
      setActionLoading(true);
      stopScanning();

      const token = localStorage.getItem('token');
      
      // Determine action based on current status
      const action = attendanceStatus?.status === 'checked-in' ? 'check-out' : 'check-in';
      const endpoint = action === 'check-in' ? '/api/attendance/check-in' : '/api/attendance/check-out';
      
      let response;
      if (action === 'check-in') {
        response = await axios.post(endpoint, 
          { qrCodeData: qrData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(endpoint, {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success(response.data.message, {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      });

      // Refresh attendance status
      await fetchAttendanceStatus();
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to process attendance', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/attendance/check-out', {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message, {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      });

      // Refresh attendance status
      await fetchAttendanceStatus();
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '16px',
          padding: '16px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <RahalatekLoader size="xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="max-w-md mx-auto pt-8 relative z-10">
        {/* Header - Current Time */}
        <Card className="mb-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FaClock className="text-blue-500 dark:text-blue-400 mr-2" />
              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Current Time</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-mono tracking-wider">
              {formatTime(currentTime)}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              {formatDate(currentTime)}
            </div>
          </div>
        </Card>

        {/* Today's Attendance Status */}
        <Card className="mb-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <FaCalendarDay className="text-green-500 dark:text-green-400 mr-2" />
              <span className="text-gray-900 dark:text-white font-semibold">Today's Attendance</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(attendanceStatus?.status)}`}>
              {getStatusText(attendanceStatus?.status)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Check In</div>
              <div className="text-gray-900 dark:text-white font-mono text-sm">
                {formatDisplayTime(attendanceStatus?.checkIn)}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Check Out</div>
              <div className="text-gray-900 dark:text-white font-mono text-sm">
                {formatDisplayTime(attendanceStatus?.checkOut)}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Hours Worked</div>
              <div className="text-gray-900 dark:text-white font-mono text-sm">
                {attendanceStatus?.hoursWorked ? `${attendanceStatus.hoursWorked}h` : '--'}
              </div>
            </div>
          </div>
        </Card>

        {/* QR Scanner Section */}
        <Card className="mb-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <FaQrcode className="text-purple-500 dark:text-purple-400 mr-2 text-lg" />
            <span className="text-gray-900 dark:text-white font-semibold">Attendance Check-In/Out</span>
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              {attendanceStatus?.status === 'checked-in' 
                ? 'Scan QR code to check out' 
                : attendanceStatus?.status === 'checked-out'
                ? 'You have completed work for today'
                : 'Scan QR code to check in'
              }
            </p>
          </div>

          {/* Camera/Scanner Area */}
          <div className="mb-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className={`w-full h-64 object-cover ${!isScanning ? 'hidden' : ''}`}
                playsInline
                muted
              />
              {!isScanning && (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <FaCamera className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Camera will appear here</p>
                  </div>
                </div>
              )}
              {isScanning && (
                <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg">
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-blue-400"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-blue-400"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-blue-400"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-blue-400"></div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {attendanceStatus?.status === 'checked-out' ? (
              <div className="text-center py-4">
                <div className="text-green-500 dark:text-green-400 text-sm font-medium">
                  ✓ Work completed for today
                </div>
              </div>
            ) : (
              <>
                {!isScanning ? (
                  <CustomButton
                    variant="blueToTeal"
                    size="lg"
                    onClick={startScanning}
                    icon={FaCamera}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center">
                        <RahalatekLoader size="sm" />
                        <span className="ml-2">Processing...</span>
                      </div>
                    ) : (
                      `Start Camera to ${attendanceStatus?.status === 'checked-in' ? 'Check Out' : 'Check In'}`
                    )}
                  </CustomButton>
                ) : (
                  <CustomButton
                    variant="red"
                    size="lg"
                    onClick={stopScanning}
                    icon={FaStop}
                    className="w-full"
                  >
                    Stop Scanning
                  </CustomButton>
                )}

                {/* Manual check out button for checked-in users */}
                {attendanceStatus?.status === 'checked-in' && !isScanning && (
                  <CustomButton
                    variant="green"
                    size="lg"
                    onClick={handleCheckOut}
                    icon={FaSignOutAlt}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center">
                        <RahalatekLoader size="sm" />
                        <span className="ml-2">Checking Out...</span>
                      </div>
                    ) : (
                      'Check Out Now'
                    )}
                  </CustomButton>
                )}
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-800/30 rounded-lg">
            <div className="text-gray-600 dark:text-gray-300 text-xs">
              <div className="font-semibold mb-1">How to use:</div>
              <div>1. Tap "Start Camera" to open QR scanner</div>
              <div>2. Point camera at the QR code displayed in office</div>
              <div>3. Scanner will automatically detect and process attendance</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

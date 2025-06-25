import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DriverLayout from './DriverLayout';
import DriverOverview from './DriverOverview';
import DriverProfile from './DriverProfile';
import RouteManagement from './RouteManagement';
import BookingManagement from './BookingManagement';
import MessagingCenter from './MessagingCenter';

const DriverDashboard = () => {
  return (
    <DriverLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/driver/overview" replace />} />
        <Route path="/overview" element={<DriverOverview />} />
        <Route path="/profile" element={<DriverProfile />} />
        <Route path="/routes" element={<RouteManagement />} />
        <Route path="/bookings" element={<BookingManagement />} />
        <Route path="/messages" element={<MessagingCenter />} />
      </Routes>
    </DriverLayout>
  );
};

export default DriverDashboard;


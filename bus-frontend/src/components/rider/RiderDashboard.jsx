import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RiderLayout from './RiderLayout';
import RiderOverview from './RiderOverview';
import RiderProfile from './RiderProfile';
import DriverSearch from './DriverSearch';
import BookingHistory from './BookingHistory';
import MessagingCenter from './MessagingCenter';

const RiderDashboard = () => {
  return (
    <RiderLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/rider/overview" replace />} />
        <Route path="/overview" element={<RiderOverview />} />
        <Route path="/profile" element={<RiderProfile />} />
        <Route path="/search" element={<DriverSearch />} />
        <Route path="/bookings" element={<BookingHistory />} />
        <Route path="/messages" element={<MessagingCenter />} />
      </Routes>
    </RiderLayout>
  );
};

export default RiderDashboard;


import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminOverview from './AdminOverview';
import UserManagement from './UserManagement';
import SystemAnalytics from './SystemAnalytics';
import BillingManagement from './BillingManagement';
import ReportsCenter from './ReportsCenter';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="analytics" element={<SystemAnalytics />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="reports" element={<ReportsCenter />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminDashboard;


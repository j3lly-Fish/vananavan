import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/auth-context';
import { Toaster } from '@/components/ui/sonner';

// Import components
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import DriverDashboard from './components/driver/DriverDashboard';
import RiderDashboard from './components/rider/RiderDashboard';
import LoadingSpinner from './components/ui/LoadingSpinner';

import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Redirect based on user role
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'driver':
        return <Navigate to="/driver" replace />;
      case 'rider':
        return <Navigate to="/rider" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'driver':
      return <Navigate to="/driver" replace />;
    case 'rider':
      return <Navigate to="/rider" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />

              {/* Dashboard Redirect */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />

              {/* Role-based Protected Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                        <p className="text-gray-600">Coming Soon</p>
                      </div>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/driver/*" 
                element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rider/*" 
                element={
                  <ProtectedRoute allowedRoles={['rider']}>
                    <RiderDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Error Routes */}
              <Route 
                path="/unauthorized" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">401</h1>
                      <p className="text-xl text-gray-600 mb-8">Unauthorized Access</p>
                      <p className="text-gray-500">You don't have permission to access this page.</p>
                    </div>
                  </div>
                } 
              />
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
                      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
                    </div>
                  </div>
                } 
              />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;


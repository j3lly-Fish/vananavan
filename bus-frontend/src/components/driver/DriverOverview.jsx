import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { driverAPI, routeAPI, bookingAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Route, 
  Calendar, 
  Users, 
  Star, 
  TrendingUp, 
  MessageSquare,
  Plus,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const DriverOverview = () => {
  // Fetch driver stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['driver-stats'],
    queryFn: () => driverAPI.getStats().then(res => res.data)
  });

  // Fetch driver routes
  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['my-routes'],
    queryFn: () => routeAPI.getMyRoutes().then(res => res.data)
  });

  // Fetch recent bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingAPI.getMyBookings().then(res => res.data)
  });

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (statsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load dashboard data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const recentBookings = bookings?.slice(0, 5) || [];
  const activeRoutes = routes?.filter(route => route.status === 'active') || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-2">
          Manage your routes, bookings, and connect with families.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_routes || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeRoutes.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_bookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_bookings || 0} total bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicle Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.vehicle_capacity || 0}</div>
            <p className="text-xs text-muted-foreground">
              passengers maximum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.rating ? stats.rating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_ratings || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your transportation business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/driver/routes">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>Create New Route</span>
              </Button>
            </Link>
            <Link to="/driver/bookings">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Calendar className="h-6 w-6" />
                <span>Manage Bookings</span>
              </Button>
            </Link>
            <Link to="/driver/messages">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <MessageSquare className="h-6 w-6" />
                <span>View Messages</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Routes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Routes</CardTitle>
              <CardDescription>Your currently available routes</CardDescription>
            </div>
            <Link to="/driver/routes">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {routesLoading ? (
              <LoadingSpinner />
            ) : activeRoutes.length > 0 ? (
              <div className="space-y-4">
                {activeRoutes.slice(0, 3).map((route) => (
                  <div key={route.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{route.route_name}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{route.capacity} seats</span>
                        <span className="mx-2">•</span>
                        <span>{route.current_bookings} booked</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={route.current_bookings >= route.capacity ? "destructive" : "secondary"}>
                        {route.current_bookings >= route.capacity ? 'Full' : 'Available'}
                      </Badge>
                      {route.price_per_month && (
                        <div className="text-sm text-gray-500 mt-1">
                          ${route.price_per_month}/mo
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active routes</h3>
                <p className="text-gray-500 mb-4">Create your first route to start accepting bookings.</p>
                <Link to="/driver/routes">
                  <Button>Create Route</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking requests and updates</CardDescription>
            </div>
            <Link to="/driver/bookings">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <LoadingSpinner />
            ) : recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{booking.rider?.student_name}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(booking.start_date).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{booking.booking_type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          booking.status === 'completed' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {booking.status}
                      </Badge>
                      {booking.total_amount && (
                        <div className="text-sm text-gray-500 mt-1">
                          ${booking.total_amount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent bookings</h3>
                <p className="text-gray-500">Bookings will appear here once families start booking your routes.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Performance Insights
          </CardTitle>
          <CardDescription>
            Tips to improve your service and attract more bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Complete Your Profile</h4>
              <p className="text-sm text-blue-700">
                Add a photo and detailed bio to build trust with families.
              </p>
              <Link to="/driver/profile">
                <Button variant="link" className="p-0 h-auto text-blue-600">
                  Update Profile →
                </Button>
              </Link>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Optimize Routes</h4>
              <p className="text-sm text-green-700">
                Add detailed pickup locations and competitive pricing.
              </p>
              <Link to="/driver/routes">
                <Button variant="link" className="p-0 h-auto text-green-600">
                  Manage Routes →
                </Button>
              </Link>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Stay Connected</h4>
              <p className="text-sm text-purple-700">
                Respond quickly to messages to maintain high ratings.
              </p>
              <Link to="/driver/messages">
                <Button variant="link" className="p-0 h-auto text-purple-600">
                  Check Messages →
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverOverview;


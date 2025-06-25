import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { riderAPI, bookingAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Star, 
  Search,
  MessageSquare,
  Plus,
  Bus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const RiderOverview = () => {
  // Fetch rider profile and children
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['rider-profile'],
    queryFn: () => riderAPI.getProfile().then(res => res.data)
  });

  // Fetch active bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingAPI.getMyBookings().then(res => res.data)
  });

  // Fetch recent messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['my-messages'],
    queryFn: () => riderAPI.getMessages().then(res => res.data)
  });

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (profileError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load profile data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const children = profile?.children || [];
  const activeBookings = bookings?.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'pending'
  ) || [];
  const recentMessages = messages?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="text-gray-600 mt-2">
          Manage your children's transportation and connect with trusted drivers.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
            <p className="text-xs text-muted-foreground">
              registered students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              current transportation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              total conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              transportation costs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your family's transportation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/rider/search">
              <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Search className="h-6 w-6" />
                <span>Find Drivers</span>
              </Button>
            </Link>
            <Link to="/rider/profile">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>Add Child</span>
              </Button>
            </Link>
            <Link to="/rider/messages">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <MessageSquare className="h-6 w-6" />
                <span>View Messages</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Children */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Children</CardTitle>
              <CardDescription>Students registered for transportation</CardDescription>
            </div>
            <Link to="/rider/profile">
              <Button variant="outline" size="sm">Manage</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {children.length > 0 ? (
              <div className="space-y-4">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{child.student_name}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{child.school}</span>
                        <span className="mx-2">•</span>
                        <span>Grade {child.grade}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={child.has_active_booking ? "default" : "secondary"}>
                        {child.has_active_booking ? 'Active' : 'No Booking'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No children added</h3>
                <p className="text-gray-500 mb-4">Add your children to start booking transportation.</p>
                <Link to="/rider/profile">
                  <Button>Add Child</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Bookings</CardTitle>
              <CardDescription>Current transportation arrangements</CardDescription>
            </div>
            <Link to="/rider/bookings">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <LoadingSpinner />
            ) : activeBookings.length > 0 ? (
              <div className="space-y-4">
                {activeBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{booking.rider?.student_name}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{booking.route?.route_name}</span>
                        <span className="mx-2">•</span>
                        <span>{booking.booking_type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active bookings</h3>
                <p className="text-gray-500 mb-4">Find and book transportation for your children.</p>
                <Link to="/rider/search">
                  <Button>Find Drivers</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest communication with drivers</CardDescription>
          </div>
          <Link to="/rider/messages">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {messagesLoading ? (
            <LoadingSpinner />
          ) : recentMessages.length > 0 ? (
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {message.sender?.first_name} {message.sender?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {message.content}
                    </p>
                    {message.is_emergency && (
                      <div className="flex items-center mt-1">
                        <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                        <span className="text-xs text-red-600 font-medium">Emergency</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500">Messages from drivers will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Safety & Tips
          </CardTitle>
          <CardDescription>
            Important information for safe transportation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Verify Driver Identity</h4>
              <p className="text-sm text-blue-700">
                Always confirm the driver's identity and vehicle details before your child gets in.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Stay Connected</h4>
              <p className="text-sm text-green-700">
                Use our messaging system to communicate with drivers about pickup times and locations.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Emergency Contacts</h4>
              <p className="text-sm text-purple-700">
                Keep your emergency contacts updated and ensure your child knows them.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiderOverview;


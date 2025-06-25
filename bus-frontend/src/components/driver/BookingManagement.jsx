import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingAPI } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Check,
  X,
  Eye,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from "sonner";

const BookingManagement = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingAPI.getMyBookings().then(res => res.data)
  });

  // Confirm booking mutation
  const confirmBookingMutation = useMutation({
    mutationFn: bookingAPI.confirmBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      toast({
        title: "Success",
        description: "Booking confirmed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to confirm booking",
        variant: "destructive",
      });
    }
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: bookingAPI.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      toast({
        title: "Success",
        description: "Booking cancelled successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to cancel booking",
        variant: "destructive",
      });
    }
  });

  // Complete booking mutation
  const completeBookingMutation = useMutation({
    mutationFn: bookingAPI.completeBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      toast({
        title: "Success",
        description: "Booking marked as completed!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to complete booking",
        variant: "destructive",
      });
    }
  });

  const handleConfirmBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      confirmBookingMutation.mutate(bookingId);
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const handleCompleteBooking = (bookingId) => {
    if (window.confirm('Mark this booking as completed?')) {
      completeBookingMutation.mutate(bookingId);
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const filterBookingsByStatus = (status) => {
    if (!bookings) return [];
    return bookings.filter(booking => booking.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load bookings. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const pendingBookings = filterBookingsByStatus('pending');
  const confirmedBookings = filterBookingsByStatus('confirmed');
  const completedBookings = filterBookingsByStatus('completed');

  const BookingCard = ({ booking }) => (
    <Card key={booking.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{booking.rider?.student_name}</CardTitle>
            <CardDescription>
              {booking.route?.route_name} • {booking.booking_type}
            </CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{new Date(booking.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {booking.pickup_time || 'Time TBD'}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{booking.pickup_location || 'Location TBD'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span>{booking.rider?.school}</span>
          </div>
        </div>

        {booking.total_amount && (
          <div className="text-lg font-semibold text-green-600">
            ${booking.total_amount}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => viewBookingDetails(booking)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          
          <div className="flex space-x-2">
            {booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleConfirmBooking(booking.id)}
                  disabled={confirmBookingMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id)}
                  disabled={cancelBookingMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </>
            )}
            
            {booking.status === 'confirmed' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleCompleteBooking(booking.id)}
                  disabled={completeBookingMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id)}
                  disabled={cancelBookingMutation.isPending}
                >
                  Cancel
                </Button>
              </>
            )}
            
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Booking Management</h2>
        <p className="text-gray-600 mt-2">
          Manage booking requests and communicate with families.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{confirmedBookings.length}</div>
            <p className="text-sm text-gray-600">Confirmed Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{completedBookings.length}</div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending bookings</h3>
                <p className="text-gray-500 text-center">
                  New booking requests will appear here for your review.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No confirmed bookings</h3>
                <p className="text-gray-500 text-center">
                  Confirmed bookings will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBookings.length > 0 ? (
            completedBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed bookings</h3>
                <p className="text-gray-500 text-center">
                  Completed bookings will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information for this booking request
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Student Information */}
              <div>
                <h4 className="font-medium mb-3">Student Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{selectedBooking.rider?.student_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">School:</span>
                    <p className="font-medium">{selectedBooking.rider?.school}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Grade:</span>
                    <p className="font-medium">{selectedBooking.rider?.grade || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Special Needs:</span>
                    <p className="font-medium">{selectedBooking.rider?.special_needs || 'None'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h4 className="font-medium mb-3">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Route:</span>
                    <p className="font-medium">{selectedBooking.route?.route_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{selectedBooking.booking_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Start Date:</span>
                    <p className="font-medium">{new Date(selectedBooking.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-medium">${selectedBooking.total_amount}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-medium mb-3">Parent/Guardian Contact</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">
                      {selectedBooking.rider?.parent_user?.first_name} {selectedBooking.rider?.parent_user?.last_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedBooking.rider?.parent_user?.phone || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedBooking.rider?.parent_user?.email}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.special_instructions && (
                <div>
                  <h4 className="font-medium mb-3">Special Instructions</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {selectedBooking.special_instructions}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManagement;


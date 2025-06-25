import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingAPI } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Star,
  MessageSquare,
  Eye,
  X,
  CheckCircle,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from "sonner";

const BookingHistory = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingAPI.getMyBookings().then(res => res.data)
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

  // Rate driver mutation
  const rateDriverMutation = useMutation({
    mutationFn: bookingAPI.rateDriver,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      setIsRatingDialogOpen(false);
      setRating(0);
      setReview('');
      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit rating",
        variant: "destructive",
      });
    }
  });

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const handleRateDriver = (booking) => {
    setSelectedBooking(booking);
    setIsRatingDialogOpen(true);
  };

  const submitRating = () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    rateDriverMutation.mutate({
      booking_id: selectedBooking.id,
      rating,
      review
    });
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
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
  const cancelledBookings = filterBookingsByStatus('cancelled');

  const BookingCard = ({ booking }) => (
    <Card key={booking.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center">
              {getStatusIcon(booking.status)}
              <span className="ml-2">{booking.rider?.student_name}</span>
            </CardTitle>
            <CardDescription className="mt-1">
              {booking.route?.route_name} • {booking.booking_type}
            </CardDescription>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Driver Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={booking.driver?.profile_image} />
            <AvatarFallback>
              {booking.driver?.user?.first_name?.[0]}{booking.driver?.user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {booking.driver?.user?.first_name} {booking.driver?.user?.last_name}
            </p>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${
                    i < Math.floor(booking.driver?.rating || 0) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">
                ({booking.driver?.total_ratings || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{new Date(booking.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{booking.pickup_time || 'Time TBD'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{booking.pickup_location || 'Location TBD'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>${booking.total_amount}</span>
          </div>
        </div>

        {/* Actions */}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelBooking(booking.id)}
                disabled={cancelBookingMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
            
            {booking.status === 'confirmed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancelBooking(booking.id)}
                disabled={cancelBookingMutation.isPending}
              >
                Cancel
              </Button>
            )}
            
            {booking.status === 'completed' && !booking.has_rating && (
              <Button
                size="sm"
                onClick={() => handleRateDriver(booking)}
              >
                <Star className="h-4 w-4 mr-1" />
                Rate Driver
              </Button>
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
        <h2 className="text-3xl font-bold text-gray-900">Booking History</h2>
        <p className="text-gray-600 mt-2">
          Track and manage your transportation bookings.
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
            <p className="text-sm text-gray-600">Completed Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0}
            </div>
            <p className="text-sm text-gray-600">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="confirmed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Active ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending bookings</h3>
                <p className="text-gray-500 text-center">
                  Your booking requests will appear here while waiting for driver confirmation.
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
                <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active bookings</h3>
                <p className="text-gray-500 text-center">
                  Your confirmed transportation bookings will appear here.
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
                  Your completed transportation history will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledBookings.length > 0 ? (
            cancelledBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <X className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled bookings</h3>
                <p className="text-gray-500 text-center">
                  Cancelled bookings will appear here.
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
              Complete information for this booking
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

              {/* Driver Information */}
              <div>
                <h4 className="font-medium mb-3">Driver Information</h4>
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedBooking.driver?.profile_image} />
                    <AvatarFallback>
                      {selectedBooking.driver?.user?.first_name?.[0]}{selectedBooking.driver?.user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedBooking.driver?.user?.first_name} {selectedBooking.driver?.user?.last_name}
                    </p>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < Math.floor(selectedBooking.driver?.rating || 0) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">
                        ({selectedBooking.driver?.total_ratings || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedBooking.driver?.user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Vehicle:</span>
                    <p className="font-medium">
                      {selectedBooking.driver?.vehicle_make} {selectedBooking.driver?.vehicle_model}
                    </p>
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

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Driver</DialogTitle>
            <DialogDescription>
              How was your experience with {selectedBooking?.driver?.user?.first_name}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`h-8 w-8 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`} 
                  />
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Review (Optional)</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
                placeholder="Share your experience with other parents..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRatingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRating} disabled={rateDriverMutation.isPending}>
              {rateDriverMutation.isPending ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingHistory;


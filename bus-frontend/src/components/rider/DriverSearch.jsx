import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routeAPI, bookingAPI } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Users, 
  Star, 
  DollarSign, 
  Clock,
  Car,
  Shield,
  MessageSquare,
  Calendar,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '@/components/ui/use-toast';

const DriverSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    child_id: '',
    booking_type: 'monthly',
    start_date: '',
    special_instructions: ''
  });
  const [filters, setFilters] = useState({
    priceRange: 'all',
    rating: 'all',
    availability: 'all'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available routes
  const { data: routes, isLoading, error } = useQuery({
    queryKey: ['available-routes', searchQuery, filters],
    queryFn: () => routeAPI.searchRoutes({ 
      query: searchQuery,
      ...filters 
    }).then(res => res.data)
  });

  // Fetch rider profile for children list
  const { data: profile } = useQuery({
    queryKey: ['rider-profile'],
    queryFn: () => routeAPI.getRiderProfile().then(res => res.data)
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: bookingAPI.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-bookings']);
      setIsBookingDialogOpen(false);
      setSelectedRoute(null);
      setBookingData({
        child_id: '',
        booking_type: 'monthly',
        start_date: '',
        special_instructions: ''
      });
      toast({
        title: "Success",
        description: "Booking request sent successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create booking",
        variant: "destructive",
      });
    }
  });

  const handleBookRoute = (route) => {
    setSelectedRoute(route);
    setBookingData(prev => ({
      ...prev,
      route_id: route.id
    }));
    setIsBookingDialogOpen(true);
  };

  const handleSubmitBooking = () => {
    if (!bookingData.child_id || !bookingData.start_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createBookingMutation.mutate({
      route_id: selectedRoute.id,
      rider_id: bookingData.child_id,
      booking_type: bookingData.booking_type,
      start_date: bookingData.start_date,
      special_instructions: bookingData.special_instructions
    });
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  };

  const getAvailabilityBadge = (route) => {
    const available = route.capacity - route.current_bookings;
    if (available <= 0) {
      return <Badge variant="destructive">Full</Badge>;
    } else if (available <= 2) {
      return <Badge variant="secondary">Limited</Badge>;
    } else {
      return <Badge variant="default">Available</Badge>;
    }
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
          Failed to load routes. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Find Drivers</h2>
        <p className="text-gray-600 mt-2">
          Search for trusted drivers and transportation routes in your area.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by route name, school, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-200">$0 - $200</SelectItem>
                <SelectItem value="200-400">$200 - $400</SelectItem>
                <SelectItem value="400+">$400+</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.rating} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="4+">4+ Stars</SelectItem>
                <SelectItem value="3+">3+ Stars</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                <SelectItem value="available">Available Only</SelectItem>
                <SelectItem value="limited">Limited Spots</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {routes?.length || 0} Routes Found
          </h3>
        </div>

        {routes && routes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {routes.map((route) => (
              <Card key={route.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{route.route_name}</CardTitle>
                      <CardDescription className="mt-1">
                        {route.description || 'Professional transportation service'}
                      </CardDescription>
                    </div>
                    {getAvailabilityBadge(route)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Driver Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={route.driver?.profile_image} />
                      <AvatarFallback>
                        {route.driver?.user?.first_name?.[0]}{route.driver?.user?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {route.driver?.user?.first_name} {route.driver?.user?.last_name}
                      </p>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(route.driver?.rating || 0)}
                        <span className="text-sm text-gray-500 ml-1">
                          ({route.driver?.total_ratings || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{route.capacity - route.current_bookings} seats available</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Car className="h-4 w-4 mr-2" />
                      <span>{route.driver?.vehicle_make} {route.driver?.vehicle_model}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Miami-Dade County</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Flexible Schedule</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center space-x-4 text-sm border-t pt-3">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div className="flex space-x-4">
                      {route.price_per_day && (
                        <span className="text-gray-600">${route.price_per_day}/day</span>
                      )}
                      {route.price_per_week && (
                        <span className="text-gray-600">${route.price_per_week}/week</span>
                      )}
                      {route.price_per_month && (
                        <span className="text-gray-600 font-medium">${route.price_per_month}/month</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button 
                      onClick={() => handleBookRoute(route)}
                      disabled={route.current_bookings >= route.capacity}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Book Route
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Try adjusting your search criteria or check back later for new routes.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Transportation</DialogTitle>
            <DialogDescription>
              Request booking for {selectedRoute?.route_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Child *</label>
              <Select 
                value={bookingData.child_id} 
                onValueChange={(value) => setBookingData(prev => ({ ...prev, child_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose which child" />
                </SelectTrigger>
                <SelectContent>
                  {profile?.children?.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.student_name} - {child.school}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Booking Type *</label>
              <Select 
                value={bookingData.booking_type} 
                onValueChange={(value) => setBookingData(prev => ({ ...prev, booking_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date *</label>
              <Input
                type="date"
                value={bookingData.start_date}
                onChange={(e) => setBookingData(prev => ({ ...prev, start_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Special Instructions</label>
              <textarea
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
                placeholder="Any special requirements or pickup instructions..."
                value={bookingData.special_instructions}
                onChange={(e) => setBookingData(prev => ({ ...prev, special_instructions: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitBooking}
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Booking...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverSearch;


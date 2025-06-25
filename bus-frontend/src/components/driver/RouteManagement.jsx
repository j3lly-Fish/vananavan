import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routeAPI } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from "sonner";

const RouteManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_name: '',
    description: '',
    capacity: 1,
    pickup_locations: [],
    dropoff_locations: [],
    price_per_day: '',
    price_per_week: '',
    price_per_month: '',
    special_requirements: '',
    schedule: {
      monday: { pickup_time: '', dropoff_time: '' },
      tuesday: { pickup_time: '', dropoff_time: '' },
      wednesday: { pickup_time: '', dropoff_time: '' },
      thursday: { pickup_time: '', dropoff_time: '' },
      friday: { pickup_time: '', dropoff_time: '' }
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch routes
  const { data: routes, isLoading, error } = useQuery({
    queryKey: ['my-routes'],
    queryFn: () => routeAPI.getMyRoutes().then(res => res.data)
  });

  // Create route mutation
  const createRouteMutation = useMutation({
    mutationFn: routeAPI.createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-routes']);
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Route created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create route",
        variant: "destructive",
      });
    }
  });

  // Update route mutation
  const updateRouteMutation = useMutation({
    mutationFn: ({ id, data }) => routeAPI.updateRoute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-routes']);
      setIsEditDialogOpen(false);
      setSelectedRoute(null);
      resetForm();
      toast({
        title: "Success",
        description: "Route updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update route",
        variant: "destructive",
      });
    }
  });

  // Delete route mutation
  const deleteRouteMutation = useMutation({
    mutationFn: routeAPI.deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-routes']);
      toast({
        title: "Success",
        description: "Route deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete route",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      route_name: '',
      description: '',
      capacity: 1,
      pickup_locations: [],
      dropoff_locations: [],
      price_per_day: '',
      price_per_week: '',
      price_per_month: '',
      special_requirements: '',
      schedule: {
        monday: { pickup_time: '', dropoff_time: '' },
        tuesday: { pickup_time: '', dropoff_time: '' },
        wednesday: { pickup_time: '', dropoff_time: '' },
        thursday: { pickup_time: '', dropoff_time: '' },
        friday: { pickup_time: '', dropoff_time: '' }
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      price_per_day: formData.price_per_day ? parseFloat(formData.price_per_day) : null,
      price_per_week: formData.price_per_week ? parseFloat(formData.price_per_week) : null,
      price_per_month: formData.price_per_month ? parseFloat(formData.price_per_month) : null,
    };

    if (selectedRoute) {
      updateRouteMutation.mutate({ id: selectedRoute.id, data: submitData });
    } else {
      createRouteMutation.mutate(submitData);
    }
  };

  const handleEdit = (route) => {
    setSelectedRoute(route);
    setFormData({
      route_name: route.route_name || '',
      description: route.description || '',
      capacity: route.capacity || 1,
      pickup_locations: route.pickup_locations || [],
      dropoff_locations: route.dropoff_locations || [],
      price_per_day: route.price_per_day || '',
      price_per_week: route.price_per_week || '',
      price_per_month: route.price_per_month || '',
      special_requirements: route.special_requirements || '',
      schedule: route.schedule || {
        monday: { pickup_time: '', dropoff_time: '' },
        tuesday: { pickup_time: '', dropoff_time: '' },
        wednesday: { pickup_time: '', dropoff_time: '' },
        thursday: { pickup_time: '', dropoff_time: '' },
        friday: { pickup_time: '', dropoff_time: '' }
      }
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (routeId) => {
    if (window.confirm('Are you sure you want to delete this route? This action cannot be undone.')) {
      deleteRouteMutation.mutate(routeId);
    }
  };

  const getStatusBadge = (route) => {
    if (route.current_bookings >= route.capacity) {
      return <Badge variant="destructive">Full</Badge>;
    } else if (route.status === 'active') {
      return <Badge variant="default">Active</Badge>;
    } else {
      return <Badge variant="secondary">Inactive</Badge>;
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Route Management</h2>
          <p className="text-gray-600 mt-2">
            Create and manage your transportation routes.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Route</DialogTitle>
              <DialogDescription>
                Set up a new transportation route for students.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="route_name">Route Name *</Label>
                  <Input
                    id="route_name"
                    name="route_name"
                    value={formData.route_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Downtown to Lincoln Middle School"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Vehicle Capacity *</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your route, pickup areas, and any special features..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_day">Daily Rate ($)</Label>
                  <Input
                    id="price_per_day"
                    name="price_per_day"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_day}
                    onChange={handleInputChange}
                    placeholder="25.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_week">Weekly Rate ($)</Label>
                  <Input
                    id="price_per_week"
                    name="price_per_week"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_week}
                    onChange={handleInputChange}
                    placeholder="100.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_month">Monthly Rate ($)</Label>
                  <Input
                    id="price_per_month"
                    name="price_per_month"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_month}
                    onChange={handleInputChange}
                    placeholder="350.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_requirements">Special Requirements</Label>
                <Textarea
                  id="special_requirements"
                  name="special_requirements"
                  value={formData.special_requirements}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or accommodations..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createRouteMutation.isPending}>
                  {createRouteMutation.isPending ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Route'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Routes List */}
      {routes && routes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <Card key={route.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{route.route_name}</CardTitle>
                    <CardDescription className="mt-1">
                      {route.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(route)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{route.current_bookings}/{route.capacity} seats</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Route #{route.id}</span>
                  </div>
                </div>

                {(route.price_per_day || route.price_per_week || route.price_per_month) && (
                  <div className="flex items-center space-x-4 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div className="flex space-x-2">
                      {route.price_per_day && (
                        <span className="text-gray-600">${route.price_per_day}/day</span>
                      )}
                      {route.price_per_week && (
                        <span className="text-gray-600">${route.price_per_week}/week</span>
                      )}
                      {route.price_per_month && (
                        <span className="text-gray-600">${route.price_per_month}/month</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    Created {new Date(route.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(route)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(route.id)}
                      disabled={route.current_bookings > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No routes yet</h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Create your first transportation route to start accepting bookings from families in your area.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Route
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>
              Update your route information and pricing.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_route_name">Route Name *</Label>
                <Input
                  id="edit_route_name"
                  name="route_name"
                  value={formData.route_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_capacity">Vehicle Capacity *</Label>
                <Input
                  id="edit_capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_price_per_day">Daily Rate ($)</Label>
                <Input
                  id="edit_price_per_day"
                  name="price_per_day"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_day}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_price_per_week">Weekly Rate ($)</Label>
                <Input
                  id="edit_price_per_week"
                  name="price_per_week"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_week}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_price_per_month">Monthly Rate ($)</Label>
                <Input
                  id="edit_price_per_month"
                  name="price_per_month"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_month}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_special_requirements">Special Requirements</Label>
              <Textarea
                id="edit_special_requirements"
                name="special_requirements"
                value={formData.special_requirements}
                onChange={handleInputChange}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateRouteMutation.isPending}>
                {updateRouteMutation.isPending ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Route'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RouteManagement;


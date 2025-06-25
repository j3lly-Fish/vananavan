import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driverAPI } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Car, 
  FileText, 
  Shield, 
  Star,
  Camera,
  Save,
  MapPin
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from "sonner";

const DriverProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch driver profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: () => driverAPI.getProfile().then(res => res.data)
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: driverAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['driver-profile']);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  const handleEdit = () => {
    setFormData({
      first_name: profile?.user?.first_name || '',
      last_name: profile?.user?.last_name || '',
      phone: profile?.user?.phone || '',
      bio: profile?.bio || '',
      vehicle_make: profile?.vehicle_make || '',
      vehicle_model: profile?.vehicle_model || '',
      vehicle_year: profile?.vehicle_year || '',
      vehicle_capacity: profile?.vehicle_capacity || '',
      vehicle_plate: profile?.vehicle_plate || '',
      service_areas: profile?.service_areas || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          Failed to load profile data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Driver Profile</h2>
          <p className="text-gray-600 mt-2">
            Manage your profile information and vehicle details.
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit}>
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.profile_image} />
                  <AvatarFallback className="text-2xl">
                    {profile?.user?.first_name?.[0]}{profile?.user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>
                {profile?.user?.first_name} {profile?.user?.last_name}
              </CardTitle>
              <CardDescription>Professional Driver</CardDescription>
              <div className="flex justify-center items-center space-x-2 mt-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">
                  {profile?.rating ? profile.rating.toFixed(1) : 'No ratings yet'}
                </span>
                <span className="text-gray-500">
                  ({profile?.total_ratings || 0} reviews)
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm">Licensed & Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {profile?.vehicle_capacity || 0} passenger capacity
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Miami-Dade County</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.user?.email} disabled />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell families about yourself, your experience, and what makes you a great driver..."
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Name</Label>
                      <p className="mt-1">
                        {profile?.user?.first_name} {profile?.user?.last_name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Phone</Label>
                      <p className="mt-1">{profile?.user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="mt-1">{profile?.user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                      <p className="mt-1">
                        {new Date(profile?.user?.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {profile?.bio && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Bio</Label>
                      <p className="mt-1 text-gray-700">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_make">Make</Label>
                    <Input
                      id="vehicle_make"
                      name="vehicle_make"
                      value={formData.vehicle_make}
                      onChange={handleInputChange}
                      placeholder="e.g., Ford"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_model">Model</Label>
                    <Input
                      id="vehicle_model"
                      name="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={handleInputChange}
                      placeholder="e.g., Transit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_year">Year</Label>
                    <Input
                      id="vehicle_year"
                      name="vehicle_year"
                      type="number"
                      value={formData.vehicle_year}
                      onChange={handleInputChange}
                      placeholder="2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_capacity">Capacity</Label>
                    <Input
                      id="vehicle_capacity"
                      name="vehicle_capacity"
                      type="number"
                      value={formData.vehicle_capacity}
                      onChange={handleInputChange}
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_plate">License Plate</Label>
                    <Input
                      id="vehicle_plate"
                      name="vehicle_plate"
                      value={formData.vehicle_plate}
                      onChange={handleInputChange}
                      placeholder="ABC-123"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Vehicle</Label>
                    <p className="mt-1">
                      {profile?.vehicle_year} {profile?.vehicle_make} {profile?.vehicle_model}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Capacity</Label>
                    <p className="mt-1">{profile?.vehicle_capacity} passengers</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">License Plate</Label>
                    <p className="mt-1">{profile?.vehicle_plate || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* License Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                License & Insurance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">License Number</Label>
                  <p className="mt-1">{profile?.license_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">License Expiry</Label>
                  <p className="mt-1">
                    {profile?.license_expiry ? 
                      new Date(profile.license_expiry).toLocaleDateString() : 
                      'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Insurance Policy</Label>
                  <p className="mt-1">{profile?.insurance_policy || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Insurance Expiry</Label>
                  <p className="mt-1">
                    {profile?.insurance_expiry ? 
                      new Date(profile.insurance_expiry).toLocaleDateString() : 
                      'Not provided'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;


import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riderAPI } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  User, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from "sonner";

const RiderProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [isEditChildDialogOpen, setIsEditChildDialogOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [childData, setChildData] = useState({
    student_name: '',
    school: '',
    grade: '',
    special_needs: '',
    emergency_contact: '',
    pickup_address: '',
    dropoff_address: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch rider profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['rider-profile'],
    queryFn: () => riderAPI.getProfile().then(res => res.data)
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: riderAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['rider-profile']);
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

  // Add child mutation
  const addChildMutation = useMutation({
    mutationFn: riderAPI.addChild,
    onSuccess: () => {
      queryClient.invalidateQueries(['rider-profile']);
      setIsAddChildDialogOpen(false);
      resetChildForm();
      toast({
        title: "Success",
        description: "Child added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to add child",
        variant: "destructive",
      });
    }
  });

  // Update child mutation
  const updateChildMutation = useMutation({
    mutationFn: ({ id, data }) => riderAPI.updateChild(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rider-profile']);
      setIsEditChildDialogOpen(false);
      setSelectedChild(null);
      resetChildForm();
      toast({
        title: "Success",
        description: "Child information updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update child",
        variant: "destructive",
      });
    }
  });

  // Delete child mutation
  const deleteChildMutation = useMutation({
    mutationFn: riderAPI.deleteChild,
    onSuccess: () => {
      queryClient.invalidateQueries(['rider-profile']);
      toast({
        title: "Success",
        description: "Child removed successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove child",
        variant: "destructive",
      });
    }
  });

  const resetChildForm = () => {
    setChildData({
      student_name: '',
      school: '',
      grade: '',
      special_needs: '',
      emergency_contact: '',
      pickup_address: '',
      dropoff_address: ''
    });
  };

  const handleEditProfile = () => {
    setProfileData({
      first_name: profile?.user?.first_name || '',
      last_name: profile?.user?.last_name || '',
      phone: profile?.user?.phone || '',
      address: profile?.address || '',
      emergency_contact: profile?.emergency_contact || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleEditChild = (child) => {
    setSelectedChild(child);
    setChildData({
      student_name: child.student_name || '',
      school: child.school || '',
      grade: child.grade || '',
      special_needs: child.special_needs || '',
      emergency_contact: child.emergency_contact || '',
      pickup_address: child.pickup_address || '',
      dropoff_address: child.dropoff_address || ''
    });
    setIsEditChildDialogOpen(true);
  };

  const handleAddChild = () => {
    addChildMutation.mutate(childData);
  };

  const handleUpdateChild = () => {
    updateChildMutation.mutate({ id: selectedChild.id, data: childData });
  };

  const handleDeleteChild = (childId) => {
    if (window.confirm('Are you sure you want to remove this child? This will cancel any active bookings.')) {
      deleteChildMutation.mutate(childId);
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
          Failed to load profile data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  const children = profile?.children || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Family</h2>
          <p className="text-gray-600 mt-2">
            Manage your profile and children's information.
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEditProfile}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
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
              <CardDescription>Parent/Guardian</CardDescription>
              <Badge variant="secondary" className="mt-2">
                {children.length} {children.length === 1 ? 'Child' : 'Children'} Registered
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{profile?.user?.email}</span>
              </div>
              {profile?.user?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{profile.user.phone}</span>
                </div>
              )}
              {profile?.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">{profile.address}</span>
                </div>
              )}
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
                      value={profileData.first_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.user?.email} disabled />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="address">Home Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Your home address"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      value={profileData.emergency_contact}
                      onChange={(e) => setProfileData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                      placeholder="Emergency contact name and phone"
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
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Home Address</Label>
                      <p className="mt-1">{profile?.address || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Emergency Contact</Label>
                      <p className="mt-1">{profile?.emergency_contact || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Children Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  My Children
                </CardTitle>
                <CardDescription>
                  Students registered for transportation services
                </CardDescription>
              </div>
              <Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetChildForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Child
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Child</DialogTitle>
                    <DialogDescription>
                      Add a new child to your family profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student_name">Student Name *</Label>
                      <Input
                        id="student_name"
                        value={childData.student_name}
                        onChange={(e) => setChildData(prev => ({ ...prev, student_name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school">School *</Label>
                      <Input
                        id="school"
                        value={childData.school}
                        onChange={(e) => setChildData(prev => ({ ...prev, school: e.target.value }))}
                        placeholder="School name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Select value={childData.grade} onValueChange={(value) => setChildData(prev => ({ ...prev, grade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="K">Kindergarten</SelectItem>
                          <SelectItem value="1">1st Grade</SelectItem>
                          <SelectItem value="2">2nd Grade</SelectItem>
                          <SelectItem value="3">3rd Grade</SelectItem>
                          <SelectItem value="4">4th Grade</SelectItem>
                          <SelectItem value="5">5th Grade</SelectItem>
                          <SelectItem value="6">6th Grade</SelectItem>
                          <SelectItem value="7">7th Grade</SelectItem>
                          <SelectItem value="8">8th Grade</SelectItem>
                          <SelectItem value="9">9th Grade</SelectItem>
                          <SelectItem value="10">10th Grade</SelectItem>
                          <SelectItem value="11">11th Grade</SelectItem>
                          <SelectItem value="12">12th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact">Emergency Contact</Label>
                      <Input
                        id="emergency_contact"
                        value={childData.emergency_contact}
                        onChange={(e) => setChildData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                        placeholder="Name and phone number"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="pickup_address">Pickup Address</Label>
                      <Input
                        id="pickup_address"
                        value={childData.pickup_address}
                        onChange={(e) => setChildData(prev => ({ ...prev, pickup_address: e.target.value }))}
                        placeholder="Where should the driver pick up your child?"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="special_needs">Special Needs/Requirements</Label>
                      <Textarea
                        id="special_needs"
                        value={childData.special_needs}
                        onChange={(e) => setChildData(prev => ({ ...prev, special_needs: e.target.value }))}
                        placeholder="Any special accommodations or requirements..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddChildDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddChild} disabled={addChildMutation.isPending}>
                      {addChildMutation.isPending ? (
                        <>
                          <LoadingSpinner size="small" className="mr-2" />
                          Adding...
                        </>
                      ) : (
                        'Add Child'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {children.length > 0 ? (
                <div className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-lg">{child.student_name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-1" />
                              <span>{child.school}</span>
                            </div>
                            {child.grade && (
                              <span>Grade {child.grade}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditChild(child)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteChild(child.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {child.pickup_address && (
                        <div className="text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Pickup: {child.pickup_address}
                        </div>
                      )}
                      
                      {child.special_needs && (
                        <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                          <AlertTriangle className="h-4 w-4 inline mr-1 text-yellow-600" />
                          <span className="text-yellow-800">{child.special_needs}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No children added</h3>
                  <p className="text-gray-500 mb-4">Add your children to start booking transportation services.</p>
                  <Button onClick={() => setIsAddChildDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Child
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Child Dialog */}
      <Dialog open={isEditChildDialogOpen} onOpenChange={setIsEditChildDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Child Information</DialogTitle>
            <DialogDescription>
              Update your child's information and requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_student_name">Student Name *</Label>
              <Input
                id="edit_student_name"
                value={childData.student_name}
                onChange={(e) => setChildData(prev => ({ ...prev, student_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_school">School *</Label>
              <Input
                id="edit_school"
                value={childData.school}
                onChange={(e) => setChildData(prev => ({ ...prev, school: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_grade">Grade</Label>
              <Select value={childData.grade} onValueChange={(value) => setChildData(prev => ({ ...prev, grade: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="K">Kindergarten</SelectItem>
                  <SelectItem value="1">1st Grade</SelectItem>
                  <SelectItem value="2">2nd Grade</SelectItem>
                  <SelectItem value="3">3rd Grade</SelectItem>
                  <SelectItem value="4">4th Grade</SelectItem>
                  <SelectItem value="5">5th Grade</SelectItem>
                  <SelectItem value="6">6th Grade</SelectItem>
                  <SelectItem value="7">7th Grade</SelectItem>
                  <SelectItem value="8">8th Grade</SelectItem>
                  <SelectItem value="9">9th Grade</SelectItem>
                  <SelectItem value="10">10th Grade</SelectItem>
                  <SelectItem value="11">11th Grade</SelectItem>
                  <SelectItem value="12">12th Grade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_emergency_contact">Emergency Contact</Label>
              <Input
                id="edit_emergency_contact"
                value={childData.emergency_contact}
                onChange={(e) => setChildData(prev => ({ ...prev, emergency_contact: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit_pickup_address">Pickup Address</Label>
              <Input
                id="edit_pickup_address"
                value={childData.pickup_address}
                onChange={(e) => setChildData(prev => ({ ...prev, pickup_address: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit_special_needs">Special Needs/Requirements</Label>
              <Textarea
                id="edit_special_needs"
                value={childData.special_needs}
                onChange={(e) => setChildData(prev => ({ ...prev, special_needs: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditChildDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateChild} disabled={updateChildMutation.isPending}>
              {updateChildMutation.isPending ? (
                <>
                  <LoadingSpinner size="small" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Child'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RiderProfile;


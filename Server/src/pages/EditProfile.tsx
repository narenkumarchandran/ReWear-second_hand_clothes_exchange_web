import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load existing profile data if available
  const getInitialData = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return {
      name: 'Sarah Johnson',
      username: '@sarah_eco',
      location: 'San Francisco, CA',
      bio: 'Passionate about sustainable fashion and making a positive impact on our planet. Love discovering unique pieces and giving them new life!',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    };
  };

  const [formData, setFormData] = useState(getInitialData());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    // Save profile data to localStorage for demo purposes
    localStorage.setItem('userProfile', JSON.stringify(formData));
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated!",
    });
    navigate('/profile');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button and Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mr-4 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold gradient-text">Edit Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative inline-block mb-4">
                  <img 
                    src={formData.avatar} 
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto border-4 border-green-200 object-cover"
                  />
                </div>
                
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Photo
                    </span>
                  </Button>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="glass-effect border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username" className="text-gray-700">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-700">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-gray-700">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={handleSaveChanges}
                    className="flex-1"
                    variant="default"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/profile')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
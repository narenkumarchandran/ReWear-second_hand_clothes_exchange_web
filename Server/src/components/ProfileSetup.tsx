import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupProps {
  email: string;
  onComplete: (profileData: any) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ email, onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    location: '',
    bio: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.username) {
        toast.error('Please fill in your name and username');
        return;
      }
      setStep(2);
    }
  };

  const handleComplete = () => {
    // Save profile data
    const profileData = {
      ...formData,
      email
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    onComplete(profileData);
    
    toast.success('Profile created successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Button 
          variant="ghost" 
          onClick={() => step === 1 ? navigate('/login') : setStep(1)}
          className="mb-6 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 1 ? 'Back to Login' : 'Previous Step'}
        </Button>

        <Card className="glass-effect border-green-200">
          <CardHeader className="text-center">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl gradient-text">
              {step === 1 ? 'Setup Your Profile' : 'Additional Details'}
            </CardTitle>
            <p className="text-gray-600">
              {step === 1 
                ? 'Let\'s personalize your ReWear experience' 
                : 'Help others know more about you'
              }
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <Label htmlFor="name" className="text-gray-700">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="username" className="text-gray-700">Username *</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="@your_username"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-gray-700">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleNext}
                  className="w-full"
                  variant="default"
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <div className="text-center">
                  <Label className="text-gray-700 block mb-4">Profile Picture</Label>
                  <div className="relative inline-block mb-4">
                    <img 
                      src={formData.avatar} 
                      alt="Profile"
                      className="w-24 h-24 rounded-full mx-auto border-4 border-green-200 object-cover"
                    />
                  </div>
                  
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
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
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
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
                    rows={3}
                    className="mt-1"
                    placeholder="Tell us about yourself and your sustainable fashion journey..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleComplete}
                    className="flex-1"
                    variant="default"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Complete Setup
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleComplete()}
                    className="flex-1"
                  >
                    Skip for now
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
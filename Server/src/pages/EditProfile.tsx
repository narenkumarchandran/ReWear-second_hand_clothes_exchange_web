
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { usersApi } from '@/services/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Lock, User, MapPin, Phone, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const EditProfile = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setPhone((user as any).phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user, isAuthenticated, navigate]);

  // Phone input handler — strips non-digit characters
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 15) {
      setPhone(value);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (phone && phone.length < 10) {
      toast.error('Phone number must be at least 10 digits');
      return;
    }

    setIsSaving(true);

    try {
      await usersApi.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        phone: phone.trim(),
        avatar,
      } as any);

      // Refresh the auth context user data
      if (refreshUser) {
        await refreshUser();
      }

      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error: any) {
      console.error('Save profile error:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Edit Profile</CardTitle>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar" className="text-sm font-medium text-foreground">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 bg-background border-border text-foreground"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Full Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-background border-border text-foreground"
              />
            </div>

            {/* Email — READ ONLY */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Email
                <span className="text-xs text-muted-foreground font-normal">(cannot be changed)</span>
              </Label>
              <Input
                id="email"
                value={user.email}
                readOnly
                disabled
                className="bg-muted border-border text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* Phone — numeric only, max 15 digits */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone Number
                <span className="text-xs text-muted-foreground font-normal">(10-15 digits)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="1234567890"
                className="bg-background border-border text-foreground"
              />
              {phone && phone.length < 10 && (
                <p className="text-xs text-amber-500">Minimum 10 digits required</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="bg-background border-border text-foreground"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                className="bg-background border-border text-foreground resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
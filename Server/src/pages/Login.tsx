
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormInput } from '@/components/ui/FormInput';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { validateForm, ValidationRule } from '@/utils/validation';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationRules: Record<string, ValidationRule> = {
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minLength: 6
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select your role');
      return;
    }

    const validation = validateForm(formData, validationRules);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isLoginMode) {
        // Restrict admin access to specific email
        if (selectedRole === 'admin' && formData.email !== 'admin@rewear.com') {
          toast.error('Access denied. Admin accounts are restricted.');
          setIsSubmitting(false);
          return;
        }

        const success = await login(formData.email, formData.password, selectedRole);
        
        if (success) {
          toast.success('Login successful!');
          // Navigate to appropriate dashboard
          if (selectedRole === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          toast.error('Invalid credentials. Password must be at least 6 characters.');
        }
      } else {
        // Signup mode
        if (selectedRole === 'admin') {
          // Admin accounts are created by ReWear, only login is allowed
          toast.error('Admin accounts are created by ReWear. Please use the login option with your provided credentials.');
          return;
        }
        
        const success = await signup(formData.email, formData.password, selectedRole);
        
        if (success) {
          toast.success('Account created! Redirecting to complete your profile.');
          // For new signups, redirect directly to edit profile
          navigate('/edit-profile');
        } else {
          toast.error('Signup failed. Password must be at least 6 characters.');
        }
      }
    } catch (error) {
      toast.error(isLoginMode ? 'Login failed. Please try again.' : 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="glass-effect border-green-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text mb-2">Welcome to ReWear</CardTitle>
              <p className="text-gray-600">Choose your role to continue</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setSelectedRole('user')}
                className="w-full h-16 flex items-center justify-center gap-3 bg-transparent hover:bg-incoming border border-gray-200"
                variant="ghost"
              >
                <div className="bg-green-100 p-2 rounded-full">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">User Login</div>
                  <div className="text-sm text-gray-500">Buy, sell, and swap clothes</div>
                </div>
              </Button>

              <Button
                onClick={() => setSelectedRole('admin')}
                className="w-full h-16 flex items-center justify-center gap-3 bg-transparent hover:bg-incoming border border-gray-200"
                variant="ghost"
              >
                <div className="bg-blue-100 p-2 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Admin Login</div>
                  <div className="text-sm text-gray-500">Moderate and approve items</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedRole(null)}
          className="mb-6 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Role Selection
        </Button>

        <Card className="glass-effect border-green-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              {selectedRole === 'admin' ? (
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              ) : (
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="h-8 w-8 text-green-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl gradient-text">
              {selectedRole === 'admin' 
                ? 'Admin Login' 
                : (isLoginMode ? 'User Login' : 'User Signup')
              }
            </CardTitle>
            <p className="text-gray-600">
              {selectedRole === 'admin' 
                ? 'Enter your ReWear-provided credentials to access the admin dashboard'
                : (isLoginMode ? 'Sign in to start swapping sustainable fashion' : 'Join ReWear to start swapping sustainable fashion')
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                error={errors.email}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
              />

              <FormInput
                label="Password"
                type="password"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                error={errors.password}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
              />

              <Button 
                type="submit" 
                variant="pink"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLoginMode ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLoginMode ? 'Sign In' : 'Create Account'
                )}
              </Button>

              {selectedRole !== 'admin' && (
                <div className="text-center mt-4">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-sm"
                  >
                    {isLoginMode 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </Button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Demo Credentials:</p>
              <p className="mt-1">
                User: any@email.com | Password: 123456+
              </p>
              <p className="mt-1">
                Admin: admin@rewear.com | Password: 123456+
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

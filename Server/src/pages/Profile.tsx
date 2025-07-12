
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Calendar, 
  Star, 
  Droplets, 
  Leaf, 
  Recycle, 
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  ArrowLeft,
  Edit
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [processingItems, setProcessingItems] = useState<any[]>([]);
  
  // Get user profile from localStorage
  const getUserProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
    return null;
  };

  useEffect(() => {
    // Load processing items from localStorage
    const items = JSON.parse(localStorage.getItem('processingItems') || '[]');
    setProcessingItems(items);
  }, []);

  const savedProfile = getUserProfile();
  const user = savedProfile || {
    name: 'Sarah Johnson',
    username: '@sarah_eco',
    location: 'San Francisco, CA',
    joinDate: 'March 2023',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    points: 2450,
    level: 'Eco Warrior',
    badges: [
      { name: 'Frequent Swapper', icon: Recycle, color: 'bg-green-500' },
      { name: 'Brand Ambassador', icon: Star, color: 'bg-emerald-500' },
      { name: 'Eco Champion', icon: Leaf, color: 'bg-teal-500' }
    ],
    stats: {
      itemsListed: 24,
      successfulSwaps: 18,
      waterSaved: 12500,
      co2Reduced: 85,
      itemsRescued: 42
    }
  };

  // Ensure all required fields exist, especially for new users
  const userWithDefaults = {
    ...user,
    joinDate: user.joinDate || 'Recently',
    points: user.points || 0,
    level: user.level || 'New Member',
    badges: user.badges || [
      { name: 'Welcome!', icon: Star, color: 'bg-green-500' }
    ],
    stats: user.stats || {
      itemsListed: 0,
      successfulSwaps: 0,
      waterSaved: 0,
      co2Reduced: 0,
      itemsRescued: 0
    }
  };

  const myItems = [
    {
      id: 1,
      title: 'Vintage Leather Jacket',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop',
      status: 'Active',
      points: 180,
      views: 45,
      likes: 12
    },
    {
      id: 2,
      title: 'Designer Handbag',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop',
      status: 'Swapped',
      points: 220,
      views: 89,
      likes: 24
    }
  ];

  const swapHistory = [
    {
      id: 1,
      type: 'Completed',
      item: 'Summer Dress',
      partner: 'Emma Wilson',
      date: '2 days ago',
      points: 150
    },
    {
      id: 2,
      type: 'Pending',
      item: 'Denim Jacket',
      partner: 'Alex Chen',
      date: '1 week ago',
      points: 180
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button and Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold gradient-text">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-effect border-green-200">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <img 
                    src={userWithDefaults.avatar} 
                    alt={userWithDefaults.name}
                    className="w-24 h-24 rounded-full mx-auto border-4 border-green-200 object-cover"
                  />
                  <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                    {userWithDefaults.level}
                  </Badge>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-1">{userWithDefaults.name}</h2>
                <p className="text-green-600 mb-2">{userWithDefaults.username}</p>
                
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{userWithDefaults.location}</span>
                </div>
                
                <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {userWithDefaults.joinDate}</span>
                </div>

                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="text-2xl font-bold text-green-600">{userWithDefaults.points}</div>
                  <div className="text-sm text-gray-600">Points Available</div>
                </div>

                <Button 
                  variant="pink" 
                  className="w-full"
                  onClick={() => navigate('/edit-profile')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="glass-effect mt-6 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-gray-800">Sustainability Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userWithDefaults.badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${badge.color}`}>
                        <badge.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{badge.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-green-200">
                <TabsTrigger value="overview" className="transition-all duration-300 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Overview</TabsTrigger>
                <TabsTrigger value="processing" className="transition-all duration-300 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700">On Processing</TabsTrigger>
                <TabsTrigger value="items" className="transition-all duration-300 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">My Items</TabsTrigger>
                <TabsTrigger value="history" className="transition-all duration-300 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Swap History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 animate-fade-in">
                {/* Eco Impact */}
                <Card className="glass-effect border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Your Eco Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{userWithDefaults.stats.waterSaved.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Liters of Water Saved</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Leaf className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{userWithDefaults.stats.co2Reduced}</div>
                        <div className="text-sm text-gray-600">kg CO₂ Reduced</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Recycle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{userWithDefaults.stats.itemsRescued}</div>
                        <div className="text-sm text-gray-600">Items Rescued</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="glass-effect border-green-200">
                    <CardContent className="p-6 text-center">
                      <Package className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-gray-800">{userWithDefaults.stats.itemsListed}</div>
                      <div className="text-sm text-gray-600">Items Listed</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-effect border-green-200">
                    <CardContent className="p-6 text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-gray-800">{userWithDefaults.stats.successfulSwaps}</div>
                      <div className="text-sm text-gray-600">Successful Swaps</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-effect border-green-200">
                    <CardContent className="p-6 text-center">
                      <Star className="h-8 w-8 text-green-500 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-gray-800">4.9</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="processing" className="space-y-6 animate-fade-in">
                <Card className="glass-effect border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      Items Pending Approval
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {processingItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {processingItems.map((item) => (
                          <Card key={item.id} className="hover-lift cursor-pointer border-yellow-100">
                            <div className="relative">
                              <img 
                                src={item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop'} 
                                alt={item.title}
                                className="w-full h-48 object-cover rounded-t-lg"
                              />
                              <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                                Pending
                              </Badge>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                              <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>{item.price} pts</span>
                                <span>Submitted {item.submittedDate}</span>
                              </div>
                              <div className="mt-2 text-xs text-yellow-600">
                                ⏳ Waiting for admin approval
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-2">No items pending approval</h3>
                        <p className="text-gray-400">Items you submit will appear here while waiting for admin approval</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="space-y-6 animate-fade-in">
                <Card className="glass-effect border-green-200">
                  <CardHeader>
                    <CardTitle className="text-gray-800">My Listed Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myItems.map((item) => (
                        <Card key={item.id} className="hover-lift cursor-pointer border-green-100">
                          <div className="relative">
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                            <Badge 
                              className={`absolute top-2 right-2 ${
                                item.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                              } text-white`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>{item.points} pts</span>
                              <span>{item.views} views • {item.likes} likes</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6 animate-fade-in">
                <Card className="glass-effect border-green-200">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Recent Swaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {swapHistory.map((swap) => (
                        <div key={swap.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-100">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              swap.type === 'Completed' ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {swap.type === 'Completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{swap.item}</h4>
                              <p className="text-sm text-gray-600">with {swap.partner}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-green-600">{swap.points} pts</div>
                            <div className="text-sm text-gray-500">{swap.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

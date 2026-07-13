
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { itemsApi, ApiItem } from '@/services/api';
import { 
  Edit, 
  Package, 
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Star,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userItems, setUserItems] = useState<ApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadItems = async () => {
      try {
        const { items } = await itemsApi.getMy();
        setUserItems(items);
      } catch (error) {
        console.error('Failed to load items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const approvedItems = userItems.filter(item => item.status === 'approved');
  const processingItems = userItems.filter(item => item.status === 'on-processing');
  const rejectedItems = userItems.filter(item => item.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'on-processing':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        {/* Profile Header */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                  <Badge variant="outline" className="text-xs">{user.level || 'New Member'}</Badge>
                </div>
                
                {user.bio && (
                  <p className="text-muted-foreground mb-3">{user.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{user.email}</span>
                  </div>
                  {(user as any).phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{(user as any).phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <Button onClick={() => navigate('/edit-profile')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Items Listed', value: userItems.length, icon: Package },
            { label: 'Approved', value: approvedItems.length, icon: CheckCircle },
            { label: 'Processing', value: processingItems.length, icon: Clock },
            { label: 'Points', value: user.points || 0, icon: Star },
          ].map((stat, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-5 text-center">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mb-12">
          <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/10">
            <Star className="h-4 w-4" />
            Get More Points
          </Button>
        </div>

        {/* Items Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">My Items</h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => navigate('/purchases')} className="flex-1 sm:flex-none">
                <ShoppingBag className="h-4 w-4 mr-2" />
                My Purchases
              </Button>
              <Button size="sm" onClick={() => navigate('/list-item')} className="flex-1 sm:flex-none">
                <Package className="h-4 w-4 mr-2" />
                List New Item
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading your items...</div>
          ) : userItems.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No items yet</h3>
                <p className="text-muted-foreground mb-4">Start listing items to see them here.</p>
                <Button onClick={() => navigate('/list-item')}>List Your First Item</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userItems.map((item) => (
                <Card 
                  key={item._id} 
                  className="bg-card border-border hover-lift cursor-pointer overflow-hidden"
                  onClick={() => item.status === 'approved' ? navigate(`/item/${item._id}`) : undefined}
                >
                  <div className="relative">
                    <img 
                      src={item.images?.[0] || ''} 
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-1 truncate">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                      <span className="text-sm font-medium text-primary">{item.price} pts</span>
                    </div>
                    {item.status === 'rejected' && item.rejectionMessage && (
                      <p className="text-xs text-destructive mt-2 bg-destructive/10 rounded px-2 py-1">
                        {item.rejectionMessage}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

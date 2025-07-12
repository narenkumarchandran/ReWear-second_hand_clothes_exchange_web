
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  MapPin, 
  User,
  Leaf,
  Award,
  Share2,
  MessageSquare,
  Truck,
  Shield,
  ShoppingCart
} from 'lucide-react';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  // Get the item data from Browse page or use fallback
  const getItemData = () => {
    const approvedItems = localStorage.getItem('approvedItems');
    let allItems = [];
    
    // Sample items that match Browse page
    const sampleItems = [
      {
        id: '1',
        title: 'Vintage Denim Jacket',
        description: 'Classic blue denim jacket from the 90s. Perfect condition with minimal wear.',
        price: 45,
        category: 'Outerwear',
        type: 'Jacket',
        size: 'M',
        condition: 'Like New',
        images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop'],
        seller: {
          name: 'Sarah M.',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          rating: 4.8
        },
        tags: ['vintage', 'denim', 'casual'],
        location: 'New York, NY',
        brand: "Levi's"
      },
      {
        id: '2',
        title: 'Designer Summer Dress',
        description: 'Beautiful floral summer dress, worn only once to a wedding. Size 8.',
        price: 85,
        category: 'Dresses',
        type: 'Summer Dress',
        size: 'M',
        condition: 'New',
        images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop'],
        seller: {
          name: 'Emma K.',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          rating: 4.9
        },
        tags: ['designer', 'floral', 'summer'],
        location: 'Los Angeles, CA',
        brand: 'Zara'
      },
      {
        id: '3',
        title: 'Leather Boots',
        description: 'Genuine leather ankle boots in excellent condition. Perfect for fall weather.',
        price: 65,
        category: 'Footwear',
        type: 'Boots',
        size: '8',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&h=600&fit=crop'],
        seller: {
          name: 'Mike R.',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          rating: 4.7
        },
        tags: ['leather', 'boots', 'fall'],
        location: 'Chicago, IL',
        brand: 'Dr. Martens'
      },
      {
        id: '4',
        title: 'Casual T-Shirt Bundle',
        description: 'Set of 3 casual t-shirts in different colors. All in great condition.',
        price: 25,
        category: 'Tops',
        type: 'T-shirt',
        size: 'L',
        condition: 'Good',
        images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop'],
        seller: {
          name: 'Alex J.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          rating: 4.6
        },
        tags: ['casual', 'bundle', 'basic'],
        location: 'Miami, FL',
        brand: 'H&M'
      }
    ];

    allItems = [...sampleItems];
    
    if (approvedItems) {
      const parsed = JSON.parse(approvedItems);
      allItems = [...allItems, ...parsed];
    }
    
    return allItems.find(item => item.id === id) || allItems[0];
  };

  const item = getItemData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/browse')}
          className="mb-6 text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="glass-effect overflow-hidden border-border">
              <div className="relative">
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-96 object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-green-500 text-white">
                  <Leaf className="h-3 w-3 mr-1" />
                  Eco-Friendly
                </Badge>
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button variant="ghost" size="sm" className="bg-background/80 hover:bg-background text-foreground">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="bg-background/80 hover:bg-background text-foreground">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-border text-foreground">{item.category}</Badge>
                <Badge className="bg-green-500 text-white">{item.price} eco points</Badge>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{item.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{item.brand}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>Size: {item.size}</span>
                <span>Condition: {item.condition}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>
              </div>

              <p className="text-foreground leading-relaxed mb-6">{item.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground border-border">#{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Sustainability Info */}
            <Card className="glass-effect border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Leaf className="h-5 w-5 text-green-500" />
                  Sustainability & Brand Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">Overall Score</span>
                      <span className="text-sm font-bold text-green-600">9.2/10</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">8.5</div>
                      <div className="text-xs text-muted-foreground">Sustainability</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">9.0</div>
                      <div className="text-xs text-muted-foreground">Ethics</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">8.8</div>
                      <div className="text-xs text-muted-foreground">Transparency</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">100% Cotton - Organic and sustainably sourced</p>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="glass-effect border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-full">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{item.seller.name}</div>
                      <div className="text-sm text-muted-foreground">
                        23 swaps • Joined March 2024
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-foreground">{item.seller.rating}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-1 text-foreground hover:bg-muted">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  size="lg" 
                  className="bg-green-500 hover:bg-green-600 text-white text-lg py-3"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy ({item.price} points)
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950 text-lg py-3"
                >
                  Request Swap
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-muted">
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-muted">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Free shipping available</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Protected by ReWear</span>
              </div>
            </div>

            {/* Activity Stats */}
            <Card className="glass-effect border-border">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-foreground">156</div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">12</div>
                    <div className="text-sm text-muted-foreground">Interested</div>
                  </div>
                  <div>
                    <Badge className="bg-green-500 text-white">available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;

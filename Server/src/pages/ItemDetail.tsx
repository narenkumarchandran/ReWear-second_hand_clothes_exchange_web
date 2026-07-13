
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { itemsApi, ApiItem, conversationsApi, transactionsApi } from '@/services/api';
import Header from '@/components/Header';
import { 
  Heart, 
  MapPin, 
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  ArrowRightLeft,
  ShoppingBag,
  Star,
  Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [item, setItem] = useState<ApiItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return;
      try {
        const { item: apiItem } = await itemsApi.getById(id);
        setItem(apiItem);
      } catch (error) {
        console.error('Failed to load item:', error);
        toast.error('Item not found');
        navigate('/browse');
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [id, navigate]);

  const handleWishlistToggle = () => {
    if (!item) return;
    
    if (isInWishlist(item._id)) {
      removeFromWishlist(item._id);
      toast.success('Removed from wishlist');
    } else {
      const wishlistItem = {
        id: item._id,
        title: item.title,
        price: item.price.toString(),
        image: item.images[0],
        condition: item.condition,
        size: item.size,
        brand: item.brand || item.tags[0] || 'Unknown',
        addedDate: new Date().toISOString()
      };
      addToWishlist(wishlistItem);
      toast.success('Added to wishlist');
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!item) return;

    setIsStartingChat(true);
    try {
      const { conversation } = await conversationsApi.create(item.seller, item._id);
      navigate(`/messages/${conversation._id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleTransaction = async (type: 'buy' | 'swap') => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!item) return;

    setIsRequesting(true);
    try {
      await transactionsApi.create(item._id, type);
      toast.success(type === 'buy' ? 'Purchase request sent!' : 'Swap request sent!');
    } catch (error: any) {
      console.error(`Failed to create ${type} request:`, error);
      toast.error(error.message || `Failed to send ${type} request`);
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!item) return null;

  const isOwner = user?.id === item.seller;
  const isWishlisted = isInWishlist(item._id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted border border-border">
              <img
                src={item.images[currentImageIndex] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=1000&fit=crop'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {item.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={() => setCurrentImageIndex((prev) => (prev === item.images.length - 1 ? 0 : prev + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {item.images.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-4 bg-primary' : 'w-1.5 bg-background/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {item.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Item Details */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="outline" className="text-xs uppercase tracking-wider">{item.category}</Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`hover:bg-muted ${isWishlisted ? 'text-destructive' : 'text-muted-foreground'}`}
                onClick={handleWishlistToggle}
              >
                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{item.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="text-3xl font-bold text-primary">{item.price} pts</div>
              <div className="h-6 w-px bg-border"></div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Listed {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-1">Brand</div>
                <div className="font-medium text-foreground">{item.brand || 'Unspecified'}</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-1">Size</div>
                <div className="font-medium text-foreground">{item.size || 'Unspecified'}</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-1">Condition</div>
                <div className="font-medium text-foreground">{item.condition}</div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="text-sm text-muted-foreground mb-1">Location</div>
                <div className="font-medium flex items-center gap-1 text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {item.location}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Profile Card */}
            <Card className="mb-8 bg-card border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={item.sellerInfo?.avatar} />
                    <AvatarFallback>{item.sellerInfo?.name?.charAt(0) || 'S'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{item.sellerInfo?.name || 'Seller'}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span>{item.sellerInfo?.rating || 4.8}</span>
                      <span className="mx-1">•</span>
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
                {!isOwner && (
                  <Button 
                    variant="outline" 
                    onClick={handleMessage}
                    disabled={isStartingChat}
                  >
                    {isStartingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                    Message
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Sticky Bottom Actions / CTA */}
            <div className="mt-auto pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
              {isOwner ? (
                <Button className="w-full" variant="outline" onClick={() => navigate('/my-items')}>
                  Manage Item
                </Button>
              ) : (
                <>
                  <Button 
                    className="flex-1" 
                    size="lg"
                    onClick={() => handleTransaction('buy')}
                    disabled={isRequesting}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Buy with Points
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1" 
                    size="lg"
                    onClick={() => handleTransaction('swap')}
                    disabled={isRequesting}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Request Swap
                  </Button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWishlist(id);
    toast.success('Removed from wishlist');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary fill-primary/20" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">Saved items you're keeping an eye on.</p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1 bg-card">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
          </Badge>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="bg-card border-dashed border-border py-20 text-center">
            <CardContent className="flex flex-col items-center p-0">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Browse the marketplace and save items you love.</p>
              <Button onClick={() => navigate('/browse')}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start Browsing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card 
                key={item.id} 
                className="group cursor-pointer overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <div className="relative aspect-[4/5] bg-muted">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm text-destructive hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleRemove(item.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-background/90 backdrop-blur-sm p-2 rounded-lg border border-border/50">
                      <div className="text-xs font-semibold text-primary">{item.price} pts</div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.brand}</span>
                    <span className="text-xs text-muted-foreground">{item.size || 'N/A'}</span>
                  </div>
                  <h3 className="font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{item.condition}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-current" />
                      Added {new Date(item.addedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;

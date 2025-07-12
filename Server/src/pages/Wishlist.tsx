
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-700/20">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mr-4 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Wishlist</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="glass-effect border-green-200 dark:border-green-800">
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Browse items and add them to your wishlist to see them here
              </p>
              <Button 
                onClick={() => navigate('/browse')}
                className="bg-green-500 hover:bg-green-600"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Items
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="glass-effect border-green-200 dark:border-green-800 overflow-hidden hover-lift">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => navigate(`/item/${item.id}`)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <h3 
                    className="font-semibold text-gray-800 dark:text-gray-200 mb-2 cursor-pointer hover:text-green-600"
                    onClick={() => navigate(`/item/${item.id}`)}
                  >
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.brand}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.size}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      {item.price} pts
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Added {new Date(item.addedDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

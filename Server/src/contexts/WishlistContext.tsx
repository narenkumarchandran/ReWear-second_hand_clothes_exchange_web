
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistItem {
  id: string;
  title: string;
  image: string;
  price: string;
  brand: string;
  size: string;
  addedDate: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('rewear_wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rewear_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems(prev => {
      if (prev.some(existingItem => existingItem.id === item.id)) {
        return prev;
      }
      return [...prev, { ...item, addedDate: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const isInWishlist = (itemId: string) => {
    return wishlistItems.some(item => item.id === itemId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

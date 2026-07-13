
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi, WishlistItemResponse } from '@/services/api';
import { getToken } from '@/services/api';

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

  // Load wishlist from API on mount (if logged in)
  const loadWishlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setWishlistItems([]);
      return;
    }

    try {
      const { items } = await wishlistApi.get();
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      // Fall back to localStorage if API fails
      try {
        const saved = localStorage.getItem('rewear_wishlist');
        if (saved) setWishlistItems(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToWishlist = async (item: WishlistItem) => {
    // Optimistic update
    setWishlistItems(prev => {
      if (prev.some(existingItem => existingItem.id === item.id)) {
        return prev;
      }
      return [...prev, { ...item, addedDate: new Date().toISOString() }];
    });

    try {
      await wishlistApi.add(item.id);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      // Rollback on failure
      setWishlistItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    // Save for rollback
    const previousItems = wishlistItems;

    // Optimistic update
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));

    try {
      await wishlistApi.remove(itemId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      // Rollback on failure
      setWishlistItems(previousItems);
    }
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

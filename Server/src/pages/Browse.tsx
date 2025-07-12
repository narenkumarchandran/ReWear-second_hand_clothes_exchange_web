import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';
import { 
  Search, 
  Filter, 
  Heart,
  ThumbsUp,
  Star,
  MapPin,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import SortOptions from '@/components/SortOptions';
import { sortItems } from '@/utils/sorting';
import Chatbot from '@/components/Chatbot';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: string;
  size: string;
  condition: string;
  images: string[];
  seller: {
    name: string;
    avatar: string;
    rating: number;
  };
  tags: string[];
  location: string;
  postedAt: Date;
  upvotes: number;
  upvotedBy: string[];
  views: number;
  isLiked?: boolean;
}

// Expanded realistic items for demonstration
const sampleItems: Item[] = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    description: 'Classic blue denim jacket from the 90s. Perfect condition with minimal wear.',
    price: 45,
    category: 'Outerwear',
    type: 'Jacket',
    size: 'M',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'],
    seller: {
      name: 'Sarah M.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.8
    },
    tags: ['vintage', 'denim', 'casual'],
    location: 'New York, NY',
    postedAt: new Date('2024-01-15'),
    upvotes: 24,
    upvotedBy: [],
    views: 156
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
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop'],
    seller: {
      name: 'Emma K.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 4.9
    },
    tags: ['designer', 'floral', 'summer'],
    location: 'Los Angeles, CA',
    postedAt: new Date('2024-01-14'),
    upvotes: 18,
    upvotedBy: [],
    views: 89
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
    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop'],
    seller: {
      name: 'Mike R.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.7
    },
    tags: ['leather', 'boots', 'fall'],
    location: 'Chicago, IL',
    postedAt: new Date('2024-01-13'),
    upvotes: 31,
    upvotedBy: [],
    views: 203
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
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
    seller: {
      name: 'Alex J.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.6
    },
    tags: ['casual', 'bundle', 'basic'],
    location: 'Miami, FL',
    postedAt: new Date('2024-01-12'),
    upvotes: 12,
    upvotedBy: [],
    views: 67
  },
  {
    id: '5',
    title: 'Wool Winter Coat',
    description: 'Elegant black wool coat, perfect for winter. Rarely worn, excellent condition.',
    price: 120,
    category: 'Outerwear',
    type: 'Coat',
    size: 'S',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=400&fit=crop'],
    seller: {
      name: 'Lisa C.',
      avatar: 'https://images.unsplash.com/photo-1491349174775-aaafddd81942?w=150&h=150&fit=crop&crop=face',
      rating: 4.9
    },
    tags: ['winter', 'wool', 'elegant'],
    location: 'Boston, MA',
    postedAt: new Date('2024-01-11'),
    upvotes: 35,
    upvotedBy: [],
    views: 298
  },
  {
    id: '6',
    title: 'Running Sneakers',
    description: 'Nike Air Max sneakers in great condition. Used for light jogging only.',
    price: 55,
    category: 'Footwear',
    type: 'Sneakers',
    size: '9',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
    seller: {
      name: 'Tom H.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 4.5
    },
    tags: ['nike', 'running', 'athletic'],
    location: 'Austin, TX',
    postedAt: new Date('2024-01-10'),
    upvotes: 19,
    upvotedBy: [],
    views: 142
  },
  {
    id: '7',
    title: 'Silk Blouse',
    description: 'Professional silk blouse in cream color. Perfect for office wear.',
    price: 40,
    category: 'Tops',
    type: 'Blouse',
    size: 'M',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1564257577154-75f6b77ac595?w=400&h=400&fit=crop'],
    seller: {
      name: 'Rachel P.',
      avatar: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face',
      rating: 4.8
    },
    tags: ['silk', 'professional', 'cream'],
    location: 'Seattle, WA',
    postedAt: new Date('2024-01-09'),
    upvotes: 22,
    upvotedBy: [],
    views: 178
  },
  {
    id: '8',
    title: 'Denim Jeans',
    description: 'High-waisted skinny jeans from Zara. Size 28, excellent fit.',
    price: 35,
    category: 'Bottoms',
    type: 'Jeans',
    size: '28',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop'],
    seller: {
      name: 'Maya S.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      rating: 4.7
    },
    tags: ['zara', 'skinny', 'high-waisted'],
    location: 'Portland, OR',
    postedAt: new Date('2024-01-08'),
    upvotes: 16,
    upvotedBy: [],
    views: 134
  },
  {
    id: '9',
    title: 'Cashmere Sweater',
    description: 'Luxurious beige cashmere sweater. Soft and warm, perfect for winter.',
    price: 95,
    category: 'Tops',
    type: 'Sweater',
    size: 'L',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
    seller: {
      name: 'David L.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
      rating: 4.6
    },
    tags: ['cashmere', 'luxury', 'winter'],
    location: 'Denver, CO',
    postedAt: new Date('2024-01-07'),
    upvotes: 28,
    upvotedBy: [],
    views: 221
  },
  {
    id: '10',
    title: 'Evening Gown',
    description: 'Stunning black evening gown worn once to a gala. Size 6, floor length.',
    price: 150,
    category: 'Dresses',
    type: 'Evening',
    size: 'S',
    condition: 'Like New',
    images: ['https://images.unsplash.com/photo-1566479179817-b40b28aedc7c?w=400&h=400&fit=crop'],
    seller: {
      name: 'Anna B.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      rating: 4.9
    },
    tags: ['formal', 'gala', 'elegant'],
    location: 'San Francisco, CA',
    postedAt: new Date('2024-01-06'),
    upvotes: 42,
    upvotedBy: [],
    views: 367
  },
  {
    id: '11',
    title: 'Leather Handbag',
    description: 'Genuine leather crossbody bag in brown. Multiple compartments, very practical.',
    price: 75,
    category: 'Accessories',
    type: 'Handbag',
    size: 'One Size',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'],
    seller: {
      name: 'Sophie M.',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      rating: 4.8
    },
    tags: ['leather', 'crossbody', 'practical'],
    location: 'Nashville, TN',
    postedAt: new Date('2024-01-05'),
    upvotes: 20,
    upvotedBy: [],
    views: 189
  },
  {
    id: '12',
    title: 'Sports Jacket',
    description: 'Navy blue blazer perfect for business casual. Tailored fit, barely worn.',
    price: 80,
    category: 'Outerwear',
    type: 'Blazer',
    size: 'M',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'],
    seller: {
      name: 'James W.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.7
    },
    tags: ['business', 'navy', 'tailored'],
    location: 'Atlanta, GA',
    postedAt: new Date('2024-01-04'),
    upvotes: 25,
    upvotedBy: [],
    views: 156
  }
];

const ITEMS_PER_PAGE = 8;

const Browse = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [items, setItems] = useState<Item[]>(sampleItems);
  const [filteredItems, setFilteredItems] = useState<Item[]>(sampleItems);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Load approved items from localStorage and merge with sample items
  useEffect(() => {
    const loadItems = () => {
      const browseItems = localStorage.getItem('browseItems');
      
      let dynamicItems = [...sampleItems];
      
      // Load approved items from admin workflow
      if (browseItems) {
        const parsedBrowseItems = JSON.parse(browseItems);
        console.log('Loaded browse items from localStorage:', parsedBrowseItems);
        
        // Convert date strings back to Date objects and ensure proper structure
        const processedItems = parsedBrowseItems.map((item: any) => ({
          ...item,
          // Ensure all required fields have default values
          price: item.price || 0,
          upvotes: item.upvotes || 0,
          upvotedBy: item.upvotedBy || [],
          views: item.views || 0,
          tags: item.tags || [],
          location: item.location || 'Unknown',
          condition: item.condition || 'Good',
          category: item.category || 'Other',
          type: item.type || 'Item',
          size: item.size || 'N/A',
          seller: item.seller || {
            name: 'Unknown Seller',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            rating: 4.0
          },
          postedAt: new Date(item.postedAt || item.submittedDate || Date.now()),
        }));
        
        dynamicItems = [...dynamicItems, ...processedItems];
      }
      
      console.log('Total items loaded:', dynamicItems.length);
      setItems(dynamicItems);
      setFilteredItems(dynamicItems);
    };

    loadItems();
    
    // Set up interval to refresh every 5 seconds to catch new approved items
    const interval = setInterval(loadItems, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter and sort items
  useEffect(() => {
    let filtered = items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Convert items to sortable format and sort with proper null checks
    const sortableItems = filtered.map(item => ({
      id: item.id,
      title: item.title || '',
      price: (item.price || 0).toString(),
      postedAt: item.postedAt ? item.postedAt.toISOString() : new Date().toISOString(),
      upvotes: item.upvotes || 0
    }));

    const sorted = sortItems(sortableItems, sortBy);
    
    // Convert back to Item format by finding original items
    const sortedItems = sorted.map(sortableItem => {
      const originalItem = filtered.find(item => item.id === sortableItem.id);
      return originalItem!;
    });

    setFilteredItems(sortedItems);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, sortBy, items]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleWishlistToggle = (item: Item) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      // Convert Item to WishlistItem format
      const wishlistItem = {
        id: item.id,
        title: item.title,
        price: item.price.toString(),
        image: item.images[0],
        condition: item.condition,
        size: item.size,
        brand: item.tags[0] || 'Unknown',
        addedDate: new Date().toISOString()
      };
      addToWishlist(wishlistItem);
    }
  };

  const handleUpvote = (itemId: string) => {
    const userId = 'current-user'; // This would come from auth context
    
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const hasUpvoted = item.upvotedBy.includes(userId);
          return {
            ...item,
            upvotes: hasUpvoted ? item.upvotes - 1 : item.upvotes + 1,
            upvotedBy: hasUpvoted 
              ? item.upvotedBy.filter(id => id !== userId)
              : [...item.upvotedBy, userId]
          };
        }
        return item;
      })
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-teal-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items, brands, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/80 backdrop-blur-sm border-border text-foreground"
              />
            </div>
            <div className="flex gap-2">
              <SortOptions 
                currentSort={sortBy} 
                onSortChange={setSortBy}
              />
              <Button 
                variant="outline" 
                size="sm"
                className="bg-background/80 backdrop-blur-sm border-border text-foreground hover:bg-muted"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {paginatedItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover-lift cursor-pointer bg-card/80 backdrop-blur-sm border-border text-card-foreground shadow-lg"
              onClick={() => navigate(`/item/${item.id}`)}
            >
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
                    alt={item.title || 'Item'}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-background/90 text-foreground border-border"
                    >
                      {item.condition}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-background/90 hover:bg-background text-foreground p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle(item);
                      }}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          isInWishlist(item.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                        }`} 
                      />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-green-600 text-white">
                      {item.price || 0} eco points
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <CardTitle className="text-lg mb-1 text-card-foreground">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{item.size} • {item.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{item.seller?.rating || 4.0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={item.seller?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                      alt={item.seller?.name || 'Seller'}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-muted-foreground">{item.seller?.name || 'Unknown Seller'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(item.postedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{item.views}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-xs hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote(item.id);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <ThumbsUp 
                            className={`h-3 w-3 ${
                              item.upvotedBy?.includes('current-user') 
                                ? 'fill-primary text-primary' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                          <span>{item.upvotes}</span>
                        </div>
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      {item.tags?.slice(0, 2).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-xs bg-muted text-muted-foreground border-border"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">No items found</h3>
              <p>Try adjusting your search terms or browse all items.</p>
            </div>
          </div>
        )}
      </div>

      <Chatbot />
    </div>
  );
};

export default Browse;

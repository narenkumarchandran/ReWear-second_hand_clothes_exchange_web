import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { itemsApi, ApiItem } from '@/services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  ShoppingBag,
  Star,
  Loader2,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

const Browse = () => {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('newest');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse URL params on load
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const search = params.get('search');
    
    if (cat && CATEGORIES.includes(cat)) setActiveCategory(cat);
    if (search) setSearchQuery(search);
    
    fetchItems(search || '', cat || 'All', activeSort);
  }, [location.search]);

  const fetchItems = async (search: string, category: string, sort: string) => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      params.sort = sort;

      const { items: fetchedItems } = await itemsApi.getAll(params);
      
      // Additional client-side sort if needed
      let sortedItems = [...fetchedItems];
      if (sort === 'newest') sortedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (sort === 'oldest') sortedItems.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (sort === 'price_asc') sortedItems.sort((a, b) => a.price - b.price);
      if (sort === 'price_desc') sortedItems.sort((a, b) => b.price - a.price);

      setItems(sortedItems.filter(item => item.status === 'approved'));
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlAndFetch();
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    // Slight timeout so state updates before fetch
    setTimeout(() => {
      fetchItems(searchQuery, cat, activeSort);
    }, 0);
  };

  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
    fetchItems(searchQuery, activeCategory, sort);
  };

  const updateUrlAndFetch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (activeCategory !== 'All') params.set('category', activeCategory);
    
    navigate(`/browse?${params.toString()}`, { replace: true });
    fetchItems(searchQuery, activeCategory, activeSort);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setTimeout(() => {
      fetchItems('', activeCategory, activeSort);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Search & Filter Header */}
      <div className="border-b border-border bg-card sticky top-[61px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands, items, styles..."
                className="pl-9 bg-background border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
            
            <div className="flex gap-2">
              <Button variant="outline" className="shrink-0 hidden sm:flex">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="shrink-0 w-full sm:w-auto justify-between">
                    <span className="flex items-center">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      {SORT_OPTIONS.find(o => o.value === activeSort)?.label}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {SORT_OPTIONS.map(option => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={activeSort === option.value ? 'bg-primary/10 text-primary font-medium' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                  activeCategory === cat 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background hover:bg-muted text-foreground border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            Loading items...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted p-4 rounded-full mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any items matching your current filters. Try adjusting your search or category.
            </p>
            <Button onClick={() => { setSearchQuery(''); handleCategoryChange('All'); }}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {items.map((item) => (
              <Card 
                key={item._id} 
                className="group cursor-pointer overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate(`/item/${item._id}`)}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img 
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-background/90 text-foreground backdrop-blur-sm font-semibold border-none">
                      {item.price} pts
                    </Badge>
                  </div>
                  {item.condition === 'New' && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary text-primary-foreground border-none text-[10px] uppercase">
                        New
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.brand || item.category}</span>
                    <span className="text-xs text-muted-foreground">{item.size || 'N/A'}</span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <img
                      src={item.sellerInfo?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sellerInfo?.email || 'default'}`}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-xs text-muted-foreground truncate flex-1">{item.sellerInfo?.name || 'Seller'}</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-muted-foreground">{item.sellerInfo?.rating || 4.8}</span>
                    </div>
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

export default Browse;

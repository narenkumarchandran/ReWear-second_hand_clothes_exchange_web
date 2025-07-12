
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  User, 
  ShoppingBag, 
  Plus, 
  Menu,
  X,
  Recycle,
  LogOut,
  Home,
  Settings,
  FileText,
  Heart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  const getUserAvatar = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      return profile.avatar;
    }
    return 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face';
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [
      { label: 'Home', href: '/', icon: Home }
    ];

    if (path === '/browse') {
      breadcrumbs.push({ label: 'Browse Items', href: '/browse', icon: ShoppingBag });
    } else if (path === '/profile') {
      breadcrumbs.push({ label: 'Profile', href: '/profile', icon: User });
    } else if (path === '/list-item') {
      breadcrumbs.push({ label: 'List Item', href: '/list-item', icon: Plus });
    } else if (path === '/wishlist') {
      breadcrumbs.push({ label: 'Wishlist', href: '/wishlist', icon: Heart });
    } else if (path.startsWith('/item/')) {
      breadcrumbs.push(
        { label: 'Browse Items', href: '/browse', icon: ShoppingBag },
        { label: 'Item Details', href: path, icon: FileText }
      );
    } else if (path === '/admin') {
      breadcrumbs.push({ label: 'Admin Dashboard', href: '/admin', icon: Settings });
    }

    return breadcrumbs;
  };

  const handleAuthAction = () => {
    if (isAuthenticated()) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/20 dark:border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-full">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">ReWear</span>
          </Link>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            
            {isAuthenticated() ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`transition-all duration-300 ${
                    location.pathname === '/' 
                      ? 'bg-green-100 text-green-700 font-medium shadow-sm dark:bg-green-900/30' 
                      : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`transition-all duration-300 ${
                    location.pathname === '/list-item' 
                      ? 'bg-green-100 text-green-700 font-medium shadow-sm dark:bg-green-900/30' 
                      : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  onClick={() => navigate('/list-item')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  List Item
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`transition-all duration-300 ${
                    location.pathname === '/browse' 
                      ? 'bg-green-100 text-green-700 font-medium shadow-sm dark:bg-green-900/30' 
                      : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  onClick={() => navigate('/browse')}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Browse Items
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`relative transition-all duration-300 ${
                    location.pathname === '/wishlist' 
                      ? 'bg-green-100 text-green-700 font-medium shadow-sm dark:bg-green-900/30' 
                      : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  onClick={() => navigate('/wishlist')}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`transition-all duration-300 ${
                    location.pathname === '/profile' 
                      ? 'bg-green-100 text-green-700 font-medium shadow-sm dark:bg-green-900/30' 
                      : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  onClick={() => navigate('/profile')}
                >
                  <img 
                    src={getUserAvatar()} 
                    alt="Profile" 
                    className="h-5 w-5 rounded-full mr-2 object-cover"
                  />
                  Profile
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm"
                  className="bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                  onClick={handleAuthAction}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`transition-all duration-300 ${
                    location.pathname === '/' 
                      ? 'bg-green-100 text-green-700 font-medium shadow-sm dark:bg-green-900/30' 
                      : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                  onClick={() => navigate('/')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAuthAction}
                >
                  Login
                </Button>
                <Button 
                  variant="pink"
                  size="sm"
                  onClick={handleAuthAction}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {location.pathname !== '/' && (
          <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
            <Breadcrumb>
              <BreadcrumbList>
                {getBreadcrumbs().map((crumb, index) => (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem>
                      {index === getBreadcrumbs().length - 1 ? (
                        <BreadcrumbPage className="flex items-center">
                          {crumb.icon && <crumb.icon className="h-4 w-4 mr-1" />}
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.href} className="flex items-center hover:text-primary">
                            {crumb.icon && <crumb.icon className="h-4 w-4 mr-1" />}
                            {crumb.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < getBreadcrumbs().length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-4 border-t border-white/20 dark:border-gray-700/20 pt-4">
            <div className="flex flex-col space-y-2">
              {isAuthenticated() ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`justify-start transition-all duration-300 ${
                      location.pathname === '/' 
                        ? 'bg-green-100 text-green-700 font-medium dark:bg-green-900/30' 
                        : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`justify-start transition-all duration-300 ${
                      location.pathname === '/list-item' 
                        ? 'bg-green-100 text-green-700 font-medium dark:bg-green-900/30' 
                        : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    onClick={() => navigate('/list-item')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    List Item
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`justify-start transition-all duration-300 ${
                      location.pathname === '/browse' 
                        ? 'bg-green-100 text-green-700 font-medium dark:bg-green-900/30' 
                        : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    onClick={() => navigate('/browse')}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Browse Items
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`justify-start relative transition-all duration-300 ${
                      location.pathname === '/wishlist' 
                        ? 'bg-green-100 text-green-700 font-medium dark:bg-green-900/30' 
                        : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    onClick={() => navigate('/wishlist')}
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Wishlist
                    {wishlistItems.length > 0 && (
                      <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                        {wishlistItems.length}
                      </Badge>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`justify-start transition-all duration-300 ${
                      location.pathname === '/profile' 
                        ? 'bg-green-100 text-green-700 font-medium dark:bg-green-900/30' 
                        : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    onClick={() => navigate('/profile')}
                  >
                    <img 
                      src={getUserAvatar()} 
                      alt="Profile" 
                      className="h-5 w-5 rounded-full mr-2 object-cover"
                    />
                    Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAuthAction}
                    className="justify-start border-red-200 text-red-600 dark:border-red-800 dark:text-red-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`justify-start transition-all duration-300 ${
                      location.pathname === '/' 
                        ? 'bg-green-100 text-green-700 font-medium dark:bg-green-900/30' 
                        : 'bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAuthAction}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="pink"
                    size="sm"
                    onClick={handleAuthAction}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

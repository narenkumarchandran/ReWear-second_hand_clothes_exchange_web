
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  LogOut,
  Home,
  Heart,
  MessageSquare,
  Package
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthAction = () => {
    if (isAuthenticated()) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const navItems = [
    { label: 'Home', icon: Home, path: '/', hideForAdmin: true },
    { label: 'Browse', icon: ShoppingBag, path: '/browse' },
    { label: 'Purchases', icon: ShoppingBag, path: '/purchases', authRequired: true, hideForAdmin: true },
    { label: 'List Item', icon: Plus, path: '/list-item', authRequired: true, hideForAdmin: true },
    { label: 'Messages', icon: MessageSquare, path: '/messages', authRequired: true },
    { label: 'Admin', icon: Package, path: '/admin', adminOnly: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-1.5 rounded-lg">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ReWear</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated()) return null;
              if (item.adminOnly && !isAdmin()) return null;
              if (item.hideForAdmin && isAdmin()) return null;
              return (
                <Button 
                  key={item.path}
                  variant="ghost" 
                  size="sm"
                  className={`transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-1.5">
            <ThemeToggle />
            
            {isAuthenticated() ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`relative transition-all duration-200 ${
                    isActive('/wishlist') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => navigate('/wishlist')}
                >
                  <Heart className="h-4 w-4" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>

                {/* Points Display */}
                <div className="flex items-center px-2 py-1 mr-1 bg-primary/10 rounded-full border border-primary/20">
                  <span className="text-xs font-bold text-primary flex items-center">
                    <span className="mr-1">💰</span>
                    {user?.points ?? 0} pts
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`transition-all duration-200 ${
                    isActive('/profile') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4 mr-1.5" />
                  <span className="max-w-[80px] truncate">{user?.name?.split(' ')[0] || 'Profile'}</span>
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleAuthAction}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Get Started
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
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 space-y-1 pb-3 border-t border-border pt-3 animate-in">
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated()) return null;
              if (item.adminOnly && !isAdmin()) return null;
              if (item.hideForAdmin && isAdmin()) return null;
              return (
                <Button 
                  key={item.path}
                  variant="ghost" 
                  size="sm" 
                  className={`w-full justify-start transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => { navigate(item.path); setIsMenuOpen(false); }}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
            
            {isAuthenticated() ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => { navigate('/wishlist'); setIsMenuOpen(false); }}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist
                  {wishlistItems.length > 0 && (
                    <Badge className="ml-2 h-4 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { handleAuthAction(); setIsMenuOpen(false); }}
                  className="w-full justify-start text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                size="sm"
                onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                className="w-full"
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

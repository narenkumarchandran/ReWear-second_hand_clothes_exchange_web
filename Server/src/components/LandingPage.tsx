
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, Package, Search, Users, Star, ShieldCheck, Zap } from 'lucide-react';
import { itemsApi, ApiItem } from '@/services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const [featuredItems, setFeaturedItems] = useState<ApiItem[]>([]);

  useEffect(() => {
    if (isAdmin()) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  // Fetch real items from API instead of hardcoded data
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { items } = await itemsApi.getAll({ sort: 'popular' });
        setFeaturedItems(items.slice(0, 3));
      } catch (error) {
        console.error('Failed to load featured items:', error);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>Give your clothes a second life</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground tracking-tight animate-slide-up">
            Buy, swap & sell <br />
            <span className="gradient-text">pre-loved fashion</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Discover unique styles from real people. List what you don't wear, 
            find what you love — all in one beautiful marketplace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in">
            <Button 
              size="lg" 
              className="px-8 text-base"
              onClick={() => navigate('/browse')}
            >
              <Search className="h-4 w-4 mr-2" />
              Browse Items
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 text-base"
              onClick={() => navigate('/list-item')}
            >
              <Package className="h-4 w-4 mr-2" />
              Start Selling
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-4 border-y border-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '25K+', label: 'Items Listed' },
            { value: '15K+', label: 'Successful Swaps' },
            { value: '4.9', label: 'Avg. Rating' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Trending right now
              </h2>
              <p className="text-muted-foreground text-lg">
                Popular picks from our community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <Card 
                  key={item._id} 
                  className="group hover-lift cursor-pointer overflow-hidden bg-card border-border"
                  onClick={() => navigate(`/item/${item._id}`)}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'} 
                      alt={item.title}
                      className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {item.price} pts
                    </div>
                    <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                      {item.condition}
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-primary font-medium uppercase tracking-wide">{item.category}</span>
                      <div className="flex items-center">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-muted-foreground ml-1">{item.sellerInfo?.rating || 4.8}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex items-center gap-2">
                      <img
                        src={item.sellerInfo?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sellerInfo?.email || 'default'}`}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-muted-foreground">{item.sellerInfo?.name || 'Seller'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => navigate('/browse')}>
                View all items
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to refresh your wardrobe
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: Package,
                step: '01',
                title: 'List your items',
                desc: 'Upload photos and let our AI generate descriptions. Each listing is reviewed for quality.'
              },
              {
                icon: Search,
                step: '02',
                title: 'Discover & connect',
                desc: 'Browse unique finds, message sellers, and request swaps or purchases using eco points.'
              },
              {
                icon: Zap,
                step: '03',
                title: 'Exchange & enjoy',
                desc: 'Complete your exchange and earn points. Your old favorites become someone else\'s treasure.'
              },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <item.icon className="h-7 w-7" />
                  <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Built for the modern wardrobe
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: 'AI-Powered Listings', desc: 'Auto-generate descriptions and predict sizes from your photos.' },
              { icon: ShieldCheck, title: 'Admin-Reviewed', desc: 'Every item is reviewed by our team before going live.' },
              { icon: Users, title: 'Direct Messaging', desc: 'Chat directly with sellers and negotiate swaps.' },
            ].map((f, i) => (
              <Card key={i} className="bg-card border-border hover-lift transition-all duration-200">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated() && (
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to refresh your wardrobe?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users buying, swapping and selling pre-loved fashion.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="px-8 text-base" onClick={() => navigate('/login')}>
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 text-base" onClick={() => navigate('/browse')}>
                Explore Items
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">ReWear</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ReWear. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="mailto:hello@rewear.com" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

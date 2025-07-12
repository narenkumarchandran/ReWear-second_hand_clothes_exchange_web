
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Shirt, Recycle, Users, Star, ArrowRight, Sparkles, Droplets, TreePine, Award } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const featuredItems = [
    {
      id: 1,
      title: "Vintage Denim Jacket",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=400&fit=crop",
      points: 150,
      category: "Outerwear"
    },
    {
      id: 2,
      title: "Floral Summer Dress",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop",
      points: 120,
      category: "Dresses"
    },
    {
      id: 3,
      title: "Designer Sneakers",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop",
      points: 200,
      category: "Footwear"
    }
  ];

  const impactStats = [
    { icon: Droplets, value: "2.7M", label: "Liters Water Saved", color: "text-blue-500" },
    { icon: TreePine, value: "850kg", label: "CO₂ Reduced", color: "text-green-500" },
    { icon: Shirt, value: "15k", label: "Items Rescued", color: "text-purple-500" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 via-white to-emerald-50/20"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="floating-animation inline-block mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-full">
              <Recycle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text">
            ReWear
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your wardrobe sustainably. Swap, redeem, and discover pre-loved fashion 
            while reducing textile waste, one piece at a time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              variant="pink"
              className="px-8 py-4 text-lg hover-lift text-charcoal"
              onClick={() => navigate('/list-item')}
            >
              Start Swapping
            </Button>
            <Button 
              size="lg" 
              variant="pink"
              className="px-8 py-4 text-lg hover-lift text-charcoal"
              onClick={() => navigate('/browse')}
            >
              Browse Items
            </Button>
          </div>

          {/* Eco-Impact Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            {impactStats.map((stat, index) => (
              <Card key={index} className="glass-effect hover-lift">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`h-12 w-12 ${stat.color} mx-auto mb-4`} />
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="glass-effect hover-lift">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">10,000+</h3>
                <p className="text-gray-600">Active Swappers</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect hover-lift">
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">500+</h3>
                <p className="text-gray-600">Sustainability Badges</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect hover-lift">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">95%</h3>
                <p className="text-gray-600">Satisfaction Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Items Carousel */}
      <section className="py-20 px-4 bg-gradient-to-r from-white/90 to-green-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Featured Items
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing pre-loved fashion waiting for a new home
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <Card key={item.id} className="group hover-lift glass-effect overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/item/${item.id}`)}>
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {item.points} pts
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-600 font-medium">{item.category}</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.8</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{item.title}</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="pink" className="flex-1">
                      Quick Swap
                    </Button>
                    <Button variant="pink" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              How ReWear Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to sustainable fashion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-6 rounded-full w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">List Your Items</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload photos and details of clothes you no longer wear. Our admin team reviews each listing for quality.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-6 rounded-full w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Browse & Swap</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover amazing items from other users. Make direct swaps or use points to redeem items you love.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-teal-400 to-cyan-400 p-6 rounded-full w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Enjoy & Repeat</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive your new-to-you items and earn points for successful swaps. Keep the cycle of sustainability going!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get in Touch
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Have questions? We'd love to hear from you
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="opacity-90">hello@rewear.com</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <p className="opacity-90">123 Green Street<br/>Eco City, EC 12345</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="opacity-90">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

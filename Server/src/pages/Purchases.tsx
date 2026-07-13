import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { transactionsApi, ApiTransaction } from '@/services/api';
import { 
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';

const Purchases = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<ApiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadPurchases = async () => {
      try {
        const { transactions } = await transactionsApi.list();
        // Filter for transactions where we are the buyer and type is buy
        const myPurchases = transactions.filter(t => t.type === 'buy' && (t.buyer === user?.id || t.buyer?._id === user?.id || (t.buyer && t.buyer.id === user?.id)));
        setPurchases(myPurchases);
      } catch (error) {
        console.error('Failed to load purchases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, [isAuthenticated, navigate, user?.id]);

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejected (Refunded)</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Purchases</h1>
            <p className="text-muted-foreground mt-1">Track items you've bought using points.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            Loading purchases...
          </div>
        ) : purchases.length === 0 ? (
          <Card className="bg-card border-dashed border-border py-20 text-center">
            <CardContent className="flex flex-col items-center p-0">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">no purchases</h3>
              <p className="text-muted-foreground mb-6">You haven't bought any items yet.</p>
              <Button onClick={() => navigate('/browse')}>Browse Items</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {purchases.map((purchase) => (
              <Card key={purchase._id} className="bg-card border-border overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 shrink-0 bg-muted border-r border-border cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate(`/item/${purchase.item._id}`)}>
                    <img 
                      src={purchase.item.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'} 
                      alt={purchase.item.title}
                      className="w-full h-full object-cover min-h-[160px] sm:min-h-full"
                    />
                  </div>
                  
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-foreground hover:text-primary cursor-pointer transition-colors" onClick={() => navigate(`/item/${purchase.item._id}`)}>
                            {purchase.item.title}
                          </h3>
                          <div className="text-sm text-muted-foreground mt-1">
                            Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-destructive">-{purchase.points} pts</div>
                          <div className="mt-2 flex justify-end">
                            {getStatusBadge(purchase.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-muted/30 border border-border rounded-lg flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Seller: <span className="font-medium text-foreground">{purchase.seller.name}</span></span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Purchases;

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { itemsApi, ApiItem } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { 
  Package, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings,
  Eye,
  ArrowUpCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const MyItems = () => {
  const [items, setItems] = useState<ApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadItems();
  }, [isAuthenticated, navigate]);

  const loadItems = async () => {
    try {
      const { items: myItems } = await itemsApi.getMy();
      setItems(myItems);
    } catch (error) {
      console.error('Failed to load my items:', error);
      toast.error('Failed to load your items');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="h-3 w-3 mr-1" />Live</Badge>;
      case 'on-processing':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Review</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Manage My Listings
            </h1>
            <p className="text-muted-foreground mt-1">View and manage the items you're selling or swapping.</p>
          </div>
          <Button onClick={() => navigate('/list-item')}>
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            Loading your listings...
          </div>
        ) : items.length === 0 ? (
          <Card className="bg-card border-dashed border-border py-20 text-center">
            <CardContent className="flex flex-col items-center p-0">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No listings yet</h2>
              <p className="text-muted-foreground mb-6">You haven't listed any items for exchange yet.</p>
              <Button onClick={() => navigate('/list-item')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Listing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item._id} className="bg-card border-border overflow-hidden flex flex-col group">
                <div className="relative aspect-video bg-muted border-b border-border">
                  <img
                    src={item.images?.[0] || ''}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(item.status)}
                  </div>
                  {item.status === 'approved' && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/item/${item._id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Page
                      </Button>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-foreground line-clamp-1 mb-1" title={item.title}>
                    {item.title}
                  </h3>
                  <div className="text-sm font-medium text-primary mb-3">
                    {item.price} pts
                  </div>

                  {item.status === 'rejected' && (
                    <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-md mb-3 flex items-start gap-1.5">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-2" title={item.rejectionMessage}>
                        {item.rejectionMessage || 'Rejected by moderation team.'}
                      </span>
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {item.views || 0} Views
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowUpCircle className="h-3 w-3" />
                      {item.upvotes || 0} Upvotes
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 flex gap-2">
                    <Button variant="outline" className="flex-1 text-xs h-8" disabled>
                      <Settings className="h-3 w-3 mr-1.5" />
                      Edit
                    </Button>
                    {item.status === 'approved' && (
                      <Button variant="outline" className="flex-1 text-xs h-8" onClick={() => navigate(`/item/${item._id}`)}>
                        <Eye className="h-3 w-3 mr-1.5" />
                        View
                      </Button>
                    )}
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

// Just needed for the rejected icon fallback if imported later
import { AlertTriangle } from 'lucide-react';

export default MyItems;

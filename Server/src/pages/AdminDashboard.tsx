import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { itemsApi, ApiItem } from '@/services/api';
import Header from '@/components/Header';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AdminUsers from './AdminUsers';

const AdminDashboard = () => {
  const [pendingItems, setPendingItems] = useState<ApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'users'>('items');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rejectItemId, setRejectItemId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = async () => {
    try {
      const { items } = await itemsApi.getPending('on-processing');
      setPendingItems(items);
    } catch (error) {
      console.error('Failed to load pending items:', error);
      toast.error('Failed to load pending items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await itemsApi.approve(id);
      toast.success('Item approved successfully');
      setPendingItems(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('Failed to approve item');
    }
  };

  const handleReject = async () => {
    if (!rejectItemId) return;
    if (!rejectReason.trim()) {
      toast.error('Please enter a reason for rejection.');
      return;
    }
    
    try {
      await itemsApi.reject(rejectItemId, rejectReason.trim());
      toast.success('Item rejected and user notified via message');
      setPendingItems(prev => prev.filter(item => item._id !== rejectItemId));
      setRejectItemId(null);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('Failed to reject item');
    }
  };

  const NavLinks = () => (
    <>
      <button 
        onClick={() => { setActiveTab('items'); setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'items' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
      >
        <Package className="h-4 w-4" />
        Items Pending
        {pendingItems.length > 0 && (
          <Badge className="ml-auto bg-primary text-primary-foreground h-5 px-1.5 flex items-center justify-center text-[10px]">
            {pendingItems.length}
          </Badge>
        )}
      </button>
      <button 
        onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'users' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
      >
        <TrendingUp className="h-4 w-4" />
        Manage Users
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="w-64 border-r border-border bg-card hidden md:block shrink-0 h-[calc(100vh-73px)] overflow-y-auto">
          <div className="p-4 space-y-1">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Admin Area
            </h2>
            <NavLinks />
          </div>
        </aside>

        {/* Sidebar Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div 
              className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-4 shadow-xl z-50 animate-in slide-in-from-left"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Admin Area
              </h2>
              <NavLinks />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 h-[calc(100vh-73px)] overflow-y-auto bg-background/50">
          <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6 md:hidden">
              <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
            </div>

            {activeTab === 'users' ? (
              <AdminUsers />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Items Pending Approval</h2>
                    <p className="text-muted-foreground">Review user submissions before they go live on the platform.</p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    Loading items...
                  </div>
                ) : pendingItems.length === 0 ? (
                  <Card className="bg-card border-dashed border-border py-20 text-center">
                    <CardContent className="flex flex-col items-center p-0">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">All caught up!</h3>
                      <p className="text-muted-foreground">There are no items waiting for approval.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {pendingItems.map((item) => (
                      <Card key={item._id} className="bg-card border-border overflow-hidden group">
                        <div className="flex flex-col md:flex-row">
                          {/* Item Image */}
                          <div className="w-full md:w-64 shrink-0 bg-muted border-r border-border">
                            <img 
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'} 
                              alt={item.title}
                              className="w-full h-full object-cover min-h-[200px]"
                            />
                          </div>
                          
                          {/* Item Info */}
                          <CardContent className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Badge variant="outline" className="mb-2 uppercase text-[10px] tracking-wider">{item.category}</Badge>
                                  <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-primary">{item.price} pts</div>
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {item.description}
                              </p>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm bg-muted/30 p-3 rounded-lg border border-border">
                                <div>
                                  <span className="text-muted-foreground block text-xs mb-0.5">Brand</span>
                                  <span className="font-medium text-foreground">{item.brand || 'Unbranded'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-xs mb-0.5">Size</span>
                                  <span className="font-medium text-foreground">{item.size || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-xs mb-0.5">Condition</span>
                                  <span className="font-medium text-foreground">{item.condition}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground block text-xs mb-0.5">Seller</span>
                                  <span className="font-medium text-foreground truncate block" title={item.sellerInfo?.name}>{item.sellerInfo?.name || 'Unknown'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-3 mt-auto pt-4 border-t border-border">
                              <Button 
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
                                onClick={() => handleApprove(item._id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Listing
                              </Button>
                              <Button 
                                variant="destructive" 
                                className="flex-1"
                                onClick={() => { setRejectItemId(item._id); setRejectReason(''); }}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={!!rejectItemId} onOpenChange={(open) => !open && setRejectItemId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Item Listing</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this item. This will be sent as a direct message to the seller.
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. The item images are too blurry, or it violates our terms..."
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectItemId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject & Notify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;

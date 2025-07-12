import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Check, 
  X, 
  Eye, 
  AlertTriangle, 
  Clock,
  Filter,
  Search,
  Users,
  Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PendingItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  brand: string;
  size: string;
  price: string;
  location: string;
  images: string[];
  submittedDate: string;
  status: 'on-processing' | 'approved' | 'rejected';
  tags: string[];
  upvotes?: number;
  upvotedBy?: string[];
  rejectionMessage?: string;
}

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'on-processing' | 'approved' | 'rejected'>('on-processing');
  const [isLoading, setIsLoading] = useState(false);

  // Load items from localStorage
  useEffect(() => {
    const loadItems = () => {
      const storedItems = localStorage.getItem('pendingItems');
      if (storedItems) {
        const items = JSON.parse(storedItems);
        setPendingItems(items);
      }
    };

    loadItems();
    
    // Set up interval to refresh every 5 seconds
    const interval = setInterval(loadItems, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleApprove = async (itemId: string) => {
    setIsLoading(true);
    try {
      // Find the item to approve
      const itemToApprove = pendingItems.find(item => item.id === itemId);
      if (!itemToApprove) {
        toast.error('Item not found');
        return;
      }

      // Update pending items status
      const updatedPendingItems = pendingItems.map(item => 
        item.id === itemId 
          ? { ...item, status: 'approved' as const }
          : item
      );
      
      localStorage.setItem('pendingItems', JSON.stringify(updatedPendingItems));
      setPendingItems(updatedPendingItems);
      
      // Add to browse items with proper structure
      const existingBrowseItems = JSON.parse(localStorage.getItem('browseItems') || '[]');
      
      // Create browse item with proper format matching Browse.tsx structure
      const browseItem = {
        id: itemToApprove.id,
        title: itemToApprove.title,
        description: itemToApprove.description,
        price: parseInt(itemToApprove.price),
        category: itemToApprove.category,
        type: itemToApprove.category,
        size: itemToApprove.size,
        condition: itemToApprove.condition,
        images: itemToApprove.images,
        seller: {
          name: "User", // Default seller name
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          rating: 4.8
        },
        tags: itemToApprove.tags || [],
        location: itemToApprove.location || "New York, NY",
        postedAt: new Date(itemToApprove.submittedDate),
        upvotes: 0,
        upvotedBy: [],
        views: 0
      };
      
      // Add to browse items
      const updatedBrowseItems = [...existingBrowseItems, browseItem];
      localStorage.setItem('browseItems', JSON.stringify(updatedBrowseItems));
      
      console.log('Item approved and added to browse:', browseItem);
      toast.success('Item approved and added to browse!');
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to approve item:', error);
      toast.error('Failed to approve item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (itemId: string, rejectionMessage: string) => {
    if (!rejectionMessage.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsLoading(true);
    try {
      const updatedItems = pendingItems.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status: 'rejected' as const,
              rejectionMessage: rejectionMessage 
            }
          : item
      );
      
      localStorage.setItem('pendingItems', JSON.stringify(updatedItems));
      setPendingItems(updatedItems);
      
      toast.success('Item rejected with message');
      setSelectedItem(null);
    } catch (error) {
      toast.error('Failed to reject item');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = pendingItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-teal-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ReWear Admin
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Content Moderation Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <div className="text-right">
                <p className="font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {pendingItems.filter(item => item.status === 'on-processing').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">On Processing</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {pendingItems.filter(item => item.status === 'approved').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Approved</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <X className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {pendingItems.filter(item => item.status === 'rejected').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Rejected</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {pendingItems.length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Total Items</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-effect border-blue-200 dark:border-blue-800 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    placeholder="Search items, brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-blue-200 focus:border-blue-400 dark:bg-gray-700 dark:border-blue-700"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {(['all', 'on-processing', 'approved', 'rejected'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    onClick={() => setFilterStatus(status)}
                    className={filterStatus === status ? 
                      "bg-blue-500 hover:bg-blue-600" : 
                      "border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
                    }
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {status === 'on-processing' ? 'Processing' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="glass-effect border-blue-200 dark:border-blue-800 hover-lift cursor-pointer"
                  onClick={() => setSelectedItem(item)}>
              <div className="relative">
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className={`absolute top-2 right-2 ${getStatusColor(item.status)}`}>
                  {item.status === 'on-processing' ? 'Processing' : item.status}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.brand} • {item.size} • {item.condition}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {new Date(item.submittedDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {item.price} pts
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No items found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try different search terms or filters' : 'No items match the selected filter'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Review Item</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <img 
                  src={selectedItem.images[0]} 
                  alt={selectedItem.title}
                  className="w-full h-64 object-cover rounded-lg bg-white"
                />
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">{selectedItem.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedItem.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Brand</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedItem.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedItem.size}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Condition</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedItem.condition}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Points</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedItem.price}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</p>
                      <p className="text-gray-600 dark:text-gray-400">{selectedItem.location}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Submission Information</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted: {new Date(selectedItem.submittedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedItem.status === 'on-processing' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rejection Message (if rejecting)</label>
                      <Textarea 
                        placeholder="Enter reason for rejection..."
                        className="min-h-[80px]"
                        id="rejectionMessage"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => {
                          const message = (document.getElementById('rejectionMessage') as HTMLTextAreaElement)?.value;
                          handleReject(selectedItem.id, message);
                        }}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(selectedItem.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        disabled={isLoading}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                )}

                {selectedItem.status === 'rejected' && selectedItem.rejectionMessage && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">Rejection Reason:</h4>
                    <p className="text-red-700 dark:text-red-300">{selectedItem.rejectionMessage}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

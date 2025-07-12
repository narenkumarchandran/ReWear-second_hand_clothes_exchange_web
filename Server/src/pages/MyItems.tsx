
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  Clock, 
  Check, 
  X, 
  Eye,
  AlertTriangle
} from 'lucide-react';

interface UserItem {
  id: string;
  title: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  rejectionMessage?: string;
}

const MyItems = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userItems, setUserItems] = useState<UserItem[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadUserItems = () => {
      const pendingItems = JSON.parse(localStorage.getItem('pendingItems') || '[]');
      const userSubmittedItems = pendingItems.filter(item => item.submittedBy === user.email);
      setUserItems(userSubmittedItems);
    };

    loadUserItems();
    const interval = setInterval(loadUserItems, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-700/20">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mr-4 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Submitted Items</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track the status of your submitted items
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {userItems.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <Check className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {userItems.filter(item => item.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <X className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {userItems.filter(item => item.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-green-200 dark:border-green-800">
            <CardContent className="p-4 text-center">
              <Eye className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {userItems.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Items */}
        {userItems.length === 0 ? (
          <Card className="glass-effect border-green-200 dark:border-green-800">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                No items submitted yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start by listing your first item for review
              </p>
              <Button 
                onClick={() => navigate('/list-item')}
                className="bg-green-500 hover:bg-green-600"
              >
                List Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userItems.map((item) => (
              <Card key={item.id} className="glass-effect border-green-200 dark:border-green-800 overflow-hidden">
                <div className="relative">
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className={`absolute top-2 right-2 ${getStatusColor(item.status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {item.status}
                    </div>
                  </Badge>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {item.title}
                  </h3>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Submitted: {new Date(item.submittedDate).toLocaleDateString()}
                  </div>

                  {item.status === 'rejected' && item.rejectionMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <h4 className="font-medium text-red-800 dark:text-red-400 text-sm mb-1">
                        Rejection Reason:
                      </h4>
                      <p className="text-red-700 dark:text-red-300 text-sm">
                        {item.rejectionMessage}
                      </p>
                    </div>
                  )}

                  {item.status === 'approved' && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-green-700 dark:text-green-300 text-sm">
                        Your item has been approved and is now live in the marketplace!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyItems;

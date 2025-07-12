import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Users, 
  Search,
  User,
  Mail,
  Calendar,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserData {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  isAdmin: boolean;
  totalListings: number;
  status: 'active' | 'suspended';
  avatar?: string;
}

const AdminUsers = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'admin'>('all');

  // Load users from localStorage and generate mock data
  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = localStorage.getItem('systemUsers');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Generate some mock users for demonstration
        const mockUsers: UserData[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            joinDate: '2024-01-15',
            isAdmin: false,
            totalListings: 5,
            status: 'active'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            joinDate: '2024-02-20',
            isAdmin: false,
            totalListings: 12,
            status: 'active'
          },
          {
            id: '3',
            name: 'Admin User',
            email: 'admin@example.com',
            joinDate: '2024-01-01',
            isAdmin: true,
            totalListings: 0,
            status: 'active'
          }
        ];
        localStorage.setItem('systemUsers', JSON.stringify(mockUsers));
        setUsers(mockUsers);
      }
    };

    loadUsers();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const filteredUsers = users.filter(userData => {
    const matchesSearch = userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'admin' && userData.isAdmin) ||
                         userData.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getDefaultAvatar = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iMzUiIHI9IjE1IiBmaWxsPSIjOWNhM2FmIi8+CjxwYXRoIGQ9Ik0yMCA4NWMwLTE2LjU2OSAxMy40MzEtMzAgMzAtMzBzMzAgMTMuNDMxIDMwIDMwSDIweiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K';
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
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage system users and permissions</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
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
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {users.length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Total Users</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <User className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {users.filter(u => u.status === 'active').length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Active Users</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {users.filter(u => u.isAdmin).length}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Administrators</p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {users.reduce((acc, u) => acc + u.totalListings, 0)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Total Listings</p>
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
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-blue-200 focus:border-blue-400 dark:bg-gray-700 dark:border-blue-700"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {(['all', 'active', 'suspended', 'admin'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    onClick={() => setFilterStatus(status)}
                    className={filterStatus === status ? 
                      "bg-blue-500 hover:bg-blue-600" : 
                      "border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((userData) => (
            <Card key={userData.id} className="glass-effect border-blue-200 dark:border-blue-800 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userData.avatar || getDefaultAvatar()} alt={userData.name} />
                    <AvatarFallback className="bg-white dark:bg-gray-700">
                      {userData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{userData.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{userData.email}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getStatusColor(userData.status)}>
                      {userData.status}
                    </Badge>
                    {userData.isAdmin && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Joined:</span>
                    <span>{new Date(userData.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Listings:</span>
                    <span className="font-medium">{userData.totalListings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="glass-effect border-blue-200 dark:border-blue-800">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">No users found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try different search terms or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;

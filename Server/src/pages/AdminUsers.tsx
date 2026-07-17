import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usersApi, conversationsApi, ApiUser, ApiItem } from '@/services/api';
import { 
  Users as UsersIcon,
  Search,
  MoreVertical,
  ShieldAlert,
  CheckCircle,
  Ban,
  Mail,
  Calendar,
  X,
  Package,
  Loader2,
  Edit2,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const AdminUsers = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ApiUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // User detail sheet state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<{user: ApiUser, items: ApiItem[], purchases?: any[]} | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [isEditPointsOpen, setIsEditPointsOpen] = useState(false);
  const [editPointsValue, setEditPointsValue] = useState<number | string>('');
  const [isMessaging, setIsMessaging] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { users: data } = await usersApi.listAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter(u => 
        u.name?.toLowerCase().includes(term) || 
        u.email?.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, users]);

  const loadUserDetails = async (id: string) => {
    setSelectedUserId(id);
    setIsDetailLoading(true);
    try {
      const data = await usersApi.getById(id);
      setSelectedUserDetails(data);
    } catch (error) {
      toast.error('Failed to load user details');
      setSelectedUserId(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSuspend = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await usersApi.suspend(id);
      toast.success('User suspended successfully');
      loadUsers();
      if (selectedUserId === id) loadUserDetails(id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to suspend user');
    }
  };

  const handleUnsuspend = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await usersApi.unsuspend(id);
      toast.success('User unsuspended successfully');
      loadUsers();
      if (selectedUserId === id) loadUserDetails(id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to unsuspend user');
    }
  };

  const handleOpenEditPoints = () => {
    if (selectedUserDetails) {
      setEditPointsValue(selectedUserDetails.user.points || 0);
      setIsEditPointsOpen(true);
    }
  };

  const handleSavePoints = async () => {
    if (!selectedUserId || editPointsValue === '') return;
    const points = parseInt(editPointsValue as string, 10);
    if (isNaN(points)) {
      toast.error('Points must be a valid number');
      return;
    }

    try {
      await usersApi.updatePoints(selectedUserId, points);
      toast.success('Points updated successfully');
      setIsEditPointsOpen(false);
      loadUserDetails(selectedUserId);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update points');
    }
  };

  const handleMessageUser = async () => {
    if (!selectedUserId) return;
    setIsMessaging(true);
    try {
      const { conversation } = await conversationsApi.create(selectedUserId, undefined, 'user-admin');
      navigate(`/messages/${conversation._id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start conversation');
    } finally {
      setIsMessaging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Users Management</h2>
          <p className="text-muted-foreground">Manage accounts, view activity, and handle suspensions.</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
          <div className="text-sm text-muted-foreground ml-4 shrink-0">
            {filteredUsers.length} Users
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <UsersIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
              No users found matching your search.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Points</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => loadUserDetails(user._id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={user.role === 'admin' ? 'border-primary text-primary' : ''}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'suspended' ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          <Ban className="w-3 h-3 mr-1" /> Suspended
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {user.points || 0}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); loadUserDetails(user._id); }}>
                            View Details
                          </DropdownMenuItem>
                          {user.role !== 'admin' && (
                            user.status === 'suspended' ? (
                              <DropdownMenuItem className="text-emerald-500" onClick={(e) => handleUnsuspend(user._id, e)}>
                                Unsuspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-destructive" onClick={(e) => handleSuspend(user._id, e)}>
                                Suspend User
                              </DropdownMenuItem>
                            )
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* User Details Slide-over */}
      <Sheet open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <SheetContent className="w-full sm:max-w-md border-border bg-card p-0 flex flex-col">
          {isDetailLoading || !selectedUserDetails ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-border bg-muted/20">
                <SheetHeader className="mb-6 flex flex-row items-center justify-between">
                  <SheetTitle>User Details</SheetTitle>
                </SheetHeader>
                
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage src={selectedUserDetails.user.avatar} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {selectedUserDetails.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      {selectedUserDetails.user.name}
                      {selectedUserDetails.user.status === 'suspended' && (
                        <Badge className="bg-destructive hover:bg-destructive text-destructive-foreground">Suspended</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedUserDetails.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {new Date(selectedUserDetails.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedUserDetails.user.role !== 'admin' && (
                    selectedUserDetails.user.status === 'suspended' ? (
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUnsuspend(selectedUserDetails.user._id)}>
                        Unsuspend User
                      </Button>
                    ) : (
                      <Button variant="destructive" className="w-full" onClick={() => handleSuspend(selectedUserDetails.user._id)}>
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        Suspend User
                      </Button>
                    )
                  )}
                  <Button variant="outline" className="w-full" onClick={handleMessageUser} disabled={isMessaging}>
                    {isMessaging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                    Message User
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Statistics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="bg-muted/30 border-border group relative">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-primary flex items-center gap-2">
                            {selectedUserDetails.user.points || 0}
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleOpenEditPoints}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">Eco Points</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30 border-border">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-foreground">{selectedUserDetails.items.length}</div>
                          <div className="text-xs text-muted-foreground">Total Listings</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted/30 border-border">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-foreground">{selectedUserDetails.purchases?.length || 0}</div>
                          <div className="text-xs text-muted-foreground">Purchases</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Listings */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider flex items-center justify-between">
                      Recent Listings
                      <Badge variant="outline">{selectedUserDetails.items.length}</Badge>
                    </h4>
                    
                    {selectedUserDetails.items.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                        No items listed yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedUserDetails.items.slice(0, 5).map(item => (
                          <div key={item._id} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                            <div className="w-16 h-16 rounded bg-muted overflow-hidden shrink-0">
                              <img src={item.images?.[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-sm truncate">{item.title}</h5>
                              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                <span>{item.price} pts</span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">{item.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        {selectedUserDetails.items.length > 5 && (
                          <Button variant="ghost" className="w-full text-sm" size="sm">
                            View all {selectedUserDetails.items.length} listings
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Purchases */}
                  {selectedUserDetails.purchases && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider flex items-center justify-between">
                        Purchase History
                        <Badge variant="outline">{selectedUserDetails.purchases.length}</Badge>
                      </h4>
                      
                      {selectedUserDetails.purchases.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                          No purchases yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedUserDetails.purchases.slice(0, 5).map(purchase => (
                            <div key={purchase._id} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                              <div className="w-16 h-16 rounded bg-muted overflow-hidden shrink-0">
                                <img src={purchase.item?.images?.[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm truncate">{purchase.item?.title || 'Unknown Item'}</h5>
                                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                  <span className="text-destructive font-medium">-{purchase.points} pts</span>
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">{purchase.status}</Badge>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1 truncate">
                                  From: {purchase.seller?.name || 'Unknown User'}
                                </div>
                              </div>
                            </div>
                          ))}
                          {selectedUserDetails.purchases.length > 5 && (
                            <Button variant="ghost" className="w-full text-sm" size="sm">
                              View all {selectedUserDetails.purchases.length} purchases
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Points Dialog */}
      <Dialog open={isEditPointsOpen} onOpenChange={setIsEditPointsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User Points</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="points">Eco Points</Label>
              <Input
                id="points"
                type="number"
                value={editPointsValue}
                onChange={(e) => setEditPointsValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPointsOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePoints}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;

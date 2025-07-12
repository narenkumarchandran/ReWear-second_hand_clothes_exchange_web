
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ListItem from "./pages/ListItem";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Browse from "./pages/Browse";
import ItemDetail from "./pages/ItemDetail";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import Wishlist from "./pages/Wishlist";
import MyItems from "./pages/MyItems";
import Chatbot from "./components/Chatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <WishlistProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 relative overflow-hidden">
              {/* Enhanced Graphic Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Animated gradient orbs */}
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-400/20 via-cyan-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                
                {/* Geometric patterns */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-200/30 dark:border-blue-800/30 rounded-full animate-spin-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-purple-200/30 dark:border-purple-800/30 rounded-full animate-spin-slow-reverse" />
                
                {/* Floating elements */}
                <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-300" />
                <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400/40 rounded-full animate-bounce delay-700" />
                <div className="absolute top-2/3 left-1/5 w-1 h-1 bg-pink-400/40 rounded-full animate-bounce delay-1000" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin/users" 
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminUsers />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/list-item" 
                      element={
                        <ProtectedRoute>
                          <ListItem />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/edit-profile" 
                      element={
                        <ProtectedRoute>
                          <EditProfile />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/my-items" 
                      element={
                        <ProtectedRoute>
                          <MyItems />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/wishlist" 
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/item/:id" element={<ItemDetail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Chatbot />
                </BrowserRouter>
              </div>
            </div>
          </TooltipProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { conversationsApi, ApiConversation, ApiMessage } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Package, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ApiConversation | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const loadConversations = async () => {
      try {
        const { conversations: convs } = await conversationsApi.list();
        setConversations(convs);
        
        if (conversationId) {
          const active = convs.find(c => c._id === conversationId);
          if (active) setActiveConversation(active);
        } else if (convs.length > 0) {
          setActiveConversation(convs[0]);
          navigate(`/messages/${convs[0]._id}`, { replace: true });
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [isAuthenticated, navigate, conversationId]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const loadMessages = async () => {
      try {
        const { messages: msgs } = await conversationsApi.getMessages(activeConversation._id);
        setMessages(msgs);
        scrollToBottom();
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
    
    // Simple polling for new messages (in a real app, use WebSockets/Socket.io)
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setIsSending(true);
    try {
      const { message } = await conversationsApi.sendMessage(activeConversation._id, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update the conversation's last message in the sidebar
      setConversations(prev => prev.map(c => 
        c._id === activeConversation._id 
          ? { ...c, lastMessage: { text: message.text, sender: user!.id, timestamp: message.createdAt } }
          : c
      ).sort((a, b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()));
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conv: ApiConversation) => {
    return conv.participants.find(p => p._id !== user?.id) || conv.participants[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-73px)]">
        {/* Sidebar - Conversations List */}
        <Card className="w-full md:w-80 flex flex-col bg-card border-border h-[40vh] md:h-full overflow-hidden shrink-0">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Messages
            </h2>
          </div>
          
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {conversations.map(conv => {
                  const otherUser = getOtherParticipant(conv);
                  const isActive = activeConversation?._id === conv._id;
                  
                  return (
                    <button
                      key={conv._id}
                      onClick={() => navigate(`/messages/${conv._id}`)}
                      className={`p-4 flex gap-3 text-left transition-colors border-b border-border/50 hover:bg-muted/50 ${
                        isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={otherUser.avatar} />
                          <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {conv.type === 'user-admin' && (
                          <Badge className="absolute -bottom-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[8px] bg-primary">A</Badge>
                        )}
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h4 className="font-medium text-sm truncate">{otherUser.name}</h4>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {conv.lastMessage?.timestamp ? new Date(conv.lastMessage.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        {conv.item && (
                          <div className="flex items-center gap-1 text-xs text-primary mb-1 truncate">
                            <Package className="h-3 w-3" />
                            {conv.item.title}
                          </div>
                        )}
                        <p className={`text-xs truncate ${!isActive && conv.lastMessage?.sender !== user?.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {conv.lastMessage?.text || 'New conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col bg-card border-border h-[50vh] md:h-full overflow-hidden">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={getOtherParticipant(activeConversation).avatar} />
                    <AvatarFallback>{getOtherParticipant(activeConversation).name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{getOtherParticipant(activeConversation).name}</h3>
                    {activeConversation.type === 'user-admin' && (
                      <span className="text-xs text-primary font-medium">ReWear Support</span>
                    )}
                  </div>
                </div>
                
                {activeConversation.item && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex"
                    onClick={() => navigate(`/item/${activeConversation.item!._id}`)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    View Item
                  </Button>
                )}
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4 bg-background/50">
                <div className="flex flex-col gap-4">
                  {messages.map((msg, index) => {
                    const isMe = msg.sender._id === user?.id;
                    const showAvatar = index === 0 || messages[index - 1].sender._id !== msg.sender._id;
                    
                    return (
                      <div key={msg._id} className={`flex gap-2 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                        {showAvatar ? (
                          <Avatar className="h-8 w-8 shrink-0 mt-auto mb-1">
                            <AvatarImage src={msg.sender.avatar} />
                            <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 shrink-0" />
                        )}
                        
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div 
                            className={`px-4 py-2 rounded-2xl ${
                              isMe 
                                ? 'bg-primary text-primary-foreground rounded-br-sm' 
                                : 'bg-muted text-foreground rounded-bl-sm border border-border/50'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-background"
                    disabled={isSending}
                  />
                  <Button type="submit" disabled={!newMessage.trim() || isSending} size="icon" className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background/50">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;

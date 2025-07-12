
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, AlertCircle } from 'lucide-react';
import { Message } from '../types/chat';
import { geminiService } from '../services/geminiService';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hi there! I'm Bob, your friendly marketplace assistant! 👋 I'm here to help you with everything about buying and selling used clothes on our platform. What can I help you with today?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      setSuggestions(geminiService.getQuickSuggestions());
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setHasError(false);

    const newHistory = [...conversationHistory, { role: 'user', content: text }];

    try {
      const response = await geminiService.getBotResponse(text, conversationHistory);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: response }
      ]);

      if (newHistory.length > 20) {
        setConversationHistory(newHistory.slice(-20));
      }

      setSuggestions(geminiService.getQuickSuggestions());
      
    } catch (error) {
      console.error('Chat error:', error);
      setHasError(true);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment!",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
    setSuggestions(geminiService.getQuickSuggestions());
    setHasError(false);
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: "Hi there! I'm Bob, your friendly marketplace assistant! 👋 I'm here to help you with everything about buying and selling used clothes on our platform. What can I help you with today?",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 group relative"
        >
          <MessageCircle size={24} />
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            <Bot size={12} />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-background border border-border rounded-lg shadow-2xl w-96 h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/80 rounded-full p-2 relative">
                <Bot size={20} />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-foreground"></div>
              </div>
              <div>
                <h3 className="font-semibold">Bob</h3>
                <p className="text-primary-foreground/80 text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  AI Marketplace Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors p-1 rounded"
                title="Clear chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {hasError && (
            <div className="bg-destructive/10 border-l-4 border-destructive p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-destructive" />
              <p className="text-destructive text-sm">Connection issue - please try again</p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-background text-foreground rounded-bl-md border border-border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background rounded-2xl rounded-bl-md p-4 max-w-[85%] shadow-sm border border-border">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">Bob is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !isTyping && (
            <div className="px-4 py-3 border-t border-border bg-background">
              <p className="text-xs text-muted-foreground mb-2 font-medium">💡 Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 border border-border"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-background rounded-b-lg">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Bob anything about the marketplace..."
                  className="w-full border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm resize-none max-h-20 min-h-[44px] bg-background text-foreground"
                  disabled={isTyping}
                  rows={1}
                />
              </div>
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 disabled:bg-muted-foreground/20 text-primary-foreground rounded-xl px-4 py-3 transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by Gemini AI • Press Enter to send
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;

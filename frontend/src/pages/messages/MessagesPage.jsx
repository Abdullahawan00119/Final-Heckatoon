import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from '../../components/chat/ChatWindow';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Menu, X, Loader2, MessageCircle } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Search } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const MessagesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        setConversations((prev) => {
          const index = prev.findIndex(c => c.conversationId === message.conversationId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: message
            };
            const item = updated.splice(index, 1)[0];
            return [item, ...updated];
          }
          return prev;
        });
      });

      return () => socket.off('new_message');
    }
  }, [socket]);

  const getOtherUser = (conversation) => {
    if (!user || !conversation.participants) return null;
    return conversation.participants.find(p => p._id !== user?._id);
  };

  const handleConversationCreated = (realConvId, message) => {
    setConversations(prev => {
      const dummyIndex = prev.findIndex(c => c.conversationId.includes('_') && 
        c.participants?.some(p => p._id === selectedConversation?.otherUser?._id));
      
      if (dummyIndex !== -1) {
        const updated = [...prev];
        updated[dummyIndex] = {
          conversationId: realConvId,
          participants: updated[dummyIndex].participants,
          lastMessage: message,
          isDummy: false
        };
        const item = updated.splice(dummyIndex, 1)[0];
        return [item, ...updated];
      }
      return prev;
    });

    setSelectedConversation(prev => ({
      ...prev,
      conversationId: realConvId
    }));
  };

  useEffect(() => {
    const initProvider = location.state?.provider;
    if (initProvider && conversations.length >= 0 && !loading && user) {
      const existingConversation = conversations.find(c => {
        const other = getOtherUser(c);
        return other && other._id === initProvider._id;
      });

      if (existingConversation) {
        setSelectedConversation({ ...existingConversation, otherUser: getOtherUser(existingConversation) });
      } else {
        const participantsIds = [user?._id, initProvider._id].sort();
        const dummyId = participantsIds.join('_');
        
        const dummyConversation = {
          conversationId: dummyId,
          participants: [user, initProvider],
          isDummy: true
        };
        
        setConversations(prev => [dummyConversation, ...prev]);
        setSelectedConversation({ ...dummyConversation, otherUser: initProvider });
      }
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations, loading, user]);

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] p-4 lg:p-6 overflow-hidden">
      <Card className="flex flex-1 rounded-[2rem] shadow-heavy border-0 overflow-hidden max-w-7xl mx-auto bg-white/70 backdrop-blur-xl ring-1 ring-white/50 w-full">
        {/* Sidebar */}
        <div className="w-80 lg:w-[400px] border-r border-slate-100 flex flex-col bg-white/40 backdrop-blur-md shrink-0">
          <div className="p-6 border-b border-slate-100/50 bg-white/20 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tighter text-slate-800">Messages</h2>
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-12 h-12 rounded-2xl bg-white/50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/50 transition-all w-full shadow-sm placeholder:text-slate-400 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {conversations.length === 0 && !loading ? (
              <div className="text-center py-10 px-4">
                <div className="h-16 w-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 opacity-50">
                  <MessageCircle className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No conversations found</p>
              </div>
            ) : (
              conversations
                .filter(conv => {
                  const other = getOtherUser(conv);
                  if (!other) return true;
                  const fullName = `${other.firstName || ''} ${other.lastName || ''}`.toLowerCase();
                  return fullName.includes(searchQuery.toLowerCase()) || 
                         (conv.lastMessage?.content || '').toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((conversation) => {
                  const other = getOtherUser(conversation);
                  const isActive = selectedConversation?.conversationId === conversation.conversationId;
                  return (
                    <div 
                      key={conversation.conversationId}
                      onClick={() => {
                        setSelectedConversation({ ...conversation, otherUser: other });
                        setSidebarOpen(false);
                      }}
                      className={`group relative p-4 flex items-center gap-4 cursor-pointer transition-all rounded-[1.25rem] ${
                        isActive 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                          : 'hover:bg-white/60 hover:shadow-sm text-slate-600'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                          <AvatarImage src={other?.avatar} />
                          <AvatarFallback className={isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}>
                            {other?.firstName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.lastMessage?.sender !== user?._id && !conversation.lastMessage?.isRead && (
                          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-rose-500 rounded-full border-2 border-white ring-1 ring-rose-500/20" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className={`font-bold text-[15px] truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                            {other?.firstName} {other?.lastName}
                          </h4>
                          <span className={`text-[10px] font-medium shrink-0 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                            {conversation.lastMessage ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs truncate transition-colors ${
                          isActive 
                            ? 'text-white/80' 
                            : conversation.lastMessage?.sender !== user?._id && !conversation.lastMessage?.isRead 
                              ? 'font-bold text-slate-900' 
                              : 'text-slate-500'
                        }`}>
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      
                      {isActive && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/30 rounded-full" />
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 relative flex flex-col bg-slate-50/30">
          <ChatWindow 
            conversationId={selectedConversation?.conversationId} 
            otherUser={selectedConversation?.otherUser}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </Card>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default MessagesPage;

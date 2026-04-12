import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from '../../components/chat/ChatWindow';
import { Card } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
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
            // Move to top
            const item = updated.splice(index, 1)[0];
            return [item, ...updated];
          }
          return prev;
        });
      });

      return () => socket.off('new_message');
    }
  }, [socket]);

  const getOtherUser = (conv) => {
    if (!user || !conv.participants) return null;
    return conv.participants.find(p => p._id !== user._id);
  };

  useEffect(() => {
    const initProvider = location.state?.provider;
    if (initProvider && conversations.length >= 0 && !loading && user) {
      const existingConv = conversations.find(c => {
        const other = getOtherUser(c);
        return other && other._id === initProvider._id;
      });

      if (existingConv) {
        setSelectedConversation({ ...existingConv, otherUser: getOtherUser(existingConv) });
      } else {
        // Create dummy UI conversation
        const participantsIds = [user._id, initProvider._id].sort();
        const dummyId = participantsIds.join('_');
        
        const dummyConv = {
          conversationId: dummyId,
          participants: [user, initProvider],
          isDummy: true
        };
        
        setConversations(prev => [dummyConv, ...prev]);
        setSelectedConversation({ ...dummyConv, otherUser: initProvider });
      }
      
      // Clear state to avoid re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state, conversations, loading, user]);

  return (
    <div className="container h-[calc(100vh-4.1rem)] py-8 px-4 sm:px-8">
      <Card className="flex h-full overflow-hidden shadow-heavy border-slate-200">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-80 border-r flex flex-col bg-slate-50/50">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search chats..." className="pl-9 h-9 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
              const other = getOtherUser(conv);
              const isActive = selectedConversation?.conversationId === conv.conversationId;
              return (
                <div 
                  key={conv.conversationId}
                  onClick={() => setSelectedConversation({ ...conv, otherUser: other })}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                    isActive ? 'bg-white border-l-4 border-l-primary shadow-sm' : 'hover:bg-slate-100'
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={other?.avatar} />
                    <AvatarFallback>{other?.firstName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-sm truncate">{other?.firstName} {other?.lastName}</h4>
                      <span className="text-[10px] text-muted-foreground">
                        {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${conv.lastMessage?.sender !== user._id && !conv.lastMessage?.isRead ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col min-w-0">
          <ChatWindow 
            conversationId={selectedConversation?.conversationId} 
            otherUser={selectedConversation?.otherUser} 
          />
        </div>
      </Card>
    </div>
  );
};

export default MessagesPage;

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Send, Image as ImageIcon, Paperclip, MoreVertical, Search } from 'lucide-react';

const ChatWindow = ({ conversationId, otherUser }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      // If it's a dummy conversation created on-the-fly, don't fetch from DB
      if (conversationId.includes('_')) {
        setMessages([]);
        return;
      }
      
      // Fetch messages
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/messages/conversations/${conversationId}`);
          setMessages(res.data.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();

      // Join room
      if (socket) {
        socket.emit('join_conversation', conversationId);
      }
    }
  }, [conversationId, socket]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message) => {
        if (message.conversationId === conversationId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      return () => socket.off('new_message');
    }
  }, [socket, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser?._id) return;

    try {
      const res = await api.post('/messages', {
        receiverId: otherUser._id,
        content: newMessage,
        messageType: 'text'
      });
      
      const sentMsg = res.data.data;
      // Add message optimistically so sender sees it immediately
      setMessages(prev => [...prev, sentMsg]);

      if (socket) {
        socket.emit('send_message', {
          conversationId,
          receiverId: otherUser._id,
          message: sentMsg
        });
      }
      
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-muted-foreground">
        <p>Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="h-16 border-b px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUser?.avatar} />
            <AvatarFallback>{otherUser?.firstName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-sm">{otherUser?.firstName} {otherUser?.lastName}</h4>
            <span className="text-xs text-green-600 font-medium">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => {
          const isMe = msg.sender === user?._id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-slate-900 rounded-tl-none'
              }`}>
                {msg.content}
                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-slate-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon"><ImageIcon className="h-5 w-5 text-muted-foreground" /></Button>
          <Button type="button" variant="ghost" size="icon"><Paperclip className="h-5 w-5 text-muted-foreground" /></Button>
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 rounded-full bg-slate-50"
          />
          <Button type="submit" size="icon" className="rounded-full shadow-medium" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

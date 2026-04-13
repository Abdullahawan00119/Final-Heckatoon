import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Send, Image as ImageIcon, Paperclip, MoreVertical, Search, MessageCircle, Mic2, Smile, Loader2, CheckCircle2 } from 'lucide-react';

const ChatWindow = ({ conversationId, otherUser, onConversationCreated }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (conversationId && otherUser?._id) {
      const fetchMessages = async () => {
        setLoadingMessages(true);
        try {
          const res = await api.get(`/messages/conversations/${conversationId}`);
          setMessages(res.data.data || []);
        } catch (err) {
          console.error('Failed to fetch messages:', err);
          setMessages([]);
        } finally {
          setLoadingMessages(false);
        }
      };
      
      fetchMessages();

      if (socket) {
        socket.emit('join_conversation', conversationId);
        socket.emit('leave_all_conversations');
      }
    }
  }, [conversationId, socket, otherUser?._id]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        if (message.conversationId === conversationId && message.sender !== user?._id && !messages.some(m => m._id === message._id)) {
          setMessages((prev) => [...prev, message]);
        }
      };

      const handleTyping = (data) => {
        if (data.conversationId === conversationId && data.sender !== user?._id) {
          setIsTyping(true);
        }
      };

      const handleStopTyping = (data) => {
        if (data.conversationId === conversationId && data.sender !== user?._id) {
          setIsTyping(false);
        }
      };

      socket.on('new_message', handleNewMessage);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('typing', handleTyping);
        socket.off('stop_typing', handleStopTyping);
      };
    }
  }, [socket, conversationId, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInput = (e) => {
    setNewMessage(e.target.value);
    if (socket && otherUser?._id && user?._id) {
      socket.emit('typing', { conversationId, sender: user._id });
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit('stop_typing', { conversationId, sender: user._id });
      }, 1000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUser?._id || !user?._id) return;

    const tempId = Date.now().toString();
    const optimisticMsg = {
      _id: tempId,
      conversationId,
      sender: user._id,
      receiver: otherUser._id,
      content: newMessage,
      messageType: 'text',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      const res = await api.post('/messages', {
        receiverId: otherUser._id,
        content: messageContent,
        messageType: 'text'
      });
      
      const sentMsg = res.data.data;
      
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? sentMsg : msg
      ));

      if (conversationId.includes('_') && sentMsg.conversationId && onConversationCreated) {
        onConversationCreated(sentMsg.conversationId, sentMsg);
      }

      if (socket) {
        socket.emit('send_message', {
          conversationId: sentMsg.conversationId || conversationId,
          receiverId: otherUser._id,
          message: sentMsg
        });
        socket.emit('stop_typing', { conversationId, sender: user._id });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      alert('Failed to send message. Please try again.');
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] text-muted-foreground">
        <p className="text-lg">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="h-20 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between border-b border-slate-100 z-10">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={otherUser?.avatar} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">{otherUser?.firstName?.[0]}{otherUser?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-800 text-[15px] truncate leading-tight">
              {otherUser?.firstName} {otherUser?.lastName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
              <span className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">Active Now</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/50 custom-scrollbar">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40 mb-3" />
            <p className="text-sm font-medium">Securing connection...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="h-24 w-24 bg-white rounded-[2.5rem] shadow-medium flex items-center justify-center mb-6 text-primary/20">
              <MessageCircle className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 italic">Start something great</h3>
            <p className="text-sm text-slate-400 px-6 leading-relaxed">Send your first message to {otherUser?.firstName} to begin the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === user?._id;
            const prevMsg = messages[idx - 1];
            const isSameSender = prevMsg?.sender === msg.sender;
            
            return (
              <div key={`${msg._id}-${idx}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSameSender ? 'mt-1' : 'mt-6'}`}>
                <div className={`group relative max-w-[70%] lg:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 shadow-sm text-[14px] leading-relaxed transition-all duration-300 ${
                    isMe 
                      ? 'bg-primary text-white rounded-2xl rounded-tr-none hover:shadow-lg hover:shadow-primary/20' 
                      : 'bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100 hover:shadow-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 mt-2 transition-opacity opacity-0 group-hover:opacity-100 ${
                    isMe ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <span className="text-[10px] font-bold text-slate-400 tracking-tight">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <div className="flex items-center -space-x-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300 mt-4">
            <div className="bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100 flex items-center gap-3">
              <span className="text-[11px] font-black text-slate-400 tracking-widest uppercase">Typing</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 translate-y-0">
          <div className="flex-1 relative flex items-center bg-slate-50 rounded-[1.5rem] border border-slate-100 p-1.5 pr-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 transition-all group">
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-primary transition-all rounded-xl">
              <Smile className="h-5 w-5" />
            </Button>
            <Input 
              value={newMessage}
              onChange={handleInput}
              placeholder="Start typing..." 
              className="flex-1 border-0 bg-transparent h-10 px-4 focus-visible:ring-0 text-slate-700 shadow-none placeholder:text-slate-400 font-medium"
            />
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-500 rounded-xl">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-500 rounded-xl">
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            size="icon" 
            className={`h-12 w-12 rounded-2xl shadow-lg transition-all transform active:scale-95 ${
              newMessage.trim() 
                ? 'bg-primary text-white shadow-primary/20 translate-y-0 opacity-100' 
                : 'bg-slate-100 text-slate-300 translate-y-1 opacity-50'
            }`} 
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
      
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
      `}} />
    </div>
  );
};

export default ChatWindow;

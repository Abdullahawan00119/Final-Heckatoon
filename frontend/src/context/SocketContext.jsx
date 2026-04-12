import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        newSocket.emit('register_user', user._id);
      });

      newSocket.on('notification_received', (notification) => {
        setToast(notification);
        setTimeout(() => setToast(null), 5000);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-right-full duration-300">
          <div className="bg-white border-l-4 border-primary shadow-heavy rounded-lg p-4 max-w-sm flex items-start gap-4 ring-1 ring-black/5">
            <div className="flex-1">
              <h4 className="font-bold text-sm text-primary">{toast.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Briefcase, ShoppingBag, Bell, MessageSquare, LogOut, User as UserIcon, LayoutDashboard, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [unreadCounts, setUnreadCounts] = useState({ notifications: 0, messages: 0 });

  const fetchUnreadCounts = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCounts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleNotification = () => {
        setUnreadCounts(prev => ({ ...prev, notifications: prev.notifications + 1 }));
      };
      const handleMessage = () => {
        setUnreadCounts(prev => ({ ...prev, messages: prev.messages + 1 }));
      };

      socket.on('notification_received', handleNotification);
      socket.on('new_message', handleMessage);

      return () => {
        socket.off('notification_received', handleNotification);
        socket.off('new_message', handleMessage);
      };
    }
  }, [socket]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-primary text-xl sm:text-2xl">Local<span className="text-secondary">Market</span></span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/jobs" className="text-sm font-medium transition-colors hover:text-primary">Browse Jobs</Link>
            <Link to="/services" className="text-sm font-medium transition-colors hover:text-primary">Find Services</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                  {unreadCounts.messages > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground animate-pulse">
                      {unreadCounts.messages}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCounts.notifications > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                      {unreadCounts.notifications}
                    </span>
                  )}
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.firstName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'customer' && (
                    <DropdownMenuItem asChild>
                      <Link to="/jobs/my-jobs" className="cursor-pointer">
                        <Briefcase className="mr-2 h-4 w-4" />
                        My Jobs
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'provider' && (
                    <DropdownMenuItem asChild>
                      <Link to="/services/my-services" className="cursor-pointer">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        My Services
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

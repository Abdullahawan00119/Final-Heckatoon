import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckSquare, Trash2, Loader2, Info } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    markAllAsRead(); // Auto-read when opened
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10 px-4 sm:px-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with your activities.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="shadow-medium border-slate-200">
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`p-6 flex gap-4 transition-colors ${!n.isRead ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                >
                  <div className={`p-2 rounded-full h-fit mt-1 ${!n.isRead ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`font-bold text-sm ${!n.isRead ? 'text-primary' : ''}`}>{n.title}</h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{n.message}</p>
                    {!n.isRead && (
                       <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">New</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="bg-slate-100 p-4 rounded-full">
                <Info className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-muted-foreground">You don't have any notifications yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;

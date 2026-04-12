import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ShoppingBag, 
  Star, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Briefcase,
  Loader2,
  Inbox,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
        setStats({ activeOrders: 0, completedOrders: 0, activeServices: 0, totalEarnings: 0, recentOrders: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 sm:px-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Here's how your service business is performing today.</p>
        </div>
        <Link to="/services/create">
          <Button className="shadow-medium">
            <Plus className="mr-2 h-4 w-4" />
            Create New Service
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Earnings', value: `PKR ${stats?.totalEarnings ?? 0}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Active Orders', value: stats?.activeOrders ?? 0, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Active Services', value: stats?.activeServices ?? 0, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100' },
          { title: 'Average Rating', value: user?.averageRating?.toFixed(1) || '0.0', icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Orders</CardTitle>
            <Link to="/orders" className="text-sm text-primary font-medium hover:underline flex items-center">
              View All <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg border shadow-sm">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Order #{order._id.slice(-6)}</h4>
                        <p className="text-xs text-muted-foreground">Client: {order.customer?.firstName} {order.customer?.lastName}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <Badge variant={order.status === 'delivered' ? 'secondary' : 'outline'} className="text-[10px] capitalize">
                        {order.status}
                      </Badge>
                      <span className="text-xs font-bold text-secondary">PKR {order.totalAmount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-muted-foreground">
                  <Inbox className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No active orders yet</p>
                  <p className="text-sm mt-1">Browse the job board and apply to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-medium h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/jobs" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" /> Browse Job Board
              </Button>
            </Link>
            <Link to="/messages" className="block">
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="mr-2 h-4 w-4" /> Open Messages
              </Button>
            </Link>
            <Link to="/services/create" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" /> Create Service
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDashboard;

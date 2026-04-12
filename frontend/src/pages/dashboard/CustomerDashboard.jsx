import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  Plus, 
  ArrowRight,
  ClipboardList,
  MessageCircle,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  Loader2,
  Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
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
        // Set fallback empty stats so the page still renders
        setStats({ activeJobs: 0, activeOrders: 0, completedOrders: 0, totalSpent: 0, recentJobs: [] });
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
          <h1 className="text-3xl font-bold tracking-tight">How can we help, {user?.firstName}?</h1>
          <p className="text-muted-foreground">Manage your posted jobs and active service orders.</p>
        </div>
        <Link to="/jobs/post">
          <Button className="shadow-medium">
            <Plus className="mr-2 h-4 w-4" />
            Post a New Job
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'Active Jobs', value: stats?.activeJobs ?? 0, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Service Orders', value: stats?.activeOrders ?? 0, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Total Spent', value: `PKR ${stats?.totalSpent ?? 0}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Jobs */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <CardTitle>My Posted Jobs</CardTitle>
            <Link to="/jobs" className="text-sm text-primary font-medium hover:underline flex items-center">
              Manage All <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats?.recentJobs && stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job) => (
                  <div key={job._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <Link to={`/jobs/${job._id}`} className="font-bold hover:underline">{job.title}</Link>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {job.applicants?.length || 0} Applicants</span>
                        <span>Budget: PKR {job.budgetAmount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={job.status === 'open' ? 'secondary' : 'default'} className="capitalize">
                        {job.status?.replace('-', ' ')}
                      </Badge>
                      <Link to={`/jobs/${job._id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-muted-foreground">
                  <Inbox className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No jobs posted yet</p>
                  <p className="text-sm mt-1">Post your first job and start receiving applications!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="shadow-medium flex flex-col h-fit">
          <CardHeader className="border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Link to="/messages" className="block">
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="mr-2 h-4 w-4" /> Open Messages
              </Button>
            </Link>
            <Link to="/orders" className="block">
              <Button variant="outline" className="w-full justify-start">
                <ClipboardList className="mr-2 h-4 w-4" /> View Orders
              </Button>
            </Link>
            <Link to="/services" className="block">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Browse Services
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;

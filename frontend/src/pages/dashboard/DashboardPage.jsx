import { useAuth } from '../../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard';
import { Loader2 } from 'lucide-react';

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Please login to view your dashboard</h2>
        <a href="/login" className="text-primary hover:underline">Go to Login</a>
      </div>
    );
  }

  if (user.role === 'customer') {
    return <CustomerDashboard />;
  }

  return <ProviderDashboard />;
};

export default DashboardPage;

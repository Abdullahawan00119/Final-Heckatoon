import { useState, useEffect } from 'react';
import api from '../../services/api';
import ServiceCard from './ServiceCard';
import { Skeleton } from '../ui/skeleton';

const ServiceList = ({ filters = {} }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/services', { params: filters });
        setServices(res.data.data);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [JSON.stringify(filters)]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[180px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No services found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {services.map((service) => (
        <ServiceCard key={service._id} service={service} />
      ))}
    </div>
  );
};

export default ServiceList;

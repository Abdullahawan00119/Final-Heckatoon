import { useState, useEffect } from 'react';
import api from '../../services/api';
import JobCard from './JobCard';
import { Skeleton } from '../ui/skeleton';

const JobList = ({ filters = {} }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/jobs', { params: filters });
        setJobs(res.data.data);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [JSON.stringify(filters)]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
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

  if (jobs.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/30 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  );
};

export default JobList;

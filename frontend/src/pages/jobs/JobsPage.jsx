import JobList from '../../components/job/JobList';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const JobsPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: ''
  });

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  return (
    <div className="container py-8 px-4 sm:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Jobs</h1>
          <p className="text-muted-foreground mt-1">Find local opportunities that match your skills</p>
        </div>
        <Link to="/jobs/post">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search jobs by title or description..." 
            className="pl-9 bg-white"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      <JobList filters={filters} />
    </div>
  );
};

export default JobsPage;

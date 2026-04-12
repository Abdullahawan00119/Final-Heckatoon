import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job }) => {
  return (
    <Card className="flex flex-col h-full hover:shadow-medium transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          {job.category}
        </Badge>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          {job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : 'Just now'}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <h3 className="text-xl font-bold leading-tight mb-2 line-clamp-2">
          <Link to={`/jobs/${job._id}`} className="hover:text-primary transition-colors">
            {job.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {job.description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4 text-slate-400" />
            {job.location.city}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-2 h-4 w-4 text-slate-400" />
            {job.applicants?.length || 0} Applicants
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Budget</span>
          <div className="flex items-center font-bold text-lg text-secondary">
            <DollarSign className="h-4 w-4" />
            {job.budgetAmount}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({job.budgetType})
            </span>
          </div>
        </div>
        <Link to={`/jobs/${job._id}`}>
          <Button size="sm">Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default JobCard;

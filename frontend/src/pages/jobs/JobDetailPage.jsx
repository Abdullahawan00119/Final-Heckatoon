import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  MapPin, 
  Clock, 
  FileText, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  Star, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

const JobDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  
  const [proposal, setProposal] = useState({
    proposedPrice: '',
    estimatedDuration: '',
    coverLetter: ''
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data);
        
        if (user && user.role === 'provider') {
          const applied = res.data.data.applicants.some(a => a.provider === user._id || a.provider._id === user._id);
          setHasApplied(applied);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  useEffect(() => {
    if (job) {
      setProposal(prev => ({ ...prev, proposedPrice: job.budgetAmount }));
    }
  }, [job]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return;
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`, proposal);
      setHasApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to apply';
      const details = err.response?.data?.errors ? '\n' + err.response.data.errors.map(e => Object.values(e)[0]).join(', ') : '';
      alert(msg + details);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 px-8 space-y-8">
        <Skeleton className="h-10 w-2/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) return <div className="p-20 text-center">Job not found</div>;

  return (
    <div className="container py-8 px-4 sm:px-8">
      <nav className="flex mb-6 text-sm text-muted-foreground items-center gap-1">
        <Link to="/jobs" className="hover:text-primary">Jobs</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">{job.category}</Badge>
              <Badge variant="outline" className="capitalize">{job.status}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location.city}, {job.location.area}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {job.applicants?.length || 0} applications
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                {job.description}
              </div>
            </CardContent>
          </Card>

          {job.images?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {job.images.map((img, i) => (
                <img key={i} src={img} alt="" className="rounded-xl border shadow-sm w-full h-auto object-cover max-h-[400px]" />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Budget Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <DollarSign className="h-5 w-5 text-secondary" />
                  Budget ({job.budgetType})
                </div>
                <span className="text-2xl font-bold">PKR {job.budgetAmount}</span>
              </div>

              {job.deadline && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}

              {user?.role === 'provider' ? (
                <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      size="lg" 
                      disabled={hasApplied || job.status !== 'open'}
                    >
                      {hasApplied ? 'Already Applied' : 'Apply Now'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Submit a Proposal</DialogTitle>
                      <DialogDescription>
                        Explain why you're the best fit for this job and set your price.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleApply} className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Your Proposed Price (PKR)</Label>
                          <Input 
                            id="price" 
                            type="number" 
                            value={proposal.proposedPrice}
                            onChange={(e) => setProposal(p => ({...p, proposedPrice: e.target.value}))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">Estimated Duration</Label>
                          <Input 
                            id="duration" 
                            placeholder="e.g. 3 days" 
                            value={proposal.estimatedDuration}
                            onChange={(e) => setProposal(p => ({...p, estimatedDuration: e.target.value}))}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coverLetter">Cover Letter</Label>
                        <Textarea 
                          id="coverLetter" 
                          placeholder="Write about your experience and how you will complete this job..." 
                          className="min-h-[150px]"
                          value={proposal.coverLetter}
                          onChange={(e) => setProposal(p => ({...p, coverLetter: e.target.value}))}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={applying} className="w-full">
                          {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Submit Application
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (user?.role === 'customer' && (user._id === job.postedBy._id || user._id === job.postedBy)) ? (
                <Link to={`/jobs/${job._id}/applicants`}>
                  <Button className="w-full" size="lg">View Applications</Button>
                </Link>
              ) : (
                <div className="bg-muted p-4 rounded-lg flex items-start gap-3 text-sm">
                  <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p>Only service providers can apply to this job. <Link to="/login" className="text-primary font-bold underline">Login</Link> as provider to apply.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Poster Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Posted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={job.postedBy.avatar} />
                  <AvatarFallback>{job.postedBy.firstName ? job.postedBy.firstName[0] : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold">{job.postedBy.firstName} {job.postedBy.lastName}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {job.postedBy.averageRating?.toFixed(1) || '0.0'} ({job.postedBy.totalReviews || 0} reviews)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;

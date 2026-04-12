import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { ChevronLeft, Star, Phone, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

const JobApplicantsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(null); // providerId

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.data);
        
        // Redirect if not the owner
        if (user && res.data.data.postedBy._id !== user._id && res.data.data.postedBy !== user._id) {
          navigate(`/jobs/${id}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user, navigate]);

  const handleHire = async (providerId) => {
    if (!window.confirm('Are you sure you want to hire this professional?')) return;
    
    setHiring(providerId);
    try {
      await api.post(`/jobs/${id}/hire/${providerId}`);
      // Refresh job data
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.data);
      alert('Congratulations! You have hired a provider. You can now communicate with them in messages.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to hire provider');
    } finally {
      setHiring(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 px-8 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) return <div className="p-20 text-center">Job not found</div>;

  return (
    <div className="container py-8 px-4 sm:px-8 max-w-5xl">
      <Link to={`/jobs/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4" />
        Back to Job Details
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Applicants for</h1>
        <p className="text-xl text-muted-foreground font-medium">{job.title}</p>
      </div>

      <div className="space-y-6">
        {job.applicants && job.applicants.length > 0 ? (
          job.applicants.map((applicant) => (
            <Card key={applicant._id} className={job.hiredProvider === applicant.provider._id ? 'border-primary ring-1 ring-primary' : ''}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Provider Info */}
                  <div className="md:w-1/3 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border">
                        <AvatarImage src={applicant.provider?.avatar} />
                        <AvatarFallback>{applicant.provider?.firstName?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{applicant.provider?.firstName || 'Unknown'} {applicant.provider?.lastName || 'Provider'}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {applicant.provider?.averageRating?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {applicant.provider?.email || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {applicant.provider?.phone || 'N/A'}
                      </div>
                    </div>

                    <div className="pt-2">
                       <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Proposed Price</div>
                       <div className="text-2xl font-bold text-secondary">PKR {applicant.proposedPrice}</div>
                       <div className="text-xs text-muted-foreground mt-1">Duration: {applicant.estimatedDuration}</div>
                    </div>
                  </div>

                  {/* Right: Cover Letter and Actions */}
                  <div className="md:w-2/3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold mb-3">Proposal / Cover Letter</h4>
                      <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                        {applicant.coverLetter}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/profile/${applicant.provider?._id}`)}
                      >
                        View Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/messages', { state: { provider: applicant.provider } })}
                      >
                        Message
                      </Button>
                      
                      {job.hiredProvider === applicant.provider?._id ? (
                        <Button disabled className="bg-green-600 hover:bg-green-600 pointer-events-none">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Hired
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleHire(applicant.provider?._id)} 
                          disabled={!applicant.provider?._id || hiring === applicant.provider?._id || job.status !== 'open'}
                          size="sm"
                        >
                          {hiring === applicant.provider?._id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Hire Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground">No proposals yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobApplicantsPage;

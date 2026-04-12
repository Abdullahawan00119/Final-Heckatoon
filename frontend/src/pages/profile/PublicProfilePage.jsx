import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Star, MapPin, Briefcase, Mail, Phone, Loader2, ChevronLeft, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

const PublicProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, servicesRes, reviewsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/services', { params: { provider: id } }),
          api.get(`/reviews/user/${id}`)
        ]);
        setProfile(profileRes.data.data);
        
        const allServices = servicesRes.data.data || [];
        setServices(allServices.filter(s => s.provider._id === id || s.provider === id));
        
        setReviews(reviewsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-20">User not found.</div>;
  }

  return (
    <div className="container py-8 px-4 sm:px-8 max-w-6xl">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-4 text-muted-foreground"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="shadow-heavy border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-slate-100 p-8 flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl mb-4">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-4xl">{profile.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                <p className="text-muted-foreground text-sm font-medium mb-3 capitalize">{profile.role}</p>
                
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-bold">{profile.averageRating?.toFixed(1) || 'New'}</span>
                  <span className="text-muted-foreground text-sm ml-1">
                    ({profile.totalReviews || 0} reviews)
                  </span>
                </div>

                <div className="w-full space-y-3 text-sm text-left">
                  {profile.location && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location.city}{profile.location.area ? `, ${profile.location.area}` : ''}</span>
                    </div>
                  )}
                  {profile.yearsOfExperience > 0 && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{profile.yearsOfExperience} Years Experience</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Contact via messages</span>
                    </div>
                  )}
                  {profile.hourlyRate > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                      <span className="text-muted-foreground">Hourly Rate</span>
                      <span className="font-bold text-foreground">PKR {profile.hourlyRate}</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full mt-6"
                  onClick={() => navigate('/messages', { state: { provider: profile } })}
                >
                  <Mail className="mr-2 h-4 w-4" /> Contact Me
                </Button>
              </div>
            </CardContent>
          </Card>

          {profile.skills && profile.skills.length > 0 && (
            <Card className="shadow-medium border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.certifications && profile.certifications.length > 0 && (
            <Card className="shadow-medium border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4">Certifications</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                  {profile.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Bio & Gigs */}
        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-medium border-slate-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">About Me</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile.bio || "This user hasn't added a bio yet."}
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-xl font-bold mb-6">Active Gigs / Services</h2>
            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {services.map((service) => (
                  <Card key={service._id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border-slate-200" onClick={() => navigate(`/services/${service.slug}`)}>
                    <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative">
                      {service.images && service.images.length > 0 ? (
                        <img 
                          src={service.images[0]} 
                          alt={service.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">No Image</span>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h4 className="font-bold text-lg mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          STARTING AT
                        </div>
                        <div className="text-lg font-bold text-secondary">
                          PKR {service.basePrice}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-50 border-dashed shadow-none">
                <CardContent className="p-10 text-center text-muted-foreground">
                  This provider has not set up any specific gigs yet.
                </CardContent>
              </Card>
            )}
          </div>

          <div className="pt-8">
            <h2 className="text-xl font-bold mb-6">Reviews & Ratings</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review._id} className="shadow-none border border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.reviewer?.avatar} />
                          <AvatarFallback>{review.reviewer?.firstName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-bold">{review.reviewer?.firstName} {review.reviewer?.lastName}</h4>
                            <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-amber-500 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.overallRating ? 'fill-current' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-slate-50 border-dashed shadow-none">
                <CardContent className="p-10 text-center text-muted-foreground">
                  No reviews yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;

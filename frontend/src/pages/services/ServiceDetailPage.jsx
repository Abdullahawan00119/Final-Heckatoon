import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Star, Clock, RefreshCcw, MapPin, Check, ChevronRight, MessageCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${slug}`);
        setService(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setOrdering(true);
    try {
      const pkg = service.packages.find(p => p.name === selectedPackage) || { price: service.basePrice };
      await api.post('/orders', {
        serviceId: service._id,
        amount: pkg.price,
        orderType: 'service',
        packageType: selectedPackage
      });
      alert('Order placed successfully! Redirecting to orders...');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return <div className="container py-20 px-8"><Skeleton className="h-[500px] w-full" /></div>;
  }

  if (!service) return <div className="p-20 text-center">Service not found</div>;

  return (
    <div className="container py-8 px-4 sm:px-8">
      <nav className="flex mb-6 text-sm text-muted-foreground items-center gap-1">
        <Link to="/services" className="hover:text-primary">Services</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground truncate">{service.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{service.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={service.provider.avatar} />
                  <AvatarFallback>{service.provider.firstName[0]}</AvatarFallback>
                </Avatar>
                <Link to={`/providers/${service.provider._id}`} className="font-bold hover:underline">
                  {service.provider.firstName} {service.provider.lastName}
                </Link>
              </div>
              <div className="h-4 w-[1px] bg-border" />
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold">{service.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-muted-foreground">({service.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>

          <div className="aspect-video relative rounded-2xl overflow-hidden border bg-muted shadow-lg">
             <img 
               src={service.images[0] || "https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1000"} 
               alt={service.title} 
               className="w-full h-full object-cover"
             />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">About this Service</h2>
            <div className="prose prose-slate max-w-none whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {service.description}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y">
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Service Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.serviceAreas.map((sa, i) => (
                  <Badge key={i} variant="secondary">{sa.city}: {sa.areas.join(', ')}</Badge>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-primary" />
                Requirements from you
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {service.requirementsFromBuyer.map((req, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Order Box */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 overflow-hidden">
            <Tabs value={selectedPackage} onValueChange={setSelectedPackage}>
              <TabsList className="grid grid-cols-3 w-full rounded-none h-12">
                <TabsTrigger value="basic" className="rounded-none">Basic</TabsTrigger>
                <TabsTrigger value="standard" className="rounded-none">Standard</TabsTrigger>
                <TabsTrigger value="premium" className="rounded-none">Premium</TabsTrigger>
              </TabsList>
              
              {['basic', 'standard', 'premium'].map((pkgName) => {
                const pkg = service.packages.find(p => p.name === pkgName) || {
                  price: service.basePrice,
                  description: 'Default package description',
                  deliveryTime: service.deliveryTime,
                  revisions: service.revisionsIncluded,
                  features: ['Core service', 'On-time delivery']
                };
                
                return (
                  <TabsContent key={pkgName} value={pkgName} className="p-6 m-0 focus-visible:ring-0">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold capitalize">{pkgName} Package</span>
                      <span className="text-2xl font-extrabold">PKR {pkg.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 h-12 line-clamp-2">
                      {pkg.description}
                    </p>
                    <div className="flex items-center gap-6 mb-6 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {pkg.deliveryTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                        {pkg.revisions} Revisions
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-3">
                      <Button className="w-full" size="lg" onClick={handleOrder} disabled={ordering}>
                        {ordering && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Continue (PKR {pkg.price})
                      </Button>
                      <Button variant="outline" className="w-full" size="lg">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Provider
                      </Button>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Professional Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                <span>Verified professional with verified background check.</span>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                <span>Quick response time (under 1 hour).</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Loader2, AlertCircle, ChevronLeft, CheckCircle2 } from 'lucide-react';

const ServiceCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    basePrice: '',
    deliveryTime: '',
    pricingType: 'fixed',
    requirements: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.title || form.title.length < 10) return 'Title must be at least 10 characters.';
    if (!form.description || form.description.length < 50) return 'Description must be at least 50 characters.';
    if (!form.category) return 'Please select a category.';
    if (!form.basePrice || isNaN(Number(form.basePrice)) || Number(form.basePrice) <= 0) return 'Please enter a valid starting price.';
    if (!form.deliveryTime) return 'Please enter a delivery time.';
    return null;
  };

  const onSubmit = async (isDraft = false) => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrls = [];
      let uploadedVideoUrl = '';

      // Upload images (non-blocking)
      if (images.length > 0) {
        try {
          const formData = new FormData();
          Array.from(images).forEach(file => formData.append('images', file));
          const imgRes = await api.post('/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedImageUrls = imgRes.data.data || [];
        } catch (uploadErr) {
          console.warn('Image upload failed, continuing without:', uploadErr.message);
        }
      }

      // Upload video (non-blocking)
      if (video) {
        try {
          const formData = new FormData();
          formData.append('video', video);
          const vidRes = await api.post('/upload/video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedVideoUrl = vidRes.data.data || '';
        } catch (uploadErr) {
          console.warn('Video upload failed, continuing without:', uploadErr.message);
        }
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        basePrice: Number(form.basePrice),
        deliveryTime: form.deliveryTime.trim(),
        pricingType: 'fixed',
        requirementsFromBuyer: form.requirements
          ? form.requirements.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        images: uploadedImageUrls,
        videoUrl: uploadedVideoUrl,
        isActive: !isDraft,
        serviceAreas: [{ city: 'Karachi', areas: ['All'] }],
      };

      await api.post('/services', payload);
      setSuccess(true);
      setTimeout(() => navigate('/services/my-services'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create service.';
      const validationErrs = err.response?.data?.errors;
      if (validationErrs && Array.isArray(validationErrs)) {
        setError(validationErrs.map(e => e.msg || Object.values(e)[0]).join(' | '));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 px-4 sm:px-8 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-6 -ml-4 text-muted-foreground"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="shadow-heavy">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold">Create a New Service</CardTitle>
          <CardDescription>Offer your professional skills to the local community.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {error && (
              <div className="bg-destructive/15 p-4 rounded-lg flex items-start gap-3 text-destructive text-sm font-medium">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3 text-green-700 text-sm font-medium border border-green-200">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Service created successfully! Redirecting...</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Master Plumbing & Emergency Leak Repair"
                  value={form.title}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">{form.title.length}/80 characters (min 10)</p>
              </div>

              {/* Category + Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">🔧 Plumbing</SelectItem>
                      <SelectItem value="electrical">⚡ Electrical</SelectItem>
                      <SelectItem value="carpentry">🪵 Carpentry</SelectItem>
                      <SelectItem value="painting">🎨 Painting</SelectItem>
                      <SelectItem value="cleaning">🧹 Cleaning</SelectItem>
                      <SelectItem value="tutoring">📚 Tutoring</SelectItem>
                      <SelectItem value="it-support">💻 IT Support</SelectItem>
                      <SelectItem value="gardening">🌿 Gardening</SelectItem>
                      <SelectItem value="home-repair">🏠 Home Repair</SelectItem>
                      <SelectItem value="appliance-repair">🔌 Appliance Repair</SelectItem>
                      <SelectItem value="moving">📦 Moving</SelectItem>
                      <SelectItem value="other">✨ Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePrice">Starting Price (PKR) *</Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    min="0"
                    placeholder="e.g. 2000"
                    value={form.basePrice}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Service Description *</Label>
                <Textarea
                  name="description"
                  placeholder="What exactly do you offer? Mention your expertise and work details (min 50 characters)..."
                  className="min-h-[150px]"
                  value={form.description}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">{form.description.length} characters (min 50)</p>
              </div>

              {/* Delivery + Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deliveryTime">Typical Delivery Time *</Label>
                  <Input
                    id="deliveryTime"
                    name="deliveryTime"
                    placeholder="e.g. 2 days or Same Day"
                    value={form.deliveryTime}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements from Buyer</Label>
                  <Input
                    id="requirements"
                    name="requirements"
                    placeholder="e.g. Detailed photos, Access to site"
                    value={form.requirements}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">Comma separated</p>
                </div>
              </div>

              {/* Media */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="images">Gig Images</Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">Upload photos showcasing your work.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video">Gig Video (Optional)</Label>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files[0])}
                  />
                  <p className="text-xs text-muted-foreground">A short intro video attracts more buyers.</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-6 border-t flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                className="flex-1 shadow-medium"
                size="lg"
                disabled={loading || success}
                onClick={() => onSubmit(false)}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? 'Publishing...' : 'Publish Service'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={loading || success}
                onClick={() => onSubmit(true)}
              >
                Save as Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceCreatePage;

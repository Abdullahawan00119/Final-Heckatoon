import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Loader2, AlertCircle, ChevronLeft } from 'lucide-react';

const jobSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.string(),
  budgetType: z.enum(['fixed', 'hourly', 'negotiable']),
  budgetAmount: z.string().transform((v) => Number(v)),
  city: z.string().min(2, "Required"),
  area: z.string().min(2, "Required"),
});

const JobPostPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      budgetType: 'fixed'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      let uploadedImageUrls = [];
      
      // Upload images if any selected
      if (images.length > 0) {
        setUploadingMedia(true);
        try {
          const uploadData = new FormData();
          Array.from(images).forEach(file => uploadData.append('images', file));
          const imgRes = await api.post('/upload/images', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedImageUrls = imgRes.data.data || [];
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          setError('Failed to upload images. Please try again.');
          setLoading(false);
          setUploadingMedia(false);
          return;
        }
      }

      // Upload video if selected
      let uploadedVideoUrl = '';
      if (video) {
        setUploadingMedia(true);
        try {
          const uploadData = new FormData();
          uploadData.append('video', video);
          const vidRes = await api.post('/upload/video', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedVideoUrl = vidRes.data.data || '';
        } catch (uploadErr) {
          console.error('Video upload failed:', uploadErr);
          setError('Failed to upload video. Please try again.');
          setLoading(false);
          setUploadingMedia(false);
          return;
        }
      }
      setUploadingMedia(false);

      const payload = {
        ...data,
        location: { city: data.city, area: data.area },
        images: uploadedImageUrls,
        videoUrl: uploadedVideoUrl
      };
      await api.post('/jobs', payload);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post job. Please try again.';
      const details = err.response?.data?.errors ? '\n' + err.response.data.errors.map(e => Object.values(e)[0]).join(', ') : '';
      setError(msg + details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 px-4 sm:px-8 max-w-3xl">
      <Button 
        variant="ghost" 
        className="mb-6 -ml-4 text-muted-foreground"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card className="shadow-heavy border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold">Post a New Job</CardTitle>
          <CardDescription>Describe what you need help with and set your budget.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-destructive/15 p-4 rounded-lg flex items-center gap-3 text-destructive text-sm font-medium">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Need help fixing my kitchen electrical wiring" 
                {...register('title')}
              />
              {errors.title && <p className="text-xs text-destructive font-medium">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(v) => setValue('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="tutoring">Tutoring</SelectItem>
                    <SelectItem value="it-support">IT Support</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive font-medium">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetAmount">Budget Amount (PKR)</Label>
                <Input 
                  id="budgetAmount" 
                  type="number" 
                  placeholder="2000"
                  {...register('budgetAmount')}
                />
                {errors.budgetAmount && <p className="text-xs text-destructive font-medium">{errors.budgetAmount.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Details about the work, tools needed, and desired timeframe..." 
                className="min-h-[150px] resize-none"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-destructive font-medium">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
                {errors.city && <p className="text-xs text-destructive font-medium">{errors.city.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input id="area" {...register('area')} />
                {errors.area && <p className="text-xs text-destructive font-medium">{errors.area.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="images">Job Images (Optional)</Label>
                <Input 
                  id="images" 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => setImages(e.target.files)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Attach photos of the work or site.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video">Job Video (Optional)</Label>
                <Input 
                  id="video" 
                  type="file" 
                  accept="video/*"
                  onChange={(e) => setVideo(e.target.files[0])}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Attach a short video explaining the job.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button type="submit" className="flex-1 shadow-medium" size="lg" disabled={loading || uploadingMedia}>
                {loading || uploadingMedia ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {uploadingMedia ? 'Uploading Media...' : 'Post Job'}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobPostPage;

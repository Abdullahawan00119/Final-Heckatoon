import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Loader2, Save, User as UserIcon, MapPin, Phone, Briefcase } from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    location: {
      city: '',
      area: ''
    },
    skills: '',
    hourlyRate: '',
    yearsOfExperience: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: {
          city: user.location?.city || '',
          area: user.location?.area || ''
        },
        skills: user.skills?.join(', ') || '',
        hourlyRate: user.hourlyRate || '',
        yearsOfExperience: user.yearsOfExperience || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      const res = await api.put('/users/profile', dataToSubmit);
      setUser(res.data.data);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.data;
      
      const updateRes = await api.put('/users/profile', { ...formData, avatar: url, skills: user.skills });
      setUser(updateRes.data.data);
      alert('Avatar updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload avatar (Check Cloudinary config)');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-10 px-4 sm:px-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your public information and preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card className="shadow-medium border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>This information will be visible to others on the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b">
              <Avatar className="h-20 w-20 border-2 border-slate-100">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xl font-bold">{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
              </Avatar>
              
              <div className="relative">
                <input 
                  type="file" 
                  id="avatar" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  disabled={uploadingAvatar} 
                />
                <Label htmlFor="avatar" className={`cursor-pointer ${uploadingAvatar ? 'opacity-50' : ''}`}>
                  <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                    {uploadingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                  </div>
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" name="phone" className="pl-9" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Cannot be changed)</Label>
                <Input id="email" value={user.email} disabled className="bg-slate-50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                placeholder="Tell others about yourself..." 
                className="min-h-[100px]"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card className="shadow-medium border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location.city">City</Label>
              <Input id="location.city" name="location.city" value={formData.location.city} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location.area">Area / Neighborhood</Label>
              <Input id="location.area" name="location.area" value={formData.location.area} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        {/* Provider Specific Information */}
        {user.role === 'provider' && (
          <Card className="shadow-medium border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Provider Details
              </CardTitle>
              <CardDescription>Showcase your expertise to attract more customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (Comma separated)</Label>
                <Input 
                  id="skills" 
                  name="skills" 
                  placeholder="e.g. Plumbing, Electrical, House Painting" 
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (PKR)</Label>
                  <Input 
                    id="hourlyRate" 
                    name="hourlyRate" 
                    type="number" 
                    value={formData.hourlyRate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input 
                    id="yearsOfExperience" 
                    name="yearsOfExperience" 
                    type="number" 
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} className="min-w-[120px]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;

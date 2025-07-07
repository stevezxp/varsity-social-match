import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { X, Camera, Upload, CheckCircle } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingStudentId, setUploadingStudentId] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    age: '',
    university: '',
    course: '',
    location: '',
    year_of_study: '',
    graduation_year: '',
    gender: '',
    looking_for: '',
    profile_visible: true,
    student_id_uploaded: false
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studentIdInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const interestOptions = [
    '🎵 Music Lover', '📚 Bookworm', '🎮 Gamer', '💼 Entrepreneur', 
    '🏃‍♀️ Fitness Enthusiast', '🎨 Creative Artist', '📷 Photography',
    '✈️ Travel Addict', '🍕 Foodie', '🎬 Movie Buff', '📺 Netflix & Chill',
    '🏀 Sports Fan', '🧗‍♀️ Adventure Seeker', '🎭 Theater Lover', '🎪 Party Animal',
    '🔬 Science Nerd', '💻 Tech Enthusiast', '🌱 Environmentalist', '🎯 Goal Oriented',
    '🧘‍♀️ Mindfulness', '🎲 Board Games', '🎸 Musician', '📖 Studying'
  ];

  const universities = [
    'Harvard University', 'Stanford University', 'MIT', 'UC Berkeley',
    'UCLA', 'USC', 'NYU', 'Columbia University', 'Yale University',
    'Princeton University', 'University of Michigan', 'Other'
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setFormData({
        display_name: data.display_name || '',
        bio: data.bio || '',
        age: data.age?.toString() || '',
        university: data.university || '',
        course: data.course || '',
        location: data.location || '',
        year_of_study: data.year_of_study || '',
        graduation_year: data.graduation_year?.toString() || '',
        gender: data.gender || '',
        looking_for: data.looking_for || '',
        profile_visible: data.profile_visible !== false,
        student_id_uploaded: data.student_id_verified || false
      });
      setSelectedInterests(data.interests || []);
      setPhotos(data.photo_urls || []);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a photo under 10MB",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      setPhotos(prev => [...prev, urlData.publicUrl]);
      
      toast({
        title: "Photo uploaded successfully! 📸",
        description: "Your new photo has been added to your profile."
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleStudentIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingStudentId(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `student-ids/${user.id}/student_id.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('student-verification')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      setFormData(prev => ({ ...prev, student_id_uploaded: true }));
      
      toast({
        title: "Student ID uploaded! 🎓",
        description: "Your verification is being reviewed. You'll get a verified badge soon!"
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload student ID. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingStudentId(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const addInterest = (interest: string) => {
    if (!selectedInterests.includes(interest) && selectedInterests.length < 8) {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim()) && selectedInterests.length < 8) {
      setSelectedInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setSelectedInterests(prev => prev.filter(interest => interest !== interestToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (selectedInterests.length === 0) {
      toast({
        title: "Add some interests",
        description: "Please select at least one interest to help others find you!",
        variant: "destructive"
      });
      return;
    }

    if (photos.length === 0) {
      toast({
        title: "Add a photo",
        description: "Please upload at least one photo to complete your profile!",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    const profileData = {
      user_id: user.id,
      display_name: formData.display_name,
      bio: formData.bio,
      age: formData.age ? parseInt(formData.age) : null,
      university: formData.university,
      course: formData.course,
      location: formData.location,
      year_of_study: formData.year_of_study,
      graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
      gender: formData.gender,
      looking_for: formData.looking_for,
      interests: selectedInterests,
      photo_urls: photos,
      profile_visible: formData.profile_visible,
      student_id_verified: formData.student_id_uploaded
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(profileData);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Profile updated successfully! ✨",
        description: "Your amazing profile is ready to find matches!"
      });
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                <span className="text-2xl">✨</span>
                Complete Your Profile
                <span className="text-2xl">✨</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Photos Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Profile Photos</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={photo} 
                          alt={`Profile ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {photos.length < 6 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
                      >
                        {uploadingPhoto ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        ) : (
                          <>
                            <Camera className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Add Photo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name *</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      placeholder="Your first name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="25"
                      min="18"
                      max="35"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="looking_for">Looking for</Label>
                    <Select value={formData.looking_for} onValueChange={(value) => handleInputChange('looking_for', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="What are you looking for?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serious-relationship">Serious Relationship</SelectItem>
                        <SelectItem value="casual-dating">Casual Dating</SelectItem>
                        <SelectItem value="friendship">Friendship</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="study-partner">Study Partner</SelectItem>
                        <SelectItem value="open-to-anything">Open to Anything</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell people about yourself, your hobbies, what makes you unique..."
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {formData.bio.length}/500 characters
                  </p>
                </div>

                {/* University Information */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">University Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="university">University *</Label>
                      <Select value={formData.university} onValueChange={(value) => handleInputChange('university', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your university" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map(uni => (
                            <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course">Course/Major *</Label>
                      <Input
                        id="course"
                        value={formData.course}
                        onChange={(e) => handleInputChange('course', e.target.value)}
                        placeholder="Computer Science"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year_of_study">Year of Study</Label>
                      <Select value={formData.year_of_study} onValueChange={(value) => handleInputChange('year_of_study', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freshman">Freshman (1st year)</SelectItem>
                          <SelectItem value="sophomore">Sophomore (2nd year)</SelectItem>
                          <SelectItem value="junior">Junior (3rd year)</SelectItem>
                          <SelectItem value="senior">Senior (4th year)</SelectItem>
                          <SelectItem value="graduate">Graduate Student</SelectItem>
                          <SelectItem value="phd">PhD Student</SelectItem>
                          <SelectItem value="postgrad">Post-Graduate</SelectItem>
                          <SelectItem value="recent-grad">Recent Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduation_year">Graduation Year</Label>
                      <Input
                        id="graduation_year"
                        type="number"
                        value={formData.graduation_year}
                        onChange={(e) => handleInputChange('graduation_year', e.target.value)}
                        placeholder="2025"
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Campus/Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Berkeley, CA"
                    />
                  </div>
                </div>

                {/* Student Verification */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Student Verification</Label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">Upload Student ID (Optional)</h4>
                        <p className="text-sm text-blue-700">Get a verified student badge to increase trust</p>
                      </div>
                      {formData.student_id_uploaded ? (
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Uploaded</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => studentIdInputRef.current?.click()}
                          disabled={uploadingStudentId}
                        >
                          {uploadingStudentId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload ID
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={studentIdInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleStudentIdUpload}
                    className="hidden"
                  />
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Interests (Select up to 8)</Label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => addInterest(interest)}
                        disabled={selectedInterests.includes(interest) || selectedInterests.length >= 8}
                        className={`px-3 py-2 rounded-full text-sm transition-colors ${
                          selectedInterests.includes(interest)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } ${selectedInterests.length >= 8 && !selectedInterests.includes(interest) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      placeholder="Add custom interest..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                      disabled={selectedInterests.length >= 8}
                    />
                    <Button 
                      type="button" 
                      onClick={addCustomInterest}
                      disabled={!customInterest.trim() || selectedInterests.length >= 8}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-sm">
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Privacy Settings</Label>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile_visible">Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                    </div>
                    <Switch
                      id="profile_visible"
                      checked={formData.profile_visible}
                      onCheckedChange={(checked) => handleInputChange('profile_visible', checked.toString())}
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.display_name || photos.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
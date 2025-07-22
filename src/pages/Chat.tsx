import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Save, X, Plus, Upload, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  age: number | null;
  university: string | null;
  course: string | null;
  interests: string[] | null;
  photo_urls: string[] | null;
  location: string | null;
  verified_student: boolean;
  gender: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});
  const [newInterest, setNewInterest] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile found - new user
        setIsNewUser(true);
        setEditing(true);
        setEditedProfile({
          display_name: user.email?.split('@')[0] || '',
          bio: '',
          age: undefined,
          university: '',
          course: '',
          location: '',
          gender: '',
          interests: [],
          photo_urls: [],
        });
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedProfile({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      age: profile?.age || undefined,
      university: profile?.university || '',
      course: profile?.course || '',
      location: profile?.location || '',
      gender: profile?.gender || '',
      interests: profile?.interests || [],
      photo_urls: profile?.photo_urls || [],
    });
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    // Validate required fields
    if (!editedProfile.display_name?.trim()) {
      toast({
        title: "Error",
        description: "Display name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        display_name: editedProfile.display_name.trim(),
        bio: editedProfile.bio?.trim() || null,
        age: editedProfile.age || null,
        university: editedProfile.university?.trim() || null,
        course: editedProfile.course?.trim() || null,
        location: editedProfile.location?.trim() || null,
        gender: editedProfile.gender?.trim() || null,
        interests: editedProfile.interests || [],
        photo_urls: editedProfile.photo_urls || [],
        verified_student: false
      };
      
      if (isNewUser) {
        // Create new profile
        const { data, error } = await supabase
          .from('profiles')
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
            gender: editedProfile.gender?.trim() || null,
            interests: editedProfile.interests || [],
            photo_urls: editedProfile.photo_urls || [],
            verified_student: false
          })
          .select()
          .single();
        
        error = insertError;
        if (!error && data) {
          setProfile(data);
          setIsNewUser(false);
        }
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            display_name: editedProfile.display_name?.trim(),
            bio: editedProfile.bio?.trim() || null,
            age: editedProfile.age || null,
            university: editedProfile.university?.trim() || null,
            course: editedProfile.course?.trim() || null,
            location: editedProfile.location?.trim() || null,
            gender: editedProfile.gender?.trim() || null,
            interests: editedProfile.interests || [],
            photo_urls: editedProfile.photo_urls || []
          })
          .eq('id', profile!.id);
        
        error = updateError;
        if (!error) {
          const updatedProfile = {
            ...profile!,
            display_name: editedProfile.display_name?.trim() || profile!.display_name,
            bio: editedProfile.bio?.trim() || null,
            age: editedProfile.age || null,
            university: editedProfile.university?.trim() || null,
            course: editedProfile.course?.trim() || null,
            location: editedProfile.location?.trim() || null,
            gender: editedProfile.gender?.trim() || null,
            interests: editedProfile.interests || [],
            photo_urls: editedProfile.photo_urls || []
          };
          setProfile(updatedProfile);
        }
      }

      if (error) throw error;

      setEditing(false);
      setEditedProfile({});
      toast({
        title: "Success",
        description: isNewUser ? "Profile created successfully" : "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: `Failed to ${isNewUser ? 'create' : 'update'} profile: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isNewUser) {
      // For new users, don't allow canceling - they need to create a profile
      return;
    }
    setEditing(false);
    setEditedProfile({});
    setNewInterest('');
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      const currentInterests = editedProfile.interests || [];
      setEditedProfile({
        ...editedProfile,
        interests: [...currentInterests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    const currentInterests = editedProfile.interests || [];
    if (currentInterests.length > index) {
      setEditedProfile({
        ...editedProfile,
        interests: currentInterests.filter((_, i) => i !== index)
      });
    }
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to upload photos",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const newUrls = await Promise.all(uploadPromises);
      const updatedUrls = [...(editedProfile.photo_urls || []), ...newUrls].slice(0, 6);
      
      setEditedProfile({
        ...editedProfile,
        photo_urls: updatedUrls
      });

      toast({
        title: "Success",
        description: "Photos uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    if (editing) {
      const updatedUrls = editedProfile.photo_urls?.filter((_, i) => i !== index) || [];
      setEditedProfile({
        ...editedProfile,
        photo_urls: updatedUrls
      });
    } else if (profile) {
      const updatedUrls = profile.photo_urls?.filter((_, i) => i !== index) || [];
      setProfile({
        ...profile,
        photo_urls: updatedUrls
      });
    }
  };

  const handleDeletePhoto = async (index: number, url: string) => {
    if (!currentUser) return;
    
    try {
      // Extract file path from URL
      const urlParts = url.split('/storage/v1/object/public/avatars/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // Delete from storage
        const { error } = await supabase.storage
          .from('avatars')
          .remove([filePath]);
        
        if (error) {
          console.error('Error deleting photo from storage:', error);
        }
      }
      
      // Remove from local state
      removePhoto(index);
      
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
      
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    }
  };

  const getDisplayPhotos = () => {
    if (editing) {
      return editedProfile.photo_urls || [];
    }
    return profile?.photo_urls || [];
  };

  const canAddMorePhotos = () => {
    const currentPhotos = getDisplayPhotos();
    return editing && currentPhotos.length < 6;
  };

  const updatePhotoInState = (updatedUrls: string[]) => {
    setEditedProfile({
      ...editedProfile,
      photo_urls: updatedUrls
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 px-4 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="text-center p-12">
              <div className="text-6xl mb-4">😞</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Not Logged In
              </h3>
              <p className="text-muted-foreground">
                Please log in to view your profile.
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isNewUser ? 'Create Your Profile' : 'Profile'}
            </h1>
            <p className="text-muted-foreground">
              {isNewUser ? 'Set up your profile to start meeting people' : 'Manage your profile settings'}
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <CardTitle className="text-2xl font-bold">
                {isNewUser ? 'Create Your Profile' : 'Your Profile'}
              </CardTitle>
              {!editing && !isNewUser ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : (isNewUser ? 'Create Profile' : 'Save')}
                  </Button>
                  {!isNewUser && (
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Pictures */}
              <div className="space-y-4">
                <Label>Profile Photos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getDisplayPhotos().map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {editing && (
                        <Button
                          onClick={() => handleDeletePhoto(index, url)}
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {canAddMorePhotos() && (
                    <div
                      onClick={handlePhotoUpload}
                      className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Add Photo</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                  disabled={uploading}
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  {editing ? (
                    <Input
                      id="display_name"
                      value={editedProfile.display_name || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        display_name: e.target.value
                      })}
                      required
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.display_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  {editing ? (
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="100"
                      value={editedProfile.age || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        age: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="Enter your age"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.age || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {editing ? (
                    <select
                      id="gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={editedProfile.gender || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        gender: e.target.value
                      })}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.gender || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {editing ? (
                    <Input
                      id="location"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        location: e.target.value
                      })}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.location || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {editing ? (
                  <Textarea
                    id="bio"
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({
                      ...editedProfile,
                      bio: e.target.value
                    })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded min-h-[60px]">
                    {profile?.bio || 'No bio added yet'}
                  </p>
                )}
              </div>

              {/* Education */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  {editing ? (
                    <Input
                      id="university"
                      value={editedProfile.university || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        university: e.target.value
                      })}
                      placeholder="Enter your university"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.university || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  {editing ? (
                    <Input
                      id="course"
                      value={editedProfile.course || ''}
                      onChange={(e) => setEditedProfile({
                        ...editedProfile,
                        course: e.target.value
                      })}
                      placeholder="Enter your course/major"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {profile?.course || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label>Interests</Label>
                {editing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {editedProfile.interests?.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {interest}
                          <button
                            onClick={() => removeInterest(index)}
                            className="ml-2 text-xs hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest..."
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      />
                      <Button onClick={addInterest} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.interests?.length ? (
                      profile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No interests added yet</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
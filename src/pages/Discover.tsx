import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { Heart, X, MapPin, GraduationCap, Calendar, Settings, Sparkles } from 'lucide-react';

const Discover = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: '',
    ageRange: { min: 18, max: 28 },
    course: '',
    yearOfStudy: '',
    distance: 50
  });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfiles(session.user.id);
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const fetchProfiles = async (userId: string) => {
    setLoading(true);
    
    // Get profiles excluding the current user and people already liked
    const { data: likedUsers } = await supabase
      .from('likes')
      .select('to_user_id')
      .eq('from_user_id', userId);

    const excludedIds = [userId, ...(likedUsers?.map(l => l.to_user_id) || [])];

    let query = supabase
      .from('profiles')
      .select('*')
      .not('user_id', 'in', `(${excludedIds.join(',')})`)
      .eq('profile_visible', true);

    // Apply filters
    if (filters.university) {
      query = query.eq('university', filters.university);
    }
    if (filters.course) {
      query = query.ilike('course', `%${filters.course}%`);
    }
    if (filters.yearOfStudy) {
      query = query.eq('year_of_study', filters.yearOfStudy);
    }

    query = query
      .gte('age', filters.ageRange.min)
      .lte('age', filters.ageRange.max)
      .limit(20);

    const { data } = await query;

    setProfiles(data || []);
    setCurrentIndex(0);
    setLoading(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setSwipeDirection(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    setDragOffset({ x: deltaX * 0.3, y: deltaY * 0.1 });
    
    // Determine swipe direction based on drag distance
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged far enough, trigger like/pass
    if (Math.abs(dragOffset.x) > 100) {
      handleLike(swipeDirection === 'right');
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }
  };

  const handleLike = async (liked: boolean) => {
    if (!user || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    
    // Animate card out
    setDragOffset({ x: liked ? 300 : -300, y: 0 });
    setSwipeDirection(liked ? 'right' : 'left');
    
    setTimeout(async () => {
      if (liked) {
        const { error } = await supabase
          .from('likes')
          .insert({
            from_user_id: user.id,
            to_user_id: currentProfile.user_id
          });

        if (!error) {
          // Check if it's a match
          const { data: mutualLike } = await supabase
            .from('likes')
            .select('id')
            .eq('from_user_id', currentProfile.user_id)
            .eq('to_user_id', user.id)
            .maybeSingle();

          if (mutualLike) {
            toast({
              title: "🎉 IT'S A MATCH! 🎉",
              description: `You and ${currentProfile.display_name} liked each other!`,
            });
          } else {
            toast({
              title: "Liked! 💕",
              description: "If they like you back, it's a match!"
            });
          }
        }
      } else {
        toast({
          title: "Passed 👋",
          description: "No worries, there are plenty more amazing people!"
        });
      }

      // Move to next profile
      if (currentIndex + 1 >= profiles.length) {
        fetchProfiles(user.id);
      } else {
        setCurrentIndex(currentIndex + 1);
        setDragOffset({ x: 0, y: 0 });
        setSwipeDirection(null);
      }
    }, 300);
  };

  const currentProfile = profiles[currentIndex];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-md">
          {/* Header with filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Discover People
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </h1>
              <p className="text-muted-foreground text-sm">
                Swipe right to like, left to pass
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="ml-4"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-6 p-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-900">Filters</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">University</label>
                    <Select value={filters.university} onValueChange={(value) => setFilters(prev => ({ ...prev, university: value }))}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any University</SelectItem>
                        <SelectItem value="Harvard University">Harvard</SelectItem>
                        <SelectItem value="Stanford University">Stanford</SelectItem>
                        <SelectItem value="MIT">MIT</SelectItem>
                        <SelectItem value="UC Berkeley">UC Berkeley</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Course</label>
                    <Input
                      placeholder="Any course"
                      value={filters.course}
                      onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Min Age</label>
                    <Input
                      type="number"
                      value={filters.ageRange.min}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageRange: { ...prev.ageRange, min: parseInt(e.target.value) || 18 } }))}
                      className="h-8 text-sm"
                      min="18"
                      max="35"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Max Age</label>
                    <Input
                      type="number"
                      value={filters.ageRange.max}
                      onChange={(e) => setFilters(prev => ({ ...prev, ageRange: { ...prev.ageRange, max: parseInt(e.target.value) || 28 } }))}
                      className="h-8 text-sm"
                      min="18"
                      max="35"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => fetchProfiles(user.id)} 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-blue-500 to-yellow-500"
                >
                  Apply Filters
                </Button>
              </div>
            </Card>
          )}

          {/* Main Card Area */}
          <div className="relative h-[600px] mb-6">
            {loading ? (
              <Card className="absolute inset-0 flex items-center justify-center bg-white shadow-2xl rounded-2xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-blue-500 to-yellow-500 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Finding amazing people...</p>
                </div>
              </Card>
            ) : currentProfile ? (
              <div
                ref={cardRef}
                className={`absolute inset-0 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                style={{
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                  zIndex: 10
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <Card className="h-full overflow-hidden shadow-2xl rounded-2xl border-2 border-white bg-white">
                  {/* Photo */}
                  <div className="h-3/5 relative bg-gradient-to-br from-blue-400 via-purple-500 to-yellow-400">
                    {currentProfile.photo_urls && currentProfile.photo_urls.length > 0 ? (
                      <img 
                        src={currentProfile.photo_urls[0]} 
                        alt={currentProfile.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <span className="text-6xl">📸</span>
                      </div>
                    )}
                    
                    {/* Swipe Indicators */}
                    {swipeDirection && (
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/20 ${
                        swipeDirection === 'right' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <div className={`text-6xl font-bold border-4 px-8 py-4 rounded-2xl ${
                          swipeDirection === 'right' 
                            ? 'border-green-500 bg-green-500/20' 
                            : 'border-red-500 bg-red-500/20'
                        }`}>
                          {swipeDirection === 'right' ? 'LIKE' : 'NOPE'}
                        </div>
                      </div>
                    )}

                    {/* Verified Badge */}
                    {currentProfile.student_id_verified && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-green-500 text-white">
                          ✓ Verified Student
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Profile Info */}
                  <CardContent className="p-6 h-2/5 overflow-y-auto">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {currentProfile.display_name}
                          {currentProfile.age && <span className="text-xl text-muted-foreground ml-2">{currentProfile.age}</span>}
                        </h2>
                        {currentProfile.looking_for && (
                          <p className="text-sm text-blue-600 font-medium capitalize">
                            Looking for {currentProfile.looking_for.replace('-', ' ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* University Info */}
                    <div className="space-y-2 mb-4">
                      {currentProfile.university && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          {currentProfile.university}
                        </div>
                      )}

                      {currentProfile.course && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="w-4 h-4 mr-2 text-center">📚</span>
                          {currentProfile.course}
                          {currentProfile.year_of_study && (
                            <span className="ml-1">• {currentProfile.year_of_study}</span>
                          )}
                        </div>
                      )}

                      {currentProfile.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {currentProfile.location}
                        </div>
                      )}

                      {currentProfile.graduation_year && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          Class of {currentProfile.graduation_year}
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {currentProfile.bio && (
                      <p className="text-foreground mb-4 text-sm leading-relaxed">
                        {currentProfile.bio}
                      </p>
                    )}

                    {/* Interests */}
                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentProfile.interests.slice(0, 6).map((interest: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {currentProfile.interests.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{currentProfile.interests.length - 6} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 shadow-2xl rounded-2xl">
                <div className="text-center p-8">
                  <span className="text-6xl mb-4 block">🎉</span>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    You're all caught up!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    No new profiles to show right now.
                  </p>
                  <Button 
                    onClick={() => fetchProfiles(user.id)}
                    className="bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600"
                  >
                    Refresh
                  </Button>
                </div>
              </Card>
            )}

            {/* Next card preview */}
            {profiles[currentIndex + 1] && (
              <Card className="absolute inset-0 bg-white shadow-xl rounded-2xl scale-95 opacity-50" style={{ zIndex: 5 }}>
                <div className="h-3/5 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl"></div>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          {currentProfile && (
            <div className="flex justify-center space-x-8">
              <Button
                onClick={() => handleLike(false)}
                size="lg"
                variant="outline"
                className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 shadow-lg"
              >
                <X className="w-8 h-8" />
              </Button>
              
              <Button
                onClick={() => handleLike(true)}
                size="lg"
                className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-lg border-2 border-white"
              >
                <Heart className="w-8 h-8" />
              </Button>
            </div>
          )}

          {/* Tips */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Tip: Drag cards left or right to swipe, or use the buttons below
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
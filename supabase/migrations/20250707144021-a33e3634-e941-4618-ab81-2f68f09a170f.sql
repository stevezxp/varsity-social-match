-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  age INTEGER,
  university TEXT,
  course TEXT,
  year_of_study TEXT,
  graduation_year INTEGER,
  gender TEXT,
  looking_for TEXT,
  interests TEXT[],
  photo_urls TEXT[],
  location TEXT,
  verified_student BOOLEAN DEFAULT false,
  student_id_verified BOOLEAN DEFAULT false,
  profile_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for user connections
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create likes table for swipe tracking
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'emoji', 'gif', 'voice', 'image')),
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked_users table for safety
CREATE TABLE public.blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create reports table for safety
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create date_ideas table for suggestions
CREATE TABLE public.date_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('casual', 'active', 'cultural', 'food', 'study', 'adventure')),
  location_type TEXT CHECK (location_type IN ('on-campus', 'near-campus', 'city', 'virtual')),
  cost_level TEXT CHECK (cost_level IN ('free', 'low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create icebreakers table
CREATE TABLE public.icebreakers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fun', 'deep', 'casual', 'study', 'interests')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profile-photos', 'profile-photos', true),
  ('student-verification', 'student-verification', false),
  ('chat-attachments', 'chat-attachments', true);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icebreakers ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (
  profile_visible = true AND 
  user_id NOT IN (
    SELECT blocked_id FROM public.blocked_users WHERE blocker_id = auth.uid()
  ) AND
  user_id NOT IN (
    SELECT blocker_id FROM public.blocked_users WHERE blocked_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for likes
CREATE POLICY "Users can view likes they sent or received" 
ON public.likes 
FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create their own likes" 
ON public.likes 
FOR INSERT 
WITH CHECK (
  auth.uid() = from_user_id AND
  to_user_id NOT IN (
    SELECT blocked_id FROM public.blocked_users WHERE blocker_id = auth.uid()
  ) AND
  to_user_id NOT IN (
    SELECT blocker_id FROM public.blocked_users WHERE blocked_id = auth.uid()
  )
);

-- Create policies for matches
CREATE POLICY "Users can view their own matches" 
ON public.matches 
FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (true);

-- Create policies for messages
CREATE POLICY "Users can view messages in their matches" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = messages.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their matches" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE matches.id = messages.match_id 
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Create policies for blocked users
CREATE POLICY "Users can view their own blocks" 
ON public.blocked_users 
FOR SELECT 
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks" 
ON public.blocked_users 
FOR INSERT 
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks" 
ON public.blocked_users 
FOR DELETE 
USING (auth.uid() = blocker_id);

-- Create policies for reports
CREATE POLICY "Users can view their own reports" 
ON public.reports 
FOR SELECT 
USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

-- Create policies for date ideas and icebreakers
CREATE POLICY "Everyone can view active date ideas" 
ON public.date_ideas 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Everyone can view active icebreakers" 
ON public.icebreakers 
FOR SELECT 
USING (is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create matches when mutual likes exist
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's a mutual like
  IF EXISTS (
    SELECT 1 FROM public.likes 
    WHERE from_user_id = NEW.to_user_id 
    AND to_user_id = NEW.from_user_id
  ) THEN
    -- Create a match with consistent ordering (smaller UUID first)
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (
      LEAST(NEW.from_user_id, NEW.to_user_id),
      GREATEST(NEW.from_user_id, NEW.to_user_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic match creation
CREATE TRIGGER create_match_on_like
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.create_match_on_mutual_like();

-- Insert sample date ideas
INSERT INTO public.date_ideas (title, description, category, location_type, cost_level) VALUES
('Coffee Study Date', 'Meet at the campus coffee shop to study together and chat', 'study', 'on-campus', 'low'),
('Campus Walking Tour', 'Take a romantic walk around campus and discover new spots', 'casual', 'on-campus', 'free'),
('Library Late Night', 'Study together during finals week with snacks and motivation', 'study', 'on-campus', 'free'),
('Food Truck Adventure', 'Try different food trucks around campus together', 'food', 'near-campus', 'low'),
('Hiking Trail', 'Explore local hiking trails and enjoy nature together', 'active', 'city', 'free'),
('Art Museum Visit', 'Discover art and culture at the local museum', 'cultural', 'city', 'low'),
('Cooking Class', 'Learn to cook together at a local cooking class', 'food', 'city', 'medium'),
('Campus Sports Game', 'Cheer for your university team together', 'casual', 'on-campus', 'low'),
('Virtual Game Night', 'Play online games together from your dorms', 'casual', 'virtual', 'free'),
('Beach Day Trip', 'Take a day trip to the nearest beach', 'adventure', 'city', 'medium');

-- Insert sample icebreakers
INSERT INTO public.icebreakers (question, category) VALUES
('What''s your favorite spot on campus and why?', 'casual'),
('If you could have dinner with any professor, who would it be?', 'fun'),
('What''s the most spontaneous thing you''ve done at university?', 'fun'),
('What''s your dream career after graduation?', 'deep'),
('Which campus tradition do you love the most?', 'casual'),
('What''s your go-to study snack?', 'casual'),
('If you could add one class to the curriculum, what would it be?', 'study'),
('What''s your favorite way to de-stress during finals?', 'study'),
('What hobby have you picked up since starting university?', 'interests'),
('What''s the best advice you''ve received from a professor?', 'deep'),
('Which campus building has the best vibes?', 'casual'),
('What''s your favorite local restaurant near campus?', 'food'),
('If you could travel anywhere for spring break, where would you go?', 'fun'),
('What''s something you''re passionate about outside of your major?', 'interests'),
('What''s the most interesting thing you''ve learned this semester?', 'study');
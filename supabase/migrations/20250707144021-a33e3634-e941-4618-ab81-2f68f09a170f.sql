-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  age INTEGER,
  university TEXT,
  course TEXT,
  interests TEXT[],
  photo_urls TEXT[],
  location TEXT,
  verified_student BOOLEAN DEFAULT false,
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

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
WITH CHECK (auth.uid() = from_user_id);

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
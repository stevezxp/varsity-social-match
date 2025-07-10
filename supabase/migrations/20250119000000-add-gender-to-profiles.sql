-- Add gender field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female')) NULL;

-- Add index for better query performance when filtering by gender
CREATE INDEX idx_profiles_gender ON public.profiles(gender);
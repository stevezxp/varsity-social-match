# Gender-Based Matching Implementation

## Overview
This implementation adds gender-based matching functionality to your dating app, where:
- Users select their gender (male/female) when creating their profile
- Male users see only female profiles in the Discover section
- Female users see only male profiles in the Discover section

## Changes Made

### 1. Database Schema Changes

**New Migration File**: `supabase/migrations/20250119000000-add-gender-to-profiles.sql`
```sql
-- Add gender field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female')) NULL;

-- Add index for better query performance when filtering by gender
CREATE INDEX idx_profiles_gender ON public.profiles(gender);
```

### 2. TypeScript Types Updated

**File**: `src/integrations/supabase/types.ts`
- Added `gender: string | null` to the profiles table Row, Insert, and Update types

### 3. Profile Component Updates

**File**: `src/pages/Profile.tsx`
- Added gender selection using RadioGroup component
- Updated form state to include gender field
- Made gender selection required for profile completion
- Updated profile data submission to include gender

**Key Changes**:
- Import: Added `RadioGroup, RadioGroupItem` from `@/components/ui/radio-group`
- Form State: Added `gender: ''` to formData
- UI: Added gender selection radio buttons (Male/Female)
- Validation: Gender is now required for saving profile

### 4. Discover Component Updates

**File**: `src/pages/Discover.tsx`
- Added gender filtering logic to show only opposite gender profiles
- Updated profile fetching to include gender-based filtering
- Added user gender state management
- Enhanced UI to show which gender profiles are being displayed

**Key Changes**:
- State: Added `userGender` state
- Logic: Fetch user's gender before loading profiles
- Filtering: Only show profiles of opposite gender
- Redirect: Users without gender are redirected to profile completion

## Technical Implementation Details

### Gender Filtering Logic
```typescript
// Determine opposite gender for filtering
const targetGender = currentUserGender === 'male' ? 'female' : 'male';

// Filter profiles by opposite gender
const { data } = await supabase
  .from('profiles')
  .select('*')
  .not('user_id', 'in', `(${excludedIds.join(',')})`)
  .eq('gender', targetGender)  // Only show opposite gender
  .limit(10);
```

### Profile Completion Flow
- Users without a selected gender are automatically redirected to the profile page
- Profile form now requires both display name AND gender before submission
- Gender selection uses radio buttons for clear binary choice

### Database Constraints
- Gender field accepts only 'male' or 'female' values
- Field is nullable to support existing profiles
- Indexed for efficient filtering queries

## Required Actions to Complete Implementation

### 1. Apply Database Migration
Since local Supabase isn't available, you'll need to apply the migration to your remote database:

**Option A**: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration SQL:
```sql
ALTER TABLE public.profiles 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female')) NULL;

CREATE INDEX idx_profiles_gender ON public.profiles(gender);
```

**Option B**: Using Supabase CLI (if available)
```bash
npx supabase db push
```

### 2. Update Existing User Profiles
Existing users will need to update their profiles to include gender selection. The app automatically redirects users without gender to the profile page.

### 3. Test the Implementation
1. Create/update profiles with different genders
2. Verify that Discover page only shows opposite gender profiles
3. Test that matching still works correctly between opposite genders

## Features Included

✅ **Gender Selection**: Binary gender selection during profile creation
✅ **Filtered Discovery**: Users only see profiles of opposite gender
✅ **Profile Validation**: Gender is required for profile completion
✅ **Automatic Redirect**: Users without gender are guided to complete profile
✅ **Visual Indicators**: Discover page shows which gender profiles are displayed
✅ **Database Optimization**: Indexed gender field for efficient queries

## Future Enhancements (Optional)

- Add gender preference settings (e.g., non-binary options)
- Allow users to specify which genders they want to see
- Add option to show all genders for users who prefer that
- Include gender display in profile cards

## Database Impact

- **Non-breaking**: Existing profiles continue to work (gender is nullable)
- **Performance**: Added index ensures efficient gender-based filtering
- **Data Integrity**: Check constraint ensures only valid gender values

The implementation ensures backward compatibility while adding the requested gender-based matching functionality.
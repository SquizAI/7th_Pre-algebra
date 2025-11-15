# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the Equation Quest platform.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Choose a name, database password, and region
5. Wait for the project to be created (2-3 minutes)

## 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (this is safe to use in the browser)

## 3. Configure Environment Variables

### For Local Development:

1. Copy `env-inject.example.js` to `env-inject.js`
2. Fill in your Supabase credentials:

```javascript
window.ENV = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  GEMINI_API_KEY: 'your-existing-gemini-key'
};
```

3. Make sure `env-inject.js` is in your `.gitignore`

### For Netlify Deployment:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** > **Environment variables**
3. Add the following variables:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Your anon/public key
   - `GEMINI_API_KEY`: Your existing Gemini API key

4. Redeploy your site

## 4. Create Database Tables

Run the following SQL in your Supabase SQL Editor (**SQL Editor** in the sidebar):

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Game progress fields
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  current_world INTEGER DEFAULT 1,
  current_lesson INTEGER DEFAULT 1,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT level_positive CHECK (level > 0),
  CONSTRAINT xp_non_negative CHECK (xp >= 0),
  CONSTRAINT coins_non_negative CHECK (coins >= 0)
);

-- Create lesson_progress table
CREATE TABLE public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id INTEGER NOT NULL,
  world_id INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  attempts INTEGER DEFAULT 0,
  mastery_level DECIMAL(3,2), -- 0.00 to 1.00
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, lesson_id, world_id)
);

-- Create activity_log table
CREATE TABLE public.activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'login', 'lesson_start', 'lesson_complete', 'problem_solve', etc.
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX idx_activity_log_user ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created ON public.activity_log(created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Lesson progress policies
CREATE POLICY "Users can view their own progress"
  ON public.lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view their own activity"
  ON public.activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
  ON public.activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 5. Configure Email Templates (Optional)

1. Go to **Authentication** > **Email Templates**
2. Customize the email templates for:
   - Confirmation email
   - Password reset
   - Magic link

## 6. Test the Authentication Flow

1. Visit your local site or deployed URL
2. Click "Sign Up"
3. Create a test account
4. Check your email for confirmation
5. Log in with your credentials
6. Verify that your profile appears in the Supabase dashboard

## 7. Security Considerations

### Email Verification

By default, Supabase requires email verification. To change this:

1. Go to **Authentication** > **Settings**
2. Toggle "Enable email confirmations"
3. This is recommended for production!

### Password Requirements

Configure minimum password requirements:

1. Go to **Authentication** > **Settings**
2. Set minimum password length (recommended: 8)

### Rate Limiting

Supabase has built-in rate limiting, but you can configure it:

1. Go to **Authentication** > **Rate Limits**
2. Adjust as needed

## 8. Troubleshooting

### "Invalid API key" error

- Double-check your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Make sure there are no extra spaces
- Verify the keys are from the correct project

### Users can't sign up

- Check if email confirmation is enabled
- Verify SMTP settings in Supabase
- Check browser console for errors

### Session not persisting

- Check if localStorage is enabled in the browser
- Verify the domain is correct
- Check for CORS issues

### Profile not created

- Check the SQL policies
- Verify the `createUserProfile` function is being called
- Check browser console for errors

## Database Schema

### profiles table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User ID (references auth.users) |
| username | TEXT | Unique username (3-20 chars) |
| full_name | TEXT | User's full name |
| email | TEXT | User's email |
| avatar_url | TEXT | Profile picture URL |
| level | INTEGER | Current game level |
| xp | INTEGER | Total experience points |
| coins | INTEGER | Total coins earned |
| current_world | INTEGER | Current world/chapter |
| current_lesson | INTEGER | Current lesson |
| last_active | TIMESTAMP | Last activity timestamp |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### lesson_progress table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Progress record ID |
| user_id | UUID | User ID |
| lesson_id | INTEGER | Lesson identifier |
| world_id | INTEGER | World identifier |
| completed | BOOLEAN | Completion status |
| score | INTEGER | Final score |
| attempts | INTEGER | Number of attempts |
| mastery_level | DECIMAL | Mastery percentage (0-1) |
| completed_at | TIMESTAMP | Completion time |
| created_at | TIMESTAMP | First attempt time |
| updated_at | TIMESTAMP | Last update time |

### activity_log table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Activity record ID |
| user_id | UUID | User ID |
| activity_type | TEXT | Type of activity |
| activity_data | JSONB | Additional activity data |
| created_at | TIMESTAMP | Activity timestamp |

## Support

For issues with Supabase, check:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

For issues with this integration, check the browser console for error messages.

# Authentication Quick Start Guide

Get your authentication system up and running in 10 minutes!

## Step 1: Create Supabase Project (3 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Fill in:
   - Name: `equation-quest` (or any name)
   - Database Password: (create a strong password)
   - Region: Choose closest to you
6. Click "Create new project"
7. Wait 2-3 minutes for setup

## Step 2: Get Your API Keys (1 minute)

1. In your new project, click "Settings" (gear icon)
2. Click "API" in the left sidebar
3. Copy these two values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Create Database Tables (2 minutes)

1. Click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the ENTIRE SQL script below and paste it:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  current_world INTEGER DEFAULT 1,
  current_lesson INTEGER DEFAULT 1,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  mastery_level DECIMAL(3,2),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, world_id)
);

-- Create activity_log table
CREATE TABLE public.activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
```

4. Click "Run" (or press Ctrl/Cmd + Enter)
5. You should see "Success. No rows returned"

## Step 4: Configure Your App (2 minutes)

### For Local Development

1. In your project folder, find `env-inject.example.js`
2. Copy it and rename to `env-inject.js`
3. Open `env-inject.js` in your editor
4. Replace the values:

```javascript
window.ENV = {
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co', // Paste your Project URL
  SUPABASE_ANON_KEY: 'eyJ...', // Paste your anon key
  GEMINI_API_KEY: 'your-existing-gemini-key' // Keep your existing key
};
```

5. Save the file

### For Netlify Deployment

1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" > "Environment variables"
4. Click "Add a variable" and add:
   - Key: `SUPABASE_URL`, Value: (your Project URL)
   - Key: `SUPABASE_ANON_KEY`, Value: (your anon key)
5. Click "Save"
6. Redeploy your site

## Step 5: Test It! (2 minutes)

1. Open your app in a browser
2. You should be redirected to login page
3. Click "Sign up here"
4. Fill in the form:
   - Full Name: Test Student
   - Username: teststudent
   - Email: your-email@example.com
   - Password: TestPass123
   - Confirm Password: TestPass123
   - Check "I agree to the terms"
5. Click "Create Account"
6. You should see success message
7. Go back to login and sign in
8. You should see the main app with your name in the header

## Verify Setup

### Check Database

1. Go to Supabase dashboard
2. Click "Table Editor"
3. Click "profiles" table
4. You should see your test user

### Check Authentication

1. Click "Authentication" in Supabase
2. Click "Users"
3. You should see your test user

## Troubleshooting

### "Supabase client not initialized"

Make sure:
- `env-inject.js` exists in your project root
- The file has correct values (no quotes around the values)
- The file is loaded before other scripts in index.html

### "Invalid API key"

- Double-check you copied the entire key
- Make sure you used the "anon public" key, not the "service_role" key
- Check for extra spaces at the beginning or end

### "Profile not created"

- Check the browser console for errors
- Verify the SQL ran successfully
- Try creating another account

### Can't see the login page

- Make sure all auth HTML files are in the `/auth/` folder
- Check file paths in index.html
- Look for 404 errors in browser console

## Next Steps

Now that authentication is working:

1. **Test the full flow**
   - Sign up a few more test accounts
   - Complete some lessons
   - Check progress saves
   - Sign out and sign back in

2. **Customize email templates** (optional)
   - Go to Authentication > Email Templates in Supabase
   - Customize confirmation emails
   - Customize password reset emails

3. **Add your team** (optional)
   - Invite collaborators to Supabase project
   - Share environment variables securely
   - Set up staging environment

4. **Monitor usage**
   - Check Supabase dashboard for user stats
   - Monitor API usage
   - Watch for errors in logs

## Important Security Notes

- **Never commit `env-inject.js`** - It's already in .gitignore
- **Use HTTPS in production** - Required for session cookies
- **Enable email verification** - Recommended for production
- **Set up rate limiting** - Prevent abuse
- **Regular backups** - Download database backups monthly

## Getting Help

If something isn't working:

1. Check the browser console for errors (F12)
2. Check the Supabase logs (Logs section in dashboard)
3. Review the [full setup guide](SUPABASE_SETUP.md)
4. Review the [testing checklist](AUTH_TESTING.md)

## Success Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] API keys copied
- [ ] env-inject.js configured
- [ ] Test account created
- [ ] Can sign in and out
- [ ] Profile displays in header
- [ ] Progress syncs to database
- [ ] Works on mobile

**Once all checked, you're ready to go!**

---

## Quick Commands

### Check if tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### View all users:
```sql
SELECT username, email, level, xp, coins
FROM public.profiles;
```

### Delete test user:
```sql
DELETE FROM public.profiles
WHERE email = 'test@example.com';
```

### Reset all data (careful!):
```sql
TRUNCATE public.profiles, public.lesson_progress, public.activity_log CASCADE;
```

---

**Estimated Time:** 10 minutes
**Difficulty:** Beginner
**Last Updated:** 2025-11-13

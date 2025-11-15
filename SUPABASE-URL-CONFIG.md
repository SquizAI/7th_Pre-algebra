# Supabase URL Configuration Guide

**Date**: 2025-11-15
**Production URL**: https://7th-grade-pre-algebra.netlify.app

---

## URLs to Configure in Supabase Dashboard

### 1. Site URL
**Location**: Supabase Dashboard > Authentication > URL Configuration > Site URL

**Set to**: `https://7th-grade-pre-algebra.netlify.app`

**Purpose**: The main URL of your deployed application

---

### 2. Redirect URLs (Allowed)
**Location**: Supabase Dashboard > Authentication > URL Configuration > Redirect URLs

**Add these URLs**:
```
https://7th-grade-pre-algebra.netlify.app/**
https://7th-grade-pre-algebra.netlify.app/auth/login.html
https://7th-grade-pre-algebra.netlify.app/auth/signup.html
https://7th-grade-pre-algebra.netlify.app/auth/profile.html
https://7th-grade-pre-algebra.netlify.app/index.html
https://7th-grade-pre-algebra.netlify.app/dashboard.html
https://7th-grade-pre-algebra.netlify.app/lesson-player.html
https://7th-grade-pre-algebra.netlify.app/lesson-map.html
https://7th-grade-pre-algebra.netlify.app/achievements.html
https://7th-grade-pre-algebra.netlify.app/teacher-dashboard.html
http://localhost:8888/**
http://localhost:5173/**
```

**Purpose**: These URLs are allowed for authentication redirects after login/signup

---

## Step-by-Step Instructions

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select project: **fejyyntdbqlighscjvre**
3. Click **Authentication** in left sidebar
4. Click **URL Configuration**

### Step 2: Update Site URL
1. Find **Site URL** field
2. Change from default to: `https://7th-grade-pre-algebra.netlify.app`
3. Click **Save**

### Step 3: Add Redirect URLs
1. Scroll to **Redirect URLs** section
2. Click **+ Add URL** for each URL listed above
3. Paste each URL
4. Click **Save** after adding all URLs

---

## Email Configuration

### Email Templates
**Location**: Authentication > Email Templates

Update these templates to use production URL:

#### Confirm signup
- Change `{{ .SiteURL }}` references to production URL

#### Magic Link
- Change `{{ .SiteURL }}` references to production URL

#### Change Email Address
- Change `{{ .SiteURL }}` references to production URL

#### Reset Password
- Change `{{ .SiteURL }}` references to production URL

---

## Testing After Configuration

### Test 1: Signup
1. Visit https://7th-grade-pre-algebra.netlify.app/auth/signup.html
2. Create a new account
3. Check email for confirmation link
4. Confirm the link redirects to production URL

### Test 2: Login
1. Visit https://7th-grade-pre-algebra.netlify.app/auth/login.html
2. Login with confirmed account
3. Verify redirect to dashboard or home page

### Test 3: Password Reset
1. Click "Forgot Password" on login page
2. Enter email
3. Check email for reset link
4. Verify link redirects to production URL

---

## Current User Account

**Email**: matty@lvng.ai
**Password**: P1zza123!
**Status**: ✅ Account created and has access

**Next Step**: Update Supabase URLs then test login with this account

---

## Troubleshooting

### Issue: "Email not confirmed" error
**Solution**:
1. Check Supabase > Authentication > Users
2. Find user by email
3. Click user > Click "Confirm Email"
4. Try logging in again

### Issue: Redirect URL not allowed
**Solution**:
1. Check URL is in allowed redirect URLs list
2. Ensure it matches exactly (including trailing slashes)
3. Save and wait 30 seconds for cache to clear

### Issue: Email confirmation link goes to wrong URL
**Solution**:
1. Check Site URL is set correctly
2. Check email template uses correct variable
3. Resend confirmation email

---

**Last Updated**: 2025-11-15
**Status**: ⏳ Awaiting URL configuration in Supabase Dashboard

# AI Word Problems Setup Guide

This guide will help you set up the AI-powered word problem generator for your 7th Grade Pre-Algebra app.

## 🚀 Quick Start

The app now uses **Google Gemini 2.0 Flash** to generate engaging, age-appropriate word problems for each equation!

## 📋 Prerequisites

- A Google account (for Gemini API access)
- Your site deployed on Netlify (already done!)

## 🔑 Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIza...`)

**Note:** The free tier includes:
- 15 requests per minute
- 1 million tokens per day
- Perfect for student projects!

## ⚙️ Step 2: Configure Netlify Environment Variables

### Option A: Using Netlify UI (Recommended)

1. Go to your Netlify dashboard: https://app.netlify.com/
2. Select your site: **7th-grade-pre-algebra**
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Click **"Add environment variable"**
5. Add the following:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Paste your API key from Step 1
   - **Scopes:** Check both "Builds" and "Deploy previews"
6. Click **"Create variable"**

### Option B: Using Netlify CLI

```bash
# Install Netlify CLI if you haven't already
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to your project directory
cd /Users/mattysquarzoni/Documents/7th-PreAlgebra

# Set the environment variable
netlify env:set GEMINI_API_KEY "your-api-key-here"
```

## 🔄 Step 3: Redeploy Your Site

After adding the environment variable, trigger a new deployment:

### Option A: Push to Git (Automatic)

```bash
git add .
git commit -m "Add AI word problem generator"
git push
```

Netlify will automatically rebuild and deploy.

### Option B: Manual Deploy

1. In Netlify dashboard, go to **Deploys**
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

## ✅ Step 4: Verify It's Working

1. Visit your live site: https://7th-grade-pre-algebra.netlify.app
2. Start a story mode level
3. You should see:
   - 📖 **Word Problem** section (pink gradient box)
   - AI-generated word problem related to the equation
   - The equation below it

Example word problem:
> "Sarah is saving up for a new gaming console. She already has $45 and plans to save $12 each week from her allowance. How many weeks will it take her to have $117?"

Then shows: `12x + 45 = 117`

## 🧪 Local Development

For local testing, create a `.env` file in the project root:

```bash
# .env file (create this file locally - it's in .gitignore)
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

**IMPORTANT:** Never commit your actual API key to git! The `.env` file is in `.gitignore` for security.

The local `env-inject.js` file loads this automatically. Just open `index.html` in your browser!

## 🎯 How It Works

1. **Adaptive Difficulty**: Word problems match the student's current difficulty level (easy/medium/hard)
2. **Age-Appropriate**: AI generates 7th-grade-friendly scenarios (gaming, sports, money, phones)
3. **Real-World Context**: Students learn to translate word problems into equations
4. **Fallback System**: If AI is unavailable, pre-written templates are used

## 📊 Features

- **Gemini 2.0 Flash**: Latest, fastest Google AI model
- **Smart Caching**: Generated problems are cached to reduce API calls
- **Adaptive Learning**: Difficulty adjusts based on student performance
- **Diverse Scenarios**: Avoids repetitive themes
- **Free Tier**: No costs for typical student usage

## 🔒 Security

- ✅ API key is stored securely in Netlify environment variables
- ✅ `.env` file is in `.gitignore` (never committed)
- ✅ `env-inject.js` is generated during build (never committed)
- ✅ API key is never exposed in browser console or network inspector

## 🛠️ Troubleshooting

### Word problems not showing?

1. Check Netlify environment variable is set correctly
2. Redeploy the site after adding the variable
3. Open browser console (F12) and look for errors
4. Check if `GEMINI_API_KEY` is logged (should show in console on load)

### API quota exceeded?

The free tier allows:
- 15 requests/minute
- 1M tokens/day

This is more than enough for a classroom! If you exceed:
1. Word problems will automatically fall back to pre-written templates
2. Consider upgrading to paid tier (very cheap: ~$0.50/1M tokens)

### Fallback problems showing?

If you see generic problems like:
> "You scored {answer} points in a video game..."

This means:
- API key is not configured correctly, or
- API quota exceeded, or
- Network error

Check Netlify environment variables and redeploy.

## 💡 Tips

- **Test locally first**: Use your `.env` file for development
- **Monitor usage**: Check [Google AI Studio](https://aistudio.google.com/) for API usage stats
- **Custom prompts**: Edit `word-problem-generator.js` to customize the AI prompts

## 📚 Resources

- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Gemini Pricing](https://ai.google.dev/pricing)

## 🎉 You're All Set!

Students can now learn algebra by solving real-world problems generated by AI! The system adapts to their skill level and creates engaging scenarios they can relate to.

---

**Questions?** Check the console logs or open an issue in the repository.

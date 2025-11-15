/**
 * Environment Variables Example
 *
 * Copy this file to env-inject.js and fill in your actual values.
 * DO NOT commit env-inject.js to version control!
 *
 * For Netlify deployment, set these as environment variables in the Netlify dashboard.
 */

window.ENV = {
  // Supabase Configuration
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',

  // Google Gemini API (existing)
  GEMINI_API_KEY: 'your-gemini-api-key-here'
};

/**
 * Supabase Client Configuration
 *
 * Initializes and exports the Supabase client for use throughout the application.
 * Uses environment variables for security.
 */

// Initialize Supabase client
let supabase = null;

/**
 * Initialize Supabase client with environment variables
 * @returns {Object} Supabase client instance
 */
function initSupabase() {
  // Check if Supabase is already initialized
  if (supabase) {
    return supabase;
  }

  // Get environment variables
  const SUPABASE_URL = window.ENV?.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';

  // Validate environment variables
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
    return null;
  }

  // Validate Supabase library is loaded
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase library not loaded. Please include the Supabase JS SDK.');
    return null;
  }

  // Create Supabase client
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });

  console.log('Supabase client initialized successfully');
  return supabase;
}

/**
 * Get the current Supabase client instance
 * @returns {Object|null} Supabase client or null if not initialized
 */
function getSupabaseClient() {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
}

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}

// Export for use in other modules
window.SupabaseClient = {
  getClient: getSupabaseClient,
  init: initSupabase
};

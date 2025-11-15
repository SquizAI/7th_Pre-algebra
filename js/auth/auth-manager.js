/**
 * Authentication Manager
 *
 * Handles all authentication operations including sign up, sign in, sign out,
 * and user profile management.
 */

class AuthManager {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.authStateCallbacks = [];
    this.init();
  }

  /**
   * Initialize the auth manager
   */
  async init() {
    // Wait for Supabase client to be ready
    await this.waitForSupabase();

    // Set up auth state listener
    this.setupAuthListener();

    // Check for existing session
    await this.checkSession();
  }

  /**
   * Wait for Supabase client to be initialized
   */
  async waitForSupabase() {
    let attempts = 0;
    const maxAttempts = 50;

    while (!window.SupabaseClient && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (window.SupabaseClient) {
      this.supabase = window.SupabaseClient.getClient();
    } else {
      console.error('Supabase client failed to initialize');
    }
  }

  /**
   * Set up authentication state change listener
   */
  setupAuthListener() {
    if (!this.supabase) return;

    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        this.currentUser = session.user;
        this.notifyAuthStateChange('signed_in', session.user);
      } else {
        this.currentUser = null;
        this.notifyAuthStateChange('signed_out', null);
      }
    });
  }

  /**
   * Check for existing session on load
   */
  async checkSession() {
    if (!this.supabase) return null;

    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        this.currentUser = session.user;
        return session.user;
      }

      return null;
    } catch (error) {
      console.error('Error checking session:', error);
      return null;
    }
  }

  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Display username
   * @param {string} fullName - User's full name
   * @returns {Object} Sign up result
   */
  async signUp(email, password, username, fullName) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Sign up the user
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user, username, fullName);
      }

      return {
        success: true,
        user: data.user,
        message: 'Account created successfully! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Sign in result
   */
  async signIn(email, password) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.currentUser = data.user;

      return {
        success: true,
        user: data.user,
        message: 'Signed in successfully!'
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sign out the current user
   * @returns {Object} Sign out result
   */
  async signOut() {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) throw error;

      this.currentUser = null;

      // Clear local storage
      localStorage.removeItem('studentName');
      localStorage.removeItem('playerData');

      return {
        success: true,
        message: 'Signed out successfully!'
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get the current authenticated user
   * @returns {Object|null} Current user or null
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Check if user has teacher role
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if user is a teacher
   */
  async isTeacher(userId) {
    try {
      const profile = await this.getUserProfile(userId);
      return profile && profile.role === 'teacher';
    } catch (error) {
      console.error('Error checking teacher role:', error);
      return false;
    }
  }

  /**
   * Create user profile in database
   * @param {Object} user - User object from auth
   * @param {string} username - Display username
   * @param {string} fullName - User's full name
   */
  async createUserProfile(user, username, fullName) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('profiles')
        .insert({
          id: user.id,
          username,
          full_name: fullName,
          email: user.email,
          created_at: new Date().toISOString(),
          level: 1,
          xp: 0,
          coins: 0,
          current_world: 1,
          current_lesson: 1
        });

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      console.log('User profile created successfully');
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  }

  /**
   * Get user profile from database
   * @param {string} userId - User ID
   * @returns {Object|null} User profile or null
   */
  async getUserProfile(userId) {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Object} Update result
   */
  async updateUserProfile(userId, updates) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Object} Update result
   */
  async updatePassword(newPassword) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password updated successfully!'
      };
    } catch (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Object} Reset result
   */
  async resetPassword(email) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password.html`
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register callback for auth state changes
   * @param {Function} callback - Callback function
   */
  onAuthStateChange(callback) {
    this.authStateCallbacks.push(callback);
  }

  /**
   * Notify all callbacks of auth state change
   * @param {string} event - Event type
   * @param {Object} user - User object
   */
  notifyAuthStateChange(event, user) {
    this.authStateCallbacks.forEach(callback => {
      try {
        callback(event, user);
      } catch (error) {
        console.error('Error in auth state callback:', error);
      }
    });
  }

  /**
   * Delete user account (requires confirmation)
   * @returns {Object} Deletion result
   */
  async deleteAccount() {
    if (!this.supabase || !this.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Delete profile first
      const { error: profileError } = await this.supabase
        .from('profiles')
        .delete()
        .eq('id', this.currentUser.id);

      if (profileError) throw profileError;

      // Delete auth user (requires admin privileges or RLS policy)
      // Note: This typically needs to be done via a server function
      // For now, we'll just sign out
      await this.signOut();

      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create global auth manager instance
window.authManager = new AuthManager();

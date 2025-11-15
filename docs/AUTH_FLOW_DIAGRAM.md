# Authentication Flow Diagrams

Visual representations of the authentication system flows.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    EQUATION QUEST                        │
│                   7th Grade Pre-Algebra                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (Browser)                      │
├─────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ login.html │  │ signup.html  │  │ profile.html   │  │
│  └────────────┘  └──────────────┘  └────────────────┘  │
│         │                │                   │           │
│         └────────────────┼───────────────────┘           │
│                          ▼                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │         auth-manager.js                          │   │
│  │  • signUp()      • signIn()      • signOut()    │   │
│  │  • getUserProfile()  • updateProfile()          │   │
│  │  • onAuthStateChange()                          │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                                │
│                          ▼                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │         supabase-client.js                       │   │
│  │  • Initialize Supabase SDK                       │   │
│  │  • Manage connection                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 SUPABASE (Backend)                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌──────────────────────┐  │
│  │  Authentication │         │    PostgreSQL DB     │  │
│  │                 │         │                      │  │
│  │  • User Auth    │────────▶│  • profiles          │  │
│  │  • Sessions     │         │  • lesson_progress   │  │
│  │  • Tokens       │         │  • activity_log      │  │
│  └─────────────────┘         │  • Row Level Sec.    │  │
│                              └──────────────────────┘  │
│  ┌─────────────────┐         ┌──────────────────────┐  │
│  │  Email Service  │         │    Storage (future)  │  │
│  │  • Verification │         │  • Avatars           │  │
│  │  • Reset Pwd    │         │  • Exports           │  │
│  └─────────────────┘         └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Sign Up Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Visits /auth/signup.html
     ▼
┌──────────────────────────────┐
│   Signup Form                │
│   • Full Name                │
│   • Username                 │
│   • Email                    │
│   • Password                 │
│   • Confirm Password         │
│   • Terms Acceptance         │
└────┬─────────────────────────┘
     │
     │ 2. Fills form & submits
     ▼
┌──────────────────────────────┐
│   Client Validation          │
│   ✓ All fields filled        │
│   ✓ Username 3-20 chars      │
│   ✓ Valid email format       │
│   ✓ Password ≥ 8 chars       │
│   ✓ Passwords match          │
│   ✓ Terms accepted           │
└────┬─────────────────────────┘
     │
     │ 3. Call authManager.signUp()
     ▼
┌──────────────────────────────┐
│   auth-manager.js            │
│   signUp(email, pwd, ...)    │
└────┬─────────────────────────┘
     │
     │ 4. Create auth user
     ▼
┌──────────────────────────────┐
│   Supabase Auth              │
│   supabase.auth.signUp()     │
└────┬─────────────────────────┘
     │
     ├──────────── Success ──────────┐
     │                               │
     │ 5. User created               │
     ▼                               ▼
┌──────────────────────────────┐   ┌──────────────────────┐
│   createUserProfile()        │   │  Send Email          │
│   Insert into profiles table │   │  • Verification      │
└────┬─────────────────────────┘   └──────────────────────┘
     │
     │ 6. Profile created
     ▼
┌──────────────────────────────┐
│   Success Message            │
│   "Account created! Check    │
│   your email to verify."     │
└────┬─────────────────────────┘
     │
     │ 7. Redirect after 2 seconds
     ▼
┌──────────────────────────────┐
│   /auth/login.html           │
└──────────────────────────────┘
```

## Sign In Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Visits /auth/login.html
     ▼
┌──────────────────────────────┐
│   Login Form                 │
│   • Email                    │
│   • Password                 │
│   • Remember Me (optional)   │
└────┬─────────────────────────┘
     │
     │ 2. Enters credentials
     ▼
┌──────────────────────────────┐
│   authManager.signIn()       │
└────┬─────────────────────────┘
     │
     │ 3. Authenticate
     ▼
┌──────────────────────────────┐
│   Supabase Auth              │
│   signInWithPassword()       │
└────┬─────────────────────────┘
     │
     ├──── Success ────┬──── Error ────┐
     │                 │               │
     ▼                 ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Create      │  │ Store       │  │ Show Error  │
│ Session     │  │ Token in    │  │ Message     │
│ Token       │  │ localStorage│  │             │
└──────┬──────┘  └──────┬──────┘  └─────────────┘
       │                │
       │ 4. Get profile │
       ▼                ▼
┌──────────────────────────────┐
│   getUserProfile(user.id)    │
│   Load from profiles table   │
└────┬─────────────────────────┘
     │
     │ 5. Profile data retrieved
     ▼
┌──────────────────────────────┐
│   Sync to Game State         │
│   • playerLevel = level      │
│   • playerXP = xp            │
│   • playerCoins = coins      │
└────┬─────────────────────────┘
     │
     │ 6. Redirect
     ▼
┌──────────────────────────────┐
│   /index.html                │
│   • User greeting visible    │
│   • Stats synced             │
│   • Sign out button shown    │
└──────────────────────────────┘
```

## Session Management

```
┌──────────────────────────────┐
│   User Opens App             │
└────┬─────────────────────────┘
     │
     │ 1. Page loads
     ▼
┌──────────────────────────────┐
│   auth-manager.js init()     │
└────┬─────────────────────────┘
     │
     │ 2. Check for session
     ▼
┌──────────────────────────────┐
│   supabase.auth.getSession() │
└────┬─────────────────────────┘
     │
     ├──── Session Found ────┬──── No Session ────┐
     │                       │                     │
     ▼                       ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Validate     │      │ Load         │      │ Redirect to  │
│ Token        │      │ Profile      │      │ /auth/login  │
│              │      │              │      │              │
└──────┬───────┘      └──────┬───────┘      └──────────────┘
       │                     │
       │ Valid               │ 3. User Info
       ▼                     ▼
┌──────────────────────────────┐
│   Display User Info          │
│   • Show greeting            │
│   • Show profile link        │
│   • Show sign out button     │
│   • Sync game stats          │
└────┬─────────────────────────┘
     │
     │ 4. Start auto-sync
     ▼
┌──────────────────────────────┐
│   setInterval(30 seconds)    │
│   • Save progress to DB      │
│   • Update last_active       │
└──────────────────────────────┘
```

## Progress Sync Flow

```
┌──────────────────────────────┐
│   User Completes Lesson      │
└────┬─────────────────────────┘
     │
     │ 1. Lesson complete event
     ▼
┌──────────────────────────────┐
│   Game Controller            │
│   • playerXP += 50           │
│   • playerCoins += 10        │
│   • playerLevel++ (if needed)│
└────┬─────────────────────────┘
     │
     │ 2. Update UI
     ▼
┌──────────────────────────────┐
│   Display Stats              │
│   • Show XP animation        │
│   • Show coins earned        │
│   • Show level up (if any)   │
└────┬─────────────────────────┘
     │
     │ 3. Wait for sync interval (max 30s)
     │    OR
     │    Immediate on certain events
     ▼
┌──────────────────────────────┐
│   updateUserProfile()        │
│   • level                    │
│   • xp                       │
│   • coins                    │
│   • current_world            │
│   • current_lesson           │
│   • last_active              │
└────┬─────────────────────────┘
     │
     │ 4. Update database
     ▼
┌──────────────────────────────┐
│   Supabase Database          │
│   UPDATE profiles            │
│   SET ...                    │
│   WHERE id = user.id         │
└────┬─────────────────────────┘
     │
     │ 5. Also log activity
     ▼
┌──────────────────────────────┐
│   INSERT INTO activity_log   │
│   • activity_type: 'lesson'  │
│   • activity_data: {...}     │
└──────────────────────────────┘
```

## Sign Out Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Clicks "Sign Out"
     ▼
┌──────────────────────────────┐
│   Confirm Sign Out           │
│   (optional)                 │
└────┬─────────────────────────┘
     │
     │ 2. Call authManager.signOut()
     ▼
┌──────────────────────────────┐
│   Final Progress Sync        │
│   • Save current state       │
│   • Update last_active       │
└────┬─────────────────────────┘
     │
     │ 3. Clear session
     ▼
┌──────────────────────────────┐
│   Supabase Auth              │
│   supabase.auth.signOut()    │
└────┬─────────────────────────┘
     │
     │ 4. Clear local data
     ▼
┌──────────────────────────────┐
│   localStorage.clear()       │
│   • Remove session token     │
│   • Remove user data         │
│   • Clear game state         │
└────┬─────────────────────────┘
     │
     │ 5. Reset UI
     ▼
┌──────────────────────────────┐
│   Hide User Info             │
│   • Remove greeting          │
│   • Remove profile link      │
│   • Remove sign out button   │
└────┬─────────────────────────┘
     │
     │ 6. Redirect
     ▼
┌──────────────────────────────┐
│   /auth/login.html           │
└──────────────────────────────┘
```

## Password Reset Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Clicks "Forgot Password"
     ▼
┌──────────────────────────────┐
│   Enter Email Address        │
└────┬─────────────────────────┘
     │
     │ 2. Submit email
     ▼
┌──────────────────────────────┐
│   authManager.resetPassword()│
└────┬─────────────────────────┘
     │
     │ 3. Request reset
     ▼
┌──────────────────────────────┐
│   Supabase Auth              │
│   resetPasswordForEmail()    │
└────┬─────────────────────────┘
     │
     │ 4. Send email
     ▼
┌──────────────────────────────┐
│   Email with Reset Link      │
│   • Secure token             │
│   • Expires in 1 hour        │
└────┬─────────────────────────┘
     │
     │ 5. User clicks link
     ▼
┌──────────────────────────────┐
│   Reset Password Page        │
│   • Enter new password       │
│   • Confirm new password     │
└────┬─────────────────────────┘
     │
     │ 6. Submit new password
     ▼
┌──────────────────────────────┐
│   Update Password            │
│   • Hash new password        │
│   • Invalidate old sessions  │
└────┬─────────────────────────┘
     │
     │ 7. Success
     ▼
┌──────────────────────────────┐
│   Redirect to Login          │
│   "Password updated! Please  │
│   sign in with new password" │
└──────────────────────────────┘
```

## Data Flow

```
┌────────────────────────────────────────────────────┐
│                   USER ACTIONS                      │
└────────────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Sign Up │  │ Sign In  │  │  Play    │
   └────┬─────┘  └────┬─────┘  └────┬─────┘
        │             │              │
        ▼             ▼              ▼
┌─────────────────────────────────────────────┐
│          AUTHENTICATION LAYER                │
│  ┌────────────────────────────────────────┐ │
│  │        auth-manager.js                 │ │
│  │  • User management                     │ │
│  │  • Session handling                    │ │
│  │  • State synchronization               │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │   Auth   │  │ Database │  │  Local   │
   │   State  │  │   Sync   │  │ Storage  │
   └────┬─────┘  └────┬─────┘  └────┬─────┘
        │             │              │
        ▼             ▼              ▼
┌─────────────────────────────────────────────┐
│               SUPABASE BACKEND               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │    DB    │  │  Storage │  │
│  │ Service  │  │  Tables  │  │  (Future)│  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ profiles │  │ lesson_  │  │activity_ │
   │  table   │  │ progress │  │   log    │
   └──────────┘  └──────────┘  └──────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Layer 1: Client-Side Validation                    │
│  ┌────────────────────────────────────────────┐    │
│  │  • Input sanitization                      │    │
│  │  • Format validation                       │    │
│  │  • Password strength                       │    │
│  └────────────────────────────────────────────┘    │
│                      ↓                               │
│  Layer 2: HTTPS Transport                           │
│  ┌────────────────────────────────────────────┐    │
│  │  • TLS 1.3 encryption                      │    │
│  │  • Secure token transmission               │    │
│  └────────────────────────────────────────────┘    │
│                      ↓                               │
│  Layer 3: Supabase Authentication                   │
│  ┌────────────────────────────────────────────┐    │
│  │  • JWT token validation                    │    │
│  │  • Session management                      │    │
│  │  • Password hashing (bcrypt)               │    │
│  └────────────────────────────────────────────┘    │
│                      ↓                               │
│  Layer 4: Row Level Security (RLS)                  │
│  ┌────────────────────────────────────────────┐    │
│  │  • User isolation                          │    │
│  │  • Policy enforcement                      │    │
│  │  • Data access control                     │    │
│  └────────────────────────────────────────────┘    │
│                      ↓                               │
│  Layer 5: Database Security                         │
│  ┌────────────────────────────────────────────┐    │
│  │  • Parameterized queries                   │    │
│  │  • SQL injection prevention                │    │
│  │  • Backup encryption                       │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Multi-Device Sync

```
    Device A                Supabase                Device B
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│              │       │              │       │              │
│  User plays  │       │              │       │              │
│  Lesson 1    │       │              │       │              │
│              │       │              │       │              │
└──────┬───────┘       └──────────────┘       └──────────────┘
       │
       │ 1. Complete lesson
       │    XP += 50
       ▼
┌──────────────┐
│ Local Update │
└──────┬───────┘
       │
       │ 2. Sync to cloud (30s)
       ▼
       ┌───────────────────────────────┐
       │                               ▼
┌──────────────┐               ┌──────────────┐
│              │               │   Database   │
│              │  3. UPDATE    │   profiles   │
│              │◀──────────────│   SET xp     │
└──────────────┘               └──────┬───────┘
                                      │
                               4. Store new data
                                      │
                                      ▼
                               ┌──────────────┐
                               │  XP: 50      │
                               │  Updated_at  │
                               └──────┬───────┘
                                      │
       ┌──────────────────────────────┘
       │ 5. User opens Device B
       ▼
┌──────────────┐               ┌──────────────┐
│              │               │              │
│  Sign In     │  6. Login     │  Fetch       │
│              │──────────────▶│  Profile     │
│              │               │              │
└──────────────┘               └──────┬───────┘
       ▲                              │
       │ 7. Return profile data       │
       │    XP: 50 (synced!)         │
       └──────────────────────────────┘
```

---

**Note:** All diagrams use ASCII art for universal compatibility. They represent the actual implementation in the codebase.

# Authentication System Testing Checklist

## Pre-Testing Setup

- [ ] Supabase project created
- [ ] Database tables created (run SQL from SUPABASE_SETUP.md)
- [ ] Environment variables configured
- [ ] env-inject.js created with valid credentials
- [ ] Supabase SDK loaded (check browser console)

## Test 1: Sign Up Flow

### Happy Path
- [ ] Navigate to `/auth/signup.html`
- [ ] Fill in all fields with valid data:
  - Full Name: "Test Student"
  - Username: "teststudent123"
  - Email: "test@example.com"
  - Password: "TestPass123"
  - Confirm Password: "TestPass123"
  - Accept Terms: checked
- [ ] Password strength indicator shows (weak/medium/strong)
- [ ] Click "Create Account"
- [ ] Success message appears
- [ ] Redirected to login page after 2 seconds
- [ ] Email confirmation sent (check inbox)

### Error Cases
- [ ] Empty fields show validation error
- [ ] Username < 3 chars shows error
- [ ] Username > 20 chars shows error
- [ ] Invalid email format shows error
- [ ] Password < 8 chars shows error
- [ ] Mismatched passwords show error
- [ ] Unchecked terms shows error
- [ ] Duplicate username shows error
- [ ] Duplicate email shows error

## Test 2: Sign In Flow

### Happy Path
- [ ] Navigate to `/auth/login.html`
- [ ] Enter valid credentials
- [ ] Check "Remember me" (optional)
- [ ] Click "Sign In"
- [ ] Success message appears
- [ ] Redirected to main app (index.html)
- [ ] User greeting appears in header
- [ ] Sign out button visible
- [ ] Profile link visible

### Error Cases
- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] Empty fields show error
- [ ] Network error handled gracefully

## Test 3: Session Persistence

- [ ] Sign in successfully
- [ ] Refresh the page
- [ ] User remains logged in
- [ ] Profile data still visible
- [ ] Game stats loaded from database

## Test 4: Profile Page

### View Profile
- [ ] Navigate to `/auth/profile.html`
- [ ] Profile header displays correctly:
  - Avatar emoji
  - Full name
  - Username
  - Level, XP, Coins stats
- [ ] Form fields populated with current data

### Update Profile
- [ ] Change full name
- [ ] Change username
- [ ] Click "Save Changes"
- [ ] Success message appears
- [ ] Changes reflected in header
- [ ] Refresh page - changes persist

### Error Cases
- [ ] Invalid username format shows error
- [ ] Duplicate username shows error
- [ ] Empty fields show error

## Test 5: Change Password

- [ ] Enter new password (min 8 chars)
- [ ] Confirm new password
- [ ] Click "Update Password"
- [ ] Success message appears
- [ ] Sign out
- [ ] Sign in with new password
- [ ] Login successful

### Error Cases
- [ ] Password < 8 chars shows error
- [ ] Mismatched passwords show error
- [ ] Empty fields show error

## Test 6: Password Reset

- [ ] Navigate to login page
- [ ] Click "Forgot your password?"
- [ ] Enter registered email
- [ ] Click reset
- [ ] Success message appears
- [ ] Check email for reset link
- [ ] Click reset link
- [ ] Enter new password
- [ ] Confirm new password
- [ ] Password updated successfully

### Error Cases
- [ ] Empty email shows error
- [ ] Non-existent email handled
- [ ] Invalid email format shows error

## Test 7: Sign Out

- [ ] Click "Sign Out" button
- [ ] Redirected to login page
- [ ] User info cleared from header
- [ ] Session cleared from localStorage
- [ ] Navigate to index.html (should redirect to login)

## Test 8: Data Synchronization

### Initial Sync
- [ ] Sign in
- [ ] Check profile stats match game stats
- [ ] Level displayed correctly
- [ ] XP displayed correctly
- [ ] Coins displayed correctly

### Progress Sync
- [ ] Complete a lesson in game
- [ ] Wait 30 seconds (auto-sync interval)
- [ ] Check Supabase dashboard
- [ ] Profile updated with new stats
- [ ] Refresh page
- [ ] Stats persist correctly

### Manual Sync Test
- [ ] Sign in on Device A
- [ ] Complete lessons, earn XP
- [ ] Wait for sync (30 sec)
- [ ] Sign out from Device A
- [ ] Sign in on Device B
- [ ] Progress transferred correctly
- [ ] All stats match

## Test 9: Protected Routes

### When Not Logged In
- [ ] Navigate to index.html
- [ ] Redirected to login (or guest mode message)
- [ ] Navigate to profile.html
- [ ] Redirected to login

### When Logged In
- [ ] All routes accessible
- [ ] No unexpected redirects
- [ ] User info visible

## Test 10: Delete Account

- [ ] Navigate to profile page
- [ ] Scroll to "Danger Zone"
- [ ] Click "Delete Account"
- [ ] First confirmation dialog appears
- [ ] Click OK
- [ ] Second confirmation dialog appears
- [ ] Click OK
- [ ] Prompt to type "DELETE"
- [ ] Type "DELETE" and submit
- [ ] Account deleted
- [ ] Redirected to login
- [ ] Can't log in with old credentials
- [ ] Profile removed from database

### Cancel Flow
- [ ] Start delete process
- [ ] Click Cancel on first dialog
- [ ] Account NOT deleted
- [ ] Still logged in

## Test 11: Browser Compatibility

Test on each browser:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

For each browser:
- [ ] Sign up works
- [ ] Sign in works
- [ ] Session persists
- [ ] Sign out works
- [ ] UI displays correctly

## Test 12: Mobile Responsiveness

Test on mobile devices (or browser dev tools):
- [ ] Forms are readable
- [ ] Buttons are tappable
- [ ] No horizontal scroll
- [ ] Text is legible
- [ ] All features work

## Test 13: Security Tests

### SQL Injection
- [ ] Try SQL in username: `admin' OR '1'='1`
- [ ] Try SQL in email: `test@test.com'; DROP TABLE users;--`
- [ ] System rejects malicious input

### XSS Protection
- [ ] Try script in username: `<script>alert('xss')</script>`
- [ ] Script not executed
- [ ] Displayed as text

### Session Security
- [ ] Copy session token from localStorage
- [ ] Open incognito window
- [ ] Paste token
- [ ] Token doesn't work (or expires quickly)

## Test 14: Error Recovery

### Network Issues
- [ ] Disconnect internet
- [ ] Try to sign in
- [ ] Appropriate error message
- [ ] Reconnect internet
- [ ] Sign in works

### Database Issues
- [ ] Simulate database down (pause Supabase project)
- [ ] Try to sign in
- [ ] Error handled gracefully
- [ ] User informed of issue
- [ ] Unpause project
- [ ] Sign in works again

## Test 15: Performance

- [ ] Page load times < 2 seconds
- [ ] Sign in completes < 1 second
- [ ] Sign up completes < 2 seconds
- [ ] Profile loads < 1 second
- [ ] No memory leaks (check dev tools)
- [ ] Smooth animations
- [ ] No janky scrolling

## Test 16: Accessibility

- [ ] Tab navigation works
- [ ] Screen reader labels present
- [ ] Focus indicators visible
- [ ] Error messages announced
- [ ] Color contrast sufficient
- [ ] Forms can be submitted with keyboard

## Test 17: Edge Cases

### Username Edge Cases
- [ ] 3 characters (minimum) - accepted
- [ ] 20 characters (maximum) - accepted
- [ ] 2 characters - rejected
- [ ] 21 characters - rejected
- [ ] Special characters - rejected (if policy)
- [ ] Spaces - rejected
- [ ] Unicode characters - test behavior

### Email Edge Cases
- [ ] Valid email formats accepted
- [ ] Invalid formats rejected
- [ ] Case insensitivity tested
- [ ] Plus addressing (test+1@email.com)

### Password Edge Cases
- [ ] 8 characters (minimum) - accepted
- [ ] 7 characters - rejected
- [ ] Very long password (100+ chars) - test
- [ ] Special characters - accepted
- [ ] Spaces - test behavior
- [ ] Emoji - test behavior

## Test 18: Concurrent Sessions

- [ ] Log in on Browser A
- [ ] Log in on Browser B (same account)
- [ ] Make changes on Browser A
- [ ] Changes sync to Browser B
- [ ] Sign out on Browser A
- [ ] Browser B detects sign out
- [ ] Browser B redirected to login

## Post-Testing Verification

### Database Check
- [ ] Open Supabase dashboard
- [ ] Check profiles table
- [ ] Test user exists
- [ ] Data is correct
- [ ] No duplicate entries
- [ ] Timestamps correct

### Console Check
- [ ] No JavaScript errors
- [ ] No console warnings (critical)
- [ ] API calls successful
- [ ] Proper logging

### Cleanup
- [ ] Delete test accounts
- [ ] Clear test data
- [ ] Reset database if needed

## Regression Testing

After any code changes:
- [ ] Re-run critical path tests (1, 2, 3, 7)
- [ ] Verify no existing features broken
- [ ] Check error handling still works

## Production Readiness Checklist

Before deploying:
- [ ] All tests pass
- [ ] Environment variables set in Netlify
- [ ] Email verification configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Database backups enabled
- [ ] Error monitoring setup
- [ ] Analytics integrated (optional)

## Notes

Record any issues found:

```
Issue: [Description]
Steps to Reproduce: [Steps]
Expected: [Expected behavior]
Actual: [Actual behavior]
Status: [Fixed/Pending]
```

## Test Results Summary

| Test Category | Pass | Fail | Notes |
|---------------|------|------|-------|
| Sign Up | ☐ | ☐ | |
| Sign In | ☐ | ☐ | |
| Session | ☐ | ☐ | |
| Profile | ☐ | ☐ | |
| Password | ☐ | ☐ | |
| Sign Out | ☐ | ☐ | |
| Data Sync | ☐ | ☐ | |
| Protected Routes | ☐ | ☐ | |
| Delete Account | ☐ | ☐ | |
| Browser Compat | ☐ | ☐ | |
| Mobile | ☐ | ☐ | |
| Security | ☐ | ☐ | |
| Error Recovery | ☐ | ☐ | |
| Performance | ☐ | ☐ | |
| Accessibility | ☐ | ☐ | |
| Edge Cases | ☐ | ☐ | |
| Concurrent | ☐ | ☐ | |

**Overall Status:** ☐ Pass ☐ Fail

**Tested By:** _______________

**Date:** _______________

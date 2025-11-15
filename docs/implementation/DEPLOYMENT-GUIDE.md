# DEPLOYMENT GUIDE

## Overview

This guide covers deploying the platform to production using Netlify and Supabase.

---

## Prerequisites

Before deploying:
- [ ] Supabase project created
- [ ] Database schema set up (see SUPABASE-SETUP.md)
- [ ] Netlify account created
- [ ] GitHub repository set up
- [ ] All tests passing

---

## Supabase Setup

### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: `7th-grade-pre-algebra-prod`
   - **Database Password**: Strong password (save in password manager)
   - **Region**: `us-east-1` (closest to Miami)
4. Wait for provisioning (~2 minutes)

### 2. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually via SQL Editor in Supabase Dashboard:

1. Go to **SQL Editor**
2. Copy/paste schema from SUPABASE-SETUP.md
3. Run each CREATE TABLE statement
4. Run RLS policies
5. Insert seed data (lessons, achievements)

### 3. Set Up Authentication

1. Go to **Authentication > Providers**
2. Enable **Email** provider
3. Configure email templates:
   - **Confirm signup**: Optional (can disable for easier student signup)
   - **Magic Link**: Optional (alternative to password)
4. Add allowed redirect URLs:
   - `https://7th-grade-pre-algebra.netlify.app/**`
   - `http://localhost:8888/**` (for local dev)

### 4. Configure Storage (Optional)

If storing user avatars or files:

1. Go to **Storage**
2. Create bucket: `avatars`
3. Set bucket policy: Public read, authenticated write

---

## Netlify Setup

### 1. Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Choose GitHub
4. Authorize Netlify
5. Select repository: `7th-PreAlgebra`

### 2. Configure Build Settings

```
Build command: echo '// No client-side API key needed - use serverless function' > env-inject.js
Publish directory: .
Functions directory: functions
```

### 3. Set Environment Variables

Go to **Site settings > Environment variables** and add:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Feature flags
ENABLE_WORD_PROBLEMS=true
ENABLE_ACHIEVEMENTS=true
```

**CRITICAL**: Never commit these to git. Only set in Netlify dashboard.

### 4. Deploy

Click **Deploy site**

Netlify will:
1. Clone your repository
2. Run build command
3. Deploy functions
4. Publish site
5. Assign URL: `https://random-name-12345.netlify.app`

### 5. Set Custom Domain (Optional)

1. Go to **Domain settings**
2. Add custom domain: `algebra.centner-academy.com`
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic, ~1 hour)

---

## Environment-Specific Configuration

### Development Environment

```javascript
// .env (local only, NOT committed)
SUPABASE_URL=https://dev-xxxxx.supabase.co
SUPABASE_ANON_KEY=dev_key_here
GEMINI_API_KEY=dev_key_here
```

### Staging Environment (Optional)

Create separate Netlify site for testing:

```
Site name: 7th-algebra-staging
Branch: develop
Environment variables: Same as production
```

### Production Environment

```
Site name: 7th-grade-pre-algebra
Branch: master
Environment variables: Production keys
```

---

## Deploy Workflow

### Automatic Deploys

Every push to `master` triggers automatic deploy:

```bash
# Make changes
git add .
git commit -m "feat: Add achievement system"
git push origin master

# Netlify automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys to production
# 4. Notifies via email (if configured)
```

### Manual Deploys

Via Netlify Dashboard:
1. Go to **Deploys**
2. Click **Trigger deploy** > **Deploy site**

Via CLI:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Preview Deploys

For pull requests, Netlify creates preview deployments:

1. Open PR on GitHub
2. Netlify automatically creates preview
3. Comment on PR with preview URL
4. Test changes before merging

---

## Database Migrations

### When to Run Migrations

- Adding new tables
- Changing table schemas
- Adding/modifying RLS policies
- Inserting seed data

### How to Run Migrations

**Option 1: Supabase CLI** (Recommended)

```bash
# Create migration file
supabase migration new add_new_feature

# Edit migration file in supabase/migrations/
# Add SQL statements

# Apply migration to local DB
supabase db push

# Deploy to production
supabase db push --db-url "your-production-url"
```

**Option 2: SQL Editor**

1. Go to Supabase Dashboard > SQL Editor
2. Paste SQL migration
3. Run query
4. Verify changes in Table Editor

### Migration Checklist

Before running in production:
- [ ] Test migration locally
- [ ] Backup database
- [ ] Run during low-traffic time
- [ ] Verify RLS policies still work
- [ ] Test application after migration

---

## Rollback Procedures

### Netlify Rollback

If deployment breaks production:

1. Go to **Deploys** in Netlify
2. Find last working deploy
3. Click **...** > **Publish deploy**
4. Confirm rollback

Or via CLI:
```bash
netlify rollback
```

### Database Rollback

If migration breaks database:

1. Restore from backup:
   ```bash
   supabase db dump --db-url "production-url" > backup.sql
   ```

2. Or manually revert changes in SQL Editor

**IMPORTANT**: Always test migrations in staging first!

---

## Monitoring & Alerts

### Netlify Monitoring

Built-in metrics:
- Deploy success/failure
- Build time
- Bandwidth usage
- Function invocations

Access: **Site overview** in Netlify dashboard

### Supabase Monitoring

Built-in metrics:
- Database connections
- Storage usage
- API requests
- Auth events

Access: **Settings > Usage** in Supabase dashboard

### Set Up Alerts

**Netlify**:
1. Go to **Site settings > Notifications**
2. Add email for deploy failures
3. Add Slack webhook (optional)

**Supabase**:
1. Go to **Settings > Alerts**
2. Configure alerts for:
   - High database load
   - Storage limits
   - API rate limits

### External Monitoring (Optional)

Use services like:
- **Uptime Robot**: Free uptime monitoring
- **Sentry**: Error tracking
- **LogRocket**: Session replay

---

## Security Checklist

Before going live:

- [ ] All API keys in environment variables (not code)
- [ ] Row Level Security enabled on all tables
- [ ] HTTPS enforced (automatic with Netlify)
- [ ] CORS configured correctly
- [ ] Rate limiting on serverless functions
- [ ] SQL injection prevention (Supabase handles this)
- [ ] XSS prevention (sanitize user input)
- [ ] CSP headers configured
- [ ] No sensitive data in client-side code
- [ ] Authentication required for sensitive operations

### Security Headers

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "no-referrer-when-downgrade"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;"
```

---

## Performance Optimization

### Frontend Optimizations

- Minify CSS/JS in production
- Lazy load images
- Use WebP images
- Enable CDN caching
- Compress assets (Netlify does this)

### Database Optimizations

- Index frequently queried columns
- Use connection pooling (Supabase does this)
- Optimize queries (use EXPLAIN)
- Archive old data

### Function Optimizations

- Minimize cold starts (keep functions small)
- Cache API responses
- Use async/await properly
- Set appropriate timeouts

---

## Backup Strategy

### Automated Backups

Supabase provides automatic daily backups (Pro plan).

### Manual Backups

```bash
# Backup database
supabase db dump --db-url "production-url" > backup_$(date +%Y%m%d).sql

# Backup environment variables (locally)
netlify env:list > env_backup.txt

# Store backups securely (e.g., encrypted cloud storage)
```

### Backup Schedule

- Daily: Automated Supabase backups
- Weekly: Manual full backup
- Before major changes: Manual backup

---

## Launch Checklist

### Pre-Launch

- [ ] All features tested
- [ ] All tests passing
- [ ] Database schema finalized
- [ ] Seed data loaded
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error tracking set up
- [ ] Monitoring configured
- [ ] Backup strategy in place

### Launch Day

- [ ] Final test of all flows
- [ ] Announce to students
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Be available for support

### Post-Launch

- [ ] Collect user feedback
- [ ] Monitor usage metrics
- [ ] Fix critical bugs immediately
- [ ] Plan improvements based on feedback

---

## Troubleshooting

### Common Issues

**Issue**: "Supabase connection failed"
**Solution**: Check environment variables are set correctly in Netlify

**Issue**: "Function timeout"
**Solution**: Increase timeout in `netlify.toml` or optimize function

**Issue**: "RLS policy blocking queries"
**Solution**: Verify user is authenticated, check policy matches userId

**Issue**: "Deploy failed"
**Solution**: Check build logs in Netlify dashboard, fix errors

**Issue**: "Database out of connections"
**Solution**: Enable connection pooling in Supabase, optimize queries

---

## Maintenance

### Regular Tasks

**Weekly**:
- Check error logs
- Monitor performance metrics
- Review user feedback

**Monthly**:
- Review and optimize slow queries
- Update dependencies
- Check for security updates

**Quarterly**:
- Review and archive old data
- Update documentation
- Plan new features

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Database connections > 80%
- Function invocations > 1M/month
- Storage > 80% of limit
- Page load time > 3 seconds

### How to Scale

**Supabase**:
- Upgrade to Pro plan (more connections, storage)
- Add read replicas (Supabase Enterprise)
- Optimize queries and indexes

**Netlify**:
- Upgrade plan (more builds, bandwidth)
- Enable edge functions
- Use CDN for static assets

**Application**:
- Implement caching
- Lazy load components
- Optimize images
- Use code splitting

---

## Cost Management

### Supabase Costs

Free tier includes:
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users

Pro tier ($25/month) includes:
- 8 GB database
- 100 GB file storage
- 100,000 monthly active users
- Daily backups

### Netlify Costs

Free tier includes:
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

Pro tier ($19/month) includes:
- 1 TB bandwidth/month
- 300 build minutes/month
- Advanced features

### Cost Optimization

- Use free tiers while possible
- Monitor usage to avoid overages
- Optimize queries to reduce database load
- Compress assets to reduce bandwidth
- Cache API responses

---

## Support & Resources

### Netlify Support

- Docs: https://docs.netlify.com
- Community: https://answers.netlify.com
- Status: https://netlifystatus.com

### Supabase Support

- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Status: https://status.supabase.com

### Emergency Contacts

Keep list of:
- Netlify support email
- Supabase support email
- Your hosting credentials
- Database backup locations

---

## Next Steps

Read these docs next:
1. **LESSON-IMPLEMENTATION.md** - How to build all 87 lessons

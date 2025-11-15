# Dashboard System - Complete Guide

## Overview

This comprehensive dashboard system provides detailed progress tracking for both students and teachers in the Equation Quest learning platform.

## Files Created

### HTML Pages
1. **dashboard.html** - Student dashboard (main view)
2. **teacher-dashboard.html** - Teacher dashboard (class overview)

### JavaScript Modules
3. **js/ui/dashboard.js** - Main dashboard logic and data loading
4. **js/ui/charts.js** - Chart.js visualization module
5. **js/utils/analytics.js** - Analytics calculations and insights

### Styling
6. **css/dashboard.css** - Complete dashboard styling (responsive, print-friendly)

### Netlify Functions
7. **functions/get-student-progress.js** - Student progress API endpoint
8. **functions/get-class-progress.js** - Class-wide data API endpoint

### Updates
9. **index.html** - Added "Dashboard" link in header navigation
10. **js/auth/auth-manager.js** - Added `isTeacher()` method for role checking

---

## Student Dashboard Features

### Main Sections

#### 1. Welcome Section
- Personalized greeting with student name
- Level badge with gradient styling
- XP progress bar showing current level progress
- Coins display with animated icon

#### 2. Stats Cards (4 cards)
- **Lessons Completed**: Shows progress out of 87 total lessons with progress bar
- **Current Streak**: Fire icon with streak days and motivational message
- **Total XP**: Total experience points earned
- **Achievements**: Number of achievements earned with link to achievements page

#### 3. Progress by Quarter
- 4 quarter cards (Q1-Q4) showing completion for each quarter
- Each card displays: Icon, Quarter name, Date range, Lessons completed, Progress bar
- Hover effects and animations

#### 4. Charts Section
Two side-by-side charts:
- **Progress Over Time**: Line chart showing cumulative lessons completed
- **Study Time**: Bar chart showing hours studied per week
- Period selector: 7 days / 30 days / 90 days / All time

#### 5. Activity Feed
- Last 10 activities with icons
- Shows lesson completions, achievements, perfect scores
- Real-time "time ago" formatting (e.g., "2h ago", "3d ago")
- Refresh button

#### 6. Upcoming Lessons
- Next 3 scheduled lessons
- Shows date, lesson number, and topic
- Calendar-style date badges

#### 7. Achievement Showcase
- Last 3 earned achievements
- Displays badge icon, name, and description
- Links to full achievements page

#### 8. Insights Section
Personalized insights based on performance:
- Success insights (green border): Great progress, high scores
- Info insights (blue border): Moderate progress, tips for improvement
- Warning insights (orange border): Areas needing attention

---

## Teacher Dashboard Features

### Main Sections

#### 1. Class Overview
4 overview cards showing:
- **Total Students**: Number of students in class
- **Average Completion**: Class average completion percentage
- **Average Score**: Class average score percentage
- **Active Today**: Number of students active today

#### 2. Struggling Students Alert
- Red alert section (only shown if students need attention)
- Lists students with:
  - Low scores (< 60%)
  - Inactive for 7+ days
  - Behind schedule (< expected completion rate)
- Each student shows specific reasons for concern

#### 3. Charts Section
Two charts:
- **Class Progress Over Time**: Dual-axis line chart showing lessons completed and average scores
- **Standards Mastery**: Horizontal bar chart showing average scores by standard (color-coded: red < 60%, yellow 60-80%, green > 80%)

#### 4. Student List Table
Sortable, searchable table with columns:
- Student Name
- Level
- Lessons Completed
- Average Score
- Current Streak
- Last Active
- Actions (View button)

Features:
- Search by student name
- Filter by quarter
- Sort by any column (ascending/descending)
- Click column headers to sort
- Pagination

#### 5. Quarter Breakdown
4 cards showing class performance by quarter:
- Average completion percentage
- Number of students who completed the quarter
- Visual progress bar

### Teacher Actions
- **Export Class Data**: Download CSV with all student data
- **Refresh Data**: Manual refresh of class statistics
- **View Student**: Modal with detailed student information

---

## Technical Implementation

### Data Flow

```
Student Dashboard:
1. dashboard.html loads
2. Auth check → redirect to login if not authenticated
3. Dashboard.init(userId) called
4. loadStudentData() → Fetch from API
5. Render all sections (stats, charts, activity, etc.)
6. Auto-refresh every 60 seconds

Teacher Dashboard:
1. teacher-dashboard.html loads
2. Auth check + teacher role check
3. Dashboard.initTeacherDashboard() called
4. loadClassData() → Fetch all students
5. Render class overview, table, alerts
6. Auto-refresh every 2 minutes
```

### API Endpoints

#### GET /.netlify/functions/get-student-progress?userId={userId}
Returns:
```json
{
  "profile": { /* user profile */ },
  "progress": [ /* array of lesson progress */ ],
  "achievements": [ /* array of achievements */ ],
  "stats": {
    "lessonsCompleted": 15,
    "totalLessons": 87,
    "completionRate": 17,
    "averageScore": 85,
    "totalXP": 750,
    "totalCoins": 150,
    "totalTime": 3600
  },
  "upcomingLessons": [ /* next 3 lessons */ ],
  "streakData": {
    "currentStreak": 7,
    "longestStreak": 10,
    "lastActivityDate": "2025-01-14"
  }
}
```

#### GET /.netlify/functions/get-class-progress
Returns:
```json
{
  "students": [ /* array of students with stats */ ],
  "classStats": {
    "totalStudents": 25,
    "avgCompletion": 45,
    "avgScore": 78,
    "activeToday": 12,
    "totalLessonsCompleted": 375,
    "avgStreak": 3
  },
  "strugglingStudents": [ /* students needing attention */ ]
}
```

### Analytics Module (window.Analytics)

Key functions:
- `calculateAverageScore(lessons)` - Calculate average percentage
- `calculateCompletionRate(total, completed)` - Calculate % complete
- `calculateStudyTime(sessions)` - Convert seconds to formatted time
- `identifyStrugglingStandards(lessons)` - Find standards < 70%
- `generateInsights(data)` - Create personalized insights
- `calculateQuarterProgress(lessons)` - Progress by quarter
- `getRecentActivity(activities, limit)` - Format activity feed
- `identifyStrugglingStudents(students)` - Find at-risk students
- `calculateClassStats(students)` - Aggregate class metrics

### Charts Module (window.Charts)

Chart types:
- `createProgressChart(canvasId, data)` - Line chart with gradient fill
- `createQuarterChart(canvasId, data)` - Bar chart by quarter
- `createStandardsChart(canvasId, data)` - Horizontal bars (color-coded)
- `createStudyTimeChart(canvasId, data)` - Weekly study hours
- `createClassProgressChart(canvasId, data)` - Dual-axis line chart

Features:
- Responsive (maintains aspect ratio)
- Interactive tooltips
- Custom color schemes
- Gradient fills
- Auto-resize on window resize

---

## Setup Instructions

### 1. Environment Variables

Add to `.env` (for local) and Netlify environment:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### 2. Supabase Setup

Required tables (already created via migrations):
- `profiles` - User profiles with XP, levels, streaks
- `progress` - Lesson progress tracking
- `achievements` / `user_achievements` - Achievement system
- `lessons` - Lesson metadata

### 3. Install Dependencies

For Netlify functions:
```bash
cd functions
npm install @supabase/supabase-js
```

### 4. Teacher Role Setup

To grant teacher access, update a user's profile:
```sql
UPDATE profiles
SET role = 'teacher'
WHERE email = 'teacher@example.com';
```

Then add the `role` column if it doesn't exist:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
```

### 5. Deploy

Push to GitHub → Netlify auto-deploys functions

---

## Usage Guide

### For Students

1. **Access Dashboard**: Click "📊 Dashboard" in header navigation
2. **View Progress**: See all stats, charts, and insights at a glance
3. **Check Streak**: Current streak displayed prominently
4. **Track Goals**: Quarter progress bars show completion
5. **Review Activity**: Recent completions and achievements
6. **Plan Ahead**: See upcoming lessons on schedule
7. **Export Report**: Click "Export Progress Report" to download PDF

### For Teachers

1. **Access Dashboard**: Navigate to `/teacher-dashboard.html`
2. **Class Overview**: View aggregate statistics
3. **Monitor Students**: Check student table, sort/filter as needed
4. **Identify Issues**: Red alert section shows struggling students
5. **Export Data**: Click "Export Class Data" for CSV download
6. **View Details**: Click "View" button for individual student modal
7. **Track Standards**: Check standards mastery chart for class-wide gaps

---

## Customization

### Color Scheme

Edit `css/dashboard.css` root variables:
```css
:root {
  --primary: #667eea;
  --success: #48bb78;
  --warning: #f6ad55;
  --danger: #f56565;
  --info: #4299e1;
}
```

### Chart Colors

Edit `js/ui/charts.js`:
```javascript
colors: {
  primary: '#667eea',
  secondary: '#764ba2',
  gradient: ['#667eea', '#764ba2', '#f6ad55', '#48bb78']
}
```

### Insights Logic

Edit `js/utils/analytics.js` `generateInsights()` function to customize thresholds and messages.

---

## Performance

### Optimization
- Charts lazy-load (only render when visible)
- Auto-refresh with throttling (60s for students, 120s for teachers)
- API responses cached for 60 seconds
- Images use lazy loading
- Minimal re-renders

### Loading States
- Full-page loading overlay on init
- Skeleton loaders for individual sections
- Spinners for refresh operations

---

## Responsive Design

### Breakpoints
- Desktop: 1400px max-width container
- Tablet: 768px - single column grid
- Mobile: Full-width, stacked layout

### Mobile Features
- Touch-friendly buttons
- Scrollable tables
- Collapsible sections
- Simplified charts

---

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast colors (WCAG AA compliant)
- Focus indicators
- Skip links

---

## Testing

### Student Dashboard
1. Open `/dashboard.html` as authenticated student
2. Verify all stats display correctly
3. Check charts render
4. Test activity feed
5. Verify upcoming lessons
6. Test insights generation

### Teacher Dashboard
1. Open `/teacher-dashboard.html` as teacher
2. Verify class stats
3. Check student table sorting/filtering
4. Test export functionality
5. Verify alerts for struggling students
6. Check standards chart

### Edge Cases
- New user (0 lessons)
- Perfect score student (100% average)
- Inactive student (no recent activity)
- Large class (100+ students)

---

## Troubleshooting

### Dashboard Not Loading
- Check browser console for errors
- Verify authentication (should redirect to login)
- Check Supabase connection
- Verify API endpoints are deployed

### Charts Not Rendering
- Verify Chart.js CDN loaded
- Check canvas elements exist
- Verify data format is correct
- Check browser console for errors

### Teacher Access Denied
- Verify user has `role = 'teacher'` in profiles table
- Check `isTeacher()` method in auth-manager.js
- Verify RLS policies allow teacher access

### Data Not Updating
- Check auto-refresh interval
- Manually click refresh button
- Verify API endpoints returning data
- Check Supabase RLS policies

---

## Future Enhancements

### Planned Features
- [ ] PDF export for progress reports
- [ ] Email notifications for milestones
- [ ] Goal setting (weekly lesson targets)
- [ ] Comparison charts (student vs class average)
- [ ] Historical data graphs (year-over-year)
- [ ] Parent dashboard view
- [ ] Mobile app integration
- [ ] Real-time updates (WebSocket)
- [ ] Advanced filtering (date ranges, standards)
- [ ] Customizable widgets (drag-and-drop)

### Analytics Improvements
- [ ] Predictive analytics (at-risk student detection)
- [ ] ML-powered insights
- [ ] A/B testing of lesson effectiveness
- [ ] Correlation analysis (time spent vs score)
- [ ] Engagement metrics (session duration, return rate)

---

## Support

For issues or questions:
1. Check this README
2. Review browser console errors
3. Check Supabase logs
4. Verify environment variables
5. Test with sample data

---

## Credits

**Dashboard System v1.0**
- Chart.js for data visualization
- Supabase for database
- Netlify for serverless functions
- Custom CSS with atomic design principles

**Created**: January 2025
**Last Updated**: January 2025

---

## License

Part of the Equation Quest learning platform.

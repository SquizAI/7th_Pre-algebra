# TECHNICAL ARCHITECTURE

## System Overview

This is a **serverless, JAMstack application** with:
- Static frontend (HTML/CSS/JS)
- Supabase backend (PostgreSQL + Auth)
- Netlify Functions for API proxying
- CDN delivery via Netlify

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  (Vanilla JS + Three.js + HTML/CSS)                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Game    │  │ Lesson   │  │  Three   │  │ Progress │   │
│  │Controller│  │Scheduler │  │   Viz    │  │ Tracker  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
                   │                      │
        ┌──────────▼──────────┐ ┌────────▼──────────┐
        │  Netlify Functions  │ │     Supabase      │
        │  (Serverless API)   │ │  (PostgreSQL +    │
        │                     │ │    Auth + RLS)    │
        │  - Gemini Proxy     │ │                   │
        │  - AI Features      │ │  - User Data      │
        └─────────────────────┘ │  - Progress       │
                                │  - Achievements   │
                                │  - Streaks        │
                                └───────────────────┘
```

---

## Frontend Architecture

### Core Principles
1. **Vanilla JS First**: No frameworks, minimal dependencies
2. **Progressive Enhancement**: Works without JS (basic content)
3. **Module Pattern**: Namespace collisions avoided with IIFE
4. **Event-Driven**: Controller pattern for screen navigation

### File Organization

```
/js/
├── /core/              # Core game logic
│   ├── game.js        # Main game controller (screens, state, events)
│   └── equations.js   # Equation generation and validation
│
├── /features/         # Feature modules
│   ├── adaptive-learning.js      # Difficulty adjustment
│   ├── animated-examples.js      # Step-by-step animations
│   ├── learning-workflow.js      # Video → Examples → Practice flow
│   ├── three-visualization.js    # 3D balance scale
│   ├── student-report.js         # Progress tracking UI
│   ├── standards-navigation.js   # Standard-based lesson navigation
│   ├── lesson-scheduler.js       # Date-based lesson unlocking
│   └── date-navigation.js        # Calendar integration
│
├── /utils/            # Utility modules
│   ├── step-solver.js            # Interactive step-by-step solver
│   ├── ai-client.js              # API client for Gemini proxy
│   └── gemini-helper.js          # Gemini integration helper
│
└── /config/
    └── schedule.js               # Lesson calendar configuration
```

### Load Order (Critical!)

Scripts must load in this specific order:

```html
<!-- 1. Environment variables (injected by Netlify build) -->
<script src="env-inject.js"></script>

<!-- 2. Core modules -->
<script src="js/core/equations.js"></script>

<!-- 3. Feature modules (no dependencies between these) -->
<script src="js/features/animated-examples.js"></script>
<script src="js/features/student-report.js"></script>
<script src="js/features/adaptive-learning.js"></script>
<script src="js/features/word-problem-generator.js"></script>

<!-- 4. Utilities -->
<script src="js/utils/step-solver.js"></script>
<script src="js/utils/ai-client.js"></script>

<!-- 5. Workflows -->
<script src="js/features/learning-workflow.js"></script>
<script src="js/features/standards-navigation.js"></script>

<!-- 6. Schedule config (must load before scheduler/navigation) -->
<script src="js/config/schedule.js"></script>
<script src="js/features/lesson-scheduler.js"></script>
<script src="js/features/date-navigation.js"></script>

<!-- 7. Main game controller (depends on everything above) -->
<script src="js/core/game.js"></script>

<!-- 8. Visualization (can be last) -->
<script src="js/features/three-visualization.js"></script>

<!-- 9. AI helpers (can be last) -->
<script src="js/utils/gemini-helper.js"></script>
```

### Global Namespace

To avoid conflicts, each module attaches to `window`:

```javascript
// In equations.js
window.EquationGenerator = { ... }

// In game.js
window.gameController = { ... }

// In schedule.js
window.ScheduleConfig = { ... }
```

**Rule**: Always check if `window[ModuleName]` exists before using it.

---

## Game Controller Pattern

The `gameController` in `game.js` manages all screens and state.

### Screen Management

```javascript
// Screens
const screens = {
  menu: document.getElementById('menuScreen'),
  tutorial: document.getElementById('tutorialScreen'),
  conceptIntro: document.getElementById('conceptIntroScreen'),
  videoLesson: document.getElementById('videoLessonScreen'),
  examples: document.getElementById('examplesScreen'),
  game: document.getElementById('gameScreen'),
  practice: document.getElementById('practiceScreen')
};

// Show a screen
gameController.showScreen('menu');
```

### State Management

```javascript
const gameState = {
  currentLevel: 1,
  playerXP: 0,
  playerCoins: 0,
  playerLevel: 1,
  currentQuestion: 0,
  totalQuestions: 5,
  correctAnswers: 0,
  streak: 0,
  completedLevels: [],

  // Lesson workflow state
  currentLessonNumber: null,
  videoWatched: false,
  examplesCompleted: false
};
```

### Event Flow

```
User Action (click button)
    ↓
Event Listener in game.js
    ↓
Update gameState
    ↓
Call feature module (e.g., EquationGenerator.generate())
    ↓
Update DOM
    ↓
Save to Supabase (future)
```

---

## Data Flow

### Current State (localStorage)

```javascript
// Save progress
localStorage.setItem('gameProgress', JSON.stringify(gameState));

// Load progress
const saved = localStorage.getItem('gameProgress');
if (saved) {
  Object.assign(gameState, JSON.parse(saved));
}
```

### Future State (Supabase)

```javascript
// Save progress
await supabase
  .from('user_progress')
  .upsert({
    user_id: user.id,
    lesson_number: currentLessonNumber,
    xp: playerXP,
    coins: playerCoins,
    completed_at: new Date()
  });

// Load progress
const { data } = await supabase
  .from('user_progress')
  .select('*')
  .eq('user_id', user.id)
  .order('lesson_number', { ascending: false });
```

---

## Supabase Integration

### Client Setup

```javascript
// In a new file: js/utils/supabase-client.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Authentication Flow

```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'student@email.com',
  password: 'securePassword123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'student@email.com',
  password: 'securePassword123'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Sign out
await supabase.auth.signOut();
```

### Row Level Security

All tables use RLS policies to ensure students only see their own data:

```sql
-- Example policy for user_progress table
CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);
```

---

## Lesson Scheduling System

### Schedule Configuration

Defined in `/js/config/schedule.js`:

```javascript
const ScheduleConfig = {
  scheduleType: 'MWF',  // or 'TTh'
  startDate: '2025-11-13',
  holidays: ['2025-11-27', '2025-12-25', ...],

  lessonToLevel: {
    1: 1,   // Lesson 1 → Level 1
    2: 2,   // Lesson 2 → Level 2
    // ... up to 87
  },

  lessonMetadata: {
    1: {
      name: 'Welcome to Algebra Castle',
      standard: 'MA.8.AR.2.1',
      topic: 'Two-Step Equations',
      videoId: '0ackz7dJSYY'
    },
    // ... metadata for all 87 lessons
  }
};
```

### Lesson Unlocking Logic

```javascript
// In lesson-scheduler.js

// Calculate which lesson should be available today
function getLessonForDate(date) {
  let lessonNumber = 0;
  let currentDate = new Date(ScheduleConfig.startDate);

  while (currentDate <= date) {
    if (ScheduleConfig.isClassDay(currentDate)) {
      lessonNumber++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return lessonNumber;
}

// Check if a lesson is unlocked
function isLessonUnlocked(lessonNumber) {
  const today = new Date();
  const availableLesson = getLessonForDate(today);
  return lessonNumber <= availableLesson;
}
```

---

## Equation Generation System

### Equation Types

Defined in `/js/core/equations.js`:

```javascript
const levelConfigs = [
  {
    id: 1,
    name: 'Two-Step Equations',
    types: ['two-step-basic'],
    difficulty: 'easy'
  },
  {
    id: 7,
    name: 'Distributive Property',
    types: ['distributive-property'],
    difficulty: 'medium'
  },
  {
    id: 10,
    name: 'Variables on Both Sides',
    types: ['both-sides'],
    difficulty: 'hard'
  }
  // ... more levels
];
```

### Generation Flow

```javascript
// 1. Pick random equation type for level
const level = levelConfigs.find(l => l.id === currentLevel);
const type = level.types[Math.floor(Math.random() * level.types.length)];

// 2. Generate equation
const equation = EquationGenerator.generate(type);
// Returns: { display: "3x + 5 = 20", answer: 5, steps: [...] }

// 3. Display to user
document.getElementById('equationDisplay').textContent = equation.display;

// 4. Validate student answer
const isCorrect = (studentAnswer === equation.answer);
```

---

## 3D Visualization System

Uses **Three.js** to render an interactive balance scale.

### Setup

```javascript
// In three-visualization.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Add to DOM
document.getElementById('threeContainer').appendChild(renderer.domElement);
```

### Balance Representation

```javascript
// Visualize equation: 3x + 5 = 20
function visualizeEquation(leftSide, rightSide) {
  // Left side: 3 cubes (x) + 5 spheres (constants)
  addCubes(leftPan, 3);
  addSpheres(leftPan, 5);

  // Right side: 20 spheres
  addSpheres(rightPan, 20);

  // Balance the scale
  updateBalance(leftWeight, rightWeight);
}
```

### User Interactions

```javascript
// Rotate view
controls = new THREE.OrbitControls(camera, renderer.domElement);

// Reset view
document.getElementById('resetVizBtn').addEventListener('click', () => {
  camera.position.set(0, 5, 10);
  controls.reset();
});
```

---

## Netlify Functions

Serverless functions proxy API calls to protect keys.

### Structure

```
/functions/
├── gemini-api.js      # Proxy for Gemini API
└── [future functions]
```

### Gemini Proxy Example

```javascript
// /functions/gemini-api.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get API key from environment
  const apiKey = process.env.GEMINI_API_KEY;

  // Parse request
  const { prompt } = JSON.parse(event.body);

  // Call Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
```

### Client Usage

```javascript
// In js/utils/ai-client.js
async function callGemini(prompt) {
  const response = await fetch('/.netlify/functions/gemini-api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  return await response.json();
}
```

---

## CSS Architecture

### Atomic CSS System

Located in `/css/main.css`. Uses utility classes:

```css
/* Spacing */
.mb-4 { margin-bottom: 1rem; }
.p-6 { padding: 1.5rem; }

/* Layout */
.flex { display: flex; }
.grid { display: grid; }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }

/* Typography */
.text-lg { font-size: 1.125rem; }
.font-bold { font-weight: 700; }

/* Colors */
.bg-primary { background: var(--color-primary); }
.text-white { color: white; }
```

### Legacy Styles

Located in `/css/styles.css`. Component-specific styles:

```css
.game-header { /* ... */ }
.equation-panel { /* ... */ }
.tutorial-card { /* ... */ }
```

**Rule**: New components should use atomic CSS. Legacy styles remain for backwards compatibility.

---

## Build & Deployment

### Netlify Configuration

```toml
# netlify.toml
[build]
  publish = "."
  command = "echo '// No client-side API key needed - use serverless function' > env-inject.js"
  functions = "functions"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer-when-downgrade"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Environment Variables

Set in Netlify dashboard:
- `GEMINI_API_KEY`: API key for Gemini
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

### Build Process

```bash
# Install dependencies
npm install

# Run tests
npm test

# Deploy to Netlify (automatic on git push)
git push origin master
```

---

## Security Best Practices

### API Key Protection
- NEVER commit API keys to git
- Store in Netlify environment variables
- Proxy through serverless functions
- Rotate keys if exposed

### Client-Side Security
- Validate all user input
- Sanitize displayed content
- Use HTTPS only
- Implement CSP headers

### Database Security
- Row Level Security on all tables
- Parameterized queries (Supabase handles this)
- No direct database access from client
- Audit logs for sensitive operations

---

## Performance Optimization

### Frontend
- Minimize DOM manipulations
- Debounce user input
- Lazy load Three.js scenes
- Cache equation generations

### Backend
- Index frequently queried columns
- Use Supabase connection pooling
- Cache static assets via CDN
- Minimize serverless function cold starts

### Assets
- Optimize images (WebP format)
- Minify CSS/JS in production
- Use system fonts when possible
- Lazy load YouTube iframes

---

## Browser Support

**Target**: Modern browsers (last 2 versions)
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile**: iOS Safari 14+, Chrome Android 90+

**Not Supported**: IE11 (EOL)

---

## Development Workflow

### Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run local dev server (includes functions)
netlify dev

# Access at http://localhost:8888
```

### Hot Reload

Netlify Dev watches for file changes and auto-reloads.

### Testing Functions Locally

```bash
# Functions available at:
http://localhost:8888/.netlify/functions/gemini-api
```

---

## Error Handling

### Frontend Errors

```javascript
try {
  const equation = EquationGenerator.generate(type);
} catch (error) {
  console.error('Equation generation failed:', error);
  showErrorMessage('Oops! Something went wrong. Try again.');
}
```

### API Errors

```javascript
async function fetchWithRetry(url, options, retries = 3) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}
```

### User-Friendly Messages

```javascript
const errorMessages = {
  'network': 'Check your internet connection and try again.',
  'server': 'Our servers are having trouble. Try again in a minute.',
  'validation': 'Please check your answer and try again.',
  'unknown': 'Something went wrong. Refresh the page.'
};
```

---

## Next Steps

Read these docs next:
1. **SUPABASE-SETUP.md** - Database schema and setup
2. **FEATURES.md** - Feature specifications
3. **BUILD-GUIDE.md** - How to build components

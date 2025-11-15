# Tests

This folder contains all test files for the 8th Grade Pre-Algebra platform.

## Folder Structure

```
/tests/
├── /integration/    - Integration test scripts (12 files)
├── /debug/          - Debug scripts and helpers (3 files)
├── /html/           - HTML test pages (3 files)
├── /screenshots/    - Test screenshots
└── /unit/           - Unit tests (coming soon)
```

## Integration Tests (`/integration/`)

Tests for full workflows and feature integration:
- **test-3d-*.js** - Three.js visualization tests
- **test-back-buttons.js** - Navigation testing
- **test-returning-user.js** - Session persistence
- **test-word-problem.js** - Word problem functionality
- Various back button tests

## Debug Scripts (`/debug/`)

Helper scripts for debugging:
- **debug-word-problem*.js** - Word problem debugging
- **gemini-debug.json** - Gemini API debugging data

## HTML Test Pages (`/html/`)

Standalone test pages:
- **test-lesson-player.html** - Lesson player testing
- **test-rewards.html** - Rewards system testing
- **test-skill-tree.html** - Skill tree UI testing

## Running Tests

### Manual Tests
```bash
# Open HTML test pages in browser
open tests/html/test-lesson-player.html
```

### Integration Tests
```bash
# Run specific test
node tests/integration/test-word-problem.js
```

### E2E Tests (Playwright)
```bash
# Coming soon - full E2E test suite
npx playwright test
```

## Test Coverage Goals

- [ ] 80% code coverage
- [ ] All critical paths tested
- [ ] Automated CI/CD testing
- [ ] Performance benchmarks

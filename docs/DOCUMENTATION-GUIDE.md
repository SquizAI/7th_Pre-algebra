# Documentation Management Guide

**Last Updated**: 2025-01-15

---

## Documentation Folder Structure

```
docs/
├── archive/                    # Archived/outdated documentation
│   ├── 2025-01/               # Monthly archive folders
│   ├── 2025-02/
│   └── README.md
├── implementation/            # Implementation guides (active)
├── features/                  # Feature documentation (active)
├── curriculum/                # Curriculum and lesson data (active)
├── testing/                   # Test reports and results (active)
└── [Current active docs]      # Root-level current documentation
```

---

## Archive Rules

### When to Archive

Archive a document when:
1. **Replaced** - A newer version supersedes it
2. **Outdated** - Information is no longer accurate
3. **Completed** - Task/feature is finished and documented elsewhere
4. **Deprecated** - Feature/approach was abandoned

### When NOT to Archive

Keep documents active if:
1. **Reference Material** - Still needed for development
2. **Curriculum Data** - Lesson plans, standards, schedules
3. **Active Features** - Implementation still in use
4. **Testing Guides** - Current testing procedures

---

## Archive Process

### Manual Process

```bash
# 1. Move old file to archive with timestamp
mv docs/OLD-FILE.md docs/archive/2025-01/OLD-FILE_archived-2025-01-15.md

# 2. Update any links to archived file
grep -r "OLD-FILE.md" docs/ --exclude-dir=archive

# 3. Add entry to archive README
echo "- [OLD-FILE.md](2025-01/OLD-FILE_archived-2025-01-15.md) - Replaced by NEW-FILE.md" >> docs/archive/README.md
```

### Automated Script

```bash
# Use the docs-archive.sh script
./scripts/docs-archive.sh docs/OLD-FILE.md "Replaced by NEW-FILE.md"
```

---

## Current Active Documents

### Implementation Guides (docs/implementation/)
- `PROJECT-OVERVIEW.md` - High-level project summary
- `ARCHITECTURE.md` - System architecture
- `FEATURES.md` - Feature specifications
- `SUPABASE-SETUP.md` - Database setup guide
- `BUILD-GUIDE.md` - Build and deployment
- `TESTING-GUIDE.md` - Testing procedures
- `DEPLOYMENT-GUIDE.md` - Deployment steps
- `LESSON-IMPLEMENTATION.md` - Lesson creation guide

### Feature Documentation (docs/features/)
- Feature-specific guides and implementation details

### System Status (docs/)
- `SYSTEM-ARCHITECTURE-STATUS.md` - **CURRENT** - System status with Mermaid flowchart
- `DOCUMENTATION-GUIDE.md` - **THIS FILE** - Documentation management

### Authentication (docs/)
- `AUTH_README.md` - Authentication system overview
- `AUTH_QUICK_START.md` - Quick start guide
- `AUTH_FLOW_DIAGRAM.md` - Flow diagrams
- `AUTH_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `AUTH_TESTING.md` - Testing guide

### Achievements (docs/)
- `ACHIEVEMENT-SYSTEM-GUIDE.md` - Complete guide
- `ACHIEVEMENT-QUICKSTART.md` - Quick reference

### Streaks (docs/)
- `STREAK_README.md` - Streak system overview
- `STREAK_IMPLEMENTATION.md` - Implementation guide
- `STREAK_VISUAL_GUIDE.md` - Visual reference
- `STREAK_SYSTEM_TEST.md` - Testing guide

### XP/Coins (docs/)
- `XP-COINS-SYSTEM.md` - System overview
- `XP-COINS-IMPLEMENTATION.md` - Implementation guide

### Lesson Player (docs/)
- `LESSON-PLAYER-GUIDE.md` - Complete guide
- `LESSON-PLAYER-SUMMARY.md` - Quick reference

### Curriculum Data (docs/curriculum/ or docs/)
- `8th_BEST_math_standards_2025_PRE_ALGEBRA.json` - All 42 standards
- `Q1_8th_grade_detailed_lessons.json` - Lessons 1-19
- `Q2_8th_grade_detailed_lessons.json` - Lessons 20-44
- `Q3_8th_grade_detailed_lessons.json` - Lessons 45-66
- `Q4_8th_grade_detailed_lessons.json` - Lessons 67-87
- `lesson_calendar_B_days_2025-2026.json` - Date mapping
- `24 - 25 MS_HS Academic Calendar Expanded - 25-26 A_B Schedule 2.csv` - School calendar

### Supabase (docs/)
- `SUPABASE_SETUP.md` - Setup instructions
- `SUPABASE-STEP-BY-STEP.md` - Step-by-step guide
- `SUPABASE-URL-CONFIG.md` - URL configuration

---

## Files to Archive (Candidates)

### Deployment Reports (Single-Use)
These were status reports at specific moments in time - archive once replaced:
- `BACKEND-INTEGRATION-COMPLETE.md` → Archive (superseded by SYSTEM-ARCHITECTURE-STATUS.md)
- `DEPLOYMENT-COMPLETE-FINAL.md` → Archive (superseded by SYSTEM-ARCHITECTURE-STATUS.md)
- `DEPLOYMENT-READY.md` → Archive (superseded by SYSTEM-ARCHITECTURE-STATUS.md)
- `DEPLOYMENT-TEST-REPORT.md` → Archive (superseded by testing/ folder)
- `LESSON-CONTENT-STATUS.md` → Keep (useful reference, may update)

### Root-Level Markdown Files
- `README.md` (root) → Keep (project entry point)
- `docs/README.md` → Update with current doc index

---

## Archive Index Template

Each archive folder should have a `README.md`:

```markdown
# Archive - January 2025

Documents archived in January 2025.

## Deployment Reports
- [BACKEND-INTEGRATION-COMPLETE.md](BACKEND-INTEGRATION-COMPLETE_archived-2025-01-15.md)
  - **Reason**: Superseded by SYSTEM-ARCHITECTURE-STATUS.md
  - **Date**: 2025-01-15
  - **Replacement**: docs/SYSTEM-ARCHITECTURE-STATUS.md

- [DEPLOYMENT-COMPLETE-FINAL.md](DEPLOYMENT-COMPLETE-FINAL_archived-2025-01-15.md)
  - **Reason**: Superseded by SYSTEM-ARCHITECTURE-STATUS.md
  - **Date**: 2025-01-15
  - **Replacement**: docs/SYSTEM-ARCHITECTURE-STATUS.md
```

---

## Best Practices

### Naming Conventions
- **Active Docs**: `FEATURE-NAME.md` (all caps, hyphens)
- **Archived Docs**: `FEATURE-NAME_archived-YYYY-MM-DD.md`
- **Archive Folders**: `YYYY-MM/` (year-month)

### File Organization
1. **Root docs/** - High-level, cross-cutting documentation
2. **docs/implementation/** - Implementation guides
3. **docs/features/** - Feature-specific docs
4. **docs/curriculum/** - Curriculum data (never archive)
5. **docs/testing/** - Test reports (archive monthly)
6. **docs/archive/** - Outdated/replaced docs

### Version Control
- Archive files are still tracked in git
- Don't delete, just move to archive
- Update links when archiving
- Add archive entry to README

---

## Quick Commands

```bash
# List all markdown files in docs root (candidates for archival)
ls -1 docs/*.md

# Find large old files (>30 days)
find docs/ -name "*.md" -mtime +30 -size +50k

# Search for broken links after archiving
grep -r "](docs/" docs/ --exclude-dir=archive | grep "\.md"

# Create monthly archive folder
mkdir -p docs/archive/$(date +%Y-%m)
```

---

## Maintenance Schedule

- **Weekly**: Review new docs in root, move to appropriate subfolder
- **Monthly**: Archive outdated deployment/test reports
- **Quarterly**: Review and consolidate feature docs
- **Yearly**: Clean up old archives (move to separate repo if needed)

---

**End of Documentation Guide**

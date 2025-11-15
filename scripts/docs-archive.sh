#!/bin/bash
#
# Documentation Archive Script
# Usage: ./scripts/docs-archive.sh <file-path> <reason>
# Example: ./scripts/docs-archive.sh docs/OLD-FILE.md "Replaced by NEW-FILE.md"
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -lt 2 ]; then
    echo -e "${RED}Error: Missing arguments${NC}"
    echo "Usage: $0 <file-path> <reason>"
    echo "Example: $0 docs/OLD-FILE.md 'Replaced by NEW-FILE.md'"
    exit 1
fi

FILE_PATH="$1"
REASON="$2"
CURRENT_DATE=$(date +%Y-%m-%d)
CURRENT_MONTH=$(date +%Y-%m)

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}Error: File not found: $FILE_PATH${NC}"
    exit 1
fi

# Extract filename
FILENAME=$(basename "$FILE_PATH")
BASENAME="${FILENAME%.*}"
EXTENSION="${FILENAME##*.}"

# Create archive folder for current month
ARCHIVE_DIR="docs/archive/$CURRENT_MONTH"
mkdir -p "$ARCHIVE_DIR"

# New filename with archive date
ARCHIVED_FILENAME="${BASENAME}_archived-${CURRENT_DATE}.${EXTENSION}"
ARCHIVE_PATH="$ARCHIVE_DIR/$ARCHIVED_FILENAME"

# Move file to archive
echo -e "${YELLOW}Archiving: $FILE_PATH${NC}"
echo -e "${YELLOW}       To: $ARCHIVE_PATH${NC}"
mv "$FILE_PATH" "$ARCHIVE_PATH"

# Update archive README
ARCHIVE_README="$ARCHIVE_DIR/README.md"
if [ ! -f "$ARCHIVE_README" ]; then
    # Create new archive README
    cat > "$ARCHIVE_README" << EOF
# Archive - $(date +"%B %Y")

Documents archived in $(date +"%B %Y").

---

EOF
fi

# Add entry to archive README
cat >> "$ARCHIVE_README" << EOF
## $FILENAME
- **File**: [$ARCHIVED_FILENAME]($ARCHIVED_FILENAME)
- **Reason**: $REASON
- **Archived**: $CURRENT_DATE

EOF

echo -e "${GREEN}✅ File archived successfully!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Next steps:${NC}"
echo "1. Search for references to this file:"
echo "   grep -r '$FILENAME' docs/ --exclude-dir=archive"
echo ""
echo "2. Update any broken links"
echo ""
echo "3. Commit changes:"
echo "   git add docs/archive/$CURRENT_MONTH/"
echo "   git commit -m '📦 Archive $FILENAME - $REASON'"

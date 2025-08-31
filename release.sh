#!/bin/bash

# Release script for WhatsApp Clone Vibe Code
# This script creates a new version release on GitHub

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting release process...${NC}"

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"

# Ask user for release type
echo -e "${BLUE}What type of release is this?${NC}"
echo "1) Patch (bug fixes) - v1.0.1"
echo "2) Minor (new features) - v1.1.0"
echo "3) Major (breaking changes) - v2.0.0"
echo "4) Custom version"
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        # Increment patch version
        NEW_VERSION=$(node -e "
            const version = '${CURRENT_VERSION}'.split('.');
            version[2] = parseInt(version[2]) + 1;
            console.log(version.join('.'));
        ")
        RELEASE_TYPE="patch"
        ;;
    2)
        # Increment minor version
        NEW_VERSION=$(node -e "
            const version = '${CURRENT_VERSION}'.split('.');
            version[1] = parseInt(version[1]) + 1;
            version[2] = 0;
            console.log(version.join('.'));
        ")
        RELEASE_TYPE="minor"
        ;;
    3)
        # Increment major version
        NEW_VERSION=$(node -e "
            const version = '${CURRENT_VERSION}'.split('.');
            version[0] = parseInt(version[0]) + 1;
            version[1] = 0;
            version[2] = 0;
            console.log(version.join('.'));
        ")
        RELEASE_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., v1.2.3): " NEW_VERSION
        RELEASE_TYPE="custom"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

# Update package.json version
npm version $NEW_VERSION --no-git-tag-version

# Get release notes
echo -e "${BLUE}Enter release notes (press Enter when done):${NC}"
echo "You can use markdown formatting."
echo "Type 'END' on a new line when finished:"
RELEASE_NOTES=""
while IFS= read -r line; do
    if [ "$line" = "END" ]; then
        break
    fi
    RELEASE_NOTES="${RELEASE_NOTES}${line}"$'\n'
done

# Commit the version change
git add package.json
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create git tag
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

# Push changes and tag
echo -e "${YELLOW}Pushing changes to GitHub...${NC}"
git push origin main
git push origin "v${NEW_VERSION}"

# Create GitHub release
echo -e "${YELLOW}Creating GitHub release...${NC}"
gh release create "v${NEW_VERSION}" \
    --title "Release v${NEW_VERSION}" \
    --notes "$RELEASE_NOTES" \
    --latest

echo -e "${GREEN}✅ Release v${NEW_VERSION} created successfully!${NC}"
echo -e "${BLUE}📦 Release URL: https://github.com/Rishabh32700/whatsapp-clone-vibe-code/releases/tag/v${NEW_VERSION}${NC}"

# Show recent releases
echo -e "${YELLOW}Recent releases:${NC}"
gh release list --limit 5

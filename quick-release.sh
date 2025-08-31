#!/bin/bash

# Quick Release script for WhatsApp Clone Vibe Code
# Usage: ./quick-release.sh [patch|minor|major|custom-version]

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Quick Release Process${NC}"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${YELLOW}Current version: ${CURRENT_VERSION}${NC}"

# Check if version type is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./quick-release.sh [patch|minor|major|custom-version]${NC}"
    echo "Examples:"
    echo "  ./quick-release.sh patch    # v1.0.0 -> v1.0.1"
    echo "  ./quick-release.sh minor    # v1.0.0 -> v1.1.0"
    echo "  ./quick-release.sh major    # v1.0.0 -> v2.0.0"
    echo "  ./quick-release.sh v1.2.3   # Custom version"
    exit 1
fi

VERSION_TYPE=$1

# Determine new version
if [ "$VERSION_TYPE" = "patch" ]; then
    NEW_VERSION=$(node -e "
        const version = '${CURRENT_VERSION}'.split('.');
        version[2] = parseInt(version[2]) + 1;
        console.log(version.join('.'));
    ")
elif [ "$VERSION_TYPE" = "minor" ]; then
    NEW_VERSION=$(node -e "
        const version = '${CURRENT_VERSION}'.split('.');
        version[1] = parseInt(version[1]) + 1;
        version[2] = 0;
        console.log(version.join('.'));
    ")
elif [ "$VERSION_TYPE" = "major" ]; then
    NEW_VERSION=$(node -e "
        const version = '${CURRENT_VERSION}'.split('.');
        version[0] = parseInt(version[0]) + 1;
        version[1] = 0;
        version[2] = 0;
        console.log(version.join('.'));
    ")
else
    # Custom version
    NEW_VERSION=$VERSION_TYPE
fi

echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

# Update package.json version
npm version $NEW_VERSION --no-git-tag-version

# Generate release notes based on git commits since last tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -z "$LAST_TAG" ]; then
    RELEASE_NOTES="Initial release of WhatsApp Clone Vibe Code

## Features
- Real-time chat functionality
- User authentication and registration
- Friend request system
- Modern React + TypeScript frontend
- Node.js + MongoDB backend
- Socket.io for real-time communication"
else
    RELEASE_NOTES="## What's Changed

$(git log --oneline ${LAST_TAG}..HEAD | sed 's/^/- /')

## Release Type: $VERSION_TYPE"
fi

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

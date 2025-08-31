# Release Guide for WhatsApp Clone Vibe Code

This guide explains how to create version releases for your WhatsApp Clone project.

## 🚀 Quick Start

### Option 1: Interactive Release (Recommended for major changes)
```bash
npm run release
```
This will guide you through:
- Choosing release type (patch/minor/major/custom)
- Writing release notes
- Creating GitHub release

### Option 2: Quick Releases (For frequent updates)
```bash
# Patch release (bug fixes) - v1.0.0 → v1.0.1
npm run release:patch

# Minor release (new features) - v1.0.0 → v1.1.0
npm run release:minor

# Major release (breaking changes) - v1.0.0 → v2.0.0
npm run release:major
```

### Option 3: Direct Script Usage
```bash
# Interactive release
./release.sh

# Quick release with custom version
./quick-release.sh v1.2.3
```

## 📋 Release Types

### Patch Release (v1.0.0 → v1.0.1)
- **Use for**: Bug fixes, small improvements
- **Command**: `npm run release:patch`
- **When**: After fixing bugs or making minor improvements

### Minor Release (v1.0.0 → v1.1.0)
- **Use for**: New features, enhancements
- **Command**: `npm run release:minor`
- **When**: Adding new features that don't break existing functionality

### Major Release (v1.0.0 → v2.0.0)
- **Use for**: Breaking changes, major updates
- **Command**: `npm run release:major`
- **When**: Making changes that break backward compatibility

## 🔄 Release Process

The release scripts automatically:

1. **Update version** in `package.json`
2. **Generate release notes** from git commits
3. **Create git tag** with the new version
4. **Push changes** to GitHub
5. **Create GitHub release** with notes and assets
6. **Mark as latest** release

## 📝 Writing Good Release Notes

### For Interactive Releases
When prompted, write clear, concise release notes:

```markdown
## What's New
- Added dark mode support
- Improved chat performance
- Fixed message delivery issues

## Bug Fixes
- Fixed user avatar not loading
- Resolved chat history pagination

## Breaking Changes
- Updated API endpoints (see migration guide)
```

### For Quick Releases
Release notes are automatically generated from git commits since the last release.

## 🏷️ Version Naming Convention

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., v1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 🔧 Manual Release Process

If you prefer to do it manually:

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Commit changes
git add package.json
git commit -m "chore: bump version to v1.0.1"

# 3. Create and push tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin main
git push origin v1.0.1

# 4. Create GitHub release
gh release create v1.0.1 --title "Release v1.0.1" --notes "Your release notes"
```

## 📊 Release History

View all releases at: https://github.com/Rishabh32700/whatsapp-clone-vibe-code/releases

## 🚨 Troubleshooting

### Common Issues

1. **GitHub CLI not authenticated**
   ```bash
   gh auth login
   ```

2. **Permission denied on scripts**
   ```bash
   chmod +x release.sh quick-release.sh
   ```

3. **No changes to commit**
   - Make sure you have changes in your working directory
   - Check git status: `git status`

4. **Tag already exists**
   - Delete the tag: `git tag -d v1.0.1`
   - Push deletion: `git push origin :refs/tags/v1.0.1`
   - Run release script again

### Getting Help

- Check GitHub CLI documentation: `gh help`
- View script help: `./quick-release.sh` (without arguments)
- Check release status: `gh release list`

## 🎯 Best Practices

1. **Always test** before releasing
2. **Write clear release notes** explaining changes
3. **Use appropriate version types** (patch/minor/major)
4. **Review the release** on GitHub after creation
5. **Keep releases frequent** for better project tracking

## 📈 Release Automation

For even more automation, consider:
- GitHub Actions for automated releases
- Conventional commits for automatic changelog generation
- Release drafter for better release notes

---

**Happy Releasing! 🎉**

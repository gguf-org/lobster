# Build Fix Guide

## Issue
The original build had a version compatibility issue between webpack and ts-loader.

## Solution
The build system has been updated with two options:

### Option 1: esbuild (Recommended - Faster & Simpler)

```bash
cd lobster-game-extension
rm -rf node_modules package-lock.json  # Clean install
npm install
npm run compile
```

This now uses **esbuild** instead of webpack, which is:
- ✅ Faster
- ✅ No version conflicts
- ✅ Simpler configuration

### Option 2: webpack (If you prefer webpack)

```bash
npm run compile-webpack
```

## What Changed

1. **package.json**: 
   - Added `esbuild` as dependency
   - Updated TypeScript to 5.3.3
   - Added `build-webview.js` script using esbuild
   - Changed default `compile` to use esbuild

2. **build-webview.js**: New file that uses esbuild to bundle the webview

3. **webpack.config.js**: Improved configuration with better options

## Build Commands

```bash
# Full build (extension + webview with esbuild)
npm run compile

# Full build with webpack
npm run compile-webpack

# Only webview with esbuild
npm run build-webview

# Only webview with webpack
npm run webpack

# Watch mode for extension
npm run watch

# Watch mode for webview (webpack)
npm run webpack-dev
```

## Verify Build Success

After running `npm run compile`, check:

```bash
ls -la out/
```

You should see:
```
out/
├── extension.js
├── extension.js.map
├── gamePanel.js
├── gamePanel.js.map
├── commandExecutor.js
├── commandExecutor.js.map
└── webview/
    ├── game.js
    └── game.js.map
```

## Next Steps

1. Run `npm install` (clean install)
2. Run `npm run compile`
3. Press **F5** in VSCode to launch

## Troubleshooting

### Still getting errors?

**Clean everything:**
```bash
rm -rf node_modules package-lock.json out
npm install
npm run compile
```

**Check Node version:**
```bash
node --version  # Should be v16 or higher
```

**Manual build steps:**
```bash
# Step 1: Compile extension TypeScript
npx tsc -p ./

# Step 2: Bundle webview with esbuild
node build-webview.js

# Or with webpack:
npx webpack --mode development
```

### esbuild not found?

```bash
npm install esbuild --save-dev
```

### TypeScript errors?

```bash
npm install typescript@5.3.3 --save-dev
```

## Performance Comparison

| Build Tool | Speed | Bundle Size | Setup |
|------------|-------|-------------|-------|
| esbuild | ⚡ Very Fast | ~500KB | Simple |
| webpack | 🐢 Slower | ~500KB | Complex |

Both produce working bundles - esbuild is recommended for faster iteration during development.

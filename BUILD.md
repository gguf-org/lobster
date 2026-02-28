# Build and Installation Guide

## Quick Start

```bash
cd lobster-game-extension
npm install
npm run compile
```

Then press **F5** in VSCode to launch the extension in a new window.

## Detailed Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- VSCode extension API types
- TypeScript compiler
- Webpack and ts-loader (for bundling the game)
- Three.js (for 3D graphics)

### 2. Compile the Extension

```bash
npm run compile
```

This command does two things:
- Compiles the extension code (src/extension.ts, src/gamePanel.ts, src/commandExecutor.ts) to JavaScript
- Bundles the webview game code (src/webview/**) using webpack

Output files:
- `out/extension.js` - Extension entry point
- `out/gamePanel.js` - Webview panel manager
- `out/commandExecutor.js` - Command execution logic
- `out/webview/game.js` - Bundled 3D game (includes Three.js)

### 3. Launch the Extension

**Option A: Debug Mode (Recommended for Development)**
1. Open the `lobster-game-extension` folder in VSCode
2. Press **F5** (or Run > Start Debugging)
3. A new VSCode window will open with the extension loaded
4. Click the lobster icon in the status bar (bottom right)

**Option B: Package and Install**
```bash
# Install vsce (VSCode Extension Manager)
npm install -g @vscode/vsce

# Package the extension
vsce package

# Install the .vsix file
code --install-extension lobster-game-extension-0.1.0.vsix
```

## Development Workflow

### Watch Mode

For continuous development:

```bash
# Terminal 1: Watch extension code
npm run watch

# Terminal 2: Watch webview code
npm run webpack-dev
```

This will automatically recompile when you make changes.

### Testing Changes

After making changes:
1. In the Extension Development Host window, press **Ctrl+R** (Cmd+R on Mac) to reload
2. Or close and reopen the game panel

## Project Structure

```
lobster-game-extension/
├── src/
│   ├── extension.ts           # Extension entry point
│   ├── gamePanel.ts           # Webview panel manager
│   ├── commandExecutor.ts     # Command execution logic
│   └── webview/              # Game code (bundled for webview)
│       ├── main.ts           # Game initialization
│       ├── scene.ts          # 3D office environment
│       ├── lobster.ts        # Player controller
│       ├── counters.ts       # Command stations
│       ├── ui.ts             # UI management
│       └── interactionSystem.ts  # Interaction logic
├── out/                      # Compiled output
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config (extension)
├── tsconfig.webview.json     # TypeScript config (webview)
└── webpack.config.js         # Webpack config (webview bundling)
```

## Troubleshooting

### Extension doesn't activate
- Check the Debug Console for errors
- Ensure all dependencies are installed: `npm install`
- Rebuild: `npm run compile`

### Game doesn't load
- Check the Webview Developer Tools: **Help > Toggle Developer Tools**
- Look for console errors
- Verify webpack built successfully: check `out/webview/game.js` exists

### Commands don't execute
- Check if terminals are being created
- Verify WSL is installed (on Windows)
- Check the Debug Console for command executor errors

### Black screen in game
- Check the Webview Console for Three.js errors
- Verify canvas element exists
- Check WebGL support in your browser

## Next Steps

1. Click the lobster icon in the status bar
2. Walk around with WASD
3. Visit counters and press E to interact
4. Select commands to execute in the terminal

Enjoy controlling your lobster! 🦞

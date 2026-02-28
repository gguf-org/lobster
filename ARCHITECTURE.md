# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           VSCode Extension Host                          │
│                                                                           │
│  ┌────────────────┐                                                      │
│  │  Status Bar    │  Click                                               │
│  │  [🦞 Lobster]  │────────┐                                             │
│  └────────────────┘        │                                             │
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  extension.ts (Entry Point)                             │            │
│  │  - Activates on startup                                 │            │
│  │  - Creates status bar item                              │            │
│  │  - Registers 'lobsterGame.openGame' command             │            │
│  └─────────────────────────────────────────────────────────┘            │
│                            │                                             │
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  gamePanel.ts (Webview Manager)                         │            │
│  │  - Creates/shows webview panel                          │            │
│  │  - Loads game.js into webview                           │            │
│  │  - Handles messages from game                           │            │
│  │  - Manages webview lifecycle                            │            │
│  └─────────────────────────────────────────────────────────┘            │
│          │                                    ▲                          │
│          │ HTML                               │ Messages                 │
│          ▼                                    │                          │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │              Webview (Sandboxed)                        │            │
│  │                                                          │            │
│  │  ┌────────────────────────────────────────────────────┐ │            │
│  │  │  Canvas (Three.js Renderer)                       │ │            │
│  │  │                                                    │ │            │
│  │  │    🦞 Lobster                                     │ │            │
│  │  │                                                    │ │            │
│  │  │  [📊 Dashboard]  [✓ Checker]     [🔧 Setup]      │ │            │
│  │  │                                                    │ │            │
│  │  │             [🚪 Terminal]                         │ │            │
│  │  │                                                    │ │            │
│  │  │  [🌐 Gateway]                                     │ │            │
│  │  │                                                    │ │            │
│  │  │  Glass Walls (Transparent)                        │ │            │
│  │  └────────────────────────────────────────────────────┘ │            │
│  │                                                          │            │
│  │  Game Code (game.js - bundled by webpack):              │            │
│  │  ┌─────────────────────────────────────────────────┐   │            │
│  │  │ main.ts → Scene → Lobster → Counters           │   │            │
│  │  │              ↓         ↓          ↓             │   │            │
│  │  │         InteractionSystem ← UI                  │   │            │
│  │  │                             ↓                   │   │            │
│  │  │                    postMessage() to extension   │   │            │
│  │  └─────────────────────────────────────────────────┘   │            │
│  └─────────────────────────────────────────────────────────┘            │
│                            │                                             │
│                            ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │  commandExecutor.ts (Terminal Integration)              │            │
│  │  - Creates VSCode integrated terminals                  │            │
│  │  - Executes shell commands                              │            │
│  │  - WSL support for Windows                              │            │
│  │  - Package checking (npm list/view)                     │            │
│  └─────────────────────────────────────────────────────────┘            │
│                            │                                             │
└────────────────────────────┼─────────────────────────────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │  Terminal       │
                    │  $ openclaw ... │
                    └─────────────────┘
```

## Message Flow

### User Interaction Flow
```
1. User walks lobster to counter (WASD)
   ↓
2. User presses E when near counter
   ↓
3. interactionSystem detects interaction
   ↓
4. ui.showDialogue() displays options
   ↓
5. User clicks option
   ↓
6. ui.sendCommand(cmd) → postMessage()
   ↓
7. gamePanel receives message
   ↓
8. commandExecutor.executeCommand()
   ↓
9. Terminal opens and runs command
```

### Message Types

**Game → Extension:**
```json
{
  "type": "executeCommand",
  "command": "openclaw dashboard"
}

{
  "type": "checkPackage"
}

{
  "type": "showSubmenu",
  "counter": "Setup",
  "options": ["Onboard", "Doctor", "Fix", "Console", "Pair up"]
}
```

**Extension → Game:**
```json
{
  "type": "commandComplete",
  "success": true
}

{
  "type": "submenuResponse",
  "selection": "Doctor"
}
```

## Game Object Hierarchy

```
Scene (THREE.Scene)
├── Lighting
│   ├── AmbientLight
│   ├── DirectionalLight
│   └── PointLights (x4)
├── Environment
│   ├── Floor (PlaneGeometry)
│   ├── Ceiling (PlaneGeometry)
│   ├── Glass Walls (x4, transparent)
│   └── GridHelper
├── Lobster (Group)
│   ├── Body (BoxGeometry)
│   ├── Head (SphereGeometry)
│   ├── Tail Segments (x3)
│   ├── Claws (x2)
│   ├── Legs (x8)
│   └── Eyes (x2)
└── Counters (x5)
    ├── Dashboard Counter
    │   ├── Base (BoxGeometry)
    │   ├── Top (BoxGeometry, colored)
    │   ├── Indicator (CylinderGeometry, glowing)
    │   ├── PointLight
    │   ├── Ring (TorusGeometry, animated)
    │   └── Label (PlaneGeometry with canvas texture)
    ├── Checker Counter (same structure)
    ├── Setup Counter (same structure)
    ├── Gateway Counter (same structure)
    └── Terminal Counter (same structure)
```

## Build Pipeline

```
Source Files                 Compilation              Output
────────────────────────────────────────────────────────────────
src/extension.ts         →   tsc               →   out/extension.js
src/gamePanel.ts         →   tsc               →   out/gamePanel.js
src/commandExecutor.ts   →   tsc               →   out/commandExecutor.js

src/webview/**/*.ts      →   webpack           →   out/webview/game.js
                              (ts-loader)            (includes Three.js)
```

## Counter Positions

```
                    Z
                    ▲
                    │
        [-20, 15]   │   [20, 15]
         Setup      │    Gateway
            🔧      │      🌐
                    │
         ─────────[0,0]─────────► X
                 Terminal
                   🚪
                    │
       Dashboard    │    Checker
          📊       │       ✓
      [-20, -15]   │   [20, -15]
                    │
```

All counters are at Y=0 (ground level), with structures extending upward.

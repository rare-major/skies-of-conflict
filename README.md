# Air Warfare 3D Simulation

A browser-based, interactive 3D air warfare simulation built with React, Three.js, and TypeScript. Visualize modern attack and defence scenarios with realistic trajectories, layered defence systems, radar detection, electronic warfare, and more.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Tech Stack](https://img.shields.io/badge/Three.js-r183-green) ![Tech Stack](https://img.shields.io/badge/TypeScript-5.9-blue) ![Tech Stack](https://img.shields.io/badge/Vite-8-purple)

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Build for Production](#build-for-production)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Attack Systems](#attack-systems)
- [Defence Systems](#defence-systems)
- [Trajectory Types](#trajectory-types)
- [Country System](#country-system)
- [Controls and UI](#controls-and-ui)
- [Troubleshooting](#troubleshooting)

---

## Features

- **3D Scene** — Full WebGL-rendered battlefield with sky dome, terrain, fog, and dynamic lighting
- **26 Attack Types** — Rockets, ballistic/cruise/hypersonic missiles, drones (recon, kamikaze, swarm, stealth, loitering), fighter jets (F-35, F-22, Su-30, Su-57, Rafale, J-35), bombers, smart bombs, decoys, and more
- **8 Defence Types** — Long/medium/short-range SAMs (S-400, Patriot, NASAMS, Iron Dome), CIWS, anti-aircraft guns, anti-drone guns, signal jammers, laser defence
- **8 Attack Trajectories** — Straight, ballistic, cruise, zigzag, waypoint, dive, loitering, swarm (Boids algorithm)
- **6 Defence Trajectories** — Direct intercept, predictive intercept, proportional navigation, radar-guided, heat-seeking, burst fire
- **AI Engagement Logic** — Threat prioritization, layered defence zones, decoy detection, engagement cooldowns
- **Electronic Warfare** — Signal jamming, GPS spoofing, communication disruption
- **Radar & Detection** — Cone-based FOV, stealth factor, detection probability, multi-target tracking
- **Country System** — 11 countries (USA, Russia, China, India, UK, France, Israel, Iran, Japan, North Korea, Turkey) with stylized terrain, city markers, landmarks, and country-specific scenarios
- **20+ Preset Scenarios** — Generic and country-specific combat scenarios
- **Replay System** — Record simulations, scrub timeline, replay
- **Theme System** — Dark and light modes with balanced, accessible contrast
- **Glassmorphism UI** — Apple Fluid Glass-inspired control panel with tooltips, segmented controls, and micro-interactions
- **Stats Dashboard** — Real-time counters for active units, hits, interceptions, and misses

---

## Quick Start (One Command)

The included setup script checks prerequisites, installs Node.js if needed, installs dependencies, and offers to start the dev server — all in one step:

```bash
chmod +x setup.sh
./setup.sh
```

The script works on macOS, Linux, and Windows (Git Bash / WSL). If you prefer manual setup, follow the steps below.

---

## Prerequisites

You need the following installed on your system before running this project:

### 1. Node.js (v18 or higher)

Node.js is the JavaScript runtime required to build and run the project.

**macOS** (using Homebrew):
```bash
brew install node
```

**macOS** (using nvm — recommended for version management):
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc    # or source ~/.zshrc
nvm install 20
nvm use 20
```

**Windows** (using installer):
1. Download the LTS installer from [https://nodejs.org](https://nodejs.org)
2. Run the installer and follow the prompts
3. Restart your terminal after installation

**Windows** (using winget):
```powershell
winget install OpenJS.NodeJS.LTS
```

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Linux (Fedora)**:
```bash
sudo dnf install nodejs
```

**Verify installation**:
```bash
node -v    # Should print v18.x.x or higher
npm -v     # Should print 9.x.x or higher
```

### 2. Git (optional, for cloning)

```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt-get install git

# Windows
winget install Git.Git
```

### 3. A Modern Browser

The simulation uses WebGL 2.0 via Three.js. Use any of these browsers:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari (macOS 15+)

> **Note**: A dedicated GPU is recommended for smooth performance. Integrated graphics will work but may have lower frame rates with complex scenarios.

---

## Installation

### Step 1: Get the source code

**Option A — Clone the repository:**
```bash
git clone <repository-url>
cd air-warfare-sim
```

**Option B — Copy the project folder:**
Copy the `air-warfare-sim` directory to your desired location, then:
```bash
cd air-warfare-sim
```

### Step 2: Install dependencies

```bash
npm install
```

This installs all required packages (React, Three.js, Zustand, Tailwind CSS, etc.) listed in `package.json`. The install process downloads approximately 200MB of packages into the `node_modules` directory.

If you encounter permission errors on macOS/Linux:
```bash
sudo npm install
```

If you encounter network errors behind a corporate proxy:
```bash
npm config set proxy http://your-proxy:port
npm config set https-proxy http://your-proxy:port
npm install
```

---

## Running the Project

### Development server (with hot reload)

```bash
npm run dev
```

This starts the Vite development server. Open the URL shown in the terminal (typically `http://localhost:5173`) in your browser.

```
  VITE v8.x.x  ready in 500ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

> Press `Ctrl+C` to stop the server.

### Preview a production build locally

```bash
npm run build
npm run preview
```

This creates an optimized production build in the `dist/` folder and serves it locally.

---

## Build for Production

```bash
npm run build
```

Output is written to the `dist/` directory. This is a static site — deploy it to any static hosting provider:

- **Vercel**: `npx vercel`
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Push `dist/` to the `gh-pages` branch
- **Any web server**: Serve the `dist/` folder (e.g., `npx serve dist`)

---

## Project Structure

```
air-warfare-sim/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite + Tailwind config
│
└── src/
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Root component
    ├── index.css                 # Global styles, theme variables, animations
    │
    ├── types/                    # TypeScript type definitions
    │   ├── entities.ts           #   Attack, Defence, Interceptor entity types
    │   ├── scenarios.ts          #   Scenario definition types
    │   └── simulation.ts         #   Simulation state types
    │
    ├── store/                    # Zustand state management
    │   ├── simulationStore.ts    #   Sim controls (run, pause, elapsed, toggles)
    │   ├── entityStore.ts        #   All entities, interceptors, explosions
    │   ├── cameraStore.ts        #   Camera mode (free, combat, follow, cinematic)
    │   ├── themeStore.ts         #   Dark/light theme
    │   ├── replayStore.ts        #   Replay recording and playback
    │   ├── countryStore.ts       #   Selected country
    │   └── scenarioStore.ts      #   Scenario persistence
    │
    ├── data/                     # Static configuration and presets
    │   ├── attackPresets.ts       #   26 attack entity presets with params
    │   ├── defencePresets.ts      #   8 defence entity presets with params
    │   ├── scenarios.ts           #   20+ preset scenarios
    │   ├── countries.ts           #   11 countries with cities, landmarks, terrain
    │   └── tooltipDescriptions.ts #   UI tooltip text for all controls
    │
    ├── logic/                    # Simulation logic (pure functions, no React)
    │   ├── physics/
    │   │   ├── kinematics.ts     #     Vector math (add, sub, normalize, steer, etc.)
    │   │   └── collision.ts      #     Bounding-sphere collision detection
    │   ├── trajectories/
    │   │   ├── attack/           #     8 attack trajectory algorithms
    │   │   │   ├── straight.ts
    │   │   │   ├── ballistic.ts
    │   │   │   ├── cruise.ts
    │   │   │   ├── zigzag.ts
    │   │   │   ├── waypoint.ts
    │   │   │   ├── dive.ts
    │   │   │   ├── loitering.ts
    │   │   │   └── swarm.ts      #     Boids flocking algorithm
    │   │   └── defence/          #     6 defence trajectory algorithms
    │   │       ├── directIntercept.ts
    │   │       ├── predictiveIntercept.ts
    │   │       ├── proportionalNav.ts
    │   │       ├── radarGuided.ts
    │   │       ├── heatSeeking.ts
    │   │       └── burstFire.ts
    │   ├── intercept/
    │   │   ├── guidanceLaws.ts   #     Proportional navigation math
    │   │   └── interceptionEngine.ts  # Hit/miss calculation
    │   ├── radar/
    │   │   ├── detection.ts      #     FOV-based detection probability
    │   │   └── tracking.ts       #     Multi-target tracking
    │   ├── ai/
    │   │   ├── threatPrioritization.ts  # Threat scoring and ranking
    │   │   ├── engagementLogic.ts       # Layered defence engagement decisions
    │   │   └── decoyDetection.ts        # Decoy identification
    │   ├── ew/
    │   │   ├── jamming.ts        #     Radar jamming simulation
    │   │   └── spoofing.ts       #     GPS spoofing effects
    │   └── terrain/
    │       └── noise.ts          #     Simplex/FBM noise for terrain generation
    │
    ├── hooks/                    # React hooks
    │   ├── useSimulationLoop.ts  #   Main per-frame simulation tick
    │   ├── useEntitySpawner.ts   #   Entity creation and scenario loading
    │   └── useReplaySystem.ts    #   Replay recording and playback
    │
    └── components/
        ├── entities/             # 3D entity meshes
        │   ├── AttackMesh.tsx    #   Attack entity visuals (jets, missiles, drones)
        │   ├── DefenceMesh.tsx   #   Defence entity visuals (SAM launchers, guns)
        │   ├── InterceptorMesh.tsx  # Interceptor missile visuals
        │   ├── EntityRenderer.tsx   # Renders all active entities
        │   └── SimulationEngine.tsx # Orchestrates the simulation loop
        ├── scene/                # 3D scene setup
        │   ├── Scene.tsx         #   Canvas, lighting, fog, camera controls
        │   ├── Sky.tsx           #   Gradient sky dome
        │   ├── Ground.tsx        #   Grid ground plane
        │   ├── Terrain.tsx       #   Procedural generic terrain with vertex coloring
        │   ├── CountryTerrain.tsx #  Country-specific terrain (noise, biomes, water)
        │   ├── CityMarker.tsx    #   Procedural city buildings and labels
        │   ├── Landmark.tsx      #   17 landmark shape types (domes, towers, etc.)
        │   ├── DomeGrid.tsx      #   Hemisphere wireframe for spatial reference
        │   └── CameraController.tsx  # Smart camera (free, combat, follow, cinematic)
        ├── visuals/              # Visual effects
        │   ├── TrajectoryTrail.tsx   # Entity flight trail lines
        │   ├── RadarCone.tsx     #   Radar detection cone visualization
        │   ├── ExplosionEffect.tsx   # Hit/miss/impact explosion particles
        │   ├── LockOnIndicator.tsx   # Target lock visual
        │   ├── HitMissIndicator.tsx  # Hit/miss text indicator
        │   └── VisualEffects.tsx     # Effect orchestrator
        └── ui/                   # Control panel UI
            ├── ControlPanel.tsx  #   Main floating panel container
            ├── SimControls.tsx   #   Timer, stats, playback, toggles
            ├── SpawnPanel.tsx    #   Manual entity spawn UI
            ├── EntityList.tsx    #   List of active entities
            ├── ParameterEditor.tsx  # Entity parameter editing
            ├── ScenarioPanel.tsx #   Scenario selector with country filter
            ├── CountrySelector.tsx  # Country selection grid
            ├── ThemeToggle.tsx   #   Dark/light theme switch
            ├── IconButton.tsx    #   Reusable icon button component
            ├── SegmentedControl.tsx  # Pill-style segmented control
            ├── ToggleSwitch.tsx  #   Toggle switch with icon
            └── Tooltip.tsx       #   Apple Fluid Glass tooltip
```

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19.x | UI framework |
| [TypeScript](https://typescriptlang.org) | 5.9 | Type safety |
| [Vite](https://vite.dev) | 8.x | Build tool and dev server |
| [Three.js](https://threejs.org) | r183 | 3D rendering engine |
| [React Three Fiber](https://r3f.docs.pmnd.rs) | 9.x | React renderer for Three.js |
| [Drei](https://drei.docs.pmnd.rs) | 10.x | R3F helpers (OrbitControls, Html, etc.) |
| [Zustand](https://zustand.docs.pmnd.rs) | 5.x | Lightweight state management |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first CSS |
| [Lucide React](https://lucide.dev) | 1.x | Icon library |

---

## Attack Systems

| Type | Trajectory | Description |
|---|---|---|
| Rocket | Ballistic | Unguided projectile, parabolic arc |
| Ballistic Missile | Ballistic | High-arc trajectory with gravity |
| Cruise Missile | Cruise | Low-altitude, terrain-hugging flight |
| Hypersonic Glide | Ballistic | Extreme speed, shallow ballistic arc |
| Anti-Radiation Missile | Straight | Homes on radar emissions |
| Recon Drone | Loitering | Circular orbit for surveillance |
| Kamikaze Drone | Dive | Approaches then dives on target |
| Swarm Drone | Swarm | Boids-based coordinated flocking |
| Stealth Drone | Cruise | Low-observable, cruise altitude |
| Loitering Munition | Loitering | Orbits, then dives on command |
| Fighter Jets (F-35, F-22, Su-30, Su-57, Rafale, J-35) | Zigzag | Evasive flight with payload delivery |
| Stealth Aircraft | Cruise | Low-observable penetration |
| Bomber | Zigzag | Heavy payload carrier |
| EW Aircraft | Loitering | Electronic warfare support |
| Glide/Laser/GPS Bomb | Straight | Guided munitions |
| Cluster Munition | Straight | Area-effect weapon |
| Decoy | Straight | Draws defence fire |
| Naval Missile | Cruise | Sea-launched cruise missile |

---

## Defence Systems

| Type | Default Trajectory | Range | Description |
|---|---|---|---|
| S-400 (Long Range SAM) | Proportional Nav | 500 | Long-range area denial, 360° FOV |
| Patriot (Long Range SAM) | Predictive Intercept | 400 | Long-range missile defence |
| NASAMS (Medium Range SAM) | Radar Guided | 200 | Medium-range area defence |
| Buk (Medium Range SAM) | Proportional Nav | 250 | Medium-range mobile SAM |
| Iron Dome (Short Range SAM) | Predictive Intercept | 100 | Short-range rocket/mortar defence |
| CIWS | Burst Fire | 30 | Close-in weapon system, last line |
| Anti-Aircraft Gun | Burst Fire | 50 | Short-range gun system |
| Anti-Drone Gun | Direct Intercept | 40 | Specialized counter-drone |
| Signal Jammer | — | 150 | Degrades enemy radar/guidance |
| Laser Defence | Direct Intercept | 60 | Directed energy weapon |

---

## Trajectory Types

### Attack Trajectories
- **Straight** — Constant velocity in the initial direction
- **Ballistic** — Parabolic arc under gravity (launch angle computed to land near defence area)
- **Cruise** — Maintains low altitude (35 units), terrain-hugging
- **Zigzag** — Lateral oscillation perpendicular to heading for evasion
- **Waypoint** — Follows predefined waypoints via Catmull-Rom spline
- **Dive** — Approaches at altitude, then steep dive toward nearest defence
- **Loitering** — Circular orbit until dive trigger
- **Swarm** — Boids algorithm (separation, alignment, cohesion) toward target

### Defence Trajectories
- **Direct Intercept** — Steers directly toward current target position
- **Predictive Intercept** — Leads the target based on velocity
- **Proportional Navigation** — Classic missile guidance law (line-of-sight rate)
- **Radar Guided** — Predictive with simulated radar update cycles
- **Heat Seeking** — Steers toward target thermal signature
- **Burst Fire** — Unguided rapid-fire projectiles (CIWS, guns)

---

## Country System

Select a country to load stylized terrain, cities with procedural buildings, and iconic landmarks:

| Country | Terrain | Key Locations |
|---|---|---|
| USA | Temperate plains, green valleys | Washington DC, New York, Pearl Harbor |
| Russia | Cold steppe, snow-capped peaks | Moscow, St. Petersburg |
| China | Lush green hills, river valleys | Beijing, Shanghai, Hong Kong |
| India | Tropical lowlands, desert edges | New Delhi, Mumbai, Hyderabad |
| UK | Rolling green hills, coastal | London, Edinburgh |
| France | Temperate fields, river valleys | Paris, Marseille |
| Israel | Desert terrain, arid | Tel Aviv, Jerusalem, Haifa |
| Iran | Arid mountains, desert | Tehran, Isfahan |
| Japan | Volcanic islands, lush green | Tokyo, Osaka, Hiroshima |
| North Korea | Cold mountainous terrain | Pyongyang |
| Turkey | Mediterranean coast, mountains | Istanbul, Ankara |

---

## Controls and UI

### Simulation Controls
| Control | Description |
|---|---|
| **Start / Pause** | Begin or pause the simulation |
| **Reset** | Restore the scenario to its initial state |
| **Clear** | Remove all entities and reset completely |
| **Time Scale** | 0.5x, 1x, 2x, 5x, 10x speed |
| **Record** | Record simulation frames for replay |

### Camera Modes
| Mode | Description |
|---|---|
| **Free** | Orbit, zoom, and pan with mouse |
| **Combat** | Auto-focuses on the action zone |
| **Follow** | Tracks a selected entity |
| **Cinematic** | Slow orbital camera movement |

### Display Toggles
| Toggle | Description |
|---|---|
| Trails | Show entity flight path trails |
| Radar Cones | Show defence radar detection volumes |
| Dome Grid | Show hemisphere wireframe grid |
| Terrain | Show procedural terrain mesh |
| Collision Spheres | Show entity bounding spheres |

### Stats Panel (real-time)
| Stat | Description |
|---|---|
| Attacks | Active attack entities |
| Defence | Active defence systems |
| Missiles | Active interceptor missiles in flight |
| Hits | Attacks that reached ground (successful strike) |
| Shot Down | Attacks intercepted by defence |
| Missed | Attacks that flew out of bounds |

### Mouse Controls
| Action | Input |
|---|---|
| Orbit camera | Left-click + drag |
| Zoom | Scroll wheel |
| Pan | Right-click + drag |

---

## Troubleshooting

### `npm install` fails with network errors
```bash
# Clear cache and retry
npm cache clean --force
npm install

# If behind a proxy
npm config set proxy http://proxy:port
npm config set https-proxy http://proxy:port
```

### `npm run dev` shows port in use
```bash
# Use a different port
npx vite --port 3000
```

### Low FPS / choppy rendering
- Close other GPU-intensive tabs or applications
- Reduce the number of entities in the scenario
- Turn off Trails and Radar Cones in the display toggles
- Use Chrome for best WebGL performance

### Blank screen / WebGL errors
- Ensure your browser supports WebGL 2.0 (check at [get.webgl.org](https://get.webgl.org))
- Update your graphics drivers
- Try disabling hardware acceleration in browser settings, then re-enable

### TypeScript errors during build
```bash
# Check for type errors
npx tsc --noEmit

# Force install correct types
npm install @types/three@latest @types/react@latest
```

---

## License

This project is for educational and demonstration purposes.

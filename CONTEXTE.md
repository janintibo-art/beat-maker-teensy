# 🎯 Beat Maker Teensy - Context & Quick Start

## Project Overview

This is an **educational IDE** (Integrated Development Environment) for building Teensy-based drum machines. It combines:
- 📚 **Tutorials** - Learn step by step
- 🔧 **Component reference** - Shopping lists & pricing
- ⚙️ **Code editor** - Write & upload Arduino code
- 🎮 **Simulator** - Test patterns before hardware

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop App** | Electron |
| **UI** | React 18 |
| **Audio** | Tone.js (Web Audio API) |
| **Target Hardware** | Teensy 4.1 |
| **Upload** | arduino-cli |
| **Build** | GitHub Actions (automated builds) |

## Folder Structure

```
beat_maker_teensy/
├── electron/
│   ├── main.js          # Electron app (USB upload, compiler)
│   └── preload.js       # Safe bridge to hardware
│
├── src/
│   ├── pages/           # Main app pages
│   │   ├── Tutorial.jsx      (tutorials)
│   │   ├── CodeEditor.jsx    (code writing)
│   │   ├── Simulator.jsx     (audio playback)
│   │   └── Components.jsx    (shopping lists)
│   ├── App.jsx          # Router & main layout
│   └── App.css          # All styling (dark theme)
│
├── public/
│   └── index.html       # HTML template
│
└── .github/workflows/
    └── build.yml        # Auto-build & release EXE
```

## How It Works

### 1️⃣ **Tutorial System**
- Each tutorial has:
  - Title, description, difficulty
  - Required components (with prices)
  - Step-by-step content
  - Link to code editor

### 2️⃣ **Code Editor**
- Pre-loaded Teensy template (Audio Library example)
- Board selector (Teensy 4.1, 4.0, 3.6, 3.5)
- Functions:
  - **🔨 Compile** - Check for errors
  - **🚀 Upload** - Send code to Teensy via USB
  - **🔄 Reset** - Restore default code
- Reference panel with:
  - Audio library functions
  - Note frequencies (C4-C5)
  - Waveform types

### 3️⃣ **Interactive Simulator**
- 16-step drum machine pattern editor
- Controls:
  - Play/Stop button
  - Tempo slider (60-200 BPM)
  - Click pads to toggle steps
  - Current step indicator
  - Clear & Randomize buttons
- Real-time audio: Tone.js generates tones for each step

### 4️⃣ **Component Reference**
- Curated list of essential parts:
  - Teensy 4.1 (~€35-45)
  - Audio codec, capacitors, resistors
  - Suppliers: Adafruit, SparkFun, AliExpress
- Total cost estimate: **€90-150**

## Workflow

```
1. Read tutorial → 2. Gather components → 3. Write code
                         ↓
                    4. Test in simulator
                         ↓
                    5. Upload to Teensy
                         ↓
                    6. Test on hardware
```

## GitHub Actions Automation

The `.github/workflows/build.yml` file:
- ✅ Automatically builds EXE, DMG, AppImage on each push
- ✅ Runs on Windows, macOS, Linux
- ✅ Uploads artifacts for download
- ✅ Creates releases from tags

**To trigger a build:** Just push to main/develop branch.  
**To create a release:** Tag a commit with `v1.0.0` (etc.)

## File Sizes

- **App** (Electron): ~150 MB (first run)
- **Simulator**: ~2 MB (in-app)
- **No external dependencies** (all bundled)

## Current Status (v1.0.0)

### ✅ Done
- [x] Electron + React skeleton
- [x] Tutorials page with examples
- [x] Code editor with Arduino template
- [x] Interactive simulator with Tone.js
- [x] Component shopping guide
- [x] Dark theme UI
- [x] GitHub Actions CI/CD

### 🔄 Future Features
- [ ] Visual circuit builder (drag-drop components)
- [ ] Wokwi simulator integration
- [ ] MIDI controller support
- [ ] User project saving/loading
- [ ] Sound sample upload
- [ ] Real-time spectrum analyzer
- [ ] Mobile app (React Native)

## Development Notes

### IPC (Inter-Process Communication)
Located in `electron/preload.js`, allows React to talk to system:
- `window.teensyAPI.uploadTeensy(code, board)`
- `window.teensyAPI.compileSketch(code, board)`

### Audio Implementation
`Simulator.jsx` uses Tone.js:
- Creates PolySynth (square wave, short envelope)
- Triggers notes on step play
- No external audio files needed

### Styling
All CSS in `src/App.css`:
- Dark theme (0a0e27 = dark blue background)
- Cyan accents (#00d9ff)
- Responsive grid layouts
- No external UI libraries (kept it lean)

## Next Steps for You

1. **Create GitHub repo:**
   ```bash
   gh repo create beat-maker-teensy --public --source=. --remote=origin --push
   ```

2. **Test locally:**
   ```bash
   npm install
   npm start
   ```

3. **Build EXE for Windows:**
   ```bash
   npm run build-win
   ```

4. **Upload to Teensy:**
   - Connect Teensy via USB
   - Write code in editor
   - Click "Upload" (needs arduino-cli installed)

---

**Questions?** Check README.md or the Teensy forums! 🚀

# 🥁 Beat Maker Teensy

An educational IDE for learning and building Teensy-based drum machines from scratch.

## Features

### 📚 **Tutorials**
- Step-by-step guides for building drum machines with Teensy
- Difficulty levels: Beginner, Intermediate, Advanced
- Complete component lists with pricing

### ⚙️ **Code Editor**
- Arduino-compatible code editor with syntax highlighting
- Support for multiple Teensy boards (4.1, 4.0, 3.6, 3.5)
- One-click compilation and upload to device
- Audio library reference and common frequencies

### 🎮 **Interactive Simulator**
- 16-step sequencer for drum patterns
- Real-time audio playback using Tone.js
- Adjustable tempo (60-200 BPM)
- Pattern randomization and clearing

### 🔧 **Component Reference**
- Complete shopping list with pricing
- Links to suppliers (Adafruit, SparkFun, AliExpress)
- Component specifications and compatibility info

## Requirements

- **Node.js** 18+
- **npm** or **yarn**
- **Arduino CLI** (for uploading to Teensy)
- **Teensy** microcontroller (4.1 recommended)

## Installation

```bash
git clone https://github.com/janintibo-art/beat-maker-teensy.git
cd beat_maker_teensy
npm install
```

## Usage

### Development Mode
```bash
npm start
```
This starts both the React dev server and Electron in parallel.

### Build for Production

**Windows:**
```bash
npm run build-win
```

**macOS:**
```bash
npm run build-mac
```

**Linux:**
```bash
npm run build-linux
```

## Project Structure

```
beat_maker_teensy/
├── electron/          # Electron main process
│   ├── main.js       # App initialization
│   └── preload.js    # IPC bridge
├── src/
│   ├── components/   # React components
│   ├── pages/        # App pages
│   │   ├── Tutorial.jsx
│   │   ├── CodeEditor.jsx
│   │   ├── Simulator.jsx
│   │   └── Components.jsx
│   ├── App.jsx       # Main app
│   ├── App.css       # Styling
│   └── index.jsx     # Entry point
├── public/           # Static assets
└── .github/workflows/  # CI/CD
```

## Technology Stack

- **Frontend:** React 18
- **Desktop:** Electron
- **Audio:** Tone.js
- **Microcontroller:** Teensy (Arduino-compatible)
- **Build:** Electron Builder, GitHub Actions

## Workflow

1. **Learn** through tutorials
2. **Design** your circuit and components
3. **Code** using the Arduino editor
4. **Simulate** with the interactive sequencer
5. **Upload** directly to your Teensy
6. **Test** on real hardware

## Arduino Libraries Required

When uploading to Teensy, ensure these libraries are installed:
- `Audio` - Real-time audio synthesis
- `SD` - SD card support (optional)
- `SPI` - Serial communication
- `Wire` - I2C communication

## Tips for Getting Started

1. Start with "Getting Started with Teensy" tutorial
2. Follow the component list to gather parts (€90-150)
3. Use the simulator to test patterns before uploading
4. Test with breadboards first, then solder
5. Join Teensy forums for support

## Contributing

Contributions are welcome! Areas for improvement:
- More tutorials and projects
- Visual schematic editor
- MIDI controller support
- Recording and export features
- Mobile app (React Native)

## License

MIT License - Free to use and modify

## Author

**janintibo** - French free software developer  
GitHub: https://github.com/janintibo-art

## Support

- 📖 [Teensy Documentation](https://www.pjrc.com/teensy/)
- 🎵 [Audio Library Guide](https://www.pjrc.com/teensy/audio.html)
- 💬 [Teensy Forum](https://forum.pjrc.com/)

---

**Current Version:** 1.0.0  
**Last Updated:** 2026-09-24

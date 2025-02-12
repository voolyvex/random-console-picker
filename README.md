# Random Console Picker

A desktop application that helps you randomly pick a gaming console to play.

## Installation

### Windows
1. Download `Random.Console.Picker.Setup.exe` from Releases
2. Run the installer
3. Launch from desktop shortcut or start menu

### macOS
1. Download `Random.Console.Picker.dmg` from Releases
2. Open and drag to Applications
3. Launch from Applications

## Development

### Prerequisites
* Node.js (v14+)
* npm

### Setup
```bash
git clone https://github.com/voolyvex/random-console-picker.git
cd random-console-picker
npm install
npm start
```

### Building
```bash
# Windows
npm run build:win

# macOS
npm run build:mac
```

### Icon Building
1. Source file: `assets/icon.svg`
2. Generate sizes:
   - Windows: 16, 24, 32, 48, 64, 128, 256px (ICO)
   - macOS: 16, 32, 128, 256, 512, 1024px (ICNS)
3. Use appropriate tool (e.g., IconSlate for macOS) to compile

## License
MIT License - see [LICENSE](LICENSE)

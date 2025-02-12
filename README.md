# Random Console Picker

A simple desktop application that helps you randomly pick a gaming console to play. Perfect for those who can't decide which console to fire up!

## Features

* 🎮 Randomly select from your gaming console collection
* 🌓 Dark/Light mode support
* ⚙️ Streamlined console management
* 💾 Automatic saving and backup of your console list
* 🖥️ Cross-platform support (Windows & macOS)
* 🎯 System tray support with quick access
* 🎨 Beautiful modern UI with smooth animations
* 🔄 Automatic window sizing for different displays
* 🛡️ Enhanced error handling and stability
* 💫 Improved notifications system

## Technical Improvements

* Responsive window sizing based on screen resolution
* Robust error handling for storage operations
* Improved icon loading with fallback support
* Enhanced notification system with better timing
* Streamlined state management
* Improved UI responsiveness and animations
* Automatic backup system for console lists

## Installation

### Windows
1. Go to the [Releases](https://github.com/voolyvex/random-console-picker/releases) page
2. Download the latest `Random.Console.Picker.Setup.exe`
3. Run the installer
4. Launch from your desktop shortcut or start menu

### macOS
1. Go to the [Releases](https://github.com/voolyvex/random-console-picker/releases) page
2. Download the latest `Random.Console.Picker.dmg`
3. Open the DMG file
4. Drag the app to your Applications folder
5. Launch from Applications

## Development

### Prerequisites
* Node.js (v14 or higher)
* npm (comes with Node.js)
* Git

### Setup
```bash
# Clone the repository
git clone https://github.com/voolyvex/random-console-picker.git

# Navigate to the project directory
cd random-console-picker

# Install dependencies
npm install

# Start the application in development mode
npm start
```

### Building
```bash
# Build for Windows
npm run build:win

# Build for macOS (must be on macOS)
npm run build:mac

# Build for both platforms (must be on macOS)
npm run build
```

The built installers will be available in the `dist` folder.

### Icon Specifications

The application uses a custom icon in multiple formats:

#### Windows (ICO)
* Single `icon.ico` file containing multiple sizes:
  * 16x16 (taskbar)
  * 24x24
  * 32x32 (file icons)
  * 48x48
  * 64x64
  * 128x128
  * 256x256

#### macOS (ICNS)
* Single `icon.icns` file containing:
  * 16x16 (16pt @1x)
  * 32x32 (16pt @2x)
  * 32x32 (32pt @1x)
  * 64x64 (32pt @2x)
  * 128x128 (128pt @1x)
  * 256x256 (128pt @2x)
  * 256x256 (256pt @1x)
  * 512x512 (256pt @2x)
  * 512x512 (512pt @1x)
  * 1024x1024 (512pt @2x)

Source files are maintained in SVG format for scalability.

## Project Structure

```
random-console-picker/
├── assets/
│   ├── icon.svg        # Source vector icon
│   ├── icon.ico        # Windows icon
│   └── icon.icns       # macOS icon
├── src/
│   ├── index.html      # Main application UI
│   └── main.js         # Main electron process
├── package.json        # Project configuration
└── systems.json        # Default console list
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

* Built with [Electron](https://www.electronjs.org/)
* Icons from [Font Awesome](https://fontawesome.com/)
* Custom SVG icon design

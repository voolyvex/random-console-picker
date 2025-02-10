# Random Console Picker

A simple desktop application that helps you randomly pick a gaming console to play. Perfect for those who can't decide which console to fire up!

![Random Console Picker Screenshot](assets/screenshot.png)

## Features

- 🎮 Randomly select from your console collection
- 🌓 Dark/Light mode support
- ⚙️ Customizable console list
- 💾 Persistent storage of your console collection
- 🖥️ Cross-platform support (Windows & macOS)
- 🎯 System tray support with quick access
- 🎨 Beautiful modern UI with smooth animations

## Installation

### Windows
1. Go to the [Releases](https://github.com/yourusername/random-console-picker/releases) page
2. Download the latest `Random.Console.Picker.Setup.exe`
3. Run the installer
4. Launch from your desktop shortcut or start menu

### macOS
1. Go to the [Releases](https://github.com/yourusername/random-console-picker/releases) page
2. Download the latest `Random.Console.Picker.dmg`
3. Open the DMG file
4. Drag the app to your Applications folder
5. Launch from Applications

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Icons from [Font Awesome](https://fontawesome.com/)
- Custom SVG icon design

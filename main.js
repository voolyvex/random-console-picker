const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let isQuitting = false;

function getIconPath() {
    const iconPath = path.join(__dirname, process.platform === 'darwin' ? 'assets/icon.icns' : 'assets/icon.ico');
    try {
        fs.accessSync(iconPath, fs.constants.R_OK);
        return iconPath;
    } catch (err) {
        console.warn('Icon file not found:', err);
        return null;
    }
}

function createWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = Math.min(800, screenWidth * 0.8);
    const windowHeight = Math.min(800, screenHeight * 0.8);

    mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        minWidth: 500,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: getIconPath(),
        backgroundColor: '#00000000',
        transparent: true,
        frame: true,
        resizable: true,
        maximizable: true,
        minimizable: true
    });

    mainWindow.loadFile('index.html').catch(err => {
        console.error('Failed to load index.html:', err);
    });

    // Center window on creation and when resized
    mainWindow.on('resize', () => {
        const bounds = mainWindow.getBounds();
        const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
        const x = Math.floor((screenWidth - bounds.width) / 2);
        const y = Math.floor((screenHeight - bounds.height) / 2);
        mainWindow.setBounds({ ...bounds, x, y });
    });

    // Handle minimize from custom button
    ipcMain.on('minimize-to-tray', () => {
        mainWindow.hide();
    });

    // Center the window initially
    mainWindow.center();
}

function createTray() {
    const iconPath = getIconPath();
    if (!iconPath) {
        console.error('Failed to create tray: icon not found');
        return;
    }

    try {
        // Create tray with native image to ensure proper transparency
        const nativeImage = require('electron').nativeImage;
        const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
        tray = new Tray(trayIcon);
        
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show App',
                click: () => {
                    mainWindow.show();
                    mainWindow.focus();
                }
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => {
                    isQuitting = true;
                    app.quit();
                }
            }
        ]);

        tray.setToolTip('Random Console Picker');
        tray.setContextMenu(contextMenu);

        // Double click on tray icon shows the app
        tray.on('double-click', () => {
            mainWindow.show();
            mainWindow.focus();
        });
    } catch (err) {
        console.error('Failed to create tray:', err);
    }
}

// Handle app ready
app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });
});

// Only quit the app when explicitly told to
app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
}); 
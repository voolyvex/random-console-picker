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
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true,
        icon: getIconPath()
    });

    mainWindow.loadFile('index.html').catch(err => {
        console.error('Failed to load index.html:', err);
    });

    // Center the window
    mainWindow.center();

    // Prevent window from closing
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    // Handle minimize to tray
    ipcMain.on('minimize-to-tray', () => {
        mainWindow.hide();
    });
}

function createTray() {
    const iconPath = getIconPath();
    if (!iconPath) {
        console.error('Failed to create tray: icon not found');
        return;
    }

    try {
        tray = new Tray(iconPath);
        
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
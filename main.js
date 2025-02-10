const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isQuitting = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, process.platform === 'darwin' ? 'assets/icon.icns' : 'assets/icon.ico')
    });

    mainWindow.loadFile('index.html');

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
    const iconPath = path.join(__dirname, process.platform === 'darwin' ? 'assets/icon.icns' : 'assets/icon.ico');
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
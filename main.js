const { app, BrowserWindow, Tray, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises; // Use promises for async operations

// Global references to prevent garbage collection
let mainWindow = null;
let tray = null;
let isQuitting = false;
let lastWindowPosition = null;

// Constants
const MIN_WINDOW_WIDTH = 500;
const MIN_WINDOW_HEIGHT = 700;
const DEFAULT_WINDOW_WIDTH = 800;
const DEFAULT_WINDOW_HEIGHT = 800;

async function loadSystemsJson() {
    try {
        const systemsPath = path.join(__dirname, 'systems.json');
        const systemsData = await fs.readFile(systemsPath, 'utf8');
        return JSON.parse(systemsData);
    } catch (err) {
        console.error('Error loading systems.json:', err);
        return null;
    }
}

function getIconPath() {
    const iconPath = path.join(__dirname, process.platform === 'darwin' ? 'assets/icon.icns' : 'assets/icon.ico');
    try {
        fs.access(iconPath, fs.constants.R_OK);
        return iconPath;
    } catch (err) {
        console.warn('Icon file not found:', err);
        return null;
    }
}

function calculateWindowBounds(display, windowWidth, windowHeight) {
    const { x, y, width, height } = display.workArea;
    return {
        x: Math.round(x + (width - windowWidth) / 2),
        y: Math.round(y + (height - windowHeight) / 2),
        width: windowWidth,
        height: windowHeight
    };
}

function createWindow() {
    // Get the focused display
    const focusedDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
    const { width: screenWidth, height: screenHeight } = focusedDisplay.workArea;

    // Calculate window dimensions
    const windowWidth = Math.min(DEFAULT_WINDOW_WIDTH, screenWidth * 0.8);
    const windowHeight = Math.min(DEFAULT_WINDOW_HEIGHT, screenHeight * 0.8);
    const bounds = calculateWindowBounds(focusedDisplay, windowWidth, windowHeight);

    mainWindow = new BrowserWindow({
        ...bounds,
        minWidth: MIN_WINDOW_WIDTH,
        minHeight: MIN_WINDOW_HEIGHT,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: getIconPath(),
        backgroundColor: '#ffffff',
        show: false
    });

    // Initialize window state handlers
    setupWindowStateHandlers();

    // Load the app
    initializeApp();
}

function setupWindowStateHandlers() {
    mainWindow.on('maximize', () => {
        lastWindowPosition = mainWindow.getBounds();
        mainWindow.webContents.send('window-state-change', 'maximized');
    });

    mainWindow.on('unmaximize', () => {
        if (lastWindowPosition) {
            const currentDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
            const bounds = calculateWindowBounds(
                currentDisplay,
                lastWindowPosition.width,
                lastWindowPosition.height
            );
            
            try {
                mainWindow.setBounds(bounds);
            } catch (error) {
                console.error('Error restoring window bounds:', error);
            }
        }
        mainWindow.webContents.send('window-state-change', 'normal');
    });

    mainWindow.on('resize', () => {
        if (!mainWindow.isMaximized()) {
            lastWindowPosition = mainWindow.getBounds();
        }
    });

    // Update close behavior to quit the app
    mainWindow.on('close', (event) => {
        // Only prevent close if it's from our custom minimize button
        if (!isQuitting && mainWindow.minimizeFromTray) {
            event.preventDefault();
            mainWindow.hide();
            return;
        }
        // Otherwise, let the window close and quit the app
        isQuitting = true;
    });
}

async function initializeApp() {
    try {
        const systems = await loadSystemsJson();
        await mainWindow.loadFile('index.html');
        
        if (systems) {
            mainWindow.webContents.send('init-systems', systems);
        }
        
        mainWindow.show();
    } catch (err) {
        console.error('Failed to initialize app:', err);
    }
}

function createTray() {
    const iconPath = getIconPath();
    if (!iconPath) {
        console.error('Failed to create tray: icon not found');
        return;
    }

    try {
        const nativeImage = require('electron').nativeImage;
        const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
        tray = new Tray(trayIcon);
        
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show App',
                click: () => {
                    mainWindow?.show();
                    mainWindow?.focus();
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
        tray.on('double-click', () => {
            mainWindow?.show();
            mainWindow?.focus();
        });
    } catch (err) {
        console.error('Failed to create tray:', err);
    }
}

// Set up IPC handlers
function setupIPC() {
    ipcMain.on('minimize-to-tray', () => {
        if (!mainWindow) return;
        mainWindow.minimizeFromTray = true;
        mainWindow.hide();
        // Reset the flag after a short delay to ensure the close event has been handled
        setTimeout(() => {
            if (mainWindow) {
                mainWindow.minimizeFromTray = false;
            }
        }, 100);
    });

    ipcMain.on('maximize-window', () => {
        if (!mainWindow) return;
        
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            lastWindowPosition = mainWindow.getBounds();
            mainWindow.maximize();
        }
    });
}

// App lifecycle handlers
app.whenReady().then(() => {
    createWindow();
    createTray();
    setupIPC();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            mainWindow?.show();
        }
    });
});

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', () => {
    if (!isQuitting && mainWindow) {
        mainWindow.hide();
        return;
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Application menu
const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Minimize to Tray',
                click: () => mainWindow?.hide()
            },
            { type: 'separator' },
            {
                label: 'Exit',
                click: () => {
                    isQuitting = true;
                    app.quit();
                }
            }
        ]
    }
];

Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate)); 
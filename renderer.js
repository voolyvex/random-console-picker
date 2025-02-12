// State management
const state = {
    originalDefaults: [],
    systems: [],
    backupInterval: null,
    isInputEnabled: true,
    isManagementVisible: false,
    debugFrameId: null,
    lastInputEvent: null
};

// DOM Elements
const elements = {
    result: document.getElementById('result'),
    consoleList: document.getElementById('consoleList'),
    newConsoleInput: document.getElementById('newConsole'),
    managementSection: document.getElementById('managementSection'),
    notification: document.getElementById('notification'),
    overlay: document.getElementById('overlay'),
    settingsToggle: document.getElementById('settingsToggle'),
    closeButton: document.getElementById('closeButton'),
    appTitle: document.getElementById('appTitle'),
    pickButton: document.getElementById('pickButton'),
    addButton: document.getElementById('addButton'),
    removeButton: document.getElementById('removeButton'),
    saveButton: document.getElementById('saveButton'),
    copyrightLink: document.getElementById('copyrightLink')
};

// Constants
const MAX_SYSTEMS = 100;
const BASE_NOTIFICATION_DURATION = 2250; // 2250ms
const WORDS_PER_SECOND = 4; // 4 words per second
const MIN_NOTIFICATION_DURATION = 1500; // 1500ms
const MAX_NOTIFICATION_DURATION = 6000; // 6000ms
const BACKUP_INTERVAL = 300000; // 5 minutes

// Utility functions
function showNotification(message, forcedDuration = null) {
    if (!elements.notification) return;

    if (elements.notification.hideTimeout) {
        clearTimeout(elements.notification.hideTimeout);
        elements.notification.hideTimeout = null;
    }

    // Calculate duration based on message length
    const wordCount = message.split(/\s+/).length;
    const calculatedDuration = forcedDuration || Math.min(
        Math.max(
            BASE_NOTIFICATION_DURATION,
            (wordCount / WORDS_PER_SECOND) * 1000
        ),
        MAX_NOTIFICATION_DURATION
    );

    elements.notification.textContent = message;
    elements.notification.style.display = 'block';
    
    requestAnimationFrame(() => {
        elements.notification.style.opacity = '1';
        // Ensure inputs are enabled immediately after showing notification
        elements.newConsoleInput.disabled = false;
        elements.consoleList.disabled = false;
    });

    elements.notification.hideTimeout = setTimeout(() => {
        elements.notification.style.opacity = '0';
        setTimeout(() => {
            elements.notification.style.display = 'none';
        }, 200);
    }, calculatedDuration);
}

function enableInputs() {
    console.log('enableInputs called', {
        currentState: { ...state },
        inputDisabled: elements.newConsoleInput.disabled,
        inputDisplay: elements.newConsoleInput.style.display,
        managementVisible: elements.managementSection.classList.contains('visible')
    });
    
    // Cancel any pending animation frame
    if (state.debugFrameId !== null) {
        cancelAnimationFrame(state.debugFrameId);
        state.debugFrameId = null;
    }
    
    state.isInputEnabled = true;
    
    // Ensure we're working with the actual DOM element
    const input = elements.newConsoleInput;
    if (!input) {
        console.error('Input element not found');
        return;
    }

    // Clear any existing disabled state
    input.disabled = false;
    input.style.pointerEvents = 'auto';
    input.style.display = '';
    
    // Force a DOM reflow to ensure state is updated
    input.style.display = 'none';
    input.offsetHeight; // Force reflow
    input.style.display = '';
    
    console.log('After state update', {
        inputDisabled: input.disabled,
        inputDisplay: input.style.display,
        pointerEvents: input.style.pointerEvents
    });
    
    // Only focus if management section is visible
    if (state.isManagementVisible) {
        // Use a more reliable focus method with debug logging
        state.debugFrameId = requestAnimationFrame(() => {
            console.log('Animation frame executing', {
                timeElapsed: state.lastInputEvent ? performance.now() - state.lastInputEvent : null,
                inputState: {
                    disabled: input.disabled,
                    display: input.style.display,
                    focused: document.activeElement === input
                }
            });
            
            input.blur();
            input.focus();
            
            // Ensure the cursor is at the end of any existing text
            const len = input.value.length;
            input.setSelectionRange(len, len);
            
            // Verify focus state after changes
            console.log('Focus state after changes', {
                focused: document.activeElement === input,
                selectionStart: input.selectionStart,
                selectionEnd: input.selectionEnd
            });
            
            state.debugFrameId = null;
        });
    }
}

// State management functions
function updateState(newSystems) {
    state.systems = [...newSystems];
    saveSystems();
    updateConsoleList();
    enableInputs();
}

function saveSystems() {
    try {
        if (!Array.isArray(state.systems)) {
            throw new Error('Systems is not an array');
        }
        
        const cleanSystems = state.systems
            .map(system => system.toString().trim())
            .filter(system => system !== '');
        
        localStorage.setItem('consoleSystems', JSON.stringify(cleanSystems));
        updateConsoleList();
    } catch (e) {
        console.error('Failed to save systems:', e);
        showNotification('Failed to save changes. Please check storage availability.');
    }
}

function updateConsoleList() {
    elements.consoleList.innerHTML = '';
    state.systems.forEach(system => {
        const option = new Option(system, system);
        elements.consoleList.add(option);
    });
}

// Event handlers
function handleAddConsole() {
    const newConsole = elements.newConsoleInput.value.trim();
    if (!newConsole) return;

    if (state.systems.includes(newConsole)) {
        showNotification(`${newConsole} is already in the list`);
        return;
    }
    
    if (state.systems.length >= MAX_SYSTEMS) {
        showNotification(`Maximum number of consoles reached (${MAX_SYSTEMS})`);
        return;
    }
    
    state.systems.push(newConsole);
    saveSystems();
    elements.newConsoleInput.value = '';
    showNotification(`Added ${newConsole} to the list`);
}

function handleRemoveSelected() {
    const selectedOptions = Array.from(elements.consoleList.selectedOptions);
    if (selectedOptions.length === 0) {
        showNotification('Please select systems to remove');
        return;
    }
    
    try {
        const newSystems = state.systems.filter(system => 
            !selectedOptions.some(option => option.value === system)
        );
        
        if (newSystems.length === 0) {
            updateState([...state.originalDefaults]);
            showNotification('Reset to default list (empty list not allowed)');
        } else {
            updateState(newSystems);
            showNotification(`Removed ${selectedOptions.length} system(s)`);
        }
    } catch (e) {
        console.error('Failed to remove systems:', e);
        showNotification('Failed to remove selected systems');
    }
}

function handleSaveList() {
    try {
        saveSystems();
        showNotification('Console list saved successfully!');
    } catch (e) {
        console.error('Failed to save list:', e);
        showNotification('Failed to save console list');
    }
}

function handlePickRandomSystem() {
    if (state.systems.length === 0) {
        elements.result.textContent = 'No systems available. Please add some!';
        return;
    }

    const randomIndex = Math.floor(Math.random() * state.systems.length);
    const selectedSystem = state.systems[randomIndex];
    elements.result.textContent = selectedSystem;
}

function toggleManagement() {
    const isVisible = elements.managementSection.classList.contains('visible');
    
    if (isVisible) {
        elements.managementSection.classList.remove('visible');
        elements.settingsToggle.querySelector('i').style.transform = 'rotate(0deg)';
        elements.managementSection.style.pointerEvents = 'none';
        state.isInputEnabled = false;
        state.isManagementVisible = false;
    } else {
        elements.managementSection.classList.add('visible');
        elements.settingsToggle.querySelector('i').style.transform = 'rotate(45deg)';
        elements.managementSection.style.pointerEvents = 'auto';
        state.isInputEnabled = true;
        state.isManagementVisible = true;
        
        // Ensure input is ready for interaction
        requestAnimationFrame(() => {
            elements.newConsoleInput.disabled = false;
            elements.newConsoleInput.style.pointerEvents = 'auto';
            elements.newConsoleInput.blur();
            setTimeout(() => {
                if (state.isInputEnabled && state.isManagementVisible) {
                    elements.newConsoleInput.focus();
                }
            }, 0);
        });
    }
}

function toggleMaximize() {
    require('electron').ipcRenderer.send('maximize-window');
}

function closeWindow() {
    showNotification('Application minimized to system tray. Click the tray icon to restore.');
    require('electron').ipcRenderer.send('minimize-to-tray');
}

async function showLicense() {
    try {
        const response = await fetch('LICENSE');
        const text = await response.text();
        const licenseWindow = window.open('', 'License', 'width=600,height=400');
        licenseWindow.document.write(`
            <html>
                <head>
                    <title>License Information</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
                            line-height: 1.6;
                            padding: 20px;
                            max-width: 800px;
                            margin: 0 auto;
                            background-color: #f8f9fa;
                            color: #2c3e50;
                        }
                        @media (prefers-color-scheme: dark) {
                            body {
                                background-color: #1a1a1a;
                                color: #ecf0f1;
                            }
                        }
                        pre {
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            padding: 15px;
                            background-color: rgba(0,0,0,0.05);
                            border-radius: 8px;
                        }
                    </style>
                </head>
                <body>
                    <pre>${text}</pre>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error loading LICENSE:', error);
        showNotification('Failed to load license information');
    }
}

// Backup system
function setupBackupSystem() {
    // Perform initial backup
    backupSystems();
    
    // Set up periodic backup
    state.backupInterval = setInterval(backupSystems, BACKUP_INTERVAL);
    
    // Backup before unload
    window.addEventListener('beforeunload', backupSystems);
}

function backupSystems() {
    try {
        const backup = {
            timestamp: new Date().toISOString(),
            systems: state.systems
        };
        localStorage.setItem('systemsBackup', JSON.stringify(backup));
    } catch (e) {
        console.error('Backup failed:', e);
    }
}

function restoreFromBackup() {
    try {
        const backup = localStorage.getItem('systemsBackup');
        if (backup) {
            const parsed = JSON.parse(backup);
            if (parsed.systems) {
                state.systems = parsed.systems;
                saveSystems();
                showNotification('Systems restored from backup');
                return true;
            }
        }
    } catch (e) {
        console.error('Restore failed:', e);
    }
    return false;
}

// Event listeners
function setupEventListeners() {
    const input = elements.newConsoleInput;
    
    // Ensure input is properly initialized
    input.addEventListener('mousedown', (e) => {
        if (state.isInputEnabled && state.isManagementVisible) {
            e.stopPropagation();
        }
    });

    input.addEventListener('click', (e) => {
        if (state.isInputEnabled && state.isManagementVisible) {
            e.stopPropagation();
            input.focus();
        }
    });

    input.addEventListener('focus', () => {
        if (!state.isInputEnabled || !state.isManagementVisible) {
            input.blur();
        }
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && state.isInputEnabled && state.isManagementVisible) {
            e.preventDefault();
            handleAddConsole();
        }
    });

    // Add window blur/focus handlers to manage visibility state
    window.addEventListener('blur', () => {
        if (elements.managementSection.classList.contains('visible')) {
            state.isManagementVisible = true;
        }
    });

    window.addEventListener('focus', () => {
        if (state.isManagementVisible) {
            elements.managementSection.classList.add('visible');
            elements.settingsToggle.querySelector('i').style.transform = 'rotate(45deg)';
            elements.managementSection.style.pointerEvents = 'auto';
            state.isInputEnabled = true;
        }
    });

    // Remove overlay click handler since we're not using overlay anymore
    elements.closeButton.addEventListener('click', closeWindow);
    elements.appTitle.addEventListener('dblclick', toggleMaximize);
    elements.pickButton.addEventListener('click', handlePickRandomSystem);
    elements.addButton.addEventListener('click', handleAddConsole);
    elements.removeButton.addEventListener('click', handleRemoveSelected);
    elements.saveButton.addEventListener('click', handleSaveList);
    elements.settingsToggle.addEventListener('click', toggleManagement);
    elements.copyrightLink.addEventListener('click', showLicense);

    // Prevent clicks in management section from bubbling
    elements.managementSection.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Add debug event listener
    input.addEventListener('input', (e) => {
        console.log('Input event fired', {
            value: e.target.value,
            timestamp: performance.now(),
            inputState: {
                disabled: e.target.disabled,
                display: e.target.style.display,
                focused: document.activeElement === e.target
            }
        });
    });

    input.addEventListener('blur', () => {
        console.log('Input blur event', {
            timestamp: performance.now(),
            inputEnabled: state.isInputEnabled,
            managementVisible: state.isManagementVisible,
            activeElement: document.activeElement.tagName
        });
    });
}

// Initialize
function initSystems() {
    try {
        const storedSystems = localStorage.getItem('consoleSystems');
        
        if (!storedSystems) {
            state.systems = [...state.originalDefaults];
        } else {
            try {
                state.systems = JSON.parse(storedSystems);
            } catch (e) {
                console.error('Error parsing stored systems:', e);
                state.systems = [...state.originalDefaults];
            }
        }
        
        updateState(state.systems);
    } catch (e) {
        console.error('System initialization error:', e);
        updateState([...state.originalDefaults]);
    }
}

// IPC handlers
require('electron').ipcRenderer.on('init-systems', (event, systems) => {
    if (Array.isArray(systems)) {
        state.originalDefaults = systems;
        initSystems();
    }
});

require('electron').ipcRenderer.on('window-state-change', (event, state) => {
    if (state === 'maximized') {
        document.body.classList.add('maximized');
    } else {
        document.body.classList.remove('maximized');
    }
});

// Start the application
setupEventListeners();
setupBackupSystem(); 
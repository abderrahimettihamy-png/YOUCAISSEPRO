const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Démarrer le backend
function startBackend() {
  const isDev = !app.isPackaged;
  const backendPath = isDev 
    ? path.join(__dirname, 'backend', 'src', 'index.ts')
    : path.join(process.resourcesPath, 'backend', 'dist', 'index.js');

  if (isDev) {
    // Mode développement : utiliser ts-node
    backendProcess = spawn('npx', ['ts-node', backendPath], {
      cwd: path.join(__dirname, 'backend'),
      shell: true
    });
  } else {
    // Mode production : utiliser node
    backendProcess = spawn('node', [backendPath], {
      cwd: path.join(process.resourcesPath, 'backend'),
      shell: true
    });
  }

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

// Créer la fenêtre principale
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'YOU CAISSE PRO',
    icon: path.join(__dirname, 'frontend', 'public', 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    autoHideMenuBar: true,
    fullscreen: false
  });

  // Charger l'application
  const isDev = !app.isPackaged;
  
  if (isDev) {
    // Mode développement : charger depuis Vite
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Mode production : charger depuis dist
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Quand Electron est prêt
app.whenReady().then(() => {
  // Configuration CSP (Content Security Policy)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const isDev = !app.isPackaged;
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev 
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:* ws://localhost:* https://api.youcaisse.pro;"
            : "default-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:3001 https://api.youcaisse.pro;"
        ]
      }
    });
  });

  // Démarrer le backend
  startBackend();
  
  // Attendre que le backend démarre (2 secondes)
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter l'application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Arrêter le backend
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});

app.on('quit', () => {
  // S'assurer que le backend est arrêté
  if (backendProcess) {
    backendProcess.kill();
  }
});

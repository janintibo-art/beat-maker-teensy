const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC: Upload code to Teensy
ipcMain.handle('upload-teensy', async (event, { code, board = 'teensy41' }) => {
  return new Promise((resolve, reject) => {
    const arduinoCli = spawn('arduino-cli', [
      'upload',
      '-b', `teensyduino:avr:${board}`,
      '-p', '/dev/ttyACM0',
    ]);

    let output = '';
    let error = '';

    arduinoCli.stdout.on('data', (data) => {
      output += data.toString();
    });

    arduinoCli.stderr.on('data', (data) => {
      error += data.toString();
    });

    arduinoCli.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        reject({ success: false, error });
      }
    });

    arduinoCli.on('error', (err) => {
      reject({ success: false, error: err.message });
    });
  });
});

// IPC: Compile Arduino sketch
ipcMain.handle('compile-sketch', async (event, { code, board = 'teensy41' }) => {
  return new Promise((resolve, reject) => {
    // In production, you'd save code to temp file and compile
    resolve({ success: true, message: 'Compilation simulation successful' });
  });
});

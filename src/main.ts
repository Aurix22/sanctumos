// src/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { setupHALHandlers } from './main/hal-handlers';

try { if (require('electron-squirrel-startup')) app.quit(); } catch {}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    ...(process.platform === 'darwin' ? { trafficLightPosition: { x: 15, y: 15 } } : {}),
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if ((global as any).MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL((global as any).MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    const name = (global as any).MAIN_WINDOW_VITE_NAME ?? 'index';
    mainWindow.loadFile(path.join(__dirname, `../renderer/${name}/index.html`));
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => { mainWindow = null; });
};

app.whenReady().then(() => {
  setupHALHandlers();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.setName('Sanctum.OS');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder');
app.commandLine.appendSwitch('use-gl', 'desktop');
app.commandLine.appendSwitch('enable-gpu-rasterization');

app.on('web-contents-created', (_, contents) => {
  contents.on('new-window', (event) => event.preventDefault());
});

// Window control
ipcMain.on('window:minimize', () => { mainWindow?.minimize(); });
ipcMain.on('window:maximize', () => {
  if (!mainWindow) return;
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('window:close', () => { mainWindow?.close(); });

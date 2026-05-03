const { app, BrowserWindow, net, protocol, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'pawtrace',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

const appRoot = path.join(__dirname, '..');
const distRoot = path.join(appRoot, 'frontend', 'dist');

function resolveDistPath(urlString) {
  const requestUrl = new URL(urlString);
  const requestedPath = decodeURIComponent(requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname);
  const filePath = path.normalize(path.join(distRoot, requestedPath));
  if (!filePath.startsWith(distRoot)) {
    return path.join(distRoot, 'index.html');
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }
  return path.join(distRoot, 'index.html');
}

async function registerAppProtocol() {
  protocol.handle('pawtrace', (request) => {
    const filePath = resolveDistPath(request.url);
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    title: 'PawTrace',
    backgroundColor: '#fff7f4',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('pawtrace://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadURL('pawtrace://app/index.html');
}

app.whenReady().then(async () => {
  await registerAppProtocol();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

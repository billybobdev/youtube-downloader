import sysPath from 'path';
import { app, BrowserWindow } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

log.transports.file.level = 'silly';
log.transports.file.file = sysPath.resolve(app.getPath('userData'), 'logfile.txt');

autoUpdater.logger = log;

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\') // eslint-disable-line
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
  });

  mainWindow.loadURL(winURL);

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

autoUpdater.on('checking-for-update', () => {
  log.info('checking-for-update');
});

autoUpdater.on('update-available', (info) => {
  log.info('update', info);
});

autoUpdater.on('update-not-available', (info) => {
  log.info('noupdate', info);
});

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates();
});


import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import settings from 'electron-settings';
import { resolveHtmlPath } from './util';
import auth_controller from '../auth/controller';
import command_ipc from './ipc/command';
import webhook_ipc from './ipc/webhook';
import settings_ipc from './ipc/settings';
import token_ipc from './ipc/token';

let main_window: BrowserWindow | null;
let first_run = false;

// #region Debug Tooling (might remove)
// if (process.env.NODE_ENV === 'production') {
//   const sourceMapSupport = require('source-map-support');
//   sourceMapSupport.install();
// }

// const isDebug =
//   process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// if (isDebug) {
//   require('electron-debug')();
// }

// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS'];

//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload,
//     )
//     .catch(console.log);
// };
// #endregion

const create_window = () => {
  /*
  if (isDebug) {
    await installExtensions();
  }
  */

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  main_window = new BrowserWindow({
    show: true,
    width: 800,
    minWidth: 800,
    height: 650,
    minHeight: 650,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  main_window.loadURL(resolveHtmlPath('index.html'));

  // Enforce required settings
  const settings_keys = ['username', 'console', 'token'];
  settings_keys.forEach((key) => {
    if (!settings.hasSync(key)) {
      first_run = true;
    }
  });

  main_window.setMenuBarVisibility(false);

  main_window.on('show', () => {
    if (!main_window) throw new Error('"main_window" is not defined');
    main_window.focus();
  });

  main_window.on('ready-to-show', () => {
    if (!main_window) throw new Error('"main_window" is not defined');
    main_window.show();
  });

  main_window.on('closed', () => {
    main_window = null;
  });

  const auth_login = auth_controller(ipcMain, main_window);

  if (first_run) {
    main_window.webContents.on('did-finish-load', () => {
      main_window!.webContents.send('first-run');
      auth_login();
    });
  }

  command_ipc(ipcMain, main_window);
  settings_ipc(ipcMain);
  webhook_ipc(ipcMain);
  token_ipc(ipcMain, main_window!, auth_login);
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  create_window();

  app.on('activate', () => {
    if (main_window === null) create_window();
  });
});

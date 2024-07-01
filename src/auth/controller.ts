import Express from 'express';
import type { Server } from 'http';
import { BrowserWindow, type IpcMain } from 'electron';
import { auth_code, get_login_url, refresh_token } from './auth';
import { redirect_uri, client_id } from './config.json';

let auth_window: BrowserWindow | null;
let http_server: Server | null;
let last_auth_state: boolean | null;

const login = (main_window: BrowserWindow) => {
  if (!auth_window) {
    console.log('Auth window not created.');
    return;
  } // Handle error

  const { auth_url, code_verifier } = get_login_url();
  console.log(auth_url, code_verifier);
  auth_window.loadURL(auth_url);

  const app = Express();
  app.get('/callback', async (req: any) => {
    const { code } = req.query;
    const token_params = {
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id,
      code_verifier,
    };

    try {
      const token_data = await auth_code.getToken(token_params);
      main_window.webContents.send('auth-user-success', token_data);
      last_auth_state = true;
    } catch (error: any) {
      main_window.webContents.send('auth-user-fail', error.message);
      last_auth_state = false;
    }

    auth_window!.close();
  });

  http_server = app.listen(3000);
};

export default (ipc_main: IpcMain, main_window: BrowserWindow) => {
  const create_window = () => {
    if (auth_window) return; // Do nothing if window already exists

    auth_window = new BrowserWindow({
      webPreferences: {
        webSecurity: false,
      },
      parent: main_window,
      resizable: true,
      modal: true,
      height: 800,
      width: 800,
    });

    auth_window.once('ready-to-show', () => auth_window!.show());
    auth_window.on('closed', () => {
      if (!last_auth_state) {
        main_window.webContents.send(
          'auth-user-fail',
          'Window closed before authentication was completed.',
        );
      }

      auth_window = null;
      last_auth_state = null;
      http_server!.close();
    });

    login(main_window);
  };

  ipc_main.on('auth-user', () => create_window());

  ipc_main.on('refresh-token', async (event, args) => {
    const token_data = await refresh_token(args.token);

    if (!token_data) {
      event.reply('refresh-token-fail', 'Failed to refresh token.');
      return;
    }

    event.reply('refresh-token-success', token_data);
  });
};

import { type IpcMain } from 'electron';
import settings from 'electron-settings';
import {
  GlobalKeyboardListener,
  IGlobalKeyEvent,
} from 'node-global-key-listener';

const key_listener = new GlobalKeyboardListener();

export default (ipc_main: IpcMain) => {
  ipc_main.on('set-console-key', (event) => {
    const KeyEvent = (e: IGlobalKeyEvent) => {
      if (e.state === 'UP' && e.name !== 'MOUSE LEFT' && e.name !== 'SPACE') {
        settings.setSync('console', e);
        event.reply('set-console-key-response', { consoleKey: e });
        key_listener.removeListener(KeyEvent);
      }
    };

    key_listener.addListener(KeyEvent);
  });

  ipc_main.on('get-settings', (event) => {
    const username = settings.getSync('username');
    const consoleKey = settings.getSync('console') as IGlobalKeyEvent;

    event.reply('get-settings-response', { username, consoleKey });
  });

  ipc_main.on('set-username', (_event, args) => {
    settings.setSync('username', args.username);
  });
};

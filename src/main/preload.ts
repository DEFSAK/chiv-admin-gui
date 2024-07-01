// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { IGlobalKeyEvent } from 'node-global-key-listener';
import type { Id } from 'react-toastify';

// For auto-completion
export type Channels =
  | 'command'
  | 'command-response'
  | 'set-console-key'
  | 'set-console-key-response'
  | 'get-settings'
  | 'get-settings-response'
  | 'set-username'
  | 'encrypt-token'
  | 'refresh-token'
  | 'refresh-token-success'
  | 'refresh-token-fail'
  | 'get-refresh-token'
  | 'get-refresh-token-response'
  | 'webhook'
  | 'auth-user'
  | 'auth-user-success'
  | 'auth-user-fail'
  | 'first-run';
// | 'setupComplete'
// | 'command'
// | 'commandResponse'
// | 'openSettings'
// | 'discord'
// | 'setConsoleKey'
// | 'setConsoleKeyResponse'
// | 'setUsername'
// | 'getSettings'
// | 'settingsResponse'
// | 'firstRun'
// | 'authenticate_user'
// | 'oauth-fail'
// | 'oauth-success'
// | 'token-refresh'
// | 'token-refresh-success'
// | 'token-refresh-fail'
// | 'encrypt-token'
// | 'get-refresh-token'
// | 'get-refresh-token-response';

export interface Args {
  command?: string;
  commandName?: string;
  username?: string;
  console?: string;
  Name?: string;
  ID?: string;
  Reason?: string;
  Duration?: number;
  error?: any;
  consoleKey?: IGlobalKeyEvent;
  toast?: Id;
  TokenData?: any;
  token?: string;
}

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: Args[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: Args[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: Args[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: Args[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;

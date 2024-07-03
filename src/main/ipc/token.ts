import { safeStorage, type IpcMain, type BrowserWindow } from 'electron';
import settings from 'electron-settings';
import { refresh_token } from '../../auth/auth';

interface AuthToken {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  refresh_expires_at?: string;
}

const parseISOString = (ISOString: string) => {
  const SplitString = ISOString.split(/\D+/);
  const N = SplitString.map((x) => parseInt(x, 10));

  // eslint-disable-next-line no-plusplus
  return new Date(Date.UTC(N[0], --N[1], N[2], N[3], N[4], N[5], N[6]));
};
export default (
  ipc_main: IpcMain,
  main_window: BrowserWindow,
  login: (main_window: BrowserWindow) => void,
) => {
  const encrypt_token = async (TokenData: any) => {
    console.log(TokenData);

    const AccessToken = TokenData.access_token;
    const RefreshToken = TokenData.refresh_token;

    const ATExpires = TokenData.expires_in;
    const RTExpires = TokenData.refresh_token_expires_in;

    const ATTimestamp = new Date();
    ATTimestamp.setSeconds(ATTimestamp.getSeconds() + ATExpires);

    const RTTimestamp = new Date();
    RTTimestamp.setSeconds(RTTimestamp.getSeconds() + RTExpires);

    if (safeStorage.isEncryptionAvailable()) {
      const EncryptedAT = safeStorage.encryptString(AccessToken);
      const EncryptedRT = safeStorage.encryptString(RefreshToken);

      return {
        access_token: EncryptedAT.toString('base64'),
        refresh_token: EncryptedRT.toString('base64'),
        expires_at: ATTimestamp.toISOString(),
        refresh_expires_at: RTTimestamp.toISOString(),
      };
    }

    console.error('Encryption is not available');
    return null;
  };

  const get_refresh_token = (TokenData: AuthToken) => {
    const RefreshToken = TokenData.refresh_token;
    const Expires = parseISOString(TokenData.refresh_expires_at as string);
    const CurrentTime = Date.now();

    if (CurrentTime >= Expires.getTime()) {
      return null;
    }

    if (safeStorage.isEncryptionAvailable()) {
      try {
        const DecryptedToken = safeStorage.decryptString(
          Buffer.from(RefreshToken as string, 'base64'),
        );

        return DecryptedToken;
      } catch {
        return null;
      }
    } else {
      return null;
    }
  };

  ipc_main.on('encrypt-token', async (_, args) => {
    const { TokenData } = args;
    const EncryptedToken = await encrypt_token(TokenData);

    if (EncryptedToken) {
      settings.setSync('token', EncryptedToken);
    }
  });

  ipc_main.on('get-refresh-token', async (event) => {
    const TokenData = settings.getSync('token') as AuthToken;
    if (!TokenData) {
      event.reply('get-refresh-token-response', {
        error: 'Token not found',
        token: null,
      });
      login(main_window);
      return;
    }

    const RefreshToken = get_refresh_token(TokenData);
    if (!RefreshToken) {
      event.reply('get-refresh-token-response', {
        error: 'Token expired',
        token: null,
      });
      login(main_window);
      return;
    }

    event.reply('get-refresh-token-response', {
      error: null,
      token: RefreshToken,
    });
  });

  ipc_main.on('get-access-token', async (event) => {
    let TokenData = settings.getSync('token') as AuthToken;
    if (!TokenData) {
      event.reply('get-access-token-response', {
        error: 'Token not found',
        token: null,
      });
      login(main_window);
      return;
    }

    let AccessToken = TokenData.access_token;
    const Expires = parseISOString(TokenData.expires_at as string);
    const CurrentTime = Date.now();

    if (CurrentTime >= Expires.getTime()) {
      const RefreshToken = get_refresh_token(TokenData);
      if (!RefreshToken) {
        event.reply('get-access-token-response', {
          error: 'Token expired and refresh failed',
          token: null,
        });
        login(main_window);
        return;
      }

      TokenData = await refresh_token(RefreshToken);
      AccessToken = TokenData.access_token;

      if (!AccessToken) {
        event.reply('get-access-token-response', {
          error: 'Token expired and refresh failed',
          token: null,
        });
        login(main_window);
        return;
      }

      event.reply('get-access-token-response', {
        error: null,
        token: AccessToken,
      });

      const EncryptedToken = await encrypt_token(TokenData);
      if (EncryptedToken) {
        settings.setSync('token', EncryptedToken);
      }
    }

    if (safeStorage.isEncryptionAvailable()) {
      try {
        const DecryptedToken = safeStorage.decryptString(
          Buffer.from(AccessToken as string, 'base64'),
        );

        event.reply('get-access-token-response', {
          error: null,
          token: DecryptedToken,
        });
      } catch {
        event.reply('get-access-token-response', {
          error: 'Failed to decrypt token',
          token: null,
        });
      }
    } else {
      event.reply('get-access-token-response', {
        error: 'Failed to decrypt token',
        token: null,
      });
    }
  });
};

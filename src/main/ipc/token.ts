import { safeStorage, type IpcMain } from 'electron';
import settings from 'electron-settings';

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
export default (ipc_main: IpcMain) => {
  ipc_main.on('encrypt-token', async (_, args) => {
    const { TokenData } = args;
    const AccessToken = TokenData.token.access_token;
    const RefreshToken = TokenData.token.refresh_token;

    const ATExpires = TokenData.token.expires_in;
    const RTExpires = TokenData.token.refresh_token_expires_in;

    const ATTimestamp = new Date();
    ATTimestamp.setSeconds(ATTimestamp.getSeconds() + ATExpires);

    const RTTimestamp = new Date();
    RTTimestamp.setSeconds(RTTimestamp.getSeconds() + RTExpires);

    if (safeStorage.isEncryptionAvailable()) {
      const EncryptedAT = safeStorage.encryptString(AccessToken);
      const EncryptedRT = safeStorage.encryptString(RefreshToken);

      settings.setSync('token', {
        access_token: EncryptedAT.toString('base64'),
        refresh_token: EncryptedRT.toString('base64'),
        expires_at: ATTimestamp.toISOString(),
        refresh_expires_at: RTTimestamp.toISOString(),
      });
    } else {
      console.error('Encryption is not available');
    }
  });

  ipc_main.on('get-refresh-token', (event) => {
    const TokenData = settings.getSync('token') as AuthToken;
    if (!TokenData) {
      event.reply('get-refresh-token-response', {
        error: 'Token not found',
        token: null,
      });
      return;
    }

    const RefreshToken = TokenData.refresh_token;
    const Expires = parseISOString(TokenData.refresh_expires_at as string);
    const CurrentTime = Date.now();

    if (CurrentTime >= Expires.getTime()) {
      event.reply('get-refresh-token-response', {
        error: 'Token expired',
        token: null,
      });
      return;
    }

    if (safeStorage.isEncryptionAvailable()) {
      try {
        const DecryptedToken = safeStorage.decryptString(
          Buffer.from(RefreshToken as string, 'base64'),
        );

        event.reply('get-refresh-token-response', {
          error: null,
          token: DecryptedToken,
        });
      } catch {
        event.reply('get-refresh-token-response', {
          error: 'Failed to decrypt token',
          token: null,
        });
      }
    } else {
      event.reply('get-refresh-token-response', {
        error: 'Failed to decrypt token',
        token: null,
      });
    }
  });
};

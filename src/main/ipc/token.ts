import { app, safeStorage, type IpcMain, type BrowserWindow } from 'electron';
import * as fs from 'fs';
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
  const userDataPath = app.getPath('userData');
  const tokenPath = `${userDataPath}/token`;

  if (!fs.existsSync(tokenPath)) {
    fs.mkdirSync(tokenPath);
  }

  const refreshTokenPath = `${tokenPath}/r_token`;
  const accessTokenPath = `${tokenPath}/a_token`;

  if (!fs.existsSync(refreshTokenPath)) {
    fs.writeFileSync(refreshTokenPath, '');
  }

  if (!fs.existsSync(accessTokenPath)) {
    fs.writeFileSync(accessTokenPath, '');
  }

  const read_token_file = (type: string) => {
    if (type !== 'r' && type !== 'a') {
      return null;
    }

    const path = `${tokenPath}/${type}_token`;

    if (!fs.existsSync(path)) {
      return null;
    }

    const data = fs.readFileSync(path, { encoding: 'utf-8' });
    const values = data.split('\n');

    return {
      token: values[0],
      expires_at: values[1],
    };
  };

  const read_token = (): AuthToken | null => {
    const AccessToken = read_token_file('a');
    const RefreshToken = read_token_file('r');

    if (!AccessToken || !RefreshToken) {
      return null;
    }

    return {
      access_token: AccessToken.token,
      refresh_token: RefreshToken.token,
      expires_at: AccessToken.expires_at,
      refresh_expires_at: RefreshToken.expires_at,
    };
  };

  const write_token = (type: string, token: string, expires_at: string) => {
    console.log('Writing token', type, token, expires_at);

    if (type !== 'r' && type !== 'a') {
      return;
    }

    const path = `${tokenPath}/${type}_token`;
    fs.writeFile(path, `${token}\n${expires_at}`, 'utf-8', (err) => {
      console.log(err);
    });
  };

  const encrypt_token = (TokenData: any) => {
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

  const decrypt_token = (TokenData: AuthToken | null): AuthToken | null => {
    if (!TokenData) {
      return null;
    }

    if (safeStorage.isEncryptionAvailable()) {
      try {
        const DecryptedAT = safeStorage.decryptString(
          Buffer.from(TokenData.access_token as string, 'base64'),
        );

        const DecryptedRT = safeStorage.decryptString(
          Buffer.from(TokenData.refresh_token as string, 'base64'),
        );

        return {
          access_token: DecryptedAT,
          refresh_token: DecryptedRT,
          expires_at: TokenData.expires_at,
          refresh_expires_at: TokenData.refresh_expires_at,
        };
      } catch {
        return null;
      }
    }

    return null;
  };

  ipc_main.on('encrypt-token', (_, args) => {
    const { TokenData } = args;
    const Encrypted = encrypt_token(TokenData.token);

    if (Encrypted) {
      write_token('a', Encrypted.access_token, Encrypted.expires_at);
      write_token('r', Encrypted.refresh_token, Encrypted.refresh_expires_at);
    }
  });

  ipc_main.on('get-refresh-token', (event) => {
    let TokenData = read_token();
    if (TokenData) {
      TokenData = decrypt_token(TokenData);
    }

    if (!TokenData) {
      event.reply('get-refresh-token-response', {
        error: 'Token not found',
        token: null,
      });
      login(main_window);
      return;
    }

    const Expires = parseISOString(TokenData.refresh_expires_at as string);
    const CurrentTime = Date.now();

    if (CurrentTime >= Expires.getTime()) {
      event.reply('get-refresh-token-response', {
        error: 'Token expired',
        token: null,
      });
      login(main_window);
      return;
    }

    event.reply('get-refresh-token-response', {
      error: null,
      token: TokenData.refresh_token,
    });
  });

  ipc_main.handle('get-access-token', async () => {
    const do_refresh = async (token_data: AuthToken) => {
      if (!token_data.refresh_token) {
        login(main_window);
        return null;
      }

      const new_token_data = await refresh_token(token_data.refresh_token);

      if (!new_token_data || !new_token_data.access_token) {
        login(main_window);
        return null;
      }

      const Encrypted = encrypt_token(new_token_data);
      if (Encrypted) {
        console.log('Writing token');
        write_token('a', Encrypted.access_token, Encrypted.expires_at);
        write_token('r', Encrypted.refresh_token, Encrypted.refresh_expires_at);
      }

      return new_token_data.access_token;
    };

    const token_data = decrypt_token(read_token());
    if (!token_data) {
      return null;
    }

    console.log(token_data);

    if (!token_data.access_token) {
      return do_refresh(token_data);
    }

    const expires = parseISOString(token_data.expires_at as string);
    const current_time = Date.now();

    if (current_time >= expires.getTime()) {
      return do_refresh(token_data);
    }

    return token_data.access_token;
  });
};

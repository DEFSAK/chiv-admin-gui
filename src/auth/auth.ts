import { AuthorizationCode } from 'simple-oauth2';
import axios from 'axios';
import { generate_code_challenge, generate_code_verifier } from './pkce';
import {
  client_id,
  redirect_uri,
  base_url,
  authorize_endpoint,
  token_endpoint,
} from './config.json';

interface auth_url extends Record<string, string> {
  redirect_uri: string;
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
}

const random_state_string = () => {
  return Math.random().toString(36).substring(2, 15);
};

export const auth_code = new AuthorizationCode({
  client: {
    id: client_id,
    secret: '', // This is empty because we're using PKCE
  },
  auth: {
    tokenHost: base_url,
    authorizePath: authorize_endpoint,
    tokenPath: token_endpoint,
  },
  options: {
    bodyFormat: 'form',
    authorizationMethod: 'body',
  },
});

export const get_login_url = () => {
  const code_verifier = generate_code_verifier();
  const code_challenge = generate_code_challenge(code_verifier);

  const auth_url = auth_code.authorizeURL({
    redirect_uri,
    scope: `offline_access ${client_id}`,
    state: random_state_string(),
    code_challenge,
    code_challenge_method: 'S256',
  } as auth_url);

  return { auth_url, code_verifier };
};

export const refresh_token = async (token: string) => {
  const token_params = {
    grant_type: 'refresh_token',
    refresh_token: token,
    client_id,
  };

  try {
    const response = await axios.post(
      `${base_url}${token_endpoint}`,
      token_params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(error);

    return null;
  }
};

export const get_validated_players = async (
  token: string,
  players: Record<string, string>[],
) => {
  const response = await axios.post(
    'https://apim-chivvy.azure-api.net/rpc',
    {
      jsonrpc: '2.0',
      method: 'Validator.Validate',
      params: {
        players,
      },
      id: 1,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.data && response.data.result.validated_players) {
    return response.data.result.validated_players;
  }

  return null;
};

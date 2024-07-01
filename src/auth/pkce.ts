import crypto from 'crypto';

const sha256 = (buffer: crypto.BinaryLike) => {
  return crypto.createHash('sha256').update(buffer).digest();
};

const base64_url_encode = (buffer: Buffer) => {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const generate_code_verifier = () => {
  return base64_url_encode(crypto.randomBytes(32));
};

export const generate_code_challenge = (code_verifier: string) => {
  return base64_url_encode(sha256(code_verifier));
};

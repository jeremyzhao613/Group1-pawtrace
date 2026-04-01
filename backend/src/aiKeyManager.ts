import crypto from 'node:crypto';

function decryptAes256GcmBase64Parts(encryptedValue: string, secret: string): string {
  const parts = String(encryptedValue || '').split('.');
  if (parts.length !== 3) {
    throw new Error('Encrypted value must be in format iv.tag.ciphertext (base64 parts)');
  }
  const [ivB64, tagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const key = crypto.createHash('sha256').update(String(secret)).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let plaintext = decipher.update(ciphertext, undefined, 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}

function getDecryptedAiKey(opts: {
  encryptedEnvVarValue?: string;
  plainEnvVarValue?: string;
  secretEnvVarValue?: string;
  envNameForErrors: string;
}): string {
  const encryptedValue = opts.encryptedEnvVarValue || '';
  const plainValue = opts.plainEnvVarValue || '';
  const secret = opts.secretEnvVarValue || '';
  if (encryptedValue) {
    if (!secret) {
      throw new Error(`${opts.envNameForErrors}: AI_KEY_SECRET is required to decrypt`);
    }
    return decryptAes256GcmBase64Parts(encryptedValue, secret);
  }
  return plainValue;
}

export function getAiKeys(): { DASHSCOPE_API_KEY: string; GEMINI_API_KEY: string } {
  const AI_KEY_SECRET = process.env.AI_KEY_SECRET || '';
  const DASHSCOPE_API_KEY = getDecryptedAiKey({
    encryptedEnvVarValue: process.env.ENCRYPTED_DASHSCOPE_API_KEY,
    plainEnvVarValue: process.env.DASHSCOPE_API_KEY || '',
    secretEnvVarValue: AI_KEY_SECRET,
    envNameForErrors: 'ENCRYPTED_DASHSCOPE_API_KEY',
  });
  const GEMINI_API_KEY = getDecryptedAiKey({
    encryptedEnvVarValue: process.env.ENCRYPTED_GEMINI_API_KEY,
    plainEnvVarValue: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
    secretEnvVarValue: AI_KEY_SECRET,
    envNameForErrors: 'ENCRYPTED_GEMINI_API_KEY',
  });
  return { DASHSCOPE_API_KEY, GEMINI_API_KEY };
}

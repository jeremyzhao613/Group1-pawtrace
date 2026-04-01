const crypto = require('crypto');

function decryptAes256GcmBase64Parts(encryptedValue, secret) {
  // Expected format (all base64, separated by dots):
  //   ivB64.tagB64.ciphertextB64
  const parts = String(encryptedValue || '').split('.');
  if (parts.length !== 3) {
    throw new Error('Encrypted value must be in format iv.tag.ciphertext (base64 parts)');
  }

  const [ivB64, tagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');

  // Derive a 32-byte key from secret (so secret can be any length).
  const key = crypto.createHash('sha256').update(String(secret)).digest();

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(ciphertext, undefined, 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}

function getDecryptedAiKey({ encryptedEnvVarValue, plainEnvVarValue, secretEnvVarValue, envNameForErrors }) {
  const encryptedValue = encryptedEnvVarValue || '';
  const plainValue = plainEnvVarValue || '';
  const secret = secretEnvVarValue || '';

  // If an encrypted value is provided, decrypt it; otherwise fall back to plain value.
  if (encryptedValue) {
    if (!secret) {
      throw new Error(`${envNameForErrors}: AI_KEY_SECRET is required to decrypt`);
    }
    return decryptAes256GcmBase64Parts(encryptedValue, secret);
  }
  return plainValue;
}

function getAiKeys() {
  const AI_KEY_SECRET = process.env.AI_KEY_SECRET || '';

  // DashScope
  const DASHSCOPE_API_KEY = getDecryptedAiKey({
    encryptedEnvVarValue: process.env.ENCRYPTED_DASHSCOPE_API_KEY,
    plainEnvVarValue: process.env.DASHSCOPE_API_KEY || '',
    secretEnvVarValue: AI_KEY_SECRET,
    envNameForErrors: 'ENCRYPTED_DASHSCOPE_API_KEY'
  });

  // Gemini
  const GEMINI_API_KEY = getDecryptedAiKey({
    encryptedEnvVarValue: process.env.ENCRYPTED_GEMINI_API_KEY,
    plainEnvVarValue: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
    secretEnvVarValue: AI_KEY_SECRET,
    envNameForErrors: 'ENCRYPTED_GEMINI_API_KEY'
  });

  return { DASHSCOPE_API_KEY, GEMINI_API_KEY };
}

module.exports = { getAiKeys };


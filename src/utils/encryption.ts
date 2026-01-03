import CryptoJS from 'crypto-js';

// In a real app, the key should be derived from the user's PIN + a salt
// For this demo, we'll use a session-based key or a derived key from the PIN
// We'll assume the PIN is passed to these functions or stored in a secure memory context

export const encryptData = (data: string, key: string): string => {
  if (!data) return '';
  try {
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (e) {
    console.error('Encryption failed', e);
    return data;
  }
};
export const decryptData = (ciphertext: string, key: string): string => {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error('Decryption failed', e);
    return '***';
  }
};
export const hashPin = (pin: string): string => {
  return CryptoJS.SHA256(pin).toString();
};
export const generateEncryptionKey = (pin: string, salt = 'secure-vault-salt'): string => {
  return CryptoJS.PBKDF2(pin, salt, {
    keySize: 256 / 32,
    iterations: 1000
  }).toString();
};
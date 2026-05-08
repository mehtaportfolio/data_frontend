import { storage } from './storage';

export interface BiometricCredential {
  id: string;
  publicKey: string;
  counter: number;
}

const BIOMETRIC_STORAGE_KEY = 'secure_vault_biometric_credential';

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export const biometric = {
  async registerCredential(): Promise<boolean> {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported on this device');
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('Biometric authenticator not available on this device');
      }

      const userId = storage.getUserId();
      const userIdBuffer = new TextEncoder().encode(userId);

      const options: CredentialCreationOptions = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: 'SecureVault',
            id: window.location.hostname,
          },
          user: {
            id: userIdBuffer,
            name: userId,
            displayName: 'SecureVault User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          timeout: 30000,
          attestation: 'direct',
          userVerification: 'preferred',
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            requireResidentKey: false,
          },
        },
      };

      const credential = await navigator.credentials.create(options);

      if (!credential || credential.type !== 'public-key') {
        throw new Error('Failed to create biometric credential');
      }

      const publicKeyCredential = credential as PublicKeyCredential;
      const response = publicKeyCredential.response as AuthenticatorAttestationResponse;

      const credentialData: BiometricCredential = {
        id: bufferToBase64(publicKeyCredential.rawId),
        publicKey: bufferToBase64(response.attestationObject),
        counter: 0,
      };

      localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(credentialData));
      storage.setBiometricEnabled(true);

      return true;
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw error;
    }
  },

  async verifyCredential(): Promise<boolean> {
    try {
      if (!window.PublicKeyCredential) {
        return false;
      }

      const credentialJson = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
      if (!credentialJson) {
        return false;
      }

      const credentialData = JSON.parse(credentialJson) as BiometricCredential;

      const options: CredentialRequestOptions = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          userVerification: 'preferred',
          timeout: 30000,
          allowCredentials: [
            {
              id: base64ToBuffer(credentialData.id) as ArrayBuffer,
              type: 'public-key',
              transports: ['internal'],
            },
          ],
        },
      };

      const assertion = await navigator.credentials.get(options);

      if (!assertion || assertion.type !== 'public-key') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Biometric verification failed:', error);
      return false;
    }
  },

  isSupported(): boolean {
    return !!window.PublicKeyCredential;
  },

  getStoredCredential(): BiometricCredential | null {
    const credentialJson = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (!credentialJson) {
      return null;
    }
    try {
      return JSON.parse(credentialJson) as BiometricCredential;
    } catch {
      return null;
    }
  },

  clearCredential(): void {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
    storage.setBiometricEnabled(false);
  },
};

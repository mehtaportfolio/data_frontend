const STORAGE_KEYS = {
  THEME: 'secure_vault_theme',
  PIN_HASH: 'secure_vault_pin_hash',
  BIOMETRIC_ENABLED: 'secure_vault_biometric',
  IS_SETUP: 'secure_vault_is_setup',
  USER_ID: 'secure_vault_user_id'
};

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const storage = {
  getTheme: () => localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null,
  setTheme: (theme: 'light' | 'dark') => localStorage.setItem(STORAGE_KEYS.THEME, theme),
  getPinHash: () => localStorage.getItem(STORAGE_KEYS.PIN_HASH),
  setPinHash: (hash: string) => localStorage.setItem(STORAGE_KEYS.PIN_HASH, hash),
  isBiometricEnabled: () => localStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED) === 'true',
  setBiometricEnabled: (enabled: boolean) => localStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, String(enabled)),
  isSetup: () => localStorage.getItem(STORAGE_KEYS.IS_SETUP) === 'true',
  setSetup: (complete: boolean) => localStorage.setItem(STORAGE_KEYS.IS_SETUP, String(complete)),
  getUserId: (): string => {
    let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = generateUUID();
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  },
  clear: () => localStorage.clear()
};
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { hashPin, generateEncryptionKey } from '../utils/encryption';
import { api } from '../utils/api';
import { toast } from 'sonner';

interface AuthState {
  isAuthenticated: boolean;
  isSetup: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: localStorage.getItem('auth_token') !== null,
    isSetup: storage.isSetup()
  });
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    storage.clearEncryptionKey();
    setState(prev => ({
      ...prev,
      isAuthenticated: false
    }));
    navigate('/login');
  }, [navigate]);

  // Session timeout logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      if (state.isAuthenticated) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          logout();
          toast.info('Session timed out due to inactivity');
        }, 30 * 60 * 1000); // 30 minutes
      }
    };
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => document.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [state.isAuthenticated, logout]);

  const login = useCallback(async (pin: string) => {
    try {
      console.log('Attempting login with PIN via backend...');
      const response = await api.post<{ token: string; user: { id: string } }>('/api/auth/login', { pin });

      if (response && response.token) {
        localStorage.setItem('auth_token', response.token);
        
        // Generate and store the encryption key in sessionStorage
        const encryptionKey = generateEncryptionKey(pin);
        storage.setEncryptionKey(encryptionKey);
        
        setState(prev => ({
          ...prev,
          isAuthenticated: true
        }));
        
        storage.setPinHash(hashPin(pin));
        toast.success('Logged in successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
      return false;
    }
  }, []);
  const setup = useCallback((pin: string) => {
    const hash = hashPin(pin);
    storage.setPinHash(hash);
    storage.setSetup(true);
    
    // Generate and store the encryption key in sessionStorage
    const encryptionKey = generateEncryptionKey(pin);
    storage.setEncryptionKey(encryptionKey);
    
    localStorage.setItem('auth_token', 'true');
    setState({
      isAuthenticated: true,
      isSetup: true
    });
  }, []);
  const enableBiometric = useCallback(async () => {
    if (!window.PublicKeyCredential) {
      toast.error('Biometrics not supported on this device');
      return false;
    }
    try {
      // In a real app, we would create a credential here
      // For this demo, we'll just simulate success and set the flag
      storage.setBiometricEnabled(true);
      toast.success('Biometric login enabled');
      return true;
    } catch (error) {
      console.error(error);
      toast.error('Failed to enable biometrics');
      return false;
    }
  }, []);
  const loginWithBiometric = useCallback(async () => {
    if (!storage.isBiometricEnabled()) return false;
    try {
      // In a real app, we would verify the assertion
      // For this demo, we'll simulate a challenge
      // Note: We can't recover the encryption key from biometrics alone without a server or secure enclave
      // So in a real app, we might store the wrapped key in local storage

      // Simulating biometric success
      // In this demo, we'll ask for PIN if biometric succeeds because we need the encryption key
      // Or we could store the key in memory if the session is still valid but locked

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, []);
  return {
    ...state,
    login,
    setup,
    logout,
    enableBiometric,
    loginWithBiometric
  };
}
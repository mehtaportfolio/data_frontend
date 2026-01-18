import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { hashPin } from '../utils/encryption';
import { supabase } from '../utils/supabase';
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
        }, 5 * 60 * 1000); // 5 minutes
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
      console.log('Attempting login with PIN...');
      const { data, error } = await supabase
        .from('user_master')
        .select('master_password')
        .single();

      console.log('Supabase response:', { data, error });

      if (error || !data) {
        console.error('Query error:', error);
        toast.error(`Failed to verify credentials: ${error?.message || 'No data found'}`);
        return false;
      }

      console.log('Comparing PIN. Entered:', pin, 'Stored:', data.master_password);
      
      if (data.master_password === pin) {
        localStorage.setItem('auth_token', 'true');
        setState(prev => ({
          ...prev,
          isAuthenticated: true
        }));
        storage.setPinHash(hashPin(pin));
        toast.success('Logged in successfully');
        return true;
      }
      
      console.log('PIN mismatch');
      toast.error('Invalid PIN');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, []);
  const setup = useCallback((pin: string) => {
    const hash = hashPin(pin);
    storage.setPinHash(hash);
    storage.setSetup(true);
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
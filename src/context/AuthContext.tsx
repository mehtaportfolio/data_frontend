import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { hashPin } from '../utils/encryption';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';
import { biometric } from '../utils/biometric';

interface AuthState {
  isAuthenticated: boolean;
  isSetup: boolean;
}

interface AuthContextType extends AuthState {
  login: (pin: string) => Promise<boolean>;
  setup: (pin: string) => void;
  logout: () => void;
  enableBiometric: () => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isSetup: storage.isSetup()
  });

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setState(prev => ({
      ...prev,
      isAuthenticated: false
    }));
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const resetTimer = () => {
      if (state.isAuthenticated) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          logout();
          toast.info('Session timed out due to inactivity');
        }, 5 * 60 * 1000);
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
    if (!biometric.isSupported()) {
      toast.error('Biometrics not supported on this device');
      return false;
    }
    try {
      toast.loading('Please authenticate with your biometric...');
      const success = await biometric.registerCredential();
      if (success) {
        toast.success('Biometric login enabled');
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Failed to enable biometrics';
      toast.error(message);
      return false;
    }
  }, []);

  const loginWithBiometric = useCallback(async () => {
    if (!storage.isBiometricEnabled()) return false;
    try {
      const verified = await biometric.verifyCredential();
      if (verified) {
        localStorage.setItem('auth_token', 'true');
        setState(prev => ({
          ...prev,
          isAuthenticated: true
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }, []);

  const changePin = useCallback(async (oldPin: string, newPin: string) => {
    try {
      const { data, error } = await supabase
        .from('user_master')
        .select('master_password')
        .single();

      if (error || !data) {
        toast.error('Failed to verify current PIN');
        return false;
      }

      if (data.master_password !== oldPin) {
        toast.error('Current PIN is incorrect');
        return false;
      }

      const { error: updateError } = await supabase
        .from('user_master')
        .update({ master_password: newPin })
        .eq('id', 1);

      if (updateError) {
        console.error('Update error:', updateError);
        toast.error('Failed to update PIN');
        return false;
      }

      storage.setPinHash(hashPin(newPin));
      return true;
    } catch (error) {
      console.error('Change PIN error:', error);
      toast.error(`Failed to change PIN: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    setup,
    logout,
    enableBiometric,
    loginWithBiometric,
    changePin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

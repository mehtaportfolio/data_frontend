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
    isAuthenticated: !!localStorage.getItem('auth_token'),
    isSetup: storage.isSetup()
  });
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const isSetup = storage.isSetup();
    
    setState({
      isAuthenticated: !!token,
      isSetup: isSetup
    });
    
    setIsInitialized(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setState(prev => ({
      ...prev,
      isAuthenticated: false
    }));
    navigate('/login', { replace: true });
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
      console.log('🔐 Attempting login with PIN...');
      const { data, error } = await supabase
        .from('user_master')
        .select('master_password')
        .single();

      console.log('📡 Supabase response:', { hasData: !!data, error: error?.message });

      if (error) {
        console.error('❌ Query error:', error);
        
        if (error.message.includes('404') || error.message.includes('NOT_FOUND')) {
          toast.error('Database connection failed. Check Supabase environment variables on Vercel.');
        } else {
          toast.error(`Failed to verify credentials: ${error.message}`);
        }
        return false;
      }

      if (!data) {
        console.error('❌ No user data found');
        toast.error('User not found. Please set up your PIN first.');
        return false;
      }

      console.log('🔍 Comparing PIN...');
      
      if (data.master_password === pin) {
        localStorage.setItem('auth_token', 'true');
        setState(prev => ({
          ...prev,
          isAuthenticated: true
        }));
        storage.setPinHash(hashPin(pin));
        toast.success('✅ Logged in successfully');
        return true;
      }
      
      console.log('❌ PIN mismatch');
      toast.error('Invalid PIN');
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      if (message.includes('fetch') || message.includes('network')) {
        toast.error('Network error. Check your connection and Supabase settings.');
      } else {
        toast.error(`Authentication failed: ${message}`);
      }
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

  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-black">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
        <p className="text-xs text-gray-400">If this takes too long, check your Supabase settings</p>
      </div>
    </div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

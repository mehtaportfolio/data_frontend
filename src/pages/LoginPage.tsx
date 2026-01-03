import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { PinInput } from '../components/auth/PinInput';
import { BiometricButton } from '../components/auth/BiometricButton';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
export function LoginPage() {
  const {
    login,
    loginWithBiometric
  } = useAuth();
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePinComplete = async (pin: string) => {
    setIsLoading(true);
    try {
      const success = await login(pin);
      if (success) {
        navigate('/');
      } else {
        setError(true);
        setTimeout(() => setError(false), 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleBiometric = async () => {
    const success = await loginWithBiometric();
    if (success) {
      navigate('/');
    }
  };
  return <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-black text-center">
      <motion.div initial={{
      scale: 0.8,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} className="mb-12">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          SecureVault
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your 6-digit PIN to unlock
        </p>
      </motion.div>

      <div className="w-full max-w-sm space-y-8">
        <PinInput onComplete={handlePinComplete} error={error} label="Enter 6-digit PIN" disabled={isLoading} />

        <BiometricButton onClick={handleBiometric} disabled={isLoading} />
      </div>

      <div className="fixed bottom-8 text-xs text-gray-400">
        <p>Your data is encrypted locally.</p>
        <p>We cannot recover your PIN if lost.</p>
      </div>
    </div>;
}
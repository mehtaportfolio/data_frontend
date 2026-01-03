import React from 'react';
import { Fingerprint } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { storage } from '../../utils/storage';
interface BiometricButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}
export function BiometricButton({
  onClick,
  label = 'Unlock with Biometrics',
  disabled = false
}: BiometricButtonProps) {
  const isBiometricEnabled = storage.isBiometricEnabled();

  if (!isBiometricEnabled) {
    return null;
  }

  return <motion.div initial={{
    opacity: 0,
    scale: 0.9
  }} animate={{
    opacity: 1,
    scale: 1
  }} transition={{
    delay: 0.2
  }}>
      <Button variant="ghost" onClick={onClick} disabled={disabled} className="flex flex-col items-center gap-2 h-auto py-4 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
        <Fingerprint className="w-8 h-8" />
        <span className="text-sm font-medium">{label}</span>
      </Button>
    </motion.div>;
}
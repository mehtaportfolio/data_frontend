import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  error?: boolean;
  label?: string;
  disabled?: boolean;
}
export function PinInput({
  length = 6,
  onComplete,
  error,
  label = 'Enter PIN',
  disabled = false
}: PinInputProps) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    if (value.length <= length) {
      setPin(value);
      if (value.length === length) {
        onComplete(value);
      }
    }
  };
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };
  useEffect(() => {
    if (error) {
      setPin('');
      inputRef.current?.focus();
    }
  }, [error]);
  // Auto focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  return <div className="flex flex-col items-center space-y-6 w-full max-w-xs mx-auto">
      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>

      <div onClick={handleContainerClick} className="relative flex items-center justify-center space-x-4 cursor-text">
        {/* Hidden Input */}
        <input ref={inputRef} type="tel" value={pin} onChange={handleChange} disabled={disabled} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" autoComplete="off" inputMode="numeric" pattern="[0-9]*" />

        {/* Visual Dots */}
        {Array.from({
        length
      }).map((_, i) => <motion.div key={i} initial={false} animate={{
        scale: pin.length > i ? 1.2 : 1,
        backgroundColor: pin.length > i ? error ? '#EF4444' : '#3B82F6' : 'transparent',
        borderColor: error ? '#EF4444' : pin.length === i ? '#3B82F6' : '#E5E7EB'
      }} className={`
              w-4 h-4 rounded-full border-2 transition-colors duration-200
              ${pin.length > i ? 'border-transparent' : 'dark:border-gray-700'}
            `} />)}
      </div>

      {error && <motion.p initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} className="text-sm text-red-500 font-medium">
          Incorrect PIN. Please try again.
        </motion.p>}
    </div>;
}
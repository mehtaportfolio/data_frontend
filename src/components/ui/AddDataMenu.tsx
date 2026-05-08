import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

export interface AddDataOption {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface AddDataMenuProps {
  options: AddDataOption[];
}

export function AddDataMenu({ options }: AddDataMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: AddDataOption) => {
    option.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-2 space-y-1">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleOptionClick(option)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${option.color} hover:opacity-80`}
                >
                  <div className="flex-shrink-0">{option.icon}</div>
                  <span className="flex-1 text-left font-medium text-sm">
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

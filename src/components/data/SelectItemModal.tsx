import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface SelectItemModalProps<T = Record<string, unknown>> {
  isOpen: boolean;
  items: T[];
  onSelect: (item: T) => void;
  onClose: () => void;
  title: string;
  getItemLabel: (item: T) => string;
  getItemDescription?: (item: T) => string;
}

export function SelectItemModal<T = Record<string, unknown>>({
  isOpen,
  items,
  onSelect,
  onClose,
  title,
  getItemLabel,
  getItemDescription
}: SelectItemModalProps<T>) {
  if (!isOpen || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full md:rounded-3xl flex flex-col max-h-[90vh]"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {items.map((item, index) => (
            <button
              key={item.id || index}
              onClick={() => {
                onSelect(item);
                onClose();
              }}
              className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {getItemLabel(item)}
              </div>
              {getItemDescription && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getItemDescription(item)}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="sticky bottom-0 flex gap-2 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button
            variant="secondary"
            className="flex-1 text-sm"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

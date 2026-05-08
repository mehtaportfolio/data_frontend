import React, { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface SelectWithAddProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  onAddNew?: (newValue: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export function SelectWithAdd({
  label,
  value,
  onChange,
  options,
  onAddNew,
  error,
  required = false,
  placeholder = `Select ${label.toLowerCase()}`,
}: SelectWithAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleAddNew = () => {
    if (newValue.trim() && !options.includes(newValue)) {
      onAddNew?.(newValue);
      onChange(newValue);
      setNewValue('');
      setShowAddForm(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 ${
            error ? 'border-red-500' : 'border-gray-200'
          }`}
        >
          <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50">
            {!showAddForm ? (
              <>
                <div className="max-h-[200px] overflow-y-auto">
                  {options.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        value === option
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-t border-gray-200 dark:border-gray-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </>
            ) : (
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Enter new ${label.toLowerCase()}`}
                  autoFocus
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNew();
                    } else if (e.key === 'Escape') {
                      setShowAddForm(false);
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewValue('');
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNew}
                    disabled={!newValue.trim()}
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

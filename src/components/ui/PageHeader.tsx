import React, { useState } from 'react';
import { Plus, X, LogOut, RefreshCw, Bell, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useExpiringDocuments } from '../../hooks/useExpiringDocuments';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onLogout: () => void;
  onRefresh?: () => void;
  isRefreshLoading?: boolean;
  onAddClick?: () => void;
  menuOptions?: Array<{
    label: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
  }>;
  showAddButton?: boolean;
  showRefreshButton?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  onLogout,
  onRefresh,
  isRefreshLoading = false,
  onAddClick,
  menuOptions = [],
  showAddButton = false,
  showRefreshButton = false,
}: PageHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { expiringItems, expiringCount, dismissNotification } = useExpiringDocuments();

  const getExpirationDaysLeft = (expiryDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpired = (expiryDate: string): boolean => {
    return getExpirationDaysLeft(expiryDate) < 0;
  };

  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 relative">
            {showAddButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  onAddClick?.();
                }}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </Button>
            )}
            {showRefreshButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshLoading}
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {expiringCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {expiringCount > 9 ? '9+' : expiringCount}
                  </span>
                )}
              </Button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Expiring Documents
                      </h3>
                      {expiringCount === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          No items expiring soon
                        </p>
                      )}
                    </div>
                    {expiringCount > 0 && (
                      <div className="space-y-2 p-4">
                        {expiringItems.map((item, index) => {
                          const daysLeft = getExpirationDaysLeft(item.expiry_date);
                          const isExpiredStatus = isExpired(item.expiry_date);
                          return (
                            <motion.div
                              key={`${item.table}-${item.id}-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className={`p-3 rounded-lg border flex items-start justify-between gap-2 ${
                                isExpiredStatus
                                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 dark:text-white break-words">
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-words">
                                    {item.description}
                                  </p>
                                )}
                                <p className={`text-xs mt-2 font-medium ${
                                  isExpiredStatus
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                  {isExpiredStatus
                                    ? `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`
                                    : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                                  }
                                </p>
                              </div>
                              <button
                                onClick={() => dismissNotification(item.table, item.id)}
                                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Dismiss notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="w-5 h-5" />
            </Button>

            <AnimatePresence>
              {isMenuOpen && menuOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute right-0 mt-2 top-full w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-3 space-y-2">
                    {menuOptions.map((option, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          option.onClick();
                          setIsMenuOpen(false);
                        }}
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
        </div>
      </div>
    </div>
  );
}

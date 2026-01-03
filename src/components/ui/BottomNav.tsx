import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, PiggyBank } from 'lucide-react';
import { Button } from './Button';

export function BottomNav() {
  const location = useLocation();
  
  const isDashboard = location.pathname === '/';
  const isBankDeposits = location.pathname === '/bank-deposits';
  const isSettings = location.pathname === '/settings';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-40">
      <div className="flex items-center w-full px-2 py-2 gap-2">
        <Link to="/" className="flex-1">
          <div className="flex flex-col items-center gap-1">
            <Button 
              size="icon" 
              variant={isDashboard ? "primary" : "ghost"} 
              className="w-10 h-10"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Dashboard
            </span>
          </div>
        </Link>

        <Link to="/bank-deposits" className="flex-1">
          <div className="flex flex-col items-center gap-1">
            <Button 
              size="icon" 
              variant={isBankDeposits ? "primary" : "ghost"} 
              className="w-10 h-10"
            >
              <PiggyBank className="w-5 h-5" />
            </Button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Deposits
            </span>
          </div>
        </Link>
        
        <Link to="/settings" className="flex-1">
          <div className="flex flex-col items-center gap-1">
            <Button 
              size="icon" 
              variant={isSettings ? "primary" : "ghost"} 
              className="w-10 h-10"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Settings
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Back online');
    };
    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('You are offline. Changes will be saved locally.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return isOffline;
}
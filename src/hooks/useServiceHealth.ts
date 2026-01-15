import { useState } from 'react';
import { toast } from 'sonner';

interface ServiceHealthResponse {
  success: boolean;
  status?: string;
  message?: string;
  error?: string;
  isRunning?: boolean;
}

export function useServiceHealth() {
  const [isLoading, setIsLoading] = useState(false);

  const checkServiceStatus = async (silent: boolean = false): Promise<boolean> => {
    try {
      if (!silent) setIsLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/service/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check service status');
      }

      const data = (await response.json()) as ServiceHealthResponse;
      
      if (data.success && data.isRunning) {
        if (!silent) toast.success('✓ Backend service is running');
        return true;
      } else {
        if (!silent) toast.error('✗ Backend service is not running. Attempting to restart...');
        await restartService();
        return false;
      }
    } catch (error) {
      if (!silent) toast.error('Failed to check backend status. Attempting to restart...');
      await restartService();
      return false;
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const restartService = async (): Promise<void> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/service/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to restart service');
      }

      const data = (await response.json()) as ServiceHealthResponse;
      
      if (data.success) {
        const toastId = toast.loading('Service restarting... This may take up to 60 seconds.');
        
        let isServiceRunning = false;
        let attempts = 0;
        const maxAttempts = 12;
        const checkInterval = 5000;

        while (!isServiceRunning && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          attempts++;

          try {
            const statusResponse = await fetch(`${apiUrl}/api/service/status`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (statusResponse.ok) {
              const statusData = (await statusResponse.json()) as ServiceHealthResponse;
              if (statusData.isRunning) {
                isServiceRunning = true;
                toast.dismiss(toastId);
                toast.success('✓ Backend service is now running!');
              }
            }
          } catch {
            continue;
          }
        }

        if (!isServiceRunning) {
          toast.dismiss(toastId);
          toast.error('Service is still restarting. Please wait a moment and try again.');
        }
      } else {
        toast.error('Failed to restart service. Please check Render dashboard.');
      }
    } catch (error) {
      toast.error('Error restarting service. Please check Render dashboard manually.');
    }
  };

  return {
    checkServiceStatus,
    restartService,
    isLoading,
  };
}

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

  const checkServiceStatus = async (silent = false): Promise<boolean> => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    let allHealthy = true;
    
    try {
      if (!silent) setIsLoading(true);

      // Check the backend's own status endpoint which checks Render status internally
      const response = await fetch(`${apiUrl}/api/service/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error('Backend service is not reachable');
      }

      const data = (await response.json()) as ServiceHealthResponse;
      
      if (data.success && data.isRunning) {
        if (!silent) toast.success('✓ Backend service is running');
        window.dispatchEvent(new CustomEvent('backend-healthy'));
        return true;
      } else {
        allHealthy = false;
        if (!silent) toast.error(`✗ Backend service is not running. Attempting restart...`);
        await restartServiceViaBackend(apiUrl, silent);
        return false;
      }
    } catch (error) {
      if (!silent) toast.error(`✗ Backend service is down. Attempting restart...`);
      // If we can't even reach the status endpoint, we can't reach the restart endpoint either
      // In this case, the user needs to manually check or we use a hardcoded fallback if possible
      // But per security requirement, we remove the direct Render API call from frontend
      return false;
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const restartServiceViaBackend = async (apiUrl: string, silent: boolean): Promise<void> => {
    try {
      const response = await fetch(`${apiUrl}/api/service/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate restart via backend');
      }

      const toastId = toast.loading('Service restart initiated via backend...');
      
      // Poll for health
      let isServiceRunning = false;
      let attempts = 0;
      const maxAttempts = 15;
      const checkInterval = 10000;

      while (!isServiceRunning && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        attempts++;

        try {
          const statusRes = await fetch(`${apiUrl}/api/service/status`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
          });

          if (statusRes.ok) {
            const statusData = (await statusRes.json()) as ServiceHealthResponse;
            if (statusData.success && statusData.isRunning) {
              isServiceRunning = true;
              toast.dismiss(toastId);
              toast.success('✓ Service is now running!');
              window.dispatchEvent(new CustomEvent('backend-healthy'));
            }
          }
        } catch {
          continue;
        }
      }

      if (!isServiceRunning) {
        toast.dismiss(toastId);
        if (!silent) toast.error('Service is taking longer than expected to start.');
      }
    } catch (error: any) {
      if (!silent) toast.error(`Error: ${error.message}`);
    }
  };

  return {
    checkServiceStatus,
    isLoading,
  };
}

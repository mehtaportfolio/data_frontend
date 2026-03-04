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

  const getServiceConfigs = () => {
    const apiUrls = (import.meta.env.VITE_API_URL || 'http://localhost:3000').split(',');
    const serviceIds = (import.meta.env.VITE_RENDER_SERVICE_ID || '').split(',');
    const apiKey = import.meta.env.VITE_RENDER_API_KEY || '';

    return apiUrls.map((url, index) => ({
      url: url.trim(),
      serviceId: serviceIds[index]?.trim() || serviceIds[0]?.trim() || '',
      apiKey: apiKey.trim()
    }));
  };

  const checkServiceStatus = async (silent = false): Promise<boolean> => {
    const services = getServiceConfigs();
    let allHealthy = true;

    try {
      if (!silent) setIsLoading(true);

      for (const service of services) {
        try {
          // The user specifically asked for /health point check
          const response = await fetch(`${service.url}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Add a timeout to avoid long waits
            signal: AbortSignal.timeout(5000)
          });

          if (!response.ok) {
            throw new Error(`Service at ${service.url} is not healthy`);
          }

          const data = (await response.json()) as ServiceHealthResponse;
          if (!data.success) {
            throw new Error(`Service at ${service.url} reported failure`);
          }
        } catch (error) {
          allHealthy = false;
          if (!silent) toast.error(`✗ Backend service at ${service.url} is down. Attempting restart...`);
          await restartServiceDirectly(service.serviceId, service.apiKey, service.url, silent);
        }
      }

      if (allHealthy && !silent) {
        toast.success('✓ All backend services are running');
      }

      if (allHealthy) {
        // Trigger a custom event to notify useSupabase hooks to refresh
        window.dispatchEvent(new CustomEvent('backend-healthy'));
      }

      return allHealthy;
    } catch (error) {
      return false;
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const restartServiceDirectly = async (serviceId: string, apiKey: string, apiUrl: string, silent: boolean): Promise<void> => {
    if (!serviceId || !apiKey) {
      if (!silent) toast.error('Cannot restart service: Service ID or API Key missing in env');
      return;
    }

    try {
      // Render API call to trigger a new deploy (which restarts the service)
      const response = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Render API call failed');
      }

      const toastId = toast.loading(`Service ${apiUrl} is restarting... This may take a minute.`);
      
      // Poll /health until it's back
      let isServiceRunning = false;
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts for Render cold starts
      const checkInterval = 10000; // 10 seconds between checks

      while (!isServiceRunning && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        attempts++;

        try {
          const statusResponse = await fetch(`${apiUrl}/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
          });

          if (statusResponse.ok) {
            const statusData = (await statusResponse.json()) as ServiceHealthResponse;
            if (statusData.success) {
              isServiceRunning = true;
              toast.dismiss(toastId);
              toast.success(`✓ Service at ${apiUrl} is now running!`);
              // Trigger refresh when back online
              window.dispatchEvent(new CustomEvent('backend-healthy'));
            }
          }
        } catch {
          continue;
        }
      }

      if (!isServiceRunning) {
        toast.dismiss(toastId);
        if (!silent) toast.error(`Service at ${apiUrl} is still starting. Please refresh in a bit.`);
      }
    } catch (error: any) {
      if (!silent) toast.error(`Error restarting service: ${error.message || 'Check Render dashboard'}`);
    }
  };

  return {
    checkServiceStatus,
    isLoading,
  };
}

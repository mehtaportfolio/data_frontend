import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Moon, Sun, Fingerprint, Shield } from 'lucide-react';
import { storage } from '../utils/storage';
import { biometric } from '../utils/biometric';
import { ChangePinModal } from '../components/settings/ChangePinModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const {
    theme,
    toggleTheme
  } = useTheme();
  const {
    enableBiometric,
    changePin,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const isBiometricEnabled = storage.isBiometricEnabled();
  const handleBiometricToggle = async () => {
    if (isBiometricEnabled) {
      biometric.clearCredential();
      toast.success('Biometric login disabled');
      navigate('/settings');
    } else {
      setIsLoading(true);
      try {
        const success = await enableBiometric();
        if (success) {
          navigate('/settings');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
      <PageHeader
        title="Settings"
        onLogout={logout}
        showAddButton={false}
        showRefreshButton={false}
      />

      <div className="p-6 space-y-6">
        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Appearance
          </h2>
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <Button variant="secondary" onClick={toggleTheme} className="w-20">
              {theme === 'dark' ? 'On' : 'Off'}
            </Button>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Security
          </h2>
          <Card className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5" />
                <div>
                  <p className="font-medium">Biometric Unlock</p>
                  <p className="text-sm text-gray-500">
                    Use FaceID or Fingerprint
                  </p>
                </div>
              </div>
              <Button variant={isBiometricEnabled ? 'primary' : 'secondary'} onClick={handleBiometricToggle} disabled={isLoading} className="w-20">
                {isLoading ? 'Loading...' : (isBiometricEnabled ? 'On' : 'Off')}
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5" />
                <div>
                  <p className="font-medium">App PIN</p>
                  <p className="text-sm text-gray-500">
                    Change your 6-digit PIN
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="w-full" onClick={() => setIsChangePinModalOpen(true)}>
                Change PIN
              </Button>
            </div>
          </Card>
        </section>

        <p className="text-center text-xs text-gray-400 mt-8">
          SecureVault v1.0.0
        </p>
      </div>

      <ChangePinModal
        isOpen={isChangePinModalOpen}
        onClose={() => setIsChangePinModalOpen(false)}
        onChangePinComplete={changePin}
      />
    </div>;
}
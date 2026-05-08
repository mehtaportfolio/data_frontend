import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { PinInput } from '../auth/PinInput';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePinComplete: (oldPin: string, newPin: string) => Promise<boolean>;
}

type Stage = 'current' | 'new' | 'confirm';

export function ChangePinModal({
  isOpen,
  onClose,
  onChangePinComplete
}: ChangePinModalProps) {
  const [stage, setStage] = useState<Stage>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    setStage('current');
    setCurrentPin('');
    setNewPin('');
    setError(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCurrentPinComplete = (pin: string) => {
    setCurrentPin(pin);
    setStage('new');
    setError(false);
  };

  const handleNewPinComplete = (pin: string) => {
    setNewPin(pin);
    setStage('confirm');
    setError(false);
  };

  const handleConfirmPinComplete = async (pin: string) => {
    if (pin !== newPin) {
      setError(true);
      toast.error('PINs do not match');
      return;
    }

    setIsLoading(true);

    try {
      const success = await onChangePinComplete(currentPin, newPin);
      if (success) {
        toast.success('PIN changed successfully');
        handleReset();
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (stage === 'new') {
      setStage('current');
      setNewPin('');
    } else if (stage === 'confirm') {
      setStage('new');
    }
    setError(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={stage === 'current' ? 'Enter Current PIN' : stage === 'new' ? 'Enter New PIN' : 'Confirm New PIN'}
      footer={
        <div className="flex gap-3">
          {stage !== 'current' && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleBack}
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="py-4">
        {stage === 'current' && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              Enter your current PIN to verify your identity
            </p>
            <PinInput
              onComplete={handleCurrentPinComplete}
              error={error}
              label="Current PIN"
              disabled={isLoading}
            />
          </>
        )}

        {stage === 'new' && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              Enter a new 6-digit PIN
            </p>
            <PinInput
              onComplete={handleNewPinComplete}
              error={error}
              label="New PIN"
              disabled={isLoading}
            />
          </>
        )}

        {stage === 'confirm' && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
              Confirm your new PIN
            </p>
            <PinInput
              onComplete={handleConfirmPinComplete}
              error={error}
              label="Confirm PIN"
              disabled={isLoading}
            />
          </>
        )}
      </div>
    </Modal>
  );
}

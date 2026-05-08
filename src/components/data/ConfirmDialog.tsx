import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading
}: ConfirmDialogProps) {
  return <Modal isOpen={isOpen} onClose={onClose} title={title} footer={<div className="flex space-x-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} isLoading={isLoading}>
            Delete
          </Button>
        </div>}>
      <div className="flex flex-col items-center text-center p-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </Modal>;
}
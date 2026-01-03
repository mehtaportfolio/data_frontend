import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormField } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { toast } from 'sonner';
import { uploadDocumentFile, deleteDocumentFile, uploadPolicyFile, deletePolicyFile } from '../../utils/documentUpload';
import { Download, X } from 'lucide-react';
interface DataFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  fields: FormField[];
  initialData?: any;
  title: string;
  documentName?: string;
  accountOwner?: string;
  bucketType?: 'documents' | 'policy';
  attachmentFieldName?: string;
}
export function DataForm({
  isOpen,
  onClose,
  onSubmit,
  fields,
  initialData,
  title,
  documentName,
  accountOwner,
  bucketType = 'documents',
  attachmentFieldName = 'file_attachment'
}: DataFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting
    }
  } = useForm({
    mode: 'onBlur',
    defaultValues: initialData || {}
  });

  const [isUploading, setIsUploading] = useState(false);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
  const [shouldDeleteAttachment, setShouldDeleteAttachment] = useState(false);

  useEffect(() => {
    if (isOpen) {
      reset(initialData || {});
      if (initialData?.[attachmentFieldName]) {
        setExistingAttachment(initialData[attachmentFieldName]);
      } else {
        setExistingAttachment(null);
      }
      setShouldDeleteAttachment(false);
    }
  }, [isOpen, initialData, reset, attachmentFieldName]);

  const handleDeleteAttachment = async () => {
    if (!existingAttachment) return;

    try {
      const deleteFunction = bucketType === 'policy' ? deletePolicyFile : deleteDocumentFile;
      const success = await deleteFunction(existingAttachment);
      if (success) {
        setExistingAttachment(null);
        setShouldDeleteAttachment(true);
        toast.success('Attachment deleted');
      }
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  const onFormSubmit = async (data: any) => {
    try {
      setIsUploading(true);
      
      const hasNewFile = data.file_attachment_file && data.file_attachment_file[0];

      if (hasNewFile) {
        if (!documentName || !accountOwner) {
          toast.error('Document name and owner are required for file upload');
          setIsUploading(false);
          return;
        }

        // Delete old attachment if exists and new file is being uploaded
        if (existingAttachment && !shouldDeleteAttachment) {
          const deleteFunction = bucketType === 'policy' ? deletePolicyFile : deleteDocumentFile;
          await deleteFunction(existingAttachment);
        }

        const file = data.file_attachment_file[0];
        const uploadFunction = bucketType === 'policy' ? uploadPolicyFile : uploadDocumentFile;
        const publicUrl = await uploadFunction(file, documentName, accountOwner);

        if (!publicUrl) {
          setIsUploading(false);
          return;
        }

        data[attachmentFieldName] = publicUrl;
      } else if (shouldDeleteAttachment) {
        data[attachmentFieldName] = null;
      } else if (initialData?.[attachmentFieldName] && !hasNewFile) {
        data[attachmentFieldName] = initialData[attachmentFieldName];
      }

      const fieldsToExclude = ['file_attachment_file', 'id', 'created_at', 'updated_at'];
      const cleanedData: Record<string, unknown> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (fieldsToExclude.includes(key)) continue;
        if (key === attachmentFieldName && value === null) {
          cleanedData[key] = null;
        } else if (value !== null && value !== undefined && value !== '') {
          cleanedData[key] = value;
        }
      }

      await onSubmit(cleanedData);
      onClose();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save data';
      console.error('Form submission error:', errorMsg, error);
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={title} footer={<div className="flex space-x-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button form="data-form" type="submit" className="flex-1" isLoading={isSubmitting || isUploading}>
            {isUploading ? 'Uploading...' : 'Save'}
          </Button>
        </div>}>
      <form id="data-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {fields.map(field => <div key={field.name}>
            {field.type === 'select' ? <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>
                <select {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })} className={`flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 ${errors[field.name] ? 'border-red-500' : 'border-gray-200'}`}>
                  <option value="">Select {field.label}</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>
                      {opt}
                    </option>)}
                </select>
                {errors[field.name] && <p className="text-sm text-red-500">
                    {errors[field.name]?.message as string}
                  </p>}
              </div> : field.type === 'textarea' ? <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>
                <textarea {...register(field.name, {
            required: field.required ? `${field.label} is required` : false
          })} className={`flex min-h-[80px] w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 ${errors[field.name] ? 'border-red-500' : 'border-gray-200'}`} placeholder={field.placeholder} />
                {errors[field.name] && <p className="text-sm text-red-500">
                    {errors[field.name]?.message as string}
                  </p>}
              </div> : field.type === 'file' ? <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                </label>

                {existingAttachment && !shouldDeleteAttachment && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <a
                        href={existingAttachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        Current Attachment
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteAttachment}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  {...register(field.name, {
                    required: !existingAttachment && field.required ? `${field.label} is required` : false
                  })}
                  accept={field.accept}
                  className={`flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 ${errors[field.name] ? 'border-red-500' : 'border-gray-200'}`}
                />
                {errors[field.name] && <p className="text-sm text-red-500">
                    {errors[field.name]?.message as string}
                  </p>}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {existingAttachment && !shouldDeleteAttachment ? 'Upload a new file to replace the existing attachment' : 'Select a PDF or image file (max 10MB)'}
                </p>
              </div> : <Input label={field.label} type={field.type} secure={field.secure} placeholder={field.placeholder} error={errors[field.name]?.message as string} {...register(field.name, {
          required: field.required ? `${field.label} is required` : false
        })} />}
          </div>)}
      </form>
    </Modal>;
}
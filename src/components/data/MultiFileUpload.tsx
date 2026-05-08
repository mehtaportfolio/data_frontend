import React, { useState } from 'react';
import { Download, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPolicyFile, deletePolicyFile } from '../../utils/documentUpload';

interface MultiFileUploadProps {
  existingFiles?: string[];
  onFilesChange: (files: string[]) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  onFilesDeleted?: (deletedCount: number) => void;
  documentName: string;
  accountOwner: string;
  label?: string;
  accept?: string;
}

export function MultiFileUpload({
  existingFiles = [],
  onFilesChange,
  onUploadStateChange,
  onFilesDeleted,
  documentName,
  accountOwner,
  label = 'Attachments',
  accept = '.pdf,.jpg,.jpeg,.png,.webp'
}: MultiFileUploadProps) {
  const [files, setFiles] = useState<string[]>(existingFiles || []);
  const [isUploading, setIsUploading] = useState(false);
  
  const updateUploadState = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadStateChange?.(uploading);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    updateUploadState(true);
    try {
      const newFiles: string[] = [];
      console.log('📦 Starting file upload:', { count: fileList.length, documentName, accountOwner });
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        console.log(`⬆️ Uploading file ${i + 1}/${fileList.length}:`, file.name);
        const publicUrl = await uploadPolicyFile(file, documentName, accountOwner);
        if (publicUrl) {
          console.log(`✅ File ${i + 1} uploaded:`, publicUrl);
          newFiles.push(publicUrl);
        } else {
          console.warn(`❌ File ${i + 1} upload failed (no URL returned)`);
        }
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles];
        console.log('📝 Updating file list:', { newCount: newFiles.length, totalCount: updatedFiles.length });
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
        toast.success(`${newFiles.length} file(s) uploaded successfully`);
      } else {
        toast.error('No files were successfully uploaded');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload files';
      console.error('❌ Upload error:', errorMsg);
      toast.error(errorMsg);
    } finally {
      updateUploadState(false);
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (index: number) => {
    try {
      const fileToDelete = files[index];
      console.log('🗑️ Deleting file:', fileToDelete);
      
      const success = await deletePolicyFile(fileToDelete);
      if (success) {
        const updatedFiles = files.filter((_, i) => i !== index);
        console.log('📝 Updated files after deletion:', updatedFiles);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
        onFilesDeleted?.(1);
        toast.success('File deleted successfully');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete file';
      console.error('❌ Delete error:', errorMsg);
      toast.error(errorMsg);
    }
  };

  const getFileName = (url: string) => {
    try {
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      const decodedName = decodeURIComponent(lastPart);
      return decodedName;
    } catch {
      return 'Download';
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {files.length > 0 && (
        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          {files.map((file, index) => (
            <div
              key={`${file}-${index}`}
              className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <a
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                  title={getFileName(file)}
                >
                  {getFileName(file)}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteFile(index)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isUploading ? 'Uploading...' : 'Add Files'}
          </span>
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Upload PDF or image files (max 10MB per file)
      </p>
    </div>
  );
}

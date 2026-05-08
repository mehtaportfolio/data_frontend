import { supabase } from './supabase';
import { toast } from 'sonner';

const DOCUMENTS_BUCKET = 'documents';
const POLICY_BUCKET = 'policy';
const ALLOWED_TYPES = {
  PDF: 'application/pdf',
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_WEBP: 'image/webp'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadDocumentFile(
  file: File,
  documentName: string,
  accountOwner: string
): Promise<string | null> {
  return uploadFile(file, DOCUMENTS_BUCKET, documentName, accountOwner);
}

export async function uploadPolicyFile(
  file: File,
  policyName: string,
  policyNumber: string
): Promise<string | null> {
  return uploadFile(file, POLICY_BUCKET, policyName, policyNumber);
}

async function uploadFile(
  file: File,
  bucketName: string,
  name1: string,
  name2: string
): Promise<string | null> {
  try {
    if (!Object.values(ALLOWED_TYPES).includes(file.type)) {
      toast.error('Only PDF and image files (JPEG, PNG, WebP) are allowed');
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return null;
    }

    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${name1}-${name2}-${timestamp}.${fileExtension}`;
    const filePath = `${name1}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    if (!publicUrl) {
      toast.error('Failed to generate public URL');
      return null;
    }

    toast.success('File uploaded successfully');
    return publicUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    toast.error(errorMessage);
    return null;
  }
}

export async function deleteDocumentFile(fileUrl: string): Promise<boolean> {
  return deleteFile(fileUrl, DOCUMENTS_BUCKET);
}

export async function deletePolicyFile(fileUrl: string): Promise<boolean> {
  return deleteFile(fileUrl, POLICY_BUCKET);
}

async function deleteFile(fileUrl: string, bucketName: string): Promise<boolean> {
  try {
    if (!fileUrl) {
      toast.error('No file URL provided for deletion');
      return false;
    }

    const urlParts = fileUrl.split(`${bucketName}/`);
    if (urlParts.length < 2) {
      toast.error(`Invalid file URL format for bucket: ${bucketName}`);
      console.error('Failed to parse URL:', fileUrl);
      return false;
    }

    let filePath = urlParts[1];
    filePath = filePath.split('?')[0];
    filePath = decodeURIComponent(filePath);

    if (!filePath) {
      toast.error('Could not extract file path from URL');
      return false;
    }

    console.log(`Deleting file from ${bucketName}: ${filePath}`);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Failed to delete file from Supabase:', error);
      toast.error(`Failed to delete file: ${error.message}`);
      return false;
    }

    toast.success('File deleted from storage');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting file:', errorMessage);
    toast.error(`Error deleting file: ${errorMessage}`);
    return false;
  }
}

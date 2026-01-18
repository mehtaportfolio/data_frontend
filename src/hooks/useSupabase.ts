import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';
import { encryptData, decryptData } from '../utils/encryption';
import { storage } from '../utils/storage';

export function useSupabase<T extends {
  id: string;
}>(tableName: string, secureFields: string[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const getEncryptionKey = useCallback(() => {
    const key = storage.getEncryptionKey();
    if (!key && secureFields.length > 0) {
      console.warn('Encryption key missing for secure fields');
    }
    return key;
  }, [secureFields]);

  const processIncomingData = useCallback((item: any) => {
    const key = getEncryptionKey();
    if (!key) return item;

    const decryptedItem = { ...item };
    secureFields.forEach(field => {
      if (decryptedItem[field]) {
        decryptedItem[field] = decryptData(decryptedItem[field], key);
      }
    });
    return decryptedItem;
  }, [getEncryptionKey, secureFields]);

  const processOutgoingData = useCallback((item: any) => {
    const key = getEncryptionKey();
    if (!key) return item;

    const encryptedItem = { ...item };
    secureFields.forEach(field => {
      if (encryptedItem[field]) {
        encryptedItem[field] = encryptData(encryptedItem[field], key);
      }
    });
    return encryptedItem;
  }, [getEncryptionKey, secureFields]);

  const getEndpoint = useCallback(() => {
    if (tableName === 'bank_accounts') return '/api/bank-accounts';
    if (tableName === 'credit_cards') return '/api/credit-cards';
    if (tableName === 'general_documents') return '/api/general-documents';
    if (tableName === 'insurance_policies') return '/api/insurance-policies';
    if (tableName === 'deposits') return '/api/deposits';
    if (tableName === 'websites') return '/api/websites';
    return `/api/${tableName}`;
  }, [tableName]);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = getEndpoint();
      let result = await api.get<T[]>(endpoint);
      
      result = result.map(item => {
        let processedItem = processIncomingData(item);
        
        if (tableName === 'insurance_policies' && (processedItem as any).policy_documents) {
          (processedItem as any).policy_documents = normalizeDocuments((processedItem as any).policy_documents);
        }
        return processedItem;
      });
      
      setData(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getEndpoint, processIncomingData, tableName]);
  
  const normalizeDocuments = (docs: unknown): string[] => {
    if (!docs) return [];
    
    if (Array.isArray(docs)) {
      return docs.filter(item => typeof item === 'string' && item.length > 0);
    }
    
    if (typeof docs === 'string') {
      try {
        const parsed = JSON.parse(docs);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => typeof item === 'string' && item.length > 0);
        }
        return docs.length > 0 ? [docs] : [];
      } catch {
        return docs.length > 0 ? [docs] : [];
      }
    }
    
    return [];
  };

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (newItem: Omit<T, 'id' | 'created_at'>) => {
    try {
      const endpoint = getEndpoint();
      let itemToSend = { ...newItem } as Record<string, unknown>;
      
      if (tableName === 'insurance_policies' && (itemToSend as any).policy_documents) {
        (itemToSend as any).policy_documents = normalizeDocuments((itemToSend as any).policy_documents);
      }

      itemToSend = processOutgoingData(itemToSend);
      
      const saved = await api.post<T>(endpoint, itemToSend);
      let processedSaved = processIncomingData(saved);
      
      if (tableName === 'insurance_policies' && (processedSaved as any).policy_documents) {
        (processedSaved as any).policy_documents = normalizeDocuments((processedSaved as any).policy_documents);
      }
      
      setData(prev => [processedSaved, ...prev]);
      toast.success('Item added successfully');
      return processedSaved;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      toast.error(errorMessage);
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const endpoint = `${getEndpoint()}/${id}`;
      let updatesToSend = { ...updates } as Record<string, unknown>;
      
      if (tableName === 'insurance_policies' && (updatesToSend as any).policy_documents) {
        (updatesToSend as any).policy_documents = normalizeDocuments((updatesToSend as any).policy_documents);
      }

      updatesToSend = processOutgoingData(updatesToSend);
      
      await api.put<T>(endpoint, updatesToSend);
      setData(prev => prev.map(item => item.id === id ? {
        ...item,
        ...updates
      } : item));
      toast.success('Item updated successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      toast.error(errorMessage);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const endpoint = `${getEndpoint()}/${id}`;
      await api.delete(endpoint);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    data,
    loading,
    create,
    update,
    remove,
    refresh: fetch
  };
}

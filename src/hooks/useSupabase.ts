import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { toast } from 'sonner';

export function useSupabase<T extends {
  id: string;
}>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const getEndpoint = useCallback(() => {
    if (tableName === 'bank_accounts') return '/api/bank-accounts';
    if (tableName === 'credit_cards') return '/api/credit-cards';
    if (tableName === 'general_documents') return '/api/general-documents';
    if (tableName === 'insurance_policies') return '/api/insurance-policies';
    return `/api/${tableName}`;
  }, [tableName]);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = getEndpoint();
      let result = await api.get<T[]>(endpoint);
      
      if (tableName === 'insurance_policies') {
        result = result.map(item => {
          const policy = item as any;
          if (policy.policy_documents) {
            policy.policy_documents = normalizeDocuments(policy.policy_documents);
          }
          return item;
        });
      }
      
      setData(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getEndpoint, tableName]);
  
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
      const itemToSend = { ...newItem } as Record<string, unknown>;
      
      if (tableName === 'insurance_policies' && (itemToSend as any).policy_documents) {
        (itemToSend as any).policy_documents = normalizeDocuments((itemToSend as any).policy_documents);
      }
      
      const saved = await api.post<T>(endpoint, itemToSend);
      
      if (tableName === 'insurance_policies' && (saved as any).policy_documents) {
        (saved as any).policy_documents = normalizeDocuments((saved as any).policy_documents);
      }
      
      setData(prev => [saved, ...prev]);
      toast.success('Item added successfully');
      return saved;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      toast.error(errorMessage);
      throw error;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      const endpoint = `${getEndpoint()}/${id}`;
      const updatesToSend = { ...updates } as Record<string, unknown>;
      
      if (tableName === 'insurance_policies' && (updatesToSend as any).policy_documents) {
        (updatesToSend as any).policy_documents = normalizeDocuments((updatesToSend as any).policy_documents);
      }
      
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

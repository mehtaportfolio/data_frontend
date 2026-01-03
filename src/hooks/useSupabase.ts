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
      const result = await api.get<T[]>(endpoint);
      setData(result);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getEndpoint]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = async (newItem: Omit<T, 'id' | 'created_at'>) => {
    try {
      const endpoint = getEndpoint();
      const saved = await api.post<T>(endpoint, newItem as Record<string, unknown>);
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
      await api.put<T>(endpoint, updates as Record<string, unknown>);
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

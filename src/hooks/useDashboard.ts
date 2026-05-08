import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { BankAccount, GeneralDocument, InsurancePolicy, Website } from '../types';

interface DashboardData {
  bank_accounts: BankAccount[];
  credit_cards: BankAccount[];
  general_documents: GeneralDocument[];
  insurance_policies: InsurancePolicy[];
  websites: Website[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(() => {
    const cached = localStorage.getItem('cache_dashboard');
    return cached ? JSON.parse(cached) : {
      bank_accounts: [],
      credit_cards: [],
      general_documents: [],
      insurance_policies: [],
      websites: []
    };
  });
  const [loading, setLoading] = useState(!localStorage.getItem('cache_dashboard'));

  const fetchDashboard = useCallback(async () => {
    try {
      const result = await api.get<DashboardData>('/api/dashboard');
      console.log('📊 Dashboard data fetched:', result);
      
      // Normalize insurance policies if they have documents
      const normalizedInsurance = result.insurance_policies.map(item => {
        if (item.policy_documents) {
          return {
            ...item,
            policy_documents: normalizeDocuments(item.policy_documents)
          };
        }
        return item;
      });

      const normalizedData = {
        ...result,
        insurance_policies: normalizedInsurance
      };

      setData(normalizedData);
      localStorage.setItem('cache_dashboard', JSON.stringify(normalizedData));
      
      // Also update individual caches to keep them in sync
      localStorage.setItem('cache_bank_accounts', JSON.stringify(normalizedData.bank_accounts));
      localStorage.setItem('cache_credit_cards', JSON.stringify(normalizedData.credit_cards));
      localStorage.setItem('cache_general_documents', JSON.stringify(normalizedData.general_documents));
      localStorage.setItem('cache_insurance_policies', JSON.stringify(normalizedData.insurance_policies));
      localStorage.setItem('cache_websites', JSON.stringify(normalizedData.websites));
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      // Fallback to individual caches if dashboard fails
      const bankAccounts = localStorage.getItem('cache_bank_accounts');
      const creditCards = localStorage.getItem('cache_credit_cards');
      const generalDocuments = localStorage.getItem('cache_general_documents');
      const insurancePolicies = localStorage.getItem('cache_insurance_policies');
      const websites = localStorage.getItem('cache_websites');
      
      if (bankAccounts || creditCards || generalDocuments || insurancePolicies || websites) {
        setData({
          bank_accounts: bankAccounts ? JSON.parse(bankAccounts) : [],
          credit_cards: creditCards ? JSON.parse(creditCards) : [],
          general_documents: generalDocuments ? JSON.parse(generalDocuments) : [],
          insurance_policies: insurancePolicies ? JSON.parse(insurancePolicies) : [],
          websites: websites ? JSON.parse(websites) : []
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchDashboard();
    };

    window.addEventListener('backend-healthy', handleRefresh);
    return () => window.removeEventListener('backend-healthy', handleRefresh);
  }, [fetchDashboard]);

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

  return { data, loading, refresh: fetchDashboard };
}

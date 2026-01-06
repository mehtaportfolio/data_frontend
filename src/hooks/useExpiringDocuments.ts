import { useEffect, useState } from 'react';
import { useSupabase } from './useSupabase';
import { BankAccount, CreditCard, GeneralDocument, InsurancePolicy } from '../types';

export interface ExpiringItem {
  id: string;
  table: 'bank_accounts' | 'credit_cards' | 'general_documents' | 'insurance_policies';
  name: string;
  description: string;
  expiry_date: string;
}

const DISMISSED_NOTIFICATIONS_KEY = 'dismissed_notifications';

function getDismissedNotifications(): Set<string> {
  try {
    const dismissed = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
    return new Set(dismissed ? JSON.parse(dismissed) : []);
  } catch {
    return new Set();
  }
}

function saveDismissedNotifications(dismissed: Set<string>): void {
  localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify(Array.from(dismissed)));
}

export function useExpiringDocuments() {
  const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(getDismissedNotifications());

  const { data: bankAccounts } = useSupabase<BankAccount>('bank_accounts');
  const { data: creditCards } = useSupabase<CreditCard>('credit_cards');
  const { data: generalDocuments } = useSupabase<GeneralDocument>('general_documents');
  const { data: insurancePolicies } = useSupabase<InsurancePolicy>('insurance_policies');

  useEffect(() => {
    const getExpirationDaysLeft = (expiryDate: string): number => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    const isExpiringSoonOrExpired = (expiryDate: string): boolean => {
      const daysLeft = getExpirationDaysLeft(expiryDate);
      return daysLeft <= 30;
    };

    const items: ExpiringItem[] = [];

    bankAccounts.forEach(account => {
      if (account.expiry_date && isExpiringSoonOrExpired(account.expiry_date)) {
        const notifId = `bank_accounts-${account.id}`;
        if (!dismissedNotifications.has(notifId)) {
          const cardType = account.card_number ? 'Debit Card' : 'Bank Account';
          const cardLast4 = account.card_number ? account.card_number.slice(-4) : account.account_number?.slice(-4);
          const ownerInfo = account.account_owner ? ` - ${account.account_owner}` : '';
          items.push({
            id: account.id,
            table: 'bank_accounts',
            name: `${account.bank_name} - ${cardType}`,
            description: `${cardLast4 ? cardLast4 : 'Account'}${ownerInfo}`,
            expiry_date: account.expiry_date,
          });
        }
      }
    });

    creditCards.forEach(card => {
      if (card.expiry_date && isExpiringSoonOrExpired(card.expiry_date)) {
        const notifId = `credit_cards-${card.id}`;
        if (!dismissedNotifications.has(notifId)) {
          const cardLast4 = card.credit_card_number ? card.credit_card_number.slice(-4) : '';
          items.push({
            id: card.id,
            table: 'credit_cards',
            name: `${card.bank_name} - Credit Card`,
            description: cardLast4,
            expiry_date: card.expiry_date,
          });
        }
      }
    });

    generalDocuments.forEach(doc => {
      if (doc.expiry_date && isExpiringSoonOrExpired(doc.expiry_date)) {
        const notifId = `general_documents-${doc.id}`;
        if (!dismissedNotifications.has(notifId)) {
          items.push({
            id: doc.id,
            table: 'general_documents',
            name: doc.document_name,
            description: doc.account_owner || 'Document',
            expiry_date: doc.expiry_date,
          });
        }
      }
    });

    insurancePolicies.forEach(policy => {
      if (policy.expiry_date && isExpiringSoonOrExpired(policy.expiry_date)) {
        const notifId = `insurance_policies-${policy.id}`;
        if (!dismissedNotifications.has(notifId)) {
          items.push({
            id: policy.id,
            table: 'insurance_policies',
            name: policy.policy_name || policy.policy_type,
            description: policy.policy_number || policy.policy_type,
            expiry_date: policy.expiry_date,
          });
        }
      }
    });

    items.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

    setExpiringItems(items);
  }, [bankAccounts, creditCards, generalDocuments, insurancePolicies, dismissedNotifications]);

  const dismissNotification = (table: string, id: string) => {
    const notifId = `${table}-${id}`;
    const newDismissed = new Set(dismissedNotifications);
    newDismissed.add(notifId);
    setDismissedNotifications(newDismissed);
    saveDismissedNotifications(newDismissed);
  };

  return {
    expiringItems,
    expiringCount: expiringItems.length,
    dismissNotification,
  };
}

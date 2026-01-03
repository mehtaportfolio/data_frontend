import React, { useState, useEffect } from 'react';
import { DataForm } from '../components/data/DataForm';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { useSupabase } from '../hooks/useSupabase';
import { CreditCard, FormField } from '../types';
import { Home, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const CREDIT_CARD_FIELDS: FormField[] = [{
  name: 'bank_name',
  label: 'Bank Name',
  type: 'text',
  required: true,
  placeholder: 'e.g. HDFC Credit Card'
}, {
  name: 'credit_card_number',
  label: 'Credit Card Number',
  type: 'text',
  secure: true,
  placeholder: '1234567890123456'
}, {
  name: 'issue_date',
  label: 'Issue Date',
  type: 'date'
}, {
  name: 'expiry_date',
  label: 'Expiry Date',
  type: 'date'
}, {
  name: 'cvv_number',
  label: 'CVV',
  type: 'password',
  secure: true,
  placeholder: '123'
}, {
  name: 'billing_cycle',
  label: 'Billing Cycle',
  type: 'text',
  placeholder: 'e.g. 1st - 31st'
}, {
  name: 'last_date',
  label: 'Last Payment Date',
  type: 'text'
}, {
  name: 'transaction_limit',
  label: 'Transaction Limit',
  type: 'text',
  placeholder: '₹50,000'
}, {
  name: 'pin',
  label: 'PIN',
  type: 'password',
  secure: true
}, {
  name: 'internet_banking_id',
  label: 'Internet Banking ID',
  type: 'text',
  secure: true
}, {
  name: 'login_password',
  label: 'Login Password',
  type: 'password',
  secure: true
}, {
  name: 'status',
  label: 'Status',
  type: 'text',
  placeholder: 'e.g. Active, Inactive'
}];

export function CreditCardsPage() {
  const [searchParams] = useSearchParams();
  const {
    data,
    create,
    update,
    remove
  } = useSupabase<CreditCard>('credit_cards');
  
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CreditCard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setEditingItem(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const isActiveStatus = (status?: string) => {
    if (!status) return false;
    return status.toLowerCase().includes('active');
  };

  const filteredByTab = data.filter(item => {
    const isActive = isActiveStatus(item.status);
    return activeTab === 'active' ? isActive : !isActive;
  });

  const uniqueBanks = Array.from(new Set(filteredByTab.map(item => item.bank_name))).sort();

  const itemsByBank = selectedBank 
    ? filteredByTab.filter(item => item.bank_name === selectedBank)
    : [];

  const renderDetailsModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full md:rounded-3xl flex flex-col max-h-[90vh]"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {selectedBank}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingItem(itemsByBank[0]);
                setIsFormOpen(true);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(itemsByBank[0]?.id || null);
              }}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedBank(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {itemsByBank.map(item => (
            <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              {item.credit_card_number && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Credit Card Number</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.credit_card_number}</span>
                </div>
              )}

              {item.issue_date && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Issue Date</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.issue_date}</span>
                </div>
              )}

              {item.expiry_date && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Expiry Date</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.expiry_date}</span>
                </div>
              )}

              {item.cvv_number && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">CVV</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.cvv_number}</span>
                </div>
              )}

              {item.billing_cycle && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Billing Cycle</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.billing_cycle}</span>
                </div>
              )}

              {item.last_date && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Last Payment Date</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.last_date}</span>
                </div>
              )}

              {item.transaction_limit && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Transaction Limit</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.transaction_limit}</span>
                </div>
              )}

              {item.pin && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">PIN</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.pin}</span>
                </div>
              )}

              {item.internet_banking_id && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Internet Banking ID</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.internet_banking_id}</span>
                </div>
              )}

              {item.login_password && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Login Password</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.login_password}</span>
                </div>
              )}

              {item.status && (
                <div className="flex justify-between items-start pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.status}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 flex gap-2 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button
            variant="secondary"
            className="flex-1 text-sm"
            onClick={() => {
              setSelectedBank(null);
            }}
          >
            Back
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 gap-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Credit Cards</h1>
          <Link to="/">
            <Button size="icon" variant="ghost" className="text-gray-600 dark:text-gray-400">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedBank(null);
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => {
              setActiveTab('closed');
              setSelectedBank(null);
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'closed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {!selectedBank ? (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {uniqueBanks.length > 0 ? 'Select a credit card' : 'No credit cards found'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uniqueBanks.map(bank => (
                <motion.button
                  key={bank}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBank(bank)}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="text-sm font-semibold text-gray-900 dark:text-white text-center truncate">
                    {bank}
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedBank(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedBank}</h2>
            </div>

            {selectedBank && renderDetailsModal()}
          </>
        )}
      </div>

      <DataForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={async (formData) => {
          if (editingItem) {
            await update(editingItem.id, formData);
          } else {
            await create(formData);
          }
        }}
        fields={CREDIT_CARD_FIELDS}
        initialData={editingItem}
        title={editingItem ? 'Edit Credit Card' : 'Add Credit Card'}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId);
            setDeleteId(null);
            setSelectedBank(null);
          }
        }}
        title="Delete Credit Card"
        message="Are you sure you want to delete this credit card?"
      />
    </div>
  );
}

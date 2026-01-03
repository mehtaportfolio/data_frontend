import React, { useState } from 'react';
import { DataForm } from '../components/data/DataForm';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { useSupabase } from '../hooks/useSupabase';
import { BankAccount, FormField } from '../types';
import { Home, X, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const BANK_ACCOUNT_FIELDS: FormField[] = [{
  name: 'bank_name',
  label: 'Bank Name',
  type: 'text',
  required: true,
  placeholder: 'e.g. HDFC Bank'
}, {
  name: 'account_number',
  label: 'Account Number',
  type: 'text',
  secure: true,
  placeholder: '1234567890'
}, {
  name: 'ifsc_code',
  label: 'IFSC Code',
  type: 'text',
  placeholder: 'HDFC0001234'
}, {
  name: 'branch',
  label: 'Branch Name',
  type: 'text'
}];

const DEBIT_CARD_FIELDS: FormField[] = [{
  name: 'card_number',
  label: 'Card Number',
  type: 'text',
  secure: true,
  placeholder: '1234567890123456'
}, {
  name: 'expiry_date',
  label: 'Expiry Date (MM/YY)',
  type: 'text',
  placeholder: 'MM/YY'
}, {
  name: 'cvv',
  label: 'CVV',
  type: 'password',
  secure: true,
  placeholder: '123'
}, {
  name: 'issue_date',
  label: 'Issue Date',
  type: 'date'
}, {
  name: 'atm_pin',
  label: 'ATM PIN',
  type: 'password',
  secure: true
}];

const NET_BANKING_FIELDS: FormField[] = [{
  name: 'customer_id',
  label: 'Customer ID / User ID',
  type: 'text',
  secure: true,
  placeholder: 'Customer ID'
}, {
  name: 'username',
  label: 'Username',
  type: 'text'
}, {
  name: 'login_password',
  label: 'Login Password',
  type: 'password',
  secure: true
}, {
  name: 'transaction_password',
  label: 'Transaction Password',
  type: 'password',
  secure: true
}, {
  name: 'account_owner',
  label: 'Account Owner',
  type: 'text'
}, {
  name: 'upi_pin',
  label: 'UPI PIN',
  type: 'password',
  secure: true
}, {
  name: 'status',
  label: 'Status',
  type: 'text',
  placeholder: 'e.g. Active, Inactive'
}];

const FIELDS: FormField[] = [
  ...BANK_ACCOUNT_FIELDS,
  ...DEBIT_CARD_FIELDS,
  ...NET_BANKING_FIELDS
];

export function BankAccountsPage() {
  const [searchParams] = useSearchParams();
  const {
    data,
    create,
    update,
    remove
  } = useSupabase<BankAccount>('bank_accounts');
  
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BankAccount | null>(null);
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

  const accountsByBank = selectedBank 
    ? filteredByTab.filter(item => item.bank_name === selectedBank)
    : [];

  const uniqueOwners = Array.from(new Set(accountsByBank.map(item => item.account_owner || 'Unknown'))).sort();

  const itemsByOwner = selectedOwner && selectedBank
    ? accountsByBank.filter(item => (item.account_owner || 'Unknown') === selectedOwner)
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
            <p className="text-sm text-gray-500">{selectedOwner}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingItem(itemsByOwner[0]);
                setSelectedBank(null);
                setSelectedOwner(null);
                setIsFormOpen(true);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setDeleteId(itemsByOwner[0]?.id || null);
                setSelectedBank(null);
                setSelectedOwner(null);
              }}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedBank(null);
                setSelectedOwner(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {itemsByOwner.map(item => (
            <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              {item.account_owner && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Account Owner</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.account_owner}</span>
                </div>
              )}

              {item.account_number && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Account Number</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.account_number}</span>
                </div>
              )}

              {item.ifsc_code && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">IFSC Code</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.ifsc_code}</span>
                </div>
              )}

              {item.branch && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Branch</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.branch}</span>
                </div>
              )}

              {item.card_number && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Card Number</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.card_number}</span>
                </div>
              )}

              {item.expiry_date && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Expiry Date</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.expiry_date}</span>
                </div>
              )}

              {item.cvv && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">CVV</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.cvv}</span>
                </div>
              )}

              {item.atm_pin && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">ATM PIN</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.atm_pin}</span>
                </div>
              )}

              {item.customer_id && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Customer ID</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.customer_id}</span>
                </div>
              )}

              {item.username && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Username</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.username}</span>
                </div>
              )}

              {item.login_password && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Login Password</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.login_password}</span>
                </div>
              )}

              {item.transaction_password && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Transaction Password</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.transaction_password}</span>
                </div>
              )}

              {item.upi_pin && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">UPI PIN</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.upi_pin}</span>
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
              setSelectedOwner(null);
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bank Accounts</h1>
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
              setSelectedOwner(null);
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
              setSelectedOwner(null);
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
              {uniqueBanks.length > 0 ? 'Select a bank' : 'No accounts found'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uniqueBanks.map(bank => {
                const bankAccounts = filteredByTab.filter(item => item.bank_name === bank);
                const uniqueOwnersForBank = Array.from(new Set(bankAccounts.map(item => item.account_owner || 'Unknown')));
                const count = uniqueOwnersForBank.length;
                return (
                  <motion.button
                    key={bank}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (count === 1) {
                        setSelectedBank(bank);
                        setSelectedOwner(uniqueOwnersForBank[0]);
                      } else {
                        setSelectedBank(bank);
                      }
                    }}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white text-center truncate">
                      {bank}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {count} {count === 1 ? 'owner' : 'owners'}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : !selectedOwner ? (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedBank(null)}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
              >
                ← Banks
              </button>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                {selectedBank}
              </h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {uniqueOwners.length > 0 ? 'Select account owner' : 'No accounts'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uniqueOwners.map(owner => {
                const ownerAccounts = accountsByBank.filter(
                  item => (item.account_owner || 'Unknown') === owner
                );
                return (
                  <motion.button
                    key={owner}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedOwner(owner)}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white text-center truncate">
                      {owner}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {ownerAccounts.length} {ownerAccounts.length === 1 ? 'item' : 'items'}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedOwner(null)}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
              >
                ← Owners
              </button>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                {selectedOwner}
              </h2>
            </div>
          </>
        )}
      </div>

      {selectedOwner && selectedBank && renderDetailsModal()}

      <DataForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSubmit={async formData => {
          if (editingItem) {
            await update(editingItem.id, formData);
          } else {
            await create(formData);
          }
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        fields={FIELDS}
        initialData={editingItem}
        title={editingItem ? 'Edit Financial Details' : 'Add Financial Details'}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Entry"
        message="Are you sure you want to delete this financial entry? This action cannot be undone."
      />

      <motion.div
        className="fixed bottom-4 right-4 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
        >
          <Plus className="w-6 h-6" />
        </button>
      </motion.div>
    </div>
  );
}
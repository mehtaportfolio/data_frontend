import React, { useState, useEffect } from 'react';
import { DataForm } from '../components/data/DataForm';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { SelectItemModal } from '../components/data/SelectItemModal';
import { useSupabase } from '../hooks/useSupabase';
import { Website, FormField } from '../types';
import { Home, X, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const WEBSITE_FIELDS: FormField[] = [{
  name: 'account_owner',
  label: 'Account Owner',
  type: 'text',
  required: true,
  placeholder: 'e.g. John Doe'
}, {
  name: 'account_type',
  label: 'Account Type',
  type: 'text',
  placeholder: 'e.g. Email, Social Media, Shopping'
}, {
  name: 'short_web_name',
  label: 'Website Name',
  type: 'text',
  required: true,
  placeholder: 'e.g. Gmail, Facebook, Amazon'
}, {
  name: 'number',
  label: 'Phone/Reference Number',
  type: 'text',
  placeholder: 'e.g. Phone number or reference'
}, {
  name: 'website_address',
  label: 'Website Address',
  type: 'text',
  required: true,
  placeholder: 'e.g. https://www.gmail.com'
}, {
  name: 'login_id',
  label: 'Login ID / Email',
  type: 'text',
  secure: true,
  placeholder: 'e.g. username or email'
}, {
  name: 'login_password',
  label: 'Login Password',
  type: 'password',
  secure: true,
  placeholder: '••••••••'
}, {
  name: 'two_step_password',
  label: 'Two-Step Verification Password',
  type: 'password',
  secure: true,
  placeholder: '••••••••'
}, {
  name: 'other_password',
  label: 'Other Password',
  type: 'password',
  secure: true,
  placeholder: '••••••••'
}, {
  name: 'notes',
  label: 'Notes',
  type: 'textarea',
  placeholder: 'Additional information...'
}];

export function WebsitesPage() {
  const [searchParams] = useSearchParams();
  const {
    data,
    create,
    update,
    remove
  } = useSupabase<Website>('websites');
  
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Website | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setEditingItem(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const uniqueOwners = Array.from(new Set(data.map(item => item.account_owner))).sort();

  const websitesByOwner = selectedOwner 
    ? data.filter(item => item.account_owner === selectedOwner)
    : [];

  const uniqueWebsites = Array.from(new Set(websitesByOwner.map(item => item.short_web_name))).sort();

  const itemsByWebsite = selectedWebsite && selectedOwner
    ? websitesByOwner.filter(item => item.short_web_name === selectedWebsite)
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
              {selectedWebsite}
            </h2>
            <p className="text-sm text-gray-500">{selectedOwner}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (itemsByWebsite.length > 1) {
                  setPendingAction('edit');
                  setShowItemSelector(true);
                } else {
                  setEditingItem(itemsByWebsite[0]);
                  setSelectedOwner(null);
                  setSelectedWebsite(null);
                  setIsFormOpen(true);
                }
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (itemsByWebsite.length > 1) {
                  setPendingAction('delete');
                  setShowItemSelector(true);
                } else {
                  setDeleteId(itemsByWebsite[0]?.id || null);
                  setSelectedOwner(null);
                  setSelectedWebsite(null);
                }
              }}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedOwner(null);
                setSelectedWebsite(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {itemsByWebsite.map(item => (
            <div key={item.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              {item.account_owner && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Account Owner</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.account_owner}</span>
                </div>
              )}

              {item.account_type && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Account Type</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.account_type}</span>
                </div>
              )}

              {item.short_web_name && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Website Name</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-semibold">{item.short_web_name}</span>
                </div>
              )}

              {item.number && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Phone/Reference</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.number}</span>
                </div>
              )}

              {item.website_address && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Website Address</span>
                  <a 
                    href={item.website_address} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 text-right hover:underline truncate"
                  >
                    {item.website_address}
                  </a>
                </div>
              )}

              {item.login_id && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Login ID</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.login_id}</span>
                </div>
              )}

              {item.login_password && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Login Password</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.login_password}</span>
                </div>
              )}

              {item.two_step_password && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">2-Step Password</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.two_step_password}</span>
                </div>
              )}

              {item.other_password && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Other Password</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.other_password}</span>
                </div>
              )}

              {item.notes && (
                <div className="flex justify-between items-start pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Notes</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.notes}</span>
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
              setSelectedWebsite(null);
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Websites & Accounts</h1>
          <Link to="/">
            <Button size="icon" variant="ghost" className="text-gray-600 dark:text-gray-400">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {!selectedOwner ? (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {uniqueOwners.length > 0 ? 'Select an account owner' : 'No accounts found'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uniqueOwners.map(owner => {
                const ownerWebsites = data.filter(item => item.account_owner === owner);
                const count = ownerWebsites.length;
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
                      {count} {count === 1 ? 'account' : 'accounts'}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : !selectedWebsite ? (
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
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {uniqueWebsites.length > 0 ? 'Select a website' : 'No accounts'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uniqueWebsites.map(website => {
                const websiteAccounts = websitesByOwner.filter(
                  item => item.short_web_name === website
                );
                return (
                  <motion.button
                    key={website}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedWebsite(website)}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white text-center truncate">
                      {website}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {websiteAccounts.length} {websiteAccounts.length === 1 ? 'entry' : 'entries'}
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
                onClick={() => setSelectedWebsite(null)}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
              >
                ← Websites
              </button>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                {selectedWebsite}
              </h2>
            </div>
          </>
        )}
      </div>

      {selectedWebsite && selectedOwner && renderDetailsModal()}

      <SelectItemModal
        isOpen={showItemSelector}
        items={itemsByWebsite}
        title={`Select Website Account`}
        getItemLabel={(item) => `${item.short_web_name}`}
        getItemDescription={(item) => `${item.account_owner}${item.account_type ? ` • ${item.account_type}` : ''}`}
        onSelect={(item) => {
          if (pendingAction === 'edit') {
            setEditingItem(item);
            setIsFormOpen(true);
          } else if (pendingAction === 'delete') {
            setDeleteId(item.id);
          }
          setShowItemSelector(false);
          setPendingAction(null);
        }}
        onClose={() => {
          setShowItemSelector(false);
          setPendingAction(null);
        }}
      />

      <DataForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          setShowItemSelector(false);
        }}
        onSubmit={async formData => {
          if (editingItem) {
            await update(editingItem.id, formData);
          } else {
            await create(formData);
          }
          setIsFormOpen(false);
          setEditingItem(null);
          setShowItemSelector(false);
        }}
        fields={WEBSITE_FIELDS}
        initialData={editingItem}
        title={editingItem ? 'Edit Website Account' : 'Add Website Account'}
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
        message="Are you sure you want to delete this website account? This action cannot be undone."
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

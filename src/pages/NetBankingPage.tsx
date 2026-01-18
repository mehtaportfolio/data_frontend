import React, { useState, useEffect } from 'react';
import { DataList } from '../components/data/DataList';
import { DataForm } from '../components/data/DataForm';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { useSupabase } from '../hooks/useSupabase';
import { NetBanking, FormField } from '../types';
import { Card } from '../components/ui/Card';
import { Globe, Copy, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { useSearchParams } from 'react-router-dom';
const FIELDS: FormField[] = [{
  name: 'bank_name',
  label: 'Bank Name',
  type: 'text',
  required: true
}, {
  name: 'url',
  label: 'Login URL',
  type: 'text',
  placeholder: 'https://...'
}, {
  name: 'customer_id',
  label: 'Customer ID / User ID',
  type: 'text',
  secure: true,
  required: true
}, {
  name: 'password',
  label: 'Login Password',
  type: 'password',
  secure: true,
  required: true
}, {
  name: 'transaction_password',
  label: 'Transaction Password',
  type: 'password',
  secure: true
}, {
  name: 'notes',
  label: 'Notes',
  type: 'textarea'
}];
export function NetBankingPage() {
  const [searchParams] = useSearchParams();
  const {
    data,
    create,
    update,
    remove
  } = useSupabase<NetBanking>('net_banking', [
    'customer_id',
    'password',
    'transaction_password'
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NetBanking | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setEditingItem(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-black px-4">
      <DataList title="Net Banking" data={data} onAdd={() => {
      setEditingItem(null);
      setIsFormOpen(true);
    }} onEdit={item => {
      setEditingItem(item);
      setIsFormOpen(true);
    }} onDelete={item => setDeleteId(item.id)} filterFn={(item, query) => item.bank_name.toLowerCase().includes(query.toLowerCase())} renderItem={item => <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {item.bank_name}
                </h3>
              </div>
              {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600" onClick={e => e.stopPropagation()}>
                  <ExternalLink className="w-5 h-5" />
                </a>}
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    User ID
                  </p>
                  <p className="font-mono font-medium">{item.customer_id}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={e => {
            e.stopPropagation();
            handleCopy(item.customer_id);
          }}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Password
                  </p>
                  <p className="font-mono font-medium">
                    {visiblePasswords[item.id] ? item.password : '••••••••'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={e => {
              e.stopPropagation();
              togglePassword(item.id);
            }}>
                    {visiblePasswords[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={e => {
              e.stopPropagation();
              handleCopy(item.password);
            }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>} />

      <DataForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={async data => {
      if (editingItem) {
        await update(editingItem.id, data);
      } else {
        await create(data);
      }
    }} fields={FIELDS} initialData={editingItem} title={editingItem ? 'Edit Credentials' : 'Add Credentials'} onFieldOptionsChange={() => {
      /* no-op */
    }} />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => {
      if (deleteId) {
        await remove(deleteId);
        setDeleteId(null);
      }
    }} title="Delete Credentials" message="Are you sure you want to delete these credentials? This action cannot be undone." />
    </div>;
}
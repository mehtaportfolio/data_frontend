import React, { useState, useEffect } from 'react';
import { DataList } from '../components/data/DataList';
import { DataForm } from '../components/data/DataForm';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { useSupabase } from '../hooks/useSupabase';
import { DebitCard, FormField } from '../types';
import { CreditCard, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { useSearchParams } from 'react-router-dom';
const FIELDS: FormField[] = [{
  name: 'bank_name',
  label: 'Bank Name',
  type: 'text',
  required: true
}, {
  name: 'card_holder',
  label: 'Card Holder Name',
  type: 'text',
  required: true
}, {
  name: 'card_number',
  label: 'Card Number',
  type: 'text',
  secure: true,
  required: true
}, {
  name: 'expiry_date',
  label: 'Expiry (MM/YY)',
  type: 'text',
  required: true,
  placeholder: 'MM/YY'
}, {
  name: 'cvv',
  label: 'CVV',
  type: 'password',
  secure: true,
  required: true
}, {
  name: 'card_type',
  label: 'Card Type',
  type: 'select',
  options: ['Visa', 'Mastercard', 'Rupay', 'Amex'],
  required: true
}, {
  name: 'pin',
  label: 'ATM PIN',
  type: 'password',
  secure: true
}, {
  name: 'notes',
  label: 'Notes',
  type: 'textarea'
}];
export function DebitCardsPage() {
  const [searchParams] = useSearchParams();
  const {
    data,
    create,
    update,
    remove
  } = useSupabase<DebitCard>('debit_cards');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DebitCard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
  const formatCardNumber = (num: string) => {
    return num.replace(/(\d{4})/g, '$1 ').trim();
  };
  const getCardColor = (type: string) => {
    switch (type) {
      case 'Visa':
        return 'from-blue-600 to-blue-800';
      case 'Mastercard':
        return 'from-orange-500 to-red-600';
      case 'Amex':
        return 'from-slate-700 to-slate-900';
      default:
        return 'from-gray-700 to-gray-900';
    }
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-black px-4">
      <DataList title="Debit Cards" data={data} onAdd={() => {
      setEditingItem(null);
      setIsFormOpen(true);
    }} onEdit={item => {
      setEditingItem(item);
      setIsFormOpen(true);
    }} onDelete={item => setDeleteId(item.id)} filterFn={(item, query) => item.bank_name.toLowerCase().includes(query.toLowerCase()) || item.card_holder.toLowerCase().includes(query.toLowerCase())} renderItem={item => <div className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${getCardColor(item.card_type)} shadow-lg`}>
            <div className="flex justify-between items-start mb-8">
              <h3 className="font-bold text-lg opacity-90">{item.bank_name}</h3>
              <CreditCard className="w-8 h-8 opacity-80" />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl tracking-wider">
                  {formatCardNumber(item.card_number)}
                </span>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/20" onClick={e => {
            e.stopPropagation();
            handleCopy(item.card_number);
          }}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider mb-1">
                  Card Holder
                </p>
                <p className="font-medium tracking-wide">{item.card_holder}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70 uppercase tracking-wider mb-1">
                  Expires
                </p>
                <p className="font-mono">{item.expiry_date}</p>
              </div>
            </div>
          </div>} />

      <DataForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={async data => {
      if (editingItem) {
        await update(editingItem.id, data);
      } else {
        await create(data);
      }
    }} fields={FIELDS} initialData={editingItem} title={editingItem ? 'Edit Card' : 'Add Card'} onFieldOptionsChange={() => {}} />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => {
      if (deleteId) {
        await remove(deleteId);
        setDeleteId(null);
      }
    }} title="Delete Card" message="Are you sure you want to delete this card? This action cannot be undone." />
    </div>;
}
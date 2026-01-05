import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { SelectItemModal } from '../components/data/SelectItemModal';
import { MultiFileUpload } from '../components/data/MultiFileUpload';
import { useSupabase } from '../hooks/useSupabase';
import { InsurancePolicy, FormField } from '../types';
import { Home, X, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const getInsurancePolicyFields = (): FormField[] => [{
  name: 'policy_type',
  label: 'Policy Type',
  type: 'text',
  required: true,
  placeholder: 'e.g. Life, Health, Motor, Home'
}, {
  name: 'policy_name',
  label: 'Policy Name',
  type: 'text',
  required: true,
  placeholder: 'e.g. Endowment Plan, Term Insurance'
}, {
  name: 'policy_number',
  label: 'Policy Number',
  type: 'text',
  required: true,
  secure: true,
  placeholder: 'e.g. POL123456789'
}, {
  name: 'start_date',
  label: 'Start Date',
  type: 'date',
  required: true
}, {
  name: 'expiry_date',
  label: 'Expiry Date',
  type: 'date'
}, {
  name: 'insured_amount',
  label: 'Insured Amount',
  type: 'number',
  required: true,
  placeholder: 'e.g. 1000000'
}, {
  name: 'premium_amount',
  label: 'Premium Amount',
  type: 'number',
  required: true,
  placeholder: 'e.g. 15000'
}, {
  name: 'frequency',
  label: 'Payment Frequency',
  type: 'select',
  options: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
  placeholder: 'Select payment frequency'
}, {
  name: 'policy_year',
  label: 'Policy Year',
  type: 'text',
  placeholder: 'e.g. 2024-2025'
}, {
  name: 'payment_year',
  label: 'Payment Year',
  type: 'text',
  placeholder: 'e.g. 2024'
}, {
  name: 'nominee_name',
  label: 'Nominee Name',
  type: 'text',
  placeholder: 'Nominee name'
}, {
  name: 'nominee_dob',
  label: 'Nominee Date of Birth',
  type: 'date'
}, {
  name: 'notes',
  label: 'Notes',
  type: 'textarea',
  placeholder: 'Additional notes about the policy'
}];

export function InsurancePoliciesPage() {
  const [searchParams] = useSearchParams();
  const {
    data,
    create,
    update,
    remove
  } = useSupabase<InsurancePolicy>('insurance_policies');
  
  const [selectedPolicyType, setSelectedPolicyType] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InsurancePolicy | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null);
  const [policyDocuments, setPolicyDocuments] = useState<string[]>([]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    mode: 'onBlur',
    defaultValues: editingItem || {}
  });

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setEditingItem(null);
      setIsFormOpen(true);
      setPolicyDocuments([]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isFormOpen) {
      reset(editingItem || {});
      if (editingItem?.policy_documents) {
        const docs = Array.isArray(editingItem.policy_documents) 
          ? editingItem.policy_documents 
          : [editingItem.policy_documents];
        setPolicyDocuments(docs);
      } else {
        setPolicyDocuments([]);
      }
    } else {
      setPolicyDocuments([]);
    }
  }, [isFormOpen, editingItem, reset]);

  const uniquePolicyTypes = Array.from(new Set(data.map(item => item.policy_type))).sort();

  const policiesByType = selectedPolicyType 
    ? data.filter(item => item.policy_type === selectedPolicyType)
    : [];

  const policiesOfSelectedType = selectedPolicyType
    ? data.filter(item => item.policy_type === selectedPolicyType)
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
              {selectedPolicy?.policy_name}
            </h2>
            <p className="text-sm text-gray-500">{selectedPolicy?.policy_type}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (policiesOfSelectedType.length > 1) {
                  setPendingAction('edit');
                  setShowItemSelector(true);
                } else {
                  setEditingItem(selectedPolicy);
                  setIsFormOpen(true);
                }
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (policiesOfSelectedType.length > 1) {
                  setPendingAction('delete');
                  setShowItemSelector(true);
                } else {
                  setDeleteId(selectedPolicy?.id || null);
                }
              }}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedPolicyType(null);
                setSelectedPolicy(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {selectedPolicy && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              {selectedPolicy.policy_name && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Policy Name</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{selectedPolicy.policy_name}</span>
                </div>
              )}

              {selectedPolicy.policy_number && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Policy Number</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{selectedPolicy.policy_number}</span>
                </div>
              )}

              {selectedPolicy.start_date && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Start Date</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{selectedPolicy.start_date}</span>
                </div>
              )}

              {selectedPolicy.expiry_date && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Expiry Date</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{selectedPolicy.expiry_date}</span>
                </div>
              )}

              {selectedPolicy.insured_amount && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Insured Amount</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">₹{selectedPolicy.insured_amount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {selectedPolicy.premium_amount && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Premium Amount</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">₹{selectedPolicy.premium_amount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {selectedPolicy.frequency && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Payment Frequency</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{selectedPolicy.frequency}</span>
                </div>
              )}

              {selectedPolicy.nominee_name && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Nominee Name</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{selectedPolicy.nominee_name}</span>
                </div>
              )}

              {selectedPolicy.policy_documents && (Array.isArray(selectedPolicy.policy_documents) ? selectedPolicy.policy_documents.length > 0 : selectedPolicy.policy_documents) && (
                <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Policy Documents</span>
                  <div className="mt-2 space-y-2">
                    {Array.isArray(selectedPolicy.policy_documents) ? (
                      selectedPolicy.policy_documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <span>📄</span>
                          <span className="truncate">{decodeURIComponent(doc.split('/').pop() || `Document ${index + 1}`)}</span>
                        </a>
                      ))
                    ) : (
                      <a
                        href={selectedPolicy.policy_documents}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              )}

              {selectedPolicy.notes && (
                <div className="flex justify-between items-start pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Notes</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{selectedPolicy.notes}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-2 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button
            variant="secondary"
            className="flex-1 text-sm"
            onClick={() => {
              setSelectedPolicy(null);
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Insurance Policies</h1>
          <Link to="/">
            <Button size="icon" variant="ghost" className="text-gray-600 dark:text-gray-400">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {!selectedPolicyType ? (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {uniquePolicyTypes.length > 0 ? 'Select a policy type' : 'No policies found'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uniquePolicyTypes.map(policyType => {
                const policiesOfType = data.filter(item => item.policy_type === policyType);
                const count = policiesOfType.length;
                return (
                  <motion.button
                    key={policyType}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedPolicyType(policyType);
                    }}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white text-center truncate">
                      {policyType}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {count} {count === 1 ? 'policy' : 'policies'}
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
                onClick={() => setSelectedPolicyType(null)}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
              >
                ← Policy Types
              </button>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                {selectedPolicyType}
              </h2>
            </div>
            <div className="space-y-3">
              {policiesByType.map(policy => (
                <motion.button
                  key={policy.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPolicy(policy)}
                  className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left"
                >
                  <div className="font-semibold text-gray-900 dark:text-white">{policy.policy_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {policy.frequency && `${policy.frequency} • `}
                    {policy.start_date && `Valid till ${policy.expiry_date || 'Renewal'}`}
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedPolicy && renderDetailsModal()}

      <SelectItemModal
        isOpen={showItemSelector}
        items={policiesOfSelectedType}
        title={`Select Policy`}
        getItemLabel={(item) => `${item.policy_name}`}
        getItemDescription={(item) => `Policy#: ${item.policy_number || ''}`}
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-t-3xl w-full md:rounded-3xl flex flex-col max-h-[90vh]"
          >
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Policy' : 'Add Policy'}
              </h2>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingItem(null);
                  setShowItemSelector(false);
                  setPolicyDocuments([]);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              <form
                id="policy-form"
                onSubmit={handleSubmit(async formData => {
                  const finalData = {
                    ...formData,
                    policy_documents: policyDocuments.length > 0 ? policyDocuments : editingItem?.policy_documents || null
                  };
                  if (editingItem) {
                    await update(editingItem.id, finalData);
                  } else {
                    await create(finalData);
                  }
                  setIsFormOpen(false);
                  setEditingItem(null);
                  setShowItemSelector(false);
                  setPolicyDocuments([]);
                })}
                className="space-y-4"
              >
                {getInsurancePolicyFields().map(field => (
                  <div key={field.name}>
                    {field.type === 'select' ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </label>
                        <select
                          {...register(field.name, {
                            required: field.required ? `${field.label} is required` : false
                          })}
                          className={`flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 ${
                            errors[field.name] ? 'border-red-500' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {errors[field.name] && (
                          <p className="text-sm text-red-500">
                            {errors[field.name]?.message as string}
                          </p>
                        )}
                      </div>
                    ) : field.type === 'textarea' ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </label>
                        <textarea
                          {...register(field.name, {
                            required: field.required ? `${field.label} is required` : false
                          })}
                          className={`flex min-h-[80px] w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 ${
                            errors[field.name] ? 'border-red-500' : 'border-gray-200'
                          }`}
                          placeholder={field.placeholder}
                        />
                        {errors[field.name] && (
                          <p className="text-sm text-red-500">
                            {errors[field.name]?.message as string}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          {...register(field.name, {
                            required: field.required ? `${field.label} is required` : false
                          })}
                          className={`flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 ${
                            errors[field.name] ? 'border-red-500' : 'border-gray-200'
                          }`}
                        />
                        {errors[field.name] && (
                          <p className="text-sm text-red-500">
                            {errors[field.name]?.message as string}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </form>

              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <MultiFileUpload
                  existingFiles={editingItem?.policy_documents && Array.isArray(editingItem.policy_documents) ? editingItem.policy_documents : []}
                  onFilesChange={(files) => setPolicyDocuments(files)}
                  documentName={editingItem?.policy_name || selectedPolicyType || 'policy'}
                  accountOwner={editingItem?.policy_number || 'unknown'}
                  label="Policy Documents"
                />
              </div>

              <div className="sticky bottom-0 flex gap-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                    setShowItemSelector(false);
                    setPolicyDocuments([]);
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  form="policy-form"
                  type="submit"
                  className="flex-1"
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Policy"
        message="Are you sure you want to delete this insurance policy? This action cannot be undone."
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

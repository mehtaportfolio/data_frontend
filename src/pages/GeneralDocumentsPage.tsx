import React, { useState, useEffect } from 'react';
import { DataForm } from '../components/data/DataForm';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { useSupabase } from '../hooks/useSupabase';
import { GeneralDocument, FormField } from '../types';
import { Home, X, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const getGeneralDocumentsFields = (documentName?: string): FormField[] => [{
  name: 'document_name',
  label: 'Document Name',
  type: 'text',
  required: true,
  placeholder: 'e.g. Passport, Aadhar, Driving License'
}, {
  name: 'account_owner',
  label: 'Account Owner',
  type: 'text',
  required: true,
  placeholder: 'Document owner name'
}, {
  name: 'document_number',
  label: 'Document Number',
  type: 'text',
  secure: true,
  placeholder: 'e.g. ABC1234567'
}, {
  name: 'issue_date',
  label: documentName === 'PAN' ? 'Date of Birth' : 'Issue Date',
  type: 'date'
}, {
  name: 'expiry_date',
  label: 'Expiry Date',
  type: 'date'
}, {
  name: 'file_attachment_file',
  label: 'Upload Document',
  type: 'file',
  placeholder: 'Select PDF or image file',
  accept: '.pdf,.jpg,.jpeg,.png,.webp'
}, {
  name: 'notes',
  label: 'Notes',
  type: 'textarea',
  placeholder: 'Additional notes about the document'
}];

export function GeneralDocumentsPage() {
  const [searchParams] = useSearchParams();
  const {
    data,
    create,
    update,
    remove
  } = useSupabase<GeneralDocument>('general_documents');
  
  const [selectedDocName, setSelectedDocName] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GeneralDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setEditingItem(null);
      setIsFormOpen(true);
    }
  }, [searchParams]);

  const uniqueDocuments = Array.from(new Set(data.map(item => item.document_name))).sort();

  const documentsByName = selectedDocName 
    ? data.filter(item => item.document_name === selectedDocName)
    : [];

  const uniqueOwners = Array.from(new Set(documentsByName.map(item => item.account_owner))).sort();

  const itemsByOwner = selectedOwner && selectedDocName
    ? documentsByName.filter(item => item.account_owner === selectedOwner)
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
              {selectedDocName}
            </h2>
            <p className="text-sm text-gray-500">{selectedOwner}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingItem(itemsByOwner[0]);
                setSelectedDocName(null);
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
                setSelectedDocName(null);
                setSelectedOwner(null);
              }}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setSelectedDocName(null);
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

              {item.document_number && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Document Number</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right font-mono">{item.document_number}</span>
                </div>
              )}

              {item.issue_date && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {selectedDocName === 'PAN' ? 'Date of Birth' : 'Issue Date'}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.issue_date}</span>
                </div>
              )}

              {item.expiry_date && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Expiry Date</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right">{item.expiry_date}</span>
                </div>
              )}

              {item.file_attachment && (
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-3">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">File Attachment</span>
                  <a 
                    href={item.file_attachment} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline text-right"
                  >
                    View
                  </a>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">General Documents</h1>
          <Link to="/">
            <Button size="icon" variant="ghost" className="text-gray-600 dark:text-gray-400">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {!selectedDocName ? (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {uniqueDocuments.length > 0 ? 'Select a document type' : 'No documents found'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uniqueDocuments.map(docName => {
                const docsOfType = data.filter(item => item.document_name === docName);
                const count = docsOfType.length;
                return (
                  <motion.button
                    key={docName}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (count === 1) {
                        setSelectedDocName(docName);
                        setSelectedOwner(docsOfType[0].account_owner);
                      } else {
                        setSelectedDocName(docName);
                      }
                    }}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white text-center truncate">
                      {docName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                      {count} {count === 1 ? 'document' : 'documents'}
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
                onClick={() => setSelectedDocName(null)}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
              >
                ← Document Types
              </button>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDocName}
              </h2>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {uniqueOwners.length > 0 ? 'Select account owner' : 'No owners'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {uniqueOwners.map(owner => {
                const ownerDocs = documentsByName.filter(
                  item => item.account_owner === owner
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
                      {ownerDocs.length} {ownerDocs.length === 1 ? 'item' : 'items'}
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

      {selectedOwner && selectedDocName && renderDetailsModal()}

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
        fields={getGeneralDocumentsFields(editingItem?.document_name || selectedDocName)}
        initialData={editingItem}
        title={editingItem ? 'Edit Document' : 'Add Document'}
        documentName={editingItem?.document_name || selectedDocName}
        accountOwner={editingItem?.account_owner || selectedOwner}
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
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
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

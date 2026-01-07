import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../hooks/useSupabase';
import { Deposit } from '../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { SelectWithAdd } from '../components/data/SelectWithAdd';
import { toast } from 'sonner';
import { PageHeader } from '../components/ui/PageHeader';

export function BankDepositPage() {
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    data: deposits,
    create,
    update,
    remove,
  } = useSupabase<Deposit>('deposits');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      deposit_date: new Date().toISOString().split('T')[0],
      amount: '',
      bank_name: 'PNB',
      branch: 'MP',
      deposit_type: '',
    },
  });

  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bankNames, setBankNames] = useState<string[]>(['PNB', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank']);
  const [branches, setBranches] = useState<string[]>(['MP', 'Delhi', 'Mumbai', 'Bangalore', 'Pune']);
  const [depositTypes, setDepositTypes] = useState<string[]>([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedYearForModal, setSelectedYearForModal] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const uniqueTypes = Array.from(new Set(
      deposits
        .map(d => d.deposit_type)
        .filter(Boolean)
    )).sort() as string[];
    setDepositTypes(uniqueTypes);
  }, [deposits]);

  const bankNameValue = watch('bank_name');
  const branchValue = watch('branch');

  const isYearFiltered = selectedYear !== '';

  const depositsForYear = useMemo(() => {
    let filtered = deposits;

    if (selectedTab !== 'all') {
      filtered = filtered.filter(deposit => deposit.deposit_type === selectedTab);
    }

    if (!isYearFiltered) {
      return filtered;
    }

    return filtered.filter(deposit => {
      const depositYear = new Date(deposit.deposit_date).getFullYear().toString();
      return depositYear === selectedYear;
    });
  }, [deposits, selectedYear, selectedTab, isYearFiltered]);

  const displayedTotal = useMemo(() => {
    return depositsForYear.reduce((sum, deposit) => sum + deposit.amount, 0);
  }, [depositsForYear]);

  const yearWiseData = useMemo(() => {
    const yearMap: { [key: string]: number } = {};
    const dataToProcess = isYearFiltered
      ? depositsForYear
      : selectedTab === 'all'
      ? deposits
      : deposits.filter(d => d.deposit_type === selectedTab);
    
    dataToProcess.forEach(deposit => {
      const year = new Date(deposit.deposit_date).getFullYear().toString();
      yearMap[year] = (yearMap[year] || 0) + deposit.amount;
    });
    return Object.entries(yearMap)
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year));
  }, [deposits, depositsForYear, isYearFiltered, selectedTab]);

  const totalAmount = useMemo(() => {
    return yearWiseData.reduce((sum, item) => sum + item.amount, 0) || 1;
  }, [yearWiseData]);

  const onFormSubmit = async (data: {
    deposit_date: string;
    amount: string;
    bank_name: string;
    branch: string;
    deposit_type: string;
  }) => {
    try {
      const depositData = {
        deposit_date: data.deposit_date,
        amount: parseFloat(data.amount),
        bank_name: data.bank_name,
        branch: data.branch,
        deposit_type: data.deposit_type || undefined,
      };

      if (editingDeposit) {
        await update(editingDeposit.id, depositData);
      } else {
        await create(depositData);
      }
      setIsFormOpen(false);
      setEditingDeposit(null);
      reset({
        deposit_date: new Date().toISOString().split('T')[0],
        amount: '',
        bank_name: 'PNB',
        branch: 'MP',
        deposit_type: '',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save deposit';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
      <PageHeader
        title="Bank Deposits"
        onLogout={logout}
        showAddButton={false}
        showRefreshButton={false}
      />

      <div className="p-6 space-y-6">
        {/* Year Filter with Add Button */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Year
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min={2000}
              max={2100}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingDeposit(null);
                reset({
                  deposit_date: new Date().toISOString().split('T')[0],
                  amount: '',
                  bank_name: 'PNB',
                  branch: 'MP',
                  deposit_type: '',
                });
                setIsFormOpen(true);
              }}
              className="px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-all"
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Deposit Type Tabs */}
        {depositTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 overflow-x-auto pb-2"
          >
            <motion.button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All
            </motion.button>
            {depositTypes.map(type => (
              <motion.button
                key={type}
                onClick={() => setSelectedTab(type)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                  selectedTab === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {type}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Overall Total Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {isYearFiltered 
              ? `Total (${selectedYear}${selectedTab !== 'all' ? ` - ${selectedTab}` : ''})`
              : `Total${selectedTab !== 'all' ? ` - ${selectedTab}` : ''}`
            }
          </p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            ₹{displayedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isYearFiltered 
              ? `${depositsForYear.length} deposits${selectedTab !== 'all' ? ` (${selectedTab})` : ''} in ${selectedYear}`
              : selectedTab !== 'all'
              ? `${deposits.filter(d => d.deposit_type === selectedTab).length} ${selectedTab} deposits`
              : `${deposits.length} total deposits across all years`
            }
          </p>
        </motion.div>

        {/* Year-wise Bar Chart */}
        {!isYearFiltered && yearWiseData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Deposits by Year (Click to view entries)
            </h3>
            <div className="space-y-4">
              {yearWiseData.map(item => {
                const percentage = (item.amount / totalAmount) * 100;
                return (
                  <motion.button
                    key={item.year}
                    onClick={() => {
                      setSelectedYearForModal(item.year);
                      setShowYearModal(true);
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="w-full text-left"
                  >
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.year}
                      </span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-3 rounded-full"
                      >
                        {percentage > 15 && (
                          <span className="text-xs font-bold text-white">
                            {Math.round(percentage)}%
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Filtered Year Entries Table */}
        {isYearFiltered && depositsForYear.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Bank Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Deposit Type</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depositsForYear
                    .sort((a, b) => new Date(b.deposit_date).getTime() - new Date(a.deposit_date).getTime())
                    .map(deposit => {
                      const depositDate = new Date(deposit.deposit_date);
                      const formattedDate = `${String(depositDate.getDate()).padStart(2, '0')}-${String(depositDate.getMonth() + 1).padStart(2, '0')}-${String(depositDate.getFullYear()).slice(-2)}`;
                      return (
                        <motion.tr
                          key={deposit.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{formattedDate}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            ₹{deposit.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.bank_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.branch || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.deposit_type || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setEditingDeposit(deposit);
                                  reset({
                                    deposit_date: deposit.deposit_date,
                                    amount: deposit.amount.toString(),
                                    bank_name: deposit.bank_name,
                                    branch: deposit.branch || 'MP',
                                    deposit_type: deposit.deposit_type || '',
                                  });
                                  setIsFormOpen(true);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1.5"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteId(deposit.id);
                                }}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {yearWiseData.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No deposits yet. Click the + button to add your first deposit!</p>
          </div>
        )}
      </div>

      {/* Year Details Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showYearModal ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-4 ${
          showYearModal ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: showYearModal ? 0 : '100%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-t-3xl w-full md:rounded-3xl flex flex-col max-h-[90vh]"
        >
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Deposits - {selectedYearForModal}{selectedTab !== 'all' && ` (${selectedTab})`}
              </h2>
            </div>
            <button
              onClick={() => setShowYearModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Bank Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Deposit Type</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedYearForModal &&
                  deposits
                    .filter(d => {
                      const yearMatch = new Date(d.deposit_date).getFullYear().toString() === selectedYearForModal;
                      const typeMatch = selectedTab === 'all' || d.deposit_type === selectedTab;
                      return yearMatch && typeMatch;
                    })
                    .sort((a, b) => new Date(b.deposit_date).getTime() - new Date(a.deposit_date).getTime())
                    .map(deposit => {
                      const depositDate = new Date(deposit.deposit_date);
                      const formattedDate = `${String(depositDate.getDate()).padStart(2, '0')}-${String(depositDate.getMonth() + 1).padStart(2, '0')}-${String(depositDate.getFullYear()).slice(-2)}`;
                      return (
                        <motion.tr
                          key={deposit.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{formattedDate}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
                            ₹{deposit.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.bank_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.branch || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.deposit_type || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setEditingDeposit(deposit);
                                  reset({
                                    deposit_date: deposit.deposit_date,
                                    amount: deposit.amount.toString(),
                                    bank_name: deposit.bank_name,
                                    branch: deposit.branch || 'MP',
                                    deposit_type: deposit.deposit_type || '',
                                  });
                                  setShowYearModal(false);
                                  setIsFormOpen(true);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1.5"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteId(deposit.id);
                                  setShowYearModal(false);
                                }}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* Add/Edit Deposit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDeposit(null);
          reset({
            deposit_date: new Date().toISOString().split('T')[0],
            amount: '',
            bank_name: 'PNB',
            branch: 'MP',
            deposit_type: '',
          });
        }}
        title={editingDeposit ? 'Edit Bank Deposit' : 'Add Bank Deposit'}
        footer={
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsFormOpen(false);
                setEditingDeposit(null);
                reset({
                  deposit_date: new Date().toISOString().split('T')[0],
                  amount: '',
                  bank_name: 'PNB',
                  branch: 'MP',
                  deposit_type: '',
                });
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              form="deposit-form"
              type="submit"
              className="flex-1"
              isLoading={isSubmitting}
            >
              Save
            </Button>
          </div>
        }
      >
        <form id="deposit-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Deposit Date
            </label>
            <input
              type="date"
              {...register('deposit_date', { required: 'Deposit date is required' })}
              className={`flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 ${
                errors.deposit_date ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.deposit_date && (
              <p className="text-sm text-red-500 mt-1">{errors.deposit_date.message as string}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0, message: 'Amount must be greater than 0' },
              })}
              className={`flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 ${
                errors.amount ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">{errors.amount.message as string}</p>
            )}
          </div>

          <SelectWithAdd
            label="Bank Name"
            value={bankNameValue}
            onChange={(value) => setValue('bank_name', value)}
            options={bankNames}
            onAddNew={(newBank) => {
              if (!bankNames.includes(newBank)) {
                setBankNames([...bankNames, newBank]);
              }
            }}
            error={errors.bank_name?.message as string | undefined}
            required={true}
            placeholder="Select bank"
          />

          <SelectWithAdd
            label="Branch"
            value={branchValue}
            onChange={(value) => setValue('branch', value)}
            options={branches}
            onAddNew={(newBranch) => {
              if (!branches.includes(newBranch)) {
                setBranches([...branches, newBranch]);
              }
            }}
            error={errors.branch?.message as string | undefined}
            required={true}
            placeholder="Select branch"
          />
          <SelectWithAdd
            label="Deposit Type"
            value={watch('deposit_type')}
            onChange={(value) => setValue('deposit_type', value)}
            options={depositTypes}
            onAddNew={(newType) => {
              if (!depositTypes.includes(newType)) {
                setDepositTypes([...depositTypes, newType].sort());
              }
            }}
            error={errors.deposit_type?.message as string | undefined}
            required={false}
            placeholder="Select deposit type"
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await remove(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete Deposit"
        message="Are you sure you want to delete this deposit record? This action cannot be undone."
      />
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../hooks/useSupabase';
import { Deposit, DummyTable } from '../types';
import { Plus, Edit2, Trash2, X, FileText, Trash, Gift, Send, ChevronDown, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ConfirmDialog } from '../components/data/ConfirmDialog';
import { SelectWithAdd } from '../components/data/SelectWithAdd';
import { toast } from 'sonner';
import { PageHeader } from '../components/ui/PageHeader';

export function BankDepositPage() {
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const sourceDropdownRef = React.useRef<HTMLDivElement>(null);
  const accountDropdownRef = React.useRef<HTMLDivElement>(null);
  const yearDropdownRef = React.useRef<HTMLDivElement>(null);

  const {
    data: deposits,
    create,
    update,
    remove,
  } = useSupabase<Deposit>('deposits');

  const {
    data: dummyTableEntries,
    create: createDummyEntry,
    update: updateDummyEntry,
    remove: removeDummyEntry,
  } = useSupabase<DummyTable>('dummy_table');

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
      source: '',
      account_name: '',
      deposit_type: '',
    },
  });

  const {
    register: registerDummy,
    handleSubmit: handleSubmitDummy,
    reset: resetDummy,
    formState: { errors: errorsDummy, isSubmitting: isSubmittingDummy },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      sr_no: '',
      index_no: '',
      point_no: '',
    },
  });

  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [accountNames, setAccountNames] = useState<string[]>([]);
  const [depositTypes, setDepositTypes] = useState<string[]>([]);
  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedYearForModal, setSelectedYearForModal] = useState<string | null>(null);
  const [isDummyModalOpen, setIsDummyModalOpen] = useState(false);
  const [editingDummyEntry, setEditingDummyEntry] = useState<DummyTable | null>(null);
  const [deleteDummyId, setDeleteDummyId] = useState<string | null>(null);
  const [deleteAllDummyId, setDeleteAllDummyId] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
        setIsSourceDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const dbSources = deposits.map(d => d.source).filter(Boolean);
    const uniqueSources = Array.from(new Set(dbSources)).sort();
    setSources(uniqueSources);

    const dbAccounts = deposits.map(d => d.account_name).filter(Boolean) as string[];
    const uniqueAccounts = Array.from(new Set(dbAccounts)).sort();
    setAccountNames(uniqueAccounts);
  }, [deposits]);

  const availableSources = useMemo(() => {
    let filtered = deposits;
    if (selectedAccounts.length > 0) {
      filtered = filtered.filter(d => d.account_name && selectedAccounts.includes(d.account_name));
    }
    const dbSources = filtered.map(d => d.source).filter(Boolean);
    return Array.from(new Set(dbSources)).sort();
  }, [deposits, selectedAccounts]);

  const availableAccounts = useMemo(() => {
    let filtered = deposits;
    if (selectedSources.length > 0) {
      filtered = filtered.filter(d => selectedSources.includes(d.source));
    }
    const dbAccounts = filtered.map(d => d.account_name).filter(Boolean) as string[];
    return Array.from(new Set(dbAccounts)).sort();
  }, [deposits, selectedSources]);

  const availableYears = useMemo(() => {
    const years = deposits.map(d => new Date(d.deposit_date).getFullYear().toString());
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, [deposits]);

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

  const sourceValue = watch('source');
  const accountNameValue = watch('account_name');

  const isYearFiltered = selectedYears.length > 0;

  const depositsForYear = useMemo(() => {
    let filtered = deposits;

    if (selectedTab !== 'all') {
      filtered = filtered.filter(deposit => deposit.deposit_type === selectedTab);
    }

    if (selectedSources.length > 0) {
      filtered = filtered.filter(deposit => selectedSources.includes(deposit.source));
    }

    if (selectedAccounts.length > 0) {
      filtered = filtered.filter(deposit => deposit.account_name && selectedAccounts.includes(deposit.account_name));
    }

    if (!isYearFiltered) {
      return filtered;
    }

    return filtered.filter(deposit => {
      const depositYear = new Date(deposit.deposit_date).getFullYear().toString();
      return selectedYears.includes(depositYear);
    });
  }, [deposits, selectedYears, selectedTab, isYearFiltered, selectedSources, selectedAccounts]);

  const displayedTotal = useMemo(() => {
    return depositsForYear.reduce((sum, deposit) => sum + deposit.amount, 0);
  }, [depositsForYear]);

  const yearWiseData = useMemo(() => {
    const yearMap: { [key: string]: number } = {};
    const dataToProcess = isYearFiltered
      ? depositsForYear
      : deposits.filter(d => {
          const tabMatch = selectedTab === 'all' || d.deposit_type === selectedTab;
          const sourceMatch = selectedSources.length === 0 || selectedSources.includes(d.source);
          const accountMatch = selectedAccounts.length === 0 || (d.account_name && selectedAccounts.includes(d.account_name));
          return tabMatch && sourceMatch && accountMatch;
        });
    
    dataToProcess.forEach(deposit => {
      const year = new Date(deposit.deposit_date).getFullYear().toString();
      yearMap[year] = (yearMap[year] || 0) + deposit.amount;
    });
    return Object.entries(yearMap)
      .map(([year, amount]) => ({ year, amount }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year));
  }, [deposits, depositsForYear, isYearFiltered, selectedTab, selectedSources, selectedAccounts]);

  const totalAmount = useMemo(() => {
    return yearWiseData.reduce((sum, item) => sum + item.amount, 0) || 1;
  }, [yearWiseData]);

  const onFormSubmit = async (data: {
    deposit_date: string;
    amount: string;
    source: string;
    account_name: string;
    deposit_type: string;
  }) => {
    try {
      const depositData = {
        deposit_date: data.deposit_date,
        amount: parseFloat(data.amount),
        source: data.source,
        account_name: data.account_name || undefined,
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
        source: '',
        account_name: '',
        deposit_type: '',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save deposit';
      toast.error(errorMsg);
    }
  };

  const onDummyFormSubmit = async (data: {
    sr_no: string;
    index_no: string;
    point_no: string;
  }) => {
    try {
      const dummyData = {
        sr_no: parseInt(data.sr_no),
        index_no: parseInt(data.index_no),
        point_no: parseFloat(data.point_no),
      };

      if (editingDummyEntry) {
        await updateDummyEntry(editingDummyEntry.id, dummyData);
      } else {
        await createDummyEntry(dummyData);
      }
      setIsDummyModalOpen(false);
      setEditingDummyEntry(null);
      resetDummy({
        sr_no: '',
        index_no: '',
        point_no: '',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save entry';
      toast.error(errorMsg);
    }
  };

  const onDeleteAllDummyEntries = async () => {
    try {
      const deletePromises = dummyTableEntries.map(entry => removeDummyEntry(entry.id));
      await Promise.all(deletePromises);
      setDeleteAllDummyId(false);
      toast.success('All entries deleted successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete entries';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bank Deposits
              </h1>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingDummyEntry(null);
                  resetDummy({
                    sr_no: '',
                    index_no: '',
                    point_no: '',
                  });
                  setIsDummyModalOpen(true);
                }}
                title="Manage Dummy Entries"
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-all text-sm font-medium"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                D
              </motion.button>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Deposit Type Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {['all', 'Reward', 'Review'].map(tab => (
            <motion.button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all flex-1 ${
                selectedTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab === 'all' ? 'All' : tab}
            </motion.button>
          ))}
        </motion.div>

        {/* Year Filter with Add Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Select Year</label>
            {selectedYears.length > 0 && (
              <button 
                onClick={() => setSelectedYears([])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative" ref={yearDropdownRef}>
              <button
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              >
                <span className="truncate">
                  {selectedYears.length === 0 
                    ? 'All Years' 
                    : selectedYears.length === 1 
                      ? selectedYears[0]
                      : `${selectedYears.length} years selected`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isYearDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl max-h-60 overflow-y-auto p-2"
                  >
                    <div className="sticky top-0 bg-white dark:bg-gray-900 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                      <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedYears.length === availableYears.length && availableYears.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedYears(availableYears);
                            } else {
                              setSelectedYears([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Select All</span>
                      </label>
                    </div>
                    <div className="space-y-1">
                      {availableYears.map(year => (
                        <label key={year} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedYears.includes(year)}
                            onChange={() => {
                              if (selectedYears.includes(year)) {
                                setSelectedYears(selectedYears.filter(y => y !== year));
                              } else {
                                setSelectedYears([...selectedYears, year]);
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{year}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                  source: '',
                  account_name: '',
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

        {/* Source and Account Filters (Dropdown Multi-select) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Dropdown */}
          <div className="space-y-2" ref={sourceDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Sources</label>
              {selectedSources.length > 0 && (
                <button 
                  onClick={() => setSelectedSources([])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsSourceDropdownOpen(!isSourceDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              >
                <span className="truncate">
                  {selectedSources.length === 0 
                    ? 'All Sources' 
                    : selectedSources.length === 1 
                      ? selectedSources[0]
                      : `${selectedSources.length} sources selected`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isSourceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isSourceDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl max-h-60 overflow-y-auto p-2"
                  >
                    <div className="sticky top-0 bg-white dark:bg-gray-900 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                      <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedSources.length === availableSources.length && availableSources.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSources(availableSources);
                            } else {
                              setSelectedSources([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Select All</span>
                      </label>
                    </div>
                    <div className="space-y-1">
                      {availableSources.map(source => (
                        <label key={source} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedSources.includes(source)}
                            onChange={() => {
                              if (selectedSources.includes(source)) {
                                setSelectedSources(selectedSources.filter(s => s !== source));
                              } else {
                                setSelectedSources([...selectedSources, source]);
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Account Dropdown */}
          <div className="space-y-2" ref={accountDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Account Names</label>
              {selectedAccounts.length > 0 && (
                <button 
                  onClick={() => setSelectedAccounts([])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              >
                <span className="truncate">
                  {selectedAccounts.length === 0 
                    ? 'All Accounts' 
                    : selectedAccounts.length === 1 
                      ? selectedAccounts[0]
                      : `${selectedAccounts.length} accounts selected`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isAccountDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl max-h-60 overflow-y-auto p-2"
                  >
                    <div className="sticky top-0 bg-white dark:bg-gray-900 pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                      <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.length === availableAccounts.length && availableAccounts.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAccounts(availableAccounts);
                            } else {
                              setSelectedAccounts([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Select All</span>
                      </label>
                    </div>
                    <div className="space-y-1">
                      {availableAccounts.map(account => (
                        <label key={account} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedAccounts.includes(account)}
                            onChange={() => {
                              if (selectedAccounts.includes(account)) {
                                setSelectedAccounts(selectedAccounts.filter(a => a !== account));
                              } else {
                                setSelectedAccounts([...selectedAccounts, account]);
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{account}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Overall Total Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {isYearFiltered 
              ? `Total (${selectedYears.join(', ')}${selectedTab !== 'all' ? ` - ${selectedTab}` : ''})`
              : `Total${selectedTab !== 'all' ? ` - ${selectedTab}` : ''}`
            }
          </p>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            ₹{displayedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isYearFiltered 
              ? `${depositsForYear.length} deposits${selectedTab !== 'all' ? ` (${selectedTab})` : ''} in ${selectedYears.join(', ')}`
              : `${depositsForYear.length} total deposits matching filters`
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Account</th>
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
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.source}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.account_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.deposit_type || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setEditingDeposit(deposit);
                                  reset({
                                    deposit_date: deposit.deposit_date,
                                    amount: deposit.amount.toString(),
                                    source: deposit.source,
                                    account_name: deposit.account_name || '',
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
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start md:items-center justify-center p-4 ${
          showYearModal ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: showYearModal ? 0 : '-100%' }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-b-3xl w-full md:rounded-3xl flex flex-col max-h-[90vh]"
        >
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Deposits - {selectedYearForModal}
                {selectedTab !== 'all' && ` (${selectedTab})`}
                {selectedSources.length > 0 && ` - ${selectedSources.join(', ')}`}
                {selectedAccounts.length > 0 && ` (${selectedAccounts.join(', ')})`}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Account</th>
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
                      const sourceMatch = selectedSources.length === 0 || selectedSources.includes(d.source);
                      const accountMatch = selectedAccounts.length === 0 || (d.account_name && selectedAccounts.includes(d.account_name));
                      return yearMatch && typeMatch && sourceMatch && accountMatch;
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
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.source}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.account_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{deposit.deposit_type || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setEditingDeposit(deposit);
                                  reset({
                                    deposit_date: deposit.deposit_date,
                                    amount: deposit.amount.toString(),
                                    source: deposit.source,
                                    account_name: deposit.account_name || '',
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
            source: '',
            account_name: '',
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
                  source: '',
                  account_name: '',
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
            label="Source"
            value={sourceValue}
            onChange={(value) => setValue('source', value)}
            options={sources}
            onAddNew={(newSource) => {
              if (!sources.includes(newSource)) {
                setSources([...sources, newSource]);
              }
            }}
            error={errors.source?.message as string | undefined}
            required={true}
            placeholder="Select source"
          />

          <SelectWithAdd
            label="Account Name"
            value={accountNameValue}
            onChange={(value) => setValue('account_name', value)}
            options={accountNames}
            onAddNew={(newAccount) => {
              if (!accountNames.includes(newAccount)) {
                setAccountNames([...accountNames, newAccount]);
              }
            }}
            error={errors.account_name?.message as string | undefined}
            required={true}
            placeholder="Select account"
          />
          <SelectWithAdd
            label="Deposit Type"
            value={watch('deposit_type')}
            onChange={(value) => setValue('deposit_type', value)}
            options={Array.from(new Set([...depositTypes, watch('deposit_type')].filter(Boolean))).sort()}
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

      {/* Dummy Table Entries Modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isDummyModalOpen ? 1 : 0 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start md:items-center justify-center p-4 ${
          isDummyModalOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <motion.div
          initial={{ y: '-100%' }}
          animate={{ y: isDummyModalOpen ? 0 : '-100%' }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-900 rounded-b-3xl w-full md:rounded-3xl flex flex-col max-h-[90vh]"
        >
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Dummy Table Entries
            </h2>
            <div className="flex items-center gap-2">
              {dummyTableEntries.length > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteAllDummyId(true)}
                  title="Delete all entries"
                  className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  <Trash className="w-5 h-5" />
                </motion.button>
              )}
              <button
                onClick={() => {
                  setIsDummyModalOpen(false);
                  setEditingDummyEntry(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Add/Edit Form */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  {editingDummyEntry ? 'Edit Entry' : 'Add New Entry'}
                </h3>
                <form onSubmit={handleSubmitDummy(onDummyFormSubmit)} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      SR No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Serial Number"
                      {...registerDummy('sr_no', {
                        required: 'SR No is required',
                        min: { value: 0, message: 'SR No must be 0 or greater' },
                      })}
                      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-900 ${
                        errorsDummy.sr_no ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorsDummy.sr_no && (
                      <p className="text-xs text-red-500 mt-1">{errorsDummy.sr_no.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Index No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Index Number"
                      {...registerDummy('index_no', {
                        required: 'Index No is required',
                        min: { value: 0, message: 'Index No must be 0 or greater' },
                      })}
                      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-900 ${
                        errorsDummy.index_no ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorsDummy.index_no && (
                      <p className="text-xs text-red-500 mt-1">{errorsDummy.index_no.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Point No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Point Number"
                      {...registerDummy('point_no', {
                        required: 'Point No is required',
                        min: { value: 0, message: 'Point No must be 0 or greater' },
                      })}
                      className={`flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:ring-offset-gray-900 ${
                        errorsDummy.point_no ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errorsDummy.point_no && (
                      <p className="text-xs text-red-500 mt-1">{errorsDummy.point_no.message as string}</p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingDummy}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSubmittingDummy ? 'Saving...' : editingDummyEntry ? 'Update' : 'Add'}
                    </button>
                    {editingDummyEntry && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDummyEntry(null);
                          resetDummy({
                            sr_no: '',
                            index_no: '',
                            point_no: '',
                          });
                        }}
                        className="px-3 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>

              {/* Entries Table */}
              {dummyTableEntries.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">SR No</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Index No</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Point No</th>
                          <th className="px-4 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dummyTableEntries.map(entry => (
                          <motion.tr
                            key={entry.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{entry.sr_no}</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{entry.index_no}</td>
                            <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{entry.point_no}</td>
                            <td className="px-4 py-2 text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => {
                                    setEditingDummyEntry(entry);
                                    resetDummy({
                                      sr_no: entry.sr_no.toString(),
                                      index_no: entry.index_no.toString(),
                                      point_no: entry.point_no.toString(),
                                    });
                                  }}
                                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1.5"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteDummyId(entry.id)}
                                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No entries yet. Add your first entry above!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Dummy Entry Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteDummyId}
        onClose={() => setDeleteDummyId(null)}
        onConfirm={async () => {
          if (deleteDummyId) {
            await removeDummyEntry(deleteDummyId);
            setDeleteDummyId(null);
          }
        }}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
      />

      {/* Delete All Dummy Entries Confirmation */}
      <ConfirmDialog
        isOpen={deleteAllDummyId}
        onClose={() => setDeleteAllDummyId(false)}
        onConfirm={onDeleteAllDummyEntries}
        title="Delete All Entries"
        message={`Are you sure you want to delete all ${dummyTableEntries.length} entries? This action cannot be undone.`}
      />
    </div>
  );
}

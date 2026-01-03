import React, { useState } from 'react';
import { Building2, CreditCard, LogOut, FileText, Shield, Globe, Plus, X, RefreshCw } from 'lucide-react';
import { CategoryCard } from '../components/data/CategoryCard';
import { DataForm } from '../components/data/DataForm';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { useSupabase } from '../hooks/useSupabase';
import { useServiceHealth } from '../hooks/useServiceHealth';
import { BankAccount, GeneralDocument, InsurancePolicy, Website, FormField } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

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
}];

const WEBSITE_FIELDS: FormField[] = [{
  name: 'website_name',
  label: 'Website/Service Name',
  type: 'text',
  required: true,
  placeholder: 'e.g. Gmail, Amazon'
}, {
  name: 'login_id',
  label: 'Login ID / Email',
  type: 'text',
  secure: true,
  placeholder: 'user@example.com'
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  secure: true,
  placeholder: 'Password'
}, {
  name: 'recovery_email',
  label: 'Recovery Email',
  type: 'email',
  placeholder: 'recovery@example.com'
}, {
  name: 'security_questions',
  label: 'Security Questions & Answers',
  type: 'text',
  placeholder: 'e.g. Q1: What is your mother\'s name? A: ...'
}, {
  name: 'two_factor_auth',
  label: 'Two-Factor Authentication',
  type: 'text',
  placeholder: 'e.g. Enabled via SMS'
}];

const INSURANCE_POLICY_FIELDS: FormField[] = [{
  name: 'company_name',
  label: 'Insurance Company',
  type: 'text',
  required: true,
  placeholder: 'e.g. HDFC Life'
}, {
  name: 'policy_number',
  label: 'Policy Number',
  type: 'text',
  secure: true,
  placeholder: '1234567890'
}, {
  name: 'policy_type',
  label: 'Policy Type',
  type: 'text',
  placeholder: 'e.g. Term Life, Endowment'
}, {
  name: 'start_date',
  label: 'Start Date',
  type: 'date'
}, {
  name: 'maturity_date',
  label: 'Maturity Date',
  type: 'date'
}, {
  name: 'premium_amount',
  label: 'Premium Amount',
  type: 'text',
  placeholder: '₹5,000'
}, {
  name: 'premium_frequency',
  label: 'Premium Frequency',
  type: 'text',
  placeholder: 'e.g. Monthly, Yearly'
}, {
  name: 'sum_assured',
  label: 'Sum Assured',
  type: 'text',
  placeholder: '₹10,00,000'
}, {
  name: 'agent_name',
  label: 'Agent Name',
  type: 'text'
}, {
  name: 'status',
  label: 'Status',
  type: 'text',
  placeholder: 'e.g. Active, Expired'
}];

const GENERAL_DOCUMENT_FIELDS: FormField[] = [{
  name: 'document_name',
  label: 'Document Name',
  type: 'text',
  required: true,
  placeholder: 'e.g. Passport, PAN Card'
}, {
  name: 'document_number',
  label: 'Document Number',
  type: 'text',
  secure: true,
  placeholder: 'XXXXXXXXXX'
}, {
  name: 'issue_date',
  label: 'Issue Date',
  type: 'date'
}, {
  name: 'expiry_date',
  label: 'Expiry Date',
  type: 'date'
}, {
  name: 'issuing_authority',
  label: 'Issuing Authority',
  type: 'text',
  placeholder: 'e.g. Government of India'
}, {
  name: 'file_attachment',
  label: 'Attachment',
  type: 'file'
}];

export function HomePage() {
  const {
    logout
  } = useAuth();
  const { checkServiceStatus, isLoading } = useServiceHealth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFormType, setOpenFormType] = useState<'bank-accounts' | 'credit-cards' | 'websites' | 'insurance' | 'documents' | null>(null);
  
  const {
    data: bankAccounts,
    create: createBankAccount
  } = useSupabase<BankAccount>('bank_accounts');

  const {
    data: creditCards,
    create: createCreditCard
  } = useSupabase<BankAccount>('credit_cards');

  const {
    data: generalDocuments,
    create: createGeneralDocument
  } = useSupabase<GeneralDocument>('general_documents');

  const {
    data: insurancePolicies,
    create: createInsurancePolicy
  } = useSupabase<InsurancePolicy>('insurance_policies');

  const {
    data: websites,
    create: createWebsite
  } = useSupabase<Website>('websites');

  const menuOptions = [
    {
      label: 'Bank Accounts',
      icon: <Building2 className="w-5 h-5" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      onClick: () => {
        setIsMenuOpen(false);
        setOpenFormType('bank-accounts');
      }
    },
    {
      label: 'Credit Cards',
      icon: <CreditCard className="w-5 h-5" />,
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      onClick: () => {
        setIsMenuOpen(false);
        setOpenFormType('credit-cards');
      }
    },
    {
      label: 'Websites Info',
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
      onClick: () => {
        setIsMenuOpen(false);
        setOpenFormType('websites');
      }
    },
    {
      label: 'Insurance Policies',
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      onClick: () => {
        setIsMenuOpen(false);
        setOpenFormType('insurance');
      }
    },
    {
      label: 'General Documents',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      onClick: () => {
        setIsMenuOpen(false);
        setOpenFormType('documents');
      }
    }
  ];

  const getFormTitle = () => {
    switch (openFormType) {
      case 'bank-accounts':
        return 'Add Bank Account';
      case 'credit-cards':
        return 'Add Credit Card';
      case 'websites':
        return 'Add Website/Account';
      case 'insurance':
        return 'Add Insurance Policy';
      case 'documents':
        return 'Add General Document';
      default:
        return 'Add Entry';
    }
  };

  const getFormFields = () => {
    switch (openFormType) {
      case 'bank-accounts':
        return BANK_ACCOUNT_FIELDS;
      case 'credit-cards':
        return CREDIT_CARD_FIELDS;
      case 'websites':
        return WEBSITE_FIELDS;
      case 'insurance':
        return INSURANCE_POLICY_FIELDS;
      case 'documents':
        return GENERAL_DOCUMENT_FIELDS;
      default:
        return [];
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    switch (openFormType) {
      case 'bank-accounts':
        await createBankAccount(formData);
        break;
      case 'credit-cards':
        await createCreditCard(formData);
        break;
      case 'websites':
        await createWebsite(formData);
        break;
      case 'insurance':
        await createInsurancePolicy(formData);
        break;
      case 'documents':
        await createGeneralDocument(formData);
        break;
    }
  };

  return <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
      <header className="px-6 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Welcome to Data 360
            </p>
          </div>
          <div className="flex items-center gap-2 relative">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => checkServiceStatus()}
              disabled={isLoading}
              title="Check backend service status"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute right-0 mt-2 top-full w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-3 space-y-2">
                    {menuOptions.map((option, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={option.onClick}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${option.color} hover:opacity-80`}
                      >
                        <div className="flex-shrink-0">{option.icon}</div>
                        <span className="flex-1 text-left font-medium text-sm">
                          {option.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-4">
        <CategoryCard title="Bank Accounts" count={bankAccounts.length} icon={<Building2 className="w-6 h-6" />} to="/bank-accounts" color="bg-blue-500" />
        <CategoryCard title="Credit Cards" count={creditCards.length} icon={<CreditCard className="w-6 h-6" />} to="/credit-cards" color="bg-purple-500" />
        <CategoryCard title="General Documents" count={generalDocuments.length} icon={<FileText className="w-6 h-6" />} to="/general-documents" color="bg-amber-500" />
        <CategoryCard title="Insurance Policies" count={insurancePolicies.length} icon={<Shield className="w-6 h-6" />} to="/insurance-policies" color="bg-green-500" />
        <CategoryCard title="Websites Info" count={websites.length} icon={<Globe className="w-6 h-6" />} to="/websites" color="bg-cyan-500" />
      </main>

      <DataForm
        isOpen={openFormType !== null}
        onClose={() => setOpenFormType(null)}
        onSubmit={handleFormSubmit}
        fields={getFormFields()}
        title={getFormTitle()}
        bucketType={openFormType === 'documents' ? 'documents' : 'documents'}
      />
    </div>;
}

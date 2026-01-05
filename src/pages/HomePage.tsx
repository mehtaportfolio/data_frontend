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
}, {
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
  name: 'customer_id',
  label: 'Customer ID',
  type: 'text',
  secure: true,
  placeholder: 'Customer ID'
}, {
  name: 'user_id',
  label: 'User ID',
  type: 'text',
  secure: true,
  placeholder: 'User ID'
}, {
  name: 'login_password',
  label: 'Login Password',
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
  name: 'atm_pin',
  label: 'ATM PIN',
  type: 'password',
  secure: true
}, {
  name: 'issue_date',
  label: 'Issue Date',
  type: 'date'
}, {
  name: 'transaction_password',
  label: 'Transaction Password',
  type: 'password',
  secure: true
}, {
  name: 'status',
  label: 'Status',
  type: 'text',
  placeholder: 'e.g. Active, Inactive'
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
  label: 'User ID',
  type: 'text',
  secure: true,
  placeholder: 'User ID'
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

const WEBSITE_FIELDS: FormField[] = [{
  name: 'account_owner',
  label: 'Account Owner',
  type: 'text',
  required: true
}, {
  name: 'account_type',
  label: 'Account Type',
  type: 'text'
}, {
  name: 'short_web_name',
  label: 'Website Name',
  type: 'text',
  required: true
}, {
  name: 'number',
  label: 'Reference Number',
  type: 'text'
}, {
  name: 'website_address',
  label: 'Website Address',
  type: 'text',
  required: true
}, {
  name: 'login_id',
  label: 'Login ID / Email',
  type: 'text',
  secure: true
}, {
  name: 'login_password',
  label: 'Login Password',
  type: 'password',
  secure: true
}, {
  name: 'two_step_password',
  label: 'Two-Step Verification Password',
  type: 'password',
  secure: true
}, {
  name: 'other_password',
  label: 'Other Password',
  type: 'password',
  secure: true
}, {
  name: 'notes',
  label: 'Notes',
  type: 'textarea'
}];

const INSURANCE_POLICY_FIELDS: FormField[] = [{
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
  name: 'policy_year',
  label: 'Policy Year',
  type: 'text',
  placeholder: 'e.g. 2024-2025'
}, {
  name: 'payment_year',
  label: 'Payment Year',
  type: 'text',
  placeholder: 'e.g. one time or 30 years'
}, {
  name: 'frequency',
  label: 'Payment Frequency',
  type: 'select',
  options: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
  placeholder: 'Select payment frequency'
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

const GENERAL_DOCUMENT_FIELDS: FormField[] = [{
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
  label: 'Issue Date',
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

  const getFieldsWithOptions = (type: string): FormField[] => {
    switch (type) {
      case 'bank-accounts': {
        const fields = [...BANK_ACCOUNT_FIELDS];
        const bankNameOptions = Array.from(new Set(bankAccounts.map(a => a.bank_name).filter(Boolean))) as string[];
        const branchOptions = Array.from(new Set(bankAccounts.map(a => a.branch).filter(Boolean))) as string[];
        const ownerOptions = Array.from(new Set(bankAccounts.map(a => a.account_owner).filter(Boolean))) as string[];
        const statusOptions = Array.from(new Set(bankAccounts.map(a => a.status).filter(Boolean))) as string[];
        
        return fields.map(f => {
          if (f.name === 'bank_name') return { ...f, type: 'select', selectWithAdd: true, options: bankNameOptions };
          if (f.name === 'branch') return { ...f, type: 'select', selectWithAdd: true, options: branchOptions };
          if (f.name === 'account_owner') return { ...f, type: 'select', selectWithAdd: true, options: ownerOptions };
          if (f.name === 'status') return { ...f, type: 'select', selectWithAdd: true, options: statusOptions };
          return f;
        });
      }
      case 'credit-cards': {
        const fields = [...CREDIT_CARD_FIELDS];
        const bankNameOptions = Array.from(new Set(creditCards.map(a => (a as any).bank_name).filter(Boolean))) as string[];
        const statusOptions = Array.from(new Set(creditCards.map(a => (a as any).status).filter(Boolean))) as string[];
        
        return fields.map(f => {
          if (f.name === 'bank_name') return { ...f, type: 'select', selectWithAdd: true, options: bankNameOptions };
          if (f.name === 'status') return { ...f, type: 'select', selectWithAdd: true, options: statusOptions };
          return f;
        });
      }
      case 'documents': {
        const fields = [...GENERAL_DOCUMENT_FIELDS];
        const docNameOptions = Array.from(new Set(generalDocuments.map(a => a.document_name).filter(Boolean))) as string[];
        const ownerOptions = Array.from(new Set(generalDocuments.map(a => a.account_owner).filter(Boolean))) as string[];
        
        return fields.map(f => {
          if (f.name === 'document_name') return { ...f, type: 'select', selectWithAdd: true, options: docNameOptions };
          if (f.name === 'account_owner') return { ...f, type: 'select', selectWithAdd: true, options: ownerOptions };
          return f;
        });
      }
      case 'insurance': {
        const fields = [...INSURANCE_POLICY_FIELDS];
        const policyTypeOptions = Array.from(new Set(insurancePolicies.map(a => a.policy_type).filter(Boolean))) as string[];
        const policyNameOptions = Array.from(new Set(insurancePolicies.map(a => a.policy_name).filter(Boolean))) as string[];
        const nomineeOptions = Array.from(new Set(insurancePolicies.map(a => a.nominee_name).filter(Boolean))) as string[];
        
        return fields.map(f => {
          if (f.name === 'policy_type') return { ...f, type: 'select', selectWithAdd: true, options: policyTypeOptions };
          if (f.name === 'policy_name') return { ...f, type: 'select', selectWithAdd: true, options: policyNameOptions };
          if (f.name === 'nominee_name') return { ...f, type: 'select', selectWithAdd: true, options: nomineeOptions };
          return f;
        });
      }
      case 'websites': {
        const fields = [...WEBSITE_FIELDS];
        const ownerOptions = Array.from(new Set(websites.map(a => a.account_owner).filter(Boolean))) as string[];
        const accountTypeOptions = Array.from(new Set(websites.map(a => a.account_type).filter(Boolean))) as string[];
        const webNameOptions = Array.from(new Set(websites.map(a => a.short_web_name).filter(Boolean))) as string[];
        
        return fields.map(f => {
          if (f.name === 'account_owner') return { ...f, type: 'select', selectWithAdd: true, options: ownerOptions };
          if (f.name === 'account_type') return { ...f, type: 'select', selectWithAdd: true, options: accountTypeOptions };
          if (f.name === 'short_web_name') return { ...f, type: 'select', selectWithAdd: true, options: webNameOptions };
          return f;
        });
      }
      default:
        return [];
    }
  };

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
      label: 'General Documents',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      onClick: () => {
        setIsMenuOpen(false);
        setOpenFormType('documents');
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
      label: 'Websites Info',
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
      onClick: () => {
        setIsMenuOpen(false);
        setOpenFormType('websites');
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
    return openFormType ? getFieldsWithOptions(openFormType) : [];
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

  const handleFieldOptionsChange = (fieldName: string, newOption: string) => {
    if (!openFormType) return;

    switch (openFormType) {
      case 'bank-accounts':
        if (['bank_name', 'branch', 'account_owner', 'status'].includes(fieldName)) {
          const fields = getFieldsWithOptions('bank-accounts');
          const field = fields.find(f => f.name === fieldName);
          if (field && field.options && !field.options.includes(newOption)) {
            field.options.push(newOption);
          }
        }
        break;
      case 'credit-cards':
        if (['bank_name', 'status'].includes(fieldName)) {
          const fields = getFieldsWithOptions('credit-cards');
          const field = fields.find(f => f.name === fieldName);
          if (field && field.options && !field.options.includes(newOption)) {
            field.options.push(newOption);
          }
        }
        break;
      case 'documents':
        if (['document_name', 'account_owner'].includes(fieldName)) {
          const fields = getFieldsWithOptions('documents');
          const field = fields.find(f => f.name === fieldName);
          if (field && field.options && !field.options.includes(newOption)) {
            field.options.push(newOption);
          }
        }
        break;
      case 'insurance':
        if (['policy_type', 'policy_name', 'nominee_name'].includes(fieldName)) {
          const fields = getFieldsWithOptions('insurance');
          const field = fields.find(f => f.name === fieldName);
          if (field && field.options && !field.options.includes(newOption)) {
            field.options.push(newOption);
          }
        }
        break;
      case 'websites':
        if (['account_owner', 'account_type', 'short_web_name'].includes(fieldName)) {
          const fields = getFieldsWithOptions('websites');
          const field = fields.find(f => f.name === fieldName);
          if (field && field.options && !field.options.includes(newOption)) {
            field.options.push(newOption);
          }
        }
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
        onFieldOptionsChange={handleFieldOptionsChange}
      />
    </div>;
}

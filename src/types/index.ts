export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

export interface BankAccount extends BaseEntity {
  bank_name: string;
  account_number?: string;
  ifsc_code?: string;
  branch?: string;
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
  customer_id?: string;
  username?: string;
  login_password?: string;
  account_owner?: string;
  upi_pin?: string;
  atm_pin?: string;
  transaction_password?: string;
  status?: string;
  issue_date?: string;
}

export interface CreditCard extends BaseEntity {
  bank_name: string;
  credit_card_number?: string;
  issue_date?: string;
  expiry_date?: string;
  cvv_number?: string;
  billing_cycle?: string;
  last_date?: string;
  transaction_limit?: number;
  pin?: string;
  internet_banking_id?: string;
  login_password?: string;
  status?: string;
}

export interface GeneralDocument extends BaseEntity {
  document_name: string;
  account_owner: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  file_attachment?: string;
  notes?: string;
}

export interface InsurancePolicy extends BaseEntity {
  policy_type: string;
  policy_name: string;
  policy_number: string;
  start_date: string;
  expiry_date?: string;
  insured_amount: number;
  premium_amount: number;
  policy_year?: string;
  payment_year?: string;
  frequency?: string;
  nominee_name?: string;
  nominee_dob?: string;
  notes?: string;
  policy_documents?: string[] | string;
}

export interface Deposit extends BaseEntity {
  deposit_date: string;
  amount: number;
  bank_name: string;
  branch?: string;
  deposit_type?: string;
}

export interface Website extends BaseEntity {
  account_owner: string;
  account_type?: string;
  short_web_name: string;
  number?: string;
  website_address: string;
  login_id?: string;
  login_password?: string;
  two_step_password?: string;
  other_password?: string;
  notes?: string;
}

export type DataType = 'bank_accounts' | 'credit_cards' | 'general_documents' | 'insurance_policies' | 'deposits' | 'websites';
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  required?: boolean;
  secure?: boolean;
  options?: string[];
  selectWithAdd?: boolean;
  placeholder?: string;
  icon?: unknown;
  accept?: string;
}
export interface UserSettings {
  theme: 'light' | 'dark';
  biometric_enabled: boolean;
}
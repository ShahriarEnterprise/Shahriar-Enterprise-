// Party Types (পার্টি/গ্রাহক)
export interface Party {
  id: string;
  user_id: string;
  name: string;
  type: 'supplier' | 'customer' | 'sr' | 'dsr'; // supplier, গ্রাহক, সেলস রেপ, ডিস্ট্রিবিউটর সেলস রেপ
  phone: string;
  email?: string;
  address: string;
  city?: string;
  balance: number; // ব্যালেন্স (বাকি টাকা)
  created_at: string;
  updated_at: string;
}

// Product Types (পণ্য)
export interface Product {
  id: string;
  user_id: string;
  name: string;
  sku: string; // Stock Keeping Unit
  category: string;
  unit: string; // pcs, kg, liter ইত্যাদি
  purchase_price: number; // ক্রয় মূল্য
  selling_price: number; // বিক্রয় মূল্য
  current_stock: number; // বর্তমান স্টক
  min_stock_level: number; // ন্যূনতম স্টক স্তর
  created_at: string;
  updated_at: string;
}

// Stock Types (স্টক)
export interface Stock {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  last_updated: string;
}

// Transaction Types (লেনদেন)
export type TransactionType = 'sale' | 'purchase' | 'damage' | 'return' | 'adjustment';

export interface Transaction {
  id: string;
  user_id: string;
  party_id: string;
  type: TransactionType;
  products: TransactionItem[];
  total_amount: number;
  notes?: string;
  payment_status: 'pending' | 'partial' | 'completed';
  paid_amount: number;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Ledger Entry (খাতা এন্ট্রি)
export interface LedgerEntry {
  id: string;
  user_id: string;
  party_id: string;
  transaction_id?: string;
  type: 'debit' | 'credit'; // ডেবিট/ক্রেডিট
  amount: number;
  balance: number;
  description: string;
  entry_date: string;
  created_at: string;
}

// Payment Types (পেমেন্ট)
export interface Payment {
  id: string;
  user_id: string;
  party_id: string;
  transaction_id?: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'card';
  payment_date: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

// Expense Types (খরচ)
export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
}

// Report Types (রিপোর্ট)
export interface DailyReport {
  date: string;
  total_sales: number;
  total_purchases: number;
  total_expenses: number;
  net_profit: number;
  transactions_count: number;
}

export interface PartyReport {
  party_id: string;
  party_name: string;
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  transactions_count: number;
}

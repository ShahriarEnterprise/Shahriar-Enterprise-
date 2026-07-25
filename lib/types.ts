export type Unit = 'পিস' | 'ডজন' | 'কেস' | 'বস্তা' | 'কেজি';

export type PartyType = 'supplier' | 'customer' | 'sr' | 'dsr';

export type TxnType = 'sale' | 'purchase' | 'damage' | 'return' | 'adjustment';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  sku?: string;
  category: string;
  unit: Unit;
  purchase_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_level: number;
  created_at: string;
  updated_at: string;
}

export interface Party {
  id: string;
  user_id: string;
  name: string;
  type: PartyType;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  balance: number; // বকেয়া বা ব্যালেন্স
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  party_id: string;
  type: TxnType;
  products: TransactionItem[];
  total_amount: number;
  paid_amount: number;
  notes?: string;
  payment_status: 'pending' | 'partial' | 'completed';
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  party_id: string;
  transaction_id?: string;
  type: 'debit' | 'credit';
  amount: number;
  balance: number;
  description: string;
  entry_date: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
}

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Transaction, TransactionType } from '@/lib/types';

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Insert transaction
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...transaction, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;

  // Update party balance
  const party = await supabase
    .from('parties')
    .select('balance')
    .eq('id', transaction.party_id)
    .single();

  if (party.data) {
    const newBalance = transaction.type === 'sale' 
      ? party.data.balance + transaction.total_amount 
      : party.data.balance - transaction.total_amount;

    await supabase
      .from('parties')
      .update({ balance: newBalance })
      .eq('id', transaction.party_id);
  }

  // Create ledger entry
  await supabase.from('ledger_entries').insert([{
    user_id: user.id,
    party_id: transaction.party_id,
    transaction_id: data.id,
    type: transaction.type === 'sale' ? 'debit' : 'credit',
    amount: transaction.total_amount,
    balance: party.data?.balance || 0,
    description: `${transaction.type} transaction`,
    entry_date: transaction.transaction_date,
  }]);

  return data;
}

export async function getTransactions(filters?: { type?: TransactionType; party_id?: string }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id);

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.party_id) {
    query = query.eq('party_id', filters.party_id);
  }

  const { data, error } = await query.order('transaction_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTransactionById(transactionId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data;
}

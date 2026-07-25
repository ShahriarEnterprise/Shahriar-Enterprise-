import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DailyReport, PartyReport } from '@/lib/types';

export async function getDailyReport(date: string): Promise<DailyReport> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Get transactions for the date
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('type, total_amount')
    .eq('user_id', user.id)
    .eq('transaction_date', date);

  if (txError) throw txError;

  let total_sales = 0;
  let total_purchases = 0;

  transactions?.forEach((tx) => {
    if (tx.type === 'sale') {
      total_sales += tx.total_amount;
    } else if (tx.type === 'purchase') {
      total_purchases += tx.total_amount;
    }
  });

  // Get expenses for the date
  const { data: expenses, error: expError } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .eq('expense_date', date);

  if (expError) throw expError;

  const total_expenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  return {
    date,
    total_sales,
    total_purchases,
    total_expenses,
    net_profit: total_sales - total_purchases - total_expenses,
    transactions_count: transactions?.length || 0,
  };
}

export async function getPeriodReport(startDate: string, endDate: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('type, total_amount')
    .eq('user_id', user.id)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (txError) throw txError;

  let total_sales = 0;
  let total_purchases = 0;

  transactions?.forEach((tx) => {
    if (tx.type === 'sale') {
      total_sales += tx.total_amount;
    } else if (tx.type === 'purchase') {
      total_purchases += tx.total_amount;
    }
  });

  const { data: expenses, error: expError } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', user.id)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate);

  if (expError) throw expError;

  const total_expenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

  return {
    startDate,
    endDate,
    total_sales,
    total_purchases,
    total_expenses,
    net_profit: total_sales - total_purchases - total_expenses,
    gross_profit: total_sales - total_purchases,
  };
}

export async function getPartyReport(partyId: string, startDate?: string, endDate?: string): Promise<PartyReport> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  // Get party info
  const { data: party, error: partyError } = await supabase
    .from('parties')
    .select('name, balance')
    .eq('id', partyId)
    .single();

  if (partyError) throw partyError;

  // Get ledger entries
  let query = supabase
    .from('ledger_entries')
    .select('amount, type')
    .eq('user_id', user.id)
    .eq('party_id', partyId);

  if (startDate && endDate) {
    query = query
      .gte('entry_date', startDate)
      .lte('entry_date', endDate);
  }

  const { data: ledgerEntries, error: ledgerError } = await query;

  if (ledgerError) throw ledgerError;

  let total_debit = 0;
  let total_credit = 0;

  ledgerEntries?.forEach((entry) => {
    if (entry.type === 'debit') {
      total_debit += entry.amount;
    } else {
      total_credit += entry.amount;
    }
  });

  return {
    party_id: partyId,
    party_name: party?.name || '',
    opening_balance: 0,
    total_debit,
    total_credit,
    closing_balance: total_debit - total_credit,
    transactions_count: ledgerEntries?.length || 0,
  };
}

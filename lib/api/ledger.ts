import { createServerSupabaseClient } from '@/lib/supabase/server';
import { LedgerEntry } from '@/lib/types';

export async function getLedgerEntries(partyId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ledger_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('party_id', partyId)
    .order('entry_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'created_at'>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ledger_entries')
    .insert([{ ...entry, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPartyLedgerSummary(partyId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ledger_entries')
    .select('amount, type')
    .eq('user_id', user.id)
    .eq('party_id', partyId);

  if (error) throw error;

  let totalDebit = 0;
  let totalCredit = 0;

  data?.forEach((entry) => {
    if (entry.type === 'debit') {
      totalDebit += entry.amount;
    } else {
      totalCredit += entry.amount;
    }
  });

  return {
    totalDebit,
    totalCredit,
    balance: totalDebit - totalCredit,
  };
}

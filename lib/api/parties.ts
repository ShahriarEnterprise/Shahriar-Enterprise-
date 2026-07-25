import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Party } from '@/lib/types';

export async function createParty(party: Omit<Party, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('parties')
    .insert([{ ...party, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getParties() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('parties')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPartyById(partyId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('parties')
    .select('*')
    .eq('id', partyId)
    .eq('user_id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateParty(partyId: string, updates: Partial<Party>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('parties')
    .update(updates)
    .eq('id', partyId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteParty(partyId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('parties')
    .delete()
    .eq('id', partyId)
    .eq('user_id', user.id);

  if (error) throw error;
}

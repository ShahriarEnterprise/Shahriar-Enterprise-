'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Party, LedgerEntry } from '@/lib/types';
import { bdt, toBn } from '@/lib/format';
import { ArrowLeft, Plus, Phone, MapPin } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function PartyLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const partyId = params.id as string;

  const [party, setParty] = useState<Party | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState<'credit' | 'debit'>('credit');

  useEffect(() => {
    if (partyId) {
      fetchPartyData();
    }
  }, [partyId]);

  const fetchPartyData = async () => {
    try {
      setLoading(true);
      const [partyRes, ledgerRes] = await Promise.all([
        supabase.from('parties').select('*').eq('id', partyId).single(),
        supabase.from('ledger_entries').select('*').eq('party_id', partyId).order('created_at', { ascending: false }),
      ]);

      if (partyRes.error) throw partyRes.error;
      if (ledgerRes.error) throw ledgerRes.error;

      setParty(partyRes.data);
      setLedger(ledgerRes.data || []);
    } catch (error: any) {
      console.error('Error fetching party ledger:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert('সঠিক পরিমাণ লিখুন।');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      if (!party) return;

      const newBalance = paymentType === 'credit' ? party.balance - parsedAmount : party.balance + parsedAmount;

      const { error: partyError } = await supabase
        .from('parties')
        .update({ balance: newBalance })
        .eq('id', partyId);

      if (partyError) throw partyError;

      const { error: ledgerError } = await supabase.from('ledger_entries').insert([
        {
          user_id: userId,
          party_id: partyId,
          type: paymentType,
          amount: parsedAmount,
          balance: newBalance,
          description: description || (paymentType === 'credit' ? 'নগদ টাকা গ্রহণ' : 'বাকিতে লেনদেন'),
        },
      ]);

      if (ledgerError) throw ledgerError;

      setAmount('');
      setDescription('');
      setIsModalOpen(false);
      fetchPartyData();
      alert('লেনদেন সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (error: any) {
      alert('লেনদেন সংরক্ষণ করতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-muted text-muted-foreground">
        লোড হচ্ছে...
      </div>
    );
  }

  if (!party) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-muted p-4 text-center">
        <p className="text-muted-foreground mb-3">পার্টির তথ্য পাওয়া যায়নি।</p>
        <button
          onClick={() => router.back()}
          className="rounded-xl bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-black"
        >
          ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-muted pb-24">
      {/* Top Header */}
      <div className="bg-[#0A0A0A] border-b border-[#D4AF37]/20 px-4 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#D4AF37]">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-[#D4AF37] truncate">{party.name}</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 rounded-xl bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black shrink-0"
        >
          <Plus className="h-4 w-4" /> লেনদেন
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Party Info Card */}
        <div className="rounded-2xl bg-card p-4 shadow-sm border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">বর্তমান ব্যালেন্স (পাওনা/দেনা)</span>
            <span className={`text-base font-bold ${party.balance > 0 ? 'text-destructive' : 'text-primary'}`}>
              {bdt(Math.abs(party.balance))} {party.balance > 0 ? '(পাওনা)' : party.balance < 0 ? '(প্রাপ্য)' : ''}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border">
            {party.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span>{toBn(party.phone)}</span>
              </div>
            )}
            {party.address && (
              <div className="flex items-center gap-1 truncate">
                <MapPin className="h-3.5 w-3.5 text-[#D4AF37]" />
                <span className="truncate">{party.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ledger History List */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-card-foreground">লেনদেনের ইতিহাস</h2>
          {ledger.length === 0 ? (
            <div className="rounded-2xl bg-card p-6 text-center text-xs text-muted-foreground shadow-sm">
              কোনো লেনদেন পাওয়া যায়নি।
            </div>
          ) : (
            ledger.map((entry) => (
              <div key={entry.id} className="rounded-xl bg-card p-3 shadow-sm border border-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-card-foreground">{entry.description || 'লেনদেন'}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(entry.created_at).toLocaleDateString('bn-BD')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${entry.type === 'credit' ? 'text-emerald-500' : 'text-destructive'}`}>
                    {entry.type === 'credit' ? '+' : '-'}{bdt(entry.amount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">ব্যালেন্স: {bdt(entry.balance)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl space-y-4 border border-border">
            <h2 className="text-base font-bold text-card-foreground">নতুন লেনদেন যোগ করুন</h2>
            <form onSubmit={handleAddPayment} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">লেনদেনের ধরণ</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as 'credit' | 'debit')}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none mt-1 text-card-foreground"
                >
                  <option value="credit">টাকা জমা (Payment Received)</option>
                  <option value="debit">বাকিতে বিক্রি / পাওনা বৃদ্ধি (Due/Debit)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">টাকার পরিমাণ (৳)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none mt-1 text-card-foreground"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">বিবরণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="যেমন: নগদ পরিশোধ"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none mt-1 text-card-foreground"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-secondary py-2.5 text-xs font-semibold text-secondary-foreground"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#D4AF37] py-2.5 text-xs font-semibold text-black"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { Party } from '@/lib/types';

interface ReceivablesTrackerProps {
  parties: Party[];
}

export default function ReceivablesTracker({ parties }: ReceivablesTrackerProps) {
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [overdueParties, setOverdueParties] = useState<Party[]>([]);

  useEffect(() => {
    const receivables = parties.filter((p) => p.balance > 0);
    const total = receivables.reduce((sum, p) => sum + p.balance, 0);
    setTotalReceivable(total);
    // TODO: Calculate overdue based on transaction dates
    setOverdueParties(receivables);
  }, [parties]);

  return (
    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-orange-700">📊 প্রাপ্য ট্র্যাকার</h3>
          <p className="text-2xl font-bold text-orange-900">৳{totalReceivable.toLocaleString('bn-BD')}</p>
          <p className="text-sm text-gray-600">{overdueParties.length} পার্টি থেকে বকেয়া</p>
        </div>
        <div className="text-right">
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2">
            <Send size={18} />
            রিমাইন্ডার পাঠান
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {overdueParties.map((party) => (
          <div key={party.id} className="bg-white p-3 rounded border border-orange-200 hover:bg-orange-50 cursor-pointer">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{party.name}</div>
                <div className="text-sm text-gray-600">{party.phone}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-700">৳{party.balance.toLocaleString('bn-BD')}</div>
                <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">বিস্তারিত →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

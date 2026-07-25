'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Loader } from 'lucide-react';
import PartyModal from '@/components/PartyModal';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Party } from '@/lib/types';
import * as partyAPI from '@/lib/api/parties';

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | undefined>();

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const data = await partyAPI.getParties();
      setParties(data || []);
    } catch (error) {
      console.error('Error fetching parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParty = async (formData: any) => {
    try {
      if (selectedParty) {
        await partyAPI.updateParty(selectedParty.id, formData);
      } else {
        await partyAPI.createParty(formData);
      }
      await fetchParties();
      setSelectedParty(undefined);
    } catch (error) {
      console.error('Error creating/updating party:', error);
    }
  };

  const handleDeleteParty = async (partyId: string) => {
    if (confirm('আপনি কি এই পার্টি মুছে ফেলতে চান?')) {
      try {
        await partyAPI.deleteParty(partyId);
        await fetchParties();
      } catch (error) {
        console.error('Error deleting party:', error);
      }
    }
  };

  const typeLabels: Record<string, string> = {
    supplier: 'সরবরাহকারী',
    customer: 'গ্রাহক',
    sr: 'বিক্রয় প্রতিনিধি',
    dsr: 'ডিস্ট্রিবিউটর প্রতিনিধি',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">পার্টি ব্যবস্থাপনা</h1>
        <button
          onClick={() => {
            setSelectedParty(undefined);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন পার্টি যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">নাম</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">ধরণ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">ফোন</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">শহর</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">ব্যালেন্স</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">ক্রিয়া</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((party) => (
              <tr key={party.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{party.name}</td>
                <td className="px-6 py-4">{typeLabels[party.type]}</td>
                <td className="px-6 py-4">{party.phone}</td>
                <td className="px-6 py-4">{party.city || '-'}</td>
                <td className="px-6 py-4 font-semibold">৳{party.balance.toLocaleString('bn-BD')}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedParty(party);
                      setModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteParty(party.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PartyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedParty(undefined);
        }}
        onSubmit={handleCreateParty}
        initialData={selectedParty}
      />
    </div>
  );
}

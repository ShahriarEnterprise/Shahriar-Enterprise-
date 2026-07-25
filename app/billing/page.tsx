'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader } from 'lucide-react';
import BillingModal from '@/components/BillingModal';
import InventoryMonitor from '@/components/InventoryMonitor';
import ReceivablesTracker from '@/components/ReceivablesTracker';
import { Transaction, Party, Product } from '@/lib/types';
import * as transactionAPI from '@/lib/api/transactions';
import * as partyAPI from '@/lib/api/parties';
import * as productAPI from '@/lib/api/products';

export default function BillingPage() {
  const [sales, setSales] = useState<Transaction[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState({ date: '', party: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, partiesData, productsData] = await Promise.all([
        transactionAPI.getTransactions({ type: 'sale' }),
        partyAPI.getParties(),
        productAPI.getProducts(),
      ]);
      setSales(salesData || []);
      setParties(partiesData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = async (formData: any) => {
    try {
      await transactionAPI.createTransaction(formData);
      await fetchData();
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  const filteredSales = sales.filter((sale) => {
    if (filter.date && sale.transaction_date !== filter.date) return false;
    if (filter.party && sale.party_id !== filter.party) return false;
    return true;
  });

  const todaySales = sales.filter(
    (s) => s.transaction_date === new Date().toISOString().split('T')[0]
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">💳 দ্রুত বিল তৈরি করুন</h1>
          <p className="text-gray-600 mt-1">আজকের বিক্রয়: ৳{todayRevenue.toLocaleString('bn-BD')} ({todaySales.length} বিক্রয়)</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 font-semibold text-lg"
        >
          <Plus size={24} />
          নতুন বিল
        </button>
      </div>

      {/* মনিটরিং প্যানেল */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryMonitor products={products} />
        <ReceivablesTracker parties={parties} />
      </div>

      {/* আজকের বিক্রয় */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">📈 আজকের বিক্রয়</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">সময়</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">ক্রেতা</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">পণ্য সংখ্যা</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">মোট পরিমাণ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">পেমেন্ট</th>
              </tr>
            </thead>
            <tbody>
              {todaySales.map((sale) => {
                const party = parties.find((p) => p.id === sale.party_id);
                return (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{sale.transaction_date}</td>
                    <td className="px-6 py-4 font-semibold">{party?.name}</td>
                    <td className="px-6 py-4 text-sm">{sale.products.length} আইটেম</td>
                    <td className="px-6 py-4 font-bold text-green-600">৳{sale.total_amount.toLocaleString('bn-BD')}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        ✓ সম্পন্ন
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <BillingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateSale}
        parties={parties}
        products={products}
      />
    </div>
  );
}

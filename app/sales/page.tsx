'use client';

import { useEffect, useState } from 'react';
import { Plus, Eye, Loader } from 'lucide-react';
import SalesModal from '@/components/SalesModal';
import { Transaction, Party, Product } from '@/lib/types';
import * as transactionAPI from '@/lib/api/transactions';
import * as partyAPI from '@/lib/api/parties';
import * as productAPI from '@/lib/api/products';

export default function SalesPage() {
  const [sales, setSales] = useState<Transaction[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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

  const paymentStatusLabels: Record<string, string> = {
    pending: 'অপেক্ষমাণ',
    partial: 'আংশিক',
    completed: 'সম্পন্ন',
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
        <h1 className="text-2xl font-bold">বিক্রয় লেনদেন</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          নতুন বিক্রয় যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">গ্রাহক</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">মোট পরিমাণ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">তারিখ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">পেমেন্ট স্ট্যাটাস</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">ক্রিয়া</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const party = parties.find((p) => p.id === sale.party_id);
              return (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{party?.name || 'অজানা'}</td>
                  <td className="px-6 py-4 font-semibold">৳{sale.total_amount.toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4">{sale.transaction_date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        sale.payment_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : sale.payment_status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {paymentStatusLabels[sale.payment_status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SalesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateSale}
        parties={parties}
        products={products}
      />
    </div>
  );
}

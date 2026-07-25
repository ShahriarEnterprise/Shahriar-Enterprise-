'use client';

import { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';

interface Sale {
  id: string;
  party_name: string;
  total_amount: number;
  transaction_date: string;
  payment_status: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      // TODO: Fetch from API
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setLoading(false);
    }
  };

  const paymentStatusLabels = {
    pending: 'অপেক্ষমাণ',
    partial: 'আংশিক',
    completed: 'সম্পন্ন',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">বিক্রয় লেনদেন</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} />
          নতুন বিক্রয় যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">গ্রাহক</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">মোট পরিমাণ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">তারিখ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">পেমেন্ট অবস্থা</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">ক্রিয়া</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{sale.party_name}</td>
                <td className="px-6 py-4 font-semibold">৳{sale.total_amount.toLocaleString('bn-BD')}</td>
                <td className="px-6 py-4">{sale.transaction_date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    sale.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                    sale.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {paymentStatusLabels[sale.payment_status as keyof typeof paymentStatusLabels]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

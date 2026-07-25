'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Transaction, Party, Expense } from '@/lib/types';
import * as transactionAPI from '@/lib/api/transactions';
import * as partyAPI from '@/lib/api/parties';
import * as reportAPI from '@/lib/api/reports';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalParties: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [sales, purchases, expenses, parties] = await Promise.all([
        transactionAPI.getTransactions({ type: 'sale' }),
        transactionAPI.getTransactions({ type: 'purchase' }),
        partyAPI.getParties(),
        partyAPI.getParties(),
      ]);

      const totalSales = (sales || []).reduce((sum, t) => sum + t.total_amount, 0);
      const totalPurchases = (purchases || []).reduce((sum, t) => sum + t.total_amount, 0);
      const totalExpenses = 0; // TODO: Fetch expenses
      const netProfit = totalSales - totalPurchases - totalExpenses;

      setStats({
        totalSales,
        totalPurchases,
        totalExpenses,
        netProfit,
        totalParties: parties?.length || 0,
      });

      setChartData([
        { name: 'বিক্রয়', value: totalSales },
        { name: 'ক্রয়', value: totalPurchases },
        { name: 'খরচ', value: totalExpenses },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="মোট বিক্রয়" value={`৳${stats.totalSales.toLocaleString('bn-BD')}`} color="text-blue-600" />
        <StatCard title="মোট ক্রয়" value={`৳${stats.totalPurchases.toLocaleString('bn-BD')}`} color="text-orange-600" />
        <StatCard title="মোট খরচ" value={`৳${stats.totalExpenses.toLocaleString('bn-BD')}`} color="text-red-600" />
        <StatCard title="নেট লাভ" value={`৳${stats.netProfit.toLocaleString('bn-BD')}`} color="text-green-600" />
        <StatCard title="পার্টি" value={stats.totalParties.toString()} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">বিক্রয় বনাম ক্রয় বিশ্লেষণ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">আর্থিক সারাংশ</h3>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <p className="text-gray-600">মোট বিক্রয়</p>
              <p className="font-bold text-blue-600">৳{stats.totalSales.toLocaleString('bn-BD')}</p>
            </div>
            <div className="flex justify-between border-b pb-2">
              <p className="text-gray-600">মোট ক্রয়</p>
              <p className="font-bold text-orange-600">৳{stats.totalPurchases.toLocaleString('bn-BD')}</p>
            </div>
            <div className="flex justify-between border-b pb-2">
              <p className="text-gray-600">স্থূল লাভ</p>
              <p className="font-bold text-green-600">৳{(stats.totalSales - stats.totalPurchases).toLocaleString('bn-BD')}</p>
            </div>
            <div className="flex justify-between bg-green-50 p-2 rounded">
              <p className="font-semibold">নেট লাভ</p>
              <p className="font-bold text-green-700">৳{stats.netProfit.toLocaleString('bn-BD')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-gray-600 text-sm">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

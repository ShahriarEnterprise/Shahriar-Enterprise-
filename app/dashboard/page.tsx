'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    netProfit: 0,
    receivable: 0,
    payable: 0,
  });

  useEffect(() => {
    // TODO: Fetch dashboard stats from API
  }, []);

  const chartData = [
    { name: 'বিক্রয়', value: stats.totalSales },
    { name: 'ক্রয়', value: stats.totalPurchases },
    { name: 'খরচ', value: stats.totalExpenses },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="মোট বিক্রয়" value={`৳${stats.totalSales.toLocaleString('bn-BD')}`} color="text-blue-600" />
        <StatCard title="মোট ক্রয়" value={`৳${stats.totalPurchases.toLocaleString('bn-BD')}`} color="text-orange-600" />
        <StatCard title="মোট খরচ" value={`৳${stats.totalExpenses.toLocaleString('bn-BD')}`} color="text-red-600" />
        <StatCard title="নেট লাভ" value={`৳${stats.netProfit.toLocaleString('bn-BD')}`} color="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">বিক্রয় ও খরচ বিশ্লেষণ</h3>
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
          <h3 className="text-lg font-semibold mb-4">দেনা-পাওনা</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">প্রাপ্য (গ্রাহকদের কাছ থেকে)</p>
              <p className="text-2xl font-bold text-blue-600">৳{stats.receivable.toLocaleString('bn-BD')}</p>
            </div>
            <div>
              <p className="text-gray-600">প্রদেয় (সরবরাহকারীদের কাছে)</p>
              <p className="text-2xl font-bold text-red-600">৳{stats.payable.toLocaleString('bn-BD')}</p>
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

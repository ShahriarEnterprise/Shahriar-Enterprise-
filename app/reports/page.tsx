'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText } from 'lucide-react';
import { Transaction, Party, Expense } from '@/lib/types';
import * as transactionAPI from '@/lib/api/transactions';
import * as partyAPI from '@/lib/api/parties';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'party' | 'product'>('daily');
  const [chartData, setChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    netProfit: 0,
    topParties: [] as any[],
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange]);

  const generateReport = async () => {
    try {
      const [sales, purchases, parties] = await Promise.all([
        transactionAPI.getTransactions({ type: 'sale' }),
        transactionAPI.getTransactions({ type: 'purchase' }),
        partyAPI.getParties(),
      ]);

      const filteredSales = (sales || []).filter(
        (s) => s.transaction_date >= dateRange.start && s.transaction_date <= dateRange.end
      );
      const filteredPurchases = (purchases || []).filter(
        (p) => p.transaction_date >= dateRange.start && p.transaction_date <= dateRange.end
      );

      const totalSales = filteredSales.reduce((sum, s) => sum + s.total_amount, 0);
      const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.total_amount, 0);
      const netProfit = totalSales - totalPurchases;

      // Top parties by sales
      const topPartiesList = (parties || [])
        .map((p) => ({
          name: p.name,
          balance: p.balance,
          transactions: filteredSales.filter((s) => s.party_id === p.id).length,
        }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 5);

      setSummary({
        totalSales,
        totalPurchases,
        totalExpenses: 0,
        netProfit,
        topParties: topPartiesList,
      });

      // Generate chart data based on report type
      if (reportType === 'daily') {
        const daily: { [key: string]: number } = {};
        filteredSales.forEach((s) => {
          daily[s.transaction_date] = (daily[s.transaction_date] || 0) + s.total_amount;
        });
        const data = Object.entries(daily).map(([date, amount]) => ({
          date,
          বিক্রয়: amount,
        }));
        setChartData(data);
      } else if (reportType === 'monthly') {
        const monthly: { [key: string]: number } = {};
        filteredSales.forEach((s) => {
          const month = s.transaction_date.substring(0, 7);
          monthly[month] = (monthly[month] || 0) + s.total_amount;
        });
        const data = Object.entries(monthly).map(([month, amount]) => ({
          month,
          বিক্রয়: amount,
        }));
        setChartData(data);
      } else if (reportType === 'party') {
        setChartData(
          topPartiesList.map((p) => ({
            name: p.name,
            প্রাপ্য: p.balance,
          }))
        );
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleExportPDF = () => {
    console.log('Exporting to PDF...');
    // TODO: Implement PDF export using jsPDF
  };

  const handleExportExcel = () => {
    console.log('Exporting to Excel...');
    // TODO: Implement Excel export
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📊 বিস্তারিত রিপোর্ট</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
          >
            <FileText size={20} />
            PDF ডাউনলোড
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Download size={20} />
            Excel ডাউনলোড
          </button>
        </div>
      </div>

      {/* তারিখ নির্বাচন */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">শুরুর তারিখ</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">শেষ তারিখ</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {(['daily', 'monthly', 'party', 'product'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                reportType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {type === 'daily' && 'দৈনিক'}
              {type === 'monthly' && 'মাসিক'}
              {type === 'party' && 'পার্টি-ওয়াইজ'}
              {type === 'product' && 'পণ্য-ওয়াইজ'}
            </button>
          ))}
        </div>
      </div>

      {/* সামারি কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="মোট বিক্রয়"
          value={`৳${summary.totalSales.toLocaleString('bn-BD')}`}
          color="text-blue-600"
        />
        <SummaryCard
          title="মোট ক্রয়"
          value={`৳${summary.totalPurchases.toLocaleString('bn-BD')}`}
          color="text-orange-600"
        />
        <SummaryCard
          title="মোট খরচ"
          value={`৳${summary.totalExpenses.toLocaleString('bn-BD')}`}
          color="text-red-600"
        />
        <SummaryCard
          title="নেট লাভ"
          value={`৳${summary.netProfit.toLocaleString('bn-BD')}`}
          color="text-green-600"
        />
      </div>

      {/* চার্ট */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportType === 'daily' && (
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">দৈনিক বিক্রয় ট্রেন্ড</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="বিক্রয়" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">মাসিক বিক্রয়</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="বিক্রয়" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {reportType === 'party' && (
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">পার্টি-ওয়াইজ প্রাপ্য</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label dataKey="প্রাপ্য">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* শীর্ষ পার্টি */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">🏆 শীর্ষ ৫ পার্টি (প্রাপ্য অনুযায়ী)</h3>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">পার্টি</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">প্রাপ্য</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">লেনদেন সংখ্যা</th>
            </tr>
          </thead>
          <tbody>
            {summary.topParties.map((party, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">{index + 1}. {party.name}</td>
                <td className="px-6 py-4 font-bold text-orange-600">৳{party.balance.toLocaleString('bn-BD')}</td>
                <td className="px-6 py-4">{party.transactions} লেনদেন</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-gray-600 text-sm mb-2">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

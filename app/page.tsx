'use client'

import { useStore } from '@/lib/store'
import Link from 'next/link'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { parties, products, transactions } = useStore()

  // হিসাব নিকাশ
  const totalProducts = products.length
  const totalStockQty = products.reduce((sum, p) => sum + Number(p.stock || 0), 0)
  
  const totalParties = parties.length
  const totalDue = parties.reduce((sum, p) => sum + Number(p.due || 0), 0)

  const totalSales = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'বিক্রি')
      .reduce((sum, t) => sum + Number(t.paid || 0), 0)
  }, [transactions])

  const totalPurchase = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'ক্রয়')
      .reduce((sum, t) => sum + Number(t.paid || 0), 0)
  }, [transactions])

  const recentTransactions = transactions.slice(-5).reverse()

  return (
    <div className="space-y-6 pb-12">
      {/* ওয়েলকাম ব্যানার */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">🏬 Shahriar Enterprise</h1>
          <p className="text-emerald-100 text-sm mt-1">হোলসেল ও পাইকারি ব্যবসা পরিচালনার স্মার্ট ড্যাশবোর্ড</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/sales/new"
            className="px-4 py-2.5 bg-white text-emerald-800 font-bold rounded-xl shadow-md hover:bg-emerald-50 transition-all text-sm flex items-center gap-2"
          >
            <span>➕</span> নতুন বিক্রি / মেমো
          </Link>
          <Link
            href="/purchase/new"
            className="px-4 py-2.5 bg-emerald-900/60 border border-emerald-500/40 text-white font-bold rounded-xl shadow-md hover:bg-emerald-900 transition-all text-sm flex items-center gap-2 backdrop-blur-md"
          >
            <span>📦</span> নতুন ক্রয়
          </Link>
        </div>
      </div>

      {/* মূল মেট্রিক কার্ডসমূহ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* মোট বিক্রি */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            📈
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">মোট নগদ বিক্রি</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">৳ {totalSales.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* মোট বকেয়া */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
            📒
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">মোট কাস্টমার বকেয়া</p>
            <h3 className="text-lg font-bold text-red-600 mt-0.5">৳ {totalDue.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* মোট স্টক */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            📦
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">স্টকে মোট পণ্য</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">{totalStockQty} টি ({totalProducts} আইটেম)</h3>
          </div>
        </div>

        {/* মোট পার্টি */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
            👥
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">মোট কাস্টমার ও সাপ্লায়ার</p>
            <h3 className="text-lg font-bold text-gray-800 mt-0.5">{totalParties} জন</h3>
          </div>
        </div>
      </div>

      {/* কুইক নেভিগেশন ও শর্টকাট */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/products"
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-center group"
        >
          <span className="text-2xl block mb-1">🏷️</span>
          <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">পণ্য ক্যাটালগ</span>
        </Link>
        <Link
          href="/parties"
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-center group"
        >
          <span className="text-2xl block mb-1">👥</span>
          <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">পার্টি খাতা</span>
        </Link>
        <Link
          href="/sales"
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-center group"
        >
          <span className="text-2xl block mb-1">📜</span>
          <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">সকল মেমো</span>
        </Link>
        <Link
          href="/reports"
          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all text-center group"
        >
          <span className="text-2xl block mb-1">📊</span>
          <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">রিপোর্ট ও হিসাব</span>
        </Link>
      </div>

      {/* সাম্প্রতিক ট্রানজেকশন বা মেমো লিস্ট */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <span>⚡</span> সাম্প্রতিক লেনদেনসমূহ
          </h3>
          <Link href="/sales" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            সব দেখুন →
          </Link>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recentTransactions.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">কোনো সাম্প্রতিক লেনদেন পাওয়া যায়নি</p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    tx.type === 'বিক্রি' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {tx.type === 'বিক্রি' ? 'বি' : 'ক্র'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{tx.partyName || 'খুচরা কাস্টমার'}</p>
                    <p className="text-xs text-gray-500">{tx.note || tx.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">৳ {Number(tx.paid || 0).toLocaleString('en-IN')}</p>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    tx.type === 'বিক্রি' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {tx.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { transactions, parties } = useStore()
  
  const id = params?.id as string
  const [transaction, setTransaction] = useState<any>(null)

  useEffect(() => {
    if (id) {
      const found = transactions.find((t) => t.id === id)
      setTransaction(found)
    }
  }, [id, transactions])

  if (!transaction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-md text-center max-w-sm w-full space-y-4">
          <p className="text-red-500 font-semibold">ইনভয়েস বা মেমোটি পাওয়া যায়নি!</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            হোম পেজে ফিরে যান
          </button>
        </div>
      </div>
    )
  }

  const party = parties.find((p) => p.id === transaction.partyId)
  const totalAmount = transaction.items?.reduce((sum: number, item: any) => sum + item.price * item.qty, 0) || 0
  const paidAmount = Number(transaction.paid || 0)
  const dueAmount = Math.max(0, totalAmount - paidAmount)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-xl mx-auto bg-white min-h-screen sm:min-h-fit sm:my-6 sm:rounded-2xl sm:shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:border-none">
      {/* প্রিন্ট হবে না এমন অংশ */}
      <div className="bg-gray-100 p-4 flex justify-between items-center print:hidden">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-300 transition"
        >
          ← ড্যাশবোর্ড
        </button>
        <button
          onClick={handlePrint}
          className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <span>🖨️</span> প্রিন্ট / ডাউনলোড
        </button>
      </div>

      {/* মূল মেমো পেপার */}
      <div className="p-6 sm:p-8 space-y-6 text-gray-800">
        {/* দোকানের হেডার */}
        <div className="text-center border-b border-gray-200 pb-4 space-y-1">
          <h1 className="text-2xl font-black text-emerald-800 tracking-wide">🏬 Shahriar Enterprise</h1>
          <p className="text-xs text-gray-500">হোলসেল ও পাইকারি ব্যবসা ব্যবস্থাপনা</p>
          <p className="text-xs text-gray-400">মোবাইল: ০১৭xxxxxxxx</p>
        </div>

        {/* মেমো ইনফো */}
        <div className="flex justify-between items-start text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="space-y-1">
            <p><strong className="text-gray-600">কাস্টমার:</strong> {party?.name || transaction.partyName || 'খুচরা ক্রেতা'}</p>
            <p><strong className="text-gray-600">মোবাইল:</strong> {party?.phone || 'নেই'}</p>
            <p><strong className="text-gray-600">ঠিকানা:</strong> {party?.address || 'নেই'}</p>
          </div>
          <div className="text-right space-y-1">
            <p><strong className="text-gray-600">তারিখ:</strong> {new Date(transaction.date).toLocaleDateString('bn-BD')}</p>
            <p><strong className="text-gray-600">মেমো নং:</strong> {transaction.note?.split('|')[0] || '#MEMO'}</p>
          </div>
        </div>

        {/* প্রোডাক্ট টেবিল */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-600">
                <th className="py-2.5 font-bold">পণ্যের নাম</th>
                <th className="py-2.5 text-center font-bold">পরিমাণ</th>
                <th className="py-2.5 text-right font-bold">দর (৳)</th>
                <th className="py-2.5 text-right font-bold">মোট (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transaction.items?.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="py-2.5 font-medium text-gray-800">{item.name}</td>
                  <td className="py-2.5 text-center text-gray-600">{item.qty} {item.unit}</td>
                  <td className="py-2.5 text-right text-gray-600">{item.price}</td>
                  <td className="py-2.5 text-right font-semibold text-gray-800">{(item.price * item.qty).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* হিসাব-নিকাশ */}
        <div className="border-t border-gray-200 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>সর্বমোট বিল:</span>
            <span className="font-bold text-gray-800">৳ {totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>নগদ পরিশোধ:</span>
            <span className="font-bold text-emerald-700">৳ {paidAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-red-600 border-t border-gray-100 pt-2">
            <span>বকেয়া (Due):</span>
            <span>৳ {dueAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* ফুটার নোট */}
        <div className="text-center pt-8 border-t border-gray-100 text-[11px] text-gray-400 space-y-1">
          <p>পণ্য বিক্রির পর ফেরত নেওয়া হয় না। সাথে থাকার জন্য ধন্যবাদ।</p>
          <p className="font-semibold text-gray-500">Developed by Shahriar Enterprise System</p>
        </div>
      </div>
    </div>
  )
}
